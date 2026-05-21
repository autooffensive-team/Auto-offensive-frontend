"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Calendar,
  Search,
  Trash2,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  File,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useListReportsQuery,
  useDeleteReportMutation,
  useDownloadStoredReportMutation,
} from "@/lib/redux/services/userdashboard/assets/reports-api";
import type { ReportMetaResponse } from "@/types/reports";

type ReportFormatFilter = "all" | "json" | "docx" | "xlsx" | "pdf";

const formatTabs: {
  id: ReportFormatFilter;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
    { id: "all", label: "All", icon: FileText },
    { id: "json", label: "JSON", icon: FileJson },
    { id: "docx", label: "DOCX", icon: FilePlus },
    { id: "xlsx", label: "Excel", icon: FileSpreadsheet },
    { id: "pdf", label: "PDF", icon: File },
  ];

const formatColors: Record<string, string> = {
  json: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  docx: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  xlsx: "bg-green-500/10 text-green-600 dark:text-green-400",
  pdf: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Confirm Delete Dialog ────────────────────────────────────────────────────
interface ConfirmDeleteDialogProps {
  report: ReportMetaResponse;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeleteDialog({
  report,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Title */}
        <h2
          id="delete-dialog-title"
          className="text-[18px] font-bold text-gray-900 dark:text-white text-center mb-2"
        >
          Delete Report
        </h2>

        {/* Body */}
        <p className="text-[14px] text-gray-500 dark:text-gray-400 text-center mb-1">
          Are you sure you want to delete this report?
        </p>
        <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 text-center truncate px-2 mb-3">
          {report.file_name}
        </p>
        <p className="text-[13px] text-red-500 text-center mb-6">
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[14px] font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 20;

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ReportFormatFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ReportMetaResponse | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useListReportsQuery({
    page: 1,
    page_size: 100,
  });

  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();
  const [downloadReport, { isLoading: isDownloading }] = useDownloadStoredReportMutation();

  const allReports: ReportMetaResponse[] = data?.reports ?? [];

  const filteredReports = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allReports.filter((r) => {
      const matchesSearch =
        r.file_name.toLowerCase().includes(q) ||
        r.job_id.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q);
      const matchesTab = activeTab === "all" || r.format === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [allReports, searchTerm, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleTabChange = (tab: ReportFormatFilter) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDownload = async (report: ReportMetaResponse) => {
    try {
      await downloadReport({ reportId: report.report_id, fileName: report.file_name }).unwrap();
      toast.success("Download started");
    } catch {
      toast.error("Failed to download report");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    try {
      await deleteReport(pendingDelete.report_id).unwrap();
      toast.success("Report deleted");
      setPendingDelete(null);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to delete report");
    }
  };

  const formatCounts = {
    all: allReports.length,
    json: allReports.filter((r) => r.format === "json").length,
    docx: allReports.filter((r) => r.format === "docx").length,
    xlsx: allReports.filter((r) => r.format === "xlsx").length,
    pdf: allReports.filter((r) => r.format === "pdf").length,
  };

  return (
    <>
      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {pendingDelete && (
          <ConfirmDeleteDialog
            report={pendingDelete}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setPendingDelete(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
              Generate and download security scan reports in multiple formats
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-[15px] font-semibold rounded-xl transition shadow-lg shadow-teal-500/20 shrink-0 disabled:opacity-60"
          >
            {isFetching ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <FileText size={22} className="text-teal-500" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-gray-900 dark:text-white">
                  {isLoading ? "—" : allReports.length}
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">Total Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <File size={22} className="text-red-500" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-red-500">{isLoading ? "—" : formatCounts.pdf}</p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">PDF</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FilePlus size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-blue-500">{isLoading ? "—" : formatCounts.docx}</p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">DOCX</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-green-500" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-green-500">{isLoading ? "—" : formatCounts.xlsx}</p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">Excel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Format Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {formatTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium transition whitespace-nowrap ${activeTab === tab.id
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[12px] ${activeTab === tab.id ? "bg-teal-500/20" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                >
                  {formatCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by file name or job ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3.5 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Loading */}
          {isLoading && (
            <div className="p-14 text-center">
              <Loader2 size={40} className="mx-auto text-teal-500 animate-spin mb-4" />
              <p className="text-[15px] text-gray-500 dark:text-gray-400">Loading reports…</p>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="p-14 text-center">
              <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
              <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-4">Failed to load reports</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl text-[14px] font-medium hover:bg-teal-600 transition"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Report Name</th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Format</th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Job ID</th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Generated</th>
                    <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Size</th>
                    <th className="px-6 py-4 text-right text-[15px] font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedReports.map((report, index) => (
                    <motion.tr
                      key={report.report_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <FileText size={20} className="text-teal-500" />
                          </div>
                          <p className="text-[15px] font-semibold text-gray-900 dark:text-white max-w-[260px] truncate">
                            {report.file_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium uppercase ${formatColors[report.format] ?? "bg-gray-500/10 text-gray-500"}`}>
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-mono text-gray-500 dark:text-gray-400">
                          {report.job_id.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          {formatDate(report.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-600 dark:text-gray-400">
                        {formatBytes(report.size_bytes)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Download */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(report)}
                            disabled={isDownloading}
                            title="Download"
                            className="p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50"
                          >
                            {isDownloading ? (
                              <Loader2 size={16} className="text-teal-500 animate-spin" />
                            ) : (
                              <Download size={16} className="text-teal-500" />
                            )}
                          </motion.button>

                          {/* Delete — opens confirm dialog */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPendingDelete(report)}
                            disabled={isDeleting}
                            title="Delete"
                            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[14px] text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of{" "}
                {filteredReports.length} reports
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronsLeft size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl text-[14px] font-medium transition ${currentPage === page
                        ? "bg-teal-500 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronsRight size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filteredReports.length === 0 && (
            <div className="p-14 text-center">
              <FileText size={56} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-[16px] text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No reports match your search"
                  : "No reports yet — generate one from a scan job"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
