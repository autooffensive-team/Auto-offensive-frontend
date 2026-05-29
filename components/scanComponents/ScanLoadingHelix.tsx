"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── DNA Helix / Data Stream Loading Animation ────────────────────────────────
// Two interweaving sine waves of dots flowing downward with staggered opacity,
// plus cycling status messages for scan feedback.

const STATUS_MESSAGES = [
  "Initializing scan engine...",
  "Establishing connection...",
  "Negotiating protocol...",
  "Probing target surface...",
  "Enumerating services...",
  "Waiting for scan output...",
  "Analyzing attack vectors...",
  "Processing scan pipeline...",
];

const HELIX_DOTS = 14;
const COLUMNS = 2; // two strands

interface ScanLoadingHelixProps {
  /** Primary accent color (hex) — defaults to teal */
  color?: string;
  /** Optional className for the container */
  className?: string;
  /** Compact mode — shows inline spinner + text only, no big SVG helix */
  compact?: boolean;
}

export function ScanLoadingHelix({
  color = "#2dd4bf",
  className,
  compact = false,
}: ScanLoadingHelixProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Cycle status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Animate trailing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ── Compact mode: inline spinner + text ──────────────────────────────────
  if (compact) {
    return (
      <div className={cn("flex items-center justify-center gap-3 px-4", className)}>
        {/* Mini helix — just 6 dots in a small SVG */}
        <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0" style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const progress = i / 6;
            const angle = progress * Math.PI * 2;
            const x1 = 20 + Math.sin(angle) * 12;
            const x2 = 20 + Math.sin(angle + Math.PI) * 12;
            const y = 5 + progress * 30;
            const z1 = Math.cos(angle);
            const opacity1 = 0.4 + (z1 + 1) * 0.3;
            const size1 = 1.5 + (z1 + 1) * 1;
            return (
              <g key={i}>
                <circle cx={x1} cy={y} r={size1} fill={color} opacity={opacity1} className="animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                <circle cx={x2} cy={y} r={size1} fill={color} opacity={1 - opacity1 + 0.3} className="animate-pulse" style={{ animationDelay: `${i * 0.15 + 0.08}s` }} />
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={0.5} opacity={0.2} />
              </g>
            );
          })}
        </svg>
        <BrailleSpinner color={color} />
        <span className="text-xs sm:text-sm font-mono font-medium" style={{ color }}>
          {STATUS_MESSAGES[msgIndex]}{dots}
        </span>
      </div>
    );
  }

  // ── Full mode: large helix SVG ──────────────────────────────────────────
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-8", className)}>
      {/* DNA Helix SVG */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        >
          {/* Strand 1 and Strand 2 — interweaving sine waves */}
          {Array.from({ length: HELIX_DOTS }).map((_, i) => {
            const progress = i / HELIX_DOTS;
            const y = 20 + progress * 160;
            // Sine wave offset for x position
            const angle = progress * Math.PI * 2.5;
            const x1 = 100 + Math.sin(angle) * 40;
            const x2 = 100 + Math.sin(angle + Math.PI) * 40;
            // Z-depth simulation via opacity
            const z1 = Math.cos(angle);
            const z2 = Math.cos(angle + Math.PI);
            const opacity1 = 0.3 + (z1 + 1) * 0.35;
            const opacity2 = 0.3 + (z2 + 1) * 0.35;
            const size1 = 3 + (z1 + 1) * 2;
            const size2 = 3 + (z2 + 1) * 2;
            // Animation delay based on position
            const delay = `${i * 0.12}s`;

            return (
              <g key={i}>
                {/* Connecting bar between strands */}
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.15}
                  className="animate-pulse"
                  style={{ animationDelay: delay }}
                />
                {/* Strand 1 dot */}
                <circle
                  cx={x1}
                  cy={y}
                  r={size1}
                  fill={color}
                  opacity={opacity1}
                  className="animate-pulse"
                  style={{ animationDelay: delay }}
                />
                {/* Strand 2 dot */}
                <circle
                  cx={x2}
                  cy={y}
                  r={size2}
                  fill={color}
                  opacity={opacity2}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.12 + 0.06}s` }}
                />
              </g>
            );
          })}

          {/* Flowing particles along the strands */}
          {[0, 1].map((strand) =>
            Array.from({ length: 3 }).map((_, pi) => {
              const id = `particle-${strand}-${pi}`;
              return (
                <circle
                  key={id}
                  r={2}
                  fill="white"
                  opacity={0.8}
                >
                  <animateMotion
                    dur={`${2.5 + pi * 0.4}s`}
                    repeatCount="indefinite"
                    begin={`${pi * 0.8 + strand * 1.2}s`}
                  >
                    <mpath href={`#helix-path-${strand}`} />
                  </animateMotion>
                </circle>
              );
            })
          )}

          {/* Path definitions for particle motion */}
          <defs>
            <path
              id="helix-path-0"
              d={generateHelixPath(0)}
              fill="none"
            />
            <path
              id="helix-path-1"
              d={generateHelixPath(Math.PI)}
              fill="none"
            />
          </defs>
        </svg>

        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-10"
          style={{ border: `2px solid ${color}` }}
        />
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Braille spinner */}
          <BrailleSpinner color={color} />
          <span
            className="text-sm sm:text-base font-mono font-medium tracking-wide"
            style={{ color }}
          >
            {STATUS_MESSAGES[msgIndex]}{dots}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 font-mono">
          Scan in progress — logs will stream shortly
        </p>
      </div>
    </div>
  );
}

// ─── Braille Spinner ──────────────────────────────────────────────────────────
const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function BrailleSpinner({ color }: { color: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % BRAILLE_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-lg font-mono font-bold"
      style={{ color }}
    >
      {BRAILLE_FRAMES[frame]}
    </span>
  );
}

// ─── SVG Path Generator ───────────────────────────────────────────────────────
function generateHelixPath(phaseOffset: number): string {
  const points: string[] = [];
  const steps = 60;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const y = 20 + progress * 160;
    const angle = progress * Math.PI * 2.5 + phaseOffset;
    const x = 100 + Math.sin(angle) * 40;

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }

  return points.join(" ");
}
