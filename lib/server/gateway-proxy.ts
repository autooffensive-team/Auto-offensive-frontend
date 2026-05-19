import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";

const gatewayBaseUrl =
  readOptionalEnv("BACKEND_URL", "") || readRequiredEnv("FASTAPI_GATEWAY_URL");

const defaultPublicProxyPaths = new Set(["users", "tools", "categories"]);

const blockedRequestHeaders = new Set([
  "accept-encoding",
  "authorization",
  "connection",
  "cookie",
  "content-length",
  "host",
  "transfer-encoding",
]);

const passthroughResponseHeaders = [
  "cache-control",
  "content-disposition",
  "content-type",
  "etag",
  "last-modified",
  "location",
  "x-accel-buffering",
];

export type GatewayRouteContext = {
  params: Promise<{ path: string[] }>;
};

export type GatewayProxyOptions = {
  upstreamPrefix?: string[];
  publicProxyPaths?: Set<string>;
};

function buildUpstreamUrl(
  pathSegments: string[],
  requestUrl: string,
  upstreamPrefix: string[] = [],
): string {
  const upstream = new URL(gatewayBaseUrl);
  const fullPath = [...upstreamPrefix, ...pathSegments]
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  upstream.pathname = `${upstream.pathname.replace(/\/$/, "")}/${fullPath}`;
  upstream.search = new URL(requestUrl).search;
  return upstream.toString();
}

function forwardRequestHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const [key, value] of source.entries()) {
    if (blockedRequestHeaders.has(key.toLowerCase())) {
      continue;
    }
    headers.set(key, value);
  }
  return headers;
}

function copyResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const key of passthroughResponseHeaders) {
    const value = source.get(key);
    if (value) {
      headers.set(key, value);
    }
  }
  return headers;
}

function isPublicProxyPath(
  pathSegments: string[],
  publicProxyPaths: Set<string>,
): boolean {
  return publicProxyPaths.has(pathSegments.join("/"));
}

async function getKeycloakAccessToken(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return null;
  }

  const tokenResult = await auth.api.getAccessToken({
    headers: request.headers,
    body: {
      providerId: "keycloak",
    },
  }).catch(() => null);

  return tokenResult?.accessToken ?? null;
}

async function refreshKeycloakAccessToken(request: NextRequest): Promise<string | null> {
  const refreshed = await auth.api.refreshToken({
    headers: request.headers,
    body: {
      providerId: "keycloak",
    },
  }).catch(() => null);

  return refreshed?.accessToken ?? null;
}

async function proxyToGateway(
  request: NextRequest,
  upstreamUrl: string,
  body: BodyInit | undefined,
  accessToken?: string,
): Promise<Response> {
  const headers = forwardRequestHeaders(request.headers);
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return fetch(upstreamUrl, {
    method: request.method.toUpperCase(),
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });
}

// Best-effort detection of transient network failures from undici/node fetch.
// These can happen when the upstream restarts, sleeps, or briefly drops a
// keep-alive connection. A single retry catches most of them safely.
function isTransientFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = (error as { cause?: { code?: string; message?: string } }).cause;
  const code = cause?.code ?? "";
  const message = `${error.message ?? ""} ${cause?.message ?? ""}`.toLowerCase();
  if (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "EAI_AGAIN" ||
    code === "UND_ERR_SOCKET" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return true;
  }
  return (
    message.includes("fetch failed") ||
    message.includes("socket hang up") ||
    message.includes("network socket disconnected") ||
    message.includes("other side closed")
  );
}

export async function proxyGatewayRequest(
  request: NextRequest,
  context: GatewayRouteContext,
  options: GatewayProxyOptions = {},
): Promise<NextResponse> {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ error: "Invalid proxy path" }, { status: 400 });
  }

  const method = request.method.toUpperCase();
  const publicProxyPaths = options.publicProxyPaths ?? defaultPublicProxyPaths;
  const upstreamUrl = buildUpstreamUrl(path, request.url, options.upstreamPrefix);
  const isPublicPath = isPublicProxyPath(path, publicProxyPaths);

  const accessToken = isPublicPath ? null : await getKeycloakAccessToken(request);
  if (!isPublicPath && !accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      body = arrayBuffer;
    }
  }

  try {
    let upstreamResponse: Response;
    try {
      upstreamResponse = await proxyToGateway(
        request,
        upstreamUrl,
        body,
        accessToken ?? undefined,
      );
    } catch (firstError) {
      // Retry once for transient network errors (idle keep-alive sockets,
      // upstream restarts, brief DNS hiccups). Same body buffer is reused.
      if (!isTransientFetchError(firstError)) throw firstError;
      console.warn(
        `[gateway-proxy] transient upstream fetch error, retrying once: ${method} ${upstreamUrl}`,
        firstError,
      );
      upstreamResponse = await proxyToGateway(
        request,
        upstreamUrl,
        body,
        accessToken ?? undefined,
      );
    }

    if (!isPublicPath && upstreamResponse.status === 401) {
      const refreshedAccessToken = await refreshKeycloakAccessToken(request);
      if (refreshedAccessToken) {
        upstreamResponse = await proxyToGateway(
          request,
          upstreamUrl,
          body,
          refreshedAccessToken,
        );
      }
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: copyResponseHeaders(upstreamResponse.headers),
    });
  } catch (error) {
    const cause = (error as { cause?: { code?: string } })?.cause;
    const code = cause?.code ?? (error instanceof Error ? error.name : "unknown");
    console.error(
      `[gateway-proxy] upstream fetch failed: ${method} ${upstreamUrl} (${code})`,
      error,
    );
    return NextResponse.json(
      { error: "Unable to reach backend service", code },
      { status: 502 },
    );
  }
}
