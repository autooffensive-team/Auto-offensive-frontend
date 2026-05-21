"use client";

import HeaderSection from "@/components/live-scan-medium/HeaderSection";
import ToolChain from "@/components/live-scan-medium/ToolChain";
import ActionBar from "@/components/live-scan-medium/ActionBar";
import Terminal from "@/components/live-scan-medium/Terminal";
import BottomActions from "@/components/live-scan-medium/BottomActions";
import Sidebar from "@/components/Sidebar";
import { useLocale } from "next-intl";

export default function LiveScanMediumPage() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors" style={{ fontFamily: bodyFontFamily }}>
      {/* Sidebar */}
      <aside className="w-64 hidden md:block border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl w-auto mx-auto px-6 py-10 space-y-10">
          <HeaderSection />
          <ToolChain />
          <ActionBar />
          <Terminal />
          <BottomActions />
        </div>
      </main>
    </div>
  );
}
