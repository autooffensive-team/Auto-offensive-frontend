"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    const isSpecificWithNoSteps =
        stepScope === "specific" && selectedStepIds.size === 0;

    const isDownloadDisabled = isExporting || isSpecificWithNoSteps;

    const handleStepCheckboxChange = (stepId: string, checked: boolean) => {
        setSelectedStepIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(stepId);
            } else {
                next.delete(stepId);
            }
            return next;
        });
    };

    // Compute which parsedSteps are in scope based on current stepScope selection
    const inScopeParsedSteps: ParsedStepData[] = (() => {
        if (stepScope === "all") return parsedSteps;
        if (stepScope === "last") {
            const last = parsedSteps[parsedSteps.length - 1];
            return last ? [last] : [];
        }
        // "specific"
        return parsedSteps.filter((s) => selectedStepIds.has(s.step_id));
    })();

    const handleColumnCheckboxChange = (stepId: string, column: string, checked: boolean) => {
        setColumnFilters((prev) => {
            const existing = prev[stepId] ?? [];
            const updated = checked
                ? [...existing, column]
                : existing.filter((c) => c !== column);
            if (updated.length === 0) {
                const { [stepId]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [stepId]: updated };
        });
    };

    const handleExport = () => {
        // Build columns only when section is expanded AND at least one column is selected
        const hasColumnSelections =
            columnFilterExpanded &&
            Object.values(columnFilters).some((cols) => cols.length > 0);

        const req: ScanReportRequest = {
            format: mapToSupportedFormat(selectedFormat.format),
            step_scope: stepScope,
            ...(stepScope === "specific" && {
                step_ids: Array.from(selectedStepIds),
            }),
            ...(hasColumnSelections && { columns: columnFilters }),
        };
        onExport(req);
    };

    return (
        <div className="z-50 w-80 rounded-lg border border-border bg-background shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                    <p className="text-xs text-muted-foreground">Export as</p>
                    <h2 className="text-sm font-semibold capitalize">
                        {selectedFormat.format}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close export panel"
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 px-4 py-4">
                {/* Step scope */}
                <fieldset>
                    <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Step scope
                    </legend>
                    <div className="flex flex-col gap-2">
                        {(
                            [
                                { value: "all", label: "All steps" },
                                { value: "last", label: "Last step only" },
                                { value: "specific", label: "Specific steps" },
                            ] as { value: StepScope; label: string }[]
                        ).map(({ value, label }) => (
                            <label
                                key={value}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <input
                                    type="radio"
                                    name="step-scope"
                                    value={value}
                                    checked={stepScope === value}
                                    onChange={() => setStepScope(value)}
                                    className="accent-primary"
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* Specific steps checklist */}
                {stepScope === "specific" && (
                    <fieldset>
                        <legend className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Select steps
                        </legend>
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                            {steps.map((step) => (
                                <label
                                    key={step.step_id}
                                    className="flex cursor-pointer items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        value={step.step_id}
                                        checked={selectedStepIds.has(step.step_id)}
                                        onChange={(e) =>
                                            handleStepCheckboxChange(
                                                step.step_id,
                                                e.target.checked,
                                            )
                                        }
                                        className="accent-primary"
                                    />
                                    <span>
                                        {step.tool_name}{" "}
                                        <span className="text-muted-foreground">
                                            #{step.step_order}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Validation message */}
                        {isSpecificWithNoSteps && (
                            <p
                                role="alert"
                                className="mt-2 text-xs text-destructive"
                            >
                                Select at least one step
                            </p>
                        )}
                    </fieldset>
                )}
            </div>

            {/* Column filters — collapsible disclosure */}
            <div className="border-t border-border">
                <button
                    type="button"
                    aria-expanded={columnFilterExpanded}
                    onClick={() => setColumnFilterExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Column filters
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            columnFilterExpanded && "rotate-180",
                        )}
                        aria-hidden="true"
                    />
                </button>

                {columnFilterExpanded && (
                    <div className="flex flex-col gap-3 px-4 pb-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                        {inScopeParsedSteps.length === 0 ? (
                            <p className="text-xs text-muted-foreground pt-3">
                                No steps in scope.
                            </p>
                        ) : (
                            inScopeParsedSteps.map((parsedStep) => (
                                <fieldset key={parsedStep.step_id} className="pt-3">
                                    <legend className="mb-1.5 text-xs font-medium">
                                        {parsedStep.tool_name}{" "}
                                        <span className="text-muted-foreground">
                                            #{parsedStep.step_order}
                                        </span>
                                    </legend>
                                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                                        {parsedStep.columns.map((col) => (
                                            <label
                                                key={col}
                                                className="flex cursor-pointer items-center gap-2 text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={col}
                                                    checked={
                                                        columnFilters[parsedStep.step_id]?.includes(col) ?? false
                                                    }
                                                    onChange={(e) =>
                                                        handleColumnCheckboxChange(
                                                            parsedStep.step_id,
                                                            col,
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="accent-primary"
                                                />
                                                {col}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <button
                    onClick={onChangeFormat}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                    Change format
                </button>
                <Button
                    size="sm"
                    disabled={isDownloadDisabled}
                    onClick={handleExport}
                >
                    {isExporting ? "Exporting…" : "Download"}
                </Button>
            </div>
        </div>
    );
}
