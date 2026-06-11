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
    normalized === "ci-tokens" ||
    normalized.startsWith("ci-tokens/") ||
    normalized === "scanner" ||
    normalized.startsWith("scanner/") ||
    normalized === "git" ||
    normalized.startsWith("git/")
  ) {
    return `/api/${normalized}`;
  }

  return `/api/backend/${normalized}`;
}

/**
 * Wraps the proxy base query with a 401 interceptor.
 * When any API call returns 401 (expired/invalid token), the user is
 * redirected through the logout flow to clear stale session state,
 * then back to login for a fresh authentication.
 */
const proxyBaseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const resolvedArgs =
    typeof args === "string"
      ? resolveProxyUrl(args)
      : { ...args, url: resolveProxyUrl(args.url) };

  const result = await rawBaseQuery(resolvedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token is expired/invalid — go through /logout to properly clear
    // the session cookie + Keycloak tokens, then land on /login.
    // This avoids a redirect loop where /login sees a stale session
    // and sends the user back to /userdashboard.
    // Skip redirect for guest users (they don't have auth sessions).
    if (typeof window !== "undefined") {
      const isGuestMode = document.cookie.includes("guest_session_id=");
      if (!isGuestMode) {
        window.location.replace("/logout");
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: proxyBaseQueryWithReauth,
  tagTypes: ["Auth", "Gateway", "Project", "Scan", "Report", "Git", "CIToken"],
  endpoints: () => ({}),
});
