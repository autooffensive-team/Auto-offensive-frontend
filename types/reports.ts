export type ReportFormat = "json" | "pdf" | "excel" | "docx";

export type ReportFormatInfo = {
    format: ReportFormat;
    fileExtension: string;
    contentType: string;
    implemented: boolean;
    description: string;
};

export type ReportManifestResponse = {
    jobId: string;
    generatedAt: string;
    formats: ReportFormatInfo[];
};

export type StepScope = "all" | "last" | "specific";

export type SupportedExportFormat = "pdf" | "docx" | "xlsx" | "json";

export type ScanReportRequest = {
    format: SupportedExportFormat;
    step_scope: StepScope;
    step_ids?: string[] | null;
    columns?: Record<string, string[]> | null;
};

/** Matches the backend ReportMetaResponse schema. */
export type ReportMetaResponse = {
    report_id: string;
    job_id: string;
    format: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
    created_at: string;
};

/** Matches the backend ReportListResponse schema. */
export type ReportListResponse = {
    reports: ReportMetaResponse[];
    total: number;
    page: number;
    page_size: number;
};
