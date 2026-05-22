/**
 * Guest user configuration constants.
 * Centralized so both frontend and API routes share the same values.
 */

/** Maximum number of scans a guest user can perform */
export const GUEST_MAX_SCANS = 3;

/** Cookie name for the guest session token */
export const GUEST_SESSION_COOKIE = "guest_session_id";

/** How long a guest session lasts (24 hours in seconds) */
export const GUEST_SESSION_TTL_SECONDS = 60 * 60 * 24;

/** Scan modes allowed for guest users */
export const GUEST_ALLOWED_SCAN_MODES = ["basic", "medium"] as const;

/** Dashboard routes that guests can access */
export const GUEST_ALLOWED_ROUTES = [
  "/guest-dashboard",
  "/guest-dashboard/scan",
] as const;

/** Dashboard routes that are locked for guests */
export const GUEST_LOCKED_ROUTES = [
  "/guest-dashboard/assets",
  "/guest-dashboard/projects",
  "/guest-dashboard/code-scanning",
  "/guest-dashboard/findings",
  "/guest-dashboard/reports",
  "/guest-dashboard/profile",
  "/guest-dashboard/settings",
] as const;
