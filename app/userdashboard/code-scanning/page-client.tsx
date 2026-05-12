"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { buildCodeScanningProjectHref } from "@/lib/scanner-route";
import { useListCurrentUserScanIdsQuery } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type { ScanTaskRefResponse } from "@/types/scanner";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatVariant = "default" | "teal" | "amber" | "red";

type ScanProjectSummary = {
  projectKey: string;
  scanCount: number;
};

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
    return <GitHubIcon size={size} className="text-gray-600 dark:text-gray-300" />;
  if (provider === "gitlab")
    return <GitLabIcon size={size} className="text-orange-500 dark:text-orange-400" />;
  return <FolderGit2 size={size} className="text-gray-500 dark:text-gray-400" />;
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
}: {
  value: number;
  label: string;
  variant?: StatVariant;
  badge: string;
  index: number;
}) {
  const { stroke, fill, label: labelColor } = HEX_CONFIGS[variant];

  const cx = 55; const cy = 55; const r = 42;
  const outerPts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
  const ringR = [28, 14];

  const newLocal = "sm:h-[56px] sm:w-[56px] md:h-[70px] md:w-[70px]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, ease: "easeOut" }}
      className="relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-gray-200 bg-white px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 md:gap-4 md:px-5 md:py-4 dark:border-gray-800 dark:bg-[#0a0a0a]"
    >
      {/* Subtle corner gradient */}
      <span
        className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full opacity-25 blur-2xl sm:h-20 sm:w-20"
        style={{ background: stroke }}
      />

      {/* Hex SVG — responsive sizing */}
      <div className="shrink-0">
        <svg width={48} height={48} viewBox="0 0 110 110" className={newLocal}>
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
            fontSize={22}
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
        <p className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px] md:text-[13px]" style={{ color: labelColor }}>
          {label}
        </p>
        <span
          className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:mt-1 sm:gap-1.5 sm:px-2 sm:text-[10px] md:text-[11px]"
          style={{
            background: fill,
            color: stroke,
            border: `1px solid ${stroke}30`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: stroke }} />
          {badge}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ScanProjectCard({ project, index }: { project: ScanProjectSummary; index: number }) {
  const provider = getProviderFromKey(project.projectKey);
  const href = buildCodeScanningProjectHref(project.projectKey);

  const providerLabel = provider === "github" ? "GitHub" : provider === "gitlab" ? "GitLab" : "Repository";
  const providerColor =
    provider === "github"
      ? "text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      : provider === "gitlab"
      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"
      : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.055, ease: "easeOut" }}
      className="group relative flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-teal-400/70 hover:shadow-[0_0_0_1px_rgba(20,184,166,0.15)] dark:border-gray-800 dark:bg-[#0a0a0a] dark:hover:border-teal-500/40"
    >
      {/* Full-card clickable overlay — entire card is now clickable */}
      <Link
        href={href}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        aria-label={`Open ${project.projectKey} project overview`}
        tabIndex={0}
      />

      {/* Hover glow */}
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-teal-500/3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Header */}
      <div className="relative z-0 flex items-start gap-2.5 p-3 pb-2.5 sm:gap-3 sm:p-4 sm:pb-3 md:p-5 md:pb-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-9 sm:w-9 md:h-10 md:w-10 ${providerColor}`}
        >
          <ProviderIcon projectKey={project.projectKey} size={14} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-[12px] font-semibold leading-snug text-gray-900 sm:text-[13px] md:text-[14px] dark:text-white">
            {project.projectKey}
          </h3>
          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-[11px] md:text-[12px] dark:text-gray-500">
            {project.scanCount === 1 ? "1 recorded scan" : `${project.scanCount} recorded scans`}
          </p>
        </div>
        {/* Arrow indicator */}
        <ExternalLink
          size={12}
          className="mt-0.5 shrink-0 text-gray-300 transition-colors group-hover:text-teal-400 sm:size-3.25 dark:text-gray-600 dark:group-hover:text-teal-500"
        />
      </div>

      {/* Tags */}
      <div className="relative z-0 flex flex-wrap items-center gap-1.5 px-3 pb-2.5 sm:gap-2 sm:px-4 sm:pb-3 md:px-5 md:pb-4">
        <span
          className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium sm:gap-1.5 sm:px-2 sm:text-[10px] md:text-[11px] ${providerColor}`}
        >
          {provider === "github" ? (
            <GitHubIcon size={8} />
          ) : provider === "gitlab" ? (
            <GitLabIcon size={8} />
          ) : (
            <GitBranch size={8} />
          )}
          {providerLabel}
        </span>
        <span className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[9px] font-medium text-gray-500 sm:gap-1.5 sm:px-2 sm:text-[10px] md:text-[11px] dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
          <GitBranch size={8} />
          Project key
        </span>
      </div>

      {/* Footer */}
      <div className="relative z-0 mt-auto flex items-center justify-between border-t border-gray-100 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 dark:border-gray-800/80">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-400 sm:text-[11px] md:text-[12px] dark:text-gray-500">
          <FolderGit2 size={10} className="sm:size-2.75" />
          Project overview
        </span>
        {/* Secondary button with higher z-index */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = href;
          }}
          className="relative z-20 flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-medium text-gray-600 transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[10px] md:text-[11px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/10 dark:hover:text-teal-400"
          title="Open project overview"
        >
          <ExternalLink size={10} className="sm:size-2.75" />
          <span className="hidden sm:inline">Open</span>
        </button>
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
  const filtered = useMemo(
    () => scanProjects.filter((p) => p.projectKey.toLowerCase().includes(searchTerm.toLowerCase())),
    [scanProjects, searchTerm],
  );

  const totalScans = scanRefsResponse?.total ?? scanRefsResponse?.tasks.length ?? 0;
  const uniqueProjectCount = scanRefsResponse?.project_keys.length ?? scanProjects.length;

  function refreshRouteData() {
    startTransition(() => { router.refresh(); });
  }

  async function handleRefresh() {
    const result = await refetch();
    setShowRefreshWarning("error" in result);
    refreshRouteData();
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Layers size={11} className="text-teal-500 sm:size-3 dark:text-teal-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-teal-600 sm:text-[10px] dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="text-[20px] font-bold leading-tight tracking-tight text-gray-900 sm:text-[22px] md:text-[26px] dark:text-white">
            Code Scanning
          </h1>
          <p className="mt-1 text-[11px] text-gray-500 sm:text-[12px] md:text-[13px] dark:text-gray-400">
            Review code scanning projects and continue repository onboarding
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:text-gray-800 disabled:opacity-40 dark:border-gray-700 dark:bg-[#0a0a0a] dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </motion.button>
          <Link
            href="/userdashboard/code-scanning/new"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-500 px-3 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 sm:flex-none sm:justify-start sm:gap-2 sm:px-4 sm:text-[13px]"
          >
            <Plus size={13} />
            New Project
          </Link>
        </div>
      </motion.div>

      {/* ── Banner ── */}
      {banner ? (
        <div
          className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 text-[12px] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3 sm:text-[13px] ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          <div className="flex items-start gap-2 sm:items-center sm:gap-2.5">
            <AlertCircle size={13} className="mt-0.5 shrink-0 sm:mt-0 sm:size-3.5" />
            {banner.message}
          </div>
          {banner.actionHref && banner.actionLabel ? (
            <Link
              href={banner.actionHref}
              className="shrink-0 self-start rounded-lg border border-current/20 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-white/40 sm:self-auto sm:px-3 sm:text-[12px] dark:hover:bg-black/10"
            >
              {banner.actionLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* ── Hex Stat Cards – 2×2 mobile, 4 col tablet/desktop ── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:grid-cols-4">
        <HexStatCard value={uniqueProjectCount} label="Tracked Projects" variant="default" badge={uniqueProjectCount === 0 ? "None" : "Active"} index={0} />
        <HexStatCard value={totalScans}         label="Recorded Scans"   variant="teal"    badge={totalScans === 0 ? "None" : "Active"}         index={1} />
        <HexStatCard value={filtered.length}    label="Visible Results"  variant="amber"   badge={filtered.length === 0 ? "None" : "Active"}    index={2} />
        <HexStatCard value={0}                  label="Issues Found"     variant="red"     badge="None"                                         index={3} />
      </div>

      {/* ── Search ── */}
      <div className="relative w-full sm:max-w-sm md:max-w-md">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-3.5 sm:size-3.5 dark:text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search project keys..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-[12px] text-gray-900 placeholder-gray-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:py-2.5 sm:pl-10 sm:pr-9 sm:text-[13px] dark:border-gray-700 dark:bg-[#0a0a0a] dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-500"
        />
        <AnimatePresence>
          {searchTerm ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-600 sm:right-3 dark:hover:text-gray-200"
            >
              <X size={12} className="sm:size-3.25" />
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
            className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3 sm:text-[13px] dark:border-red-500/20 dark:bg-red-500/6 dark:text-red-400"
          >
            <div className="flex items-start gap-2 sm:items-center sm:gap-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 sm:mt-0 sm:size-3.5" />
              Live refresh failed. Showing the last cached projects.
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 self-start rounded-lg border border-red-300 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-red-100 sm:self-auto sm:px-3 sm:text-[12px] dark:border-red-500/30 dark:hover:bg-red-500/10"
            >
              Retry
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Project Cards: 1 col mobile / 2 col tablet / 3 col desktop ── */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {isLoading && scanProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-12 sm:col-span-2 sm:py-16 lg:col-span-3 dark:border-gray-800 dark:bg-[#0a0a0a]">
            <LoaderCircle size={18} className="animate-spin text-teal-500 sm:size-5 dark:text-teal-400" />
            <p className="text-[12px] text-gray-500 sm:text-[13px] dark:text-gray-400">Loading projects…</p>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map((project, index) => (
              <ScanProjectCard key={project.projectKey} project={project} index={index} />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center sm:col-span-2 sm:py-14 lg:col-span-3 dark:border-gray-700 dark:bg-[#0a0a0a]"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 sm:mb-4 sm:h-12 sm:w-12 dark:border-gray-700 dark:bg-gray-800">
              <FolderGit2 size={18} className="text-gray-400 sm:size-5 dark:text-gray-500" />
            </div>
            <h3 className="text-[14px] font-semibold text-gray-900 sm:text-[15px] dark:text-white">
              {searchTerm ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="mt-1 max-w-60 text-[11px] text-gray-500 sm:max-w-xs sm:text-[12px] md:text-[13px] dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your project-key search"
                : "Create a code scanning project to populate your project overview"}
            </p>
            {!searchTerm ? (
              <Link
                href="/userdashboard/code-scanning/new"
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 sm:mt-5 sm:gap-2 sm:px-4 sm:text-[13px]"
              >
                <Plus size={13} />
                Add your first project
              </Link>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
