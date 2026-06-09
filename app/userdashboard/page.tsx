"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Cpu,
  Database,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Network,
  Radar,
  Server,
  TrendingUp,
  Waypoints,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";
import {
  useGetDashboardAssetsTrendQuery,
  useGetDashboardMostVulnerableAssetsQuery,
  useGetDashboardOverviewQuery,
  useGetDashboardTopPortsQuery,
  useGetDashboardTopServicesQuery,
  useGetDashboardTopTechnologiesQuery,
  useGetDashboardVulnerabilitySeverityQuery,
} from "@/lib/redux/services/userdashboard/overiew/overview-api";
import DashboardOverviewSkeleton from "@/components/skeletons/dashboard-overview-skeleton";
import type { DashboardMostVulnerableAsset } from "@/types/overview";

import { useOptionalGuestContext } from "@/lib/guest/GuestContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type MetricCardData = {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
};

type SeverityVisual = {
  color: string;
  gradient: string;
  textColor: string;
  bgColor: string;
  bar: string;
};

const HIGH_RISK_ASSETS_PAGE_SIZE = 10;

// ─── Responsive breakpoints for easier reference ─────────────────────────────
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

// ─── Severity config ─────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, SeverityVisual> = {
  critical: {
    color: "bg-rose-500",
    gradient: "from-rose-500 to-pink-600",
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    bar: "#F43F5E",
  },
  high: {
    color: "bg-orange-500",
    gradient: "from-orange-500 to-red-600",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    bar: "#F97316",
  },
  medium: {
    color: "bg-amber-500",
    gradient: "from-amber-500 to-orange-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    bar: "#F59E0B",
  },
  low: {
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-blue-500",
    textColor: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    bar: "#06B6D4",
  },
  info: {
    color: "bg-sky-500",
    gradient: "from-sky-500 to-blue-600",
    textColor: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    bar: "#0EA5E9",
  },
};

// ─── Helper functions ────────────────────────────────────────────────────────

function getDashboardDisplayName(aliasName?: string, username?: string): string {
  const trimmedAlias = aliasName?.trim() ?? "";
  if (!trimmedAlias || trimmedAlias.toLowerCase() === "string") {
    return username?.trim() || "there";
  }
  return trimmedAlias;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatFullNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function getTopPortsNote(portLabel: string, protocol: string, count: number): string {
  if (!count) return "No open port findings yet";
  return `${protocol.toUpperCase()} ${portLabel} • ${formatFullNumber(count)} occurrences`;
}

function getTopServiceNote(serviceName: string, affectedHosts: number): string {
  if (!affectedHosts) return "No dominant service detected yet";
  return `${serviceName} • ${formatFullNumber(affectedHosts)} hosts`;
}

function getTopTechnologyNote(technology: string, count: number): string {
  if (!count) return "No dominant technology detected yet";
  return `${technology} • ${formatFullNumber(count)} instances`;
}

function getSeverityMeta(label: string, count: number) {
  const style = SEVERITY_STYLES[label.toLowerCase()] ?? {
    color: "bg-slate-500",
    gradient: "from-slate-500 to-slate-600",
    textColor: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    bar: "#94A3B8",
  };
  return {
    ...style,
    trend: count ? `${formatFullNumber(count)} findings` : "No findings",
  };
}

function getRiskTone(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
    case "low":
      return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50";
    default:
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50";
  }
}

function readErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Unable to load dashboard data.";
  if ("status" in error && "data" in error) {
    const payload = error.data;
    if (payload && typeof payload === "object") {
      if ("detail" in payload && typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail;
      }
      if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
    }
  }
  if ("message" in error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  return "Unable to load dashboard data.";
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function UserDashboardPage() {
  return <AuthenticatedDashboard />;
}

function AuthenticatedDashboard() {
  const guestCtx = useOptionalGuestContext();
  const isGuest = guestCtx?.isGuest ?? false;

  const [highRiskAssetsPage, setHighRiskAssetsPage] = useState(1);
  const { data: authMe } = useGetAuthMeQuery(undefined, { skip: isGuest });
  const overviewQuery = useGetDashboardOverviewQuery(undefined, { skip: isGuest });
  const severityQuery = useGetDashboardVulnerabilitySeverityQuery(undefined, { skip: isGuest });
  const assetsTrendQuery = useGetDashboardAssetsTrendQuery({ range: "30d" }, { skip: isGuest });
  const topPortsQuery = useGetDashboardTopPortsQuery({ limit: 1 }, { skip: isGuest });
  const topServicesQuery = useGetDashboardTopServicesQuery({ limit: 1 }, { skip: isGuest });
  const topTechnologiesQuery = useGetDashboardTopTechnologiesQuery({ limit: 1 }, { skip: isGuest });
  const mostVulnerableQuery = useGetDashboardMostVulnerableAssetsQuery({
    page: highRiskAssetsPage,
    pageSize: HIGH_RISK_ASSETS_PAGE_SIZE,
    sortBy: "riskScore",
    order: "desc",
  }, { skip: isGuest });

  const displayName = isGuest
    ? "Guest"
    : getDashboardDisplayName(authMe?.user.alias_name, authMe?.user.username);

  const overview = overviewQuery.data;
  const severity = severityQuery.data;
  const topPort = topPortsQuery.data?.[0];
  const topService = topServicesQuery.data?.[0];
  const topTechnology = topTechnologiesQuery.data?.[0];
  const vulnerableAssets = mostVulnerableQuery.data?.items ?? [];
  const totalHighRiskAssets = mostVulnerableQuery.data?.total ?? 0;
  const totalHighRiskAssetPages = Math.max(
    1,
    Math.ceil(totalHighRiskAssets / HIGH_RISK_ASSETS_PAGE_SIZE),
  );
  const highRiskAssetsStart = totalHighRiskAssets
    ? (highRiskAssetsPage - 1) * HIGH_RISK_ASSETS_PAGE_SIZE + 1
    : 0;
  const highRiskAssetsEnd = totalHighRiskAssets
    ? Math.min(highRiskAssetsPage * HIGH_RISK_ASSETS_PAGE_SIZE, totalHighRiskAssets)
    : 0;

  useEffect(() => {
    if (highRiskAssetsPage > totalHighRiskAssetPages) {
      setHighRiskAssetsPage(totalHighRiskAssetPages);
    }
  }, [highRiskAssetsPage, totalHighRiskAssetPages]);

  const scannedAssetMetrics: MetricCardData[] = [
    {
      label: "IP Addresses",
      value: overview?.totalIpAddresses ?? 0,
      note: getTopPortsNote(
        topPort ? String(topPort.port) : "n/a",
        topPort?.protocol ?? "tcp",
        topPort?.count ?? 0,
      ),
      icon: Globe,
      iconColor: "text-cyan-600 dark:text-cyan-400",
      gradient: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      label: "Hostnames",
      value: overview?.totalHostnames ?? 0,
      note: "Resolved and monitored assets",
      icon: Server,
      iconColor: "text-blue-600 dark:text-blue-400",
      gradient: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Open Ports",
      value: overview?.totalOpenPorts ?? 0,
      note: "Exposed network entry points",
      icon: Lock,
      iconColor: "text-rose-600 dark:text-rose-400",
      gradient: "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      label: "Protocols",
      value: overview?.totalProtocols ?? 0,
      note: "Distinct network protocols",
      icon: Waypoints,
      iconColor: "text-violet-600 dark:text-violet-400",
      gradient: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "Services",
      value: overview?.totalServices ?? 0,
      note: getTopServiceNote(
        topService?.serviceName ?? "Top service",
        topService?.affectedHosts ?? 0,
      ),
      icon: Database,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      gradient: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Technologies",
      value: overview?.totalTechnologies ?? 0,
      note: getTopTechnologyNote(
        topTechnology?.technology ?? "Top technology",
        topTechnology?.count ?? 0,
      ),
      icon: Cpu,
      iconColor: "text-amber-600 dark:text-amber-400",
      gradient: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  const vulnerabilityData = (severity?.labels ?? []).map((label, index) => {
    const count = severity?.datasets?.[0]?.data?.[index] ?? 0;
    return { label, count, ...getSeverityMeta(label, count) };
  });

  const totalFindings = vulnerabilityData.reduce((sum, item) => sum + item.count, 0);
  const scanTools = overview?.scanTools ?? [];

  const isLoading =
    overviewQuery.isLoading ||
    severityQuery.isLoading ||
    mostVulnerableQuery.isLoading;

  const loadError =
    overviewQuery.error ||
    severityQuery.error ||
    mostVulnerableQuery.error ||
    topPortsQuery.error ||
    topServicesQuery.error ||
    topTechnologiesQuery.error;

  // Show the purpose-built skeleton while primary data is loading
  if (isLoading && !loadError) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-4">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 sm:gap-3 pt-1 sm:pt-2 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <p className="text-xs sm:text-sm md:text-sm lg:text-base font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Welcome back, <span className="text-teal-600 dark:text-teal-400 font-semibold">{displayName}</span>
            </p>
            <h1 className="mt-1.5 sm:mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Security Overview
            </h1>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time visibility across your infrastructure, vulnerabilities, and code security.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 text-xs sm:text-xs md:text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live data
            </span>
          </div>
        </motion.div>

        {/* ── Error banner ────────────────────────────────────────── */}
        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-lg sm:rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 sm:px-4 sm:py-3 dark:border-rose-900/50 dark:bg-rose-950/30"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-medium text-rose-800 dark:text-rose-300">Error loading data</p>
              <p className="text-xs sm:text-xs md:text-sm text-rose-600 dark:text-rose-400 wrap-break-word">{readErrorMessage(loadError)}</p>
            </div>
          </motion.div>
        )}

        {/* ── Metric Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-6">
          {scannedAssetMetrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>

        {/* ── Main 2-col grid ──────────────────────────────────────── */}
        <div className="grid gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-2">

          {/* Vulnerability Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            {/* card header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 dark:border-slate-800 gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">Vulnerability distribution</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Security findings by severity level</p>
              </div>
              <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-[10px] md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap shrink-0">
                {formatFullNumber(totalFindings)} total
              </span>
            </div>

            <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
              {vulnerabilityData.length > 0 ? (
                <>
                  {/* Legend */}
                  <div className="mb-3 sm:mb-4 md:mb-5 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                    {vulnerabilityData.map((item) => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.bar }}
                        />
                        <span className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <VulnerabilityBarChart data={vulnerabilityData} />

                  {/* Summary pills */}
                  <div className="mt-3 sm:mt-4 md:mt-5 grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2">
                    {vulnerabilityData.map((item) => (
                      <div
                        key={item.label}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg md:rounded-xl p-1 sm:p-1.5 ${item.bgColor}`}
                      >
                        <p className={`text-sm sm:text-base md:text-xl lg:text-2xl font-bold ${item.textColor} truncate w-full text-center`}>
                          {formatCompactNumber(item.count)}
                        </p>
                        <p className="mt-0.5 text-[7px] sm:text-[8px] md:text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center line-clamp-2">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<AlertTriangle size={28} className="sm:size-8 text-slate-300 dark:text-slate-600" />}
                  message={isLoading ? "Loading vulnerability data…" : "No vulnerability data available"}
                />
              )}
            </div>
          </motion.div>

          {/* Scan Activity — Radial Charts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 dark:border-slate-800 gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">Scan activity</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Code security scanner metrics</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-1.5 dark:bg-teal-950/40 shrink-0">
                <Activity size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            <div className="flex items-center justify-center px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 overflow-x-auto">
              {scanTools.length > 0 ? (
                (() => {
                  const RING_COLORS = ["#6366F1", "#0EA5E9", "#F59E0B", "#EC4899"];
                  const totalCodeScans = overview?.totalCodeScans ?? 1;
                  const rings = scanTools.slice(0, 4).map((tool, i) => ({
                    percent: Math.round((tool.totalScans / Math.max(1, totalCodeScans)) * 100),
                    color: RING_COLORS[i],
                    label: tool.toolName,
                    scans: tool.totalScans,
                    issues: tool.totalIssues,
                  }));

                  return (
                    <div className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-5">
                      <RadialChart rings={rings} totalCodeScans={totalCodeScans} totalIssues={overview?.totalCodeScanIssues ?? 0} />
                      <div className="w-full space-y-1.5 sm:space-y-2 md:space-y-2.5">
                        {rings.map((ring) => (
                          <div key={ring.label} className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: ring.color }}
                              />
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                {ring.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                              <span className="hidden sm:inline text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                {formatFullNumber(ring.scans)} scans · {formatFullNumber(ring.issues)} issues
                              </span>
                              <span className="sm:hidden text-[9px] tabular-nums text-slate-500 dark:text-slate-400">
                                {formatCompactNumber(ring.scans)}/{formatCompactNumber(ring.issues)}
                              </span>
                              <span
                                className="min-w-8 text-right text-xs sm:text-sm font-bold tabular-nums shrink-0"
                                style={{ color: ring.color }}
                              >
                                {ring.percent}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <EmptyState
                  icon={<Radar size={28} className="sm:size-8 text-slate-300 dark:text-slate-600" />}
                  message={isLoading ? "Loading scan data…" : "No scan activity yet"}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Asset Discovery Trend ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 dark:border-slate-800 gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">Asset discovery trend</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">New assets discovered over the last 30 days</p>
            </div>
            <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-[10px] md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap shrink-0">
              30 days
            </span>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 overflow-x-auto">
            {assetsTrendQuery.data && assetsTrendQuery.data.labels.length > 0 ? (
              <AssetTrendChart
                labels={assetsTrendQuery.data.labels}
                datasets={assetsTrendQuery.data.datasets}
              />
            ) : (
              <EmptyState
                icon={<TrendingUp size={28} className="sm:size-8 text-slate-300 dark:text-slate-600" />}
                message={assetsTrendQuery.isLoading ? "Loading trend data…" : "No trend data available"}
              />
            )}
          </div>
        </motion.div>

        {/* ── High-Risk Assets table ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 dark:border-slate-800 gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">High-risk assets</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Assets ranked by security risk score</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {totalHighRiskAssets > 0 && (
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] sm:text-[10px] md:text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 whitespace-nowrap">
                  {highRiskAssetsStart}-{highRiskAssetsEnd}
                </span>
              )}
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-[10px] md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
                {formatFullNumber(totalHighRiskAssets)} assets
              </span>
            </div>
          </div>

          {vulnerableAssets.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                      {["Asset", "IP Address", "Severity", "Findings", "Risk Score", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-left text-[8px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {vulnerableAssets.map((asset, index) => (
                      <AssetRow key={asset.assetId} asset={asset} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center gap-2.5 sm:gap-3 border-t border-slate-100 px-3 py-2.5 text-center sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between md:px-6 md:text-left dark:border-slate-800">
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  Showing {highRiskAssetsStart}-{highRiskAssetsEnd} of {formatFullNumber(totalHighRiskAssets)} high-risk assets
                </p>
                <div className="flex w-full items-center justify-center gap-1 md:w-auto md:gap-1.5 shrink-0">
                  <PaginationButton
                    label="Previous page"
                    onClick={() => setHighRiskAssetsPage((page) => Math.max(1, page - 1))}
                    disabled={highRiskAssetsPage === 1 || mostVulnerableQuery.isFetching}
                    icon={<ChevronLeft size={14} />}
                  />
                  <span className="px-1.5 sm:px-2 text-[10px] sm:text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Page {highRiskAssetsPage} of {totalHighRiskAssetPages}
                  </span>
                  <PaginationButton
                    label="Next page"
                    onClick={() =>
                      setHighRiskAssetsPage((page) =>
                        Math.min(totalHighRiskAssetPages, page + 1),
                      )
                    }
                    disabled={
                      highRiskAssetsPage === totalHighRiskAssetPages ||
                      mostVulnerableQuery.isFetching
                    }
                    icon={<ChevronRight size={14} />}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 sm:py-10 md:py-12">
              <EmptyState
                icon={<Network size={28} className="sm:size-8 text-slate-300 dark:text-slate-600" />}
                message={isLoading ? "Loading asset data…" : "No vulnerable assets found"}
              />
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ metric, index }: { metric: MetricCardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.04 }}
      className="relative p-4 sm:p-5 md:p-6 lg:p-7 bg-white dark:bg-slate-900 transition-all"
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        outline: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 14px 14px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 14px 14px no-repeat
          `,
          opacity: 0.45,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      {/* Large half-circle icon on the right */}
      <div className="absolute -right-16 sm:-right-20 md:-right-24 lg:-right-32 top-1/2 -translate-y-1/2">
        <div className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-full flex items-center justify-center ${metric.gradient} opacity-20`}>
          <metric.icon className={`${metric.iconColor} w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 opacity-60`} />
        </div>
      </div>

      {/* Content on the left */}
      <div className="relative z-10">
        <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 line-clamp-2 pr-8 sm:pr-10 md:pr-12">{metric.label}</p>
        <p className="mt-2 sm:mt-3 md:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
          {formatCompactNumber(metric.value)}
        </p>
        <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-slate-400 dark:text-slate-500 pr-12 sm:pr-16 md:pr-20 break-words">
          {metric.note}
        </p>
      </div>
    </motion.div>
  );
}

type VulnItem = {
  label: string;
  count: number;
  bar: string;
  trend: string;
  textColor: string;
  bgColor: string;
  color: string;
  gradient: string;
};

function VulnerabilityBarChart({ data }: { data: VulnItem[] }) {
  // ─── Responsive chart dimensions ─────────────────────────────
  // Mobile: 320px, Tablet: 640px, Desktop: 960px
  const getChartDimensions = () => {
    if (typeof window === "undefined") return { W: 960, H: 260 };
    const width = window.innerWidth;
    if (width < 640) {
      return { W: 320, H: 200 }; // Mobile
    } else if (width < 1024) {
      return { W: 640, H: 220 }; // Tablet
    }
    return { W: 960, H: 260 }; // Desktop
  };

  const { W, H } = getChartDimensions();
  const paddingLeft = W < 400 ? 28 : W < 700 ? 32 : 36;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = W < 400 ? 28 : 32;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const rawStep = maxCount / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
  const yMax = niceStep * 5;
  const yTicks = Array.from({ length: 6 }, (_, i) => yMax - i * niceStep);

  const colW = chartW / data.length;
  const barW = Math.min(W < 400 ? 24 : 32, colW * 0.5);

  function formatTick(v: number) {
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  }

  function barHeight(count: number) {
    return (count / yMax) * chartH;
  }

  const gridLines = yTicks.map((v) => {
    const y = paddingTop + chartH - (v / yMax) * chartH;
    return { y, label: formatTick(v) };
  });

  const fontSize = W < 400 ? 8 : W < 700 ? 9 : 10;
  const labelFontSize = W < 400 ? 8 : 9;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Bar chart showing vulnerability counts by severity level"
      style={{ overflow: "visible", minHeight: `${Math.min(H, 280)}px` }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {gridLines.map(({ y, label }, index) => (
        <g key={`grid-line-${index}-${y}`}>
          <line
            x1={paddingLeft}
            y1={y}
            x2={W - paddingRight}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
          <text
            x={paddingLeft - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={fontSize}
            fill="#7B91B0"
            fontFamily="inherit"
          >
            {label}
          </text>
        </g>
      ))}

      {/* Bars + X labels */}
      {data.map((item, i) => {
        const bh = barHeight(item.count);
        const cx = paddingLeft + colW * i + colW / 2;
        const barX = cx - barW / 2;
        const barY = paddingTop + chartH - bh;

        return (
          <g key={item.label}>
            {/* Bar */}
            <motion.rect
              x={barX}
              y={barY}
              width={barW}
              height={bh}
              rx={W < 400 ? 2 : 4}
              fill={item.bar}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
              style={{ transformOrigin: `${cx}px ${paddingTop + chartH}px` }}
            />

            {/* Count label above bar */}
            {item.count > 0 && (
              <text
                x={cx}
                y={barY - 3}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={600}
                fill={item.bar}
                fontFamily="inherit"
              >
                {formatCompactNumber(item.count)}
              </text>
            )}

            {/* X axis label */}
            <text
              x={cx}
              y={H - 4}
              textAnchor="middle"
              fontSize={labelFontSize}
              fill="#7B91B0"
              fontFamily="inherit"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AssetRow({ asset, index }: { asset: DashboardMostVulnerableAsset; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
    >
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Network size={12} className="sm:size-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="max-w-20 sm:max-w-32 md:max-w-50 truncate text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
            {asset.hostname || "Unknown"}
          </span>
        </div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        {asset.ip ? (
          <code className="rounded-md bg-slate-100 px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 text-[8px] sm:text-[9px] md:text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300 block truncate">
            {asset.ip}
          </code>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <span
          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 text-[8px] sm:text-[9px] md:text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${getRiskTone(asset.highestSeverity)}`}
        >
          {asset.highestSeverity}
        </span>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {formatFullNumber(asset.vulnerabilityCount)}
        </span>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-rose-500 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {formatFullNumber(asset.riskScore)}
          </span>
        </div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 text-[8px] sm:text-[9px] md:text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400 whitespace-nowrap">
          <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 shrink-0" />
          Monitored
        </span>
      </td>
    </motion.tr>
  );
}

function RadialChart({
  rings,
  totalCodeScans,
  totalIssues,
}: {
  rings: { percent: number; color: string; label: string }[];
  totalCodeScans: number;
  totalIssues: number;
}) {
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive size
  const getSize = () => {
    if (typeof window === "undefined") return 340;
    const width = window.innerWidth;
    if (width < 640) return 240;
    if (width < 1024) return 280;
    return 340;
  };

  const size = getSize();
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size < 280 ? 18 : 24;
  const gap = size < 280 ? 5 : 7;
  const totalIssuesColor = rings[0]?.color ?? "#6366F1";

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative" ref={containerRef} onMouseMove={handleMouseMove}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Radial chart showing scan metrics"
        style={{ maxWidth: "100%", height: "auto" }}
        onMouseLeave={() => setHoveredRing(null)}
      >
        {rings.map((ring, i) => {
          const radius = cx - strokeWidth / 2 - i * (strokeWidth + gap);
          if (radius <= 0) return null;
          const circumference = 2 * Math.PI * radius;
          const filled = (ring.percent / 100) * circumference;
          const unfilled = circumference - filled;
          const isHovered = hoveredRing === i;

          return (
            <g key={ring.label}>
              {/* Background track */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.06}
                strokeWidth={strokeWidth}
              />
              {/* Filled arc */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${filled} ${unfilled}`}
                strokeDashoffset={circumference * 0.25}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${filled} ${unfilled}` }}
                transition={{ duration: 1, ease: "easeOut", delay: i * 0.15 }}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 6px ${ring.color}50)` : "none",
                  transition: "stroke-width 0.2s ease, filter 0.2s ease",
                }}
              />
              {/* Invisible wider hit area for hover */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="transparent"
                strokeWidth={strokeWidth + 12}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredRing(i)}
              />
              {/* Percentage label at arc end on hover */}
              {isHovered && ring.percent > 0 && (() => {
                const angle = -90 + (ring.percent / 100) * 360;
                const rad = (angle * Math.PI) / 180;
                const labelRadius = radius + strokeWidth / 2 + 14;
                const lx = cx + labelRadius * Math.cos(rad);
                const ly = cy + labelRadius * Math.sin(rad);
                return (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={size < 280 ? 9 : 11}
                    fontWeight={700}
                    fill={ring.color}
                  >
                    {ring.percent}%
                  </text>
                );
              })()}
            </g>
          );
        })}
        {/* Center content */}
        <text
          x={cx}
          y={cy - (size < 280 ? 8 : 12)}
          textAnchor="middle"
          fontSize={size < 280 ? 24 : 30}
          fontWeight={800}
          fill={totalIssuesColor}
          fontFamily="inherit"
        >
          {hoveredRing !== null ? rings[hoveredRing]?.percent + "%" : totalIssues}
        </text>
        <line
          x1={cx - (size < 280 ? 15 : 20)}
          y1={cy + 2}
          x2={cx + (size < 280 ? 15 : 20)}
          y2={cy + 2}
          stroke="#CBD5E1"
          strokeWidth={1}
        />
        <text
          x={cx}
          y={cy + (size < 280 ? 14 : 20)}
          textAnchor="middle"
          fontSize={size < 280 ? 14 : 18}
          fontWeight={700}
          fill="currentColor"
          className="text-slate-700 dark:text-slate-200"
        >
          {hoveredRing !== null ? "" : totalCodeScans}
        </text>
        <text
          x={cx}
          y={cy + (size < 280 ? 26 : 36)}
          textAnchor="middle"
          fontSize={size < 280 ? 8 : 10}
          fill="#94A3B8"
          fontFamily="inherit"
        >
          {hoveredRing !== null ? rings[hoveredRing]?.label : "issues / scans"}
        </text>
      </svg>

      {/* Hover tooltip */}
      {hoveredRing !== null && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 54,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-[12px] font-semibold text-slate-900 dark:text-white">
            {rings[hoveredRing].label}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: rings[hoveredRing].color }}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {rings[hoveredRing].percent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 py-8 sm:py-10 md:py-12">
      {icon}
      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 text-center">{message}</p>
    </div>
  );
}

function PaginationButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {icon}
    </button>
  );
}

type TrendDataset = { label: string; data: number[] };

const TREND_COLORS = ["#00d0b2", "#3B82F6", "#F59E0B"];

function AssetTrendChart({
  labels,
  datasets,
}: {
  labels: string[];
  datasets: TrendDataset[];
}) {
  // Responsive dimensions
  const getChartDims = () => {
    if (typeof window === "undefined") return { W: 960, H: 250 };
    const width = window.innerWidth;
    if (width < 640) {
      return { W: 320, H: 180 }; // Mobile
    } else if (width < 1024) {
      return { W: 640, H: 200 }; // Tablet
    }
    return { W: 960, H: 250 }; // Desktop
  };

  const { W, H } = getChartDims();
  const paddingLeft = W < 400 ? 32 : W < 700 ? 36 : 40;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = W < 400 ? 24 : 28;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const combined = labels.map((_, i) =>
    datasets.reduce((sum, ds) => sum + (ds.data[i] ?? 0), 0),
  );

  const maxVal = Math.max(1, ...combined);
  const rawStep = maxVal / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
  const yMax = niceStep * 4;
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - i * niceStep);

  function xPos(i: number) {
    return paddingLeft + (i / Math.max(1, labels.length - 1)) * chartW;
  }

  function yPos(v: number) {
    return paddingTop + chartH - (v / yMax) * chartH;
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }

  function buildSmoothPath(data: number[]): string {
    if (data.length < 2) return "";
    let path = `M ${xPos(0)},${yPos(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const prevX = xPos(i - 1);
      const prevY = yPos(data[i - 1]);
      const currX = xPos(i);
      const currY = yPos(data[i]);
      const cpX = (prevX + currX) / 2;
      path += ` C ${cpX},${prevY} ${cpX},${currY} ${currX},${currY}`;
    }
    return path;
  }

  function buildAreaPath(data: number[]): string {
    const linePath = buildSmoothPath(data);
    if (!linePath) return "";
    return `${linePath} L ${xPos(data.length - 1)},${yPos(0)} L ${xPos(0)},${yPos(0)} Z`;
  }

  const linePath = buildSmoothPath(combined);
  const areaPath = buildAreaPath(combined);
  const xLabelStep = Math.max(1, Math.floor(labels.length / 6));
  const peakIndex = combined.indexOf(maxVal);

  const fontSize = W < 400 ? 8 : 9;
  const labelFontSize = W < 400 ? 7 : 8;
  const tooltipFontSize = W < 400 ? 9 : 10;

  return (
    <div className="overflow-x-auto">
      {/* Legend */}
      <div className="mb-2 sm:mb-3 md:mb-4 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
        {datasets.map((ds, i) => (
          <div key={ds.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: TREND_COLORS[i % TREND_COLORS.length] }}
            />
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{ds.label}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        role="img"
        aria-label="Area chart showing asset discovery trend"
        preserveAspectRatio="none"
        style={{ overflow: "visible", minHeight: `${Math.min(H, 280)}px` }}
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d0b2" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#00d0b2" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((v) => {
          const y = yPos(v);
          return (
            <g key={v}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={W - paddingRight}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.06}
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={fontSize}
                fill="#94A3B8"
                fontFamily="inherit"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Smooth line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#00d0b2"
          strokeWidth={W < 400 ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Peak dot + tooltip */}
        {maxVal > 0 && peakIndex >= 0 && (
          <g>
            <circle
              cx={xPos(peakIndex)}
              cy={yPos(combined[peakIndex])}
              r={W < 400 ? 3.5 : 5}
              fill="white"
              stroke="#00d0b2"
              strokeWidth={W < 400 ? 1.5 : 2.5}
            />
            {/* Tooltip background */}
            <rect
              x={xPos(peakIndex) - (W < 400 ? 28 : 36)}
              y={yPos(combined[peakIndex]) - (W < 400 ? 22 : 28)}
              width={W < 400 ? 56 : 72}
              height={W < 400 ? 18 : 20}
              rx={4}
              fill="#1E293B"
              fillOpacity={0.9}
            />
            {/* Tooltip text */}
            <text
              x={xPos(peakIndex)}
              y={yPos(combined[peakIndex]) - (W < 400 ? 11 : 14)}
              textAnchor="middle"
              fontSize={tooltipFontSize}
              fontWeight={600}
              fill="white"
              fontFamily="inherit"
            >
              {formatDate(labels[peakIndex])} {combined[peakIndex]}
            </text>
          </g>
        )}

        {/* X axis labels */}
        {labels.map((label, i) => {
          const isStepLabel = i % xLabelStep === 0;
          const isLastLabel = i === labels.length - 1;
          if (isStepLabel && !isLastLabel && labels.length - 1 - i < xLabelStep * 0.6) {
            return null;
          }
          return isStepLabel || isLastLabel ? (
            <text
              key={label}
              x={xPos(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize={labelFontSize}
              fill="#94A3B8"
              fontFamily="inherit"
            >
              {formatDate(label)}
            </text>
          ) : null;
        })}
      </svg>
    </div>
  );
}
