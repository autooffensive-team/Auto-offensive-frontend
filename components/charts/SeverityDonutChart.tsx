"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useRef, useCallback } from "react";
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
          percentage: Math.round(fraction * 100),
        };
      });
  }, [items, total]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const hoveredItem = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8", className)}>
      {/* Donut SVG */}
      <div className="relative shrink-0" ref={containerRef} onMouseMove={handleMouseMove}>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="rotate-[-90deg]"
          onMouseLeave={() => setHoveredIndex(null)}
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
              strokeWidth={hoveredIndex === idx ? 26 : 22}
              strokeLinecap="round"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              style={{
                cursor: "pointer",
                filter: hoveredIndex === idx ? `drop-shadow(0 0 6px ${seg.strokeColor}50)` : "none",
                transition: "stroke-width 0.2s ease, filter 0.2s ease",
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hoveredItem ? (
            <>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {hoveredItem.count.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {hoveredItem.label}
              </span>
              <span className="text-xs font-bold text-[#00d0b2]">
                {hoveredItem.percentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {total.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {centerLabel}
              </span>
            </>
          )}
        </div>

        {/* Hover tooltip */}
        {hoveredItem && (
          <div
            className="pointer-events-none absolute z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 54,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[12px] font-semibold text-slate-900 dark:text-white">
              {hoveredItem.label}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: hoveredItem.strokeColor }}
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {hoveredItem.count.toLocaleString()} · {hoveredItem.percentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend — always on the right */}
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => {
          const percentage =
            total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.key}
              className="flex items-center gap-3 cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              onMouseEnter={() => setHoveredIndex(segments.findIndex(s => s.key === item.key))}
              onMouseLeave={() => setHoveredIndex(null)}
            >
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
