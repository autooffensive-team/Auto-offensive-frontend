"use client";

import Link from "next/link";
import { CheckCheck } from "lucide-react";

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
      title="Authorized user"
      aria-label="Authorized user"
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CheckCheck className="h-4 w-4" />
      <span className="sr-only">Authorized user</span>
    </Link>
  );
}
