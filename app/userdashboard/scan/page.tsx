"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Play,
  Settings,
  Globe,
  Network,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  FolderSearch,
  Shield,
  Bug,
  Lock,
  Eye,
  Link,
  Globe2,
  Ghost,
  Search as GobusterIcon,
  Map,
  FileSearch,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const scanModules = [
  { id: "subfinder", name: "Subfinder", description: "Subdomains enumeration", icon: Search },
  { id: "naabu", name: "Naabu", description: "Scan open ports, integrate with nmap", icon: Network },
  { id: "nmap", name: "Nmap", description: "Port scan with service & OS detection", icon: Map },
  { id: "nuclei", name: "Nuclei", description: "Scan vulnerabilities & misconfigurations", icon: Bug },
  { id: "fuzzer", name: "URL Fuzzer", description: "Directory & content discovery", icon: FolderSearch },
  { id: "wpscan", name: "WPScan", description: "WordPress Scanner", icon: Shield },
  { id: "sqli", name: "SQLi", description: "Automate SQL Injection", icon: Lock },
  { id: "xss", name: "XSS Strike", description: "Automate XSS attack", icon: Eye },
  { id: "kiterunner", name: "Kiterunner", description: "Discover API endpoints", icon: Link },
  { id: "httpx", name: "Httpx", description: "Extract HTTP info, status, title, tech", icon: Globe2 },
  { id: "katana", name: "Katana", description: "Web crawler", icon: Ghost },
  { id: "gobuster", name: "Gobuster", description: "Directory/file enumeration", icon: GobusterIcon },
  { id: "amass", name: "Amass", description: "Network mapping & subdomain enum", icon: Map },
  { id: "assetfinder", name: "Assetfinder", description: "Find related domains & subdomains", icon: FileSearch },
];

const scanTypes = [
  {
    id: "full",
    name: "Full Scan",
    description: "Comprehensive scan of all services and vulnerabilities",
    duration: "30-60 min",
    icon: Zap,
  },
  {
    id: "quick",
    name: "Quick Scan",
    description: "Fast scan for common vulnerabilities",
    duration: "5-10 min",
    icon: Target,
  },
  {
    id: "port",
    name: "Port Scan",
    description: "Discover open ports and services",
    duration: "5-15 min",
    icon: Network,
  },
  {
    id: "web",
    name: "Web Scan",
    description: "Scan web applications for OWASP vulnerabilities",
    duration: "15-30 min",
    icon: Globe,
  },
];

const recentScans = [
  {
    id: 1,
    name: "Production Server",
    target: "192.168.1.100",
    type: "full",
    status: "completed",
    date: "2026-04-21",
    vulns: 12,
  },
  {
    id: 2,
    name: "Web Application",
    target: "example.com",
    type: "web",
    status: "completed",
    date: "2026-04-21",
    vulns: 8,
  },
  {
    id: 3,
    name: "Network Assessment",
    target: "10.0.0.0/24",
    type: "port",
    status: "running",
    date: "2026-04-21",
    vulns: 0,
  },
];

export default function ScanPage() {
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedType, setSelectedType] = useState("full");
  const [selectedModules, setSelectedModules] = useState<string[]>(scanModules.map(m => m.id));
  const [isScanning, setIsScanning] = useState(false);
  const [showModules, setShowModules] = useState(false);

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModules.length === scanModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(scanModules.map(m => m.id));
    }
  };

  const handleStartScan = () => {
    if (selectedTarget) {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
            New Scan
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
            Initiate security scans on your targets
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Target & Scan Type */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Input */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white mb-6">
              Target Configuration
            </h2>

            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target
              </label>
              <div className="relative">
                <Globe
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  placeholder="IP address, hostname, domain, or URL (e.g., example.com, 192.168.1.1)"
                  className="w-full pl-10 pr-4 py-3 text-[15px] rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2">
                Enter IP addresses, CIDR ranges, domains, or URLs
              </p>
            </div>

            {/* Scan Type */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-700 dark:text-gray-300 mb-3">
                Scan Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {scanTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      selectedType === type.id
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <type.icon
                      size={24}
                      className={
                        selectedType === type.id
                          ? "text-teal-600"
                          : "text-gray-500"
                      }
                    />
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-white mt-2">
                      {type.name}
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">
                      {type.description}
                    </p>
                    <p className="text-[12px] text-teal-500 mt-1">
                      {type.duration}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Scan Modules */}
            <div className="mb-6">
              <button
                onClick={() => setShowModules(!showModules)}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-gray-500" />
                  <div className="text-left">
                    <p className="text-[15px] font-medium text-gray-900 dark:text-white">
                      Scan Modules
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">
                      {selectedModules.length} of {scanModules.length} tools selected
                    </p>
                  </div>
                </div>
                {showModules ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>

              {showModules && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[14px] font-medium text-gray-700 dark:text-gray-300">
                      Supported scan modules
                    </p>
                    <button
                      onClick={handleSelectAll}
                      className="text-[13px] text-teal-500 hover:text-teal-600 font-medium"
                    >
                      {selectedModules.length === scanModules.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scanModules.map((module) => (
                      <label
                        key={module.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          selectedModules.includes(module.id)
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module.id)}
                          onChange={() => handleModuleToggle(module.id)}
                          className="mt-1 w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <module.icon size={16} className="text-gray-500" />
                            <span className="text-[14px] font-medium text-gray-900 dark:text-white">
                              {module.name}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {module.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartScan}
              disabled={!selectedTarget || isScanning}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-4 py-4 text-[16px] font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
            >
              {isScanning ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Scanning in progress...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Start Scan
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Right Column - Recent Scans */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white mb-6">
              Recent Scans
            </h2>

            <div className="space-y-4">
              {recentScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        scan.status === "running"
                          ? "bg-blue-500/10"
                          : scan.status === "completed"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                      }`}
                    >
                      {scan.status === "running" ? (
                        <Loader2 className="text-blue-500 animate-spin" size={20} />
                      ) : scan.status === "completed" ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                        {scan.name}
                      </p>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400">
                        {scan.target}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[13px] font-medium ${
                        scan.status === "running"
                          ? "text-blue-500"
                          : scan.status === "completed"
                            ? "text-green-500"
                            : "text-red-500"
                      }`}
                    >
                      {scan.status === "running" ? "Running" : "Completed"}
                    </span>
                    {scan.vulns > 0 && (
                      <p className="text-[13px] text-gray-500 dark:text-gray-400">
                        {scan.vulns} vulns
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
              View All Scans
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white mb-4">
              Today&apos;s Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-[14px] text-gray-600 dark:text-gray-400">Scans Completed</span>
                <span className="text-[16px] font-bold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-[14px] text-gray-600 dark:text-gray-400">Vulnerabilities Found</span>
                <span className="text-[16px] font-bold text-red-500">47</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-[14px] text-gray-600 dark:text-gray-400">Targets Scanned</span>
                <span className="text-[16px] font-bold text-teal-500">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
