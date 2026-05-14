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

  // Fetch targets for each project, re-fetching every 10s for real-time updates
  const targetQueries = useTargetQueries(projectIds, 10000);

  // Fetch all jobs to compute status and last scan
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useListJobsQuery({ limit: 100 }, { pollingInterval: 10000 });

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

  // Apply filters
  const filteredTargets = useMemo(() => {
    return allTargets.filter((target) => {
      const matchesSearch =
        !debouncedSearch ||
        target.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType =
        filterType === "all" || target.type === filterType;
      const matchesProject =
        filterProject === "all" || target.project_id === filterProject;
      return matchesSearch && matchesType && matchesProject;
    });
  }, [allTargets, debouncedSearch, filterType, filterProject]);

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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <p className="text-[16px] text-red-500 dark:text-red-400 font-medium mb-4">
          Failed to load target data. Please try again.
        </p>
        <button
          onClick={() => {
            refetchProjects();
            refetchJobs();
          }}
          className="px-5 py-2.5 text-[14px] font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (allTargets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium">
          No targets available. Add targets to your projects to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search targets by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            maxLength={200}
            className="w-full pl-14 pr-5 py-3 text-[16px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            aria-label="Search targets"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-5 py-3 text-[16px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-40 shadow-sm"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            {distinctTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-5 py-3 text-[16px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-48 shadow-sm"
            aria-label="Filter by project"
          >
            <option value="all">All Projects</option>
            {(projects ?? []).map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                  Last Scan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedTargets.map((target, index) => (
                <motion.tr
                  key={target.target_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onRowClick?.(target.target_id, target.project_id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-[16px] font-semibold text-gray-900 dark:text-white">
                      {target.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[16px] text-gray-600 dark:text-gray-400 font-medium">
                    {target.project_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[14px] text-gray-600 dark:text-gray-400 font-medium">
                      {target.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={target.status} />
                  </td>
                  <td className="px-4 py-3 text-[16px] text-gray-500 dark:text-gray-400 font-medium">
                    {formatRelativeTime(target.last_scan)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results after filtering */}
        {filteredTargets.length === 0 && allTargets.length > 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium">
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
