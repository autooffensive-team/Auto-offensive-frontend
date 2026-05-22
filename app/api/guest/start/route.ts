import { NextRequest, NextResponse } from "next/server";
import { GUEST_SESSION_COOKIE, GUEST_SESSION_TTL_SECONDS } from "@/lib/guest/guest-config";

export const dynamic = "force-dynamic";

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * GET /api/guest/start
 * Initiates a guest session by setting a cookie directly on the redirect response.
 * This is the entry point for "Try as Guest" buttons.
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUrl = new URL("/userdashboard", appUrl);

  // Generate a session ID
  const sessionId = generateSessionId();

  // Create the redirect response
  const response = NextResponse.redirect(redirectUrl);

  // Set the guest session cookie directly on the response
  response.cookies.set(GUEST_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_SESSION_TTL_SECONDS,
  });

  return response;
}
