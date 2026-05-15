"use client";

import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import Skeleton from "@/components/ui/skeleton";
import { useGetReportManifestQuery } from "@/lib/redux/services/userdashboard/assets/reports-api";
import type { ReportFormatInfo } from "@/types/reports";
import FormatCard from "./FormatCard";

interface ReportDropdownProps {
    jobId: string;
    open: boolean;
    onClose: () => void;
    onSelectFormat: (format: ReportFormatInfo) => void;
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
                <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            );
        }

        if (isError) {
            const message =
                error && "status" in error
                    ? `Error ${error.status}: Failed to load report formats`
                    : "Failed to load report formats";

            return (
                <div className="flex flex-col gap-2 p-3">
                    <p className="text-sm text-destructive">{message}</p>
                    <button
                        onClick={() => refetch()}
                        className="self-start rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        const implementedFormats = (data?.formats ?? []).filter(
            (f) => f.implemented,
        );

        if (implementedFormats.length === 0) {
            return (
                <div className="p-3">
                    <p className="text-sm text-muted-foreground">
                        No report formats are currently available
                    </p>
                </div>
            );
        }

        return implementedFormats.map((format) => (
            <FormatCard
                key={format.format}
                format={format}
                onSelect={handleSelect}
            />
        ));
    };

    return (
        <DropdownMenuContent align="start" className="w-72 p-1.5">
            {renderContent()}
        </DropdownMenuContent>
    );
}
