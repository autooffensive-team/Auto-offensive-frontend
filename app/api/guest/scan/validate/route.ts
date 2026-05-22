import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGuestSession, registerGuestSession, incrementGuestScanCount } from "@/lib/guest/guest-session";
import { GUEST_SESSION_COOKIE, GUEST_MAX_SCANS } from "@/lib/guest/guest-config";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest/scan/validate
 * Validates and increments the guest scan count.
 * Must be called before submitting a scan for guest users.
 * Returns 200 if allowed, 403 if limit reached.
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.json(
      { error: "No guest session found. Please refresh the page.", allowed: false },
      { status: 401 },
    );
  }

  // Get or re-register session
  let session = getGuestSession(sessionId);
  if (!session) {
    session = registerGuestSession(sessionId);
  }

  if (session.scansUsed >= GUEST_MAX_SCANS) {
    return NextResponse.json(
      {
        error: "Guest scan limit reached. Please create an account to continue scanning.",
        allowed: false,
        scansUsed: GUEST_MAX_SCANS,
        scansRemaining: 0,
        maxScans: GUEST_MAX_SCANS,
      },
      { status: 403 },
    );
  }

  const updated = incrementGuestScanCount(sessionId);
  if (!updated) {
    return NextResponse.json(
      { error: "Session expired or limit reached.", allowed: false },
      { status: 403 },
    );
  }

  return NextResponse.json({
    allowed: true,
    scansUsed: updated.scansUsed,
    scansRemaining: GUEST_MAX_SCANS - updated.scansUsed,
    maxScans: GUEST_MAX_SCANS,
  });
}
