'use client';

import { motion } from "framer-motion";

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-6 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
        </div>
        <div className="h-16 w-3/4 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-2xl mb-4 animate-pulse" />
        <div className="h-6 w-2/3 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="flex justify-center gap-4 mt-10">
          <div className="h-12 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
          <div className="h-12 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FeaturesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="h-10 w-64 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-12 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FCFCFA] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6">
            <div className="w-12 h-12 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-4 animate-pulse" />
            <div className="h-6 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-3 animate-pulse" />
            <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-5/6 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreeCardsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FCFCFA] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6">
            <div className="h-48 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-4 animate-pulse" />
            <div className="h-6 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-3 animate-pulse" />
            <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B]"
    >
      <HeroSkeleton />
      <FeaturesSkeleton />
      <ThreeCardsSkeleton />
    </motion.div>
  );
}
