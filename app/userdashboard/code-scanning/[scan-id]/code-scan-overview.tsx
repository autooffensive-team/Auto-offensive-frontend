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
import type { ComponentType } from "react";
import { useRef, useEffect, useState } from "react";

import type {
  DependencySummaryResponse,
  QualityGateStatus,
} from "@/types/scanner";
import { cn } from "@/lib/utils";

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
          "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
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
        tone === "neutral" && "border-gray-200 dark:border-gray-700",
      )}
    >
      {tone === "ok" && (
        <span className="size-2.5 rounded-full bg-emerald-500" />
      )}
      {tone === "neutral" && (
        <svg
          className="size-4 text-gray-500 dark:text-gray-400"
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
      {/* Track */}
      <path
        d={arcPath(startAngle, endAngle)}
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        className="text-[#e4eaf4] dark:text-gray-800"
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
      />
      {/* Fill */}
      {clamped > 0 && (
        <path
          d={arcPath(startAngle, fillAngle)}
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          style={{ transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 80ms" }}
        />
      )}
      {/* End dot */}
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
        "flex flex-col rounded-[16px] border border-[#e4eaf4] bg-white p-4 dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      {/* Header: icon + title + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Icon bubble */}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl",
              iconStyle.wrap,
            )}
          >
            <Icon className={cn("size-4", iconStyle.icon)} />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7a8db4] dark:text-gray-500">
              Metric
            </p>
            <h3 className="mt-0.5 text-[13px] font-medium text-[#17233f] dark:text-gray-100">
              {title}
            </h3>
          </div>
        </div>
        {statusLabel && (
          <span
            className={cn(
              "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              statusStyle,
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* Gauge or Segmented bar */}
      {graphSegments && graphSegments.length > 0 ? (
        /* Segmented bar (used for Dependency severity) */
        <div className="my-3 space-y-2">
          <div className="flex h-2 overflow-hidden rounded-full bg-[#e8edf6] dark:bg-gray-800">
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
              <div className="h-full w-full bg-[#d9e2f0] dark:bg-gray-700" />
            )}
          </div>
          {/* Segment legend */}
          <div className="flex flex-wrap gap-1.5">
            {graphSegments.map((seg, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-[#52648f] dark:bg-gray-900/80 dark:text-gray-300"
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
        /* Gauge arc */
        <div className="my-1 flex flex-col items-center">
          <div className="relative" style={{ width: 120, height: 82 }}>
            <GaugeSVG pct={normalizedPct} color={gaugeColor} size={120} />
            {/* Center value */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
              <span className="font-mono text-[17px] font-semibold leading-none text-[#17233f] dark:text-white">
                {value}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      {primaryDetail && (
        <p className="text-[11px] text-[#52648f] dark:text-gray-400">
          {primaryDetail}
        </p>
      )}
      {secondaryDetail && (
        <p className="mt-1 text-[11px] leading-5 text-[#52648f] dark:text-gray-400">
          {secondaryDetail}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[#e8edf6] pt-2 dark:border-gray-800">
        <span className="text-[10px] text-[#8a9bbc] dark:text-gray-500">
          Latest scan snapshot
        </span>
        <span className="text-[10px] text-[#52648f] dark:text-gray-400">
          {title}
        </span>
      </div>
    </div>
  );
}

// ─── Top Stat Card (original) ─────────────────────────────────────────────────
interface TopStatCardProps {
  label: string;
  value: string;
  helper: string;
  accent: "teal" | "emerald" | "amber" | "slate";
  icon: ComponentType<{ className?: string }>;
}

function TopStatCard({
  label,
  value,
  helper,
  accent,
  icon: Icon,
}: TopStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group rounded-xl border border-[#e4eaf4] bg-linear-to-br from-white via-white to-[#f8fafd] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#c5d3e8] dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:hover:border-gray-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7da4] dark:text-gray-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-[#071120] dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-sm text-[#52648f] dark:text-gray-400">
            {helper}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl transition-all duration-300",
            accent === "teal" &&
              "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
            accent === "emerald" &&
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
            accent === "amber" &&
              "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
            accent === "slate" &&
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          <Icon className="size-5" />
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
      delay:  i * 80,
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
        {/* Track ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-[#e4eaf4] dark:text-gray-800"
        />
        {total > 0 &&
          arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={a.seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              strokeLinecap="butt"
              style={{
                transition: `stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1) ${a.delay}ms`,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(a.seg)}
            />
          ))}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {hovered ? (
          <>
            <span className="font-mono text-lg font-bold leading-none text-[#17233f] dark:text-white">
              {hovered.count}
            </span>
            <span className="mt-0.5 max-w-15 text-[8px] font-semibold leading-tight text-[#52648f] dark:text-gray-400">
              {hovered.label}
            </span>
          </>
        ) : (
          <>
            <span className="font-mono text-xl font-bold leading-none text-[#17233f] dark:text-white">
              {total}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-[#52648f] dark:text-gray-400">
              total
            </span>
          </>
        )}
      </div>
    </div>
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

  // Use original segment colors for rings
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
      className="rounded-xl border border-[#e4eaf4] bg-linear-to-br from-white via-white to-[#f8fafd] p-5 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      {/* Header */}
      <div className="mb-4">
        <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">{title}</p>
        <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Radial chart centered */}
      <div className="flex flex-col items-center">
        <ConcentricRingChart rings={rings} total={total} />
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: ring.color }}
              />
              <span className="text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                {ring.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#17233f] dark:text-white">
                {ring.count}
              </span>
              <span
                className="min-w-[28px] text-right text-[10px] font-semibold"
                style={{ color: ring.color }}
              >
                {ring.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#e4eaf4] pt-3 dark:border-gray-800">
        <span className="text-[11px] text-[#52648f] dark:text-gray-400">{totalLabel}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            badgeStyle,
          )}
        >
          {badgeText}
        </span>
      </div>
    </motion.div>
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
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
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
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              className="dark:stroke-gray-700"
            />
            {/* Filled arc */}
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
      {/* Center total */}
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

// ─── Operational Ring Chart (4 rings) ─────────────────────────────────────────
function OperationalRingChart({
  rings,
  centerValue,
  centerLabel,
}: {
  rings: { label: string; percent: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 20;
  const gap = 6;
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
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Operational metrics ring chart"
    >
      {rings.map((ring, i) => {
        const radius = cx - strokeWidth / 2 - i * (strokeWidth + gap);
        if (radius <= 0) return null;
        const circumference = 2 * Math.PI * radius;
        const clamped = Math.max(0, Math.min(100, ring.percent));
        const filled = animated ? (clamped / 100) * circumference : 0;
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
      {/* Center content */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fontSize={30}
        fontWeight={800}
        fill="#00d0b2"
        fontFamily="inherit"
      >
        {centerValue}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontSize={11}
        fill="#94A3B8"
        fontFamily="inherit"
      >
        {centerLabel}
      </text>
    </svg>
  );
}

// ─── Dependency Risk Line Chart ───────────────────────────────────────────────
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
  const total = critical + high + medium + low;
  const categories = [
    { label: "Critical", value: critical, color: "#DC2626" },
    { label: "High", value: high, color: "#EA580C" },
    { label: "Medium", value: medium, color: "#D97706" },
    { label: "Low", value: low, color: "#16A34A" },
  ];

  // Donut chart calculations
  const donutSize = 180;
  const cx = donutSize / 2;
  const cy = donutSize / 2;
  const thickness = 24;
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

  // Line chart calculations
  const W = 990;
  const H = 200;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 24;
  const paddingBottom = 32;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const maxVal = Math.max(1, ...categories.map((c) => c.value));
  const rawStep = maxVal / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
  const yMax = niceStep * 4;
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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-5">
      {/* Left: Line chart */}
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          role="img"
          aria-label="Dependency risk line chart"
          style={{ overflow: "visible" }}
        >
          {/* Grid lines */}
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

          {/* Smooth line */}
          <path
            d={linePath}
            fill="none"
            stroke="#00d0b2"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {categories.map((cat, i) => (
            <g key={cat.label}>
              <circle
                cx={xPos(i)}
                cy={yPos(cat.value)}
                r={8}
                fill={cat.color}
                fillOpacity={0.12}
              />
              <circle
                cx={xPos(i)}
                cy={yPos(cat.value)}
                r={5}
                fill={cat.color}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={xPos(i)}
                y={yPos(cat.value) - 14}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={cat.color}
                fontFamily="inherit"
              >
                {cat.value}
              </text>
              <text
                x={xPos(i)}
                y={H - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#52648f"
                fontFamily="inherit"
              >
                {cat.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Right: Legend + Donut */}
      <div className="flex items-center gap-6">
        {/* Legend */}
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
            return (
              <div key={cat.label} className="flex items-center gap-2.5">
                <span
                  className="inline-block size-3.5 rounded"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium text-[#17233f] dark:text-gray-200">
                  {cat.label}
                </span>
                <span className="font-mono text-sm font-bold text-[#17233f] dark:text-white">
                  {cat.value}
                </span>
                <span className="text-xs text-[#8fa0bf] dark:text-gray-500">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Donut */}
        <div className="relative shrink-0" style={{ width: donutSize, height: donutSize }}>
          <svg
            width={donutSize}
            height={donutSize}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={thickness}
              className="dark:stroke-gray-700"
            />
            {total > 0 &&
              arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  strokeDashoffset={a.offset}
                  strokeLinecap="butt"
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-bold text-[#17233f] dark:text-white">
              {total}
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-[#52648f] dark:text-gray-400">
              total
            </span>
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
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  const gridLevels = 5;

  const maxVal = Math.max(1, ...axes.map((a) => a.value));
  const numSlices = axes.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const startAngle = -Math.PI / 2;

  // Colors for each slice — teal gradient from light to deep
  const SLICE_COLORS = ["#5eecd5", "#33dfca", "#00d0b2", "#009d87", "#006b5c"];

  function polarToXY(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Build arc path for a slice
  function slicePath(index: number, value: number) {
    const r = (value / maxVal) * maxRadius;
    const a1 = startAngle + index * sliceAngle;
    const a2 = a1 + sliceAngle;
    const p1 = polarToXY(a1, r);
    const p2 = polarToXY(a2, r);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
  }

  // Grid level values
  const gridStep = Math.ceil(maxVal / gridLevels);
  const gridValues = Array.from({ length: gridLevels }, (_, i) => (i + 1) * gridStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: delay ?? 0 }}
      className="rounded-xl border border-[#e4eaf4] bg-linear-to-br from-white via-white to-[#f8fafd] p-5 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
    >
      {/* Header */}
      <div className="mb-2">
        <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">{title}</p>
        <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Chart + Legend side by side */}
      <div className="flex items-center gap-4">
        {/* Polar area chart */}
        <div className="shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* Concentric circle grid */}
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

            {/* Axis lines */}
            {Array.from({ length: numSlices }, (_, i) => {
              const angle = startAngle + i * sliceAngle;
              const p = polarToXY(angle, maxRadius);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="#E2E8F0"
                  strokeWidth={0.8}
                  className="dark:stroke-gray-700"
                />
              );
            })}

            {/* Slices */}
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

            {/* Grid level labels */}
            {gridValues.map((val, i) => {
              const r = ((i + 1) / gridLevels) * maxRadius;
              return (
                <text
                  key={i}
                  x={cx}
                  y={cy + r + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94A3B8"
                  fontFamily="inherit"
                >
                  {val}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5">
          {axes.map((a, i) => (
            <div key={a.label} className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
              />
              <span className="text-xs font-medium text-[#17233f] dark:text-gray-200">
                {a.label}: <span className="font-bold">{a.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[#e4eaf4] pt-3 dark:border-gray-800">
        <span className="text-[11px] text-[#52648f] dark:text-gray-400">{totalLabel}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
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
  scanSummary: any;
  dependencySummary: DependencySummaryResponse | null;
  qualityGate: QualityGateStatus | null | undefined;
  acceptedIssues: number;
  scanCount: number;
  scanStatusLabel: string;
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
  scanSummary,
  dependencySummary,
  qualityGate,
  acceptedIssues,
  scanCount,
  scanStatusLabel,
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

  // ── Donut segment data ─────────────────────────────────────────────────────
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

  const securityGraph        = Math.min(vulnerabilities * 20, 100);
  const reliabilityGraph     = Math.min(bugs * 12, 100);
  const maintainabilityGraph = Math.min(codeSmells, 100);
  const acceptedGraph        = Math.min(acceptedIssues * 15, 100);
  const hotspotsGraph        = Math.min(hotspots * 15, 100);
  const dependencyScanGraph  =
    depTotal > 0
      ? Math.round(((dependencySummary?.vulnerable ?? depTotal) / depTotal) * 100)
      : Math.min((dependencySummary?.vulnerable ?? 0) * 10, 100);
  const normalizedScanProgress = Math.max(0, Math.min(100, Math.round(scanProgress)));

  // Calculate dependency severity risk percentage (critical + high out of total)
  const depSeverityRiskPct =
    depTotal > 0
      ? Math.min(((depCritical + depHigh) / depTotal) * 100, 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* ── Row 1: Top Stat Cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TopStatCard
          label="Quality Gate"
          value={getQualityGateLabel(qualityGate)}
          helper={scanSummary ? "Latest scan summary" : "Waiting for summary"}
          accent={
            qualityGate === "OK" ? "emerald" : qualityGate ? "amber" : "slate"
          }
          icon={qualityGate === "OK" ? ShieldCheck : ShieldAlert}
        />
        <TopStatCard
          label="Scan Status"
          value={scanStatusLabel}
          helper={
            isScanRunning
              ? `${normalizedScanProgress}% progress`
              : scanSummary
                ? "100% progress"
                : "Waiting for scan results"
          }
          accent={isScanRunning ? "teal" : scanSummary ? "emerald" : "slate"}
          icon={isScanRunning ? RefreshCw : scanSummary ? CheckCircle2 : RefreshCw}
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

      {/* ── Row 2a: Dependency Risk Line Chart ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-xl border border-[#e4eaf4] bg-linear-to-br from-white via-white to-[#f8fafd] p-5 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Dependency Risk</p>
            <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">Packages by severity — {formatCount(depTotal)} total at risk</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
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

      {/* ── Row 2b: 3 Radar Charts ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      {/* ── Row 3: Operational Metrics ──────────────────────────────────────── */}
      <section className="rounded-[28px] border border-[#dfe7f3] bg-linear-to-br from-[#fbfdff] via-white to-[#f5f8fd] p-4 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e6edf7] px-1 pb-4 dark:border-gray-800">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7b8db2] dark:text-gray-500">
              Operational Metrics
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#17233f] dark:text-gray-100">
              Code quality and remediation posture
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#eef4fb] px-3 py-1 text-[11px] font-medium text-[#4f6290] dark:bg-gray-900 dark:text-gray-300">
            8 tracked indicators
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Chart 1: Code Quality */}
          {(() => {
            const qualityRings = [
              { label: "Security", value: vulnerabilities, percent: securityGraph, color: "#5eecd5", grade: `Grade ${secGrade.label}` },
              { label: "Reliability", value: bugs, percent: reliabilityGraph, color: "#00d0b2", grade: `Grade ${relGrade.label}` },
              { label: "Maintainability", value: codeSmells, percent: maintainabilityGraph, color: "#009d87", grade: `Grade ${mntGrade.label}` },
              { label: "Accepted issues", value: acceptedIssues, percent: acceptedGraph, color: "#006b5c", grade: "Tracked" },
            ];

            return (
              <div className="rounded-xl border border-[#e4eaf4] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4">
                  <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Code Quality</p>
                  <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">Security, reliability & maintainability</p>
                </div>

                <div className="flex flex-col items-center">
                  <OperationalRingChart rings={qualityRings} centerValue={formatCount(totalIssues)} centerLabel="total issues" />
                </div>

                <div className="mt-4 space-y-2.5">
                  {qualityRings.map((ring) => (
                    <div key={ring.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block size-2.5 rounded-full"
                          style={{ backgroundColor: ring.color }}
                        />
                        <span className="text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                          {ring.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#17233f] dark:text-white">
                          {ring.value}
                        </span>
                        <span className="text-[10px] text-[#8fa0bf] dark:text-gray-500">
                          {ring.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Chart 2: Health & Scans */}
          {(() => {
            const healthRings = [
              { label: "Coverage", value: formatPercent(coverage), percent: Math.max(coverage, 0), color: "#5eecd5", grade: coverage >= 80 ? "Healthy" : "Needs review" },
              { label: "Duplications", value: formatPercent(duplications), percent: Math.min(duplications * 10, 100), color: "#00d0b2", grade: duplications <= 3 ? "Healthy" : "Needs review" },
              { label: "Security Hotspots", value: formatCount(hotspots), percent: hotspotsGraph, color: "#009d87", grade: `Grade ${getGrade(hotspots, 0, 3).label}` },
              { label: "Dependency scan", value: formatCount(dependencySummary?.vulnerable), percent: dependencyScanGraph, color: "#006b5c", grade: `Grade ${getGrade(depCritical, 0, 1).label}` },
            ];

            return (
              <div className="rounded-xl border border-[#e4eaf4] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4">
                  <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Health & Scans</p>
                  <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">Coverage, duplication & dependency posture</p>
                </div>

                <div className="flex flex-col items-center">
                  <OperationalRingChart rings={healthRings} centerValue={formatPercent(coverage)} centerLabel="coverage" />
                </div>

                <div className="mt-4 space-y-2.5">
                  {healthRings.map((ring) => (
                    <div key={ring.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block size-2.5 rounded-full"
                          style={{ backgroundColor: ring.color }}
                        />
                        <span className="text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                          {ring.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#17233f] dark:text-white">
                          {ring.value}
                        </span>
                        <span className="text-[10px] text-[#8fa0bf] dark:text-gray-500">
                          {ring.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </motion.div>
  );
}
