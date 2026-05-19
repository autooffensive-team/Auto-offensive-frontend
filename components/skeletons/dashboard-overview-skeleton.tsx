"use client";

import { motion } from "framer-motion";

// ─── Reusable shimmer block ──────────────────────────────────────────────────

function Shimmer({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/70 ${className}`}
      style={style}
    />
  );
}

// ─── Header skeleton ─────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-1 pt-2 md:flex-row md:items-center md:justify-between">
      <div>
        <Shimmer className="h-3.5 w-44 rounded-md" />
        <Shimmer className="mt-2 h-7 w-56 md:h-8 md:w-64 rounded-xl" />
        <Shimmer className="mt-1.5 h-4 w-72 md:w-96 rounded-md" />
      </div>
      <Shimmer className="mt-2 h-8 w-24 rounded-full md:mt-0" />
    </div>
  );
}

// ─── Metric cards skeleton (6 cards in a row) ────────────────────────────────

function MetricCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.03 }}
      className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-4 md:p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <Shimmer className="h-4 w-20 rounded-md" />
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>
      <Shimmer className="mt-3 h-8 w-16 md:h-10 md:w-20 rounded-lg" />
      <Shimmer className="mt-2 h-3 w-28 rounded-md" />
    </motion.div>
  );
}

function MetricGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <MetricCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// ─── Vulnerability distribution card skeleton ────────────────────────────────

function VulnerabilityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
        <div>
          <Shimmer className="h-5 w-44 rounded-md" />
          <Shimmer className="mt-1.5 h-3.5 w-56 rounded-md" />
        </div>
        <Shimmer className="h-7 w-20 rounded-lg" />
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5">
        {/* Legend dots */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Shimmer className="h-2.5 w-2.5 rounded-full" />
              <Shimmer className="h-3 w-12 rounded-md" />
            </div>
          ))}
        </div>

        {/* Bar chart placeholder */}
        <div className="flex items-end justify-between gap-2 h-44 px-4">
          {[65, 80, 50, 35, 20].map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              className="flex-1 origin-bottom"
            >
              <Shimmer
                className="w-full rounded-md"
                style={{ height: `${h}%` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Summary pills */}
        <div className="mt-5 grid grid-cols-5 gap-1.5 md:gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="aspect-square rounded-lg md:rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scan activity card skeleton ─────────────────────────────────────────────

function ScanActivityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
        <div>
          <Shimmer className="h-5 w-32 rounded-md" />
          <Shimmer className="mt-1.5 h-3.5 w-48 rounded-md" />
        </div>
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>

      <div className="flex flex-col items-center px-4 py-5 md:px-5 md:py-6">
        {/* Radial chart placeholder */}
        <div className="relative flex items-center justify-center">
          <Shimmer className="h-40 w-40 md:h-48 md:w-48 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-white dark:bg-slate-900" />
          </div>
        </div>

        {/* Legend rows */}
        <div className="mt-5 w-full space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shimmer className="h-2.5 w-2.5 rounded-full" />
                <Shimmer className="h-3.5 w-20 rounded-md" />
              </div>
              <Shimmer className="h-3.5 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Asset trend card skeleton ───────────────────────────────────────────────

function AssetTrendCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
        <div>
          <Shimmer className="h-5 w-44 rounded-md" />
          <Shimmer className="mt-1.5 h-3.5 w-64 rounded-md" />
        </div>
        <Shimmer className="h-7 w-16 rounded-lg" />
      </div>

      {/* Chart area */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-end gap-1 h-36 md:h-44">
          {[45, 60, 35, 72, 50, 80, 42, 65, 55, 78, 40, 68, 52, 75, 48].map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.03, duration: 0.4 }}
              className="flex-1 origin-bottom"
            >
              <Shimmer
                className="w-full rounded-sm"
                style={{ height: `${h}%` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── High-risk assets table skeleton ─────────────────────────────────────────

function AssetsTableSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
        <div>
          <Shimmer className="h-5 w-32 rounded-md" />
          <Shimmer className="mt-1.5 h-3.5 w-52 rounded-md" />
        </div>
        <Shimmer className="h-7 w-20 rounded-lg" />
      </div>

      {/* Table header */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-6 gap-4 px-4 py-3 md:px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-3 w-full max-w-16 rounded-md" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + rowIndex * 0.05 }}
            className="grid grid-cols-6 items-center gap-4 px-4 py-3 md:px-6"
          >
            {/* Asset */}
            <div className="flex items-center gap-2.5">
              <Shimmer className="h-7 w-7 shrink-0 rounded-lg" />
              <Shimmer className="h-3.5 w-20 rounded-md" />
            </div>
            {/* IP */}
            <Shimmer className="h-5 w-24 rounded-md" />
            {/* Severity */}
            <Shimmer className="h-5 w-16 rounded-full" />
            {/* Findings */}
            <Shimmer className="h-4 w-8 rounded-md" />
            {/* Risk Score */}
            <div className="flex items-center gap-2">
              <Shimmer className="h-1.5 w-16 rounded-full" />
              <Shimmer className="h-4 w-8 rounded-md" />
            </div>
            {/* Status */}
            <Shimmer className="h-5 w-14 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function DashboardOverviewSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
      aria-busy="true"
      aria-label="Loading dashboard overview"
    >
      <div className="mx-auto max-w-400 space-y-4 p-4 md:space-y-5 md:p-6 lg:space-y-6 lg:p-8">
        <HeaderSkeleton />
        <MetricGridSkeleton />

        {/* Two-column grid: Vulnerability + Scan Activity */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1fr_1fr]">
          <VulnerabilityCardSkeleton />
          <ScanActivityCardSkeleton />
        </div>

        <AssetTrendCardSkeleton />
        <AssetsTableSkeleton />
      </div>
    </motion.div>
  );
}
