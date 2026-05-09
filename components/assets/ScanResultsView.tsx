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

type ScanResultsViewProps = {
  jobId: string;
};

function StepSection({ step }: { step: ParsedStepData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasData = step.columns.length > 0 && step.rows.length > 0;
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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Step header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white">
          Step {step.step_order} — {step.tool_name}
        </h3>
      </div>

      {!hasData ? (
        <div className="px-4 py-10 flex flex-col items-center justify-center gap-2">
          <FileX2 size={28} className="text-gray-400 dark:text-gray-500" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
            No results available
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {step.columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[14px] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {paginatedRows.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {step.columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 text-[14px] text-gray-600 dark:text-gray-400 font-medium max-w-xs truncate"
                        title={String(row[col] ?? "")}
                      >
                        {String(row[col] ?? "—")}
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 p-6 flex flex-col items-center gap-3">
        <AlertCircle size={28} className="text-red-500" />
        <p className="text-[14px] text-red-600 dark:text-red-400 font-medium">
          Failed to load scan results. Please try again.
        </p>
        <button
          onClick={() => {
            refetchDetails();
            refetchParsed();
          }}
          className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const sortedSteps = [...(parsedData?.steps ?? [])].sort(
    (a, b) => a.step_order - b.step_order
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[14px] font-medium text-gray-700 dark:text-gray-300">
            Status:{" "}
            <span className="ml-1 capitalize">{jobDetails.status}</span>
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[14px] font-medium text-gray-700 dark:text-gray-300">
            Target:{" "}
            <span className="ml-1">{jobDetails.target_name}</span>
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-[14px] font-medium text-teal-700 dark:text-teal-300">
            Findings:{" "}
            <span className="ml-1">{jobDetails.total_findings}</span>
          </span>
        </div>
      )}

      {/* Step sections */}
      {sortedSteps.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center gap-2">
          <FileX2 size={28} className="text-gray-400 dark:text-gray-500" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
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
