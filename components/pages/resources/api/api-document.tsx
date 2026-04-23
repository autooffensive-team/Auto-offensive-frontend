"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { LeftSidebar, RightSidebar } from "./api-sidebar";
import type { SidebarSection, TocItem } from "./api-sidebar";
import ApiContent from "./api-content";

const ALL_SECTION_IDS = [
  "overview",
  "auth",
  "ratelimit",
  "errors",
  "proj-list",
  "proj-create",
  "proj-get",
  "proj-delete",
  "scan-create",
  "scan-list",
  "scan-get",
  "scan-stop",
  "scan-retry",
  "results-get",
  "report-gen",
  "report-list",
  "report-download",
];

export default function ApiDocument() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const [activeId, setActiveId] = useState("overview");
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  const sidebarSections: SidebarSection[] = isKhmer
    ? [
        {
          label: "ចាប់ផ្តើម",
          items: [
            { id: "overview", title: "ទិដ្ឋភាពទូទៅ" },
            { id: "auth", title: "Authentication" },
            { id: "ratelimit", title: "Rate Limits" },
            { id: "errors", title: "Error Codes" },
          ],
        },
        {
          label: "Projects",
          items: [
            { id: "proj-list", title: "បញ្ជី Projects", method: "GET" },
            { id: "proj-create", title: "បង្កើត Project", method: "POST" },
            { id: "proj-get", title: "មើល Project", method: "GET" },
            { id: "proj-delete", title: "លុប Project", method: "DELETE" },
          ],
        },
        {
          label: "Scan Jobs",
          items: [
            { id: "scan-create", title: "បង្កើត Scan", method: "POST" },
            { id: "scan-list", title: "បញ្ជី Scans", method: "GET" },
            { id: "scan-get", title: "មើល Scan Status", method: "GET" },
            { id: "scan-stop", title: "បញ្ឈប់ Scan", method: "POST" },
            { id: "scan-retry", title: "Retry Scan", method: "POST" },
          ],
        },
        {
          label: "Results",
          items: [{ id: "results-get", title: "មើល Results", method: "GET" }],
        },
        {
          label: "Reports",
          items: [
            { id: "report-gen", title: "បង្កើត Report", method: "POST" },
            { id: "report-list", title: "បញ្ជី Reports", method: "GET" },
            { id: "report-download", title: "ទាញយក Report", method: "GET" },
          ],
        },
      ]
    : [
        {
          label: "Getting Started",
          items: [
            { id: "overview", title: "Overview" },
            { id: "auth", title: "Authentication" },
            { id: "ratelimit", title: "Rate Limits" },
            { id: "errors", title: "Error Codes" },
          ],
        },
        {
          label: "Projects",
          items: [
            { id: "proj-list", title: "List Projects", method: "GET" },
            { id: "proj-create", title: "Create Project", method: "POST" },
            { id: "proj-get", title: "Get Project", method: "GET" },
            { id: "proj-delete", title: "Delete Project", method: "DELETE" },
          ],
        },
        {
          label: "Scan Jobs",
          items: [
            { id: "scan-create", title: "Create Scan", method: "POST" },
            { id: "scan-list", title: "List Scans", method: "GET" },
            { id: "scan-get", title: "Get Scan Status", method: "GET" },
            { id: "scan-stop", title: "Stop Scan", method: "POST" },
            { id: "scan-retry", title: "Retry Scan", method: "POST" },
          ],
        },
        {
          label: "Results",
          items: [{ id: "results-get", title: "Get Results", method: "GET" }],
        },
        {
          label: "Reports",
          items: [
            { id: "report-gen", title: "Generate Report", method: "POST" },
            { id: "report-list", title: "List Reports", method: "GET" },
            { id: "report-download", title: "Download Report", method: "GET" },
          ],
        },
      ];

  const toc: TocItem[] = isKhmer
    ? [
        {
          id: "overview",
          label: "ទិដ្ឋភាពទូទៅ",
          children: [
            { id: "auth", label: "Authentication" },
            { id: "ratelimit", label: "Rate Limits" },
            { id: "errors", label: "Error Codes" },
          ],
        },
        {
          id: "projects",
          label: "Projects",
          children: [
            { id: "proj-list", label: "បញ្ជី Projects" },
            { id: "proj-create", label: "បង្កើត Project" },
            { id: "proj-get", label: "មើល Project" },
            { id: "proj-delete", label: "លុប Project" },
          ],
        },
        {
          id: "scans",
          label: "Scan Jobs",
          children: [
            { id: "scan-create", label: "បង្កើត Scan" },
            { id: "scan-list", label: "បញ្ជី Scans" },
            { id: "scan-get", label: "មើល Scan Status" },
            { id: "scan-stop", label: "បញ្ឈប់ Scan" },
            { id: "scan-retry", label: "Retry Scan" },
          ],
        },
        {
          id: "results",
          label: "Results",
          children: [{ id: "results-get", label: "មើល Results" }],
        },
        {
          id: "reports",
          label: "Reports",
          children: [
            { id: "report-gen", label: "បង្កើត Report" },
            { id: "report-list", label: "បញ្ជី Reports" },
            { id: "report-download", label: "ទាញយក Report" },
          ],
        },
      ]
    : [
        {
          id: "overview",
          label: "Overview",
          children: [
            { id: "auth", label: "Authentication" },
            { id: "ratelimit", label: "Rate Limits" },
            { id: "errors", label: "Error Codes" },
          ],
        },
        {
          id: "projects",
          label: "Projects",
          children: [
            { id: "proj-list", label: "List Projects" },
            { id: "proj-create", label: "Create Project" },
            { id: "proj-get", label: "Get Project" },
            { id: "proj-delete", label: "Delete Project" },
          ],
        },
        {
          id: "scans",
          label: "Scan Jobs",
          children: [
            { id: "scan-create", label: "Create Scan" },
            { id: "scan-list", label: "List Scans" },
            { id: "scan-get", label: "Get Scan Status" },
            { id: "scan-stop", label: "Stop Scan" },
            { id: "scan-retry", label: "Retry Scan" },
          ],
        },
        {
          id: "results",
          label: "Results",
          children: [{ id: "results-get", label: "Get Results" }],
        },
        {
          id: "reports",
          label: "Reports",
          children: [
            { id: "report-gen", label: "Generate Report" },
            { id: "report-list", label: "List Reports" },
            { id: "report-download", label: "Download Report" },
          ],
        },
      ];

  useEffect(() => {
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

    ALL_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300" style={{ fontFamily: bodyFontFamily }}>
      <div className="mx-auto flex w-full max-w-7xl items-start pt-18 md:pt-20 lg:pt-22">
        <LeftSidebar
          sections={sidebarSections}
          activeId={activeId}
          onNavigate={navigate}
        />

        <main className="flex-1 min-w-0">
          <ApiContent />
        </main>

        <RightSidebar toc={toc} activeId={activeId} onNavigate={navigate} />
      </div>
    </div>
  );
}
