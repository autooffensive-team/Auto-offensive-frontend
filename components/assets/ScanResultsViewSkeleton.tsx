"use client";

import { motion } from "framer-motion";

function StepSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Step header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      {/* Table header */}
      <div className="px-4 py-3 flex gap-4 border-b border-gray-200 dark:border-gray-800">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
      {/* Table rows */}
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="px-4 py-3 flex gap-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
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
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Step sections */}
      <StepSectionSkeleton />
      <StepSectionSkeleton />
      <StepSectionSkeleton />
    </motion.div>
  );
}
