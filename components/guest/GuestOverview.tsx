"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Lock,
  Radar,
  Scan,
  Shield,
  TrendingUp,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";
import { GuestLockModal } from "@/components/guest/GuestLockModal";

type QuickAction = {
  label: string;
  description: string;
  icon: typeof Scan;
  href?: string;
  locked?: boolean;
};

const quickActions: QuickAction[] = [
  {
    label: "Basic Scan",
    description: "Quick vulnerability scan with preset tools",
    icon: Scan,
    href: "/userdashboard/scan?mode=basic",
  },
  {
    label: "Medium Scan",
    description: "Chain multiple tools for deeper analysis",
    icon: Radar,
    href: "/userdashboard/scan?mode=medium",
  },
  {
    label: "Advanced Scan",
    description: "Full terminal access with custom commands",
    icon: Shield,
    href: "/userdashboard/scan?mode=advanced",
  },
  {
    label: "Code Scanning",
    description: "Repository security analysis",
    icon: Activity,
    locked: true,
  },
];

export function GuestOverview() {
  const guest = useOptionalGuestContext();
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

  const handleLockedClick = (label: string) => {
    setLockedFeature(label);
    setLockModalOpen(true);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-orange-950/20"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Welcome, Guest
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              You&apos;re using Auto Offensive in guest mode. You have access to Basic,
              Medium, and Advanced scans with a limit of {guest?.maxScans ?? 20} total scans.
              Create a free account to unlock all features.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/80 px-4 py-2 text-center dark:bg-black/20">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {guest?.scansRemaining ?? 20}
              </p>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Scans left
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            if (action.locked) {
              return (
                <motion.button
                  key={action.label}
                  type="button"
                  onClick={() => handleLockedClick(action.label)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left opacity-60 transition hover:opacity-80 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <action.icon size={20} className="text-gray-400" />
                    <Lock size={10} className="absolute -right-1 -top-1 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <Lock size={14} className="absolute right-3 top-3 text-amber-500" />
                </motion.button>
              );
            }

            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={action.href!}
                  className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary/50 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10">
                    <action.icon size={20} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Locked features preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Premium Features
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Vulnerability Dashboard", icon: TrendingUp, desc: "Real-time security metrics and trends" },
            { label: "Scan History", icon: Activity, desc: "Access all past scan results and reports" },
            { label: "Risk Assessment", icon: AlertCircle, desc: "Detailed risk scoring and prioritization" },
          ].map((feature) => (
            <button
              key={feature.label}
              type="button"
              onClick={() => handleLockedClick(feature.label)}
              className="relative flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left opacity-50 transition hover:opacity-70 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <feature.icon size={18} className="text-gray-400" />
                <Lock size={8} className="absolute -right-0.5 -top-0.5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {feature.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {feature.desc}
                </p>
              </div>
              <Lock size={12} className="absolute right-3 top-3 text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4 sm:p-5 text-center dark:border-gray-800 dark:from-gray-900 dark:to-slate-900"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Ready for more?
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a free account to unlock unlimited scans, advanced tools, and full dashboard access.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-105"
          >
            <UserPlus size={16} />
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <LogIn size={16} />
            Login
          </Link>
        </div>
      </motion.div>

      <GuestLockModal
        isOpen={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        featureName={lockedFeature}
      />
    </div>
  );
}
