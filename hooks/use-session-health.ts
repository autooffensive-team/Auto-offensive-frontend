"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";

/**
 * Checks whether the current better-auth session still has valid Keycloak
 * tokens. This prevents the navbar from showing "Dashboard" when the OAuth
 * tokens have expired but the session cookie is still present.
 *
 * - Runs once on mount
 * - Re-checks when the window regains focus (user returns to tab)
 * - Debounces rapid focus events
 */

let cachedValid: boolean | null = null;
let listeners: Set<() => void> = new Set();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return cachedValid;
}

function notify() {
  listeners.forEach((cb) => cb());
}

async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session-health", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    // Network error — assume invalid to be safe
    return false;
  }
}

/**
 * Hook that returns whether the session's OAuth tokens are still valid.
 * Returns:
 * - `null` while checking (initial load)
 * - `true` if tokens are alive
 * - `false` if tokens are expired
 */
export function useSessionHealth(hasSession: boolean) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckRef = useRef<number>(0);

  const valid = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const runCheck = useCallback(async () => {
    // Don't check if there's no session at all
    if (!hasSession) {
      if (cachedValid !== null) {
        cachedValid = null;
        notify();
      }
      return;
    }

    // Throttle: don't re-check within 30 seconds
    const now = Date.now();
    if (now - lastCheckRef.current < 30_000) return;
    lastCheckRef.current = now;

    const result = await checkHealth();
    if (cachedValid !== result) {
      cachedValid = result;
      notify();
    }
  }, [hasSession]);

  // Check on mount and when hasSession changes
  useEffect(() => {
    runCheck();
  }, [runCheck]);

  // Re-check on window focus
  useEffect(() => {
    if (!hasSession) return;

    const handleFocus = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runCheck();
      }, 500);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleFocus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasSession, runCheck]);

  // Reset cache when session disappears
  useEffect(() => {
    if (!hasSession && cachedValid !== null) {
      cachedValid = null;
      notify();
    }
  }, [hasSession]);

  return valid;
}
