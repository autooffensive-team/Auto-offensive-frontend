"use client";

import { Bot, RotateCcw } from "lucide-react";
import { useRef, useEffect } from "react";
import type { LogLine } from "@/types/scan";
import { cn } from "@/lib/utils";

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

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex h-96 flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Bot size={13} className="text-muted-foreground/60" />
            <span className="font-mono text-muted-foreground">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {logs.length} lines
            </span>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Logs Container */}
      <div className="m-4 flex-1 overflow-y-auto rounded-lg bg-muted/30 p-3 text-xs leading-relaxed font-[Consolas,monospace]">
        {!logs.length ? (
          <p className="text-muted-foreground/50 py-2 text-center text-[11px]">
            Logs will appear here when a scan starts.
          </p>
        ) : (
          <>
            {logs.map((line) => (
              <div key={line.id} className="flex gap-2 wrap-break-word py-0.5">
                <span className="shrink-0 text-muted-foreground/40">
                  {new Date(line.timestamp).toLocaleTimeString()}
                </span>
                <span className="shrink-0 text-primary/70">[{line.source}]</span>
                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    line.level === "ERROR" && "text-destructive",
                    line.level === "WARN" && "text-amber-500 dark:text-amber-400",
                    line.level === "INFO" && "text-emerald-500 dark:text-emerald-400",
                    !["ERROR", "WARN", "INFO"].includes(line.level) && "text-muted-foreground/60"
                  )}
                >
                  {line.level}
                </span>
                <span className="text-foreground/75">{line.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
