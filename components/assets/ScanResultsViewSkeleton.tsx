"use client";

import { motion } from "framer-motion";

function StepSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Step header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
      {/* Table header */}
      <div className="px-4 py-3 flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
      {/* Table rows */}
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="px-4 py-3 flex gap-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
        >
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ScanResultsViewSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header metadata skeleton */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>

      {/* Step sections */}
      <StepSectionSkeleton />
      <StepSectionSkeleton />
      <StepSectionSkeleton />
    </motion.div>
  );
}
