import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest-scan/advanced/submit
 * Submits an anonymous advanced scan via the backend's /scans/advanced/try endpoint.
 * Returns an SSE stream with scan events.
 */
export async function POST(request: Request) {
  const body = await request.text();

  return proxyToScanGatewayAnonymous(request, "/scans/advanced/try", {
    method: "POST",
    body,
    headers: {
      accept: "text/event-stream",
      "content-type": "application/json",
    },
  });
}
