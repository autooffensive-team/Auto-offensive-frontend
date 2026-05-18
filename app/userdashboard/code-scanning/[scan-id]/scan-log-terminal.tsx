"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { JetBrains_Mono } from "next/font/google";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  appendChunk,
  completeStream,
  hydrateScan,
  resetScan,
  startScan,
  type ScanStreamChunk,
  type ScanStreamCompletionStatus,
} from "@/lib/redux/services/userdashboard/scanner/scan-log-stream-slice";
import { useGetScanLogsQuery } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type { ScanLogChunkResponse } from "@/types/scanner";
import { cn } from "@/lib/utils";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

const LOG_LEVEL_STYLES: Record<"INFO" | "WARN" | "ERROR", string> = {
  INFO: "border-blue-500/25 bg-blue-500/12 text-blue-300",
  WARN: "border-amber-500/25 bg-amber-500/12 text-amber-300",
  ERROR: "border-red-500/25 bg-red-500/12 text-red-300",
};

const FINALIZED_RESULT_PATTERN =
  /sonarqube\s+(?:finalized|execution)\s+result:\s*(\{.+\})$/i;

type ResultTone = "success" | "warning" | "failure";

type SonarFinalizedResult = {
  detected_language: string;
  selected_profile: string;
  env_file_policy: string;
  env_files: string[];
  gitleaks_status: string;
  gitleaks_findings: number;
  sonarqube_status: string;
  quality_gate_status: string;
  final_status: string;
};

type ScanLogTerminalProps = {
  initialScanId: string;
  isLive?: boolean;
};

function formatTime(value: string | null | undefined): string {
  if (!value) {
    return "--:--:--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeLevel(value: unknown): "INFO" | "WARN" | "ERROR" {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (normalized === "WARN" || normalized === "ERROR") {
    return normalized;
  }
  return "INFO";
}

function normalizeCompletionStatus(value: unknown): ScanStreamCompletionStatus {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === "SUCCESS" ||
    normalized === "FAILED" ||
    normalized === "FAILURE" ||
    normalized === "PARTIAL" ||
    normalized === "PENDING" ||
    normalized === "IN_PROGRESS"
  ) {
    return normalized as ScanStreamCompletionStatus;
  }

  return null;
}

function normalizeChunk(
  payload: unknown,
  fallbackScanId: string,
  fallbackSequence: number,
): ScanStreamChunk {
  const row =
    payload != null && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const timestamp =
    typeof row.timestamp === "string" && row.timestamp.trim()
      ? row.timestamp
      : new Date().toISOString();

  const phase =
    typeof row.phase === "string" && row.phase.trim() ? row.phase.trim() : "scan";
  const line =
    typeof row.line === "string" && row.line.trim()
      ? row.line
      : "Received empty log payload.";
  const sequenceNum =
    typeof row.sequence_num === "number" && Number.isFinite(row.sequence_num)
      ? row.sequence_num
      : fallbackSequence + 1;

  return {
    scan_id:
      typeof row.scan_id === "string" && row.scan_id.trim()
        ? row.scan_id.trim()
        : fallbackScanId,
    phase,
    level: normalizeLevel(row.level),
    line,
    timestamp,
    sequence_num: sequenceNum,
    is_final_chunk: row.is_final_chunk === true,
    completion_status: normalizeCompletionStatus(row.completion_status),
  };
}

function mapLogChunk(chunk: ScanLogChunkResponse): ScanStreamChunk {
  return {
    ...chunk,
    level: normalizeLevel(chunk.level),
    completion_status: normalizeCompletionStatus(chunk.completion_status),
  };
}

function isFailureStatus(status: ScanStreamCompletionStatus): boolean {
  return status === "FAILED" || status === "FAILURE" || status === "PARTIAL";
}

function isFailedLike(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().toUpperCase() === "FAILED";
}

function getProgressPercent(
  sequenceNum: number,
  completionStatus: ScanStreamCompletionStatus,
): number {
  if (completionStatus) {
    return 100;
  }

  if (sequenceNum <= 0) {
    return 0;
  }

  return Math.min(94, Math.max(6, Math.round(100 * (1 - Math.exp(-sequenceNum / 72)))));
}

function extractEffectiveFailureMessage(logs: ScanStreamChunk[]): string {
  for (const chunk of [...logs].reverse()) {
    const line = chunk.line.trim();
    if (!line) {
      continue;
    }

    const qualityGateMatch = line.match(
      /scan completed with failed effective quality gate:\s*(.+)$/i,
    );
    if (qualityGateMatch?.[1]) {
      return qualityGateMatch[1].trim();
    }

    if (
      /env file policy failed/i.test(line) ||
      /gitleaks detected/i.test(line) ||
      /sonarqube quality gate failed/i.test(line)
    ) {
      return line;
    }
  }

  return "";
}

function parseFinalizedResult(line: string): SonarFinalizedResult | null {
  const match = line.match(FINALIZED_RESULT_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  try {
    const payload = JSON.parse(match[1]) as Record<string, unknown>;
    return {
      detected_language:
        typeof payload.detected_language === "string"
          ? payload.detected_language
          : "unknown",
      selected_profile:
        typeof payload.selected_profile === "string"
          ? payload.selected_profile
          : "unknown",
      env_file_policy:
        typeof payload.env_file_policy === "string"
          ? payload.env_file_policy
          : "UNKNOWN",
      env_files: Array.isArray(payload.env_files)
        ? payload.env_files.filter(
            (value): value is string => typeof value === "string" && value.trim().length > 0,
          )
        : [],
      gitleaks_status:
        typeof payload.gitleaks_status === "string"
          ? payload.gitleaks_status
          : "UNKNOWN",
      gitleaks_findings:
        typeof payload.gitleaks_findings === "number" && Number.isFinite(payload.gitleaks_findings)
          ? payload.gitleaks_findings
          : 0,
      sonarqube_status:
        typeof payload.sonarqube_status === "string"
          ? payload.sonarqube_status
          : "UNKNOWN",
      quality_gate_status:
        typeof payload.quality_gate_status === "string"
          ? payload.quality_gate_status
          : "UNKNOWN",
      final_status:
        typeof payload.final_status === "string"
          ? payload.final_status
          : "UNKNOWN",
    };
  } catch {
    return null;
  }
}

function isFinalizedResultLine(line: string): boolean {
  return FINALIZED_RESULT_PATTERN.test(line.trim());
}

function formatLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getResultTone(
  completionStatus: ScanStreamCompletionStatus,
  effectiveFailureMessage: string,
  finalizedResult: SonarFinalizedResult | null,
): ResultTone {
  if (isFailureStatus(completionStatus)) {
    return "failure";
  }

  if (
    effectiveFailureMessage ||
    isFailedLike(finalizedResult?.final_status) ||
    isFailedLike(finalizedResult?.env_file_policy) ||
    finalizedResult?.quality_gate_status === "WARN" ||
    finalizedResult?.quality_gate_status === "ERROR"
  ) {
    return "warning";
  }

  return completionStatus === "SUCCESS" ? "success" : "failure";
}

function getResultHeadline(resultTone: ResultTone): string {
  if (resultTone === "failure") {
    return "Scan Failed";
  }
  if (resultTone === "warning") {
    return "Scan Completed With Policy Warning";
  }
  return "Scan Completed";
}

function getResultDetail(
  completionStatus: ScanStreamCompletionStatus,
  effectiveFailureMessage: string,
  finalizedResult: SonarFinalizedResult | null,
): string {
  if (effectiveFailureMessage) {
    return effectiveFailureMessage;
  }
  if (isFailedLike(finalizedResult?.env_file_policy)) {
    return `Env file policy failed (${finalizedResult?.env_files.length ?? 0} file(s) found)`;
  }
  if (isFailedLike(finalizedResult?.final_status)) {
    return "SonarQube finished, but at least one policy check failed.";
  }
  if (completionStatus === "SUCCESS") {
    return "Persisted scan logs loaded successfully.";
  }
  return "The scan ended after an analyzer or transport failure.";
}

function getStatusBadgeClass(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === "PASSED" || normalized === "SUCCESS" || normalized === "OK") {
    return "border-emerald-500/20 bg-emerald-500/12 text-emerald-300";
  }
  if (normalized === "WARN") {
    return "border-amber-500/20 bg-amber-500/12 text-amber-300";
  }
  if (normalized === "FAILED" || normalized === "FAILURE" || normalized === "ERROR") {
    return "border-red-500/20 bg-red-500/12 text-red-300";
  }
  return "border-white/12 bg-white/[0.04] text-white/72";
}

function parseSsePayload(data: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(data) as unknown;
    return parsed != null && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function ScanLogTerminal({
  initialScanId,
  isLive = false,
}: ScanLogTerminalProps) {
  const dispatch = useAppDispatch();
  const { activeScanId, finalChunk, isStreaming, logs, terminalStatus } = useAppSelector(
    (state) => state.scanLogStream,
  );

  const trimmedScanId = initialScanId.trim();
  const eventSourceRef = useRef<EventSource | null>(null);
  const expectedCloseRef = useRef(false);
  const hydratedSnapshotRef = useRef("");
  const previousScanIdRef = useRef("");
  const latestStateRef = useRef<{
    activeScanId: string;
    lastChunk: ScanStreamChunk | null;
  }>({
    activeScanId,
    lastChunk: null,
  });

  const historyQuery = useGetScanLogsQuery(
    trimmedScanId
      ? {
          scan_id: trimmedScanId,
          limit: 1000,
        }
      : skipToken,
  );
  const {
    data: historyData,
    isError: historyIsError,
    isLoading: historyIsLoading,
    isSuccess: historyIsSuccess,
    refetch: refetchHistory,
  } = historyQuery;

  const lastChunk = logs.at(-1) ?? null;

  useEffect(() => {
    latestStateRef.current = {
      activeScanId,
      lastChunk,
    };
  }, [activeScanId, lastChunk]);

  useEffect(() => {
    if (previousScanIdRef.current === trimmedScanId) {
      return;
    }

    previousScanIdRef.current = trimmedScanId;
    hydratedSnapshotRef.current = "";
    expectedCloseRef.current = true;
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    dispatch(resetScan());
  }, [dispatch, trimmedScanId]);

  useEffect(() => {
    if (!trimmedScanId || !historyData) {
      return;
    }
    if (isStreaming && historyData.is_terminal !== true) {
      return;
    }

    const snapshotKey = [
      trimmedScanId,
      historyData.status,
      historyData.is_terminal ? "terminal" : "open",
      historyData.next_sequence_num,
      historyData.logs.length,
    ].join(":");

    if (hydratedSnapshotRef.current === snapshotKey) {
      return;
    }

    dispatch(
      hydrateScan({
        scanId: trimmedScanId,
        logs: historyData.logs.map(mapLogChunk),
        status: normalizeCompletionStatus(historyData.status),
      }),
    );
    hydratedSnapshotRef.current = snapshotKey;
  }, [dispatch, historyData, isStreaming, trimmedScanId]);

  useEffect(() => {
    return () => {
      expectedCloseRef.current = true;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      dispatch(resetScan());
    };
  }, [dispatch]);

  const appendSyntheticError = useEffectEvent((message: string) => {
    const latestState = latestStateRef.current;
    dispatch(
      appendChunk({
        scan_id: latestState.activeScanId || trimmedScanId,
        phase: latestState.lastChunk?.phase || "stream",
        level: "ERROR",
        line: message,
        timestamp: new Date().toISOString(),
        sequence_num: (latestState.lastChunk?.sequence_num ?? 0) + 1,
        is_final_chunk: true,
        completion_status: "FAILURE",
      }),
    );
  });

  const closeStream = (markExpected = true) => {
    if (markExpected) {
      expectedCloseRef.current = true;
    }
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };

  const handleIncomingChunk = (chunk: ScanStreamChunk) => {
    dispatch(appendChunk(chunk));
    if (chunk.is_final_chunk) {
      void refetchHistory();
      closeStream();
    }
  };

  const handleRawMessage = useEffectEvent((data: string, fallbackScanId: string) => {
    const latestState = latestStateRef.current;
    try {
      const payload = JSON.parse(data);
      const chunk = normalizeChunk(
        payload,
        fallbackScanId,
        latestState.lastChunk?.sequence_num ?? 0,
      );
      handleIncomingChunk(chunk);
    } catch {
      appendSyntheticError("Received malformed SSE payload from the scan stream.");
      closeStream();
    }
  });

  const historyReady = !trimmedScanId || historyIsSuccess || historyIsError;
  const shouldAutoStream =
    Boolean(trimmedScanId) &&
    isLive &&
    historyReady &&
    historyData?.is_terminal !== true;

  useEffect(() => {
    if (!shouldAutoStream) {
      if (!isLive && eventSourceRef.current) {
        closeStream();
      }
      return;
    }

    if (eventSourceRef.current) {
      return;
    }

    expectedCloseRef.current = false;
    dispatch(startScan(trimmedScanId));

    const source = new EventSource(
      `/api/scan/stream?scan_id=${encodeURIComponent(trimmedScanId)}&include_history=false`,
    );
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      handleRawMessage(event.data, trimmedScanId);
    };

    source.addEventListener("done", (event) => {
      const payload = parseSsePayload((event as MessageEvent<string>).data);
      dispatch(completeStream(normalizeCompletionStatus(payload?.status)));
      void refetchHistory();
      closeStream();
    });

    source.addEventListener("stream-error", (event) => {
      if (expectedCloseRef.current) {
        return;
      }
      const payload = parseSsePayload((event as MessageEvent<string>).data);
      appendSyntheticError(
        typeof payload?.detail === "string" && payload.detail.trim()
          ? payload.detail
          : "Log stream disconnected or could not be opened.",
      );
      void refetchHistory();
      closeStream();
    });

    source.onerror = () => {
      if (expectedCloseRef.current) {
        return;
      }
      appendSyntheticError("Log stream disconnected or could not be opened.");
      void refetchHistory();
      closeStream();
    };
  }, [
    dispatch,
    historyReady,
    historyData?.is_terminal,
    isLive,
    refetchHistory,
    shouldAutoStream,
    trimmedScanId,
  ]);

  const visibleLogs = useMemo(
    () => logs.filter((chunk) => !isFinalizedResultLine(chunk.line)),
    [logs],
  );
  const infoCount = useMemo(
    () => visibleLogs.filter((chunk) => chunk.level === "INFO").length,
    [visibleLogs],
  );
  const warnCount = useMemo(
    () => visibleLogs.filter((chunk) => chunk.level === "WARN").length,
    [visibleLogs],
  );
  const errorCount = useMemo(
    () => visibleLogs.filter((chunk) => chunk.level === "ERROR").length,
    [visibleLogs],
  );
  const finalizedResult = useMemo(() => {
    for (const chunk of [...logs].reverse()) {
      const parsed = parseFinalizedResult(chunk.line);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }, [logs]);
  const effectiveFailureMessage = useMemo(
    () => extractEffectiveFailureMessage(logs),
    [logs],
  );
  const hasHiddenSonarLinks = useMemo(
    () =>
      logs.some(
        (chunk) =>
          chunk.line.includes("SonarQube dashboard link hidden") ||
          chunk.line.includes("[redacted-sonarqube-dashboard-url]") ||
          chunk.line.includes("[redacted-sonarqube-task-url]"),
      ),
    [logs],
  );
  const hasComputeTaskNotice = useMemo(
    () => logs.some((chunk) => chunk.line.includes("SonarQube compute engine task submitted")),
    [logs],
  );

  const completionStatus =
    finalChunk?.completion_status ??
    terminalStatus ??
    normalizeCompletionStatus(historyData?.status) ??
    null;
  const sequenceNum = lastChunk?.sequence_num ?? visibleLogs.at(-1)?.sequence_num ?? 0;
  const progressPercent = getProgressPercent(sequenceNum, completionStatus);
  const phaseLabel = (
    visibleLogs.at(-1)?.phase ||
    lastChunk?.phase ||
    finalChunk?.phase ||
    (isLive ? "streaming" : "history")
  ).toUpperCase();
  const resultTone = getResultTone(
    completionStatus,
    effectiveFailureMessage,
    finalizedResult,
  );
  const resultHeadline = getResultHeadline(resultTone);
  const resultDetail = getResultDetail(
    completionStatus,
    effectiveFailureMessage,
    finalizedResult,
  );
  const showResultBanner = Boolean(completionStatus) || historyData?.is_terminal === true;

  const progressBarClass =
    resultTone === "warning"
      ? "bg-amber-400"
      : completionStatus === "SUCCESS"
        ? "bg-emerald-400"
        : isFailureStatus(completionStatus)
          ? "bg-red-400"
          : "bg-blue-400";

  const getProgressStep = (): number => {
    if (completionStatus === "SUCCESS") return 3;
    if (isStreaming || (isLive && completionStatus === "IN_PROGRESS")) return 2;
    return 1;
  };

  const currentStep = getProgressStep();

  const steps = [
    { label: "Clone", number: 1 },
    { label: "Scanning", number: 2 },
    { label: "Complete", number: 3 },
  ];

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-white">Scan Progress</h3>
          {isStreaming ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
              Live Scanning
            </span>
          ) : null}
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isActive = currentStep >= step.number;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-500",
                      isCompleted
                        ? "bg-emerald-500/30 text-emerald-300 border-2 border-emerald-400"
                        : isActive
                          ? "bg-blue-500/30 text-blue-300 border-2 border-blue-400"
                          : "bg-white/[0.05] text-white/40 border-2 border-white/10",
                    )}
                  >
                    {isCompleted ? "✓" : step.number}
                  </div>
                  <span
                    className={cn(
                      "mt-3 text-sm font-medium transition-colors duration-300",
                      isActive ? "text-white" : "text-white/50",
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-3 relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isCompleted || (isCurrent && isStreaming)
                          ? "bg-gradient-to-r from-emerald-400 to-blue-400"
                          : isActive
                            ? "bg-gradient-to-r from-blue-400 to-blue-300"
                            : "bg-white/10",
                      )}
                    />
                    {isCurrent && isStreaming && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-emerald-300 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Details */}
        <div className="mt-8 pt-6 border-t border-white/6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Total Logs</p>
              <p className="text-2xl font-semibold text-white">{visibleLogs.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Sequence</p>
              <p className="text-2xl font-semibold text-emerald-300">#{sequenceNum}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Status</p>
              <p className={cn("text-sm font-semibold uppercase tracking-wider",
                completionStatus === "SUCCESS" ? "text-emerald-300" :
                isFailureStatus(completionStatus) ? "text-red-300" :
                "text-blue-300"
              )}>
                {completionStatus || (isStreaming ? "Scanning" : "Idle")}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {showResultBanner ? (
          <div className="mt-6 pt-6 border-t border-white/6">
            <div
              className={cn(
                "rounded-xl border px-4 py-3",
                resultTone === "success" &&
                  "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
                resultTone === "warning" &&
                  "border-amber-500/25 bg-amber-500/10 text-amber-100",
                resultTone === "failure" && "border-red-500/25 bg-red-500/12 text-red-100",
              )}
            >
              <p className="text-sm font-semibold">{resultHeadline}</p>
              <p className="mt-1 text-xs text-white/72">{resultDetail}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
