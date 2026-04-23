"use client";

import PageHeader from "@/components/vulnerabilities/PageHeader";
import StatsRow from "@/components/vulnerabilities/buttons/StatsRow";
import FindingsTable from "@/components/vulnerabilities/mediumLowCards/Findingstable";
import GuestBanner from "@/components/vulnerabilities/pagination/GuestBanner";
import Sidebar from "@/components/Sidebar";

export default function VulnerabilitiesPage() {
  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:bg-[#0d1117] dark:text-white transition-colors">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 space-y-8 max-w-350 mx-auto">
          <PageHeader />
          <StatsRow />
          <FindingsTable />
          <GuestBanner />
        </div>
      </main>
    </div>
  );
}
