// Feature: generate-report, Property 2: FormatCard renders all required fields
// Feature: generate-report, Property 9: FormatCard aria-label contains format name and description

import { describe, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import * as fc from "fast-check";
import type { ReportFormatInfo, ReportFormat } from "@/types/reports";

// Mock DropdownMenuItem so FormatCard renders without Radix portal/context requirements
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenuItem: ({
        children,
        "aria-label": ariaLabel,
        ...rest
    }: React.HTMLAttributes<HTMLDivElement> & { "aria-label"?: string }) => (
        <div role="menuitem" aria-label={ariaLabel} {...rest}>
            {children}
        </div>
    ),
}));

// Import after mock is set up
import FormatCard from "../FormatCard";

const formatArbitrary = fc.constantFrom<ReportFormat>(
    "json",
    "pdf",
    "excel",
    "docx"
);

const reportFormatInfoArbitrary = fc.record<ReportFormatInfo>({
    format: formatArbitrary,
    fileExtension: fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
    contentType: fc.string({ minLength: 1 }),
    implemented: fc.constant(true),
    description: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
});

describe("FormatCard property tests", () => {
    /**
     * Property 2: FormatCard renders all required fields
     * Validates: Requirements 1.3
     *
     * For any ReportFormatInfo with implemented: true, the rendered FormatCard
     * SHALL contain the format name, the file extension, and the description text.
     */
    it("Property 2: renders format name, file extension, and description for any valid ReportFormatInfo", () => {
        fc.assert(
            fc.property(reportFormatInfoArbitrary, (format) => {
                const { container, unmount } = render(
                    <FormatCard format={format} onSelect={vi.fn()} />
                );

                const textContent = container.textContent ?? "";

                // Assert format name is present in the rendered text
                const hasFormatName = textContent.includes(format.format);

                // Assert file extension is present (rendered as ".{fileExtension}")
                const hasExtension = textContent.includes(`.${format.fileExtension}`);

                // Assert description is present
                const hasDescription = textContent.includes(format.description);

                unmount();

                return hasFormatName && hasExtension && hasDescription;
            }),
            { numRuns: 100 }
        );
    });

    /**
     * Property 9: FormatCard aria-label contains format name and description
     * Validates: Requirements 7.5
     *
     * For any ReportFormatInfo, the rendered FormatCard SHALL have an aria-label
     * attribute that contains both the format name and the description string.
     */
    it("Property 9: aria-label contains both format name and description for any valid ReportFormatInfo", () => {
        fc.assert(
            fc.property(reportFormatInfoArbitrary, (format) => {
                const { container, unmount } = render(
                    <FormatCard format={format} onSelect={vi.fn()} />
                );

                const menuItem = within(container).getByRole("menuitem");
                const ariaLabel = menuItem.getAttribute("aria-label") ?? "";

                const containsFormatName = ariaLabel.includes(format.format);
                const containsDescription = ariaLabel.includes(format.description);

                unmount();

                return containsFormatName && containsDescription;
            }),
            { numRuns: 100 }
        );
    });
});
