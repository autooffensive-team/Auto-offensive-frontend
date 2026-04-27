import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();

  return proxyToScanGateway(request, "/scans/basic/submit", {
    method: "POST",
    body,
    headers: {
      accept: "text/event-stream",
      "content-type": "application/json",
    },
  });
}
