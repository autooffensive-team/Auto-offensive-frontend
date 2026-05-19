/**
 * Unit tests for ExportConfigPanel
 * Requirements: 2.3, 2.5, 3.1, 3.4, 4.3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { StepSummary, ParsedStepData } from "@/types/assets";
import type { ReportFormatInfo, ScanReportRequest } from "@/types/reports";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock Button so it renders as a plain <button> without Radix/shadcn dependencies
vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...rest}>{children}</button>
    ),
}));

// Mock lucide-react so ChevronDown renders as a plain <svg> without icon issues
vi.mock("lucide-react", () => ({
    ChevronDown: ({ className, ...rest }: React.SVGAttributes<SVGElement>) => (
        <svg data-testid="chevron-down" className={className} {...rest} />
    ),
}));

// Import after mocks are set up
import ExportConfigPanel from "../ExportConfigPanel";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const defaultFormat: ReportFormatInfo = {
    format: "pdf",
    fileExtension: "pdf",
    contentType: "application/pdf",
    implemented: true,
    description: "Export as a portable document",
};

const steps: StepSummary[] = [
    {
        step_id: "step-1",
        tool_name: "nmap",
        step_order: 1,
        status: "completed",
        findings_count: 5,
        started_at: null,
        finished_at: null,
    },
    {
        step_id: "step-2",
        tool_name: "nikto",
        step_order: 2,
        status: "completed",
        findings_count: 3,
        started_at: null,
        finished_at: null,
    },
];

const parsedSteps: ParsedStepData[] = [
    {
        step_id: "step-1",
        tool_name: "nmap",
        step_order: 1,
        columns: ["host", "port", "service"],
        rows: [],
        discovered_columns: {},
    },
    {
        step_id: "step-2",
        tool_name: "nikto",
        step_order: 2,
        columns: ["url", "vulnerability"],
        rows: [],
        discovered_columns: {},
    },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderPanel(
    overrides: Partial<{
        selectedFormat: ReportFormatInfo;
        steps: StepSummary[];
        parsedSteps: ParsedStepData[];
        onChangeFormat: () => void;
        onClose: () => void;
        isExporting: boolean;
        onExport: (req: ScanReportRequest) => void;
    }> = {}
) {
    const props = {
        jobId: "job-123",
        selectedFormat: defaultFormat,
        steps,
        parsedSteps,
        onChangeFormat: vi.fn(),
        onClose: vi.fn(),
        isExporting: false,
        onExport: vi.fn(),
        ...overrides,
    };
    return { ...render(<ExportConfigPanel {...props} />), props };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ExportConfigPanel unit tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // Requirement 2.3 — All three step scope radio options render
    // -----------------------------------------------------------------------
    describe("step scope radio options (Requirement 2.3)", () => {
        it("renders the 'All steps' radio option", () => {
            renderPanel();
            expect(
                screen.getByRole("radio", { name: /all steps/i })
            ).toBeInTheDocument();
        });

        it("renders the 'Last step only' radio option", () => {
            renderPanel();
            expect(
                screen.getByRole("radio", { name: /last step only/i })
            ).toBeInTheDocument();
        });

        it("renders the 'Specific steps' radio option", () => {
            renderPanel();
            expect(
                screen.getByRole("radio", { name: /specific steps/i })
            ).toBeInTheDocument();
        });

        it("defaults to 'All steps' selected", () => {
            renderPanel();
            expect(screen.getByRole("radio", { name: /all steps/i })).toBeChecked();
            expect(
                screen.getByRole("radio", { name: /last step only/i })
            ).not.toBeChecked();
            expect(
                screen.getByRole("radio", { name: /specific steps/i })
            ).not.toBeChecked();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 2.5 — Download disabled + validation message when scope is
    //                   "specific" and no steps are checked
    // -----------------------------------------------------------------------
    describe("specific scope validation (Requirement 2.5)", () => {
        it("disables the download button when scope is 'specific' and no steps are checked", async () => {
            renderPanel();

            // Switch to "Specific steps"
            await userEvent.click(
                screen.getByRole("radio", { name: /specific steps/i })
            );

            const downloadBtn = screen.getByRole("button", { name: /download/i });
            expect(downloadBtn).toBeDisabled();
        });

        it("shows a validation message when scope is 'specific' and no steps are checked", async () => {
            renderPanel();

            await userEvent.click(
                screen.getByRole("radio", { name: /specific steps/i })
            );

            expect(
                screen.getByText(/select at least one step/i)
            ).toBeInTheDocument();
        });

        it("does NOT show the validation message when scope is 'all'", () => {
            renderPanel();
            expect(
                screen.queryByText(/select at least one step/i)
            ).not.toBeInTheDocument();
        });

        it("enables the download button after checking at least one step", async () => {
            renderPanel();

            await userEvent.click(
                screen.getByRole("radio", { name: /specific steps/i })
            );

            // Check the first step checkbox
            const checkboxes = screen.getAllByRole("checkbox");
            await userEvent.click(checkboxes[0]);

            const downloadBtn = screen.getByRole("button", { name: /download/i });
            expect(downloadBtn).not.toBeDisabled();
        });

        it("hides the validation message after checking at least one step", async () => {
            renderPanel();

            await userEvent.click(
                screen.getByRole("radio", { name: /specific steps/i })
            );

            const checkboxes = screen.getAllByRole("checkbox");
            await userEvent.click(checkboxes[0]);

            expect(
                screen.queryByText(/select at least one step/i)
            ).not.toBeInTheDocument();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 3.1 — Column filter section is collapsed by default
    // -----------------------------------------------------------------------
    describe("column filter section (Requirement 3.1)", () => {
        it("column filter section is collapsed by default", () => {
            renderPanel();

            // The toggle button should show aria-expanded="false"
            const toggleBtn = screen.getByRole("button", {
                name: /column filters/i,
            });
            expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
        });

        it("column checkboxes are not visible when section is collapsed", () => {
            renderPanel();

            // Columns like "host", "port", "service" should not be visible
            expect(screen.queryByLabelText(/^host$/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/^port$/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/^service$/i)).not.toBeInTheDocument();
        });

        it("expands the column filter section when the toggle is clicked", async () => {
            renderPanel();

            const toggleBtn = screen.getByRole("button", {
                name: /column filters/i,
            });
            await userEvent.click(toggleBtn);

            expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
        });

        it("shows column checkboxes after expanding the section", async () => {
            renderPanel();

            const toggleBtn = screen.getByRole("button", {
                name: /column filters/i,
            });
            await userEvent.click(toggleBtn);

            // Columns from parsedSteps should now be visible
            expect(screen.getByLabelText(/^host$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^port$/i)).toBeInTheDocument();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 3.4 — `columns` is omitted from request body when filter
    //                   is not used
    // -----------------------------------------------------------------------
    describe("columns omitted when filter not used (Requirement 3.4)", () => {
        it("omits 'columns' from the request body when column filter section is collapsed", async () => {
            const onExport = vi.fn();
            renderPanel({ onExport });

            // Click Download without expanding column filters
            const downloadBtn = screen.getByRole("button", { name: /download/i });
            await userEvent.click(downloadBtn);

            expect(onExport).toHaveBeenCalledTimes(1);
            const req: ScanReportRequest = onExport.mock.calls[0][0];
            expect(req).not.toHaveProperty("columns");
        });

        it("omits 'columns' from the request body when section is expanded but no columns are selected", async () => {
            const onExport = vi.fn();
            renderPanel({ onExport });

            // Expand column filters but don't check any column
            const toggleBtn = screen.getByRole("button", {
                name: /column filters/i,
            });
            await userEvent.click(toggleBtn);

            const downloadBtn = screen.getByRole("button", { name: /download/i });
            await userEvent.click(downloadBtn);

            expect(onExport).toHaveBeenCalledTimes(1);
            const req: ScanReportRequest = onExport.mock.calls[0][0];
            expect(req).not.toHaveProperty("columns");
        });

        it("includes 'columns' in the request body when at least one column is selected", async () => {
            const onExport = vi.fn();
            renderPanel({ onExport });

            // Expand column filters
            const toggleBtn = screen.getByRole("button", {
                name: /column filters/i,
            });
            await userEvent.click(toggleBtn);

            // Select the "host" column from step-1
            const hostCheckbox = screen.getByLabelText(/^host$/i);
            await userEvent.click(hostCheckbox);

            const downloadBtn = screen.getByRole("button", { name: /download/i });
            await userEvent.click(downloadBtn);

            expect(onExport).toHaveBeenCalledTimes(1);
            const req: ScanReportRequest = onExport.mock.calls[0][0];
            expect(req).toHaveProperty("columns");
            expect(req.columns).toEqual({ "step-1": ["host"] });
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 4.3 — Download button disabled while isExporting is true
    // -----------------------------------------------------------------------
    describe("download button disabled while exporting (Requirement 4.3)", () => {
        it("disables the download button when isExporting is true", () => {
            renderPanel({ isExporting: true });

            const downloadBtn = screen.getByRole("button", { name: /exporting/i });
            expect(downloadBtn).toBeDisabled();
        });

        it("shows 'Exporting…' text while isExporting is true", () => {
            renderPanel({ isExporting: true });

            expect(screen.getByText(/exporting…/i)).toBeInTheDocument();
        });

        it("shows 'Download' text when isExporting is false", () => {
            renderPanel({ isExporting: false });

            expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
        });

        it("enables the download button when isExporting is false and scope is 'all'", () => {
            renderPanel({ isExporting: false });

            const downloadBtn = screen.getByRole("button", { name: /download/i });
            expect(downloadBtn).not.toBeDisabled();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 2.3 — onChangeFormat is called when user clicks "Change format"
    // -----------------------------------------------------------------------
    describe("change format button", () => {
        it("calls onChangeFormat when the 'Change format' button is clicked", async () => {
            const onChangeFormat = vi.fn();
            renderPanel({ onChangeFormat });

            const changeFormatBtn = screen.getByRole("button", {
                name: /change format/i,
            });
            await userEvent.click(changeFormatBtn);

            expect(onChangeFormat).toHaveBeenCalledTimes(1);
        });

        it("does not call onExport when 'Change format' is clicked", async () => {
            const onExport = vi.fn();
            const onChangeFormat = vi.fn();
            renderPanel({ onExport, onChangeFormat });

            const changeFormatBtn = screen.getByRole("button", {
                name: /change format/i,
            });
            await userEvent.click(changeFormatBtn);

            expect(onExport).not.toHaveBeenCalled();
        });
    });
});
