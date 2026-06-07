"use client";

import { Bot, RotateCcw } from "lucide-react";
import { useRef, useEffect } from "react";
import type { LogLine } from "@/types/scan";
import { cn } from "@/lib/utils";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import { LogToolbar } from "./LogToolbar";

interface StreamLogsPanelProps {
  logs: LogLine[];
  onReset?: () => void;
  title?: string;
}

export function StreamLogsPanel({
  logs,
  onReset,
  title = "auto-offensive - stream logs",
}: StreamLogsPanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const { themeKey, sizeKey, theme, size, setTheme, setSize, resetToDefault } = useLogPreferences();

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    // Throttle + avoid smooth scrolling (smooth can be expensive on rapid updates).
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      logEndRef.current?.scrollIntoView({ behavior: "auto" });
      rafRef.current = null;
    });
  }, [logs]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Bot size={13} className="text-gray-400 dark:text-gray-500" />
            <span className="font-mono text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <span className="rounded-full bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400">
              {logs.length} lines
            </span>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <LogToolbar
        themeKey={themeKey}
        sizeKey={sizeKey}
        onThemeChange={setTheme}
        onSizeChange={setSize}
        onReset={resetToDefault}
        className="mx-3 mt-3 sm:mx-4 sm:mt-4"
      />

      {/* Logs Container */}
      <div
        className={cn(
          "m-3 sm:m-4 flex-1 overflow-y-auto rounded-lg p-2 sm:p-3 font-[Consolas,monospace] min-h-[20rem]",
          theme.html.bg,
          size.className,
          size.lineHeight
        )}
      >
        {!logs.length ? (
          <p className={cn("py-2 text-center", theme.html.muted, size.className)}>
            Logs will appear here when a scan starts.
          </p>
        ) : (
          <>
            {logs.map((line) => (
              <div key={line.id} className="flex gap-2 wrap-break-word py-0.5">
                <span className={cn("shrink-0", theme.html.timestamp)}>
                  {new Date(line.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn("shrink-0", theme.html.source)}>[{line.source}]</span>
                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    line.level === "ERROR" && theme.html.error,
                    line.level === "WARN" && theme.html.warn,
                    line.level === "INFO" && theme.html.info,
                    !["ERROR", "WARN", "INFO"].includes(line.level) && theme.html.muted
                  )}
                >
                  {line.level}
                </span>
                <span className={theme.html.text}>{line.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
