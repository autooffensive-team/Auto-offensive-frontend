"use client";

import { AlertTriangle, Bot, CheckCircle2, Circle, FileText, Loader2, Radio, XCircle } from "lucide-react";
import type { ActiveRun, LogLine } from "@/types/scan";
import { classNames, statusTone } from "@/utils/scan";
import { Metric } from "./Metric";

export function LiveConsole({
  run,
  logs,
  errors,
}: {
  run: ActiveRun;
  logs: LogLine[];
  errors: string[];
}) {
  const visibleParsed = run.parsedSteps.find((step) => (step.data?.length ?? 0) > 0) ?? run.parsedSteps[0];
  const columns = [...(visibleParsed?.columns ?? []), ...(visibleParsed?.discovered_columns ?? [])].slice(0, 6);
  const rows = visibleParsed?.data?.slice(0, 8) ?? [];

  return (
    <aside className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Radio size={19} />
            </div>
            <div>
              <h2 className="font-bold text-card-foreground">Live Output</h2>
              <p className="text-xs text-muted-foreground">{run.jobId || "No active job"}</p>
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
              <div key={step.step_id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  {step.status.includes("COMPLETED") ? (
                    <CheckCircle2 size={15} className="text-green-500" />
                  ) : step.status.includes("FAILED") ? (
                    <XCircle size={15} className="text-red-500" />
                  ) : step.step_id === run.stepId ? (
                    <Loader2 size={15} className="animate-spin text-blue-500" />
                  ) : (
                    <Circle size={15} className="text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold text-foreground">{step.tool_name}</span>
                </div>
                <span className={classNames("text-xs", statusTone(step.status))}>
                  {step.status.replace("STEP_STATUS_", "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!!errors.length && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-destructive">
            <AlertTriangle size={16} />
            Scan Errors
          </div>
          <div className="space-y-1 text-sm text-destructive">
            {errors.slice(-5).map((error, index) => (
              <p key={`${error}-${index}`}>{error}</p>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-slate-50 p-4 text-slate-900 shadow-sm dark:bg-[#020617] dark:text-slate-100">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Bot size={16} className="text-primary dark:text-teal-300" />
          Stream Logs
        </div>
        <div className="h-[360px] overflow-auto font-mono text-xs leading-5">
          {!logs.length && <p className="text-slate-500 dark:text-slate-400">Logs will appear here when a scan starts.</p>}
          {logs.map((line) => (
            <p key={line.id} className="break-words">
              <span className="text-slate-500 dark:text-slate-400">{new Date(line.timestamp).toLocaleTimeString()}</span>{" "}
              <span className="text-primary dark:text-teal-300">[{line.source}]</span>{" "}
              <span className="text-blue-600 dark:text-blue-300">{line.level}</span> {line.text}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={17} className="text-teal-500" />
          <h2 className="font-bold text-card-foreground">Parsed Results</h2>
        </div>
        {!visibleParsed && <p className="text-sm text-muted-foreground">Structured rows will appear after parsers produce output.</p>}
        {visibleParsed && !rows.length && (
          <div className="space-y-2 font-mono text-xs text-muted-foreground">
            {(visibleParsed.lines ?? []).slice(0, 8).map((line, index) => (
              <p key={`${line}-${index}`} className="break-words">{line}</p>
            ))}
          </div>
        )}
        {!!rows.length && (
          <div className="overflow-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((column) => (
                    <th key={column.key} className="px-2 py-2 font-bold text-muted-foreground">
                      {column.label || column.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-border/60">
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-[150px] truncate px-2 py-2 text-foreground/80">
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