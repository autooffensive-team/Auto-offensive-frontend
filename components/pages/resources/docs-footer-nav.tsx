"use client";

import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

type DocsFooterNavProps = {
  previous: NavItem;
  next: NavItem;
  previousText?: string;
  nextText?: string;
  className?: string;
};

export default function DocsFooterNav({
  previous,
  next,
  previousText = "Previous",
  nextText = "Next",
  className = "",
}: DocsFooterNavProps) {
  const cardClassName =
    "flex flex-1 items-center justify-between gap-2 rounded-lg border border-neutral-200/60 bg-gradient-to-br from-white to-neutral-50/50 px-3 py-2.5 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm dark:border-white/5 dark:from-neutral-950 dark:to-neutral-900/50 dark:hover:border-white/10 dark:hover:shadow-md dark:hover:shadow-white/5 sm:px-4 sm:py-3";

  return (
    <div
      className={`mt-12 flex gap-3 border-t border-neutral-200/60 pt-8 dark:border-white/5 ${className}`.trim()}
    >
      {/* Previous Button */}
      <Link href={previous.href} className={cardClassName}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg
            className="h-3.5 w-3.5 shrink-0 stroke-neutral-400 dark:stroke-neutral-600"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2.5}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-0.5">
              {previousText}
            </div>
            <div className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-100 truncate sm:text-sm">
              {previous.label}
            </div>
          </div>
        </div>
      </Link>

      {/* Next Button */}
      <Link href={next.href} className={cardClassName}>
        <div className="min-w-0 text-right flex-1">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-0.5">
            {nextText}
          </div>
          <div className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-100 truncate sm:text-sm">
            {next.label}
          </div>
        </div>
        <svg
          className="h-3.5 w-3.5 shrink-0 stroke-neutral-400 dark:stroke-neutral-600"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2.5}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}