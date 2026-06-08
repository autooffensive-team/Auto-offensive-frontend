"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ActiveRun, LogLine, Project } from "@/types/scan";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemProfileItem = { label: string; value: string; tone: string };

export type RadarState = {
  sweepDuration: number;
  sweepTone: string;
  pulseTone: string;
  blips: { x: number; y: number; delay: number }[];
  badge: string;
};

// ─── SidebarTraces SVG — static only, no trace-flow animations ───────────────
// (stroke-dashoffset animations on SVG paths adjacent to the xterm canvas
// were causing GPU compositing repaints visible as typing flicker)
function SidebarTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 260 800" preserveAspectRatio="xMidYMid slice">
      <path className="trace-base" d="M20 0 V30 H30 V60" />
      <path className="trace-base" d="M240 0 V30 H230 V60" />
      <path className="trace-base" d="M20 740 V770 H30 V800" />
      <path className="trace-base" d="M240 740 V770 H230 V800" />
      <path className="trace-base" d="M10 380 H40 V390 H70" />
      <path className="trace-base" d="M250 400 H220 V410 H190" />
      <path className="trace-base" d="M0 200 L15 200 L25 210 L40 210" />
      <path className="trace-base" d="M260 600 L245 600 L235 590 L220 590" />
      <circle className="trace-dot" cx="30" cy="60" r="2" />
      <circle className="trace-dot" cx="230" cy="60" r="2" />
      <circle className="trace-dot" cx="30" cy="770" r="2" />
      <circle className="trace-dot" cx="230" cy="770" r="2" />
      <circle className="trace-dot" cx="70" cy="390" r="2" />
      <circle className="trace-dot" cx="190" cy="410" r="2" />
      <circle className="trace-dot" cx="40" cy="210" r="2" />
      <circle className="trace-dot" cx="220" cy="590" r="2" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TerminalSidebarProps {
  selectedProject: Project | undefined;
  logs: LogLine[];
  run: ActiveRun;
  errors: string[];
  isSubmitting: boolean;
  showDecorations: boolean;
  systemProfile: SystemProfileItem[];
  /** When true the sidebar is rendered as a fixed drawer (mobile/tablet). */
  asDrawer?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function TerminalSidebar({
  selectedProject,
  logs,
  run,
  errors,
  isSubmitting,
  showDecorations,
  systemProfile,
  asDrawer = false,
}: TerminalSidebarProps) {
  // ── Real Browser Performance Metrics ──────────────────────────────────────
  const [perfStats, setPerfStats] = useState({
    memory: 0,
    memoryMax: 0,
    timing: 0,
    fps: 0,
    ping: 0,
    logRate: 0,
  });
  const lastLogCountRef = useRef(0);
  const lastLogTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  useEffect(() => {
    let rafId: number;
    const countFrame = () => {
      frameCountRef.current++;
      rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);

    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastFpsTimeRef.current) / 1000;
      const fps = Math.round(frameCountRef.current / elapsed);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;

      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      };
      const memUsed = perf.memory ? Math.round(perf.memory.usedJSHeapSize / 1024 / 1024) : 0;
      const memMax  = perf.memory ? Math.round(perf.memory.jsHeapSizeLimit  / 1024 / 1024) : 0;

      const logDelta = logs.length - lastLogCountRef.current;
      const timeDelta = (now - lastLogTimeRef.current) / 1000;
      const rate = timeDelta > 0 ? Math.round(logDelta / timeDelta) : 0;
      lastLogCountRef.current = logs.length;
      lastLogTimeRef.current = now;

      setPerfStats({
        memory: memUsed,
        memoryMax: memMax,
        timing: Math.round(performance.now() / 1000),
        fps: Math.min(fps, 144),
        ping: 0,
        logRate: Math.max(0, rate),
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, [logs.length]);

  // ── Wrapper style — absolute (desktop) vs full-height flex (drawer) ───────
  const wrapperStyle = asDrawer
    ? {
        position: "relative" as const,
        width: "100%",
        height: "100%",
        isolation: "isolate" as const,
        overflowX: "hidden" as const,
      }
    : {
        position: "absolute" as const,
        top: 0, right: 0, bottom: 0,
        width: "260px",
        isolation: "isolate" as const,
        overflowX: "hidden" as const,
      };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: asDrawer ? 0 : 0.3 }}
      className="flex flex-col z-10 overflow-y-auto bg-black/70 backdrop-blur-md border-l border-green-500/20"
      style={wrapperStyle}
    >
      {/* Corner decorations */}
      {showDecorations && (
        <>
          <span className="corner-bracket corner-bracket-tl" />
          <span className="corner-bracket corner-bracket-tr" />
          <span className="corner-bracket corner-bracket-bl" />
          <span className="corner-bracket corner-bracket-br" />
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <SidebarTraces />
          </div>
        </>
      )}

      {/* ── Header — extra top padding when used as drawer (room for close btn) */}
      <div className={`relative z-10 border-b border-green-500/15 flex items-center justify-between ${asDrawer ? "px-4 pt-12 pb-3" : "px-4 py-3"}`}>
        <div className="flex items-center gap-2">
          <span className="status-dot w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-green-400/80 uppercase">
            Scan Analytics
          </span>
        </div>
        <span className="text-[9px] font-(family-name:--font-fira-code) text-green-400/60 tracking-widest">SYS</span>
      </div>

      {/* ── Project + Status row ── */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/10 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/70 tracking-[0.18em] uppercase mb-1">Project</div>
          <div className="text-[11px] font-(family-name:--font-fira-code) text-green-300 truncate">
            {selectedProject?.name || "—"}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/70 tracking-[0.18em] uppercase mb-1">Status</div>
          <div className="flex items-center gap-1.5">
            {/* CSS pulse — no framer RAF */}
            <span className={`status-dot w-1.5 h-1.5 rounded-full inline-block ${isSubmitting ? "bg-green-400" : "bg-green-500/30"}`} />
            <span className={`text-[10px] font-(family-name:--font-fira-code) ${isSubmitting ? "text-green-400" : "text-amber-400/80"}`}>
              {isSubmitting ? "RUNNING" : "IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3 Stat cards: Findings / Logs / Errors ── */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/10 grid grid-cols-3 gap-2">
        {[
          { label: "Vulns",  value: run.findings || 0,  color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "Logs",   value: logs.length,         color: "text-cyan-400",    border: "border-cyan-500/20" },
          {
            label: "Errors",
            value: errors.length,
            color: errors.length > 0 ? "text-red-400" : "text-green-500/30",
            border: errors.length > 0 ? "border-red-500/30" : "border-green-500/10",
          },
        ].map((s) => (
          <div key={s.label} className={`bg-black/40 border ${s.border} rounded-lg p-2 text-center`}>
            <div className={`text-xl font-(family-name:--font-fira-code) font-bold ${s.color}`}>
              {s.value}
            </div>
            <div className="text-[8px] font-(family-name:--font-fira-code) text-cyan-400/60 tracking-widest uppercase mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Performance metrics ── */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/10 space-y-2">
        <div className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/70 tracking-[0.18em] uppercase">Performance</div>

        {/* FPS — segmented LED */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-(family-name:--font-fira-code) text-lime-400/80 tracking-widest">FPS</span>
            <motion.span
              className={`text-[13px] font-(family-name:--font-fira-code) font-black tabular-nums ${
                perfStats.fps >= 45 ? "text-green-400" : perfStats.fps >= 20 ? "text-yellow-400" : "text-red-400"
              }`}
              style={{
                textShadow:
                  perfStats.fps >= 45
                    ? "0 0 8px rgba(74,222,128,0.8)"
                    : perfStats.fps >= 20
                    ? "0 0 8px rgba(250,204,21,0.8)"
                    : "0 0 8px rgba(239,68,68,0.8)",
              }}
            >
              {perfStats.fps}
            </motion.span>
          </div>
          <div className="flex gap-px h-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const filled = i < Math.round((Math.min(perfStats.fps, 60) / 60) * 30);
              const isHigh = i >= 24;
              const isMid  = i >= 15 && i < 24;
              const bg = filled
                ? isHigh ? "rgba(239,68,68,1)" : isMid ? "rgba(250,204,21,1)" : "rgba(74,222,128,1)"
                : "rgba(255,255,255,0.04)";
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[1px]"
                  style={{ backgroundColor: bg }}
                />
              );
            })}
          </div>
        </div>

        {/* HEAP */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/80 tracking-widest">HEAP</span>
            <span
              className="text-[13px] font-(family-name:--font-fira-code) font-black text-cyan-400 tabular-nums"
              style={{ textShadow: "0 0 8px rgba(34,211,238,0.7)" }}
            >
              {perfStats.memory > 0 ? `${perfStats.memory}` : "—"}
              <span className="text-[9px] font-normal text-cyan-400/60">MB</span>
            </span>
          </div>
          {perfStats.memory > 0 && perfStats.memoryMax > 0 ? (
            <div className="relative h-2 bg-white/3 rounded-sm overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-cyan-600 to-cyan-300 rounded-sm transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, (perfStats.memory / perfStats.memoryMax) * 100)}%`,
                  boxShadow: "0 0 8px rgba(34,211,238,0.5)",
                }}
              />
            </div>
          ) : (
            <div className="h-2 bg-white/3 rounded-sm flex items-center px-2">
              <span className="text-[8px] font-(family-name:--font-fira-code) text-cyan-500/20">Chrome only</span>
            </div>
          )}
        </div>

        {/* Log/s + Uptime */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-md px-2 py-1.5">
            <div className="text-[8px] font-(family-name:--font-fira-code) text-purple-400/80 tracking-widest uppercase">Log/s</div>
            <div
              className="text-[16px] font-(family-name:--font-fira-code) font-black text-purple-400 tabular-nums leading-tight"
              style={{ textShadow: "0 0 10px rgba(168,85,247,0.7)" }}
            >
              {perfStats.logRate}
            </div>
          </div>
          <div className="bg-green-500/5 border border-green-500/10 rounded-md px-2 py-1.5">
            <div className="text-[8px] font-(family-name:--font-fira-code) text-green-400/70 tracking-widest uppercase">Uptime</div>
            <div className="text-[13px] font-(family-name:--font-fira-code) font-bold text-green-300 tabular-nums leading-tight">
              {perfStats.timing}s
            </div>
          </div>
        </div>
      </div>

      {/* ── Environment rows ── */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/10 space-y-1.5">
        <div className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/70 tracking-[0.18em] uppercase mb-2">Environment</div>
        {systemProfile.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[9px] font-(family-name:--font-fira-code) text-orange-400/70 uppercase tracking-wider">{item.label}</span>
            <span className={`text-[10px] font-(family-name:--font-fira-code) font-semibold ${item.tone}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Recent logs ── */}
      <div className="relative z-10 px-4 py-3 border-b border-green-500/10 flex-1 min-h-0">
        {showDecorations && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 0.4 }}
            viewBox="0 0 260 120"
            preserveAspectRatio="none"
          >
            <path className="trace-base" d="M0 20 H16 V10 H36" />
            <path className="trace-base" d="M260 20 H244 V10 H224" />
            <path className="trace-base" d="M0 100 H16 V110 H36" />
            <path className="trace-base" d="M260 100 H244 V110 H224" />
            <circle className="trace-dot" cx="36"  cy="10"  r="1.5" />
            <circle className="trace-dot" cx="224" cy="10"  r="1.5" />
            <circle className="trace-dot" cx="36"  cy="110" r="1.5" />
            <circle className="trace-dot" cx="224" cy="110" r="1.5" />
          </svg>
        )}
        <div className="relative z-10">
          <div className="text-[9px] font-(family-name:--font-fira-code) text-cyan-400/70 tracking-[0.18em] uppercase mb-2">Recent</div>
          <div className="space-y-1.5">
            {logs.slice(-4).length > 0
              ? logs.slice(-4).map((log, idx) => (
                  <motion.div
                    key={idx}
                    className="text-[9px] font-(family-name:--font-fira-code) text-green-300/50 truncate leading-relaxed"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="text-green-500/30 mr-1">›</span>
                    {log.text.substring(0, 28)}
                  </motion.div>
                ))
              : (
                <div className="text-[9px] font-(family-name:--font-fira-code) text-green-400/40 italic">
                  awaiting output…
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 px-4 py-3 border-t border-green-500/15 mt-auto">
        {showDecorations && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 0.4 }}
            viewBox="0 0 260 70"
            preserveAspectRatio="none"
          >
            <path className="trace-base" d="M0 14 H14 V6 H32" />
            <path className="trace-base" d="M260 14 H246 V6 H228" />
            <path className="trace-base" d="M0 56 H14 V64 H32" />
            <path className="trace-base" d="M260 56 H246 V64 H228" />
            <circle className="trace-dot" cx="32"  cy="6"  r="1.5" />
            <circle className="trace-dot" cx="228" cy="6"  r="1.5" />
            <circle className="trace-dot" cx="32"  cy="64" r="1.5" />
            <circle className="trace-dot" cx="228" cy="64" r="1.5" />
          </svg>
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-(family-name:--font-fira-code) text-red-500 tracking-widest uppercase opacity-80">
            Connection
          </span>
          <span className="text-[9px] font-(family-name:--font-fira-code) text-green-500 tracking-widest uppercase opacity-80">
            Active
          </span>
        </div>
        <div className="text-[9px] font-(family-name:--font-fira-code)">
          <span className="text-yellow-500">v7.2.1-</span>
          <span className="text-red-500">advanced</span>
        </div>
      </div>
    </motion.div>
  );
}