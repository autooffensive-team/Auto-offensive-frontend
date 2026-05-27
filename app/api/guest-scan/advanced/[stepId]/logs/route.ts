import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/guest-scan/advanced/[stepId]/logs
 * Streams anonymous advanced scan logs over SSE via the backend's
 * /scans/advanced/try/{step_id}/logs/stream endpoint.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ stepId: string }> },
) {
  const { stepId } = await context.params;

  if (!UUID_REGEX.test(stepId)) {
    return new Response(JSON.stringify({ error: "Invalid step_id format" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return proxyToScanGatewayAnonymous(request, `/scans/advanced/try/${stepId}/logs/stream`, {
    method: "GET",
    headers: {
      accept: "text/event-stream",
    },
  });
}
