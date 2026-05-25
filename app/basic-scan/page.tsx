"use client";

import Sidebar from "@/components/Sidebar";
import { CheckCircle2, LoaderCircle, Search, Target, Zap } from "lucide-react";
import { useLocale } from "next-intl";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type BasicPreset = {
  name: string;
  description?: string | null;
};

type BasicTool = {
  tool_id?: string;
  tool_name: string;
  tool_description?: string | null;
  category_name?: string | null;
  scan_config?: {
    basic?: {
      presets?: BasicPreset[];
    };
  };
};

type ActivityEntry = {
  id: string;
  event: string;
  message: string;
};

function getToolKey(tool: BasicTool) {
  return tool.tool_id ?? tool.tool_name;
}

function humanizeStatus(status: string) {
  return status.replaceAll("JOB_STATUS_", "").replaceAll("_", " ").toLowerCase();
}

function statusTone(status: string) {
  if (status.includes("FAILED") || status.includes("CANCELLED")) {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200";
  }
  if (status.includes("COMPLETED") || status.includes("PARTIAL")) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
  }
  if (status.includes("RUNNING")) {
    return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200";
  }
  if (status.includes("PENDING")) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-200";
}

function resolvePresetName(tool: BasicTool | null, presetMode: "light" | "deep") {
  const presets = tool?.scan_config?.basic?.presets ?? [];
  if (!presets.length) {
    return "";
  }

  const exactMatch = presets.find((preset) => preset.name.toLowerCase().includes(presetMode));
  if (exactMatch) {
    return exactMatch.name;
  }

  if (presetMode === "light") {
    return presets[0]?.name ?? "";
  }

  return presets[presets.length - 1]?.name ?? "";
}

function describeEvent(event: string, payload: unknown) {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

  if (event === "scan_started") {
    return "Scan request accepted and queued.";
  }
  if (event === "status" && typeof record?.status === "string") {
    return `Status updated to ${humanizeStatus(record.status)}.`;
  }
  if (event === "done") {
    return "Scan finished.";
  }
  if (event === "error" && typeof record?.error === "string") {
    return record.error;
  }
  if (typeof record?.message === "string" && record.message.trim()) {
    return record.message;
  }
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "New scan event received.";
}

export default function BasicScanPage() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const streamAbortRef = useRef<AbortController | null>(null);

  const [tools, setTools] = useState<BasicTool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [toolsError, setToolsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedToolKey, setSelectedToolKey] = useState("");
  const [presetMode, setPresetMode] = useState<"light" | "deep">("light");
  const [target, setTarget] = useState("");
  const [pageMessage, setPageMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [isStartingScan, setIsStartingScan] = useState(false);
  const [scanStatus, setScanStatus] = useState("Draft");
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);

  const filteredTools = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      if (!query) {
        return true;
      }

      return (
        tool.tool_name.toLowerCase().includes(query) ||
        (tool.tool_description ?? "").toLowerCase().includes(query) ||
        (tool.category_name ?? "").toLowerCase().includes(query)
      );
    });
  }, [deferredSearchQuery, tools]);

  const selectedTool = tools.find((tool) => getToolKey(tool) === selectedToolKey) ?? null;
  const resolvedPreset = resolvePresetName(selectedTool, presetMode);
  const canStartScan = Boolean(selectedTool && resolvedPreset && target.trim());

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
        if (payload[0]) {
          setSelectedToolKey(getToolKey(payload[0]));
        }
      } catch (error) {
        if (!ignore) {
          setToolsError(error instanceof Error ? error.message : "Unable to load tools.");
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

  async function consumeScanStream(response: Response) {
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

        if (!dataLines.length || eventName === "ping") {
          continue;
        }

        const rawData = dataLines.join("\n");
        let payload: unknown = rawData;

        try {
          payload = JSON.parse(rawData);
        } catch {
          payload = rawData;
        }

        const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
        if (typeof record?.status === "string") {
          setScanStatus(record.status);
        }
        if (eventName === "done") {
          setPageMessage({ tone: "success", text: "Scan completed." });
        }
        if (eventName === "error") {
          setPageMessage({
            tone: "danger",
            text: typeof record?.error === "string" ? record.error : "The scan stream returned an error.",
          });
        }

        setActivityEntries((current) => [
          {
            id: `${Date.now()}-${current.length}`,
            event: eventName,
            message: describeEvent(eventName, payload),
          },
          ...current,
        ].slice(0, 6));
      }
    }
  }

  async function handleStartScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTool || !resolvedPreset || !target.trim()) {
      setPageMessage({
        tone: "danger",
        text: "Choose a tool, choose a preset, and enter a target before starting.",
      });
      return;
    }

    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    setIsStartingScan(true);
    setPageMessage(null);
    setScanStatus("JOB_STATUS_PENDING");
    setActivityEntries([]);

    try {
      const response = await fetch("/api/guest-scan/basic/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          target: target.trim(),
          tool: selectedTool.tool_name,
          preset: resolvedPreset,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await consumeScanStream(response);
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "Unable to start the scan.";
        setPageMessage({ tone: "danger", text: message });
        setScanStatus("JOB_STATUS_FAILED");
      }
    } finally {
      if (streamAbortRef.current === controller) {
        streamAbortRef.current = null;
      }
      setIsStartingScan(false);
    }
  }

  return (
    <div
      className="flex min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef6f4_100%)] text-gray-900 dark:bg-[linear-gradient(180deg,_#020617_0%,_#07111f_100%)] dark:text-white"
      style={{ fontFamily: bodyFontFamily }}
    >
      <aside className="hidden w-64 border-r border-gray-200/70 dark:border-gray-900 md:block">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Basic Scan</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Pick one tool, choose a light or deep preset, then enter your target.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Choose Tool</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select one tool for this scan.</p>
                </div>

                <label className="relative block w-full sm:max-w-sm">
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tools"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-emerald-500"
                  />
                </label>
              </div>

              {toolsError ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {toolsError}
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                {isLoadingTools
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`tool-skeleton-${index}`}
                        className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                      />
                    ))
                  : filteredTools.map((tool) => {
                      const toolKey = getToolKey(tool);
                      const isSelected = selectedToolKey === toolKey;

                      return (
                        <button
                          key={toolKey}
                          type="button"
                          onClick={() => setSelectedToolKey(toolKey)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-500/10"
                              : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{tool.tool_name}</h3>
                                {isSelected ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-300" /> : null}
                              </div>
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                {tool.category_name ?? "General"}
                              </p>
                              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                {tool.tool_description ?? "Basic scan tool ready to run."}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
              </div>

              {!isLoadingTools && filteredTools.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No tools found for this search.
                </div>
              ) : null}
            </section>

            <form onSubmit={handleStartScan} className="space-y-6">
              <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Scan Setup</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Just the essentials.</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(scanStatus)}`}>
                    {humanizeStatus(scanStatus)}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preset</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(["light", "deep"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPresetMode(option)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          presetMode === option
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {option === "light" ? "Light" : "Deep"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Backend preset in use: {resolvedPreset || "No matching preset available for this tool"}
                  </p>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</span>
                  <div className="relative mt-3">
                    <Target size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      placeholder="Enter domain, IP, or URL"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-emerald-500"
                    />
                  </div>
                </label>

                <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-900">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Summary</p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Tool: {selectedTool?.tool_name ?? "Not selected"}</p>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">Preset: {presetMode}</p>
                  <p className="mt-1 break-all text-gray-600 dark:text-gray-300">Target: {target.trim() || "Not entered"}</p>
                </div>

                {pageMessage ? (
                  <div
                    className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                      pageMessage.tone === "danger"
                        ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                    }`}
                  >
                    {pageMessage.text}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={!canStartScan || isStartingScan}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingScan ? <LoaderCircle size={16} className="animate-spin" /> : <Zap size={16} />}
                  {isStartingScan ? "Starting..." : "Start Scan"}
                </button>
              </section>

              <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
                <h2 className="text-lg font-semibold">Activity</h2>
                <div className="mt-4 space-y-3">
                  {activityEntries.length > 0 ? (
                    activityEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-900"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                          {entry.event}
                        </p>
                        <p className="mt-2 text-gray-700 dark:text-gray-200">{entry.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      Scan activity will appear here after launch.
                    </div>
                  )}
                </div>
              </section>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
