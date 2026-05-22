"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { GUEST_MAX_SCANS, GUEST_ALLOWED_SCAN_MODES } from "./guest-config";

type GuestSessionState = {
  isGuest: boolean;
  sessionId: string | null;
  scansUsed: number;
  scansRemaining: number;
  maxScans: number;
  loading: boolean;
};

type GuestContextValue = GuestSessionState & {
  /** Validate and consume one scan credit. Returns true if allowed. */
  validateScan: () => Promise<boolean>;
  /** Check if a scan mode is allowed for guests */
  isScanModeAllowed: (mode: string) => boolean;
  /** Check if a route/feature is locked for guests */
  isFeatureLocked: (feature: string) => boolean;
  /** Refresh session data from server */
  refreshSession: () => Promise<void>;
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
  "advanced-scan",
]);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuestSessionState>({
    isGuest: true,
    sessionId: null,
    scansUsed: 0,
    scansRemaining: GUEST_MAX_SCANS,
    maxScans: GUEST_MAX_SCANS,
    loading: true,
  });

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/guest/session", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setState({
          isGuest: true,
          sessionId: data.sessionId,
          scansUsed: data.scansUsed,
          scansRemaining: data.scansRemaining,
          maxScans: data.maxScans,
          loading: false,
        });
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const validateScan = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/guest/scan/validate", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.allowed) {
        setState((prev) => ({
          ...prev,
          scansUsed: data.scansUsed,
          scansRemaining: data.scansRemaining,
        }));
        return true;
      }

      // Update state with server values
      if (data.scansUsed !== undefined) {
        setState((prev) => ({
          ...prev,
          scansUsed: data.scansUsed,
          scansRemaining: data.scansRemaining ?? 0,
        }));
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const isScanModeAllowed = useCallback((mode: string): boolean => {
    return (GUEST_ALLOWED_SCAN_MODES as readonly string[]).includes(mode);
  }, []);

  const isFeatureLocked = useCallback((feature: string): boolean => {
    return LOCKED_FEATURES.has(feature);
  }, []);

  return (
    <GuestContext.Provider
      value={{
        ...state,
        validateScan,
        isScanModeAllowed,
        isFeatureLocked,
        refreshSession,
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
