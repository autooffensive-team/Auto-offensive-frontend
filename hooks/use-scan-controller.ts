"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "@/types/scan";
import {
  analyzeAdvancedCommand,
  fetchJson,
  formatPayloadLine,
  logFromPayload,
  parseJsonMaybe,
} from "@/utils/scan";

const terminalStatuses = new Set([
  "JOB_STATUS_COMPLETED",
  "JOB_STATUS_FAILED",
  "JOB_STATUS_CANCELLED",
  "JOB_STATUS_PARTIAL",
  "STEP_STATUS_COMPLETED",
  "STEP_STATUS_FAILED",
  "STEP_STATUS_CANCELLED",
]);

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

export function useScanController(initialProjectId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
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
  const appendLogForMode = useCallback((mode: ScanMode, line: LogLine) => {
    logsSetterRef.current[mode]((current) => [...current.slice(-399), line]);
  }, []);

  const appendErrorForMode = useCallback((mode: ScanMode, err: string) => {
    errorsSetterRef.current[mode]((current) => [...current.slice(-4), err]);
  }, []);

  const setRunForMode = useCallback(
    (mode: ScanMode, updater: (current: ActiveRun) => ActiveRun) => {
      runSetterRef.current[mode](updater);
    },
    [],
  );

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
  // Metadata loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError("");

      try {
        const [projectData, toolData] = await Promise.all([
          fetchJson<Project[]>("/projects"),
          fetchJson<Tool[]>("/tools?active_only=true"),
        ]);

        if (cancelled) return;

        setProjects(projectData);
        setTools(toolData);
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
    const completed = steps.filter((s: ScanStep) => s.status?.includes("COMPLETED")).length;
    const failed = steps.filter((s: ScanStep) => s.status?.includes("FAILED")).length;
    const pending = steps.filter(
      (s: ScanStep) => s.status?.includes("PENDING") || s.status?.includes("QUEUED"),
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
          appendErrorForMode(mode, formatPayloadLine(payload));
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
    (mode: ScanMode, jobId: string, initialStepId: string) => {
      openStepStream(mode, initialStepId);
      if (pollRef.current) clearInterval(pollRef.current);

      pollRef.current = setInterval(async () => {
        try {
          const summaryData = await fetchJson<any>(`/scans/${mode}/jobs/${jobId}/summary`);
          const job = transformSummaryToJobStatus(summaryData);
          const activeStep =
            job.steps?.find((step) => !terminalStatuses.has(step.status)) ??
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
            job.status.includes("COMPLETED") ||
            job.status.includes("FAILED") ||
            job.status.includes("CANCELLED") ||
            job.status.includes("PARTIAL")
          ) {
            stopWatchingJob();
            void fetchParsedData(mode, jobId);
          }
        } catch (error) {
          appendErrorForMode(
            mode,
            error instanceof Error ? error.message : "Failed to refresh job status.",
          );
        }
      }, 2500);
    },
    [appendErrorForMode, fetchParsedData, openStepStream, setRunForMode, stopWatchingJob, transformSummaryToJobStatus],
  );

  // ---------------------------------------------------------------------------
  // Basic scan
  // ---------------------------------------------------------------------------

  const submitBasic = useCallback(async () => {
    if (!projectId || !selectedBasicTool || !basicTarget.trim()) return;

    resetRun("basic");
    setIsSubmitting(true);
    setRunForMode("basic", (current) => ({ ...current, mode: "basic", status: "submitting" }));

    try {
      // /scans/basic/submit returns plain JSON (job_id, step_id, status),
      // NOT an SSE stream — use the same watchJob pattern as medium/advanced.
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
      watchJob("basic", submit.job_id, submit.step_id);
    } catch (error) {
      appendErrorForMode("basic", error instanceof Error ? error.message : "Basic scan failed.");
      setRunForMode("basic", (current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appendErrorForMode,
    appendLogForMode,
    basicPreset,
    basicTarget,
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

    if (!projectId || !mediumTarget.trim() || !steps.length) return;

    resetRun("medium");
    setIsSubmitting(true);
    setRunForMode("medium", (current) => ({ ...current, mode: "medium", status: "submitting" }));

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
      watchJob("medium", submit.job_id, submit.step_id);
    } catch (error) {
      appendErrorForMode("medium", error instanceof Error ? error.message : "Medium scan failed.");
      setRunForMode("medium", (current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    appendErrorForMode,
    appendLogForMode,
    mediumSteps,
    mediumTarget,
    projectId,
    resetRun,
    setRunForMode,
    tools,
    watchJob,
  ]);

  // ---------------------------------------------------------------------------
  // Advanced scan
  // ---------------------------------------------------------------------------
  const submitAdvanced = useCallback(
    async (command: string) => {
      const finalCommand = command.trim();
      setAdvancedCommand(finalCommand);
      if (!projectId || !finalCommand) return;

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
        appendLogForMode(
          "advanced",
          logFromPayload("system", "submitted", {
            message: `Advanced command submitted: ${finalCommand}`,
          }),
        );
        watchJob("advanced", submit.job_id, submit.step_id);
      } catch (error) {
        appendErrorForMode("advanced", error instanceof Error ? error.message : "Advanced scan failed.");
        setRunForMode("advanced", (current) => ({ ...current, status: "failed" }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [appendErrorForMode, appendLogForMode, projectId, resetRun, setRunForMode, tools, watchJob],
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
    submitBasic,
    submitMedium,
    submitAdvanced,
    updateMediumStep,
    updateMediumOption,
    addMediumStep,
    removeMediumStep,
  };
}
