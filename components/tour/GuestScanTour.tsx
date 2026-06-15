"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { driver } from "driver.js";

// ─── Storage key ──────────────────────────────────────────────────────────────
const TOUR_STORAGE_KEY = "guest-scan-tour-completed";

// ─── Inject driver.js CSS dynamically ─────────────────────────────────────────
function injectDriverCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("driver-js-css")) return;

  const link = document.createElement("link");
  link.id = "driver-js-css";
  link.rel = "stylesheet";
  link.href = "/driver.css";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "guest-tour-custom-css";
  style.textContent = `
    .guest-tour-popover {
      background: #ffffff !important;
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,208,178,0.1) !important;
      max-width: 400px !important;
      padding: 0 !important;
      font-family: var(--font-google-sans), var(--font-noto-khmer), sans-serif !important;
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
      background: #f0fdfa;
      color: #0d9488;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #ccfbf1;
    }
    .guest-tour-popover .driver-popover-description strong {
      color: #111827;
      font-weight: 600;
    }
    .guest-tour-popover .driver-popover-progress-text {
      font-size: 11px !important;
      color: #9ca3af !important;
      padding: 0 20px !important;
    }
    .guest-tour-popover .driver-popover-navigation-btns {
      padding: 12px 20px 20px !important;
      gap: 8px !important;
    }
    .guest-tour-popover .driver-popover-next-btn {
      background: #00d0b2 !important;
      color: #000 !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      text-shadow: none !important;
    }
    .guest-tour-popover .driver-popover-prev-btn {
      background: transparent !important;
      color: #6b7280 !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      text-shadow: none !important;
    }
    .guest-tour-popover .driver-popover-close-btn {
      color: #9ca3af !important;
    }
    .dark .guest-tour-popover {
      background: #1f2937 !important;
    }
    .dark .guest-tour-popover .driver-popover-title {
      color: #f9fafb !important;
    }
    .dark .guest-tour-popover .driver-popover-description {
      color: #d1d5db !important;
    }
    .dark .guest-tour-popover .driver-popover-description code {
      background: rgba(0,208,178,0.1);
      color: #5eead4;
      border-color: rgba(0,208,178,0.2);
    }
    .dark .guest-tour-popover .driver-popover-description strong {
      color: #f9fafb;
    }
    .dark .guest-tour-popover .driver-popover-next-btn {
      background: #00d0b2 !important;
      color: #000 !important;
    }
    .dark .guest-tour-popover .driver-popover-prev-btn {
      border-color: #374151 !important;
      color: #9ca3af !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Helper: click a tab to navigate ──────────────────────────────────────────
function clickTab(tabId: string) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.click();
    // Small delay to let React re-render the panel
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TOUR STEPS — Edit these to change the tour content
//
// Each step can have:
//   element: CSS selector to highlight (omit for centered overlay)
//   popover.title: Step title
//   popover.description: HTML description
//   popover.side: "top" | "bottom" | "left" | "right"
//   popover.align: "start" | "center" | "end"
//
// To navigate tabs before a step, use onHighlightStarted callback
// ══════════════════════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  // ─────────────────────────────────────────────────────────────────────────
  // WELCOME
  // ─────────────────────────────────────────────────────────────────────────
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>Welcome to Auto-Offensive!',
      description:
        "Let's walk you through the scan dashboard. You'll learn how to run your first security scan in under a minute.",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SCAN MODE TABS OVERVIEW
  // ─────────────────────────────────────────────────────────────────────────
  {
    element: "[role='tablist']",
    popover: {
      title: "Scan Modes Overview",
      description:
        'There are <strong>3 scan modes</strong>:<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/></svg><strong>Basic</strong> — Single tool, quick scan<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/></svg><strong>Medium</strong> — Multi-tool pipeline (up to 4)<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/></svg><strong>Advanced</strong> — Full command-line control',
      side: "bottom" as const,
      align: "center" as const,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BASIC SCAN STEPS
  // ─────────────────────────────────────────────────────────────────────────
  {
    element: "#tab-basic",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>Basic Scan Mode',
      description:
        "Start here! Basic mode lets you run a <strong>single tool</strong> against one target with a preset. Perfect for quick reconnaissance.",
      side: "bottom" as const,
      align: "center" as const,
    },
    onHighlightStarted: () => { clickTab("tab-basic"); },
  },
  {
    element: "#tour-basic-target",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Step 1 — Enter Your Target',
      description:
        'Type your target domain or IP address.<br/><br/><strong>No need</strong> to include <code>https://</code> or trailing slashes.<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg>Example: <code>example.com</code><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Not: <code>https://example.com/</code>',
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-basic-tool",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Step 2 — Choose a Tool',
      description:
        "Select the scanning tool you want to use (e.g. <strong>httpx</strong>, <strong>subfinder</strong>, <strong>nmap</strong>). Each tool specializes in different types of reconnaissance.",
      side: "bottom" as const,
      align: "start" as const,
    },
  },
  {
    element: "#tour-basic-preset",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>Step 3 — Select Light or Deep Scan',
      description:
        '<strong>Light</strong> — Fast probe, outputs live URLs only (uses <code>-silent</code>).<br/><br/><strong>Deep</strong> — Collects richer HTTP metadata (uses <code>-silent -sc -title -td</code>).<br/><br/>Choose based on how much detail you need.',
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-basic-submit",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><polygon points="5 3 19 12 5 21 5 3"/></svg>Step 4 — Click Start Scan',
      description:
        'Click <strong>"Start Basic Scan"</strong> to launch your scan. It will begin processing immediately.',
      side: "top" as const,
      align: "center" as const,
    },
  },
  {
    element: "#tour-stream-logs",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Step 5 — Check the Terminal',
      description:
        "This is the <strong>stream logs terminal</strong>. Once a scan starts, results appear here in real-time. You'll see live output, status updates, and findings from the tool.",
      side: "top" as const,
      align: "center" as const,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MEDIUM SCAN STEPS — navigates to Medium tab automatically
  // ─────────────────────────────────────────────────────────────────────────
  {
    element: "#tab-medium",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Now let\'s look at Medium Mode',
      description:
        "Click this tab to switch to Medium scan. Let's explore what's different here.",
      side: "bottom" as const,
      align: "center" as const,
    },
    onHighlightStarted: () => { clickTab("tab-medium"); },
  },
  {
    element: "#panel-medium",
    popover: {
      title: "Medium Scan — Multi-Tool Pipeline",
      description:
        'In Medium mode you can select <strong>multiple tools</strong> that run in sequence.<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Up to <strong>4 tools</strong> per scan (shown as <code>2/4</code> counter).<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Each tool passes its output to the next one in the pipeline.<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Example: <code>subfinder → httpx → nuclei → nmap</code>',
      side: "right" as const,
      align: "start" as const,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ADVANCED SCAN STEPS — navigates to Advanced tab automatically
  // ─────────────────────────────────────────────────────────────────────────
  {
    element: "#tab-advanced",
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Finally, Advanced Mode',
      description:
        "Click this tab for full terminal control. Let's take a quick look.",
      side: "bottom" as const,
      align: "center" as const,
    },
    onHighlightStarted: () => { clickTab("tab-advanced"); },
  },
  {
    popover: {
      title: "Advanced Mode — Full Control",
      description:
        'Advanced mode gives you a <strong>real terminal</strong> where you can:<br/><br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Write custom commands with any flags<br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Chain tools manually<br/><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>Full control over execution<br/><br/>Best for experienced pentesters who know exactly what they want to run.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DONE — navigate back to Basic
  // ─────────────────────────────────────────────────────────────────────────
  {
    popover: {
      title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d0b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>You\'re All Set!',
      description:
        "Start with <strong>Basic mode</strong> to get familiar, then graduate to Medium and Advanced as you grow more comfortable.<br/><br/>Click the <strong>Mission Briefing</strong> button anytime to replay this walkthrough. Happy scanning!",
    },
    onHighlightStarted: () => { clickTab("tab-basic"); },
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// GuestScanTour Component
// ══════════════════════════════════════════════════════════════════════════════

interface GuestScanTourProps {
  forceShow?: boolean;
  delay?: number;
  onComplete?: () => void;
}

export function GuestScanTour({
  forceShow = false,
  delay = 2000,
  onComplete,
}: GuestScanTourProps) {
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
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it ✓",
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
      console.error("[GuestScanTour] Failed to start tour:", err);
      hasStarted.current = false;
    }
  }, [onComplete]);

  // Auto-start for first-time visitors
  useEffect(() => {
    if (!mounted) return;
    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    if (hasCompleted && !forceShow) return;

    // Check if MobileScreenWarning is currently visible (mobile < 768px)
    const isMobileWarningVisible = window.matchMedia("(max-width: 767px)").matches;

    if (isMobileWarningVisible) {
      // Wait for user to dismiss the mobile warning first
      const handler = () => {
        setTimeout(() => startTour(), 500);
      };
      window.addEventListener("mobile-warning-dismissed", handler, { once: true });
      return () => window.removeEventListener("mobile-warning-dismissed", handler);
    } else {
      // Desktop — no warning, start tour after delay
      const timer = setTimeout(() => startTour(), delay);
      return () => clearTimeout(timer);
    }
  }, [mounted, forceShow, delay, startTour]);

  // Listen for manual trigger
  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      hasStarted.current = false;
      startTour();
    };
    window.addEventListener("start-guest-tour", handler);
    return () => window.removeEventListener("start-guest-tour", handler);
  }, [mounted, startTour]);

  // Cleanup
  useEffect(() => {
    return () => { driverRef.current?.destroy(); };
  }, []);

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// Tour Trigger Button (replay)
// ══════════════════════════════════════════════════════════════════════════════

export function TourTriggerButton() {
  const handleClick = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("start-guest-tour"));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 text-xs font-[var(--font-google-sans),var(--font-noto-khmer),sans-serif] font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
      title="Replay the guided tour"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      Mission Briefing
    </button>
  );
}
