// Feature: generate-report, Property 1: Manifest filtering — only implemented formats are shown

import { describe, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import type { ReportFormatInfo, ReportFormat } from "@/types/reports";

// Mock the RTK Query hook so we can control what data is returned
vi.mock("@/lib/redux/services/userdashboard/assets/reports-api", () => ({
    useGetReportManifestQuery: vi.fn(),
}));

// Mock DropdownMenuContent so it renders as a plain div (no Radix portal/context)
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenuContent: ({
        children,
        ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => <div {...rest}>{children}</div>,
}));

// Mock Skeleton so it renders as a plain div
vi.mock("@/components/ui/skeleton", () => ({
    default: ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
        <div className={className} {...rest} />
    ),
}));

// Mock FormatCard so each rendered card has a data-testid="format-card"
vi.mock("@/components/report/FormatCard", () => ({
    default: ({ format }: { format: ReportFormatInfo }) => (
        <div data-testid="format-card" data-format={format.format} />
    ),
}));

// Import after mocks are set up
import { useGetReportManifestQuery } from "@/lib/redux/services/userdashboard/assets/reports-api";
import ReportDropdown from "../ReportDropdown";

const mockUseGetReportManifestQuery = useGetReportManifestQuery as ReturnType<typeof vi.fn>;

const formatArbitrary = fc.constantFrom<ReportFormat>("json", "pdf", "excel", "docx");

const reportFormatInfoArbitrary = fc.record<ReportFormatInfo>({
    format: formatArbitrary,
    fileExtension: fc.string({ minLength: 1, maxLength: 10 }),
    contentType: fc.string({ minLength: 1 }),
    implemented: fc.boolean(),
    description: fc.string({ minLength: 1, maxLength: 200 }),
});

describe("ReportDropdown property tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Property 1: Manifest filtering — only implemented formats are shown
     * Validates: Requirements 1.2
     *
     * For any ReportManifestResponse containing a mix of implemented and
     * non-implemented formats, the ReportDropdown SHALL render exactly the
     * subset of FormatCard elements whose `implemented` field is `true`.
     */
    it("Property 1: renders exactly the implemented formats for any array of ReportFormatInfo", () => {
        fc.assert(
            fc.property(
                fc.array(reportFormatInfoArbitrary, { minLength: 0, maxLength: 20 }),
                (formats) => {
                    const expectedCount = formats.filter((f) => f.implemented).length;

                    mockUseGetReportManifestQuery.mockReturnValue({
                        data: { formats },
                        isLoading: false,
                        isError: false,
                        error: undefined,
                        refetch: vi.fn(),
                    });

                    const { unmount } = render(
                        <ReportDropdown
                            jobId="test-job-id"
                            open={true}
                            onClose={vi.fn()}
                            onSelectFormat={vi.fn()}
                        />
                    );

                    const cards = screen.queryAllByTestId("format-card");
                    const actualCount = cards.length;

                    unmount();

                    return actualCount === expectedCount;
                }
            ),
            { numRuns: 100 }
        );
    });
});
