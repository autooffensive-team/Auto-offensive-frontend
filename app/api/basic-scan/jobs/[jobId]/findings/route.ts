import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/basic-scan/jobs/[jobId]/findings">,
) {
  const { jobId } = await context.params;
  const requestUrl = new URL(request.url);
  const search = requestUrl.searchParams.toString();
  const suffix = search ? `?${search}` : "";

  return proxyToScanGateway(request, `/scans/basic/jobs/${jobId}/findings${suffix}`, {
    method: "GET",
  });
}
