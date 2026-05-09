"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
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
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { label: "Assets", href: "/userdashboard/assets" },
          { label: target.name },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-[36px] font-bold text-gray-900 dark:text-white leading-tight">
          {target.name}
        </h1>
        <p className="text-[18px] text-gray-500 dark:text-gray-400 mt-2">
          Project: {projectName}
        </p>
      </div>

      {/* Scan Jobs Table */}
      <ScanJobsTable targetId={targetId} targetName={target.name} />
    </motion.div>
  );
}
