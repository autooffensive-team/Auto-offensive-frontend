"use client";

import FeatureCards from "@/components/GuestDashboard/FeatureCards";
import ScanSection from "@/components/GuestDashboard/ScanSection";
import ActionBar from "@/components/live-scan-medium/ActionBar";
import BottomActions from "@/components/live-scan-medium/BottomActions";
import HeaderSection from "@/components/live-scan-medium/HeaderSection";
import ToolChain from "@/components/live-scan-medium/ToolChain";
import RecentScans from "@/components/mediumscan/RecentScans";
import ToolLibrary from "@/components/mediumscan/ToolLibrary";
import { Terminal } from "lucide-react";

export default function GuestLiveScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Live Scan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          Run a quick security assessment on your target.
        </p>
      </div>

                {/* SECTIONS */}
          <div className="space-y-10">
                 <HeaderSection />
                     <ToolChain />
                     <ActionBar />
                     <Terminal />
                     <BottomActions />
          </div>
    </div>
  );
}
