// useScanStream.ts — Custom hook bridging scan props to Graph Store
// Simplified: no pulse mapping (React Flow handles animations via animated edges)

"use client";

import { useEffect, useRef } from "react";
import type { ActiveRun } from "@/types/scan";
import { useGraphStore, classifyStatus } from "./graph.store";
import type { LogLine, StatusClassification } from "./graph.store";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THROTTLE_MS = 16;

// ---------------------------------------------------------------------------
// Hook: useScanStream
// ---------------------------------------------------------------------------

/**
 * Side-effect hook that bridges `run`, `logs`, and `errors` props into the
 * Graph Store. Syncs external props to the Zustand store for visualization.
 *
 * Responsibilities:
 * - Throttle ActiveRun updates to 16ms via requestAnimationFrame
 * - Reset store state on scan start (idle → running transition)
 * - Freeze store updates on terminal state
 * - Handle cleanup of rAF handles on unmount
 */
export function useScanStream(
    run: ActiveRun,
    logs: LogLine[],
    errors: string[]
): void {
    const prevStatusRef = useRef<StatusClassification>("idle");
    const prevLogsLengthRef = useRef<number>(0);
    const prevErrorsLengthRef = useRef<number>(0);
    const rafIdRef = useRef<number | null>(null);
    const lastSyncTimeRef = useRef<number>(0);

    const syncFromActiveRun = useGraphStore((s) => s.syncFromActiveRun);
    const appendLog = useGraphStore((s) => s.appendLog);
    const reset = useGraphStore((s) => s.reset);

    // -------------------------------------------------------------------------
    // Effect: Sync ActiveRun to store with throttling and lifecycle transitions
    // -------------------------------------------------------------------------
    useEffect(() => {
        const currentClassification = classifyStatus(run.status);
        const prevClassification = prevStatusRef.current;

        // Detect idle → running transition: reset store before syncing
        if (prevClassification === "idle" && currentClassification === "running") {
            reset();
        }

        prevStatusRef.current = currentClassification;

        // If terminal, perform one final sync (store will freeze itself)
        if (currentClassification === "terminal") {
            syncFromActiveRun(run);
            return;
        }

        // Throttle: only sync if enough time has passed since last sync
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        const elapsed = now - lastSyncTimeRef.current;

        if (elapsed >= THROTTLE_MS) {
            syncFromActiveRun(run);
            lastSyncTimeRef.current = now;
        } else {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(() => {
                syncFromActiveRun(run);
                lastSyncTimeRef.current =
                    typeof performance !== "undefined" ? performance.now() : Date.now();
                rafIdRef.current = null;
            });
        }
    }, [run, syncFromActiveRun, reset]);

    // -------------------------------------------------------------------------
    // Effect: Process new log entries
    // -------------------------------------------------------------------------
    useEffect(() => {
        const currentLength = logs.length;
        const prevLength = prevLogsLengthRef.current;

        if (currentLength <= prevLength) {
            prevLogsLengthRef.current = currentLength;
            return;
        }

        for (let i = prevLength; i < currentLength; i++) {
            appendLog(logs[i]);
        }

        prevLogsLengthRef.current = currentLength;
    }, [logs, appendLog]);

    // -------------------------------------------------------------------------
    // Effect: Handle connection errors
    // -------------------------------------------------------------------------
    useEffect(() => {
        const currentLength = errors.length;
        const prevLength = prevErrorsLengthRef.current;

        if (currentLength > prevLength && currentLength > 0) {
            const classification = classifyStatus(run.status);
            if (classification !== "terminal") {
                useGraphStore.setState({ disconnected: true });
            }
        } else if (currentLength === 0 && prevLength > 0) {
            useGraphStore.setState({ disconnected: false });
        }

        prevErrorsLengthRef.current = currentLength;
    }, [errors, run.status]);

    // -------------------------------------------------------------------------
    // Cleanup: Cancel pending rAF handles on unmount
    // -------------------------------------------------------------------------
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, []);
}
