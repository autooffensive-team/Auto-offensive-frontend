"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LogIn, UserPlus, X } from "lucide-react";
import Link from "next/link";

type GuestScanLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function GuestScanLimitModal({ isOpen, onClose }: GuestScanLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Content */}
              <div className="px-6 pb-6 pt-8 text-center">
                {/* Warning icon */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                  <AlertTriangle className="h-8 w-8 text-rose-500" />
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Scan Limit Reached
                </h2>

                {/* Description */}
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  You&apos;ve used all 3 free guest scans. Create a free account to get
                  unlimited scans, access to advanced tools, saved scan history, and
                  detailed vulnerability reports.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-105"
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <UserPlus size={16} />
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
