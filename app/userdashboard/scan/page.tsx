"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronsRight,
  Circle,
  FileText,
  Loader2,
  Plus,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  SquareTerminal,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ScanMode = "basic" | "medium" | "advanced";
type OptionScalar = string | number | boolean;
type OptionValue = OptionScalar | OptionScalar[];

type Project = {
  project_id: string;
  name: string;
  description?: string | null;
};

type InputField = {
  key: string;
  type: string;
  required?: boolean | null;
  flag?: string | null;
  description?: string | null;
};

type ToolOption = {
  key: string;
  flag: string;
  type: "integer" | "string" | "boolean" | "array" | string;
  required?: boolean | null;
  description?: string | null;
};

type ScanPreset = {
  name: string;
  description?: string | null;
  flags?: string[];
};

type Tool = {
  tool_id: string;
  tool_name: string;
  category_name?: string | null;
  tool_description?: string | null;
  is_active: boolean;
  input_schema?: {
    fields?: InputField[];
  } | null;
  scan_config?: {
    basic?: { presets?: ScanPreset[] };
    medium?: { options?: ToolOption[] };
    advanced?: { options?: ToolOption[] };
  } | null;
};

type ScanStep = {
  step_id: string;
  tool_name: string;
  step_order: number;
  status: string;
  findings_count?: number;
};

type JobStatus = {
  job_id: string;
  project_id: string;
  status: string;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  pending_steps: number;
  total_findings?: number;
  steps?: ScanStep[];
};

type ParsedData = {
  step_id: string;
  job_id: string;
  tool_name: string;
  columns?: { key: string; label?: string }[];
  discovered_columns?: { key: string; label?: string }[];
  data?: Record<string, unknown>[];
  lines?: string[];
  findings_count?: number;
};

type JobParsedData = {
  job_id: string;
  total_steps: number;
  steps: ParsedData[];
};

type MediumStepState = {
  id: string;
  toolId: string;
  options: Record<string, string | boolean>;
  timeout: string;
};

type LogLine = {
  id: string;
  source: ScanMode | "system";
  level: string;
  text: string;
  timestamp: string;
};

type Warning = {
  id: string;
  message: string;
  suggestion?: string;
};

type ActiveRun = {
  mode: ScanMode;
  jobId?: string;
  stepId?: string;
  status: string;
  findings: number;
  steps: ScanStep[];
  parsedSteps: ParsedData[];
};

type SseEvent = {
  event: string;
  data: unknown;
};

const terminalStatuses = new Set([
  "JOB_STATUS_COMPLETED",
  "JOB_STATUS_FAILED",
  "JOB_STATUS_CANCELLED",
  "JOB_STATUS_PARTIAL",
  "STEP_STATUS_COMPLETED",
  "STEP_STATUS_FAILED",
  "STEP_STATUS_CANCELLED",
]);

const preferredTargetKeys = ["target", "domain", "host", "url", "ip", "cidr", "network"];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function normalizeFlag(value?: string | null) {
  return (value ?? "").trim().replace(/^--?/, "").toLowerCase();
}

function isTargetLike(value: string) {
  const token = value.trim().replace(/^["']|["']$/g, "");
  return /^https?:\/\//i.test(token) || token.includes(".") || token.includes(":") || /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(token);
}

function tokenLooksLikeBoolean(value?: string) {
  if (!value) return false;
  return ["true", "false", "1", "0", "yes", "no"].includes(value.toLowerCase());
}

function parseJsonMaybe(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatPayloadLine(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const line = data.line ?? data.message ?? data.error ?? data.status ?? data.type;
    if (typeof line === "string") return line;
    return JSON.stringify(data);
  }
  return String(payload ?? "");
}

function logFromPayload(mode: ScanMode | "system", event: string, payload: unknown): LogLine {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const timestamp = typeof data.timestamp === "string" ? data.timestamp : new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random()}`,
    source: mode,
    level: event,
    text: formatPayloadLine(payload),
    timestamp,
  };
}

function splitUnixCommandPipeline(raw: string): string[][] {
  const command = raw.trim();
  if (!command) return [];

  const segments: string[][] = [];
  let current: string[] = [];
  let buffer = "";
  let tokenStarted = false;
  let inSingle = false;
  let inDouble = false;
  let escaping = false;

  const flushToken = () => {
    if (!tokenStarted) return;
    current.push(buffer);
    buffer = "";
    tokenStarted = false;
  };

  const flushSegment = () => {
    flushToken();
    if (!current.length) {
      throw new Error("Command contains an empty pipeline segment.");
    }
    segments.push(current);
    current = [];
  };

  for (const char of command) {
    if (escaping) {
      buffer += char;
      tokenStarted = true;
      escaping = false;
      continue;
    }
    if (inSingle) {
      if (char === "'") inSingle = false;
      else buffer += char;
      tokenStarted = true;
      continue;
    }
    if (inDouble) {
      if (char === '"') inDouble = false;
      else if (char === "\\") escaping = true;
      else buffer += char;
      tokenStarted = true;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      tokenStarted = true;
    } else if (char === "'") {
      inSingle = true;
      tokenStarted = true;
    } else if (char === '"') {
      inDouble = true;
      tokenStarted = true;
    } else if (char === "|") {
      flushSegment();
    } else if (/\s/.test(char)) {
      flushToken();
    } else {
      buffer += char;
      tokenStarted = true;
    }
  }

  if (escaping || inSingle || inDouble) {
    throw new Error("Command contains an unterminated quote or escape.");
  }
  flushSegment();
  return segments;
}

function analyzeAdvancedCommand(command: string, tools: Tool[]): Warning[] {
  const warnings: Warning[] = [];
  if (!command.trim()) return warnings;

  let segments: string[][];
  try {
    segments = splitUnixCommandPipeline(command);
  } catch (error) {
    warnings.push({
      id: "syntax",
      message: error instanceof Error ? error.message : "Command syntax could not be parsed.",
    });
    return warnings;
  }

  const first = segments[0];
  const tool = tools.find((item) => normalizeName(item.tool_name) === normalizeName(first[0]));
  if (!tool) {
    warnings.push({
      id: "tool",
      message: `The first command "${first[0]}" is not in the active tool list, so the backend may reject it.`,
    });
    return warnings;
  }

  const inputFields = tool.input_schema?.fields ?? [];
  const inputByFlag = new Map(inputFields.filter((field) => field.flag).map((field) => [normalizeFlag(field.flag), field]));
  const positionalFields = inputFields.filter((field) => field.key && !field.flag);
  const knownOptions = [...(tool.scan_config?.medium?.options ?? []), ...(tool.scan_config?.advanced?.options ?? [])];
  const optionByFlag = new Map(knownOptions.filter((option) => option.flag).map((option) => [normalizeFlag(option.flag), option]));
  const args: Record<string, string> = {};
  const positionals: string[] = [];
  let targetConsumedByUnknownFlag = "";
  let unknownFlag = "";

  for (let i = 1; i < first.length; i += 1) {
    const token = first[i];
    const equalIndex = token.indexOf("=");
    const flagToken = equalIndex >= 0 ? token.slice(0, equalIndex) : token;
    let flagValue = equalIndex >= 0 ? token.slice(equalIndex + 1) : "";

    if (flagToken.startsWith("-")) {
      const normalized = normalizeFlag(flagToken);
      const input = inputByFlag.get(normalized);
      if (input) {
        if (!flagValue && i + 1 < first.length) {
          i += 1;
          flagValue = first[i];
        }
        if (flagValue) args[input.key] = flagValue;
        continue;
      }

      const option = optionByFlag.get(normalized);
      if (option) {
        if (!flagValue && option.type === "boolean") {
          if (tokenLooksLikeBoolean(first[i + 1])) {
            i += 1;
          }
          continue;
        }
        if (!flagValue && i + 1 < first.length) {
          i += 1;
        }
        continue;
      }

      if (!flagValue && i + 1 < first.length && !first[i + 1].startsWith("-")) {
        const next = first[i + 1];
        if (isTargetLike(next)) {
          targetConsumedByUnknownFlag = next;
          unknownFlag = flagToken;
        }
        i += 1;
      }
      continue;
    }

    positionals.push(token);
  }

  positionalFields.forEach((field, index) => {
    if (positionals[index]) args[field.key] = positionals[index];
  });

  const derivedTarget =
    preferredTargetKeys.map((key) => args[key]).find((value) => value?.trim()) ??
    Object.values(args).find((value) => value?.trim()) ??
    "";

  if (!derivedTarget) {
    warnings.push({
      id: "target",
      message: `The backend may not derive a target from the first ${tool.tool_name} step.`,
      suggestion: `Try placing the target where ${tool.tool_name} expects it, often right after the tool name or after its target flag.`,
    });
  }

  if (targetConsumedByUnknownFlag) {
    const rest = first.slice(1).filter((part) => part !== targetConsumedByUnknownFlag);
    warnings.push({
      id: "flag-target",
      message: `"${targetConsumedByUnknownFlag}" appears after unknown flag "${unknownFlag}", so the scan engine may treat it as that flag's value instead of the target.`,
      suggestion: `${first[0]} ${targetConsumedByUnknownFlag} ${rest.join(" ")}`.trim(),
    });
  }

  return warnings;
}

function parseSseBlock(block: string): SseEvent | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim() || "message";
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (!dataLines.length) return null;
  return { event, data: parseJsonMaybe(dataLines.join("\n")) };
}

async function readSseResponse(response: Response, onEvent: (event: SseEvent) => void) {
  if (!response.body) throw new Error("Response did not include a stream body.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\n\n|\r\n\r\n/);
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed) onEvent(parsed);
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseBlock(buffer);
    if (parsed) onEvent(parsed);
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? body?.error ?? response.statusText;
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg ?? String(item)).join(", ") : String(detail));
  }

  return response.json() as Promise<T>;
}

function statusTone(status: string) {
  if (status.includes("FAILED") || status.includes("CANCELLED")) return "text-red-500";
  if (status.includes("COMPLETED")) return "text-green-500";
  if (status.includes("RUNNING") || status.includes("PROCESSING")) return "text-blue-500";
  return "text-amber-500";
}

function AdvancedTerminalPanel({
  projectId,
  selectedProject,
  tools,
  logs,
  run,
  errors,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  projectId: string;
  selectedProject: Project | undefined;
  tools: Tool[];
  logs: LogLine[];
  run: ActiveRun;
  errors: string[];
  isSubmitting: boolean;
  onSubmit: (command: string) => void;
  onReset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<{ write: (s: string) => void; dispose: () => void } | null>(null);
  const commandRef = useRef("");
  const logCursorRef = useRef(0);
  const isInputActiveRef = useRef(true);
  const selectedProjectRef = useRef(selectedProject);
  const onSubmitRef = useRef(onSubmit);
  const prevStepsRef = useRef<ScanStep[]>([]);
  const prevStatusRef = useRef("idle");

  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  const getPrompt = useCallback(() => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    return `\r\n\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m`;
  }, []);

  // Boot terminal once
  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function boot() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 13,
        scrollback: 5000,
        theme: {
          background: "#080d14",
          foreground: "#e2e8f0",
          cursor: "#2dd4bf",
          cursorAccent: "#080d14",
          selectionBackground: "#134e4a",
          black: "#1e293b",
          red: "#f87171",
          green: "#4ade80",
          yellow: "#facc15",
          blue: "#60a5fa",
          magenta: "#c084fc",
          cyan: "#2dd4bf",
          white: "#e2e8f0",
          brightBlack: "#475569",
          brightCyan: "#5eead4",
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      // Banner
      term.write("\x1b[1m\x1b[36m  ╔══════════════════════════════════════════╗\r\n");
      term.write("  ║    auto-offensive  ·  advanced  scan    ║\r\n");
      term.write("  ╚══════════════════════════════════════════╝\x1b[0m\r\n");
      term.write("\x1b[90m  Type a command and press Enter to run it.\r\n");
      term.write("  Example: nmap example.com -sV | nuclei\r\n");
      term.write("  Ctrl+C to reset.\x1b[0m");
      term.write(getPrompt());

      term.onData((data) => {
        if (data === "\x03") {
          // Ctrl+C
          commandRef.current = "";
          isInputActiveRef.current = true;
          term.write("^C");
          term.write(getPrompt());
          return;
        }
        if (!isInputActiveRef.current) return;
        if (data === "\r") {
          const cmd = commandRef.current.trim();
          term.write("\r\n");
          if (cmd) {
            isInputActiveRef.current = false;
            commandRef.current = "";
            onSubmitRef.current(cmd);
          } else {
            term.write(getPrompt());
          }
          return;
        }
        if (data === "\u007f") {
          if (!commandRef.current.length) return;
          commandRef.current = commandRef.current.slice(0, -1);
          term.write("\b \b");
          return;
        }
        if (data >= " " && data !== "\u007f") {
          commandRef.current += data;
          term.write(data);
        }
      });

      ro = new ResizeObserver(() => fitAddon.fit());
      const parent = containerRef.current.parentElement;
      if (parent) ro.observe(parent);
      termRef.current = term;
    }

    boot();
    return () => {
      disposed = true;
      ro?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write new log lines into terminal as they arrive
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    if (logs.length === 0) {
      logCursorRef.current = 0;
      return;
    }
    const newLines = logs.slice(logCursorRef.current);
    if (!newLines.length) return;
    logCursorRef.current = logs.length;
    newLines.forEach((line) => {
      const time = new Date(line.timestamp).toLocaleTimeString();
      let col = "\x1b[90m";
      const lvl = line.level.toLowerCase();
      if (lvl.includes("error") || lvl.includes("fail")) col = "\x1b[31m";
      else if (lvl.includes("warn")) col = "\x1b[33m";
      else if (lvl === "done" || lvl === "submitted") col = "\x1b[36m";
      else if (lvl === "log") col = "\x1b[32m";
      term.write(`\r\x1b[90m[${time}]\x1b[0m \x1b[36m[${line.source}]\x1b[0m ${col}${line.text}\x1b[0m\r\n`);
    });
  }, [logs]);

  // Write errors
  const prevErrorsLenRef = useRef(0);
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const newErrs = errors.slice(prevErrorsLenRef.current);
    if (!newErrs.length) return;
    prevErrorsLenRef.current = errors.length;
    newErrs.forEach((e) => term.write(`\r\x1b[1m\x1b[31m[ERROR] ${e}\x1b[0m\r\n`));
  }, [errors]);

  // Announce step transitions
  useEffect(() => {
    const term = termRef.current;
    if (!term || !run.steps.length) return;
    const prevIds = new Set(prevStepsRef.current.map((s) => s.step_id));
    run.steps
      .filter((s) => !prevIds.has(s.step_id))
      .forEach((s) =>
        term.write(`\r\x1b[1m\x1b[34m── Step ${s.step_order}: ${s.tool_name} ──\x1b[0m\r\n`),
      );
    prevStepsRef.current = run.steps;
  }, [run.steps]);

  // React to job status changes
  useEffect(() => {
    const term = termRef.current;
    const status = run.status;
    if (!term || status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    if (status === "submitting") {
      term.write(`\r\x1b[36m→ Submitting scan…\x1b[0m\r\n`);
    } else if (status.includes("COMPLETED")) {
      term.write(`\r\x1b[1m\x1b[32m✓ Scan completed — findings: ${run.findings}\x1b[0m`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("FAILED")) {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("CANCELLED") || status.includes("PARTIAL")) {
      term.write(
        `\r\x1b[1m\x1b[33m⚠ Scan ${status.replace("JOB_STATUS_", "").toLowerCase()}.\x1b[0m`,
      );
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "failed") {
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "idle") {
      // Reset: add separator + prompt
      prevStepsRef.current = [];
      prevErrorsLenRef.current = 0;
      isInputActiveRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.status, run.findings]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-800 bg-[#080d14] shadow-xl"
    >
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="font-mono text-xs text-gray-400">
            {selectedProject ? `${selectedProject.name}@auto-offensive` : "auto-offensive"} — advanced scan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSubmitting && (
            <span className="flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-400">
              <Loader2 size={11} className="animate-spin" /> Running
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              onReset();
              isInputActiveRef.current = true;
              prevStepsRef.current = [];
              prevErrorsLenRef.current = 0;
              prevStatusRef.current = "idle";
              const term = termRef.current;
              if (term) {
                term.write("\r\n\x1b[90m── reset ──\x1b[0m");
                term.write(getPrompt());
              }
            }}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            title="Reset console"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {!projectId && (
        <div className="border-b border-gray-800 bg-amber-950/30 px-4 py-2.5 text-xs text-amber-400">
          ⚠ Select a project above before running a scan.
        </div>
      )}

      <div ref={containerRef} className="h-[560px] overflow-hidden" />
    </motion.section>
  );
}

export default function ScanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [projectId, setProjectId] = useState("");
  const [activeTab, setActiveTab] = useState<ScanMode>("basic");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [basicTarget, setBasicTarget] = useState("");
  const [basicToolId, setBasicToolId] = useState("");
  const [basicPreset, setBasicPreset] = useState("");

  const [mediumTarget, setMediumTarget] = useState("");
  const [mediumSteps, setMediumSteps] = useState<MediumStepState[]>([]);

  const [advancedCommand, setAdvancedCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [run, setRun] = useState<ActiveRun>({
    mode: "basic",
    status: "idle",
    findings: 0,
    steps: [],
    parsedSteps: [],
  });
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamStepRef = useRef("");

  const basicTools = useMemo(
    () => tools.filter((tool) => (tool.scan_config?.basic?.presets?.length ?? 0) > 0),
    [tools],
  );
  const mediumTools = useMemo(
    () => tools.filter((tool) => (tool.scan_config?.medium?.options ?? []).length >= 0),
    [tools],
  );
  const selectedBasicTool = basicTools.find((tool) => tool.tool_id === basicToolId);
  const selectedProject = projects.find((project) => project.project_id === projectId);
  const advancedWarnings = useMemo(() => analyzeAdvancedCommand(advancedCommand, tools), [advancedCommand, tools]);

  const appendLog = useCallback((line: LogLine) => {
    setLogs((current) => [...current.slice(-399), line]);
  }, []);

  const resetRun = useCallback((mode: ScanMode) => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    streamStepRef.current = "";
    setLogs([]);
    setErrors([]);
    setRun({ mode, status: "idle", findings: 0, steps: [], parsedSteps: [] });
  }, []);

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
        setProjectId((current) => current || projectData[0]?.project_id || "");
        const firstBasicTool = toolData.find((tool) => (tool.scan_config?.basic?.presets?.length ?? 0) > 0);
        setBasicToolId((current) => current || firstBasicTool?.tool_id || "");
        const firstMediumTool = toolData[0];
        setMediumSteps((current) =>
          current.length ? current : [{ id: crypto.randomUUID(), toolId: firstMediumTool?.tool_id ?? "", options: {}, timeout: "" }],
        );
      } catch (error) {
        if (!cancelled) setMetaError(error instanceof Error ? error.message : "Failed to load scan metadata.");
      } finally {
        if (!cancelled) setLoadingMeta(false);
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
      if (current && presets.some((preset) => preset.name === current)) return current;
      return presets[0]?.name ?? "";
    });
  }, [selectedBasicTool]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const fetchParsedData = useCallback(async (mode: "medium" | "advanced", jobId: string) => {
    try {
      const parsed = await fetchJson<JobParsedData>(`/scans/${mode}/jobs/${jobId}/parsed-data`);
      setRun((current) => ({
        ...current,
        parsedSteps: parsed.steps ?? [],
      }));
    } catch {
      // Parsed data is only available after tools produce structured output.
    }
  }, []);

  const openStepStream = useCallback(
    (mode: "medium" | "advanced", stepId: string) => {
      if (!stepId || streamStepRef.current === stepId) return;
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
      source.addEventListener("stream-error", (event) => handleEvent("stream-error", event as MessageEvent));
      source.onerror = () => {
        setErrors((current) => [...current.slice(-4), "Log stream disconnected or could not be opened."]);
      };
    },
    [appendLog],
  );

  const watchJob = useCallback(
    (mode: "medium" | "advanced", jobId: string, initialStepId: string) => {
      openStepStream(mode, initialStepId);
      if (pollRef.current) clearInterval(pollRef.current);

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

          if (activeStep?.step_id) openStepStream(mode, activeStep.step_id);
          if (job.status.includes("COMPLETED") || job.status.includes("FAILED") || job.status.includes("CANCELLED") || job.status.includes("PARTIAL")) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            eventSourceRef.current?.close();
            fetchParsedData(mode, jobId);
          }
        } catch (error) {
          setErrors((current) => [...current.slice(-4), error instanceof Error ? error.message : "Failed to refresh job status."]);
        }
      }, 2500);
    },
    [fetchParsedData, openStepStream],
  );

  const handleBasicEvent = useCallback(
    (event: SseEvent) => {
      const payload = event.data && typeof event.data === "object" ? (event.data as Record<string, unknown>) : {};
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

      if (!["ping"].includes(event.event)) {
        appendLog(logFromPayload("basic", event.event, event.data));
      }
    },
    [appendLog],
  );

  async function submitBasic() {
    if (!projectId || !selectedBasicTool || !basicTarget.trim()) return;
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
      setErrors((current) => [...current, error instanceof Error ? error.message : "Basic scan failed."]);
      setRun((current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitMedium() {
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
    setRun((current) => ({ ...current, mode: "medium", status: "submitting" }));

    try {
      const submit = await fetchJson<{ job_id: string; step_id: string; status: string }>("/scans/medium/submit", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          target_value: mediumTarget.trim(),
          steps,
          execution_mode: "WEB",
        }),
      });
      setRun((current) => ({
        ...current,
        jobId: submit.job_id,
        stepId: submit.step_id,
        status: submit.status,
      }));
      appendLog(logFromPayload("system", "submitted", { message: `Medium scan submitted for ${mediumTarget.trim()}` }));
      watchJob("medium", submit.job_id, submit.step_id);
    } catch (error) {
      setErrors((current) => [...current, error instanceof Error ? error.message : "Medium scan failed."]);
      setRun((current) => ({ ...current, status: "failed" }));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitAdvanced = useCallback(
    async (command: string) => {
      const finalCommand = command.trim();
      setAdvancedCommand(finalCommand);
      if (!projectId || !finalCommand) return;
      resetRun("advanced");
      setIsSubmitting(true);
      setRun((current) => ({ ...current, mode: "advanced", status: "submitting" }));
      analyzeAdvancedCommand(finalCommand, tools).forEach((warning) => {
        appendLog(logFromPayload("system", "warning", { message: warning.message }));
      });

      try {
        const submit = await fetchJson<{ job_id: string; step_id: string; status: string }>("/scans/advanced/submit", {
          method: "POST",
          body: JSON.stringify({
            project_id: projectId,
            command: finalCommand,
            execution_mode: "web",
          }),
        });
        setRun((current) => ({
          ...current,
          jobId: submit.job_id,
          stepId: submit.step_id,
          status: submit.status,
        }));
        appendLog(logFromPayload("system", "submitted", { message: `Advanced command submitted: ${finalCommand}` }));
        watchJob("advanced", submit.job_id, submit.step_id);
      } catch (error) {
        setErrors((current) => [...current, error instanceof Error ? error.message : "Advanced scan failed."]);
        setRun((current) => ({ ...current, status: "failed" }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [appendLog, projectId, resetRun, tools, watchJob],
  );

  function updateMediumStep(id: string, patch: Partial<MediumStepState>) {
    setMediumSteps((current) => current.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  }

  function updateMediumOption(stepId: string, key: string, value: string | boolean) {
    setMediumSteps((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, options: { ...step.options, [key]: value } } : step,
      ),
    );
  }

  function addMediumStep() {
    setMediumSteps((current) => [
      ...current,
      { id: crypto.randomUUID(), toolId: tools[0]?.tool_id ?? "", options: {}, timeout: "" },
    ]);
  }

  function removeMediumStep(id: string) {
    setMediumSteps((current) => (current.length <= 1 ? current : current.filter((step) => step.id !== id)));
  }

  const canSubmitBasic = Boolean(projectId && selectedBasicTool && basicTarget.trim() && !isSubmitting);
  const canSubmitMedium = Boolean(projectId && mediumTarget.trim() && mediumSteps.some((step) => step.toolId) && !isSubmitting);
  const canSubmitAdvanced = Boolean(projectId && advancedCommand.trim() && !isSubmitting);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">New Scan</h1>
          <p className="mt-1 text-[16px] text-gray-500 dark:text-gray-400">
            Launch Basic, Medium, or Advanced scans and watch live logs as they run.
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetRun(activeTab)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RotateCcw size={16} />
          Reset Console
        </button>
      </div>

      {metaError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {metaError}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Project</label>
        <select
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          disabled={loadingMeta}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >
          <option value="">{loadingMeta ? "Loading projects..." : "Select a project"}</option>
          {projects.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.name}
            </option>
          ))}
        </select>
        {selectedProject && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Scans will be saved under {selectedProject.name}.
          </p>
        )}
      </div>

      <div className={classNames("grid gap-5", activeTab !== "advanced" && "xl:grid-cols-[minmax(0,1.25fr)_minmax(390px,0.75fr)]")}>
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "basic" as const, label: "Basic", icon: ScanLine },
                { id: "medium" as const, label: "Medium", icon: Wrench },
                { id: "advanced" as const, label: "Advanced", icon: SquareTerminal },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setRun((current) => ({ ...current, mode: tab.id }));
                  }}
                  className={classNames(
                    "flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition",
                    activeTab === tab.id
                      ? "bg-teal-500 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                  )}
                >
                  <tab.icon size={17} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "basic" && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                  <ScanLine size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Scan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose one provided preset for a supported tool.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Target">
                  <input
                    value={basicTarget}
                    onChange={(event) => setBasicTarget(event.target.value)}
                    placeholder="example.com, https://example.com, 10.0.0.0/24"
                    className="scan-input"
                  />
                </Field>
                <Field label="Tool">
                  <select value={basicToolId} onChange={(event) => setBasicToolId(event.target.value)} className="scan-input">
                    <option value="">Select tool</option>
                    {basicTools.map((tool) => (
                      <option key={tool.tool_id} value={tool.tool_id}>
                        {tool.tool_name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Preset</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedBasicTool?.scan_config?.basic?.presets ?? []).map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setBasicPreset(preset.name)}
                      className={classNames(
                        "rounded-lg border p-4 text-left transition",
                        basicPreset === preset.name
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-900 dark:text-white">{preset.name}</span>
                        {basicPreset === preset.name && <CheckCircle2 className="text-teal-500" size={18} />}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{preset.description || "Provided scan preset"}</p>
                      {!!preset.flags?.length && <p className="mt-2 font-mono text-xs text-gray-400">{preset.flags.join(" ")}</p>}
                    </button>
                  ))}
                </div>
              </div>

              <SubmitButton disabled={!canSubmitBasic} onClick={submitBasic} label="Start Basic Scan" />
            </motion.section>
          )}

          {activeTab === "medium" && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Medium Scan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chain tools with allowed options from the tool metadata.</p>
                  </div>
                </div>
                <button type="button" onClick={addMediumStep} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900">
                  <Plus size={16} />
                  Add Step
                </button>
              </div>

              <Field label="Target">
                <input
                  value={mediumTarget}
                  onChange={(event) => setMediumTarget(event.target.value)}
                  placeholder="example.com or https://example.com"
                  className="scan-input"
                />
              </Field>

              <div className="mt-5 space-y-4">
                {mediumSteps.map((step, index) => {
                  const tool = tools.find((item) => item.tool_id === step.toolId);
                  const options = tool?.scan_config?.medium?.options ?? [];
                  return (
                    <div key={step.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{index + 1}</span>
                          {index > 0 && <ChevronsRight size={16} className="text-gray-400" />}
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pipeline Step</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMediumStep(step.id)}
                          disabled={mediumSteps.length <= 1}
                          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tool">
                          <select
                            value={step.toolId}
                            onChange={(event) => updateMediumStep(step.id, { toolId: event.target.value, options: {} })}
                            className="scan-input"
                          >
                            <option value="">Select tool</option>
                            {mediumTools.map((item) => (
                              <option key={item.tool_id} value={item.tool_id}>
                                {item.tool_name}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Timeout seconds">
                          <input
                            type="number"
                            min={1}
                            value={step.timeout}
                            onChange={(event) => updateMediumStep(step.id, { timeout: event.target.value })}
                            placeholder="Optional"
                            className="scan-input"
                          />
                        </Field>
                      </div>

                      {!!options.length && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {options.map((option) => (
                            <ToolOptionField
                              key={option.key}
                              option={option}
                              value={step.options[option.key]}
                              onChange={(value) => updateMediumOption(step.id, option.key, value)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <SubmitButton disabled={!canSubmitMedium} onClick={submitMedium} label="Start Medium Scan" />
            </motion.section>
          )}

          {activeTab === "advanced" && (
            <AdvancedTerminalPanel
              projectId={projectId}
              selectedProject={selectedProject}
              tools={tools}
              logs={logs}
              run={run}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={submitAdvanced}
              onReset={() => resetRun("advanced")}
            />
          )}
        </div>

        {activeTab !== "advanced" && <LiveConsole run={run} logs={logs} errors={errors} />}
      </div>

      <style jsx>{`
        :global(.scan-input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
          outline: none;
        }
        :global(.dark .scan-input) {
          border-color: rgb(31 41 55);
          background: rgb(3 7 18);
          color: white;
        }
        :global(.scan-input:focus) {
          box-shadow: 0 0 0 2px rgb(20 184 166);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
      {children}
    </label>
  );
}

function ToolOptionField({
  option,
  value,
  onChange,
}: {
  option: ToolOption;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  if (option.type === "boolean") {
    return (
      <label className="flex min-h-[72px] items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{option.key}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{option.flag} {option.description ?? ""}</p>
        </div>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-teal-500"
        />
      </label>
    );
  }

  return (
    <Field label={`${option.key}${option.required ? " *" : ""}`}>
      <input
        type={option.type === "integer" ? "number" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`${option.flag}${option.description ? ` - ${option.description}` : ""}`}
        className="scan-input"
      />
    </Field>
  );
}

function SubmitButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-teal-500/20 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Play size={17} />
      {label}
    </button>
  );
}

function LiveConsole({ run, logs, errors }: { run: ActiveRun; logs: LogLine[]; errors: string[] }) {
  const visibleParsed = run.parsedSteps.find((step) => (step.data?.length ?? 0) > 0) ?? run.parsedSteps[0];
  const columns = [...(visibleParsed?.columns ?? []), ...(visibleParsed?.discovered_columns ?? [])].slice(0, 6);
  const rows = visibleParsed?.data?.slice(0, 8) ?? [];

  return (
    <aside className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950 text-teal-300 dark:bg-white dark:text-gray-950">
              <Radio size={19} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Live Output</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{run.jobId || "No active job"}</p>
            </div>
          </div>
          <span className={classNames("text-xs font-bold uppercase", statusTone(run.status))}>{run.status}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Mode" value={run.mode} />
          <Metric label="Steps" value={String(run.steps.length || 0)} />
          <Metric label="Findings" value={String(run.findings || 0)} />
        </div>

        {!!run.steps.length && (
          <div className="mt-4 space-y-2">
            {run.steps.map((step) => (
              <div key={step.step_id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-950">
                <div className="flex items-center gap-2">
                  {step.status.includes("COMPLETED") ? (
                    <CheckCircle2 size={15} className="text-green-500" />
                  ) : step.status.includes("FAILED") ? (
                    <XCircle size={15} className="text-red-500" />
                  ) : step.step_id === run.stepId ? (
                    <Loader2 size={15} className="animate-spin text-blue-500" />
                  ) : (
                    <Circle size={15} className="text-gray-400" />
                  )}
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{step.tool_name}</span>
                </div>
                <span className={classNames("text-xs", statusTone(step.status))}>{step.status.replace("STEP_STATUS_", "")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!!errors.length && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300">
            <AlertTriangle size={16} />
            Scan Errors
          </div>
          <div className="space-y-1 text-sm text-red-700 dark:text-red-300">
            {errors.slice(-5).map((error, index) => (
              <p key={`${error}-${index}`}>{error}</p>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-[#020617] p-4 text-gray-200 shadow-sm dark:border-gray-800">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Bot size={16} className="text-teal-300" />
          Stream Logs
        </div>
        <div className="h-[360px] overflow-auto font-mono text-xs leading-5">
          {!logs.length && <p className="text-gray-500">Logs will appear here when a scan starts.</p>}
          {logs.map((line) => (
            <p key={line.id} className="break-words">
              <span className="text-gray-500">{new Date(line.timestamp).toLocaleTimeString()}</span>{" "}
              <span className="text-teal-300">[{line.source}]</span>{" "}
              <span className="text-blue-300">{line.level}</span> {line.text}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={17} className="text-teal-500" />
          <h2 className="font-bold text-gray-900 dark:text-white">Parsed Results</h2>
        </div>
        {!visibleParsed && <p className="text-sm text-gray-500 dark:text-gray-400">Structured rows will appear after parsers produce output.</p>}
        {visibleParsed && !rows.length && (
          <div className="space-y-2 font-mono text-xs text-gray-500 dark:text-gray-400">
            {(visibleParsed.lines ?? []).slice(0, 8).map((line, index) => (
              <p key={`${line}-${index}`} className="break-words">{line}</p>
            ))}
          </div>
        )}
        {!!rows.length && (
          <div className="overflow-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {columns.map((column) => (
                    <th key={column.key} className="px-2 py-2 font-bold text-gray-600 dark:text-gray-300">{column.label || column.key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800/70">
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-[150px] truncate px-2 py-2 text-gray-600 dark:text-gray-400">
                        {String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold capitalize text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
