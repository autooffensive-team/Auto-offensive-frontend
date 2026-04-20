"use client";

import ScanSection from "@/components/Guestdashboard/ScanSection";
import ToolLibrary from "@/components/Guestdashboard/ToolLibrary";
import FeatureCards from "@/components/Guestdashboard/FeatureCards";
import RecentScans from "@/components/Guestdashboard/RecentScans";

export default function MainContent() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      <main className="flex-1 overflow-y-auto py-8">
        {/* Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                Basic Scan
              </h1>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                Sophisticated penetration testing automation, tailored for
                precision and speed.
              </p>
            </div>

            {/* Usage Badge */}
            <div
              className="flex items-center gap-3 
                         bg-white dark:bg-gray-900 
                         border border-gray-200 dark:border-gray-700 
                         rounded-xl px-4 py-3 shadow-sm dark:shadow-none"
            >
              <div
                className="w-9 h-9 rounded-lg 
                           bg-yellow-50 dark:bg-yellow-900/30 
                           border border-yellow-200 dark:border-yellow-700 
                           flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M10 2L4 10H9L8 16L14 8H9L10 2Z" fill="#f59e0b" />
                </svg>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest font-medium text-gray-400 dark:text-gray-500">
                  Today&apos;s Usage
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  0/3 Scans Used Today
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <ScanSection />
            <ToolLibrary />
            <FeatureCards />
            <RecentScans />
          </div>
        </div>
      </main>
    </div>
  );
}
