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

export function formatPayloadLine(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const line = data.line ?? data.message ?? data.error ?? data.status ?? data.type;
    if (typeof line === "string") return line;
    return JSON.stringify(data);
  }
  return String(payload ?? "");
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
    const detail = body?.detail ?? body?.error ?? response.statusText;
    throw new Error(Array.isArray(detail) ? detail.map((item: any) => item.msg ?? String(item)).join(", ") : String(detail));
  }

  return response.json() as Promise<T>;
}

export function statusTone(status: string) {
  if (status.includes("FAILED") || status.includes("CANCELLED")) return "text-red-500";
  if (status.includes("COMPLETED")) return "text-green-500";
  if (status.includes("RUNNING") || status.includes("PROCESSING")) return "text-blue-500";
  return "text-amber-500";
}