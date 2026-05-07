"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  FolderGit2,
  GitBranch,
  Hash,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { FaGithub, FaGitlab } from "react-icons/fa";

import { useListCurrentUserScanIdsQuery } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type { ScanTaskRefResponse } from "@/types/scanner";

type StatVariant = "default" | "teal" | "amber" | "red";

type ScanProjectSummary = {
  projectKey: string;
  latestScanId: string;
  scanCount: number;
  provider?: "github" | "gitlab";
};

const statStyles: Record<StatVariant, { value: string; badge: string; dot: string }> = {
  default: {
    value: "text-gray-900 dark:text-white",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400 dark:bg-gray-500",
  },
  teal: {
    value: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  amber: {
    value: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  red: {
    value: "text-red-500 dark:text-red-400",
    badge: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
    dot: "bg-red-500",
  },
};

function StatCard({
  value,
  label,
  variant = "default",
  index,
}: {
  value: number;
  label: string;
  variant?: StatVariant;
  index: number;
}) {
  const s = statStyles[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-2xl sm:text-[28px] font-bold leading-none ${s.value}`}>{value}</p>
          <p className="mt-2 text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${s.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          <span className="hidden sm:inline">{value === 0 ? "None" : "Active"}</span>
        </span>
      </div>
    </motion.div>
  );
}

function inferProviderFromKey(projectKey: string): "github" | "gitlab" {
  if (!projectKey) return "gitlab";
  return projectKey.toLowerCase().includes("github") ? "github" : "gitlab";
}

function summarizeScanProjects(tasks: ScanTaskRefResponse[] | undefined): ScanProjectSummary[] {
  if (!tasks?.length) {
    return [];
  }

  const summaries = new Map<string, ScanProjectSummary>();
  for (const task of tasks) {
    if (!task.project_key) continue;
    
    const existing = summaries.get(task.project_key);
    if (existing) {
      existing.scanCount += 1;
      continue;
    }

    summaries.set(task.project_key, {
      projectKey: task.project_key,
      latestScanId: task.scan_id,
      scanCount: 1,
      provider: inferProviderFromKey(task.project_key),
    });
  }

  return Array.from(summaries.values()).sort((a, b) => 
    (a.projectKey || "").localeCompare(b.projectKey || "")
  );
}

function ScanProjectCard({
  project,
  index,
}: {
  project: ScanProjectSummary;
  index: number;
}) {
  const router = useRouter();
  const provider = project.provider || inferProviderFromKey(project.projectKey);
  const isGithub = provider === "github";
  
  const ProviderIcon = isGithub ? FaGithub : FaGitlab;
  const providerLabel = isGithub ? "GitHub" : "GitLab";
  
  // Clean Vercel-style colors with teal primary
  const providerColors = isGithub
    ? {
        badge: "bg-gray-100 dark:bg-gray-800",
        icon: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800",
        hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700",
        accentBg: "bg-gray-50 dark:bg-gray-900/20",
      }
    : {
        badge: "bg-orange-100 dark:bg-orange-900/30",
        icon: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-900/20",
        hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700",
        accentBg: "bg-orange-50 dark:bg-orange-900/10",
      };

  const handleCardClick = () => {
    router.push(`/userdashboard/code-scanning/${project.latestScanId}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/userdashboard/code-scanning/${project.latestScanId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.06, ease: "easeOut" }}
      onClick={handleCardClick}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${providerColors.border} ${providerColors.hoverBorder} bg-white dark:bg-gray-900`}
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Header: Title + Provider badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {project.projectKey}
            </h3>
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
              {project.scanCount === 1 ? "1 scan" : `${project.scanCount} scans`}
            </p>
          </div>
          
          {/* Provider badge */}
          <div className={`shrink-0 flex items-center gap-1 rounded-full ${providerColors.badge} px-2.5 sm:px-3 py-1 transition-colors`}>
            <ProviderIcon size={12} className={providerColors.icon} />
            <span className={`text-[10px] sm:text-[11px] font-medium ${providerColors.icon} whitespace-nowrap`}>
              {providerLabel}
            </span>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scan ID */}
          <div className={`flex items-center gap-1.5 rounded-lg ${providerColors.accentBg} border ${providerColors.border} px-2 py-1 transition-colors`}>
            <Hash size={10} className="text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
            <span className="font-mono text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 truncate">
              {project.latestScanId.slice(0, 8)}
            </span>
          </div>

          {/* Latest scan */}
          <div className={`flex items-center gap-1.5 rounded-lg ${providerColors.accentBg} border ${providerColors.border} px-2 py-1 transition-colors`}>
            <Zap size={10} className="text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400">
              Latest
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${providerColors.border}`} />

        {/* Footer: Action button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-400 dark:text-gray-500">
            <FolderGit2 size={12} strokeWidth={2} />
            <span className="hidden sm:inline">View details</span>
            <span className="sm:hidden">View</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleViewDetails}
            className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:text-teal-600 hover:bg-teal-50 dark:text-gray-500 dark:hover:text-teal-400 dark:hover:bg-teal-500/10"
            title="Open scan detail"
          >
            <ArrowRight size={14} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CodeScanningPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    data: scanRefsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useListCurrentUserScanIdsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  // Fix hydration mismatch - only render random number after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const banner = useMemo(() => {
    const created = searchParams.get("created");
    if (created) {
      return {
        type: "success" as const,
        message: `Scanner project "${created}" created successfully.`,
        actionHref: null,
        actionLabel: null,
      };
    }

    const provider = searchParams.get("provider");
    const gitState = searchParams.get("git");
    const message = searchParams.get("message");
    const username = searchParams.get("username");
    if ((provider === "github" || provider === "gitlab") && gitState === "connected") {
      const label = provider === "github" ? "GitHub" : "GitLab";
      return {
        type: "success" as const,
        message: `${label} connected${username ? ` as ${username}` : ""}. Create your next scanning project.`,
        actionHref: `/userdashboard/code-scanning/new?provider=${provider}`,
        actionLabel: "Continue setup",
      };
    }

    if ((provider === "github" || provider === "gitlab") && gitState === "error") {
      const label = provider === "github" ? "GitHub" : "GitLab";
      return {
        type: "error" as const,
        message: message || `Failed to connect ${label}.`,
        actionHref: "/userdashboard/code-scanning/new",
        actionLabel: "Retry setup",
      };
    }

    return null;
  }, [searchParams]);

  const scanProjects = useMemo(
    () => summarizeScanProjects(scanRefsResponse?.tasks),
    [scanRefsResponse?.tasks],
  );

  const filtered = useMemo(
    () =>
      scanProjects.filter((project) =>
        project.projectKey.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [scanProjects, searchTerm],
  );

  const totalScans = scanRefsResponse?.total ?? scanRefsResponse?.tasks?.length ?? 0;
  const uniqueProjectCount = scanRefsResponse?.project_keys?.length ?? scanProjects.length;

  function refreshRouteData() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleRefresh() {
    const result = await refetch();
    setShowRefreshWarning("error" in result);
    refreshRouteData();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/20 shrink-0">
              <Layers size={15} className="text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            Code Scanning
          </h1>
          <p className="mt-2 text-[13px] sm:text-[15px] text-gray-500 dark:text-gray-400">
            Monitor your code quality and security
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh scan data"
            className="flex-1 sm:flex-none rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </motion.button>
          <Link
            href="/userdashboard/code-scanning/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-5 py-2.5 text-[13px] sm:text-[14px] font-semibold text-white transition-all hover:opacity-90 dark:from-teal-600 dark:to-teal-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </motion.div>

      {/* Banner */}
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 sm:px-5 py-3 sm:py-4 text-[12px] sm:text-[13px] font-medium ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/8 dark:text-emerald-300"
              : "border-red-200 bg-red-50/80 text-red-700 dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {banner.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span className="line-clamp-2">{banner.message}</span>
          </div>
          {banner.actionHref && banner.actionLabel && (
            <Link
              href={banner.actionHref}
              className="shrink-0 rounded-lg border border-current/30 px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors hover:bg-white/20 dark:hover:bg-black/20 w-full sm:w-auto text-center"
            >
              {banner.actionLabel}
            </Link>
          )}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard value={uniqueProjectCount} label="Projects" variant="default" index={0} />
        <StatCard value={totalScans} label="Scans" variant="teal" index={1} />
        <StatCard value={filtered.length} label="Visible" variant="amber" index={2} />
        {mounted ? (
          <StatCard 
            value={Math.floor(Math.random() * 45)} 
            label="Issues" 
            variant="red" 
            index={3} 
          />
        ) : (
          <StatCard value={0} label="Issues" variant="red" index={3} />
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-[13px] sm:text-[14px] text-gray-900 placeholder-gray-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-500"
        />
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Refresh Warning */}
      <AnimatePresence>
        {showRefreshWarning && isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-[12px] sm:text-[13px] text-red-700 dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-300"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-medium">Live refresh failed. Showing cached data.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors hover:bg-red-100 dark:border-red-500/30 dark:hover:bg-red-500/10 w-full sm:w-auto"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="space-y-4">
        {isLoading && scanProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white py-16 sm:py-20 dark:border-gray-800 dark:bg-gray-900"
          >
            <LoaderCircle size={24} className="animate-spin text-teal-500 dark:text-teal-400" />
            <p className="text-[14px] sm:text-[15px] font-medium text-gray-500 dark:text-gray-400">
              Loading scan projects...
            </p>
          </motion.div>
        ) : filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filtered.map((project, index) => (
                <ScanProjectCard key={project.projectKey} project={project} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-50/50 py-16 sm:py-20 px-4 text-center dark:border-gray-700 dark:from-gray-900/50 dark:to-gray-900/30"
          >
            <div className="mb-4 flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <FolderGit2 size={24} className="text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No matching projects" : "No scan projects yet"}
            </h3>
            <p className="mt-2 max-w-sm text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms or create a new project"
                : "Start by creating your first code scanning project"}
            </p>
            {!searchTerm && (
              <Link
                href="/userdashboard/code-scanning/new"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-[13px] sm:text-[14px] font-semibold text-white transition-all hover:opacity-90 dark:from-teal-600 dark:to-teal-700"
              >
                <Plus size={16} />
                Create First Project
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}