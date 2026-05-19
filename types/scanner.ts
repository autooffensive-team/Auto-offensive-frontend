export type ScanStatus = "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "PARTIAL";

export type QualityGateStatus = "OK" | "WARN" | "ERROR";

export type TriggerScanRequest = {
  project_key: string;
  branch?: string | null;
  repo_url: string;
};

export type TriggerScanResponse = {
  scan_id: string;
  status: ScanStatus;
  created_at: string | null;
};

export type ScanPhaseResponse = {
  key: string;
  status: string;
  error_message: string;
};

export type ScanStatusResponse = {
  scan_id: string;
  status: ScanStatus;
  progress: number;
  started_at: string | null;
  finished_at: string | null;
  error_message: string;
  phases: ScanPhaseResponse[];
};

export type ScanDetailResponse = {
  scan_id: string;
  project_key: string;
  sonar_project_key: string;
  repo_url: string;
  branch: string;
  status: ScanStatus;
  progress: number;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  error_message: string;
  phases: ScanPhaseResponse[];
};

export type ScanLogChunkResponse = {
  scan_id: string;
  phase: string;
  level: string;
  line: string;
  timestamp: string | null;
  sequence_num: number;
  is_final_chunk: boolean;
  completion_status: ScanStatus | null;
};

export type ScanLogsResponse = {
  logs: ScanLogChunkResponse[];
  is_terminal: boolean;
  status: ScanStatus;
  next_sequence_num: number;
};

export type LanguageSummaryResponse = {
  language: string;
  total_dependencies: number;
  vulnerable_dependencies: number;
  outdated_dependencies: number;
  license_issues: number;
};

export type DependencySummaryResponse = {
  scan_id: string;
  total: number;
  vulnerable: number;
  outdated: number;
  license_issues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  by_language: LanguageSummaryResponse[];
};

export type ScanSummaryResponse = {
  scan_id: string;
  quality_gate: QualityGateStatus;
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  coverage: number;
  duplications: number;
  security_hotspots: number;
  dependency_summary: DependencySummaryResponse | null;
};

export type IssueResponse = {
  key: string;
  type: string;
  severity: string;
  rule_key: string;
  message: string;
  file_path: string;
  line: number;
  status: string;
  tags: string[];
};

export type IssueListResponse = {
  issues: IssueResponse[];
  page: number;
  page_size: number;
  total: number;
};

export type TextRangeResponse = {
  start_line: number;
  end_line: number;
  start_offset: number;
  end_offset: number;
};

export type IssueWhereResponse = {
  component_key: string;
  file_path: string;
  line: number;
  text_range: TextRangeResponse;
  code_snippet: string;
};

export type IssueWhyResponse = {
  issue_message: string;
  severity: string;
  status: string;
  tags: string[];
  rule_key: string;
  rule_name: string;
  html_desc: string;
};

export type ActivityDiffResponse = {
  key: string;
  old_value: string;
  new_value: string;
};

export type ActivityCommentResponse = {
  key: string;
  login: string;
  html_text: string;
  created_at: string;
};

export type ActivityChangeResponse = {
  created_at: string;
  user: string;
  diffs: ActivityDiffResponse[];
};

export type IssueActivityResponse = {
  comments: ActivityCommentResponse[];
  changelog: ActivityChangeResponse[];
};

export type DescriptionSectionResponse = {
  key: string;
  content: string;
};

export type IssueMoreInfoResponse = {
  documentation_url: string;
  description_sections: DescriptionSectionResponse[];
};

export type IssueDetailResponse = {
  where_is_issue: IssueWhereResponse;
  why_is_issue: IssueWhyResponse;
  activity: IssueActivityResponse;
  more_info: IssueMoreInfoResponse;
};

export type DependencyResponse = {
  package_name: string;
  ecosystem: string;
  installed_version: string;
  fixed_version: string;
  latest_version: string;
  cve_id: string;
  severity: string;
  license: string;
  is_outdated: boolean;
  is_vulnerable: boolean;
  has_license_issue: boolean;
  description: string;
  tool: string;
  language: string;
};

export type DependencyListResponse = {
  dependencies: DependencyResponse[];
  page: number;
  page_size: number;
  total: number;
};

export type ProjectScanResponse = {
  scan_id: string;
  project_key: string;
  branch: string;
  status: ScanStatus;
  progress: number;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  error_message: string;
};

export type ProjectScansResponse = {
  scans: ProjectScanResponse[];
  page: number;
  page_size: number;
  total: number;
};

export type ScanTaskRefResponse = {
  scan_id: string;
  project_key: string;
};

export type UserScanTaskRefsResponse = {
  tasks: ScanTaskRefResponse[];
  project_keys: string[];
  page: number;
  page_size: number;
  total: number;
};

export type GetScanLogsRequest = {
  scan_id: string;
  after_sequence_num?: number;
  limit?: number;
  phases?: string[];
};

export type StreamScanLogsRequest = {
  scan_id: string;
  include_history?: boolean;
  history_limit?: number;
  phases?: string[];
};

export type ListIssuesRequest = {
  scan_id: string;
  type_filter?: string;
  severity_filter?: string;
  page?: number;
  page_size?: number;
};

export type GetIssueDetailRequest = {
  scan_id: string;
  issue_key: string;
};

export type GetFileIssuesRequest = {
  scan_id: string;
  file_path: string;
};

// ─── Security Hotspots ───────────────────────────────────────────────────────

export type HotspotResponse = {
  key: string;
  security_category: string;
  vulnerability_probability: string;
  status: string;
  message: string;
  file_path: string;
  line: number;
};

export type HotspotListResponse = {
  hotspots: HotspotResponse[];
  page: number;
  page_size: number;
  total: number;
};

export type HotspotWhereResponse = {
  component_key: string;
  file_path: string;
  line: number;
  text_range: TextRangeResponse;
  code_snippet: string;
};

export type HotspotReviewResponse = {
  message: string;
  vulnerability_probability: string;
  status: string;
  security_category: string;
  rule_key: string;
  rule_name: string;
  html_desc: string;
  resolution: string;
};

export type HotspotDetailResponse = {
  where_is_hotspot: HotspotWhereResponse;
  review: HotspotReviewResponse;
  activity: IssueActivityResponse;
  more_info: IssueMoreInfoResponse;
};

export type ListHotspotsRequest = {
  scan_id: string;
  status_filter?: string;
  page?: number;
  page_size?: number;
};

export type GetHotspotDetailRequest = {
  scan_id: string;
  hotspot_key: string;
};

export type ListDependenciesRequest = {
  scan_id: string;
  tool?: string;
  severity?: string;
  languages?: string[];
  outdated_only?: boolean;
  vulnerable_only?: boolean;
  page?: number;
  page_size?: number;
};

export type ListCurrentUserScansRequest = {
  project_key?: string;
  page?: number;
  page_size?: number;
};

export type ListCurrentUserScanIdsRequest = {
  project_key?: string;
  page?: number;
  page_size?: number;
};

export type ListProjectScansRequest = {
  project_key: string;
  page?: number;
  page_size?: number;
};

export type ScanLogStreamError = {
  detail: string;
};
