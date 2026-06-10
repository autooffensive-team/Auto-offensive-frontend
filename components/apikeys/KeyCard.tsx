"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  ShieldOff,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { useRevokeApiKeyMutation } from "@/lib/redux/services/userdashboard/apikeys/apikeys-api";
import type { ApiKey } from "@/types/apikeys";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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
  }
  return fallback;
}

function PrefixCopyChip({ prefix, keyId }: { prefix: string; keyId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(keyId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy key ID"
      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all"
      style={{
        background: "rgba(0,208,178,0.06)",
        border: "1px solid rgba(0,208,178,0.2)",
      }}
    >
      <span className="text-[11px] font-mono font-semibold text-[#00D0B2]/80 tracking-wider">
        {prefix}
        <span className="opacity-50">••••</span>
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Check size={10} className="text-[#00D0B2]" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Copy
              size={10}
              className="text-gray-400 dark:text-gray-500 group-hover:text-[#00D0B2] transition-colors"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

interface KeyCardProps {
  apiKey: ApiKey;
  index: number;
  onRevoked: () => void;
}

export function KeyCard({ apiKey, index, onRevoked }: KeyCardProps) {
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation();

  async function handleRevoke() {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      return;
    }
    setRevokeError(null);
    try {
      await revokeApiKey({
        key_id: apiKey.key_id,
        project_id: apiKey.project_id,
      }).unwrap();
      onRevoked();
    } catch (error) {
      setRevokeError(
        getApiErrorMessage(error, "Failed to revoke key. Please try again."),
      );
    } finally {
      setConfirmRevoke(false);
    }
  }

  const isActive = apiKey.is_active;
  const CLIP = 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.05, ease: "easeOut" }}
      className={`relative overflow-hidden transition-all ${!isActive ? "opacity-55" : ""}`}
      style={{
        clipPath: `polygon(0 0, calc(100% - ${CLIP}px) 0, 100% ${CLIP}px, 100% 100%, ${CLIP}px 100%, 0 calc(100% - ${CLIP}px))`,
        outline: isActive
          ? "1px solid color-mix(in srgb, #00D0B2 28%, transparent)"
          : "1px solid color-mix(in srgb, currentColor 10%, transparent)",
        background: isActive
          ? "var(--lc-panel-bg, white)"
          : "rgba(100,100,100,0.04)",
      }}
    >
      {/* Corner triangles (active only) */}
      {isActive && (
        <span
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(135deg, #00D0B2 0%, transparent 55%) top left / ${CLIP}px ${CLIP}px no-repeat,
              linear-gradient(315deg, #00D0B2 0%, transparent 55%) bottom right / ${CLIP}px ${CLIP}px no-repeat
            `,
            opacity: 0.4,
            clipPath: `polygon(0 0, calc(100% - ${CLIP}px) 0, 100% ${CLIP}px, 100% 100%, ${CLIP}px 100%, 0 calc(100% - ${CLIP}px))`,
          }}
        />
      )}

      <div className="relative z-10 p-4 space-y-3.5">

        {/* ── Row 1: icon + name + status ── */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-[8px]"
            style={{
              background: isActive
                ? "rgba(0,208,178,0.1)"
                : "rgba(100,100,100,0.08)",
              border: isActive
                ? "1px solid rgba(0,208,178,0.25)"
                : "1px solid rgba(100,100,100,0.15)",
            }}
          >
            {isActive ? (
              <Zap size={15} className="text-[#00D0B2]" />
            ) : (
              <ShieldOff size={15} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {apiKey.name}
              </p>
              {/* Status pill */}
              {isActive ? (
                <span
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shrink-0"
                  style={{
                    color: "#00D0B2",
                    background: "rgba(0,208,178,0.1)",
                    border: "1px solid rgba(0,208,178,0.3)",
                    clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D0B2] animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                  <ShieldOff size={9} />
                  Revoked
                </span>
              )}
            </div>
            {apiKey.description && (
              <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400 truncate">
                {apiKey.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Row 2: prefix chip + scopes ── */}
        <div className="flex flex-wrap items-center gap-2">
          <PrefixCopyChip prefix={apiKey.prefix} keyId={apiKey.key_id} />

          {apiKey.scopes.slice(0, 4).map((scope) => (
            <span
              key={scope}
              className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
              style={{
                color: "rgba(0,80,158,0.9)",
                background: "rgba(0,80,158,0.07)",
                border: "1px solid rgba(0,80,158,0.2)",
                clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
              }}
            >
              {scope}
            </span>
          ))}
          {apiKey.scopes.length > 4 && (
            <span className="px-2 py-0.5 rounded text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800">
              +{apiKey.scopes.length - 4}
            </span>
          )}
        </div>

        {/* ── Row 3: date meta + revoke ── */}
        <div
          className="flex items-center justify-between gap-3 pt-3 flex-wrap"
          style={{ borderTop: "1px solid rgba(128,128,128,0.1)" }}
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {apiKey.revoked_at ? (
              <span className="text-[11px] text-red-400 dark:text-red-500 font-mono">
                Revoked {formatDate(apiKey.revoked_at)}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                Expires {apiKey.expired_at ? formatDate(apiKey.expired_at) : "never"}
              </span>
            )}
          </div>

          {/* Revoke error */}
          <AnimatePresence>
            {revokeError && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-1.5 text-[12px] text-red-500 dark:text-red-400"
              >
                <AlertCircle size={12} />
                {revokeError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Revoke button (active keys only) */}
          {isActive && (
            <AnimatePresence mode="wait">
              {confirmRevoke ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Confirm?
                  </span>
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                    }}
                  >
                    {isRevoking ? (
                      <LoaderCircle size={11} className="animate-spin" />
                    ) : (
                      <ShieldOff size={11} />
                    )}
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleRevoke}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-500 dark:text-red-400 hover:text-white hover:bg-red-500 border border-red-300 dark:border-red-500/30 hover:border-red-500 transition-all"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                  }}
                >
                  <ShieldOff size={11} />
                  Revoke
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>
    </motion.div>
  );
}
