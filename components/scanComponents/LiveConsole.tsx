"use client";

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Circle,
  GripVertical,
  Loader2,
  Radio,
  RotateCcw,
  XCircle,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { useState, useRef } from "react";
import type { ActiveRun, LogLine } from "@/types/scan";
import { classNames, statusTone } from "@/utils/scan";
import { Metric } from "./Metric";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Panel keys & default order ──────────────────────────────────────────────
type PanelKey = "status" | "steps" | "logs" | "errors";
const DEFAULT_PANELS: PanelKey[] = ["status", "steps", "logs", "errors"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const isRunning = status === "RUNNING";
  const isDone    = status === "COMPLETED";
  const isFailed  = status === "FAILED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        isRunning && "bg-primary/10 text-primary",
        isDone    && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        isFailed  && "bg-destructive/10 text-destructive",
        !isRunning && !isDone && !isFailed && "bg-muted text-muted-foreground"
      )}
    >
      {isRunning && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      )}
      {isDone && <CheckCircle2 size={11} />}
      {isFailed && <XCircle size={11} />}
      {status}
    </span>
  );
}

function StepStatusIcon({ status, isCurrent }: { status: string; isCurrent: boolean }) {
  if (status.includes("COMPLETED")) return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status.includes("FAILED"))    return <XCircle size={14} className="text-destructive" />;
  if (isCurrent)                    return <Loader2 size={14} className="animate-spin text-primary" />;
  return <Circle size={14} className="text-muted-foreground/40" />;
}

// ─── Draggable panel wrapper ──────────────────────────────────────────────────
interface DraggablePanelProps {
  panelKey: PanelKey;
  label: string;
  icon: React.ReactNode;
  isDragging: boolean;
  isDragOver: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onDragStart: (key: PanelKey) => void;
  onDragOver: (e: React.DragEvent, key: PanelKey) => void;
  onDrop: (e: React.DragEvent, key: PanelKey) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

function DraggablePanel({
  panelKey, label, icon, isDragging, isDragOver,
  collapsible = false, defaultCollapsed = false,
  onDragStart, onDragOver, onDrop, onDragEnd,
  children, badge,
}: DraggablePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(panelKey)}
      onDragOver={(e) => onDragOver(e, panelKey)}
      onDrop={(e) => onDrop(e, panelKey)}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-xl border bg-card transition-all duration-150",
        isDragging  && "opacity-40 scale-[0.98] border-dashed border-border",
        isDragOver && !isDragging && "border-primary/50 shadow-[0_0_0_2px_hsl(var(--primary)/0.12)]",
        !isDragging && !isDragOver && "border-border"
      )}
    >
      {/* Panel header — drag handle */}
      <div
        className={cn(
          "flex cursor-grab select-none items-center gap-2.5 px-4 py-3 active:cursor-grabbing",
          "border-b border-border/50",
          collapsible && "cursor-pointer",
          isDragOver && !isDragging && "border-primary/20"
        )}
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
      >
        <GripVertical
          size={14}
          className="shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60"
        />
        <span className="text-muted-foreground/60">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        {badge && <span className="ml-1">{badge}</span>}
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium text-primary">Drop here</span>
        )}
        {collapsible && !isDragOver && (
          <ChevronDown
            size={14}
            className={cn(
              "ml-auto text-muted-foreground/40 transition-transform duration-200",
              collapsed && "-rotate-90"
            )}
          />
        )}
      </div>

      {/* Panel body */}
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LiveConsole({
  run,
  logs,
  errors,
}: {
  run: ActiveRun;
  logs: LogLine[];
  errors: string[];
}) {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [panels, setPanels]           = useState<PanelKey[]>([...DEFAULT_PANELS]);
  const [dragging, setDragging]       = useState<PanelKey | null>(null);
  const [dragOver, setDragOver]       = useState<PanelKey | null>(null);
  const isCustom = panels.join(",") !== DEFAULT_PANELS.join(",");

  const handleDragStart = (key: PanelKey) => setDragging(key);
  const handleDragOver  = (e: React.DragEvent, key: PanelKey) => {
    e.preventDefault();
    if (dragging && dragging !== key) setDragOver(key);
  };
  const handleDrop = (e: React.DragEvent, target: PanelKey) => {
    e.preventDefault();
    if (!dragging || dragging === target) return;
    const next = [...panels];
    const from = next.indexOf(dragging);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, dragging);
    setPanels(next);
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const dragProps = (key: PanelKey) => ({
    panelKey: key,
    isDragging: dragging === key,
    isDragOver: dragOver === key,
    onDragStart: handleDragStart,
    onDragOver:  handleDragOver,
    onDrop:      handleDrop,
    onDragEnd:   handleDragEnd,
  });

  // ─── Panel content map ──────────────────────────────────────────────────
  const panelMap: Record<PanelKey, React.ReactNode> = {

    // STATUS PANEL
    status: (
      <DraggablePanel
        key="status"
        label="Live Output"
        icon={<Radio size={13} />}
        badge={<StatusDot status={run.status} />}
        {...dragProps("status")}
      >
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-mono">{run.jobId || "No active job"}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Metric label="Mode"     value={run.mode} />
          <Metric label="Steps"    value={String(run.steps.length || 0)} />
          <Metric label="Findings" value={String(run.findings || 0)} />
        </div>
      </DraggablePanel>
    ),

    // STEPS PANEL
    steps: (
      <DraggablePanel
        key="steps"
        label="Pipeline"
        icon={<Radio size={13} />}
        badge={
          run.steps.length > 0 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {run.steps.length}
            </span>
          ) : undefined
        }
        collapsible
        {...dragProps("steps")}
      >
        {!run.steps.length ? (
          <p className="text-xs text-muted-foreground/60 py-1">No steps running yet.</p>
        ) : (
          <div className="space-y-2">
            {run.steps.map((step, i) => {
              const isCurrent = step.step_id === run.stepId;
              const isDone    = step.status.includes("COMPLETED");
              const isFailed  = step.status.includes("FAILED");
              return (
                <div
                  key={step.step_id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors",
                    isCurrent && "border-primary/30 bg-primary/5",
                    isDone    && "border-emerald-500/20 bg-emerald-500/5",
                    isFailed  && "border-destructive/20 bg-destructive/5",
                    !isCurrent && !isDone && !isFailed && "border-border bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <StepStatusIcon status={step.status} isCurrent={isCurrent} />
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                          isCurrent && "bg-primary/15 text-primary",
                          isDone    && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          isFailed  && "bg-destructive/15 text-destructive",
                          !isCurrent && !isDone && !isFailed && "bg-muted text-muted-foreground"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">{step.tool_name}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      isCurrent && "bg-primary/10 text-primary",
                      isDone    && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      isFailed  && "bg-destructive/10 text-destructive",
                      !isCurrent && !isDone && !isFailed && "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.status.replace("STEP_STATUS_", "")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </DraggablePanel>
    ),

    // LOGS PANEL
    logs: (
      <DraggablePanel
        key="logs"
        label="Stream Logs"
        icon={<Bot size={13} />}
        badge={
          logs.length > 0 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {logs.length}
            </span>
          ) : undefined
        }
        {...dragProps("logs")}
      >
        <div className="h-75 overflow-y-auto rounded-lg bg-muted/30 p-3 font-mono text-xs leading-relaxed">
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
                      line.level === "WARN"  && "text-amber-500 dark:text-amber-400",
                      line.level === "INFO"  && "text-emerald-500 dark:text-emerald-400",
                      !["ERROR","WARN","INFO"].includes(line.level) && "text-muted-foreground/60"
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
      </DraggablePanel>
    ),

    // ERRORS PANEL — only rendered when there are errors
    errors: errors.length > 0 ? (
      <DraggablePanel
        key="errors"
        label="Scan Errors"
        icon={<AlertTriangle size={13} />}
        badge={
          <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
            {errors.length}
          </span>
        }
        collapsible
        {...dragProps("errors")}
      >
        <div className="space-y-1.5">
          {errors.slice(-5).map((error, i) => (
            <div
              key={`${error}-${i}`}
              className="flex items-start gap-2 rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span className="wrap-break-word">{error}</span>
            </div>
          ))}
        </div>
      </DraggablePanel>
    ) : null,
  };

  return (
    <aside className="space-y-2">
      {/* Drag toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <LayoutGrid size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Drag panels to reorder</span>
        </div>
        {isCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPanels([...DEFAULT_PANELS])}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={11} />
            Reset
          </Button>
        )}
      </div>

      {/* Panels */}
      <div className="space-y-3">
        {panels.map((key) => panelMap[key] ?? null)}
      </div>
    </aside>
  );
}