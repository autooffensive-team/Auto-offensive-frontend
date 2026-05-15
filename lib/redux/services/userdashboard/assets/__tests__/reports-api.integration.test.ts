/**
 * Integration tests for the reports RTK Query endpoints.
 *
 * Uses MSW to intercept HTTP requests so the real RTK Query / fetchBaseQuery
 * pipeline runs end-to-end without hitting a real server.
 *
 * Task 9.1 — getReportManifest
 * Task 9.2 — exportScanReport
 *
 * @vitest-environment node
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
    createApi,
    fetchBaseQuery,
    setupListeners,
} from "@reduxjs/toolkit/query";
import { configureStore } from "@reduxjs/toolkit";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { extractFilenameFromDisposition } from "../reports-api";
import type { ReportManifestResponse, ScanReportRequest } from "@/types/reports";

// ---------------------------------------------------------------------------
// Test-specific API
//
// We cannot use the production `baseApi` directly in a Node environment
// because it uses a relative `baseUrl: ""` which requires `window.location`
// to resolve. Instead we create a minimal test API with an absolute base URL
// that MSW can intercept.
// ---------------------------------------------------------------------------

const TEST_ORIGIN = "http://localhost";

/**
 * Mirrors the production `resolveProxyUrl` logic but with an absolute base.
 * Any path that doesn't start with a known prefix is routed to /api/backend/.
 */
function resolveTestUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    const normalized = url.replace(/^\/+/, "");
    return `${TEST_ORIGIN}/api/backend/${normalized}`;
}

const testBaseApi = createApi({
    reducerPath: "testBaseApi",
    baseQuery: (args, api, extraOptions) => {
        const rawQuery = fetchBaseQuery({ baseUrl: TEST_ORIGIN });
        if (typeof args === "string") {
            return rawQuery(resolveTestUrl(args), api, extraOptions);
        }
        return rawQuery(
            { ...args, url: resolveTestUrl(args.url) },
            api,
            extraOptions,
        );
    },
    tagTypes: ["Report"],
    endpoints: () => ({}),
});

// Inject the same endpoint definitions used in production
const testReportsApi = testBaseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReportManifest: builder.query<ReportManifestResponse, string>({
            query: (jobId) => `scans/jobs/${jobId}/reports`,
        }),

        exportScanReport: builder.mutation<
            void,
            { jobId: string; body: ScanReportRequest }
        >({
            queryFn: async ({ jobId, body }, _api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: `scans/jobs/${jobId}/export`,
                    method: "POST",
                    body,
                    responseHandler: (response: Response) => Promise.resolve(response),
                });

                if (result.error) {
                    return { error: result.error };
                }

                const response = result.data as Response;

                const disposition = response.headers.get("Content-Disposition") ?? "";
                const filename =
                    extractFilenameFromDisposition(disposition) ??
                    `report.${body.format}`;

                let url: string | null = null;
                try {
                    const blob = await response.blob();
                    url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);
                    url = null;

                    return { data: undefined };
                } catch (err) {
                    if (url !== null) {
                        URL.revokeObjectURL(url);
                    }
                    return {
                        error: {
                            status: "CUSTOM_ERROR" as const,
                            error: err instanceof Error ? err.message : "Unknown error",
                        },
                    };
                }
            },
        }),
    }),
});

function makeTestStore() {
    const store = configureStore({
        reducer: {
            [testBaseApi.reducerPath]: testBaseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(testBaseApi.middleware),
    });
    setupListeners(store.dispatch);
    return store;
}

// ---------------------------------------------------------------------------
// MSW server
// ---------------------------------------------------------------------------

const JOB_ID = "job-abc-123";
const BASE_URL = `${TEST_ORIGIN}/api/backend`;

const MANIFEST_RESPONSE: ReportManifestResponse = {
    jobId: JOB_ID,
    generatedAt: "2024-01-01T00:00:00Z",
    formats: [
        {
            format: "pdf",
            fileExtension: ".pdf",
            contentType: "application/pdf",
            implemented: true,
            description: "Export as a portable document",
        },
        {
            format: "json",
            fileExtension: ".json",
            contentType: "application/json",
            implemented: false,
            description: "Export as JSON",
        },
    ],
};

// Binary content for the export endpoint
const BINARY_CONTENT = new Uint8Array([37, 80, 68, 70]); // %PDF magic bytes
const REPORT_FILENAME = "test-report.pdf";

// Mutable variables written by the MSW handler and read by tests
let lastExportRequestBody: ScanReportRequest | null = null;
let lastExportContentType = "";

const server = setupServer(
    // 9.1 — GET manifest
    http.get(`${BASE_URL}/scans/jobs/:jobId/reports`, ({ params }) => {
        if (params.jobId !== JOB_ID) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(MANIFEST_RESPONSE);
    }),

    // 9.2 — POST export (returns binary blob with Content-Disposition)
    http.post(`${BASE_URL}/scans/jobs/:jobId/export`, async ({ request, params }) => {
        if (params.jobId !== JOB_ID) {
            return new HttpResponse(null, { status: 404 });
        }

        lastExportRequestBody = (await request.json()) as ScanReportRequest;
        lastExportContentType = request.headers.get("content-type") ?? "";

        return new HttpResponse(BINARY_CONTENT, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${REPORT_FILENAME}"`,
            },
        });
    }),
);

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
    server.resetHandlers();
    lastExportRequestBody = null;
    lastExportContentType = "";
});

afterAll(() => server.close());

// ---------------------------------------------------------------------------
// Task 9.1 — getReportManifest integration tests
// ---------------------------------------------------------------------------

describe("getReportManifest — integration", () => {
    it("constructs the correct URL and returns typed ReportManifestResponse data", async () => {
        const store = makeTestStore();

        const result = await store.dispatch(
            testReportsApi.endpoints.getReportManifest.initiate(JOB_ID),
        );

        expect(result.data).toEqual(MANIFEST_RESPONSE);
        expect(result.error).toBeUndefined();
    });

    it("returns the formats array with correct shape", async () => {
        const store = makeTestStore();

        const result = await store.dispatch(
            testReportsApi.endpoints.getReportManifest.initiate(JOB_ID),
        );

        const data = result.data as ReportManifestResponse;
        expect(data.jobId).toBe(JOB_ID);
        expect(data.formats).toHaveLength(2);
        expect(data.formats[0].format).toBe("pdf");
        expect(data.formats[0].implemented).toBe(true);
        expect(data.formats[1].implemented).toBe(false);
    });

    it("returns an error when the server responds with 404", async () => {
        const store = makeTestStore();

        const result = await store.dispatch(
            testReportsApi.endpoints.getReportManifest.initiate("nonexistent-job"),
        );

        expect(result.error).toBeDefined();
        expect(result.data).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// Task 9.2 — exportScanReport integration tests
// ---------------------------------------------------------------------------

describe("exportScanReport — integration", () => {
    // DOM mocks — the mutation uses document.createElement, URL.createObjectURL, etc.
    let mockAnchor: {
        href: string;
        download: string;
        click: ReturnType<typeof vi.fn>;
    };

    const FAKE_OBJECT_URL = "blob:http://localhost/fake-object-url";

    let createElementFn: ReturnType<typeof vi.fn>;
    let appendChildFn: ReturnType<typeof vi.fn>;
    let removeChildFn: ReturnType<typeof vi.fn>;
    let createObjectURLFn: ReturnType<typeof vi.fn>;
    let revokeObjectURLFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockAnchor = { href: "", download: "", click: vi.fn() };

        createElementFn = vi.fn((tag: string) => {
            if (tag === "a") return mockAnchor;
            return {};
        });
        appendChildFn = vi.fn((node: unknown) => node);
        removeChildFn = vi.fn((node: unknown) => node);
        createObjectURLFn = vi.fn(() => FAKE_OBJECT_URL);
        revokeObjectURLFn = vi.fn();

        // Stub globals so the mutation code can access them at runtime.
        vi.stubGlobal("document", {
            createElement: createElementFn,
            body: {
                appendChild: appendChildFn,
                removeChild: removeChildFn,
            },
        });

        // Preserve the URL constructor while mocking the static methods.
        // We need `new URL(...)` to keep working inside fetchBaseQuery.
        const OriginalURL = globalThis.URL;
        vi.stubGlobal("URL", Object.assign(
            function URL(...args: ConstructorParameters<typeof OriginalURL>) {
                return new OriginalURL(...args);
            },
            {
                createObjectURL: createObjectURLFn,
                revokeObjectURL: revokeObjectURLFn,
                // Preserve any other static methods
                canParse: OriginalURL.canParse?.bind(OriginalURL),
                parse: OriginalURL.parse?.bind(OriginalURL),
            },
        ));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const EXPORT_BODY: ScanReportRequest = {
        format: "pdf",
        step_scope: "all",
    };

    it("sends a POST request with Content-Type: application/json body", async () => {
        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        // RTK Query's fetchBaseQuery serialises the body as JSON and sets the
        // Content-Type header automatically.
        expect(lastExportContentType).toContain("application/json");
        expect(lastExportRequestBody).toEqual(EXPORT_BODY);
    });

    it("extracts the filename from the Content-Disposition header and sets it as a.download", async () => {
        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        // The anchor's download attribute must equal the filename from the header
        expect(mockAnchor.download).toBe(REPORT_FILENAME);
    });

    it("sets the object URL as the anchor href before clicking", async () => {
        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        expect(mockAnchor.href).toBe(FAKE_OBJECT_URL);
        expect(mockAnchor.click).toHaveBeenCalledOnce();
    });

    it("revokes the object URL after the anchor click using the same URL that was created", async () => {
        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        // URL.createObjectURL must have been called once
        expect(createObjectURLFn).toHaveBeenCalledOnce();

        // URL.revokeObjectURL must be called with the exact URL that was created
        expect(revokeObjectURLFn).toHaveBeenCalledOnce();
        expect(revokeObjectURLFn).toHaveBeenCalledWith(FAKE_OBJECT_URL);
    });

    it("appends the anchor to the body and removes it after the click", async () => {
        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        expect(appendChildFn).toHaveBeenCalledWith(mockAnchor);
        expect(removeChildFn).toHaveBeenCalledWith(mockAnchor);
    });

    it("falls back to report.<format> when Content-Disposition header is absent", async () => {
        server.use(
            http.post(`${BASE_URL}/scans/jobs/:jobId/export`, async ({ request }) => {
                lastExportRequestBody = (await request.json()) as ScanReportRequest;
                lastExportContentType = request.headers.get("content-type") ?? "";
                return new HttpResponse(BINARY_CONTENT, {
                    status: 200,
                    headers: { "Content-Type": "application/pdf" },
                    // No Content-Disposition header
                });
            }),
        );

        const store = makeTestStore();

        await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        // Falls back to `report.<format>`
        expect(mockAnchor.download).toBe(`report.${EXPORT_BODY.format}`);
    });

    it("returns an error result and does not trigger a download on HTTP error", async () => {
        server.use(
            http.post(`${BASE_URL}/scans/jobs/:jobId/export`, () => {
                return new HttpResponse(null, { status: 500 });
            }),
        );

        const store = makeTestStore();

        const result = await store.dispatch(
            testReportsApi.endpoints.exportScanReport.initiate({
                jobId: JOB_ID,
                body: EXPORT_BODY,
            }),
        );

        expect(result.error).toBeDefined();
        // No anchor click should have been triggered
        expect(mockAnchor.click).not.toHaveBeenCalled();
    });
});
