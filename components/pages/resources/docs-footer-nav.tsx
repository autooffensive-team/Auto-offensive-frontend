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
    "flex flex-1 items-center gap-3 rounded-xl border border-[#E2DDD5] bg-white px-4 py-3 transition-all duration-150 hover:border-[#CEC9BF] hover:bg-[#F0EDE6] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#121214] dark:hover:bg-white/5";

  return (
    <div
      className={`mt-16 flex justify-between gap-4 border-t border-[#E2DDD5] pt-8 dark:border-white/10 max-[640px]:flex-col ${className}`.trim()}
    >
      <Link href={previous.href} className={`${cardClassName} max-w-57.5`}>
        <svg
          className="h-4 w-4 shrink-0 stroke-[#88837B] fill-none dark:stroke-[#9CA3AF]"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <div>
          <div className="mb-0.5 text-[11px] text-[#88837B] dark:text-[#9CA3AF]">{previousText}</div>
          <div className="text-base font-semibold text-[#1A1714] dark:text-white md:text-[18px] lg:text-[20px]">
            {previous.label}
          </div>
        </div>
      </Link>

      <Link href={next.href} className={`${cardClassName} max-w-57.5 ml-auto justify-end text-right`}>
        <div>
          <div className="mb-0.5 text-[11px] text-[#88837B] dark:text-[#9CA3AF]">{nextText}</div>
          <div className="text-base font-semibold text-[#1A1714] dark:text-white md:text-[18px] lg:text-[20px]">
            {next.label}
          </div>
        </div>
        <svg
          className="h-4 w-4 shrink-0 stroke-[#88837B] fill-none dark:stroke-[#9CA3AF]"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}
