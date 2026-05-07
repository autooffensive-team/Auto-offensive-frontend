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

// ─── Overview Metric Cell (original) ─────────────────────────────────────────
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
  const toneStyles: Record<
    MetricTone,
    {
      iconWrap: string;
      icon: string;
      topLine: string;
      surface: string;
      glow: string;
      border: string;
    }
  > = {
    teal: {
      iconWrap: "bg-teal-50 dark:bg-teal-500/10",
      icon: "text-teal-600 dark:text-teal-300",
      topLine: "from-teal-500 to-teal-300",
      surface: "from-white via-white to-teal-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-teal-500/5",
      glow: "bg-teal-500/10",
      border: "hover:border-teal-200 dark:hover:border-teal-500/20",
    },
    emerald: {
      iconWrap: "bg-emerald-50 dark:bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-300",
      topLine: "from-emerald-500 to-emerald-300",
      surface: "from-white via-white to-emerald-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-500/5",
      glow: "bg-emerald-500/10",
      border: "hover:border-emerald-200 dark:hover:border-emerald-500/20",
    },
    amber: {
      iconWrap: "bg-amber-50 dark:bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-300",
      topLine: "from-amber-500 to-amber-300",
      surface: "from-white via-white to-amber-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-amber-500/5",
      glow: "bg-amber-500/10",
      border: "hover:border-amber-200 dark:hover:border-amber-500/20",
    },
    red: {
      iconWrap: "bg-red-50 dark:bg-red-500/10",
      icon: "text-red-600 dark:text-red-300",
      topLine: "from-red-500 to-red-300",
      surface: "from-white via-white to-red-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-red-500/5",
      glow: "bg-red-500/10",
      border: "hover:border-red-200 dark:hover:border-red-500/20",
    },
    blue: {
      iconWrap: "bg-blue-50 dark:bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-300",
      topLine: "from-blue-500 to-blue-300",
      surface: "from-white via-white to-blue-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-blue-500/5",
      glow: "bg-blue-500/10",
      border: "hover:border-blue-200 dark:hover:border-blue-500/20",
    },
    slate: {
      iconWrap: "bg-slate-100 dark:bg-slate-800",
      icon: "text-slate-600 dark:text-slate-300",
      topLine: "from-slate-500 to-slate-300",
      surface: "from-white via-white to-slate-50/70 dark:from-gray-950 dark:via-gray-950 dark:to-slate-500/5",
      glow: "bg-slate-500/10",
      border: "hover:border-slate-300 dark:hover:border-slate-700",
    },
  };

  const gradeStyles: Record<GradeTone, string> = {
    green:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    lime:
      "bg-lime-50 text-lime-700 ring-1 ring-lime-200 dark:bg-lime-500/10 dark:text-lime-300 dark:ring-lime-500/20",
    red:
      "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
    muted:
      "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  };

  const ringStyles = {
    ok: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    bad: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
    neutral:
      "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  } as const;

  const statusLabel = grade
    ? `Grade ${grade.label}`
    : ring === "ok"
      ? "Healthy"
      : ring === "bad"
        ? "Needs review"
        : ring === "neutral"
          ? "Tracked"
          : null;

  const statusStyles = grade
    ? gradeStyles[grade.tone]
    : ring
      ? ringStyles[ring]
      : ringStyles.neutral;

  const toneStyle = toneStyles[tone];
  const normalizedGraphValue =
    graphValue == null ? null : Math.max(0, Math.min(100, graphValue));
  const segmentedTotal =
    graphSegments?.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0) ?? 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-[#e4eaf4] bg-linear-to-br p-5 transition-all duration-300 dark:border-gray-800",
        toneStyle.surface,
        toneStyle.border,
        className
      )}
    >
      <div
        className={cn(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          toneStyle.glow,
          "opacity-70"
        )}
      />
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-inner",
                toneStyle.iconWrap
              )}
            >
              <Icon className={cn("size-5", toneStyle.icon)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8db4] dark:text-gray-500">
                Metric
              </p>
              <h3 className="mt-1.5 text-sm font-semibold text-[#17233f] dark:text-gray-100">
                {title}
              </h3>
            </div>
          </div>
          {statusLabel ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                statusStyles
              )}
            >
              {statusLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-7">
          <div className="flex flex-wrap items-end gap-3">
            <span className="font-mono text-[2rem] font-bold leading-none tracking-[-0.04em] text-[#071120] dark:text-white">
              {value}
            </span>
            {primaryDetail && (
              <span className="inline-flex items-center rounded-full border border-[#e4eaf4] bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#52648f] dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300">
                {primaryDetail}
              </span>
            )}
          </div>
          {secondaryDetail && (
            <p className="mt-3 max-w-[32ch] text-sm leading-6 text-[#4f6290] dark:text-gray-400">
              {secondaryDetail}
            </p>
          )}
          {graphSegments && graphSegments.length > 0 ? (
            <div className="mt-4 space-y-2">
              <div className="flex h-2 overflow-hidden rounded-full bg-[#e8edf6] dark:bg-gray-800">
                {segmentedTotal > 0 ? (
                  graphSegments.map((segment, index) => (
                    <div
                      key={`${title}-segment-${index}`}
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(Math.max(segment.value, 0) / segmentedTotal) * 100}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  ))
                ) : (
                  <div className="h-full w-full bg-[#d9e2f0] dark:bg-gray-700" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {graphSegments.map((segment, index) => (
                  <span
                    key={`${title}-legend-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-[#52648f] dark:bg-gray-900/80 dark:text-gray-300"
                  >
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    {segment.value}
                  </span>
                ))}
              </div>
            </div>
          ) : normalizedGraphValue != null ? (
            <div className="mt-4 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-[#e8edf6] dark:bg-gray-800">
                <div
                  className={cn(
                    "h-full rounded-full bg-linear-to-r transition-all duration-500",
                    toneStyle.topLine
                  )}
                  style={{ width: `${normalizedGraphValue}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-[#8a9bbc] dark:text-gray-500">
                <span>Impact</span>
                <span>{Math.round(normalizedGraphValue)}%</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-[#e8edf6] pt-3 dark:border-gray-800">
            <span className="text-[11px] font-medium text-[#8a9bbc] dark:text-gray-500">
              Latest scan snapshot
            </span>
            <span className="text-[11px] font-medium text-[#52648f] dark:text-gray-400">
              {title}
            </span>
          </div>
        </div>
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

  const gradeBadgeStyle = (tone: GradeTone) =>
    tone === "green" || tone === "lime"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : tone === "red"
        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

  const secGrade = getGrade(vulnerabilities, 0, 2);
  const relGrade = getGrade(bugs, 0, 5);
  const mntGrade = getGrade(codeSmells, 10, 50);

  // ── Donut segment data ─────────────────────────────────────────────────────
  // Severity palette:
  // Critical → #DC2626, High → #EA580C, Medium → #D97706, Low → #16A34A,
  // Info / Safe → #2563EB
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

  // Health: coverage % vs duplication % vs remainder
  const covPct   = Math.round(coverage);
  const dupPct   = Math.round(duplications);
  const restPct  = Math.max(0, 100 - covPct - dupPct);
  const healthSegments: DonutSegment[] = [
    { label: "Coverage",    count: covPct,  color: "#16A34A" },
    { label: "Duplication", count: dupPct,  color: "#DC2626" },
    { label: "Uncovered",   count: restPct, color: "#2563EB" },
  ];
  const securityGraph = Math.min(vulnerabilities * 20, 100);
  const reliabilityGraph = Math.min(bugs * 12, 100);
  const maintainabilityGraph = Math.min(codeSmells, 100);
  const acceptedGraph = Math.min(acceptedIssues * 15, 100);
  const hotspotsGraph = Math.min(hotspots * 15, 100);
  const dependencyScanGraph =
    depTotal > 0
      ? Math.round(((dependencySummary?.vulnerable ?? depTotal) / depTotal) * 100)
      : Math.min((dependencySummary?.vulnerable ?? 0) * 10, 100);
  const normalizedScanProgress = Math.max(
    0,
    Math.min(100, Math.round(scanProgress))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* ── Row 1: Top Stat Cards (original) ──────────────────────────────── */}
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

      {/* ── Row 2: 4 Donut Cards (new) ────────────────────────────────────── */}
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
          badgeStyle={gradeBadgeStyle(mntGrade.tone)}
          delay={0.1}
        />
        <DonutCard
          title="Security"
          subtitle="Vulnerabilities & hotspots"
          segments={secSegments}
          totalLabel={`${formatCount(vulnerabilities + hotspots + acceptedIssues)} security items`}
          badgeText={`Grade ${secGrade.label}`}
          badgeStyle={gradeBadgeStyle(secGrade.tone)}
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

      {/* ── Row 3: Operational Metrics ─────────────────────────────────────── */}
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
            value={`${formatCount(depCritical)} critical`}
            primaryDetail={`${formatCount(depHigh)} high`}
            secondaryDetail={`${formatCount(depMedium)} medium • ${formatCount(depLow)} low`}
            icon={AlertOctagon}
            tone={
              depCritical > 0
                ? "red"
                : (dependencySummary?.vulnerable ?? 0) > 0
                  ? "amber"
                  : "emerald"
            }
            graphSegments={[
              { value: depCritical, color: "#DC2626" },
              { value: depHigh, color: "#EA580C" },
              { value: depMedium, color: "#D97706" },
              { value: depLow, color: "#16A34A" },
            ]}
            ring={
              depCritical > 0
                ? "bad"
                : (dependencySummary?.vulnerable ?? 0) > 0
                  ? "neutral"
                  : "ok"
            }
          />
        </div>
      </section>
    </motion.div>
  );
}
