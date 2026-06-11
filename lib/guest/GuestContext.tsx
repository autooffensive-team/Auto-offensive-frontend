"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { GUEST_ALLOWED_SCAN_MODES, GUEST_MAX_SCANS } from "./guest-config";

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
  /** Update rate limit directly from known values (e.g. from response headers in scan controller) */
  updateRateLimitDirect: (info: { limit?: number; remaining?: number; reset?: number }) => void;
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

const GUEST_SCAN_STORAGE_KEY = "guest_scan_state";
const GUEST_SCAN_STORAGE_VERSION = 2; // Bump version to invalidate old data

type PersistedGuestState = {
  scansUsed: number;
  scansRemaining: number;
  maxScans: number;
  limitReached: boolean;
  resetAt: number | null;
  savedAt: number;
  version?: number;
};

function loadPersistedState(): Partial<PersistedGuestState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_SCAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedGuestState;
    
    // Clear data if version mismatch (migration) or if it's stale
    const storedVersion = parsed.version ?? 1;
    if (storedVersion !== GUEST_SCAN_STORAGE_VERSION) {
      localStorage.removeItem(GUEST_SCAN_STORAGE_KEY);
      return null;
    }
    
    // Expire persisted state after 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(GUEST_SCAN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistState(state: GuestSessionState) {
  if (typeof window === "undefined") return;
  try {
    const toSave: PersistedGuestState = {
      scansUsed: state.scansUsed,
      scansRemaining: state.scansRemaining,
      maxScans: state.maxScans,
      limitReached: state.limitReached,
      resetAt: state.resetAt,
      savedAt: Date.now(),
      version: GUEST_SCAN_STORAGE_VERSION,
    };
    localStorage.setItem(GUEST_SCAN_STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore quota errors */ }
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuestSessionState>({
    isGuest: true,
    sessionId: null,
    scansUsed: 0,
    scansRemaining: GUEST_MAX_SCANS,
    maxScans: GUEST_MAX_SCANS,
    resetAt: null,
    limitReached: false,
    loading: true,
  });

  // Hydrate from localStorage on client mount (avoids SSR mismatch)
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      setState((prev) => ({
        ...prev,
        scansUsed: persisted.scansUsed ?? prev.scansUsed,
        scansRemaining: persisted.scansRemaining ?? prev.scansRemaining,
        maxScans: persisted.maxScans ?? prev.maxScans,
        resetAt: persisted.resetAt ?? prev.resetAt,
        limitReached: persisted.limitReached ?? prev.limitReached,
      }));
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!state.loading) {
      persistState(state);
    }
  }, [state]);

  /**
   * Fetch the real rate limit from the backend via our proxy endpoint.
   * This probes the backend without consuming a scan.
   * Only updates state if the backend returns actual rate-limit data.
   * If the backend returned 429, we get definitive "exhausted" info.
   * If the backend returned 422 (no headers), we get all nulls — keep local state.
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/guest-scan/status", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();

        // limitReached === true means the backend confirmed quota is exhausted (429)
        if (data.limitReached === true) {
          setState((prev) => ({
            ...prev,
            maxScans: data.maxScans ?? prev.maxScans,
            scansUsed: data.scansUsed ?? prev.maxScans,
            scansRemaining: 0,
            resetAt: data.resetAt ?? prev.resetAt,
            limitReached: true,
            loading: false,
          }));
          return;
        }

        // If we have actual numeric data from rate-limit headers, use it
        const hasData = data.maxScans != null || data.scansRemaining != null || data.scansUsed != null;
        if (hasData) {
          setState((prev) => ({
            ...prev,
            maxScans: data.maxScans ?? prev.maxScans,
            scansUsed: data.scansUsed ?? prev.scansUsed,
            scansRemaining: data.scansRemaining ?? prev.scansRemaining,
            resetAt: data.resetAt ?? prev.resetAt,
            limitReached: data.scansRemaining != null ? data.scansRemaining === 0 : prev.limitReached,
            loading: false,
          }));
        } else {
          // Backend returned no rate-limit info (422, no headers) — keep local state
          setState((prev) => ({ ...prev, loading: false }));
        }
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

  /**
   * Update rate limit directly from known values.
   * If rate-limit headers were present, uses them directly.
   * If not (backend didn't send headers), does an optimistic decrement.
   */
  const updateRateLimitDirect = useCallback(
    (info: { limit?: number; remaining?: number; reset?: number }) => {
      setState((prev) => {
        // If we have actual values from the backend, use them
        if (info.limit != null || info.remaining != null) {
          const maxScans = info.limit ?? prev.maxScans;
          const scansRemaining = info.remaining ?? prev.scansRemaining;
          const scansUsed = maxScans - scansRemaining;
          return {
            ...prev,
            maxScans,
            scansUsed,
            scansRemaining,
            resetAt: info.reset ?? prev.resetAt,
            limitReached: scansRemaining <= 0,
          };
        }
        // No data from backend — optimistic decrement
        const newRemaining = Math.max(0, prev.scansRemaining - 1);
        return {
          ...prev,
          scansUsed: prev.scansUsed + 1,
          scansRemaining: newRemaining,
          limitReached: newRemaining <= 0,
        };
      });
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
        updateRateLimitDirect,
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
