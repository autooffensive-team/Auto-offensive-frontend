"use client";

import Sidebar from "@/components/Sidebar";
import {
  Activity,
  AlertCircle,
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
    ? "var(--font-kantumruy-pro), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-kantumruy-pro), sans-serif";
  const streamAbortRef = useRef<AbortController | null>(null);
  const logStreamAbortRef = useRef<AbortController | null>(null);
  const { themeKey, sizeKey, decorationsEnabled, size: logSize, setTheme, setSize, setDecorations, resetToDefault } = useLogPreferences();

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
  const cyberGlow = "shadow-[0_30px_100px_-60px_rgba(34,197,94,0.55)]";

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
          const errorMessage = typeof record.error === "string" ? record.error : "Scan error occurred.";
          
          // Provide contextual error messages based on the error type
          let contextualMessage = errorMessage;
          const lowerMessage = errorMessage.toLowerCase();
          
          // Check for off-topic/unauthorized commands
          if (lowerMessage.includes("not in the active tool") || 
              lowerMessage.includes("unauthorized") || 
              lowerMessage.includes("not allowed") ||
              lowerMessage.includes("command not found") ||
              lowerMessage.includes("invalid command") ||
              lowerMessage.includes("bad gateway") ||
              lowerMessage.includes("first command") ||
              lowerMessage.includes("rejected")) {
            contextualMessage = "❌ UNAUTHORIZED COMMAND\n\n" +
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
              "This environment ONLY supports authorized security scanning tools.\n\n" +
              "✓ ALLOWED TOOLS:\n" +
              "  • nmap, masscan, naabu (port scanning)\n" +
              "  • nikto, gobuster, ffuf (web scanning)\n" +
              "  • sqlmap, hydra (vulnerability assessment)\n" +
              "  • nuclei, subfinder, httpx (reconnaissance)\n" +
              "  • amass, katana (web crawling)\n\n" +
              "✗ NOT ALLOWED:\n" +
              "  • System commands: ls, cd, rm, mkdir, etc.\n" +
              "  • Network tools: ping, curl, wget, telnet, etc.\n" +
              "  • Shell access: bash, sh, powershell, cmd, etc.\n\n" +
              "💡 TIP: Type 'help' to see usage examples\n" +
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
          } else if (lowerMessage.includes("timeout")) {
            contextualMessage = "⏱️ SCAN TIMEOUT\n\n" +
              "The command execution exceeded the maximum time limit.\n\n" +
              "Recommendations:\n" +
              "• Use a narrower target scope\n" +
              "• Reduce scan threads with -T2 or similar flags\n" +
              "• Filter specific ports: -p 22,80,443\n" +
              "• Use quick scan options if available";
          } else if (lowerMessage.includes("quota") || lowerMessage.includes("limit")) {
            contextualMessage = "📊 QUOTA EXCEEDED\n\n" +
              "You have reached your scan limit for this period.\n\n" +
              "Options:\n" +
              "• Wait for your quota to reset\n" +
              "• Upgrade your account for unlimited scans\n" +
              "• Contact support for more information";
          } else if (lowerMessage.includes("invalid") || lowerMessage.includes("syntax")) {
            contextualMessage = "⚠️ INVALID COMMAND SYNTAX\n\n" +
              "The command format is incorrect.\n\n" +
              "Examples:\n" +
              "• nmap -sV -sC target.com\n" +
              "• nuclei -u https://example.com\n" +
              "• subfinder -d example.com | httpx\n\n" +
              "Always include a target (hostname or IP address).";
          } else if (lowerMessage.includes("connection") || lowerMessage.includes("refused")) {
            contextualMessage = "🔌 CONNECTION ERROR\n\n" +
              "Unable to reach the target or execute the command.\n\n" +
              "Verify:\n" +
              "✓ Target host is reachable\n" +
              "✓ Target is not blocked by firewall\n" +
              "✓ Network connectivity is working\n" +
              "✓ You have permission to scan this target";
          }
          
          // Add the formatted error to logs
          appendLog("error", { message: contextualMessage });
          
          // Also set it as page error for display
          setPageError(contextualMessage);
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
      setPageError("⚠️ Please enter a command: Provide a valid security scanning command (e.g., nmap -sV target.com).");
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
          let errorMsg = "📊 Quota Exceeded: You have reached your scan limit.";
          try {
            const body = await response.json();
            if (body?.detail?.error) {
              errorMsg = body.detail.error;
            }
            if (body?.detail?.limit != null) {
              errorMsg = `📊 Rate Limited: You have used ${body.detail.limit - (body.detail.remaining ?? 0)} of ${body.detail.limit} scans available.`;
            }
            if (body?.detail?.reset_at) {
              const resetDate = new Date(body.detail.reset_at * 1000);
              errorMsg += ` Access will resume at ${resetDate.toLocaleString()}.`;
            } else {
              errorMsg += " Please try again later or upgrade your account.";
            }
          } catch {
            const limit = response.headers.get("x-ratelimit-limit");
            const remaining = response.headers.get("x-ratelimit-remaining");
            if (limit) {
              errorMsg = `📊 Rate Limited: You have used ${parseInt(limit) - parseInt(remaining || "0")} of ${limit} scans. Please wait before attempting again.`;
            }
          }
          setPageError(errorMsg);
          setStatus("IDLE");
          setIsSubmitting(false);
          return;
        }

        if (response.status === 422) {
          let errorMsg = "❌ Validation Error: The command provided does not meet security requirements.";
          try {
            const body = await response.json();
            if (body?.detail && Array.isArray(body.detail)) {
              const details = body.detail.map((d: any) => d.msg ?? String(d)).join("; ");
              errorMsg = `❌ Invalid Command: ${details}. Please verify your command syntax.`;
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
        let message = error instanceof Error ? error.message : "Advanced scan failed to start.";
        
        // Provide contextual error messages
        if (message.toLowerCase().includes("network")) {
          message = "🔌 NETWORK ERROR\n\nUnable to connect to the scanning server.\n\nPlease verify:\n✓ Your internet connection is active\n✓ The server is online\n✓ No firewall is blocking the connection\n\nTry again in a moment.";
        } else if (message.toLowerCase().includes("timeout")) {
          message = "⏱️ REQUEST TIMEOUT\n\nThe server took too long to respond.\n\nTip: Try again with a simpler command or narrower scan scope.";
        } else if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("forbidden")) {
          message = "❌ UNAUTHORIZED COMMAND\n\nYour command contains unauthorized operations.\n\nOnly approved security scanning tools are allowed:\n✓ nmap, nikto, gobuster, sqlmap, hydra, masscan, nuclei, subfinder, httpx\n✗ No: bash, ls, rm, curl, wget, ping, telnet\n\nPlease try a valid security scanning command.";
        } else if (message.toLowerCase().includes("not found")) {
          message = "❌ TOOL NOT AVAILABLE\n\nThe specified tool is not available in this environment.\n\nAvailable tools:\n• nmap, masscan, naabu (port scanning)\n• nikto, gobuster, ffuf (web scanning)\n• sqlmap, hydra (vulnerability assessment)\n• nuclei, subfinder, httpx (reconnaissance)\n\nVerify the tool name and try again.";
        }
        
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
        className="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_36%),linear-gradient(180deg,#f8fbfb_0%,#ffffff_42%,#f7fafc_100%)] text-gray-900 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,#020617_0%,#020617_52%,#000000_100%)] dark:text-white"
      style={{ fontFamily: bodyFontFamily }}
    >
      <style>{`
        body.terminal-fullscreen-active .advance-scan-sidebar {
          display: none !important;
        }
      `}</style>

      <aside
        className="hidden w-64 border-r border-gray-200/70 dark:border-gray-900 md:block transition-transform duration-200 advance-scan-sidebar"
        aria-hidden
      >
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">

        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
          {/* Header */}
          <section className="rounded-2xl sm:rounded-3xl border border-white/70 bg-white/80 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex flex-col gap-6 lg:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-500/20">
                  <Terminal size={16} />
                  Advanced Scan
                </div>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-950 dark:text-white leading-tight">
                  Execute any command with real-time results.
                </h1>
                <p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600 dark:text-gray-300">
                  Submit a raw command for advanced scanning. The backend executes it in a sandboxed environment and streams live logs and findings back via SSE.
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 w-full lg:w-auto">
                <div className="rounded-2xl border border-gray-200/80 bg-linear-to-br from-gray-50 to-gray-50/50 px-4 py-5 dark:border-gray-700 dark:bg-linear-to-br dark:from-gray-800/80 dark:to-gray-900">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400 font-semibold">Step ID</p>
                  <p className="mt-3 truncate text-sm font-mono font-semibold text-gray-900 dark:text-emerald-200">{stepId || "—"}</p>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-linear-to-br from-gray-50 to-gray-50/50 px-4 py-5 dark:border-gray-700 dark:bg-linear-to-br dark:from-gray-800/80 dark:to-gray-900">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400 font-semibold">Findings</p>
                  <p className="mt-3 text-3xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{findings.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-linear-to-br from-gray-50 to-gray-50/50 px-4 py-5 dark:border-gray-700 dark:bg-linear-to-br dark:from-gray-800/80 dark:to-gray-900">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400 font-semibold">Status</p>
                  <div className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusTone(status)}`}>
                    {humanizeStatus(status)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section className="grid gap-6 lg:gap-8 xl:grid-cols-[1.1fr_1.4fr]">
            {/* Left: Submit form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl sm:rounded-3xl border border-white/70 bg-white/85 p-6 sm:p-8 lg:p-10 shadow-sm backdrop-blur dark:border-emerald-400/10 dark:bg-[#031008]/85"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                    Command Entry
                  </p>
                  <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Execute Scan</h2>
                </div>
                <div className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1.5 text-xs font-mono font-bold text-gray-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 whitespace-nowrap">
                  POST
                </div>
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Command</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enter a scan command to execute</p>
                </label>
                <textarea
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="nmap -sV -sC scanme.nmap.org"
                  rows={5}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-mono text-sm outline-none transition duration-200 focus:border-emerald-400 focus:bg-[#FCFCFA] focus:ring-2 focus:ring-emerald-400/20 dark:border-emerald-900/60 dark:bg-[#07130b] dark:text-emerald-100 dark:placeholder:text-emerald-800 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 p-4 sm:p-5 text-sm dark:border-amber-600/40 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-1 text-amber-700 dark:text-amber-500 shrink-0" size={20} />
                  <div className="w-full">
                    <p className="font-bold text-amber-900 dark:text-amber-100">
                      ⚠️ Authorized Tools Only — Off-Topic Commands Will Be Rejected
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                      <p><span className="font-semibold">✓ ALLOWED:</span> nmap, nikto, gobuster, sqlmap, hydra, masscan, nuclei, subfinder, httpx, amass, katana, ffuf, naabu</p>
                      <p><span className="font-semibold">✗ NOT ALLOWED:</span> bash, ls, rm, curl, wget, ping, cd, mkdir, telnet, ssh, or any system commands</p>
                      <p><span className="font-semibold">💡 Tip:</span> Type <span className="font-mono bg-amber-200/30 px-2 py-1 rounded">help</span> to see command examples and usage.</p>
                    </div>
                  </div>
                </div>
              </div>

              {pageError ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="whitespace-pre-wrap wrap-break-word leading-relaxed font-mono text-xs">{pageError}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !command.trim()}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 px-6 py-3 text-sm font-bold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg hover:shadow-emerald-500/30"
                >
                  {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <Radio size={18} />}
                  {isSubmitting ? "Streaming..." : "Start Scan"}
                </button>

                <button
                  type="button"
                  onClick={stopStream}
                  disabled={!isSubmitting && !isStreaming}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-[#FCFCFA] hover:bg-gray-50 disabled:opacity-40 px-6 py-3 text-sm font-bold text-gray-700 transition duration-200 disabled:cursor-not-allowed dark:border-emerald-700 dark:bg-[#031008] dark:text-emerald-100 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-600"
                >
                  Stop Stream
                </button>

                {stepId ? (
                  <button
                    type="button"
                    onClick={() => void fetchParsedData(stepId)}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-[#FCFCFA] hover:bg-gray-50 px-6 py-3 text-sm font-bold text-gray-700 transition duration-200 dark:border-emerald-700 dark:bg-[#031008] dark:text-emerald-100 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-600"
                  >
                    Refresh Results
                  </button>
                ) : null}
              </div>
            </form>

            {/* Right: Results panel */}
            <div className={`rounded-2xl sm:rounded-3xl border border-white/70 bg-[#04110a] p-0 ${cyberGlow} dark:border-emerald-400/20 flex flex-col overflow-hidden`}>
              {/* Tab bar */}
              <div className="flex items-center gap-2 border-b border-emerald-500/10 px-4 sm:px-6 py-4 bg-linear-to-r from-transparent via-emerald-950/20 to-transparent dark:from-transparent dark:via-emerald-950/30 dark:to-transparent">
                <div className="flex flex-wrap items-center gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 ${
                          isActive
                            ? "bg-emerald-500/30 text-emerald-100 shadow-[0_0_0_2px_rgba(16,185,129,0.25)] border border-emerald-400/40"
                            : "text-emerald-400/70 hover:bg-white/5 hover:text-emerald-100 border border-transparent hover:border-emerald-400/20"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm sm:text-base">{tab.label}</span>
                        {tab.key === "findings" && findings.length > 0 ? (
                          <span className="ml-1 rounded-full bg-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-50 border border-emerald-400/30">
                            {findings.length}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto bg-[#06150d] p-6 sm:p-7 space-y-4 max-h-150 sm:max-h-175">{activeTab === "logs" ? (
                  <div className="space-y-3">
                    <LogToolbar
                      themeKey={themeKey}
                      sizeKey={sizeKey}
                      decorationsEnabled={decorationsEnabled}
                      onThemeChange={setTheme}
                      onSizeChange={setSize}
                      onDecorationsChange={setDecorations}
                      onReset={resetToDefault}
                      className="mb-4"
                    />
                    {logs.length === 0 && !(isSubmitting || isStreaming) ? (
                      <p className="text-center text-lg text-emerald-300/50 py-8">
                        Logs will appear here after you start a scan.
                      </p>
                    ) : (
                      <>
                        {logs.map((entry) => (
                          <div
                            key={entry.id}
                            className={`rounded-lg border px-4 py-3 leading-snug font-bold font-[Consolas,monospace] text-base sm:text-lg transition-all duration-200 ${
                              entry.tone === "danger"
                                ? "border-red-500/40 bg-red-500/10 text-red-200"
                                : entry.tone === "success"
                                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                                  : entry.tone === "warning"
                                    ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                                    : "border-emerald-400/20 bg-emerald-950/40 text-emerald-100/90"
                            }`}
                            style={{ fontSize: `${logSize.xtermFontSize}px` }}
                          >
                            <span className="mr-2 text-emerald-500/60">[{entry.createdAt}]</span>
                            <span className="font-bold text-emerald-300">{entry.event}</span>
                            {" — "}
                            <span className="text-emerald-100/85">{entry.message}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {isStreaming ? (
                      <div className="flex items-center gap-2 text-base text-emerald-300 pt-4 animate-pulse">
                        <LoaderCircle size={14} className="animate-spin" />
                        <span className="font-semibold">Streaming in progress...</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {activeTab === "findings" ? (
                  <div className="space-y-3">
                    {findings.length === 0 ? (
                      <p className="text-center text-lg text-emerald-300/50 py-8">
                        No findings yet. Discoveries will appear after the scan completes.
                      </p>
                    ) : (
                      findings.map((finding) => (
                        <div
                          key={finding.finding_id}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-950/35 p-4 hover:bg-emerald-950/50 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-emerald-50">
                                {finding.title || finding.fingerprint || "Untitled Finding"}
                              </h4>
                              <p className="mt-2 text-base text-emerald-300/70 font-mono">
                                {finding.host}
                                {finding.port ? `:${finding.port}` : ""}
                                {finding.protocol ? ` (${finding.protocol})` : ""}
                              </p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap ${severityTone(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                          {finding.description ? (
                            <p className="mt-3 text-base text-emerald-100/80 leading-relaxed">{finding.description}</p>
                          ) : null}
                          {finding.remediation ? (
                            <div className="mt-3 pt-3 border-t border-emerald-400/10">
                              <p className="text-base text-emerald-300/80">
                                <span className="font-bold">Remediation:</span> {finding.remediation}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {activeTab === "parsed" ? (
                  <div>
                    {!parsedData ? (
                      <p className="text-center text-lg text-emerald-300/50 py-8">
                        Parsed data will appear after the scan completes.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {parsedData.tool_name ? (
                          <p className="text-base text-emerald-300/70">
                            <span className="font-bold text-emerald-200">Tool:</span> <span className="font-mono text-emerald-100">{parsedData.tool_name}</span>
                            {parsedData.parse_method ? ` • <span className="font-bold">Method:</span> ${parsedData.parse_method}` : ""}
                          </p>
                        ) : null}

                        {parsedColumns.length > 0 && parsedData.data && parsedData.data.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border border-emerald-400/20 bg-emerald-950/30">
                            <table className="w-full text-left text-base">
                              <thead className="border-b border-emerald-400/20 bg-emerald-950/40">
                                <tr>
                                  {parsedColumns.map((col) => (
                                    <th key={col.key} className="px-3 py-3 font-bold text-emerald-200">
                                      {col.label || col.key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {parsedData.data.map((row, index) => (
                                  <tr key={index} className="border-b border-emerald-400/10 hover:bg-emerald-950/50 transition-colors">
                                    {parsedColumns.map((col) => (
                                      <td key={col.key} className="px-3 py-3 text-emerald-100/80 font-mono text-base">
                                        {String(row[col.key] ?? "")}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : parsedData.lines && parsedData.lines.length > 0 ? (
                          <pre className="max-h-96 overflow-auto rounded-lg border border-emerald-400/20 bg-emerald-950/30 p-4 text-base leading-relaxed font-mono text-emerald-100/85 whitespace-pre-wrap wrap-break-word">
                            {parsedData.lines.join("\n")}
                          </pre>
                        ) : (
                          <p className="text-lg text-emerald-300/50">No structured data available.</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                {activeTab === "raw" ? (
                  <div>
                    {rawLines.length === 0 ? (
                      <p className="text-center text-lg text-emerald-300/50 py-8">
                        Raw output will appear here during the scan.
                      </p>
                    ) : (
                      <pre className="max-h-125 overflow-auto whitespace-pre-wrap rounded-lg border border-emerald-400/20 bg-emerald-950/30 p-4 text-base leading-relaxed font-mono text-emerald-100/85 wrap-break-word">
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
