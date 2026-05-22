import "server-only";

import { cookies } from "next/headers";
import { GUEST_SESSION_COOKIE, GUEST_SESSION_TTL_SECONDS, GUEST_MAX_SCANS } from "./guest-config";

export type GuestSessionData = {
  sessionId: string;
  scansUsed: number;
  createdAt: number;
  expiresAt: number;
};

/**
 * In-memory store for guest sessions.
 * In production, replace with Redis or a database table.
 * This Map persists across requests within the same server process.
 */
const guestSessions = new Map<string, GuestSessionData>();

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get or create a guest session from the request cookies.
 * NOTE: This sets a cookie, so it can ONLY be called from a Route Handler
 * or Server Action — NOT from a Server Component (layout/page).
 */
export async function getOrCreateGuestSession(): Promise<GuestSessionData> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;

  if (existingId) {
    const existing = guestSessions.get(existingId);
    if (existing && existing.expiresAt > Date.now()) {
      return existing;
    }
    // Expired — clean up
    guestSessions.delete(existingId);
  }

  // Create new session
  const sessionId = generateSessionId();
  const now = Date.now();
  const session: GuestSessionData = {
    sessionId,
    scansUsed: 0,
    createdAt: now,
    expiresAt: now + GUEST_SESSION_TTL_SECONDS * 1000,
  };

  guestSessions.set(sessionId, session);

  cookieStore.set(GUEST_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_SESSION_TTL_SECONDS,
  });

  return session;
}

/**
 * Read-only check: does a guest session cookie exist?
 * Safe to call from Server Components (layouts/pages) — only reads cookies.
 * We only check cookie existence here. Actual session validity is checked
 * in the API routes when the guest performs actions (scan validate, etc.).
 */
export async function hasValidGuestSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  return Boolean(sessionId);
}

/**
 * Get an existing guest session by ID (does not read cookies).
 * Returns the session data or null if not found/expired.
 */
export function getGuestSession(sessionId: string): GuestSessionData | null {
  const session = guestSessions.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) guestSessions.delete(sessionId);
    return null;
  }
  return session;
}

/**
 * Register a guest session in memory (for when cookie exists but Map doesn't have it).
 * This happens after server restarts or in multi-process environments.
 * Starts with 0 scans used.
 */
export function registerGuestSession(sessionId: string): GuestSessionData {
  const now = Date.now();
  const session: GuestSessionData = {
    sessionId,
    scansUsed: 0,
    createdAt: now,
    expiresAt: now + GUEST_SESSION_TTL_SECONDS * 1000,
  };
  guestSessions.set(sessionId, session);
  return session;
}

/**
 * Increment the scan count for a guest session.
 * Returns the updated session or null if limit reached.
 */
export function incrementGuestScanCount(sessionId: string): GuestSessionData | null {
  const session = guestSessions.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  if (session.scansUsed >= GUEST_MAX_SCANS) {
    return null;
  }

  session.scansUsed += 1;
  guestSessions.set(sessionId, session);
  return session;
}

/**
 * Validate whether a guest session can perform another scan.
 */
export function canGuestScan(sessionId: string): boolean {
  const session = guestSessions.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    return false;
  }
  return session.scansUsed < GUEST_MAX_SCANS;
}
