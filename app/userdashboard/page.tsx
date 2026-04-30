"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Clock3,
  Cpu,
  Database,
  Globe,
  Lock,
  Network,
  Radar,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";

const scannedAssetMetrics = [
  {
    label: "IP Addresses",
    value: 24,
    note: "4 newly discovered",
    icon: Globe,
    iconColor: "text-cyan-500",
    accent: "from-cyan-400/20 to-sky-500/10",
  },
  {
    label: "Hostnames",
    value: 18,
    note: "12 mapped to services",
    icon: Server,
    iconColor: "text-blue-500",
    accent: "from-blue-400/20 to-indigo-500/10",
  },
  {
    label: "Open Ports",
    value: 156,
    note: "22 internet-facing",
    icon: Lock,
    iconColor: "text-rose-500",
    accent: "from-rose-400/20 to-orange-500/10",
  },
  {
    label: "Protocols",
    value: 8,
    note: "HTTP, HTTPS, SSH, DNS",
    icon: Waypoints,
    iconColor: "text-violet-500",
    accent: "from-violet-400/20 to-fuchsia-500/10",
  },
  {
    label: "Services",
    value: 42,
    note: "Nginx, MySQL, Redis",
    icon: Database,
    iconColor: "text-emerald-500",
    accent: "from-emerald-400/20 to-teal-500/10",
  },
  {
    label: "Technologies",
    value: 12,
    note: "React, Node.js, PHP",
    icon: Cpu,
    iconColor: "text-amber-500",
    accent: "from-amber-400/20 to-yellow-500/10",
  },
];

const vulnerabilityData = [
  {
    label: "Critical",
    count: 3,
    trend: "+1 this week",
    color: "bg-rose-500",
    textColor: "text-rose-500",
  },
  {
    label: "High",
    count: 7,
    trend: "2 need triage",
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  {
    label: "Medium",
    count: 15,
    trend: "8 verified",
    color: "bg-amber-500",
    textColor: "text-amber-500",
  },
  {
    label: "Low",
    count: 22,
    trend: "Mostly informational",
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
  },
];

const scanActivity = [
  {
    target: "api.example.com",
    type: "Web Scan",
    status: "Completed",
    findings: 5,
    time: "2 min ago",
    icon: ShieldCheck,
    tone: "text-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    target: "192.168.1.1",
    type: "Port Scan",
    status: "Completed",
    findings: 3,
    time: "15 min ago",
    icon: Radar,
    tone: "text-cyan-500",
    chip: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    target: "mail.example.net",
    type: "Network Scan",
    status: "Running",
    findings: 0,
    time: "Live now",
    icon: Activity,
    tone: "text-violet-500",
    chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    target: "admin.example.com",
    type: "Technology Fingerprint",
    status: "Completed",
    findings: 8,
    time: "1 hour ago",
    icon: ShieldAlert,
    tone: "text-rose-500",
    chip: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
];

const lastScans = [
  {
    target: "example.com",
    assets: "6 hosts",
    started: "2026-04-22 14:30",
    duration: "5m 32s",
    ports: 38,
    vulnerabilities: 5,
    status: "Completed",
  },
  {
    target: "192.168.1.1",
    assets: "1 device",
    started: "2026-04-22 14:15",
    duration: "3m 18s",
    ports: 12,
    vulnerabilities: 3,
    status: "Completed",
  },
  {
    target: "api.example.org",
    assets: "3 hosts",
    started: "2026-04-22 13:45",
    duration: "8m 45s",
    ports: 27,
    vulnerabilities: 7,
    status: "Completed",
  },
  {
    target: "mail.example.net",
    assets: "2 hosts",
    started: "2026-04-22 13:12",
    duration: "Running",
    ports: 14,
    vulnerabilities: 1,
    status: "Running",
  },
];

export default function UserDashboardPage() {
  const { data } = useGetAuthMeQuery();
  const totalFindings = vulnerabilityData.reduce((sum, item) => sum + item.count, 0);
  const highestSeverity = Math.max(...vulnerabilityData.map((item) => item.count));
  const displayName = data?.user.alias_name.trim() || data?.user.username || "there";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20 md:p-8">
        <div className="">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
              <Sparkles size={14} />
              Overview
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Welcome back, {displayName}
              </p>
              <h2 className="display-font max-w-5xl text-3xl font-semibold leading-tight text-slate-950 dark:text-white md:text-5xl">
                Scanned asset visibility, vulnerability posture, and live scan status.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                See how many IPs, hostnames, ports, protocols, services, and
                technologies have already been discovered, then drill into the
                latest vulnerabilities and scan activity.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {scannedAssetMetrics.map((metric, index) => (
                <MetricCard key={metric.label} metric={metric} index={index} />
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                Vulnerability Graph
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Severity distribution from completed scans
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
              {totalFindings} total findings
            </div>
          </div>

          <div className="space-y-5">
            {vulnerabilityData.map((item) => (
              <SeverityBar
                key={item.label}
                label={item.label}
                count={item.count}
                max={highestSeverity}
                trend={item.trend}
                color={item.color}
                textColor={item.textColor}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {vulnerabilityData.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-black/6 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className={`text-3xl font-semibold ${item.textColor}`}>{item.count}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                Scan Activity
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recent scan execution and live progress
              </p>
            </div>
            <Activity className="text-slate-400" size={18} />
          </div>

          <div className="space-y-3">
            {scanActivity.map((scan, index) => (
              <motion.div
                key={`${scan.target}-${scan.type}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[1.5rem] border border-black/6 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl bg-slate-100 p-3 dark:bg-white/10 ${scan.tone}`}>
                      <scan.icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {scan.target}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {scan.type}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {scan.time}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${scan.chip}`}>
                    {scan.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[1.1rem] bg-slate-100/80 px-4 py-3 text-sm dark:bg-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Findings detected</span>
                  <span className="font-semibold text-slate-950 dark:text-white">
                    {scan.findings}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/6 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
              Last Scans
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Most recent scan history with ports and vulnerability counts
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Clock3 size={16} />
            Updated 2 minutes ago
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-slate-500 dark:text-slate-400">
                <th className="px-4">Target</th>
                <th className="px-4">Assets</th>
                <th className="px-4">Started</th>
                <th className="px-4">Duration</th>
                <th className="px-4">Open Ports</th>
                <th className="px-4">Vulnerabilities</th>
                <th className="px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {lastScans.map((scan) => (
                <tr
                  key={`${scan.target}-${scan.started}`}
                  className="bg-white shadow-sm outline  outline-black/6 dark:bg-white/5 dark:outline-white/10"
                >
                  <td className="rounded-l-[1.4rem] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        <Network size={18} />
                      </div>
                      <span className="font-semibold text-slate-950 dark:text-white">
                        {scan.target}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {scan.assets}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {scan.started}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {scan.duration}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                    {scan.ports}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-950 dark:text-white">
                    {scan.vulnerabilities}
                  </td>
                  <td className="rounded-r-[1.4rem] px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        scan.status === "Completed"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  metric,
  index,
}: {
  metric: {
    label: string;
    value: number;
    note: string;
    icon: LucideIcon;
    iconColor: string;
    accent: string;
  };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-[1.6rem] border border-black/6 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {metric.value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${metric.accent}`}
        >
          <metric.icon size={22} className={metric.iconColor} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {metric.note}
      </p>
    </motion.div>
  );
}

function SeverityBar({
  label,
  count,
  max,
  trend,
  color,
  textColor,
}: {
  label: string;
  count: number;
  max: number;
  trend: string;
  color: string;
  textColor: string;
}) {
  const width = max === 0 ? 0 : (count / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{label}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{trend}</p>
        </div>
        <span className={`text-xl font-semibold ${textColor}`}>{count}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
