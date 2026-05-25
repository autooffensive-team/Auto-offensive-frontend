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

  // Forward rate-limit headers from the backend
  const rateLimitHeaders = [
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
  ];
  for (const header of rateLimitHeaders) {
    const value = upstream.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
