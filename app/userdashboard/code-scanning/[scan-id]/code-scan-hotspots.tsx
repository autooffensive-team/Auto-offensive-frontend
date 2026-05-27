"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Filter, Flame, Search, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { HotspotResponse } from "@/types/scanner";
import { SeverityDonutChart } from "@/components/charts/SeverityDonutChart";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

const statusFilterOptions: FilterOption[] = [
  { label: "All", value: "" },
  { label: "To review", value: "TO_REVIEW" },
  { label: "Reviewed", value: "REVIEWED" },
];

const probabilityFilterOptions: FilterOption[] = [
  { label: "All", value: "" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

function getProbabilityColor(probability: string): { bg: string; border: string; text: string; dot: string } {
  switch (probability.toUpperCase()) {
    case "HIGH":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-500",
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "LOW":
      return {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        dot: "bg-blue-500",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-950",
        border: "border-slate-200 dark:border-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        dot: "bg-slate-500",
      };
  }
}

function getStatusTone(status: string): string {
  switch (status.toUpperCase()) {
    case "TO_REVIEW":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "REVIEWED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatSecurityCategory(value: string): string {
  if (!value) return "Uncategorized";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function FilterChips({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300">
        <Filter className="size-4" />
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <motion.button
              key={option.value || option.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 sm:px-3 sm:py-2 sm:text-sm",
                active
                  ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500/20 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
              )}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ProbabilityDistribution({ hotspots }: { hotspots: HotspotResponse[] }) {
  const counts = useMemo(() => {
    const dist = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    hotspots.forEach((h) => {
      const prob = h.vulnerability_probability.toUpperCase() as keyof typeof dist;
      if (prob in dist) dist[prob]++;
    });
    return dist;
  }, [hotspots]);

  const total = hotspots.length;

  const severityItems = [
    { key: "HIGH", label: "High", count: counts.HIGH, color: "bg-red-500", strokeColor: "#ef4444" },
    { key: "MEDIUM", label: "Medium", count: counts.MEDIUM, color: "bg-amber-500", strokeColor: "#f59e0b" },
    { key: "LOW", label: "Low", count: counts.LOW, color: "bg-blue-500", strokeColor: "#3b82f6" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">Probability distribution</h3>
      <SeverityDonutChart
        items={severityItems}
        total={total}
        centerLabel="Hotspots"
      />
    </div>
  );
}

function HotspotCard({
  hotspot,
  onClick,
}: {
  hotspot: HotspotResponse;
  onClick: (hotspotKey: string) => void;
}) {
  const probabilityColors = getProbabilityColor(hotspot.vulnerability_probability);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(hotspot.key)}
      className={cn(
        "block p-3 rounded-lg border transition-all duration-200 cursor-pointer sm:p-4",
        "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
        "hover:border-teal-200 dark:hover:border-teal-500/20 hover:bg-teal-50/40 dark:hover:bg-teal-500/5",
      )}
    >
      <div className="space-y-2 sm:space-y-3">
        {/* Header with probability and status */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 sm:gap-2">
            <div
              className={cn(
                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white sm:w-6 sm:h-6",
                probabilityColors.dot,
              )}
            >
              <span className="text-[9px] font-bold sm:text-xs">
                {hotspot.vulnerability_probability.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 truncate sm:text-sm dark:text-white">
                {hotspot.message}
              </h4>
            </div>
          </div>
          <div className={cn("shrink-0", probabilityColors.text)}>
            <Flame className="size-4" />
          </div>
        </div>

        {/* File path and location */}
        <div className="text-[10px] text-slate-500 font-mono truncate sm:text-xs dark:text-slate-400">
          {hotspot.file_path}
          {hotspot.line > 0 ? `:${hotspot.line}` : ""}
        </div>

        {/* Tags and metadata */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          <span className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs",
            getStatusTone(hotspot.status),
          )}>
            {formatLabel(hotspot.status)}
          </span>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-sky-50 text-sky-700 sm:px-2 sm:py-1 sm:text-xs dark:bg-sky-500/10 dark:text-sky-300">
            {formatSecurityCategory(hotspot.security_category)}
          </span>
          <span className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs",
            probabilityColors.text,
            probabilityColors.bg,
          )}>
            {formatLabel(hotspot.vulnerability_probability)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export interface CodeScanHotspotsProps {
  hotspots: HotspotResponse[];
  total: number;
  isLoading: boolean;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onHotspotClick: (hotspotKey: string) => void;
}

export function CodeScanHotspots({
  hotspots,
  total,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  page,
  pageSize,
  onPageChange,
  onHotspotClick,
}: CodeScanHotspotsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [probabilityFilter, setProbabilityFilter] = useState("");

  const filteredHotspots = useMemo(() => {
    let result = hotspots;

    if (probabilityFilter) {
      result = result.filter(
        (h) => h.vulnerability_probability.toUpperCase() === probabilityFilter.toUpperCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (h) =>
          h.message.toLowerCase().includes(term) ||
          h.file_path.toLowerCase().includes(term) ||
          h.security_category.toLowerCase().includes(term)
      );
    }

    return result;
  }, [hotspots, searchTerm, probabilityFilter]);

  const stats = useMemo(() => {
    const byProbability = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    hotspots.forEach((h) => {
      const prob = h.vulnerability_probability.toUpperCase() as keyof typeof byProbability;
      if (prob in byProbability) byProbability[prob]++;
    });
    return byProbability;
  }, [hotspots]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-5 md:space-y-6"
    >
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-[#f6fbfb] p-3 sm:p-4 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="text-[10px] text-slate-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-slate-400">Total hotspots</div>
          <div className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white">{total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-red-50/40 p-3 sm:p-4 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-slate-400">High</div>
              <div className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white">{stats.HIGH}</div>
            </div>
            <Flame className="size-4 text-red-500 sm:size-5 dark:text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-amber-50/40 p-3 sm:p-4 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-slate-400">Medium</div>
              <div className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white">{stats.MEDIUM}</div>
            </div>
            <Flame className="size-4 text-amber-500 sm:size-5 dark:text-amber-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-blue-50/40 p-3 sm:p-4 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-slate-400">Low</div>
              <div className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white">{stats.LOW}</div>
            </div>
            <Flame className="size-4 text-blue-500 sm:size-5 dark:text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Hotspots list */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-slate-600 sm:size-5 dark:text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base md:text-lg dark:text-white">
                Security Hotspots
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 sm:text-xs md:text-sm dark:text-slate-400">
              {filteredHotspots.length} of {total}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hotspots by message, file, category..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:py-2.5 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-teal-500"
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 sm:gap-3 sm:p-8">
              <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-500 sm:text-xs md:text-sm dark:text-slate-400">Loading security hotspots...</span>
            </div>
          ) : filteredHotspots.length === 0 ? (
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center sm:p-8">
              <ShieldAlert className="size-6 mx-auto mb-2 text-slate-400 sm:size-8 dark:text-slate-600" />
              <p className="text-[10px] text-slate-500 sm:text-xs md:text-sm dark:text-slate-400">
                {searchTerm ? "No hotspots matched your search." : "No security hotspots found for the current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredHotspots.map((hotspot) => (
                <HotspotCard key={hotspot.key} hotspot={hotspot} onClick={onHotspotClick} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-center gap-2 pt-3 sm:pt-4">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1)
                .filter((p) => {
                  const totalPages = Math.ceil(total / pageSize);
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 dark:text-slate-500">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => onPageChange(item as number)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-medium transition-colors ${
                        item === page
                          ? "bg-[#01509e] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => onPageChange(Math.min(Math.ceil(total / pageSize), page + 1))}
                disabled={page >= Math.ceil(total / pageSize)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* Filters and stats sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4 sm:space-y-5 md:space-y-6 lg:sticky lg:top-5 lg:self-start"
        >
          {/* Filters */}
          <div className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 sm:mb-5 sm:pb-4 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px] dark:text-slate-400">
                  Filters
                </p>
                <h3 className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">
                  Refine hotspot results
                </h3>
              </div>
              <Filter className="size-3.5 text-slate-400 sm:size-4 dark:text-slate-500" />
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <FilterChips
                label="Review status"
                options={statusFilterOptions}
                selected={statusFilter}
                onChange={onStatusFilterChange}
              />
              <div className="border-t border-slate-200 pt-4 sm:pt-5 md:pt-6 dark:border-slate-800">
                <FilterChips
                  label="Vulnerability probability"
                  options={probabilityFilterOptions}
                  selected={probabilityFilter}
                  onChange={setProbabilityFilter}
                />
              </div>
            </div>
          </div>

          {/* Distribution chart */}
          <div className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950">
            <ProbabilityDistribution hotspots={hotspots} />
          </div>

          {/* Review focus tip */}
          <div className="rounded-lg border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-slate-800 dark:from-gray-950 dark:to-gray-950">
            <div className="flex items-start gap-2 sm:gap-3">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500 sm:size-4" />
              <div>
                <h3 className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">
                  Review focus
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-slate-500 sm:text-xs sm:leading-6 md:text-sm dark:text-slate-400">
                  Prioritize high-probability hotspots first. Review each to determine if it represents a real vulnerability or is safe.
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
