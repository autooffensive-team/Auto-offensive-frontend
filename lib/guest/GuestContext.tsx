"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { GUEST_ALLOWED_SCAN_MODES } from "./guest-config";

type GuestSessionState = {
  isGuest: boolean;
  sessionId: string | null;
  scansUsed: number;
  scansRemaining: number;
  maxScans: number;
  resetAt: number | null;
  limitReached: boolean;
  loading: boolean;
};

type GuestContextValue = GuestSessionState & {
  /** Validate scan — now just checks local state (backend is the authority) */
  validateScan: () => Promise<boolean>;
  /** Check if a scan mode is allowed for guests */
  isScanModeAllowed: (mode: string) => boolean;
  /** Check if a route/feature is locked for guests */
  isFeatureLocked: (feature: string) => boolean;
  /** Refresh rate limit data from backend */
  refreshSession: () => Promise<void>;
  /** Update rate limit info from a backend response (429 or success with headers) */
  updateRateLimitFromResponse: (response: Response) => void;
  /** Update rate limit from a 429 error body */
  updateRateLimitFromError: (detail: { limit?: number; remaining?: number; reset_at?: number }) => void;
};

const GuestContext = createContext<GuestContextValue | null>(null);

/** Features/routes that are locked for guest users */
const LOCKED_FEATURES = new Set([
  "assets",
  "projects",
  "code-scanning",
  "findings",
  "reports",
  "profile",
  "settings",
]);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuestSessionState>({
    isGuest: true,
    sessionId: null,
    scansUsed: 0,
    scansRemaining: 3,
    maxScans: 3,
    resetAt: null,
    limitReached: false,
    loading: true,
  });

  /**
   * Fetch the real rate limit from the backend via our proxy endpoint.
   * This probes the backend without consuming a scan.
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/guest-scan/status", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          maxScans: data.maxScans ?? prev.maxScans,
          scansUsed: data.scansUsed ?? prev.scansUsed,
          scansRemaining: data.scansRemaining ?? prev.scansRemaining,
          resetAt: data.resetAt ?? prev.resetAt,
          limitReached: data.limitReached ?? (data.scansRemaining === 0),
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /**
   * Check if the guest can scan (based on local state from backend).
   * The backend is the real authority — if local state says OK but backend
   * returns 429, the scan controller handles it.
   */
  const validateScan = useCallback(async (): Promise<boolean> => {
    if (state.scansRemaining <= 0 || state.limitReached) {
      return false;
    }
    return true;
  }, [state.scansRemaining, state.limitReached]);

  const isScanModeAllowed = useCallback((mode: string): boolean => {
    return (GUEST_ALLOWED_SCAN_MODES as readonly string[]).includes(mode);
  }, []);

  const isFeatureLocked = useCallback((feature: string): boolean => {
    return LOCKED_FEATURES.has(feature);
  }, []);

  /**
   * Update rate limit state from backend response headers.
   * Call this after any guest scan API response to sync the limit info.
   */
  const updateRateLimitFromResponse = useCallback((response: Response) => {
    const limit = response.headers.get("x-ratelimit-limit");
    const remaining = response.headers.get("x-ratelimit-remaining");
    const resetAt = response.headers.get("x-ratelimit-reset");

    if (limit != null || remaining != null) {
      setState((prev) => {
        const maxScans = limit != null ? Number(limit) : prev.maxScans;
        const scansRemaining = remaining != null ? Number(remaining) : prev.scansRemaining;
        const scansUsed = maxScans - scansRemaining;
        return {
          ...prev,
          maxScans,
          scansUsed,
          scansRemaining,
          resetAt: resetAt ? Number(resetAt) : prev.resetAt,
          limitReached: scansRemaining <= 0,
        };
      });
    }
  }, []);

  /**
   * Update rate limit from a 429 error response body.
   * The backend returns: { detail: { error, limit, remaining, reset_at } }
   */
  const updateRateLimitFromError = useCallback(
    (detail: { limit?: number; remaining?: number; reset_at?: number }) => {
      setState((prev) => ({
        ...prev,
        maxScans: detail.limit ?? prev.maxScans,
        scansRemaining: detail.remaining ?? 0,
        scansUsed: (detail.limit ?? prev.maxScans) - (detail.remaining ?? 0),
        resetAt: detail.reset_at ?? prev.resetAt,
        limitReached: true,
      }));
    },
    [],
  );

  return (
    <GuestContext.Provider
      value={{
        ...state,
        validateScan,
        isScanModeAllowed,
        isFeatureLocked,
        refreshSession,
        updateRateLimitFromResponse,
        updateRateLimitFromError,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuestContext(): GuestContextValue {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuestContext must be used within a GuestProvider");
  }
  return context;
}

/**
 * Hook that returns null when not in guest context (for use in shared components).
 * Returns the guest context if available, null otherwise.
 */
export function useOptionalGuestContext(): GuestContextValue | null {
  return useContext(GuestContext);
}
