"use client";

import Skeleton from "@/components/ui/skeleton";

export default function ScanJobsTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Execution Mode
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Finished At
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tools Used
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
