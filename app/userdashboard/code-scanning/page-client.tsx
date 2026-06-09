"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  FolderGit2,
  GitBranch,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { buildCodeScanningProjectHref } from "@/lib/scanner-route";
import { useListCurrentUserScanIdsQuery } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import { CodeScanTour, CodeScanTourTriggerButton } from "@/components/tour/CodeScanTour";
import type { ScanStatus, ScanStatusResponse, ScanSummaryResponse, ScanTaskRefResponse } from "@/types/scanner";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatVariant = "default" | "teal" | "amber" | "red";

type ScanProjectSummary = {
  projectKey: string;
  scanCount: number;
};

type IssueSummaryState = {
  isLoading: boolean;
  totalIssues: number;
};

const SEEN_PROJECTS_STORAGE_KEY = "code-scanning-seen-projects";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function summarizeScanProjects(tasks: ScanTaskRefResponse[] | undefined): ScanProjectSummary[] {
  if (!tasks?.length) return [];
  const summaries = new Map<string, ScanProjectSummary>();
  for (const task of tasks) {
    const existing = summaries.get(task.project_key);
    if (existing) { existing.scanCount += 1; continue; }
    summaries.set(task.project_key, { projectKey: task.project_key, scanCount: 1 });
  }
  // Preserve insertion order (newest projects appear first)
  return Array.from(summaries.values());
}

function summarizeLatestProjectScanIds(
  tasks: ScanTaskRefResponse[] | undefined,
): Map<string, string> {
  const latestScanIds = new Map<string, string>();

  if (!tasks?.length) {
    return latestScanIds;
  }

  for (const task of tasks) {
    if (!task.project_key || !task.scan_id || latestScanIds.has(task.project_key)) {
      continue;
    }

    // The API returns newest scans first, so the first scan we see per project
    // is the current summary we want to count on the overview page.
    latestScanIds.set(task.project_key, task.scan_id);
  }

  return latestScanIds;
}

function getSummaryIssueCount(summary: ScanSummaryResponse): number {
  return (summary.bugs ?? 0) + (summary.vulnerabilities ?? 0) + (summary.code_smells ?? 0);
}

function readSeenProjects(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SEEN_PROJECTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeSeenProjects(projectKeys: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SEEN_PROJECTS_STORAGE_KEY, JSON.stringify(projectKeys));
  } catch {
    // Ignore storage failures and keep UI functional.
  }
}

function isNewListProject(project: ScanProjectSummary, seenProjects: Set<string>): boolean {
  return project.scanCount === 1 && !seenProjects.has(project.projectKey);
}

function getProviderFromKey(projectKey: string): "github" | "gitlab" | "other" {
  const key = projectKey.toLowerCase();
  
  // More robust GitHub detection
  if (
    key.startsWith("github-") ||
    key.startsWith("gh-") ||
    key.includes("github.com") ||
    key.match(/^[a-z0-9-]+\/[a-z0-9-]+$/) // Matches format: owner/repo
  ) {
    return "github";
  }
  
  // More robust GitLab detection
  if (
    key.startsWith("gitlab-") ||
    key.startsWith("gl-") ||
    key.includes("gitlab.com") ||
    key.includes("gitlab")
  ) {
    return "gitlab";
  }
  
  return "other";
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function GitHubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GitLabIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.93 2a.43.43 0 01.58 0 .42.42 0 01.12.18l2.44 7.49h8.86l2.44-7.51a.42.42 0 01.12-.18.43.43 0 01.58 0 .42.42 0 01.12.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

function ProviderIcon({ projectKey, size = 15 }: { projectKey: string; size?: number }) {
  const provider = getProviderFromKey(projectKey);
  if (provider === "github")
    return <GitHubIcon size={size} className="text-slate-600 dark:text-slate-300" />;
  if (provider === "gitlab")
    return <GitLabIcon size={size} className="text-orange-500 dark:text-orange-400" />;
  return <FolderGit2 size={size} className="text-slate-500 dark:text-slate-400" />;
}

// ─── Hexagonal Stat Chart ────────────────────────────────────────────────────

const HEX_CONFIGS: Record<StatVariant, { stroke: string; fill: string; label: string }> = {
  default: { stroke: "#6b7280", fill: "rgba(107,114,128,0.08)", label: "#6b7280" },
  teal:    { stroke: "#14b8a6", fill: "rgba(20,184,166,0.10)",  label: "#14b8a6" },
  amber:   { stroke: "#f59e0b", fill: "rgba(245,158,11,0.10)",  label: "#f59e0b" },
  red:     { stroke: "#ef4444", fill: "rgba(239,68,68,0.10)",   label: "#ef4444" },
};

function HexStatCard({
  value,
  label,
  variant = "default",
  badge,
  index,
  icon,
}: {
  value: number;
  label: string;
  variant?: StatVariant;
  badge: string;
  index: number;
  icon?: React.ReactNode;
}) {
  const { stroke, fill, label: labelColor } = HEX_CONFIGS[variant];

  const cx = 72; const cy = 72; const r = 58;
  const outerPts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
  const ringR = [42, 24];

  const newLocal = "h-[56px] w-[56px] sm:h-[68px] sm:w-[68px] md:h-[76px] md:w-[76px] lg:h-[92px] lg:w-[92px]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, ease: "easeOut" }}
      className="relative flex items-center gap-2 bg-white px-2.5 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3.5 md:gap-3.5 md:px-4 md:py-4 lg:gap-4 lg:px-5 lg:py-4 dark:bg-slate-900"
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        outline: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat
          `,
          opacity: 0.45,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      {/* Subtle corner gradient */}
      <span
        className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full opacity-25 blur-2xl sm:h-20 sm:w-20"
        style={{ background: stroke }}
      />

      {/* Hex SVG — responsive sizing */}
      <div className="shrink-0">
        <svg width={68} height={68} viewBox="0 0 144 144" className={newLocal}>
          {ringR.map((rr) => (
            <polygon
              key={rr}
              points={Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 180) * (60 * i - 30);
                return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
              }).join(" ")}
              fill="none"
              stroke={stroke}
              strokeWidth={1}
              opacity={0.18}
            />
          ))}
          <polygon points={outerPts} fill={fill} stroke={stroke} strokeWidth={1.5} opacity={0.9} />
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize={30}
            fontWeight={700}
            fill={stroke}
            fontFamily="inherit"
          >
            {value}
          </text>
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs sm:tracking-widest md:text-sm" style={{ color: labelColor }}>
          {label}
        </p>
        <span
          className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:mt-1 sm:gap-1.5 sm:px-2.5 sm:text-[10px] md:text-xs"
          style={{
            background: fill,
            color: stroke,
            border: `1px solid ${stroke}30`,
          }}
        >
          <span className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: stroke }} />
          {badge}
        </span>
      </div>

      {/* Half Icon Design on the right */}
      {icon && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translateX(40%)' }}>
          <div style={{ color: stroke, opacity: 0.12 }} className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px]">
            {icon}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ScanProjectCard({
  project,
  index,
  seenProjects,
  onOpen,
  status,
}: {
  project: ScanProjectSummary;
  index: number;
  seenProjects: Set<string>;
  onOpen: (projectKey: string) => void;
  status?: ScanStatus | null;
}) {
  const provider = getProviderFromKey(project.projectKey);
  const href = buildCodeScanningProjectHref(project.projectKey);
  const isNew = isNewListProject(project, seenProjects);

  const providerLabel = provider === "github" ? "GitHub" : provider === "gitlab" ? "GitLab" : "Repository";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.055, ease: "easeOut" }}
      className="group relative w-full overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white dark:border-white/10 dark:bg-[#101828]"
    >
      {/* New badge */}
      {isNew ? (
        <div className="pointer-events-none absolute -right-1 -top-1 z-30 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          New
        </div>
      ) : null}

      {/* Full-card clickable overlay */}
      <Link
        href={href}
        onClick={() => onOpen(project.projectKey)}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01509e] focus-visible:ring-offset-2"
        aria-label={`Open ${project.projectKey} project overview`}
        tabIndex={0}
      />

      {/* ── Card body ── */}
      <div className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4.5">
        {/* Row 1: avatar + meta + badge + external */}
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-3.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#1a1a1a] sm:h-10 sm:w-10 dark:bg-white/10">
              {provider === "github" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" className="sm:h-5.5 sm:w-5.5" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              ) : provider === "gitlab" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:h-5.5 sm:w-5.5" aria-hidden="true">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.93 2a.43.43 0 01.58 0 .42.42 0 01.12.18l2.44 7.49h8.86l2.44-7.51a.42.42 0 01.12-.18.43.43 0 01.58 0 .42.42 0 01.12.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" fill="#E24329" />
                  <path d="M12 22.13L16.93 9.67H7.07L12 22.13z" fill="#FC6D26" />
                  <path d="M12 22.13L7.07 9.67H1.35L12 22.13z" fill="#FCA326" />
                  <path d="M12 22.13l4.93-12.46h5.72L12 22.13z" fill="#FCA326" />
                </svg>
              ) : (
                <FolderGit2 size={20} className="text-white sm:h-5.5 sm:w-5.5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-[#555] sm:text-[12px] dark:text-white/70">
                {providerLabel} · Repository
              </p>
              <p className="mt-0.5 text-[10px] text-[#999] sm:text-[11px] dark:text-white/40">
                {project.scanCount} recorded scan{project.scanCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-1.75">
            {(() => {
              const statusLabel = status
                ? status.toLowerCase().split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
                : "Active";
              const isSuccess = status === "SUCCESS";
              const isFailed = status === "FAILED";
              const isRunning = status === "PENDING" || status === "IN_PROGRESS";
              const borderColor = isFailed ? "#ef4444" : isRunning ? "#f59e0b" : "#00d0b2";
              const dotColor = isFailed ? "#ef4444" : isRunning ? "#f59e0b" : "#00d0b2";
              const textColor = isFailed ? "text-red-600 dark:text-red-400" : isRunning ? "text-amber-600 dark:text-amber-400" : "text-[#01509e] dark:text-[#00d0b2]";

              return (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.75 text-[10px] font-medium sm:gap-1.25 sm:px-2.5 sm:py-1 sm:text-[12px] ${textColor}`} style={{ borderColor }}>
                  <span className="inline-block h-1.25 w-1.25 rounded-full sm:h-1.5 sm:w-1.5" style={{ backgroundColor: dotColor }} />
                  {statusLabel}
                </span>
              );
            })()}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(href, "_blank");
              }}
              aria-label="Open externally"
              className="relative z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-[6px] border border-[#ccc] bg-transparent text-[#999] transition-colors hover:bg-[#f0f0f0] sm:h-7 sm:w-7 sm:rounded-[7px] dark:border-white/20 dark:text-white/50 dark:hover:bg-white/10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.5 sm:w-3.5" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Project name */}
        <p className="mb-1 truncate text-[14px] font-medium text-[#111] sm:text-[17px] dark:text-white/90" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace" }}>
          {project.projectKey}
        </p>
        <p className="mb-3 text-[11px] text-[#888] sm:mb-4 sm:text-[12px] dark:text-white/40">
          {providerLabel} · Code scanning project
        </p>

        {/* Footer: tags + open button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#e6faf8] px-2 py-0.75 text-[10px] font-medium text-[#01509e] sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[12px] dark:bg-[#01509e]/10 dark:text-[#00d0b2]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.25 sm:w-3.25" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Overview
            </span>
          </div>
          <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpen(project.projectKey);
                window.location.href = href;
              }}
              className="relative z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-primary px-3 py-1.5 text-[11px] font-medium text-black transition-colors hover:bg-primary/80 hover:text-black active:scale-[0.98] sm:gap-1.5 sm:px-4 sm:py-1.75 sm:text-[13px]"
            >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-3.5 sm:w-3.5" aria-hidden="true">
              <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
            </svg>
            Open
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CodeScanningPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [seenProjects, setSeenProjects] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [issueSummaryState, setIssueSummaryState] = useState<IssueSummaryState>({
    isLoading: false,
    totalIssues: 0,
  });
  const [projectStatuses, setProjectStatuses] = useState<Map<string, ScanStatus>>(new Map());

  const {
    data: scanRefsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useListCurrentUserScanIdsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const banner = useMemo(() => {
    const provider = searchParams.get("provider");
    const gitState = searchParams.get("git");
    const message = searchParams.get("message");
    const username = searchParams.get("username");

    if ((provider === "github" || provider === "gitlab") && gitState === "connected") {
      const label = provider === "github" ? "GitHub" : "GitLab";
      return {
        type: "success" as const,
        message: username ? `${label} connected as ${username}. Continue creating your scanner project.` : `${label} connected successfully. Continue creating your scanner project.`,
        actionHref: `/userdashboard/code-scanning/new?provider=${provider}`,
        actionLabel: "Continue setup",
      };
    }

    if ((provider === "github" || provider === "gitlab") && gitState === "error") {
      const label = provider === "github" ? "GitHub" : "GitLab";
      return { type: "error" as const, message: message || `Failed to connect ${label}.`, actionHref: "/userdashboard/code-scanning/new", actionLabel: "Open setup" };
    }

    return null;
  }, [searchParams]);

  const scanProjects = useMemo(() => summarizeScanProjects(scanRefsResponse?.tasks), [scanRefsResponse?.tasks]);
  const latestProjectScanIds = useMemo(
    () => summarizeLatestProjectScanIds(scanRefsResponse?.tasks),
    [scanRefsResponse?.tasks],
  );
  const filtered = useMemo(
    () => scanProjects.filter((p) => p.projectKey.toLowerCase().includes(searchTerm.toLowerCase())),
    [scanProjects, searchTerm],
  );

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage],
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setSeenProjects(new Set(readSeenProjects()));
  }, []);

  useEffect(() => {
    const projectScanIds = scanProjects
      .map((project) => latestProjectScanIds.get(project.projectKey))
      .filter((scanId): scanId is string => Boolean(scanId));

    if (projectScanIds.length === 0) {
      setIssueSummaryState({ isLoading: false, totalIssues: 0 });
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    setIssueSummaryState((current) => ({
      ...current,
      isLoading: true,
    }));

    void Promise.all(
      projectScanIds.map(async (scanId) => {
        try {
          const response = await fetch(`/api/scanner/scans/${encodeURIComponent(scanId)}/summary`, {
            credentials: "include",
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) {
            return 0;
          }

          const summary = (await response.json()) as ScanSummaryResponse;
          return getSummaryIssueCount(summary);
        } catch {
          return 0;
        }
      }),
    )
      .then((counts) => {
        if (!isActive) {
          return;
        }

        setIssueSummaryState({
          isLoading: false,
          totalIssues: counts.reduce((sum, count) => sum + count, 0),
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setIssueSummaryState({
          isLoading: false,
          totalIssues: 0,
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [scanProjects, latestProjectScanIds]);

  // Fetch scan status for each project's latest scan
  useEffect(() => {
    if (scanProjects.length === 0) {
      setProjectStatuses(new Map());
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    void Promise.all(
      scanProjects.map(async (project) => {
        const scanId = latestProjectScanIds.get(project.projectKey);
        if (!scanId) return { projectKey: project.projectKey, status: null };

        try {
          const response = await fetch(`/api/scanner/scans/${encodeURIComponent(scanId)}/status`, {
            credentials: "include",
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) return { projectKey: project.projectKey, status: null };

          const data = (await response.json()) as ScanStatusResponse;
          return { projectKey: project.projectKey, status: data.status };
        } catch {
          return { projectKey: project.projectKey, status: null };
        }
      }),
    ).then((results) => {
      if (!isActive) return;
      const statusMap = new Map<string, ScanStatus>();
      for (const result of results) {
        if (result.status) {
          statusMap.set(result.projectKey, result.status);
        }
      }
      setProjectStatuses(statusMap);
    }).catch(() => {
      // silently ignore
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [scanProjects, latestProjectScanIds]);

  const totalScans = scanRefsResponse?.total ?? scanRefsResponse?.tasks.length ?? 0;
  const uniqueProjectCount = scanRefsResponse?.project_keys.length ?? scanProjects.length;
  const totalIssues = issueSummaryState.totalIssues;

  function handleProjectOpen(projectKey: string) {
    setSeenProjects((current) => {
      if (current.has(projectKey)) {
        return current;
      }

      const next = new Set(current);
      next.add(projectKey);
      writeSeenProjects(Array.from(next));
      return next;
    });
  }

  function refreshRouteData() {
    startTransition(() => { router.refresh(); });
  }

  async function handleRefresh() {
    const result = await refetch();
    setShowRefreshWarning("error" in result);
    refreshRouteData();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">

      {/* ── Code Scan Tour ── */}
      <CodeScanTour />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            Code Scanning
          </h1>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Review code scanning projects and continue repository onboarding
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <CodeScanTourTriggerButton />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </motion.button>
          <Link
            href="/userdashboard/code-scanning/new"
            id="tour-import-repo-btn"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#00d0b2] px-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[#00b89e] sm:flex-none sm:justify-start sm:gap-2 sm:px-4 sm:text-base"
          >
            <Plus size={14} />
            Import Repo
          </Link>
        </div>
      </motion.div>

      {/* ── Banner ── */}
      {banner ? (
        <div
          className={`flex flex-col gap-2 rounded-lg sm:rounded-xl border px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3 sm:text-base ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          <div className="flex items-start gap-2 sm:items-center sm:gap-2.5">
            <AlertCircle size={15} className="mt-0.5 shrink-0 sm:mt-0" />
            {banner.message}
          </div>
          {banner.actionHref && banner.actionLabel ? (
            <Link
              href={banner.actionHref}
              className="shrink-0 self-start rounded-lg border border-current/20 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-white/40 sm:self-auto sm:px-3 sm:text-sm dark:hover:bg-black/10"
            >
              {banner.actionLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* ── Hex Stat Cards – 2×2 mobile, 4 col tablet+ ── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 md:grid-cols-4 lg:gap-3">
        <HexStatCard 
          value={uniqueProjectCount} 
          label="Tracked Projects" 
          variant="default" 
          badge={uniqueProjectCount === 0 ? "No Projects" : `${uniqueProjectCount} ${uniqueProjectCount === 1 ? "Project" : "Projects"}`} 
          index={0}
          icon={<FolderGit2 className="w-full h-full" strokeWidth={1.5} />}
        />
        <HexStatCard 
          value={totalScans} 
          label="Recorded Scans" 
          variant="teal" 
          badge={totalScans === 0 ? "No Scans" : `${totalScans} Total`} 
          index={1}
          icon={<Activity className="w-full h-full" strokeWidth={1.5} />}
        />
        <HexStatCard 
          value={filtered.length} 
          label="Visible Results" 
          variant="amber" 
          badge={
            filtered.length === 0 
              ? "No Results" 
              : filtered.length === scanProjects.length 
                ? "All Shown" 
                : "Filtered"
          } 
          index={2}
          icon={<Eye className="w-full h-full" strokeWidth={1.5} />}
        />
        <HexStatCard
          value={totalIssues}
          label="Issues Found"
          variant="red"
          badge={
            issueSummaryState.isLoading 
              ? "Syncing..." 
              : totalIssues === 0 
                ? "Clean" 
                : totalIssues >= 100
                  ? "Critical"
                  : totalIssues >= 50
                    ? "High"
                    : totalIssues >= 20
                      ? "Medium"
                      : "Low"
          }
          index={3}
          icon={<AlertTriangle className="w-full h-full" strokeWidth={1.5} />}
        />
      </div>

      {/* ── Search ── */}
      <div className="relative w-full sm:max-w-sm md:max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3.5 dark:text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search project keys..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:py-2.5 sm:pl-10 sm:pr-9 sm:text-base dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-500"
        />
        <AnimatePresence>
          {searchTerm ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600 sm:right-3 dark:hover:text-slate-200"
            >
              <X size={14} />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Refresh error ── */}
      <AnimatePresence>
        {showRefreshWarning && isError ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 rounded-lg sm:rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3 sm:text-base dark:border-red-500/20 dark:bg-red-500/6 dark:text-red-400"
          >
            <div className="flex items-start gap-2 sm:items-center sm:gap-2.5">
              <AlertCircle size={15} className="mt-0.5 shrink-0 sm:mt-0" />
              Live refresh failed. Showing the last cached projects.
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 self-start rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-red-100 sm:self-auto sm:px-3 sm:text-sm dark:border-red-500/30 dark:hover:bg-red-500/10"
            >
              Retry
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Project Cards: 1 col mobile / 2 col tablet / 3 col desktop / 4 col wide ── */}
      <div id="tour-project-list" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:gap-3 2xl:grid-cols-4">
        {isLoading && scanProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white py-12 sm:col-span-2 sm:py-16 lg:col-span-3 2xl:col-span-4 dark:border-slate-800 dark:bg-slate-900">
            <LoaderCircle size={20} className="animate-spin text-teal-500 dark:text-teal-400" />
            <p className="text-sm text-slate-500 sm:text-base dark:text-slate-400">Loading projects…</p>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {paginatedProjects.map((project, index) => (
              <ScanProjectCard
                key={project.projectKey}
                project={project}
                index={index}
                seenProjects={seenProjects}
                onOpen={handleProjectOpen}
                status={projectStatuses.get(project.projectKey)}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center sm:col-span-2 sm:py-14 lg:col-span-3 2xl:col-span-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 sm:mb-4 sm:h-12 sm:w-12 dark:border-slate-700 dark:bg-slate-800">
              <FolderGit2 size={20} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              {searchTerm ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="mt-1 max-w-60 text-xs text-slate-500 sm:max-w-xs sm:text-sm md:text-base dark:text-slate-400">
              {searchTerm
                ? "Try adjusting your project-key search"
                : "Import a repository to start scanning your code"}
            </p>
            {!searchTerm ? (
              <Link
                href="/userdashboard/code-scanning/new"
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#00d0b2] px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[#00b89e] sm:mt-5 sm:gap-2 sm:px-4 sm:text-base"
              >
                <Plus size={14} />
                Import your first repo
              </Link>
            ) : null}
          </motion.div>
        )}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium transition-colors ${
                page === currentPage
                  ? "bg-[#01509e] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
