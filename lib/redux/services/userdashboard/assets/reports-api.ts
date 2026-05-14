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

export const reportsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReportManifest: builder.query<ReportManifestResponse, string>({
            query: (jobId) => `scans/jobs/${jobId}/reports`,
            providesTags: (_result, _err, jobId) => [
                { type: "Report" as const, id: `MANIFEST:${jobId}` },
            ],
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
                    // Return the full Response object so we can read headers before
                    // consuming the body as a Blob.
                    responseHandler: (response) => Promise.resolve(response),
                });

                if (result.error) {
                    return { error: result.error };
                }

                const response = result.data as Response;

                // Extract filename from Content-Disposition header, fall back to a
                // format-derived default if the header is absent or unparseable.
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

                    // Revoke synchronously after the click — the browser has already
                    // queued the download navigation at this point.
                    URL.revokeObjectURL(url);
                    url = null;

                    return { data: undefined };
                } catch (err) {
                    // Ensure the object URL is revoked even if blob reading or anchor
                    // manipulation throws, to prevent memory leaks.
                    if (url !== null) {
                        URL.revokeObjectURL(url);
                    }
                    return {
                        error: {
                            status: "CUSTOM_ERROR",
                            error: err instanceof Error ? err.message : "Unknown error",
                        },
                    };
                }
            },
        }),
    }),
});

export const { useGetReportManifestQuery, useExportScanReportMutation } =
    reportsApi;
