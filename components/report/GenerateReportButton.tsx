"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportScanReportMutation } from "@/lib/redux/services/userdashboard/assets/reports-api";
import type { StepSummary, ParsedStepData } from "@/types/assets";
import type { ReportFormatInfo, ScanReportRequest } from "@/types/reports";
import ReportDropdown from "./ReportDropdown";
import ExportConfigPanel from "./ExportConfigPanel";

interface GenerateReportButtonProps {
    jobId: string;
    steps: StepSummary[];
    parsedSteps: ParsedStepData[];
}

export default function GenerateReportButton({
    jobId,
    steps,
    parsedSteps,
}: GenerateReportButtonProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ReportFormatInfo | null>(null);

    const [exportScanReport, { isLoading }] = useExportScanReportMutation();

    const handleSelectFormat = (format: ReportFormatInfo) => {
        setSelectedFormat(format);
        setDropdownOpen(false);
    };

    const handleExport = async (req: ScanReportRequest) => {
        try {
            await exportScanReport({ jobId, body: req }).unwrap();
            toast.success("Report download started");
        } catch (err: unknown) {
            const error = err as { data?: { detail?: string; message?: string } };
            const message =
                error?.data?.detail ??
                error?.data?.message ??
                "Export failed. Please try again.";
            toast.error(message);
        }
    };

    const handleChangeFormat = () => {
        setSelectedFormat(null);
        setDropdownOpen(true);
    };

    const handleClosePanel = () => {
        setSelectedFormat(null);
    };

    return (
        <div className="relative">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-xl border-0 bg-[#00d0b2] px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <FileText className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>Generate Report</span>
                    </button>
                </DropdownMenuTrigger>

                <ReportDropdown
                    jobId={jobId}
                    open={dropdownOpen}
                    onClose={() => setDropdownOpen(false)}
                    onSelectFormat={handleSelectFormat}
                />
            </DropdownMenu>

            {selectedFormat !== null && (
                <div className="absolute right-0 top-full mt-2 z-50">
                    <ExportConfigPanel
                        jobId={jobId}
                        selectedFormat={selectedFormat}
                        steps={steps}
                        parsedSteps={parsedSteps}
                        onChangeFormat={handleChangeFormat}
                        onClose={handleClosePanel}
                        isExporting={isLoading}
                        onExport={handleExport}
                    />
                </div>
            )}

        </div>
    );
}
