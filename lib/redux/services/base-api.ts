import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
});

function resolveProxyUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const normalized = url.replace(/^\/+/, "");
  if (
    normalized === "backend" ||
    normalized.startsWith("backend/") ||
    normalized === "dashboard" ||
    normalized.startsWith("dashboard/") ||
    normalized === "scanner" ||
    normalized.startsWith("scanner/") ||
    normalized === "git" ||
    normalized.startsWith("git/")
  ) {
    return `/api/${normalized}`;
  }

  return `/api/backend/${normalized}`;
}

const proxyBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = (args, api, extraOptions) => {
  if (typeof args === "string") {
    return rawBaseQuery(resolveProxyUrl(args), api, extraOptions);
  }

  return rawBaseQuery(
    {
      ...args,
      url: resolveProxyUrl(args.url),
    },
    api,
    extraOptions,
  );
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: proxyBaseQuery,
  tagTypes: ["Auth", "Gateway", "Project", "Scan", "Report", "Git"],
  endpoints: () => ({}),
});
