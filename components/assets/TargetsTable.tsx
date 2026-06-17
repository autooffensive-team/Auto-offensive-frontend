"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Globe,
  Server,
  Code2,
  HardDrive,
  Wifi,
  AlertTriangle,
  Clock,
  FolderOpen,
} from "lucide-react";
import { useGetProjectsQuery } from "@/lib/redux/services/userdashboard/project/project-api";
import {
  useListJobsQuery,
  assetsApi,
} from "@/lib/redux/services/userdashboard/assets/assets-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import type { Target, TargetWithMeta, JobSummary } from "@/types/assets";
import PaginationControls from "./PaginationControls";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROW_H = 56; // px — fixed row height
const PAGE_SIZE_DEFAULT = 10;

// ─── Utility functions ────────────────────────────────────────────────────────

export function computeTargetStatus(
  jobs: JobSummary[],
): "Scanning" | "Active" | "Idle" {
  const hasRunning = jobs.some(
    (j) => j.status === "running" || j.status === "pending",
  );
  if (hasRunning) return "Scanning";

  const terminalJobs = jobs.filter(
    (j) => j.status === "completed" || j.status === "failed",
  );
  if (terminalJobs.length === 0) return "Idle";

  const mostRecent = terminalJobs.reduce((latest, job) =>
    new Date(job.created_at).getTime() > new Date(latest.created_at).getTime()
      ? job
      : latest,
  );

  const hoursSince =
    (Date.now() - new Date(mostRecent.created_at).getTime()) / (1000 * 60 * 60);
  return hoursSince <= 24 ? "Active" : "Idle";
}

export function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return "Never";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (diffMs < 0) return "Just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "domain":
    case "subdomain":
      return <Globe size={13} className="text-cyan-500" />;
    case "ip":
    case "ip_range":
      return <Wifi size={13} className="text-violet-500" />;
    case "url":
      return <Server size={13} className="text-blue-500" />;
    case "cidr":
      return <HardDrive size={13} className="text-amber-500" />;
    case "repo":
    case "repository":
      return <Code2 size={13} className="text-emerald-500" />;
    default:
      return <Globe size={13} className="text-slate-400" />;
  }
}

function getTypePillClass(type: string): string {
  switch (type.toLowerCase()) {
    case "domain":
    case "subdomain":
      return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50";
    case "ip":
    case "ip_range":
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50";
    case "url":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50";
    case "cidr":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
    case "repo":
    case "repository":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export type TargetsTableProps = {
  onRowClick?: (targetId: string, projectId: string) => void;
  initialProjectFilter?: string;
};

export default function TargetsTable({ onRowClick, initialProjectFilter }: TargetsTableProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterProject, setFilterProject] = useState(initialProjectFilter ?? "all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, filterProject]);

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery(undefined, { pollingInterval: 30000 });

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p.project_id),
    [projects],
  );

  const targetQueries = useTargetQueries(projectIds);

  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useListJobsQuery({ limit: 100 });

  const isLoading = projectsLoading || targetQueries.isLoading || jobsLoading;
  const isError = projectsError || targetQueries.isError || jobsError;

  const allTargets: TargetWithMeta[] = useMemo(() => {
    if (!projects || !jobsData) return [];
    const jobs = jobsData.jobs ?? [];
    const projectMap = new Map(projects.map((p) => [p.project_id, p.name]));

    return targetQueries.targets.map((target) => {
      const targetJobs = jobs.filter((j) => j.target_name === target.name);
      const status = computeTargetStatus(targetJobs);
      const mostRecentJob = targetJobs.reduce<JobSummary | null>(
        (latest, job) =>
          !latest ||
          new Date(job.created_at).getTime() > new Date(latest.created_at).getTime()
            ? job
            : latest,
        null,
      );
      const openFindings = targetJobs.reduce(
        (sum, j) => sum + (j.total_findings ?? 0),
        0,
      );
      return {
        ...target,
        project_name: projectMap.get(target.project_id) ?? "Unknown",
        last_scan: mostRecentJob?.created_at ?? null,
        status,
        open_findings: openFindings,
      };
    });
  }, [projects, targetQueries.targets, jobsData]);

  const distinctTypes = useMemo(() => {
    const types = new Set(allTargets.map((t) => t.type));
    return Array.from(types).sort();
  }, [allTargets]);

  const sortedTargets = useMemo(() => {
    return [...allTargets].sort((a, b) => {
      if (!a.last_scan && !b.last_scan) return 0;
      if (!a.last_scan) return 1;
      if (!b.last_scan) return -1;
      return new Date(b.last_scan).getTime() - new Date(a.last_scan).getTime();
    });
  }, [allTargets]);

  const filteredTargets = useMemo(() => {
    return sortedTargets.filter((target) => {
      const matchesSearch =
        !debouncedSearch ||
        target.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = filterType === "all" || target.type === filterType;
      const matchesProject =
        filterProject === "all" || target.project_id === filterProject;
      return matchesSearch && matchesType && matchesProject;
    });
  }, [sortedTargets, debouncedSearch, filterType, filterProject]);

  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / pageSize));

  const paginatedTargets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTargets.slice(start, start + pageSize);
  }, [filteredTargets, currentPage, pageSize]);

  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = filterType !== "all" || filterProject !== "all";
  const TBODY_H = ROW_H * pageSize; // always tall enough for a full page

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return <TargetsTableSkeleton pageSize={pageSize} rowH={ROW_H} />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 p-10 text-center">
        <AlertTriangle size={28} className="mx-auto text-rose-400 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          Failed to load target data.
        </p>
        <button
          onClick={() => { refetchProjects(); refetchJobs(); }}
          className="px-5 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty (no targets at all) ─────────────────────────────────────────────
  if (allTargets.length === 0) {
    return (
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 p-10 text-center">
        <FolderOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No targets yet. Add targets to a project to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── Search + Filter bar ─────────────────────────────────────────────── */}
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4">
        <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search targets by name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={200}
              className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-sm lg:text-base rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFCFA] dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              aria-label="Search targets"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              <Filter size={13} />
              Filter
            </span>

            {/* Type */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFCFA] dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-slate-600 min-w-[110px] sm:min-w-[130px]"
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                {distinctTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Project */}
            <div className="relative">
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base rounded-lg border border-slate-200 dark:border-slate-700 bg-[#FCFCFA] dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-slate-600 min-w-[130px] sm:min-w-[160px]"
                aria-label="Filter by project"
              >
                <option value="all">All Projects</option>
                {(projects ?? []).map((project) => (
                  <option key={project.project_id} value={project.project_id}>{project.name}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Clear */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  type="button"
                  onClick={() => { setFilterType("all"); setFilterProject("all"); }}
                  className="inline-flex items-center gap-1 px-2.5 py-2 sm:py-2.5 text-xs font-medium rounded-lg border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors whitespace-nowrap"
                >
                  <X size={11} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Count row */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
            {filteredTargets.length === allTargets.length ? (
              <><span className="font-semibold text-slate-700 dark:text-slate-200">{allTargets.length}</span> target{allTargets.length !== 1 ? "s" : ""}</>
            ) : (
              <><span className="font-semibold text-slate-700 dark:text-slate-200">{filteredTargets.length}</span> of {allTargets.length} targets</>
            )}
          </p>
          {debouncedSearch && (
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
              &ldquo;{debouncedSearch}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 overflow-hidden">

        {/* ── Desktop/tablet table ── */}
        <div className="hidden sm:flex flex-col">
          {/* thead — always visible */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50">
                  <th className="px-4 md:px-6 py-3.5 text-left text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[38%]">
                    Target
                  </th>
                  <th className="px-4 md:px-6 py-3.5 text-left text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[26%]">
                    Project
                  </th>
                  <th className="px-4 md:px-6 py-3.5 text-left text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[16%]">
                    Type
                  </th>
                  <th className="px-4 md:px-6 py-3.5 text-left text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-[16%]">
                    Last Scan
                  </th>
                  <th className="px-4 md:px-6 py-3.5 w-[4%]" />
                </tr>
              </thead>
            </table>
          </div>

          {/* Fixed-height tbody — always sized for pageSize rows */}
          <div
            className="overflow-x-auto border-b border-slate-100 dark:border-slate-800"
            style={{ height: TBODY_H }}
          >
            {filteredTargets.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 py-6">
                  <Search size={24} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No targets match the current filters
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[640px]">
                <tbody>
                  {/* Real rows */}
                  {paginatedTargets.map((target, index) => (
                    <motion.tr
                      key={target.target_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.025 }}
                      onClick={() => onRowClick?.(target.target_id, target.project_id)}
                      className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      style={{ height: ROW_H }}
                    >
                      {/* Target name */}
                      <td className="px-4 md:px-6 w-[38%]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/40 transition-colors">
                            {getTypeIcon(target.type)}
                          </div>
                          <span className="text-sm lg:text-base font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate max-w-[220px] md:max-w-xs">
                            {target.name}
                          </span>
                        </div>
                      </td>
                      {/* Project */}
                      <td className="px-4 md:px-6 w-[26%]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FolderOpen size={12} className="shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 truncate">
                            {target.project_name}
                          </span>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 md:px-6 w-[16%]">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${getTypePillClass(target.type)}`}>
                          {target.type}
                        </span>
                      </td>
                      {/* Last scan */}
                      <td className="px-4 md:px-6 w-[16%]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs sm:text-sm lg:text-base tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(target.last_scan)}
                          </span>
                        </div>
                      </td>
                      {/* Arrow */}
                      <td className="px-4 md:px-6 w-[4%]">
                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
                      </td>
                    </motion.tr>
                  ))}

                  {/* Ghost rows — keep height stable */}
                  {Array.from({ length: pageSize - paginatedTargets.length }).map((_, i) => (
                    <tr
                      key={`ghost-${i}`}
                      className="border-b border-slate-50 dark:border-slate-800/30"
                      style={{ height: ROW_H }}
                    >
                      <td colSpan={5} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Mobile card list ── */}
        <div
          className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800"
          style={{ minHeight: ROW_H * Math.min(paginatedTargets.length, 3) }}
        >
          {filteredTargets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Search size={22} className="text-slate-300 dark:text-slate-600" />
                <p className="text-xs text-slate-400 dark:text-slate-500">No targets match filters</p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {paginatedTargets.map((target, index) => (
                <motion.div
                  key={target.target_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.025 }}
                  onClick={() => onRowClick?.(target.target_id, target.project_id)}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getTypeIcon(target.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {target.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <FolderOpen size={10} />
                          {target.project_name}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide ${getTypePillClass(target.type)}`}>
                          {target.type}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <Clock size={9} />
                          {formatRelativeTime(target.last_scan)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* ── Pagination ── */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalItems={filteredTargets.length}
        />
      </div>
    </div>
  );
}

// ─── Inline skeleton that matches the new layout ─────────────────────────────

function TargetsTableSkeleton({ pageSize = 10, rowH = 56 }: { pageSize?: number; rowH?: number }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter bar skeleton */}
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4">
        <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 animate-pulse">
          <div className="h-9 sm:h-10 flex-1 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="flex gap-2">
            <div className="h-9 sm:h-10 w-32 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-9 sm:h-10 w-40 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-pulse">
          <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50">
                {["38%", "26%", "16%", "16%", "4%"].map((w, i) => (
                  <th key={i} className="px-4 md:px-6 py-3.5" style={{ width: w }}>
                    {i < 4 && <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: pageSize }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 dark:border-slate-800/50 animate-pulse"
                  style={{ height: rowH }}
                >
                  <td className="px-4 md:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                      <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </td>
                  <td className="px-4 md:px-6"><div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800" /></td>
                  <td className="px-4 md:px-6"><div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" /></td>
                  <td className="px-4 md:px-6"><div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800" /></td>
                  <td className="px-4 md:px-6" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile skeleton */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3.5 py-3">
              <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Custom hook: fetch targets for multiple projects ─────────────────────────

function useTargetQueries(projectIds: string[], pollingInterval = 0) {
  const dispatch = useAppDispatch();
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const projectIdsKey = JSON.stringify(projectIds);

  useEffect(() => {
    const ids: string[] = JSON.parse(projectIdsKey);

    if (ids.length === 0) {
      setTargets([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAll = () => {
      setIsLoading(true);
      setIsError(false);

      Promise.all(
        ids.map((id) =>
          dispatch(
            assetsApi.endpoints.listTargets.initiate(id, { forceRefetch: true }),
          ).unwrap(),
        ),
      )
        .then((results) => {
          if (!cancelled) setTargets(results.flat());
        })
        .catch(() => {
          if (!cancelled) setIsError(true);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    fetchAll();

    if (pollingInterval > 0) {
      const timer = setInterval(fetchAll, pollingInterval);
      return () => { cancelled = true; clearInterval(timer); };
    }

    return () => { cancelled = true; };
  }, [dispatch, projectIdsKey, pollingInterval]);

  return { targets, isLoading, isError };
}
