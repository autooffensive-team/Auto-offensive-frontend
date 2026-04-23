import { NextResponse } from "next/server";

import { readRequiredEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";

const gatewayBaseUrl = readRequiredEnv("FASTAPI_GATEWAY_URL");
const blockedRequestHeaders = new Set([
  "connection",
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

async function proxyRequest(request: Request, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ error: "Invalid proxy path" }, { status: 400 });
  }

  const method = request.method.toUpperCase();
  const upstreamUrl = buildUpstreamUrl(path, request.url);

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const arrayBuffer = await request.arrayBuffer();
    if (arrayBuffer.byteLength > 0) {
      body = arrayBuffer;
    }
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: forwardRequestHeaders(request.headers),
      body,
      cache: "no-store",
      redirect: "manual",
    });

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

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyRequest(request, context);
}
