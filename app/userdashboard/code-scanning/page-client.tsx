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

type StatVariant = "default" | "teal" | "amber" | "red";

type ScanProjectSummary = {
  projectKey: string;
  scanCount: number;
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
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-[28px] font-bold leading-none ${s.value}`}>{value}</p>
          <p className="mt-2 text-[12px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${s.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {value === 0 ? "None" : "Active"}
        </span>
      </div>
    </motion.div>
  );
}

function summarizeScanProjects(tasks: ScanTaskRefResponse[] | undefined): ScanProjectSummary[] {
  if (!tasks?.length) {
    return [];
  }

  const summaries = new Map<string, ScanProjectSummary>();
  for (const task of tasks) {
    const existing = summaries.get(task.project_key);
    if (existing) {
      existing.scanCount += 1;
      continue;
    }

    summaries.set(task.project_key, {
      projectKey: task.project_key,
      scanCount: 1,
    });
  }

  return Array.from(summaries.values()).sort((a, b) => a.projectKey.localeCompare(b.projectKey));
}

function ScanProjectCard({
  project,
  index,
}: {
  project: ScanProjectSummary;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.06, ease: "easeOut" }}
      className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-teal-400 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-teal-500/60"
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-teal-500/2 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-teal-500/4" />

      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 transition-colors group-hover:border-teal-200 group-hover:bg-teal-50 dark:border-gray-700 dark:bg-gray-800 dark:group-hover:border-teal-500/30 dark:group-hover:bg-teal-500/10">
          <FolderGit2
            size={19}
            className="text-gray-500 transition-colors group-hover:text-teal-600 dark:text-gray-400 dark:group-hover:text-teal-400"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-gray-900 dark:text-white">
            {project.projectKey}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-gray-400 dark:text-gray-500">
            {project.scanCount === 1 ? "1 recorded scan" : `${project.scanCount} recorded scans`}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <GitBranch size={10} className="text-gray-400 dark:text-gray-500" />
          Project key
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500">
          <FolderGit2 size={12} />
          <span>Project overview</span>
        </div>

        <Link
          href={buildCodeScanningProjectHref(project.projectKey)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          title="Open project overview"
        >
          <ExternalLink size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

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
    const started = searchParams.get("started");
    if (started) {
      return {
        type: "success" as const,
        message: `Scanner project "${started}" was created successfully.`,
        actionHref: null,
        actionLabel: null,
      };
    }

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
        message: username
          ? `${label} connected as ${username}. Continue creating your scanner project.`
          : `${label} connected successfully. Continue creating your scanner project.`,
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
        actionLabel: "Open setup",
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

  const totalScans = scanRefsResponse?.total ?? scanRefsResponse?.tasks.length ?? 0;
  const uniqueProjectCount = scanRefsResponse?.project_keys.length ?? scanProjects.length;

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Layers size={13} className="text-teal-500 dark:text-teal-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="text-[28px] font-bold leading-tight text-gray-900 dark:text-white">
            Code Scanning
          </h1>
          <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
            Review code scanning projects and continue repository onboarding
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </motion.button>
          <Link
            href="/userdashboard/code-scanning/new"
            className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </motion.div>

      {banner ? (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[13px] ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={15} />
            {banner.message}
          </div>
          {banner.actionHref && banner.actionLabel ? (
            <Link
              href={banner.actionHref}
              className="shrink-0 rounded-lg border border-current/20 px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-white/50 dark:hover:bg-black/10"
            >
              {banner.actionLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard value={uniqueProjectCount} label="Tracked Projects" variant="default" index={0} />
        <StatCard value={totalScans} label="Recorded Scans" variant="teal" index={1} />
        <StatCard value={filtered.length} label="Visible Results" variant="amber" index={2} />
        <StatCard value={0} label="Issues Found" variant="red" index={3} />
      </div>

      <div className="relative max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search project keys..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-[14px] text-gray-900 placeholder-gray-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-500"
        />
        <AnimatePresence>
          {searchTerm ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={13} />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showRefreshWarning && isError ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:border-red-500/20 dark:bg-red-500/6 dark:text-red-400"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={15} />
              Live refresh failed. Showing the last cached projects.
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-red-100 dark:border-red-500/30 dark:hover:bg-red-500/10"
            >
              Retry
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && scanProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 md:col-span-2 dark:border-gray-800 dark:bg-gray-900">
            <LoaderCircle size={22} className="animate-spin text-teal-500 dark:text-teal-400" />
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Loading projects...
            </p>
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
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center md:col-span-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              <FolderGit2 size={22} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="mt-1 max-w-xs text-[13px] text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your project-key search"
                : "Create a code scanning project to populate your project overview"}
            </p>
            {!searchTerm ? (
              <Link
                href="/userdashboard/code-scanning/new"
                className="mt-5 flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
              >
                <Plus size={14} />
                Add your first project
              </Link>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
}
