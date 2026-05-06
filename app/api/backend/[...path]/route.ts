import { NextRequest, NextResponse } from "next/server";

import {
  type GatewayRouteContext,
  proxyGatewayRequest,
} from "@/lib/server/gateway-proxy";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: GatewayRouteContext,
): Promise<NextResponse> {
  return proxyGatewayRequest(request, context);
}
