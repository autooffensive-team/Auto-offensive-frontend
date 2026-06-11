"use client";

export default function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
          ⏱️
        </div>

        <h3 className="font-semibold text-[20px] text-gray-800 dark:text-white mb-2">
          Persistent History
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Guests lose scan data after the session ends. Upgrade to maintain a
          permanent ledger of your security posture.
        </p>

        {/* Divider */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      {/* Card 2 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
          🤖
        </div>

        <h3 className="font-semibold text-[20px] text-gray-800 dark:text-white mb-2">
          AI-Assisted Remediation
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Get step-by-step guidance on how to fix discovered vulnerabilities
          using our proprietary Sentinel-LLM.
        </p>

        {/* Divider */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      {/* Card 3 */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-green-900 to-emerald-800 text-white">
        <h3 className="text-xl font-bold mb-4">Why Register?</h3>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">✔ Up to 50 Scans Daily</li>
          <li className="flex items-center gap-2">✔ Persistent Scan History</li>
          <li className="flex items-center gap-2">
            ✔ Code Repository Scanning
          </li>
        </ul>

        <button className="mt-6 w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-2 rounded-lg transition">
          Create Account
        </button>
      </div>
    </div>
  );
}
