"use client";

import Hero from "@/components/live-scans/Hero";
import ProgressBar from "@/components/live-scans/ProgressBar";
import LeftPanel from "@/components/live-scans/LeftPanel";
import Terminal from "@/components/live-scans/Terminal";
import Features from "@/components/live-scans/Features";
import Sidebar from "@/components/Sidebar";
import { useLocale } from "next-intl";

export default function OrchestrationPage() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900" style={{ fontFamily: bodyFontFamily }}>
      {/* Sidebar */}
      <aside className="w-64 hidden md:block border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 lg:p-10 space-y-6">
          {/* Hero Section */}
          <Hero />

          {/* Progress Bar */}
          <ProgressBar />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Panel */}
            <div className="space-y-6">
              <LeftPanel />
            </div>

            {/* Terminal Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <Terminal />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="pt-6 pb-16">
            <Features />
          </div>
        </div>
      </main>
    </div>
  );
}