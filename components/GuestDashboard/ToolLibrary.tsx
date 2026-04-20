"use client";

import { useState } from "react";

const CheckCircle = () => (
  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500 text-white text-xs">
    ✓
  </div>
);

const Circle = () => (
  <div className="w-5 h-5 rounded-full border border-gray-500"></div>
);

type Tool = {
  name: string;
  type: string;
};

const tools: Tool[] = [
  { name: "Subfinder", type: "Recon" },
  { name: "Burp API", type: "Proxy" },
  { name: "Burp API", type: "Proxy" },
  { name: "Burp API", type: "Proxy" },
  { name: "Nuclei", type: "Vuln Scan" },
  { name: "Nuclei", type: "Vuln Scan" },
  { name: "Nuclei", type: "Vuln Scan" },
  { name: "Nuclei", type: "Vuln Scan" },
  { name: "Nuclei", type: "Vuln Scan" },
  { name: "Burp API", type: "Proxy" },
  { name: "Burp API", type: "Proxy" },
  { name: "Burp API", type: "Proxy" },
];

export default function ToolLibrary() {
  const [selectedTools, setSelectedTools] = useState<number[]>([0]);

  const toggleTool = (idx: number) => {
    setSelectedTools((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tool Library
        </h3>

        <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full font-medium">
          {selectedTools.length} ACTIVE
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => {
          const isSelected = selectedTools.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => toggleTool(idx)}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between
                ${
                  isSelected
                    ? "bg-teal-500/10 border-teal-400 shadow-md"
                    : "bg-[#020617] border-gray-700 hover:border-gray-500 hover:scale-[1.02]"
                }`}
            >
              <div>
                <p className="font-semibold text-white">{tool.name}</p>
                <p className="text-sm text-gray-400">{tool.type}</p>
              </div>

              {isSelected ? <CheckCircle /> : <Circle />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
