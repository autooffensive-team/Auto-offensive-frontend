"use client";

import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/guestDashboard/MainContent";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Sidebar takes fixed width but full height */}
      <div className="flex-none">
        <Sidebar />
      </div>

      {/* Main content stretches and scrolls if needed */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MainContent />
        </div>
      </div>
    </div>
  );
}
