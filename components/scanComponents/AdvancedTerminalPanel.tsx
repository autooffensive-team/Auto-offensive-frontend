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

  @keyframes radar-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes blip-pulse {
    0%, 100% {
      opacity: 0.7;
      box-shadow: 0 0 6px rgba(34, 211, 155, 0.8), 0 0 12px rgba(16, 185, 129, 0.4);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 10px rgba(34, 211, 155, 1), 0 0 20px rgba(16, 185, 129, 0.6);
    }
  }

  @keyframes radar-pulse-active {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 211, 155, 0.7);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(34, 211, 155, 0.2);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 211, 155, 0);
    }
  }

  @keyframes radar-pulse-found {
    0%, 100% {
      box-shadow: 0 0 16px rgba(34, 211, 155, 1), 0 0 32px rgba(16, 185, 129, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.3);
    }
    50% {
      box-shadow: 0 0 24px rgba(34, 211, 155, 1), 0 0 48px rgba(16, 185, 129, 0.8), inset 0 0 12px rgba(255, 255, 255, 0.5);
    }
  }

  .radar-container {
    position: relative;
    width: 192px;
    height: 192px;
    background: radial-gradient(circle at center, rgba(10, 10, 10, 0.9) 0%, rgba(5, 5, 5, 1) 100%);
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1.2px solid rgba(34, 211, 155, 0.35);
    border-radius: 50%;
  }

  .radar-ring-1 {
    width: 85%;
    height: 85%;
  }

  .radar-ring-2 {
    width: 55%;
    height: 55%;
  }

  .radar-ring-3 {
    width: 25%;
    height: 25%;
  }

  .radar-sweep {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 50%;
    transform-origin: bottom center;
    background: linear-gradient(to top, rgba(34, 211, 155, 0.9), rgba(34, 211, 155, 0.4), rgba(34, 211, 155, 0));
    z-index: 2;
    box-shadow: 0 0 8px rgba(34, 211, 155, 0.6);
  }

  .radar-sweep.active {
    animation: radar-spin 4s linear infinite;
  }

  .radar-sweep.scanning {
    animation: radar-spin 3.5s linear infinite;
  }

  .radar-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(167, 243, 208, 1), rgba(34, 211, 155, 0.8));
    border-radius: 50%;
    z-index: 4;
    box-shadow: 0 0 16px rgba(34, 211, 155, 1), 0 0 32px rgba(16, 185, 129, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.3);
  }

  .radar-center.scanning {
    animation: radar-pulse-active 1.5s ease-in-out infinite;
  }

  .radar-center.found {
    animation: radar-pulse-found 1s ease-in-out infinite;
  }

  .radar-blip {
    position: absolute;
    width: 8px;
    height: 8px;
    background: radial-gradient(circle, rgba(167, 243, 208, 1), rgba(34, 211, 155, 0.6));
    border-radius: 50%;
    z-index: 3;
    animation: blip-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(34, 211, 155, 0.9);
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

  /* ─── Decorative Circuit Traces ─────────────────────────────────────── */
  @keyframes trace-flow {
    to {
      stroke-dashoffset: 0;
    }
  }

  .circuit-traces {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    opacity: 0.45;
    z-index: 0 !important;
  }

  .trace-base {
    stroke: rgba(0, 255, 0, 0.15);
    stroke-width: 1;
    fill: none;
  }

  .trace-flow {
    fill: none;
    stroke-width: 1.5;
    stroke-dasharray: 12 180;
    stroke-dashoffset: 192;
    animation: trace-flow 4s cubic-bezier(0.4, 0, 0.85, 1) infinite;
  }

  .trace-c1 {
    stroke: #00ff00;
  }

  .trace-c2 {
    stroke: #00ff88;
    animation-delay: -1.2s;
  }

  .trace-c3 {
    stroke: #00ffaa;
    animation-delay: -2.4s;
  }

  .trace-c4 {
    stroke: #00ffcc;
    animation-delay: -0.6s;
  }

  .trace-dot {
    fill: rgba(0, 255, 0, 0.4);
  }

  .trace-corner-tick {
    position: absolute;
    width: 60px;
    height: 40px;
    pointer-events: none;
  }

  .trace-tick-tl {
    top: 8px;
    left: 8px;
    border-top: 1px solid rgba(0, 255, 0, 0.4);
    border-left: 1px solid rgba(0, 255, 0, 0.4);
  }

  .trace-tick-tr {
    top: 8px;
    right: 8px;
    border-top: 1px solid rgba(0, 255, 136, 0.35);
    border-right: 1px solid rgba(0, 255, 136, 0.35);
  }

  .trace-tick-bl {
    bottom: 8px;
    left: 8px;
    border-bottom: 1px solid rgba(0, 255, 170, 0.35);
    border-left: 1px solid rgba(0, 255, 170, 0.35);
  }

  .trace-tick-br {
    bottom: 8px;
    right: 8px;
    border-bottom: 1px solid rgba(0, 255, 204, 0.4);
    border-right: 1px solid rgba(0, 255, 204, 0.4);
  }

  /* ─── Hexagon Nodes ───────────────────────────────────────────────── */
  .hex-node {
    position: absolute;
    width: 12px;
    height: 12px;
    transform: rotate(30deg);
    pointer-events: none;
    animation: hex-pulse 3s ease-in-out infinite;
  }

  .hex-node-inner {
    width: 100%;
    height: 100%;
    border: 1.5px solid rgba(0, 255, 0, 0.5);
    background: rgba(0, 255, 0, 0.08);
    clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
  }

  @keyframes hex-pulse {
    0%, 100% {
      opacity: 0.6;
      box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 16px rgba(0, 255, 0, 0.6);
    }
  }

  /* ─── Data Stream Lines ──────────────────────────────────────────── */
  @keyframes data-stream {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  .data-stream {
    stroke: rgba(0, 255, 0, 0.3);
    stroke-width: 1;
    fill: none;
    stroke-dasharray: 5 10;
    animation: data-stream 8s linear infinite;
  }

  .data-stream-fast {
    animation-duration: 4s;
  }

  /* ─── Corner Brackets ────────────────────────────────────────────── */
  .corner-bracket {
    position: absolute;
    width: 80px;
    height: 80px;
    pointer-events: none;
  }

  .corner-bracket-tl {
    top: 0;
    left: 0;
    border-top: 2px solid rgba(0, 255, 0, 0.4);
    border-left: 2px solid rgba(0, 255, 0, 0.4);
    border-top-left-radius: 4px;
  }

  .corner-bracket-tl::before,
  .corner-bracket-tl::after {
    content: '';
    position: absolute;
    background: rgba(0, 255, 0, 0.6);
  }

  .corner-bracket-tl::before {
    width: 20px;
    height: 2px;
    top: -2px;
    left: 30px;
  }

  .corner-bracket-tl::after {
    width: 2px;
    height: 20px;
    left: -2px;
    top: 30px;
  }

  .corner-bracket-tr {
    top: 0;
    right: 0;
    border-top: 2px solid rgba(0, 255, 136, 0.4);
    border-right: 2px solid rgba(0, 255, 136, 0.4);
    border-top-right-radius: 4px;
  }

  .corner-bracket-bl {
    bottom: 0;
    left: 0;
    border-bottom: 2px solid rgba(0, 255, 170, 0.4);
    border-left: 2px solid rgba(0, 255, 170, 0.4);
    border-bottom-left-radius: 4px;
  }

  .corner-bracket-br {
    bottom: 0;
    right: 0;
    border-bottom: 2px solid rgba(0, 255, 204, 0.4);
    border-right: 2px solid rgba(0, 255, 204, 0.4);
    border-bottom-right-radius: 4px;
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

// ─── Decorative Circuit Traces (Terminal Border) ─────────────────────────────
function TerminalBorderTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 1200 100" preserveAspectRatio="none">
      {/* Horizontal top traces */}
      <path className="trace-base" d="M0 40 H30 V30 H60" />
      <path className="trace-flow trace-c1" d="M0 40 H30 V30 H60" />
      
      <path className="trace-base" d="M0 60 H20 V70 H60" />
      <path className="trace-flow trace-c2" d="M0 60 H20 V70 H60" />
      
      <path className="trace-base" d="M1200 40 H1170 V30 H1140" />
      <path className="trace-flow trace-c3" d="M1200 40 H1170 V30 H1140" />
      
      <path className="trace-base" d="M1200 60 H1180 V70 H1140" />
      <path className="trace-flow trace-c4" d="M1200 60 H1180 V70 H1140" />

      {/* Center traces */}
      <path className="trace-base" d="M580 10 H600 L610 20 H630" />
      <path className="trace-flow trace-c2" d="M580 10 H600 L610 20 H630" />
      
      <path className="trace-base" d="M580 90 H600 L610 80 H630" />
      <path className="trace-flow trace-c1" d="M580 90 H600 L610 80 H630" />

      {/* Connection dots */}
      <circle className="trace-dot" cx="60" cy="30" r="2" />
      <circle className="trace-dot" cx="60" cy="70" r="2" />
      <circle className="trace-dot" cx="1140" cy="30" r="2" />
      <circle className="trace-dot" cx="1140" cy="70" r="2" />
      <circle className="trace-dot" cx="630" cy="20" r="2" />
      <circle className="trace-dot" cx="630" cy="80" r="2" />
    </svg>
  );
}

// ─── Decorative Circuit Traces (Sidebar) ─────────────────────────────────────
function SidebarTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 260 800" preserveAspectRatio="xMidYMid slice">
      {/* Vertical side traces */}
      <path className="trace-base" d="M20 0 V30 H30 V60" />
      <path className="trace-flow trace-c1" d="M20 0 V30 H30 V60" />
      
      <path className="trace-base" d="M240 0 V30 H230 V60" />
      <path className="trace-flow trace-c2" d="M240 0 V30 H230 V60" />
      
      <path className="trace-base" d="M20 740 V770 H30 V800" />
      <path className="trace-flow trace-c3" d="M20 740 V770 H30 V800" />
      
      <path className="trace-base" d="M240 740 V770 H230 V800" />
      <path className="trace-flow trace-c4" d="M240 740 V770 H230 V800" />

      {/* Middle traces */}
      <path className="trace-base" d="M10 380 H40 V390 H70" />
      <path className="trace-flow trace-c2" d="M10 380 H40 V390 H70" />
      
      <path className="trace-base" d="M250 400 H220 V410 H190" />
      <path className="trace-flow trace-c3" d="M250 400 H220 V410 H190" />

      {/* Diagonal connectors */}
      <path className="trace-base" d="M0 200 L15 200 L25 210 L40 210" />
      <path className="trace-flow trace-c1" d="M0 200 L15 200 L25 210 L40 210" />
      
      <path className="trace-base" d="M260 600 L245 600 L235 590 L220 590" />
      <path className="trace-flow trace-c4" d="M260 600 L245 600 L235 590 L220 590" />

      {/* Connection dots */}
      <circle className="trace-dot" cx="30" cy="60" r="2" />
      <circle className="trace-dot" cx="230" cy="60" r="2" />
      <circle className="trace-dot" cx="30" cy="770" r="2" />
      <circle className="trace-dot" cx="230" cy="770" r="2" />
      <circle className="trace-dot" cx="70" cy="390" r="2" />
      <circle className="trace-dot" cx="190" cy="410" r="2" />
      <circle className="trace-dot" cx="40" cy="210" r="2" />
      <circle className="trace-dot" cx="220" cy="590" r="2" />
    </svg>
  );
}

// ─── Bottom Border Traces (Mirror of Top) ────────────────────────────────────
function TerminalBottomTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 1200 100" preserveAspectRatio="none">
      {/* Horizontal bottom traces - mirrored */}
      <path className="trace-base" d="M0 60 H30 V70 H60" />
      <path className="trace-flow trace-c3" d="M0 60 H30 V70 H60" />
      
      <path className="trace-base" d="M0 40 H20 V30 H60" />
      <path className="trace-flow trace-c4" d="M0 40 H20 V30 H60" />
      
      <path className="trace-base" d="M1200 60 H1170 V70 H1140" />
      <path className="trace-flow trace-c1" d="M1200 60 H1170 V70 H1140" />
      
      <path className="trace-base" d="M1200 40 H1180 V30 H1140" />
      <path className="trace-flow trace-c2" d="M1200 40 H1180 V30 H1140" />

      {/* Center traces */}
      <path className="trace-base" d="M580 90 H600 L610 80 H630" />
      <path className="trace-flow trace-c1" d="M580 90 H600 L610 80 H630" />
      
      <path className="trace-base" d="M580 10 H600 L610 20 H630" />
      <path className="trace-flow trace-c4" d="M580 10 H600 L610 20 H630" />

      {/* Connection dots */}
      <circle className="trace-dot" cx="60" cy="70" r="2" />
      <circle className="trace-dot" cx="60" cy="30" r="2" />
      <circle className="trace-dot" cx="1140" cy="70" r="2" />
      <circle className="trace-dot" cx="1140" cy="30" r="2" />
      <circle className="trace-dot" cx="630" cy="80" r="2" />
      <circle className="trace-dot" cx="630" cy="20" r="2" />
    </svg>
  );
}

// ─── Center Terminal Backdrop (Complex Grid) ─────────────────────────────────
function TerminalBackdropTraces() {
  return (
    <svg className="circuit-traces" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
      {/* Diagonal cross traces */}
      <path className="trace-base" d="M0 0 L100 100 L150 100 L250 200" />
      <path className="trace-flow trace-c1" d="M0 0 L100 100 L150 100 L250 200" />
      
      <path className="trace-base" d="M1000 0 L900 100 L850 100 L750 200" />
      <path className="trace-flow trace-c2" d="M1000 0 L900 100 L850 100 L750 200" />
      
      <path className="trace-base" d="M0 600 L100 500 L150 500 L250 400" />
      <path className="trace-flow trace-c3" d="M0 600 L100 500 L150 500 L250 400" />
      
      <path className="trace-base" d="M1000 600 L900 500 L850 500 L750 400" />
      <path className="trace-flow trace-c4" d="M1000 600 L900 500 L850 500 L750 400" />

      {/* Horizontal data streams */}
      <path className="data-stream" d="M0 150 H1000" />
      <path className="data-stream data-stream-fast" d="M0 200 H1000" />
      <path className="data-stream" d="M0 250 H1000" style={{ animationDelay: '-2s' }} />
      <path className="data-stream data-stream-fast" d="M0 300 H1000" style={{ animationDelay: '-1s' }} />
      <path className="data-stream" d="M0 350 H1000" style={{ animationDelay: '-3s' }} />
      <path className="data-stream data-stream-fast" d="M0 400 H1000" style={{ animationDelay: '-1.5s' }} />
      <path className="data-stream" d="M0 450 H1000" style={{ animationDelay: '-2.5s' }} />

      {/* Complex zigzag paths */}
      <path className="trace-base" d="M100 300 H200 V280 H300 V320 H400" />
      <path className="trace-flow trace-c2" d="M100 300 H200 V280 H300 V320 H400" />
      
      <path className="trace-base" d="M900 300 H800 V280 H700 V320 H600" />
      <path className="trace-flow trace-c3" d="M900 300 H800 V280 H700 V320 H600" />

      {/* Vertical bus lines */}
      <path className="trace-base" d="M500 0 V150 L520 170 V250" />
      <path className="trace-flow trace-c1" d="M500 0 V150 L520 170 V250" />
      
      <path className="trace-base" d="M500 600 V450 L480 430 V350" />
      <path className="trace-flow trace-c4" d="M500 600 V450 L480 430 V350" />

      {/* Connection nodes */}
      <circle className="trace-dot" cx="250" cy="200" r="3" />
      <circle className="trace-dot" cx="750" cy="200" r="3" />
      <circle className="trace-dot" cx="250" cy="400" r="3" />
      <circle className="trace-dot" cx="750" cy="400" r="3" />
      <circle className="trace-dot" cx="400" cy="300" r="3" />
      <circle className="trace-dot" cx="600" cy="300" r="3" />
      <circle className="trace-dot" cx="500" cy="250" r="3" />
      <circle className="trace-dot" cx="500" cy="350" r="3" />
    </svg>
  );
}

export function AdvancedTerminalPanel({
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
  const { themeKey, sizeKey, decorationsEnabled, theme: logTheme, size: logSize, setTheme, setSize, setDecorations, resetToDefault } = useLogPreferences();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<{ fit: () => void } | null>(null);

  // Show decorations based on user preference (not theme)
  const showDecorations = decorationsEnabled;

  // ── Cancel confirmation modal state ──────────────────────────────────────
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [radarTick, setRadarTick] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  // ── Dynamic System Stats ─────────────────────────────────────────────────
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [networkThroughput, setNetworkThroughput] = useState(0);
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
  const radarState = useMemo(() => {
    const findingCount = run.findings || 0;
    const status = String(run.status || "").toLowerCase();
    const isRunning =
      isSubmitting ||
      isStreaming ||
      status.includes("running") ||
      status.includes("scanning") ||
      status.includes("processing") ||
      status.includes("active");
    const isFailed = status.includes("failed");
    const isDone = status.includes("completed");

    const blips = Array.from({ length: Math.min(4, Math.max(2, findingCount > 0 ? findingCount : 2)) }, (_, index) => ({
      x: [-26, 18, 10, -12][index % 4],
      y: [14, -16, -8, 10][index % 4],
      delay: index * 0.45,
    }));

    return {
      sweepDuration: isRunning ? 2.8 : isDone ? 4.2 : isFailed ? 5.5 : 3.8,
      sweepTone: isFailed
        ? "rgba(248,113,113,0.32)"
        : isDone
          ? "rgba(45,212,191,0.34)"
          : isRunning
            ? "rgba(74,222,128,0.42)"
            : "rgba(74,222,128,0.28)",
      pulseTone: isFailed
        ? "rgba(248,113,113,0.55)"
        : isDone
          ? "rgba(45,212,191,0.55)"
          : "rgba(52,211,153,0.55)",
      blips,
      badge: isFailed ? "alert" : isDone ? "locked" : isRunning ? "tracking" : "idle",
    };
  }, [isSubmitting, isStreaming, run.findings, run.status]);

  useEffect(() => {
    const status = String(run.status || "").toLowerCase();
    const isRadarActive =
      isSubmitting ||
      isStreaming ||
      status.includes("running") ||
      status.includes("scanning") ||
      status.includes("processing") ||
      status.includes("active");

    if (!isRadarActive) {
      setRadarTick(0);
      return;
    }

    const interval = window.setInterval(() => {
      setRadarTick((value) => (value + 1) % 360);
    }, 24);

    return () => window.clearInterval(interval);
  }, [isSubmitting, isStreaming, run.status]);

  // ── Real Browser Performance Metrics ─────────────────────────────────────
  const [perfStats, setPerfStats] = useState({
    memory: 0,        // JS heap used (real, Chrome only)
    memoryMax: 0,     // JS heap limit
    timing: 0,        // page load timing
    fps: 0,           // real frame rate
    ping: 0,          // real latency to backend
    logRate: 0,       // real logs per second
  });
  const lastLogCountRef = useRef(0);
  const lastLogTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  useEffect(() => {
    let rafId: number;

    // Real FPS counter via requestAnimationFrame
    const countFrame = () => {
      frameCountRef.current++;
      rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);

    const interval = window.setInterval(() => {
      const now = Date.now();

      // ── Real FPS ──
      const elapsed = (now - lastFpsTimeRef.current) / 1000;
      const fps = Math.round(frameCountRef.current / elapsed);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;

      // ── Real JS heap memory (Chrome only) ──
      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      };
      const memUsed = perf.memory ? Math.round(perf.memory.usedJSHeapSize / 1024 / 1024) : 0;
      const memMax = perf.memory ? Math.round(perf.memory.jsHeapSizeLimit / 1024 / 1024) : 0;

      // ── Real log rate (logs/sec) ──
      const logDelta = logs.length - lastLogCountRef.current;
      const timeDelta = (now - lastLogTimeRef.current) / 1000;
      const rate = timeDelta > 0 ? Math.round(logDelta / timeDelta) : 0;
      lastLogCountRef.current = logs.length;
      lastLogTimeRef.current = now;

      setPerfStats({
        memory: memUsed,
        memoryMax: memMax,
        timing: Math.round(performance.now() / 1000),
        fps: Math.min(fps, 144),
        ping: 0,
        logRate: Math.max(0, rate),
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, [logs.length]);

  const systemProfile = useMemo(
    () => [
      {
        label: "Browser",
        value: (() => {
          if (typeof navigator === "undefined") return "Browser";
          const nav = navigator as NavigatorWithExtras;
          const agent = nav.userAgent;
          const match = agent.match(/(Chrome|Chromium|Firefox|Safari|Edge)\/?\s*([\d.]+)/i);
          if (match?.[1] && match[2]) {
            const version = match[2].split(".")[0];
            return `${match[1]} ${version}`;
          }
          const brand = nav.userAgentData?.brands?.find((item: { brand: string; version: string }) => !/not/i.test(item.brand));
          return brand ? `${brand.brand} ${String(brand.version).split(".")[0]}` : "Browser";
        })(),
        tone: "text-green-300",
      },
      {
        label: "OS",
        value: (() => {
          if (typeof navigator === "undefined") return "Unknown OS";
          const nav = navigator as NavigatorWithExtras;
          const platformHint = `${nav.userAgentData?.platform ?? ""} ${nav.platform ?? ""} ${nav.userAgent ?? ""}`.toLowerCase();
          if (platformHint.includes("iphone") || platformHint.includes("ipad") || platformHint.includes("ipod")) return "iOS";
          if (platformHint.includes("mac")) return "macOS";
          if (platformHint.includes("android")) return "Android";
          if (platformHint.includes("win")) return "Windows";
          if (platformHint.includes("linux")) return "Linux";
          return "Unknown OS";
        })(),
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
        value: typeof navigator !== "undefined"
          ? (navigator.onLine ? "Online" : "Offline")
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

  // ── Top-bar RESET button — clears terminal + shows splash ────────────────
  const handleReset = useCallback(() => {
    const term = termRef.current;
    lineRef.current = "";
    cursorRef.current = 0;
    histIdxRef.current = -1;
    isInputActiveRef.current = true;
    onResetRef.current();
    useGraphStore.getState().reset();
    if (term) {
      term.reset();          // clears scrollback
      showSplash(term);      // re-shows the splash screen
      term.write(getPrompt());
    }
  }, [getPrompt, showSplash]);

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
          className="relative z-20 border-b-2 px-6 py-3.5 backdrop-blur-sm bg-black flex items-center justify-center cyber-pulse overflow-hidden"
          style={{ borderColor: "rgba(0, 255, 0, 0.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Top bar corner traces — angular paths converging toward center title */}
          {showDecorations && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.55 }} viewBox="0 0 1200 56" preserveAspectRatio="none">
            {/* ── LEFT SIDE — from window controls toward center ── */}
            {/* Branch 1: steps down then right */}
            <path className="trace-base" d="M0 8 H18 V14 H38 V10 H72 V20 H95 V12 H130 V28 H160 V22 H200 V28" />
            <path className="trace-flow trace-c1" d="M0 8 H18 V14 H38 V10 H72 V20 H95 V12 H130 V28 H160 V22 H200 V28" />
            {/* Branch 2: steps up then right */}
            <path className="trace-base" d="M0 48 H22 V42 H50 V48 H80 V38 H110 V44 H145 V34 H175 V28" />
            <path className="trace-flow trace-c2" d="M0 48 H22 V42 H50 V48 H80 V38 H110 V44 H145 V34 H175 V28" />
            {/* Branch 3: short diagonal hop */}
            <path className="trace-base" d="M60 0 V8 H90 V16 H118 V28" />
            <path className="trace-flow trace-c3" d="M60 0 V8 H90 V16 H118 V28" />

            {/* Dots at left branch endpoints */}
            <circle className="trace-dot" cx="200" cy="28" r="2" />
            <circle className="trace-dot" cx="175" cy="28" r="2" />
            <circle className="trace-dot" cx="118" cy="28" r="2" />
            <circle className="trace-dot" cx="38" cy="10" r="1.5" />
            <circle className="trace-dot" cx="95" cy="12" r="1.5" />
            <circle className="trace-dot" cx="145" cy="34" r="1.5" />

            {/* ── RIGHT SIDE — from buttons toward center ── */}
            {/* Branch 1: steps down then left */}
            <path className="trace-base" d="M1200 8 H1182 V14 H1162 V10 H1128 V20 H1105 V12 H1070 V28 H1040 V22 H1000 V28" />
            <path className="trace-flow trace-c3" d="M1200 8 H1182 V14 H1162 V10 H1128 V20 H1105 V12 H1070 V28 H1040 V22 H1000 V28" />
            {/* Branch 2: steps up then left */}
            <path className="trace-base" d="M1200 48 H1178 V42 H1150 V48 H1120 V38 H1090 V44 H1055 V34 H1025 V28" />
            <path className="trace-flow trace-c4" d="M1200 48 H1178 V42 H1150 V48 H1120 V38 H1090 V44 H1055 V34 H1025 V28" />
            {/* Branch 3: short hop from top */}
            <path className="trace-base" d="M1140 0 V8 H1110 V16 H1082 V28" />
            <path className="trace-flow trace-c1" d="M1140 0 V8 H1110 V16 H1082 V28" />

            {/* Dots at right branch endpoints */}
            <circle className="trace-dot" cx="1000" cy="28" r="2" />
            <circle className="trace-dot" cx="1025" cy="28" r="2" />
            <circle className="trace-dot" cx="1082" cy="28" r="2" />
            <circle className="trace-dot" cx="1162" cy="10" r="1.5" />
            <circle className="trace-dot" cx="1105" cy="12" r="1.5" />
            <circle className="trace-dot" cx="1055" cy="34" r="1.5" />
          </svg>
          )}
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
                <motion.div className="h-2 w-2 rounded-full bg-green-500/80" />
                <motion.span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-green-400 dark:text-green-300">{selectedProject ? `${selectedProject.name}@auto-offensive` : "auto-offensive"} :: ADVANCED_SCAN</motion.span>
              </div>
            </div>

            {/* Right side - Status and Controls */}
            <div className="flex items-center gap-3 ml-4">
              {isSubmitting && (
                <motion.span className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-1 text-[10px] sm:text-xs font-bold flex items-center gap-2 whitespace-nowrap text-green-400 dark:text-green-300">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap size={11} />
                  </motion.div>
                  RUNNING
                </motion.span>
              )}

              {/* Settings toggle button */}
              <motion.button
                ref={settingsBtnRef}
                type="button"
                onClick={() => setShowSettings(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-[10px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  showSettings
                    ? "border-green-500/70 bg-green-500/20 text-green-300 shadow-[0_0_10px_rgba(0,255,0,0.2)]"
                    : "border-green-500/30 bg-black/60 text-green-400/70 hover:border-green-500/50 hover:text-green-400"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                CONFIG
              </motion.button>

              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 rounded-md border border-green-500/40 bg-black/80 px-3 py-1 text-[10px] sm:text-xs font-bold text-green-400 transition-all duration-300 whitespace-nowrap hover:bg-green-500/10"
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

        {/* ── Settings Dropdown ── */}
        {showSettings && (
          <>
            {/* Click-outside overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 right-4 top-[52px] bg-black/95 backdrop-blur-md border border-green-500/25 rounded-lg overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-green-500/15">
                <span className="text-[9px] font-mono text-green-500/40 tracking-[0.2em] uppercase">Configuration</span>
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

        {/* ── Full-width xterm with cyber effects ── */}
        <div className="relative flex-1 w-full bg-black overflow-hidden" style={{ minHeight: "720px" }}>
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
          
          {/* xterm Container — fills full width minus sidebar width */}
          <div
            ref={containerRef}
            className="terminal-content overflow-hidden terminal-glow scanline-bg relative min-h-0"
            style={{ 
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              borderRight: "2px solid rgba(0, 255, 0, 0.2)",
              borderTop: "2px solid rgba(0, 255, 0, 0.2)",
              position: "absolute",
              inset: 0,
              right: "260px", /* same as sidebar width */
              zIndex: 2,
            }}
          >
            {/* ─── CLEAN MINIMAL DECORATIONS (Just Corner Brackets) ─── */}
            {showDecorations && (
              <>
                {/* Large Corner Brackets Only - Clean & Simple */}
                <span className="corner-bracket corner-bracket-tl" />
                <span className="corner-bracket corner-bracket-tr" />
                <span className="corner-bracket corner-bracket-bl" />
                <span className="corner-bracket corner-bracket-br" />
              </>
            )}

            {/* ─── FLOATING RADAR DISPLAY (Top-Right Corner - Compact & Subtle) ─── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="absolute top-0 right-0 z-50"
              style={{ pointerEvents: 'none' }}
            >
              <div className="bg-black/60 backdrop-blur-sm border-l-2 border-b-2 border-emerald-600/20 rounded-bl-lg p-2">
                {/* Minimal Title */}
                <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-emerald-400/60 mb-1 text-center">
                  Threat Map
                </div>
                
                {/* Compact Radar Display */}
                <div className="radar-container border border-emerald-600/15" style={{ width: '100px', height: '100px' }}>
                  <div className="radar-base">
                    {/* Concentric Rings */}
                    <div className="radar-ring radar-ring-1" />
                    <div className="radar-ring radar-ring-2" />
                    <div className="radar-ring radar-ring-3" />

                    {/* Rotating Sweep Line */}
                    <div className={`radar-sweep ${
                      isSubmitting || isStreaming || 
                      (run.status && !String(run.status).toLowerCase().includes('completed') && !String(run.status).toLowerCase().includes('idle')) 
                        ? 'scanning' 
                        : ''
                    }`} />

                    {/* Center Point */}
                    <div className={`radar-center ${
                      isSubmitting || isStreaming 
                        ? 'scanning' 
                        : (run.findings && run.findings > 0) 
                          ? 'found' 
                          : ''
                    }`} />

                    {/* Radar Blips */}
                    {(run.findings && run.findings > 0) && radarState.blips.map((blip, idx) => {
                      const angle = (idx * 90) + (radarTick * 0.5);
                      const radius = 35 + (idx % 2) * 12;  // Adjusted for much smaller radar
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;

                      return (
                        <motion.div
                          key={idx}
                          className="radar-blip"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                          }}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Redesigned Sidebar — 800px wide, clean layout ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col z-10 overflow-y-auto bg-black/70 backdrop-blur-md border-l border-green-500/20"
            style={{
              position: "absolute",
              top: 0, right: 0, bottom: 0,
              width: "260px",
              isolation: "isolate",
              overflowX: "hidden",
            }}
          >
            {/* Corner decorations */}
            {showDecorations && (
              <>
                <span className="corner-bracket corner-bracket-tl" />
                <span className="corner-bracket corner-bracket-tr" />
                <span className="corner-bracket corner-bracket-bl" />
                <span className="corner-bracket corner-bracket-br" />
                {/* SVG traces BEHIND all content */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                  <SidebarTraces />
                </div>
              </>
            )}

            {/* ── Header ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{ opacity: [0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-green-400/80 uppercase">Scan Analytics</span>
              </div>
              <span className="text-[9px] font-mono text-green-500/30 tracking-widest">SYS</span>
            </div>

            {/* ── Project + Status row ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/10 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-mono text-green-500/40 tracking-[0.18em] uppercase mb-1">Project</div>
                <div className="text-[11px] font-mono text-green-300 truncate">
                  {selectedProject?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-green-500/40 tracking-[0.18em] uppercase mb-1">Status</div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className={`w-1.5 h-1.5 rounded-full ${isSubmitting ? "bg-green-400" : "bg-green-500/30"}`}
                    animate={isSubmitting ? { opacity: [0.4, 1], scale: [0.8, 1.2, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <span className={`text-[10px] font-mono ${isSubmitting ? "text-green-400" : "text-green-500/40"}`}>
                    {isSubmitting ? "RUNNING" : "IDLE"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 3 Stat cards: Findings / Logs / Errors ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/10 grid grid-cols-3 gap-2">
              {[
                { label: "Vulns",   value: run.findings || 0,  color: "text-emerald-400", border: "border-emerald-500/20" },
                { label: "Logs",    value: logs.length,         color: "text-cyan-400",    border: "border-cyan-500/20" },
                { label: "Errors",  value: errors.length,       color: errors.length > 0 ? "text-red-400" : "text-green-500/30", border: errors.length > 0 ? "border-red-500/30" : "border-green-500/10" },
              ].map(s => (
                <div key={s.label} className={`bg-black/40 border ${s.border} rounded-lg p-2 text-center`}>
                  <motion.div
                    className={`text-xl font-mono font-bold ${s.color}`}
                    animate={{ opacity: isSubmitting ? [0.7, 1] : 1 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {s.value}
                  </motion.div>
                  <div className="text-[8px] font-mono text-green-500/40 tracking-widest uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── System metrics ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/10 space-y-2">
              <div className="text-[9px] font-mono text-green-500/40 tracking-[0.18em] uppercase">Performance</div>

              {/* FPS — compact glowing bar with scanline feel */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[9px] font-mono text-green-400/50 tracking-widest">FPS</span>
                  <motion.span
                    className={`text-[13px] font-mono font-black tabular-nums ${
                      perfStats.fps >= 45 ? "text-green-400" : perfStats.fps >= 20 ? "text-yellow-400" : "text-red-400"
                    }`}
                    style={{ textShadow: perfStats.fps >= 45 ? "0 0 8px rgba(74,222,128,0.8)" : perfStats.fps >= 20 ? "0 0 8px rgba(250,204,21,0.8)" : "0 0 8px rgba(239,68,68,0.8)" }}
                    animate={{ opacity: [0.8, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    {perfStats.fps}
                  </motion.span>
                </div>
                {/* Segmented bar - tight, glowing */}
                <div className="flex gap-px h-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const filled = i < Math.round((Math.min(perfStats.fps, 60) / 60) * 30);
                    const isHigh = i >= 24;
                    const isMid = i >= 15 && i < 24;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-[1px]"
                        animate={{
                          backgroundColor: filled
                            ? isHigh ? "rgba(239,68,68,1)" : isMid ? "rgba(250,204,21,1)" : "rgba(74,222,128,1)"
                            : "rgba(255,255,255,0.04)",
                          boxShadow: filled
                            ? isHigh ? "0 0 4px rgba(239,68,68,0.6)" : isMid ? "0 0 4px rgba(250,204,21,0.6)" : "0 0 4px rgba(74,222,128,0.6)"
                            : "none",
                        }}
                        transition={{ duration: 0.2, delay: i * 0.008 }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* HEAP — glowing inline compact */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[9px] font-mono text-cyan-400/50 tracking-widest">HEAP</span>
                  <motion.span
                    className="text-[13px] font-mono font-black text-cyan-400 tabular-nums"
                    style={{ textShadow: "0 0 8px rgba(34,211,238,0.7)" }}
                    animate={{ opacity: [0.8, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  >
                    {perfStats.memory > 0 ? `${perfStats.memory}` : "—"}<span className="text-[9px] font-normal text-cyan-400/60">MB</span>
                  </motion.span>
                </div>
                {perfStats.memory > 0 && perfStats.memoryMax > 0 ? (
                  <div className="relative h-2 bg-white/[0.03] rounded-sm overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-300 rounded-sm"
                      animate={{ width: `${Math.min(100, (perfStats.memory / perfStats.memoryMax) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ boxShadow: "0 0 8px rgba(34,211,238,0.5)" }}
                    />
                    {/* Traveling glow head */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-3 bg-white/30 blur-sm rounded-full"
                      animate={{ left: [`0%`, `${Math.min(100, (perfStats.memory / perfStats.memoryMax) * 100) - 5}%`] }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-white/[0.03] rounded-sm flex items-center px-2">
                    <span className="text-[8px] font-mono text-cyan-500/20">Chrome only</span>
                  </div>
                )}
              </div>

              {/* LOG/s + uptime — side by side stat boxes */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="bg-purple-500/5 border border-purple-500/15 rounded-md px-2 py-1.5">
                  <div className="text-[8px] font-mono text-purple-400/40 tracking-widest uppercase">Log/s</div>
                  <motion.div
                    className="text-[16px] font-mono font-black text-purple-400 tabular-nums leading-tight"
                    style={{ textShadow: "0 0 10px rgba(168,85,247,0.7)" }}
                    animate={{ opacity: perfStats.logRate > 0 ? [0.7, 1] : 0.4 }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  >
                    {perfStats.logRate}
                  </motion.div>
                </div>
                <div className="bg-green-500/5 border border-green-500/10 rounded-md px-2 py-1.5">
                  <div className="text-[8px] font-mono text-green-400/40 tracking-widest uppercase">Uptime</div>
                  <motion.div
                    className="text-[13px] font-mono font-bold text-green-400/70 tabular-nums leading-tight"
                    animate={{ opacity: [0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {perfStats.timing}s
                  </motion.div>
                </div>
              </div>
            </div>

            {/* ── Environment rows ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/10 space-y-1.5">
              <div className="text-[9px] font-mono text-green-500/40 tracking-[0.18em] uppercase mb-2">Environment</div>
              {systemProfile.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-green-500/40 uppercase tracking-wider">{item.label}</span>
                  <span className={`text-[10px] font-mono font-semibold ${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* ── Recent logs ── */}
            <div className="relative z-10 px-4 py-3 border-b border-green-500/10 flex-1 min-h-0">
              {/* Corner traces for recent box */}
              {showDecorations && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.4 }} viewBox="0 0 260 120" preserveAspectRatio="none">
                <path className="trace-base" d="M0 20 H16 V10 H36" /><path className="trace-flow trace-c1" d="M0 20 H16 V10 H36" />
                <path className="trace-base" d="M260 20 H244 V10 H224" /><path className="trace-flow trace-c3" d="M260 20 H244 V10 H224" />
                <path className="trace-base" d="M0 100 H16 V110 H36" /><path className="trace-flow trace-c2" d="M0 100 H16 V110 H36" />
                <path className="trace-base" d="M260 100 H244 V110 H224" /><path className="trace-flow trace-c4" d="M260 100 H244 V110 H224" />
                <circle className="trace-dot" cx="36" cy="10" r="1.5" />
                <circle className="trace-dot" cx="224" cy="10" r="1.5" />
                <circle className="trace-dot" cx="36" cy="110" r="1.5" />
                <circle className="trace-dot" cx="224" cy="110" r="1.5" />
              </svg>
              )}
              <div className="relative z-10">
              <div className="text-[9px] font-mono text-green-500/40 tracking-[0.18em] uppercase mb-2">Recent</div>
              <div className="space-y-1.5">
                {logs.slice(-4).length > 0 ? logs.slice(-4).map((log, idx) => (
                  <motion.div
                    key={idx}
                    className="text-[9px] font-mono text-green-300/50 truncate leading-relaxed"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="text-green-500/30 mr-1">›</span>{log.text.substring(0, 28)}
                  </motion.div>
                )) : (
                  <div className="text-[9px] font-mono text-green-500/20 italic">awaiting output…</div>
                )}
              </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="relative z-10 px-4 py-3 border-t border-green-500/15 mt-auto">
              {/* Corner traces for footer */}
              {showDecorations && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.4 }} viewBox="0 0 260 70" preserveAspectRatio="none">
                <path className="trace-base" d="M0 14 H14 V6 H32" /><path className="trace-flow trace-c1" d="M0 14 H14 V6 H32" />
                <path className="trace-base" d="M260 14 H246 V6 H228" /><path className="trace-flow trace-c2" d="M260 14 H246 V6 H228" />
                <path className="trace-base" d="M0 56 H14 V64 H32" /><path className="trace-flow trace-c3" d="M0 56 H14 V64 H32" />
                <path className="trace-base" d="M260 56 H246 V64 H228" /><path className="trace-flow trace-c4" d="M260 56 H246 V64 H228" />
                <circle className="trace-dot" cx="32" cy="6" r="1.5" />
                <circle className="trace-dot" cx="228" cy="6" r="1.5" />
                <circle className="trace-dot" cx="32" cy="64" r="1.5" />
                <circle className="trace-dot" cx="228" cy="64" r="1.5" />
              </svg>
              )}
              <div className="flex items-center justify-between mb-1">
                <motion.span
                  className="text-[9px] font-mono text-red-500 tracking-widest uppercase"
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Connection
                </motion.span>
                <motion.span
                  className="text-[9px] font-mono text-green-500 tracking-widest uppercase"
                  animate={{ opacity: [0.6, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                >
                  Active
                </motion.span>
              </div>
              <div className="text-[9px] font-mono">
                <span className="text-yellow-500">v7.2.1-</span>
                <span className="text-red-500">advanced</span>
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
