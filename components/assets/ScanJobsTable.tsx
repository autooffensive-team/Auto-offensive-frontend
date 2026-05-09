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
      return "text-gray-600 dark:text-gray-400";
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <Inbox className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          No scan jobs have been run against this target
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Execution Mode
              </th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Finished At
              </th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                Tools Used
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
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
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`text-[14px] font-medium capitalize ${getStatusColor(job.status)}`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 text-[14px] text-gray-600 dark:text-gray-400 font-medium">
                  {formatDateTime(job.created_at)}
                </td>
                <td className="px-4 py-3 text-[14px] text-gray-600 dark:text-gray-400 font-medium">
                  {job.status === "running" || job.status === "pending"
                    ? "—"
                    : formatDateTime(null)}
                </td>
                <td className="px-4 py-3 text-[14px] text-gray-600 dark:text-gray-400 font-medium">
                  {formatDuration(job.status, job.created_at, null)}
                </td>
                <td className="px-4 py-3">
                  {job.tool_name ? (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
                      {job.tool_name}
                    </span>
                  ) : (
                    <span className="text-[14px] text-gray-400">—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
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
