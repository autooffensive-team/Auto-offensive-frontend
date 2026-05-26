"use client";

import { motion } from "framer-motion";

// ─── Corner bracket positions ─────────────────────────────────────────────────

type CornerPos = "tl" | "tr" | "bl" | "br";

const CORNER_ANCHOR: Record<CornerPos, string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
};

const CORNER_OFFSET: Record<CornerPos, { x: number; y: number }> = {
  tl: { x: -7, y: -7 },
  tr: { x: 7, y: -7 },
  bl: { x: -7, y: 7 },
  br: { x: 7, y: 7 },
};

const CORNER_PATHS: Record<CornerPos, string> = {
  tl: "M2 10V2H10",
  tr: "M10 2H18V10",
  bl: "M2 10V18H10",
  br: "M10 18H18V10",
};

// ─── Corner bracket SVG ───────────────────────────────────────────────────────

function CornerBracket({ pos }: { pos: CornerPos }) {
  const offset = CORNER_OFFSET[pos];

  return (
    <svg
      className={`absolute w-[0.5em] h-[0.5em] text-[#6346FF] z-10 overflow-visible
        md:w-[0.58em] md:h-[0.58em] lg:w-[0.62em] lg:h-[0.62em] ${CORNER_ANCHOR[pos]}`}
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      strokeLinejoin="miter"
      style={{
        filter: "drop-shadow(0 0 5px rgba(99,70,255,0.35))",
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      <path d={CORNER_PATHS[pos]} />
    </svg>
  );
}

// ─── FocusWord component ──────────────────────────────────────────────────────
// "frame-half" close-to-open animation:
// The frame (4 corner brackets) starts collapsed at center (scaleX: 0)
// then expands to full width. Text fades in once the frame opens.
//
// Usage:
//   <FocusWord startAnimation={true}>HACKER</FocusWord>

export interface FocusWordProps {
  children: React.ReactNode;
  /** When true, the open animation plays. */
  startAnimation: boolean;
  /** Extra className on the outer wrapper */
  className?: string;
}

export default function FocusWord({
  children,
  startAnimation,
  className = "",
}: FocusWordProps) {
  return (
    <span
      className={`
        relative inline-grid items-center justify-center
        mx-[0.16em] px-[0.08em] pt-[0.01em] pb-[0.03em]
        isolate gap-0 leading-none w-max align-baseline
        md:mx-[0.18em] md:px-[0.1em] md:pt-[0.02em] md:pb-[0.04em]
        lg:px-[0.12em] lg:pt-[0.03em] lg:pb-[0.05em]
        ${className}
      `}
    >
      {/* Frame with 4 corner brackets — scales from center */}
      <motion.span
        className="absolute inset-0 z-10 pointer-events-none"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={
          startAnimation
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0, scaleX: 0 }
        }
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "visible" }}
      >
        <CornerBracket pos="tl" />
        <CornerBracket pos="tr" />
        <CornerBracket pos="bl" />
        <CornerBracket pos="br" />
      </motion.span>

      {/* Text — fades in as the frame opens */}
      <motion.span
        className="relative z-1 whitespace-nowrap leading-[0.92]"
        initial={{ opacity: 0 }}
        animate={startAnimation ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
