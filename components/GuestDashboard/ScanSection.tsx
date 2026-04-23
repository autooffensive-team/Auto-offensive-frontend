"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanBox() {
  const [scanType, setScanType] = useState("Medium");
  const router = useRouter();

  const scanOptions = ["Basic", "Medium", "Advance"];

  const handleStartScan = () => {
    if (scanType === "Medium") router.push("/medium-scan");
    else if (scanType === "Basic") router.push("/basic-scan");
    else router.push("/advance-scan");
  };

  return (
    <div className="bg-[#0f172a] border border-gray-700 rounded-2xl p-8 shadow-md">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-center mb-8 text-white tracking-wide">
        Initiate Autonomous Scan
      </h2>

      {/* Input + Button */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          placeholder="Enter Target (Domain, URL, or IP)"
          className="flex-1 bg-[#020617] border border-gray-700 rounded-xl px-5 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        />

        <button
          onClick={handleStartScan}
          className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          ▶ Start Scan ({scanType})
        </button>
      </div>

      {/* Scan Type */}
      <div className="flex justify-center gap-3 mt-8 flex-wrap">
        {scanOptions.map((type) => {
          const isActive = scanType === type;

          return (
            <button
              key={type}
              onClick={() => setScanType(type)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-yellow-400 text-black shadow-md scale-105"
                    : "bg-[#020617] border border-gray-700 text-gray-400 hover:bg-gray-800"
                }`}
            >
              {type} Scan
            </button>
          );
        })}
      </div>
    </div>
  );
}
