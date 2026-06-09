export type ScanMode = "basic" | "medium" | "advanced";
export type OptionScalar = string | number | boolean;
export type OptionValue = OptionScalar | OptionScalar[];

export type Project = {
  project_id: string;
  name: string;
  description?: string | null;
};

export type InputField = {
  key: string;
  type: string;
  required?: boolean | null;
  flag?: string | null;
  description?: string | null;
};

export type WordlistAsset = {
  wordlist_id: string;
  slug: string;
  name: string;
  description?: string | null;
  line_count: number;
  byte_size: number;
  tags?: string[];
};

export type ToolOption = {
  key: string;
  flag: string;
  type: "integer" | "string" | "boolean" | "array" | "wordlist" | string;
  required?: boolean | null;
  description?: string | null;
};

export type ScanPreset = {
  name: string;
  description?: string | null;
  flags?: string[];
};

export type Tool = {
  tool_id: string;
  tool_name: string;
  category_name?: string | null;
  tool_description?: string | null;
  is_active: boolean;
  input_schema?: {
    fields?: InputField[];
  } | null;
  scan_config?: {
    basic?: { presets?: ScanPreset[] };
    medium?: { options?: ToolOption[] };
    advanced?: { options?: ToolOption[] };
  } | null;
};

export type ScanStep = {
  step_id: string;
  tool_name: string;
  step_order: number;
  status: string;
  findings_count?: number;
};

export type JobStatus = {
  job_id: string;
  project_id: string;
  status: string;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  pending_steps: number;
  total_findings?: number;
  steps?: ScanStep[];
};

export type ParsedData = {
  step_id: string;
  job_id: string;
  tool_name: string;
  columns?: { key: string; label?: string }[];
  discovered_columns?: { key: string; label?: string }[];
  data?: Record<string, unknown>[];
  lines?: string[];
  findings_count?: number;
};

export type JobParsedData = {
  job_id: string;
  total_steps: number;
  steps: ParsedData[];
};

export type MediumStepState = {
  id: string;
  toolId: string;
  options: Record<string, string | boolean>;
  timeout: string;
};

export type LogLine = {
  id: string;
  source: ScanMode | "system";
  level: string;
  text: string;
  timestamp: string;
};

export type Warning = {
  id: string;
  message: string;
  suggestion?: string;
};

export type ActiveRun = {
  mode: ScanMode;
  jobId?: string;
  stepId?: string;
  status: string;
  findings: number;
  steps: ScanStep[];
  parsedSteps: ParsedData[];
  /** Human-readable reason when status is failed (from API or step details). */
  failureMessage?: string;
};

export type SseEvent = {
  event: string;
  data: unknown;
};