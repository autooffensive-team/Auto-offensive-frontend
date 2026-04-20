"use client";

import ScanSection from "@/components/GuestDashboard/ScanSection";
import ToolLibrary from "@/components/GuestDashboard/ToolLibrary";
import FeatureCards from "@/components/GuestDashboard/FeatureCards";
import RecentScans from "@/components/GuestDashboard/RecentScans";

export default function MainContent() {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0b1220] to-[#0d1117] text-white">
      <main className="flex-1 overflow-y-auto py-10">
        {/* Container */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            {/* Title Section */}
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                BASIC SCAN
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Sophisticated penetration testing automation, tailored for
                precision and speed.
              </p>
            </div>

            {/* Usage Card */}
            <div className="flex items-center gap-4 bg-[#111827] border border-gray-700 rounded-2xl px-5 py-4 shadow-lg">
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M10 2L4 10H9L8 16L14 8H9L10 2Z" fill="#facc15" />
                </svg>
              </div>

              {/* Text */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Today's Usage
                </p>
                <p className="text-lg font-semibold text-white">
                  0/3 Scans Used
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Scan Section Card */}
            <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 shadow-md">
              <ScanSection />
            </div>

            {/* Tool Library */}
            <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 shadow-md">
              <ToolLibrary />
            </div>

            {/* Features */}
            <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 shadow-md">
              <FeatureCards />
            </div>

            {/* Recent Scans */}
            <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 shadow-md">
              <RecentScans />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
