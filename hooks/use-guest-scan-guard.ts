"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";

/**
 * Hook that wraps scan submissions with guest validation.
 * For authenticated users, it's a no-op passthrough.
 * For guest users, it validates the scan limit before allowing submission.
 *
 * Returns:
 * - guardedSubmit: wraps any async submit function with guest validation
 * - isGuest: whether the current user is a guest
 * - limitReached: whether the guest scan limit has been reached
 * - showLimitModal: whether to show the scan limit modal
 * - closeLimitModal: close the limit modal
 * - showLockModal: whether to show the lock modal (for advanced mode)
 * - closeLockModal: close the lock modal
 * - lockedFeature: name of the locked feature
 * - handleLockedFeature: trigger the lock modal for a feature
 * - guestSubmitBasicScan: submit a basic scan using the guest API (no auth needed)
 */
export function useGuestScanGuard() {
  const guest = useOptionalGuestContext();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

  const isGuest = guest?.isGuest ?? false;
  const limitReached = isGuest && (guest?.scansRemaining ?? 0) <= 0;

  /**
   * Wraps a scan submit function with guest validation.
   * If the user is not a guest, the original function is called directly.
   * If the user is a guest, validates the scan limit first.
   */
  const guardedSubmit = useCallback(
    async (originalSubmit: () => Promise<void>) => {
      if (!guest || !guest.isGuest) {
        // Authenticated user — no guard needed
        await originalSubmit();
        return;
      }

      // Guest user — check limit
      if (guest.scansRemaining <= 0) {
        toast.error(
          "You've used all 5 guest scans. Please create an account to continue scanning.",
          {
            duration: 5000,
            action: {
              label: "Register",
              onClick: () => {
                window.location.href = "/register";
              },
            },
          },
        );
        return;
      }

      // Validate with server (increments count)
      const allowed = await guest.validateScan();
      if (!allowed) {
        toast.error(
          "You've used all 5 guest scans. Please create an account to continue scanning.",
          {
            duration: 5000,
            action: {
              label: "Register",
              onClick: () => {
                window.location.href = "/register";
              },
            },
          },
        );
        return;
      }

      // Allowed — proceed with scan
      await originalSubmit();
    },
    [guest],
  );

  /**
   * Submit a basic scan using the guest-friendly API endpoint.
   * This uses /api/guest-scan/basic/submit which authenticates via env token,
   * not user session. Returns the SSE response for streaming.
   */
  const guestSubmitBasicScan = useCallback(
    async (params: {
      target: string;
      toolName: string;
      preset: string;
    }): Promise<Response> => {
      const response = await fetch("/api/guest-scan/basic/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          target: params.target.trim(),
          tool: params.toolName,
          preset: params.preset,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to start scan");
      }

      return response;
    },
    [],
  );

  /**
   * Submit an advanced scan using the guest-friendly API endpoint.
   * This uses /api/guest-scan/advanced/submit which authenticates via env token,
   * not user session. Returns the SSE response for streaming.
   */
  const guestSubmitAdvancedScan = useCallback(
    async (params: { command: string }): Promise<Response> => {
      const response = await fetch("/api/guest-scan/advanced/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          command: params.command.trim(),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to start advanced scan");
      }

      return response;
    },
    [],
  );

  const handleLockedFeature = useCallback((feature: string) => {
    setLockedFeature(feature);
    setShowLockModal(true);
  }, []);

  const closeLimitModal = useCallback(() => setShowLimitModal(false), []);
  const closeLockModal = useCallback(() => setShowLockModal(false), []);

  return {
    isGuest,
    limitReached,
    guardedSubmit,
    guestSubmitBasicScan,
    guestSubmitAdvancedScan,
    showLimitModal,
    closeLimitModal,
    showLockModal,
    closeLockModal,
    lockedFeature,
    handleLockedFeature,
    scansRemaining: guest?.scansRemaining ?? 0,
    maxScans: guest?.maxScans ?? 3,
    refreshSession: guest?.refreshSession,
    updateRateLimitDirect: guest?.updateRateLimitDirect,
  };
}
