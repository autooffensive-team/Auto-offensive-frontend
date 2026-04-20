"use client";

import Sidebar from "@/components/pages/resources/cli/cli-sidebar";
import Content from "@/components/pages/resources/cli/cli-content";

export default function CliDocument() {
  return (
    <div className="cli-doc-page min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300">
      {/* ── Three-col layout ── */}
      <div className="mx-auto flex w-full max-w-7xl items-start pt-22">
        {/* Left sidebar */}
        <Sidebar />

        {/* Content + Right TOC (TOC is rendered inside Content) */}
        <Content />
      </div>
    </div>
  );
}
