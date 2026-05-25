import { NextRequest, NextResponse } from "next/server";
import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

/**
 * GET /api/guest-scan/status
 *
 * Fetches the real anonymous quota info from the backend's dedicated
 * GET /scans/quota/anon endpoint. This is a read-only probe — it never
 * increments the scan counter, so calling it on page load is safe.
 *
 * Previously this sent a dummy POST to /scans/basic/try which accidentally
 * consumed a quota slot before the 422 validation fired.
 */
export async function GET(request: NextRequest) {
  const upstream = await proxyToScanGatewayAnonymous(request, "/scans/quota/anon", {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!upstream.ok) {
    // Backend unavailable — return nulls so the UI falls back to defaults
    return NextResponse.json({
      maxScans: null,
      scansUsed: null,
      scansRemaining: null,
      resetAt: null,
      limitReached: false,
    });
  }

  const data = await upstream.json() as {
    limit: number;
    remaining: number;
    used: number;
    reset_at: number;
    limit_reached: boolean;
  };

  return NextResponse.json({
    maxScans: data.limit,
    scansUsed: data.used,
    scansRemaining: data.remaining,
    resetAt: data.reset_at,
    limitReached: data.limit_reached,
  });
}
