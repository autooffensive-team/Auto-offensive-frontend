import { proxyToScanGateway } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const response = await proxyToScanGateway(request, "/tools?active_only=true", {
    method: "GET",
  });

  if (!response.ok) {
    return response;
  }

  const tools = (await response.json()) as Array<{
    is_active?: boolean;
    scan_config?: {
      basic?: {
        presets?: unknown[];
      };
    };
  }>;

  const filtered = tools.filter((tool) => {
    const presets = tool.scan_config?.basic?.presets;
    return tool.is_active !== false && Array.isArray(presets) && presets.length > 0;
  });

  return Response.json(filtered);
}
