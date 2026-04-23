import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type GatewayHealthResponse = {
  status: string;
};

export type ProxyRequestArgs = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "");
}

export const backendApi = createApi({
  reducerPath: "backendApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/backend",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getGatewayHealth: builder.query<GatewayHealthResponse, void>({
      query: () => "health",
    }),
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

export const { useGetGatewayHealthQuery, useProxyRequestMutation } = backendApi;
