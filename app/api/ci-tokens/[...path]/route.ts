import { NextRequest, NextResponse } from "next/server";

import {
  type GatewayRouteContext,
  proxyGatewayRequest,
} from "@/lib/server/gateway-proxy";

export const dynamic = "force-dynamic";

const ciTokenProxyOptions = {
  upstreamPrefix: ["api", "v1", "ci-tokens"],
  publicProxyPaths: new Set<string>(),
};

export async function GET(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context, ciTokenProxyOptions);
}

export async function POST(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context, ciTokenProxyOptions);
}

export async function PUT(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context, ciTokenProxyOptions);
}

export async function PATCH(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context, ciTokenProxyOptions);
}

export async function DELETE(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context, ciTokenProxyOptions);
}
