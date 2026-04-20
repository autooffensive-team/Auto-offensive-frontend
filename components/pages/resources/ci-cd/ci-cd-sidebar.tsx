"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";

export interface SidebarItem {
  id: string;
  title: string;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export interface TocItem {
  id: string;
  label: string;
}

interface LeftSidebarProps {
  sections: SidebarSection[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export function LeftSidebar({
  sections,
  activeId,
  onNavigate,
}: LeftSidebarProps) {
  const locale = useLocale();
  const sansFontStyle = {
    fontFamily:
      locale === "kh"
        ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
        : "var(--font-google-sans), var(--font-noto-khmer), sans-serif",
  } as const;
  return (
    <aside className="hidden lg:block w-72 shrink-0 sticky top-22 self-start h-[calc(100vh-5.5rem)] overflow-y-auto py-5.5 border-r border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="px-5">
        {sections.map((section) => (
          <div key={section.label} className="mb-7">
            <p className="px-2 mb-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[#B5B0A8] dark:text-[#9CA3AF]">
              {section.label}
            </p>

            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-150 ${
                      active
                        ? "bg-[#00BCA1]/10 text-[#00BCA1] border-[#00BCA1]/25 font-medium"
                        : "text-[#4A4540] dark:text-[#C9CDD4] border-transparent hover:bg-[#EEEAE2] dark:hover:bg-white/5 hover:text-[#1A1714] dark:hover:text-white"
                    }`}
                    style={{ ...sansFontStyle, fontSize: "18px", lineHeight: "1.55" }}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

interface RightSidebarProps {
  toc: TocItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export function RightSidebar({
  toc,
  activeId,
  onNavigate,
}: RightSidebarProps) {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const sansFontStyle = {
    fontFamily: isKhmer
      ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
      : "var(--font-google-sans), var(--font-noto-khmer), sans-serif",
  } as const;
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredToc = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return toc;

    return toc.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
  }, [query, toc]);

  return (
    <aside className="hidden xl:block w-72 shrink-0 sticky top-22 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto border-l border-[#E2DDD5] dark:border-white/10 px-6 py-7 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="mb-5">
        <label
          htmlFor="ci-cd-doc-search"
          className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[#DDD6CA] dark:border-white/10 bg-white/95 dark:bg-[#121214] shadow-[0_10px_30px_rgba(26,23,20,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[#CFC6B7] dark:hover:border-white/15 focus-within:border-[#00BCA1]/45 focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.10)] dark:focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.12)]"
        >
          <Search className="w-4 h-4 text-[#9A9287] dark:text-[#8F96A3] shrink-0 transition-colors duration-200 group-focus-within:text-[#00BCA1]" />
          <input
            id="ci-cd-doc-search"
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isKhmer ? "ស្វែងរកមាតិកា..." : "Search content..."}
            className="w-full bg-transparent outline-none text-[18px] text-[#4A4540] dark:text-[#E5E7EB] placeholder:text-[#9A9287] dark:placeholder:text-[#8F96A3]"
            style={sansFontStyle}
          />
          <kbd className="shrink-0 font-mono text-[11px] px-2 py-1 rounded-lg border border-[#E2DDD5] dark:border-white/10 bg-[#F6F2EA] dark:bg-white/5 text-[#8B8378] dark:text-[#A1A1AA] shadow-sm">
            Ctrl K
          </kbd>
        </label>
      </div>

      <div className="text-[10px] font-semibold tracking-widest uppercase text-[#B5B0A8] dark:text-[#9CA3AF] mb-2.5">
        {isKhmer ? "នៅលើទំព័រនេះ" : "On this page"}
      </div>

      <nav className="flex flex-col gap-px">
        {filteredToc.map((item) => {
          const active = item.id === activeId;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`block w-full text-left py-0.75 rounded border-l-2 transition-all duration-150 pl-2 ${
                active
                  ? "text-[#00BCA1] border-l-[#00BCA1] font-medium"
                  : "text-[#88837B] dark:text-[#A1A1AA] border-l-transparent hover:text-[#1A1714] dark:hover:text-white"
              }`}
              style={{ ...sansFontStyle, fontSize: "18px", lineHeight: "1.55" }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
