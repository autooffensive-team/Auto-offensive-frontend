import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GUEST_SESSION_COOKIE, GUEST_MAX_SCANS, GUEST_SESSION_TTL_SECONDS } from "@/lib/guest/guest-config";
import { getGuestSession, registerGuestSession } from "@/lib/guest/guest-session";

export const dynamic = "force-dynamic";

/**
 * GET /api/guest/session
 * Returns the current guest session info.
 * If the cookie exists but the session isn't in memory (server restart, etc.),
 * re-registers it with 0 scans used.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.json(
      { error: "No guest session" },
      { status: 401 },
    );
  }

  // Try to get existing session from memory
  let session = getGuestSession(sessionId);

  // If not in memory (server restart, different process), re-register it
  if (!session) {
    session = registerGuestSession(sessionId);
  }

  return NextResponse.json({
    sessionId: session.sessionId,
    scansUsed: session.scansUsed,
    scansRemaining: GUEST_MAX_SCANS - session.scansUsed,
    maxScans: GUEST_MAX_SCANS,
    expiresAt: session.expiresAt,
  });
}
