"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { driver } from "driver.js";

const TOUR_STORAGE_KEY = "code-scan-tour-completed";

function injectDriverCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("driver-js-css")) return;

  const link = document.createElement("link");
  link.id = "driver-js-css";
  link.rel = "stylesheet";
  link.href = "/driver.css";
  document.head.appendChild(link);

  if (document.getElementById("guest-tour-custom-css")) return;
  const style = document.createElement("style");
  style.id = "guest-tour-custom-css";
  style.textContent = `
    .guest-tour-popover {
      background: #ffffff !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,208,178,0.1) !important;
      max-width: 400px !important;
      padding: 0 !important;
    }
    .guest-tour-popover .driver-popover-title {
      font-size: 16px !important;
      font-weight: 700 !important;
      color: #111827 !important;
      padding: 20px 20px 8px !important;
    }
    .guest-tour-popover .driver-popover-description {
      font-size: 13px !important;
      color: #4b5563 !important;
      line-height: 1.7 !important;
      padding: 0 20px 16px !important;
    }
    .guest-tour-popover .driver-popover-description code {
      background: #f0fdfa; color: #0d9488; padding: 1px 6px;
      border-radius: 4px; font-size: 12px; font-weight: 500; border: 1px solid #ccfbf1;
    }
    .guest-tour-popover .driver-popover-description strong { color: #111827; font-weight: 600; }
    .guest-tour-popover .driver-popover-progress-text { font-size: 11px !important; color: #9ca3af !important; padding: 0 20px !important; }
    .guest-tour-popover .driver-popover-navigation-btns { padding: 12px 20px 20px !important; gap: 8px !important; }
    .guest-tour-popover .driver-popover-next-btn {
      background: #00d0b2 !important; color: #000 !important; border: none !important;
      border-radius: 8px !important; padding: 8px 16px !important; font-size: 13px !important;
      font-weight: 600 !important; text-shadow: none !important;
    }
    .guest-tour-popover .driver-popover-prev-btn {
      background: transparent !important; color: #6b7280 !important;
      border: 1px solid #e5e7eb !important; border-radius: 8px !important;
      padding: 8px 16px !important; font-size: 13px !important; font-weight: 500 !important; text-shadow: none !important;
    }
    .guest-tour-popover .driver-popover-close-btn { color: #9ca3af !important; }
    .dark .guest-tour-popover { background: #1f2937 !important; }
    .dark .guest-tour-popover .driver-popover-title { color: #f9fafb !important; }
    .dark .guest-tour-popover .driver-popover-description { color: #d1d5db !important; }
    .dark .guest-tour-popover .driver-popover-description code { background: rgba(0,208,178,0.1); color: #5eead4; border-color: rgba(0,208,178,0.2); }
    .dark .guest-tour-popover .driver-popover-description strong { color: #f9fafb; }
    .dark .guest-tour-popover .driver-popover-next-btn { background: #00d0b2 !important; color: #000 !important; }
    .dark .guest-tour-popover .driver-popover-prev-btn { border-color: #374151 !important; color: #9ca3af !important; }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE SCAN TOUR STEPS
// ══════════════════════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  // ── Welcome ──
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>Code Scanning',
      description:
        "Code Scanning analyzes your repository for vulnerabilities, code smells, and dependency issues. Let's walk through how to set it up.",
    },
  },

  // ── Import Repo button ──
  {
    element: "#tour-import-repo-btn",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Step 1 — Import a Repository',
      description:
        'Click <strong>"Import Repo"</strong> to start. This takes you to a 3-step wizard where you connect your Git provider and select a repository to scan.',
      side: "bottom" as const,
      align: "start" as const,
    },
  },

  // ── Explain the 3-step wizard ──
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>The Import Wizard (3 Steps)',
      description:
        'The wizard guides you through:<br/><br/><strong>1. Connect Provider</strong> — Link your GitHub or GitLab account (read-only access, we never modify your code).<br/><br/><strong>2. Choose Repository</strong> — Select which repo to scan from your connected account.<br/><br/><strong>3. Configure & Scan</strong> — Set a project key, choose a branch, and trigger the scan.',
    },
  },

  // ── Explain results ──
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>After the Scan Completes',
      description:
        'Once the scan finishes, a <strong>report</strong> appears with 4 sections:<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg><strong>Overview</strong> — Quality gate, metrics, grade<br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Issues</strong> — Code vulnerabilities & smells<br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><strong>Dependencies</strong> — Package vulnerabilities<br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><strong>Security Hotspots</strong> — Areas needing review',
    },
  },

  // ── Project cards ──
  {
    element: "#tour-project-list",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Your Scanned Projects',
      description:
        "After importing, your projects appear here as cards. Click any project to view its latest scan report, re-run scans, or check historical results.",
      side: "top" as const,
      align: "center" as const,
    },
  },

  // ── Done ──
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Ready to Scan!',
      description:
        'Click <strong>"Import Repo"</strong> to get started. Connect your GitHub or GitLab, pick a repo, and let Auto-Offensive analyze your code.<br/><br/>Click the <strong>Mission Briefing</strong> button anytime to replay this walkthrough.',
    },
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// CodeScanTour Component
// ══════════════════════════════════════════════════════════════════════════════

interface CodeScanTourProps {
  forceShow?: boolean;
  delay?: number;
  onComplete?: () => void;
}

export function CodeScanTour({
  forceShow = false,
  delay = 2000,
  onComplete,
}: CodeScanTourProps) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasStarted = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    injectDriverCSS();
    setMounted(true);
  }, []);

  const startTour = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    try {
      const driverObj = driver({
        animate: true,
        smoothScroll: true,
        stagePadding: 10,
        stageRadius: 12,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.75)",
        popoverClass: "guest-tour-popover",
        nextBtnText: "Next \u2192",
        prevBtnText: "\u2190 Back",
        doneBtnText: "Got it \u2713",
        showProgress: true,
        progressText: "{{current}} of {{total}}",
        steps: TOUR_STEPS,
        onDestroyed: () => {
          localStorage.setItem(TOUR_STORAGE_KEY, "true");
          hasStarted.current = false;
          driverRef.current = null;
          onComplete?.();
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
    } catch (err) {
      console.error("[CodeScanTour] Failed to start tour:", err);
      hasStarted.current = false;
    }
  }, [onComplete]);

  useEffect(() => {
    if (!mounted) return;
    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    if (hasCompleted && !forceShow) return;

    const timer = setTimeout(() => startTour(), delay);
    return () => clearTimeout(timer);
  }, [mounted, forceShow, delay, startTour]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      hasStarted.current = false;
      startTour();
    };
    window.addEventListener("start-codescan-tour", handler);
    return () => window.removeEventListener("start-codescan-tour", handler);
  }, [mounted, startTour]);

  useEffect(() => {
    return () => { driverRef.current?.destroy(); };
  }, []);

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// Code Scan Tour Trigger Button
// ══════════════════════════════════════════════════════════════════════════════

export function CodeScanTourTriggerButton() {
  const handleClick = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("start-codescan-tour"));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
      title="Replay the guided tour"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      Mission Briefing
    </button>
  );
}
