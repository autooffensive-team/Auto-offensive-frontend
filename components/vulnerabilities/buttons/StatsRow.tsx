import { stats } from "@/app/vulnerabilities/data/vulnerabilities";

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#111827] border border-gray-700 rounded-2xl p-5"
        >
          <p className={`text-xs font-bold tracking-widest mb-3 ${s.color}`}>
            {s.label}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{s.value}</span>
            {s.dot && <span className="w-2 h-2 rounded-full bg-red-500" />}
          </div>
        </div>
      ))}
    </div>
  );
}
