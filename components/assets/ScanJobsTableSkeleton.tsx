"use client";

// Shimmer block using brand teal tint — blends with dashboard bg (#FAFAF7 / dark:black)
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#00D0B2]/10 dark:bg-[#00D0B2]/8 ${className}`}
    />
  );
}

export default function ScanJobsTableSkeleton() {
  return (
    <div
      className="relative bg-[#FCFCFA] dark:bg-[#101828] border border-[#00D0B2]/20 dark:border-white/10 overflow-hidden"
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, #00D0B2 0%, transparent 50%) top left / 18px 18px no-repeat,
            linear-gradient(315deg, #00D0B2 0%, transparent 50%) bottom right / 18px 18px no-repeat
          `,
          opacity: 0.15,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead className="border-b border-[#00D0B2]/15 dark:border-white/8 bg-[#00D0B2]/5 dark:bg-[#00D0B2]/5">
            <tr>
              {["Status", "Execution Mode", "Created At", "Finished At", "Duration", "Tools Used"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00D0B2]/8 dark:divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><Shimmer className="h-5 w-20" /></td>
                <td className="px-4 py-3"><Shimmer className="h-5 w-16" /></td>
                <td className="px-4 py-3"><Shimmer className="h-5 w-32" /></td>
                <td className="px-4 py-3"><Shimmer className="h-5 w-32" /></td>
                <td className="px-4 py-3"><Shimmer className="h-5 w-20" /></td>
                <td className="px-4 py-3"><Shimmer className="h-5 w-24" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
