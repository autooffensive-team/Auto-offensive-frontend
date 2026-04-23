"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Search,
  Trash2,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  File,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { MoreVertical } from "lucide-react";

type ReportFormat = "all" | "json" | "docx" | "excel" | "pdf";

interface Report {
  id: number;
  name: string;
  target: string;
  scanType: string;
  format: "json" | "docx" | "excel" | "pdf";
  status: "ready" | "generating" | "expired";
  generated: string;
  expired: string;
  size: string;
}

const reports: Report[] = [
  { id: 1, name: "Production Server Scan Report", target: "192.168.1.100", scanType: "Full Scan", format: "pdf", status: "ready", generated: "2026-04-21 14:30", expired: "2026-05-21 14:30", size: "2.4 MB" },
  { id: 2, name: "Production Server Scan Report", target: "192.168.1.100", scanType: "Full Scan", format: "json", status: "ready", generated: "2026-04-21 14:30", expired: "2026-05-21 14:30", size: "156 KB" },
  { id: 3, name: "Web Application Security Report", target: "example.com", scanType: "Web Scan", format: "docx", status: "ready", generated: "2026-04-20 10:15", expired: "2026-05-20 10:15", size: "1.8 MB" },
  { id: 4, name: "Web Application Security Report", target: "example.com", scanType: "Web Scan", format: "excel", status: "ready", generated: "2026-04-20 10:15", expired: "2026-05-20 10:15", size: "890 KB" },
  { id: 5, name: "Network Infrastructure Assessment", target: "10.0.0.0/24", scanType: "Port Scan", format: "json", status: "ready", generated: "2026-04-19 09:00", expired: "2026-05-19 09:00", size: "78 KB" },
  { id: 6, name: "API Security Audit", target: "api.example.com", scanType: "Full Scan", format: "pdf", status: "ready", generated: "2026-04-18 16:45", expired: "2026-05-18 16:45", size: "3.1 MB" },
  { id: 7, name: "API Security Audit", target: "api.example.com", scanType: "Full Scan", format: "docx", status: "expired", generated: "2026-03-18 16:45", expired: "2026-04-18 16:45", size: "2.9 MB" },
  { id: 8, name: "Quarterly Security Review Q1", target: "All Targets", scanType: "Comprehensive", format: "pdf", status: "generating", generated: "2026-03-31 12:00", expired: "2026-04-30 12:00", size: "-" },
  { id: 9, name: "Cloud Infrastructure Scan", target: "aws.example.com", scanType: "Full Scan", format: "json", status: "ready", generated: "2026-04-17 11:00", expired: "2026-05-17 11:00", size: "234 KB" },
  { id: 10, name: "Cloud Infrastructure Scan", target: "aws.example.com", scanType: "Full Scan", format: "excel", status: "ready", generated: "2026-04-17 11:00", expired: "2026-05-17 11:00", size: "1.2 MB" },
  { id: 11, name: "Database Security Check", target: "db.example.com", scanType: "Full Scan", format: "pdf", status: "ready", generated: "2026-04-16 15:30", expired: "2026-05-16 15:30", size: "4.5 MB" },
  { id: 12, name: "Mobile App Security", target: "mobile.example.com", scanType: "Web Scan", format: "docx", status: "ready", generated: "2026-04-15 09:45", expired: "2026-05-15 09:45", size: "2.1 MB" },
];

const formatTabs: { id: ReportFormat; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "all", label: "All", icon: FileText },
  { id: "json", label: "JSON", icon: FileJson },
  { id: "docx", label: "DOCX", icon: FilePlus },
  { id: "excel", label: "Excel", icon: FileSpreadsheet },
  { id: "pdf", label: "PDF", icon: File },
];

const formatColors: Record<string, string> = {
  json: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  docx: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  excel: "bg-green-500/10 text-green-600 dark:text-green-400",
  pdf: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  ready: { bg: "bg-green-500/10", text: "text-green-500" },
  generating: { bg: "bg-blue-500/10", text: "text-blue-500" },
  expired: { bg: "bg-gray-500/10", text: "text-gray-500" },
};

const ITEMS_PER_PAGE = 5;

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ReportFormat>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) || report.target.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" || report.format === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleTabChange = (tab: ReportFormat) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const formatCounts = {
    all: reports.length,
    json: reports.filter((r) => r.format === "json").length,
    docx: reports.filter((r) => r.format === "docx").length,
    excel: reports.filter((r) => r.format === "excel").length,
    pdf: reports.filter((r) => r.format === "pdf").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">Generate and download security scan reports in multiple formats</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-[15px] font-semibold rounded-xl transition shadow-lg shadow-teal-500/20 shrink-0">
          <FilePlus size={18} />
          Generate Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center"><FileText size={22} className="text-teal-500" /></div>
            <div><p className="text-[24px] font-bold text-gray-900 dark:text-white">{reports.length}</p><p className="text-[13px] text-gray-500 dark:text-gray-400">Total Reports</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center"><FileText size={22} className="text-green-500" /></div>
            <div><p className="text-[24px] font-bold text-green-500">{reports.filter((r) => r.status === "ready").length}</p><p className="text-[13px] text-gray-500 dark:text-gray-400">Ready</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center"><RefreshCw size={22} className="text-blue-500" /></div>
            <div><p className="text-[24px] font-bold text-blue-500">{reports.filter((r) => r.status === "generating").length}</p><p className="text-[13px] text-gray-500 dark:text-gray-400">Generating</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gray-500/10 flex items-center justify-center"><FileText size={22} className="text-gray-500" /></div>
            <div><p className="text-[24px] font-bold text-gray-500">{reports.filter((r) => r.status === "expired").length}</p><p className="text-[13px] text-gray-500 dark:text-gray-400">Expired</p></div>
          </div>
        </div>
      </div>

      {/* Format Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {formatTabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium transition whitespace-nowrap ${activeTab === tab.id ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <tab.icon size={18} /><span>{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[12px] ${activeTab === tab.id ? "bg-teal-500/20" : "bg-gray-200 dark:bg-gray-700"}`}>{formatCounts[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-3.5 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Report Name</th>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Format</th>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Generated</th>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Expired</th>
                <th className="px-6 py-4 text-left text-[15px] font-semibold text-gray-600 dark:text-gray-400">Size</th>
                <th className="px-6 py-4 text-right text-[15px] font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedReports.map((report, index) => (
                <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center"><FileText size={20} className="text-teal-500" /></div>
                      <div><p className="text-[15px] font-semibold text-gray-900 dark:text-white">{report.name}</p><p className="text-[13px] text-gray-500 dark:text-gray-400">{report.target} • {report.scanType}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium uppercase ${formatColors[report.format]}`}>{report.format}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${statusColors[report.status].bg} ${statusColors[report.status].text}`}>{report.status === "ready" ? "Ready" : report.status === "generating" ? "Generating" : "Expired"}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-400"><Calendar size={14} />{report.generated}</div></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-400"><Calendar size={14} />{report.expired}</div></td>
                  <td className="px-6 py-4 text-[14px] text-gray-600 dark:text-gray-400">{report.size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
<div className="relative">
                         <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                           <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
                         </motion.button>
                         <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                           <div className="py-1">
                             <motion.button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                               whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                               title="View"
                               disabled={report.status === "generating"}>
                               <Eye size={16} />
                               View
                             </motion.button>
                             <motion.button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                               whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                               title="Download"
                               disabled={report.status !== "ready"}>
                               <Download size={16} className={report.status === "ready" ? "text-teal-500" : "text-gray-300"} />
                               Download
                             </motion.button>
                             <motion.button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                               whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                               title="Delete">
                               <Trash2 size={16} />
                               Delete
                             </motion.button>
                           </div>
                         </div>
                       </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[14px] text-gray-500 dark:text-gray-400">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length} reports</p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronsLeft size={16} className="text-gray-600 dark:text-gray-400" /></button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded-xl text-[14px] font-medium transition ${currentPage === page ? "bg-teal-500 text-white" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{page}</button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={16} className="text-gray-600 dark:text-gray-400" /></button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronsRight size={16} className="text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>
        )}

        {filteredReports.length === 0 && (
          <div className="p-14 text-center">
            <FileText size={56} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-[16px] text-gray-500 dark:text-gray-400">No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}
