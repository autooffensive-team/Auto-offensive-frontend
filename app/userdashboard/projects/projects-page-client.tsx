"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Pencil,
  FolderGit2,
  Plus,
  Clock,
  Search,
  Trash2,
  RefreshCw,
  LoaderCircle,
  X,
  Layers,
} from "lucide-react";
import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  type UserProject,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/lib/redux/services/userdashboard/project/project-api";

function formatProjectDate(value: string): string {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const queryError = error as FetchBaseQueryError | undefined;
  if (!queryError) {
    return fallback;
  }

  if ("status" in queryError) {
    const data = queryError.data as
      | { error?: string; message?: string; detail?: unknown }
      | undefined;

    if (typeof data?.error === "string" && data.error) {
      return data.error;
    }

    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }

    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      const firstDetail = data.detail[0] as { msg?: string } | undefined;
      if (typeof firstDetail?.msg === "string" && firstDetail.msg) {
        return firstDetail.msg;
      }
    }

    if (typeof data?.detail === "string" && data.detail) {
      return data.detail;
    }

    if (typeof queryError.status === "number") {
      return `Request failed with status ${queryError.status}`;
    }
  }

  return fallback;
}

type StatVariant = "default" | "teal" | "amber" | "red";

const statStyles: Record<StatVariant, { value: string; badge: string; dot: string }> = {
  default: {
    value: "text-gray-900 dark:text-white",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400 dark:bg-gray-500",
  },
  teal: {
    value: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  amber: {
    value: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  red: {
    value: "text-red-500 dark:text-red-400",
    badge: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400",
    dot: "bg-red-500",
  },
};

function StatCard({
  value,
  label,
  variant = "default",
  index,
}: {
  value: number;
  label: string;
  variant?: StatVariant;
  index: number;
}) {
  const s = statStyles[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-[28px] font-bold leading-none ${s.value}`}>
            {value}
          </p>
          <p className="mt-2 text-[12px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {value === 0 ? "None" : "Active"}
        </span>
      </div>
    </motion.div>
  );
}

function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
  onOpen,
  isDeleting,
}: {
  project: UserProject;
  index: number;
  onEdit: (project: UserProject) => void;
  onDelete: (id: string) => void;
  onOpen: (project: UserProject) => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.06, ease: "easeOut" }}
      className="group relative w-full overflow-hidden rounded-3xl border border-black/[0.08] bg-[#ffffff] dark:border-white/5 dark:bg-[#111113]"
    >
      {/* ── Blob header ── */}
      <div className="relative h-[88px] overflow-hidden">
        {/* background base */}
        <div className="absolute inset-0 bg-[#ffffff] dark:bg-[#111113]" />
        {/* blob 1 – far left blue */}
        <div className="pointer-events-none absolute -left-32 -top-6 h-44 w-44 rounded-full bg-[#01509e] opacity-85 blur-3xl dark:opacity-40" />
        {/* blob 2 – far right teal */}
        <div className="pointer-events-none absolute -right-28 -top-4 h-40 w-40 rounded-full bg-[#00d0b2] opacity-55 blur-3xl dark:opacity-25" />
        {/* blob 3 – right edge cyan */}
        <div className="pointer-events-none absolute -bottom-12 -right-24 h-36 w-40 rounded-full bg-[#0194c7] opacity-55 blur-3xl dark:opacity-30" />
        {/* blob 4 – left edge accent */}
        <div className="pointer-events-none absolute -bottom-10 -left-24 h-32 w-32 rounded-full bg-[#00d0b2] opacity-25 blur-3xl dark:opacity-15" />

        {/* header content */}
        <div className="relative z-10 flex h-full items-center justify-between px-[18px]">
          {/* left: icon + meta */}
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-black/10 bg-white/60 dark:border-white/20 dark:bg-white/10">
              <FolderGit2 size={26} className="text-slate-700 dark:text-white" />
            </div>
            <div>
              <p className="text-[12px] font-medium leading-none text-black/70 mb-[3px] dark:text-white/90">
                Project · Repository
              </p>
              <p className="text-[11px] leading-none text-black/45 dark:text-white/60">
                Created {formatProjectDate(project.created_at)}
              </p>
            </div>
          </div>

          {/* right: status + external link */}
          <div className="flex items-center gap-[6px]">
            <span className="inline-flex items-center gap-[5px] rounded-full bg-black/10 px-[10px] py-[3px] text-[11px] font-medium text-black/70 dark:bg-white/20 dark:text-white/90">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-[#00d0b2]" />
              Active
            </span>
            <button
              onClick={() => onEdit(project)}
              aria-label="Edit project"
              className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[8px] border-none bg-black/10 text-black/60 transition-colors hover:bg-black/20 dark:bg-white/20 dark:text-white/80 dark:hover:bg-white/30"
            >
              <Pencil size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-[18px] pb-4 pt-[14px]">
        <p className="mb-[3px] truncate text-[15px] font-medium leading-snug text-black/85 dark:text-white/90">
          {project.name}
        </p>
        <p className="text-[12px] text-black/45 dark:text-white/40 truncate">
          {project.description || "No description provided"}
        </p>

        {/* footer row */}
        <div className="mt-[10px] flex items-center gap-[8px] border-t border-black/[0.08] pt-[10px] dark:border-white/[0.07]">
          <span className="inline-flex items-center gap-[4px] rounded-full border border-black/10 bg-black/[0.04] px-[9px] py-[3px] text-[11px] text-black/50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
            Project key
          </span>
          <span className="inline-flex items-center gap-[4px] rounded-full border border-black/10 bg-black/[0.04] px-[9px] py-[3px] text-[11px] text-black/50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
            <Clock size={12} />
            {formatProjectDate(project.last_modified)}
          </span>
          <button
            onClick={() => onDelete(project.project_id)}
            disabled={isDeleting}
            className="ml-auto inline-flex cursor-pointer items-center gap-[5px] rounded-[8px] border-none bg-red-500/10 px-[12px] py-[6px] text-[12px] font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-40 dark:text-red-400"
          >
            {isDeleting ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
          <button
            onClick={() => onOpen(project)}
            className="inline-flex cursor-pointer items-center gap-[5px] rounded-[8px] border-none bg-[#00d0b2] px-[16px] py-[6px] text-[12px] font-medium text-white transition-colors hover:bg-[#00b89c] active:scale-[0.98]"
          >
            Open
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitError(null);
    try {
      await createProject({ name: name.trim(), description: description.trim() }).unwrap();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Failed to create project. Please try again."));
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">
              Add New Project
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Create a new project for code scanning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="my-repository"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[14px] focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Description{" "}
              <span className="normal-case tracking-normal font-normal text-gray-400 dark:text-gray-600">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[14px] focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 text-[13px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-[14px] font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#00d0b2] hover:bg-[#00b89e] disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {isLoading ? "Creating..." : "Create Project"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UpdateProjectModal({
  project,
  onClose,
  onUpdated,
}: {
  project: UserProject;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) return;

    const updateBody: { name?: string; description?: string } = {};
    if (trimmedName !== project.name) {
      updateBody.name = trimmedName;
    }
    if (trimmedDescription !== (project.description ?? "")) {
      updateBody.description = trimmedDescription;
    }

    if (Object.keys(updateBody).length === 0) {
      onClose();
      return;
    }

    setSubmitError(null);
    try {
      await updateProject({
        project_id: project.project_id,
        ...updateBody,
      }).unwrap();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Failed to update project. Please try again."));
      return;
    }

    onUpdated();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
      >
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white">
              Update Project
            </h2>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Edit project name and description
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="my-repository"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[14px] focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Description{" "}
              <span className="normal-case tracking-normal font-normal text-gray-400 dark:text-gray-600">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[14px] focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          {submitError && (
            <div className="flex items-center gap-2 text-[13px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} />
              {submitError}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-[14px] font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#00d0b2] hover:bg-[#00b89e] disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Pencil size={15} />
            )}
            {isLoading ? "Updating..." : "Update Project"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsPageClient({
  initialProjects,
}: {
  initialProjects: UserProject[];
}) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);

  const {
    data: projects = initialProjects,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetProjectsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const [deleteProject] = useDeleteProjectMutation();

  function refreshRouteData() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleRefresh() {
    const result = await refetch();
    setShowRefreshWarning("error" in result);
    refreshRouteData();
  }

  async function handleDelete(projectId: string) {
    setDeletingId(projectId);
    try {
      await deleteProject({ project_id: projectId, cascade: true }).unwrap();
      refreshRouteData();
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate statistics
  const today = new Date();
  const recentProjects = projects.filter((p) => {
    const created = new Date(p.created_at);
    const diffTime = Math.abs(today.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const recentlyUpdated = projects.filter((p) => {
    const modified = new Date(p.last_modified);
    const diffTime = Math.abs(today.getTime() - modified.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={13} className="text-teal-500 dark:text-teal-400" />
            <span className="text-xs sm:text-sm md:text-sm lg:text-base font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="mt-1.5 sm:mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Projects
          </h1>
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Manage repositories connected for code scanning
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh"
            className="p-2 sm:p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 transition-all"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#00d0b2] hover:bg-[#00b89e] text-gray-800 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-[14px] font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} />
            Create Project
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard value={projects.length} label="Total Projects" variant="default" index={0} />
        <StatCard value={recentProjects} label="New (7 days)" variant="teal" index={1} />
        <StatCard value={recentlyUpdated} label="Recently Updated" variant="amber" index={2} />
        <StatCard value={0} label="Issues Found" variant="red" index={3} />
      </div>

      <div className="relative max-w-full sm:max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-[14px] focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showRefreshWarning && isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/6 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-[13px] text-red-700 dark:text-red-400"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={15} />
              Live refresh failed. Showing the last server-loaded project list.
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 rounded-lg border border-red-300 dark:border-red-500/30 px-3 py-1.5 text-[12px] font-semibold hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-16">
            <LoaderCircle size={22} className="animate-spin text-teal-500 dark:text-teal-400" />
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Loading projects...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                index={i}
                onEdit={setEditingProject}
                onDelete={handleDelete}
                onOpen={(p) => router.push(`/userdashboard/scan?project=${p.project_id}`)}
                isDeleting={deletingId === project.project_id}
              />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
              <FolderGit2 size={22} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-sm sm:text-[16px] font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No matching projects" : "No projects yet"}
            </h3>
            <p className="mt-1 text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 max-w-xs">
              {searchTerm
                ? "Try adjusting your search term"
                : "Import a repository to start scanning for vulnerabilities"}
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="mt-5 flex items-center gap-2 bg-[#00d0b2] hover:bg-[#00b89e] text-gray-800 px-4 py-2 text-[13px] font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Plus size={14} />
                Create your first project
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onCreated={refreshRouteData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProject && (
          <UpdateProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onUpdated={refreshRouteData}
          />
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}