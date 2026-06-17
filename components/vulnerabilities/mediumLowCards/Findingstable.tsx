"use client";

import { useState } from "react";
import { findings } from "@/app/vulnerabilities/data/vulnerabilities";

const COLUMNS = [
  "STATUS",
  "VULNERABILITY NAME",
  "TARGET ASSET",
  "SEVERITY",
  "LAST DETECTED",
  "ACTIONS",
];

const COL_WIDTHS = "grid-cols-[130px_1fr_160px_110px_140px_140px]";

export default function FindingsTable() {
  const [page, setPage] = useState(1);

  return (
    <div className="bg-[#f0fdf8] rounded-2xl overflow-hidden mb-8">
      {/* ── Table Toolbar ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-teal-100">
        <h2
          className="font-bold tracking-widest text-gray-700"
          style={{ fontSize: "11px" }}
        >
          ACTIVE FINDINGS
        </h2>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-1 text-teal-700 font-medium hover:underline"
            style={{ fontSize: "12px" }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filter
          </button>
          <button
            className="flex items-center gap-1 text-teal-700 font-medium hover:underline"
            style={{ fontSize: "12px" }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v9M4 8l4 4 4-4M2 14h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── Column Headers ────────────────────────────── */}
      <div
        className={`grid ${COL_WIDTHS} px-6 py-3 border-b border-teal-100 bg-[#f0fdf8]`}
      >
        {COLUMNS.map((h) => (
          <span
            key={h}
            className="font-bold tracking-widest text-gray-400"
            style={{ fontSize: "10px" }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* ── Data Rows ─────────────────────────────────── */}
      {findings.map((f, i) => (
        <div
          key={i}
          className={`grid ${COL_WIDTHS} items-center px-6 py-4 border-b border-teal-100 bg-[#FCFCFA] last:border-b-0`}
        >
          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${f.dotColor} flex-shrink-0`}
            />
            <span
              className={`font-bold tracking-wide ${f.statusColor}`}
              style={{ fontSize: "10px" }}
            >
              {f.status}
            </span>
          </div>

          {/* Vulnerability Name */}
          <div>
            <p
              className="font-semibold text-gray-900"
              style={{ fontSize: "13px" }}
            >
              {f.name}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
              {f.desc}
            </p>
          </div>

          {/* Target Asset */}
          <div>
            <span
              className="px-3 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600 font-mono"
              style={{ fontSize: "11px" }}
            >
              {f.asset}
            </span>
          </div>

          {/* Severity Badge */}
          <div>
            <span
              className={`px-3 py-1 rounded-full font-semibold ${f.severityColor}`}
              style={{ fontSize: "11px" }}
            >
              {f.severity}
            </span>
          </div>

          {/* Last Detected */}
          <span className="text-gray-500" style={{ fontSize: "12px" }}>
            {f.detected}
          </span>

          {/* AI Remediate Button */}
          <div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium transition"
              style={{ fontSize: "11px" }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              AI Remediate
            </button>
          </div>
        </div>
      ))}

      {/* ── Pagination ────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FCFCFA]">
        <span className="text-gray-400" style={{ fontSize: "12px" }}>
          Showing 4 of 12 critical findings
        </span>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 text-sm">
            ‹
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-7 h-7 flex items-center justify-center rounded-md font-medium transition ${
                page === n
                  ? "bg-teal-700 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              style={{ fontSize: "13px" }}
            >
              {n}
            </button>
          ))}
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 text-sm">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
