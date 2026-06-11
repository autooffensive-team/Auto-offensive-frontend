"use client";

import Sidebar from "@/components/Sidebar";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  FileJson,
  LoaderCircle,
  Radio,
  Search,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import { LogToolbar } from "@/components/scanComponents/LogToolbar";

type BasicPreset = {
  name: string;
  description?: string | null;
  flags?: string[];
};

type BasicTool = {
  tool_id?: string;
  tool_name: string;
  tool_description?: string | null;
  scan_config?: {
    basic?: {
      presets?: BasicPreset[];
    };
  };
};

type BasicFinding = {
  finding_id: string;
  title: string;
  severity: string;
  host: string;
  port: number;
  fingerprint: string;
  description: string;
  remediation: string;
  protocol: string;
  metadata: Record<string, string>;
  tags: Record<string, string>;
  created_at?: string | null;
};

type ParsedColumn = {
  key: string;
  label?: string;
  type?: string;
};

type ParsedData = {
  columns?: ParsedColumn[];
  discovered_columns?: ParsedColumn[];
  data?: Array<Record<string, unknown>>;
  findings_count?: number;
  line_count?: number;
  lines?: string[];
  tool_name?: string;
};

type JobStatus = {
  job_id: string;
  status: string;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  pending_steps: number;
  total_findings: number;
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  steps?: Array<{
    step_id: string;
    tool_name: string;
    step_order: number;
    status: string;
    findings_count: number;
  }>;
};

type Summary = {
  job_id: string;
  status: string;
  total_findings: number;
  unique_hosts: number;
  unique_ports: number;
  unique_services: number;
  unique_fingerprints: number;
  severity_counts: Record<string, number>;
};

type ResultsResponse = {
  findings: BasicFinding[];
  total_count: number;
  has_more: boolean;
  raw_output_inline?: string | null;
  parsed_data?: ParsedData | null;
};

type LogEntry = {
  id: string;
  event: string;
  message: string;
  tone: "neutral" | "success" | "warning" | "danger";
  createdAt: string;
};

type TabKey = "findings" | "parsed" | "summary" | "raw";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Search }> = [
  { key: "findings", label: "Findings", icon: ShieldAlert },
  { key: "parsed", label: "Parsed Data", icon: Database },
  { key: "summary", label: "Summary", icon: Activity },
  { key: "raw", label: "Raw Output", icon: FileJson },
];

function severityTone(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("high")) {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30";
  }
  if (normalized.includes("medium")) {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30";
  }
  if (normalized.includes("low")) {
    return "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30";
  }
  return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30";
}

function statusTone(status: string) {
  if (status.includes("FAILED") || status.includes("CANCELLED")) {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30";
  }
  if (status.includes("COMPLETED") || status.includes("PARTIAL")) {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30";
  }
  if (status.includes("RUNNING")) {
    return "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30";
  }
  return "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30";
}

function decodeBase64Text(value?: string | null) {
  if (!value) {
    return "";
  }

  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function humanizeStatus(status: string) {
  return status.replaceAll("JOB_STATUS_", "").replaceAll("_", " ").toLowerCase();
}

function normalizeLogPayload(event: string, payload: unknown): Pick<LogEntry, "message" | "tone"> {
  if (event === "error") {
    return {
      message: typeof payload === "string" ? payload : prettyJson(payload),
      tone: "danger",
    };
  }

  if (event === "done") {
    return {
      message: "Scan finished and final output is available.",
      tone: "success",
    };
  }

  if (event === "status" && payload && typeof payload === "object" && "status" in payload) {
    return {
      message: `Status updated to ${humanizeStatus(String(payload.status))}.`,
      tone: "neutral",
    };
  }

  if (event === "scan_started") {
    return {
      message: "Scan request accepted and queued.",
      tone: "success",
    };
  }

  if (payload && typeof payload === "object") {
    const maybeMessage = "message" in payload ? payload.message : "line" in payload ? payload.line : null;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return {
        message: maybeMessage,
        tone: event === "warning" ? "warning" : "neutral",
      };
    }
  }

  return {
    message: typeof payload === "string" ? payload : prettyJson(payload),
    tone: event === "warning" ? "warning" : "neutral",
  };
}

export default function MediumScanPage() {
  const locale = useLocale();
  const router = useRouter();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const streamAbortRef = useRef<AbortController | null>(null);
  const { themeKey, sizeKey, size: logSize, setTheme, setSize, resetToDefault } = useLogPreferences();

  const [projectId, setProjectId] = useState("");
  const [target, setTarget] = useState("scanme.nmap.org");
  const [tool, setTool] = useState("");
  const [preset, setPreset] = useState("");
  const [jobId, setJobId] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("findings");
  const [tools, setTools] = useState<BasicTool[]>([]);
  const [toolsError, setToolsError] = useState("");
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState("JOB_STATUS_IDLE");
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [findings, setFindings] = useState<BasicFinding[]>([]);
  const [resultsMeta, setResultsMeta] = useState({ totalCount: 0, hasMore: false });
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rawOutput, setRawOutput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pageError, setPageError] = useState("");

  const selectedTool = tools.find((entry) => entry.tool_name === tool) ?? null;
  const presets = selectedTool?.scan_config?.basic?.presets ?? [];
  const parsedColumns =
    (parsedData?.columns && parsedData.columns.length > 0
      ? parsedData.columns
      : parsedData?.discovered_columns) ?? [];

  useEffect(() => {
    let ignore = false;

    async function loadTools() {
      try {
        setIsLoadingTools(true);
        setToolsError("");
        const response = await fetch("/api/basic-scan/tools", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const payload = (await response.json()) as BasicTool[];
        if (ignore) {
          return;
        }

        setTools(payload);

        if (payload.length > 0) {
          const firstTool = payload[0];
          const firstPreset = firstTool.scan_config?.basic?.presets?.[0]?.name ?? "";
          setTool((current) => current || firstTool.tool_name);
          setPreset((current) => current || firstPreset);
        }
      } catch (error) {
        if (!ignore) {
          setToolsError(error instanceof Error ? error.message : "Unable to load scan tools.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingTools(false);
        }
      }
    }

    loadTools();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  async function fetchJson<T>(url: string) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as T;
  }

  async function refreshJobArtifacts(nextJobId: string) {
    if (!nextJobId) {
      return;
    }

    setIsRefreshing(true);
    setPageError("");

    try {
      const [statusPayload, resultsPayload, findingsPayload, summaryPayload] = await Promise.all([
        fetchJson<JobStatus>(`/api/basic-scan/jobs/${nextJobId}`),
        fetchJson<ResultsResponse>(`/api/basic-scan/results?job_id=${encodeURIComponent(nextJobId)}`),
        fetchJson<ResultsResponse>(`/api/basic-scan/jobs/${nextJobId}/findings`),
        fetchJson<Summary>(`/api/basic-scan/jobs/${nextJobId}/summary`),
      ]);

      setJobStatus(statusPayload);
      setStatus(statusPayload.status);
      setFindings(findingsPayload.findings ?? []);
      setResultsMeta({
        totalCount: resultsPayload.total_count ?? findingsPayload.total_count ?? 0,
        hasMore: resultsPayload.has_more ?? false,
      });
      setParsedData(resultsPayload.parsed_data ?? null);
      setSummary(summaryPayload);
      setRawOutput(decodeBase64Text(resultsPayload.raw_output_inline));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to refresh scan artifacts.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function appendLog(event: string, payload: unknown) {
    const normalized = normalizeLogPayload(event, payload);
    setLogs((current) => {
      const next = [
        ...current,
        {
          id: `${Date.now()}-${current.length}`,
          event,
          message: normalized.message,
          tone: normalized.tone,
          createdAt: new Date().toLocaleTimeString(),
        },
      ];

      return next.slice(-200);
    });
  }

  function mergeFindings(incoming: BasicFinding[]) {
    if (!incoming.length) {
      return;
    }

    setFindings((current) => {
      const byId = new Map(current.map((entry) => [entry.finding_id, entry]));
      for (const finding of incoming) {
        byId.set(finding.finding_id, finding);
      }
      return Array.from(byId.values());
    });
  }

  function updateFromResult(payload: {
    findings?: BasicFinding[];
    total_count?: number;
    raw_output_inline?: string | null;
    parsed_data?: ParsedData | null;
  }) {
    mergeFindings(payload.findings ?? []);
    setResultsMeta((current) => ({
      totalCount: Math.max(current.totalCount, payload.total_count ?? 0),
      hasMore: current.hasMore,
    }));

    if (payload.parsed_data) {
      setParsedData(payload.parsed_data);
    }

    if (payload.raw_output_inline) {
      setRawOutput(decodeBase64Text(payload.raw_output_inline));
    }
  }

  async function consumeSseStream(response: Response) {
    if (!response.body) {
      throw new Error("Streaming response body is missing.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      while (buffer.includes("\n\n")) {
        const boundary = buffer.indexOf("\n\n");
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const lines = block.split("\n");
        let eventName = "message";
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          }
          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        if (!dataLines.length) {
          continue;
        }

        const rawData = dataLines.join("\n");
        let payload: unknown = rawData;

        try {
          payload = JSON.parse(rawData);
        } catch {
          payload = rawData;
        }

        if (eventName === "ping") {
          continue;
        }

        appendLog(eventName, payload);

        if (eventName === "scan_started" && payload && typeof payload === "object" && "job_id" in payload) {
          const startedPayload = payload as Record<string, unknown>;
          const nextJobId = String(payload.job_id);
          setJobId(nextJobId);
          setStatus(typeof startedPayload.status === "string" ? startedPayload.status : "JOB_STATUS_PENDING");
          setActiveTab("findings");
          void refreshJobArtifacts(nextJobId);
        }

        if (eventName === "status" && payload && typeof payload === "object") {
          const statusPayload = payload as Record<string, unknown>;
          if (typeof statusPayload.status === "string") {
            setStatus(statusPayload.status);
          }
          if (typeof statusPayload.total_findings === "number") {
            const totalFindings = statusPayload.total_findings;
            setResultsMeta((current) => ({
              totalCount: Math.max(current.totalCount, totalFindings),
              hasMore: current.hasMore,
            }));
          }
        }

        if (eventName === "result" && payload && typeof payload === "object") {
          updateFromResult(payload);
        }

        if (eventName === "done" && payload && typeof payload === "object") {
          const donePayload = payload as Record<string, unknown>;
          setStatus(typeof donePayload.status === "string" ? donePayload.status : "JOB_STATUS_COMPLETED");
          updateFromResult(payload);
          if (typeof donePayload.total_findings === "number") {
            const totalFindings = donePayload.total_findings;
            setResultsMeta((current) => ({
              totalCount: Math.max(current.totalCount, totalFindings),
              hasMore: false,
            }));
          }
          if (typeof donePayload.job_id === "string") {
            void refreshJobArtifacts(donePayload.job_id);
          }
        }

        if (eventName === "error" && payload && typeof payload === "object" && "error" in payload) {
          setPageError(String(payload.error));
        }
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectId.trim() || !target.trim() || !tool || !preset) {
      setPageError("Project, target, tool, and preset are required.");
      return;
    }

    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    setIsSubmitting(true);
    setPageError("");
    setStatus("JOB_STATUS_PENDING");
    setJobStatus(null);
    setSummary(null);
    setJobId("");
    setFindings([]);
    setParsedData(null);
    setRawOutput("");
    setLogs([]);
    setResultsMeta({ totalCount: 0, hasMore: false });

    try {
      const response = await fetch("/api/basic-scan/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          project_id: projectId.trim(),
          target: target.trim(),
          tool,
          preset,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await consumeSseStream(response);
    } catch (error) {
      if (controller.signal.aborted) {
        appendLog("warning", { message: "Streaming connection stopped from the browser." });
      } else {
        const message = error instanceof Error ? error.message : "Basic scan failed to start.";
        setPageError(message);
        appendLog("error", { error: message });
        setStatus("JOB_STATUS_FAILED");
      }
    } finally {
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
      setIsSubmitting(false);
    }
  }

  function stopStream() {
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setIsSubmitting(false);
  }

  function handleToolChange(nextToolName: string) {
    setTool(nextToolName);
    const nextTool = tools.find((entry) => entry.tool_name === nextToolName);
    setPreset(nextTool?.scan_config?.basic?.presets?.[0]?.name ?? "");
  }

  return (
    <div
      className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_36%),linear-gradient(180deg,_#f8fbfb_0%,_#ffffff_42%,_#f7fafc_100%)] text-gray-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_52%,_#000000_100%)] dark:text-white"
      style={{ fontFamily: bodyFontFamily }}
    >
      <aside className="hidden w-64 border-r border-gray-200/70 dark:border-gray-900 md:block">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
                  <Radio size={14} />
                  Basic Scan Stream
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950 dark:text-white">
                  Launch a basic scan and stay on the wire while findings arrive.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                  This flow submits a basic scan, listens to the live SSE response, and then hydrates status,
                  findings, parsed data, summary, and raw output from the follow-up endpoints.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Job</p>
                  <p className="mt-2 truncate text-sm font-medium">{jobId || "Waiting for submit"}</p>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Findings</p>
                  <p className="mt-2 text-2xl font-semibold">{resultsMeta.totalCount}</p>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">State</p>
                  <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(status)}`}>
                    {humanizeStatus(status)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
                    Submit Request
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Choose a target and backend-approved preset</h2>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  POST `/scans/basic/submit`
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project ID</span>
                  <input
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    placeholder="project-uuid"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-teal-500"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</span>
                  <input
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    placeholder="scanme.nmap.org"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-teal-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tool</span>
                  <select
                    value={tool}
                    onChange={(event) => handleToolChange(event.target.value)}
                    disabled={isLoadingTools || tools.length === 0}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-teal-500"
                  >
                    <option value="">{isLoadingTools ? "Loading tools..." : "Select a tool"}</option>
                    {tools.map((entry) => (
                      <option key={entry.tool_id ?? entry.tool_name} value={entry.tool_name}>
                        {entry.tool_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preset</span>
                  <select
                    value={preset}
                    onChange={(event) => setPreset(event.target.value)}
                    disabled={!selectedTool || presets.length === 0}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-teal-500"
                  >
                    <option value="">{selectedTool ? "Select a preset" : "Choose a tool first"}</option>
                    {presets.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/70">
                <div className="flex items-start gap-3">
                  <Search className="mt-0.5 text-teal-600 dark:text-teal-300" size={18} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTool?.tool_description ?? "Pick a tool to view its backend-defined presets."}
                    </p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {presets.find((entry) => entry.name === preset)?.description ??
                        "Presets are loaded from each tool's scan_config.basic.presets definition."}
                    </p>
                    {presets.find((entry) => entry.name === preset)?.flags?.length ? (
                      <p className="mt-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                        Flags: {presets.find((entry) => entry.name === preset)?.flags?.join(" ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {toolsError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {toolsError}
                </div>
              ) : null}

              {pageError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {pageError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingTools}
                  className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Radio size={16} />}
                  {isSubmitting ? "Streaming scan..." : "Start Basic Scan"}
                </button>

                <button
                  type="button"
                  onClick={stopStream}
                  disabled={!isSubmitting}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  Stop Stream
                </button>

                <button
                  type="button"
                  onClick={() => void refreshJobArtifacts(jobId)}
                  disabled={!jobId || isRefreshing}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Endpoints"}
                </button>
              </div>
            </form>

            <div className="rounded-[1.75rem] border border-white/70 bg-[#09111c] p-0 shadow-[0_30px_100px_-60px_rgba(14,165,233,0.75)] dark:border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Live Panel</p>
                  <h2 className="mt-1 text-lg font-semibold">Logs and status</h2>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-current" />
                  </span>
                  {humanizeStatus(status)}
                </div>
              </div>

              <div className="grid gap-4 border-b border-white/10 px-5 py-4 text-sm text-slate-300 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Job ID</p>
                  <p className="mt-2 truncate font-mono text-xs text-slate-200">{jobId || "not assigned yet"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Backend steps</p>
                  <p className="mt-2 text-slate-100">
                    {jobStatus ? `${jobStatus.completed_steps}/${jobStatus.total_steps} completed` : "Waiting"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Findings synced</p>
                  <p className="mt-2 text-slate-100">{resultsMeta.totalCount}</p>
                </div>
              </div>

              <div className="max-h-[32rem] space-y-3 overflow-y-auto px-5 py-5">
                {/* Log Preferences Toolbar */}
                <LogToolbar
                  themeKey={themeKey}
                  sizeKey={sizeKey}
                  onThemeChange={setTheme}
                  onSizeChange={setSize}
                  onReset={resetToDefault}
                  className="mb-3"
                />
                {logs.length === 0 && !isSubmitting ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                    Submit a scan to populate the SSE event stream here.
                  </div>
                ) : (
                  <>
                    {logs.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        entry.tone === "danger"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                          : entry.tone === "warning"
                            ? "border-amber-400/25 bg-amber-400/10 text-amber-50"
                            : entry.tone === "success"
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-50"
                              : "border-white/10 bg-white/5 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold uppercase tracking-[0.18em] opacity-75" style={{ fontSize: `${Math.max(logSize.xtermFontSize - 6, 10)}px` }}>{entry.event}</p>
                        <p className="opacity-60" style={{ fontSize: `${Math.max(logSize.xtermFontSize - 7, 9)}px` }}>{entry.createdAt}</p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words font-mono leading-6" style={{ fontSize: `${logSize.xtermFontSize - 4}px` }}>{entry.message}</p>
                    </div>
                  ))}
                  </>
                )}
              </div>

              {/* ── View Scan Results button (Floating) ── */}
              {/completed|failed|cancelled|partial/i.test(status) && (
                <motion.div 
                  className="fixed bottom-8 right-8 z-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => router.push("/userdashboard/assets")}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 0, 0.8)" }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "12px",
                      borderRadius: "8px",
                      border: "2px solid #00ff00",
                      backgroundColor: "#000000",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#00ff00",
                      textShadow: "0 0 10px #00ff00",
                      boxShadow: "0 0 20px rgba(0, 255, 0, 0.4)",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <BarChart3 size={20} />
                    View Results
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight size={20} />
                    </motion.div>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.key === activeTab;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-teal-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "findings" ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
                {findings.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Findings will appear here as `result` and `done` events arrive.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3">Severity</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Host</th>
                          <th className="px-4 py-3">Port</th>
                          <th className="px-4 py-3">Fingerprint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {findings.map((finding) => (
                          <tr key={finding.finding_id} className="border-t border-gray-200 dark:border-gray-800">
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityTone(finding.severity)}`}>
                                {finding.severity}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{finding.title || "Untitled finding"}</p>
                              {finding.description ? (
                                <p className="mt-1 max-w-xl text-xs leading-6 text-gray-500 dark:text-gray-400">
                                  {finding.description}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-4 py-4 font-mono text-xs">{finding.host || "-"}</td>
                            <td className="px-4 py-4">{finding.port || "-"}</td>
                            <td className="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                              {finding.fingerprint || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "parsed" ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
                {!parsedData?.data?.length ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Parsed rows will appear here when the backend returns `parsed_data.data[]`.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        <tr>
                          {parsedColumns.map((column) => (
                            <th key={column.key} className="px-4 py-3">
                              {column.label || column.key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.data.map((row, index) => (
                          <tr key={`${index}-${prettyJson(row)}`} className="border-t border-gray-200 dark:border-gray-800">
                            {parsedColumns.map((column) => (
                              <td key={column.key} className="px-4 py-4 align-top">
                                <span className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                                  {typeof row[column.key] === "object"
                                    ? prettyJson(row[column.key])
                                    : String(row[column.key] ?? "-")}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "summary" ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total Findings", value: summary?.total_findings ?? resultsMeta.totalCount, icon: ShieldAlert },
                    { label: "Unique Hosts", value: summary?.unique_hosts ?? 0, icon: Search },
                    { label: "Unique Ports", value: summary?.unique_ports ?? 0, icon: Activity },
                    { label: "Fingerprints", value: summary?.unique_fingerprints ?? 0, icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-900/80"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                          <Icon size={18} className="text-teal-600 dark:text-teal-300" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity Counts</p>
                    <div className="mt-4 space-y-3">
                      {summary && Object.keys(summary.severity_counts).length > 0 ? (
                        Object.entries(summary.severity_counts).map(([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityTone(severity)}`}>
                              {severity}
                            </span>
                            <span className="text-sm font-semibold">{count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Summary data will appear after the follow-up summary call completes.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Step Snapshot</p>
                    <div className="mt-4 space-y-3">
                      {jobStatus?.steps?.length ? (
                        jobStatus.steps.map((step) => (
                          <div key={step.step_id} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{step.tool_name}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Step {step.step_order}</p>
                              </div>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(step.status)}`}>
                                {humanizeStatus(step.status)}
                              </span>
                            </div>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                              Findings reported: {step.findings_count}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Step data will be populated from GET `/scans/basic/jobs/{'{job_id}'}`.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "raw" ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Terminal size={16} />
                    Decoded `raw_output_inline`
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Base64 from backend, decoded in-browser
                  </div>
                </div>
                <pre className="max-h-[34rem] overflow-auto bg-[#07111a] px-5 py-5 text-xs leading-6 text-slate-200">
                  {rawOutput || "Raw output will appear here when `raw_output_inline` is returned."}
                </pre>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Clock3,
                title: "Submit + Stream",
                body: "The browser posts to the local basic scan route and parses the SSE event stream from the same request.",
              },
              {
                icon: Database,
                title: "Hydrate Artifacts",
                body: "When `job_id` is known, the page refreshes status, results, findings, and summary from the follow-up endpoints.",
              },
              {
                icon: AlertCircle,
                title: "Backend-Driven Options",
                body: "Tool and preset choices come from `/tools`, so preset names stay aligned with scan_config.basic.presets.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/65"
                >
                  <Icon size={20} className="text-teal-600 dark:text-teal-300" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">{item.body}</p>
                </div>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
