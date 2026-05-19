"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useGetProjectsQuery } from "@/lib/redux/services/userdashboard/project/project-api";
import {
  useListJobsQuery,
  assetsApi,
} from "@/lib/redux/services/userdashboard/assets/assets-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import type { Target, TargetWithMeta, JobSummary } from "@/types/assets";
import StatusBadge from "./StatusBadge";
import TargetsTableSkeleton from "./TargetsTableSkeleton";
import PaginationControls from "./PaginationControls";

// --- Utility functions ---

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

// --- Component ---

export type TargetsTableProps = {
  onRowClick?: (targetId: string, projectId: string) => void;
};

export default function TargetsTable({
  onRowClick,
}: TargetsTableProps) {
  // Internal state for search, filters, and pagination
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset pagination to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, filterProject]);

  // Fetch projects
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery(undefined, { pollingInterval: 30000 });

  // Fetch targets for each project
  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p.project_id),
    [projects],
  );

  // Fetch targets for each project
  const targetQueries = useTargetQueries(projectIds);

  // Fetch all jobs to compute status and last scan
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useListJobsQuery({ limit: 100 });

  // Determine loading/error states
  const isLoading =
    projectsLoading || targetQueries.isLoading || jobsLoading;
  const isError = projectsError || targetQueries.isError || jobsError;

  // Merge data into TargetWithMeta[]
  const allTargets: TargetWithMeta[] = useMemo(() => {
    if (!projects || !jobsData) return [];

    const jobs = jobsData.jobs ?? [];
    const projectMap = new Map(projects.map((p) => [p.project_id, p.name]));

    return targetQueries.targets.map((target) => {
      const targetJobs = jobs.filter((j) => j.target_name === target.name);
      const status = computeTargetStatus(targetJobs);

      // Find most recent job for last_scan
      const mostRecentJob = targetJobs.reduce<JobSummary | null>(
        (latest, job) => {
          if (
            !latest ||
            new Date(job.created_at).getTime() >
            new Date(latest.created_at).getTime()
          ) {
            return job;
          }
          return latest;
        },
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

  // Compute distinct target types for the type filter dropdown
  const distinctTypes = useMemo(() => {
    const types = new Set(allTargets.map((t) => t.type));
    return Array.from(types).sort();
  }, [allTargets]);



  // Sort targets by last_scan descending (most recent first, nulls at the bottom)
  const sortedTargets = useMemo(() => {
    return [...allTargets].sort((a, b) => {
      if (!a.last_scan && !b.last_scan) return 0;
      if (!a.last_scan) return 1;
      if (!b.last_scan) return -1;
      return new Date(b.last_scan).getTime() - new Date(a.last_scan).getTime();
    });
  }, [allTargets]);

  // Apply filters
  const filteredTargets = useMemo(() => {
    return sortedTargets.filter((target) => {
      const matchesSearch =
        !debouncedSearch ||
        target.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType =
        filterType === "all" || target.type === filterType;
      const matchesProject =
        filterProject === "all" || target.project_id === filterProject;
      return matchesSearch && matchesType && matchesProject;
    });
  }, [sortedTargets, debouncedSearch, filterType, filterProject]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / pageSize));

  // Paginate
  const paginatedTargets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTargets.slice(start, start + pageSize);
  }, [filteredTargets, currentPage, pageSize]);

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return <TargetsTableSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <p className="text-sm sm:text-base text-red-500 dark:text-red-400 font-medium mb-4">
          Failed to load target data. Please try again.
        </p>
        <button
          onClick={() => {
            refetchProjects();
            refetchJobs();
          }}
          className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (allTargets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
          No targets available. Add targets to your projects to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search targets by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={200}
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              aria-label="Search targets"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <Filter size={15} />
              <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Filters</span>
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-slate-600 min-w-[130px]"
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                {distinctTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Project filter */}
            <div className="relative">
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-slate-600 min-w-[160px]"
                aria-label="Filter by project"
              >
                <option value="all">All Projects</option>
                {(projects ?? []).map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Active filter indicator */}
            {(filterType !== "all" || filterProject !== "all") && (
              <button
                type="button"
                onClick={() => { setFilterType("all"); setFilterProject("all"); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-teal-200 dark:border-teal-500/20 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {filteredTargets.length === allTargets.length
              ? <><span className="font-semibold text-slate-700 dark:text-slate-300">{allTargets.length}</span> targets</>
              : <><span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTargets.length}</span> of {allTargets.length} targets</>
            }
          </p>
          {debouncedSearch && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Searching: &ldquo;{debouncedSearch}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Table — desktop/tablet */}
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Last Scan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTargets.map((target, index) => (
                <motion.tr
                  key={target.target_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onRowClick?.(target.target_id, target.project_id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {target.name}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-sm text-slate-600 dark:text-slate-400">
                    {target.project_name}
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {target.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                    <StatusBadge status={target.status} />
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-sm text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(target.last_scan)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedTargets.map((target, index) => (
            <motion.div
              key={target.target_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onRowClick?.(target.target_id, target.project_id)}
              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {target.name}
                </span>
                <StatusBadge status={target.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{target.project_name}</span>
                <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {target.type}
                </span>
                <span>{formatRelativeTime(target.last_scan)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No results after filtering */}
        {filteredTargets.length === 0 && allTargets.length > 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              No targets match the current filters.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
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

// --- Custom hook to fetch targets for multiple projects ---
// Uses RTK Query's dispatch-based approach to avoid hook-in-loop violations.

function useTargetQueries(projectIds: string[], pollingInterval = 0) {
  const dispatch = useAppDispatch();
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Serialize projectIds to avoid infinite re-render from array reference changes
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
          dispatch(assetsApi.endpoints.listTargets.initiate(id, { forceRefetch: true })).unwrap(),
        ),
      )
        .then((results) => {
          if (!cancelled) {
            setTargets(results.flat());
          }
        })
        .catch(() => {
          if (!cancelled) {
            setIsError(true);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    };

    fetchAll();

    if (pollingInterval > 0) {
      const timer = setInterval(fetchAll, pollingInterval);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [dispatch, projectIdsKey, pollingInterval]);

  return { targets, isLoading, isError };
}
