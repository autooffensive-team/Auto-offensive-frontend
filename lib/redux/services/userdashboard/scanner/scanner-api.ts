import { baseApi } from "@/lib/redux/services/base-api";
import type {
  CreateScannerProjectRequest,
  DependencyListResponse,
  DependencySummaryResponse,
  GetFileIssuesRequest,
  GetHotspotDetailRequest,
  GetIssueDetailRequest,
  GetScanLogsRequest,
  HotspotDetailResponse,
  HotspotListResponse,
  IssueDetailResponse,
  IssueListResponse,
  ListCurrentUserScanIdsRequest,
  ListCurrentUserScansRequest,
  ListDependenciesRequest,
  ListHotspotsRequest,
  ListIssuesRequest,
  ListScannerProjectsResponse,
  ListProjectScansRequest,
  ScanDetailResponse,
  ProjectScansResponse,
  ScanLogsResponse,
  ScanStatusResponse,
  ScanSummaryResponse,
  ScannerProjectResponse,
  StreamScanLogsRequest,
  TriggerScanRequest,
  TriggerScanResponse,
  UserScanTaskRefsResponse,
} from "@/types/scanner";

const SCANNER_PROXY_PATH = "scanner";
const CSV_QUERY_KEYS = new Set(["phases"]);

type QueryScalar = string | number | boolean | null | undefined;
type QueryValue = QueryScalar | QueryScalar[];

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
    ? `${SCANNER_PROXY_PATH}/${path}?${search}`
    : `${SCANNER_PROXY_PATH}/${path}`;
}

function buildProxyScannerUrl(pathSegments: string[], query?: Record<string, QueryValue>): string {
  return `/api/${buildScannerUrl(pathSegments, query)}`;
}

export const scannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    triggerScan: builder.mutation<TriggerScanResponse, TriggerScanRequest>({
      query: (body) => ({
        url: buildScannerUrl(["scans"]),
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { project_key }) => [
        { type: "Scan" as const, id: "LIST" },
        { type: "Scan" as const, id: `PROJECT:${project_key}` },
        { type: "Gateway" as const, id: "JOBS_LIST" },
        { type: "ScannerProject" as const, id: "LIST" },
      ],
    }),
    createScannerProject: builder.mutation<ScannerProjectResponse, CreateScannerProjectRequest>({
      query: (body) => ({
        url: buildScannerUrl(["projects"]),
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ScannerProject" as const, id: "LIST" }],
    }),
    listScannerProjects: builder.query<ScannerProjectResponse[], void>({
      query: () => buildScannerUrl(["projects"]),
      transformResponse: (response: ListScannerProjectsResponse) => response.projects ?? [],
      providesTags: (result) => [
        { type: "ScannerProject" as const, id: "LIST" },
        ...(result?.map((project) => ({ type: "ScannerProject" as const, id: project.project_id })) ?? []),
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
    listHotspots: builder.query<HotspotListResponse, ListHotspotsRequest>({
      query: ({ scan_id, status_filter, page, page_size }) =>
        buildScannerUrl(["scans", scan_id, "hotspots"], {
          status_filter,
          page,
          page_size,
        }),
      providesTags: (_result, _error, { scan_id }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `HOTSPOTS:${scan_id}` },
      ],
    }),
    getHotspotDetail: builder.query<HotspotDetailResponse, GetHotspotDetailRequest>({
      query: ({ scan_id, hotspot_key }) =>
        buildScannerUrl(["scans", scan_id, "hotspots", hotspot_key]),
      providesTags: (_result, _error, { scan_id, hotspot_key }) => [
        { type: "Scan" as const, id: scan_id },
        { type: "Report" as const, id: `HOTSPOT:${hotspot_key}` },
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
  useTriggerScanMutation,
  useCreateScannerProjectMutation,
  useListScannerProjectsQuery,
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
  useListHotspotsQuery,
  useGetHotspotDetailQuery,
} = scannerApi;
