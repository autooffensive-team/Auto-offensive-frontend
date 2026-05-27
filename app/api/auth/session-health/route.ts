import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session-health
 *
 * Lightweight endpoint that checks whether the current session has a valid
 * Keycloak access token (or can refresh one). Returns { valid: true/false }.
 *
 * Used by the client-side navbar to avoid showing a stale "Dashboard" button
 * when the Keycloak tokens have expired but the better-auth session cookie
 * still exists.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { valid: false },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    // Try to get a working access token
    const tokenResult = await auth.api
      .getAccessToken({
        headers: request.headers,
        body: { providerId: "keycloak" },
      })
      .catch(() => null);

    if (tokenResult?.accessToken) {
      return NextResponse.json(
        { valid: true },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    // Access token dead — try refresh
    const refreshed = await auth.api
      .refreshToken({
        headers: request.headers,
        body: { providerId: "keycloak" },
      })
      .catch(() => null);

    if (refreshed?.accessToken) {
      return NextResponse.json(
        { valid: true },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    // Both tokens are dead
    return NextResponse.json(
      { valid: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { valid: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
