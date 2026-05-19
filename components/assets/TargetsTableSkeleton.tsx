"use client";

export default function TargetsTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Target
              </th>
              <th className="px-4 py-3 text-left text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Project
              </th>
              <th className="px-4 py-3 text-left text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                Last Scan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
