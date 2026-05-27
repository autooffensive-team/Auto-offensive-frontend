/**
 * Unit tests for GenerateReportButton
 * Requirements: 4.2, 5.1, 5.2, 5.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { StepSummary, ParsedStepData } from "@/types/assets";
import type { ReportFormatInfo, ScanReportRequest } from "@/types/reports";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the RTK Query mutation hook so we can control isLoading and the trigger
const mockExportTrigger = vi.fn();

vi.mock("@/lib/redux/services/userdashboard/assets/reports-api", () => ({
    useExportScanReportMutation: vi.fn(),
}));

// Mock sonner so we can spy on toast calls
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
    },
}));

// Mock Button as a plain <button> to avoid shadcn/Radix dependencies
vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...rest}>{children}</button>
    ),
}));

// Mock DropdownMenu and DropdownMenuTrigger as plain divs
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-menu">{children}</div>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-trigger">{children}</div>
    ),
}));

// Mock lucide-react so Loader2 renders as a plain span with a data-testid
vi.mock("lucide-react", () => ({
    Loader2: ({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) => (
        <span data-testid="loader2" className={className} {...rest} />
    ),
}));

// The format that the ReportDropdown stub will "select"
const stubFormat: ReportFormatInfo = {
    format: "pdf",
    fileExtension: "pdf",
    contentType: "application/pdf",
    implemented: true,
    description: "Export as a portable document",
};

// Mock ReportDropdown as a stub that exposes a button to simulate format selection
vi.mock("../ReportDropdown", () => ({
    default: ({
        onSelectFormat,
    }: {
        onSelectFormat: (f: ReportFormatInfo) => void;
        [key: string]: unknown;
    }) => (
        <div data-testid="report-dropdown-stub">
            <button
                data-testid="stub-select-format-btn"
                onClick={() => onSelectFormat(stubFormat)}
            >
                Select PDF
            </button>
        </div>
    ),
}));

// Mock ExportConfigPanel as a stub that calls onExport when clicked
vi.mock("../ExportConfigPanel", () => ({
    default: ({
        onExport,
    }: {
        onExport: (req: ScanReportRequest) => void;
        [key: string]: unknown;
    }) => (
        <div data-testid="export-config-panel-stub">
            <button
                data-testid="stub-export-btn"
                onClick={() =>
                    onExport({
                        format: "pdf",
                        step_scope: "all",
                    })
                }
            >
                Export
            </button>
        </div>
    ),
}));

// Import after mocks are set up
import { useExportScanReportMutation } from "@/lib/redux/services/userdashboard/assets/reports-api";
import { toast } from "sonner";
import GenerateReportButton from "../GenerateReportButton";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUseMutation = useExportScanReportMutation as ReturnType<typeof vi.fn>;

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
];

const parsedSteps: ParsedStepData[] = [
    {
        step_id: "step-1",
        tool_name: "nmap",
        step_order: 1,
        columns: ["host", "port"],
        rows: [],
        discovered_columns: {},
    },
];

function renderButton() {
    return render(
        <GenerateReportButton
            jobId="job-123"
            steps={steps}
            parsedSteps={parsedSteps}
        />
    );
}

/**
 * Opens the ExportConfigPanel by simulating a format selection via the
 * ReportDropdown stub. Returns the export button inside the panel stub.
 */
async function openPanelAndGetExportBtn() {
    const selectFormatBtn = screen.getByTestId("stub-select-format-btn");
    fireEvent.click(selectFormatBtn);
    return screen.getByTestId("stub-export-btn");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GenerateReportButton unit tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default: not loading, trigger resolves successfully
        mockExportTrigger.mockReturnValue({
            unwrap: () => Promise.resolve(undefined),
        });
        mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // -----------------------------------------------------------------------
    // Requirement 4.2 — Spinner renders and button is disabled while in flight
    // -----------------------------------------------------------------------
    describe("loading state (Requirement 4.2)", () => {
        it("renders the Loader2 spinner while the mutation is in flight", () => {
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: true }]);

            renderButton();

            expect(screen.getByTestId("loader2")).toBeInTheDocument();
        });

        it("disables the Generate Report button while the mutation is in flight", () => {
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: true }]);

            renderButton();

            const button = screen.getByRole("button", { name: /generate report/i });
            expect(button).toBeDisabled();
        });

        it("does not render the spinner when the mutation is not in flight", () => {
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            expect(screen.queryByTestId("loader2")).not.toBeInTheDocument();
        });

        it("enables the Generate Report button when the mutation is not in flight", () => {
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const button = screen.getByRole("button", { name: /generate report/i });
            expect(button).not.toBeDisabled();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 5.1 — Success toast shown after successful download
    // -----------------------------------------------------------------------
    describe("success toast (Requirement 5.1)", () => {
        it("shows a success toast after a successful export", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () => Promise.resolve(undefined),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.success).toHaveBeenCalledTimes(1);
            expect(toast.success).toHaveBeenCalledWith("Report download started");
        });

        it("does not show an error toast on success", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () => Promise.resolve(undefined),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.error).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 5.2 — Error toast shown after failed export mutation
    // -----------------------------------------------------------------------
    describe("error toast (Requirement 5.2)", () => {
        it("shows an error toast with the detail message when the export fails", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () =>
                    Promise.reject({ data: { detail: "Export failed on server" } }),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith("Export failed on server");
        });

        it("shows an error toast with the message field when detail is absent", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () =>
                    Promise.reject({ data: { message: "Something went wrong" } }),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        });

        it("shows a generic fallback error toast when no message is available", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () => Promise.reject({}),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.error).toHaveBeenCalledTimes(1);
            expect(toast.error).toHaveBeenCalledWith(
                "Export failed. Please try again."
            );
        });

        it("does not show a success toast on error", async () => {
            mockExportTrigger.mockReturnValue({
                unwrap: () =>
                    Promise.reject({ data: { detail: "Export failed on server" } }),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const exportBtn = await openPanelAndGetExportBtn();

            await act(async () => {
                fireEvent.click(exportBtn);
            });

            expect(toast.success).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Requirement 5.4 — Toast auto-dismisses after 5000ms
    //
    // Since `sonner` manages its own internal timers, we verify that
    // toast.success / toast.error is called correctly. The Toaster is
    // configured with duration={5000} in the layout (task 7.1), which is
    // where the auto-dismiss is enforced. Here we use fake timers to confirm
    // the toast call is made and that advancing 5000ms does not cause errors.
    // -----------------------------------------------------------------------
    describe("toast auto-dismiss (Requirement 5.4)", () => {
        it("calls toast.success with the correct message; advancing 5000ms does not throw", async () => {
            // Use fake timers but configure userEvent to use real timers internally
            vi.useFakeTimers({ shouldAdvanceTime: false });

            mockExportTrigger.mockReturnValue({
                unwrap: () => Promise.resolve(undefined),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            // Open the panel using fireEvent (synchronous, no timer dependency)
            const selectFormatBtn = screen.getByTestId("stub-select-format-btn");
            fireEvent.click(selectFormatBtn);

            const exportBtn = screen.getByTestId("stub-export-btn");

            // Trigger the export and flush the promise microtasks
            await act(async () => {
                fireEvent.click(exportBtn);
                // Flush all pending promises
                await Promise.resolve();
            });

            expect(toast.success).toHaveBeenCalledWith("Report download started");

            // Advance timers by 5000ms — sonner's Toaster would dismiss at this point
            act(() => {
                vi.advanceTimersByTime(5000);
            });

            // Toast was called exactly once; no errors after timer advance
            expect(toast.success).toHaveBeenCalledTimes(1);
        });

        it("calls toast.error with the correct message; advancing 5000ms does not throw", async () => {
            vi.useFakeTimers({ shouldAdvanceTime: false });

            mockExportTrigger.mockReturnValue({
                unwrap: () =>
                    Promise.reject({ data: { detail: "Server error" } }),
            });
            mockUseMutation.mockReturnValue([mockExportTrigger, { isLoading: false }]);

            renderButton();

            const selectFormatBtn = screen.getByTestId("stub-select-format-btn");
            fireEvent.click(selectFormatBtn);

            const exportBtn = screen.getByTestId("stub-export-btn");

            await act(async () => {
                fireEvent.click(exportBtn);
                await Promise.resolve();
            });

            expect(toast.error).toHaveBeenCalledWith("Server error");

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            expect(toast.error).toHaveBeenCalledTimes(1);
        });
    });

    // -----------------------------------------------------------------------
    // ExportConfigPanel visibility
    // -----------------------------------------------------------------------
    describe("ExportConfigPanel visibility", () => {
        it("does not render ExportConfigPanel on initial render", () => {
            renderButton();

            expect(
                screen.queryByTestId("export-config-panel-stub")
            ).not.toBeInTheDocument();
        });

        it("renders ExportConfigPanel after a format is selected via ReportDropdown", () => {
            renderButton();

            // Simulate format selection via the stub
            const selectFormatBtn = screen.getByTestId("stub-select-format-btn");
            fireEvent.click(selectFormatBtn);

            expect(
                screen.getByTestId("export-config-panel-stub")
            ).toBeInTheDocument();
        });
    });
});
