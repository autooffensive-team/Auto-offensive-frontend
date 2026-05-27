import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest-scan/basic/submit
 * Submits an anonymous basic scan via the backend's /scans/basic/try endpoint.
 * Returns an SSE stream with scan events.
 */
export async function POST(request: Request) {
  const body = await request.text();

  return proxyToScanGatewayAnonymous(request, "/scans/basic/try", {
    method: "POST",
    body,
    headers: {
      accept: "text/event-stream",
      "content-type": "application/json",
    },
  });
}
