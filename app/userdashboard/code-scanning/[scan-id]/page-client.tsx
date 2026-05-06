"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType } from "react";

import {
  useGetDependencySummaryQuery,
  useGetScanDetailQuery,
  useGetScanStatusQuery,
  useGetScanSummaryQuery,
  useListCurrentUserScansQuery,
  useListDependenciesQuery,
  useListIssuesQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import {
  buildCodeScanningIssueHref,
  buildCodeScanningProjectHref,
  isLikelyScanId,
} from "@/lib/scanner-route";
import { cn } from "@/lib/utils";
import type {
  DependencyResponse,
  DependencySummaryResponse,
  IssueResponse,
  ProjectScanResponse,
  QualityGateStatus,
  ScanPhaseResponse,
  ScanStatus,
} from "@/types/scanner";

type ProjectView = "overview" | "issues" | "dependencies" | "activity" | "info";
type GradeTone = "green" | "lime" | "red" | "muted";

type NavItem = {
  id: ProjectView;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type FilterOption = {
  label: string;
  value: string;
};

const projectNavItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "issues", label: "Issues", icon: FileCode2 },
  { id: "dependencies", label: "Dependencies", icon: FolderGit2 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "info", label: "Project information", icon: Info },
];

const issueTypeOptions: FilterOption[] = [
  { label: "All", value: "" },
  { label: "Bugs", value: "BUG" },
  { label: "Vulnerabilities", value: "VULNERABILITY" },
  { label: "Code smells", value: "CODE_SMELL" },
];

const severityOptions: FilterOption[] = [
  { label: "All severities", value: "" },
  { label: "Blocker", value: "BLOCKER" },
  { label: "Critical", value: "CRITICAL" },
  { label: "Major", value: "MAJOR" },
  { label: "Minor", value: "MINOR" },
  { label: "Info", value: "INFO" },
];

const dependencySeverityOptions: FilterOption[] = [
  { label: "All severities", value: "" },
  { label: "Critical", value: "CRITICAL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

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

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0.0%";
  }
  return `${value.toFixed(1)}%`;
}

function formatCount(value: number | null | undefined): string {
  return new Intl.NumberFormat("en").format(value ?? 0);
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

function formatLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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
  dangerAt: number,
): { label: string; tone: GradeTone } {
  if (value <= warningAt) {
    return { label: "A", tone: "green" };
  }
  if (value <= dangerAt) {
    return { label: "B", tone: "lime" };
  }
  return { label: "E", tone: "red" };
}

function getIssueSeverityTone(severity: string): string {
  switch (severity.toUpperCase()) {
    case "BLOCKER":
      return "bg-red-600 text-white";
    case "CRITICAL":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "MAJOR":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "MINOR":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getDependencySeverityTone(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-600 text-white";
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "LOW":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getStatusTone(status: string | null | undefined): string {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
    case "IN_PROGRESS":
      return "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20";
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20";
    case "PARTIAL":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20";
    case "FAILED":
      return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20";
    default:
      return "bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
  }
}

function getQualityGateTone(
  status: QualityGateStatus | null | undefined,
): string {
  switch (status) {
    case "OK":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
    case "WARN":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20";
    case "ERROR":
      return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20";
    default:
      return "bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700";
  }
}

function getQualityGateLabel(
  status: QualityGateStatus | null | undefined,
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

function getCweTag(issue: IssueResponse): string {
  const matchedTag = issue.tags.find((tag) => /^cwe[-_:]?\d+$/i.test(tag));
  if (matchedTag) {
    return matchedTag.toUpperCase().replace(/[_:]/g, "-");
  }

  const matchedRule = issue.rule_key.match(/cwe[-_:]?(\d+)/i);
  if (matchedRule) {
    return `CWE-${matchedRule[1]}`;
  }

  return issue.tags[0]?.toUpperCase() || issue.rule_key.toUpperCase();
}

function GradeBadge({ grade }: { grade: { label: string; tone: GradeTone } }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-sm font-bold",
        grade.tone === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        grade.tone === "lime" &&
          "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
        grade.tone === "red" &&
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        grade.tone === "muted" &&
          "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {grade.label}
    </span>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d7e0ef] bg-white p-8 text-center text-sm text-[#52648f] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      {message}
    </div>
  );
}

function StatusPill({ status }: { status: string | null | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        getStatusTone(status),
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

function TopStatCard({
  label,
  value,
  helper,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  accent: "teal" | "emerald" | "amber" | "slate";
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7da4] dark:text-gray-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold text-[#071120] dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-sm text-[#52648f] dark:text-gray-400">
            {helper}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            accent === "teal" &&
              "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
            accent === "emerald" &&
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
            accent === "amber" &&
              "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
            accent === "slate" &&
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function RingIndicator({ tone }: { tone: "ok" | "bad" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border-4",
        tone === "ok" && "border-emerald-100 dark:border-emerald-500/20",
        tone === "bad" && "border-red-700 dark:border-red-500",
        tone === "neutral" && "border-gray-200 dark:border-gray-700",
      )}
    >
      {tone === "ok" ? (
        <span className="size-2.5 rounded-full bg-emerald-500" />
      ) : null}
      {tone === "neutral" ? (
        <TimerReset className="size-4 text-gray-500 dark:text-gray-400" />
      ) : null}
    </span>
  );
}

function OverviewMetricCell({
  title,
  value,
  primaryDetail,
  secondaryDetail,
  grade,
  ring,
  className,
}: {
  title: string;
  value: string;
  primaryDetail?: string;
  secondaryDetail?: string;
  grade?: { label: string; tone: GradeTone };
  ring?: "ok" | "bad" | "neutral";
  className?: string;
}) {
  return (
    <div className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#17233f] dark:text-gray-100">
            {title}
          </h3>
          <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
            <span className="text-2xl font-bold leading-none text-[#21314f] dark:text-white">
              {value}
            </span>
            {primaryDetail ? (
              <span className="text-sm text-[#4f6290] dark:text-gray-400">
                {primaryDetail}
              </span>
            ) : null}
          </div>
          {secondaryDetail ? (
            <p className="mt-4 text-sm text-[#4f6290] dark:text-gray-400">
              {secondaryDetail}
            </p>
          ) : null}
        </div>
        {grade ? <GradeBadge grade={grade} /> : null}
        {ring ? <RingIndicator tone={ring} /> : null}
      </div>
    </div>
  );
}

function PhaseList({ phases }: { phases: ScanPhaseResponse[] }) {
  if (phases.length === 0) {
    return (
      <EmptyPanel message="No scan phases were returned for this analysis." />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {phases.map((phase) => (
        <div
          key={phase.key}
          className="rounded-2xl border border-[#d7e0ef] bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#17233f] dark:text-gray-100">
                {formatStatusLabel(phase.key)}
              </p>
              <p className="mt-1 text-xs text-[#6b7da4] dark:text-gray-500">
                Scanner phase
              </p>
            </div>
            <StatusPill status={phase.status} />
          </div>
          {phase.error_message ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {phase.error_message}
            </p>
          ) : (
            <p className="mt-3 text-sm text-[#52648f] dark:text-gray-400">
              No error reported for this phase.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function DependencyLanguageList({
  dependencySummary,
}: {
  dependencySummary: DependencySummaryResponse | null;
}) {
  if (!dependencySummary?.by_language?.length) {
    return (
      <EmptyPanel message="Dependency language breakdown is not available for this analysis." />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
      {dependencySummary.by_language.map((row) => (
        <div
          key={row.language}
          className="grid gap-3 border-b border-[#e4eaf4] px-4 py-4 text-sm last:border-b-0 dark:border-gray-800 md:grid-cols-[minmax(0,1fr)_120px_120px_120px_120px]"
        >
          <span className="font-semibold text-[#17233f] dark:text-gray-100">
            {row.language}
          </span>
          <span className="text-[#52648f] dark:text-gray-400">
            {formatCount(row.total_dependencies)} total
          </span>
          <span className="text-[#52648f] dark:text-gray-400">
            {formatCount(row.vulnerable_dependencies)} vulnerable
          </span>
          <span className="text-[#52648f] dark:text-gray-400">
            {formatCount(row.outdated_dependencies)} outdated
          </span>
          <span className="text-[#52648f] dark:text-gray-400">
            {formatCount(row.license_issues)} license issues
          </span>
        </div>
      ))}
    </div>
  );
}

function FilterChips({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value || option.label}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                  : "bg-white text-[#52648f] ring-1 ring-[#d7e0ef] hover:bg-[#f4f8fd] dark:bg-gray-950 dark:text-gray-400 dark:ring-gray-800 dark:hover:bg-gray-900",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IssueList({
  projectKey,
  issues,
  total,
  isLoading,
}: {
  projectKey: string;
  issues: IssueResponse[];
  total: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-[#52648f] dark:text-gray-400">
          <LoaderCircle className="size-4 animate-spin text-teal-500" />
          Loading issues...
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return <EmptyPanel message="No issues matched the current filters." />;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#52648f] dark:text-gray-400">
        Showing {issues.length} of {total} issue{total === 1 ? "" : "s"} from
        the scanner API.
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <motion.div
            key={issue.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-2xl border border-[#d7e0ef] bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      getIssueSeverityTone(issue.severity),
                    )}
                  >
                    {issue.severity}
                  </span>
                  <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#44608c] dark:bg-gray-800 dark:text-gray-300">
                    {formatStatusLabel(issue.type)}
                  </span>
                  <StatusPill status={issue.status} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#071120] dark:text-white">
                    {issue.message}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-[#52648f] dark:text-gray-400">
                    {issue.file_path}
                    {issue.line > 0 ? `:${issue.line}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#52648f] dark:text-gray-400">
                  <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 dark:bg-gray-900">
                    {issue.rule_key}
                  </span>
                  <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 dark:bg-gray-900">
                    {getCweTag(issue)}
                  </span>
                  {issue.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#f3f6fb] px-2.5 py-1 dark:bg-gray-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-start">
                <Link
                  href={buildCodeScanningIssueHref(projectKey, issue.key)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d7e0ef] px-3 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  View detail
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DependencyFlag({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
          : "bg-white text-[#52648f] ring-1 ring-[#d7e0ef] hover:bg-[#f4f8fd] dark:bg-gray-950 dark:text-gray-400 dark:ring-gray-800 dark:hover:bg-gray-900",
      )}
    >
      {label}
    </button>
  );
}

function collectDependencyToolOptions(
  items: DependencyResponse[],
): FilterOption[] {
  const tools = Array.from(
    new Set(items.map((item) => item.tool).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  return [
    { label: "All checkers", value: "" },
    ...tools.map((tool) => ({ label: formatLabel(tool), value: tool })),
  ];
}

function DependencyList({
  dependencies,
  total,
  isLoading,
}: {
  dependencies: DependencyResponse[];
  total: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-[#52648f] dark:text-gray-400">
          <LoaderCircle className="size-4 animate-spin text-teal-500" />
          Loading dependencies...
        </div>
      </div>
    );
  }

  if (dependencies.length === 0) {
    return (
      <EmptyPanel message="No dependencies matched the current checker filters." />
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#52648f] dark:text-gray-400">
        Showing {dependencies.length} of {total} dependenc
        {total === 1 ? "y" : "ies"} from dependency checkers.
      </div>

      <div className="space-y-3">
        {dependencies.map((dependency) => (
          <motion.div
            key={`${dependency.package_name}-${dependency.installed_version}-${dependency.cve_id}-${dependency.tool}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-2xl border border-[#d7e0ef] bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      getDependencySeverityTone(dependency.severity),
                    )}
                  >
                    {dependency.severity || "UNKNOWN"}
                  </span>
                  <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#44608c] dark:bg-gray-800 dark:text-gray-300">
                    {formatLabel(dependency.tool)}
                  </span>
                  <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-xs text-[#52648f] dark:bg-gray-900 dark:text-gray-400">
                    {formatLabel(dependency.language)}
                  </span>
                  {dependency.is_vulnerable ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      Vulnerable
                    </span>
                  ) : null}
                  {dependency.is_outdated ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      Outdated
                    </span>
                  ) : null}
                  {dependency.has_license_issue ? (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                      License issue
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#071120] dark:text-white">
                    {dependency.package_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#52648f] dark:text-gray-400">
                    <span>
                      Installed: {dependency.installed_version || "Unknown"}
                    </span>
                    <span>
                      Latest: {dependency.latest_version || "Unknown"}
                    </span>
                    {dependency.fixed_version ? (
                      <span>Fixed: {dependency.fixed_version}</span>
                    ) : null}
                    {dependency.license ? (
                      <span>License: {dependency.license}</span>
                    ) : null}
                    {dependency.ecosystem ? (
                      <span>Ecosystem: {dependency.ecosystem}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#52648f] dark:text-gray-400">
                  {dependency.cve_id ? (
                    <span className="rounded-full bg-[#f3f6fb] px-2.5 py-1 font-medium dark:bg-gray-900">
                      {dependency.cve_id}
                    </span>
                  ) : null}
                </div>

                {dependency.description ? (
                  <p className="text-sm leading-6 text-[#4f6290] dark:text-gray-400">
                    {dependency.description}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HistoryList({ scans }: { scans: ProjectScanResponse[] }) {
  if (scans.length === 0) {
    return (
      <EmptyPanel message="No previous analyses were returned for this project." />
    );
  }

  return (
    <div className="space-y-3">
      {scans.map((scan) => (
        <div
          key={scan.scan_id}
          className="rounded-2xl border border-[#d7e0ef] bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={scan.status} />
                <span className="inline-flex items-center gap-1 text-sm text-[#52648f] dark:text-gray-400">
                  <GitBranch className="size-3.5" />
                  {scan.branch || "main"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#52648f] dark:text-gray-400">
                <span>
                  Started: {formatDate(scan.started_at || scan.created_at)}
                </span>
                <span>Finished: {formatDate(scan.finished_at)}</span>
                <span>
                  Progress:{" "}
                  {Math.max(0, Math.min(100, Math.round(scan.progress ?? 0)))}%
                </span>
              </div>
            </div>

            <Link
              href={buildCodeScanningProjectHref(scan.project_key)}
              className="inline-flex items-center justify-center rounded-xl border border-[#d7e0ef] px-3 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              View analysis
            </Link>
          </div>

          {scan.error_message ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {scan.error_message}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function InfoGrid({
  projectKey,
  sonarProjectKey,
  repoUrl,
  branch,
  status,
  createdAt,
  startedAt,
  finishedAt,
}: {
  projectKey: string;
  sonarProjectKey: string;
  repoUrl: string;
  branch: string;
  status: ScanStatus | string;
  createdAt: string | null | undefined;
  startedAt: string | null | undefined;
  finishedAt: string | null | undefined;
}) {
  const items = [
    { label: "Project key", value: projectKey || "Unavailable" },
    { label: "Sonar project key", value: sonarProjectKey || "Unavailable" },
    { label: "Repository", value: repoUrl || "Unavailable" },
    { label: "Branch", value: branch || "main" },
    { label: "Status", value: formatStatusLabel(status) },
    { label: "Created at", value: formatDate(createdAt) },
    { label: "Started at", value: formatDate(startedAt) },
    { label: "Finished at", value: formatDate(finishedAt) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-[#d7e0ef] bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">
            {item.label}
          </p>
          <p className="mt-2 break-all text-sm font-medium text-[#17233f] dark:text-gray-100">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CodeScanningDetailPageClient({
  scanId: routeIdentifier,
}: {
  scanId: string;
}) {
  const [activeView, setActiveView] = useState<ProjectView>("overview");
  const [typeFilter, setTypeFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [dependencyToolFilter, setDependencyToolFilter] = useState("");
  const [dependencySeverityFilter, setDependencySeverityFilter] = useState("");
  const [dependencyVulnerableOnly, setDependencyVulnerableOnly] =
    useState(false);
  const [dependencyOutdatedOnly, setDependencyOutdatedOnly] = useState(false);
  const routeUsesScanId = isLikelyScanId(routeIdentifier);

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
    },
  );
  const resolvedScanId = routeUsesScanId
    ? routeIdentifier
    : routeProjectScansQuery.data?.scans[0]?.scan_id;

  const {
    data: scanDetail,
    isLoading,
    isError,
    error,
  } = useGetScanDetailQuery(resolvedScanId ?? skipToken, {
    refetchOnMountOrArgChange: true,
  });
  const { data: liveStatus, isFetching: isStatusFetching } =
    useGetScanStatusQuery(resolvedScanId ?? skipToken, {
      pollingInterval: 5000,
      refetchOnMountOrArgChange: true,
    });
  const { data: scanSummary } = useGetScanSummaryQuery(
    resolvedScanId ?? skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: dependencySummaryResponse } = useGetDependencySummaryQuery(
    resolvedScanId ?? skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: dependencyListResponse, isFetching: isDependenciesFetching } =
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
      },
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
    },
  );
  const { data: issueResponse, isFetching: isIssuesFetching } =
    useListIssuesQuery(
      {
        scan_id: resolvedScanId ?? "",
        page: 1,
        page_size: 25,
        type_filter: typeFilter || undefined,
        severity_filter: severityFilter || undefined,
      },
      {
        skip: !resolvedScanId,
        refetchOnMountOrArgChange: true,
      },
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
    },
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
    },
  );

  const issues = useMemo(
    () => issueResponse?.issues ?? [],
    [issueResponse?.issues],
  );
  const allIssues = useMemo(
    () => allIssuesResponse?.issues ?? [],
    [allIssuesResponse?.issues],
  );
  const dependencies = useMemo(
    () => dependencyListResponse?.dependencies ?? [],
    [dependencyListResponse?.dependencies],
  );
  const allDependencies = useMemo(
    () => allDependenciesResponse?.dependencies ?? [],
    [allDependenciesResponse?.dependencies],
  );
  const totalIssues = issueResponse?.total ?? 0;
  const totalDependencies = dependencyListResponse?.total ?? 0;
  const dependencySummary =
    dependencySummaryResponse ?? scanSummary?.dependency_summary ?? null;
  const status = liveStatus?.status ?? scanDetail?.status;
  const progress = liveStatus?.progress ?? scanDetail?.progress ?? 0;
  const phases = liveStatus?.phases?.length
    ? liveStatus.phases
    : (scanDetail?.phases ?? []);
  const qualityGate = scanSummary?.quality_gate;
  const projectKey =
    scanDetail?.project_key || scanDetail?.sonar_project_key || "Project";
  const repoPath = getRepoPath(scanDetail?.repo_url ?? "");
  const scanCount = projectHistory?.total ?? 0;
  const isRunning = status === "PENDING" || status === "IN_PROGRESS";
  const warningMessage = scanDetail?.error_message?.trim() || null;
  const openIssues = allIssues.filter((issue) =>
    ["OPEN", "TO_REVIEW"].includes(issue.status.toUpperCase()),
  ).length;
  const acceptedIssues = Math.max(allIssues.length - openIssues, 0);
  const dependencyToolOptions = useMemo(
    () => collectDependencyToolOptions(allDependencies),
    [allDependencies],
  );
  const qualityGateMessage =
    qualityGate === "WARN"
      ? "The latest analysis passed with warnings."
      : qualityGate === "ERROR"
        ? "The latest analysis failed the quality gate."
        : null;
  const isResolvingRoute = !routeUsesScanId && routeProjectScansQuery.isLoading;
  const routeResolutionFailed =
    !routeUsesScanId && !routeProjectScansQuery.isLoading && !resolvedScanId;

  if (isResolvingRoute || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-[#52648f] dark:text-gray-400">
          <LoaderCircle className="size-5 animate-spin text-teal-500" />
          Loading project overview...
        </div>
      </div>
    );
  }

  if (routeResolutionFailed || isError || !scanDetail) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[#d7e0ef] bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <AlertTriangle className="size-10 text-red-500" />
        <div>
          <h1 className="text-xl font-bold text-[#17233f] dark:text-white">
            Unable to load project overview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#52648f] dark:text-gray-400">
            {routeResolutionFailed
              ? "No scan history was found for this project key."
              : readErrorMessage(
                  error,
                  "The scanner detail endpoint did not return a usable payload.",
                )}
          </p>
        </div>
        <Link
          href="/userdashboard/code-scanning"
          className="rounded-xl border border-[#b9c6df] px-4 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          Back to code scanning
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[#17233f] dark:text-gray-100">
      <motion.section
        {...sectionMotion}
        className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              {getProjectInitial(projectKey)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#52648f] dark:text-gray-400">
                <Link
                  href="/userdashboard/code-scanning"
                  className="font-semibold text-teal-600 hover:underline dark:text-teal-300"
                >
                  Code scanning
                </Link>
                <span>/</span>
                <span className="truncate">{projectKey}</span>
              </div>

              <h1 className="mt-2 truncate text-2xl font-bold text-[#071120] dark:text-white">
                {projectKey}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#52648f] dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <FolderGit2 className="size-3.5" />
                  {repoPath}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitBranch className="size-3.5" />
                  {scanDetail.branch || "main"}
                </span>
                <span>
                  {formatRelativeTime(
                    scanDetail.finished_at ||
                      scanDetail.started_at ||
                      scanDetail.created_at,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={status} />
            {scanSummary ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  getQualityGateTone(qualityGate),
                )}
              >
                Quality gate {getQualityGateLabel(qualityGate)}
              </span>
            ) : null}
            {scanDetail.repo_url ? (
              <a
                href={scanDetail.repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#b9c6df] bg-white px-3 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <ExternalLink className="size-4" />
                Repository
              </a>
            ) : null}
          </div>
        </div>
      </motion.section>

      {warningMessage ? (
        <motion.section
          {...sectionMotion}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{warningMessage}</span>
          </div>
        </motion.section>
      ) : null}

      {!warningMessage && (isRunning || qualityGateMessage) ? (
        <motion.section
          {...sectionMotion}
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isRunning
              ? "border border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-500/15 dark:bg-teal-500/10 dark:text-teal-200"
              : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
          )}
        >
          <div className="flex items-start gap-3">
            {isRunning ? (
              <RefreshCw className="mt-0.5 size-4 shrink-0 animate-spin" />
            ) : (
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            )}
            <span>
              {isRunning
                ? `Scan is ${formatStatusLabel(status)}. Progress is ${Math.max(0, Math.min(100, Math.round(progress)))}%.`
                : qualityGateMessage}
            </span>
          </div>
        </motion.section>
      ) : null}

      <motion.section
        {...sectionMotion}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <TopStatCard
          label="Quality Gate"
          value={getQualityGateLabel(qualityGate)}
          helper={scanSummary ? "Latest scan summary" : "Waiting for summary"}
          accent={
            qualityGate === "OK" ? "emerald" : qualityGate ? "amber" : "slate"
          }
          icon={qualityGate === "OK" ? ShieldCheck : ShieldAlert}
        />
        <TopStatCard
          label="Scan Status"
          value={formatStatusLabel(status)}
          helper={`${Math.max(0, Math.min(100, Math.round(progress)))}% progress`}
          accent={
            status === "SUCCESS"
              ? "emerald"
              : status === "FAILED"
                ? "amber"
                : "teal"
          }
          icon={
            status === "SUCCESS"
              ? CheckCircle2
              : status === "FAILED"
                ? AlertTriangle
                : RefreshCw
          }
        />
        <TopStatCard
          label="Issues"
          value={formatCount(
            (scanSummary?.bugs ?? 0) +
              (scanSummary?.vulnerabilities ?? 0) +
              (scanSummary?.code_smells ?? 0),
          )}
          helper={
            scanSummary
              ? "Bugs, vulnerabilities, and smells"
              : "Waiting for summary"
          }
          accent="teal"
          icon={FileCode2}
        />
        <TopStatCard
          label="Project History"
          value={formatCount(scanCount)}
          helper="Recorded analyses for this project"
          accent="slate"
          icon={Clock3}
        />
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="flex gap-2 overflow-x-auto rounded-2xl border border-[#d7e0ef] bg-white p-2 dark:border-gray-800 dark:bg-gray-950"
      >
        {projectNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                active
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                  : "text-[#52648f] hover:bg-[#eef3fb] hover:text-[#253554] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </motion.section>

      {activeView === "overview" ? (
        <motion.div {...sectionMotion} className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="grid md:grid-cols-3">
              <OverviewMetricCell
                title="Security"
                value={formatCount(scanSummary?.vulnerabilities)}
                primaryDetail="Open issues"
                grade={getGrade(scanSummary?.vulnerabilities ?? 0, 0, 2)}
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Reliability"
                value={formatCount(scanSummary?.bugs)}
                primaryDetail="Open issues"
                grade={getGrade(scanSummary?.bugs ?? 0, 0, 5)}
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Maintainability"
                value={formatCount(scanSummary?.code_smells)}
                primaryDetail="Open issues"
                grade={getGrade(scanSummary?.code_smells ?? 0, 10, 50)}
                className="border-b border-[#d7e0ef] md:border-b-0 dark:border-gray-800"
              />
            </div>

            <div className="grid border-t border-[#d7e0ef] md:grid-cols-3 dark:border-gray-800">
              <OverviewMetricCell
                title="Accepted issues"
                value={formatCount(acceptedIssues)}
                secondaryDetail="Valid issues that were not fixed"
                ring="neutral"
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Coverage"
                value={formatPercent(scanSummary?.coverage)}
                secondaryDetail="Coverage reported by scanner"
                ring={(scanSummary?.coverage ?? 0) >= 80 ? "ok" : "bad"}
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Duplications"
                value={formatPercent(scanSummary?.duplications)}
                secondaryDetail="Duplicated lines percentage"
                ring={(scanSummary?.duplications ?? 0) <= 3 ? "ok" : "bad"}
              />
            </div>

            <div className="grid border-t border-[#d7e0ef] md:grid-cols-3 dark:border-gray-800">
              <OverviewMetricCell
                title="Security Hotspots"
                value={formatCount(scanSummary?.security_hotspots)}
                grade={getGrade(scanSummary?.security_hotspots ?? 0, 0, 3)}
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Dependency scan"
                value={formatCount(dependencySummary?.vulnerable)}
                primaryDetail="Vulnerable packages"
                secondaryDetail={`${formatCount(dependencySummary?.outdated)} outdated • ${formatCount(dependencySummary?.license_issues)} license issues`}
                grade={getGrade(dependencySummary?.critical ?? 0, 0, 1)}
                className="border-b border-[#d7e0ef] md:border-b-0 md:border-r dark:border-gray-800"
              />
              <OverviewMetricCell
                title="Dependency severity"
                value={`${formatCount(dependencySummary?.critical)} critical`}
                primaryDetail={`${formatCount(dependencySummary?.high)} high`}
                secondaryDetail={`${formatCount(dependencySummary?.medium)} medium • ${formatCount(dependencySummary?.low)} low`}
                ring={
                  (dependencySummary?.critical ?? 0) > 0
                    ? "bad"
                    : (dependencySummary?.vulnerable ?? 0) > 0
                      ? "neutral"
                      : "ok"
                }
              />
            </div>
          </section>
        </motion.div>
      ) : null}

      {activeView === "issues" ? (
        <motion.section {...sectionMotion} className="space-y-5">
          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-5 lg:grid-cols-2">
              <FilterChips
                label="Issue type"
                options={issueTypeOptions}
                selected={typeFilter}
                onChange={setTypeFilter}
              />
              <FilterChips
                label="Severity"
                options={severityOptions}
                selected={severityFilter}
                onChange={setSeverityFilter}
              />
            </div>
          </div>

          <IssueList
            projectKey={scanDetail.project_key || routeIdentifier}
            issues={issues}
            total={totalIssues}
            isLoading={isIssuesFetching}
          />
        </motion.section>
      ) : null}

      {activeView === "dependencies" ? (
        <motion.section {...sectionMotion} className="space-y-5">
          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <FilterChips
                label="Dependency checker"
                options={dependencyToolOptions}
                selected={dependencyToolFilter}
                onChange={setDependencyToolFilter}
              />
              <FilterChips
                label="Severity"
                options={dependencySeverityOptions}
                selected={dependencySeverityFilter}
                onChange={setDependencySeverityFilter}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <DependencyFlag
                active={dependencyVulnerableOnly}
                label="Vulnerable only"
                onClick={() =>
                  setDependencyVulnerableOnly((current) => !current)
                }
              />
              <DependencyFlag
                active={dependencyOutdatedOnly}
                label="Outdated only"
                onClick={() => setDependencyOutdatedOnly((current) => !current)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TopStatCard
              label="Dependencies"
              value={formatCount(totalDependencies)}
              helper="Filtered dependency results"
              accent="teal"
              icon={FolderGit2}
            />
            <TopStatCard
              label="Vulnerable"
              value={formatCount(
                dependencies.filter((item) => item.is_vulnerable).length,
              )}
              helper="Current filtered list"
              accent="amber"
              icon={ShieldAlert}
            />
            <TopStatCard
              label="Outdated"
              value={formatCount(
                dependencies.filter((item) => item.is_outdated).length,
              )}
              helper="Current filtered list"
              accent="slate"
              icon={RefreshCw}
            />
            <TopStatCard
              label="License Issues"
              value={formatCount(
                dependencies.filter((item) => item.has_license_issue).length,
              )}
              helper="Current filtered list"
              accent="emerald"
              icon={Info}
            />
          </div>

          <DependencyList
            dependencies={dependencies}
            total={totalDependencies}
            isLoading={isDependenciesFetching}
          />
        </motion.section>
      ) : null}

      {activeView === "activity" ? (
        <motion.section {...sectionMotion} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#071120] dark:text-white">
              Project activity
            </h2>
            <p className="mt-1 text-sm text-[#52648f] dark:text-gray-400">
              This list comes from the current-user project scans endpoint for
              the same project key.
            </p>
          </div>
          <HistoryList scans={projectHistory?.scans ?? []} />
        </motion.section>
      ) : null}

      {activeView === "info" ? (
        <motion.section {...sectionMotion} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#071120] dark:text-white">
              Project information
            </h2>
            <p className="mt-1 text-sm text-[#52648f] dark:text-gray-400">
              This panel is mapped directly from scan detail and scan status
              responses.
            </p>
          </div>
          <InfoGrid
            projectKey={scanDetail.project_key}
            sonarProjectKey={scanDetail.sonar_project_key}
            repoUrl={scanDetail.repo_url}
            branch={scanDetail.branch}
            status={status ?? scanDetail.status}
            createdAt={scanDetail.created_at}
            startedAt={liveStatus?.started_at ?? scanDetail.started_at}
            finishedAt={liveStatus?.finished_at ?? scanDetail.finished_at}
          />
        </motion.section>
      ) : null}
    </div>
  );
}
