"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, FileX2 } from "lucide-react";
import {
  useGetJobDetailsQuery,
  useGetJobParsedDataQuery,
} from "@/lib/redux/services/userdashboard/assets/assets-api";
import type { ParsedStepData } from "@/types/assets";
import PaginationControls from "./PaginationControls";
import ScanResultsViewSkeleton from "./ScanResultsViewSkeleton";
import GenerateReportButton from "@/components/report/GenerateReportButton";

type ScanResultsViewProps = {
  jobId: string;
};

/**
 * Formats a cell value for display.
 * If the value is a number that is effectively an integer (e.g. 500.000000),
 * display it without decimals.
 */
function formatCellValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : Math.round(value) === value ? value.toFixed(0) : value.toString();
  }
  // Handle string values that look like decimal integers (e.g. "500.000000")
  if (typeof value === "string") {
    const num = Number(value);
    if (!isNaN(num) && value.includes(".") && Number.isInteger(num)) {
      return num.toFixed(0);
    }
  }
  const str = String(value);
  return str || "—";
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function StepSection({ step }: { step: ParsedStepData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sort columns so that any column starting with "_extra" is always last
  const sortedColumns = [...step.columns].sort((a, b) => {
    const aIsExtra = a.startsWith("_extra");
    const bIsExtra = b.startsWith("_extra");
    if (aIsExtra && !bIsExtra) return 1;
    if (!aIsExtra && bIsExtra) return -1;
    return 0;
  });

  const hasData = sortedColumns.length > 0 && step.rows.length > 0;
  const totalPages = hasData ? Math.ceil(step.rows.length / pageSize) : 0;

  const paginatedRows = hasData
    ? step.rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Step header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          Step {step.step_order} — {step.tool_name}
        </h3>
      </div>

      {!hasData ? (
        <div className="px-4 py-10 flex flex-col items-center justify-center gap-2">
          <FileX2 size={28} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No results available
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {sortedColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedRows.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {sortedColumns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xs truncate"
                        title={String(row[col] ?? "")}
                      >
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalItems={step.rows.length}
          />
        </>
      )}
    </div>
  );
}

export default function ScanResultsView({ jobId }: ScanResultsViewProps) {
  const {
    data: jobDetails,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    refetch: refetchDetails,
  } = useGetJobDetailsQuery(jobId);

  const {
    data: parsedData,
    isLoading: isLoadingParsed,
    isError: isErrorParsed,
    refetch: refetchParsed,
  } = useGetJobParsedDataQuery(jobId);

  const isLoading = isLoadingDetails || isLoadingParsed;
  const isError = isErrorDetails || isErrorParsed;

  if (isLoading) {
    return <ScanResultsViewSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 p-6 flex flex-col items-center gap-3">
        <AlertCircle size={28} className="text-red-500" />
        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
          Failed to load scan results. Please try again.
        </p>
        <button
          onClick={() => {
            refetchDetails();
            refetchParsed();
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const sortedSteps = [...(parsedData?.steps ?? [])].sort(
    (a, b) => b.step_order - a.step_order
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header metadata */}
      {jobDetails && (
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Status:{" "}
              <span className="ml-1 capitalize">{jobDetails.status}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Target:{" "}
              <span className="ml-1">{jobDetails.target_name}</span>
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-xs sm:text-sm font-medium text-teal-700 dark:text-teal-300">
              Findings:{" "}
              <span className="ml-1">{jobDetails.total_findings}</span>
            </span>
            {jobDetails.execution_mode && jobDetails.execution_mode !== "unknown" && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Mode:{" "}
                <span className="ml-1 capitalize">{jobDetails.execution_mode}</span>
              </span>
            )}
            {jobDetails.finished_at && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Finished:{" "}
                <span className="ml-1">
                  {new Date(jobDetails.finished_at).toLocaleString()}
                </span>
              </span>
            )}
            {jobDetails.started_at && jobDetails.finished_at && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration:{" "}
                <span className="ml-1">
                  {formatDuration(
                    new Date(jobDetails.started_at),
                    new Date(jobDetails.finished_at),
                  )}
                </span>
              </span>
            )}
            {jobDetails.steps.length > 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Tools:{" "}
                <span className="ml-1">
                  {[...new Set(jobDetails.steps.map((s) => s.tool_name))].join(", ")}
                </span>
              </span>
            )}
          </div>
          {parsedData && (
            <GenerateReportButton
              jobId={jobId}
              steps={jobDetails.steps}
              parsedSteps={parsedData.steps}
            />
          )}
        </div>
      )}

      {/* Step sections */}
      {sortedSteps.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-2">
          <FileX2 size={28} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No parsed results available for this job.
          </p>
        </div>
      ) : (
        sortedSteps.map((step) => (
          <StepSection key={step.step_id} step={step} />
        ))
      )}
    </motion.div>
  );
}
