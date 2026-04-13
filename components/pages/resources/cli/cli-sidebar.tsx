"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

function SidebarGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 mb-1">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-[#B5B0A8] px-2 pt-2.5 pb-1.5">
        {label}
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  active,
  withDot,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  withDot?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 text-[18px] font-normal px-2 py-1.25 rounded-md transition-all duration-150 cursor-pointer ${
        active
          ? "text-[#00BCA1] bg-[rgba(0,188,161,0.07)] dark:bg-[rgba(0,188,161,0.12)] font-semibold"
          : "text-[#4A4540] dark:text-[#C9CDD4] hover:text-[#1A1714] dark:hover:text-white hover:bg-[#EAE6DE] dark:hover:bg-white/5"
      }`}
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      {withDot && (
        <span
          className={`w-0.75 h-0.75 rounded-full shrink-0 opacity-50 ${
            active ? "bg-[#00BCA1]" : "bg-current"
          }`}
        />
      )}
      {label}
    </a>
  );
}

export default function Sidebar() {
  const [activeId, setActiveId] = useState("installation");
  const locale = useLocale();
  const isKhmer = locale === "kh";

  const cliRefLinks = [
    { href: "#installation", label: isKhmer ? "ការដំឡើង" : "Installation" },
    { href: "#auth", label: "Authentication" },
    { href: "#commands", label: "Commands" },
    { href: "#tools", label: isKhmer ? "Tools ដែលគាំទ្រ" : "Supported Tools" },
    { href: "#execution", label: "Remote Execution" },
    { href: "#streaming", label: "Output Streaming" },
    { href: "#results", label: isKhmer ? "ការគ្រប់គ្រង Results" : "Result Handling" },
    { href: "#jobs", label: "Job Lifecycle" },
    { href: "#security", label: "Security" },
    { href: "#concept", label: isKhmer ? "របៀបដំណើរការ" : "How It Works" },
  ];

  const reportingLinks = [
    { href: "#", label: isKhmer ? "ការបង្កើត Report" : "Report Generation" },
    { href: "#", label: "Templates" },
    { href: "#", label: "Export Formats" },
  ];

  const apiLinks = [
    { href: "#", label: "API Reference" },
    { href: "#", label: "Authentication" },
  ];

  useEffect(() => {
    const sections = document.querySelectorAll(".doc-section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { threshold: 0.18, rootMargin: "-58px 0px -54% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className="w-72 shrink-0 sticky top-22 self-start h-[calc(100vh-5.5rem)] overflow-y-auto py-5.5 border-r border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B] hidden lg:block"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#E2DDD5 transparent" }}
    >
      <SidebarGroup label={isKhmer ? "ឯកសារ CLI" : "CLI Reference"}>
        {cliRefLinks.map((link) => (
          <SidebarItem
            key={link.href}
            href={link.href}
            label={link.label}
            active={activeId === link.href.replace("#", "")}
            withDot
            onClick={(e) => smoothScroll(e, link.href)}
          />
        ))}
      </SidebarGroup>

      <SidebarGroup label="Reporting">
        {reportingLinks.map((link) => (
          <SidebarItem
            key={link.label}
            href={link.href}
            label={link.label}
            active={false}
          />
        ))}
      </SidebarGroup>

      <SidebarGroup label="API">
        {apiLinks.map((link) => (
          <SidebarItem
            key={link.label}
            href={link.href}
            label={link.label}
            active={false}
          />
        ))}
      </SidebarGroup>
    </aside>
  );
}
