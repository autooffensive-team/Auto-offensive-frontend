import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { readRequiredEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";

const gatewayBaseUrl = readRequiredEnv("FASTAPI_GATEWAY_URL");
const blockedRequestHeaders = new Set([
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
];

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function buildUpstreamUrl(pathSegments: string[], requestUrl: string): string {
  const upstream = new URL(gatewayBaseUrl);
  const path = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");

  upstream.pathname = `${upstream.pathname.replace(/\/$/, "")}/${path}`;
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
  accessToken: string,
): Promise<Response> {
  const headers = forwardRequestHeaders(request.headers);
  headers.set("authorization", `Bearer ${accessToken}`);

  return fetch(upstreamUrl, {
    method: request.method.toUpperCase(),
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ error: "Invalid proxy path" }, { status: 400 });
  }

  const method = request.method.toUpperCase();
  const upstreamUrl = buildUpstreamUrl(path, request.url);

  const accessToken = await getKeycloakAccessToken(request);
  if (!accessToken) {
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
    let upstreamResponse = await proxyToGateway(request, upstreamUrl, body, accessToken);

    if (upstreamResponse.status === 401) {
      const refreshedAccessToken = await refreshKeycloakAccessToken(request);
      if (refreshedAccessToken) {
        upstreamResponse = await proxyToGateway(request, upstreamUrl, body, refreshedAccessToken);
      }
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: copyResponseHeaders(upstreamResponse.headers),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach backend service" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}
