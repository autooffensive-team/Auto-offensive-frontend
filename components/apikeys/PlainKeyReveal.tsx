"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Eye, EyeOff, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";

interface PlainKeyRevealProps {
  plainKey: string;
  keyName: string;
}

export function PlainKeyReveal({ plainKey, keyName }: PlainKeyRevealProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(plainKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const masked = "sk-" + "•".repeat(Math.min(plainKey.replace(/^sk-/, "").length, 36));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
      className="relative overflow-hidden"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        background:
          "linear-gradient(135deg, rgba(0,208,178,0.08) 0%, rgba(0,80,158,0.06) 100%)",
        outline: "1px solid rgba(0,208,178,0.35)",
      }}
    >
      {/* Corner accent triangles */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(135deg, #00D0B2 0%, transparent 55%) top left / 16px 16px no-repeat,
            linear-gradient(315deg, #00D0B2 0%, transparent 55%) bottom right / 16px 16px no-repeat
          `,
          opacity: 0.5,
          clipPath:
            "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
      />

      <div className="relative z-10 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00D0B2]/15 border border-[#00D0B2]/30">
            <Sparkles size={13} className="text-[#00D0B2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#00D0B2]">
              Key created — copy it now
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                {keyName}
              </span>{" "}
              · This plain-text key is shown exactly once and cannot be retrieved later.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-500 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
            <ShieldAlert size={9} />
            Once only
          </div>
        </div>

        {/* Key row */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,208,178,0.2)",
          }}
        >
          <span className="text-[11px] font-mono font-bold text-[#00D0B2]/60 select-none shrink-0">
            KEY
          </span>
          <code className="flex-1 min-w-0 truncate text-[13px] font-mono text-gray-900 dark:text-gray-100 select-all">
            {visible ? plainKey : masked}
          </code>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setVisible((v) => !v)}
              title={visible ? "Hide key" : "Reveal key"}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {visible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                copied
                  ? "bg-[#00D0B2]/15 border border-[#00D0B2]/40 text-[#00D0B2]"
                  : "bg-[#00D0B2] hover:bg-[#00b89e] text-gray-900 border border-[#00D0B2]"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={12} />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy size={12} />
                    Copy key
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
