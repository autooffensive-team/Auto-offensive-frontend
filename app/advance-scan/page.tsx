"use client";

import Sidebar from "@/components/Sidebar";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  FileJson,
  LoaderCircle,
  Radio,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import { LogToolbar } from "@/components/scanComponents/LogToolbar";
import { ScanLoadingHelix } from "@/components/scanComponents/ScanLoadingHelix";

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
  step_id?: string;
  job_id?: string;
  tool_name?: string;
  parse_method?: string;
  line_count?: number;
  findings_count?: number;
  lines?: string[];
  findings?: BasicFinding[];
  columns?: ParsedColumn[];
  discovered_columns?: ParsedColumn[];
  data?: Array<Record<string, unknown>>;
  created_at?: string | null;
};

type LogEntry = {
  id: string;
  event: string;
  message: string;
  tone: "neutral" | "success" | "warning" | "danger";
  createdAt: string;
};

type TabKey = "findings" | "parsed" | "logs" | "raw";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Terminal }> = [
  { key: "findings", label: "Findings", icon: ShieldAlert },
  { key: "parsed", label: "Parsed Data", icon: Database },
  { key: "logs", label: "Live Logs", icon: Activity },
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

function humanizeStatus(status: string) {
  return status.replaceAll("JOB_STATUS_", "").replaceAll("STEP_STATUS_", "").replaceAll("_", " ").toLowerCase();
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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
      message: "Advanced scan request accepted and queued.",
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

export default function AdvanceScanPage() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const streamAbortRef = useRef<AbortController | null>(null);
  const logStreamAbortRef = useRef<AbortController | null>(null);
  const { themeKey, sizeKey, theme: logTheme, size: logSize, setTheme, setSize, resetToDefault } = useLogPreferences();

  const [command, setCommand] = useState("");
  const [stepId, setStepId] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("logs");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState("IDLE");
  const [findings, setFindings] = useState<BasicFinding[]>([]);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [rawLines, setRawLines] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pageError, setPageError] = useState("");

  const parsedColumns =
    (parsedData?.columns && parsedData.columns.length > 0
      ? parsedData.columns
      : parsedData?.discovered_columns) ?? [];

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      logStreamAbortRef.current?.abort();
    };
  }, []);

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
      return next.slice(-300);
    });
  }

  function mergeFindings(incoming: BasicFinding[]) {
    if (!incoming.length) return;
    setFindings((current) => {
      const byId = new Map(current.map((entry) => [entry.finding_id, entry]));
      for (const finding of incoming) {
        byId.set(finding.finding_id, finding);
      }
      return Array.from(byId.values());
    });
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
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          }
          if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        if (!dataLines.length || eventName === "ping") continue;

        const rawData = dataLines.join("\n");
        let payload: unknown = rawData;

        try {
          payload = JSON.parse(rawData);
        } catch {
          payload = rawData;
        }

        appendLog(eventName, payload);

        const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

        if (eventName === "scan_started" && record) {
          const nextStepId = typeof record.step_id === "string" ? record.step_id : "";
          if (nextStepId) {
            setStepId(nextStepId);
          }
          setStatus(typeof record.status === "string" ? record.status : "RUNNING");
          setIsStreaming(true);
        }

        if (eventName === "status" && record) {
          if (typeof record.status === "string") {
            setStatus(record.status);
          }
        }

        if (eventName === "log" && record) {
          const line = typeof record.line === "string" ? record.line : typeof record.message === "string" ? record.message : "";
          if (line) {
            setRawLines((current) => [...current, line].slice(-500));
          }
        }

        if (eventName === "done" && record) {
          setStatus(typeof record.status === "string" ? record.status : "COMPLETED");
          setIsStreaming(false);
          if (typeof record.step_id === "string" && record.step_id) {
            void fetchParsedData(record.step_id);
          }
        }

        if (eventName === "error" && record) {
          setPageError(typeof record.error === "string" ? record.error : "Scan error occurred.");
          setStatus("FAILED");
          setIsStreaming(false);
        }
      }
    }
  }

  async function connectLogStream(targetStepId: string) {
    logStreamAbortRef.current?.abort();
    const controller = new AbortController();
    logStreamAbortRef.current = controller;

    try {
      const response = await fetch(`/api/guest-scan/advanced/${targetStepId}/logs`, {
        headers: { accept: "text/event-stream" },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
          try {
            payload = JSON.parse(rawData);
          } catch {
            payload = rawData;
          }

          appendLog(eventName, payload);

          const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

          if (eventName === "log" && record) {
            const line = typeof record.line === "string" ? record.line : typeof record.message === "string" ? record.message : "";
            if (line) {
              setRawLines((current) => [...current, line].slice(-500));
            }
          }

          if (eventName === "done") {
            setStatus("COMPLETED");
            setIsStreaming(false);
            void fetchParsedData(targetStepId);
          }
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        appendLog("warning", { message: "Log stream disconnected." });
      }
    }
  }

  async function fetchParsedData(targetStepId: string) {
    try {
      const response = await fetch(`/api/guest-scan/advanced/${targetStepId}/parsed-data`, {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as ParsedData;
      setParsedData(data);

      if (data.findings && data.findings.length > 0) {
        mergeFindings(data.findings);
      }

      if (data.lines && data.lines.length > 0) {
        setRawLines((current) => [...current, ...data.lines!]);
      }
    } catch {
      // Parsed data may not be available yet — that's fine
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!command.trim()) {
      setPageError("Enter a command to run.");
      return;
    }

    streamAbortRef.current?.abort();
    logStreamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    setIsSubmitting(true);
    setPageError("");
    setStatus("PENDING");
    setStepId("");
    setFindings([]);
    setParsedData(null);
    setRawLines([]);
    setLogs([]);

    try {
      const response = await fetch("/api/guest-scan/advanced/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({ command: command.trim() }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Handle 429 rate limit from backend
        if (response.status === 429) {
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
            const limit = response.headers.get("x-ratelimit-limit");
            const remaining = response.headers.get("x-ratelimit-remaining");
            if (limit) errorMsg += ` Limit: ${limit}, remaining: ${remaining ?? 0}.`;
          }
          setPageError(errorMsg);
          setStatus("IDLE");
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

        throw new Error(await response.text());
      }

      await consumeSseStream(response);
    } catch (error) {
      if (controller.signal.aborted) {
        appendLog("warning", { message: "Streaming connection stopped from the browser." });
      } else {
        const message = error instanceof Error ? error.message : "Advanced scan failed to start.";
        setPageError(message);
        appendLog("error", { error: message });
        setStatus("FAILED");
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
    logStreamAbortRef.current?.abort();
    logStreamAbortRef.current = null;
    setIsSubmitting(false);
    setIsStreaming(false);
  }

  return (
    <div
      className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_36%),linear-gradient(180deg,_#f8fbfb_0%,_#ffffff_42%,_#f7fafc_100%)] text-gray-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.14),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_52%,_#000000_100%)] dark:text-white"
      style={{ fontFamily: bodyFontFamily }}
    >
      <aside className="hidden w-64 border-r border-gray-200/70 dark:border-gray-900 md:block">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          {/* Header */}
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                  <Terminal size={14} />
                  Advanced Scan
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950 dark:text-white">
                  Run any command and stream results in real time.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                  Submit a raw command for advanced scanning. The backend executes it in a sandboxed
                  environment and streams logs and findings back via SSE.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Step</p>
                  <p className="mt-2 truncate text-sm font-medium">{stepId || "Waiting"}</p>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-gray-50/90 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Findings</p>
                  <p className="mt-2 text-2xl font-semibold">{findings.length}</p>
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

          {/* Main content */}
          <section className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
            {/* Left: Submit form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
                    Submit Command
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Enter a scan command</h2>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  POST /scans/advanced/try
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Command</span>
                <textarea
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="nmap -sV -sC scanme.nmap.org"
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm outline-none transition focus:border-violet-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-violet-500"
                />
              </label>

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/70">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-violet-600 dark:text-violet-300" size={18} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Guest mode — limited scans available
                    </p>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Commands run in a sandboxed environment. Create an account for unlimited access
                      and project-based scan management.
                    </p>
                  </div>
                </div>
              </div>

              {pageError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {pageError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !command.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Radio size={16} />}
                  {isSubmitting ? "Streaming..." : "Start Advanced Scan"}
                </button>

                <button
                  type="button"
                  onClick={stopStream}
                  disabled={!isSubmitting && !isStreaming}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  Stop Stream
                </button>

                {stepId ? (
                  <button
                    type="button"
                    onClick={() => void fetchParsedData(stepId)}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                  >
                    Refresh Results
                  </button>
                ) : null}
              </div>
            </form>

            {/* Right: Results panel */}
            <div className="rounded-[1.75rem] border border-white/70 bg-[#09111c] p-0 shadow-[0_30px_100px_-60px_rgba(139,92,246,0.75)] dark:border-white/10">
              {/* Tab bar */}
              <div className="flex items-center gap-1 border-b border-white/10 px-5 py-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-violet-500/20 text-violet-200"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                      {tab.key === "findings" && findings.length > 0 ? (
                        <span className="ml-1 rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px]">
                          {findings.length}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="max-h-[600px] overflow-y-auto p-5">
                {activeTab === "logs" ? (
                  <div className="space-y-1">
                    <LogToolbar
                      themeKey={themeKey}
                      sizeKey={sizeKey}
                      onThemeChange={setTheme}
                      onSizeChange={setSize}
                      onReset={resetToDefault}
                      className="mb-3"
                    />
                    {logs.length === 0 && !(isSubmitting || isStreaming) ? (
                      <p className="text-center text-sm text-gray-500">
                        Logs will appear here after you start a scan.
                      </p>
                    ) : (
                      <>
                        {(isSubmitting || isStreaming) && logs.length === 0 && (
                          <ScanLoadingHelix color={logTheme.html.asciiColor} />
                        )}
                        {logs.map((entry) => (
                          <div
                            key={entry.id}
                            className={`rounded-lg border px-3 py-1.5 leading-snug font-bold font-[Consolas,monospace] ${
                              entry.tone === "danger"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                                : entry.tone === "success"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                  : entry.tone === "warning"
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                                    : "border-white/5 bg-white/5 text-gray-300"
                            }`}
                            style={{ fontSize: `${logSize.xtermFontSize - 4}px` }}
                          >
                            <span className="mr-2 text-gray-500">[{entry.createdAt}]</span>
                            <span className="font-semibold text-violet-300">{entry.event}</span>
                            {" — "}
                            {entry.message}
                          </div>
                        ))}
                      </>
                    )}
                    {isStreaming ? (
                      <div className="flex items-center gap-2 text-xs text-violet-300">
                        <LoaderCircle size={12} className="animate-spin" />
                        Streaming...
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {activeTab === "findings" ? (
                  <div className="space-y-3">
                    {findings.length === 0 ? (
                      <p className="text-center text-sm text-gray-500">
                        No findings yet. They will appear after the scan completes.
                      </p>
                    ) : (
                      findings.map((finding) => (
                        <div
                          key={finding.finding_id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                {finding.title || finding.fingerprint || "Untitled Finding"}
                              </h4>
                              <p className="mt-1 text-xs text-gray-400">
                                {finding.host}
                                {finding.port ? `:${finding.port}` : ""}
                                {finding.protocol ? ` (${finding.protocol})` : ""}
                              </p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityTone(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                          {finding.description ? (
                            <p className="mt-3 text-xs text-gray-300">{finding.description}</p>
                          ) : null}
                          {finding.remediation ? (
                            <p className="mt-2 text-xs text-emerald-300/80">
                              <span className="font-semibold">Fix:</span> {finding.remediation}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {activeTab === "parsed" ? (
                  <div>
                    {!parsedData ? (
                      <p className="text-center text-sm text-gray-500">
                        Parsed data will appear after the scan completes.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {parsedData.tool_name ? (
                          <p className="text-xs text-gray-400">
                            Tool: <span className="font-semibold text-gray-200">{parsedData.tool_name}</span>
                            {parsedData.parse_method ? ` • Method: ${parsedData.parse_method}` : ""}
                          </p>
                        ) : null}

                        {parsedColumns.length > 0 && parsedData.data && parsedData.data.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-left text-xs">
                              <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                  {parsedColumns.map((col) => (
                                    <th key={col.key} className="px-3 py-2 font-semibold text-gray-300">
                                      {col.label || col.key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {parsedData.data.map((row, index) => (
                                  <tr key={index} className="border-b border-white/5">
                                    {parsedColumns.map((col) => (
                                      <td key={col.key} className="px-3 py-2 text-gray-300">
                                        {String(row[col.key] ?? "")}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : parsedData.lines && parsedData.lines.length > 0 ? (
                          <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] sm:text-[12.5px] leading-snug font-bold font-[Consolas,monospace] text-gray-300">
                            {parsedData.lines.join("\n")}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-500">No structured data available.</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                {activeTab === "raw" ? (
                  <div>
                    {rawLines.length === 0 ? (
                      <p className="text-center text-sm text-gray-500">
                        Raw output will appear here during the scan.
                      </p>
                    ) : (
                      <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] sm:text-[12.5px] leading-snug font-bold font-[Consolas,monospace] text-gray-300">
                        {rawLines.join("\n")}
                      </pre>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
