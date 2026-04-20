'use client';

import React from 'react';
import { useLocale } from 'next-intl';

interface SidebarItemConfig {
  href: string;
  label: string;
  withDot?: boolean;
}

interface SidebarGroupConfig {
  label: string;
  items: SidebarItemConfig[];
}

interface ToolSidebarProps {
  activeSection?: string;
  isDark?: boolean;
  onNavigate?: (href: string) => void;
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
          ? 'text-[#00BCA1] bg-[rgba(0,188,161,0.07)] dark:bg-[rgba(0,188,161,0.12)] font-semibold'
          : 'text-[#4A4540] dark:text-[#C9CDD4] hover:text-[#1A1714] dark:hover:text-white hover:bg-[#EAE6DE] dark:hover:bg-white/5'
      }`}
      style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-khmer), sans-serif' }}
    >
      {withDot && (
        <span
          className={`w-0.75 h-0.75 rounded-full shrink-0 opacity-50 ${
            active ? 'bg-[#00BCA1]' : 'bg-current'
          }`}
        />
      )}
      {label}
    </a>
  );
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({
  activeSection,
  onNavigate,
}) => {
  const locale = useLocale();
  const isKhmer = locale === 'kh';
  const groups: SidebarGroupConfig[] = isKhmer
    ? [
        {
          label: 'ឯកសារ Tool',
          items: [
            { href: '#overview', label: 'ទិដ្ឋភាពទូទៅ', withDot: true },
            { href: '#subfinder', label: 'subfinder', withDot: true },
            { href: '#httpx', label: 'httpx', withDot: true },
            { href: '#naabu', label: 'naabu', withDot: true },
            { href: '#nuclei', label: 'nuclei', withDot: true },
            { href: '#versions', label: 'Versions & Status', withDot: true },
            { href: '#limits', label: 'Rate Limits', withDot: true },
            { href: '#output', label: 'Output Formats', withDot: true },
            { href: '#errors', label: 'Error Reference', withDot: true },
          ],
        },
        {
          label: 'Reporting',
          items: [
            { href: '#report-gen', label: 'Report Generation' },
            { href: '#templates', label: 'Templates' },
            { href: '#export', label: 'Export Formats' },
          ],
        },
        {
          label: 'API',
          items: [
            { href: '#api-ref', label: 'API Reference' },
            { href: '#auth', label: 'Authentication' },
          ],
        },
      ]
    : [
        {
          label: 'Tool Reference',
          items: [
            { href: '#overview', label: 'Overview', withDot: true },
            { href: '#subfinder', label: 'subfinder', withDot: true },
            { href: '#httpx', label: 'httpx', withDot: true },
            { href: '#naabu', label: 'naabu', withDot: true },
            { href: '#nuclei', label: 'nuclei', withDot: true },
            { href: '#versions', label: 'Versions & Status', withDot: true },
            { href: '#limits', label: 'Rate Limits', withDot: true },
            { href: '#output', label: 'Output Formats', withDot: true },
            { href: '#errors', label: 'Error Reference', withDot: true },
          ],
        },
        {
          label: 'Reporting',
          items: [
            { href: '#report-gen', label: 'Report Generation' },
            { href: '#templates', label: 'Templates' },
            { href: '#export', label: 'Export Formats' },
          ],
        },
        {
          label: 'API',
          items: [
            { href: '#api-ref', label: 'API Reference' },
            { href: '#auth', label: 'Authentication' },
          ],
        },
      ];

  const smoothScroll = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    onNavigate?.(href);
  };

  return (
    <aside
      className="w-72 shrink-0 sticky top-22 self-start h-[calc(100vh-5.5rem)] overflow-y-auto py-5.5 border-r border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B] hidden lg:block"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2DDD5 transparent' }}
    >
      {groups.map((group) => (
        <SidebarGroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              withDot={item.withDot}
              active={activeSection === item.href}
              onClick={(event) => smoothScroll(event, item.href)}
            />
          ))}
        </SidebarGroup>
      ))}
    </aside>
  );
};
