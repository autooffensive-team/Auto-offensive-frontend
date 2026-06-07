import type { LogLine, ScanMode, SseEvent, Tool, Warning } from "@/types/scan";

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeFlag(value?: string | null) {
  return (value ?? "").trim().replace(/^--?/, "").toLowerCase();
}

export function isTargetLike(value: string) {
  const token = value.trim().replace(/^["']|["']$/g, "");
  return (
    /^https?:\/\//i.test(token) ||
    token.includes(".") ||
    token.includes(":") ||
    /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(token)
  );
}

export function tokenLooksLikeBoolean(value?: string) {
  if (!value) return false;
  return ["true", "false", "1", "0", "yes", "no"].includes(value.toLowerCase());
}

export function parseJsonMaybe(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractErrorMessage(detail: unknown): string {
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
    if (nested !== undefined) return extractErrorMessage(nested);
    return JSON.stringify(data);
  }
  return String(detail ?? "");
}

export function formatPayloadLine(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const line = data.line ?? data.message ?? data.error ?? data.detail ?? data.status ?? data.type;
    if (typeof line === "string" && line.trim()) return line.trim();
    if (line != null && typeof line !== "object") return String(line);
    return JSON.stringify(data);
  }
  const text = String(payload ?? "").trim();
  return text;
}

/** Normalize FastAPI / gRPC error bodies into a single readable string. */
export function formatApiErrorDetail(detail: unknown): string {
  if (detail == null) return "Request failed.";
  if (typeof detail === "string") {
    return (
      detail
        .replace(/^invalid tools payload:\s*/i, "")
        .replace(/^rpc error: code = \w+ desc = /i, "")
        .replace(/^desc = /i, "")
        .trim() || "Request failed."
    );
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          const loc = Array.isArray(row.loc) ? row.loc.join(".") + ": " : "";
          return loc + String(row.msg ?? row.message ?? row.detail ?? JSON.stringify(row));
        }
        return String(item);
      })
      .filter(Boolean);
    return parts.join("; ") || "Request failed.";
  }
  if (typeof detail === "object") {
    const row = detail as Record<string, unknown>;
    if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
    if (typeof row.error === "string" && row.error.trim()) return row.error.trim();
    if (typeof row.detail === "string" && row.detail.trim()) return formatApiErrorDetail(row.detail);
    if (row.detail != null) return formatApiErrorDetail(row.detail);
  }
  return String(detail);
}

/** Extract a user-facing error from SSE payloads or thrown values. */
export function formatScanError(error: unknown): string {
  if (error instanceof Error) {
    return formatApiErrorDetail(error.message);
  }
  if (typeof error === "string") {
    return formatApiErrorDetail(error);
  }
  if (error && typeof error === "object") {
    const row = error as Record<string, unknown>;
    if (row.detail != null) return formatApiErrorDetail(row.detail);
    if (row.error != null) return formatApiErrorDetail(row.error);
    if (row.message != null) return formatApiErrorDetail(row.message);
    const fromPayload = formatPayloadLine(error);
    if (fromPayload && fromPayload !== "{}" && fromPayload !== "[object Object]") {
      return fromPayload;
    }
  }
  return "An unexpected error occurred.";
}

export function formatStepFailureMessage(step: {
  tool_name?: string;
  error_message?: string | null;
  exit_code?: number;
}): string {
  const tool = step.tool_name?.trim() || "Scan step";
  const reason = step.error_message?.trim();
  if (reason) {
    return `${tool}: ${reason}`;
  }
  if (typeof step.exit_code === "number" && step.exit_code !== 0) {
    return `${tool} exited with code ${step.exit_code}`;
  }
  return `${tool} failed`;
}

/** Pull actionable failure text from streamed system log payloads. */
export function extractStreamFailureLine(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  const source = String(data.source ?? "");
  const line = String(data.line ?? "").trim();
  if (!line) return null;
  const isSystem = /system|LOG_SOURCE_SYSTEM/i.test(source);
  const looksLikeFailure =
    /(?:^scan step failed:|policy rejected|invalid custom flag|tool exited with non-zero)/i.test(line);
  return isSystem && looksLikeFailure ? line : null;
}

export function logFromPayload(mode: ScanMode | "system", event: string, payload: unknown): LogLine {
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

export function splitUnixCommandPipeline(raw: string): string[][] {
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

export function analyzeAdvancedCommand(command: string, tools: Tool[]): Warning[] {
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

  const preferredTargetKeys = ["target", "domain", "host", "url", "ip", "cidr", "network"];
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

export function parseSseBlock(block: string): SseEvent | null {
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

export async function readSseResponse(response: Response, onEvent: (event: SseEvent) => void) {
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

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
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
    const detail = body?.detail ?? body?.error ?? body?.message ?? response.statusText;
    throw new Error(formatApiErrorDetail(detail));
  }

  return response.json() as Promise<T>;
}

export function statusTone(status: string) {
  if (status.includes("FAILED") || status.includes("CANCELLED")) return "text-red-500";
  if (status.includes("COMPLETED")) return "text-green-500";
  if (status.includes("RUNNING") || status.includes("PROCESSING")) return "text-blue-500";
  return "text-amber-500";
}
