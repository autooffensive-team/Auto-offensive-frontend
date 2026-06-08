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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ActiveRun, LogLine } from "@/types/scan";
import { Metric } from "./Metric";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Panel keys & default order ───────────────────────────────────────────────
type PanelKey = "status" | "steps" | "findings" | "errors";
const DEFAULT_PANELS: PanelKey[] = ["status", "steps", "findings", "errors"];

// ─── Injected global styles ────────────────────────────────────────────────────
const FUTURE_STYLES = `
/* ── Keyframes ── */
@keyframes lc-scan {
  from { top: -80px; }
  to   { top: calc(100% + 80px); }
}
@keyframes lc-corner-pulse {
  0%,100% { opacity: 0.5; }
  50%      { opacity: 1;   }
}
@keyframes lc-shimmer {
  from { background-position: -200% center; }
  to   { background-position:  200% center; }
}
@keyframes lc-blink {
  0%,100% { opacity: 1;   }
  50%      { opacity: 0.1; }
}
@keyframes lc-spin {
  to { transform: rotate(360deg); }
}
@keyframes lc-energy {
  0%,100% { opacity: 0.3; }
  50%      { opacity: 1;   }
}
@keyframes lc-status-glow {
  0%,100% { box-shadow: none; }
  50%      { box-shadow: inset 0 0 8px rgba(0,255,200,0.18); }
}
@keyframes lc-wave {
  from { opacity: 0.25; transform: scaleY(0.25); }
  to   { opacity: 1;    transform: scaleY(1);    }
}
@keyframes lc-stream-in {
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: none; }
}
@keyframes lc-prog-enter {
  from { stroke-dashoffset: 276.46; }
}

/* ── CSS variables — light mode ── */
:root {
  --lc-neon:          #00d0b2;
  --lc-neon-rgb:      0,208,178;
  --lc-neon2:         #00aaff;
  --lc-neon3:         #ff3cac;
  --lc-red:           #ef4444;
  --lc-amber:         #f59e0b;

  --lc-bg:            transparent;
  --lc-panel-bg:      rgba(248,250,252,0.98);
  --lc-panel-border:  rgba(0,208,178,0.28);
  --lc-panel-hot:     rgba(0,208,178,0.55);
  --lc-toolbar-bg:    rgba(241,245,249,0.97);
  --lc-card-bg:       rgba(255,255,255,0.92);
  --lc-card-border:   rgba(0,208,178,0.22);
  --lc-grid-line:     rgba(0,208,178,0.055);
  --lc-scan-beam:     rgba(0,208,178,0.055);
  --lc-shimmer:       rgba(0,208,178,0.1);
  --lc-label:         rgba(15,23,42,0.42);
  --lc-text:          #0f172a;
  --lc-text-muted:    rgba(15,23,42,0.5);
  --lc-text-dim:      rgba(15,23,42,0.3);
  --lc-metric-val:    #0d9488;
  --lc-metric-bg:     rgba(0,208,178,0.06);
  --lc-radial:        rgba(0,208,178,0.05);
  --lc-stream-line:   rgba(0,0,0,0.55);
  --lc-font-mono:     var(--font-fira-code), 'Fira Code', 'JetBrains Mono', monospace;
  --lc-font-ui:       var(--font-google-sans), 'Google Sans', sans-serif;
  --lc-font-display:  var(--font-hackdaddy), 'Hackdaddy', monospace;
}

/* ── CSS variables — dark mode ── */
.dark {
  --lc-panel-bg:      rgba(16,24,40,0.98);
  --lc-panel-border:  rgba(0,208,178,0.18);
  --lc-panel-hot:     rgba(0,208,178,0.45);
  --lc-toolbar-bg:    rgba(12,19,33,0.99);
  --lc-card-bg:       rgba(20,29,46,0.85);
  --lc-card-border:   rgba(0,208,178,0.15);
  --lc-grid-line:     rgba(0,208,178,0.04);
  --lc-scan-beam:     rgba(0,208,178,0.06);
  --lc-shimmer:       rgba(0,208,178,0.06);
  --lc-label:         rgba(0,208,178,0.55);
  --lc-text:          #e2e8f0;
  --lc-text-muted:    rgba(226,232,240,0.6);
  --lc-text-dim:      rgba(226,232,240,0.32);
  --lc-neon:          #00d0b2;
  --lc-neon-rgb:      0,208,178;
  --lc-metric-val:    #00d0b2;
  --lc-metric-bg:     rgba(0,208,178,0.06);
  --lc-radial:        rgba(0,208,178,0.04);
  --lc-stream-line:   rgba(0,208,178,0.65);
}

/* ── Aside wrapper ── */
.lc-aside {
  position: relative;
  space-y: 0;
}
.lc-aside > * { position: relative; z-index: 1; }

/* ── Panel base ── */
.lc-panel {
  position: relative;
  background: var(--lc-panel-bg);
  outline: 1px solid var(--lc-panel-border);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  overflow: hidden;
  transition: outline-color 0.25s ease, filter 0.2s ease;
  border-radius: 0 !important;
  border: none !important;
}
.lc-panel:hover {
  outline-color: var(--lc-panel-hot);
  filter: brightness(1.03);
}
/* top-left + bottom-right corner accent triangles */
.lc-panel::before {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, var(--lc-neon) 0%, transparent 55%) top left / 18px 18px no-repeat,
    linear-gradient(315deg, var(--lc-neon) 0%, transparent 55%) bottom right / 18px 18px no-repeat;
  opacity: 0.65;
  z-index: 2;
  animation: lc-corner-pulse 3.5s ease-in-out infinite;
}
/* scan sweep on running panels */
.lc-panel.lc-running::after {
  content: '';
  pointer-events: none;
  position: absolute;
  left: 0; right: 0; height: 80px;
  background: linear-gradient(180deg, transparent, var(--lc-scan-beam), transparent);
  animation: lc-scan 2.6s linear infinite;
  z-index: 3;
}

/* drag states */
.lc-panel.lc-dragging  { opacity: 0.38; transform: scale(0.975); }
.lc-panel.lc-drag-over { outline-color: var(--lc-panel-hot); }

/* ── Panel header ── */
.lc-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--lc-panel-border);
  background: rgba(var(--lc-neon-rgb), 0.02);
  position: relative; overflow: hidden;
  cursor: grab;
}
.lc-hd:active { cursor: grabbing; }
.lc-hd::after {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 32%, var(--lc-shimmer) 50%, transparent 68%);
  background-size: 200% 100%;
  animation: lc-shimmer 4s linear infinite;
}
/* left edge accent bar */
.lc-hd::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--lc-neon), transparent);
  opacity: 0.8;
}

.lc-hd-label {
  font-family: var(--lc-font-ui);
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--lc-text-muted);
}
.lc-hd-spacer { flex: 1; }
.lc-grip { color: var(--lc-text-dim); transition: color 0.2s; flex-shrink: 0; }
.lc-panel:hover .lc-grip { color: var(--lc-neon); }

/* ── Toolbar ── */
.lc-toolbar {
  position: relative; overflow: hidden;
  background: var(--lc-toolbar-bg);
  outline: 1px solid var(--lc-panel-border);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px;
}
.lc-toolbar::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--lc-neon), transparent);
  opacity: 0.35;
}
.lc-toolbar-left {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--lc-font-ui);
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--lc-text-muted);
}

/* ── Status badge ── */
.lc-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--lc-font-ui);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 10px;
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
}
.lc-badge-running { background: rgba(var(--lc-neon-rgb),0.1); color: var(--lc-neon); outline: 1px solid rgba(var(--lc-neon-rgb),0.3); }
.lc-badge-done    { background: rgba(0,200,100,0.1); color: #10b981; outline: 1px solid rgba(0,200,100,0.25); }
.lc-badge-fail    { background: rgba(239,68,68,0.1); color: var(--lc-red); outline: 1px solid rgba(239,68,68,0.3); }
.lc-badge-idle    { background: rgba(100,116,139,0.1); color: #94a3b8; outline: 1px solid rgba(100,116,139,0.2); }

.lc-dot-blink {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--lc-neon);
  box-shadow: 0 0 6px var(--lc-neon);
  animation: lc-blink 0.9s step-end infinite;
  flex-shrink: 0;
}

/* ── Count pill (steps badge, etc) ── */
.lc-pill {
  font-family: var(--lc-font-ui);
  font-size: 11px; font-weight: 700;
  padding: 2px 8px;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}
.lc-pill-neon { background: rgba(var(--lc-neon-rgb),0.1); color: var(--lc-neon); outline: 1px solid rgba(var(--lc-neon-rgb),0.2); }
.lc-pill-rose { background: rgba(244,63,94,0.1); color: #f43f5e; outline: 1px solid rgba(244,63,94,0.2); }
.lc-pill-red  { background: rgba(239,68,68,0.09); color: var(--lc-red); outline: 1px solid rgba(239,68,68,0.18); }

/* ── Metric cards ── */
.lc-metric {
  padding: 10px 10px 8px;
  background: var(--lc-metric-bg);
  outline: 1px solid var(--lc-panel-border);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
}
.lc-metric-label {
  font-family: var(--lc-font-ui);
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--lc-label);
}
.lc-metric-val {
  font-family: var(--lc-font-mono);
  font-size: 22px; font-weight: 700;
  color: var(--lc-metric-val);
  margin-top: 3px;
  text-shadow: 0 0 12px rgba(var(--lc-neon-rgb), 0.35);
}

/* ── Step rows ── */
.lc-step {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  transition: background 0.2s;
}
.lc-step-current { background: rgba(var(--lc-neon-rgb),0.08); outline: 1px solid rgba(var(--lc-neon-rgb),0.3); }
.lc-step-done    { background: rgba(16,185,129,0.07); outline: 1px solid rgba(16,185,129,0.22); }
.lc-step-failed  { background: rgba(239,68,68,0.06); outline: 1px solid rgba(239,68,68,0.2); }
.lc-step-idle    { background: rgba(148,163,184,0.06); outline: 1px solid rgba(148,163,184,0.12); }
/* energy pulse on left edge of running step */
.lc-step-current::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, transparent, var(--lc-neon), transparent);
  animation: lc-energy 1.5s ease-in-out infinite;
}

.lc-step-num {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px;
  font-family: var(--lc-font-mono); font-size: 11px; font-weight: 700;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  flex-shrink: 0;
}
.lc-step-num-current { background: rgba(var(--lc-neon-rgb),0.14); color: var(--lc-neon); }
.lc-step-num-done    { background: rgba(16,185,129,0.14); color: #10b981; }
.lc-step-num-failed  { background: rgba(239,68,68,0.14); color: var(--lc-red); }
.lc-step-num-idle    { background: rgba(100,116,139,0.1); color: #64748b; }

.lc-step-status {
  font-family: var(--lc-font-ui);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 3px 8px;
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
}
.lc-step-status-current { background: rgba(var(--lc-neon-rgb),0.1); color: var(--lc-neon); animation: lc-status-glow 1.5s ease-in-out infinite; }
.lc-step-status-done    { background: rgba(16,185,129,0.1); color: #10b981; }
.lc-step-status-failed  { background: rgba(239,68,68,0.1); color: var(--lc-red); }
.lc-step-status-idle    { background: rgba(100,116,139,0.07); color: #64748b; }

/* ── Spinner ── */
.lc-spin {
  width: 14px; height: 14px; flex-shrink: 0;
  border: 1.5px solid rgba(var(--lc-neon-rgb),0.2);
  border-top-color: var(--lc-neon);
  border-radius: 50%;
  animation: lc-spin 0.7s linear infinite;
}

/* ── Env cards ── */
.lc-env-card {
  position: relative; overflow: hidden;
  padding: 10px 12px;
  background: var(--lc-card-bg);
  outline: 1px solid var(--lc-card-border);
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
}
.lc-env-card::before {
  content: '';
  pointer-events: none;
  position: absolute; inset: 0;
  background:
    linear-gradient(135deg, var(--lc-neon) 0%, transparent 42%) top left / 11px 11px no-repeat,
    linear-gradient(315deg, var(--lc-neon) 0%, transparent 42%) bottom right / 11px 11px no-repeat;
  opacity: 0.45; z-index: 1;
}
.lc-env-label {
  font-family: var(--lc-font-ui);
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--lc-label);
  position: relative; z-index: 2;
}
.lc-env-val {
  font-family: var(--lc-font-mono);
  font-size: 15px; font-weight: 700;
  color: var(--lc-metric-val);
  margin-top: 4px;
  position: relative; z-index: 2;
}

/* ── Error rows ── */
.lc-error-row {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 8px 10px; margin-bottom: 6px;
  background: rgba(239,68,68,0.06);
  outline: 1px solid rgba(239,68,68,0.18);
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
}

/* ── Waveform ── */
.lc-waveform { display: flex; align-items: flex-end; gap: 2px; height: 38px; padding: 0 2px; }
.lc-wave-bar {
  flex: 1; min-width: 3px; border-radius: 1px 1px 0 0;
  transform-origin: bottom;
  animation: lc-wave var(--d,1.2s) ease-in-out infinite alternate;
  animation-delay: var(--delay,0s);
}

/* ── Data stream ── */
.lc-stream {
  font-family: var(--lc-font-mono);
  font-size: 12px; line-height: 1.8;
  color: var(--lc-stream-line);
  height: 90px; overflow: hidden;
  position: relative;
}
.lc-stream::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 32px;
  background: linear-gradient(transparent, var(--lc-panel-bg));
}
.lc-stream-line { animation: lc-stream-in 0.25s ease-out; }

/* ── Circular progress ── */
.lc-circ-ring {
  animation: lc-prog-enter 1s ease-out;
  transition: stroke-dashoffset 0.6s ease;
}

/* ── Threat bar segments ── */
.lc-threat-seg {
  flex: 1; height: 6px;
  clip-path: polygon(0 0, calc(100% - 2px) 0, 100% 100%, 0 100%);
}

/* ── Chevron collapse ── */
.lc-chevron { transition: transform 0.2s; }
.lc-chevron.collapsed { transform: rotate(-90deg); }
`;

function InjectStyles() {
  useEffect(() => {
    const id = "lc-future-v3";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = FUTURE_STYLES;
      document.head.appendChild(el);
    }
  }, []);
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isRunning = status === "RUNNING";
  const isDone    = status === "COMPLETED";
  const isFailed  = status === "FAILED";
  const cls = isRunning ? "lc-badge-running" : isDone ? "lc-badge-done" : isFailed ? "lc-badge-fail" : "lc-badge-idle";
  return (
    <span className={cn("lc-badge", cls)}>
      {isRunning && <span className="lc-dot-blink" />}
      {isDone    && <CheckCircle2 size={10} />}
      {isFailed  && <XCircle size={10} />}
      {status}
    </span>
  );
}

function StepIcon({ status, isCurrent }: { status: string; isCurrent: boolean }) {
  if (status.includes("COMPLETED")) return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
  if (status.includes("FAILED"))    return <XCircle size={14} className="text-red-500 shrink-0" />;
  if (isCurrent)                    return <div className="lc-spin" />;
  return <Circle size={14} className="text-slate-400 shrink-0" />;
}

// ─── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const n = new Date();
      setTime(
        String(n.getHours()).padStart(2, "0") + ":" +
        String(n.getMinutes()).padStart(2, "0") + ":" +
        String(n.getSeconds()).padStart(2, "0")
      );
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "var(--lc-font-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--lc-text-dim)" }}>
      {time}
    </span>
  );
}

// ─── Waveform ─────────────────────────────────────────────────────────────────
// Each bar height is derived from real scan data:
//  - Base shape comes from logs.length so bars grow as more output arrives
//  - Speed and color driven by run.status
//  - No random seeds — every user sees the same bar for the same scan state
function Waveform({ status, logCount, findings }: { status: string; logCount: number; findings: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isRunning   = status === "RUNNING";
  const isCompleted = /completed/i.test(status);
  const isFailed    = /failed/i.test(status);

  const BAR_COUNT = 22;

  // Render a flat placeholder on the server / before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="lc-waveform">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            className="lc-wave-bar"
            style={{ height: "8%", background: "rgba(var(--lc-neon-rgb,0,208,178),0.15)", "--d": "3s", "--delay": "0s" } as React.CSSProperties}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="lc-waveform">
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const phase = (i / BAR_COUNT) * Math.PI * 2;
        const logFactor = Math.min(logCount / 50, 1);
        const findingBoost = Math.min(findings * 2, 20);

        const h = isRunning
          ? 15 + (Math.abs(Math.sin(phase + logCount * 0.1)) * 60 * logFactor) + findingBoost + (i % 3 === 0 ? 10 : 0)
          : isCompleted
          ? 20 + Math.abs(Math.sin(phase)) * 35
          : isFailed
          ? 8 + Math.abs(Math.sin(phase)) * 18
          : 5 + Math.abs(Math.sin(phase)) * 12;

        const d = isRunning
          ? 0.35 + (i % 5) * 0.08
          : isCompleted ? 1.4 + (i % 4) * 0.25
          : isFailed    ? 1.8 + (i % 4) * 0.3
          : 3.0  + (i % 5) * 0.5;

        const delay = (i * 0.04) * (isRunning ? 1 : 2);

        const color = isRunning
          ? findings > 0 && i % 4 === 0 ? "rgba(255,60,172,0.7)"
          : i % 6 === 0               ? "rgba(0,170,255,0.65)"
          : "rgba(var(--lc-neon-rgb,0,208,178),0.55)"
          : isCompleted ? "rgba(16,185,129,0.5)"
          : isFailed    ? "rgba(239,68,68,0.45)"
          : "rgba(var(--lc-neon-rgb,0,208,178),0.15)";

        return (
          <div
            key={i}
            className="lc-wave-bar"
            style={{
              height: `${Math.round(Math.max(4, Math.min(100, h)))}%`,
              background: color,
              "--d": `${d.toFixed(1)}s`,
              "--delay": `${delay.toFixed(2)}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// ─── Data Stream ──────────────────────────────────────────────────────────────
// Only shows real scan log lines. No fake idle ticker.
// When there are no logs yet, shows a neutral "waiting" placeholder.
function DataStream({ logs }: { logs: LogLine[] }) {
  if (logs.length === 0) {
    return (
      <div className="lc-stream" style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--lc-font-mono)", fontSize: 12, color: "var(--lc-text-dim)", opacity: 0.5 }}>
          — waiting for scan output —
        </span>
      </div>
    );
  }

  return (
    <div className="lc-stream">
      {logs.slice(-8).map((l) => (
        <div key={l.id} className="lc-stream-line">&gt; {l.text}</div>
      ))}
    </div>
  );
}

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircProgress({ value }: { value: number }) {
  const CIRC = 2 * Math.PI * 44;
  const offset = CIRC * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(var(--lc-neon-rgb,0,208,178),0.08)" strokeWidth="6" />
        <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(var(--lc-neon-rgb,0,208,178),0.13)" strokeWidth="1" strokeDasharray="2 6" />
        <circle
          className="lc-circ-ring"
          cx="55" cy="55" r="44"
          fill="none"
          stroke="var(--lc-neon)"
          strokeWidth="6"
          strokeLinecap="square"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          style={{ filter: "drop-shadow(0 0 5px rgba(var(--lc-neon-rgb,0,208,178),0.55))" }}
        />
        <text x="55" y="51" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--lc-neon)"
          style={{ fontFamily: "var(--lc-font-mono)" }}>
          {Math.round(value)}%
        </text>
        <text x="55" y="65" textAnchor="middle" fontSize="8" letterSpacing="2" fill="var(--lc-text-dim)"
          style={{ fontFamily: "var(--lc-font-mono)" }}>
          COMPLETE
        </text>
      </svg>
    </div>
  );
}

// ─── Threat Meter ─────────────────────────────────────────────────────────────
function ThreatMeter({ score = 0 }: { score?: number }) {
  const level = score <= 0 ? "NONE" : score < 3 ? "LOW" : score < 6 ? "MEDIUM" : score < 8 ? "HIGH" : "CRITICAL";
  const color =
    score <= 0 ? "var(--lc-text-dim)"
    : score < 3 ? "var(--lc-neon)"
    : score < 6 ? "var(--lc-amber)"
    : "var(--lc-red)";
  const filled = Math.round((Math.min(score, 10) / 10) * 7);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 20, fontWeight: 700, color, textShadow: `0 0 10px ${color}55` }}>
          {level}
        </span>
        <span style={{ fontFamily: "var(--lc-font-mono)", fontSize: 18, fontWeight: 700, color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="lc-threat-seg"
            style={{
              background: i < filled ? color : "rgba(100,116,139,0.12)",
              boxShadow: i < filled ? `0 0 5px ${color}55` : "none",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 10, color: "var(--lc-text-dim)", letterSpacing: "0.1em" }}>LOW</span>
        <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 10, color: "var(--lc-text-dim)", letterSpacing: "0.1em" }}>CRITICAL</span>
      </div>
    </div>
  );
}

// ─── Env / Client Info ─────────────────────────────────────────────────────────
// All values read from the real browser APIs — every user gets their own data.
// Covers: Browser+version, OS, CPU cores, RAM, Network type, Online status.
type EnvCard = { label: string; value: string };

type NavExtended = Navigator & {
  userAgentData?: {
    platform?: string;
    brands?: { brand: string; version: string }[];
  };
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number };
};

function buildClientProfile(): EnvCard[] {
  if (typeof window === "undefined") {
    return [
      { label: "Browser",  value: "—" },
      { label: "OS",       value: "—" },
      { label: "CPU",      value: "—" },
      { label: "Network",  value: "—" },
    ];
  }

  const nav = navigator as NavExtended;
  const ua  = nav.userAgent ?? "";

  // ── Browser detection ──────────────────────────────────────────────────────
  const edgeV    = ua.match(/Edg\/([\d]+)/i)?.[1];
  const chromeV  = ua.match(/Chrome\/([\d]+)/i)?.[1];
  const firefoxV = ua.match(/Firefox\/([\d]+)/i)?.[1];
  const operaV   = ua.match(/(?:OPR|Opera)\/([\d]+)/i)?.[1];
  const safariV  = ua.match(/Version\/([\d]+).*Safari/i)?.[1];
  const brand    = nav.userAgentData?.brands?.find((b) => !/not.?a.?brand/i.test(b.brand));
  const browser  =
    edgeV              ? `Edge ${edgeV}`
    : operaV           ? `Opera ${operaV}`
    : firefoxV         ? `Firefox ${firefoxV}`
    : safariV && !chromeV ? `Safari ${safariV}`
    : chromeV          ? `Chrome ${chromeV}`
    : brand            ? `${brand.brand} ${String(brand.version).split(".")[0]}`
    : "Unknown Browser";

  // ── OS detection ───────────────────────────────────────────────────────────
  const hint = `${nav.userAgentData?.platform ?? ""} ${nav.platform ?? ""} ${ua}`.toLowerCase();
  const os =
    /iphone|ipad|ipod/.test(hint)        ? "iOS"
    : /android/.test(hint)               ? "Android"
    : /macintosh|mac os x|macos/.test(hint) ? "macOS"
    : /win/.test(hint)                   ? "Windows"
    : /linux/.test(hint)                 ? "Linux"
    : "Unknown OS";

  // ── CPU ────────────────────────────────────────────────────────────────────
  const cores = Number.isFinite(nav.hardwareConcurrency)
    ? `${nav.hardwareConcurrency} cores`
    : "Unknown";

  // ── Network ────────────────────────────────────────────────────────────────
  const effectiveType = nav.connection?.effectiveType; // "4g" | "3g" | "2g" | "slow-2g"
  const online = nav.onLine;
  const networkLabel = !online
    ? "Offline"
    : effectiveType
    ? `Online · ${effectiveType.toUpperCase()}`
    : "Online";

  return [
    { label: "Browser", value: browser     },
    { label: "OS",      value: os          },
    { label: "CPU",     value: cores       },
    { label: "Network", value: networkLabel },
  ];
}

function ClientInfoGrid() {
  // Always start with placeholder "—" on both server and client first render
  // to avoid SSR/client mismatch. Real values are populated after mount.
  const [profile, setProfile] = useState<EnvCard[]>([
    { label: "Browser", value: "—" },
    { label: "OS",      value: "—" },
    { label: "CPU",     value: "—" },
    { label: "Network", value: "—" },
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(buildClientProfile());
  }, []);

  // Live network status updates — only after mount
  useEffect(() => {
    if (!mounted) return;
    const update = () =>
      setProfile((prev) =>
        prev.map((c) =>
          c.label === "Network"
            ? { ...c, value: buildClientProfile().find((x) => x.label === "Network")?.value ?? c.value }
            : c
        )
      );
    window.addEventListener("online",  update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online",  update);
      window.removeEventListener("offline", update);
    };
  }, [mounted]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {profile.map((c) => (
        <div key={c.label} className="lc-env-card">
          <div className="lc-env-label">{c.label}</div>
          <div className="lc-env-val">{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Draggable Panel ──────────────────────────────────────────────────────────
interface DraggablePanelProps {
  panelKey: PanelKey;
  label: string;
  icon?: React.ReactNode;
  accentColor?: string; // CSS color string for the hd-bar
  isDragging: boolean;
  isDragOver: boolean;
  isRunning?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onDragStart: (key: PanelKey) => void;
  onDragOver:  (e: React.DragEvent, key: PanelKey) => void;
  onDrop:      (e: React.DragEvent, key: PanelKey) => void;
  onDragEnd:   () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function DraggablePanel({
  panelKey, label, icon, accentColor, isDragging, isDragOver, isRunning = false,
  collapsible = false, defaultCollapsed = false,
  onDragStart, onDragOver, onDrop, onDragEnd,
  badge, children,
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
        "lc-panel",
        isRunning                    && "lc-running",
        isDragging                   && "lc-dragging",
        isDragOver && !isDragging    && "lc-drag-over",
      )}
    >
      {/* ── Header ── */}
      <div
        className="lc-hd"
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
        style={{ cursor: collapsible ? "pointer" : "grab" }}
      >
        {/* override left-bar color if accent provided */}
        {accentColor && (
          <span style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
            background: `linear-gradient(180deg, ${accentColor}, transparent)`,
            zIndex: 5,
          }} />
        )}
        <GripVertical size={13} className="lc-grip" />
        {icon && <span style={{ color: "var(--lc-text-muted)" }}>{icon}</span>}
        <span className="lc-hd-label">{label}</span>
        {badge && <span style={{ marginLeft: 4 }}>{badge}</span>}
        <span className="lc-hd-spacer" />
        {isDragOver && !isDragging && (
          <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 11, color: "var(--lc-neon)", letterSpacing: "0.1em" }}>
            DROP HERE
          </span>
        )}
        {collapsible && !isDragOver && (
          <ChevronDown size={13} className={cn("lc-chevron", collapsed && "collapsed")}
            style={{ color: "var(--lc-text-dim)" }} />
        )}
      </div>

      {/* ── Body ── */}
      {!collapsed && <div style={{ padding: "12px 14px" }}>{children}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LiveConsole({
  run,
  errors,
  logs = [],
}: {
  run: ActiveRun;
  errors: string[];
  logs?: LogLine[];
}) {
  const [panels, setPanels]   = useState<PanelKey[]>([...DEFAULT_PANELS]);
  const [dragging, setDragging] = useState<PanelKey | null>(null);
  const [dragOver, setDragOver] = useState<PanelKey | null>(null);
  const isCustom = panels.join(",") !== DEFAULT_PANELS.join(",");

  // progress that slowly increments while running
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (run.status !== "RUNNING") return;
    const total = run.steps.length || 1;
    const done  = run.steps.filter((s) => s.status.includes("COMPLETED")).length;
    setProgress(Math.round((done / total) * 100));
  }, [run.steps, run.status]);

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

  const dp = (key: PanelKey) => ({
    panelKey:    key,
    isDragging:  dragging === key,
    isDragOver:  dragOver === key,
    onDragStart: handleDragStart,
    onDragOver:  handleDragOver,
    onDrop:      handleDrop,
    onDragEnd:   handleDragEnd,
  });

  const panelMap: Record<PanelKey, React.ReactNode> = {

    // ── STATUS ──
    status: (
      <DraggablePanel
        key="status"
        label="Live Output"
        icon={<Radio size={13} />}
        isRunning={run.status === "RUNNING"}
        badge={<StatusBadge status={run.status} />}
        {...dp("status")}
      >
        {/* System ID + Clock row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 12, letterSpacing: "0.14em", color: "var(--lc-text-dim)" }}>
            SYS/<span style={{ color: "var(--lc-neon)" }}>CONSOLE</span>
          </span>
          <LiveClock />
        </div>
        {/* Metric row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          <div className="lc-metric">
            <div className="lc-metric-label">Mode</div>
            <div className="lc-metric-val" style={{ fontSize: 16, marginTop: 4 }}>{run.mode}</div>
          </div>
          <div className="lc-metric">
            <div className="lc-metric-label">Steps</div>
            <div className="lc-metric-val">{run.steps.length || 0}</div>
          </div>
          <div className="lc-metric">
            <div className="lc-metric-label">Findings</div>
            <div className="lc-metric-val">{run.findings || 0}</div>
          </div>
        </div>
        {/* Waveform */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: "var(--lc-font-ui)", fontSize: 11, letterSpacing: "0.14em", color: "var(--lc-text-dim)", marginBottom: 5 }}>
            SIGNAL
          </div>
          <Waveform status={run.status} logCount={logs.length} findings={run.findings} />
        </div>
      </DraggablePanel>
    ),

    // ── STEPS ──
    steps: (
      <DraggablePanel
        key="steps"
        label="Pipeline"
        icon={<Radio size={13} />}
        isRunning={run.status === "RUNNING"}
        collapsible
        badge={
          run.steps.length > 0
            ? <span className="lc-pill lc-pill-neon">{run.steps.length}</span>
            : undefined
        }
        {...dp("steps")}
      >
        {!run.steps.length ? (
          <p style={{ fontFamily: "var(--lc-font-ui)", fontSize: 13, color: "var(--lc-text-dim)", padding: "4px 0" }}>
            No steps running yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {run.steps.map((step, i) => {
              const isCurrent = step.step_id === run.stepId;
              const isDone    = step.status.includes("COMPLETED");
              const isFailed  = step.status.includes("FAILED");
              const rowCls    = isCurrent ? "lc-step-current" : isDone ? "lc-step-done" : isFailed ? "lc-step-failed" : "lc-step-idle";
              const numCls    = isCurrent ? "lc-step-num-current" : isDone ? "lc-step-num-done" : isFailed ? "lc-step-num-failed" : "lc-step-num-idle";
              const stsCls    = isCurrent ? "lc-step-status-current" : isDone ? "lc-step-status-done" : isFailed ? "lc-step-status-failed" : "lc-step-status-idle";
              return (
                <div key={step.step_id} className={cn("lc-step", rowCls)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StepIcon status={step.status} isCurrent={isCurrent} />
                    <span className={cn("lc-step-num", numCls)}>{i + 1}</span>
                    <span style={{
                      fontFamily: "var(--lc-font-mono)", fontSize: 13, fontWeight: 600,
                      color: isCurrent ? "var(--lc-neon)" : isDone ? "#10b981" : isFailed ? "var(--lc-red)" : "#64748b",
                    }}>
                      {step.tool_name}
                    </span>
                  </div>
                  <span className={cn("lc-step-status", stsCls)}>
                    {step.status.replace("STEP_STATUS_", "")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {/* Progress ring below steps when running */}
        {run.status === "RUNNING" && run.steps.length > 0 && (
          <div style={{ marginTop: 12, borderTop: "1px solid var(--lc-panel-border)", paddingTop: 12 }}>
            <div style={{ fontFamily: "var(--lc-font-ui)", fontSize: 11, letterSpacing: "0.14em", color: "var(--lc-text-dim)", marginBottom: 4 }}>
              SCAN PROGRESS
            </div>
            <CircProgress value={progress} />
          </div>
        )}
      </DraggablePanel>
    ),

    // ── CLIENT INFO ──
    findings: (
      <DraggablePanel
        key="findings"
        label="Environment"
        icon={<Activity size={13} />}
        badge={
          run.findings > 0
            ? <span className="lc-pill lc-pill-rose">{run.findings} found</span>
            : undefined
        }
        {...dp("findings")}
      >
        <ClientInfoGrid />
        {/* Live feed — only shown when scan has produced output */}
        <div style={{ marginTop: 12, borderTop: "1px solid var(--lc-panel-border)", paddingTop: 10 }}>
          <div style={{ fontFamily: "var(--lc-font-ui)", fontSize: 11, letterSpacing: "0.14em", color: "var(--lc-text-dim)", marginBottom: 6 }}>
            {logs.length > 0 ? `LIVE FEED · ${logs.length} lines` : "LIVE FEED"}
          </div>
          <DataStream logs={logs} />
        </div>
      </DraggablePanel>
    ),

    // ── ERRORS ──
    errors: errors.length > 0 ? (
      <DraggablePanel
        key="errors"
        label="Scan Errors"
        icon={<AlertTriangle size={13} />}
        accentColor="var(--lc-red)"
        collapsible
        badge={<span className="lc-pill lc-pill-red">{errors.length}</span>}
        {...dp("errors")}
      >
        <div>
          {errors.slice(-5).map((error, i) => (
            <div key={`${error}-${i}`} className="lc-error-row">
              <AlertTriangle size={12} style={{ color: "var(--lc-red)", marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 13, color: "rgba(239,68,68,0.9)", wordBreak: "break-word" }}>
                {error}
              </span>
            </div>
          ))}
        </div>
        {/* Threat meter below errors — score based on findings + errors */}
        <div style={{ marginTop: 10, borderTop: "1px solid rgba(239,68,68,0.12)", paddingTop: 10 }}>
          <div style={{ fontFamily: "var(--lc-font-ui)", fontSize: 11, letterSpacing: "0.14em", color: "var(--lc-text-dim)", marginBottom: 8 }}>
            THREAT LEVEL
          </div>
          <ThreatMeter score={Math.min(10, errors.length * 1.5 + Math.min(run.findings * 0.3, 4))} />
        </div>
      </DraggablePanel>
    ) : null,
  };

  return (
    <>
      <InjectStyles />
      <aside className="lc-aside space-y-2">

        {/* ── System ID bar ── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px", marginBottom: 2,
            background: "var(--lc-toolbar-bg)",
            outline: "1px solid var(--lc-panel-border)",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            position: "relative", overflow: "hidden",
          }}
        >
          <span style={{ fontFamily: "var(--lc-font-ui)", fontSize: 12, letterSpacing: "0.16em", color: "var(--lc-text-muted)" }}>
            SYS/<span style={{ color: "var(--lc-neon)" }}>LIVECONSOLE</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {run.status === "RUNNING" && <span className="lc-dot-blink" />}
            <LiveClock />
          </div>
          {/* bottom glow line */}
          <span style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, var(--lc-neon), transparent)",
            opacity: 0.3,
          }} />
        </div>

        {/* ── Drag toolbar ── */}
        <div className="lc-toolbar">
          <div className="lc-toolbar-left">
            <LayoutGrid size={13} />
            DRAG PANELS TO REORDER
          </div>
          {isCustom && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPanels([...DEFAULT_PANELS])}
              style={{
                height: 26, gap: 5, fontFamily: "var(--lc-font-ui)",
                fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--lc-text-muted)",
              }}
            >
              <RotateCcw size={10} />
              RESET
            </Button>
          )}
        </div>

        {/* ── Panels ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {panels.map((key) => panelMap[key] ?? null)}
        </div>

      </aside>
    </>
  );
}