"use client";

import { motion, useInView } from "framer-motion";
import {
  AlertOctagon,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  Focus,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type { ComponentType, RefObject } from "react";
import { useRef, useEffect, useState } from "react";

import type {
  DependencySummaryResponse,
  QualityGateStatus,
  ScanSummaryResponse,
} from "@/types/scanner";
import { cn } from "@/lib/utils";
import { CodeScanOperationalMetrics } from "./code-scan-operational-metrics";
import { ScanProgressIndicator } from "./scan-progress-indicator";

type GradeTone = "green" | "lime" | "red" | "muted";
type MetricTone = "teal" | "emerald" | "amber" | "red" | "blue" | "slate";

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Grade Badge ──────────────────────────────────────────────────────────────
function GradeBadge({ grade }: { grade: { label: string; tone: GradeTone } }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-sm font-bold",
        grade.tone === "green" &&
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        grade.tone === "lime" &&
          "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
        grade.tone === "red" &&
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        grade.tone === "muted" &&
          "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      )}
    >
      {grade.label}
    </span>
  );
}

// ─── Ring Indicator ───────────────────────────────────────────────────────────
function RingIndicator({ tone }: { tone: "ok" | "bad" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border-4",
        tone === "ok" && "border-emerald-100 dark:border-emerald-500/20",
        tone === "bad" && "border-red-700 dark:border-red-500",
        tone === "neutral" && "border-slate-200 dark:border-slate-700",
      )}
    >
      {tone === "ok" && (
        <span className="size-2.5 rounded-full bg-emerald-500" />
      )}
      {tone === "neutral" && (
        <svg
          className="size-4 text-slate-500 dark:text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 2m6-11a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
    </span>
  );
}

// ─── Loading Icon ────────────────────────────────────────────────────────────
function LoadingIcon({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <RefreshCw className={cn("size-6 text-teal-500", className)} />
    </motion.div>
  );
}

// ─── Gauge SVG ────────────────────────────────────────────────────────────────
function GaugeSVG({
  pct,
  color,
  size = 120,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setAnimated(true), 60);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.38;
  const startAngle = (-210 * Math.PI) / 180;
  const endAngle = (30 * Math.PI) / 180;
  const totalAngle = endAngle - startAngle;
  const clamped = Math.max(0, Math.min(1, pct / 100));
  const fillAngle = startAngle + totalAngle * (animated ? clamped : 0);

  const arcPath = (sa: number, ea: number) => {
    const x1 = cx + r * Math.cos(sa);
    const y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea);
    const y2 = cy + r * Math.sin(ea);
    const lg = ea - sa > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`;
  };

  const dotX = cx + r * Math.cos(fillAngle);
  const dotY = cy + r * Math.sin(fillAngle);
  const h = size * 0.68;

  return (
    <svg
      ref={ref}
      width={size}
      height={h}
      viewBox={`0 0 ${size} ${h}`}
      fill="none"
      className="overflow-visible"
    >
      <path
        d={arcPath(startAngle, endAngle)}
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        className="text-[#e4eaf4] dark:text-slate-800"
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
      />
      {clamped > 0 && (
        <path
          d={arcPath(startAngle, fillAngle)}
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 80ms" }}
        />
      )}
      {clamped > 0 && (
        <circle
          cx={dotX}
          cy={dotY}
          r={5}
          fill={color}
          style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 80ms" }}
        />
      )}
    </svg>
  );
}

// ─── tone → gauge color map ───────────────────────────────────────────────────
const toneGaugeColor: Record<MetricTone, string> = {
  teal: "#1D9E75",
  emerald: "#16A34A",
  amber: "#EF9F27",
  red: "#E24B4A",
  blue: "#378ADD",
  slate: "#888780",
};

// ─── tone → icon bg / icon color ─────────────────────────────────────────────
const toneIconStyle: Record<MetricTone, { wrap: string; icon: string }> = {
  teal: {
    wrap: "bg-teal-50 dark:bg-teal-500/10",
    icon: "text-teal-600 dark:text-teal-300",
  },
  emerald: {
    wrap: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    wrap: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-300",
  },
  red: {
    wrap: "bg-red-50 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-300",
  },
  blue: {
    wrap: "bg-blue-50 dark:bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-300",
  },
  slate: {
    wrap: "bg-slate-100 dark:bg-slate-800",
    icon: "text-slate-600 dark:text-slate-300",
  },
};

// ─── status badge helpers ─────────────────────────────────────────────────────
const gradeBadgeStyle = (tone: GradeTone) =>
  tone === "green" || tone === "lime"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    : tone === "red"
      ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

const ringBadgeStyle = {
  ok: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  bad: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  neutral: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
} as const;

// ─── Overview Metric Cell (gauge style) ──────────────────────────────────────
interface OverviewMetricCellProps {
  title: string;
  value: string;
  primaryDetail?: string;
  secondaryDetail?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: MetricTone;
  graphValue?: number;
  graphSegments?: Array<{ value: number; color: string }>;
  grade?: { label: string; tone: GradeTone };
  ring?: "ok" | "bad" | "neutral";
  className?: string;
}

function OverviewMetricCell({
  title,
  value,
  primaryDetail,
  secondaryDetail,
  icon: Icon,
  tone = "slate",
  graphValue,
  graphSegments,
  grade,
  ring,
  className,
}: OverviewMetricCellProps) {
  const statusLabel = grade
    ? `Grade ${grade.label}`
    : ring === "ok"
      ? "Healthy"
      : ring === "bad"
        ? "Needs review"
        : ring === "neutral"
          ? "Tracked"
          : null;

  const statusStyle = grade
    ? gradeBadgeStyle(grade.tone)
    : ring
      ? ringBadgeStyle[ring]
      : ringBadgeStyle.neutral;

  const gaugeColor = toneGaugeColor[tone];
  const normalizedPct =
    graphValue == null ? 0 : Math.max(0, Math.min(100, graphValue));
  const segTotal =
    graphSegments?.reduce((s, x) => s + Math.max(x.value, 0), 0) ?? 0;

  const iconStyle = toneIconStyle[tone];

  return (
    <div
      className={cn(
        "relative flex flex-col bg-[#FCFCFA] p-3 sm:p-4 dark:bg-slate-950",
        className,
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        outline: "1px solid",
        outlineColor: "color-mix(in srgb, #005F5F 60%, transparent)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 50%) top left / 26px 26px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 50%) bottom right / 26px 26px no-repeat
          `,
          opacity: 0.5,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8 sm:rounded-xl",
              iconStyle.wrap,
            )}
          >
            <Icon className={cn("size-3.5 sm:size-4", iconStyle.icon)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px] dark:text-slate-500">
              Metric
            </p>
            <h3 className="mt-0.5 text-sm font-medium text-slate-900 sm:text-sm md:text-base dark:text-slate-100">
              {title}
            </h3>
          </div>
        </div>
        {statusLabel && (
          <span
            className={cn(
              "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide sm:px-2.5 sm:text-xs",
              statusStyle,
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-col flex-1">
      {graphSegments && graphSegments.length > 0 ? (
        <div className="my-3 space-y-2">
          <div className="flex h-2 overflow-hidden rounded-full bg-[#e8edf6] dark:bg-slate-800">
            {segTotal > 0 ? (
              graphSegments.map((seg, i) => (
                <div
                  key={i}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(Math.max(seg.value, 0) / segTotal) * 100}%`,
                    backgroundColor: seg.color,
                  }}
                />
              ))
            ) : (
              <div className="h-full w-full bg-[#d9e2f0] dark:bg-slate-700" />
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {graphSegments.map((seg, i) => (
              <span
                key={i}
                 className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 text-xs font-medium text-[#52648f] dark:bg-slate-900/80 dark:text-slate-300"
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                {seg.value}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="my-1 flex flex-col items-center">
          <div className="relative w-full max-w-30" style={{ height: 82 }}>
            {/* FIX: use viewBox-based SVG so it scales on mobile */}
            <svg
              viewBox="0 0 120 82"
              width="100%"
              height="100%"
              className="overflow-visible"
            >
              <GaugeSVGInner pct={normalizedPct} color={gaugeColor} size={120} />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
              <span className="font-mono text-[17px] font-semibold leading-none text-[#17233f] dark:text-white">
                {value}
              </span>
            </div>
          </div>
        </div>
      )}

      {primaryDetail && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {primaryDetail}
        </p>
      )}
      {secondaryDetail && (
        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {secondaryDetail}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Latest scan snapshot
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>
      </div>
    </div>
  );
}

// ─── GaugeSVGInner — renders paths only (no svg wrapper), used inside scalable svg ─
function GaugeSVGInner({
  pct,
  color,
  size = 120,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const ref = useRef<SVGGElement>(null);
  const inView = useInView(ref as RefObject<Element | null>, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setAnimated(true), 60);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const cx = size / 2;
  const cy = size * 0.62;
  const r = size * 0.38;
  const startAngle = (-210 * Math.PI) / 180;
  const endAngle = (30 * Math.PI) / 180;
  const totalAngle = endAngle - startAngle;
  const clamped = Math.max(0, Math.min(1, pct / 100));
  const fillAngle = startAngle + totalAngle * (animated ? clamped : 0);

  const arcPath = (sa: number, ea: number) => {
    const x1 = cx + r * Math.cos(sa);
    const y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea);
    const y2 = cy + r * Math.sin(ea);
    const lg = ea - sa > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2}`;
  };

  const dotX = cx + r * Math.cos(fillAngle);
  const dotY = cy + r * Math.sin(fillAngle);

  return (
    <g ref={ref}>
      <path
        d={arcPath(startAngle, endAngle)}
        stroke="#e4eaf4"
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
      />
      {clamped > 0 && (
        <path
          d={arcPath(startAngle, fillAngle)}
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 80ms" }}
        />
      )}
      {clamped > 0 && (
        <circle
          cx={dotX}
          cy={dotY}
          r={5}
          fill={color}
          style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 80ms" }}
        />
      )}
    </g>
  );
}

// ─── Top Stat Card ────────────────────────────────────────────────────────────
interface TopStatCardProps {
  label: string;
  value: string;
  helper: string;
  accent: "teal" | "emerald" | "amber" | "red" | "slate";
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  /** When true the card shows shimmer skeleton + spinning icon */
  isLoading?: boolean;
}

const accentColor: Record<string, string> = {
  teal: "#14b8a6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  slate: "#94a3b8",
};

function TopStatCard({
  label,
  value,
  helper,
  accent,
  icon: Icon,
  isLoading = false,
}: TopStatCardProps) {
  const color = accentColor[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden p-3 sm:p-4 md:p-5 bg-[#FCFCFA] dark:bg-gray-950 transition-all duration-300"
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        outline: "1px solid",
        outlineColor: "color-mix(in srgb, #005F5F 60%, transparent)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 50%) top left / 26px 26px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 50%) bottom right / 26px 26px no-repeat
          `,
          opacity: 0.5,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      {/* Animated gradient sweep when loading */}
      {isLoading && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `linear-gradient(120deg, transparent 30%, ${color} 50%, transparent 70%)`,
            backgroundSize: "200% 100%",
          }}
        />
      )}

      {/* Half-bleed icon — spins when loading */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateX(40%)" }}>
        <motion.div
          className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[140px] md:h-[140px]"
          style={{ color, opacity: isLoading ? 0.22 : 0.12 }}
          animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
          transition={isLoading ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
          <Icon className="w-full h-full" strokeWidth={1.5} />
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-sm dark:text-slate-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl md:text-4xl dark:text-white">
            {value}
          </p>
          <p className="mt-1.5 text-sm text-slate-500 sm:mt-2 sm:text-sm md:text-base dark:text-slate-400">
            {helper}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Donut Segment type ───────────────────────────────────────────────────────
interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({
  segments,
  size = 120,
  thickness = 22,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  const drawableSegments = segments.filter((segment) => segment.count > 0);
  const [hovered, setHovered] = useState<DonutSegment | null>(null);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setAnimated(true), 60);
      return () => clearTimeout(t);
    }
  }, [inView]);

  const cx   = size / 2;
  const cy   = size / 2;
  const r    = size / 2 - thickness / 2 - 2;
  const circ = 2 * Math.PI * r;

  let cumPct = 0;
  const arcs = drawableSegments.map((seg, i) => {
    const pct = total > 0 ? seg.count / total : 0;
    const startPct = cumPct;
    const dash = circ * pct;
    const arc = {
      offset: -circ * startPct,
      dash: animated ? dash : 0,
      gap: Math.max(circ - dash, 0),
      seg,
      pct,
      delay: i * 80,
    };
    cumPct += pct;
    return arc;
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        ref={ref}
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        onMouseLeave={() => setHovered(null)}
      >
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-[#e4eaf4] dark:text-slate-800"
        />
        {total > 0 &&
          arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={a.seg.color}
              strokeWidth={hovered === a.seg ? thickness + 4 : thickness}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              strokeLinecap="butt"
              style={{
                transition: `stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1) ${a.delay}ms, stroke-width 0.2s ease`,
                cursor: "pointer",
                filter: hovered === a.seg ? `drop-shadow(0 0 4px ${a.seg.color}50)` : "none",
              }}
              onMouseEnter={() => setHovered(a.seg)}
            />
          ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {hovered ? (
          <>
            <span className="font-mono text-lg font-bold leading-none text-[#17233f] dark:text-white">
              {hovered.count}
            </span>
            <span className="mt-0.5 max-w-15 text-[9px] font-semibold leading-tight text-[#52648f] dark:text-slate-400">
              {hovered.label}
            </span>
            <span className="mt-0.5 text-xs font-bold text-[#00d0b2]">
              {total > 0 ? Math.round((hovered.count / total) * 100) : 0}%
            </span>
          </>
        ) : (
          <>
            <span className="font-mono text-xl font-bold leading-none text-[#17233f] dark:text-white">
              {total}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold text-[#52648f] dark:text-slate-400">
              total
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Concentric Ring Chart SVG ────────────────────────────────────────────────
function ConcentricRingChart({
  rings,
  total,
}: {
  rings: { percent: number; color: string; label: string }[];
  total: number;
}) {
  // FIX: use viewBox so it scales responsively
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 16;
  const gap = 5;
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setAnimated(true), 60);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      // FIX: cap max-width so it doesn't balloon on large screens
      style={{ maxWidth: size, display: "block" }}
      role="img"
      aria-label="Concentric ring chart"
    >
      {rings.map((ring, i) => {
        const radius = cx - strokeWidth / 2 - i * (strokeWidth + gap);
        if (radius <= 0) return null;
        const circumference = 2 * Math.PI * radius;
        const filled = animated ? (ring.percent / 100) * circumference : 0;
        const unfilled = circumference - filled;

        return (
          <g key={ring.label}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              className="dark:stroke-gray-700"
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${unfilled}`}
              strokeDashoffset={circumference * 0.25}
              style={{
                transition: `stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms`,
              }}
            />
          </g>
        );
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={22}
        fontWeight={800}
        fill="#00d0b2"
        fontFamily="inherit"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize={9}
        fill="#94A3B8"
        fontFamily="inherit"
      >
        total
      </text>
    </svg>
  );
}

// ─── Radial Ring Card ─────────────────────────────────────────────────────────
interface RadialRingCardProps {
  title: string;
  subtitle: string;
  segments: DonutSegment[];
  badgeText: string;
  badgeStyle: string;
  totalLabel: string;
  delay?: number;
}

function RadialRingCard({
  title,
  subtitle,
  segments,
  badgeText,
  badgeStyle,
  totalLabel,
  delay,
}: RadialRingCardProps) {
  const total = segments.reduce((s, x) => s + x.count, 0);

  const rings = segments.map((seg) => ({
    percent: total > 0 ? Math.round((seg.count / total) * 100) : 0,
    color: seg.color,
    label: seg.label,
    count: seg.count,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: delay ?? 0 }}
      className="rounded-lg border border-slate-200 bg-linear-to-br from-white via-white to-[#f8fafd] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      <div className="mb-3 sm:mb-4">
        <p className="text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-xs dark:text-slate-400">{subtitle}</p>
      </div>

      {/* FIX: limit chart width so it doesn't stretch on mobile, center it */}
      <div className="flex flex-col items-center">
        <div className="w-full" style={{ maxWidth: 180 }}>
          <ConcentricRingChart rings={rings} total={total} />
        </div>
      </div>

      <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full sm:size-2.5"
                style={{ backgroundColor: ring.color }}
              />
              <span className="text-xs font-medium text-slate-500 sm:text-[11px] dark:text-slate-400">
                {ring.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 sm:text-[11px] dark:text-white">
                {ring.count}
              </span>
              <span
                className="min-w-7 text-right text-xs font-semibold sm:text-[10px]"
                style={{ color: ring.color }}
              >
                {ring.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 sm:mt-4 sm:pt-3 dark:border-slate-800">
        <span className="text-xs text-slate-500 sm:text-[11px] dark:text-slate-400">{totalLabel}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-2.5 sm:text-[10px]",
            badgeStyle,
          )}
        >
          {badgeText}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Dependency Risk Chart ────────────────────────────────────────────────────
function DependencyRiskChart({
  critical,
  high,
  medium,
  low,
}: {
  critical: number;
  high: number;
  medium: number;
  low: number;
}) {
  const [hoveredArc, setHoveredArc] = useState<{ label: string; value: number; color: string } | null>(null);
  const total = critical + high + medium + low;
  const categories = [
    { label: "Critical", value: critical, color: "#DC2626" },
    { label: "High", value: high, color: "#EA580C" },
    { label: "Medium", value: medium, color: "#D97706" },
    { label: "Low", value: low, color: "#16A34A" },
  ];

  // Donut chart calculations
  const donutSize = 160; // FIX: slightly smaller to fit better on mobile
  const cx = donutSize / 2;
  const cy = donutSize / 2;
  const thickness = 22;
  const r = donutSize / 2 - thickness / 2 - 2;
  const circ = 2 * Math.PI * r;

  let cumPct = 0;
  const arcs = categories
    .filter((c) => c.value > 0)
    .map((cat) => {
      const pct = total > 0 ? cat.value / total : 0;
      const startPct = cumPct;
      const dash = circ * pct;
      const arc = {
        offset: -circ * startPct,
        dash,
        gap: Math.max(circ - dash, 0),
        color: cat.color,
      };
      cumPct += pct;
      return arc;
    });

  // Line chart
  const W = 990;
  const H = 200;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 24;
  const paddingBottom = 32;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;
  const maxVal = Math.max(...categories.map((c) => c.value), 0);

  function getNiceIntegerStep(value: number): number {
    if (value <= 4) return 1;
    const roughStep = Math.ceil(value / 4);
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    if (normalized <= 1) return 1 * magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  }

  const niceStep = getNiceIntegerStep(maxVal);
  const yMax = Math.max(4, niceStep * 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - i * niceStep);

  function xPos(i: number) {
    return paddingLeft + (i / Math.max(1, categories.length - 1)) * chartW;
  }
  function yPos(v: number) {
    return paddingTop + chartH - (v / yMax) * chartH;
  }

  function buildSmoothPath(): string {
    if (categories.length < 2) return "";
    let path = `M ${xPos(0)},${yPos(categories[0].value)}`;
    for (let i = 1; i < categories.length; i++) {
      const prevX = xPos(i - 1);
      const prevY = yPos(categories[i - 1].value);
      const currX = xPos(i);
      const currY = yPos(categories[i].value);
      const cpX = (prevX + currX) / 2;
      path += ` C ${cpX},${prevY} ${cpX},${currY} ${currX},${currY}`;
    }
    return path;
  }

  const linePath = buildSmoothPath();

  return (
    // FIX: stack vertically on mobile, side-by-side on lg+
    <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:gap-5">
      {/* Line chart — full width on mobile */}
      <div className="min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          role="img"
          aria-label="Dependency risk line chart"
          style={{ overflow: "visible", display: "block" }}
        >
          {yTicks.map((v) => {
            const y = yPos(v);
            return (
              <g key={v}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={W - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.07}
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#94A3B8"
                  fontFamily="inherit"
                >
                  {v}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="depRiskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d0b2" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00d0b2" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {linePath && (
            <path
              d={`${linePath} L ${xPos(categories.length - 1)},${paddingTop + chartH} L ${xPos(0)},${paddingTop + chartH} Z`}
              fill="url(#depRiskFill)"
            />
          )}
          <path
            d={linePath}
            fill="none"
            stroke="#00d0b2"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {categories.map((cat, i) => (
            <g key={cat.label}>
              <circle cx={xPos(i)} cy={yPos(cat.value)} r={8} fill={cat.color} fillOpacity={0.12} />
              <circle cx={xPos(i)} cy={yPos(cat.value)} r={5} fill={cat.color} stroke="white" strokeWidth={2} />
              <text x={xPos(i)} y={yPos(cat.value) - 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={cat.color} fontFamily="inherit">
                {cat.value}
              </text>
              <text x={xPos(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#52648f" fontFamily="inherit">
                {cat.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* FIX: legend + donut stack vertically on mobile, row on sm+ */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-6 lg:flex-col lg:items-start">
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-3">
          {categories.map((cat) => {
            const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
            return (
              <div key={cat.label} className="flex items-center gap-2">
                <span className="inline-block size-3 rounded" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium text-[#17233f] dark:text-slate-200">{cat.label}</span>
                <span className="font-mono text-xs font-bold text-[#17233f] dark:text-white">{cat.value}</span>
                <span className="text-xs text-[#8fa0bf] dark:text-slate-500">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* FIX: donut uses viewBox so it scales on mobile */}
        <div className="relative shrink-0" style={{ width: donutSize, height: donutSize }}>
          <svg
            viewBox={`0 0 ${donutSize} ${donutSize}`}
            width={donutSize}
            height={donutSize}
            style={{ transform: "rotate(-90deg)" }}
            onMouseLeave={() => setHoveredArc(null)}
          >
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={thickness} className="dark:stroke-gray-700" />
            {total > 0 &&
              arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={hoveredArc?.color === a.color ? thickness + 4 : thickness}
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  strokeDashoffset={a.offset}
                  strokeLinecap="butt"
                  style={{
                    cursor: "pointer",
                    transition: "stroke-width 0.2s ease",
                    filter: hoveredArc?.color === a.color ? `drop-shadow(0 0 4px ${a.color}50)` : "none",
                  }}
                  onMouseEnter={() => {
                    const cat = categories.find(c => c.color === a.color);
                    if (cat) setHoveredArc(cat);
                  }}
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hoveredArc ? (
              <>
                <span className="font-mono text-xl font-bold text-[#17233f] dark:text-white">{hoveredArc.value}</span>
                <span className="mt-0.5 text-[10px] font-medium text-[#52648f] dark:text-slate-400">{hoveredArc.label}</span>
                <span className="text-xs font-bold text-[#00d0b2]">
                  {total > 0 ? Math.round((hoveredArc.value / total) * 100) : 0}%
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-xl font-bold text-[#17233f] dark:text-white">{total}</span>
                <span className="mt-0.5 text-xs font-medium text-[#52648f] dark:text-slate-400">total</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Radar Chart Card ─────────────────────────────────────────────────────────
interface RadarChartCardProps {
  title: string;
  subtitle: string;
  axes: { label: string; value: number }[];
  color: string;
  badgeText: string;
  badgeStyle: string;
  totalLabel: string;
  delay?: number;
}

function RadarChartCard({
  title,
  subtitle,
  axes,
  color,
  badgeText,
  badgeStyle,
  totalLabel,
  delay,
}: RadarChartCardProps) {
  // FIX: use viewBox-based responsive SVG
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  const gridLevels = 5;

  const maxVal = Math.max(1, ...axes.map((a) => a.value));
  const numSlices = axes.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const startAngle = -Math.PI / 2;

  const SLICE_COLORS = ["#5eecd5", "#33dfca", "#00d0b2", "#009d87", "#006b5c"];

  function polarToXY(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function slicePath(index: number, value: number) {
    const r = (value / maxVal) * maxRadius;
    const a1 = startAngle + index * sliceAngle;
    const a2 = a1 + sliceAngle;
    const p1 = polarToXY(a1, r);
    const p2 = polarToXY(a2, r);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
  }

  const gridStep = Math.ceil(maxVal / gridLevels);
  const gridValues = Array.from({ length: gridLevels }, (_, i) => (i + 1) * gridStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: delay ?? 0 }}
      className="rounded-xl border border-[#e4eaf4] bg-linear-to-br from-[#FCFCFA] via-[#FCFCFA] to-[#f8fafd] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      <div className="mb-2">
        <p className="text-sm font-bold text-[#17233f] dark:text-slate-100">{title}</p>
        <p className="mt-0.5 text-xs text-[#52648f] dark:text-slate-400">{subtitle}</p>
      </div>

      {/* FIX: stack chart above legend on mobile, side-by-side on sm+ */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Polar chart — responsive with viewBox */}
        <div className="w-full" style={{ maxWidth: size }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
          >
            {gridValues.map((val, i) => {
              const r = ((i + 1) / gridLevels) * maxRadius;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={0.8}
                  className="dark:stroke-gray-700"
                />
              );
            })}
            {Array.from({ length: numSlices }, (_, i) => {
              const angle = startAngle + i * sliceAngle;
              const p = polarToXY(angle, maxRadius);
              return (
                <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth={0.8} className="dark:stroke-gray-700" />
              );
            })}
            {axes.map((a, i) => (
              <path
                key={a.label}
                d={slicePath(i, a.value)}
                fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                fillOpacity={0.8}
                stroke="white"
                strokeWidth={1.5}
              />
            ))}
            {gridValues.map((val, i) => {
              const r = ((i + 1) / gridLevels) * maxRadius;
              return (
                <text key={i} x={cx} y={cy + r + 12} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="inherit">
                  {val}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 sm:flex-col sm:gap-2.5">
          {axes.map((a, i) => (
            <div key={a.label} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
              />
              <span className="text-xs font-medium text-[#17233f] dark:text-slate-200">
                {a.label}: <span className="font-bold">{a.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#e4eaf4] pt-3 dark:border-slate-800">
        <span className="text-[11px] text-[#52648f] dark:text-slate-400">{totalLabel}</span>
        <span
          className={cn(
                 "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            badgeStyle,
          )}
        >
          {badgeText}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export interface CodeScanOverviewProps {
  initialScanId: string;
  scanSummary: ScanSummaryResponse | null | undefined;
  dependencySummary: DependencySummaryResponse | null;
  qualityGate: QualityGateStatus | null | undefined;
  acceptedIssues: number;
  scanCount: number;
  scanStatusLabel: string;
  platformStatus: string | null | undefined;
  platformFailureMessage: string | null;
  scanProgress: number;
  isScanRunning: boolean;
  formatCount: (value: number | null | undefined) => string;
  formatPercent: (value: number | null | undefined) => string;
  getGrade: (
    value: number,
    warningAt: number,
    dangerAt: number,
  ) => { label: string; tone: GradeTone };
  getQualityGateLabel: (
    status: QualityGateStatus | null | undefined,
  ) => string;
}

export function CodeScanOverview({
  initialScanId,
  scanSummary,
  dependencySummary,
  qualityGate,
  acceptedIssues,
  scanCount,
  scanStatusLabel,
  platformStatus,
  platformFailureMessage,
  scanProgress,
  isScanRunning,
  formatCount,
  formatPercent,
  getGrade,
  getQualityGateLabel,
}: CodeScanOverviewProps) {
  const bugs            = scanSummary?.bugs ?? 0;
  const vulnerabilities = scanSummary?.vulnerabilities ?? 0;
  const codeSmells      = scanSummary?.code_smells ?? 0;
  const totalIssues     = bugs + vulnerabilities + codeSmells;
  const coverage        = scanSummary?.coverage ?? 0;
  const duplications    = scanSummary?.duplications ?? 0;
  const hotspots        = scanSummary?.security_hotspots ?? 0;

  const depCritical = dependencySummary?.critical ?? 0;
  const depHigh     = dependencySummary?.high ?? 0;
  const depMedium   = dependencySummary?.medium ?? 0;
  const depLow      = dependencySummary?.low ?? 0;
  const depTotal    = depCritical + depHigh + depMedium + depLow;
  const platformFailed = platformStatus === "FAILED";
  const policyStatusLabel = platformFailed
    ? "Policy Failed"
    : platformStatus === "PASSED"
      ? "Policy Passed"
      : scanStatusLabel;

  const rawRiskScore =
    depTotal > 0
      ? (depCritical * 4 + depHigh * 3 + depMedium * 2 + depLow * 1) / depTotal
      : 0;

  const riskLabel =
    rawRiskScore === 0   ? "None"
    : rawRiskScore < 1.5 ? "Low"
    : rawRiskScore < 2.5 ? "Medium"
    : rawRiskScore < 3.5 ? "High"
    : "Critical";

  const _gradeBadgeStyle = (tone: GradeTone) =>
    tone === "green" || tone === "lime"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : tone === "red"
        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

  const secGrade = getGrade(vulnerabilities, 0, 2);
  const relGrade = getGrade(bugs, 0, 5);
  const mntGrade = getGrade(codeSmells, 10, 50);

  const depSegments: DonutSegment[] = [
    { label: "Critical", count: depCritical, color: "#DC2626" },
    { label: "High",     count: depHigh,     color: "#EA580C" },
    { label: "Medium",   count: depMedium,   color: "#D97706" },
    { label: "Low",      count: depLow,      color: "#16A34A" },
  ];

  const codeSegments: DonutSegment[] = [
    { label: "Bugs",            count: bugs,            color: "#DC2626" },
    { label: "Vulnerabilities", count: vulnerabilities, color: "#EA580C" },
    { label: "Code smells",     count: codeSmells,      color: "#2563EB" },
  ];

  const secSegments: DonutSegment[] = [
    { label: "Vulnerabilities", count: vulnerabilities, color: "#DC2626" },
    { label: "Hotspots",        count: hotspots,        color: "#D97706" },
    { label: "Accepted",        count: acceptedIssues,  color: "#2563EB" },
  ];

  const covPct   = Math.round(coverage);
  const dupPct   = Math.round(duplications);
  const restPct  = Math.max(0, 100 - covPct - dupPct);
  const healthSegments: DonutSegment[] = [
    { label: "Coverage",    count: covPct,  color: "#16A34A" },
    { label: "Duplication", count: dupPct,  color: "#DC2626" },
    { label: "Uncovered",   count: restPct, color: "#2563EB" },
  ];

  const normalizedScanProgress = Math.max(0, Math.min(100, Math.round(scanProgress)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* ── Scan Progress Indicator ── */}
      <ScanProgressIndicator
        progress={normalizedScanProgress}
        status={scanStatusLabel}
        isScanRunning={isScanRunning}
      />

      {/* ── Row 1: Top Stat Cards — 1 col on mobile, 2 on md, 4 on xl ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TopStatCard
          label="Quality Gate"
          value={
            !qualityGate && isScanRunning
              ? "In Progress"
              : getQualityGateLabel(qualityGate)
          }
          helper={
            !qualityGate && isScanRunning
              ? "Evaluating gate status"
              : scanSummary
                ? "Latest scan summary"
                : "Waiting for summary"
          }
          accent={
            !qualityGate && isScanRunning
              ? "teal"
              : qualityGate === "OK"
                ? "emerald"
                : qualityGate
                  ? "amber"
                  : "slate"
          }
          icon={
            !qualityGate && isScanRunning
              ? RefreshCw
              : qualityGate === "OK"
                ? ShieldCheck
                : ShieldAlert
          }
          isLoading={!qualityGate && isScanRunning}
        />
        <TopStatCard
          label="Scan Status"
          value={policyStatusLabel}
          helper={
            isScanRunning
              ? `${normalizedScanProgress}% progress`
              : platformFailed
                ? platformFailureMessage ?? "Source policy failed"
              : scanSummary
                ? "100% progress"
                : "Waiting for scan results"
          }
          accent={isScanRunning ? "teal" : platformFailed ? "red" : scanSummary ? "emerald" : "slate"}
          icon={normalizedScanProgress < 100 ? LoadingIcon : platformFailed ? ShieldAlert : scanSummary ? CheckCircle2 : RefreshCw}
          isLoading={isScanRunning}
        />
        <TopStatCard
          label="Issues"
          value={formatCount(totalIssues)}
          helper={
            scanSummary
              ? "Bugs, vulnerabilities, and smells"
              : "Waiting for summary"
          }
          accent="teal"
          icon={BarChart3}
        />
        <TopStatCard
          label="Project History"
          value={formatCount(scanCount)}
          helper="Recorded analyses for this project"
          accent="slate"
          icon={RefreshCw}
        />
      </div>


      {/* ── Row 2a: Dependency Risk Line Chart ── */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-[#e4eaf4] bg-linear-to-br from-[#FCFCFA] via-[#FCFCFA] to-[#f8fafd] p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Dependency Risk</p>
              <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">
                Packages by severity — {formatCount(depTotal)} total at risk
              </p>
            </div>
            <span
              className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                depCritical > 0
                  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                  : depHigh > 0
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
              )}
            >
              {riskLabel} risk
            </span>
          </div>
          <DependencyRiskChart
            critical={depCritical}
            high={depHigh}
            medium={depMedium}
            low={depLow}
          />
        </motion.div>
      </div>

      {/* ── Row 2b: 3 Radar Charts — 1 col on mobile, 2 on sm, 3 on xl ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RadarChartCard
          title="Code Issues"
          subtitle="Bugs, vulns & smells"
          axes={codeSegments.map((s) => ({ label: s.label, value: s.count }))}
          color="#00d0b2"
          badgeText={`Grade ${mntGrade.label}`}
          badgeStyle={_gradeBadgeStyle(mntGrade.tone)}
          totalLabel={`${formatCount(totalIssues)} total issues`}
          delay={0.1}
        />
        <RadarChartCard
          title="Security"
          subtitle="Vulnerabilities & hotspots"
          axes={secSegments.map((s) => ({ label: s.label, value: s.count }))}
          color="#3B82F6"
          badgeText={`Grade ${secGrade.label}`}
          badgeStyle={_gradeBadgeStyle(secGrade.tone)}
          totalLabel={`${formatCount(vulnerabilities + hotspots + acceptedIssues)} security items`}
          delay={0.15}
        />
        <RadarChartCard
          title="Code Health"
          subtitle="Coverage vs duplication"
          axes={healthSegments.map((s) => ({ label: s.label, value: s.count }))}
          color="#F59E0B"
          badgeText={coverage >= 80 ? "Good coverage" : "Low coverage"}
          badgeStyle={
            coverage >= 80
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          }
          totalLabel="Based on 100% codebase"
          delay={0.2}
        />
      </div>

      {/* ── Row 3: Operational Metrics ── */}
      <CodeScanOperationalMetrics
        scanSummary={scanSummary}
        dependencySummary={dependencySummary}
        totalIssues={totalIssues}
        acceptedIssues={acceptedIssues}
        vulnerabilities={vulnerabilities}
        bugs={bugs}
        codeSmells={codeSmells}
        coverage={coverage}
        duplications={duplications}
        hotspots={hotspots}
        formatCount={formatCount}
        formatPercent={formatPercent}
        getGrade={getGrade}
      />
    </motion.div>
  );
}
