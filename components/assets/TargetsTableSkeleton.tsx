"use client";

export default function TargetsTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                Target
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                Project
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                Type
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                Last Scan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-5 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
