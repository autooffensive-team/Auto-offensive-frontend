"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Zap, PanelRight, X, Maximize2, Minimize2, Lightbulb } from "lucide-react";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { Terminal } from "@xterm/xterm";
import type { ActiveRun, LogLine, Project, ScanStep } from "@/types/scan";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import { LogToolbar } from "./LogToolbar";
import { useGraphStore } from "@/components/scanning/graph.store";
import { LOG_SIZES } from "@/lib/log-themes";
import { TerminalSidebar } from "./TerminalSidebar";
import { cn } from "@/lib/utils";

type NavigatorWithExtras = Navigator & {
  userAgentData?: {
    platform?: string;
    brands?: Array<{ brand: string; version: string }>;
  };
  connection?: {
    effectiveType?: string;
  };
};

// ─── Hacker Vibe Animations ───────────────────────────────────────────────────

const glitchAnimation = `
  @keyframes scanlines {
    0% { background-position: 0 0; }
    100% { background-position: 0 10px; }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(var(--ao-accent-rgb),0.3), inset 0 0 10px rgba(var(--ao-accent-rgb),0.1); }
    50%       { box-shadow: 0 0 20px rgba(var(--ao-accent-rgb),0.6), inset 0 0 20px rgba(var(--ao-accent-rgb),0.2); }
  }

  @keyframes cyber-border {
    0%, 100% { border-color: rgba(var(--ao-accent-rgb),0.3); box-shadow: 0 0 5px rgba(var(--ao-accent-rgb),0.2); }
    50%       { border-color: rgba(var(--ao-accent-rgb),0.8); box-shadow: 0 0 15px rgba(var(--ao-accent-rgb),0.5), inset 0 0 10px rgba(var(--ao-accent-rgb),0.1); }
  }

  @keyframes radar-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes blip-pulse {
    0%, 100% { opacity: 0.7; box-shadow: 0 0 6px rgba(34,211,155,0.8), 0 0 12px rgba(16,185,129,0.4); }
    50%       { opacity: 1;   box-shadow: 0 0 10px rgba(34,211,155,1),   0 0 20px rgba(16,185,129,0.6); }
  }

  @keyframes radar-pulse-active {
    0%   { box-shadow: 0 0 0 0   rgba(34,211,155,0.7); }
    50%  { box-shadow: 0 0 0 8px rgba(34,211,155,0.2); }
    100% { box-shadow: 0 0 0 0   rgba(34,211,155,0);   }
  }

  @keyframes radar-pulse-found {
    0%, 100% { box-shadow: 0 0 16px rgba(34,211,155,1), 0 0 32px rgba(16,185,129,0.6), inset 0 0 8px rgba(255,255,255,0.3); }
    50%       { box-shadow: 0 0 24px rgba(34,211,155,1), 0 0 48px rgba(16,185,129,0.8), inset 0 0 12px rgba(255,255,255,0.5); }
  }

  .radar-container {
    position: relative;
    background: radial-gradient(circle at center, rgba(10,10,10,0.9) 0%, rgba(5,5,5,1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
  }

  .radar-base {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .radar-ring {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    border: 1.2px solid rgba(34,211,155,0.35);
    border-radius: 50%;
  }

  .radar-ring-1 { width: 85%; height: 85%; }
  .radar-ring-2 { width: 55%; height: 55%; }
  .radar-ring-3 { width: 25%; height: 25%; }

  .radar-sweep {
    position: absolute;
    top: 0; left: 50%;
    width: 2px; height: 50%;
    transform-origin: bottom center;
    background: linear-gradient(to top, rgba(34,211,155,0.9), rgba(34,211,155,0.4), rgba(34,211,155,0));
    z-index: 2;
    box-shadow: 0 0 8px rgba(34,211,155,0.6);
  }

  .radar-sweep.active   { animation: radar-spin 4s linear infinite; }
  .radar-sweep.scanning { animation: radar-spin 3.5s linear infinite; }

  .radar-center {
    position: absolute;
    top: 50%; left: 50%;
    width: 10px; height: 10px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(167,243,208,1), rgba(34,211,155,0.8));
    border-radius: 50%;
    z-index: 4;
    box-shadow: 0 0 16px rgba(34,211,155,1), 0 0 32px rgba(16,185,129,0.6), inset 0 0 8px rgba(255,255,255,0.3);
  }

  .radar-center.scanning { animation: radar-pulse-active 1.5s ease-in-out infinite; }
  .radar-center.found    { animation: radar-pulse-found  1s   ease-in-out infinite; }

  .radar-blip {
    position: absolute;
    background: radial-gradient(circle, rgba(167,243,208,1), rgba(34,211,155,0.6));
    border-radius: 50%;
    z-index: 3;
    animation: blip-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(34,211,155,0.9);
  }

  .scanline-bg {
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.15),
      rgba(0,0,0,0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: scanlines 8s linear infinite;
  }

  .cyber-pulse  { animation: pulse-glow 2s ease-in-out infinite; }
  .cyber-border { animation: cyber-border 2s ease-in-out infinite; }

  /* ─── Window dot glow cycles — pure CSS, zero JS/RAF overhead ─────── */
  @keyframes dot-red    { 0%,100%{box-shadow:0 0 10px #ff0000}50%{box-shadow:0 0 5px #ff0000} }
  @keyframes dot-yellow { 0%,100%{box-shadow:0 0 10px #ffff00}50%{box-shadow:0 0 5px #ffff00} }
  @keyframes dot-green  { 0%,100%{box-shadow:0 0 10px #00ff00}50%{box-shadow:0 0 5px #00ff00} }
  @keyframes status-dot { 0%,100%{opacity:.4}50%{opacity:1} }

  .dot-red    { animation: dot-red    1.5s ease-in-out infinite; }
  .dot-yellow { animation: dot-yellow 1.5s ease-in-out infinite 0.3s; }
  .dot-green  { animation: dot-green  1.5s ease-in-out infinite 0.6s; }
  .status-dot { animation: status-dot 1.2s ease-in-out infinite; }

  .terminal-glow {
    box-shadow: 0 0 20px rgba(var(--ao-accent-rgb),0.3), inset 0 0 20px rgba(0,0,0,0.5);
  }

  /* ─── Circuit Traces ─────────────────────────────────────────────────── */
  @keyframes trace-flow { to { stroke-dashoffset: 0; } }

  .circuit-traces {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    overflow: hidden;
    pointer-events: none;
    opacity: 0.45;
    z-index: 0 !important;
    /* Own compositing layer — repaints stay isolated from xterm canvas */
    will-change: transform;
    transform: translateZ(0);
    contain: strict;
  }

  /* Topbar SVG wrapper — promoted layer so stroke animation
     never invalidates the terminal canvas below */
  .trace-svg-isolated {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    will-change: transform;
    transform: translateZ(0);
    contain: strict;
  }

  .trace-base { stroke: rgba(var(--ao-accent-rgb),0.15); stroke-width: 1; fill: none; }
  .trace-flow { fill: none; stroke-width: 1.5; stroke-dasharray: 12 180; stroke-dashoffset: 192; animation: trace-flow 4s cubic-bezier(0.4,0,0.85,1) infinite; }

  .trace-c1 { stroke: rgba(var(--ao-accent-rgb),1); }
  .trace-c2 { stroke: rgba(var(--ao-accent-rgb),0.85); animation-delay: -1.2s; }
  .trace-c3 { stroke: rgba(var(--ao-accent-rgb),0.7); animation-delay: -2.4s; }
  .trace-c4 { stroke: rgba(var(--ao-accent-rgb),0.9); animation-delay: -0.6s; }
  .trace-dot { fill: rgba(var(--ao-accent-rgb),0.4); }

  /* ─── Corner Brackets ────────────────────────────────────────────────── */
  .corner-bracket { position: absolute; width: 80px; height: 80px; pointer-events: none; }
  .corner-bracket-tl { top: 0; left: 0; border-top: 2px solid rgba(var(--ao-accent-rgb),0.4); border-left: 2px solid rgba(var(--ao-accent-rgb),0.4); border-top-left-radius: 4px; }
  .corner-bracket-tl::before, .corner-bracket-tl::after { content: ''; position: absolute; background: rgba(var(--ao-accent-rgb),0.6); }
  .corner-bracket-tl::before { width: 20px; height: 2px; top: -2px; left: 30px; }
  .corner-bracket-tl::after  { width: 2px; height: 20px; left: -2px; top: 30px; }
  .corner-bracket-tr { top: 0; right: 0; border-top: 2px solid rgba(var(--ao-accent-rgb),0.4); border-right: 2px solid rgba(var(--ao-accent-rgb),0.4); border-top-right-radius: 4px; }
  .corner-bracket-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(var(--ao-accent-rgb),0.4); border-left: 2px solid rgba(var(--ao-accent-rgb),0.4); border-bottom-left-radius: 4px; }
  .corner-bracket-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(var(--ao-accent-rgb),0.4); border-right: 2px solid rgba(var(--ao-accent-rgb),0.4); border-bottom-right-radius: 4px; }

  .terminal-content { position: relative; z-index: 10; }

  /* ─── Sidebar Drawer (mobile/tablet overlay) ─────────────────────────── */
  .sidebar-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 9998;
  }

  .sidebar-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: min(320px, 85vw);
    z-index: 9999;
    overflow-y: auto;
  }

  /* ─── Fix xterm viewport overflow on mobile ──────────────────────────── */
  .xterm-viewport {
    overflow-y: auto !important;
  }
  .xterm-screen {
    /* prevent the xterm canvas from overflowing its wrapper */
    max-width: 100% !important;
  }

  /* ─── Fullscreen Mode ─────────────────────────────────────────────────── */
  .advanced-terminal-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    width: 100vw !important;
    height: 100vh !important;
    display: flex;
    flex-direction: column;
    border-radius: 0 !important;
    background: #000 !important;
  }

  .advanced-terminal-fullscreen .terminal-topbar {
    flex-shrink: 0;
  }

  .advanced-terminal-fullscreen .terminal-flex-container {
    flex: 1;
    min-height: 0;
    display: flex;
    width: 100%;
  }

  .advanced-terminal-fullscreen .terminal-main {
    flex: 1;
    min-height: 0;
    display: flex;
    width: 100%;
  }

  .advanced-terminal-fullscreen .xterm {
    width: 100%;
    height: 100%;
  }

  .advanced-terminal-fullscreen .xterm-viewport {
    height: 100% !important;
  }

  /* Ensure body doesn't scroll in fullscreen */
  body.terminal-fullscreen-active {
    overflow: hidden !important;
  }

  body.terminal-fullscreen-active .dashboard-topbar,
  body.terminal-fullscreen-active .dashboard-sidebar {
    display: none !important;
  }

  body.terminal-fullscreen-active .dashboard-content-shell {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }

  /* Guest standalone advanced scan sidebar */
  body.terminal-fullscreen-active .advance-scan-sidebar {
    display: none !important;
  }

  /* Responsive adjustments for fullscreen */
  @media (max-width: 768px) {
    .advanced-terminal-fullscreen .terminal-topbar {
      padding: 0.75rem !important;
    }

    .advanced-terminal-fullscreen {
      font-size: 12px;
    }
  }
`;
const SPLASH_LINES = [
  "",
  "  \x1b[1m\x1b[92mauto-offensive\x1b[0m  \x1b[1m·  advanced scan\x1b[0m",
  "  \x1b[2m────────────────────────────────────────\x1b[0m",
  "  \x1b[33mUsage   \x1b[0m  <tool> [flags] [| <tool> ...]",
  "  \x1b[33mExample \x1b[0m  \x1b[92mnuclei -u https://example.com\x1b[0m",
  "  \x1b[33mPipeline\x1b[0m  \x1b[92msubfinder -d example.com | httpx\x1b[0m",
  "  \x1b[33mHelp    \x1b[0m  \x1b[1mCtrl+C to cancel  ·  clear to reset\x1b[0m",
  "  \x1b[2m────────────────────────────────────────\x1b[0m",
  "",
];

const SPLASH = SPLASH_LINES.join("\r\n");

// ─── Help text ────────────────────────────────────────────────────────────────
const HELP_LINES = [
  "",
  "  \x1b[1m\x1b[96mAuto-Offensive Advanced Scan — Help\x1b[0m",
  "  \x1b[2m────────────────────────────────────────────────────────\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mSingle Tool:\x1b[0m",
  "    \x1b[96m<tool>\x1b[0m [flags]",
  "    Example: \x1b[92mnuclei -u https://example.com\x1b[0m",
  "    Example: \x1b[92mnmap -sV -p 80,443 target.com\x1b[0m",
  "    Example: \x1b[92msubfinder -d example.com -silent\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mPipeline (chain tools with |):\x1b[0m",
  "    \x1b[96m<tool>\x1b[0m [flags] \x1b[1m|\x1b[0m \x1b[96m<tool>\x1b[0m [flags] \x1b[1m|\x1b[0m ...",
  "    Example: \x1b[92msubfinder -d example.com | httpx\x1b[0m",
  "    Example: \x1b[92msubfinder -d example.com | httpx | nuclei\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mFlags:\x1b[0m",
  "    Any valid tool flag works — you do \x1b[1mnot\x1b[0m need it listed in medium mode.",
  "    Use \x1b[96m-flag value\x1b[0m or \x1b[96m-flag=value\x1b[0m (e.g. \x1b[92mhttpx -fc 404\x1b[0m).",
  "    Only globally denied flags (e.g. \x1b[2m-o, --proxy\x1b[0m) are blocked.",
  "",
  "    \x1b[96msubfinder\x1b[0m    Subdomain discovery",
  "    \x1b[96mhttpx\x1b[0m        HTTP probing & tech detection",
  "    \x1b[96mnuclei\x1b[0m       Vulnerability scanning",
  "    \x1b[96mnmap\x1b[0m         Port scanning & service detection",
  "    \x1b[96mnaabu\x1b[0m        Fast port scanning",
  "    \x1b[96mkatana\x1b[0m       Web crawling",
  "    \x1b[96mffuf\x1b[0m         Web fuzzing",
  "    \x1b[96mamass\x1b[0m        Attack surface mapping",
  "",
  "  \x1b[1m\x1b[33mCommands:\x1b[0m",
  "    \x1b[96mclear\x1b[0m        Clear terminal and reset graph",
  "    \x1b[96mhelp\x1b[0m         Show this help message",
  "    \x1b[96mCtrl+C\x1b[0m       Cancel running scan",
  "",
  "  \x1b[1m\x1b[33mKeyboard Shortcuts:\x1b[0m",
  "    \x1b[1m↑/↓\x1b[0m          Browse command history",
  "    \x1b[1mCtrl+A\x1b[0m       Move cursor to start",
  "    \x1b[1mCtrl+E\x1b[0m       Move cursor to end",
  "    \x1b[1mCtrl+U\x1b[0m       Clear line before cursor",
  "    \x1b[1mCtrl+K\x1b[0m       Clear line after cursor",
  "",
  "  \x1b[2m────────────────────────────────────────────────────────\x1b[0m",
  "",
];

const HELP_TEXT = HELP_LINES.join("\r\n");

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    isMobile: width < 640,          
    isTablet: width >= 640 && width < 1024, // sm–lg
    isDesktop: width >= 1024,        // lg+
    isNarrow: width < 1024,          // mobile + tablet
    width,
  };
}

export const AdvancedTerminalPanel = React.memo(function AdvancedTerminalPanel({
  projectId,
  selectedProject,
  logs,
  run,
  errors,
  isSubmitting,
  isStreaming,
  onSubmit,
  onReset,
}: {
  projectId: string;
  selectedProject: Project | undefined;
  logs: LogLine[];
  run: ActiveRun;
  errors: string[];
  isSubmitting: boolean;
  isStreaming?: boolean;
  onSubmit: (command: string) => void;
  onReset: () => void;
}) {
  const {
    themeKey, sizeKey, decorationsEnabled,
    theme: logTheme, size: logSize,
    setTheme, setSize, setDecorations, resetToDefault,
  } = useLogPreferences();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<{ fit: () => void } | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const { isMobile, isTablet, isNarrow } = useBreakpoint();

  const showDecorations = decorationsEnabled;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  // ── Input state ──────────────────────────────────────────────────────────
  const lineRef = useRef("");
  const cursorRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);

  const logCursorRef = useRef(0);
  const isInputActiveRef = useRef(true);
  const isMobileRef = useRef(isMobile);         
  const selectedProjectRef = useRef(selectedProject);
  const onSubmitRef = useRef(onSubmit);
  const onResetRef = useRef(onReset);
  const prevStepsRef = useRef<ScanStep[]>([]);
  const prevStatusRef = useRef("idle");
  const prevErrorsLenRef = useRef(0);
  const lastFailureSignatureRef = useRef("");

  // ── Theme accent — drives border/glow colors across the whole panel ────────
  // Uses the xterm cursor color as the primary accent for the current theme.
  // The default theme cursor is #2dd4bf (teal-ish green), which matches the
  // existing hardcoded green values so the default appearance is unchanged.
  const themeAccent = useMemo(() => {
    const hex = logTheme.xterm.cursor ?? "#2dd4bf";
    // Parse #rrggbb into r,g,b integers
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgb = `${r},${g},${b}`;
    return {
      /** Full accent color at a given opacity */
      at: (alpha: number) => `rgba(${rgb},${alpha})`,
      /** Bare "r,g,b" string for CSS custom property */
      rgb,
      hex,
    };
  }, [logTheme.xterm.cursor]);

  // Push the accent CSS variable directly to the DOM so CSS classes using
  // var(--ao-accent-rgb) always stay in sync — bypasses any framer-motion
  // style-prop caching and React.memo short-circuits.
  useEffect(() => {
    panelRef.current?.style.setProperty("--ao-accent-rgb", themeAccent.rgb);
  }, [themeAccent.rgb]);

  const terminalTheme = useMemo(() => logTheme.xterm, [logTheme]);
  const terminalFontSize = useMemo(() => {
    if (isMobile) return 12;
    if (isTablet) return Math.max(11, logSize.xtermFontSize);
    return logSize.xtermFontSize + 1;
  }, [logSize.xtermFontSize, isMobile, isTablet]);

  const terminalLetterSpacing = useMemo(() => {
    if (isMobile) return 0;
    if (logSize.xtermFontSize >= LOG_SIZES.xxl.xtermFontSize) return 3.5;
    if (logSize.xtermFontSize >= LOG_SIZES.xl.xtermFontSize)  return 2.75;
    if (logSize.xtermFontSize >= LOG_SIZES.lg.xtermFontSize)  return 1.9;
    if (logSize.xtermFontSize >= LOG_SIZES.md.xtermFontSize)  return 0.25;
    return 0.2;
  }, [logSize.xtermFontSize, isMobile]);

  const terminalLineHeight = useMemo(() => logSize.terminalLineHeight, [logSize.terminalLineHeight]);

  // ── System profile ────────────────────────────────────────────────────────
  const buildProfile = useCallback(() => {
    if (typeof navigator === "undefined") return [
      { label: "Browser",   value: "Browser",    tone: "text-green-300" },
      { label: "OS",        value: "Unknown OS", tone: "text-green-300" },
      { label: "CPU Cores", value: "—",          tone: "text-green-300" },
      { label: "Network",   value: "Online",     tone: "text-emerald-300" },
    ];
    const nav = navigator as NavigatorWithExtras;
    const ua = nav.userAgent ?? "";
    const edgeVer    = ua.match(/Edg\/([\d]+)/i)?.[1];
    const chromeVer  = ua.match(/Chrome\/([\d]+)/i)?.[1];
    const firefoxVer = ua.match(/Firefox\/([\d]+)/i)?.[1];
    const operaVer   = ua.match(/(?:OPR|Opera)\/([\d]+)/i)?.[1];
    const safariVer  = ua.match(/Version\/([\d]+).*Safari/i)?.[1];
    const brandFallback = nav.userAgentData?.brands?.find((item) => !/not.?a.?brand/i.test(item.brand));

    const browser = edgeVer    ? `Edge ${edgeVer}`
      : operaVer               ? `Opera ${operaVer}`
      : firefoxVer             ? `Firefox ${firefoxVer}`
      : safariVer && !chromeVer ? `Safari ${safariVer}`
      : chromeVer              ? `Chrome ${chromeVer}`
      : brandFallback          ? `${brandFallback.brand} ${String(brandFallback.version).split(".")[0]}`
      : "Browser";

    const hint = `${nav.userAgentData?.platform ?? ""} ${nav.platform ?? ""} ${ua}`.toLowerCase();
    const os = /iphone|ipad|ipod/.test(hint) ? "iOS"
      : /android/.test(hint)               ? "Android"
      : /macintosh|mac os x|macos/.test(hint) ? "macOS"
      : /win/.test(hint)                   ? "Windows"
      : /linux/.test(hint)                 ? "Linux"
      : "Unknown OS";

    const cores = Number.isFinite(nav.hardwareConcurrency) ? `${nav.hardwareConcurrency} cores` : "—";
    const isOnline = nav.onLine;

    return [
      { label: "Browser",   value: browser,                         tone: "text-green-300" },
      { label: "OS",        value: os,                              tone: "text-green-300" },
      { label: "CPU Cores", value: cores,                           tone: "text-green-300" },
      { label: "Network",   value: isOnline ? "Online" : "Offline", tone: isOnline ? "text-emerald-300" : "text-red-400" },
    ];
  }, []);

  const [systemProfile, setSystemProfile] = useState(() => [
    { label: "Browser",   value: "—", tone: "text-green-300" },
    { label: "OS",        value: "—", tone: "text-green-300" },
    { label: "CPU Cores", value: "—", tone: "text-green-300" },
    { label: "Network",   value: "—", tone: "text-emerald-300" },
  ]);

  useEffect(() => { setSystemProfile(buildProfile()); }, [buildProfile]);

  useEffect(() => {
    const update = () =>
      setSystemProfile((prev) =>
        prev.map((item) =>
          item.label === "Network"
            ? { ...item, value: navigator.onLine ? "Online" : "Offline", tone: navigator.onLine ? "text-emerald-300" : "text-red-400" }
            : item
        )
      );
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);
  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);

  // ── Fullscreen ESC key handler ───────────────────────────────────────────
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  // ── Fullscreen body class management ──────────────────────────────────────
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("terminal-fullscreen-active");
    } else {
      document.body.classList.remove("terminal-fullscreen-active");
    }
    return () => document.body.classList.remove("terminal-fullscreen-active");
  }, [isFullscreen]);
  const getPrompt = useCallback(() => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    if (isMobileRef.current) {
      return `\r\n\x1b[1m\x1b[32m[${project}]\x1b[0m\x1b[1m\x1b[32m❯\x1b[0m \x1b[s`;
    }
    return `\r\n\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m \x1b[s`;
  }, []);
  const prevRenderedLenRef = useRef(0); 

  const redrawLine = useCallback((term: Terminal) => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    const buf = lineRef.current;
    const cur = cursorRef.current;
    term.write("\x1b[u\x1b[J");

    term.write(buf);

    const charsAfterCursor = buf.length - cur;
    if (charsAfterCursor > 0) term.write(`\x1b[${charsAfterCursor}D`);

    const promptPlain = isMobileRef.current
      ? `[${project}]❯ `
      : `[${project}@auto-offensive]$ `;
    prevRenderedLenRef.current = promptPlain.length + buf.length;
  }, []);

  // ── Splash / clear ───────────────────────────────────────────────────────
  // Build a theme-aware splash — the "Ctrl+C..." hint line uses a lightened
  // version of the theme's cursor (primary accent) so it always reads as a
  // bright pastel of that hue: light-green on Matrix, light-purple on NeonCity,
  // light-pink on Dracula, light-blue on Nord, etc.
  // For light themes (Light, Solarized Light) the pastel would be invisible so
  // we use black text instead.
  const buildSplash = useCallback(() => {
    const isLight = logTheme.html.isLight;
    const hex = logTheme.xterm.cursor ?? "#86efac";
    const r0 = parseInt(hex.slice(1, 3), 16);
    const g0 = parseInt(hex.slice(3, 5), 16);
    const b0 = parseInt(hex.slice(5, 7), 16);
    // Blend 55% toward white → bright pastel of the accent hue.
    const mix = 0.55;
    const r = Math.round(r0 + (255 - r0) * mix);
    const g = Math.round(g0 + (255 - g0) * mix);
    const b = Math.round(b0 + (255 - b0) * mix);
    // Light themes: use black (30) for all hint text so it's readable on pale bg.
    const light = isLight ? `\x1b[30m` : `\x1b[38;2;${r};${g};${b}m`;
    const lines = [
      "",
      `  \x1b[1m\x1b[92mauto-offensive\x1b[0m  \x1b[1m${light}·  advanced scan\x1b[0m`,
      `  \x1b[2m${light}────────────────────────────────────────\x1b[0m`,
      `  \x1b[33mUsage   \x1b[0m  <tool> [flags] [| <tool> ...]`,
      `  \x1b[33mExample \x1b[0m  \x1b[92mnuclei -u https://example.com\x1b[0m`,
      `  \x1b[33mPipeline\x1b[0m  \x1b[92msubfinder -d example.com | httpx\x1b[0m`,
      `  \x1b[33mHelp    \x1b[0m  \x1b[1m${light}Ctrl+C to cancel  ·  clear to reset\x1b[0m`,
      `  \x1b[2m${light}────────────────────────────────────────\x1b[0m`,
      "",
    ];
    return lines.join("\r\n");
  }, [logTheme.xterm.cursor, logTheme.html.isLight]);

  const showSplash = useCallback((term: Terminal) => {
    term.write("\x1b[3J\x1b[2J\x1b[H");
    term.write("\r\n");
    term.write(buildSplash());
    term.write("\r\n");
  }, [buildSplash]);
  const safeFit = useCallback((fitAddon: { fit: () => void }, maxTries = 5) => {
    let tries = 0;
    const attempt = () => {
      if (!containerRef.current) return;
      const { offsetWidth } = containerRef.current;
      if (offsetWidth > 0) {
        fitAddon.fit();
        return;
      }
      if (++tries < maxTries) {
        requestAnimationFrame(() => setTimeout(attempt, 50));
      }
    };
    requestAnimationFrame(() => setTimeout(attempt, 0));
  }, []);

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;

    async function boot() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        convertEol: false,
        fontFamily: "var(--font-fira-code), 'Fira Code', Consolas, 'Courier New', monospace",
        fontSize: terminalFontSize,
        letterSpacing: terminalLetterSpacing,
        fontWeight: 400,
        fontWeightBold: 700,
        lineHeight: terminalLineHeight,
        scrollback: 10000,
        theme: terminalTheme,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      safeFit(fitAddon);
      fitAddonRef.current = fitAddon;

      showSplash(term);
      term.write(getPrompt());

      term.onData((data) => {
        if (data === "\x03") {
          const isRunning = !isInputActiveRef.current;
          if (isRunning) { setShowCancelModal(true); return; }
          lineRef.current = "";
          cursorRef.current = 0;
          histIdxRef.current = -1;
          prevRenderedLenRef.current = 0;
          term.write("^C");
          term.write(getPrompt());
          return;
        }

        if (!isInputActiveRef.current) return;
        if (data === "\r" || data === "\n") {
          const cmd = lineRef.current.trim();
          prevRenderedLenRef.current = 0;
          term.write("\r\n");
          lineRef.current = "";
          cursorRef.current = 0;

          if (cmd === "clear") {
            histIdxRef.current = -1;
            term.reset();
            term.write(getPrompt());
            useGraphStore.getState().reset();
            return;
          }
          if (cmd === "help") { term.write(HELP_TEXT); term.write(getPrompt()); return; }
          if (cmd) {
            if (historyRef.current[0] !== cmd) {
              historyRef.current.unshift(cmd);
              if (historyRef.current.length > 100) historyRef.current.pop();
            }
            histIdxRef.current = -1;
            isInputActiveRef.current = false;
            onSubmitRef.current(cmd);
          } else {
            term.write(getPrompt());
          }
          return;
        }

        if (data === "\u007f") {
          if (cursorRef.current === 0) return;
          const buf = lineRef.current;
          lineRef.current = buf.slice(0, cursorRef.current - 1) + buf.slice(cursorRef.current);
          cursorRef.current -= 1;

          if (cursorRef.current === lineRef.current.length) {
            term.write("\b \b");
          } else {
            redrawLine(term);
          }
          return;
        }

        if (data.startsWith("\x1b[") || data.startsWith("\x1bO")) {
          if (data === "\x1b[D") { if (cursorRef.current > 0) { cursorRef.current -= 1; term.write("\x1b[D"); } return; }
          if (data === "\x1b[C") { if (cursorRef.current < lineRef.current.length) { cursorRef.current += 1; term.write("\x1b[C"); } return; }
          if (data === "\x1b[A") {
            const hist = historyRef.current;
            if (!hist.length) return;
            const nextIdx = Math.min(histIdxRef.current + 1, hist.length - 1);
            histIdxRef.current = nextIdx;
            lineRef.current = hist[nextIdx];
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          if (data === "\x1b[B") {
            if (histIdxRef.current <= 0) { histIdxRef.current = -1; lineRef.current = ""; cursorRef.current = 0; redrawLine(term); return; }
            histIdxRef.current -= 1;
            lineRef.current = historyRef.current[histIdxRef.current];
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          if (data === "\x1b[H" || data === "\x01") { cursorRef.current = 0; redrawLine(term); return; }
          if (data === "\x1b[F" || data === "\x05") { cursorRef.current = lineRef.current.length; redrawLine(term); return; }
          if (data === "\x1b[3~") {
            if (cursorRef.current >= lineRef.current.length) return;
            const buf = lineRef.current;
            lineRef.current = buf.slice(0, cursorRef.current) + buf.slice(cursorRef.current + 1);
            redrawLine(term);
            return;
          }
          if (data === "\x1b[1;5D" || data === "\x1bb") {
            let pos = cursorRef.current;
            while (pos > 0 && lineRef.current[pos - 1] === " ") pos--;
            while (pos > 0 && lineRef.current[pos - 1] !== " ") pos--;
            cursorRef.current = pos; redrawLine(term); return;
          }
          if (data === "\x1b[1;5C" || data === "\x1bf") {
            let pos = cursorRef.current;
            const len = lineRef.current.length;
            while (pos < len && lineRef.current[pos] !== " ") pos++;
            while (pos < len && lineRef.current[pos] === " ") pos++;
            cursorRef.current = pos; redrawLine(term); return;
          }
          return;
        }

        if (data === "\x01") { cursorRef.current = 0; redrawLine(term); return; }
        if (data === "\x05") { cursorRef.current = lineRef.current.length; redrawLine(term); return; }
        if (data === "\x0b") { lineRef.current = lineRef.current.slice(0, cursorRef.current); redrawLine(term); return; }
        if (data === "\x15") { lineRef.current = lineRef.current.slice(cursorRef.current); cursorRef.current = 0; redrawLine(term); return; }

        const printable = data.replace(/[\x00-\x1f\x7f]/g, "");
        if (!printable) return;

        const buf = lineRef.current;
        const atEnd = cursorRef.current === buf.length;
        lineRef.current = buf.slice(0, cursorRef.current) + printable + buf.slice(cursorRef.current);
        cursorRef.current += printable.length;

        if (atEnd) {
          term.write(printable);
        } else {
          redrawLine(term);
        }
      });
      ro = new ResizeObserver(() => {
        requestAnimationFrame(() => fitAddon.fit());
      });
      ro.observe(containerRef.current);
      termRef.current = term;
    }

    boot();
    return () => {
      disposed = true;
      ro?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (termRef.current?.options) termRef.current.options.theme = terminalTheme;
  }, [terminalTheme]);
  // When theme changes and terminal is idle, redraw the splash so the accent
  // colors update immediately without needing a manual reset.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    // Don't wipe output while a scan is running
    if (isSubmitting || isStreaming) return;
    showSplash(term);
    term.write(getPrompt());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalTheme]);
  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.fontSize = terminalFontSize;
      termRef.current.options.lineHeight = logSize.terminalLineHeight;
      termRef.current.options.letterSpacing = terminalLetterSpacing;
      fitAddonRef.current?.fit();
    }
  }, [logSize.xtermFontSize, logSize.terminalLineHeight, terminalFontSize, terminalLetterSpacing, terminalLineHeight, terminalTheme]);
  useEffect(() => {
    const timer = setTimeout(() => fitAddonRef.current?.fit(), 300);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    const timer = setTimeout(() => fitAddonRef.current?.fit(), 100);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const spinnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinnerLineRef = useRef(false);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const isWaiting = isSubmitting && logs.length === 0;

    if (isWaiting && !spinnerRef.current) {
      const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
      const messages = [
        "Initializing scan engine",
        "Establishing connection",
        "Negotiating protocol",
        "Probing target surface",
        "Enumerating services",
        "Waiting for scan output",
      ];
      let frameIdx = 0, msgIdx = 0, tick = 0;
      spinnerLineRef.current = true;
      spinnerRef.current = setInterval(() => {
        frameIdx = (frameIdx + 1) % frames.length;
        tick++;
        if (tick % 30 === 0) msgIdx = (msgIdx + 1) % messages.length;
        term.write(`\r\x1b[K\x1b[96m  ${frames[frameIdx]} \x1b[0m\x1b[97m${messages[msgIdx]}...\x1b[0m`);
      }, 80);
    }

    if (!isWaiting && spinnerRef.current) {
      clearInterval(spinnerRef.current);
      spinnerRef.current = null;
      if (spinnerLineRef.current) { term.write(`\r\x1b[K`); spinnerLineRef.current = false; }
    }

    return () => {
      if (spinnerRef.current) { clearInterval(spinnerRef.current); spinnerRef.current = null; }
    };
  }, [isSubmitting, logs.length]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    if (logs.length === 0) { logCursorRef.current = 0; return; }
    const newLines = logs.slice(logCursorRef.current);
    if (!newLines.length) return;
    logCursorRef.current = logs.length;
    // Write in a single chunk to avoid UI freezing on bursty output.
    const chunk = newLines.map((line) => {
      const time = new Date(line.timestamp).toLocaleTimeString();
      let col = "\x1b[0m";
      const lvl = line.level.toLowerCase();
      if (lvl.includes("error") || lvl.includes("fail")) col = "\x1b[91m";
      else if (lvl.includes("warn"))                      col = "\x1b[93m";
      else if (lvl === "done" || lvl === "submitted")     col = "\x1b[92m";
      else if (lvl === "log")                             col = "\x1b[96m";
      term.write(`\r\x1b[2m[${time}]\x1b[0m \x1b[96m[${line.source}]\x1b[0m ${col}${line.text}\x1b[0m\r\n`);
    });
  }, [logs]);
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const isFailed = run.status.includes("FAILED") || run.status === "failed";
    if (isFailed) return;

    const newErrs = errors.slice(prevErrorsLenRef.current);
    if (!newErrs.length) return;
    prevErrorsLenRef.current = errors.length;
    newErrs.forEach((e) => term.write(`\r\x1b[1m\x1b[31m[ERROR] ${e}\x1b[0m\r\n`));
  }, [errors]);
  useEffect(() => {
    const term = termRef.current;
    const status = run.status;
    if (!term || status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    if (status === "submitting") {
      term.write(`\x1b[36m→ Submitting scan…\x1b[0m\r\n`);
    } else if (status.includes("COMPLETED")) {
      term.write(`\r\x1b[1m\x1b[32m✓ Scan completed — findings: ${run.findings}\x1b[0m\r\n`);
      isInputActiveRef.current = true; term.write(getPrompt());
    } else if (status.includes("FAILED")) {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
      isInputActiveRef.current = true; term.write(getPrompt());
    } else if (status.includes("CANCELLED") || status.includes("PARTIAL")) {
      term.write(`\r\x1b[1m\x1b[33m⚠ Scan ${status.replace("JOB_STATUS_", "").toLowerCase()}.\x1b[0m\r\n`);
      isInputActiveRef.current = true; term.write(getPrompt());
    } else if (status === "failed") {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
      isInputActiveRef.current = true; term.write(getPrompt());
    } else if (status === "idle") {
      prevStepsRef.current = [];
      prevErrorsLenRef.current = 0;
      lastFailureSignatureRef.current = "";
      isInputActiveRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.status, run.findings]);

  // ── Cancel handlers ──────────────────────────────────────────────────────
  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    const term = termRef.current;
    if (term) term.write("\r\n\x1b[1m\x1b[33m⚠ Scan cancelled by user.\x1b[0m\r\n");
    lineRef.current = "";
    cursorRef.current = 0;
    histIdxRef.current = -1;
    isInputActiveRef.current = true;
    onResetRef.current();
    useGraphStore.getState().reset();
    if (term) term.write(getPrompt());
  }, [getPrompt]);

  const handleReset = useCallback(() => {
    const term = termRef.current;
    lineRef.current = "";
    cursorRef.current = 0;
    histIdxRef.current = -1;
    prevRenderedLenRef.current = 0;
    isInputActiveRef.current = true;
    onResetRef.current();
    useGraphStore.getState().reset();
    if (term) { term.reset(); showSplash(term); term.write(getPrompt()); }
  }, [getPrompt, showSplash]);

  const handleDismissCancel = useCallback(() => setShowCancelModal(false), []);
  const termContainerStyle = useMemo(() => {
    if (isNarrow) {
      return {
        backgroundColor: "rgba(0,0,0,0.85)",
        borderTop: `2px solid ${themeAccent.at(0.2)}`,
        position: "absolute" as const,
        inset: 0,
        right: 0,  
        zIndex: 2,
        overflow: "hidden" as const,
        minWidth: 0,
      };
    }
    return {
      backgroundColor: "rgba(0,0,0,0.85)",
      borderRight: `2px solid ${themeAccent.at(0.2)}`,
      borderTop: `2px solid ${themeAccent.at(0.2)}`,
      position: "absolute" as const,
      inset: 0,
      right: "260px",
      zIndex: 2,
      overflow: "hidden" as const,
      minWidth: 0,
    };
  }, [isNarrow, themeAccent]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{glitchAnimation}</style>
      <motion.section
        ref={panelRef}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onAnimationComplete={() => {
          requestAnimationFrame(() => fitAddonRef.current?.fit());
        }}
        className={cn(
          "relative rounded-xl overflow-hidden border-2 bg-black",
          isFullscreen && "advanced-terminal-fullscreen"
        )}
        style={{
          borderColor: isFullscreen ? "transparent" : themeAccent.at(0.4),
          boxShadow: isFullscreen ? "none" : `0 0 8px ${themeAccent.at(0.25)}`,
        }}
      >
        {/* ── Background glow — static, no animate-pulse (pulse caused terminal text flicker) ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          className="relative z-20 border-b-2 px-3 sm:px-6 py-3 sm:py-3.5 backdrop-blur-sm bg-black flex items-center justify-center overflow-hidden"
          style={{ borderColor: themeAccent.at(0.4) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {showDecorations && !isMobile && (
            <svg className="trace-svg-isolated" style={{ zIndex: 0, opacity: 0.55 }} viewBox="0 0 1200 56" preserveAspectRatio="none">
              {/* Static base lines */}
              <path className="trace-base" d="M0 8 H18 V14 H38 V10 H72 V20 H95 V12 H130 V28 H160 V22 H200 V28" />
              <path className="trace-base" d="M0 48 H22 V42 H50 V48 H80 V38 H110 V44 H145 V34 H175 V28" />
              <path className="trace-base" d="M60 0 V8 H90 V16 H118 V28" />
              <path className="trace-base" d="M1200 8 H1182 V14 H1162 V10 H1128 V20 H1105 V12 H1070 V28 H1040 V22 H1000 V28" />
              <path className="trace-base" d="M1200 48 H1178 V42 H1150 V48 H1120 V38 H1090 V44 H1055 V34 H1025 V28" />
              <path className="trace-base" d="M1140 0 V8 H1110 V16 H1082 V28" />
              {/* Animated flow pulses */}
              <path className="trace-flow trace-c1" d="M0 8 H18 V14 H38 V10 H72 V20 H95 V12 H130 V28 H160 V22 H200 V28" />
              <path className="trace-flow trace-c2" d="M0 48 H22 V42 H50 V48 H80 V38 H110 V44 H145 V34 H175 V28" />
              <path className="trace-flow trace-c3" d="M60 0 V8 H90 V16 H118 V28" />
              <path className="trace-flow trace-c3" d="M1200 8 H1182 V14 H1162 V10 H1128 V20 H1105 V12 H1070 V28 H1040 V22 H1000 V28" />
              <path className="trace-flow trace-c4" d="M1200 48 H1178 V42 H1150 V48 H1120 V38 H1090 V44 H1055 V34 H1025 V28" />
              <path className="trace-flow trace-c1" d="M1140 0 V8 H1110 V16 H1082 V28" />
              {/* Dots */}
              <circle className="trace-dot" cx="200" cy="28" r="2" />
              <circle className="trace-dot" cx="175" cy="28" r="2" />
              <circle className="trace-dot" cx="118" cy="28" r="2" />
              <circle className="trace-dot" cx="38" cy="10" r="1.5" />
              <circle className="trace-dot" cx="95" cy="12" r="1.5" />
              <circle className="trace-dot" cx="145" cy="34" r="1.5" />
              <circle className="trace-dot" cx="1000" cy="28" r="2" />
              <circle className="trace-dot" cx="1025" cy="28" r="2" />
              <circle className="trace-dot" cx="1082" cy="28" r="2" />
              <circle className="trace-dot" cx="1162" cy="10" r="1.5" />
              <circle className="trace-dot" cx="1105" cy="12" r="1.5" />
              <circle className="trace-dot" cx="1055" cy="34" r="1.5" />
            </svg>
          )}
          <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
            {/* Left — window controls + title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <span className="dot-red    h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500    cursor-pointer hover:scale-125 inline-block" />
                <span className="dot-yellow h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400 cursor-pointer hover:scale-125 inline-block" />
                <span className="dot-green  h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500  cursor-pointer hover:scale-125 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center min-w-0">
                <span className="status-dot h-2 w-2 rounded-full shrink-0 inline-block" style={{ backgroundColor: themeAccent.at(0.8) }} />
                <span className="font-(family-name:--font-fira-code) text-[11px] sm:text-xs lg:text-sm font-semibold tracking-wider truncate" style={{ color: themeAccent.at(1) }}>
                  {isMobile
                    ? (selectedProject ? selectedProject.name : "AO")
                    : (selectedProject ? `${selectedProject.name}@auto-offensive` : "auto-offensive")} :: ADVANCED_SCAN
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-3 shrink-0">
              {isSubmitting && !isMobile && (
                <span
                  className="rounded-md px-2 sm:px-3 py-1 text-xs lg:text-sm font-bold flex items-center gap-1.5"
                  style={{
                    border: `1px solid ${themeAccent.at(0.4)}`,
                    backgroundColor: themeAccent.at(0.1),
                    color: themeAccent.at(1),
                  }}
                >
                  <Zap size={10} className="animate-spin" style={{ animationDuration: "1s" }} />
                  <span className="hidden sm:inline">RUNNING</span>
                </span>
              )}
              <motion.button
                ref={settingsBtnRef}
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md border px-1.5 sm:px-3 py-1 h-7 sm:h-auto text-xs lg:text-sm font-bold transition-all duration-200"
                style={{
                  borderColor: showSettings ? themeAccent.at(0.7) : themeAccent.at(0.3),
                  backgroundColor: showSettings ? themeAccent.at(0.2) : "rgba(0,0,0,0.6)",
                  color: showSettings ? themeAccent.at(1) : themeAccent.at(0.7),
                  boxShadow: showSettings ? `0 0 10px ${themeAccent.at(0.2)}` : undefined,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <span className="hidden sm:inline">CONFIG</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md border bg-black/80 px-1.5 sm:px-3 py-1 h-7 sm:h-auto text-xs lg:text-sm font-bold transition-all duration-300"
                style={{ borderColor: themeAccent.at(0.4), color: themeAccent.at(1) }}
              >
                <RotateCcw size={10} />
                <span className="hidden sm:inline">RESET</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setIsFullscreen((v) => !v)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md border bg-black/80 px-1.5 sm:px-3 py-1 h-7 sm:h-auto text-xs lg:text-sm font-bold transition-all duration-300"
                style={{
                  borderColor: themeAccent.at(isFullscreen ? 0.7 : 0.4),
                  color: themeAccent.at(isFullscreen ? 1 : 1),
                  backgroundColor: isFullscreen ? themeAccent.at(0.15) : "rgba(0,0,0,0.8)",
                }}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen (ESC)" : "Fullscreen mode"}
              >
                {isFullscreen ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                <span className="hidden sm:inline">{isFullscreen ? "EXIT" : "FULL"}</span>
              </motion.button>
              {isNarrow && (
                <motion.button
                  type="button"
                  onClick={() => setSidebarOpen((v) => !v)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-1 rounded-md border px-1.5 py-1 h-7 text-xs lg:text-sm font-bold transition-all duration-200"
                  style={{
                    borderColor: themeAccent.at(sidebarOpen ? 0.6 : 0.3),
                    backgroundColor: themeAccent.at(sidebarOpen ? 0.15 : 0),
                    color: themeAccent.at(sidebarOpen ? 1 : 0.7),
                  }}
                  aria-label="Toggle analytics panel"
                >
                  {sidebarOpen ? <X size={10} /> : <PanelRight size={10} />}
                  <span className="hidden sm:inline">{sidebarOpen ? "CLOSE" : "STATS"}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
        {!projectId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative m-3 sm:m-4 rounded-lg border-2 border-red-500/60 bg-red-950/40 backdrop-blur p-3 sm:p-4 text-sm lg:text-base font-(family-name:--font-fira-code)"
            style={{ boxShadow: "0 0 15px rgba(255,0,0,0.3)" }}
          >
            <span className="text-red-400 font-bold">⚠ ERROR:</span>{" "}
            <span className="text-red-300">Select a project above before running a scan.</span>
          </motion.div>
        )}
        {isMobile && isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative m-3 sm:m-4 rounded-lg border-2 border-blue-500/40 bg-blue-950/30 backdrop-blur p-2.5 sm:p-3 text-xs sm:text-sm font-(family-name:--font-fira-code)"
            style={{ boxShadow: "0 0 10px rgba(59,130,246,0.2)" }}
          >
            <span className="text-blue-400 font-bold inline-flex items-center gap-1">
              <Lightbulb size={12} />
              TIP:
            </span>{" "}
            <span className="text-blue-300">Try rotating your device to landscape for a better experience with the terminal UI.</span>
          </motion.div>
        )}
        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 right-2 sm:right-4 top-13 bg-black/95 backdrop-blur-md border border-green-500/25 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-green-500/15">
                <span className="text-xs lg:text-sm font-(family-name:--font-fira-code) text-green-500/40 tracking-[0.2em] uppercase">Configuration</span>
              </div>
              <div className="px-3 py-2">
                <LogToolbar
                  themeKey={themeKey}
                  sizeKey={sizeKey}
                  decorationsEnabled={decorationsEnabled}
                  onThemeChange={setTheme}
                  onSizeChange={setSize}
                  onDecorationsChange={setDecorations}
                  onReset={resetToDefault}
                  className="bg-transparent! border-0!"
                />
              </div>
            </motion.div>
          </>
        )}
        <div
          className="relative flex-1 w-full bg-black overflow-hidden"
          style={{ minHeight: isMobile ? "480px" : isTablet ? "600px" : "720px" }}
        >
          <div
            ref={containerRef}
            className="terminal-content overflow-hidden terminal-glow relative min-h-0"
            style={termContainerStyle}
          >
            {showDecorations && (
              <>
                <span className="corner-bracket corner-bracket-tl" />
                <span className="corner-bracket corner-bracket-tr" />
                <span className="corner-bracket corner-bracket-bl" />
                <span className="corner-bracket corner-bracket-br" />
              </>
            )}

          </div>
          {!isNarrow && (
            <TerminalSidebar
              selectedProject={selectedProject}
              logs={logs}
              run={run}
              errors={errors}
              isSubmitting={isSubmitting}
              showDecorations={showDecorations}
              systemProfile={systemProfile}
              accentColor={themeAccent.at(0.2)}
            />
          )}
          <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 pointer-events-none z-20" style={{ borderColor: themeAccent.at(0.4) }} />
          <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 pointer-events-none z-20" style={{ borderColor: themeAccent.at(0.4) }} />
          <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 pointer-events-none z-20" style={{ borderColor: themeAccent.at(0.4) }} />
          <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 pointer-events-none z-20" style={{ borderColor: themeAccent.at(0.4) }} />
        </div>
      </motion.section>

      {mounted && isNarrow && sidebarOpen
        ? createPortal(
            <AnimatePresence>
              <>
                <motion.div
                  className="sidebar-drawer-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />

                <motion.div
                  className="sidebar-drawer"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                >

                  <div className="absolute top-3 left-3 z-10">
                    <motion.button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-md border border-green-500/30 bg-black/80 p-1.5 text-green-400/70 hover:text-green-400"
                      aria-label="Close panel"
                    >
                      <X size={12} />
                    </motion.button>
                  </div>

                  <TerminalSidebar
                    selectedProject={selectedProject}
                    logs={logs}
                    run={run}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    showDecorations={showDecorations}
                    systemProfile={systemProfile}
                    accentColor={themeAccent.at(0.2)}
                  />
                </motion.div>
              </>
            </AnimatePresence>,
            document.body
          )
        : null}


      {showCancelModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-lg border-2 border-red-500/60 bg-black/80 p-5 sm:p-6 shadow-2xl cyber-pulse relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="absolute inset-0 opacity-10 bg-linear-to-br from-red-500 to-purple-500 pointer-events-none" />
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500 pointer-events-none" />

            <div className="relative z-10">
              <motion.h3
                className="text-lg lg:text-xl font-bold font-(family-name:--font-fira-code) text-red-400 tracking-wider"
                animate={{ textShadow: ["0 0 10px #ff0000","0 0 20px #ff0000"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚠ CRITICAL_ACTION
              </motion.h3>

              <p className="mt-3 text-sm lg:text-base font-(family-name:--font-fira-code) text-red-300/80">
                Scan termination requested. This operation is{" "}
                <span className="text-red-400 font-bold animate-pulse">IRREVERSIBLE</span>.
                <br />
                <span className="text-xs text-red-300/60 block mt-2">[CONFIRM_REQUIRED]</span>
              </p>

              <div className="mt-5 sm:mt-6 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={handleDismissCancel}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(59,130,246,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md border-2 border-blue-500/40 bg-blue-950/30 px-3 sm:px-4 py-2 text-sm lg:text-base font-bold font-(family-name:--font-fira-code) text-blue-400 transition-all hover:border-blue-500/80"
                >
                  [ABORT]
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleConfirmCancel}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,0,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md border-2 border-red-500/80 bg-red-950/40 px-3 sm:px-4 py-2 text-sm lg:text-base font-bold font-(family-name:--font-fira-code) text-red-400 transition-all hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                >
                  [CONFIRM_TERMINATION]
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
});
