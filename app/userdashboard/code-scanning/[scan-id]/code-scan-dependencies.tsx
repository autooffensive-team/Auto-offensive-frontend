"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Filter,
  FolderGit2,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import type { ComponentType } from "react";
import { useMemo } from "react";

import type { DependencyResponse } from "@/types/scanner";
import { SeverityDonutChart } from "@/components/charts/SeverityDonutChart";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type TopStatCardProps = {
  label: string;
  value: string;
  helper: string;
  accent: "teal" | "emerald" | "amber" | "slate";
  icon: ComponentType<{ className?: string }>;
};

const dependencySeverityOptions: FilterOption[] = [
  { label: "All severities", value: "" },
  { label: "Critical", value: "CRITICAL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

function getDependencySeverityTone(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-600 text-white";
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "LOW":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function formatLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

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
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Filter className="size-4" />
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
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
                "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
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

function DependencyFlag({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
          : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-500/20 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
      )}
    >
      {label}
    </motion.button>
  );
}

function TopStatCard({
  label,
  value,
  helper,
  accent,
  icon: Icon,
}: TopStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-[#f6fbfb] p-5 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {helper}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            accent === "teal" &&
              "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300",
            accent === "emerald" &&
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
            accent === "amber" &&
              "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
            accent === "slate" &&
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </motion.div>
  );
}

function DependencySeverityDistribution({
  dependencies,
}: {
  dependencies: DependencyResponse[];
}) {
  const counts = useMemo(() => {
    const dist = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    dependencies.forEach((dependency) => {
      const severity = dependency.severity?.toUpperCase() as keyof typeof dist;
      if (severity in dist) {
        dist[severity]++;
      }
    });

    return dist;
  }, [dependencies]);

  const total = dependencies.length;

  const severityItems = [
    { key: "CRITICAL", label: "Critical", count: counts.CRITICAL, color: "bg-red-500", strokeColor: "#ef4444" },
    { key: "HIGH", label: "High", count: counts.HIGH, color: "bg-orange-500", strokeColor: "#f97316" },
    { key: "MEDIUM", label: "Medium", count: counts.MEDIUM, color: "bg-amber-500", strokeColor: "#f59e0b" },
    { key: "LOW", label: "Low", count: counts.LOW, color: "bg-green-500", strokeColor: "#22c55e" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Severity distribution
      </h3>
      <SeverityDonutChart
        items={severityItems}
        total={total}
        centerLabel="Dependencies"
      />
    </div>
  );
}

function collectDependencyToolOptions(
  items: DependencyResponse[]
): FilterOption[] {
  const tools = Array.from(
    new Set(items.map((item) => item.tool).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  return [
    { label: "All checkers", value: "" },
    ...tools.map((tool) => ({ label: formatLabel(tool), value: tool })),
  ];
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#d7e0ef] bg-linear-to-br from-[#f8fafd] to-white p-8 text-center text-sm text-[#52648f] dark:border-gray-800 dark:from-gray-950 dark:to-gray-900 dark:text-gray-400">
      <FolderGit2 className="mx-auto size-8 mb-3 opacity-50" />
      {message}
    </div>
  );
}

function DependencyList({
  dependencies,
  total,
  isLoading,
}: {
  dependencies: DependencyResponse[];
  total: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-[#e4eaf4] bg-linear-to-br from-white via-white to-[#f8fafd] dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="flex items-center gap-3 text-sm text-[#52648f] dark:text-gray-400">
          <LoaderCircle className="size-4 animate-spin text-teal-500" />
          Loading dependencies...
        </div>
      </div>
    );
  }

  if (dependencies.length === 0) {
    return (
      <EmptyPanel message="No dependencies matched the current checker filters." />
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#52648f] dark:text-gray-400">
        Showing {dependencies.length} of {total} dependenc
        {total === 1 ? "y" : "ies"} from dependency checkers.
      </div>

      <div className="space-y-3">
        {dependencies.map((dependency, idx) => (
          <motion.div
            key={`${dependency.package_name}-${dependency.installed_version}-${dependency.cve_id}-${dependency.tool}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: idx * 0.05, ease: "easeOut" }}
            className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500/20 dark:hover:bg-teal-500/5"
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold",
                      getDependencySeverityTone(dependency.severity)
                    )}
                  >
                    {dependency.severity || "UNKNOWN"}
                  </span>
                  <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    {formatLabel(dependency.tool)}
                  </span>
                  <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                    {formatLabel(dependency.language)}
                  </span>
                  {dependency.is_vulnerable ? (
                    <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      Vulnerable
                    </span>
                  ) : null}
                  {dependency.is_outdated ? (
                    <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      Outdated
                    </span>
                  ) : null}
                  {dependency.has_license_issue ? (
                    <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                      License issue
                    </span>
                  ) : null}
                </div>

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {dependency.package_name}
                    </h3>
                    {dependency.cve_id ? (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {dependency.cve_id}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
                    <span>
                      Installed:{" "}
                      <code className="font-mono text-xs">
                        {dependency.installed_version || "Unknown"}
                      </code>
                    </span>
                    <span>
                      Latest:{" "}
                      <code className="font-mono text-xs">
                        {dependency.latest_version || "Unknown"}
                      </code>
                    </span>
                    {dependency.fixed_version ? (
                      <span>
                        Fixed:{" "}
                        <code className="font-mono text-xs">
                          {dependency.fixed_version}
                        </code>
                      </span>
                    ) : (
                      <span>Fixed: Not available</span>
                    )}
                    <span>License: {dependency.license || "Unknown"}</span>
                  </div>
                </div>

                {dependency.description ? (
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {dependency.description}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export interface CodeScanDependenciesProps {
  dependencies: DependencyResponse[];
  allDependencies: DependencyResponse[];
  total: number;
  isLoading: boolean;
  toolFilter: string;
  severityFilter: string;
  vulnerableOnly: boolean;
  outdatedOnly: boolean;
  onToolFilterChange: (value: string) => void;
  onSeverityFilterChange: (value: string) => void;
  onVulnerableOnlyChange: () => void;
  onOutdatedOnlyChange: () => void;
  formatCount: (value: number | null | undefined) => string;
}

export function CodeScanDependencies({
  dependencies,
  allDependencies,
  total,
  isLoading,
  toolFilter,
  severityFilter,
  vulnerableOnly,
  outdatedOnly,
  onToolFilterChange,
  onSeverityFilterChange,
  onVulnerableOnlyChange,
  onOutdatedOnlyChange,
  formatCount,
}: CodeScanDependenciesProps) {
  const dependencyToolOptions = collectDependencyToolOptions(allDependencies);
  const stats = useMemo(
    () => ({
      vulnerable: dependencies.filter((item) => item.is_vulnerable).length,
      outdated: dependencies.filter((item) => item.is_outdated).length,
      licenseIssues: dependencies.filter((item) => item.has_license_issue).length,
    }),
    [dependencies]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TopStatCard
          label="Dependencies"
          value={formatCount(total)}
          helper="Filtered dependency results"
          accent="teal"
          icon={FolderGit2}
        />
        <TopStatCard
          label="Vulnerable"
          value={formatCount(stats.vulnerable)}
          helper="Current filtered list"
          accent="amber"
          icon={ShieldAlert}
        />
        <TopStatCard
          label="Outdated"
          value={formatCount(stats.outdated)}
          helper="Current filtered list"
          accent="slate"
          icon={RefreshCw}
        />
        <TopStatCard
          label="License Issues"
          value={formatCount(stats.licenseIssues)}
          helper="Current filtered list"
          accent="emerald"
          icon={Info}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Dependencies
              </h2>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {dependencies.length} of {total}
            </span>
          </div>

          <DependencyList
            dependencies={dependencies}
            total={total}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6 lg:sticky lg:top-5 lg:self-start"
        >
          <div className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-5 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Filters
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  Refine dependency results
                </h3>
              </div>
              <Filter className="size-4 text-slate-400 dark:text-slate-500" />
            </div>

            <div className="space-y-6">
              <FilterChips
                label="Dependency checker"
                options={dependencyToolOptions}
                selected={toolFilter}
                onChange={onToolFilterChange}
              />
              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <FilterChips
                  label="Severity"
                  options={dependencySeverityOptions}
                  selected={severityFilter}
                  onChange={onSeverityFilterChange}
                />
              </div>
              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Quick flags
                </p>
                <div className="flex flex-wrap gap-2">
                  <DependencyFlag
                    active={vulnerableOnly}
                    label="Vulnerable only"
                    onClick={onVulnerableOnlyChange}
                  />
                  <DependencyFlag
                    active={outdatedOnly}
                    label="Outdated only"
                    onClick={onOutdatedOnlyChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-5 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
            <DependencySeverityDistribution dependencies={dependencies} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-linear-to-br from-white to-[#f7fbfb] p-5 dark:border-slate-800 dark:from-slate-950 dark:to-slate-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Review focus
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Prioritize critical and high findings first, then review outdated packages and license exceptions.
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.section>
  );
}
