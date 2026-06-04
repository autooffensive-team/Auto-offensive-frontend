"use client";

import { motion } from "framer-motion";
import { Loader2, RotateCcw, Zap } from "lucide-react";
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { Terminal } from "@xterm/xterm";
import type { ActiveRun, LogLine, Project, ScanStep } from "@/types/scan";
import { useLogPreferences } from "@/hooks/use-log-preferences";
import { LogToolbar } from "./LogToolbar";
import { useGraphStore } from "@/components/scanning/graph.store";
import { LOG_SIZES } from "@/lib/log-themes";

type NavigatorWithExtras = Navigator & {
  userAgentData?: {
    platform?: string;
    brands?: Array<{ brand: string; version: string }>;
  };
  connection?: {
    effectiveType?: string;
  };
};

// ─── ASCII Art Background - Epic Mountain Landscape ────────────────────────────
const ASCII_BACKGROUND = `
                                                                                                                            ::::::                                                                                                                        ::...::                                                                                                                     ::...::::                                                                                                                 ::....:::-                                                                                                              ::.....::::                                                                                                           :...:::::::::           ::                                                                                          :::::::::::::::         :...                                                                                       -:::::::::::::::.       -:::                                                                                      =-::::::::::::::::::::::::::::::::::::      :...:                                                                                    -:::::::::::::::::::::::::::::::::::::::::::::::::::::::    :....:                                                                                  =::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::   :....:-                                                                                -::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: ::..:::    .:::::=                                                                    ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-:::::::-   :::::.::::::.                                                             -:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::   ::::::::::::::::-                                                       .::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-   ::::::::::::::::::::::                                                 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-:::::::::::::::::::::::::::::::::::::::::::::::  :::::::::::::::::::::::::-                                            ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-:::::::::::::::::::::::::::::::::::::::::::::::::::::::   :::::::::::::::::::::::::::::                                       -::::::::::::::::::::::::::::::::::::::::::::::::::::::::  ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::    -::::..::::::::::::::::::::::::                                   ::::....::::::::::::::::::::::::::::::::::::::::::::::   :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::         *::::::::::::::::::::::::::::-                             -::....:::::::::::::::::::::::::::::::::::::::::::::    **=:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::..               -:::::::::::::::::::::::::                          ::::::-              :::::::::::::::::::::::::::::    ***=::::::::::::::::::::::::::::.:::::::::::::::::::::::::::::::::.::.:::...:                   :::::::::::::::::::::::                        ::::::::::::::::::::::::    +***+::::::::::::::::::::::::::::.::::::::::::::::::::::::::::::::::::::.  :::::::                       ::::::::::::::::::                        ::::::::::::::::::::    ****+-::::::::::::::::::::::::::::: ::::::::::::::::::::::::::::::::::::::::::. ::::::                          ::::::::::::::                        :::::::::::::::::    ****+-::::::::::::::::::::::::::::: :::::::::::::::::::::::::::::::::::::::::::::::::::::::                           -::::::::::                        ::::::::::::::-    *****=:::::::::::::::::::::::::::::. @+::::::::::::::::::::::::::::::::::::::::::::::::::::::::                          :::::::::.:                        :::::::::::+    *****+-::::::::::::::::::::::::::::.. **-::::::::::::::....  :::::::::::::::::::::::::::::::::::::::                        .::::::::::                        =::::::::=     *****+::::::::::::::::::::::::::::..  **+:.::::::::::::::     ::...:::-:..--:::::::::::::::::::::::::::                       :::::::::::                        ::....::-    ******=::::::::::::::::::::::::::::..  ***=:::::::::::::..      :..:=               =-:::::::::::::::::::::::                    :::::::::.-                        -:...:-     ******=:::::::::::::::::::::::::::::.   **+:::::::..:::.::                                  -::::::::::::::::..:                   ::::::::::=                        ::.::    =******=:::::::::::::::::::::::::::::..  ***+:::::::::......                                      ::::::::::::::..:                   ::::::::::                         ::::    *******=:::::::::::::::::::::::::::::.:  ****-::::::::::::..                                           ::::::::::::::                   ::::::::::                         :::    #******=::::::::::::::::::::::::::::::.  *****-:::::::::::::.:                                             .::::::...:                    ::::::::::                         ::    *******=:::::::::::::::::::::::::::::::   *****:::::::::::::...                                                :::...:                      ::::::::.:                         +******+::::::::::::::::::::::::::::::::  *****+:::::::::::::...                                                  :::::                      *::::::::::                         *******-....:::::::::::::::::::::::::::+  *****+::::::::::::::..:                                                                             -::::::::::                         *******=:..:::::::::::::::::::::::::::::  ******+:::::::::::::::..=                                                                             :::::::..::                         ********=:-          ::::::::::::::::::::  ******+::::::::::::::::::                                                                             ::::::::.::                          #******                 ::::::::::::::::   #*****+:::::::::::::::::..                                                                             ::::::::..:                          *****                     ::::::::::::::- #******+::::::::::::::::::..                                                                            :::::::::..-                          ***                         ::::::::::::  ********-:::::::::::::::::::.                                                                           -:::::::::::                           -*                            :::::::::-   *******-:::::::::::::::::::::                                                                           :::::::::::-                           :::::::::  ********=::::::::::::::::::::::                                                                           :::::::::::                            -::::::-  ********+::::::::::::::::::::::.:                                                                         -:::::::::::                            ::::::   ********-::::::::::::::::::::::::                                                                        ::::::::::::                             :::.:   ********=:::::::::::::::::::::::.:-                                                                      -::::::::::::                             :.::-  *********:::::::::::::::::::::::::::                                                                      ::::::::::::-                             #::-  *********-::::::::::::::::::::::::::::                                                                    ::::::::::..:                              :-  *********+:::::::::::::::::::::::::::::                                                                   :::::::::::.:                               =   *********-::::::::::::::::::::::::::::::                                                                 :::::::::::::                                #********+:::::::::::::::::::::::::::::::=                                                               ::::::::::::::                                *********=::::::::::::::::::::::::::::::::-                                                             ::::::::::::::                                 **********           :-:::::::::::::::::::::                                                           ::::::::::::::::                                 ******      *--::-=*     -:::::::::::::::::::                                                         ::::::::::::::::                                  +****       :::::::::::-     ::::::::::::::::::                                                       ::::::::::::::.:                                   ***         :::::::::...::     ::::::::::::::.::                                                    ::::::::::::::::.                                    ::::::::::::::     :::::::::::::..:                                                  :::::::::::::::::                                     ::::::::::::::.     ::::::::::::::::                                               ::::::::::::::::::                                      ::::::::::::..:      ::::::::::::::::                                           ::::::::::::::::::.                                       .:::::::::::::::      :::::::::::::::                                        -:::::::::::::::::..                                        ::::::::::::::::      ::::::::::::::-                                    -:::::::::::::::::::.                                         ::::::::::::::::       ::::::::::::::                                 ::::::::::::::::::::::                                          :::::::::::::::::       :::::::::.:::-                             :::::::::::::::::::::::                                             .::::::::::::::::::.       =::::.....::*                    :::::::::::::::::::::::::                                              :::::::::::::::::::..        -::.....::-               :::::::::::::::::::::::::.:                                               .::::::::::::::::::::.          ::::::::-          -:::::::::::::::::::::::::::                                                 ::::::::::::::::::::::::              @      :::::::::::::::::::::::::::::::                                                  =:::::::::::::::::::::::::.              ::::::::::::::::::::::::::::::..                                                    -::::::::::::::::::::::::::::::::.::::::::::::::::::::::::::::::::...                                                      -::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::...:                                                        -:::::::::::::::::::::::::::::::::::::::::::::::::::::::::..:                                                          :::::::::::::::::::::::::::::::::::::::::::::::::::::::..                                                            -::::::::::::::::::::::::::::::::::::::::::::::::..:.                                                              :::::::::::::::::::::::::::::::::::::::::::::::                                                                 ::::::::::::::::::::::::::::::::::::::::..:                                                                   ::::::::::::::::::::::::::::::::::::.                                                                      -::::::::::::::::::::::::::.:::.                                                                        @::::::::::::::::::::::::::                                                                           =::::::::::::::::::                                                                               -::::::::::::
`;

// ─── Hacker Vibe Animations ───────────────────────────────────────────────────
const GLITCH_CHARS = ['█', '▓', '▒', '░', '▀', '▄', '─', '│', '┌', '┐', '└', '┘', '', '◆', '●'];
const MATRIX_CHARS = '░▒▓█▀▄║═╬┤┬┴├└┘┐┌◆●';

const glitchAnimation = `
  @keyframes glitch {
    0% {
      text-shadow: 2px 0 #00ff00, -2px 0 #ff00ff, 0 0 10px #00ff00;
      clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    }
    20% {
      clip-path: polygon(0 20%, 100% 20%, 100% 65%, 0 65%);
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ff00, 0 0 10px #ff00ff;
    }
    40% {
      clip-path: polygon(0 35%, 100% 35%, 100% 80%, 0 80%);
      text-shadow: 2px 0 #00ff00, -2px 0 #ff00ff, 0 0 15px #00ffff;
    }
    60% {
      clip-path: polygon(0 50%, 100% 50%, 100% 95%, 0 95%);
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff, 0 0 10px #00ff00;
    }
    100% {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      text-shadow: 0 0 20px #00ff00, 0 0 10px #00ffff;
    }
  }

  @keyframes scanlines {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 0 10px;
    }
  }

  @keyframes neon-flicker {
    0% {
      text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
      opacity: 1;
    }
    50% {
      text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00;
      opacity: 0.8;
    }
    100% {
      text-shadow: 0 0 15px #00ff00, 0 0 25px #00ff00, 0 0 40px #00ff00;
      opacity: 1;
    }
  }

  @keyframes matrix-rain {
    0% {
      transform: translateY(-100%);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1);
    }
    50% {
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.6), inset 0 0 20px rgba(0, 255, 0, 0.2);
    }
  }

  @keyframes cyber-border {
    0%, 100% {
      border-color: rgba(0, 255, 0, 0.3);
      box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
    }
    50% {
      border-color: rgba(0, 255, 0, 0.8);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.1);
    }
  }

  @keyframes flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
      opacity: 1;
    }
    20%, 24%, 55% {
      opacity: 0.5;
    }
  }

  .glitch-text {
    animation: glitch 0.3s ease-in-out infinite;
    position: relative;
  }

  .neon-text {
    color: #00ff00;
    text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
    animation: neon-flicker 3s infinite;
  }

  .scanline-bg {
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: scanlines 8s linear infinite;
  }

  .cyber-pulse {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .cyber-border {
    animation: cyber-border 2s ease-in-out infinite;
  }

  .flicker-effect {
    animation: flicker 0.15s infinite;
  }

  .terminal-glow {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5);
  }

  .hacker-gradient {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.05) 0%, rgba(0, 150, 255, 0.05) 100%);
  }

  @keyframes data-corruption {
    0%, 100% {
      transform: translate(0);
    }
    25% {
      transform: translate(-2px, -2px);
    }
    50% {
      transform: translate(2px, 2px);
    }
    75% {
      transform: translate(-2px, 2px);
    }
  }

  .data-glitch {
    animation: data-corruption 0.1s infinite;
  }

  .ascii-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 7px;
    line-height: 1.05;
    color: rgba(0, 255, 0, 0.25);
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
    pointer-events: none;
    z-index: 5;
    animation: float 25s ease-in-out infinite;
    letter-spacing: -0.5px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.1);
  }

  @keyframes float {
    0%, 100% {
      opacity: 0.08;
      transform: translateY(0);
    }
    50% {
      opacity: 0.12;
      transform: translateY(-10px);
    }
  }

  .ascii-grid {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image: 
      linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 1;
  }

  .terminal-content {
    position: relative;
    z-index: 10;
  }
`;

// ─── Minimal splash ───────────────────────────────────────────────────────────
const SPLASH_LINES = [
  "",
  "  \x1b[1m\x1b[32mauto-offensive\x1b[0m  \x1b[90m·  advanced scan\x1b[0m",
  "  \x1b[90m────────────────────────────────────────\x1b[0m",
  "  \x1b[33mUsage   \x1b[0m  <tool> [flags] [| <tool> ...]",
  "  \x1b[33mExample \x1b[0m  \x1b[32mnuclei -u https://example.com\x1b[0m",
  "  \x1b[33mPipeline\x1b[0m  \x1b[32msubfinder -d example.com | httpx\x1b[0m",
  "  \x1b[33mHelp    \x1b[0m  \x1b[90mCtrl+C to cancel  ·  clear to reset\x1b[0m",
  "  \x1b[90m────────────────────────────────────────\x1b[0m",
  "",
];

const SPLASH = SPLASH_LINES.join("\r\n");

// ─── Help text ────────────────────────────────────────────────────────────────
const HELP_LINES = [
  "",
  "  \x1b[1m\x1b[36mAuto-Offensive Advanced Scan — Help\x1b[0m",
  "  \x1b[90m────────────────────────────────────────────────────────\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mSingle Tool:\x1b[0m",
  "    \x1b[36m<tool>\x1b[0m [flags]",
  "    Example: \x1b[32mnuclei -u https://example.com\x1b[0m",
  "    Example: \x1b[32mnmap -sV -p 80,443 target.com\x1b[0m",
  "    Example: \x1b[32msubfinder -d example.com -silent\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mPipeline (chain tools with |):\x1b[0m",
  "    \x1b[36m<tool>\x1b[0m [flags] \x1b[90m|\x1b[0m \x1b[36m<tool>\x1b[0m [flags] \x1b[90m|\x1b[0m ...",
  "    Example: \x1b[32msubfinder -d example.com | httpx\x1b[0m",
  "    Example: \x1b[32msubfinder -d example.com | httpx | nuclei\x1b[0m",
  "",
  "  \x1b[1m\x1b[33mAvailable Tools:\x1b[0m",
  "    \x1b[36msubfinder\x1b[0m    Subdomain discovery",
  "    \x1b[36mhttpx\x1b[0m        HTTP probing & tech detection",
  "    \x1b[36mnuclei\x1b[0m       Vulnerability scanning",
  "    \x1b[36mnmap\x1b[0m         Port scanning & service detection",
  "    \x1b[36mnaabu\x1b[0m        Fast port scanning",
  "    \x1b[36mkatana\x1b[0m       Web crawling",
  "    \x1b[36mffuf\x1b[0m         Web fuzzing",
  "    \x1b[36mamass\x1b[0m        Attack surface mapping",
  "",
  "  \x1b[1m\x1b[33mCommands:\x1b[0m",
  "    \x1b[36mclear\x1b[0m        Clear terminal and reset graph",
  "    \x1b[36mhelp\x1b[0m         Show this help message",
  "    \x1b[36mCtrl+C\x1b[0m       Cancel running scan",
  "",
  "  \x1b[1m\x1b[33mKeyboard Shortcuts:\x1b[0m",
  "    \x1b[90m↑/↓\x1b[0m          Browse command history",
  "    \x1b[90mCtrl+A\x1b[0m       Move cursor to start",
  "    \x1b[90mCtrl+E\x1b[0m       Move cursor to end",
  "    \x1b[90mCtrl+U\x1b[0m       Clear line before cursor",
  "    \x1b[90mCtrl+K\x1b[0m       Clear line after cursor",
  "",
  "  \x1b[90m────────────────────────────────────────────────────────\x1b[0m",
  "",
];

const HELP_TEXT = HELP_LINES.join("\r\n");

export function AdvancedTerminalPanel({
  projectId,
  selectedProject,
  logs,
  run,
  errors,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  projectId: string;
  selectedProject: Project | undefined;
  logs: LogLine[];
  run: ActiveRun;
  errors: string[];
  isSubmitting: boolean;
  onSubmit: (command: string) => void;
  onReset: () => void;
}) {
  const { themeKey, sizeKey, theme: logTheme, size: logSize, setTheme, setSize, resetToDefault } = useLogPreferences();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<{ fit: () => void } | null>(null);

  // ── Cancel confirmation modal state ──────────────────────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Input state ──────────────────────────────────────────────────────────
  // We maintain a full line buffer + cursor position so arrow keys, Home/End,
  // and multi-byte pastes all work correctly.
  const lineRef = useRef("");          // current input buffer
  const cursorRef = useRef(0);         // cursor position within lineRef
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);       // -1 = not browsing history

  const logCursorRef = useRef(0);
  const isInputActiveRef = useRef(true);
  const selectedProjectRef = useRef(selectedProject);
  const onSubmitRef = useRef(onSubmit);
  const onResetRef = useRef(onReset);
  const prevStepsRef = useRef<ScanStep[]>([]);
  const prevStatusRef = useRef("idle");
  const prevErrorsLenRef = useRef(0);

  const terminalTheme = useMemo(() => logTheme.xterm, [logTheme]);
  const terminalFontSize = useMemo(() => {
    const base = logSize.xtermFontSize;
    if (base >= LOG_SIZES.xxl.xtermFontSize) return base + 1;
    if (base >= LOG_SIZES.xl.xtermFontSize) return base + 1;
    if (base >= LOG_SIZES.lg.xtermFontSize) return base + 1;
    if (base >= LOG_SIZES.md.xtermFontSize) return base + 1;
    return base + 1;
  }, [logSize.xtermFontSize]);

  const terminalLetterSpacing = useMemo(() => {
    if (logSize.xtermFontSize >= LOG_SIZES.xxl.xtermFontSize) return 3.5;
    if (logSize.xtermFontSize >= LOG_SIZES.xl.xtermFontSize) return 2.75;
    if (logSize.xtermFontSize >= LOG_SIZES.lg.xtermFontSize) return 1.9;
    if (logSize.xtermFontSize >= LOG_SIZES.md.xtermFontSize) return 0.25;
    return 0.2;
  }, [logSize.xtermFontSize]);

  const terminalLineHeight = useMemo(() => logSize.terminalLineHeight, [logSize.terminalLineHeight]);
  const systemProfile = useMemo(
    () => [
      {
        label: "Browser",
        value: (() => {
          if (typeof navigator === "undefined") return "Browser";
          const nav = navigator as NavigatorWithExtras;
          const agent = nav.userAgent;
          const match = agent.match(/(Chrome|Chromium|Firefox|Safari|Edge)\/?\s*([\d.]+)/i);
          if (match?.[1] && match[2]) return `${match[1]} ${match[2]}`;
          const brand = nav.userAgentData?.brands?.find((item: { brand: string; version: string }) => !/not/i.test(item.brand));
          return brand ? `${brand.brand} ${brand.version}` : "Browser";
        })(),
        tone: "text-green-300",
      },
      {
        label: "OS",
        value:
          typeof navigator !== "undefined"
            ? ((navigator as NavigatorWithExtras).userAgentData?.platform ?? navigator.platform ?? "Unknown OS")
            : "Unknown OS",
        tone: "text-green-300",
      },
      {
        label: "CPU Cores",
        value:
          typeof navigator !== "undefined" && Number.isFinite(navigator.hardwareConcurrency)
            ? `${navigator.hardwareConcurrency} cores`
            : "unknown",
        tone: "text-green-300",
      },
      {
        label: "Network",
        value: typeof navigator !== "undefined" && (navigator as NavigatorWithExtras).connection
          ? `${(navigator as NavigatorWithExtras).connection?.effectiveType?.toUpperCase() ?? "ONLINE"}`
          : "Online",
        tone: "text-emerald-300",
      },
    ],
    [],
  );

  useEffect(() => { selectedProjectRef.current = selectedProject; }, [selectedProject]);
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);

  // ── Prompt ───────────────────────────────────────────────────────────────
  const getPrompt = useCallback(() => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    return `\r\n\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m `;
  }, []);

  // ── Redraw current input line after cursor moves ─────────────────────────
  // Clears from start of line, reprints prompt + buffer, repositions cursor.
  const redrawLine = useCallback((term: Terminal) => {
    const project = selectedProjectRef.current?.name ?? "no-project";
    const promptPlain = `[${project}@auto-offensive]$ `;
    const buf = lineRef.current;
    const cur = cursorRef.current;
    // Move to column 0, clear line, reprint prompt + buffer
    term.write(`\r\x1b[K\x1b[1m\x1b[32m[${project}@auto-offensive]\x1b[0m\x1b[1m$ \x1b[0m ${buf}`);
    // Move cursor back to correct position
    const charsAfterCursor = buf.length - cur;
    if (charsAfterCursor > 0) {
      term.write(`\x1b[${charsAfterCursor}D`);
    }
  }, []);

  // ── Splash / clear ───────────────────────────────────────────────────────
  const showSplash = useCallback((term: Terminal) => {
    term.write("\x1b[3J\x1b[2J\x1b[H"); // clear scrollback + screen, home
    term.write("\r\n");
    term.write(SPLASH);
    term.write("\r\n");
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
        convertEol: false,          // we handle \r ourselves
        fontFamily: "var(--font-fira-code), 'Fira Code', Consolas, 'Courier New', monospace",
        fontSize: terminalFontSize,
        letterSpacing: terminalLetterSpacing,
        fontWeight: 400,
        fontWeightBold: 700,
        lineHeight: terminalLineHeight,
        scrollback: 10000,  // Increased from 5000 for more history
        theme: terminalTheme,
        cols: 200,  // Force more columns for wider output
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();
      fitAddonRef.current = fitAddon;

      // Show fastfetch splash on first boot
      showSplash(term);
      term.write(getPrompt());

      term.onData((data) => {
        // ── Ctrl+C ──────────────────────────────────────────────────────
        if (data === "\x03") {
          // If a scan is running, show confirmation modal instead of immediately cancelling
          const isRunning = !isInputActiveRef.current;
          if (isRunning) {
            setShowCancelModal(true);
            return;
          }
          // If no scan running, just clear the line
          lineRef.current = "";
          cursorRef.current = 0;
          histIdxRef.current = -1;
          term.write("^C");
          term.write(getPrompt());
          return;
        }

        if (!isInputActiveRef.current) return;

        // ── Enter ────────────────────────────────────────────────────────
        if (data === "\r") {
          const cmd = lineRef.current.trim();
          term.write("\r\n");
          lineRef.current = "";
          cursorRef.current = 0;

          if (cmd === "clear") {
            histIdxRef.current = -1;
            // Use xterm's native reset to fully clear scrollback and screen
            term.reset();
            term.write(getPrompt());
            // Also reset the graph visualization state
            useGraphStore.getState().reset();
            return;
          }

          if (cmd === "help") {
            term.write(HELP_TEXT);
            term.write(getPrompt());
            return;
          }

          if (cmd) {
            // Push to history (deduplicate consecutive)
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

        // ── Backspace ────────────────────────────────────────────────────
        if (data === "\u007f") {
          if (cursorRef.current === 0) return;
          const buf = lineRef.current;
          lineRef.current =
            buf.slice(0, cursorRef.current - 1) + buf.slice(cursorRef.current);
          cursorRef.current -= 1;
          redrawLine(term);
          return;
        }

        // ── Escape sequences (arrows, Home, End, Delete) ─────────────────
        if (data.startsWith("\x1b[") || data.startsWith("\x1bO")) {
          const seq = data.slice(data.startsWith("\x1bO") ? 2 : 2);

          // Arrow Left
          if (data === "\x1b[D") {
            if (cursorRef.current > 0) {
              cursorRef.current -= 1;
              term.write("\x1b[D");
            }
            return;
          }
          // Arrow Right
          if (data === "\x1b[C") {
            if (cursorRef.current < lineRef.current.length) {
              cursorRef.current += 1;
              term.write("\x1b[C");
            }
            return;
          }
          // Arrow Up — history prev
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
          // Arrow Down — history next
          if (data === "\x1b[B") {
            if (histIdxRef.current <= 0) {
              histIdxRef.current = -1;
              lineRef.current = "";
              cursorRef.current = 0;
              redrawLine(term);
              return;
            }
            histIdxRef.current -= 1;
            lineRef.current = historyRef.current[histIdxRef.current];
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          // Home / Ctrl+A
          if (data === "\x1b[H" || data === "\x01") {
            cursorRef.current = 0;
            redrawLine(term);
            return;
          }
          // End / Ctrl+E
          if (data === "\x1b[F" || data === "\x05") {
            cursorRef.current = lineRef.current.length;
            redrawLine(term);
            return;
          }
          // Delete (forward delete)
          if (data === "\x1b[3~") {
            if (cursorRef.current >= lineRef.current.length) return;
            const buf = lineRef.current;
            lineRef.current =
              buf.slice(0, cursorRef.current) + buf.slice(cursorRef.current + 1);
            redrawLine(term);
            return;
          }
          // Ctrl+Left — word left
          if (data === "\x1b[1;5D" || data === "\x1bb") {
            let pos = cursorRef.current;
            while (pos > 0 && lineRef.current[pos - 1] === " ") pos--;
            while (pos > 0 && lineRef.current[pos - 1] !== " ") pos--;
            cursorRef.current = pos;
            redrawLine(term);
            return;
          }
          // Ctrl+Right — word right
          if (data === "\x1b[1;5C" || data === "\x1bf") {
            let pos = cursorRef.current;
            const len = lineRef.current.length;
            while (pos < len && lineRef.current[pos] !== " ") pos++;
            while (pos < len && lineRef.current[pos] === " ") pos++;
            cursorRef.current = pos;
            redrawLine(term);
            return;
          }
          // Ignore other escape sequences
          return;
        }

        // ── Ctrl+A / Ctrl+E (non-escape variants) ────────────────────────
        if (data === "\x01") { cursorRef.current = 0; redrawLine(term); return; }
        if (data === "\x05") { cursorRef.current = lineRef.current.length; redrawLine(term); return; }

        // ── Ctrl+K — kill to end of line ─────────────────────────────────
        if (data === "\x0b") {
          lineRef.current = lineRef.current.slice(0, cursorRef.current);
          redrawLine(term);
          return;
        }

        // ── Ctrl+U — kill to start of line ───────────────────────────────
        if (data === "\x15") {
          lineRef.current = lineRef.current.slice(cursorRef.current);
          cursorRef.current = 0;
          redrawLine(term);
          return;
        }

        // ── Printable characters (including multi-char pastes) ────────────
        // Filter out remaining control characters
        const printable = data.replace(/[\x00-\x1f\x7f]/g, "");
        if (!printable) return;

        const buf = lineRef.current;
        lineRef.current =
          buf.slice(0, cursorRef.current) + printable + buf.slice(cursorRef.current);
        cursorRef.current += printable.length;
        redrawLine(term);
      });

      ro = new ResizeObserver(() => fitAddon.fit());
      const parent = containerRef.current.parentElement;
      if (parent) ro.observe(parent);
      termRef.current = term;
    }

    boot();
    return () => {
      disposed = true;
      ro?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Theme hot-swap ───────────────────────────────────────────────────────
  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);

  // ── Font size hot-swap ─────────────────────────────────────────────────
  useEffect(() => {
    if (termRef.current?.options) {
      termRef.current.options.fontSize = logSize.xtermFontSize;
      termRef.current.options.lineHeight = logSize.terminalLineHeight;
      termRef.current.options.letterSpacing = terminalLetterSpacing;
      // Re-fit the terminal to recalculate cols/rows for new font size
      fitAddonRef.current?.fit();
    }
  }, [logSize.xtermFontSize, logSize.terminalLineHeight, terminalFontSize, terminalLetterSpacing, terminalLineHeight, terminalTheme]);

  // ── Terminal spinner while waiting for logs ───────────────────────────────
  const spinnerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinnerLineRef = useRef(false); // whether we've written a spinner line

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const isWaiting = isSubmitting && logs.length === 0;

    if (isWaiting && !spinnerRef.current) {
      const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
      const messages = [
        "Initializing scan engine",
        "Establishing connection",
        "Negotiating protocol",
        "Probing target surface",
        "Enumerating services",
        "Waiting for scan output",
      ];
      let frameIdx = 0;
      let msgIdx = 0;
      let tick = 0;

      spinnerLineRef.current = true;
      spinnerRef.current = setInterval(() => {
        frameIdx = (frameIdx + 1) % frames.length;
        tick++;
        if (tick % 30 === 0) msgIdx = (msgIdx + 1) % messages.length;

        // Overwrite current line with spinner
        term.write(`\r\x1b[K\x1b[36m  ${frames[frameIdx]} \x1b[0m\x1b[90m${messages[msgIdx]}...\x1b[0m`);
      }, 80);
    }

    if (!isWaiting && spinnerRef.current) {
      clearInterval(spinnerRef.current);
      spinnerRef.current = null;
      if (spinnerLineRef.current) {
        // Clear the spinner line
        term.write(`\r\x1b[K`);
        spinnerLineRef.current = false;
      }
    }

    return () => {
      if (spinnerRef.current) {
        clearInterval(spinnerRef.current);
        spinnerRef.current = null;
      }
    };
  }, [isSubmitting, logs.length]);

  // ── Stream logs ──────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    if (logs.length === 0) { logCursorRef.current = 0; return; }
    const newLines = logs.slice(logCursorRef.current);
    if (!newLines.length) return;
    logCursorRef.current = logs.length;
    newLines.forEach((line) => {
      const time = new Date(line.timestamp).toLocaleTimeString();
      let col = "\x1b[90m";
      const lvl = line.level.toLowerCase();
      if (lvl.includes("error") || lvl.includes("fail")) col = "\x1b[31m";
      else if (lvl.includes("warn")) col = "\x1b[33m";
      else if (lvl === "done" || lvl === "submitted") col = "\x1b[32m";
      else if (lvl === "log") col = "\x1b[36m";
      term.write(`\r\x1b[90m[${time}]\x1b[0m \x1b[36m[${line.source}]\x1b[0m ${col}${line.text}\x1b[0m\r\n`);
    });
  }, [logs]);

  // ── Errors ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const newErrs = errors.slice(prevErrorsLenRef.current);
    if (!newErrs.length) return;
    prevErrorsLenRef.current = errors.length;
    newErrs.forEach((e) => term.write(`\r\x1b[1m\x1b[31m[ERROR] ${e}\x1b[0m\r\n`));
  }, [errors]);

  // ── Step announcements — removed per UX request ─────────────────────────

  // ── Job status ───────────────────────────────────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    const status = run.status;
    if (!term || status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    if (status === "submitting") {
      term.write(`\r\x1b[36m→ Submitting scan…\x1b[0m\r\n`);
    } else if (status.includes("COMPLETED")) {
      term.write(`\r\x1b[1m\x1b[32m✓ Scan completed — findings: ${run.findings}\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("FAILED")) {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status.includes("CANCELLED") || status.includes("PARTIAL")) {
      term.write(`\r\x1b[1m\x1b[33m⚠ Scan ${status.replace("JOB_STATUS_", "").toLowerCase()}.\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "failed") {
      term.write(`\r\x1b[1m\x1b[31m✗ Scan failed.\x1b[0m\r\n`);
      isInputActiveRef.current = true;
      term.write(getPrompt());
    } else if (status === "idle") {
      prevStepsRef.current = [];
      prevErrorsLenRef.current = 0;
      isInputActiveRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.status, run.findings]);

  // ── Cancel confirmation handlers ──────────────────────────────────────────
  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    const term = termRef.current;
    if (term) {
      term.write("\r\n\x1b[1m\x1b[33m⚠ Scan cancelled by user.\x1b[0m\r\n");
    }
    lineRef.current = "";
    cursorRef.current = 0;
    histIdxRef.current = -1;
    isInputActiveRef.current = true;
    onResetRef.current();
    useGraphStore.getState().reset();
    if (term) {
      term.write(getPrompt());
    }
  }, [getPrompt]);

  const handleDismissCancel = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  return (
    <>
      <style>{glitchAnimation}</style>
      <motion.section
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative rounded-xl overflow-hidden border-2 bg-black cyber-border"
        style={{ borderColor: "rgba(0, 255, 0, 0.4)" }}
      >
        {/* ── Animated background glow ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* ── Scanlines overlay ── */}
        <div className="absolute inset-0 pointer-events-none scanline-bg opacity-20 mix-blend-overlay" />

        {/* ── Black Top Bar - PURE BLACK ── */}
        <motion.div 
          className="relative z-20 border-b-2 px-6 py-3.5 backdrop-blur-sm bg-black flex items-center justify-center cyber-pulse"
          style={{ borderColor: "rgba(0, 255, 0, 0.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-full flex items-center justify-between">
            {/* Left side - Window controls + Title */}
            <div className="flex items-center gap-4 flex-1">
              {/* Hacker-style window controls */}
              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                <motion.span 
                  className="h-3 w-3 rounded-full bg-red-500 cursor-pointer hover:scale-125"
                  animate={{ boxShadow: ["0 0 10px #ff0000", "0 0 5px #ff0000"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.span 
                  className="h-3 w-3 rounded-full bg-yellow-400 cursor-pointer hover:scale-125"
                  animate={{ boxShadow: ["0 0 10px #ffff00", "0 0 5px #ffff00"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                <motion.span 
                  className="h-3 w-3 rounded-full bg-green-500 cursor-pointer hover:scale-125"
                  animate={{ boxShadow: ["0 0 10px #00ff00", "0 0 5px #00ff00"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </motion.div>

              {/* Title with glitch effect - CENTERED */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                <motion.div 
                  className="h-2 w-2 rounded-full bg-green-500 neon-text"
                  animate={{ opacity: [1, 0.5], boxShadow: ["0 0 5px #00ff00", "0 0 10px #00ff00"] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.span 
                  className="font-mono text-xs sm:text-sm font-bold neon-text tracking-wider"
                  animate={{ textShadow: ["0 0 10px #00ff00, 0 0 20px #00ff00", "0 0 5px #00ff00"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {selectedProject ? `⚡ ${selectedProject.name}@auto-offensive` : "⚡ auto-offensive"} :: ADVANCED_SCAN
                </motion.span>
              </div>
            </div>

            {/* Right side - Status and Controls */}
            <div className="flex items-center gap-3 ml-4">
              {isSubmitting && (
                <motion.span 
                  className="rounded-md border-2 border-green-500/60 bg-green-500/10 px-3 py-1 text-[10px] sm:text-xs font-bold neon-text flex items-center gap-2 whitespace-nowrap"
                  animate={{ boxShadow: ["0 0 10px #00ff00", "0 0 20px #00ff00"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap size={11} />
                  </motion.div>
                  RUNNING
                </motion.span>
              )}

              <motion.button
                type="button"
                onClick={onReset}
                whileHover={{ scale: 1.08, boxShadow: "0 0 15px rgba(0, 255, 0, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-green-500/60 bg-black hover:bg-green-500/15 px-3 py-1 text-[10px] sm:text-xs font-bold neon-text transition-all duration-300 whitespace-nowrap"
              >
                <RotateCcw size={11} />
                RESET
              </motion.button>
            </div>
          </div>
        </motion.div>

        {!projectId && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative m-4 rounded-lg border-2 border-red-500/60 bg-red-950/40 backdrop-blur p-3 sm:p-4 text-xs sm:text-sm font-mono"
            style={{ boxShadow: "0 0 15px rgba(255, 0, 0, 0.3)" }}
          >
            <span className="text-red-400 font-bold">⚠ ERROR:</span> <span className="text-red-300">Select a project above before running a scan.</span>
          </motion.div>
        )}

        {/* ── Theme & Size Toolbar - STYLED HACKER ── */}
        <motion.div 
          className="relative z-15 border-t border-b border-green-500/30 px-4 py-2 bg-black/50 backdrop-blur flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <LogToolbar
            themeKey={themeKey}
            sizeKey={sizeKey}
            onThemeChange={setTheme}
            onSizeChange={setSize}
            onReset={resetToDefault}
            className="bg-transparent! border-0!"
          />
        </motion.div>

        {/* ── Full-width xterm with cyber effects ── */}
        <div className="relative flex-1 w-full bg-black overflow-hidden flex">
          {/* Background Image Layer */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none z-0"
            style={{
              backgroundImage: "url('/ascii.png')",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed"
            }}
          />
          
          {/* xterm Container - MAXIMIZED ── */}
          <div
            ref={containerRef}
            className="terminal-content flex-1 overflow-hidden terminal-glow scanline-bg relative z-10"
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              borderRight: "2px solid rgba(0, 255, 0, 0.2)",
              borderTop: "2px solid rgba(0, 255, 0, 0.2)",
              minHeight: "calc(100vh - 300px)"
            }}
          />

          {/* Cyberpunk Side Panel - Real Data Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-56 border-l-2 border-green-500/40 bg-black/40 backdrop-blur p-3 flex flex-col gap-3 z-10 overflow-y-auto"
            style={{ borderColor: "rgba(0, 255, 0, 0.3)" }}
          >
            {/* Header */}
            <motion.div 
              className="text-sm font-mono neon-text tracking-wide"
              animate={{ textShadow: ["0 0 5px #00ff00", "0 0 15px #00ff00"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ▸▸▸ SCAN_ANALYTICS
            </motion.div>

            {/* Scan Status */}
            <div className="space-y-1.5 border-b border-green-500/20 pb-2">
              <div className="text-[12px] font-mono text-green-400/70 tracking-[0.18em]">PROJECT</div>
              <div className="text-base font-mono text-green-300 tracking-wide">
                {selectedProject?.name || "no_project"}
              </div>
              <div className="text-[12px] font-mono text-green-400/70 mt-1 tracking-[0.18em]">STATUS</div>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ boxShadow: ["0 0 5px #00ff00", "0 0 15px #00ff00"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-base font-mono text-green-300 tracking-wide">
                  {isSubmitting ? "◆ SCANNING..." : "◆ IDLE"}
                </span>
              </div>
            </div>

            {/* Environment Profile */}
            <div className="space-y-2 border-b border-green-500/20 pb-2">
              <div className="text-[12px] font-mono text-green-400/70 tracking-[0.18em]">ENVIRONMENT</div>
              <div className="space-y-1.5">
                {systemProfile.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-3 font-mono">
                    <span className="text-[11px] text-green-400/65 tracking-[0.14em] uppercase">
                      {item.label}
                    </span>
                    <span className={`text-sm font-semibold ${item.tone} tracking-wide text-right`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Scan */}
            <div className="space-y-2 border-b border-green-500/20 pb-2">
              <div className="text-[12px] font-mono text-green-400/70 tracking-[0.18em]">RADAR_SCAN</div>
              <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-green-500/30 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.12),rgba(0,0,0,0.04)_55%,rgba(0,0,0,0.85)_100%)]">
                <div className="absolute inset-3 rounded-full border border-green-500/20" />
                <div className="absolute inset-6 rounded-full border border-green-500/15" />
                <div className="absolute inset-9 rounded-full border border-green-500/10" />
                <motion.div
                  className="absolute inset-0 rounded-full border-l-2 border-t-2 border-green-400/80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_16px_rgba(34,197,94,0.95)]"
                  animate={{
                    x: [-20, 18, 0, -12, 14, 0],
                    y: [18, -18, -22, 6, 14, 18],
                    opacity: [0.7, 1, 0.85, 1, 0.8, 0.7],
                  }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute h-20 w-20 rounded-full border border-emerald-400/20"
                  animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.25, 0.55, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-green-300/70 tracking-[0.16em]">
                  BUG RADAR
                </div>
              </div>
            </div>

            {/* Findings Stats */}
            <div className="space-y-1 border-b border-green-500/20 pb-2">
              <div className="text-[12px] font-mono text-green-400/70 tracking-[0.18em]">FINDINGS</div>
              <div className="text-2xl font-mono text-green-400">
                {run.findings || 0}
              </div>
              <div className="text-[11px] font-mono text-green-300/60 tracking-wide">
                vulnerabilities
              </div>
            </div>

            {/* Logs Stats */}
            <div className="space-y-1 border-b border-green-500/20 pb-2">
              <div className="text-[12px] font-mono text-green-400/70 tracking-[0.18em]">LOG_ENTRIES</div>
              <motion.div 
                className="text-xl font-mono text-green-400"
                animate={{ opacity: [0.8, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {logs.length}
              </motion.div>
              <div className="text-[11px] font-mono text-green-300/60 tracking-wide">
                records
              </div>
            </div>

            {/* Error Count */}
            {errors.length > 0 && (
              <div className="space-y-1 border-b border-red-500/20 pb-2">
                <div className="text-[12px] font-mono text-red-400/70 tracking-[0.18em]">SCAN_FAIL</div>
                <motion.div 
                  className="text-lg font-mono text-red-400"
                  animate={{ textShadow: ["0 0 5px #ff0000", "0 0 10px #ff0000"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {errors.length}
                </motion.div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="space-y-1">
              <div className="text-[12px] font-mono text-green-400/70 mb-1 tracking-[0.18em]">RECENT</div>
              {logs.slice(-3).map((log, idx) => (
                <motion.div 
                  key={idx}
                  className="text-[11px] font-mono text-green-300/60 line-clamp-1 tracking-wide"
                  animate={{ opacity: [0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                >
                  ▸ {log.text.substring(0, 20)}...
                </motion.div>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="mt-auto pt-2 border-t border-green-500/20 space-y-0.5">
              <motion.div 
                className="text-[10px] font-mono text-green-500/30 flex justify-between tracking-[0.16em]"
                animate={{ opacity: [0.3, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span>CONNECTION</span>
                <span>ACTIVE</span>
              </motion.div>
              <div className="text-[10px] font-mono text-green-500/30 tracking-wide">
                v7.2.1-advanced
              </div>
            </div>
          </motion.div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500/40 pointer-events-none z-20" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500/40 pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500/40 pointer-events-none z-20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500/40 pointer-events-none z-20" />
        </div>
      </motion.section>

      {/* Cancel Confirmation Modal - Hacker Themed */}
      {showCancelModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-sm rounded-lg border-2 border-red-500/60 bg-black/80 p-6 shadow-2xl cyber-pulse relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-10 bg-linear-to-br from-red-500 to-purple-500 pointer-events-none" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500 pointer-events-none" />

            <div className="relative z-10">
              <motion.h3 
                className="text-lg font-bold font-mono text-red-400 tracking-wider"
                animate={{ textShadow: ["0 0 10px #ff0000", "0 0 20px #ff0000"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚠ CRITICAL_ACTION
              </motion.h3>
              
              <p className="mt-3 text-sm font-mono text-red-300/80">
                Scan termination requested. This operation is {' '}
                <span className="text-red-400 font-bold animate-pulse">IRREVERSIBLE</span>.
                <br />
                <span className="text-xs text-red-300/60 block mt-2">[CONFIRM_REQUIRED]</span>
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={handleDismissCancel}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md border-2 border-blue-500/40 bg-blue-950/30 px-4 py-2 text-sm font-bold font-mono text-blue-400 transition-all hover:border-blue-500/80"
                >
                  [ABORT]
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleConfirmCancel}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 0, 0, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md border-2 border-red-500/80 bg-red-950/40 px-4 py-2 text-sm font-bold font-mono text-red-400 transition-all hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
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
}
