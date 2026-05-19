import { NextRequest, NextResponse } from "next/server";

import { proxyGatewayRequest } from "@/lib/server/gateway-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const scanId = requestUrl.searchParams.get("scan_id")?.trim();

  if (!scanId) {
    return NextResponse.json(
      { error: "scan_id query parameter is required" },
      { status: 400 },
    );
  }

  requestUrl.searchParams.delete("scan_id");
  if (!requestUrl.searchParams.has("include_history")) {
    requestUrl.searchParams.set("include_history", "true");
  }

  const proxyRequest = new NextRequest(requestUrl.toString(), {
    method: request.method,
    headers: request.headers,
  });

  return proxyGatewayRequest(
    proxyRequest,
    {
      params: Promise.resolve({
        path: ["scans", scanId, "logs", "stream"],
      }),
    },
    {
      upstreamPrefix: ["api", "v1", "scanner"],
      publicProxyPaths: new Set<string>(),
    },
  );
}
