"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useGetJobDetailsQuery } from "@/lib/redux/services/userdashboard/assets/assets-api";
import Breadcrumb from "@/components/assets/Breadcrumb";
import ScanResultsView from "@/components/assets/ScanResultsView";

type PageProps = {
  params: Promise<{ targetId: string; jobId: string }>;
};

export default function ScanResultsPage({ params }: PageProps) {
  const { targetId, jobId } = use(params);

  const {
    data: jobDetails,
    isLoading: isLoadingJob,
    isError: isErrorJob,
    refetch: refetchJob,
  } = useGetJobDetailsQuery(jobId);

  const targetName = isLoadingJob
    ? "Loading..."
    : jobDetails?.target_name ?? "Unknown";

  const breadcrumbSegments = [
    { label: "Assets", href: "/userdashboard/assets" },
    { label: targetName, href: `/userdashboard/assets/${targetId}` },
    { label: `Job ${jobId.slice(0, 8)}` },
  ];

  if (isErrorJob) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-4"
      >
        <Breadcrumb segments={breadcrumbSegments} />
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 p-6 flex flex-col items-center gap-3">
          <AlertCircle size={28} className="text-red-500" />
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
            Failed to load job details. Please try again.
          </p>
          <button
            onClick={() => refetchJob()}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      <Breadcrumb segments={breadcrumbSegments} />

      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
          Job {jobId.slice(0, 8)}
        </h1>
        <p className="text-xs sm:text-sm md:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-2">
          Scan results for {targetName}
        </p>
      </div>

      <ScanResultsView jobId={jobId} />
    </motion.div>
  );
}
