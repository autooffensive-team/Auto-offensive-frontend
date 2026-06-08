import { baseApi } from "@/lib/redux/services/base-api";
import type {
  CITokenListResponse,
  CITokenResponse,
  CreateCITokenRequest,
  CreateCITokenResponse,
  RevokeCITokenResponse,
} from "@/types/ci-token";

const CI_TOKENS_PROXY_PATH = "ci-tokens";

function buildCITokenUrl(pathSegments: string[], query?: Record<string, string | boolean | undefined>): string {
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue;
      }
      searchParams.set(key, String(value));
    }
  }

  const search = searchParams.toString();
  return search
    ? `${CI_TOKENS_PROXY_PATH}/${path}?${search}`
    : `${CI_TOKENS_PROXY_PATH}/${path}`;
}

export const ciTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCIToken: builder.mutation<CreateCITokenResponse, CreateCITokenRequest>({
      query: (body) => ({
        url: CI_TOKENS_PROXY_PATH,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "CIToken" as const, id: `PROJECT:${project_id}` },
      ],
    }),
    listProjectCITokens: builder.query<CITokenResponse[], { projectId: string; activeOnly?: boolean }>({
      query: ({ projectId, activeOnly }) =>
        buildCITokenUrl(["project", projectId], { active_only: activeOnly }),
      transformResponse: (response: CITokenListResponse) => response.tokens ?? [],
      providesTags: (result, _error, { projectId }) => [
        { type: "CIToken" as const, id: `PROJECT:${projectId}` },
        ...(result?.map((token) => ({ type: "CIToken" as const, id: token.token_id })) ?? []),
      ],
    }),
    getCIToken: builder.query<CITokenResponse, string>({
      query: (tokenId) => buildCITokenUrl([tokenId]),
      providesTags: (_result, _error, tokenId) => [{ type: "CIToken" as const, id: tokenId }],
    }),
    revokeCIToken: builder.mutation<RevokeCITokenResponse, { tokenId: string; projectId: string }>({
      query: ({ tokenId }) => ({
        url: buildCITokenUrl([tokenId, "revoke"]),
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { tokenId, projectId }) => [
        { type: "CIToken" as const, id: tokenId },
        { type: "CIToken" as const, id: `PROJECT:${projectId}` },
      ],
    }),
  }),
});

export const {
  useCreateCITokenMutation,
  useListProjectCITokensQuery,
  useGetCITokenQuery,
  useRevokeCITokenMutation,
} = ciTokenApi;
