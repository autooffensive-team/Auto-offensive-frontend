"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ReportFormatInfo } from "@/types/reports";

interface FormatCardProps {
    format: ReportFormatInfo;
    onSelect: (format: ReportFormatInfo) => void;
}

export default function FormatCard({ format, onSelect }: FormatCardProps) {
    const ariaLabel = `${format.format} (.${format.fileExtension}) — ${format.description}`;

    return (
        <DropdownMenuItem
            aria-label={ariaLabel}
            onSelect={() => onSelect(format)}
            className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer rounded-lg mx-1.5 my-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-200 dark:focus:bg-gray-700"
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold capitalize">{format.format}</span>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium bg-white dark:bg-gray-900 text-muted-foreground ring-1 ring-inset ring-border">
                    .{format.fileExtension}
                </span>
            </div>
            <span className="text-xs text-muted-foreground leading-snug">{format.description}</span>
        </DropdownMenuItem>
    );
}
