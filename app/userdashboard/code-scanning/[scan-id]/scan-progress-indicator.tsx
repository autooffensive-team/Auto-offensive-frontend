"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ScanProgressIndicatorProps = {
  progress: number;
  status: string | null | undefined;
  isScanRunning: boolean;
};

const STEPS = [
  { label: "Clone", description: "Cloning repository", value: 0 },
  { label: "Scanning", description: "Running security scan", value: 33 },
  { label: "Complete", description: "Finalizing results", value: 66 },
];

export function ScanProgressIndicator({
  progress,
  status,
  isScanRunning,
}: ScanProgressIndicatorProps) {
  if (!isScanRunning) {
    return null;
  }

  const getCurrentStep = (): number => {
    if (progress < 33) return 0;
    if (progress < 66) return 1;
    return 2;
  };

  const currentStep = getCurrentStep();
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-slate-900"
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[15px] font-medium text-slate-900 dark:text-slate-100"
        >
          Security Scan in Progress
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
        >
          {STEPS[currentStep]?.description || "Scanning..."}
        </motion.p>
      </div>

      {/* 3-Step Progress */}
      <div className="mb-6 flex items-start">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;
          const isNext = currentStep < idx;

          return (
            <div key={step.label} className="flex flex-1 items-start">
              {/* Step Circle + Label */}
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={cn(
                    "relative flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] text-sm font-medium transition-all duration-300",
                    isCompleted
                      ? "border-[#00D0B2] bg-[rgba(0,208,178,0.1)] text-[#00897B] dark:bg-[rgba(0,208,178,0.12)] dark:text-[#00D0B2]"
                      : isActive
                        ? "border-[#1675B1] bg-[rgba(22,117,177,0.08)] text-[#1675B1] dark:border-[#28CCE7] dark:bg-[rgba(40,204,231,0.1)] dark:text-[#28CCE7]"
                        : "border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/20"
                  )}
                >
                  {isCompleted ? (
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}

                  {/* Pulse ring for active step */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-[-5px] rounded-full border border-[#1675B1] dark:border-[#28CCE7]"
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 + 0.1 }}
                  className={cn(
                    "mt-1.5 text-[11px] font-medium transition-colors duration-300",
                    isActive || isCompleted
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-300 dark:text-white/20"
                  )}
                >
                  {step.label}
                </motion.p>
              </motion.div>

              {/* Connector Line */}
              {idx < STEPS.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: idx * 0.15 + 0.2 }}
                  className="mx-2 mt-[18px] flex-1 origin-left"
                >
                  <div
                    className={cn(
                      "h-[1.5px] rounded-full transition-all duration-500",
                      isCompleted || (isActive && !isNext)
                        ? "bg-[#00D0B2]"
                        : "bg-slate-200 dark:bg-white/[0.07]"
                    )}
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Overall Progress
          </p>
          <motion.p
            key={normalizedProgress}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium text-[#00897B] dark:text-[#00D0B2]"
          >
            {Math.round(normalizedProgress)}%
          </motion.p>
        </div>
        <div className="h-1 overflow-hidden rounded-full border-[0.5px] border-slate-200 bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-[#00D0B2]"
          />
        </div>
      </div>

      {/* Status Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-center text-[11px] text-slate-400 dark:text-slate-600"
      >
        {status === "PENDING" ? "Waiting to start..." : "Analyzing code security..."}
      </motion.p>
    </motion.div>
  );
}