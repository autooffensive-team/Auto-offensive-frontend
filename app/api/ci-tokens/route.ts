import { NextRequest, NextResponse } from "next/server";

import { proxyGatewayRequest } from "@/lib/server/gateway-proxy";

export const dynamic = "force-dynamic";

const ciTokenProxyOptions = {
  upstreamPrefix: ["api", "v1", "ci-tokens"],
  publicProxyPaths: new Set<string>(),
};

const rootContext = {
  params: Promise.resolve({ path: [] as string[] }),
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyGatewayRequest(request, rootContext, ciTokenProxyOptions);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyGatewayRequest(request, rootContext, ciTokenProxyOptions);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return proxyGatewayRequest(request, rootContext, ciTokenProxyOptions);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return proxyGatewayRequest(request, rootContext, ciTokenProxyOptions);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return proxyGatewayRequest(request, rootContext, ciTokenProxyOptions);
}
