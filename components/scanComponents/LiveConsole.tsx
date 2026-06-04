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
import { useEffect, useState } from "react";
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
type EnvCard = {
  label: string;
  value: string;
  tone: string;
};

const FALLBACK_PROFILE: EnvCard[] = [
  { label: "Browser", value: "Browser", tone: "text-emerald-600 dark:text-emerald-300" },
  { label: "OS", value: "Unknown OS", tone: "text-slate-900 dark:text-slate-100" },
  { label: "CPU Cores", value: "Unknown", tone: "text-slate-900 dark:text-slate-100" },
  { label: "Network", value: "Online", tone: "text-emerald-700 dark:text-emerald-300" },
];

function getBrowserProfile(): EnvCard[] {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return FALLBACK_PROFILE;
  }

  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
      brands?: Array<{ brand: string; version: string }>;
    };
    connection?: {
      effectiveType?: string;
    };
  };

  const match = nav.userAgent?.match(/(Chrome|Chromium|Firefox|Safari|Edge)\/?\s*([\d.]+)/i);
  const browserBrand = nav.userAgentData?.brands?.find((item) => !/not/i.test(item.brand));
  const browser = match?.[1] && match[2]
    ? `${match[1]} ${match[2].split(".")[0]}`
    : browserBrand?.brand && browserBrand.version
      ? `${browserBrand.brand} ${browserBrand.version.split(".")[0]}`
      : "Browser";

  const platformHint = `${nav.userAgentData?.platform ?? ""} ${nav.platform ?? ""} ${nav.userAgent ?? ""}`.toLowerCase();
  const os = platformHint.includes("iphone") || platformHint.includes("ipad") || platformHint.includes("ipod")
    ? "iOS"
    : platformHint.includes("mac")
      ? "macOS"
      : platformHint.includes("android")
        ? "Android"
        : platformHint.includes("win")
          ? "Windows"
          : platformHint.includes("linux")
            ? "Linux"
            : "Unknown OS";
  const cpu = Number.isFinite(nav.hardwareConcurrency) ? `${nav.hardwareConcurrency} cores` : "Unknown";
  const network = nav.onLine ? "Online" : "Offline";

  return [
    { label: "Browser", value: browser, tone: "text-emerald-600 dark:text-emerald-300" },
    { label: "OS", value: os, tone: "text-slate-900 dark:text-slate-100" },
    { label: "CPU Cores", value: cpu, tone: "text-slate-900 dark:text-slate-100" },
    { label: "Network", value: network, tone: "text-emerald-700 dark:text-emerald-300" },
  ];
}

function FindingsDonut({ run }: { run: ActiveRun }) {
  const [profile, setProfile] = useState<EnvCard[]>(FALLBACK_PROFILE);

  useEffect(() => {
    setProfile(getBrowserProfile());
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2">
      {profile.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-white/85 px-3 py-3 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-black/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
        >
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-emerald-400/60">{item.label}</p>
          <p className={cn("mt-2 text-sm sm:text-base font-semibold font-mono tracking-wide", item.tone)}>
            {item.value}
          </p>
        </div>
      ))}
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
