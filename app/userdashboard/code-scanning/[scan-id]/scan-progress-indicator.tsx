"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, GitBranch, CheckCircle2, FileCode2, Bug, Lock } from "lucide-react";

type ScanProgressIndicatorProps = {
  progress: number;
  status: string | null | undefined;
  isScanRunning: boolean;
};

const STEPS = [
  { label: "Clone", description: "Cloning repository", icon: GitBranch },
  { label: "Scanning", description: "Running security analysis", icon: Shield },
  { label: "Complete", description: "Finalizing results", icon: CheckCircle2 },
];

const SCAN_ACTIVITIES = [
  { icon: FileCode2, text: "Analyzing source files..." },
  { icon: Bug, text: "Detecting vulnerabilities..." },
  { icon: Lock, text: "Checking dependency security..." },
  { icon: Shield, text: "Running SAST rules..." },
  { icon: FileCode2, text: "Inspecting code patterns..." },
  { icon: Bug, text: "Scanning for injection flaws..." },
  { icon: Lock, text: "Verifying authentication flows..." },
  { icon: Shield, text: "Checking encryption usage..." },
];

/** Animates a number counting up one-by-one toward the target */
function useAnimatedCounter(target: number, duration = 600): number {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<{ value: number; time: number }>({ value: 0, time: 0 });

  useEffect(() => {
    const startValue = display;
    const startTime = performance.now();
    startRef.current = { value: startValue, time: startTime };

    function tick(now: number) {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(startRef.current.value + (target - startRef.current.value) * progress);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

function ScanPulseAnimation() {
  return (
    <div className="relative mx-auto my-6 flex h-20 w-full max-w-xs items-center justify-center">
      {/* Orbiting rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute h-20 w-20 rounded-full border border-teal-400/20 dark:border-teal-400/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute h-14 w-14 rounded-full border border-dashed border-teal-500/30 dark:border-teal-400/20"
      />

      {/* Center shield icon with pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20"
      >
        <Shield className="h-5 w-5 text-white" strokeWidth={2} />
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -12, 0],
            x: [0, (i % 2 === 0 ? 6 : -6), 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
          className="absolute h-1 w-1 rounded-full bg-teal-400"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 15}%`,
          }}
        />
      ))}

      {/* Scanning line sweep */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 h-[1px] w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
      />
    </div>
  );
}

export function ScanProgressIndicator({
  progress,
  status,
  isScanRunning,
}: ScanProgressIndicatorProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const animatedPercent = useAnimatedCounter(normalizedProgress, 800);

  // Track if we've hit 100% and hold for 1 second
  const [showComplete, setShowComplete] = useState(false);
  const hasReached100 = useRef(false);

  // Cycle through scan activities while scanning
  const [activityIndex, setActivityIndex] = useState(0);

  const getCurrentStep = (): number => {
    if (normalizedProgress < 15) return 0;  // Clone: 0-14%
    if (normalizedProgress < 95) return 1;  // Scanning: 15-94%
    return 2;                                // Complete: 95-100%
  };

  const currentStep = getCurrentStep();

  useEffect(() => {
    if (normalizedProgress >= 100 && !hasReached100.current) {
      hasReached100.current = true;
      const timer = setTimeout(() => {
        setShowComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [normalizedProgress]);

  useEffect(() => {
    if (currentStep !== 1) return;
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % SCAN_ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentStep]);

  // All hooks above — conditional returns below

  // Hide if scan already completed (progress at 100% on mount means scan is done)
  if (normalizedProgress >= 100 && !isScanRunning) {
    return null;
  }
  if (!isScanRunning && !hasReached100.current) {
    return null;
  }
  if (showComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-slate-900"
    >
      {/* Subtle background gradient animation */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-400 to-blue-500"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-2">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[15px] font-semibold text-slate-900 dark:text-slate-100"
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

        {/* Animated scan visual */}
        <ScanPulseAnimation />

        {/* 3-Step Progress */}
        <div className="mb-6 w-full">
          <div className="flex w-full items-center">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > idx;
              const isActive = currentStep === idx;
              const StepIcon = step.icon;

              return (
                <div key={step.label} className="flex flex-1 items-center justify-center">
                  {/* Connector before (except first) */}
                  {idx > 0 && (
                    <div className="flex-1">
                      <div className="relative h-[2px] overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: isCompleted || isActive ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.8, delay: idx * 0.15, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
                        />
                        {isActive && (
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step Circle + Label (centered) */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ scale: isActive ? 1.05 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={cn(
                          "relative flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] text-sm font-medium transition-all duration-300",
                          isCompleted
                            ? "border-teal-400 bg-teal-50 text-teal-600 dark:border-teal-400/60 dark:bg-teal-500/10 dark:text-teal-400"
                            : isActive
                              ? "border-teal-500 bg-teal-50 text-teal-600 dark:border-teal-400 dark:bg-teal-500/10 dark:text-teal-400"
                              : "border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/20"
                        )}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}

                        {/* Active step glow */}
                        {isActive && (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full bg-teal-400/20"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                              className="absolute inset-0 rounded-full border border-teal-400/40 dark:border-teal-400/30"
                            />
                          </>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Label centered under circle */}
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 + 0.1 }}
                      className={cn(
                        "mt-2 text-[11px] font-medium text-center transition-colors duration-300",
                        isActive || isCompleted
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-300 dark:text-white/20"
                      )}
                    >
                      {step.label}
                    </motion.p>
                  </div>

                  {/* Connector after (except last) */}
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1">
                      <div className="relative h-[2px] overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: isCompleted ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.8, delay: idx * 0.15, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Overall Progress
            </p>
            <p className="text-xs font-semibold tabular-nums text-teal-600 dark:text-teal-400">
              {animatedPercent}%
            </p>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${normalizedProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-colors duration-300",
                normalizedProgress >= 100
                  ? "bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400"
                  : "bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400"
              )}
            />
            {/* Shimmer effect on progress bar */}
            {normalizedProgress < 100 && (
              <motion.div
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </div>
        </div>

        {/* Status Text / Activity Ticker */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {normalizedProgress >= 100 ? (
              <motion.div
                key="complete-msg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                  Scan complete!
                </span>
              </motion.div>
            ) : currentStep === 0 ? (
              <motion.p
                key="cloning"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center text-[11px] text-slate-400 dark:text-slate-500"
              >
                {status === "PENDING" ? "Waiting to start..." : "Cloning repository..."}
              </motion.p>
            ) : currentStep === 1 ? (
              <motion.div
                key={`activity-${activityIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                {(() => {
                  const ActivityIcon = SCAN_ACTIVITIES[activityIndex].icon;
                  return <ActivityIcon className="h-3 w-3 text-teal-500 dark:text-teal-400" />;
                })()}
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {SCAN_ACTIVITIES[activityIndex].text}
                </span>
              </motion.div>
            ) : (
              <motion.p
                key="finalizing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-center text-[11px] text-teal-600 dark:text-teal-400"
              >
                Almost done — finalizing results...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
