"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, FileSearch, RefreshCw } from "lucide-react";
import Link from "next/link";
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-7 lg:py-6 space-y-4">
          <Breadcrumb segments={breadcrumbSegments} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-red-200 dark:border-red-800/50 p-6 sm:p-8 flex flex-col items-center gap-3"
          >
            <AlertCircle size={28} className="text-red-500" />
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400 font-medium text-center">
              Failed to load job details. Please try again.
            </p>
            <button
              onClick={() => refetchJob()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-7 lg:py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
        >
          {/* Breadcrumb */}
          <motion.div variants={itemVariants}>
            <Breadcrumb segments={breadcrumbSegments} />
          </motion.div>

          {/* Header row: title + back button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 sm:p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 shrink-0">
                  <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    Job {jobId.slice(0, 8)}
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Scan results for <span className="font-medium text-slate-700 dark:text-slate-300">{targetName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Back button - right aligned */}
            <Link
              href={`/userdashboard/assets/${targetId}`}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm self-start sm:self-auto shrink-0 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Target</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </motion.div>

          {/* Scan Results */}
          <motion.div variants={itemVariants}>
            <ScanResultsView jobId={jobId} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
