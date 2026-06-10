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

// ─── SidebarTraces SVG — animated on isolated GPU layer ──────────────────────
// will-change:transform on .circuit-traces promotes this SVG to its own
// compositing layer so stroke-dashoffset repaints never touch the xterm canvas.
function SidebarTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 260 800" preserveAspectRatio="xMidYMid slice">
      <path className="trace-base" d="M20 0 V30 H30 V60" />
      <path className="trace-flow trace-c1" d="M20 0 V30 H30 V60" />
      <path className="trace-base" d="M240 0 V30 H230 V60" />
      <path className="trace-flow trace-c2" d="M240 0 V30 H230 V60" />
      <path className="trace-base" d="M20 740 V770 H30 V800" />
      <path className="trace-flow trace-c3" d="M20 740 V770 H30 V800" />
      <path className="trace-base" d="M240 740 V770 H230 V800" />
      <path className="trace-flow trace-c4" d="M240 740 V770 H230 V800" />
      <path className="trace-base" d="M10 380 H40 V390 H70" />
      <path className="trace-flow trace-c2" d="M10 380 H40 V390 H70" />
      <path className="trace-base" d="M250 400 H220 V410 H190" />
      <path className="trace-flow trace-c3" d="M250 400 H220 V410 H190" />
      <path className="trace-base" d="M0 200 L15 200 L25 210 L40 210" />
      <path className="trace-flow trace-c1" d="M0 200 L15 200 L25 210 L40 210" />
      <path className="trace-base" d="M260 600 L245 600 L235 590 L220 590" />
      <path className="trace-flow trace-c4" d="M260 600 L245 600 L235 590 L220 590" />
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
  /** Theme accent color (rgba string) — drives the sidebar left border. */
  accentColor?: string;
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
  accentColor,
}: TerminalSidebarProps) {
  // Helper: produce rgba from accentColor prop (already an rgba string) at a
  // different opacity. Falls back to emerald-green when not provided.
  const ac = accentColor ?? "rgba(34,197,94,0.2)";

  // Extract the raw rgb part so we can re-alpha it cheaply.
  // accentColor is always in the form "rgba(r,g,b,a)" from themeAccent.at()
  const acRgb = (() => {
    const m = ac.match(/rgba?\((\d+),(\d+),(\d+)/);
    return m ? `${m[1]},${m[2]},${m[3]}` : "34,197,94";
  })();
  const a = (alpha: number) => `rgba(${acRgb},${alpha})`;
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
      className="flex flex-col z-10 overflow-y-auto bg-black/70 backdrop-blur-md border-l"
      style={{ ...wrapperStyle, borderLeftColor: a(0.25) }}
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

      {/* ── Header ── */}
      <div
        className={`relative z-10 border-b flex items-center justify-between ${asDrawer ? "px-4 pt-12 pb-3" : "px-4 py-3"}`}
        style={{ borderBottomColor: a(0.2) }}
      >
        <div className="flex items-center gap-2">
          <span className="status-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: a(0.9) }} />
          <span className="text-[11px] font-mono font-bold tracking-[0.22em] uppercase" style={{ color: a(0.85) }}>
            Scan Analytics
          </span>
        </div>
        <span className="text-[9px] font-(family-name:--font-fira-code) tracking-widest" style={{ color: a(0.6) }}>SYS</span>
      </div>

      {/* ── Project + Status row ── */}
      <div className="relative z-10 px-4 py-3 grid grid-cols-2 gap-3 border-b" style={{ borderBottomColor: a(0.12) }}>
        <div>
          <div className="text-[9px] font-(family-name:--font-fira-code) tracking-[0.18em] uppercase mb-1" style={{ color: a(0.6) }}>Project</div>
          <div className="text-[11px] font-(family-name:--font-fira-code) truncate" style={{ color: a(0.9) }}>
            {selectedProject?.name || "—"}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-(family-name:--font-fira-code) tracking-[0.18em] uppercase mb-1" style={{ color: a(0.6) }}>Status</div>
          <div className="flex items-center gap-1.5">
            <span
              className="status-dot w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: isSubmitting ? a(0.9) : a(0.3) }}
            />
            <span
              className="text-[10px] font-(family-name:--font-fira-code)"
              style={{ color: isSubmitting ? a(1) : "rgba(251,191,36,0.8)" }}
            >
              {isSubmitting ? "RUNNING" : "IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3 Stat cards: Findings / Logs / Errors ── */}
      <div className="relative z-10 px-4 py-3 border-b grid grid-cols-3 gap-2" style={{ borderBottomColor: a(0.12) }}>
        {[
          { label: "Vulns",  value: run.findings || 0,  colorStyle: { color: a(0.9) },                  borderStyle: { borderColor: a(0.2) } },
          { label: "Logs",   value: logs.length,         colorStyle: { color: "rgba(34,211,238,0.9)" },  borderStyle: { borderColor: "rgba(34,211,238,0.2)" } },
          {
            label: "Errors",
            value: errors.length,
            colorStyle: { color: errors.length > 0 ? "rgba(248,113,113,0.9)" : a(0.3) },
            borderStyle: { borderColor: errors.length > 0 ? "rgba(248,113,113,0.3)" : a(0.1) },
          },
        ].map((s) => (
          <div key={s.label} className="bg-black/40 border rounded-lg p-2 text-center" style={s.borderStyle}>
            <div className="text-xl font-(family-name:--font-fira-code) font-bold" style={s.colorStyle}>
              {s.value}
            </div>
            <div className="text-[8px] font-(family-name:--font-fira-code) tracking-widest uppercase mt-0.5" style={{ color: "rgba(34,211,238,0.6)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Performance metrics ── */}
      <div className="relative z-10 px-4 py-3 border-b space-y-2" style={{ borderBottomColor: a(0.12) }}>
        <div className="text-[9px] font-(family-name:--font-fira-code) tracking-[0.18em] uppercase" style={{ color: a(0.6) }}>Performance</div>

        {/* FPS — segmented LED */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-(family-name:--font-fira-code) tracking-widest" style={{ color: a(0.7) }}>FPS</span>
            <motion.span
              className="text-[13px] font-(family-name:--font-fira-code) font-black tabular-nums"
              style={{
                color: perfStats.fps >= 45 ? "rgba(74,222,128,1)" : perfStats.fps >= 20 ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)",
                textShadow: perfStats.fps >= 45 ? "0 0 8px rgba(74,222,128,0.8)" : perfStats.fps >= 20 ? "0 0 8px rgba(250,204,21,0.8)" : "0 0 8px rgba(239,68,68,0.8)",
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
              return <div key={i} className="flex-1 rounded-[1px]" style={{ backgroundColor: bg }} />;
            })}
          </div>
        </div>

        {/* HEAP */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] font-(family-name:--font-fira-code) tracking-widest" style={{ color: "rgba(34,211,238,0.8)" }}>HEAP</span>
            <span className="text-[13px] font-(family-name:--font-fira-code) font-black tabular-nums" style={{ color: "rgba(34,211,238,1)", textShadow: "0 0 8px rgba(34,211,238,0.7)" }}>
              {perfStats.memory > 0 ? `${perfStats.memory}` : "—"}
              <span className="text-[9px] font-normal" style={{ color: "rgba(34,211,238,0.6)" }}>MB</span>
            </span>
          </div>
          {perfStats.memory > 0 && perfStats.memoryMax > 0 ? (
            <div className="relative h-2 rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, (perfStats.memory / perfStats.memoryMax) * 100)}%`,
                  background: "linear-gradient(to right, rgba(8,145,178,1), rgba(34,211,238,1))",
                  boxShadow: "0 0 8px rgba(34,211,238,0.5)",
                }}
              />
            </div>
          ) : (
            <div className="h-2 rounded-sm flex items-center px-2" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <span className="text-[8px] font-(family-name:--font-fira-code)" style={{ color: "rgba(34,211,238,0.2)" }}>Chrome only</span>
            </div>
          )}
        </div>

        {/* Log/s + Uptime */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="rounded-md px-2 py-1.5" style={{ backgroundColor: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <div className="text-[8px] font-(family-name:--font-fira-code) tracking-widest uppercase" style={{ color: "rgba(168,85,247,0.8)" }}>Log/s</div>
            <div className="text-[16px] font-(family-name:--font-fira-code) font-black tabular-nums leading-tight" style={{ color: "rgba(168,85,247,1)", textShadow: "0 0 10px rgba(168,85,247,0.7)" }}>
              {perfStats.logRate}
            </div>
          </div>
          <div className="rounded-md px-2 py-1.5" style={{ backgroundColor: a(0.05), border: `1px solid ${a(0.1)}` }}>
            <div className="text-[8px] font-(family-name:--font-fira-code) tracking-widest uppercase" style={{ color: a(0.7) }}>Uptime</div>
            <div className="text-[13px] font-(family-name:--font-fira-code) font-bold tabular-nums leading-tight" style={{ color: a(0.9) }}>
              {perfStats.timing}s
            </div>
          </div>
        </div>
      </div>

      {/* ── Environment rows ── */}
      <div className="relative z-10 px-4 py-3 border-b space-y-1.5" style={{ borderBottomColor: a(0.12) }}>
        <div className="text-[9px] font-(family-name:--font-fira-code) tracking-[0.18em] uppercase mb-2" style={{ color: a(0.6) }}>Client Environment</div>
        {systemProfile.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[9px] font-(family-name:--font-fira-code) uppercase tracking-wider" style={{ color: "rgba(251,146,60,0.7)" }}>{item.label}</span>
            <span className={`text-[10px] font-(family-name:--font-fira-code) font-semibold ${item.tone}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Recent logs ── */}
      <div className="relative z-10 px-4 py-3 border-b flex-1 min-h-0" style={{ borderBottomColor: a(0.12) }}>
        {showDecorations && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 0.4, willChange: "transform", transform: "translateZ(0)" }}
            viewBox="0 0 260 120"
            preserveAspectRatio="none"
          >
            <path className="trace-base" d="M0 20 H16 V10 H36" />
            <path className="trace-flow trace-c1" d="M0 20 H16 V10 H36" />
            <path className="trace-base" d="M260 20 H244 V10 H224" />
            <path className="trace-flow trace-c3" d="M260 20 H244 V10 H224" />
            <path className="trace-base" d="M0 100 H16 V110 H36" />
            <path className="trace-flow trace-c2" d="M0 100 H16 V110 H36" />
            <path className="trace-base" d="M260 100 H244 V110 H224" />
            <path className="trace-flow trace-c4" d="M260 100 H244 V110 H224" />
            <circle className="trace-dot" cx="36"  cy="10"  r="1.5" />
            <circle className="trace-dot" cx="224" cy="10"  r="1.5" />
            <circle className="trace-dot" cx="36"  cy="110" r="1.5" />
            <circle className="trace-dot" cx="224" cy="110" r="1.5" />
          </svg>
        )}
        <div className="relative z-10">
          <div className="text-[9px] font-(family-name:--font-fira-code) tracking-[0.18em] uppercase mb-2" style={{ color: a(0.6) }}>Recent</div>
          <div className="space-y-1.5">
            {logs.slice(-4).length > 0
              ? logs.slice(-4).map((log, idx) => (
                  <motion.div
                    key={idx}
                    className="text-[9px] font-(family-name:--font-fira-code) truncate leading-relaxed"
                    style={{ color: a(0.5) }}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span style={{ color: a(0.3), marginRight: "4px" }}>›</span>
                    {log.text.substring(0, 28)}
                  </motion.div>
                ))
              : (
                <div className="text-[9px] font-(family-name:--font-fira-code) italic" style={{ color: a(0.4) }}>
                  awaiting output…
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 px-4 py-3 border-t mt-auto" style={{ borderTopColor: a(0.15) }}>
        {showDecorations && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, opacity: 0.4, willChange: "transform", transform: "translateZ(0)" }}
            viewBox="0 0 260 70"
            preserveAspectRatio="none"
          >
            <path className="trace-base" d="M0 14 H14 V6 H32" />
            <path className="trace-flow trace-c1" d="M0 14 H14 V6 H32" />
            <path className="trace-base" d="M260 14 H246 V6 H228" />
            <path className="trace-flow trace-c2" d="M260 14 H246 V6 H228" />
            <path className="trace-base" d="M0 56 H14 V64 H32" />
            <path className="trace-flow trace-c3" d="M0 56 H14 V64 H32" />
            <path className="trace-base" d="M260 56 H246 V64 H228" />
            <path className="trace-flow trace-c4" d="M260 56 H246 V64 H228" />
            <circle className="trace-dot" cx="32"  cy="6"  r="1.5" />
            <circle className="trace-dot" cx="228" cy="6"  r="1.5" />
            <circle className="trace-dot" cx="32"  cy="64" r="1.5" />
            <circle className="trace-dot" cx="228" cy="64" r="1.5" />
          </svg>
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-(family-name:--font-fira-code) tracking-widest uppercase opacity-80" style={{ color: "rgba(239,68,68,1)" }}>
            Connection
          </span>
          <span className="text-[9px] font-(family-name:--font-fira-code) tracking-widest uppercase opacity-80" style={{ color: a(1) }}>
            Active
          </span>
        </div>
        <div className="text-[9px] font-(family-name:--font-fira-code)">
          <span style={{ color: "rgba(234,179,8,1)" }}>v7.2.1-</span>
          <span style={{ color: "rgba(239,68,68,1)" }}>advanced</span>
        </div>
      </div>
    </motion.div>
  );
}