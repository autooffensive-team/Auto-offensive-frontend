"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, FileX2, Search, Loader2 } from "lucide-react";
import {
  useGetJobDetailsQuery,
  useGetJobParsedDataQuery,
  useGetStepParsedDataQuery,
} from "@/lib/redux/services/userdashboard/assets/assets-api";
import type { StepSummary, StepParsedDataResponse } from "@/types/assets";
import PaginationControls from "./PaginationControls";
import ScanResultsViewSkeleton from "./ScanResultsViewSkeleton";
import GenerateReportButton from "@/components/report/GenerateReportButton";

type ScanResultsViewProps = {
  jobId: string;
  hideReportButton?: boolean;
};

/**
 * Formats a column key into a human-readable label.
 * Checks discovered_columns map first, then applies title-case conversion.
 * Examples: "status_code" → "Status Code", "_extra" → "Extra Fields",
 *           "host" → "Host", "content_type" → "Content Type"
 */
function formatColumnLabel(key: string, discoveredColumns?: Record<string, string>): string {
  // Use server-provided label if available
  if (discoveredColumns?.[key]) {
    return discoveredColumns[key];
  }
  // Strip leading underscore and convert to title case
  const cleaned = key.startsWith("_") ? key.slice(1) : key;
  if (cleaned === "extra") return "Extra Fields";
  return cleaned
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Server-driven section for a single scan step. Each instance maintains its own
 * pagination/search state and fetches only the current page from the server via
 * `useGetStepParsedDataQuery`, so independent steps never affect one another.
 */
function StepSection({ step }: { step: StepSummary }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search by 300ms; reset to page 1 whenever a new value settles.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isFetching, isError, refetch } = useGetStepParsedDataQuery({
    stepId: step.step_id,
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
  });

  // RTK Query drops `data` when the cache key changes (new page/size/search), so
  // retain the last successful response to keep the table + controls mounted with
  // their current values while the next page is loading.
  const lastDataRef = useRef<StepParsedDataResponse | undefined>(undefined);
  if (data) {
    lastDataRef.current = data;
  }
  const effectiveData = data ?? lastDataRef.current;

  // Sort columns so that any column starting with "_extra" is always last.
  const sortedColumns = useMemo(() => {
    const columns = effectiveData?.columns ?? [];
    return [...columns].sort((a, b) => {
      const aIsExtra = a.startsWith("_extra");
      const bIsExtra = b.startsWith("_extra");
      if (aIsExtra && !bIsExtra) return 1;
      if (!aIsExtra && bIsExtra) return -1;
      return 0;
    });
  }, [effectiveData?.columns]);

  const allRows = effectiveData?.rows ?? [];
  // Detect whether the server actually paginated: if total_rows is present in
  // the response, the server handled pagination; otherwise the server returned
  // the full dataset and we paginate/filter client-side.
  const serverPaginated = effectiveData?.total_rows != null;

  // Client-side search filter (only when server doesn't handle it).
  const filteredRows = useMemo(() => {
    if (serverPaginated || !debouncedSearch) return allRows;
    const needle = debouncedSearch.toLowerCase();
    return allRows.filter((row) =>
      Object.values(row).some(
        (val) => val != null && String(val).toLowerCase().includes(needle),
      ),
    );
  }, [allRows, debouncedSearch, serverPaginated]);

  const totalRows = serverPaginated ? effectiveData.total_rows : filteredRows.length;
  const totalPages = serverPaginated
    ? (effectiveData?.total_pages ?? Math.ceil(totalRows / pageSize))
    : (totalRows > 0 ? Math.ceil(totalRows / pageSize) : 0);

  // When server-paginated, rows are already the correct page slice. When
  // client-side, slice the filtered dataset ourselves.
  const rows = serverPaginated
    ? allRows
    : filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // The step has no data at all only when there is no active search, the settled
  // count is 0, and we are not currently fetching.
  const noResultsAtAll = !debouncedSearch && totalRows === 0 && allRows.length === 0 && !isFetching;
  const noSearchMatches = !!debouncedSearch && totalRows === 0 && allRows.length === 0 && !isFetching;
  const showSearchUI = !noResultsAtAll;

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
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white shrink-0">
          Step {step.step_order} — {step.tool_name}
        </h3>
        {showSearchUI && (
          <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={200}
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
                aria-label={`Search results for step ${step.step_order}`}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              {totalRows} {totalRows === 1 ? "row" : "rows"}
            </span>
          </div>
        )}
      </div>

      {isError ? (
        <div className="px-4 py-10 flex flex-col items-center justify-center gap-3">
          <AlertCircle size={28} className="text-red-500" />
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
            Failed to load results. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      ) : noResultsAtAll ? (
        <div className="px-4 py-10 flex flex-col items-center justify-center gap-2">
          <FileX2 size={28} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No results available
          </p>
        </div>
      ) : noSearchMatches ? (
        <div className="px-4 py-10 flex flex-col items-center justify-center gap-2">
          <Search size={28} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            No rows match &ldquo;{debouncedSearch}&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div
            className={`relative overflow-x-auto ${rows.length === 0 ? "min-h-40" : ""}`}
          >
            {isFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                <Loader2 size={28} className="animate-spin text-teal-500" />
              </div>
            )}
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {sortedColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      {formatColumnLabel(col, effectiveData?.discovered_columns)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.map((row, rowIndex) => (
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
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalItems={totalRows}
          />
        </>
      )}
    </div>
  );
}

export default function ScanResultsView({ jobId, hideReportButton }: ScanResultsViewProps) {
  const {
    data: jobDetails,
    isLoading,
    isError,
    refetch,
  } = useGetJobDetailsQuery(jobId);

  // Only fetch the full parsed dataset for the (optional) in-view report button.
  // The per-step tables are server-paginated and do not rely on this query.
  const { data: parsedData } = useGetJobParsedDataQuery(jobId, {
    skip: hideReportButton,
  });

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
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const sortedSteps = [...(jobDetails?.steps ?? [])].sort(
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
        <div className="space-y-3">
          {/* Top row: Generate Report button aligned right */}
          {!hideReportButton && parsedData && (
            <div className="flex justify-end">
              <GenerateReportButton
                jobId={jobId}
                steps={jobDetails.steps}
                parsedSteps={parsedData.steps}
              />
            </div>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
