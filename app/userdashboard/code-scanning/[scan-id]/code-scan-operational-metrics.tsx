"use client";

import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

import type { DependencySummaryResponse } from "@/types/scanner";

type GradeTone = "green" | "lime" | "red" | "muted";

// ─── Operational Ring Chart ───────────────────────────────────────────────────
function OperationalRingChart({
  rings,
  centerValue,
  centerLabel,
}: {
  rings: { label: string; percent: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  // FIX: use viewBox so chart scales on mobile instead of fixed 320px
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 18;
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
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      // FIX: cap size so it doesn't grow too large on wide cards
      style={{ maxWidth: size, display: "block" }}
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
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fontSize={28}
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

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CodeScanOperationalMetricsProps {
  scanSummary: any;
  dependencySummary: DependencySummaryResponse | null;
  totalIssues: number;
  acceptedIssues: number;
  vulnerabilities: number;
  bugs: number;
  codeSmells: number;
  coverage: number;
  duplications: number;
  hotspots: number;
  formatCount: (value: number | null | undefined) => string;
  formatPercent: (value: number | null | undefined) => string;
  getGrade: (
    value: number,
    warningAt: number,
    dangerAt: number,
  ) => { label: string; tone: GradeTone };
}

// ─── Exported Component ───────────────────────────────────────────────────────
export function CodeScanOperationalMetrics({
  scanSummary,
  dependencySummary,
  totalIssues,
  acceptedIssues,
  vulnerabilities,
  bugs,
  codeSmells,
  coverage,
  duplications,
  hotspots,
  formatCount,
  formatPercent,
  getGrade,
}: CodeScanOperationalMetricsProps) {
  const securityGraph        = Math.min(vulnerabilities * 20, 100);
  const reliabilityGraph     = Math.min(bugs * 12, 100);
  const maintainabilityGraph = Math.min(codeSmells, 100);
  const acceptedGraph        = Math.min(acceptedIssues * 15, 100);
  const hotspotsGraph        = Math.min(hotspots * 15, 100);

  const secGrade = getGrade(vulnerabilities, 0, 2);
  const relGrade = getGrade(bugs, 0, 5);
  const mntGrade = getGrade(codeSmells, 10, 50);

  return (
    <section className="rounded-xl sm:rounded-[28px] border border-[#dfe7f3] bg-linear-to-br from-[#fbfdff] via-white to-[#f5f8fd] p-3 dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 sm:p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e6edf7] px-1 pb-4 dark:border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7b8db2] dark:text-gray-500">
            Operational Metrics
          </p>
          {/* FIX: heading scales down on mobile */}
          <h2 className="mt-2 text-base font-semibold text-[#17233f] sm:text-lg dark:text-gray-100">
            Code quality and remediation posture
          </h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#eef4fb] px-3 py-1 text-[11px] font-medium text-[#4f6290] dark:bg-gray-900 dark:text-gray-300">
          8 tracked indicators
        </span>
      </div>

      {/* FIX: 1 column on mobile, 2 on md */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
        {/* Chart 1: Code Quality */}
        {(() => {
          const qualityRings = [
            { label: "Security", value: vulnerabilities, percent: securityGraph, color: "#E24B4A", grade: `Grade ${secGrade.label}` },
            { label: "Vulnerable Deps", value: dependencySummary?.vulnerable ?? 0, percent: Math.min((dependencySummary?.vulnerable ?? 0) * 2, 100), color: "#F59E0B", grade: `${dependencySummary?.vulnerable ?? 0} packages` },
            { label: "Maintainability", value: codeSmells, percent: maintainabilityGraph, color: "#3B82F6", grade: `Grade ${mntGrade.label}` },
            { label: "Accepted issues", value: acceptedIssues, percent: acceptedGraph, color: "#8B5CF6", grade: "Tracked" },
          ];

          return (
            <div className="rounded-xl border border-[#e4eaf4] bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4">
                <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Code Quality</p>
                <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">Security, reliability & maintainability</p>
              </div>

              {/* FIX: chart centered, capped width so it doesn't stretch */}
              <div className="flex flex-col items-center">
                <div className="w-full" style={{ maxWidth: 280 }}>
                  <OperationalRingChart rings={qualityRings} centerValue={formatCount(totalIssues)} centerLabel="total issues" />
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {qualityRings.map((ring) => (
                  <div key={ring.label} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="inline-block size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: ring.color }}
                      />
                      <span className="truncate text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                        {ring.label}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
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
            { label: "Coverage", value: formatPercent(coverage), percent: Math.max(coverage, 0), color: "#10B981", grade: coverage >= 80 ? "Healthy" : "Needs review" },
            { label: "Duplications", value: formatPercent(duplications), percent: Math.min(duplications * 10, 100), color: "#06B6D4", grade: duplications <= 3 ? "Healthy" : "Needs review" },
            { label: "Security Hotspots", value: formatCount(hotspots), percent: hotspotsGraph, color: "#F97316", grade: `Grade ${getGrade(hotspots, 0, 3).label}` },
            { label: "Reliability", value: formatCount(bugs), percent: reliabilityGraph, color: "#EC4899", grade: `Grade ${relGrade.label}` },
          ];

          return (
            <div className="rounded-xl border border-[#e4eaf4] bg-white p-3 sm:p-4 md:p-5 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4">
                <p className="text-sm font-bold text-[#17233f] dark:text-gray-100">Health & Scans</p>
                <p className="mt-0.5 text-xs text-[#52648f] dark:text-gray-400">Coverage, duplication & reliability posture</p>
              </div>

              {/* FIX: chart centered, capped width so it doesn't stretch */}
              <div className="flex flex-col items-center">
                <div className="w-full" style={{ maxWidth: 280 }}>
                  <OperationalRingChart rings={healthRings} centerValue={formatPercent(coverage)} centerLabel="coverage" />
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {healthRings.map((ring) => (
                  <div key={ring.label} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="inline-block size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: ring.color }}
                      />
                      <span className="truncate text-[11px] font-medium text-[#52648f] dark:text-gray-400">
                        {ring.label}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
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
  );
}