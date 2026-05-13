"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

type AuthorizedUserIndicatorProps = {
  href?: string;
  className?: string;
};

export default function AuthorizedUserIndicator({
  href = "/userdashboard",
  className,
}: AuthorizedUserIndicatorProps) {
  return (
    <Link
      href={href}
      title="Dashboard"
      aria-label="Go to dashboard"
      className={[
        "inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-primary/30 dark:bg-primary/12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <LayoutDashboard className="h-4 w-4" />
      <span>Dashboard</span>
      <ArrowRight className="h-3.5 w-3.5 opacity-70" />
    </Link>
  );
}
