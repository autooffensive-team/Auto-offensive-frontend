import { baseApi } from "@/lib/redux/services/base-api";
import type {
  Target,
  ListJobsResponse,
  ListJobsParams,
  JobDetails,
  JobParsedDataResponse,
} from "@/types/assets";

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const assetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTargets: builder.query<Target[], string>({
      query: (projectId) => `projects/${projectId}/targets`,
      providesTags: (result, _err, projectId) =>
        result
          ? [
              ...result.map((t) => ({
                type: "Gateway" as const,
                id: `TARGET:${t.target_id}`,
              })),
              { type: "Gateway" as const, id: `TARGETS:${projectId}` },
            ]
          : [{ type: "Gateway" as const, id: `TARGETS:${projectId}` }],
    }),

    getTarget: builder.query<Target, { projectId: string; targetId: string }>({
      query: ({ projectId, targetId }) =>
        `projects/${projectId}/targets/${targetId}`,
      providesTags: (_result, _err, { targetId }) => [
        { type: "Gateway" as const, id: `TARGET:${targetId}` },
      ],
    }),

    listJobs: builder.query<ListJobsResponse, ListJobsParams | void>({
      query: (params) => {
        const qs = buildQueryString({
          limit: params?.limit,
          offset: params?.offset,
          status: params?.status,
          target_name: params?.target_name,
        });
        return `scans/jobs${qs}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map((j) => ({
                type: "Gateway" as const,
                id: `JOB:${j.job_id}`,
              })),
              { type: "Gateway" as const, id: "JOBS_LIST" },
            ]
          : [{ type: "Gateway" as const, id: "JOBS_LIST" }],
    }),

    getJobDetails: builder.query<JobDetails, string>({
      query: (jobId) => `scans/jobs/${jobId}`,
      providesTags: (_result, _err, jobId) => [
        { type: "Gateway" as const, id: `JOB:${jobId}` },
      ],
    }),

    getJobParsedData: builder.query<JobParsedDataResponse, string>({
      query: (jobId) => `scans/jobs/${jobId}/parsed-data`,
      providesTags: (_result, _err, jobId) => [
        { type: "Gateway" as const, id: `JOB_PARSED:${jobId}` },
      ],
    }),
  }),
});

export const {
  useListTargetsQuery,
  useGetTargetQuery,
  useListJobsQuery,
  useGetJobDetailsQuery,
  useGetJobParsedDataQuery,
} = assetsApi;
