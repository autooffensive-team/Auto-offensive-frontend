"use client";

import { Scan } from "lucide-react";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";

/**
 * Bottom bar showing remaining guest scans.
 * Only renders when inside a GuestProvider context.
 */
export function GuestScanLimitBar() {
  const guest = useOptionalGuestContext();

  if (!guest || !guest.isGuest || guest.loading) return null;

  const { scansUsed, maxScans, scansRemaining } = guest;
  const isExhausted = scansRemaining <= 0;
  const progressPercent = Math.min((scansUsed / maxScans) * 100, 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95 md:left-72">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 md:px-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
          <Scan size={16} className="text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Guest scans remaining
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                isExhausted
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-teal-600 dark:text-teal-400"
              }`}
            >
              {scansRemaining}/{maxScans}
            </span>
            {/* Progress bar */}
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 sm:block dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExhausted
                    ? "bg-rose-500"
                    : scansRemaining === 1
                      ? "bg-amber-500"
                      : "bg-teal-500"
                }`}
                style={{ width: `${100 - progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
