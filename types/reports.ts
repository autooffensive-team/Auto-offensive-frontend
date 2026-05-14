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
