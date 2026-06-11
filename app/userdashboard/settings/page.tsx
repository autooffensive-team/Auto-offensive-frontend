"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FolderGit2,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldOff,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { KeyCard } from "@/components/apikeys/KeyCard";
import { CreateKeyModal } from "@/components/apikeys/CreateKeyModal";
import { PlainKeyReveal } from "@/components/apikeys/PlainKeyReveal";
import {
  ProjectSelector,
  ProjectSelectorSkeleton,
} from "@/components/scanComponents/ProjectSelector";
import { useListApiKeysQuery } from "@/lib/redux/services/userdashboard/apikeys/apikeys-api";
import { useGetProjectsQuery } from "@/lib/redux/services/userdashboard/project/project-api";
import type { CreateApiKeyResponse } from "@/types/apikeys";

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({
  value,
  label,
  variant = "default",
}: {
  value: number;
  label: string;
  variant?: "default" | "active" | "revoked";
}) {
  const styles = {
    default:
      "border-gray-200 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white",
    active:
      "border-gray-200 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white",
    revoked:
      "border-gray-200 bg-gray-50 text-gray-500 shadow-sm dark:border-white/10 dark:bg-white/4 dark:text-gray-500",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border px-4 py-3 text-base lg:text-lg ${styles[variant]}`}
    >
      <div className="flex items-end justify-between gap-4 pl-2">
        <div className="min-w-0">
          <span className="block text-[11px] lg:text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
            {label}
          </span>
          <span className="mt-1 block text-[28px] lg:text-[32px] font-bold leading-none tabular-nums">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyKeys({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden py-16 flex flex-col items-center text-center rounded-2xl border border-dashed border-[#00D0B2]/30 bg-white dark:bg-gray-900"
    >
      {/* Subtle teal tint in top-left corner */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(0,208,178,0.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="relative flex h-14 w-14 items-center justify-center mb-5 rounded-xl bg-[#00D0B2]/8 border border-[#00D0B2]/20"
      >
        <KeyRound size={22} className="text-[#00D0B2]/70" />
      </div>
      <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
        No API keys yet
      </p>
      <p className="mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
        Generate a key to authenticate CI/CD pipelines, scripts, and integrations with this project.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 px-4 py-2.5 text-base lg:text-[16px] font-bold text-gray-900 bg-[#00D0B2] hover:bg-[#00b89e] transition-colors shadow-sm shadow-[#00D0B2]/20 rounded-xl"
      >
        <Plus size={14} />
        Generate First Key
      </motion.button>
    </motion.div>
  );
}

// ─── No-project prompt ────────────────────────────────────────────────────────

function NoProjectPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 flex flex-col items-center text-center"
    >
      <FolderGit2 size={28} className="text-gray-300 dark:text-gray-700 mb-3" />
      <p className="text-lg lg:text-xl font-semibold text-gray-500 dark:text-gray-400">
        No projects found
      </p>
      <p className="mt-1 text-sm lg:text-base text-gray-400 dark:text-gray-600">
        Create a project first, then manage its API keys here.
      </p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevoked, setShowRevoked] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<CreateApiKeyResponse | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();

  const {
    data: keysData,
    isLoading: keysLoading,
    isError: keysError,
    isFetching: keysFetching,
    refetch: refetchKeys,
  } = useListApiKeysQuery(
    { project_id: selectedProjectId, active_only: false },
    { skip: !selectedProjectId },
  );

  const allKeys = keysData?.keys ?? [];
  const activeKeys = allKeys.filter((k) => k.is_active);
  const revokedKeys = allKeys.filter((k) => !k.is_active);
  const displayedKeys = showRevoked ? allKeys : activeKeys;

  function handleProjectChange(id: string) {
    setSelectedProjectId(id);
    setNewlyCreatedKey(null);
    setShowRevoked(false);
  }

  const selectorProjects = projects.map((p) => ({
    project_id: p.project_id,
    name: p.name,
  }));

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} className="text-[#00D0B2]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00D0B2]">
              Account / API Access
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
            API Keys
          </h1>
          <p className="mt-2 text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            Authenticate CI/CD pipelines and integrations · Keys are scoped per project
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence>
            {selectedProjectId && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => refetchKeys()}
                  disabled={keysFetching}
                  title="Refresh keys"
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 disabled:opacity-40 transition-all rounded-lg"
                >
                  <RefreshCw size={14} className={keysFetching ? "animate-spin" : ""} />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-base lg:text-[16px] font-bold text-gray-900 bg-[#00D0B2] hover:bg-[#00b89e] transition-colors shadow-sm shadow-[#00D0B2]/25 rounded-xl"
                >
                  <Plus size={15} />
                  New Key
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Two-column layout on wide screens ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5 items-start">

        {/* ── Left: project selector panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* Project selector card */}
          <div
            className="relative overflow-hidden bg-white dark:bg-[#0f0f0f] p-5"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              outline: "1px solid color-mix(in srgb, #00D0B2 22%, transparent)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                pointerEvents: "none",
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(135deg, #00D0B2 0%, transparent 55%) top left / 12px 12px no-repeat,
                  linear-gradient(315deg, #00D0B2 0%, transparent 55%) bottom right / 12px 12px no-repeat
                `,
                opacity: 0.35,
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center"
                  style={{
                    background: "rgba(0,208,178,0.1)",
                    border: "1px solid rgba(0,208,178,0.3)",
                    clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                  }}
                >
                  <FolderGit2 size={13} className="text-[#00D0B2]" />
                </div>
                <div>
                  <p className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    Project scope
                  </p>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                    Keys belong to one project
                  </p>
                </div>
              </div>

              {projectsLoading ? (
                <ProjectSelectorSkeleton />
              ) : (
                <ProjectSelector
                  projects={selectorProjects}
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  disabled={projectsLoading}
                  loading={projectsLoading}
                />
              )}
            </div>
          </div>

          {/* Info block */}
          {!selectedProjectId && !projectsLoading && projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            className="px-4 py-3.5 rounded-xl border border-dashed border-gray-200 dark:border-white/8 text-sm lg:text-base text-gray-400 dark:text-gray-500 leading-relaxed space-y-2"
            >
              <p className="flex items-center gap-2">
                <Zap size={11} className="text-[#00D0B2] shrink-0" />
                Select a project to view and manage its API keys.
              </p>
              <p className="flex items-center gap-2">
                <KeyRound size={11} className="text-[#00D0B2] shrink-0" />
                Plain-text keys are shown only once on creation.
              </p>
              <p className="flex items-center gap-2">
                <ShieldOff size={11} className="text-[#00D0B2] shrink-0" />
                Revoked keys are invalidated immediately.
              </p>
            </motion.div>
          )}

          {/* Stats (when keys loaded) */}
          <AnimatePresence>
            {selectedProjectId && !keysLoading && !keysError && allKeys.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-2"
              >
                <StatChip value={allKeys.length} label="Total" variant="default" />
                <StatChip value={activeKeys.length} label="Active" variant="active" />
                <StatChip value={revokedKeys.length} label="Revoked" variant="revoked" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right: keys content ── */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {!selectedProjectId ? (
              <motion.div
                key="no-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {!projectsLoading && projects.length === 0 ? (
                  <NoProjectPrompt />
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key={selectedProjectId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ ease: "easeOut" }}
                className="space-y-4"
              >

                {/* New key reveal */}
                <AnimatePresence>
                  {newlyCreatedKey && (
                    <PlainKeyReveal
                      plainKey={newlyCreatedKey.plain_key}
                      keyName={newlyCreatedKey.name}
                    />
                  )}
                </AnimatePresence>

                {/* Filter bar */}
                {!keysLoading && !keysError && revokedKeys.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-end"
                  >
                    <button
                      onClick={() => setShowRevoked((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm lg:text-[16px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 transition-all rounded-lg"
                    >
                      {showRevoked ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showRevoked
                        ? "Hide revoked"
                        : `Show ${revokedKeys.length} revoked`}
                    </button>
                  </motion.div>
                )}

                {/* Loading */}
                {keysLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-[#00D0B2]"
                    />
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                      Loading API keys…
                    </p>
                  </div>
                )}

                {/* Error */}
                {keysError && !keysLoading && (
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm lg:text-base"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      background: "rgba(239,68,68,0.06)",
                      outline: "1px solid rgba(239,68,68,0.25)",
                    }}
                  >
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={13} />
                      Failed to load API keys for this project.
                    </div>
                    <button
                      onClick={() => refetchKeys()}
                      disabled={keysFetching}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-sm lg:text-base font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={10} className={keysFetching ? "animate-spin" : ""} />
                      Retry
                    </button>
                  </div>
                )}

                {/* Keys list */}
                {!keysLoading && !keysError && (
                  <>
                    {displayedKeys.length === 0 && activeKeys.length === 0 ? (
                      <EmptyKeys onAdd={() => setShowCreateModal(true)} />
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {displayedKeys.map((key, i) => (
                            <KeyCard
                              key={key.key_id}
                              apiKey={key}
                              index={i}
                              onRevoked={() => refetchKeys()}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Hidden-revoked footer */}
                    {!showRevoked && revokedKeys.length > 0 && activeKeys.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm lg:text-base text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1.5"
                      >
                        <ShieldOff size={11} />
                        {revokedKeys.length} revoked{" "}
                        {revokedKeys.length === 1 ? "key" : "keys"} hidden
                      </motion.p>
                    )}
                  </>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showCreateModal && selectedProjectId && (
          <CreateKeyModal
            projectId={selectedProjectId}
            onClose={() => setShowCreateModal(false)}
            onCreated={(result) => {
              setNewlyCreatedKey(result);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
