export default function PageHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      {/* Left */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-400 mt-6 mb-1 tracking-tight">
          Vulnerabilities
        </h1>

        <p className="text-gray-400 text-base">
          Real-time analysis of security findings across your digital perimeter.
        </p>
      </div>

      {/* Right */}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition text-sm">
          Filter
        </button>

        <button className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm transition">
          Download Report
        </button>
      </div>
    </div>
  );
}
