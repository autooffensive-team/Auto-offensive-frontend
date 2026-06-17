'use client';

import { motion } from "framer-motion";

function ToolsHeroSkeleton() {
  return (
    <div className="bg-[#FCFCFA] dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="h-12 w-2/3 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-4 animate-pulse" />
            <div className="h-6 w-full max-w-md bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="h-11 w-full max-w-md bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 w-24 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCardSkeleton() {
  return (
    <div className="bg-[#FCFCFA] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
          <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
        </div>
      </div>
      <div>
        <div className="h-6 w-1/3 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
        <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-1 animate-pulse" />
        <div className="h-4 w-4/5 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
        <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
        <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
      </div>
      <div className="pt-3 border-t border-black/9 dark:border-white/9">
        <div className="h-5 w-24 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
      </div>
    </div>
  );
}

function ToolsGridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ToolsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen mt-17 bg-[#F7F5F0] dark:bg-[#09090B]"
    >
      <ToolsHeroSkeleton />
      <ToolsGridSkeleton />
    </motion.div>
  );
}
