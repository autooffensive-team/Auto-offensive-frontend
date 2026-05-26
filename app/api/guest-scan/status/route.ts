import { NextRequest, NextResponse } from "next/server";
import { proxyToScanGatewayAnonymous } from "@/lib/scan-gateway";

export const dynamic = "force-dynamic";

/**
 * GET /api/guest-scan/status
 * Probes the backend's anonymous scan rate limit by sending an intentionally
 * invalid request body (empty JSON) to /scans/basic/try.
 *
 * Inference logic:
 * - If the backend returns x-ratelimit-* headers (on any status), use them directly.
 * - If the backend returns 429 (no headers), the quota is exhausted → remaining = 0.
 * - If the backend returns 422 (no headers), the quota is NOT exhausted (validation
 *   error means the request passed rate-limiting). We can't know the exact count,
 *   so we return null to let the frontend keep its local state.
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

  // No rate-limit headers — infer from HTTP status code
  if (upstream.status === 429) {
    // Backend rejected due to rate limit — quota is exhausted
    // Try to extract reset info from the 429 body
    let resetAt: number | null = null;
    let maxScans: number | null = 3; // default assumption
    try {
      const body = await upstream.json();
      if (body?.detail?.reset_at) {
        resetAt = Number(body.detail.reset_at);
      }
      if (body?.detail?.limit) {
        maxScans = Number(body.detail.limit);
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      maxScans,
      scansUsed: maxScans,
      scansRemaining: 0,
      resetAt,
      limitReached: true,
    });
  }

  // 422 or other status without headers — quota is NOT exhausted,
  // but we don't know the exact count. Return null to preserve frontend local state.
  return NextResponse.json({
    maxScans: null,
    scansUsed: null,
    scansRemaining: null,
    resetAt: null,
    limitReached: null,
  });
}
