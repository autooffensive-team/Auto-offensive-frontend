/**
 * Component tests for the server-driven ScanResultsView (Task 7.4).
 *
 * These tests exercise the per-step server-side pagination + search behaviors
 * of `StepSection` inside `ScanResultsView`:
 *   - Initial render requests page=1, page_size=10 (no search)
 *   - Changing page/size issues a new request and replaces the displayed rows
 *   - Controls reflect server-provided page / total_pages / total_rows
 *   - Loading shows a body indicator while the controls stay mounted
 *   - Per-step pagination state is independent
 *   - Errors show a Retry button that refetches with preserved args
 *   - Search is debounced at 300ms -> a single request resetting to page 1
 *   - Clearing search drops the `search` arg and resets to page 1
 *   - Filtered count is rendered next to the search box
 *   - Search input enforces maxLength=200
 *
 * Strategy: RTK Query is mocked at the assets-api module boundary. The
 * `useGetStepParsedDataQuery` mock behaves like a tiny in-memory server: it
 * records every call's args and computes filter+paginate results so that the
 * rendered rows/controls are genuinely server-driven. React Testing Library is
 * used with Vitest fake timers to drive the 300ms search debounce.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    render,
    screen,
    fireEvent,
    within,
    act,
    cleanup,
} from "@testing-library/react";

import type { JobDetails, StepParsedDataResponse } from "@/types/assets";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// framer-motion's animations rely on requestAnimationFrame which interacts
// badly with fake timers. Replace `motion.*` with plain DOM elements that strip
// framer-only props so React doesn't warn about unknown DOM attributes.
vi.mock("framer-motion", async () => {
    const React = await import("react");
    const FRAMER_PROPS = new Set([
        "initial",
        "animate",
        "exit",
        "transition",
        "whileHover",
        "whileTap",
        "whileFocus",
        "whileInView",
        "viewport",
        "variants",
        "layout",
        "layoutId",
        "drag",
        "dragConstraints",
        "onAnimationComplete",
        "custom",
    ]);
    const motion = new Proxy(
        {},
        {
            get: (_target, tag: string) =>
                React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
                    const clean: Record<string, unknown> = {};
                    for (const key of Object.keys(props)) {
                        if (!FRAMER_PROPS.has(key)) clean[key] = props[key];
                    }
                    return React.createElement(tag, { ...clean, ref });
                }),
        },
    );
    return {
        __esModule: true,
        motion,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
});

// Hoisted mock fns for the assets-api hooks consumed by ScanResultsView.
const apiMocks = vi.hoisted(() => ({
    useGetJobDetailsQuery: vi.fn(),
    useGetJobParsedDataQuery: vi.fn(),
    useGetStepParsedDataQuery: vi.fn(),
}));

vi.mock(
    "@/lib/redux/services/userdashboard/assets/assets-api",
    () => ({
        useGetJobDetailsQuery: apiMocks.useGetJobDetailsQuery,
        useGetJobParsedDataQuery: apiMocks.useGetJobParsedDataQuery,
        useGetStepParsedDataQuery: apiMocks.useGetStepParsedDataQuery,
    }),
);

// Import the component AFTER the mocks are registered.
import ScanResultsView from "../ScanResultsView";

// ---------------------------------------------------------------------------
// Fake "server" backing the useGetStepParsedDataQuery mock
// ---------------------------------------------------------------------------

type StepFixture = {
    columns: string[];
    rows: Record<string, unknown>[];
    toolName: string;
    jobId: string;
};

type StepQueryArgs = {
    stepId: string;
    page?: number;
    page_size?: number;
    search?: string;
};

const fixtures = new Map<string, StepFixture>();
const stepFlags = new Map<string, { isFetching?: boolean; isError?: boolean }>();
let stepCalls: StepQueryArgs[] = [];
const refetchMock = vi.fn();

function computeResponse(
    fixture: StepFixture,
    args: StepQueryArgs,
): StepParsedDataResponse {
    const page = args.page ?? 1;
    const pageSize = args.page_size ?? 10;
    const search = (args.search ?? "").toString().toLowerCase();
    const filtered = search
        ? fixture.rows.filter((row) =>
            Object.values(row).some(
                (value) =>
                    value != null && String(value).toLowerCase().includes(search),
            ),
        )
        : fixture.rows;
    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const start = (page - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);
    return {
        step_id: args.stepId,
        job_id: fixture.jobId,
        tool_name: fixture.toolName,
        columns: fixture.columns,
        rows,
        discovered_columns: {},
        total_rows: totalRows,
        total_pages: totalPages,
        page,
        page_size: pageSize,
    };
}

function buildJobDetails(
    steps: { stepId: string; order: number; tool: string }[],
): JobDetails {
    return {
        job_id: "job-1",
        project_id: "project-1",
        target_name: "example.com",
        status: "completed",
        total_steps: steps.length,
        completed_steps: steps.length,
        failed_steps: 0,
        pending_steps: 0,
        total_findings: 42,
        execution_mode: "unknown",
        created_at: null,
        started_at: null,
        finished_at: null,
        steps: steps.map((s) => ({
            step_id: s.stepId,
            tool_name: s.tool,
            step_order: s.order,
            status: "completed",
            findings_count: 0,
            started_at: null,
            finished_at: null,
        })),
    };
}

/** Build a fixture of `count` rows with `host`/`port` columns. */
function makeRows(count: number): Record<string, unknown>[] {
    return Array.from({ length: count }, (_, i) => ({
        host: `host-${i + 1}`,
        port: 1000 + i + 1,
    }));
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.useFakeTimers();
    fixtures.clear();
    stepFlags.clear();
    stepCalls = [];
    refetchMock.mockReset();
    apiMocks.useGetJobDetailsQuery.mockReset();
    apiMocks.useGetJobParsedDataQuery.mockReset();
    apiMocks.useGetStepParsedDataQuery.mockReset();

    // The report query is irrelevant here (we render with hideReportButton).
    apiMocks.useGetJobParsedDataQuery.mockReturnValue({ data: undefined });

    apiMocks.useGetStepParsedDataQuery.mockImplementation(
        (args: StepQueryArgs) => {
            stepCalls.push({ ...args });
            const flags = stepFlags.get(args.stepId) ?? {};
            if (flags.isError) {
                return {
                    data: undefined,
                    isFetching: false,
                    isError: true,
                    refetch: refetchMock,
                };
            }
            const fixture = fixtures.get(args.stepId);
            const data = fixture ? computeResponse(fixture, args) : undefined;
            return {
                data,
                isFetching: flags.isFetching ?? false,
                isError: false,
                refetch: refetchMock,
            };
        },
    );
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function configureSingleStep(rowCount = 25) {
    fixtures.set("step-1", {
        columns: ["host", "port"],
        rows: makeRows(rowCount),
        toolName: "nmap",
        jobId: "job-1",
    });
    apiMocks.useGetJobDetailsQuery.mockReturnValue({
        data: buildJobDetails([{ stepId: "step-1", order: 1, tool: "nmap" }]),
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    });
}

function renderView() {
    return render(<ScanResultsView jobId="job-1" hideReportButton />);
}

/** Returns the section root element for the step heading matching `re`. */
function sectionFor(re: RegExp): HTMLElement {
    const heading = screen.getByText(re);
    const header = heading.closest("div");
    if (!header || !header.parentElement) {
        throw new Error(`Could not locate section for ${re}`);
    }
    return header.parentElement as HTMLElement;
}

function lastStepCall(stepId?: string): StepQueryArgs {
    const calls = stepId
        ? stepCalls.filter((c) => c.stepId === stepId)
        : stepCalls;
    return calls[calls.length - 1];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ScanResultsView — initial request (Req 5.1)", () => {
    it("requests page=1 and page_size=10 with no search on initial render", () => {
        configureSingleStep();
        renderView();

        expect(apiMocks.useGetStepParsedDataQuery).toHaveBeenCalled();
        const first = stepCalls[0];
        expect(first.stepId).toBe("step-1");
        expect(first.page).toBe(1);
        expect(first.page_size).toBe(10);
        expect(first.search).toBeUndefined();
    });

    it("renders the first 10 rows and server pagination metadata (Req 5.3)", () => {
        configureSingleStep(25);
        renderView();

        // First page rows present, later-page rows absent.
        expect(screen.getByText("host-1")).toBeInTheDocument();
        expect(screen.getByText("host-10")).toBeInTheDocument();
        expect(screen.queryByText("host-11")).not.toBeInTheDocument();

        // Controls reflect server total_pages (3) and total_rows (25).
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
        expect(screen.getByText(/Showing 1 to 10 of 25/)).toBeInTheDocument();
    });
});

describe("ScanResultsView — pagination requests (Req 5.2, 5.3)", () => {
    it("issues a new request and replaces rows when the page changes", () => {
        configureSingleStep(25);
        renderView();

        fireEvent.click(screen.getByLabelText("Next page"));

        const last = lastStepCall("step-1");
        expect(last.page).toBe(2);
        expect(last.page_size).toBe(10);

        // Rows were replaced with page-2 data.
        expect(screen.getByText("host-11")).toBeInTheDocument();
        expect(screen.queryByText("host-1")).not.toBeInTheDocument();
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
        expect(screen.getByText(/Showing 11 to 20 of 25/)).toBeInTheDocument();
    });

    it("requests page_size=25 and resets to page 1 when page size changes (Req 5.4)", () => {
        configureSingleStep(25);
        renderView();

        // Move to page 2 first to prove the reset.
        fireEvent.click(screen.getByLabelText("Next page"));
        expect(lastStepCall("step-1").page).toBe(2);

        fireEvent.change(screen.getByLabelText("Page size"), {
            target: { value: "25" },
        });

        const last = lastStepCall("step-1");
        expect(last.page_size).toBe(25);
        expect(last.page).toBe(1);
        // All 25 rows fit on one page now.
        expect(screen.getByText("1 / 1")).toBeInTheDocument();
    });
});

describe("ScanResultsView — loading indicator (Req 5.5)", () => {
    it("shows a body loading indicator while keeping the controls mounted", () => {
        configureSingleStep(25);
        stepFlags.set("step-1", { isFetching: true });
        const { container } = renderView();

        // Body spinner present (lucide Loader2 carries the animate-spin class).
        expect(container.querySelector(".animate-spin")).not.toBeNull();
        // Pagination controls remain mounted with their current values.
        expect(screen.getByText(/Showing 1 to 10 of 25/)).toBeInTheDocument();
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
        // Search input stays mounted too.
        expect(screen.getByPlaceholderText("Search results...")).toBeInTheDocument();
    });
});

describe("ScanResultsView — independent per-step state (Req 5.6)", () => {
    it("changing one step's page does not affect another step", () => {
        fixtures.set("step-a", {
            columns: ["host", "port"],
            rows: makeRows(25),
            toolName: "alpha",
            jobId: "job-1",
        });
        fixtures.set("step-b", {
            columns: ["host", "port"],
            rows: makeRows(25),
            toolName: "beta",
            jobId: "job-1",
        });
        apiMocks.useGetJobDetailsQuery.mockReturnValue({
            data: buildJobDetails([
                { stepId: "step-a", order: 2, tool: "alpha" },
                { stepId: "step-b", order: 1, tool: "beta" },
            ]),
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        renderView();

        // Advance step-a (order 2) to page 2.
        const sectionA = sectionFor(/Step 2 —/);
        fireEvent.click(within(sectionA).getByLabelText("Next page"));

        // step-a got a page-2 request; step-b never left page 1.
        expect(
            stepCalls.some((c) => c.stepId === "step-a" && c.page === 2),
        ).toBe(true);
        expect(
            stepCalls
                .filter((c) => c.stepId === "step-b")
                .every((c) => c.page === 1),
        ).toBe(true);

        // UI reflects the divergence.
        expect(within(sectionA).getByText("2 / 3")).toBeInTheDocument();
        const sectionB = sectionFor(/Step 1 —/);
        expect(within(sectionB).getByText("1 / 3")).toBeInTheDocument();
    });
});

describe("ScanResultsView — error and retry (Req 5.7)", () => {
    it("shows a Retry button that refetches while preserving the current args", () => {
        configureSingleStep(25);
        stepFlags.set("step-1", { isError: true });
        renderView();

        expect(
            screen.getByText("Failed to load results. Please try again."),
        ).toBeInTheDocument();

        // The query keeps being issued with the preserved page/size/search.
        const last = lastStepCall("step-1");
        expect(last.page).toBe(1);
        expect(last.page_size).toBe(10);
        expect(last.search).toBeUndefined();

        fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
        expect(refetchMock).toHaveBeenCalledTimes(1);
    });
});

describe("ScanResultsView — search debounce (Req 6.1, 6.2)", () => {
    it("debounces input by 300ms and issues a single request resetting to page 1", () => {
        configureSingleStep(25);
        renderView();

        const input = screen.getByPlaceholderText("Search results...");

        // Staged typing collapses to a single debounced request.
        fireEvent.change(input, { target: { value: "h" } });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        fireEvent.change(input, { target: { value: "ho" } });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        fireEvent.change(input, { target: { value: "host-13" } });

        // Before the debounce elapses, no search arg has been sent.
        expect(stepCalls.every((c) => !c.search)).toBe(true);
        act(() => {
            vi.advanceTimersByTime(299);
        });
        expect(stepCalls.every((c) => !c.search)).toBe(true);

        // Crossing 300ms produces exactly the final value, page reset to 1.
        act(() => {
            vi.advanceTimersByTime(1);
        });
        const last = lastStepCall("step-1");
        expect(last.search).toBe("host-13");
        expect(last.page).toBe(1);

        // Intermediate values never reached the server.
        expect(
            stepCalls.some((c) => c.search === "h" || c.search === "ho"),
        ).toBe(false);
    });

    it("resets to page 1 when a search value settles after navigating away", () => {
        configureSingleStep(25);
        renderView();

        fireEvent.click(screen.getByLabelText("Next page"));
        expect(lastStepCall("step-1").page).toBe(2);

        fireEvent.change(screen.getByPlaceholderText("Search results..."), {
            target: { value: "host-13" },
        });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const last = lastStepCall("step-1");
        expect(last.search).toBe("host-13");
        expect(last.page).toBe(1);
    });
});

describe("ScanResultsView — clearing search (Req 6.4)", () => {
    it("drops the search arg and resets to page 1 when the input is cleared", () => {
        configureSingleStep(25);
        renderView();

        const input = screen.getByPlaceholderText("Search results...");

        fireEvent.change(input, { target: { value: "host-13" } });
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(lastStepCall("step-1").search).toBe("host-13");

        fireEvent.change(input, { target: { value: "" } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        const last = lastStepCall("step-1");
        expect(last.search).toBeUndefined();
        expect(last.page).toBe(1);
    });
});

describe("ScanResultsView — filtered count and input limits (Req 6.3, 6.5)", () => {
    it("renders the filtered row count next to the search box", () => {
        configureSingleStep(25);
        renderView();

        // Unfiltered count.
        expect(screen.getByText(/^25 rows$/)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText("Search results..."), {
            target: { value: "host-13" },
        });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Filtered count (single match for "host-13").
        expect(screen.getByText(/^1 row$/)).toBeInTheDocument();
    });

    it("limits the search input to 200 characters", () => {
        configureSingleStep(25);
        renderView();

        expect(screen.getByPlaceholderText("Search results...")).toHaveAttribute(
            "maxlength",
            "200",
        );
    });
});
