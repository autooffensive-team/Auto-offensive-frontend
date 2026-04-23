"use client";

import { motion } from "framer-motion";
import {
  FolderGit2,
  Plus,
  GitBranch,
  GitFork,
  Clock,
  Search,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const importedProjects = [
  {
    id: 1,
    name: "web-application",
    repo: "github.com/user/web-application",
    provider: "github",
    lastScan: "2026-04-21",
    vulnerabilities: 5,
    status: "scanned",
  },
  {
    id: 2,
    name: "api-service",
    repo: "gitlab.com/user/api-service",
    provider: "gitlab",
    lastScan: "2026-04-20",
    vulnerabilities: 2,
    status: "scanned",
  },
  {
    id: 3,
    name: "mobile-app",
    repo: "github.com/user/mobile-app",
    provider: "github",
    lastScan: "2026-04-19",
    vulnerabilities: 0,
    status: "scanned",
  },
  {
    id: 4,
    name: "frontend-dashboard",
    repo: "github.com/org/frontend-dashboard",
    provider: "github",
    lastScan: null,
    vulnerabilities: 0,
    status: "pending",
  },
];

export default function ProjectsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = importedProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
            Manage your imported repositories for code scanning
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 text-[15px] font-semibold rounded-xl"
        >
          <Plus size={18} />
          Add Project
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <p className="text-[24px] font-bold text-gray-900 dark:text-white">
            {importedProjects.length}
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">Total Projects</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-teal-500">
            {importedProjects.filter((p) => p.status === "scanned").length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scanned</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-orange-500">
            {importedProjects.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Scan</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-red-500">
            {importedProjects.reduce((acc, p) => acc + p.vulnerabilities, 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vulnerabilities</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-teal-500 dark:hover:border-teal-500 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FolderGit2
                    size={24}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.repo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                <GitBranch size={14} className="text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  main
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === "scanned"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-yellow-500/10 text-yellow-600"
                }`}
              >
                {project.status === "scanned" ? "Scanned" : "Pending"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {project.provider}
              </span>
              {project.vulnerabilities > 0 && (
                <span className="text-sm text-red-500 font-medium">
                  {project.vulnerabilities} vulns
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                {project.lastScan || "Not scanned"}
              </div>
              <div className="flex items-center gap-2">
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
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} className="text-red-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Add New Project
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository Provider
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-teal-500 transition">
                    <GitBranch size={24} />
                    GitHub
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-orange-500 transition">
                    <GitFork size={24} />
                    GitLab
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repository URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium">
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
