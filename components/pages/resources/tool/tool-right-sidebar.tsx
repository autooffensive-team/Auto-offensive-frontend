'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Search } from 'lucide-react';

interface TocItem {
  label: string;
  href: string;
  isSub?: boolean;
}

interface ToolRightSidebarProps {
  isDark?: boolean;
  onNavigate?: (href: string) => void;
  activeSection?: string;
}

export const ToolRightSidebar: React.FC<ToolRightSidebarProps> = ({
  isDark = false,
  onNavigate,
  activeSection,
}) => {
  const locale = useLocale();
  const isKhmer = locale === 'kh';
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const tocItems: TocItem[] = isKhmer
    ? [
        { label: 'ទិដ្ឋភាពទូទៅនៃ Tool', href: '#overview' },
        { label: 'Tool ទាំងអស់មើលឃើញភ្លាម', href: '#overview', isSub: true },
        { label: 'subfinder', href: '#subfinder' },
        { label: 'Parameters', href: '#subfinder', isSub: true },
        { label: 'Usage examples', href: '#subfinder', isSub: true },
        { label: 'httpx', href: '#httpx' },
        { label: 'Parameters', href: '#httpx', isSub: true },
        { label: 'Usage examples', href: '#httpx', isSub: true },
        { label: 'naabu', href: '#naabu' },
        { label: 'Parameters', href: '#naabu', isSub: true },
        { label: 'Usage examples', href: '#naabu', isSub: true },
        { label: 'nuclei', href: '#nuclei' },
        { label: 'Parameters', href: '#nuclei', isSub: true },
        { label: 'Template categories', href: '#nuclei', isSub: true },
        { label: 'Versions & Status', href: '#versions' },
        { label: 'Rate Limits', href: '#limits' },
        { label: 'Output Formats', href: '#output' },
        { label: 'Error Reference', href: '#errors' },
      ]
    : [
        { label: 'Tool Overview', href: '#overview' },
        { label: 'All tools at a glance', href: '#overview', isSub: true },
        { label: 'subfinder', href: '#subfinder' },
        { label: 'Parameters', href: '#subfinder', isSub: true },
        { label: 'Usage examples', href: '#subfinder', isSub: true },
        { label: 'httpx', href: '#httpx' },
        { label: 'Parameters', href: '#httpx', isSub: true },
        { label: 'Usage examples', href: '#httpx', isSub: true },
        { label: 'naabu', href: '#naabu' },
        { label: 'Parameters', href: '#naabu', isSub: true },
        { label: 'Usage examples', href: '#naabu', isSub: true },
        { label: 'nuclei', href: '#nuclei' },
        { label: 'Parameters', href: '#nuclei', isSub: true },
        { label: 'Template categories', href: '#nuclei', isSub: true },
        { label: 'Versions & Status', href: '#versions' },
        { label: 'Rate Limits', href: '#limits' },
        { label: 'Output Formats', href: '#output' },
        { label: 'Error Reference', href: '#errors' },
      ];

  const filteredItems = tocItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bgColor = isDark ? 'bg-[#09090B]' : 'bg-[#F7F5F0]';
  const labelColor = isDark ? 'text-[#9CA3AF]' : 'text-[#B5B0A8]';
  const borderColor = isDark ? 'border-white/10' : 'border-[#E2DDD5]';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-[#EAE6DE]';
  const activeBg = 'text-[#00BCA1] border-l-[#00BCA1] font-medium';

  return (
    <>
      <aside
        className={`${bgColor} w-72 shrink-0 sticky top-22 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto border-l ${borderColor} px-6 py-7 hidden xl:block`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? '#334155 transparent' : '#E2DDD5 transparent',
        }}
      >
        <div className="mb-5">
          <label
            htmlFor="tool-doc-search"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl border ${
              isDark
                ? 'border-white/10 bg-[#121214] shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:border-white/15 focus-within:border-[#00BCA1]/45 focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.12)]'
                : 'border-[#DDD6CA] bg-white/95 shadow-[0_10px_30px_rgba(26,23,20,0.05)] hover:border-[#CFC6B7] focus-within:border-[#00BCA1]/45 focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.10)]'
            } transition-all duration-200`}
          >
            <Search size={16} className={isDark ? 'text-[#8F96A3]' : 'text-[#9A9287]'} />
            <input
              id="tool-doc-search"
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKhmer ? "ស្វែងរកមាតិកា..." : "Search content..."}
              className={`w-full bg-transparent outline-none text-[18px] ${
                isDark ? 'text-[#E5E7EB] placeholder:text-[#8F96A3]' : 'text-[#4A4540] placeholder:text-[#9A9287]'
              }`}
              style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-khmer), sans-serif' }}
            />
            <kbd
              className={`shrink-0 font-mono text-[11px] px-2 py-1 rounded-lg border ${
                isDark
                  ? 'border-white/10 bg-white/5 text-[#A1A1AA]'
                  : 'border-[#E2DDD5] bg-[#F6F2EA] text-[#8B8378]'
              } shadow-sm`}
            >
              Ctrl K
            </kbd>
          </label>
        </div>

        <div className={`text-[10px] font-semibold uppercase tracking-widest ${labelColor} mb-2.5`}>
          {isKhmer ? "នៅលើទំព័រនេះ" : "On this page"}
        </div>

        <div className="flex flex-col gap-px">
          {filteredItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(item.href)}
              className={`font-normal py-0.75 rounded border-l-2 transition-all duration-150 text-left text-[18px] leading-[1.55] ${
                item.isSub ? 'pl-4.5 opacity-75' : 'pl-2'
              } ${
                activeSection === item.href
                  ? activeBg
                  : `${isDark ? 'text-[#A1A1AA] hover:text-white' : 'text-[#88837B] hover:text-[#1A1714]'} border-l-transparent ${hoverBg}`
              }`}
              style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-khmer), sans-serif' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};
