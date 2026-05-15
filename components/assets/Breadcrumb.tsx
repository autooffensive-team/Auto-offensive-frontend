"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  segments: BreadcrumbSegment[];
};

export default function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            )}
            {segment.href && !isLast ? (
              <Link
                href={segment.href}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {segment.label}
              </Link>
            ) : (
              <span className="text-slate-900 dark:text-slate-100 font-medium">
                {segment.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
