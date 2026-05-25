import { NextRequest, NextResponse } from "next/server";
import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

/**
 * GET /api/guest-scan/status
 * Probes the backend's anonymous scan rate limit by sending an intentionally
 * invalid request body (empty JSON) to /scans/basic/try.
 * The backend returns 422 (validation error) with x-ratelimit-* headers,
 * which tells us the current quota without consuming a scan.
 * If the quota is already exhausted, the backend returns 429 instead.
 */
export async function GET(request: NextRequest) {
  const upstream = await proxyToScanGatewayAnonymous(request, "/scans/basic/try", {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  const limit = upstream.headers.get("x-ratelimit-limit");
  const remaining = upstream.headers.get("x-ratelimit-remaining");
  const reset = upstream.headers.get("x-ratelimit-reset");

  // If we got rate limit headers, return them regardless of status code
  if (limit != null || remaining != null) {
    const maxScans = limit != null ? Number(limit) : null;
    const scansRemaining = remaining != null ? Number(remaining) : null;
    const scansUsed = maxScans != null && scansRemaining != null ? maxScans - scansRemaining : null;

    return NextResponse.json({
      maxScans,
      scansUsed,
      scansRemaining,
      resetAt: reset ? Number(reset) : null,
      limitReached: scansRemaining === 0,
    });
  }

  // No rate limit headers — backend may not support this probe
  return NextResponse.json({
    maxScans: null,
    scansUsed: null,
    scansRemaining: null,
    resetAt: null,
    limitReached: false,
  });
}
