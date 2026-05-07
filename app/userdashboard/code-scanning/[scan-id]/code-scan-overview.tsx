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
  const gap  = total > 1 ? 0.012 : 0;

  let cumPct = 0;
  const arcs = segments.map((seg, i) => {
    const pct         = total > 0 ? seg.count / total : 0;
    const adjustedPct = Math.max(pct - gap, 0);
    const arc = {
      offset: circ * (1 - cumPct),
      dash:   animated ? circ * adjustedPct : 0,
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
              strokeDasharray={`${a.dash} ${circ}`}
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

// ─── Donut Card ───────────────────────────────────────────────────────────────
interface DonutCardProps {
  title: string;
  subtitle: string;
  segments: DonutSegment[];
  badgeText: string;
  badgeStyle: string;
  totalLabel: string;
  delay?: number;
}

function DonutCard({
  title,
  subtitle,
  segments,
  badgeText,
  badgeStyle,
  totalLabel,
  delay,
}: DonutCardProps) {
  const total = segments.reduce((s, x) => s + x.count, 0);

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

      {/* Donut + legend side-by-side */}
      <div className="flex items-center gap-4">
        <DonutChart segments={segments} size={120} thickness={22} />

        <div className="flex flex-1 flex-col gap-2.5">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
            return (
              <div key={seg.label} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="flex-1 truncate text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                  {seg.label}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#17233f] dark:text-white">
                  {seg.count}
                </span>
                <span className="w-7 text-right text-[10px] text-[#8fa0bf] dark:text-gray-500">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
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

      {/* ── Row 2: 4 Donut Cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DonutCard
          title="Dependency Risk"
          subtitle="Packages by severity"
          segments={depSegments}
          totalLabel={`${formatCount(depTotal)} packages at risk`}
          badgeText={`${riskLabel} risk`}
          badgeStyle={
            depCritical > 0
              ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
              : depHigh > 0
                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          }
          delay={0.05}
        />
        <DonutCard
          title="Code Issues"
          subtitle="Bugs, vulns & smells"
          segments={codeSegments}
          totalLabel={`${formatCount(totalIssues)} total issues`}
          badgeText={`Grade ${mntGrade.label}`}
          badgeStyle={_gradeBadgeStyle(mntGrade.tone)}
          delay={0.1}
        />
        <DonutCard
          title="Security"
          subtitle="Vulnerabilities & hotspots"
          segments={secSegments}
          totalLabel={`${formatCount(vulnerabilities + hotspots + acceptedIssues)} security items`}
          badgeText={`Grade ${secGrade.label}`}
          badgeStyle={_gradeBadgeStyle(secGrade.tone)}
          delay={0.15}
        />
        <DonutCard
          title="Code Health"
          subtitle="Coverage vs duplication"
          segments={healthSegments}
          totalLabel="Based on 100% codebase"
          badgeText={coverage >= 80 ? "Good coverage" : "Low coverage"}
          badgeStyle={
            coverage >= 80
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          }
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
            9 tracked indicators
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <OverviewMetricCell
            title="Security"
            value={formatCount(vulnerabilities)}
            primaryDetail="Open issues"
            icon={Shield}
            tone="red"
            graphValue={securityGraph}
            grade={secGrade}
          />
          <OverviewMetricCell
            title="Reliability"
            value={formatCount(bugs)}
            primaryDetail="Open issues"
            icon={Bug}
            tone="amber"
            graphValue={reliabilityGraph}
            grade={relGrade}
          />
          <OverviewMetricCell
            title="Maintainability"
            value={formatCount(codeSmells)}
            primaryDetail="Open issues"
            icon={Wrench}
            tone="blue"
            graphValue={maintainabilityGraph}
            grade={mntGrade}
          />
          <OverviewMetricCell
            title="Accepted issues"
            value={formatCount(acceptedIssues)}
            secondaryDetail="Valid issues that were not fixed"
            icon={ClipboardCheck}
            tone="slate"
            graphValue={acceptedGraph}
            ring="neutral"
          />
          <OverviewMetricCell
            title="Coverage"
            value={formatPercent(coverage)}
            secondaryDetail="Coverage reported by scanner"
            icon={Focus}
            tone={coverage >= 80 ? "emerald" : "amber"}
            graphValue={coverage}
            ring={coverage >= 80 ? "ok" : "bad"}
          />
          <OverviewMetricCell
            title="Duplications"
            value={formatPercent(duplications)}
            secondaryDetail="Duplicated lines percentage"
            icon={Copy}
            tone={duplications <= 3 ? "emerald" : "red"}
            graphValue={Math.min(duplications * 10, 100)}
            ring={duplications <= 3 ? "ok" : "bad"}
          />
          <OverviewMetricCell
            title="Security Hotspots"
            value={formatCount(hotspots)}
            icon={Eye}
            tone={hotspots > 0 ? "amber" : "blue"}
            graphValue={hotspotsGraph}
            grade={getGrade(hotspots, 0, 3)}
          />
          <OverviewMetricCell
            title="Dependency scan"
            value={formatCount(dependencySummary?.vulnerable)}
            primaryDetail="Vulnerable packages"
            secondaryDetail={`${formatCount(dependencySummary?.outdated)} outdated • ${formatCount(dependencySummary?.license_issues)} license issues`}
            icon={Package}
            tone={depCritical > 0 ? "red" : (dependencySummary?.vulnerable ?? 0) > 0 ? "amber" : "emerald"}
            graphValue={dependencyScanGraph}
            grade={getGrade(depCritical, 0, 1)}
          />
          <OverviewMetricCell
            title="Dependency severity"
            value={`${formatCount(depTotal)}`}
            primaryDetail={`${formatCount(depCritical)} critical • ${formatCount(depHigh)} high`}
            secondaryDetail={`${formatCount(depMedium)} medium • ${formatCount(depLow)} low`}
            icon={AlertOctagon}
            tone={
              depCritical > 0
                ? "red"
                : depHigh > 0
                  ? "amber"
                  : depMedium > 0
                    ? "amber"
                    : "emerald"
            }
            graphValue={depSeverityRiskPct}
            ring={
              depCritical > 0
                ? "bad"
                : depHigh > 0
                  ? "neutral"
                  : "ok"
            }
          />
        </div>
      </section>
    </motion.div>
  );
}