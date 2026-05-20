import { baseApi } from "@/lib/redux/services/base-api";
import type {
    ReportManifestResponse,
    ScanReportRequest,
} from "@/types/reports";

/**
 * Extracts the filename from a Content-Disposition header value.
 *
 * Handles the standard `attachment; filename="<name>"` form.
 * Returns `null` if the header does not contain a quoted filename.
 *
 * @example
 * extractFilenameFromDisposition('attachment; filename="report.pdf"') // "report.pdf"
 * extractFilenameFromDisposition('inline')                            // null
 */
export function extractFilenameFromDisposition(
    header: string,
): string | null {
    const match = header.match(/filename="([^"]+)"/);
    return match?.[1] ?? null;
}

// Static manifest — the backend does not expose a per-job manifest endpoint.
// The available formats are fixed by what the report service supports.
function buildStaticManifest(jobId: string): ReportManifestResponse {
    return {
        jobId,
        generatedAt: new Date().toISOString(),
        formats: [
            {
                format: "pdf",
                fileExtension: "pdf",
                contentType: "application/pdf",
                implemented: true,
                description: "PDF report with findings, charts, and executive summary",
            },
            {
                format: "docx",
                fileExtension: "docx",
                contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                implemented: true,
                description: "Word document for editing and sharing",
            },
            {
                format: "excel",
                fileExtension: "xlsx",
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                implemented: true,
                description: "Excel spreadsheet with findings data",
            },
            {
                format: "json",
                fileExtension: "json",
                contentType: "application/json",
                implemented: true,
                description: "Raw JSON export for programmatic use",
            },
        ],
    };
}

export const reportsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Returns a static manifest — no network call needed.
        getReportManifest: builder.query<ReportManifestResponse, string>({
            queryFn: (jobId) => ({ data: buildStaticManifest(jobId) }),
        }),

        // Two-step flow:
        //   1. POST /reports/generate  → { report_id, file_name, ... }
        //   2. GET  /reports/{report_id}/download → binary file → trigger download
        exportScanReport: builder.mutation<
            void,
            { jobId: string; body: ScanReportRequest }
        >({
            queryFn: async ({ jobId, body }, _api, _extraOptions, baseQuery) => {
                // ── Step 1: generate & store the report ──────────────────────
                const generateResult = await baseQuery({
                    url: "reports/generate",
                    method: "POST",
                    body: {
                        job_id: jobId,
                        format: body.format,
                        step_scope: body.step_scope,
                        step_ids: body.step_ids ?? null,
                        columns: body.columns ?? null,
                    },
                });

                if (generateResult.error) {
                    return { error: generateResult.error };
                }

                const meta = generateResult.data as {
                    report_id: string;
                    file_name: string;
                    content_type: string;
                };

                // ── Step 2: download the stored report file ──────────────────
                const downloadResult = await baseQuery({
                    url: `reports/${meta.report_id}/download`,
                    method: "GET",
                    // Return the raw Response so we can read it as a Blob.
                    responseHandler: (response: Response) => Promise.resolve(response),
                });

                if (downloadResult.error) {
                    return { error: downloadResult.error };
                }

                const response = downloadResult.data as Response;

                if (!response.ok) {
                    let detail: string | undefined;
                    try {
                        const json = await response.json() as { detail?: string; message?: string };
                        detail = json?.detail ?? json?.message;
                    } catch {
                        // body wasn't JSON — ignore
                    }
                    return {
                        error: {
                            status: response.status as number,
                            data: detail ?? response.statusText ?? "Download failed",
                        } as import("@reduxjs/toolkit/query").FetchBaseQueryError,
                    };
                }

                // Prefer the filename from the Content-Disposition header;
                // fall back to the name returned by the generate step.
                const disposition = response.headers.get("Content-Disposition") ?? "";
                const filename =
                    extractFilenameFromDisposition(disposition) ??
                    meta.file_name ??
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

                    return { data: null as unknown as void };
                } catch (err) {
                    if (url !== null) {
                        URL.revokeObjectURL(url);
                    }
                    return {
                        error: {
                            status: "CUSTOM_ERROR",
                            error: err instanceof Error ? err.message : "Unknown error",
                        } as import("@reduxjs/toolkit/query").FetchBaseQueryError,
                    };
                }
            },
        }),
    }),
});

export const { useGetReportManifestQuery, useExportScanReportMutation } =
    reportsApi;
