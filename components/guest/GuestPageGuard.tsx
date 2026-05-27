"use client";

import { Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";

/**
 * Wraps a page that should be locked for guest users.
 * If the user is a guest, shows a lock screen instead of the page content.
 * If the user is authenticated, renders children normally.
 */
export function GuestPageGuard({
  children,
  featureName,
}: {
  children: React.ReactNode;
  featureName: string;
}) {
  const guest = useOptionalGuestContext();

  // Not in guest context — render normally (authenticated user)
  if (!guest || !guest.isGuest) {
    return <>{children}</>;
  }

  // Guest user — show locked page
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
          <Lock className="h-10 w-10 text-amber-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {featureName}
        </h2>

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          This feature requires a registered account. Create a free account to
          unlock {featureName.toLowerCase()}, advanced scans, saved history, and
          detailed vulnerability reports.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-105"
          >
            <LogIn size={16} />
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <UserPlus size={16} />
            Register
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          Or go back to{" "}
          <Link href="/userdashboard" className="font-medium text-primary hover:underline">
            Dashboard Overview
          </Link>
        </p>
      </div>
    </div>
  );
}
