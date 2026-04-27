import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/basic-scan/jobs/[jobId]">,
) {
  const { jobId } = await context.params;

  return proxyToScanGateway(request, `/scans/basic/jobs/${jobId}`, {
    method: "GET",
  });
}
