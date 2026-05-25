import "server-only";

const BASE_URL_KEYS = [
  "SCAN_API_BASE_URL",
  "SCAN_API_URL",
  "FASTAPI_GATEWAY_URL",
  "NEXT_PUBLIC_SCAN_API_URL",
  "NEXT_PUBLIC_FASTAPI_GATEWAY_URL",
] as const;

const TOKEN_KEYS = [
  "SCAN_API_TOKEN",
  "AUTO_OFFENSIVE_API_KEY",
  "SCAN_API_KEY",
  "NEXT_PUBLIC_SCAN_API_TOKEN",
] as const;

function readEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getBaseUrl() {
  const baseUrl = readEnv(BASE_URL_KEYS);
  if (!baseUrl) {
    throw new Error(
      "Missing scan gateway URL. Set one of: SCAN_API_BASE_URL, SCAN_API_URL, FASTAPI_GATEWAY_URL, NEXT_PUBLIC_SCAN_API_URL, NEXT_PUBLIC_FASTAPI_GATEWAY_URL.",
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

function getAuthorizationHeader(request: Request) {
  const forwarded = request.headers.get("authorization");
  if (forwarded?.trim()) {
    return forwarded.trim();
  }

  const token = readEnv(TOKEN_KEYS);
  if (!token) {
    throw new Error(
      "Missing scan gateway token. Set one of: SCAN_API_TOKEN, AUTO_OFFENSIVE_API_KEY, SCAN_API_KEY, NEXT_PUBLIC_SCAN_API_TOKEN.",
    );
  }

  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

export async function proxyToScanGateway(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const url = new URL(`${getBaseUrl()}${path}`);
  const method = init.method ?? request.method;
  const headers = new Headers(init.headers);

  headers.set("authorization", getAuthorizationHeader(request));

  const contentType = request.headers.get("content-type");
  if (contentType && !headers.has("content-type")) {
    headers.set("content-type", contentType);
  }

  const accept = request.headers.get("accept");
  if (accept && !headers.has("accept")) {
    headers.set("accept", accept);
  }

  const upstream = await fetch(url, {
    ...init,
    method,
    headers,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");

  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  if (upstreamContentType?.includes("text/event-stream")) {
    responseHeaders.set("cache-control", "no-cache");
    responseHeaders.set("connection", "keep-alive");
    responseHeaders.set("x-accel-buffering", "no");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

/**
 * Proxy to the scan gateway WITHOUT attaching any authorization header.
 * Used for anonymous/guest endpoints like /scans/basic/try and /scans/advanced/try
 * which don't require authentication on the backend.
 * Forwards rate-limit headers from the backend response.
 *
 * Non-2xx responses that return HTML (e.g. Cloudflare error pages) are
 * intercepted and replaced with a clean JSON error so the client never
 * receives raw HTML markup as an error message.
 */
export async function proxyToScanGatewayAnonymous(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const url = new URL(`${getBaseUrl()}${path}`);
  const method = init.method ?? request.method;
  const headers = new Headers(init.headers);

  const contentType = request.headers.get("content-type");
  if (contentType && !headers.has("content-type")) {
    headers.set("content-type", contentType);
  }

  const accept = request.headers.get("accept");
  if (accept && !headers.has("accept")) {
    headers.set("accept", accept);
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      ...init,
      method,
      headers,
      cache: "no-store",
    });
  } catch (err) {
    // Network-level failure (DNS, connection refused, etc.)
    return Response.json(
      { detail: "The scan service is currently unreachable. Please try again later." },
      { status: 503 },
    );
  }

  const upstreamContentType = upstream.headers.get("content-type") ?? "";

  // Collect rate-limit headers to forward regardless of response shape
  const rateLimitHeaders = [
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
  ];
  const forwardedRateLimitHeaders: Record<string, string> = {};
  for (const header of rateLimitHeaders) {
    const value = upstream.headers.get(header);
    if (value) forwardedRateLimitHeaders[header] = value;
  }

  // If the upstream returned an error status with an HTML body (e.g. a
  // Cloudflare 502/503/504 page), replace it with a clean JSON error so the
  // client never has to parse raw markup.
  if (!upstream.ok && upstreamContentType.includes("text/html")) {
    const statusMessages: Record<number, string> = {
      502: "The scan service returned a bad gateway error (502). It may be temporarily down.",
      503: "The scan service is temporarily unavailable (503). Please try again later.",
      504: "The scan service timed out (504). Please try again later.",
    };
    const detail =
      statusMessages[upstream.status] ??
      `The scan service returned an unexpected error (${upstream.status}). Please try again later.`;

    return Response.json(
      { detail },
      { status: upstream.status, headers: forwardedRateLimitHeaders },
    );
  }

  const responseHeaders = new Headers(forwardedRateLimitHeaders);

  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  if (upstreamContentType.includes("text/event-stream")) {
    responseHeaders.set("cache-control", "no-cache");
    responseHeaders.set("connection", "keep-alive");
    responseHeaders.set("x-accel-buffering", "no");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
