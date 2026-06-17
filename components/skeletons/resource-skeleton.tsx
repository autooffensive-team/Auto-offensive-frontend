'use client';

import { motion } from "framer-motion";

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-[#FCFCFA] dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-6 w-36 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
        </div>
        <div className="h-14 w-2/3 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-2xl mb-4 animate-pulse" />
        <div className="h-6 w-1/2 mx-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function DocCategorySkeleton() {
  return (
    <div className="bg-[#FCFCFA] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="flex-1">
          <div className="h-6 w-1/2 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F5F0] dark:bg-[#1A1A1A]">
            <div className="h-4 w-1/3 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
              <div className="h-4 w-4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-black/9 dark:border-white/9">
        <div className="h-5 w-24 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function QuickLinkSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-black/9 dark:border-white/9">
      <div className="w-10 h-10 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
      <div>
        <div className="h-4 w-28 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-1 animate-pulse" />
        <div className="h-3 w-20 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function FeaturedResourceSkeleton() {
  return (
    <div className="bg-[#FCFCFA] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-14 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
        <div className="h-5 w-16 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-full animate-pulse" />
      </div>
      <div className="h-6 w-3/4 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-full bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-1 animate-pulse" />
      <div className="h-4 w-4/5 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg mb-4 animate-pulse" />
      <div className="h-5 w-20 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-md animate-pulse" />
    </div>
  );
}

function NewsletterSkeleton() {
  return (
    <div className="relative rounded-2xl px-6 sm:px-10 py-12 overflow-hidden bg-[#0D1B2A]">
      <div className="h-8 w-2/3 mx-auto bg-[#1A1A1A] rounded-xl mb-2 animate-pulse" />
      <div className="h-5 w-1/2 mx-auto bg-[#1A1A1A] rounded-xl mb-8 animate-pulse" />
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="h-12 w-64 bg-[#1A1A1A] rounded-xl animate-pulse" />
        <div className="h-12 w-28 bg-[#1A1A1A] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function ResourceSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B]"
    >
      <HeroSkeleton />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-10 w-64 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-12 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <DocCategorySkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="bg-[#FCFCFA] dark:bg-[#111113] border-y border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 w-32 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <QuickLinkSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-10 w-64 bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-xl mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <FeaturedResourceSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <NewsletterSkeleton />
      </section>
    </motion.div>
  );
}
