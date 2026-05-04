import { baseApi } from "@/lib/redux/services/base-api";
import type {
  DeleteProjectRequest,
  ProjectListResponse,
  RawProject,
  UpdateProjectRequest,
  UserProject,
} from "@/types/project";
import type {
  DependencyListResponse,
  DependencySummaryResponse,
  GetFileIssuesRequest,
  GetIssueDetailRequest,
  GetScanLogsRequest,
  IssueDetailResponse,
  IssueListResponse,
  ListCurrentUserScanIdsRequest,
  ListCurrentUserScansRequest,
  ListDependenciesRequest,
  ListIssuesRequest,
  ListProjectScansRequest,
  ScanDetailResponse,
  ProjectScansResponse,
  ScanLogsResponse,
  ScanStatusResponse,
  ScanSummaryResponse,
  StreamScanLogsRequest,
  TriggerScanRequest,
  TriggerScanResponse,
  UserScanTaskRefsResponse,
} from "@/types/scanner";

export type { UserProject } from "@/types/project";

const SCANNER_BASE_PATH = "/api/v1/scanner";
const CSV_QUERY_KEYS = new Set(["phases"]);

type QueryScalar = string | number | boolean | null | undefined;
type QueryValue = QueryScalar | QueryScalar[];

function normalizeProject(project: RawProject): UserProject {
  return {
    project_id: project.project_id ?? project.id ?? "",
    name: project.name ?? "",
    description: project.description ?? "",
    owner_id: project.owner_id ?? project.owner ?? "",
    created_at: project.created_at ?? "",
    last_modified:
      project.last_modified ?? project.last_scan_at ?? project.created_at ?? "",
  };
}

function normalizeProjectList(response: ProjectListResponse): UserProject[] {
  const projects = Array.isArray(response) ? response : (response.projects ?? []);
  return projects.map(normalizeProject);
}

async function parseProjectResponse(response: Response): Promise<RawProject> {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as RawProject;
  } catch {
    return {};
  }
}

function buildScannerUrl(pathSegments: string[], query?: Record<string, QueryValue>): string {
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, rawValue] of Object.entries(query)) {
      if (rawValue == null) {
        continue;
      }

      if (Array.isArray(rawValue)) {
        const values = rawValue
          .filter((value): value is string | number | boolean => value != null)
          .map((value) => String(value));

        if (values.length === 0) {
          continue;
        }

        if (CSV_QUERY_KEYS.has(key)) {
          searchParams.set(key, values.join(","));
          continue;
        }

        for (const value of values) {
          searchParams.append(key, value);
        }
        continue;
      }

      searchParams.set(key, String(rawValue));
    }
  }

  const search = searchParams.toString();
  return search
    ? `${SCANNER_BASE_PATH}/${path}?${search}`
    : `${SCANNER_BASE_PATH}/${path}`;
}

function buildProxyScannerUrl(pathSegments: string[], query?: Record<string, QueryValue>): string {
  return `/api/backend/${buildScannerUrl(pathSegments, query)}`;
}

export const scannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<UserProject[], void>({
      query: () => "projects",
      transformResponse: (response: ProjectListResponse) =>
        normalizeProjectList(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({
                type: "Scan" as const,
                id: project.project_id,
              })),
              { type: "Scan" as const, id: "LIST" },
            ]
          : [{ type: "Scan" as const, id: "LIST" }],
    }),
    updateProject: builder.mutation<UserProject, UpdateProjectRequest>({
      query: ({ project_id, ...body }) => ({
        url: `projects/${project_id}`,
        method: "PATCH",
        body,
        responseHandler: parseProjectResponse,
      }),
      transformResponse: (response: RawProject) => normalizeProject(response),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "Scan", id: project_id },
        { type: "Scan", id: "LIST" },
      ],
    }),
    deleteProject: builder.mutation<void, DeleteProjectRequest>({
      query: ({ project_id, cascade = true }) => ({
        url: `projects/${project_id}`,
        method: "DELETE",
        params: { cascade },
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "Scan", id: project_id },
        { type: "Scan", id: "LIST" },
      ],
    }),
    triggerScan: builder.mutation<TriggerScanResponse, TriggerScanRequest>({
      query: (body) => ({
        url: buildScannerUrl(["scans"]),
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { project_key }) => [
        { type: "Scan" as const, id: "LIST" },
        { type: "Scan" as const, id: `PROJECT:${project_key}` },
      ],
    }),
    getScanDetail: builder.query<ScanDetailResponse, string>({
      query: (scan_id) => buildScannerUrl(["scans", scan_id]),
      providesTags: (_result, _error, scan_id) => [
        { type: "Scan" as const, id: scan_id },
      ],
    }),
    getScanStatus: builder.query<ScanStatusResponse, string>({
      query: (scan_id) => buildScannerUrl(["scans", scan_id, "status"]),
      providesTags: (_result, _error, scan_id) => [
        { type: "Scan" as const, id: scan_id },
      ],
    }),
    getScanLogs: builder.query<ScanLogsResponse, GetScanLogsRequest>({
      query: ({ scan_id, after_sequence_num, limit, phases }) =>
        buildScannerUrl(["scans", scan_id, "logs"], {
          after_sequence_num,
          limit,
          phases,
        }),
      providesTags: (_result, _error, { scan_id }) => [
        { type: "Scan" as const, id: scan_id },
      ],
    }),
    getScanSummary: builder.query<ScanSummaryResponse, string>({
      query: (scan_id) => buildScannerUrl(["scans", scan_id, "summary"]),
      providesTags: (_result, _error, scan_id) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `SUMMARY:${scan_id}` },
      ],
    }),
    listIssues: builder.query<IssueListResponse, ListIssuesRequest>({
      query: ({ scan_id, type_filter, severity_filter, page, page_size }) =>
        buildScannerUrl(["scans", scan_id, "issues"], {
          type_filter,
          severity_filter,
          page,
          page_size,
        }),
      providesTags: (_result, _error, { scan_id }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `ISSUES:${scan_id}` },
      ],
    }),
    getIssueDetail: builder.query<IssueDetailResponse, GetIssueDetailRequest>({
      query: ({ scan_id, issue_key }) =>
        buildScannerUrl(["scans", scan_id, "issues", issue_key]),
      providesTags: (_result, _error, { scan_id, issue_key }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `ISSUE:${issue_key}` },
      ],
    }),
    getFileIssues: builder.query<IssueListResponse, GetFileIssuesRequest>({
      query: ({ scan_id, file_path }) =>
        buildScannerUrl(["scans", scan_id, "files", file_path, "issues"]),
      providesTags: (_result, _error, { scan_id, file_path }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `FILE_ISSUES:${scan_id}:${file_path}` },
      ],
    }),
    listDependencies: builder.query<DependencyListResponse, ListDependenciesRequest>({
      query: ({
        scan_id,
        tool,
        severity,
        languages,
        outdated_only,
        vulnerable_only,
        page,
        page_size,
      }) =>
        buildScannerUrl(["scans", scan_id, "dependencies"], {
          tool,
          severity,
          languages,
          outdated_only,
          vulnerable_only,
          page,
          page_size,
        }),
      providesTags: (_result, _error, { scan_id }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `DEPENDENCIES:${scan_id}` },
      ],
    }),
    getDependencySummary: builder.query<DependencySummaryResponse, string>({
      query: (scan_id) => buildScannerUrl(["scans", scan_id, "dependencies", "summary"]),
      providesTags: (_result, _error, scan_id) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `DEPENDENCY_SUMMARY:${scan_id}` },
      ],
    }),
    listCurrentUserScans: builder.query<ProjectScansResponse, ListCurrentUserScansRequest | void>({
      query: (args) =>
        buildScannerUrl(["scans", "me"], {
          project_key: args?.project_key,
          page: args?.page,
          page_size: args?.page_size,
        }),
      providesTags: (result) => [
        { type: "Scan" as const, id: "LIST" },
        ...(result?.scans.map((scan) => ({ type: "Scan" as const, id: scan.scan_id })) ?? []),
      ],
    }),
    listCurrentUserScanIds: builder.query<UserScanTaskRefsResponse, ListCurrentUserScanIdsRequest | void>({
      query: (args) =>
        buildScannerUrl(["scans", "me", "ids"], {
          project_key: args?.project_key,
          page: args?.page,
          page_size: args?.page_size,
        }),
      providesTags: [{ type: "Scan" as const, id: "LIST" }],
    }),
    listProjectScans: builder.query<ProjectScansResponse, ListProjectScansRequest>({
      query: ({ project_key, page, page_size }) =>
        buildScannerUrl(["projects", project_key, "scans"], {
          page,
          page_size,
        }),
      providesTags: (result, _error, { project_key }) => [
        { type: "Scan" as const, id: `PROJECT:${project_key}` },
        ...(result?.scans.map((scan) => ({ type: "Scan" as const, id: scan.scan_id })) ?? []),
      ],
    }),
  }),
});

export function buildScanProgressStreamUrl(scan_id: string): string {
  return buildProxyScannerUrl(["scans", scan_id, "stream"]);
}

export function buildScanLogStreamUrl({
  scan_id,
  include_history,
  history_limit,
  phases,
}: StreamScanLogsRequest): string {
  return buildProxyScannerUrl(["scans", scan_id, "logs", "stream"], {
    include_history,
    history_limit,
    phases,
  });
}

export const {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useTriggerScanMutation,
  useGetScanDetailQuery,
  useGetScanStatusQuery,
  useGetScanLogsQuery,
  useGetScanSummaryQuery,
  useListIssuesQuery,
  useGetIssueDetailQuery,
  useGetFileIssuesQuery,
  useListDependenciesQuery,
  useGetDependencySummaryQuery,
  useListCurrentUserScansQuery,
  useListCurrentUserScanIdsQuery,
  useListProjectScansQuery,
} = scannerApi;
