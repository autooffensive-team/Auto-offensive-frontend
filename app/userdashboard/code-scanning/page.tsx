"use client";

import { motion } from "framer-motion";
import {
  Code,
  FileCode,
  Clock,
  ExternalLink,
  RefreshCw,

} from "lucide-react";

// Placeholder icons for GitHub and GitLab logos
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const GitlabIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.955 13.057l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.93l-1.342 4.135a.454.454 0 00.321.54l5.444 2.517a.318.318 0 01.113.12V13.06a.455.455 0 00.455.458h.146zm-8.461-3.645l.363-1.12a.455.455 0 00-.267-.54l-2.93-1.357a.455.455 0 00-.539.272l-.363 1.12a.455.455 0 00.267.54l2.93 1.357a.455.455 0 00.539-.272zM12.752 9.56l-2.406-1.04a.455.455 0 00-.539.226l.254 1.264c.044.22.258.364.483.364a.455.455 0 00.4-.227l2.708-1.587zm3.22 1.587l-2.708 1.587a.455.455 0 00-.4.227.455.455 0 00-.483-.364l-.254-1.264a.455.455 0 00.539-.226l2.406 1.04a.455.455 0 00.9 0zM6.251 9.044L.538 5.873a.455.455 0 00-.538-.226L.022 6.113l-.539-.226-.539.226a.455.455 0 00.867 0L3.6 1.684a.455.455 0 00-.309-.539L.867.113a.227.227 0 00-.584.226l1.342 4.135 1.897 5.84a.455.455 0 00.809.259l7.7-3.588-2.93 6.589 1.897 5.841a.455.455 0 00.809.258l.584-1.809h1.929l.584 1.809a.455.455 0 00.809-.258l1.897-5.841-2.93-6.589 7.7 3.588a.455.455 0 00.809-.259l1.897-5.84-1.342-4.135a.227.227 0 00-.584-.226l-.539.226.539.226.867-.001a.455.455 0 00.309.539l2.34 7.206a.455.455 0 00.812.261l1.837-5.623L21.459.113a.227.227 0 00-.584-.226L.022 6.113l-.539-.226-.539.226a.455.455 0 00.867 0L9.368 15.133h6.292l4.129-12.717A.455.455 0 0019.69 1.2l-2.93 8.844h-8.509z"/>
  </svg>
);
import { useState } from "react";

const connectedRepos = [
  {
    id: 1,
    name: "web-application",
    provider: "github",
    repo: "github.com/user/web-application",
    lastScan: "2026-04-21",
    vulns: 5,
    status: "connected",
  },
  {
    id: 2,
    name: "api-service",
    provider: "gitlab",
    repo: "gitlab.com/user/api-service",
    lastScan: "2026-04-20",
    vulns: 2,
    status: "connected",
  },
];

const recentFindings = [
  {
    id: 1,
    severity: "high",
    title: "SQL Injection",
    file: "src/db/query.js",
    line: 42,
    repo: "web-application",
  },
  {
    id: 2,
    severity: "medium",
    title: "XSS Vulnerability",
    file: "src/components/Input.js",
    line: 15,
    repo: "web-application",
  },
  {
    id: 3,
    severity: "low",
    title: "Hardcoded Secret",
    file: "config/keys.js",
    line: 8,
    repo: "api-service",
  },
];

export default function CodeScanningPage() {
  const [activeTab, setActiveTab] = useState<"repos" | "findings">("repos");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
          Code Scanning
        </h1>
        <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
          Scan your code repositories for security vulnerabilities
        </p>
      </div>

      {/* Connect Providers */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center">
              <GithubIcon size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white">
                GitHub
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">
                Connect to scan your GitHub repositories
              </p>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium">
              Connect
            </button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center">
              <GitlabIcon size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                GitLab
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect to scan your GitLab repositories
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium">
              Connect
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("repos")}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition ${
            activeTab === "repos"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Connected Repositories
        </button>
        <button
          onClick={() => setActiveTab("findings")}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition ${
            activeTab === "findings"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Findings
        </button>
      </div>

      {/* Content */}
      {activeTab === "repos" ? (
        <div className="grid md:grid-cols-2 gap-4">
          {connectedRepos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Code size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {repo.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {repo.repo}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  {repo.lastScan}
                </div>
                <div className="flex items-center gap-2">
                  {repo.vulns > 0 && (
                    <span className="text-sm text-red-500 font-medium">
                      {repo.vulns} vulns
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <RefreshCw size={16} className="text-gray-500" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ExternalLink size={16} className="text-gray-500" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Finding
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Repository
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentFindings.map((finding, index) => (
                <motion.tr
                  key={finding.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        finding.severity === "high"
                          ? "bg-red-500/10 text-red-600"
                          : finding.severity === "medium"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {finding.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileCode size={14} />
                      {finding.file}:{finding.line}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {finding.repo}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
