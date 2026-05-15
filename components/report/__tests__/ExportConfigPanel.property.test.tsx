// Feature: generate-report, Property 3: Export Config Panel displays the selected format name
// Feature: generate-report, Property 4: Specific-steps scope renders all job steps as checkboxes
// Feature: generate-report, Property 5: Column filter section shows all columns for in-scope steps
// Feature: generate-report, Property 6: Export request body accurately reflects all UI selections

import { describe, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import type { StepSummary, ParsedStepData } from "@/types/assets";
import type { ReportFormatInfo, ScanReportRequest } from "@/types/reports";

// Mock Button so it renders as a plain <button> without Radix/shadcn dependencies
vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...rest}>{children}</button>
    ),
}));

// Import after mock is set up
import ExportConfigPanel from "../ExportConfigPanel";

// A minimal valid ReportFormatInfo to satisfy the required prop
const defaultFormat: ReportFormatInfo = {
    format: "pdf",
    fileExtension: "pdf",
    contentType: "application/pdf",
    implemented: true,
    description: "Export as a portable document",
};

// Arbitrary for ParsedStepData with non-empty columns
const parsedStepDataArbitrary = fc.record<ParsedStepData>({
    step_id: fc.uuid(),
    tool_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    step_order: fc.integer({ min: 1, max: 100 }),
    columns: fc.array(
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        { minLength: 1, maxLength: 10 }
    ),
    rows: fc.constant([]),
    discovered_columns: fc.constant({}),
});

// Arbitrary for StepSummary
const stepSummaryArbitrary = fc.record<StepSummary>({
    step_id: fc.uuid(),
    tool_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    step_order: fc.integer({ min: 1, max: 100 }),
    status: fc.constantFrom("completed", "failed", "pending", "running"),
    findings_count: fc.integer({ min: 0, max: 1000 }),
    started_at: fc.option(fc.string(), { nil: null }),
    finished_at: fc.option(fc.string(), { nil: null }),
});

describe("ExportConfigPanel property tests", () => {
    /**
     * Property 3: Export Config Panel displays the selected format name
     * Validates: Requirements 2.2
     *
     * For any ReportFormatInfo passed as selectedFormat, the ExportConfigPanel
     * SHALL display that format's name in its header.
     */
    it("Property 3: panel header contains the selected format name", () => {
        fc.assert(
            fc.property(
                fc.record<ReportFormatInfo>({
                    format: fc.constantFrom("json", "pdf", "excel", "docx"),
                    fileExtension: fc.string({ minLength: 1, maxLength: 10 }),
                    contentType: fc.string({ minLength: 1, maxLength: 50 }),
                    implemented: fc.boolean(),
                    description: fc.string({ minLength: 1, maxLength: 100 }),
                }),
                (format) => {
                    const { unmount } = render(
                        <ExportConfigPanel
                            jobId="test-job-id"
                            selectedFormat={format}
                            steps={[]}
                            parsedSteps={[] as ParsedStepData[]}
                            onChangeFormat={vi.fn()}
                            onClose={vi.fn()}
                            isExporting={false}
                            onExport={vi.fn()}
                        />
                    );

                    // The panel header renders the format name in an <h2> element
                    const heading = screen.getByRole("heading", { level: 2 });
                    const headingText = heading.textContent ?? "";
                    const containsFormatName = headingText
                        .toLowerCase()
                        .includes(format.format.toLowerCase());

                    unmount();

                    return containsFormatName;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 4: Specific-steps scope renders all job steps as checkboxes
     * Validates: Requirements 2.4
     *
     * For any array of StepSummary objects, when the ExportConfigPanel is in
     * "specific" scope mode, it SHALL render exactly one checkbox per step in
     * the array — no more, no fewer.
     */
    it("Property 4: renders exactly one checkbox per step when scope is 'specific'", () => {
        fc.assert(
            fc.property(
                fc.array(stepSummaryArbitrary, { minLength: 1, maxLength: 20 }),
                (steps) => {
                    const { unmount } = render(
                        <ExportConfigPanel
                            jobId="test-job-id"
                            selectedFormat={defaultFormat}
                            steps={steps}
                            parsedSteps={[] as ParsedStepData[]}
                            onChangeFormat={vi.fn()}
                            onClose={vi.fn()}
                            isExporting={false}
                            onExport={vi.fn()}
                        />
                    );

                    // Click the "Specific steps" radio button to switch scope
                    const specificRadio = screen.getByRole("radio", {
                        name: /specific steps/i,
                    });
                    fireEvent.click(specificRadio);

                    // Count all checkboxes rendered in the step list
                    const checkboxes = screen.getAllByRole("checkbox");
                    const checkboxCount = checkboxes.length;

                    unmount();

                    return checkboxCount === steps.length;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 5: Column filter section shows all columns for in-scope steps
     * Validates: Requirements 3.2
     *
     * For any set of in-scope ParsedStepData objects, when the column filter
     * section is expanded, the ExportConfigPanel SHALL display every column
     * from every in-scope step.
     */
    it("Property 5: column filter section shows all columns for in-scope steps", () => {
        fc.assert(
            fc.property(
                fc.array(parsedStepDataArbitrary, { minLength: 1, maxLength: 10 }),
                (parsedSteps) => {
                    const { unmount, container } = render(
                        <ExportConfigPanel
                            jobId="test-job-id"
                            selectedFormat={defaultFormat}
                            steps={[]}
                            parsedSteps={parsedSteps}
                            onChangeFormat={vi.fn()}
                            onClose={vi.fn()}
                            isExporting={false}
                            onExport={vi.fn()}
                        />
                    );

                    // Expand the column filter section by clicking the toggle button
                    const toggleButton = screen.getByRole("button", {
                        name: /column filters/i,
                    });
                    fireEvent.click(toggleButton);

                    // Collect all unique columns across all in-scope parsedSteps
                    const allColumns = parsedSteps.flatMap((s) => s.columns);

                    // Assert every column is present in the rendered output
                    const textContent = container.textContent ?? "";
                    const allPresent = allColumns.every((col) =>
                        textContent.includes(col)
                    );

                    unmount();

                    return allPresent;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 6: Export request body accurately reflects all UI selections
     * Validates: Requirements 3.3, 4.1
     *
     * For any valid combination of format, stepScope, stepIds, and columns
     * configured in the ExportConfigPanel, the ScanReportRequest constructed
     * and passed to onExport SHALL contain exactly those values:
     *   - step_ids present only when scope is "specific"
     *   - columns absent when column filter section is collapsed (default)
     */
    it("Property 6: onExport is called with a ScanReportRequest that accurately reflects UI selections", () => {
        // Map from ReportFormat to SupportedExportFormat (excel → xlsx)
        const formatToExportFormat = (fmt: string): string =>
            fmt === "excel" ? "xlsx" : fmt;

        fc.assert(
            fc.property(
                // Generate a format
                fc.constantFrom("pdf", "docx", "json", "excel") as fc.Arbitrary<string>,
                // Generate a step scope
                fc.constantFrom("all", "last", "specific") as fc.Arbitrary<string>,
                // Generate 1–5 steps (needed for "specific" scope)
                fc.array(stepSummaryArbitrary, { minLength: 1, maxLength: 5 }),
                (format, stepScope, steps) => {
                    const selectedFormat: ReportFormatInfo = {
                        format: format as ReportFormatInfo["format"],
                        fileExtension: format === "excel" ? "xlsx" : format,
                        contentType: "application/octet-stream",
                        implemented: true,
                        description: `Export as ${format}`,
                    };

                    const onExport = vi.fn();

                    const { unmount } = render(
                        <ExportConfigPanel
                            jobId="test-job-id"
                            selectedFormat={selectedFormat}
                            steps={steps}
                            parsedSteps={[] as ParsedStepData[]}
                            onChangeFormat={vi.fn()}
                            onClose={vi.fn()}
                            isExporting={false}
                            onExport={onExport}
                        />
                    );

                    // Set the step scope by clicking the appropriate radio
                    if (stepScope === "all") {
                        const radio = screen.getByRole("radio", { name: /all steps/i });
                        fireEvent.click(radio);
                    } else if (stepScope === "last") {
                        const radio = screen.getByRole("radio", { name: /last step only/i });
                        fireEvent.click(radio);
                    } else {
                        // "specific"
                        const radio = screen.getByRole("radio", { name: /specific steps/i });
                        fireEvent.click(radio);

                        // Check the first step's checkbox so the download button is enabled
                        const checkboxes = screen.getAllByRole("checkbox");
                        if (checkboxes.length > 0) {
                            fireEvent.click(checkboxes[0]);
                        }
                    }

                    // Click the Download button
                    const downloadButton = screen.getByRole("button", { name: /download/i });
                    fireEvent.click(downloadButton);

                    // Verify onExport was called
                    if (!onExport.mock.calls.length) {
                        unmount();
                        return false;
                    }

                    const req: ScanReportRequest = onExport.mock.calls[0][0];

                    // Invariant 1: format must match (with excel→xlsx mapping)
                    const expectedFormat = formatToExportFormat(format);
                    if (req.format !== expectedFormat) {
                        unmount();
                        return false;
                    }

                    // Invariant 2: step_scope must match
                    if (req.step_scope !== stepScope) {
                        unmount();
                        return false;
                    }

                    // Invariant 3: step_ids present iff scope is "specific"
                    if (stepScope === "specific") {
                        if (!req.step_ids || req.step_ids.length === 0) {
                            unmount();
                            return false;
                        }
                    } else {
                        if (req.step_ids != null) {
                            unmount();
                            return false;
                        }
                    }

                    // Invariant 4: columns absent when column filter section is collapsed (default)
                    if (req.columns != null) {
                        unmount();
                        return false;
                    }

                    unmount();
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
