"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Copy } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const expectedCloseRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);
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
    shouldStickToBottomRef.current = true;
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
    const viewport = viewportRef.current;
    if (!viewport || !shouldStickToBottomRef.current) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }, [logs, finalChunk, terminalStatus]);

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
    shouldStickToBottomRef.current = true;
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

  const handleCopy = async () => {
    if (!visibleLogs.length) {
      return;
    }

    const text = visibleLogs
      .map(
        (chunk) =>
          `[${formatTime(chunk.timestamp)}] [${chunk.level}] [${chunk.phase}] #${chunk.sequence_num} ${chunk.line}`,
      )
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom <= 24;
  };

  const progressBarClass =
    resultTone === "warning"
      ? "bg-amber-400"
      : completionStatus === "SUCCESS"
        ? "bg-emerald-400"
        : isFailureStatus(completionStatus)
          ? "bg-red-400"
          : "bg-blue-400";

  const phaseBadgeClass =
    resultTone === "warning"
      ? "border-amber-500/20 bg-amber-500/12 text-amber-300"
      : completionStatus === "SUCCESS"
        ? "border-emerald-500/20 bg-emerald-500/12 text-emerald-300"
        : isFailureStatus(completionStatus)
          ? "border-red-500/20 bg-red-500/12 text-red-300"
          : "border-blue-500/20 bg-blue-500/12 text-blue-300";

  const finalizedRows = finalizedResult
    ? [
        { label: "Detected language", value: formatLabel(finalizedResult.detected_language) },
        { label: "Selected profile", value: formatLabel(finalizedResult.selected_profile) },
        { label: "SonarQube status", value: finalizedResult.sonarqube_status, badge: true },
        { label: "Quality gate", value: finalizedResult.quality_gate_status, badge: true },
        { label: "Final status", value: finalizedResult.final_status, badge: true },
        { label: "Env file policy", value: finalizedResult.env_file_policy, badge: true },
        {
          label: "Env files",
          value:
            finalizedResult.env_files.length > 0
              ? finalizedResult.env_files.join(", ")
              : "None detected",
        },
        { label: "Gitleaks status", value: finalizedResult.gitleaks_status, badge: true },
        {
          label: "Gitleaks findings",
          value: String(finalizedResult.gitleaks_findings),
        },
      ]
    : [];

  const emptyStateLabel =
    historyIsLoading && visibleLogs.length === 0
      ? "Loading persisted scan logs..."
      : isStreaming
        ? "Waiting for the first scan event..."
        : trimmedScanId
          ? "No persisted logs were recorded for this scan."
          : "Waiting for a scan to start.";

  return (
    <section
      className={cn(
        jetBrainsMono.className,
        "overflow-hidden rounded-[20px] border border-[#1c232d] bg-linear-to-br from-[#0c0e11] via-[#0c0e11] to-[#11151b] text-[#d7e0ea] shadow-[0_18px_60px_rgba(12,14,17,0.28)]",
      )}
    >
      <div className="relative flex items-center justify-between border-b border-white/6 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <span className="text-[11px] font-medium tracking-[0.18em] text-white/65 uppercase">
            Scan Logs
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em]",
              phaseBadgeClass,
            )}
          >
            {phaseLabel}
          </span>
          {isStreaming ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.14em] text-emerald-300 uppercase">
              <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Live
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!visibleLogs.length}
          aria-label="Copy logs"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/72 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Copy className="size-3.5" />
          <span>{copied ? "Copied" : "Copy logs"}</span>
        </button>
      </div>

      <div className="grid grid-cols-5 border-b border-white/6 bg-white/[0.02]">
        {[
          { label: "total", value: visibleLogs.length, valueClass: "text-white" },
          { label: "info", value: infoCount, valueClass: "text-blue-300" },
          { label: "warn", value: warnCount, valueClass: "text-amber-300" },
          { label: "error", value: errorCount, valueClass: "text-red-300" },
          { label: "seq #", value: sequenceNum, valueClass: "text-emerald-300" },
        ].map((item) => (
          <div
            key={item.label}
            className="border-r border-white/6 px-3 py-2.5 last:border-r-0"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">
              {item.label}
            </p>
            <p className={cn("mt-1 text-sm font-semibold", item.valueClass)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="h-0.5 w-full bg-white/6">
        <div
          className={cn("h-full transition-[width,background-color] duration-300", progressBarClass)}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        ref={viewportRef}
        onScroll={handleScroll}
        aria-live="polite"
        className="h-[280px] overflow-y-auto px-4 py-3 text-[12px] leading-6"
      >
        {visibleLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-[12px] text-white/42">
            {emptyStateLabel}
          </div>
        ) : (
          <div className="space-y-1">
            {visibleLogs.map((chunk) => {
              const level = normalizeLevel(chunk.level);
              return (
                <div
                  key={`${chunk.sequence_num}-${chunk.timestamp}-${chunk.line}`}
                  className="flex flex-wrap items-start gap-x-2 gap-y-1 rounded-lg px-1.5 py-1 text-white/86"
                >
                  <span className="text-white/36">[{formatTime(chunk.timestamp)}]</span>
                  <span className="text-emerald-300/85">[#{chunk.sequence_num}]</span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold tracking-[0.14em]",
                      LOG_LEVEL_STYLES[level],
                    )}
                  >
                    {level}
                  </span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-white/82">
                    {chunk.line}
                  </span>
                </div>
              );
            })}
            {isStreaming ? (
              <div className="flex items-center gap-2 px-1.5 py-1 text-emerald-300/90">
                <span className="text-white/36">[{formatTime(new Date().toISOString())}]</span>
                <span className="inline-block h-4 w-2 animate-pulse rounded-xs bg-emerald-300" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {showResultBanner ? (
        <div className="border-t border-white/6 px-4 pb-4">
          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3",
              resultTone === "success" &&
                "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
              resultTone === "warning" &&
                "border-amber-500/25 bg-amber-500/10 text-amber-100",
              resultTone === "failure" && "border-red-500/25 bg-red-500/12 text-red-100",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                  {resultHeadline}
                </p>
                <p className="mt-2 text-[12px] text-white/82">{resultDetail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.14em] text-white/52 uppercase">
                  <span>Stream finished at seq #{sequenceNum}</span>
                  {hasComputeTaskNotice ? <span>Compute task submitted</span> : null}
                  {hasHiddenSonarLinks ? <span>Sonar links hidden</span> : null}
                </div>
              </div>
              <div className="text-right text-[12px] text-white/76">
                <p>Total {visibleLogs.length}</p>
                <p>Errors {errorCount}</p>
                <p>Warnings {warnCount}</p>
                <p>Final seq #{sequenceNum}</p>
              </div>
            </div>
          </div>

          {finalizedResult ? (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-white/76 uppercase">
                    SonarQube Finalized Result
                  </p>
                  <p className="mt-1 text-[12px] text-white/48">
                    Internal file paths stay hidden. Only user-facing result signals are shown here.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full table-fixed text-left text-[12px]">
                  <thead className="bg-white/[0.03] text-white/44">
                    <tr>
                      <th className="w-[34%] px-3 py-2 font-medium">Signal</th>
                      <th className="px-3 py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalizedRows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-t border-white/8 align-top text-white/82"
                      >
                        <td className="px-3 py-2.5 text-white/52">{row.label}</td>
                        <td className="px-3 py-2.5">
                          {row.badge ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em]",
                                getStatusBadgeClass(row.value),
                              )}
                            >
                              {formatLabel(row.value)}
                            </span>
                          ) : (
                            <span className="break-words">{row.value}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
