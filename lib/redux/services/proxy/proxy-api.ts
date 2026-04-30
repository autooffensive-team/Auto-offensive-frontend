import { baseApi } from "@/lib/redux/services/base-api";

export type ProxyRequestArgs = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

export const proxyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    proxyRequest: builder.mutation<unknown, ProxyRequestArgs>({
      query: ({ path, method = "GET", params, body }) => ({
        url: normalizePath(path),
        method,
        params,
        body,
      }),
    }),
  }),
});

export const { useProxyRequestMutation } = proxyApi;
