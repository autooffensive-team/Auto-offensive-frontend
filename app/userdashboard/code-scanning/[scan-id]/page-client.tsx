"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  Filter,
  GitBranch,
  History,
  LoaderCircle,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import {
  useGetScanDetailQuery,
  useGetScanSummaryQuery,
  useListCurrentUserScansQuery,
  useListIssuesQuery,
  useTriggerScanMutation,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type {
  IssueResponse,
  ProjectScanResponse,
  ScanSummaryResponse,
} from "@/types/scanner";
import { FaGithub } from "react-icons/fa";

type TabKey = "overview" | "findings" | "activity" | "settings";
type SeverityBucket = "critical" | "high" | "medium" | "low";

type TrendPoint = {
  scanId: string;
  label: string;
  value: number;
  status: ProjectScanResponse["status"];
};

type ActivityEvent = {
  title: string;
  detail: string;
  at: string | null;
  tone: "default" | "success" | "warning" | "danger";
};

const severityOrder: SeverityBucket[] = ["critical", "high", "medium", "low"];

const severityTone: Record<SeverityBucket, string> = {
  critical: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200",
  high: "border-orange-400/20 bg-orange-400/10 text-orange-700 dark:text-orange-200",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200",
  low: "border-sky-400/20 bg-sky-400/10 text-sky-700 dark:text-sky-200",
};

const severityBarTone: Record<SeverityBucket, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-amber-300",
  low: "bg-sky-400",
};

const pageFontFamily = "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
const shellPanelClass =
  "rounded-[2rem] border border-black/6 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20";
const innerPanelClass =
  "rounded-[1.6rem] border border-black/6 bg-white/85 shadow-sm shadow-slate-200/50 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/50 dark:shadow-black/20";
const mutedPanelClass =
  "rounded-[1.4rem] border border-black/6 bg-slate-50/85 dark:border-white/10 dark:bg-white/5";
const inputClass =
  "w-full rounded-full border border-black/8 bg-white/90 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100";
const sectionMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

function normalizeSeverity(value: string): SeverityBucket {
  const upper = value.toUpperCase();
  if (upper === "BLOCKER" || upper === "CRITICAL") {
    return "critical";
  }
  if (upper === "HIGH" || upper === "MAJOR") {
    return "high";
  }
  if (upper === "MEDIUM" || upper === "MINOR") {
    return "medium";
  }
  return "low";
}

function formatSeverityLabel(value: string): string {
  return normalizeSeverity(value).replace(/^./, (char) => char.toUpperCase());
}

function formatDateTime(value: string | null | undefined): string {
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

function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return "Now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0%";
  }
  return `${Math.round(value)}%`;
}

function formatDecimal(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0.0%";
  }
  return `${value.toFixed(1)}%`;
}

function getRepoPath(repoUrl: string): string {
  if (!repoUrl) {
    return "github.com/daichhav/web-application";
  }
  try {
    const parsed = new URL(repoUrl);
    return `${parsed.host}${parsed.pathname.replace(/\.git$/i, "")}`;
  } catch {
    return repoUrl.replace(/^https?:\/\//i, "").replace(/\.git$/i, "");
  }
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

function buildFailedConditions(
  summary: ScanSummaryResponse | undefined,
  severityCounts: Record<SeverityBucket, number>,
): Array<{ label: string; value: string; target: string }> {
  if (!summary) {
    return [
      { label: "Security gate", value: "Awaiting summary", target: "Scan summary required" },
    ];
  }

  const conditions: Array<{ label: string; value: string; target: string }> = [];
  if (summary.coverage < 80) {
    conditions.push({
      label: "Coverage below baseline",
      value: formatPercent(summary.coverage),
      target: "Target 80%+",
    });
  }
  if (summary.duplications > 3) {
    conditions.push({
      label: "Duplications above threshold",
      value: formatDecimal(summary.duplications),
      target: "Target under 3.0%",
    });
  }
  if (severityCounts.critical > 0) {
    conditions.push({
      label: "Critical findings remain open",
      value: `${severityCounts.critical} active`,
      target: "Target 0 critical",
    });
  }
  if ((summary.dependency_summary?.critical ?? 0) > 0) {
    conditions.push({
      label: "Critical vulnerable dependencies",
      value: `${summary.dependency_summary?.critical ?? 0} packages`,
      target: "Target 0 critical",
    });
  }
  if (summary.vulnerabilities > 0 && conditions.length === 0) {
    conditions.push({
      label: "Vulnerability backlog detected",
      value: `${summary.vulnerabilities} findings`,
      target: "Target 0 vulnerabilities",
    });
  }
  return conditions;
}

function buildActivityEvents(
  scan: {
    branch: string;
    created_at: string | null;
    started_at: string | null;
    finished_at: string | null;
    status: string;
  },
  issueCount: number,
  resolvedCount: number,
  failedConditions: Array<{ label: string }>,
): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      title: "Scan triggered",
      detail: `Queued for branch ${scan.branch || "default"}`,
      at: scan.created_at,
      tone: "default",
    },
  ];

  if (scan.started_at) {
    events.push({
      title: "Analysis started",
      detail: "Source checkout and static analysis pipeline started",
      at: scan.started_at,
      tone: "default",
    });
  }

  if (scan.finished_at) {
    events.push({
      title: "Scan completed",
      detail: `${issueCount} findings processed in the latest run`,
      at: scan.finished_at,
      tone: scan.status === "FAILED" ? "danger" : "success",
    });
  }

  if (issueCount > 0) {
    events.push({
      title: "New issue found",
      detail: `${issueCount} findings are visible in this run`,
      at: scan.finished_at || scan.started_at,
      tone: "warning",
    });
  }

  if (resolvedCount > 0) {
    events.push({
      title: "Issue resolved",
      detail: `${resolvedCount} findings moved out of active status`,
      at: scan.finished_at || scan.started_at,
      tone: "success",
    });
  }

  if (failedConditions.length > 0) {
    events.push({
      title: "Quality gate failed",
      detail: failedConditions[0].label,
      at: scan.finished_at || scan.started_at,
      tone: "danger",
    });
  }

  return events.sort((left, right) => {
    const leftTime = left.at ? new Date(left.at).getTime() : 0;
    const rightTime = right.at ? new Date(right.at).getTime() : 0;
    return rightTime - leftTime;
  });
}

function Sparkline({ points }: { points: TrendPoint[] }) {
  const width = 360;
  const height = 124;
  const padding = 14;

  if (points.length === 0) {
    return (
      <div className="flex h-31 items-center justify-center rounded-[1.4rem] border border-black/6 bg-slate-50/80 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        Scan trend will appear after historical summaries are available.
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const step = points.length === 1 ? 0 : (width - padding * 2) / (points.length - 1);

  const path = points
    .map((point, index) => {
      const x = padding + index * step;
      const normalized = maxValue === minValue ? 0.5 : (point.value - minValue) / (maxValue - minValue);
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-31 w-full overflow-visible rounded-[1.5rem] border border-black/6 bg-[radial-gradient(circle_at_top,rgba(0,208,178,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.9))] p-2 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(0,208,178,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.8))]"
        aria-hidden="true"
      >
        {[0, 1, 2].map((row) => (
          <line
            key={row}
            x1={padding}
            x2={width - padding}
            y1={padding + ((height - padding * 2) / 2) * row}
            y2={padding + ((height - padding * 2) / 2) * row}
            stroke="rgba(100,116,139,0.20)"
            strokeDasharray="3 5"
          />
        ))}
        <path d={path} fill="none" stroke="#00D0B2" strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = padding + index * step;
          const normalized = maxValue === minValue ? 0.5 : (point.value - minValue) / (maxValue - minValue);
          const y = height - padding - normalized * (height - padding * 2);
          return (
            <g key={point.scanId}>
              <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#00D0B2" strokeWidth="2" />
              <text x={x} y={height - 2} textAnchor="middle" fill="#64748b" fontSize="11">
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {points.map((point) => (
          <div
            key={point.scanId}
            className="rounded-[1.3rem] border border-black/6 bg-white/85 px-3 py-2.5 dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{point.label}</div>
            <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{point.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{point.status.replace("_", " ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "danger";
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(innerPanelClass, "p-5")}
    >
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-4 text-3xl font-semibold text-slate-950 dark:text-white",
          tone === "danger" && "text-red-700 dark:text-red-200",
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</div>
    </motion.div>
  );
}

function TabButton({
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
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border-teal-500/20 bg-teal-500/10 text-teal-700 shadow-sm dark:text-teal-300"
          : "border-black/8 bg-white/75 text-slate-500 hover:border-teal-500/20 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-white",
      )}
    >
      {label}
    </button>
  );
}

function CodeScanningDetailPageClient({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [issueSearch, setIssueSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityBucket | "all">("all");
  const [selectedBranchOverride, setSelectedBranchOverride] = useState<string | null>(null);
  const [focusedIssueKey, setFocusedIssueKey] = useState<string | null>(null);
  const [historyTrend, setHistoryTrend] = useState<TrendPoint[]>([]);

  const { data: scanDetail, isLoading, isError, error } = useGetScanDetailQuery(scanId);
  const { data: scanSummary } = useGetScanSummaryQuery(scanId);
  const { data: issueResponse } = useListIssuesQuery({
    scan_id: scanId,
    page: 1,
    page_size: 50,
  });
  const { data: projectHistory } = useListCurrentUserScansQuery(
    scanDetail?.project_key
      ? {
          project_key: scanDetail.project_key,
          page: 1,
          page_size: 12,
        }
      : skipToken,
  );
  const [triggerScan, { isLoading: isTriggering }] = useTriggerScanMutation();

  const issueList = useMemo(() => issueResponse?.issues ?? [], [issueResponse?.issues]);

  const severityCounts = useMemo(() => {
    const counts: Record<SeverityBucket, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const issue of issueList) {
      counts[normalizeSeverity(issue.severity)] += 1;
    }
    return counts;
  }, [issueList]);

  const failedConditions = useMemo(
    () => buildFailedConditions(scanSummary, severityCounts),
    [scanSummary, severityCounts],
  );

  const qualityGateState = failedConditions.length > 0 || scanSummary?.quality_gate === "ERROR" ? "FAILED" : "PASSED";
  const qualityGateIcon = qualityGateState === "FAILED" ? ShieldX : ShieldCheck;
  const qualityGateTone =
    qualityGateState === "FAILED"
      ? {
          badge: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200",
          icon: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200",
        }
      : {
          badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
          icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
        };

  const branchOptions = useMemo(() => {
    const options = new Set<string>();
    if (scanDetail?.branch) {
      options.add(scanDetail.branch);
    }
    for (const scan of projectHistory?.scans ?? []) {
      if (scan.branch) {
        options.add(scan.branch);
      }
    }
    if (options.size === 0) {
      options.add("main");
    }
    return Array.from(options);
  }, [projectHistory?.scans, scanDetail]);

  const selectedBranch = selectedBranchOverride ?? scanDetail?.branch ?? branchOptions[0] ?? "main";

  const scopedHistory = useMemo(() => {
    const items = projectHistory?.scans ?? [];
    if (!selectedBranch) {
      return items;
    }
    return items.filter((scan) => scan.branch === selectedBranch);
  }, [projectHistory?.scans, selectedBranch]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const historySlice = scopedHistory.slice(0, 6);

    async function loadTrend() {
      if (historySlice.length === 0) {
        setHistoryTrend([]);
        return;
      }

      const loaded = await Promise.all(
        historySlice.map(async (scan) => {
          if (scan.scan_id === scanId && scanSummary) {
            return {
              scanId: scan.scan_id,
              label: formatShortDate(scan.finished_at || scan.created_at),
              value: scanSummary.vulnerabilities,
              status: scan.status,
            };
          }

          try {
            const response = await fetch(
              `/api/backend/api/v1/scanner/scans/${encodeURIComponent(scan.scan_id)}/summary`,
              { signal: controller.signal },
            );
            if (!response.ok) {
              return {
                scanId: scan.scan_id,
                label: formatShortDate(scan.finished_at || scan.created_at),
                value: 0,
                status: scan.status,
              };
            }
            const payload = (await response.json()) as ScanSummaryResponse;
            return {
              scanId: scan.scan_id,
              label: formatShortDate(scan.finished_at || scan.created_at),
              value: payload.vulnerabilities,
              status: scan.status,
            };
          } catch {
            return {
              scanId: scan.scan_id,
              label: formatShortDate(scan.finished_at || scan.created_at),
              value: 0,
              status: scan.status,
            };
          }
        }),
      );

      if (!cancelled) {
        setHistoryTrend(loaded.reverse());
      }
    }

    void loadTrend();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [scanId, scanSummary, scopedHistory]);

  const filteredIssues = useMemo(() => {
    return issueList.filter((issue) => {
      const matchesSearch =
        issue.message.toLowerCase().includes(issueSearch.toLowerCase()) ||
        issue.file_path.toLowerCase().includes(issueSearch.toLowerCase()) ||
        issue.rule_key.toLowerCase().includes(issueSearch.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || normalizeSeverity(issue.severity) === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [issueList, issueSearch, severityFilter]);

  const findingsPreview = useMemo(() => {
    const sorted = [...issueList].sort((left, right) => {
      const severityDelta =
        severityOrder.indexOf(normalizeSeverity(left.severity)) -
        severityOrder.indexOf(normalizeSeverity(right.severity));
      if (severityDelta !== 0) {
        return severityDelta;
      }
      return left.line - right.line;
    });
    return sorted.slice(0, 5);
  }, [issueList]);

  const topIssues = useMemo(() => findingsPreview.slice(0, 3), [findingsPreview]);

  const resolvedCount = useMemo(
    () => issueList.filter((issue) => !["OPEN", "TO_REVIEW"].includes(issue.status.toUpperCase())).length,
    [issueList],
  );

  const activityEvents = useMemo(() => {
    if (!scanDetail) {
      return [];
    }
    return buildActivityEvents(
      scanDetail,
      issueList.length,
      resolvedCount,
      failedConditions,
    );
  }, [failedConditions, issueList.length, resolvedCount, scanDetail]);

  async function handleScanNow() {
    if (!scanDetail) {
      return;
    }
    const response = await triggerScan({
      project_key: scanDetail.project_key,
      repo_url: scanDetail.repo_url,
      branch: selectedBranch || scanDetail.branch || "main",
    }).unwrap();
    startTransition(() => {
      router.push(`/userdashboard/code-scanning/${response.scan_id}`);
    });
  }

  function handleBranchChange(branch: string) {
    setSelectedBranchOverride(branch);
    const nextScan = (projectHistory?.scans ?? []).find((scan) => scan.branch === branch);
    if (nextScan && nextScan.scan_id !== scanId) {
      startTransition(() => {
        router.push(`/userdashboard/code-scanning/${nextScan.scan_id}`);
      });
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn("min-h-screen p-8", shellPanelClass)}
        style={{ fontFamily: pageFontFamily }}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <LoaderCircle className="size-5 animate-spin" />
            Loading scan detail...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !scanDetail) {
    return (
      <div
        className={cn("min-h-screen p-8", shellPanelClass)}
        style={{ fontFamily: pageFontFamily }}
      >
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert className="size-10 text-red-500" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Unable to load scan detail</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {JSON.stringify(error) || "The scan detail endpoint did not return a usable payload."}
            </p>
          </div>
          <Link
            href="/userdashboard/code-scanning"
            className="rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-teal-500/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            Back to code scanning
          </Link>
        </div>
      </div>
    );
  }

  const repoPath = getRepoPath(scanDetail.repo_url);
  const QualityGateIcon = qualityGateIcon;

  return (
    <div
      className={cn(
        "min-h-screen rounded-[32px] p-5 md:p-8",
        "bg-[radial-gradient(circle_at_top_left,rgba(0,208,178,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(22,117,177,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.9))]",
        "dark:bg-[radial-gradient(circle_at_top_left,rgba(0,208,178,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(22,117,177,0.14),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.85))]",
      )}
      style={{ fontFamily: pageFontFamily }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.div
          {...sectionMotion}
          className={cn(shellPanelClass, "overflow-hidden p-6 md:p-8")}
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]", qualityGateTone.badge)}>
                  <QualityGateIcon className="mr-2 inline size-3.5" />
                  {qualityGateState}
                </span>
                <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                  Auto Offensive
                </span>
              </div>
              <div>
                <h1 className="display-font text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white md:text-5xl">
                  {scanDetail.project_key || "web-application"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                  Deep-dive scan intelligence for this repository, with quality-gate context,
                  finding prioritization, and recent pipeline activity.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-4 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <FaGithub className="size-4 text-slate-500 dark:text-slate-400" />
                  <span>{repoPath}</span>
                </div>
                <a
                  href={scanDetail.repo_url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-teal-500/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                >
                  Open repository
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-105">
              <label className={cn(innerPanelClass, "p-4")}>
                <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Branch
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-slate-500 dark:text-slate-400" />
                  <select
                    value={selectedBranch}
                    onChange={(event) => handleBranchChange(event.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none dark:text-white"
                  >
                    {branchOptions.map((branch) => (
                      <option key={branch} value={branch} className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <div className={cn(innerPanelClass, "p-4")}>
                <div className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Last scanned
                </div>
                <div className="text-sm font-medium text-slate-950 dark:text-white">
                  {formatDateTime(scanDetail.finished_at || scanDetail.created_at)}
                </div>
              </div>
              <div className={cn(innerPanelClass, "sm:col-span-2 p-4")}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Scan controls
                    </div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Latest scan ID <span className="font-mono text-slate-900 dark:text-slate-100">{scanDetail.scan_id}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleScanNow}
                    disabled={isTriggering}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isTriggering ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Scan now
                  </button>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Source branch {selectedBranch || scanDetail.branch || "main"} · status {scanDetail.status}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <TabButton active={activeTab === "overview"} label="Overview" onClick={() => setActiveTab("overview")} />
          <TabButton active={activeTab === "findings"} label="Findings" onClick={() => setActiveTab("findings")} />
          <TabButton active={activeTab === "activity"} label="Activity" onClick={() => setActiveTab("activity")} />
          <TabButton active={activeTab === "settings"} label="Settings" onClick={() => setActiveTab("settings")} />
        </div>

        {activeTab === "overview" ? (
          <motion.div {...sectionMotion} className="space-y-8">
            <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
              <div className={cn(shellPanelClass, "p-6")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Quality gate
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className={cn("rounded-2xl border p-3", qualityGateTone.icon)}>
                        <QualityGateIcon className="size-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-slate-950 dark:text-white">{qualityGateState}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {failedConditions.length > 0
                            ? `${failedConditions.length} conditions blocked release`
                            : "The scan summary is still being evaluated."}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", qualityGateTone.badge)}>
                    Quality gate
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {failedConditions.map((condition) => (
                    <div
                      key={condition.label}
                      className={cn(mutedPanelClass, "flex items-center justify-between px-4 py-3")}
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{condition.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{condition.target}</div>
                      </div>
                      <div className="text-sm font-semibold text-red-700 dark:text-red-200">{condition.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Vulnerabilities"
                  value={String(scanSummary?.vulnerabilities ?? issueList.length)}
                  note={`${scanSummary?.dependency_summary?.critical ?? severityCounts.critical} critical`}
                  tone="danger"
                />
                <MetricCard
                  label="Code Smells"
                  value={String(scanSummary?.code_smells ?? 14)}
                  note="Refactor candidates"
                />
                <MetricCard
                  label="Coverage"
                  value={formatPercent(scanSummary?.coverage ?? 41)}
                  note="Critical paths under target"
                />
                <MetricCard
                  label="Duplications"
                  value={formatDecimal(scanSummary?.duplications ?? 3.2)}
                  note="Shared logic to consolidate"
                />
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
              <div className={cn(shellPanelClass, "p-6")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Severity distribution
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                      Current findings by priority
                    </div>
                  </div>
                  <ShieldAlert className="size-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="mt-6 overflow-hidden rounded-full border border-black/6 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-4 w-full">
                    {severityOrder.map((severity) => {
                      const count = severityCounts[severity];
                      const total = issueList.length || 1;
                      return (
                        <div
                          key={severity}
                          className={severityBarTone[severity]}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {severityOrder.map((severity) => (
                    <div
                      key={severity}
                      className={cn(mutedPanelClass, "px-4 py-3")}
                    >
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {severity}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-semibold text-slate-950 dark:text-white">{severityCounts[severity]}</span>
                        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", severityTone[severity])}>
                          {Math.round((severityCounts[severity] / Math.max(issueList.length, 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cn(shellPanelClass, "p-6")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Scan history
                    </div>
                    <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                      Last {Math.max(historyTrend.length, 1)} scans
                    </div>
                  </div>
                  <History className="size-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="mt-6">
                  <Sparkline points={historyTrend} />
                </div>
              </div>
            </div>

            <div className={cn(shellPanelClass, "p-6")}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Top issues to fix
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                    Highest-priority findings in this scan
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("findings")}
                  className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-teal-500/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  Open findings
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {topIssues.length > 0 ? (
                  topIssues.map((issue) => {
                    const severity = normalizeSeverity(issue.severity);
                    return (
                      <div
                        key={issue.key}
                        className={cn(innerPanelClass, "p-5")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", severityTone[severity])}>
                            {formatSeverityLabel(issue.severity)}
                          </span>
                          <span className="rounded-full border border-black/8 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
                            {getCweTag(issue)}
                          </span>
                        </div>
                        <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{issue.message}</div>
                        <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">{issue.file_path}:{issue.line}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedIssueKey(issue.key);
                            setActiveTab("findings");
                          }}
                          className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-teal-500/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          View fix
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/5 xl:col-span-3">
                    <div className="text-base font-semibold text-slate-950 dark:text-white">No urgent fixes in the latest scan</div>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      This scan does not currently expose critical issues. Trigger another scan or open the Findings tab for the full issue list.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === "findings" ? (
          <motion.div {...sectionMotion} className={cn(shellPanelClass, "p-6")}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Findings preview
                </div>
                <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  Filterable issue list for this scan
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    value={issueSearch}
                    onChange={(event) => setIssueSearch(event.target.value)}
                    placeholder="Search findings"
                    className={cn(inputClass, "pl-9 sm:w-72")}
                  />
                </label>
                <label className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-2.5 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">
                  <Filter className="size-4 text-slate-500 dark:text-slate-400" />
                  <select
                    value={severityFilter}
                    onChange={(event) => setSeverityFilter(event.target.value as SeverityBucket | "all")}
                    className="bg-transparent outline-none"
                  >
                    <option value="all" className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">All severities</option>
                    {severityOrder.map((severity) => (
                      <option key={severity} value={severity} className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
                        {severity}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/6 dark:border-white/10">
              <div className="grid grid-cols-[1.1fr_2fr_2.2fr_0.7fr_1fr_1fr] gap-3 border-b border-black/6 bg-slate-50/90 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/3 dark:text-slate-400">
                <span>Severity</span>
                <span>Issue name</span>
                <span>File</span>
                <span>Line</span>
                <span>CWE</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-black/6 bg-white/75 dark:divide-white/10 dark:bg-slate-950/45">
                {filteredIssues.slice(0, 5).map((issue) => {
                  const severity = normalizeSeverity(issue.severity);
                  return (
                    <div
                      key={issue.key}
                      className={cn(
                        "grid grid-cols-[1.1fr_2fr_2.2fr_0.7fr_1fr_1fr] gap-3 px-4 py-4 text-sm text-slate-700 transition-colors dark:text-slate-200",
                        focusedIssueKey === issue.key && "bg-teal-500/8",
                      )}
                    >
                      <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]", severityTone[severity])}>
                        {formatSeverityLabel(issue.severity)}
                      </span>
                      <span className="font-medium text-slate-950 dark:text-white">{issue.message}</span>
                      <span className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">{issue.file_path}</span>
                      <span>{issue.line}</span>
                      <span className="text-slate-600 dark:text-slate-300">{getCweTag(issue)}</span>
                      <span className="text-slate-500 dark:text-slate-400">{issue.status}</span>
                    </div>
                  );
                })}
                {filteredIssues.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No findings match the current filters.
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === "activity" ? (
          <motion.div {...sectionMotion} className={cn(shellPanelClass, "p-6")}>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Activity</div>
            <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Recent scan events</div>
            <div className="mt-8 space-y-6">
              {activityEvents.map((event, index) => (
                <div key={`${event.title}-${index}`} className="relative pl-10">
                  {index < activityEvents.length - 1 ? (
                    <div className="absolute left-2.75 top-8 h-[calc(100%+8px)] w-px bg-black/8 dark:bg-white/10" />
                  ) : null}
                  <div
                    className={cn(
                      "absolute left-0 top-1 flex size-6 items-center justify-center rounded-full border",
                      event.tone === "danger" && "border-red-500/30 bg-red-500/10 text-red-200",
                      event.tone === "warning" && "border-amber-400/30 bg-amber-400/10 text-amber-200",
                      event.tone === "success" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
                      event.tone === "default" && "border-white/15 bg-white/4 text-zinc-300",
                    )}
                  >
                    {event.tone === "danger" ? (
                      <AlertTriangle className="size-3.5" />
                    ) : event.tone === "success" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : event.tone === "warning" ? (
                      <FileWarning className="size-3.5" />
                    ) : (
                      <History className="size-3.5" />
                    )}
                  </div>
                  <div className={cn(innerPanelClass, "p-5")}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-base font-semibold text-slate-950 dark:text-white">{event.title}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {formatDateTime(event.at)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}

        {activeTab === "settings" ? (
          <motion.div {...sectionMotion} className="grid gap-5 xl:grid-cols-3">
            <div className={cn(shellPanelClass, "p-6 xl:col-span-2")}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Settings</div>
                  <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Repository and scanner context</div>
                </div>
                <Settings2 className="size-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className={cn(innerPanelClass, "p-5")}>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Repository</div>
                  <div className="mt-3 text-sm font-medium text-slate-950 dark:text-white">{repoPath}</div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{scanDetail.repo_url}</div>
                </div>
                <div className={cn(innerPanelClass, "p-5")}>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sonar project key</div>
                  <div className="mt-3 text-sm font-medium text-slate-950 dark:text-white">
                    {scanDetail.sonar_project_key || scanDetail.project_key}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Linked to the current scan record</div>
                </div>
                <div className={cn(innerPanelClass, "p-5")}>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Selected branch</div>
                  <div className="mt-3 text-sm font-medium text-slate-950 dark:text-white">{selectedBranch || scanDetail.branch || "main"}</div>
                </div>
                <div className={cn(innerPanelClass, "p-5")}>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current scan status</div>
                  <div className="mt-3 text-sm font-medium text-slate-950 dark:text-white">{scanDetail.status}</div>
                </div>
              </div>
            </div>
            <div className={cn(shellPanelClass, "p-6")}>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Actions</div>
              <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Quick controls</div>
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleScanNow}
                  disabled={isTriggering}
                  className="flex w-full items-center justify-between rounded-[22px] border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-left text-sm text-slate-900 transition-colors hover:bg-teal-500/15 disabled:cursor-not-allowed dark:text-white"
                >
                  <span>Trigger scan for this branch</span>
                  {isTriggering ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("findings")}
                  className="flex w-full items-center justify-between rounded-[22px] border border-black/8 bg-white/80 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:border-teal-500/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <span>Review current findings</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default CodeScanningDetailPageClient;
