import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const search = requestUrl.searchParams.toString();
  const suffix = search ? `?${search}` : "";

  return proxyToScanGateway(request, `/scans/basic/results${suffix}`, {
    method: "GET",
  });
}
