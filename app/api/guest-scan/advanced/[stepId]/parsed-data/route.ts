import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/guest-scan/advanced/[stepId]/parsed-data
 * Returns parsed structured results for an anonymous advanced scan step.
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

  return proxyToScanGatewayAnonymous(request, `/scans/advanced/try/${stepId}/parsed-data`, {
    method: "GET",
  });
}
