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
        className="relative w-full max-w-md bg-[#FCFCFA] dark:bg-gray-900 rounded-2xl border border-[#005F5F]/50 dark:border-gray-800 shadow-2xl p-5 sm:p-6"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Title */}
        <h2
          id="delete-dialog-title"
          className="text-[16px] sm:text-[18px] font-bold text-gray-900 dark:text-white text-center mb-2"
        >
          Delete Report
        </h2>

        {/* Body */}
        <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 text-center mb-1">
          Are you sure you want to delete this report?
        </p>
        <p className="text-[12px] sm:text-[13px] font-medium text-gray-700 dark:text-gray-300 text-center truncate px-2 mb-3">
          {report.file_name}
        </p>
        <p className="text-[12px] sm:text-[13px] text-red-500 text-center mb-6">
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[13px] sm:text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] sm:text-[14px] font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
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

// ── Mobile/Tablet Report Card ────────────────────────────────────────────────
interface ReportCardProps {
  report: ReportMetaResponse;
  isDownloading: boolean;
  isDeleting: boolean;
  onDownload: () => void;
  onDelete: () => void;
  index: number;
}

function ReportCard({
  report,
  isDownloading,
  isDeleting,
  onDownload,
  onDelete,
  index,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative p-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0 bg-[#FCFCFA] dark:bg-gray-900 transition-all"
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        outline: "1px solid rgba(0,95,95,0.5)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 50%) top left / 26px 26px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 50%) bottom right / 26px 26px no-repeat
          `,
          opacity: 0.5,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />
      {/* Left: icon + info */}
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-teal-500/10 flex items-center justify-center mt-0.5">
          <FileText size={18} className="text-teal-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {report.file_name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase ${
                formatColors[report.format] ?? "bg-gray-500/10 text-gray-500"
              }`}
            >
              {report.format}
            </span>
            <span className="text-[12px] font-mono text-gray-400 dark:text-gray-500">
              {report.job_id.slice(0, 8)}…
            </span>
            <span className="text-[12px] text-gray-400 dark:text-gray-500">
              {formatBytes(report.size_bytes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-gray-400 dark:text-gray-500">
            <Calendar size={12} />
            {formatDate(report.created_at)}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDownload}
          disabled={isDownloading}
          title="Download"
          className="p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 size={16} className="text-teal-500 animate-spin" />
          ) : (
            <Download size={16} className="text-teal-500" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          <Trash2 size={16} className="text-red-400" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;
const ROW_H = 56; // px — matches py-4 rows (16+24+16)
const VISIBLE_ROWS = 10;
const TBODY_H = ROW_H * VISIBLE_ROWS; // 560px

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ReportFormatFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ReportMetaResponse | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching, isError, refetch } = useListReportsQuery({
    page: 1,
    page_size: 100,
  });

  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();
  const [downloadReport] = useDownloadStoredReportMutation();

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
    if (downloadingIds.has(report.report_id)) return;
    setDownloadingIds((prev) => new Set(prev).add(report.report_id));
    try {
      await downloadReport({ reportId: report.report_id, fileName: report.file_name }).unwrap();
      toast.success("Download started");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(report.report_id);
        return next;
      });
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

  // Compute visible page numbers for compact pagination on mobile
  const visiblePages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

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

      <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Reports
            </h1>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
              Generate and download security scan reports in multiple formats
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black text-[13px] sm:text-[14px] md:text-[15px] font-semibold shadow-sm transition-colors hover:bg-primary/80 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <motion.span
              animate={isFetching ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isFetching
                  ? { duration: 0.8, ease: "linear", repeat: Infinity }
                  : { duration: 0.2 }
              }
            >
              <RefreshCw size={16} className="sm:w-4.5 sm:h-4.5" />
            </motion.span>
            Refresh
          </motion.button>
        </div>

        {/* ── Summary Stats ── */}
        {/*
          Layout strategy:
          • Mobile  (<sm) : Total full-width on row 1, then 2×2 grid for the 4 format cards
          • Tablet  (sm–lg): 3-col row 1 (Total + PDF + DOCX), 2-col row 2 (Excel + JSON)  → achieved via sm:col-span-1 on all, Total gets col-span-1 at sm
          • Desktop (lg+)  : single 5-col row, all col-span-1
          We use a 2-col base grid, bump to 4-col at sm so Total can span 4 (full) at mobile
          but only 1-of-3 at sm via a nested approach.
        *)
        */}

        {/* Mobile-only layout: Total full-width + 2×2 grid */}
        <div className="lg:hidden space-y-2 sm:space-y-3">
          {/* Row 1 — Total (full width on mobile, part of 3-col on sm/md) */}
          <div className="sm:hidden">
            {/* Total — full width on mobile */}
            <div
              className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 w-full border border-[#005F5F]/60"
              style={{
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                outline: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
            >
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#14b8a6", opacity: 0.1 }}>
                <FileText size={72} strokeWidth={1.5} />
              </div>
              <div className="relative z-10 flex items-center gap-5">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Reports</p>
                  <p className="mt-1 text-4xl font-bold text-gray-900 dark:text-white leading-none">
                    {isLoading ? "—" : allReports.length}
                  </p>
                  <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">All formats combined</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile 2×2 format cards */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {/* PDF */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-3 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-18 h-18" style={{ color: "#ef4444", opacity: 0.12 }}><File className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PDF</p>
                <p className="mt-1 text-2xl font-bold text-red-500">{isLoading ? "—" : formatCounts.pdf}</p>
                <p className="mt-0.5 text-[9px] text-gray-400 dark:text-gray-500 pr-5">Portable document</p>
              </div>
            </div>
            {/* DOCX */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-3 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-18 h-18" style={{ color: "#3b82f6", opacity: 0.12 }}><FilePlus className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DOCX</p>
                <p className="mt-1 text-2xl font-bold text-blue-500">{isLoading ? "—" : formatCounts.docx}</p>
                <p className="mt-0.5 text-[9px] text-gray-400 dark:text-gray-500 pr-5">Word document</p>
              </div>
            </div>
            {/* Excel */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-3 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-18 h-18" style={{ color: "#22c55e", opacity: 0.12 }}><FileSpreadsheet className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Excel</p>
                <p className="mt-1 text-2xl font-bold text-green-500">{isLoading ? "—" : formatCounts.xlsx}</p>
                <p className="mt-0.5 text-[9px] text-gray-400 dark:text-gray-500 pr-5">Spreadsheet</p>
              </div>
            </div>
            {/* JSON */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-3 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-18 h-18" style={{ color: "#f59e0b", opacity: 0.12 }}><FileJson className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">JSON</p>
                <p className="mt-1 text-2xl font-bold text-amber-500">{isLoading ? "—" : formatCounts.json}</p>
                <p className="mt-0.5 text-[9px] text-gray-400 dark:text-gray-500 pr-5">Machine-readable</p>
              </div>
            </div>
          </div>

          {/* Tablet (sm–lg): 3-col first row, 2-col second row */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {/* Total */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 md:p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-25 h-25 md:w-30 md:h-30" style={{ color: "#14b8a6", opacity: 0.12 }}><FileText className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Reports</p>
                <p className="mt-1.5 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{isLoading ? "—" : allReports.length}</p>
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 pr-10">All formats combined</p>
              </div>
            </div>
            {/* PDF */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 md:p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-25 h-25 md:w-30 md:h-30" style={{ color: "#ef4444", opacity: 0.12 }}><File className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PDF</p>
                <p className="mt-1.5 text-2xl md:text-3xl font-bold text-red-500">{isLoading ? "—" : formatCounts.pdf}</p>
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 pr-10">Portable document format</p>
              </div>
            </div>
            {/* DOCX */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 md:p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-25 h-25 md:w-30 md:h-30" style={{ color: "#3b82f6", opacity: 0.12 }}><FilePlus className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DOCX</p>
                <p className="mt-1.5 text-2xl md:text-3xl font-bold text-blue-500">{isLoading ? "—" : formatCounts.docx}</p>
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 pr-10">Word document format</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-3">
            {/* Excel */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 md:p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-25 h-25 md:w-30 md:h-30" style={{ color: "#22c55e", opacity: 0.12 }}><FileSpreadsheet className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Excel</p>
                <p className="mt-1.5 text-2xl md:text-3xl font-bold text-green-500">{isLoading ? "—" : formatCounts.xlsx}</p>
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 pr-10">Spreadsheet format</p>
              </div>
            </div>
            {/* JSON */}
            <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-4 md:p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
              <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
                <div className="w-25 h-25 md:w-30 md:h-30" style={{ color: "#f59e0b", opacity: 0.12 }}><FileJson className="w-full h-full" strokeWidth={1.5} /></div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">JSON</p>
                <p className="mt-1.5 text-2xl md:text-3xl font-bold text-amber-500">{isLoading ? "—" : formatCounts.json}</p>
                <p className="mt-1 text-[10px] md:text-xs text-gray-400 dark:text-gray-500 pr-10">Machine-readable format</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop (lg+): original single 5-col row */}
        <div className="hidden lg:grid grid-cols-5 gap-3">
          {/* Total */}
             <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
            <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
              <div className="w-35 h-35" style={{ color: "#14b8a6", opacity: 0.12 }}><FileText className="w-full h-full" strokeWidth={1.5} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Reports</p>
              <p className="mt-1.5 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{isLoading ? "—" : allReports.length}</p>
              <p className="mt-1 text-xs lg:text-sm text-gray-400 dark:text-gray-500 pr-10">All formats combined</p>
            </div>
          </div>
          {/* PDF */}
             <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
            <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
              <div className="w-35 h-35" style={{ color: "#ef4444", opacity: 0.12 }}><File className="w-full h-full" strokeWidth={1.5} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PDF</p>
              <p className="mt-1.5 text-3xl lg:text-4xl font-bold text-red-500">{isLoading ? "—" : formatCounts.pdf}</p>
              <p className="mt-1 text-xs lg:text-sm text-gray-400 dark:text-gray-500 pr-10">Portable document format</p>
            </div>
          </div>
          {/* DOCX */}
             <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
            <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
              <div className="w-35 h-35" style={{ color: "#3b82f6", opacity: 0.12 }}><FilePlus className="w-full h-full" strokeWidth={1.5} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DOCX</p>
              <p className="mt-1.5 text-3xl lg:text-4xl font-bold text-blue-500">{isLoading ? "—" : formatCounts.docx}</p>
              <p className="mt-1 text-xs lg:text-sm text-gray-400 dark:text-gray-500 pr-10">Word document format</p>
            </div>
          </div>
          {/* Excel */}
             <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
            <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
              <div className="w-35 h-35" style={{ color: "#22c55e", opacity: 0.12 }}><FileSpreadsheet className="w-full h-full" strokeWidth={1.5} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Excel</p>
              <p className="mt-1.5 text-3xl lg:text-4xl font-bold text-green-500">{isLoading ? "—" : formatCounts.xlsx}</p>
              <p className="mt-1 text-xs lg:text-sm text-gray-400 dark:text-gray-500 pr-10">Spreadsheet format</p>
            </div>
          </div>
          {/* JSON */}
             <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-slate-900 p-5 border border-[#005F5F]/60" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
            <span aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 12px 12px no-repeat, linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 12px 12px no-repeat", opacity: 0.45, clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
              <div className="w-35 h-35" style={{ color: "#f59e0b", opacity: 0.12 }}><FileJson className="w-full h-full" strokeWidth={1.5} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">JSON</p>
              <p className="mt-1.5 text-3xl lg:text-4xl font-bold text-amber-500">{isLoading ? "—" : formatCounts.json}</p>
              <p className="mt-1 text-xs lg:text-sm text-gray-400 dark:text-gray-500 pr-10">Machine-readable format</p>
            </div>
          </div>
        </div>

        {/* ── Format Tabs ── */}
        <div className="bg-[#FCFCFA] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {formatTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] md:text-[15px] lg:text-[17px] font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon size={16} className="sm:w-4.5 sm:h-4.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[11px] sm:text-[12px] ${
                    activeTab === tab.id
                      ? "bg-teal-500/20"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {formatCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        {/* Full-width on mobile, max-md on larger screens */}
        <div className="relative w-full md:max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by file name or job ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-[14px] sm:text-[15px] lg:text-[17px] rounded-xl border border-gray-200 dark:border-gray-800 bg-[#FCFCFA] dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* ── Reports Table / Cards ── */}
        <div className="bg-[#FCFCFA] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Loading */}
          {isLoading && (
            <div className="p-10 sm:p-14 text-center">
              <Loader2 size={40} className="mx-auto text-teal-500 animate-spin mb-4" />
              <p className="text-[14px] sm:text-[15px] text-gray-500 dark:text-gray-400">
                Loading reports…
              </p>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="p-10 sm:p-14 text-center">
              <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
              <p className="text-[14px] sm:text-[15px] text-gray-500 dark:text-gray-400 mb-4">
                Failed to load reports
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl text-[13px] sm:text-[14px] font-medium hover:bg-teal-600 transition"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Desktop Table (lg+) ── */}
          {!isLoading && !isError && (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Report Name
                      </th>
                      <th className="px-6 py-4 text-left text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Format
                      </th>
                      <th className="px-6 py-4 text-left text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Job ID
                      </th>
                      <th className="px-6 py-4 text-left text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Generated
                      </th>
                      <th className="px-6 py-4 text-left text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Size
                      </th>
                      <th className="px-6 py-4 text-right text-[15px] lg:text-[17px] font-semibold text-gray-600 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>

                {/* Fixed-height body — always 560px (10 rows × 56px) */}
                <div style={{ height: TBODY_H, overflowY: "hidden" }}>
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {paginatedReports.map((report, index) => (
                        <motion.tr
                          key={report.report_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          style={{ height: ROW_H }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                <FileText size={20} className="text-teal-500" />
                              </div>
                              <p className="text-[15px] lg:text-[17px] font-semibold text-gray-900 dark:text-white max-w-65 truncate">
                                {report.file_name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-[13px] lg:text-[15px] font-medium uppercase ${
                                formatColors[report.format] ??
                                "bg-gray-500/10 text-gray-500"
                              }`}
                            >
                              {report.format}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] lg:text-[15px] font-mono text-gray-500 dark:text-gray-400">
                              {report.job_id.slice(0, 8)}…
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[14px] lg:text-[16px] text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              {formatDate(report.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[14px] lg:text-[16px] text-gray-600 dark:text-gray-400">
                            {formatBytes(report.size_bytes)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDownload(report)}
                                disabled={downloadingIds.has(report.report_id)}
                                title="Download"
                                className="p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50"
                              >
                                {downloadingIds.has(report.report_id) ? (
                                  <Loader2 size={16} className="text-teal-500 animate-spin" />
                                ) : (
                                  <Download size={16} className="text-teal-500" />
                                )}
                              </motion.button>
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

                      {/* Ghost rows */}
                      {paginatedReports.length < VISIBLE_ROWS &&
                        Array.from({
                          length: VISIBLE_ROWS - paginatedReports.length,
                        }).map((_, i) => (
                          <tr
                            key={`ghost-${i}`}
                            aria-hidden="true"
                            style={{ height: ROW_H }}
                            className="border-t border-gray-200 dark:border-gray-800"
                          >
                            <td colSpan={6} />
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Tablet Table (sm–md, hidden on mobile and lg+) ── */}
              {/* Shows: Name, Format, Size, Actions — hides Job ID & Generated date */}
              <div className="hidden sm:block lg:hidden overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Report Name
                      </th>
                      <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Format
                      </th>
                      <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Generated
                      </th>
                      <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Size
                      </th>
                      <th className="px-4 py-3.5 text-right text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Actions
                      </th>
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
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-teal-500" />
                            </div>
                            <p className="text-[13px] font-semibold text-gray-900 dark:text-white max-w-45 md:max-w-60 truncate">
                              {report.file_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase ${
                              formatColors[report.format] ??
                              "bg-gray-500/10 text-gray-500"
                            }`}
                          >
                            {report.format}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-600 dark:text-gray-400">
                            <Calendar size={12} />
                            {formatDate(report.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-gray-600 dark:text-gray-400">
                          {formatBytes(report.size_bytes)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(report)}
                              disabled={downloadingIds.has(report.report_id)}
                              title="Download"
                              className="p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 disabled:opacity-50"
                            >
                              {downloadingIds.has(report.report_id) ? (
                                <Loader2 size={15} className="text-teal-500 animate-spin" />
                              ) : (
                                <Download size={15} className="text-teal-500" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPendingDelete(report)}
                              disabled={isDeleting}
                              title="Delete"
                              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            >
                              <Trash2 size={15} className="text-red-400" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List (xs only, hidden sm+) ── */}
              <div className="sm:hidden">
                {paginatedReports.map((report, index) => (
                  <ReportCard
                    key={report.report_id}
                    report={report}
                    isDownloading={downloadingIds.has(report.report_id)}
                    isDeleting={isDeleting}
                    onDownload={() => handleDownload(report)}
                    onDelete={() => setPendingDelete(report)}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Pagination ── */}
          {!isLoading && !isError && (
            <div className="px-3 py-3.5 sm:px-6 sm:py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[12px] sm:text-[14px] lg:text-[16px] text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of{" "}
                {filteredReports.length} reports
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                {/* First page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft size={15} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Page numbers — windowed on all sizes */}
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl text-[12px] sm:text-[13px] md:text-[14px] font-medium transition ${
                      currentPage === page
                        ? "bg-teal-500 text-black"
                        : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={15} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {/* Last page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronsRight size={15} className="sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && !isError && filteredReports.length === 0 && (
            <div className="p-10 sm:p-14 text-center">
              <FileText
                size={48}
                className="mx-auto text-gray-300 dark:text-gray-600 mb-4 sm:w-14 sm:h-14"
              />
              <p className="text-[14px] sm:text-[16px] text-gray-500 dark:text-gray-400">
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