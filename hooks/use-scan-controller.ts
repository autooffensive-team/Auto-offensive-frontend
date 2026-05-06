"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveRun,
  JobParsedData,
  JobStatus,
  LogLine,
  MediumStepState,
  OptionValue,
  ParsedData,
  Project,
  ScanMode,
  SseEvent,
  Tool,
} from "@/types/scan";
import {
  analyzeAdvancedCommand,
  fetchJson,
  formatPayloadLine,
  logFromPayload,
  parseJsonMaybe,
  readSseResponse,
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

export function useScanController() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [projectId, setProjectId] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [basicTarget, setBasicTarget] = useState("");
  const [basicToolId, setBasicToolId] = useState("");
  const [basicPreset, setBasicPreset] = useState("");

  const [mediumTarget, setMediumTarget] = useState("");
  const [mediumSteps, setMediumSteps] = useState<MediumStepState[]>([]);

  const [advancedCommand, setAdvancedCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [run, setRun] = useState<ActiveRun>(createInitialRun("basic"));
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamStepRef = useRef("");

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

  const stopWatchingJob = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    streamStepRef.current = "";
  }, []);

  const appendLog = useCallback((line: LogLine) => {
    setLogs((current) => [...current.slice(-399), line]);
  }, []);

  const resetRun = useCallback(
    (mode: ScanMode) => {
      stopWatchingJob();
      setLogs([]);
      setErrors([]);
      setRun(createInitialRun(mode));
    },
    [stopWatchingJob],
  );

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

        if (cancelled) {
          return;
        }

        setProjects(projectData);
        setTools(toolData);
        setProjectId((current) => current || projectData[0]?.project_id || "");

        const firstBasicTool = toolData.find(
          (tool) => (tool.scan_config?.basic?.presets?.length ?? 0) > 0,
        );
        setBasicToolId((current) => current || firstBasicTool?.tool_id || "");

        const firstMediumTool = toolData[0];
        setMediumSteps((current) =>
          current.length
            ? current
            : [
                {
                  id: crypto.randomUUID(),
                  toolId: firstMediumTool?.tool_id ?? "",
                  options: {},
                  timeout: "",
                },
              ],
        );
      } catch (error) {
        if (!cancelled) {
          setMetaError(
            error instanceof Error ? error.message : "Failed to load scan metadata.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const presets = selectedBasicTool?.scan_config?.basic?.presets ?? [];
    setBasicPreset((current) => {
      if (current && presets.some((preset) => preset.name === current)) {
        return current;
      }
      return presets[0]?.name ?? "";
    });
  }, [selectedBasicTool]);

  useEffect(() => stopWatchingJob, [stopWatchingJob]);

  const fetchParsedData = useCallback(async (mode: "medium" | "advanced", jobId: string) => {
    try {
      const parsed = await fetchJson<JobParsedData>(`/scans/${mode}/jobs/${jobId}/parsed-data`);
      setRun((current) => ({
        ...current,
        parsedSteps: parsed.steps ?? [],
      }));
    } catch {
      return;
    }
  }, []);

  const openStepStream = useCallback(
    (mode: "medium" | "advanced", stepId: string) => {
      if (!stepId || streamStepRef.current === stepId) {
        return;
      }

      eventSourceRef.current?.close();
      streamStepRef.current = stepId;

      const source = new EventSource(`/api/backend/scans/${mode}/steps/${stepId}/logs/stream`);
      eventSourceRef.current = source;

      const handleEvent = (eventName: string, event: MessageEvent) => {
        const payload = parseJsonMaybe(event.data);
        if (eventName === "stream-error" || eventName === "error") {
          setErrors((current) => [...current, formatPayloadLine(payload)]);
        }
        if (!["heartbeat", "ping", "ready"].includes(eventName)) {
          appendLog(logFromPayload(mode, eventName, payload));
        }
      };

      source.onmessage = (event) => handleEvent("log", event);
      source.addEventListener("log", (event) => handleEvent("log", event as MessageEvent));
      source.addEventListener("ready", (event) => handleEvent("ready", event as MessageEvent));
      source.addEventListener("heartbeat", (event) => handleEvent("heartbeat", event as MessageEvent));
      source.addEventListener("stream-error", (event) =>
        handleEvent("stream-error", event as MessageEvent),
      );
      source.onerror = () => {
        setErrors((current) => [
          ...current.slice(-4),
          "Log stream disconnected or could not be opened.",
        ]);
      };
    },
    [appendLog],
  );

  const watchJob = useCallback(
    (mode: "medium" | "advanced", jobId: string, initialStepId: string) => {
      openStepStream(mode, initialStepId);
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }

      pollRef.current = setInterval(async () => {
        try {
          const job = await fetchJson<JobStatus>(`/scans/${mode}/jobs/${jobId}`);
          const activeStep =
            job.steps?.find((step) => !terminalStatuses.has(step.status)) ??
            job.steps?.[job.steps.length - 1];

          setRun((current) => ({
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
          setErrors((current) => [
            ...current.slice(-4),
            error instanceof Error ? error.message : "Failed to refresh job status.",
          ]);
        }
      }, 2500);
    },
    [fetchParsedData, openStepStream, stopWatchingJob],
  );

  const handleBasicEvent = useCallback(
    (event: SseEvent) => {
      const payload =
        event.data && typeof event.data === "object"
          ? (event.data as Record<string, unknown>)
          : {};

      if (event.event === "scan_started") {
        setRun((current) => ({
          ...current,
          jobId: String(payload.job_id ?? ""),
          status: String(payload.status ?? "JOB_STATUS_PENDING"),
        }));
      } else if (event.event === "status") {
        setRun((current) => ({
          ...current,
          status: String(payload.status ?? current.status),
          findings: Number(payload.total_findings ?? current.findings),
        }));
      } else if (event.event === "result") {
        const parsed = payload.parsed_data as ParsedData | undefined;
        setRun((current) => ({
          ...current,
          findings: Number(payload.total_count ?? current.findings),
          parsedSteps: parsed ? [parsed] : current.parsedSteps,
        }));
      } else if (event.event === "done") {
        const parsed = payload.parsed_data as ParsedData | undefined;
        setRun((current) => ({
          ...current,
          status: String(payload.status ?? "JOB_STATUS_COMPLETED"),
          findings: Number(payload.total_findings ?? current.findings),
          parsedSteps: parsed ? [parsed] : current.parsedSteps,
        }));
      } else if (event.event === "error") {
        setErrors((current) => [...current, formatPayloadLine(event.data)]);
      }

      if (event.event !== "ping") {
        appendLog(logFromPayload("basic", event.event, event.data));
      }
    },
    [appendLog],
  );

  const submitBasic = useCallback(async () => {
    if (!projectId || !selectedBasicTool || !basicTarget.trim()) {
      return;
    }

    resetRun("basic");
    setIsSubmitting(true);
    setRun((current) => ({ ...current, mode: "basic", status: "submitting" }));

    try {
      const response = await fetch("/api/backend/scans/basic/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          target: basicTarget.trim(),
          tool: selectedBasicTool.tool_name,
          preset: basicPreset || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(String(payload?.detail ?? payload?.error ?? response.statusText));
      }

      await readSseResponse(response, handleBasicEvent);
    } catch (error) {
      setErrors((current) => [
        ...current,
        error instanceof Error ? error.message : "Basic scan failed.",
      ]);
      setRun((current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }, [basicPreset, basicTarget, handleBasicEvent, projectId, resetRun, selectedBasicTool]);

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

    if (!projectId || !mediumTarget.trim() || !steps.length) {
      return;
    }

    resetRun("medium");
    setIsSubmitting(true);
    setRun((current) => ({ ...current, mode: "medium", status: "submitting" }));

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

      setRun((current) => ({
        ...current,
        jobId: submit.job_id,
        stepId: submit.step_id,
        status: submit.status,
      }));
      appendLog(
        logFromPayload("system", "submitted", {
          message: `Medium scan submitted for ${mediumTarget.trim()}`,
        }),
      );
      watchJob("medium", submit.job_id, submit.step_id);
    } catch (error) {
      setErrors((current) => [
        ...current,
        error instanceof Error ? error.message : "Medium scan failed.",
      ]);
      setRun((current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }, [appendLog, mediumSteps, mediumTarget, projectId, resetRun, tools, watchJob]);

  const submitAdvanced = useCallback(
    async (command: string) => {
      const finalCommand = command.trim();
      setAdvancedCommand(finalCommand);

      if (!projectId || !finalCommand) {
        return;
      }

      resetRun("advanced");
      setIsSubmitting(true);
      setRun((current) => ({ ...current, mode: "advanced", status: "submitting" }));
      analyzeAdvancedCommand(finalCommand, tools).forEach((warning) => {
        appendLog(logFromPayload("system", "warning", { message: warning.message }));
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

        setRun((current) => ({
          ...current,
          jobId: submit.job_id,
          stepId: submit.step_id,
          status: submit.status,
        }));
        appendLog(
          logFromPayload("system", "submitted", {
            message: `Advanced command submitted: ${finalCommand}`,
          }),
        );
        watchJob("advanced", submit.job_id, submit.step_id);
      } catch (error) {
        setErrors((current) => [
          ...current,
          error instanceof Error ? error.message : "Advanced scan failed.",
        ]);
        setRun((current) => ({ ...current, status: "failed" }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [appendLog, projectId, resetRun, tools, watchJob],
  );

  const updateMediumStep = useCallback((id: string, patch: Partial<MediumStepState>) => {
    setMediumSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );
  }, []);

  const updateMediumOption = useCallback((stepId: string, key: string, value: string | boolean) => {
    setMediumSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? { ...step, options: { ...step.options, [key]: value } }
          : step,
      ),
    );
  }, []);

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

  return {
    projects,
    tools,
    projectId,
    setProjectId,
    loadingMeta,
    metaError,
    basicTarget,
    setBasicTarget,
    basicToolId,
    setBasicToolId,
    basicPreset,
    setBasicPreset,
    basicTools,
    mediumTarget,
    setMediumTarget,
    mediumSteps,
    mediumTools,
    isSubmitting,
    run,
    logs,
    errors,
    selectedProject,
    advancedCommand,
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
