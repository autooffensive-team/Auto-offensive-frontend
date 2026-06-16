'use client';

import { motion } from "framer-motion";

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 text-center px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="h-6 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
        </div>
        <div className="h-16 w-3/4 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-2xl mb-4 animate-pulse" />
        <div className="h-6 w-2/3 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="flex justify-center gap-3 mt-8">
          <div className="h-11 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
          <div className="h-11 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ModuleCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-7 sm:p-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="h-4 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
      </div>
      <div className="h-7 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-3 animate-pulse" />
      <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-4/5 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-5 animate-pulse" />
      <div className="h-5 w-28 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
      <div className="mt-6 p-4 bg-[#111113] rounded-xl">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
          <div className="ml-3 h-3 w-24 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AICardSkeleton() {
  return (
    <div className="rounded-2xl p-7 sm:p-8 relative overflow-hidden bg-gradient-to-br from-primary to-[#2CA3FF]">
      <div className="w-10 h-10 bg-white/15 rounded-xl mb-5 animate-pulse" />
      <div className="h-7 w-3/4 bg-white/10 rounded-lg mb-3 animate-pulse" />
      <div className="h-4 w-full bg-white/10 rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-3/5 bg-white/10 rounded-lg mb-6 animate-pulse" />
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-3">
          <div className="h-6 w-12 bg-white/10 rounded-lg mb-1 animate-pulse" />
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-3">
          <div className="h-6 w-12 bg-white/10 rounded-lg mb-1 animate-pulse" />
          <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-11 w-36 bg-white/15 rounded-xl animate-pulse" />
    </div>
  );
}

function SmallCardSkeleton() {
  return (
    <div className="rounded-2xl p-7 sm:p-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      <div className="w-10 h-10 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-5 animate-pulse" />
      <div className="h-6 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-3 animate-pulse" />
      <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-4/5 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-4 animate-pulse" />
      <div className="h-4 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded animate-pulse" />
    </div>
  );
}

function ReportSectionSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-900/60">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-8 sm:p-10 lg:p-12">
          <div className="h-6 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full mb-5 animate-pulse" />
          <div className="h-10 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-4 animate-pulse" />
          <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-4/5 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-6 animate-pulse" />
          <div className="flex gap-2 mb-8">
            <div className="h-7 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
            <div className="h-7 w-40 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
            <div className="h-7 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-44 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
        <div className="p-8 sm:p-12 bg-slate-50 dark:bg-slate-800/40 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <div className="w-48 sm:w-56 bg-[#FCFCFA] dark:bg-slate-900 rounded-2xl shadow-xl p-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 bg-amber-400 rounded-t-lg" />
            <div className="flex items-center justify-center mb-4 mt-2">
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="text-center">
              <div className="h-3 w-20 mx-auto bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            </div>
            <div className="flex items-end gap-1.5 justify-center mb-4">
              {[32, 52, 40, 64, 44].map((_, i) => (
                <div key={i} className="w-5 bg-slate-200 dark:bg-slate-700 rounded-t-sm animate-pulse" style={{ height: _ }} />
              ))}
            </div>
            {[80, 60, 70, 50].map((w, i) => (
              <div key={i} className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-2 animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowStepSkeleton() {
  return (
    <div className="rounded-2xl p-6 text-center border bg-[#FCFCFA] dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="h-4 w-6 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded animate-pulse" />
      </div>
      <div className="h-6 w-1/2 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
    </div>
  );
}

export default function FeatureSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#FCFCFA] dark:bg-[#030712]"
    >
      <HeroSkeleton />

      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          <ModuleCardSkeleton className="lg:col-span-3" />
          <div className="lg:col-span-2">
            <AICardSkeleton />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SmallCardSkeleton />
          <SmallCardSkeleton />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
        <ReportSectionSkeleton />
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 w-64 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <WorkflowStepSkeleton key={i} />
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="h-12 w-44 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
      </section>
    </motion.div>
  );
}
