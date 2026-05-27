"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useGetDependencySummaryQuery,
  useGetScanDetailQuery,
  useGetScanStatusQuery,
  useGetScanSummaryQuery,
  useListCurrentUserScansQuery,
  useListDependenciesQuery,
  useListHotspotsQuery,
  useListIssuesQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import { cn } from "@/lib/utils";
import type {
  QualityGateStatus,
} from "@/types/scanner";

import { CodeScanOverview } from "./code-scan-overview";
import { CodeScanIssues } from "./code-scan-issues";
import { CodeScanDependencies } from "./code-scan-dependencies";
import { CodeScanHotspots } from "./code-scan-hotspots";

const SEEN_PROJECTS_STORAGE_KEY = "code-scanning-seen-projects";

type ProjectView = "overview" | "issues" | "dependencies" | "hotspots";
type GradeTone = "green" | "lime" | "red" | "muted";

type NavItem = {
  id: ProjectView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const projectNavItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "issues", label: "Issues", icon: FileCode2 },
  { id: "dependencies", label: "Dependencies", icon: FolderGit2 },
  { id: "hotspots", label: "Security Hotspots", icon: ShieldAlert },
];

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

// ─── Play notification sound ──────────────────────────────────────────────────
function playScanCompleteSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    // Fallback: silent if AudioContext not available
  }
}

// ─── New Project Badge Component ────────────────────────────────────────────

function PreviousPageButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 sm:px-4 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      <ArrowLeft className="size-3.5 shrink-0 sm:size-4" />
      <span>Back to previous page</span>
    </button>
  );
}

// Utility Functions
function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readPayloadMessage(payload: unknown): string {
  if (payload == null || typeof payload !== "object") {
    return "";
  }

  const source = payload as {
    detail?: unknown;
    message?: unknown;
    error?: unknown;
  };
  const detail = asText(source.detail).trim();
  if (detail) {
    return detail;
  }

  const message = asText(source.message).trim();
  if (message) {
    return message;
  }

  return asText(source.error).trim();
}

function readErrorMessage(error: unknown, fallback: string): string {
  const queryError = error as
    | FetchBaseQueryError
    | { message?: string }
    | undefined;
  if (!queryError) {
    return fallback;
  }

  if ("status" in queryError) {
    const payloadMessage = readPayloadMessage(queryError.data);
    if (payloadMessage) {
      return payloadMessage;
    }
    if (typeof queryError.status === "number") {
      return `Request failed with status ${queryError.status}`;
    }
  }

  const message =
    "message" in queryError ? asText(queryError.message).trim() : "";
  return message || fallback;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string | null | undefined): string {
  if (!value) {
    return "Analysis time not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Analysis time not available";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) {
    return `Last analysis ${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Last analysis ${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Last analysis ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

/**
 * Check if a project is "newly created"
 * Consider a project new if created within the last 24 hours
 */
function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0.0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatCount(value: number | null | undefined): string {
  return new Intl.NumberFormat("en").format(value ?? 0);
}

function getRepoHost(repoUrl: string): "github" | "gitlab" | "other" {
  if (!repoUrl) return "other";
  try {
    const parsed = new URL(repoUrl);
    if (parsed.host.includes("github")) return "github";
    if (parsed.host.includes("gitlab")) return "gitlab";
  } catch {
    if (repoUrl.includes("github")) return "github";
    if (repoUrl.includes("gitlab")) return "gitlab";
  }
  return "other";
}

function getProjectInitial(projectKey: string): string {
  return projectKey.trim().charAt(0).toUpperCase() || "P";
}

function getRepoPath(repoUrl: string): string {
  if (!repoUrl) {
    return "Repository not provided";
  }

  try {
    const parsed = new URL(repoUrl);
    return `${parsed.host}${parsed.pathname.replace(/\.git$/i, "")}`;
  } catch {
    return repoUrl.replace(/^https?:\/\//i, "").replace(/\.git$/i, "");
  }
}

function getGrade(
  value: number,
  warningAt: number,
  dangerAt: number
): { label: string; tone: GradeTone } {
  if (value <= warningAt) {
    return { label: "A", tone: "green" };
  }
  if (value <= dangerAt) {
    return { label: "B", tone: "lime" };
  }
  return { label: "E", tone: "red" };
}

function getQualityGateLabel(
  status: QualityGateStatus | null | undefined
): string {
  if (!status) {
    return "Unavailable";
  }

  if (status === "OK") {
    return "Passed";
  }

  if (status === "WARN") {
    return "Warning";
  }

  return "Failed";
}

function formatStatusLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function markProjectAsSeen(projectKey: string): void {
  if (typeof window === "undefined" || !projectKey.trim()) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(SEEN_PROJECTS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const current = new Set(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [],
    );

    current.add(projectKey);
    window.localStorage.setItem(
      SEEN_PROJECTS_STORAGE_KEY,
      JSON.stringify(Array.from(current)),
    );
  } catch {
    // Ignore storage failures and keep navigation working.
  }
}

// GitHub SVG Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="GitHub"
    >
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// GitLab SVG Icon
function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="GitLab"
    >
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.452.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.924.924 0 0 0 .33-1.024" />
    </svg>
  );
}

// Repository Host Icon
function RepoHostIcon({
  repoUrl,
  className,
}: {
  repoUrl: string;
  className?: string;
}) {
  const host = getRepoHost(repoUrl);
  if (host === "github") {
    return <GitHubIcon className={className} />;
  }
  if (host === "gitlab") {
    return <GitLabIcon className={className} />;
  }
  return <FolderGit2 className={className} />;
}

// Project Avatar using repo host icon or letter fallback
function ProjectAvatar({
  projectKey,
  repoUrl,
}: {
  projectKey: string;
  repoUrl: string;
}) {
  const host = getRepoHost(repoUrl);

  if (host === "github") {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 sm:size-12 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <GitHubIcon className="size-5 sm:size-6" />
      </div>
    );
  }

  if (host === "gitlab") {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#fc6d26] sm:size-12 dark:border-slate-700 dark:bg-slate-900">
        <GitLabIcon className="size-5 sm:size-6" />
      </div>
    );
  }

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-teal-50 to-teal-100 text-sm font-bold text-teal-700 dark:from-teal-500/10 dark:to-teal-500/20 dark:text-teal-300">
      {getProjectInitial(projectKey)}
    </div>
  );
}

function StatusPill({ status }: { status: string | null | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
        status === "SUCCESS" &&
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
        status === "IN_PROGRESS" &&
          "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20",
        status === "PENDING" &&
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
        !status &&
          "bg-slate-100 text-slate-600 ring-1 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-gray-700",
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

function getQualityGateTone(
  status: QualityGateStatus | null | undefined
): string {
  switch (status) {
    case "OK":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
    case "WARN":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20";
    case "ERROR":
      return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-gray-700";
  }
}

// ─── Header Component ────────────────────────────────────────────────────────

function PageHeader({
  projectKey,
  repoPath,
  branch,
  relativeTime,
  status,
  qualityGate,
  repoUrl,
}: {
  projectKey: string;
  repoPath: string;
  branch: string;
  relativeTime: string;
  status: string | null | undefined;
  qualityGate: QualityGateStatus | null | undefined;
  repoUrl: string;
}) {
  return (
    <motion.section
      {...sectionMotion}
      className="relative rounded-lg border border-slate-200 bg-linear-to-br from-white via-white to-[#f8fafd] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <ProjectAvatar projectKey={projectKey} repoUrl={repoUrl} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 sm:text-xs dark:text-slate-400">
              <Link
                href="/userdashboard/code-scanning"
                className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                Code scanning
              </Link>
              <span>/</span>
              <span className="truncate">{projectKey}</span>
            </div>

            <h1 className="mt-1.5 truncate text-lg font-bold text-slate-900 sm:mt-2 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl dark:text-white">
              {projectKey}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px] text-slate-500 sm:mt-3 sm:gap-x-3 sm:gap-y-2 sm:text-xs md:text-sm dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <RepoHostIcon repoUrl={repoUrl} className="size-3 sm:size-3.5" />
                {repoPath}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitBranch className="size-3 sm:size-3.5" />
                {branch || "main"}
              </span>
              <span>{relativeTime}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={status} />
          {qualityGate ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
                getQualityGateTone(qualityGate)
              )}
            >
              Quality gate {getQualityGateLabel(qualityGate)}
            </span>
          ) : null}
          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <ExternalLink className="size-3.5 sm:size-4" />
              Repository
            </a>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

// Alert Component
function AlertSection({
  warningMessage,
  qualityGateMessage,
}: {
  warningMessage: string | null;
  qualityGateMessage: string | null;
}) {
  if (warningMessage) {
    return (
      <motion.section
        {...sectionMotion}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
          <span>{warningMessage}</span>
        </div>
      </motion.section>
    );
  }

  if (!warningMessage && qualityGateMessage) {
    return (
      <motion.section
        {...sectionMotion}
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
          <span>{qualityGateMessage}</span>
        </div>
      </motion.section>
    );
  }

  return null;
}

// Navigation Tabs
function ProjectNav({
  activeView,
  onViewChange,
}: {
  activeView: ProjectView;
  onViewChange: (view: ProjectView) => void;
}) {
  return (
    <motion.section
      {...sectionMotion}
      className="flex gap-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-linear-to-br from-white via-white to-[#f8fafd] p-1.5 sm:gap-2 sm:rounded-xl sm:p-2 dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      {projectNavItems.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-sm",
              active
                ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            )}
          >
            <Icon className="size-3.5 sm:size-4" />
            {item.label}
          </button>
        );
      })}
    </motion.section>
  );
}

// Main Component
export default function CodeScanningDetailPageClient({
  scanId: routeIdentifier,
}: {
  scanId: string;
}) {
  const router = useRouter();
  const hasTriggeredCompletionRefresh = useRef(false);
  const [activeView, setActiveView] = useState<ProjectView>("overview");
  const [typeFilter, setTypeFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [issuesPage, setIssuesPage] = useState(1);
  const [dependencyToolFilter, setDependencyToolFilter] = useState("");
  const [dependencySeverityFilter, setDependencySeverityFilter] = useState("");
  const [dependencyVulnerableOnly, setDependencyVulnerableOnly] =
    useState(false);
  const [dependencyOutdatedOnly, setDependencyOutdatedOnly] = useState(false);
  const [hotspotStatusFilter, setHotspotStatusFilter] = useState("");
  const [hotspotsPage, setHotspotsPage] = useState(1);

  function handleGoBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/userdashboard/code-scanning");
  }

  async function handleRefreshPage() {
    await Promise.allSettled([
      refetchScanDetail(),
      refetchScanStatus(),
      refetchScanSummary(),
      refetchDependencySummary(),
      refetchDependencies(),
      refetchIssues(),
      refetchHotspots(),
      routeProjectScansQuery.refetch(),
    ]);
    router.refresh();
  }

  // Check if route identifier is a scan ID
  const routeUsesScanId = /^[a-f0-9-]+$/i.test(routeIdentifier);

  const routeProjectScansQuery = useListCurrentUserScansQuery(
    routeUsesScanId
      ? skipToken
      : {
          project_key: routeIdentifier,
          page: 1,
          page_size: 25,
        },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const resolvedScanId = routeUsesScanId
    ? routeIdentifier
    : routeProjectScansQuery.data?.scans[0]?.scan_id;

  const {
    data: scanDetail,
    isLoading,
    isError,
    error,
    refetch: refetchScanDetail,
  } = useGetScanDetailQuery(resolvedScanId ?? skipToken, {
    refetchOnMountOrArgChange: true,
  });

  const { data: liveStatus, refetch: refetchScanStatus } = useGetScanStatusQuery(
    resolvedScanId ?? skipToken,
    {
      pollingInterval: 5000,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: scanSummary, refetch: refetchScanSummary } = useGetScanSummaryQuery(
    resolvedScanId ?? skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: dependencySummaryResponse, refetch: refetchDependencySummary } = useGetDependencySummaryQuery(
    resolvedScanId ?? skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: dependencyListResponse, isFetching: isDependenciesFetching, refetch: refetchDependencies } =
    useListDependenciesQuery(
      {
        scan_id: resolvedScanId ?? "",
        page: 1,
        page_size: 50,
        tool: dependencyToolFilter || undefined,
        severity: dependencySeverityFilter || undefined,
        vulnerable_only: dependencyVulnerableOnly || undefined,
        outdated_only: dependencyOutdatedOnly || undefined,
      },
      {
        skip: !resolvedScanId,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: allDependenciesResponse } = useListDependenciesQuery(
    {
      scan_id: resolvedScanId ?? "",
      page: 1,
      page_size: 100,
    },
    {
      skip: !resolvedScanId,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: issueResponse, isFetching: isIssuesFetching, refetch: refetchIssues } =
    useListIssuesQuery(
      {
        scan_id: resolvedScanId ?? "",
        page: issuesPage,
        page_size: 25,
        type_filter: typeFilter || undefined,
        severity_filter: severityFilter || undefined,
      },
      {
        skip: !resolvedScanId,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: allIssuesResponse } = useListIssuesQuery(
    {
      scan_id: resolvedScanId ?? "",
      page: 1,
      page_size: 100,
    },
    {
      skip: !resolvedScanId,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: hotspotsResponse, isFetching: isHotspotsFetching, refetch: refetchHotspots } =
    useListHotspotsQuery(
      {
        scan_id: resolvedScanId ?? "",
        page: hotspotsPage,
        page_size: 25,
        status_filter: hotspotStatusFilter || undefined,
      },
      {
        skip: !resolvedScanId,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: projectHistory } = useListCurrentUserScansQuery(
    scanDetail?.project_key
      ? {
          project_key: scanDetail.project_key,
          page: 1,
          page_size: 12,
        }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Memoized data
  const issues = useMemo(
    () => issueResponse?.issues ?? [],
    [issueResponse?.issues]
  );
  const allIssues = useMemo(
    () => allIssuesResponse?.issues ?? [],
    [allIssuesResponse?.issues]
  );
  const dependencies = useMemo(
    () => dependencyListResponse?.dependencies ?? [],
    [dependencyListResponse?.dependencies]
  );
  const allDependencies = useMemo(
    () => allDependenciesResponse?.dependencies ?? [],
    [allDependenciesResponse?.dependencies]
  );

  const hotspots = useMemo(
    () => hotspotsResponse?.hotspots ?? [],
    [hotspotsResponse?.hotspots]
  );
  const totalHotspots = hotspotsResponse?.total ?? 0;

  const totalIssues = issueResponse?.total ?? 0;
  const totalDependencies = dependencyListResponse?.total ?? 0;
  const dependencySummary =
    dependencySummaryResponse ?? scanSummary?.dependency_summary ?? null;
  const status = liveStatus?.status ?? scanDetail?.status;
  const progress = liveStatus?.progress ?? scanDetail?.progress ?? 0;
  const qualityGate = scanSummary?.quality_gate;
  const projectKey =
    scanDetail?.project_key || scanDetail?.sonar_project_key || "Project";
  const repoPath = getRepoPath(scanDetail?.repo_url ?? "");
  const scanCount = projectHistory?.total ?? 0;
  const isRunning = status === "PENDING" || status === "IN_PROGRESS";
  const warningMessage = scanDetail?.error_message?.trim() || null;
  const openIssues = allIssues.filter((issue) =>
    ["OPEN", "TO_REVIEW"].includes(issue.status.toUpperCase())
  ).length;
  const acceptedIssues = Math.max(allIssues.length - openIssues, 0);
  const qualityGateMessage =
    qualityGate === "WARN"
      ? "The latest analysis passed with warnings."
      : qualityGate === "ERROR"
        ? "The latest analysis failed the quality gate."
        : null;

  useEffect(() => {
    if (scanDetail?.project_key) {
      markProjectAsSeen(scanDetail.project_key);
    }
  }, [scanDetail?.project_key]);

  useEffect(() => {
    const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const isComplete =
      normalizedProgress >= 100 || status === "SUCCESS";

    if (isRunning) {
      hasTriggeredCompletionRefresh.current = false;
      return;
    }

    if (isComplete && !hasTriggeredCompletionRefresh.current) {
      hasTriggeredCompletionRefresh.current = true;
      playScanCompleteSound();
      // Fast refetch all data when scan completes
      Promise.all([
        refetchScanStatus(),
        refetchScanDetail(),
        refetchScanSummary(),
        refetchDependencySummary(),
      ]).finally(() => {
        router.refresh();
      });
    }
  }, [isRunning, progress, router, status, refetchScanStatus, refetchScanDetail, refetchScanSummary, refetchDependencySummary]);

  const isResolvingRoute = !routeUsesScanId && routeProjectScansQuery.isLoading;
  const routeResolutionFailed =
    !routeUsesScanId && !routeProjectScansQuery.isLoading && !resolvedScanId;

  // Loading state
  if (isResolvingRoute || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-lg border border-slate-200 bg-linear-to-br from-white via-white to-[#f8fafd] sm:rounded-xl dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="flex items-center gap-2 text-xs text-slate-500 sm:gap-3 sm:text-sm dark:text-slate-400">
          <LoaderCircle className="size-4 animate-spin text-teal-500 sm:size-5" />
          Loading project overview...
        </div>
      </div>
    );
  }

  // Error state
  if (routeResolutionFailed || isError || !scanDetail) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-linear-to-br from-white via-white to-[#f8fafd] p-6 text-center sm:gap-4 sm:rounded-xl sm:p-8 dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <AlertTriangle className="size-8 text-red-500 sm:size-10" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
            Unable to load project overview
          </h1>
          <p className="mt-1.5 max-w-xl text-xs text-slate-500 sm:mt-2 sm:text-sm dark:text-slate-400">
            {routeResolutionFailed
              ? "No scan history was found for this project key."
              : readErrorMessage(
                  error,
                  "The scanner detail endpoint did not return a usable payload."
                )}
          </p>
        </div>
        <Link
          href="/userdashboard/code-scanning"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 sm:px-5 sm:py-2.5 sm:text-sm dark:bg-teal-500 dark:hover:bg-teal-600"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to code scanning
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1920px] space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6 xl:px-10 xl:py-8">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <PreviousPageButton onClick={handleGoBack} />
        <button
          type="button"
          onClick={handleRefreshPage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className="size-3.5 shrink-0 sm:size-4" />
          <span>Refresh</span>
        </button>
      </div>

      <PageHeader
        projectKey={projectKey}
        repoPath={repoPath}
        branch={scanDetail.branch || "main"}
        relativeTime={formatRelativeTime(
          scanDetail.finished_at ||
            scanDetail.started_at ||
            scanDetail.created_at
        )}
        status={status}
        qualityGate={qualityGate}
        repoUrl={scanDetail.repo_url}
      />

      <AlertSection
        warningMessage={warningMessage}
        qualityGateMessage={qualityGateMessage}
      />

      <ProjectNav activeView={activeView} onViewChange={setActiveView} />

      {activeView === "overview" && (
        <CodeScanOverview
          initialScanId={resolvedScanId ?? scanDetail.scan_id ?? ""}
          scanSummary={scanSummary}
          dependencySummary={dependencySummary}
          qualityGate={qualityGate}
          acceptedIssues={acceptedIssues}
          scanCount={scanCount}
          scanStatusLabel={formatStatusLabel(status)}
          scanProgress={progress}
          isScanRunning={isRunning}
          formatCount={formatCount}
          formatPercent={formatPercent}
          getGrade={getGrade}
          getQualityGateLabel={getQualityGateLabel}
        />
      )}

      {activeView === "issues" && (
        <CodeScanIssues
          projectKey={scanDetail.project_key || routeIdentifier}
          issues={issues}
          allIssues={allIssues}
          total={totalIssues}
          isLoading={isIssuesFetching}
          typeFilter={typeFilter}
          severityFilter={severityFilter}
          onTypeFilterChange={(v) => { setTypeFilter(v); setIssuesPage(1); }}
          onSeverityFilterChange={(v) => { setSeverityFilter(v); setIssuesPage(1); }}
          page={issuesPage}
          pageSize={25}
          onPageChange={setIssuesPage}
        />
      )}

      {activeView === "dependencies" && (
        <CodeScanDependencies
          dependencies={dependencies}
          allDependencies={allDependencies}
          total={totalDependencies}
          isLoading={isDependenciesFetching}
          toolFilter={dependencyToolFilter}
          severityFilter={dependencySeverityFilter}
          vulnerableOnly={dependencyVulnerableOnly}
          outdatedOnly={dependencyOutdatedOnly}
          onToolFilterChange={setDependencyToolFilter}
          onSeverityFilterChange={setDependencySeverityFilter}
          onVulnerableOnlyChange={() =>
            setDependencyVulnerableOnly((prev) => !prev)
          }
          onOutdatedOnlyChange={() =>
            setDependencyOutdatedOnly((prev) => !prev)
          }
          formatCount={formatCount}
        />
      )}

      {activeView === "hotspots" && (
        <CodeScanHotspots
          hotspots={hotspots}
          total={totalHotspots}
          isLoading={isHotspotsFetching}
          statusFilter={hotspotStatusFilter}
          onStatusFilterChange={(v) => { setHotspotStatusFilter(v); setHotspotsPage(1); }}
          page={hotspotsPage}
          pageSize={25}
          onPageChange={setHotspotsPage}
          onHotspotClick={(hotspotKey) => {
            router.push(`/userdashboard/code-scanning/${encodeURIComponent(resolvedScanId ?? routeIdentifier)}/hotspots/${encodeURIComponent(hotspotKey)}`);
          }}
        />
      )}

      </div>
    </div>
  );
}
