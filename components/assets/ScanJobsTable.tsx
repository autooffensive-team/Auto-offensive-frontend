"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useListJobsQuery } from "@/lib/redux/services/userdashboard/assets/assets-api";
import ExecutionModeBadge from "@/components/assets/ExecutionModeBadge";
import PaginationControls from "@/components/assets/PaginationControls";
import ScanJobsTableSkeleton from "@/components/assets/ScanJobsTableSkeleton";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

type ScanJobsTableProps = {
  targetId: string;
  targetName: string;
};

const PAGE_SIZE = 20;

/**
 * Formats a duration between two timestamps.
 * Returns "In Progress" for running/pending jobs.
 * Returns "—" if timestamps are unavailable.
 */
export function formatDuration(
  status: string,
  createdAt: string | null | undefined,
  finishedAt: string | null | undefined
): string {
  if (status === "running" || status === "pending") {
    return "In Progress";
  }
  if (!createdAt || !finishedAt) {
    return "—";
  }
  const ms =
    new Date(finishedAt).getTime() - new Date(createdAt).getTime();
  if (ms < 0) return "—";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "failed":
      return "text-red-600 dark:text-red-400";
    case "running":
      return "text-blue-600 dark:text-blue-400";
    case "pending":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-slate-600 dark:text-slate-400";
  }
}

export default function ScanJobsTable({
  targetId,
  targetName,
}: ScanJobsTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const offset = (currentPage - 1) * PAGE_SIZE;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useListJobsQuery({
    target_name: targetName,
    limit: PAGE_SIZE,
    offset,
  });

  const jobs = data?.jobs ?? [];
  const totalCount = data?.total_count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (isLoading) {
    return <ScanJobsTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-[#FCFCFA] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
          Failed to load scan jobs
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (jobs.length === 0 && !isFetching) {
    return (
      <div className="bg-[#FCFCFA] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <Inbox className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">
          No scan jobs have been run against this target
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFCFA] dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Desktop/tablet table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Finished
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Tools
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job, index) => (
              <motion.tr
                key={job.job_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() =>
                  router.push(
                    `/userdashboard/assets/${targetId}/jobs/${job.job_id}`
                  )
                }
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                  <span
                    className={`text-xs sm:text-sm font-semibold capitalize ${getStatusColor(job.status)}`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                  <ExecutionModeBadge
                    mode={
                      job.execution_mode as
                        | "web"
                        | "cicd"
                        | "cli"
                        | "unknown"
                    }
                  />
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {formatDateTime(job.created_at)}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                  {job.status === "running" || job.status === "pending"
                    ? "—"
                    : formatDateTime(job.finished_at)}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {formatDuration(job.status, job.created_at, job.finished_at)}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 hidden lg:table-cell">
                  {job.tools_used ? (
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {job.tools_used}
                    </span>
                  ) : job.tool_name ? (
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {job.tool_name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {jobs.map((job, index) => (
          <motion.div
            key={job.job_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() =>
              router.push(
                `/userdashboard/assets/${targetId}/jobs/${job.job_id}`
              )
            }
            className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-sm font-semibold capitalize ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              <ExecutionModeBadge
                mode={job.execution_mode as "web" | "cicd" | "cli" | "unknown"}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{formatDateTime(job.created_at)}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatDuration(job.status, job.created_at, job.finished_at)}</span>
              {(job.tools_used || job.tool_name) && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {job.tools_used || job.tool_name}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        totalItems={totalCount}
      />
    </div>
  );
}
