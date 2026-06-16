export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-[#FCFCFA] dark:bg-gray-800/40 p-2 sm:p-3">
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 truncate text-xs sm:text-sm font-bold capitalize text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}