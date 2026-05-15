"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useGetProjectsQuery } from "@/lib/redux/services/userdashboard/project/project-api";
import { assetsApi } from "@/lib/redux/services/userdashboard/assets/assets-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import type { Target } from "@/types/assets";
import Breadcrumb from "@/components/assets/Breadcrumb";
import ScanJobsTable from "@/components/assets/ScanJobsTable";
import ScanJobsTableSkeleton from "@/components/assets/ScanJobsTableSkeleton";

export default function TargetScanJobsPage() {
  const params = useParams<{ targetId: string }>();
  const targetId = params.targetId;
  const dispatch = useAppDispatch();

  const [target, setTarget] = useState<Target | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [isLoadingTarget, setIsLoadingTarget] = useState(true);
  const [isTargetError, setIsTargetError] = useState(false);

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useGetProjectsQuery();

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p.project_id),
    [projects],
  );

  // Fetch targets for all projects and find the one matching targetId
  useEffect(() => {
    if (projectIds.length === 0 || projectsLoading) return;

    let cancelled = false;
    setIsLoadingTarget(true);
    setIsTargetError(false);

    Promise.all(
      projectIds.map((id) =>
        dispatch(assetsApi.endpoints.listTargets.initiate(id)).unwrap(),
      ),
    )
      .then((results) => {
        if (cancelled) return;

        const allTargets = results.flat();
        const found = allTargets.find((t) => t.target_id === targetId);

        if (found) {
          setTarget(found);
          const project = projects?.find(
            (p) => p.project_id === found.project_id,
          );
          setProjectName(project?.name ?? "Unknown Project");
        } else {
          setIsTargetError(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsTargetError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingTarget(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, projectIds, projectsLoading, targetId, projects]);

  const isLoading = projectsLoading || isLoadingTarget;
  const isError = projectsError || isTargetError;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <ScanJobsTableSkeleton />
      </div>
    );
  }

  // Error state
  if (isError || !target) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          segments={[
            { label: "Assets", href: "/userdashboard/assets" },
            { label: "Unknown Target" },
          ]}
        />
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
            {isTargetError && !projectsError
              ? "Target not found. It may have been deleted or you don't have access."
              : "Failed to load target details. Please try again."}
          </p>
          <button
            onClick={() => refetchProjects()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-7 lg:py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6"
        >
          {/* Breadcrumb */}
          <Breadcrumb
            segments={[
              { label: "Assets", href: "/userdashboard/assets" },
              { label: target.name },
            ]}
          />

          {/* Header row: title left + back button right */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {target.name}
              </h1>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Project: <span className="font-medium text-slate-700 dark:text-slate-300">{projectName}</span>
              </p>
            </div>

            <Link
              href="/userdashboard/assets"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm self-end sm:self-auto shrink-0 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Assets</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          {/* Scan Jobs Table */}
          <ScanJobsTable targetId={targetId} targetName={target.name} />
        </motion.div>
      </div>
    </div>
  );
}
