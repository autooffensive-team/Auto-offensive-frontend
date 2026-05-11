"use client";


import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Cpu,
  Database,
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
import type { DashboardMostVulnerableAsset } from "@/types/overview";

// ─── Types (unchanged) ───────────────────────────────────────────────────────

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

// ─── Severity config (unchanged logic) ───────────────────────────────────────

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

// ─── Helper functions (all unchanged) ────────────────────────────────────────

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

// ─── Page Component (API hooks unchanged) ────────────────────────────────────

export default function UserDashboardPage() {
  const { data: authMe } = useGetAuthMeQuery();
  const overviewQuery = useGetDashboardOverviewQuery();
  const severityQuery = useGetDashboardVulnerabilitySeverityQuery();
  const assetsTrendQuery = useGetDashboardAssetsTrendQuery({ range: "30d" });
  const topPortsQuery = useGetDashboardTopPortsQuery({ limit: 1 });
  const topServicesQuery = useGetDashboardTopServicesQuery({ limit: 1 });
  const topTechnologiesQuery = useGetDashboardTopTechnologiesQuery({ limit: 1 });
  const mostVulnerableQuery = useGetDashboardMostVulnerableAssetsQuery({
    page: 1,
    pageSize: 20,
    sortBy: "riskScore",
    order: "desc",
  });

  const displayName = getDashboardDisplayName(
    authMe?.user.alias_name,
    authMe?.user.username,
  );

  const overview = overviewQuery.data;
  const severity = severityQuery.data;
  const topPort = topPortsQuery.data?.[0];
  const topService = topServicesQuery.data?.[0];
  const topTechnology = topTechnologiesQuery.data?.[0];
  const vulnerableAssets = mostVulnerableQuery.data?.items ?? [];

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-400 space-y-4 p-4 md:space-y-5 md:p-6 lg:space-y-6 lg:p-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1 pt-2 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-xs md:text-sm font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Welcome back, <span className="text-teal-600 dark:text-teal-400">{displayName}</span>
            </p>
            <h1 className="mt-1 text-xl md:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white">
              Security Overview
            </h1>
            <p className="mt-0.5 text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400">
              Real-time visibility across your infrastructure, vulnerabilities, and code security.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs md:text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/30"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm md:text-base font-medium text-rose-800 dark:text-rose-300">Error loading data</p>
              <p className="text-xs md:text-sm text-rose-600 dark:text-rose-400">{readErrorMessage(loadError)}</p>
            </div>
          </motion.div>
        )}

        {/* ── Metric Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {scannedAssetMetrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>

        {/* ── Main 2-col grid ──────────────────────────────────────── */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1fr_1fr]">

          {/* Vulnerability Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            {/* card header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
              <div>
                <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Vulnerability distribution</p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Security findings by severity level</p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-xs md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {formatFullNumber(totalFindings)} total
              </span>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-5">
              {vulnerabilityData.length > 0 ? (
                <>
                  {/* Legend */}
                  <div className="mb-3 md:mb-4 flex flex-wrap items-center gap-3 md:gap-4">
                    {vulnerabilityData.map((item) => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.bar }}
                        />
                        <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <VulnerabilityBarChart data={vulnerabilityData} />

                  {/* Summary pills */}
                  <div className="mt-4 md:mt-5 grid grid-cols-5 gap-1.5 md:gap-2">
                    {vulnerabilityData.map((item) => (
                      <div
                        key={item.label}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg md:rounded-xl ${item.bgColor}`}
                      >
                        <p className={`text-base md:text-xl lg:text-2xl font-semibold ${item.textColor}`}>
                          {formatCompactNumber(item.count)}
                        </p>
                        <p className="mt-0.5 text-[8px] md:text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<AlertTriangle size={32} className="text-slate-300 dark:text-slate-600" />}
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
            className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
              <div>
                <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Scan activity</p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Code security scanner metrics</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-1.5 dark:bg-teal-950/40">
                <Activity size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            <div className="flex items-center justify-center px-4 py-5 md:px-5 md:py-6">
              {scanTools.length > 0 ? (
                (() => {
                  const RING_COLORS = ["#5eecd5", "#00d0b2", "#009d87", "#006b5c"];
                  const totalCodeScans = overview?.totalCodeScans ?? 1;
                  const rings = scanTools.slice(0, 4).map((tool, i) => ({
                    percent: Math.round((tool.totalScans / Math.max(1, totalCodeScans)) * 100),
                    color: RING_COLORS[i],
                    label: tool.toolName,
                    scans: tool.totalScans,
                    issues: tool.totalIssues,
                  }));

                  return (
                    <div className="flex w-full flex-col items-center gap-4 md:gap-5">
                      <RadialChart rings={rings} totalCodeScans={totalCodeScans} totalIssues={overview?.totalCodeScanIssues ?? 0} />
                      <div className="w-full space-y-2 md:space-y-2.5">
                        {rings.map((ring) => (
                          <div key={ring.label} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: ring.color }}
                              />
                              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                                {ring.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <span className="hidden sm:inline text-xs md:text-sm tabular-nums text-slate-500 dark:text-slate-400">
                                {formatFullNumber(ring.scans)} scans · {formatFullNumber(ring.issues)} issues
                              </span>
                              <span className="sm:hidden text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                                {formatCompactNumber(ring.scans)}/{formatCompactNumber(ring.issues)}
                              </span>
                              <span
                                className="min-w-[32px] text-right text-xs md:text-sm font-bold tabular-nums"
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
                  icon={<Radar size={32} className="text-slate-300 dark:text-slate-600" />}
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
          className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
            <div>
              <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Asset discovery trend</p>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">New assets discovered over the last 30 days</p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-xs md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              30 days
            </span>
          </div>

          <div className="px-4 py-4 md:px-6 md:py-5">
            {assetsTrendQuery.data && assetsTrendQuery.data.labels.length > 0 ? (
              <AssetTrendChart
                labels={assetsTrendQuery.data.labels}
                datasets={assetsTrendQuery.data.datasets}
              />
            ) : (
              <EmptyState
                icon={<TrendingUp size={32} className="text-slate-300 dark:text-slate-600" />}
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
          className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 dark:border-slate-800">
            <div>
              <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">High-risk assets</p>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Assets ranked by security risk score</p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 md:px-3 text-xs md:text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {formatFullNumber(mostVulnerableQuery.data?.total ?? 0)} assets
            </span>
          </div>

          {vulnerableAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Asset", "IP Address", "Severity", "Findings", "Risk Score", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 md:px-6 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
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
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<Network size={32} className="text-slate-300 dark:text-slate-600" />}
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
      className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-4 md:p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
        <div className={`rounded-lg p-1.5 md:p-2 ${metric.gradient}`}>
          <metric.icon size={16} className={metric.iconColor} />
        </div>
      </div>
      <p className="mt-2 md:mt-3 text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white">
        {formatCompactNumber(metric.value)}
      </p>
      <p className="mt-1 md:mt-1.5 truncate text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
        {metric.note}
      </p>
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
  // Chart layout constants
  const W = 480;
  const H = 260;
  const paddingLeft = 36;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 36;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  const maxCount = Math.max(1, ...data.map((d) => d.count));

  // Round up to a nice ceiling for Y axis
  const rawStep = maxCount / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
  const yMax = niceStep * 5;

  const yTicks = Array.from({ length: 6 }, (_, i) => yMax - i * niceStep);

  // Bar layout — one bar per severity, centred in its column
  const colW = chartW / data.length;
  const barW = Math.min(36, colW * 0.5);

  function formatTick(v: number) {
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  }

  function barHeight(count: number) {
    return (count / yMax) * chartH;
  }

  // Horizontal grid line Y positions
  const gridLines = yTicks.map((v) => {
    const y = paddingTop + chartH - (v / yMax) * chartH;
    return { y, label: formatTick(v) };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label="Bar chart showing vulnerability counts by severity level"
      style={{ overflow: "visible" }}
    >
      {/* Grid lines */}
      {gridLines.map(({ y, label }) => (
        <g key={label}>
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
            fontSize={10}
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
              rx={4}
              fill={item.bar}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
              style={{ transformOrigin: `${cx}px ${paddingTop + chartH}px` }}
            />

            {/* Count label above bar — only show if count > 0 */}
            {item.count > 0 && (
              <text
                x={cx}
                y={barY - 5}
                textAnchor="middle"
                fontSize={10}
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
              fontSize={10}
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
      <td className="px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Network size={14} className="text-slate-500 dark:text-slate-400" />
          </div>
          <span className="max-w-32 md:max-w-50 truncate text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200">
            {asset.hostname || "Unknown"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 md:px-6">
        {asset.ip ? (
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 md:px-2 text-[10px] md:text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {asset.ip}
          </code>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 md:px-6">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 md:px-2.5 text-[10px] md:text-xs font-semibold uppercase tracking-wide ${getRiskTone(asset.highestSeverity)}`}
        >
          {asset.highestSeverity}
        </span>
      </td>
      <td className="px-4 py-3 md:px-6">
        <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {formatFullNumber(asset.vulnerabilityCount)}
        </span>
      </td>
      <td className="px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {formatFullNumber(asset.riskScore)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 md:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 md:px-2.5 text-[10px] md:text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 24;
  const gap = 7;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Radial chart showing scan metrics"
    >
      {rings.map((ring, i) => {
        const radius = cx - strokeWidth / 2 - i * (strokeWidth + gap);
        if (radius <= 0) return null;
        const circumference = 2 * Math.PI * radius;
        const filled = (ring.percent / 100) * circumference;
        const unfilled = circumference - filled;

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
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${unfilled}`}
              strokeDashoffset={circumference * 0.25}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${filled} ${unfilled}` }}
              transition={{ duration: 1, ease: "easeOut", delay: i * 0.15 }}
            />
          </g>
        );
      })}
      {/* Center content */}
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fontSize={30}
        fontWeight={800}
        fill="#00d0b2"
        fontFamily="inherit"
      >
        {totalIssues}
      </text>
      <line
        x1={cx - 20}
        y1={cy + 2}
        x2={cx + 20}
        y2={cy + 2}
        stroke="#CBD5E1"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fill="currentColor"
        className="text-slate-700 dark:text-slate-200"
      >
        {totalCodeScans}
      </text>
      <text
        x={cx}
        y={cy + 36}
        textAnchor="middle"
        fontSize={10}
        fill="#94A3B8"
        fontFamily="inherit"
      >
        issues / scans
      </text>
    </svg>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      {icon}
      <p className="text-sm text-slate-400 dark:text-slate-500">{message}</p>
    </div>
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
  const W = 960;
  const H = 200;
  const paddingLeft = 40;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 32;
  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingTop - paddingBottom;

  // Aggregate all datasets into one combined line
  const combined = labels.map((_, i) =>
    datasets.reduce((sum, ds) => sum + (ds.data[i] ?? 0), 0),
  );

  const maxVal = Math.max(1, ...combined);

  // Nice Y axis
  const rawStep = maxVal / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
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

  // Build smooth SVG path using cubic bezier curves
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

  // Build area path (smooth line + close to bottom)
  function buildAreaPath(data: number[]): string {
    const linePath = buildSmoothPath(data);
    if (!linePath) return "";
    return `${linePath} L ${xPos(data.length - 1)},${yPos(0)} L ${xPos(0)},${yPos(0)} Z`;
  }

  const linePath = buildSmoothPath(combined);
  const areaPath = buildAreaPath(combined);

  // Show ~7 x-axis labels evenly spaced
  const xLabelStep = Math.max(1, Math.floor(labels.length / 7));

  // Find the peak point for highlight
  const peakIndex = combined.indexOf(maxVal);

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {datasets.map((ds, i) => (
          <div key={ds.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TREND_COLORS[i % TREND_COLORS.length] }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">{ds.label}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label="Area chart showing asset discovery trend"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
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
                fontSize={10}
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
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Peak dot + tooltip */}
        {maxVal > 0 && (
          <g>
            <circle
              cx={xPos(peakIndex)}
              cy={yPos(combined[peakIndex])}
              r={5}
              fill="white"
              stroke="#00d0b2"
              strokeWidth={2.5}
            />
            {/* Tooltip background */}
            <rect
              x={xPos(peakIndex) - 36}
              y={yPos(combined[peakIndex]) - 28}
              width={72}
              height={20}
              rx={4}
              fill="#1E293B"
              fillOpacity={0.9}
            />
            {/* Tooltip text */}
            <text
              x={xPos(peakIndex)}
              y={yPos(combined[peakIndex]) - 14}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="white"
              fontFamily="inherit"
            >
              {formatDate(labels[peakIndex])}  {combined[peakIndex]}
            </text>
          </g>
        )}

        {/* X axis labels */}
        {labels.map((label, i) =>
          i % xLabelStep === 0 || i === labels.length - 1 ? (
            <text
              key={label}
              x={xPos(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#94A3B8"
              fontFamily="inherit"
            >
              {formatDate(label)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}