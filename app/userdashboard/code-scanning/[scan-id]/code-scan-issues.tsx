"use client";

import { motion } from "framer-motion";
import { BarChart3, Bug, Lock, Zap, FileCode2, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import type { IssueResponse } from "@/types/scanner";
import { SeverityDonutChart } from "@/components/charts/SeverityDonutChart";
import { buildCodeScanningIssueHref } from "@/lib/scanner-route";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

const issueTypeOptions: FilterOption[] = [
  { label: "All", value: "" },
  { label: "Bugs", value: "BUG" },
  { label: "Vulnerabilities", value: "VULNERABILITY" },
  { label: "Code smells", value: "CODE_SMELL" },
];

const severityOptions: FilterOption[] = [
  { label: "All severities", value: "" },
  { label: "Blocker", value: "BLOCKER" },
  { label: "Critical", value: "CRITICAL" },
  { label: "Major", value: "MAJOR" },
  { label: "Minor", value: "MINOR" },
  
];

function getIssueSeverityColor(severity: string): { bg: string; border: string; text: string; dot: string } {
  switch (severity.toUpperCase()) {
    case "BLOCKER":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-300",
        dot: "bg-red-500",
      };
    case "CRITICAL":
      return {
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-700 dark:text-orange-300",
        dot: "bg-orange-500",
      };
    case "MAJOR":
      return {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "MINOR":
      return {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        dot: "bg-blue-500",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950",
        border: "border-gray-200 dark:border-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        dot: "bg-gray-500",
      };
  }
}

function getIssueTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case "BUG":
      return <Bug className="size-4" />;
    case "VULNERABILITY":
      return <Lock className="size-4" />;
    case "CODE_SMELL":
      return <Zap className="size-4" />;
    default:
      return <AlertCircle className="size-4" />;
  }
}

function formatStatusLabel(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCweTag(issue: IssueResponse): string {
  const matchedTag = issue.tags.find((tag) => /^cwe[-_:]?\d+$/i.test(tag));
  if (matchedTag) {
    return matchedTag.toUpperCase().replace(/[_:]/g, "-");
  }
  const matchedRule = issue.rule_key.match(/cwe[-_:]?(\d+)/i);
  if (matchedRule) {
    return `CWE-${matchedRule[1]}`;
  }
  return issue.tags[0]?.toUpperCase() || issue.rule_key.toUpperCase();
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
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
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
                  : "border border-gray-200 bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-teal-500/20 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
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

function SeverityDistribution({ issues }: { issues: IssueResponse[] }) {
  const counts = useMemo(() => {
    const dist = {
      BLOCKER: 0,
      CRITICAL: 0,
      MAJOR: 0,
      MINOR: 0,
    };
    issues.forEach((issue) => {
      const severity = issue.severity.toUpperCase() as keyof typeof dist;
      if (severity in dist) dist[severity]++;
    });
    return dist;
  }, [issues]);

  const total = issues.length;

  const severityItems = [
    { key: "BLOCKER", label: "Blocker", count: counts.BLOCKER, color: "bg-red-500", strokeColor: "#ef4444" },
    { key: "CRITICAL", label: "Critical", count: counts.CRITICAL, color: "bg-orange-500", strokeColor: "#f97316" },
    { key: "MAJOR", label: "Major", count: counts.MAJOR, color: "bg-amber-500", strokeColor: "#f59e0b" },
    { key: "MINOR", label: "Minor", count: counts.MINOR, color: "bg-blue-500", strokeColor: "#3b82f6" },
    
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs font-semibold text-gray-900 sm:text-sm dark:text-white">Severity distribution</h3>
      <SeverityDonutChart
        items={severityItems}
        total={total}
        centerLabel="Issues"
      />
    </div>
  );
}

function IssueCard({
  issue,
  projectKey,
  allIssues,
}: {
  issue: IssueResponse;
  projectKey: string;
  allIssues: IssueResponse[];
}) {
  const severityColors = getIssueSeverityColor(issue.severity);
  const typeIcon = getIssueTypeIcon(issue.type);

  return (
    <Link href={buildCodeScanningIssueHref(projectKey, issue, allIssues)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "block p-3 rounded-lg border transition-all duration-200 cursor-pointer sm:p-4",
          "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800",
          "hover:border-teal-200 dark:hover:border-teal-500/20 hover:bg-teal-50/40 dark:hover:bg-teal-500/5",
        )}
      >
        <div className="space-y-2 sm:space-y-3">
          {/* Header with severity and type */}
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 sm:gap-2">
              <div
                className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white sm:w-6 sm:h-6",
                  severityColors.dot,
                )}
              >
                <span className="text-[9px] font-bold sm:text-xs">{issue.severity.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-900 truncate sm:text-sm dark:text-white">
                  {issue.message}
                </h4>
              </div>
            </div>
            <div className={cn("shrink-0", severityColors.text)}>
              {typeIcon}
            </div>
          </div>

          {/* File path and location */}
          <div className="text-[10px] text-gray-500 font-mono truncate sm:text-xs dark:text-gray-400">
            {issue.file_path}
            {issue.line > 0 ? `:${issue.line}` : ""}
          </div>

          {/* Tags and metadata */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-700 sm:px-2 sm:py-1 sm:text-xs dark:bg-teal-500/10 dark:text-teal-300">
              {formatStatusLabel(issue.type)}
            </span>
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-sky-50 text-sky-700 sm:px-2 sm:py-1 sm:text-xs dark:bg-sky-500/10 dark:text-sky-300">
              {getCweTag(issue)}
            </span>
            {issue.tags.slice(0, 1).map((tag) => (
              <span key={tag} className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 sm:px-2 sm:py-1 sm:text-xs dark:bg-gray-800 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export interface CodeScanIssuesProps {
  projectKey: string;
  issues: IssueResponse[];
  allIssues: IssueResponse[];
  total: number;
  isLoading: boolean;
  typeFilter: string;
  severityFilter: string;
  onTypeFilterChange: (value: string) => void;
  onSeverityFilterChange: (value: string) => void;
}

export function CodeScanIssues({
  projectKey,
  issues,
  allIssues,
  total,
  isLoading,
  typeFilter,
  severityFilter,
  onTypeFilterChange,
  onSeverityFilterChange,
}: CodeScanIssuesProps) {
  const stats = useMemo(() => {
    const byType = { BUG: 0, VULNERABILITY: 0, CODE_SMELL: 0 };
    issues.forEach((issue) => {
      const type = issue.type.toUpperCase() as keyof typeof byType;
      if (type in byType) byType[type]++;
    });
    return byType;
  }, [issues]);

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
          className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-[#f6fbfb] p-3 sm:p-4 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="text-[10px] text-gray-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-gray-400">Total issues</div>
          <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-white">{total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-red-50/40 p-3 sm:p-4 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-gray-400">Bugs</div>
              <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-white">{stats.BUG}</div>
            </div>
            <Bug className="size-4 text-red-500 sm:size-5 dark:text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-orange-50/40 p-3 sm:p-4 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-gray-400">Vulnerabilities</div>
              <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-white">{stats.VULNERABILITY}</div>
            </div>
            <Lock className="size-4 text-orange-500 sm:size-5 dark:text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-blue-50/40 p-3 sm:p-4 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1.5 sm:text-xs sm:mb-2 dark:text-gray-400">Code smells</div>
              <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-white">{stats.CODE_SMELL}</div>
            </div>
            <Zap className="size-4 text-blue-500 sm:size-5 dark:text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Issues list */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-gray-600 sm:size-5 dark:text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg dark:text-white">
                Issues
              </h2>
            </div>
            <span className="text-[10px] text-gray-500 sm:text-xs md:text-sm dark:text-gray-400">
              {issues.length} of {total}
            </span>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 sm:gap-3 sm:p-8">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500 sm:text-xs md:text-sm dark:text-gray-400">Loading issues...</span>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 text-center sm:p-8">
              <FileCode2 className="size-6 mx-auto mb-2 text-gray-400 sm:size-8 dark:text-gray-600" />
              <p className="text-[10px] text-gray-500 sm:text-xs md:text-sm dark:text-gray-400">
                No issues matched the current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {issues.map((issue) => (
                <IssueCard key={issue.key} issue={issue} projectKey={projectKey} allIssues={allIssues} />
              ))}
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
          <div className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-[#f7fbfb] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-200 pb-3 sm:mb-4 sm:mb-5 sm:pb-4 dark:border-gray-800">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-[11px] dark:text-gray-400">
                  Filters
                </p>
                <h3 className="mt-1 text-xs font-semibold text-gray-900 sm:text-sm dark:text-white">
                  Refine issue results
                </h3>
              </div>
              <Filter className="size-3.5 text-gray-400 sm:size-4 dark:text-gray-500" />
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <FilterChips
                label="Issue type"
                options={issueTypeOptions}
                selected={typeFilter}
                onChange={onTypeFilterChange}
              />
              <div className="border-t border-gray-200 pt-4 sm:pt-5 md:pt-6 dark:border-gray-800">
                <FilterChips
                  label="Severity"
                  options={severityOptions}
                  selected={severityFilter}
                  onChange={onSeverityFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Distribution chart */}
          <div className="rounded-lg border border-gray-200 bg-linear-to-br from-white to-[#f7fbfb] p-3 sm:rounded-xl sm:p-4 md:p-5 dark:border-gray-800 dark:from-gray-950 dark:to-gray-950">
            <SeverityDistribution issues={issues} />
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
