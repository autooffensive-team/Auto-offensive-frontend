import { baseApi } from "@/lib/redux/services/base-api";
import type {
  ApiKey,
  ApiKeyListResponse,
  CreateApiKeyResponse,
  ListApiKeysRequest,
  RevokeApiKeyResponse,
} from "@/types/apikeys";

export const apikeysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /api/v1/apikeys/create?project_id=<id> */
    createApiKey: builder.mutation<
      CreateApiKeyResponse,
      { project_id: string; name: string; description?: string }
    >({
      query: ({ project_id, name, description }) => ({
        url: `apikeys/create?project_id=${encodeURIComponent(project_id)}`,
        method: "POST",
        body: { name, description },
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: "ApiKey" as const, id: `LIST:${project_id}` },
      ],
    }),

    /** GET /api/v1/apikeys/project/{project_id}?active_only=false */
    listApiKeys: builder.query<ApiKeyListResponse, ListApiKeysRequest>({
      query: ({ project_id, active_only = false }) => ({
        url: `apikeys/project/${encodeURIComponent(project_id)}?active_only=${active_only}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { project_id }) => [
        { type: "ApiKey" as const, id: `LIST:${project_id}` },
      ],
    }),

    /** GET /api/v1/apikeys/{key_id} */
    getApiKey: builder.query<ApiKey, string>({
      query: (key_id) => ({
        url: `apikeys/${encodeURIComponent(key_id)}`,
        method: "GET",
      }),
      providesTags: (_result, _error, key_id) => [
        { type: "ApiKey" as const, id: key_id },
      ],
    }),

    /** POST /api/v1/apikeys/{key_id}/revoke */
    revokeApiKey: builder.mutation<
      RevokeApiKeyResponse,
      { key_id: string; project_id: string }
    >({
      query: ({ key_id }) => ({
        url: `apikeys/${encodeURIComponent(key_id)}/revoke`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { project_id, key_id }) => [
        { type: "ApiKey" as const, id: `LIST:${project_id}` },
        { type: "ApiKey" as const, id: key_id },
      ],
    }),
  }),
});

export const {
  useCreateApiKeyMutation,
  useListApiKeysQuery,
  useGetApiKeyQuery,
  useRevokeApiKeyMutation,
} = apikeysApi;
