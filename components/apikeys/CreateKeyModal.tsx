"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, KeyRound, LoaderCircle, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { useCreateApiKeyMutation } from "@/lib/redux/services/userdashboard/apikeys/apikeys-api";
import type { CreateApiKeyResponse } from "@/types/apikeys";

function getApiErrorMessage(error: unknown, fallback: string): string {
  const queryError = error as FetchBaseQueryError | undefined;
  if (!queryError) return fallback;
  if ("status" in queryError) {
    const data = queryError.data as
      | { error?: string; message?: string; detail?: unknown }
      | undefined;
    if (typeof data?.error === "string" && data.error) return data.error;
    if (typeof data?.message === "string" && data.message) return data.message;
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      const first = data.detail[0] as { msg?: string } | undefined;
      if (typeof first?.msg === "string" && first.msg) return first.msg;
    }
    if (typeof data?.detail === "string" && data.detail) return data.detail;
    if (typeof queryError.status === "number")
      return `Request failed with status ${queryError.status}`;
  }
  return fallback;
}

interface CreateKeyModalProps {
  projectId: string;
  onClose: () => void;
  onCreated: (result: CreateApiKeyResponse) => void;
}

export function CreateKeyModal({ projectId, onClose, onCreated }: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [createApiKey, { isLoading }] = useCreateApiKeyMutation();

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      nameRef.current?.focus();
      return;
    }
    setSubmitError(null);
    try {
      const result = await createApiKey({
        project_id: projectId,
        name: trimmedName,
        description: description.trim() || undefined,
      }).unwrap();
      onCreated(result);
      onClose();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Failed to create API key. Please try again."),
      );
    }
  }

  const CLIP = 16;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
        className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#0f0f0f]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-key-title"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${CLIP}px) 0, 100% ${CLIP}px, 100% 100%, ${CLIP}px 100%, 0 calc(100% - ${CLIP}px))`,
          outline: "1px solid color-mix(in srgb, #00D0B2 35%, transparent)",
        }}
      >
        {/* Corner triangles */}
        <span
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `
              linear-gradient(135deg, #00D0B2 0%, transparent 55%) top left / ${CLIP}px ${CLIP}px no-repeat,
              linear-gradient(315deg, #00D0B2 0%, transparent 55%) bottom right / ${CLIP}px ${CLIP}px no-repeat
            `,
            opacity: 0.45,
            clipPath: `polygon(0 0, calc(100% - ${CLIP}px) 0, 100% ${CLIP}px, 100% 100%, ${CLIP}px 100%, 0 calc(100% - ${CLIP}px))`,
          }}
        />

        {/* Subtle top glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #00D0B2, transparent)" }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-0">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{
                  background: "rgba(0,208,178,0.1)",
                  border: "1px solid rgba(0,208,178,0.3)",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}
              >
                <KeyRound size={15} className="text-[#00D0B2]" />
              </div>
              <div>
                <h2
                  id="create-key-title"
                  className="text-[18px] font-bold text-gray-900 dark:text-white leading-tight"
                >
                  New API Key
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Plain-text key shown once only
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 pt-5 pb-0 space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="ck-name"
                className="block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-1.5"
              >
                Key name <span className="text-[#00D0B2]">*</span>
              </label>
              <input
                ref={nameRef}
                id="ck-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="ci-pipeline · deploy-bot · staging-access"
                maxLength={100}
                autoFocus
                className="w-full px-3.5 py-2.5 text-[14px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#00D0B2] focus:ring-1 focus:ring-[#00D0B2]/30 transition-all rounded-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="ck-desc"
                className="block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-1.5"
              >
                Description{" "}
                <span className="normal-case tracking-normal font-normal opacity-60">— optional</span>
              </label>
              <input
                id="ck-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this key authenticate?"
                maxLength={255}
                className="w-full px-3.5 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-[#00D0B2] focus:ring-1 focus:ring-[#00D0B2]/30 transition-all rounded-lg"
              />
            </div>

            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2.5"
                >
                  <AlertCircle size={13} className="shrink-0" />
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-lg"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
              className="flex-1 py-2.5 text-[13px] font-bold bg-[#00D0B2] hover:bg-[#00b89e] disabled:opacity-35 disabled:cursor-not-allowed text-gray-900 transition-colors flex items-center justify-center gap-2 rounded-lg shadow-sm shadow-[#00D0B2]/20"
            >
              {isLoading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {isLoading ? "Generating…" : "Generate Key"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
