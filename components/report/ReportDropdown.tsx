"use client";

import { FileDown } from "lucide-react";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useGetReportManifestQuery } from "@/lib/redux/services/userdashboard/assets/reports-api";
import type { ReportFormatInfo } from "@/types/reports";
import FormatCard from "./FormatCard";

interface ReportDropdownProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
  onSelectFormat: (format: ReportFormatInfo) => void;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl mx-1 px-3 py-2.5 animate-pulse">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-12 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-8 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-3 w-44 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function ReportDropdown({
  jobId,
  open,
  onClose,
  onSelectFormat,
}: ReportDropdownProps) {
  const { data, isLoading, isError, error, refetch } =
    useGetReportManifestQuery(jobId, { skip: !open });

  const handleSelect = (format: ReportFormatInfo) => {
    onSelectFormat(format);
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col py-1">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      );
    }

    if (isError) {
      const message =
        error && "status" in error
          ? `Error ${error.status}: Failed to load formats`
          : "Failed to load report formats";

      return (
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-800/40 dark:bg-rose-950/30">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[12px] text-rose-700 dark:text-rose-400 leading-snug">{message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            Try again
          </button>
        </div>
      );
    }

    const implementedFormats = (data?.formats ?? []).filter((f) => f.implemented);

    if (implementedFormats.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <FileDown size={18} className="text-slate-400" />
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            No export formats available yet
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col py-1">
        {implementedFormats.map((format) => (
          <FormatCard key={format.format} format={format} onSelect={handleSelect} />
        ))}
      </div>
    );
  };

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className="w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xl dark:border-slate-700/60 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40">
          <FileDown size={14} className="text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
            Export Report
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Choose a format to download
          </p>
        </div>
      </div>

      {/* Format list */}
      {renderContent()}

      {/* Footer hint */}
      {!isLoading && !isError && (data?.formats ?? []).filter((f) => f.implemented).length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Select a format to configure export options
          </p>
        </div>
      )}
    </DropdownMenuContent>
  );
}
