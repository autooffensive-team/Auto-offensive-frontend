"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Download,
  ExternalLink,
  Clock,
  Target,
  Server,
  Globe,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const findings = [
  {
    id: 1,
    severity: "critical",
    title: "SQL Injection in Login Form",
    description: "User input directly used in SQL query without parameterization",
    target: "192.168.1.100",
    type: "Network",
    cve: "CVE-2024-1234",
    discovered: "2026-04-21",
    status: "open",
  },
  {
    id: 2,
    severity: "high",
    title: "Remote Code Execution via File Upload",
    description: "Uploaded files can be executed on the server",
    target: "example.com",
    type: "Web",
    cve: "CVE-2024-5678",
    discovered: "2026-04-20",
    status: "open",
  },
  {
    id: 3,
    severity: "medium",
    title: "Cross-Site Scripting (XSS)",
    description: "Reflected XSS in search parameter",
    target: "api.example.com",
    type: "Web",
    cve: null,
    discovered: "2026-04-19",
    status: "in_progress",
  },
  {
    id: 4,
    severity: "low",
    title: "Information Disclosure",
    description: "Server version exposed in headers",
    target: "192.168.1.101",
    type: "Network",
    cve: null,
    discovered: "2026-04-18",
    status: "fixed",
  },
  {
    id: 5,
    severity: "high",
    title: "Weak SSH Cipher",
    description: "SSH server allows weak ciphers",
    target: "192.168.1.1",
    type: "Network",
    cve: null,
    discovered: "2026-04-17",
    status: "open",
  },
];

interface Config {
  icon?: React.ComponentType<{ size?: number }>;
  color: string;
  bg?: string;
  label: string;
}

const severityConfig: Record<string, Config> = {
  critical: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", label: "Critical" },
  high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", label: "High" },
  medium: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medium" },
  low: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "Low" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-red-500" },
  in_progress: { label: "In Progress", color: "text-yellow-500" },
  fixed: { label: "Fixed", color: "text-green-500" },
};

export default function FindingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredFindings = findings.filter((finding) => {
    const matchesSearch =
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === "all" || finding.severity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
            Findings
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
            View and manage discovered vulnerabilities
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 text-[15px] font-semibold rounded-xl"
        >
          <Download size={18} />
          Export
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-[24px] font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">Total Findings</p>
        </div>
        {Object.entries(severityConfig).map(([key, config]) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800"
          >
            <p className={`text-[24px] font-bold ${config.color}`}>
              {stats[key as keyof typeof stats]}
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding, index) => {
          const severity = severityConfig[finding.severity];
          const status = statusConfig[finding.status];
          const SeverityIcon = severity.icon as React.ComponentType<{ size?: number; className?: string }> | undefined;

          return (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${severity.bg} flex items-center justify-center`}
                  >
                    {SeverityIcon && <SeverityIcon size={24} className={severity.color} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {finding.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {finding.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Server size={14} />
                  {finding.target}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Globe size={14} />
                  {finding.type}
                </div>
                {finding.cve && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Target size={14} />
                    {finding.cve}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  {finding.discovered}
                </div>
                <div className="flex-1" />
                {finding.status === "open" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-600 text-sm font-medium hover:bg-teal-500/20"
                  >
                    <Wrench size={14} />
                    Mark Fixed
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <ExternalLink size={14} />
                  Details
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
