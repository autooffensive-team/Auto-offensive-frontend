"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import TargetsTable from "@/components/assets/TargetsTable";

export default function AssetsPage() {
  const router = useRouter();

  const handleRowClick = (targetId: string, _projectId: string) => {
    router.push(`/userdashboard/assets/${targetId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-2"
      >
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            Assets
          </h1>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            View and manage your discovered targets across all projects
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 text-xs sm:text-xs md:text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
            <Globe size={14} className="text-teal-500" />
            Targets
          </span>
        </div>
      </motion.div>

      {/* Targets Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <TargetsTable onRowClick={handleRowClick} />
      </motion.div>

      </div>
    </div>
  );
}
