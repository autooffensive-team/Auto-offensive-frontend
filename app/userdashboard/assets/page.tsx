"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Server,
  Monitor,
  Smartphone,
  Router,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
} from "lucide-react";
import { useState, useMemo } from "react";

const assets = [
  { id: 1, type: "web", ip: "192.168.1.100", hostname: "web-01.example.com", os: "Ubuntu 22.04", ports: 8, services: ["nginx", "php-fpm", "mysql"], lastScan: "2026-04-21" },
  { id: 2, type: "server", ip: "192.168.1.101", hostname: "db-01.example.com", os: "Ubuntu 20.04", ports: 4, services: ["mysql", "redis"], lastScan: "2026-04-21" },
  { id: 3, type: "web", ip: "10.0.0.50", hostname: "api.example.com", os: "Alpine Linux", ports: 6, services: ["nginx", "nodejs"], lastScan: "2026-04-20" },
  { id: 4, type: "router", ip: "192.168.1.1", hostname: "router-main", os: "Custom Firmware", ports: 3, services: ["ssh", "http"], lastScan: "2026-04-19" },
  { id: 5, type: "web", ip: "172.16.0.20", hostname: "mail.example.com", os: "CentOS 8", ports: 12, services: ["postfix", "dovecot"], lastScan: "2026-04-18" },
  { id: 6, type: "server", ip: "192.168.1.102", hostname: "app-01.example.com", os: "Debian 11", ports: 5, services: ["docker", "postgres"], lastScan: "2026-04-17" },
  { id: 7, type: "web", ip: "10.0.0.51", hostname: "cdn.example.com", os: "Ubuntu 22.04", ports: 4, services: ["nginx", " varnish"], lastScan: "2026-04-16" },
  { id: 8, type: "workstation", ip: "192.168.1.50", hostname: "workstation-01", os: "Windows 11", ports: 2, services: ["rdp", "ssh"], lastScan: "2026-04-15" },
  { id: 9, type: "mobile", ip: "192.168.1.60", hostname: "mobile-device-01", os: "Android 13", ports: 1, services: ["adb"], lastScan: "2026-04-14" },
  { id: 10, type: "web", ip: "172.16.0.21", hostname: "blog.example.com", os: "Ubuntu 22.04", ports: 7, services: ["nginx", "wordpress"], lastScan: "2026-04-13" },
  { id: 11, type: "server", ip: "192.168.1.103", hostname: "cache-01.example.com", os: "Ubuntu 20.04", ports: 3, services: ["redis", "memcached"], lastScan: "2026-04-12" },
  { id: 12, type: "web", ip: "10.0.0.52", hostname: "shop.example.com", os: "Alpine Linux", ports: 9, services: ["nginx", "php", "mysql"], lastScan: "2026-04-11" },
];

const typeIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  web: Globe,
  server: Server,
  router: Router,
  workstation: Monitor,
  mobile: Smartphone,
};

const ITEMS_PER_PAGE = 5;

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.ip.includes(searchTerm) ||
        asset.hostname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || asset.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-bold text-gray-900 dark:text-white leading-tight">Assets</h1>
          <p className="text-[18px] text-gray-500 dark:text-gray-400 mt-2">Manage and view your discovered assets</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 bg-teal-500 hover:bg-teal-600 text-white px-6 py-4 text-[16px] font-semibold rounded-xl shrink-0 shadow-lg">
          <Plus size={20} />
          Add Asset
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by IP or hostname..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-14 pr-5 py-4 text-[16px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-5 py-4 text-[16px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-48 shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="web">Web Servers</option>
            <option value="server">Servers</option>
            <option value="router">Routers</option>
            <option value="workstation">Workstations</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[32px] font-bold text-gray-900 dark:text-white leading-none">{assets.length}</p>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium mt-2">Total Assets</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[32px] font-bold text-blue-500 leading-none">{assets.filter(a => a.type === "web").length}</p>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium mt-2">Web Servers</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[32px] font-bold text-purple-500 leading-none">{assets.filter(a => a.type === "server").length}</p>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium mt-2">Servers</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[32px] font-bold text-orange-500 leading-none">{assets.filter(a => a.type === "router").length}</p>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium mt-2">Network Devices</p>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">Asset</th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">IP Address</th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">OS</th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">Ports</th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">Services</th>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-gray-700 dark:text-gray-300">Last Scan</th>
                <th className="px-4 py-3 text-right text-[16px] font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedAssets.map((asset, index) => {
                const TypeIcon = (typeIcons[asset.type] || Server) as React.ComponentType<{ size?: number; className?: string }>;
                return (
                  <motion.tr key={asset.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                          <TypeIcon size={22} className="text-teal-500" />
                        </div>
                        <span className="text-[16px] font-semibold text-gray-900 dark:text-white">{asset.hostname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[16px] text-gray-600 dark:text-gray-400 font-medium">{asset.ip}</td>
                    <td className="px-4 py-3 text-[16px] text-gray-600 dark:text-gray-400 font-medium">{asset.os}</td>
                    <td className="px-4 py-3 text-[16px] text-gray-600 dark:text-gray-400 font-medium">{asset.ports}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {asset.services.slice(0, 3).map((service) => (
                          <span key={service} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[14px] text-gray-600 dark:text-gray-400 font-medium">{service}</span>
                        ))}
                        {asset.services.length > 3 && (
                          <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[14px] text-gray-600 dark:text-gray-400 font-medium">+{asset.services.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[16px] text-gray-500 dark:text-gray-400 font-medium">{asset.lastScan}</td>
                    <td className="px-4 py-3">
                        <div className="relative group">
                          <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <MoreVertical size={18} className="text-gray-500 dark:text-gray-400" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible z-10">
                            <div className="py-2">
                              <button className="flex items-center gap-3 px-4 py-3 text-[16px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left rounded-lg mx-1">
                                <Eye size={18} />
                                View
                              </button>
                              <button className="flex items-center gap-3 px-4 py-3 text-[16px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left rounded-lg mx-1">
                                <Edit size={18} />
                                Edit
                              </button>
                              <button className="flex items-center gap-3 px-4 py-3 text-[16px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left rounded-lg mx-1">
                                <Trash2 size={18} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[16px] text-gray-500 dark:text-gray-400 font-medium">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssets.length)} of {filteredAssets.length} assets
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronsLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`w-11 h-11 rounded-xl text-[16px] font-semibold transition-colors ${currentPage === page ? "bg-teal-500 text-white shadow-lg" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronsRight size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
