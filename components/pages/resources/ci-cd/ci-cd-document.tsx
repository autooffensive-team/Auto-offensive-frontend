"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import CICDContent from "./ci-cd-content";
import {
  LeftSidebar,
  RightSidebar,
  type SidebarSection,
  type TocItem,
} from "./ci-cd-sidebar";

export default function CICDDocument() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const sidebarSections: SidebarSection[] = isKhmer
    ? [
        {
          label: "ទិដ្ឋភាពទូទៅ",
          items: [
            { id: "overview", title: "សេចក្ដីផ្ដើម" },
            { id: "workflow", title: "លំហូរ CI/CD" },
            { id: "auth", title: "Authentication" },
            { id: "endpoints", title: "API Endpoints" },
          ],
        },
        {
          label: "លំហូរ Pipeline",
          items: [
            { id: "trigger", title: "បើកការស្កេន" },
            { id: "status", title: "ស្ថានភាព Job" },
            { id: "results", title: "ទាញយកលទ្ធផល" },
            { id: "report", title: "ទាញយក Report" },
          ],
        },
        {
          label: "មគ្គុទេសក៍",
          items: [
            { id: "pipeline", title: "ឧទាហរណ៍ Pipeline" },
            { id: "thresholds", title: "Severity Thresholds" },
            { id: "access", title: "Access Scoping" },
          ],
        },
      ]
    : [
        {
          label: "Overview",
          items: [
            { id: "overview", title: "Introduction" },
            { id: "workflow", title: "CI/CD Workflow" },
            { id: "auth", title: "Authentication" },
            { id: "endpoints", title: "API Endpoints" },
          ],
        },
        {
          label: "Pipeline Flow",
          items: [
            { id: "trigger", title: "Trigger Scan" },
            { id: "status", title: "Job Status" },
            { id: "results", title: "Result Retrieval" },
            { id: "report", title: "Report Download" },
          ],
        },
        {
          label: "Guides",
          items: [
            { id: "pipeline", title: "Pipeline Example" },
            { id: "thresholds", title: "Severity Thresholds" },
            { id: "access", title: "Access Scoping" },
          ],
        },
      ];
  const toc: TocItem[] = isKhmer
    ? [
        { id: "overview", label: "ទិដ្ឋភាពទូទៅ" },
        { id: "workflow", label: "លំហូរ CI/CD" },
        { id: "auth", label: "Authentication" },
        { id: "endpoints", label: "API Endpoints" },
        { id: "trigger", label: "ការបើកការស្កេន" },
        { id: "status", label: "ស្ថានភាព Job" },
        { id: "results", label: "ទាញយកលទ្ធផល" },
        { id: "report", label: "ទាញយក Report" },
        { id: "pipeline", label: "ឧទាហរណ៍ Pipeline" },
        { id: "thresholds", label: "Severity Thresholds" },
        { id: "access", label: "Access Scoping" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "workflow", label: "CI/CD Workflow" },
        { id: "auth", label: "Authentication" },
        { id: "endpoints", label: "API Endpoints" },
        { id: "trigger", label: "Triggering a Scan" },
        { id: "status", label: "Job Status" },
        { id: "results", label: "Result Retrieval" },
        { id: "report", label: "Report Download" },
        { id: "pipeline", label: "Pipeline Example" },
        { id: "thresholds", label: "Severity Thresholds" },
        { id: "access", label: "Access Scoping" },
      ];
  const allSectionIds = toc.map((item) => item.id);
  const [activeId, setActiveId] = useState("overview");
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: "-90px 0px -45% 0px",
      }
    );

    sections.forEach((section) => {
      if (allSectionIds.includes(section.id)) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [allSectionIds]);

  const navigate = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300" style={{ fontFamily: bodyFontFamily }}>
      <div className="mx-auto flex w-full max-w-7xl items-start pt-22">
        <LeftSidebar
          sections={sidebarSections}
          activeId={activeId}
          onNavigate={navigate}
        />

        <main className="flex-1 min-w-0">
          <CICDContent />
        </main>

        <RightSidebar toc={toc} activeId={activeId} onNavigate={navigate} />
      </div>
    </div>
  );
}
