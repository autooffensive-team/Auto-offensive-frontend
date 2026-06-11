"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  ActiveRun,
  JobParsedData,
  JobStatus,
  LogLine,
  MediumStepState,
  OptionValue,
  Project,
  ScanMode,
  ScanStep,
  Tool,
  WordlistAsset,
} from "@/types/scan";
import {
  analyzeAdvancedCommand,
  fetchJson,
  formatPayloadLine,
  formatScanError,
  formatStepFailureMessage,
  extractStreamFailureLine,
  logFromPayload,
  parseJsonMaybe,
} from "@/utils/scan";
import { playScanCompleteSound } from "@/utils/scan-sound";

const terminalStatuses = new Set([
  "JOB_STATUS_COMPLETED",
  "JOB_STATUS_FAILED",
  "JOB_STATUS_CANCELLED",
  "JOB_STATUS_PARTIAL",
  "STEP_STATUS_COMPLETED",
  "STEP_STATUS_FAILED",
  "STEP_STATUS_CANCELLED",
  // lowercase variants sent by the backend
  "completed",
  "failed",
  "cancelled",
  "partial",
]);

function extractResponseError(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object") {
          const data = item as Record<string, unknown>;
          const msg = data.msg ?? data.message;
          return typeof msg === "string" ? msg : String(item);
        }
        return String(item);
      })
      .join(", ");
  }
  if (detail && typeof detail === "object") {
    const data = detail as Record<string, unknown>;
    const nested = data.detail ?? data.error ?? data.message ?? data.msg;
    if (nested !== undefined) return extractResponseError(nested);
    return JSON.stringify(data);
  }
  return String(detail ?? "");
}

function isTerminalStatus(status: string): boolean {
  return terminalStatuses.has(status) || terminalStatuses.has(status.toUpperCase());
}

function createInitialRun(mode: ScanMode): ActiveRun {
  return {
    mode,
    status: "idle",
    findings: 0,
    steps: [],
    parsedSteps: [],
  };
}

// ---------------------------------------------------------------------------
// Per-mode state helpers
// ---------------------------------------------------------------------------

type RunSetter = React.Dispatch<React.SetStateAction<ActiveRun>>;
type LogsSetter = React.Dispatch<React.SetStateAction<LogLine[]>>;
type ErrorsSetter = React.Dispatch<React.SetStateAction<string[]>>;

export function useScanController(initialProjectId?: string, options?: { guestMode?: boolean; onGuestScanConsumed?: (rateLimitInfo: { limit?: number; remaining?: number; reset?: number }) => void }) {
  const guestMode = options?.guestMode ?? false;
  const onGuestScanConsumed = options?.onGuestScanConsumed;
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [wordlists, setWordlists] = useState<WordlistAsset[]>([]);
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  // --- Form state ---
  const [basicTarget, setBasicTarget] = useState("");
  const [basicToolId, setBasicToolId] = useState("");
  const [basicPreset, setBasicPreset] = useState("");
  const [mediumTarget, setMediumTarget] = useState("");
  const [mediumSteps, setMediumSteps] = useState<MediumStepState[]>([]);
  const [advancedCommand, setAdvancedCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Per-mode run / logs / errors ---
  const [basicRun, setBasicRun] = useState<ActiveRun>(createInitialRun("basic"));
  const [basicLogs, setBasicLogs] = useState<LogLine[]>([]);
  const [basicErrors, setBasicErrors] = useState<string[]>([]);

  const [mediumRun, setMediumRun] = useState<ActiveRun>(createInitialRun("medium"));
  const [mediumLogs, setMediumLogs] = useState<LogLine[]>([]);
  const [mediumErrors, setMediumErrors] = useState<string[]>([]);

  const [advancedRun, setAdvancedRun] = useState<ActiveRun>(createInitialRun("advanced"));
  const [advancedLogs, setAdvancedLogs] = useState<LogLine[]>([]);
  const [advancedErrors, setAdvancedErrors] = useState<string[]>([]);

  // Refs to allow stable callbacks to access latest setters
  const runSetterRef = useRef<Record<ScanMode, RunSetter>>({
    basic: setBasicRun,
    medium: setMediumRun,
    advanced: setAdvancedRun,
  });
  const logsSetterRef = useRef<Record<ScanMode, LogsSetter>>({
    basic: setBasicLogs,
    medium: setMediumLogs,
    advanced: setAdvancedLogs,
  });
  const errorsSetterRef = useRef<Record<ScanMode, ErrorsSetter>>({
    basic: setBasicErrors,
    medium: setMediumErrors,
    advanced: setAdvancedErrors,
  });

  // Keep refs in sync (setters are stable, so this only runs once in practice)
  useEffect(() => {
    runSetterRef.current = { basic: setBasicRun, medium: setMediumRun, advanced: setAdvancedRun };
    logsSetterRef.current = { basic: setBasicLogs, medium: setMediumLogs, advanced: setAdvancedLogs };
    errorsSetterRef.current = { basic: setBasicErrors, medium: setMediumErrors, advanced: setAdvancedErrors };
  }, []);

  // --- Streaming / polling refs ---
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamStepRef = useRef("");
  // Tracks job ids that have already triggered a completion toast so we don't
  // double-fire if polling produces another terminal-status response.
  const notifiedJobsRef = useRef<Set<string>>(new Set());
  const onQuotaExceededRef = useRef<(() => void) | undefined>(undefined);

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const basicTools = useMemo(
    () => tools.filter((tool) => (tool.scan_config?.basic?.presets?.length ?? 0) > 0),
    [tools],
  );
  const mediumTools = useMemo(() => tools, [tools]);
  const selectedBasicTool = useMemo(
    () => basicTools.find((tool) => tool.tool_id === basicToolId),
    [basicToolId, basicTools],
  );
  const selectedProject = useMemo(
    () => projects.find((project) => project.project_id === projectId),
    [projectId, projects],
  );

  // ---------------------------------------------------------------------------
  // Per-mode helpers
  // ---------------------------------------------------------------------------
  // Buffer log appends to avoid UI freeze when tools emit huge output bursts.
  // We flush in small batches on a short timer instead of setState per line.
  const logQueueRef = useRef<Record<ScanMode, LogLine[]>>({
    basic: [],
    medium: [],
    advanced: [],
  });
  const logFlushTimerRef = useRef<Record<ScanMode, ReturnType<typeof setTimeout> | null>>({
    basic: null,
    medium: null,
    advanced: null,
  });

  const flushLogs = useCallback((mode: ScanMode) => {
    const queued = logQueueRef.current[mode];
    if (!queued.length) return;
    logQueueRef.current[mode] = [];
    logsSetterRef.current[mode]((current) => {
      const next = current.length ? current.concat(queued) : queued;
      // Keep a small tail in memory; terminal panel renders from this.
      return next.slice(-399);
    });
  }, []);

  const appendLogForMode = useCallback((mode: ScanMode, line: LogLine) => {
    logQueueRef.current[mode].push(line);
    if (logFlushTimerRef.current[mode]) return;
    // ~20fps flush is plenty for readability and keeps React responsive.
    logFlushTimerRef.current[mode] = setTimeout(() => {
      logFlushTimerRef.current[mode] = null;
      flushLogs(mode);
    }, 50);
  }, [flushLogs]);

  const appendErrorForMode = useCallback((mode: ScanMode, err: string) => {
    const message = formatScanError(err);
    if (!message) return;
    errorsSetterRef.current[mode]((current) => {
      if (current[current.length - 1] === message) return current;
      return [...current.slice(-9), message];
    });
  }, []);

  const setRunForMode = useCallback(
    (mode: ScanMode, updater: (current: ActiveRun) => ActiveRun) => {
      runSetterRef.current[mode](updater);
    },
    [],
  );

  const reportStepFailures = useCallback(
    async (mode: ScanMode, steps: ScanStep[] | undefined) => {
      const failedSteps = (steps ?? []).filter((step) => /failed/i.test(step.status));
      if (!failedSteps.length) return;

      let primaryMessage: string | undefined;

      await Promise.all(
        failedSteps.map(async (step) => {
          try {
            const detail = await fetchJson<{
              tool_name?: string;
              error_message?: string | null;
              exit_code?: number;
            }>(`/scans/steps/${step.step_id}`);
            const message = formatStepFailureMessage(detail);
            appendErrorForMode(mode, message);
            if (!primaryMessage) primaryMessage = message;
          } catch {
            const message = formatStepFailureMessage({ tool_name: step.tool_name });
            appendErrorForMode(mode, message);
            if (!primaryMessage) primaryMessage = message;
          }
        }),
      );

      if (primaryMessage) {
        setRunForMode(mode, (current) => ({ ...current, failureMessage: primaryMessage }));
      }
    },
    [appendErrorForMode, setRunForMode],
  );
  const openGuestBasicStepStreamRef = useRef<((mode: ScanMode, stepId: string) => void) | null>(null);
  const fetchGuestBasicParsedDataRef = useRef<((mode: ScanMode, stepId: string) => Promise<void>) | null>(null);

  // ---------------------------------------------------------------------------
  // Watching / streaming
  // ---------------------------------------------------------------------------
  const stopWatchingJob = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    streamStepRef.current = "";
  }, []);

  const resetRun = useCallback(
    (mode: ScanMode) => {
      stopWatchingJob();
      runSetterRef.current[mode](createInitialRun(mode));
      logsSetterRef.current[mode]([]);
      errorsSetterRef.current[mode]([]);
    },
    [stopWatchingJob],
  );

  useEffect(() => stopWatchingJob, [stopWatchingJob]);

  // ---------------------------------------------------------------------------
  // Completion toast
  // ---------------------------------------------------------------------------
  // Resolve the asset/job route used by the "View report" action. The submit
  // response does not include target_id, so look it up via the unified
  // /scans/jobs/{jobId} endpoint (returns target_name) plus the per-project
  // targets list. Falls back to the assets index if anything fails.
  const resolveJobReportRoute = useCallback(async (jobId: string): Promise<string> => {
    try {
      const job = await fetchJson<{ target_name?: string; project_name?: string }>(
        `/scans/jobs/${jobId}`,
      );
      const project = projects.find((p) => p.name === job.project_name);
      if (project && job.target_name) {
        const targets = await fetchJson<Array<{ target_id: string; name: string }>>(
          `/projects/${project.project_id}/targets`,
        );
        const target = targets.find((t) => t.name === job.target_name);
        if (target) {
          return `/userdashboard/assets/${target.target_id}/jobs/${jobId}`;
        }
      }
    } catch {
      // ignore — fall through to default
    }
    return "/userdashboard/assets";
  }, [projects]);

  const openJobReport = useCallback(
    (jobId?: string) => {
      if (jobId) {
        void resolveJobReportRoute(jobId).then((path) => router.push(path));
      } else {
        router.push("/userdashboard/assets");
      }
    },
    [resolveJobReportRoute, router],
  );

  const modeLabel = (mode: ScanMode) =>
    mode === "basic" ? "Basic" : mode === "medium" ? "Medium" : "Advanced";

  const notifyScanComplete = useCallback(
    (mode: ScanMode, status: string, jobId: string, target: string, findings: number) => {
      if (!jobId || notifiedJobsRef.current.has(jobId)) return;
      notifiedJobsRef.current.add(jobId);

      const label = modeLabel(mode);
      const targetSuffix = target ? ` for ${target}` : "";
      const findingsSuffix = ` — ${findings} finding${findings === 1 ? "" : "s"}`;
      const action = {
        label: "View report",
        onClick: () => {
          void resolveJobReportRoute(jobId).then((path) => router.push(path));
        },
      };

      // Status strings come either uppercased from the per-mode summary
      // endpoints (e.g. "JOB_STATUS_COMPLETED") or lowercased from the
      // unified /scans/jobs/{id} endpoint (e.g. "completed"). Match both.
      const isCompleted = /completed/i.test(status);
      const isPartial = /partial/i.test(status);
      const isCancelled = /cancelled/i.test(status);
      const isFailed = /failed/i.test(status);

      if (isCompleted) {
        toast.success(`${label} scan completed${targetSuffix}${findingsSuffix}`, { action });
        void playScanCompleteSound("success");
      } else if (isPartial) {
        toast.warning(
          `${label} scan finished with partial results${targetSuffix}${findingsSuffix}`,
          { action },
        );
        void playScanCompleteSound("warning");
      } else if (isCancelled) {
        toast.error(`${label} scan was cancelled${targetSuffix}`, { action });
        void playScanCompleteSound("error");
      } else if (isFailed) {
        toast.error(`${label} scan failed${targetSuffix}`, { action });
        void playScanCompleteSound("error");
      }
    },
    [resolveJobReportRoute, router],
  );

  // ---------------------------------------------------------------------------
  // Metadata loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError("");

      try {
        // Fetch projects and tools separately so that a project auth failure
        // (e.g. guest mode) doesn't prevent tools from loading.
        const [projectData, toolData, wordlistData] = await Promise.all([
          fetchJson<Project[]>("/projects").catch(() => [] as Project[]),
          fetchJson<Tool[]>("/tools?active_only=true"),
          fetchJson<WordlistAsset[]>("/api/v1/wordlists").catch(() => [] as WordlistAsset[]),
        ]);

        if (cancelled) return;

        setProjects(projectData);
        setTools(toolData);
        setWordlists(wordlistData);
        setProjectId((current) => current || initialProjectId || projectData[0]?.project_id || "");

        const firstBasicTool = toolData.find(
          (tool) => (tool.scan_config?.basic?.presets?.length ?? 0) > 0,
        );
        setBasicToolId((current) => current || firstBasicTool?.tool_id || "");

        const firstMediumTool = toolData[0];
        setMediumSteps((current) =>
          current.length
            ? current
            : [{ id: crypto.randomUUID(), toolId: firstMediumTool?.tool_id ?? "", options: {}, timeout: "" }],
        );
      } catch (error) {
        if (!cancelled) {
          setMetaError(
            error instanceof Error ? error.message : "Failed to load scan metadata.",
          );
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const presets = selectedBasicTool?.scan_config?.basic?.presets ?? [];
    setBasicPreset((current) => {
      if (current && presets.some((preset) => preset.name === current)) return current;
      return presets[0]?.name ?? "";
    });
  }, [selectedBasicTool]);

  // ---------------------------------------------------------------------------
  // Summary → JobStatus
  // ---------------------------------------------------------------------------
  const transformSummaryToJobStatus = useCallback((summary: any): JobStatus => {
    const steps = Array.isArray(summary?.steps) ? summary.steps : [];
    const completed = steps.filter((s: ScanStep) => /completed/i.test(s.status)).length;
    const failed = steps.filter((s: ScanStep) => /failed/i.test(s.status)).length;
    const pending = steps.filter(
      (s: ScanStep) => /pending/i.test(s.status) || /queued/i.test(s.status),
    ).length;
    return {
      job_id: summary.job_id || summary.scope_id || "",
      project_id: summary.project_id || "",
      status: summary.status || "",
      total_steps: summary.total_steps ?? steps.length,
      completed_steps: completed,
      failed_steps: failed,
      pending_steps: pending,
      total_findings: summary.total_findings ?? 0,
      steps,
    };
  }, []);

  const fetchParsedData = useCallback(
    async (mode: ScanMode, jobId: string) => {
      try {
        // Use the unified job-history endpoint — per-scan-type parsed-data routes
        // only exist for medium/advanced, not basic.
        const parsed = await fetchJson<JobParsedData>(`/scans/jobs/${jobId}/parsed-data`);
        setRunForMode(mode, (current) => ({ ...current, parsedSteps: Array.isArray(parsed?.steps) ? parsed.steps : [] }));
      } catch {
        // ignore — parsed data is best-effort
      }
    },
    [setRunForMode],
  );

  // ---------------------------------------------------------------------------
  // SSE step-log stream
  // ---------------------------------------------------------------------------
  const openStepStream = useCallback(
    (mode: ScanMode, stepId: string) => {
      if (!stepId || streamStepRef.current === stepId) return;

      eventSourceRef.current?.close();
      streamStepRef.current = stepId;

      const source = new EventSource(`/api/backend/scans/steps/${stepId}/logs/stream`, {
        withCredentials: true,
      });
      eventSourceRef.current = source;

      const handleEvent = (eventName: string, event: MessageEvent) => {
        const payload = parseJsonMaybe(event.data);

        // "done" means the backend stream ended cleanly — close before onerror fires
        if (eventName === "done") {
          source.close();
          eventSourceRef.current = null;
          streamStepRef.current = "";
          appendLogForMode(mode, logFromPayload(mode, "done", payload));
          return;
        }

        if (eventName === "stream-error" || eventName === "error") {
          appendErrorForMode(mode, formatScanError(formatPayloadLine(payload) || payload));
        }
        if (eventName === "log") {
          const failureLine = extractStreamFailureLine(payload);
          if (failureLine) appendErrorForMode(mode, failureLine);
        }
        if (!["heartbeat", "ping", "ready"].includes(eventName)) {
          appendLogForMode(mode, logFromPayload(mode, eventName, payload));
        }
      };

      source.onmessage = (event) => handleEvent("log", event);
      source.addEventListener("log", (event) => handleEvent("log", event as MessageEvent));
      source.addEventListener("ready", (event) => handleEvent("ready", event as MessageEvent));
      source.addEventListener("heartbeat", (event) => handleEvent("heartbeat", event as MessageEvent));
      source.addEventListener("done", (event) => handleEvent("done", event as MessageEvent));
      source.addEventListener("stream-error", (event) =>
        handleEvent("stream-error", event as MessageEvent),
      );
      source.onerror = () => {
        // Only report as error if we didn't intentionally close (streamStepRef still set means unexpected)
        if (streamStepRef.current === stepId) {
          appendErrorForMode(mode, "Log stream disconnected or could not be opened.");
        }
      };
    },
    [appendLogForMode, appendErrorForMode],
  );

  // ---------------------------------------------------------------------------
  // Job polling
  // ---------------------------------------------------------------------------
  const watchJob = useCallback(
    (mode: ScanMode, jobId: string, initialStepId: string, target: string) => {
      openStepStream(mode, initialStepId);
      if (pollRef.current) clearInterval(pollRef.current);

      // Tolerate transient summary-fetch failures: only report after a few
      // consecutive misses, and don't spam the error panel on every tick.
      let consecutivePollFailures = 0;

      pollRef.current = setInterval(async () => {
        try {
          // Use the unified /scans/jobs/{jobId} endpoint which works for all
          // modes. The per-mode /scans/{mode}/jobs/{jobId}/summary endpoint
          // exists only for basic and advanced — medium would 404.
          const summaryData = await fetchJson<any>(`/scans/jobs/${jobId}`);
          consecutivePollFailures = 0;
          const job = transformSummaryToJobStatus(summaryData);
          const activeStep =
            job.steps?.find((step) => !isTerminalStatus(step.status)) ??
            job.steps?.[job.steps.length - 1];

          setRunForMode(mode, (current) => ({
            ...current,
            jobId,
            stepId: activeStep?.step_id ?? current.stepId,
            status: job.status,
            findings: job.total_findings ?? current.findings,
            steps: job.steps ?? [],
          }));

          if (activeStep?.step_id) {
            openStepStream(mode, activeStep.step_id);
          }

          if (
            /completed/i.test(job.status) ||
            /failed/i.test(job.status) ||
            /cancelled/i.test(job.status) ||
            /partial/i.test(job.status)
          ) {
            stopWatchingJob();
            if (/failed|partial/i.test(job.status)) {
              await reportStepFailures(mode, job.steps);
            }
            notifyScanComplete(mode, job.status, jobId, target, job.total_findings ?? 0);
            void fetchParsedData(mode, jobId);
          }
        } catch (error) {
          consecutivePollFailures += 1;
          if (consecutivePollFailures === 3) {
            appendErrorForMode(mode, formatScanError(error));
          }
        }
      }, 2500);
    },
    [
      appendErrorForMode,
      fetchParsedData,
      notifyScanComplete,
      openStepStream,
      reportStepFailures,
      setRunForMode,
      stopWatchingJob,
      transformSummaryToJobStatus,
    ],
  );

  // ---------------------------------------------------------------------------
  // Basic scan
  // ---------------------------------------------------------------------------

  const submitBasic = useCallback(async () => {
    if (!guestMode && !projectId) {
      toast.error("Select a project before starting a scan.");
      return;
    }
    if (!selectedBasicTool) {
      toast.error("Pick a tool to run.");
      return;
    }
    if (!basicTarget.trim()) {
      toast.error("Enter a target before starting the scan.");
      return;
    }

    resetRun("basic");
    setIsSubmitting(true);
    setRunForMode("basic", (current) => ({ ...current, mode: "basic", status: "submitting" }));

    if (guestMode) {
      // Guest mode: use the anonymous /scans/basic/try endpoint
      try {
        const response = await fetch("/api/guest-scan/basic/submit", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "text/event-stream",
          },
          body: JSON.stringify({
            target: basicTarget.trim(),
            tool: selectedBasicTool.tool_name,
            preset: basicPreset || undefined,
          }),
        });

        if (!response.ok) {
          // Handle 429 rate limit from backend
          if (response.status === 429) {
            let errorMsg = "Anonymous scan quota exceeded.";
            const rlLimit = response.headers.get("x-ratelimit-limit");
            const rlRemaining = response.headers.get("x-ratelimit-remaining");
            const rlReset = response.headers.get("x-ratelimit-reset");
            try {
              const body = await response.json();
              if (body?.detail?.error) {
                errorMsg = body.detail.error;
              }
              if (body?.detail?.limit != null) {
                errorMsg += ` Limit: ${body.detail.limit}, remaining: ${body.detail.remaining ?? 0}.`;
              }
              if (body?.detail?.reset_at) {
                const resetDate = new Date(body.detail.reset_at * 1000);
                errorMsg += ` Resets at: ${resetDate.toLocaleString()}.`;
              }
            } catch {
              if (rlLimit) errorMsg += ` Limit: ${rlLimit}, remaining: ${rlRemaining ?? 0}.`;
            }
            toast.error(errorMsg);
            appendErrorForMode("basic", errorMsg);
            setRunForMode("basic", (current) => ({ ...current, status: "failed" }));
            onGuestScanConsumed?.({
              limit: rlLimit ? Number(rlLimit) : undefined,
              remaining: rlRemaining ? Number(rlRemaining) : 0,
              reset: rlReset ? Number(rlReset) : undefined,
            });
            setIsSubmitting(false);
            return;
          }

          if (response.status === 422) {
            let errorMsg = "Validation error.";
            try {
              const body = await response.json();
              if (body?.detail && Array.isArray(body.detail)) {
                errorMsg = body.detail.map((d: any) => d.msg ?? String(d)).join(", ");
              }
            } catch { /* ignore */ }
            throw new Error(errorMsg);
          }

          const errorText = await response.text();
          // Guard against raw HTML error pages (e.g. Cloudflare gateway errors)
          // leaking into the UI as unreadable markup.
          const isHtml = errorText.trimStart().startsWith("<");
          if (isHtml) {
            throw new Error(`Scan service error (${response.status}). The backend may be temporarily unavailable.`);
          }
          // Try to extract a human-readable message from a JSON error body
          // (e.g. FastAPI's {"detail": "gRPC request failed"} on 502/504).
          try {
            const jsonBody = JSON.parse(errorText);
            const detail = jsonBody?.detail ?? jsonBody?.error ?? jsonBody?.message;
            if (detail && typeof detail === "string") {
              throw new Error(detail);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== errorText) throw parseErr;
          }
          throw new Error(errorText || "Basic scan failed to start.");
        }

        // Extract rate-limit headers from the successful response
        const rlLimitOk = response.headers.get("x-ratelimit-limit");
        const rlRemainingOk = response.headers.get("x-ratelimit-remaining");
        const rlResetOk = response.headers.get("x-ratelimit-reset");

        // Update guest quota: use headers if available, otherwise optimistic decrement
        onGuestScanConsumed?.({
          limit: rlLimitOk ? Number(rlLimitOk) : undefined,
          remaining: rlRemainingOk ? Number(rlRemainingOk) : undefined,
          reset: rlResetOk ? Number(rlResetOk) : undefined,
        });

        // The response is an SSE stream — consume it
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let resolvedStepId = "";

          setRunForMode("basic", (current) => ({
            ...current,
            status: "JOB_STATUS_RUNNING",
          }));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            while (buffer.includes("\n\n")) {
              const boundary = buffer.indexOf("\n\n");
              const block = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);

              const lines = block.split("\n");
              let eventName = "message";
              const dataLines: string[] = [];

              for (const line of lines) {
                if (line.startsWith("event:")) eventName = line.slice(6).trim();
                if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
              }

              if (!dataLines.length || eventName === "ping") continue;

              const rawData = dataLines.join("\n");
              let payload: unknown = rawData;
              try { payload = JSON.parse(rawData); } catch { payload = rawData; }

              const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

              if (eventName === "scan_started" && record) {
                resolvedStepId = typeof record.step_id === "string" ? record.step_id : "";
                setRunForMode("basic", (current) => ({
                  ...current,
                  stepId: resolvedStepId,
                  jobId: typeof record.job_id === "string" ? record.job_id : current.jobId,
                  status: typeof record.status === "string" ? record.status : "JOB_STATUS_RUNNING",
                }));
                appendLogForMode("basic", logFromPayload("basic", "submitted", {
                  message: `Basic scan submitted for ${basicTarget.trim()}`,
                }));
                // Open the guest log stream for this step
                if (resolvedStepId) {
                  openGuestBasicStepStreamRef.current?.("basic", resolvedStepId);
                }
              }

              if (eventName === "status" && record) {
                if (typeof record.status === "string") {
                  setRunForMode("basic", (current) => ({ ...current, status: record!.status as string }));
                }
              }

              if (eventName === "log") {
                appendLogForMode("basic", logFromPayload("basic", "log", payload));
              }

              if (eventName === "done" && record) {
                const finalStatus = typeof record.status === "string" ? record.status : "JOB_STATUS_COMPLETED";
                setRunForMode("basic", (current) => ({
                  ...current,
                  status: finalStatus,
                  findings: typeof record!.total_findings === "number" ? record!.total_findings as number : current.findings,
                }));
                appendLogForMode("basic", logFromPayload("basic", "done", payload));
                if (resolvedStepId) {
                  void fetchGuestBasicParsedDataRef.current?.("basic", resolvedStepId);
                }
              }

              if (eventName === "error" && record) {
                appendErrorForMode("basic", typeof record.error === "string" ? record.error : "Scan error occurred.");
                setRunForMode("basic", (current) => ({ ...current, status: "JOB_STATUS_FAILED" }));
              }
            }
          }

          // Stream ended
          setRunForMode("basic", (current) => {
            if (!isTerminalStatus(current.status)) {
              return { ...current, status: "JOB_STATUS_COMPLETED" };
            }
            return current;
          });
        }
      } catch (error) {
        appendErrorForMode("basic", formatScanError(error));
        toast.error(formatScanError(error));
        setRunForMode("basic", (current) => ({ ...current, status: "failed", failureMessage: formatScanError(error) }));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Authenticated mode (original behavior)
    try {
      const submit = await fetchJson<{ job_id: string; step_id: string; status: string }>(
        "/scans/basic/submit",
        {
          method: "POST",
          body: JSON.stringify({
            project_id: projectId,
            target: basicTarget.trim(),
            tool: selectedBasicTool.tool_name,
            preset: basicPreset || undefined,
          }),
        },
      );

      setRunForMode("basic", (current) => ({
        ...current,
        jobId: submit.job_id,
        stepId: submit.step_id,
        status: submit.status,
      }));
      appendLogForMode(
        "basic",
        logFromPayload("system", "submitted", {
          message: `Basic scan submitted for ${basicTarget.trim()}`,
        }),
      );
      watchJob("basic", submit.job_id, submit.step_id, basicTarget.trim());
    } catch (error) {
      const message = formatScanError(error);
      appendErrorForMode("basic", message);
      toast.error(message);
      setRunForMode("basic", (current) => ({ ...current, status: "failed", failureMessage: message }));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appendErrorForMode,
    appendLogForMode,
    basicPreset,
    basicTarget,
    guestMode,
    onGuestScanConsumed,
    projectId,
    resetRun,
    selectedBasicTool,
    setRunForMode,
    watchJob,
  ]);

  // ---------------------------------------------------------------------------
  // Medium scan
  // ---------------------------------------------------------------------------
  const submitMedium = useCallback(async () => {
    const steps = mediumSteps
      .map((step) => {
        const tool = tools.find((item) => item.tool_id === step.toolId);
        const options = Object.fromEntries(
          Object.entries(step.options)
            .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
            .filter(([, value]) => value !== "" && value !== false),
        ) as Record<string, OptionValue>;
        return {
          tool_id: step.toolId || undefined,
          tool_name: tool?.tool_name,
          runtime_timeout_seconds: step.timeout ? Number(step.timeout) : undefined,
          tool_options: options,
        };
      })
      .filter((step) => step.tool_id || step.tool_name);

    if (!guestMode && !projectId) {
      toast.error("Select a project before starting a scan.");
      return;
    }
    if (!mediumTarget.trim()) {
      toast.error("Enter a target before starting the scan.");
      return;
    }
    if (!steps.length) {
      toast.error("Add at least one pipeline step.");
      return;
    }

    resetRun("medium");
    setIsSubmitting(true);
    setRunForMode("medium", (current) => ({ ...current, mode: "medium", status: "submitting" }));

    if (guestMode) {
      // Guest mode: use the anonymous /scans/medium/try endpoint
      try {
        const response = await fetch("/api/guest-scan/medium/submit", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "text/event-stream" },
          body: JSON.stringify({
            target_value: mediumTarget.trim(),
            steps,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            let errorMsg = "Anonymous scan quota exceeded.";
            try {
              const body = await response.json();
              if (body?.detail?.error) errorMsg = body.detail.error;
              if (body?.detail?.limit != null) errorMsg += ` Limit: ${body.detail.limit}, remaining: ${body.detail.remaining ?? 0}.`;
              if (body?.detail?.reset_at) errorMsg += ` Resets at: ${new Date(body.detail.reset_at * 1000).toLocaleString()}.`;
            } catch {
              const limit = response.headers.get("x-ratelimit-limit");
              const remaining = response.headers.get("x-ratelimit-remaining");
              if (limit) errorMsg += ` Limit: ${limit}, remaining: ${remaining ?? 0}.`;
            }
            toast.error(errorMsg);
            appendErrorForMode("medium", errorMsg);
            setRunForMode("medium", (current) => ({ ...current, status: "failed" }));
            setIsSubmitting(false);
            return;
          }
          const errorText = await response.text();
          const isHtml = errorText.trimStart().startsWith("<");
          if (isHtml) throw new Error(`Scan service error (${response.status}). The backend may be temporarily unavailable.`);
          try {
            const jsonBody = JSON.parse(errorText);
            const detail = jsonBody?.detail ?? jsonBody?.error ?? jsonBody?.message;
            if (detail && typeof detail === "string") throw new Error(detail);
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== errorText) throw parseErr;
          }
          throw new Error(errorText || "Medium scan failed to start.");
        }

        // Consume the SSE stream
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let resolvedStepId = "";

          setRunForMode("medium", (current) => ({ ...current, status: "JOB_STATUS_RUNNING" }));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            while (buffer.includes("\n\n")) {
              const boundary = buffer.indexOf("\n\n");
              const block = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);

              const lines = block.split("\n");
              let eventName = "message";
              const dataLines: string[] = [];
              for (const line of lines) {
                if (line.startsWith("event:")) eventName = line.slice(6).trim();
                if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
              }
              if (!dataLines.length || eventName === "ping") continue;

              const rawData = dataLines.join("\n");
              let payload: unknown = rawData;
              try { payload = JSON.parse(rawData); } catch { payload = rawData; }
              const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

              if (eventName === "scan_started" && record) {
                resolvedStepId = typeof record.step_id === "string" ? record.step_id : "";
                setRunForMode("medium", (current) => ({
                  ...current,
                  stepId: resolvedStepId,
                  jobId: typeof record.job_id === "string" ? record.job_id : current.jobId,
                  status: typeof record.status === "string" ? record.status : "JOB_STATUS_RUNNING",
                }));
                appendLogForMode("medium", logFromPayload("medium", "submitted", { message: `Medium scan submitted for ${mediumTarget.trim()}` }));
              }
              if (eventName === "log") appendLogForMode("medium", logFromPayload("medium", "log", payload));
              if (eventName === "done" && record) {
                const finalStatus = typeof record.status === "string" ? record.status : "JOB_STATUS_COMPLETED";
                setRunForMode("medium", (current) => ({
                  ...current,
                  status: finalStatus,
                  findings: typeof record.total_findings === "number" ? record.total_findings as number : current.findings,
                }));
                appendLogForMode("medium", logFromPayload("medium", "done", payload));
              }
              if (eventName === "error" && record) {
                appendErrorForMode("medium", typeof record.error === "string" ? record.error : "Scan error occurred.");
                setRunForMode("medium", (current) => ({ ...current, status: "JOB_STATUS_FAILED" }));
              }
            }
          }

          setRunForMode("medium", (current) => {
            if (!isTerminalStatus(current.status)) return { ...current, status: "JOB_STATUS_COMPLETED" };
            return current;
          });
        }
      } catch (error) {
        appendErrorForMode("medium", formatScanError(error));
        toast.error(formatScanError(error));
        setRunForMode("medium", (current) => ({ ...current, status: "failed", failureMessage: formatScanError(error) }));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Authenticated path
    try {
      const submit = await fetchJson<{ job_id: string; step_id: string; status: string }>(
        "/scans/medium/submit",
        {
          method: "POST",
          body: JSON.stringify({
            project_id: projectId,
            target_value: mediumTarget.trim(),
            steps,
            execution_mode: "WEB",
          }),
        },
      );

      setRunForMode("medium", (current) => ({
        ...current,
        jobId: submit.job_id,
        stepId: submit.step_id,
        status: submit.status,
      }));
      appendLogForMode(
        "medium",
        logFromPayload("system", "submitted", {
          message: `Medium scan submitted for ${mediumTarget.trim()}`,
        }),
      );
      watchJob("medium", submit.job_id, submit.step_id, mediumTarget.trim());
    } catch (error) {
      const message = formatScanError(error);
      appendErrorForMode("medium", message);
      toast.error(message);
      setRunForMode("medium", (current) => ({ ...current, status: "failed", failureMessage: message }));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appendErrorForMode,
    appendLogForMode,
    mediumSteps,
    mediumTarget,
    onGuestScanConsumed,
    projectId,
    resetRun,
    setRunForMode,
    tools,
    watchJob,
  ]);

  // ---------------------------------------------------------------------------
  // Guest-mode helpers for advanced scan
  // ---------------------------------------------------------------------------
  const guestEventSourceRef = useRef<EventSource | null>(null);
  const guestStreamStepRef = useRef("");

  const openGuestStepStream = useCallback(
    (mode: ScanMode, stepId: string) => {
      if (!stepId || guestStreamStepRef.current === stepId) return;

      guestEventSourceRef.current?.close();
      guestStreamStepRef.current = stepId;

      const source = new EventSource(`/api/guest-scan/advanced/${stepId}/logs`);
      guestEventSourceRef.current = source;

      const handleEvent = (eventName: string, event: MessageEvent) => {
        const payload = parseJsonMaybe(event.data);

        if (eventName === "done") {
          source.close();
          guestEventSourceRef.current = null;
          guestStreamStepRef.current = "";
          appendLogForMode(mode, logFromPayload(mode, "done", payload));
          return;
        }

        if (eventName === "stream-error" || eventName === "error") {
          appendErrorForMode(mode, formatScanError(formatPayloadLine(payload) || payload));
        }
        if (eventName === "log") {
          const failureLine = extractStreamFailureLine(payload);
          if (failureLine) appendErrorForMode(mode, failureLine);
        }
        if (!["heartbeat", "ping", "ready"].includes(eventName)) {
          appendLogForMode(mode, logFromPayload(mode, eventName, payload));
        }
      };

      source.onmessage = (event) => handleEvent("log", event);
      source.addEventListener("log", (event) => handleEvent("log", event as MessageEvent));
      source.addEventListener("done", (event) => handleEvent("done", event as MessageEvent));
      source.addEventListener("stream-error", (event) => handleEvent("stream-error", event as MessageEvent));
      source.onerror = () => {
        if (guestStreamStepRef.current === stepId) {
          // Don't spam errors — the SSE might just have ended naturally
          source.close();
          guestEventSourceRef.current = null;
          guestStreamStepRef.current = "";
        }
      };
    },
    [appendLogForMode, appendErrorForMode],
  );

  const fetchGuestParsedData = useCallback(
    async (mode: ScanMode, stepId: string) => {
      try {
        const response = await fetch(`/api/guest-scan/advanced/${stepId}/parsed-data`, { cache: "no-store" });
        if (!response.ok) return;
        const parsed = await response.json();
        setRunForMode(mode, (current) => ({
          ...current,
          parsedSteps: Array.isArray(parsed?.steps) ? parsed.steps : parsed ? [parsed] : [],
        }));
      } catch {
        // ignore — parsed data is best-effort
      }
    },
    [setRunForMode],
  );

  const openGuestBasicStepStream = useCallback(
    (mode: ScanMode, stepId: string) => {
      if (!stepId || guestStreamStepRef.current === stepId) return;

      guestEventSourceRef.current?.close();
      guestStreamStepRef.current = stepId;

      const source = new EventSource(`/api/guest-scan/basic/${stepId}/logs`);
      guestEventSourceRef.current = source;

      const handleEvent = (eventName: string, event: MessageEvent) => {
        const payload = parseJsonMaybe(event.data);

        if (eventName === "done") {
          source.close();
          guestEventSourceRef.current = null;
          guestStreamStepRef.current = "";
          appendLogForMode(mode, logFromPayload(mode, "done", payload));
          return;
        }

        if (eventName === "stream-error" || eventName === "error") {
          appendErrorForMode(mode, formatScanError(formatPayloadLine(payload) || payload));
        }
        if (eventName === "log") {
          const failureLine = extractStreamFailureLine(payload);
          if (failureLine) appendErrorForMode(mode, failureLine);
        }
        if (!["heartbeat", "ping", "ready"].includes(eventName)) {
          appendLogForMode(mode, logFromPayload(mode, eventName, payload));
        }
      };

      source.onmessage = (event) => handleEvent("log", event);
      source.addEventListener("log", (event) => handleEvent("log", event as MessageEvent));
      source.addEventListener("done", (event) => handleEvent("done", event as MessageEvent));
      source.addEventListener("stream-error", (event) => handleEvent("stream-error", event as MessageEvent));
      source.onerror = () => {
        if (guestStreamStepRef.current === stepId) {
          source.close();
          guestEventSourceRef.current = null;
          guestStreamStepRef.current = "";
        }
      };
    },
    [appendLogForMode, appendErrorForMode],
  );

  const fetchGuestBasicParsedData = useCallback(
    async (mode: ScanMode, stepId: string) => {
      try {
        const response = await fetch(`/api/guest-scan/basic/${stepId}/parsed-data`, { cache: "no-store" });
        if (!response.ok) return;
        const parsed = await response.json();
        setRunForMode(mode, (current) => ({
          ...current,
          parsedSteps: Array.isArray(parsed?.steps) ? parsed.steps : parsed ? [parsed] : [],
        }));
      } catch {
        // ignore — parsed data is best-effort
      }
    },
    [setRunForMode],
  );

  useEffect(() => {
    openGuestBasicStepStreamRef.current = openGuestBasicStepStream;
    fetchGuestBasicParsedDataRef.current = fetchGuestBasicParsedData;
  }, [fetchGuestBasicParsedData, openGuestBasicStepStream]);

  // ---------------------------------------------------------------------------
  // Advanced scan
  // ---------------------------------------------------------------------------
  const submitAdvanced = useCallback(
    async (command: string) => {
      const finalCommand = command.trim();
      setAdvancedCommand(finalCommand);

      if (guestMode) {
        // Guest mode: use the anonymous /try endpoint
        if (!finalCommand) {
          toast.error("Enter a command to run.");
          return;
        }

        resetRun("advanced");
        setIsSubmitting(true);
        setRunForMode("advanced", (current) => ({ ...current, mode: "advanced", status: "submitting" }));
        analyzeAdvancedCommand(finalCommand, tools).forEach((warning) => {
          appendLogForMode("advanced", logFromPayload("system", "warning", { message: warning.message }));
        });

        try {
          const response = await fetch("/api/guest-scan/advanced/submit", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "text/event-stream",
            },
            body: JSON.stringify({ command: finalCommand }),
          });

          if (!response.ok) {
            // Handle 429 rate limit from backend
            if (response.status === 429) {
              const rlLimit = response.headers.get("x-ratelimit-limit");
              const rlRemaining = response.headers.get("x-ratelimit-remaining");
              const rlReset = response.headers.get("x-ratelimit-reset");
              let errorMsg = "Anonymous scan quota exceeded.";
              try {
                const body = await response.json();
                if (body?.detail?.error) {
                  errorMsg = body.detail.error;
                }
                if (body?.detail?.limit != null) {
                  errorMsg += ` Limit: ${body.detail.limit}, remaining: ${body.detail.remaining ?? 0}.`;
                }
                if (body?.detail?.reset_at) {
                  const resetDate = new Date(body.detail.reset_at * 1000);
                  errorMsg += ` Resets at: ${resetDate.toLocaleString()}.`;
                }
              } catch {
                if (rlLimit) errorMsg += ` Limit: ${rlLimit}, remaining: ${rlRemaining ?? 0}.`;
              }
              toast.error(errorMsg);
              appendErrorForMode("advanced", errorMsg);
              setRunForMode("advanced", (current) => ({ ...current, status: "failed" }));
              onGuestScanConsumed?.({
                limit: rlLimit ? Number(rlLimit) : undefined,
                remaining: rlRemaining ? Number(rlRemaining) : 0,
                reset: rlReset ? Number(rlReset) : undefined,
              });
              setIsSubmitting(false);
              return;
            }

            // Handle 422 validation error
            if (response.status === 422) {
              let errorMsg = "Validation error.";
              try {
                const body = await response.json();
                if (body?.detail && Array.isArray(body.detail)) {
                  errorMsg = body.detail.map((d: any) => d.msg ?? String(d)).join(", ");
                }
              } catch { /* ignore */ }
              throw new Error(errorMsg);
            }

            const errorText = await response.text();
            let parsedMessage = "";
            try {
              const parsed = JSON.parse(errorText);
              parsedMessage = extractResponseError(parsed?.detail ?? parsed?.error ?? parsed);
            } catch {
              parsedMessage = "";
            }
            throw new Error(parsedMessage || errorText || "Advanced scan failed to start.");
          }

          // Extract rate-limit headers from the successful response
          const rlLimitOk = response.headers.get("x-ratelimit-limit");
          const rlRemainingOk = response.headers.get("x-ratelimit-remaining");
          const rlResetOk = response.headers.get("x-ratelimit-reset");

          // Update guest quota: use headers if available, otherwise optimistic decrement
          onGuestScanConsumed?.({
            limit: rlLimitOk ? Number(rlLimitOk) : undefined,
            remaining: rlRemainingOk ? Number(rlRemainingOk) : undefined,
            reset: rlResetOk ? Number(rlResetOk) : undefined,
          });

          // The response is an SSE stream — consume it
          if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let resolvedStepId = "";

            setRunForMode("advanced", (current) => ({
              ...current,
              status: "JOB_STATUS_RUNNING",
            }));

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              while (buffer.includes("\n\n")) {
                const boundary = buffer.indexOf("\n\n");
                const block = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 2);

                const lines = block.split("\n");
                let eventName = "message";
                const dataLines: string[] = [];

                for (const line of lines) {
                  if (line.startsWith("event:")) eventName = line.slice(6).trim();
                  if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
                }

                if (!dataLines.length || eventName === "ping") continue;

                const rawData = dataLines.join("\n");
                let payload: unknown = rawData;
                try { payload = JSON.parse(rawData); } catch { payload = rawData; }

                const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

                if (eventName === "scan_started" && record) {
                  resolvedStepId = typeof record.step_id === "string" ? record.step_id : "";
                  setRunForMode("advanced", (current) => ({
                    ...current,
                    stepId: resolvedStepId,
                    jobId: typeof record.job_id === "string" ? record.job_id : current.jobId,
                    status: typeof record.status === "string" ? record.status : "JOB_STATUS_RUNNING",
                  }));
                  appendLogForMode("advanced", logFromPayload("advanced", "submitted", {
                    message: `Advanced scan submitted: ${finalCommand}`,
                  }));
                  // Open the guest log stream for this step
                  if (resolvedStepId) {
                    openGuestStepStream("advanced", resolvedStepId);
                  }
                }

                if (eventName === "status" && record) {
                  if (typeof record.status === "string") {
                    setRunForMode("advanced", (current) => ({ ...current, status: record!.status as string }));
                  }
                }

                if (eventName === "log") {
                  appendLogForMode("advanced", logFromPayload("advanced", "log", payload));
                }

                if (eventName === "done" && record) {
                  const finalStatus = typeof record.status === "string" ? record.status : "JOB_STATUS_COMPLETED";
                  setRunForMode("advanced", (current) => ({
                    ...current,
                    status: finalStatus,
                    findings: typeof record!.total_findings === "number" ? record!.total_findings as number : current.findings,
                  }));
                  appendLogForMode("advanced", logFromPayload("advanced", "done", payload));
                  // Fetch parsed data
                  if (resolvedStepId) {
                    void fetchGuestParsedData("advanced", resolvedStepId);
                  }
                }

                if (eventName === "error" && record) {
                  appendErrorForMode("advanced", typeof record.error === "string" ? record.error : "Scan error occurred.");
                  setRunForMode("advanced", (current) => ({ ...current, status: "JOB_STATUS_FAILED" }));
                }
              }
            }

            // Stream ended — if no terminal status was set, mark as completed
            setRunForMode("advanced", (current) => {
              if (!isTerminalStatus(current.status)) {
                return { ...current, status: "JOB_STATUS_COMPLETED" };
              }
              return current;
            });
          }
        } catch (error) {
          appendErrorForMode("advanced", formatScanError(error));
          toast.error(formatScanError(error));
          setRunForMode("advanced", (current) => ({ ...current, status: "failed", failureMessage: formatScanError(error) }));
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      // Authenticated mode (original behavior)
      if (!projectId || !finalCommand) {
        if (!projectId) toast.error("Select a project before starting a scan.");
        else toast.error("Enter a command to run.");
        return;
      }

      resetRun("advanced");
      setIsSubmitting(true);
      setRunForMode("advanced", (current) => ({ ...current, mode: "advanced", status: "submitting" }));
      analyzeAdvancedCommand(finalCommand, tools).forEach((warning) => {
        appendLogForMode("advanced", logFromPayload("system", "warning", { message: warning.message }));
      });

      try {
        const submit = await fetchJson<{ job_id: string; step_id: string; status: string }>(
          "/scans/advanced/submit",
          {
            method: "POST",
            body: JSON.stringify({
              project_id: projectId,
              command: finalCommand,
              execution_mode: "web",
            }),
          },
        );

        setRunForMode("advanced", (current) => ({
          ...current,
          jobId: submit.job_id,
          stepId: submit.step_id,
          status: submit.status,
        }));
        watchJob("advanced", submit.job_id, submit.step_id, finalCommand);
      } catch (error) {
        appendErrorForMode("advanced", formatScanError(error));
        toast.error(formatScanError(error));
        setRunForMode("advanced", (current) => ({ ...current, status: "failed", failureMessage: formatScanError(error) }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [appendErrorForMode, appendLogForMode, fetchGuestParsedData, guestMode, onGuestScanConsumed, openGuestStepStream, projectId, resetRun, setRunForMode, tools, watchJob],
  );

  // ---------------------------------------------------------------------------
  // Medium step management
  // ---------------------------------------------------------------------------
  const updateMediumStep = useCallback((id: string, patch: Partial<MediumStepState>) => {
    setMediumSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );
  }, []);

  const updateMediumOption = useCallback(
    (stepId: string, key: string, value: string | boolean) => {
      setMediumSteps((current) =>
        current.map((step) =>
          step.id === stepId
            ? { ...step, options: { ...step.options, [key]: value } }
            : step,
        ),
      );
    },
    [],
  );

  const addMediumStep = useCallback(() => {
    setMediumSteps((current) => [
      ...current,
      { id: crypto.randomUUID(), toolId: tools[0]?.tool_id ?? "", options: {}, timeout: "" },
    ]);
  }, [tools]);

  const removeMediumStep = useCallback((id: string) => {
    setMediumSteps((current) =>
      current.length <= 1 ? current : current.filter((step) => step.id !== id),
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    // Meta
    projects,
    tools,
    wordlists,
    projectId,
    setProjectId,
    loadingMeta,
    metaError,
    selectedProject,
    isSubmitting,
    advancedCommand,

    // Basic form
    basicTarget,
    setBasicTarget,
    basicToolId,
    setBasicToolId,
    basicPreset,
    setBasicPreset,
    basicTools,

    // Medium form
    mediumTarget,
    setMediumTarget,
    mediumSteps,
    mediumTools,

    // Per-mode runtime state
    basicRun,
    basicLogs,
    basicErrors,
    mediumRun,
    mediumLogs,
    mediumErrors,
    advancedRun,
    advancedLogs,
    advancedErrors,

    // Actions
    resetRun,
    openJobReport,
    submitBasic,
    submitMedium,
    submitAdvanced,
    updateMediumStep,
    updateMediumOption,
    addMediumStep,
    removeMediumStep,
  };
}
