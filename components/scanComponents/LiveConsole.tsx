"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  GripVertical,
  Loader2,
  Radio,
  RotateCcw,
  XCircle,
  LayoutGrid,
  ChevronDown,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { ActiveRun } from "@/types/scan";
import { Metric } from "./Metric";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Panel keys & default order ──────────────────────────────────────────────
type PanelKey = "status" | "steps" | "findings" | "errors";
const DEFAULT_PANELS: PanelKey[] = ["status", "steps", "findings", "errors"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const isRunning = status === "RUNNING";
  const isDone    = status === "COMPLETED";
  const isFailed  = status === "FAILED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        isRunning && "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
        isDone    && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        isFailed  && "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
        !isRunning && !isDone && !isFailed && "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      )}
    >
      {isRunning && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d0b2]" />}
      {isDone && <CheckCircle2 size={11} />}
      {isFailed && <XCircle size={11} />}
      {status}
    </span>
  );
}

function StepStatusIcon({ status, isCurrent }: { status: string; isCurrent: boolean }) {
  if (status.includes("COMPLETED")) return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status.includes("FAILED"))    return <XCircle size={14} className="text-red-600 dark:text-red-400" />;
  if (isCurrent)                    return <Loader2 size={14} className="animate-spin text-teal-600 dark:text-teal-400" />;
  return <Circle size={14} className="text-gray-400 dark:text-gray-500" />;
}

// ─── Findings Donut Chart ─────────────────────────────────────────────────────
function FindingsDonut({ run }: { run: ActiveRun }) {
  const findings = run.findings || 0;
  const isRunning = run.status === "RUNNING";
  const isDone    = run.status === "COMPLETED";
  const isFailed  = run.status === "FAILED";
  const hasRun    = isRunning || isDone || isFailed;

  // Derive severity buckets from findings count (proportional mock until API returns breakdown)
  // If your API returns severity breakdown, swap these with real values
  const critical = Math.round(findings * 0.15);
  const high     = Math.round(findings * 0.30);
  const medium   = Math.round(findings * 0.35);
  const low      = Math.max(0, findings - critical - high - medium);

  const total = findings || 1; // avoid /0

  // SVG donut params
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  type Slice = { label: string; count: number; color: string; dashColor: string };
  const slices: Slice[] = [
    { label: "Critical", count: critical, color: "text-rose-500",   dashColor: "#f43f5e" },
    { label: "High",     count: high,     color: "text-orange-500", dashColor: "#f97316" },
    { label: "Medium",   count: medium,   color: "text-amber-400",  dashColor: "#fbbf24" },
    { label: "Low",      count: low,      color: "text-emerald-500",dashColor: "#10b981" },
  ];

  // Build dash segments
  let offset = 0;
  const segments = slices.map((s) => {
    const pct   = findings === 0 ? 0 : s.count / total;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const seg   = { ...s, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const idleColor = "hsl(var(--muted))";

  return (
    <div className="flex flex-col gap-4">
      {/* Chart row */}
      <div className="flex items-center gap-5">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width={140} height={140} viewBox="0 0 140 140">
            {/* Glow filter */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={idleColor}
              strokeWidth={14}
            />

            {findings === 0 ? (
              /* Empty / idle ring */
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={isRunning ? "hsl(var(--primary))" : idleColor}
                strokeWidth={14}
                strokeDasharray={`${circumference * 0.85} ${circumference * 0.15}`}
                strokeDashoffset={circumference * 0.125}
                strokeLinecap="round"
                className={isRunning ? "opacity-40" : "opacity-20"}
                style={isRunning ? { filter: "url(#glow)" } : {}}
              />
            ) : (
              segments.map((s, i) =>
                s.count === 0 ? null : (
                  <circle
                    key={i}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={s.dashColor}
                    strokeWidth={14}
                    strokeDasharray={`${s.dash - 3} ${s.gap + 3}`}
                    strokeDashoffset={-s.offset + circumference * 0.25}
                    strokeLinecap="round"
                    style={{ filter: "url(#glow)", transition: "stroke-dasharray 0.6s ease" }}
                  />
                )
              )
            )}

            {/* Animated pulse ring when running */}
            {isRunning && (
              <circle
                cx={cx} cy={cy} r={r + 10}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                opacity={0.2}
                className="animate-ping"
              />
            )}

            {/* Center text */}
            <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize={22} fontWeight={700}>
              {findings}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize={10}>
              {hasRun ? "findings" : "no scan"}
            </text>
            {isDone && (
              <text x={cx} y={cy + 24} textAnchor="middle" className="fill-emerald-500" fontSize={9} fontWeight={600}>
                DONE
              </text>
            )}
            {isFailed && (
              <text x={cx} y={cy + 24} textAnchor="middle" className="fill-red-600 dark:fill-red-400" fontSize={9} fontWeight={600}>
                FAILED
              </text>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {slices.map((s) => {
            const pct = findings === 0 ? 0 : Math.round((s.count / findings) * 100);
            return (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.dashColor }}
                />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-1">{s.label}</span>
                <span className={cn("text-[10px] sm:text-xs font-semibold tabular-nums", s.color)}>
                  {findings === 0 ? "—" : s.count}
                </span>
                {findings > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">{pct}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar — steps completion */}
      {run.steps.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
              Step Progress
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
              {run.steps.filter(s => s.status.includes("COMPLETED")).length} / {run.steps.length}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isFailed ? "bg-red-500" : "bg-[#00d0b2]"
              )}
              style={{
                width: `${run.steps.length === 0 ? 0 : (run.steps.filter(s => s.status.includes("COMPLETED")).length / run.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/20 dark:bg-gray-800/20 px-2 sm:px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Mode</p>
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{run.mode || "—"}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/20 dark:bg-gray-800/20 px-2 sm:px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Steps</p>
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{run.steps.length || "—"}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100/20 dark:bg-gray-800/20 px-2 sm:px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total</p>
          <p className={cn("text-xs sm:text-sm font-semibold mt-0.5", findings > 0 ? "text-rose-500" : "text-gray-900 dark:text-white")}>
            {findings || "—"}
          </p>
        </div>
      </div>
    </div>
  );
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
        "group rounded-xl border bg-white dark:bg-gray-900 transition-all duration-150",
        isDragging  && "opacity-40 scale-[0.98] border-dashed border-gray-200 dark:border-gray-800",
        isDragOver && !isDragging && "border-teal-500/50",
        !isDragging && !isDragOver && "border-gray-200 dark:border-gray-800"
      )}
    >
      <div
        className={cn(
          "flex cursor-grab select-none items-center gap-2.5 px-4 py-3 active:cursor-grabbing",
          "border-b border-gray-200/50 dark:border-gray-800/50",
          collapsible && "cursor-pointer",
          isDragOver && !isDragging && "border-teal-500/20"
        )}
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
      >
        <GripVertical size={14} className="shrink-0 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-gray-400 dark:group-hover:text-gray-500" />
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
        {badge && <span className="ml-1">{badge}</span>}
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium text-teal-600 dark:text-teal-400">Drop here</span>
        )}
        {collapsible && !isDragOver && (
          <ChevronDown
            size={14}
            className={cn("ml-auto text-gray-400 dark:text-gray-500 transition-transform duration-200", collapsed && "-rotate-90")}
          />
        )}
      </div>
      {!collapsed && <div className="p-3 sm:p-4">{children}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LiveConsole({
  run,
  errors,
}: {
  run: ActiveRun;
  errors: string[];
}) {
  const [panels, setPanels]     = useState<PanelKey[]>([...DEFAULT_PANELS]);
  const [dragging, setDragging] = useState<PanelKey | null>(null);
  const [dragOver, setDragOver] = useState<PanelKey | null>(null);
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
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {run.steps.length}
            </span>
          ) : undefined
        }
        collapsible
        {...dragProps("steps")}
      >
        {!run.steps.length ? (
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 py-1">No steps running yet.</p>
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
                    isCurrent && "border-teal-500/30 bg-teal-50/50 dark:bg-teal-500/5",
                    isDone    && "border-emerald-500/20 bg-emerald-500/5",
                    isFailed  && "border-red-200/20 dark:border-red-900/20 bg-red-50/50 dark:bg-red-950/5",
                    !isCurrent && !isDone && !isFailed && "border-gray-200 dark:border-gray-800 bg-gray-100/20 dark:bg-gray-800/20"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <StepStatusIcon status={step.status} isCurrent={isCurrent} />
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                          isCurrent && "bg-teal-50/50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400",
                          isDone    && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          isFailed  && "bg-red-50/50 dark:bg-red-950/15 text-red-600 dark:text-red-400",
                          !isCurrent && !isDone && !isFailed && "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{step.tool_name}</span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      isCurrent && "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
                      isDone    && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      isFailed  && "bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400",
                      !isCurrent && !isDone && !isFailed && "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
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

    // FINDINGS DONUT PANEL
    findings: (
      <DraggablePanel
        key="findings"
        label="Findings"
        icon={<Activity size={13} />}
        badge={
          run.findings > 0 ? (
            <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">
              {run.findings}
            </span>
          ) : undefined
        }
        {...dragProps("findings")}
      >
        <FindingsDonut run={run} />
      </DraggablePanel>
    ),

    // ERRORS PANEL
    errors: errors.length > 0 ? (
      <DraggablePanel
        key="errors"
        label="Scan Errors"
        icon={<AlertTriangle size={13} />}
        badge={
          <span className="rounded-full bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
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
              className="flex items-start gap-2 rounded-lg border border-red-200/15 dark:border-red-900/15 bg-red-50/50 dark:bg-red-950/5 px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-red-600 dark:text-red-400"
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
      <div className="flex items-center justify-between rounded-lg border border-gray-200/50 dark:border-gray-800/50 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <LayoutGrid size={13} className="text-gray-500 dark:text-gray-400" />
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Drag panels to reorder</span>
        </div>
        {isCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPanels([...DEFAULT_PANELS])}
            className="h-7 gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
