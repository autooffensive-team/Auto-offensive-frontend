"use client";

import { useState } from "react";
import { ChevronDown, Download, Loader2, X, FileText, FileJson, FileSpreadsheet, FileType2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepSummary, ParsedStepData } from "@/types/assets";
import type {
  ReportFormatInfo,
  ScanReportRequest,
  StepScope,
  SupportedExportFormat,
} from "@/types/reports";

interface ExportConfigPanelProps {
  jobId: string;
  selectedFormat: ReportFormatInfo;
  steps: StepSummary[];
  parsedSteps: ParsedStepData[];
  onChangeFormat: () => void;
  onClose: () => void;
  isExporting: boolean;
  onExport: (req: ScanReportRequest) => void;
}

function mapToSupportedFormat(format: ReportFormatInfo["format"]): SupportedExportFormat {
  if (format === "excel") return "xlsx";
  return format as SupportedExportFormat;
}

function getFormatIcon(fmt: string) {
  switch (fmt.toLowerCase()) {
    case "pdf":    return <FileText size={14} className="text-rose-500" />;
    case "json":   return <FileJson size={14} className="text-amber-500" />;
    case "excel":
    case "xlsx":   return <FileSpreadsheet size={14} className="text-emerald-500" />;
    case "docx":   return <FileType2 size={14} className="text-blue-500" />;
    default:       return <FileText size={14} className="text-slate-500" />;
  }
}

function getFormatAccent(fmt: string): string {
  switch (fmt.toLowerCase()) {
    case "pdf":    return "bg-rose-50 dark:bg-rose-950/40";
    case "json":   return "bg-amber-50 dark:bg-amber-950/40";
    case "excel":
    case "xlsx":   return "bg-emerald-50 dark:bg-emerald-950/40";
    case "docx":   return "bg-blue-50 dark:bg-blue-950/40";
    default:       return "bg-slate-100 dark:bg-slate-800";
  }
}

const SCOPE_OPTIONS: { value: StepScope; label: string; desc: string }[] = [
  { value: "all",      label: "All tables",       desc: "Include every scan step" },
  { value: "last",     label: "Last table only",   desc: "Most recent step only" },
  { value: "specific", label: "Specific tables",   desc: "Pick individual steps" },
];

export default function ExportConfigPanel({
  selectedFormat,
  steps,
  parsedSteps,
  onChangeFormat,
  onClose,
  isExporting,
  onExport,
}: ExportConfigPanelProps) {
  const [stepScope, setStepScope] = useState<StepScope>("all");
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnFilterExpanded, setColumnFilterExpanded] = useState(false);

  const isSpecificWithNoSteps = stepScope === "specific" && selectedStepIds.size === 0;
  const isDownloadDisabled = isExporting || isSpecificWithNoSteps;

  const handleStepCheckboxChange = (stepId: string, checked: boolean) => {
    setSelectedStepIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(stepId) : next.delete(stepId);
      return next;
    });
  };

  const inScopeParsedSteps: ParsedStepData[] = (() => {
    if (stepScope === "all") return parsedSteps;
    if (stepScope === "last") {
      const last = parsedSteps[parsedSteps.length - 1];
      return last ? [last] : [];
    }
    return parsedSteps.filter((s) => selectedStepIds.has(s.step_id));
  })();

  const handleColumnCheckboxChange = (stepId: string, column: string, checked: boolean) => {
    setColumnFilters((prev) => {
      const existing = prev[stepId] ?? [];
      const updated = checked ? [...existing, column] : existing.filter((c) => c !== column);
      if (updated.length === 0) {
        const { [stepId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [stepId]: updated };
    });
  };

  const handleExport = () => {
    const hasColumnSelections =
      columnFilterExpanded &&
      Object.values(columnFilters).some((cols) => cols.length > 0);

    const req: ScanReportRequest = {
      format: mapToSupportedFormat(selectedFormat.format),
      step_scope: stepScope,
      ...(stepScope === "specific" && { step_ids: Array.from(selectedStepIds) }),
      ...(hasColumnSelections && { columns: columnFilters }),
    };
    onExport(req);
  };

  return (
    <div className="w-85 rounded-2xl border border-slate-200 bg-[#FCFCFA] text-slate-900 shadow-2xl dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getFormatAccent(selectedFormat.format)}`}>
            {getFormatIcon(selectedFormat.format)}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-none">
              Export options
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 capitalize">
              {selectedFormat.format === "excel" ? "Excel" : selectedFormat.format.toUpperCase()}
              {" "}· .{selectedFormat.fileExtension}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-4 px-4 py-4">

        {/* Table scope */}
        <fieldset>
          <legend className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Table scope
          </legend>
          <div className="flex flex-col gap-2">
            {SCOPE_OPTIONS.map(({ value, label, desc }) => {
              const active = stepScope === value;
              return (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                    active
                      ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/30"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700",
                  )}
                >
                  {/* Custom radio */}
                  <span className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    active
                      ? "border-teal-500 bg-teal-500"
                      : "border-slate-300 dark:border-slate-600",
                  )}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[#FCFCFA]" />}
                  </span>
                  <input
                    type="radio"
                    name="step-scope"
                    value={value}
                    checked={active}
                    onChange={() => setStepScope(value)}
                    className="sr-only"
                  />
                  <div className="min-w-0">
                    <p className={cn("text-[12px] font-medium leading-none", active ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-300")}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 leading-snug">
                      {desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Specific steps checklist */}
        {stepScope === "specific" && (
          <fieldset>
            <legend className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Select tables
            </legend>
            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2">
              {steps.map((step) => {
                const checked = selectedStepIds.has(step.step_id);
                return (
                  <label
                    key={step.step_id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                      checked
                        ? "bg-teal-50 dark:bg-teal-950/30"
                        : "hover:bg-[#FCFCFA] dark:hover:bg-slate-800",
                    )}
                  >
                    {/* Custom checkbox */}
                    <span className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      checked
                        ? "border-teal-500 bg-teal-500"
                        : "border-slate-300 dark:border-slate-600",
                    )}>
                      {checked && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      value={step.step_id}
                      checked={checked}
                      onChange={(e) => handleStepCheckboxChange(step.step_id, e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-[12px] text-slate-700 dark:text-slate-300 leading-snug">
                      {step.tool_name}{" "}
                      <span className="text-slate-400 dark:text-slate-500">#{step.step_order}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {isSpecificWithNoSteps && (
              <p role="alert" className="mt-2 text-[11px] text-rose-500 dark:text-rose-400">
                Select at least one step to continue
              </p>
            )}
          </fieldset>
        )}
      </div>

      {/* ── Column filters — collapsible ── */}
      <div className="border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          aria-expanded={columnFilterExpanded}
          onClick={() => setColumnFilterExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
        >
          Column filters
          <ChevronDown
            className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", columnFilterExpanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {columnFilterExpanded && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {inScopeParsedSteps.length === 0 ? (
              <p className="text-[12px] text-slate-400 dark:text-slate-500 pt-1">
                No steps in scope — adjust table scope above.
              </p>
            ) : (
              inScopeParsedSteps.map((parsedStep) => (
                <fieldset key={parsedStep.step_id} className="pt-1">
                  <legend className="mb-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {parsedStep.tool_name}{" "}
                    <span className="font-normal text-slate-400 dark:text-slate-500">#{parsedStep.step_order}</span>
                  </legend>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2">
                    {parsedStep.columns.map((col) => {
                      const checked = columnFilters[parsedStep.step_id]?.includes(col) ?? false;
                      return (
                        <label
                          key={col}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                            checked ? "bg-teal-50 dark:bg-teal-950/30" : "hover:bg-[#FCFCFA] dark:hover:bg-slate-800",
                          )}
                        >
                          <span className={cn(
                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                            checked ? "border-teal-500 bg-teal-500" : "border-slate-300 dark:border-slate-600",
                          )}>
                            {checked && (
                              <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            value={col}
                            checked={checked}
                            onChange={(e) => handleColumnCheckboxChange(parsedStep.step_id, col, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-[12px] text-slate-700 dark:text-slate-300">{col}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <button
          onClick={onChangeFormat}
          className="text-[12px] font-medium text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
        >
          ← Change format
        </button>

        <button
          disabled={isDownloadDisabled}
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-[13px] font-semibold text-black! shadow-sm transition-all hover:bg-teal-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          {isExporting ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              Exporting…
            </>
          ) : (
            <>
              <Download size={13} aria-hidden="true" />
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}
