"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useCallback, useMemo } from "react";
import type { Terminal } from "@xterm/xterm";
import type { ActiveRun, LogLine, Project, ScanStep } from "@/types/scan";
import { useTheme } from "@/components/theme-provider";

export function AdvancedTerminalPanel({
  projectId,
  selectedProject,
  logs,
  run,
  errors,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  projectId: string;
  selectedProject: Project | undefined;
  logs: LogLine[];
  run: ActiveRun;
  errors: string[];
  isSubmitting: boolean;
  onSubmit: (command: string) => void;
  onReset: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const commandRef = useRef("");
  const logCursorRef = useRef(0);
  const isInputActiveRef = useRef(true);
  const selectedProjectRef = useRef(selectedProject);
  const onSubmitRef = useRef(onSubmit);
  const onResetRef = useRef(onReset);
  const prevStepsRef = useRef<ScanStep[]>([]);
  const prevStatusRef = useRef("idle");

  const terminalTheme = useMemo(
    () =>
      resolvedTheme === "dark"
        ? {
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
          }
        : {
            background: "#f8fafc",
            foreground: "#0f172a",
            cursor: "#0f766e",
            cursorAccent: "#f8fafc",
            selectionBackground: "#bfdbfe",
            black: "#334155",
            red: "#dc2626",
            green: "#15803d",
            yellow: "#ca8a04",
            blue: "#2563eb",
            magenta: "#9333ea",
            cyan: "#0f766e",
            white: "#e2e8f0",
            brightBlack: "#64748b",
            brightCyan: "#0d9488",
          },
    [resolvedTheme],
  );

  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);

  const getPrompt = useCallback(() => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    return `\r\n\x1b[1m\x1b[32m[${project}@reffensive]\x1b[0m\x1b[1m$ \x1b[0m`;
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
        fontFamily: "Consolas",
        fontSize: 16,
        scrollback: 5000,
        theme: terminalTheme,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      // Banner
      term.write("\x1b[1m\x1b[36m  ╔══════════════════════════════════════════╗\r\n");
      term.write("  ║    reffensive  ·  advanced  scan         ║\r\n");
      term.write("  ╚══════════════════════════════════════════╝\x1b[0m\r\n");
      term.write("\x1b[90m  Type a command and press Enter to run it.\r\n");
      term.write("  Example: nmap example.com -sV | nuclei\r\n");
      term.write("  Ctrl+C to reset.\x1b[0m");
      term.write(getPrompt());

      term.onData((data) => {
        if (data === "\x03") {
          commandRef.current = "";
          isInputActiveRef.current = true;
          term.write("^C");
          term.write(getPrompt());
          onResetRef.current();
          return;
        }
        if (!isInputActiveRef.current) return;
        if (data === "\r" && commandRef.current.trim() === "clear") {
          commandRef.current = "";
          term.write("\x1bc");
          term.write(getPrompt());
          return;
        }
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

  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);

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
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "idle") {
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
      className="rounded-xl border border-border bg-card"
    >
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="font-mono text-muted-foreground">
            {selectedProject ? `${selectedProject.name}@reffensive` : "reffensive"} — advanced scan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSubmitting && (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Loader2 size={11} className="animate-spin" /> Running
            </span>
          )}
        </div>
      </div>

      {!projectId && (
        <div className="border-b border-border bg-amber-500/10 px-4 py-2.5 text-lg text-amber-700 dark:text-amber-400">
          ⚠ Select a project above before running a scan.
        </div>
      )}

      <div ref={containerRef} className="h-140 overflow-hidden" />
    </motion.section>
  );
}
