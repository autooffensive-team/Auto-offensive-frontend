"use client";

import Sidebar from "@/components/Sidebar";
import ScanSection from "@/components/GuestDashboard/ScanSection";
import ToolLibrary from "@/components/GuestDashboard/ToolLibrary";
import FeatureCards from "@/components/GuestDashboard/FeatureCards";
import RecentScans from "@/components/GuestDashboard/RecentScans";

function MainContent() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 text-gray-900 dark:bg-Linear-to-br dark:from-[#0b1220] dark:to-[#0d1117] dark:text-white transition-colors">
      <main className="flex-1 overflow-y-auto py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            {/* TITLE */}
            <div className="max-w-2xl">
              <h1 className="display-font text-4xl lg:text-5xl font-bold tracking-tight mb-3 mt-6 text-gray-900 dark:text-white">
                BASIC SCAN
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Sophisticated penetration testing automation, tailored for
                precision and speed.
              </p>
            </div>

            {/* USAGE CARD */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-md dark:shadow-lg transition-all">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M10 2L4 10H9L8 16L14 8H9L10 2Z" fill="#facc15" />
                </svg>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Today&Apos;s Usage
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  0/3 Scans Used
                </p>
              </div>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="space-y-10">
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm dark:shadow-md transition-colors">
              <ScanSection />
            </div>

            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm dark:shadow-md transition-colors">
              <ToolLibrary />
            </div>

            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm dark:shadow-md transition-colors">
              <FeatureCards />
            </div>

            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm dark:shadow-md transition-colors">
              <RecentScans />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0b1220] dark:text-white transition-colors">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <MainContent />
      </div>
    </div>
  );
}
