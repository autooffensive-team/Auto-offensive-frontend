"use client";

import { FileText, FileJson, FileSpreadsheet, FileType2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ReportFormatInfo } from "@/types/reports";

interface FormatCardProps {
  format: ReportFormatInfo;
  onSelect: (format: ReportFormatInfo) => void;
}

type FormatMeta = {
  icon: React.ReactNode;
  accent: string;        // icon wrapper bg
  iconColor: string;     // icon colour
  extClass: string;      // extension pill colour
  borderHover: string;   // border on hover
};

function getFormatMeta(fmt: string): FormatMeta {
  switch (fmt.toLowerCase()) {
    case "pdf":
      return {
        icon: <FileText size={16} />,
        accent: "bg-rose-50 dark:bg-rose-950/40",
        iconColor: "text-rose-500",
        extClass: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
        borderHover: "hover:border-rose-300 dark:hover:border-rose-700/60",
      };
    case "json":
      return {
        icon: <FileJson size={16} />,
        accent: "bg-amber-50 dark:bg-amber-950/40",
        iconColor: "text-amber-500",
        extClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
        borderHover: "hover:border-amber-300 dark:hover:border-amber-700/60",
      };
    case "excel":
    case "xlsx":
      return {
        icon: <FileSpreadsheet size={16} />,
        accent: "bg-emerald-50 dark:bg-emerald-950/40",
        iconColor: "text-emerald-500",
        extClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
        borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
      };
    case "docx":
    case "word":
      return {
        icon: <FileType2 size={16} />,
        accent: "bg-blue-50 dark:bg-blue-950/40",
        iconColor: "text-blue-500",
        extClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
        borderHover: "hover:border-blue-300 dark:hover:border-blue-700/60",
      };
    default:
      return {
        icon: <FileText size={16} />,
        accent: "bg-slate-100 dark:bg-slate-800",
        iconColor: "text-slate-500",
        extClass: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
        borderHover: "hover:border-slate-300 dark:hover:border-slate-600",
      };
  }
}

export default function FormatCard({ format, onSelect }: FormatCardProps) {
  const meta = getFormatMeta(format.format);
  const ariaLabel = `${format.format} (.${format.fileExtension}) — ${format.description}`;

  return (
    <DropdownMenuItem
      aria-label={ariaLabel}
      onSelect={() => onSelect(format)}
      className={[
        "group flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl mx-1 my-0.5",
        "border border-transparent transition-all duration-150",
        "bg-[#FCFCFA] dark:bg-slate-900/60",
        "hover:bg-slate-50 dark:hover:bg-slate-800/80",
        meta.borderHover,
        "focus:bg-slate-50 dark:focus:bg-slate-800/80",
        "focus:outline-none",
      ].join(" ")}
    >
      {/* Icon tile */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.accent} ${meta.iconColor} transition-transform duration-150 group-hover:scale-105`}>
        {meta.icon}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold capitalize text-slate-900 dark:text-white">
            {format.format === "excel" ? "Excel" : format.format.toUpperCase()}
          </span>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium tracking-wide ${meta.extClass}`}>
            .{format.fileExtension}
          </span>
        </div>
        <span className="truncate text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {format.description}
        </span>
      </div>

      {/* Arrow on hover */}
      <svg
        className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </DropdownMenuItem>
  );
}
