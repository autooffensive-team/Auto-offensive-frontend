"use client";

import { motion } from "framer-motion";
import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useCallback, useMemo } from "react";
import type { Terminal } from "@xterm/xterm";
import type { ActiveRun, LogLine, Project, ScanStep } from "@/types/scan";
import { useTheme } from "@/components/theme-provider";

// ─── Minimal splash ───────────────────────────────────────────────────────────
const SPLASH_LINES = [
  "",
  "  \x1b[1m\x1b[36mauto-offensive\x1b[0m  \x1b[90m·  advanced scan\x1b[0m",
  "  \x1b[90m────────────────────────────────────────\x1b[0m",
  "  \x1b[33mUsage   \x1b[0m  <tool> [flags] [| <tool> ...]",
  "  \x1b[33mExample \x1b[0m  \x1b[36mnuclei -u https://example.com\x1b[0m",
  "  \x1b[33mPipeline\x1b[0m  \x1b[36msubfinder -d example.com | httpx\x1b[0m",
  "  \x1b[33mHelp    \x1b[0m  \x1b[90mCtrl+C to cancel  ·  clear to reset\x1b[0m",
  "  \x1b[90m────────────────────────────────────────\x1b[0m",
  "",
];

const SPLASH = SPLASH_LINES.join("\r\n");

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

  // ── Input state ──────────────────────────────────────────────────────────
  // We maintain a full line buffer + cursor position so arrow keys, Home/End,
  // and multi-byte pastes all work correctly.
  const lineRef = useRef("");          // current input buffer
  const cursorRef = useRef(0);         // cursor position within lineRef
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);       // -1 = not browsing history

  const logCursorRef = useRef(0);
  const isInputActiveRef = useRef(true);
  const selectedProjectRef = useRef(selectedProject);
  const onSubmitRef = useRef(onSubmit);
  const onResetRef = useRef(onReset);
  const prevStepsRef = useRef<ScanStep[]>([]);
  const prevStatusRef = useRef("idle");
  const prevErrorsLenRef = useRef(0);

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

  // ── Prompt ───────────────────────────────────────────────────────────────
  const getPrompt = useCallback(() => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    return `\r\n\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m`;
  }, []);

  // ── Redraw current input line after cursor moves ─────────────────────────
  // Clears from start of line, reprints prompt + buffer, repositions cursor.
  const redrawLine = useCallback((term: Terminal) => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    const promptPlain = `[${project}@auto-offensive]$ `;
    const buf = lineRef.current;
    const cur = cursorRef.current;
    // Move to column 0, clear line, reprint prompt + buffer
    term.write(`\r\x1b[K\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m${buf}`);
    // Move cursor back to correct position
    const charsAfterCursor = buf.length - cur;
    if (charsAfterCursor > 0) {
      term.write(`\x1b[${charsAfterCursor}D`);
    }
  }, []);

  // ── Splash / clear ───────────────────────────────────────────────────────
  const showSplash = useCallback((term: Terminal) => {
    term.write("\x1b[3J\x1b[2J\x1b[H"); // clear scrollback + screen, home
    term.write("\r\n");
    term.write(SPLASH);
    term.write("\r\n");
  }, []);

  // ── Boot ─────────────────────────────────────────────────────────────────
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
        convertEol: false,          // we handle \r ourselves
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: 14,
        lineHeight: 1.4,
        scrollback: 5000,
        theme: terminalTheme,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      // Show fastfetch splash on first boot
      showSplash(term);
      term.write(getPrompt());

      term.onData((data) => {
        // ── Ctrl+C ──────────────────────────────────────────────────────
        if (data === "\x03") {
          lineRef.current = "";
          cursorRef.current = 0;
          histIdxRef.current = -1;
          isInputActiveRef.current = true;
          term.write("^C");
          term.write(getPrompt());
          onResetRef.current();
          return;
        }

        if (!isInputActiveRef.current) return;

        // ── Enter ────────────────────────────────────────────────────────
        if (data === "\r") {
          const cmd = lineRef.current.trim();
          term.write("\r\n");
          lineRef.current = "";
          cursorRef.current = 0;

          if (cmd === "clear") {
            histIdxRef.current = -1;
            showSplash(term);
            term.write(getPrompt());
            return;
          }

          if (cmd) {
            // Push to history (deduplicate consecutive)
            if (historyRef.current[0] !== cmd) {
              historyRef.current.unshift(cmd);
              if (historyRef.current.length > 100) historyRef.current.pop();
            }
            histIdxRef.current = -1;
            isInputActiveRef.current = false;
            onSubmitRef.current(cmd);
          } else {
            term.write(getPrompt());
          }
          return;
        }

        // ── Backspace ────────────────────────────────────────────────────
        if (data === "\u007f") {
          if (cursorRef.current === 0) return;
          const buf = lineRef.current;
          lineRef.current =
            buf.slice(0, cursorRef.current - 1) + buf.slice(cursorRef.current);
          cursorRef.current -= 1;
          redrawLine(term);
          return;
        }

        // ── Escape sequences (arrows, Home, End, Delete) ─────────────────
        if (data.startsWith("\x1b[") || data.startsWith("\x1bO")) {
          const seq = data.slice(data.startsWith("\x1bO") ? 2 : 2);

          // Arrow Left
          if (data === "\x1b[D") {
            if (cursorRef.current > 0) {
              cursorRef.current -= 1;
              term.write("\x1b[D");
            }
            return;
          }
          // Arrow Right
          if (data === "\x1b[C") {
            if (cursorRef.current < lineRef.current.length) {
              cursorRef.current += 1;
              term.write("\x1b[C");
            }
            return;
          }
          // Arrow Up — history prev
          if (data === "\x1b[A") {
            const hist = historyRef.current;
            if (!hist.length) return;
            const nextIdx = Math.min(histIdxRef.current + 1, hist.length - 1);
            histIdxRef.current = nextIdx;
            lineRef.current = hist[nextIdx];
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          // Arrow Down — history next
          if (data === "\x1b[B") {
            if (histIdxRef.current <= 0) {
              histIdxRef.current = -1;
              lineRef.current = "";
              cursorRef.current = 0;
              redrawLine(term);
              return;
            }
            histIdxRef.current -= 1;
            lineRef.current = historyRef.current[histIdxRef.current];
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          // Home / Ctrl+A
          if (data === "\x1b[H" || data === "\x01") {
            cursorRef.current = 0;
            redrawLine(term);
            return;
          }
          // End / Ctrl+E
          if (data === "\x1b[F" || data === "\x05") {
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          // Delete (forward delete)
          if (data === "\x1b[3~") {
            if (cursorRef.current >= lineRef.current.length) return;
            const buf = lineRef.current;
            lineRef.current =
              buf.slice(0, cursorRef.current) + buf.slice(cursorRef.current + 1);
            redrawLine(term);
            return;
          }
          // Ctrl+Left — word left
          if (data === "\x1b[1;5D" || data === "\x1bb") {
            let pos = cursorRef.current;
            while (pos > 0 && lineRef.current[pos - 1] === " ") pos--;
            while (pos > 0 && lineRef.current[pos - 1] !== " ") pos--;
            cursorRef.current = pos;
            redrawLine(term);
            return;
          }
          // Ctrl+Right — word right
          if (data === "\x1b[1;5C" || data === "\x1bf") {
            let pos = cursorRef.current;
            const len = lineRef.current.length;
            while (pos < len && lineRef.current[pos] !== " ") pos++;
            while (pos < len && lineRef.current[pos] === " ") pos++;
            cursorRef.current = pos;
            redrawLine(term);
            return;
          }
          // Ignore other escape sequences
          return;
        }

        // ── Ctrl+A / Ctrl+E (non-escape variants) ────────────────────────
        if (data === "\x01") { cursorRef.current = 0; redrawLine(term); return; }
        if (data === "\x05") { cursorRef.current = lineRef.current.length; redrawLine(term); return; }

        // ── Ctrl+K — kill to end of line ─────────────────────────────────
        if (data === "\x0b") {
          lineRef.current = lineRef.current.slice(0, cursorRef.current);
          redrawLine(term);
          return;
        }

        // ── Ctrl+U — kill to start of line ───────────────────────────────
        if (data === "\x15") {
          lineRef.current = lineRef.current.slice(cursorRef.current);
          cursorRef.current = 0;
          redrawLine(term);
          return;
        }

        // ── Printable characters (including multi-char pastes) ────────────
        // Filter out remaining control characters
        const printable = data.replace(/[\x00-\x1f\x7f]/g, "");
        if (!printable) return;

        const buf = lineRef.current;
        lineRef.current =
          buf.slice(0, cursorRef.current) + printable + buf.slice(cursorRef.current);
        cursorRef.current += printable.length;
        redrawLine(term);
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

  // ── Theme hot-swap ───────────────────────────────────────────────────────
  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);

  // ── Stream logs ──────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    if (logs.length === 0) { logCursorRef.current = 0; return; }
    const newLines = logs.slice(logCursorRef.current);
    if (!newLines.length) return;
    logCursorRef.current = logs.length;
    newLines.forEach((line) => {
      const time = new Date(line.timestamp).toLocaleTimeString();
      let col = "\x1b[90m";
      const lvl = line.level.toLowerCase();
      if (lvl.includes("error") || lvl.includes("fail")) col = "\x1b[31m";
      else if (lvl.includes("warn")) col = "\x1b[33m";
      else if (lvl === "done" || lvl === "submitted") col = "\x1b[32m";
      else if (lvl === "log") col = "\x1b[36m";
      term.write(`\r\x1b[90m[${time}]\x1b[0m \x1b[36m[${line.source}]\x1b[0m ${col}${line.text}\x1b[0m\r\n`);
    });
  }, [logs]);

  // ── Errors ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const newErrs = errors.slice(prevErrorsLenRef.current);
    if (!newErrs.length) return;
    prevErrorsLenRef.current = errors.length;
    newErrs.forEach((e) => term.write(`\r\x1b[1m\x1b[31m[ERROR] ${e}\x1b[0m\r\n`));
  }, [errors]);

  // ── Step announcements — removed per UX request ─────────────────────────

  // ── Job status ───────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    const status = run.status;
    if (!term || status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    if (status === "submitting") {
      term.write(`\r\x1b[36m→ Submitting scan…\x1b[0m\r\n`);
    } else if (status.includes("COMPLETED")) {
      term.write(`\r\x1b[1m\x1b[32m✓ Scan completed — findings: ${run.findings}\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("FAILED")) {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("CANCELLED") || status.includes("PARTIAL")) {
      term.write(`\r\x1b[1m\x1b[33m⚠ Scan ${status.replace("JOB_STATUS_", "").toLowerCase()}.\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "failed") {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
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
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      {/* ── Title bar ── */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="font-mono text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">
            {selectedProject ? `${selectedProject.name}@auto-offensive` : "auto-offensive"} — advanced scan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSubmitting && (
            <span className="rounded-full bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" /> Running
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {!projectId && (
        <div className="rounded-lg border border-red-200/25 dark:border-red-900/25 bg-red-50 dark:bg-red-950/30 p-3 sm:p-4 text-xs sm:text-sm text-red-600 dark:text-red-400 m-4">
          ⚠ Select a project above before running a scan.
        </div>
      )}

      {/* ── Full-width xterm ── */}
      <div
        ref={containerRef}
        className="h-144 w-full overflow-hidden"
        style={{ backgroundColor: terminalTheme.background }}
      />
    </motion.section>
  );
}
