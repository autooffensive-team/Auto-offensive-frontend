"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLocale } from "next-intl";

const sansFontStyle = {
  fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif",
} as const;

export interface SidebarItem {
  id: string;
  title: string;
  method?: "GET" | "POST" | "DELETE";
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export interface TocChild {
  id: string;
  label: string;
}

export interface TocItem {
  id: string;
  label: string;
  children?: TocChild[];
}

const METHOD_CLS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

function MethodPill({ method }: { method: string }) {
  return (
    <span
      className={`shrink-0 font-mono text-[10px] font-semibold px-1.25 py-[1.5px] rounded ${METHOD_CLS[method]}`}
    >
      {method === "DELETE" ? "DEL" : method}
    </span>
  );
}

function SidebarGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 mb-1">
      <div className="text-[10px] font-semibold tracking-widest uppercase text-[#B5B0A8] dark:text-[#9CA3AF] px-2 pt-2.5 pb-1.5">
        {label}
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
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
  return (
    <aside className="hidden lg:block w-72 shrink-0 sticky top-22 self-start h-[calc(100vh-5.5rem)] overflow-y-auto py-5.5 border-r border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div>
        {sections.map((sec) => (
          <SidebarGroup key={sec.label} label={sec.label}>
              {sec.items.map((item) => {
                const active = item.id === activeId;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 text-left w-full px-2 py-1.5 rounded-md transition-all duration-150 ${
                      active
                        ? "text-[#00BCA1] bg-[rgba(0,188,161,0.07)] dark:bg-[rgba(0,188,161,0.12)] font-semibold"
                        : "text-[#4A4540] dark:text-[#C9CDD4] hover:text-[#1A1714] dark:hover:text-white hover:bg-[#EAE6DE] dark:hover:bg-white/5"
                    }`}
                    style={{ ...sansFontStyle, fontSize: "18px", lineHeight: "1.45" }}
                  >
                    {!item.method && (
                      <span
                        className={`w-0.75 h-0.75 rounded-full shrink-0 ${
                          active ? "bg-[#00BCA1]" : "bg-current opacity-40"
                        }`}
                      />
                    )}
                    {item.method && <MethodPill method={item.method} />}
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
          </SidebarGroup>
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

    return toc
      .map((item) => {
        const itemMatches = item.label.toLowerCase().includes(normalizedQuery);
        const children = item.children?.filter((child) =>
          child.label.toLowerCase().includes(normalizedQuery)
        );

        if (itemMatches) {
          return item;
        }

        if (children && children.length > 0) {
          return { ...item, children };
        }

        return null;
      })
      .filter((item): item is TocItem => item !== null);
  }, [query, toc]);

  return (
    <aside
      className="hidden xl:block w-72 shrink-0 sticky top-18 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto border-l border-[#E2DDD5] dark:border-white/10 px-6 py-7 bg-[#F7F5F0] dark:bg-[#09090B]"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--api-scrollbar, #E2DDD5) transparent",
      }}
    >
      <div className="mb-5">
        <label
          htmlFor="api-doc-search"
          className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[#DDD6CA] dark:border-white/10 bg-white/95 dark:bg-[#121214] shadow-[0_10px_30px_rgba(26,23,20,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[#CFC6B7] dark:hover:border-white/15 focus-within:border-[#00BCA1]/45 focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.10)] dark:focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.12)]"
        >
          <Search className="w-4 h-4 text-[#9A9287] dark:text-[#8F96A3] shrink-0 transition-colors duration-200 group-focus-within:text-[#00BCA1]" />
          <input
            id="api-doc-search"
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
          const parentActive =
            item.id === activeId ||
            item.children?.some((child) => child.id === activeId);

          return (
            <div key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`block w-full text-left py-0.75 rounded border-l-2 transition-all duration-150 pl-2 ${
                  parentActive
                    ? "text-[#00BCA1] border-l-[#00BCA1] font-medium"
                    : "text-[#88837B] dark:text-[#A1A1AA] border-l-transparent hover:text-[#1A1714] dark:hover:text-white"
                }`}
                style={{ ...sansFontStyle, fontSize: "18px", lineHeight: "1.55" }}
              >
                {item.label}
              </button>

              {item.children?.map((child) => {
                const childActive = child.id === activeId;

                return (
                  <button
                    key={child.id}
                    onClick={() => onNavigate(child.id)}
                    className={`block w-full text-left py-0.75 rounded border-l-2 transition-all duration-150 pl-4.5 ${
                      childActive
                        ? "text-[#00BCA1] border-l-[#00BCA1] font-medium"
                        : "text-[#88837B] dark:text-[#A1A1AA] border-l-transparent hover:text-[#1A1714] dark:hover:text-white"
                    }`}
                    style={{ ...sansFontStyle, fontSize: "18px", lineHeight: "1.55" }}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
