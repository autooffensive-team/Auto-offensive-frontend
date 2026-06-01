export type Target = {
  target_id: string;
  project_id: string;
  name: string;
  type: string;
  description?: string | null;
  created_at?: string | null;
};

export type TargetWithMeta = Target & {
  project_name: string;
  last_scan: string | null;
  status: "Scanning" | "Active" | "Idle";
  open_findings: number;
};

export type JobSummary = {
  job_id: string;
  target_name: string;
  status: string;
  created_at: string;
  total_findings: number;
  tool_name: string;
  execution_mode: string;
  finished_at?: string | null;
  tools_used?: string | null;
};

export type ListJobsResponse = {
  jobs: JobSummary[];
  total_count: number;
};

export type StepSummary = {
  step_id: string;
  tool_name: string;
  step_order: number;
  status: string;
  findings_count: number;
  started_at?: string | null;
  finished_at?: string | null;
};

export type JobDetails = {
  job_id: string;
  project_id: string;
  target_name: string;
  status: string;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  pending_steps: number;
  total_findings: number;
  execution_mode: string;
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  steps: StepSummary[];
};

// Pagination metadata shared by parsed-data responses
type ParsedPaginationMeta = {
  total_rows: number;
  total_pages: number;
  page: number;
  page_size: number;
};

// Per-step endpoint response (new)
export type StepParsedDataResponse = {
  step_id: string;
  job_id: string;
  tool_name: string;
  columns: string[];
  rows: Record<string, unknown>[];
  discovered_columns: Record<string, string>;
} & ParsedPaginationMeta;

// Job-level response: each step now carries pagination metadata
export type ParsedStepData = {
  step_id: string;
  tool_name: string;
  step_order: number;
  columns: string[];
  rows: Record<string, unknown>[];
  discovered_columns: Record<string, string>;
} & ParsedPaginationMeta;

export type JobParsedDataResponse = {
  job_id: string;
  steps: ParsedStepData[];
};

export type ListJobsParams = {
  limit?: number;
  offset?: number;
  status?: string;
  target_name?: string;
};
