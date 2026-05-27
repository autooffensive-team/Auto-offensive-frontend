import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/basic-scan/jobs/[jobId]/summary">,
) {
  const { jobId } = await context.params;

  return proxyToScanGateway(request, `/scans/basic/jobs/${jobId}/summary`, {
    method: "GET",
  });
}
