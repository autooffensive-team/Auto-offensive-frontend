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
      className="rounded-2xl border border-gradient-to-r from-blue-200 via-teal-200 to-emerald-200 bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 p-8 shadow-lg dark:border-blue-900/30 dark:from-blue-950/20 dark:via-teal-950/20 dark:to-emerald-950/20 dark:bg-gradient-to-br dark:from-blue-950/10 dark:via-teal-950/10 dark:to-emerald-950/10"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg font-bold text-slate-900 dark:text-white"
        >
          Security Scan in Progress
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-1 text-sm text-slate-600 dark:text-slate-400"
        >
          {STEPS[currentStep]?.description || "Scanning..."}
        </motion.p>
      </div>

      {/* 3-Step Progress */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;
          const isNext = currentStep < idx;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Step Circle */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  boxShadow: isActive
                    ? "0 0 20px rgba(59, 130, 246, 0.5)"
                    : "none",
                }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1,
                  }}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300",
                    isCompleted
                      ? "border-emerald-400 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : isActive
                        ? "border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-300"
                        : "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <motion.svg
                      className="h-6 w-6"
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
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}

                  {/* Pulse animation for active step */}
                  {isActive && (
                    <motion.div
                      animate={{
                        scale: [1, 1.5],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-300"
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 + 0.1 }}
                  className={cn(
                    "mt-2 text-xs font-semibold tracking-wide transition-colors duration-300",
                    isActive || isCompleted
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
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
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.15 + 0.2,
                  }}
                  className="mx-2 flex-1 origin-left"
                >
                  <div
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      isCompleted || (isActive && !isNext)
                        ? "bg-gradient-to-r from-emerald-400 to-blue-400"
                        : isActive
                          ? "bg-gradient-to-r from-blue-400 to-blue-300"
                          : "bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Overall Progress
          </p>
          <motion.p
            key={normalizedProgress}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            {Math.round(normalizedProgress)}%
          </motion.p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 shadow-lg"
          />
        </div>
      </div>

      {/* Status Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-center text-xs text-slate-600 dark:text-slate-400"
      >
        {status === "PENDING" ? "Waiting to start..." : "Analyzing code security..."}
      </motion.p>
    </motion.div>
  );
}
