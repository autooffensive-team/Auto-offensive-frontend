"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type SeverityItem = {
  key: string;
  label: string;
  count: number;
  color: string; // Tailwind bg class for the legend dot
  strokeColor: string; // Hex/HSL color for the SVG arc
};

interface SeverityDonutChartProps {
  items: SeverityItem[];
  total: number;
  centerLabel?: string;
  className?: string;
}

/**
 * Donut chart with center total and right-side legend.
 * Pure SVG — no external charting library needed.
 */
export function SeverityDonutChart({
  items,
  total,
  centerLabel = "Total",
  className,
}: SeverityDonutChartProps) {
  const segments = useMemo(() => {
    if (total === 0) return [];

    const RADIUS = 80;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    let cumulativeOffset = 0;

    return items
      .filter((item) => item.count > 0)
      .map((item) => {
        const fraction = item.count / total;
        const dashLength = fraction * CIRCUMFERENCE;
        const gapLength = CIRCUMFERENCE - dashLength;
        const offset = cumulativeOffset;
        cumulativeOffset += dashLength;

        return {
          ...item,
          dashArray: `${dashLength} ${gapLength}`,
          dashOffset: -offset,
          radius: RADIUS,
          circumference: CIRCUMFERENCE,
        };
      });
  }, [items, total]);

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8", className)}>
      {/* Donut SVG */}
      <div className="relative shrink-0">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="rotate-[-90deg]"
        >
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="22"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Segments */}
          {segments.map((seg, idx) => (
            <motion.circle
              key={seg.key}
              cx="100"
              cy="100"
              r={seg.radius}
              fill="none"
              stroke={seg.strokeColor}
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {total.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend — always on the right */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const percentage =
            total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.key} className="flex items-center gap-3">
              <span
                className={cn("h-3.5 w-3.5 rounded-full shrink-0", item.color)}
              />
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  {item.count.toLocaleString()} ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
