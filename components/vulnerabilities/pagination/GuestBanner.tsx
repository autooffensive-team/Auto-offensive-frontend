export default function GuestBanner() {
  return (
    <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="text-xs text-teal-400 font-semibold mb-2">
          GUEST MODE ACTIVE
        </p>

        <h3 className="text-lg font-bold text-white mb-1">
          Guest scans are limited to 3 per day.
        </h3>

        <p className="text-gray-400 text-sm">
          Register to unlock full reports and scan history.
        </p>
      </div>

      <button className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold">
        Register Now →
      </button>
    </div>
  );
}
