"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";

// ─── Hex geometry ────────────────────────────────────────────────────
const hexPoints = "28,0 56,16 56,48 28,64 0,48 0,16";

type HexDef = { id: string; cls: string; tx: number; ty: number };

const LEFT_HEXES: HexDef[] = [
  { id:"l0",  cls:"l-b1", tx:2,   ty:2   },
  { id:"l1",  cls:"l-b2", tx:91,  ty:52  },
  { id:"l2",  cls:"l-b3", tx:60,  ty:104 },
  { id:"l3",  cls:"l-m1", tx:60,  ty:2   },
  { id:"l4",  cls:"l-m2", tx:31,  ty:52  },
  { id:"l5",  cls:"l-m3", tx:151, ty:52  },
  { id:"l6",  cls:"l-m4", tx:31,  ty:156 },
  { id:"l7",  cls:"l-m5", tx:2,   ty:208 },
  { id:"l8",  cls:"l-d1", tx:120, ty:2   },
  { id:"l9",  cls:"l-d2", tx:180, ty:2   },
  { id:"l10", cls:"l-d3", tx:240, ty:2   },
  { id:"l11", cls:"l-d4", tx:300, ty:2   },
  { id:"l12", cls:"l-d5", tx:211, ty:52  },
  { id:"l13", cls:"l-d6", tx:271, ty:52  },
  { id:"l14", cls:"l-d7", tx:331, ty:52  },
  { id:"l15", cls:"l-d8", tx:2,   ty:104 },
  { id:"l16", cls:"l-d9", tx:120, ty:104 },
  { id:"l17", cls:"l-d10", tx:180, ty:104 },
  { id:"l18", cls:"l-d11", tx:240, ty:104 },
  { id:"l19", cls:"l-d12", tx:300, ty:104 },
  { id:"l20", cls:"l-d1", tx:91,  ty:156 },
  { id:"l21", cls:"l-d3", tx:151, ty:156 },
  { id:"l22", cls:"l-d5", tx:211, ty:156 },
  { id:"l23", cls:"l-d7", tx:271, ty:156 },
  { id:"l24", cls:"l-d9", tx:60,  ty:208 },
  { id:"l25", cls:"l-d11", tx:120, ty:208 },
  { id:"l26", cls:"l-d2", tx:180, ty:208 },
  { id:"l27", cls:"l-d4", tx:240, ty:208 },
  { id:"l28", cls:"l-d6", tx:31,  ty:260 },
  { id:"l29", cls:"l-d8", tx:91,  ty:260 },
  { id:"l30", cls:"l-d10", tx:151, ty:260 },
  { id:"l31", cls:"l-d12", tx:211, ty:260 },
  { id:"l32", cls:"l-d1", tx:2,   ty:312 },
  { id:"l33", cls:"l-d3", tx:60,  ty:312 },
  { id:"l34", cls:"l-d5", tx:120, ty:312 },
  { id:"l35", cls:"l-d7", tx:180, ty:312 },
  { id:"l36", cls:"l-d9", tx:31,  ty:364 },
  { id:"l37", cls:"l-d11", tx:91,  ty:364 },
  { id:"l38", cls:"l-d2", tx:151, ty:364 },
  { id:"l39", cls:"l-d4", tx:2,   ty:416 },
  { id:"l40", cls:"l-d6", tx:60,  ty:416 },
];

const RIGHT_HEXES: HexDef[] = [
  { id:"r0",  cls:"r-b1", tx:120, ty:2   },
  { id:"r1",  cls:"r-b2", tx:31,  ty:52  },
  { id:"r2",  cls:"r-b3", tx:2,   ty:104 },
  { id:"r3",  cls:"r-m1", tx:2,   ty:2   },
  { id:"r4",  cls:"r-m2", tx:60,  ty:2   },
  { id:"r5",  cls:"r-m3", tx:91,  ty:52  },
  { id:"r6",  cls:"r-m4", tx:151, ty:52  },
  { id:"r7",  cls:"r-m5", tx:91,  ty:156 },
  { id:"r8",  cls:"r-d1", tx:180, ty:2   },
  { id:"r9",  cls:"r-d2", tx:240, ty:2   },
  { id:"r10", cls:"r-d3", tx:300, ty:2   },
  { id:"r11", cls:"r-d4", tx:211, ty:52  },
  { id:"r12", cls:"r-d5", tx:271, ty:52  },
  { id:"r13", cls:"r-d6", tx:331, ty:52  },
  { id:"r14", cls:"r-d7", tx:60,  ty:104 },
  { id:"r15", cls:"r-d8", tx:120, ty:104 },
  { id:"r16", cls:"r-d9", tx:180, ty:104 },
  { id:"r17", cls:"r-d10", tx:240, ty:104 },
  { id:"r18", cls:"r-d11", tx:300, ty:104 },
  { id:"r19", cls:"r-d12", tx:31,  ty:156 },
  { id:"r20", cls:"r-d1", tx:151, ty:156 },
  { id:"r21", cls:"r-d3", tx:211, ty:156 },
  { id:"r22", cls:"r-d5", tx:271, ty:156 },
  { id:"r23", cls:"r-d7", tx:2,   ty:208 },
  { id:"r24", cls:"r-d9", tx:60,  ty:208 },
  { id:"r25", cls:"r-d11", tx:120, ty:208 },
  { id:"r26", cls:"r-d2", tx:180, ty:208 },
  { id:"r27", cls:"r-d4", tx:240, ty:208 },
  { id:"r28", cls:"r-d6", tx:31,  ty:260 },
  { id:"r29", cls:"r-d8", tx:91,  ty:260 },
  { id:"r30", cls:"r-d10", tx:151, ty:260 },
  { id:"r31", cls:"r-d12", tx:211, ty:260 },
  { id:"r32", cls:"r-d1", tx:2,   ty:312 },
  { id:"r33", cls:"r-d3", tx:60,  ty:312 },
  { id:"r34", cls:"r-d5", tx:120, ty:312 },
  { id:"r35", cls:"r-d7", tx:180, ty:312 },
  { id:"r36", cls:"r-d9", tx:31,  ty:364 },
  { id:"r37", cls:"r-d11", tx:91,  ty:364 },
  { id:"r38", cls:"r-d2", tx:151, ty:364 },
  { id:"r39", cls:"r-d4", tx:2,   ty:416 },
  { id:"r40", cls:"r-d6", tx:60,  ty:416 },
];

// ─── Animation timing ────────────────────────────────────────────────
const SPEEDS = {
  CORNER_POP_UP:       0.15,
  CORNER_SPREAD:       0.05,
  CORNER_SPREAD_DELAY: 0.45,
  TEXT_POP_IN:         0.5,
  TEXT_POP_IN_DELAY:   0.65,
  INITIAL_DELAY:       0.55,
};

// ─── Star-field ──────────────────────────────────────────────────────
function generateStars(count: number, colors: string[]): string {
  return Array.from({ length: count }, () => {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    return `${x}px ${y}px ${colors[Math.floor(Math.random() * colors.length)]}`;
  }).join(", ");
}

// ─── Hex grid ────────────────────────────────────────────────────────
const HEX_DELAYS: Record<string, number> = {
  "l-b1":0,    "l-b2":1.5,  "l-b3":3.0,
  "l-m1":0.6,  "l-m2":1.9,  "l-m3":3.3,  "l-m4":0.3,  "l-m5":2.4,
  "l-d1":0.2,  "l-d2":1.1,  "l-d3":2.0,  "l-d4":3.1,  "l-d5":0.8,
  "l-d6":1.7,  "l-d7":2.8,  "l-d8":4.0,  "l-d9":0.5,  "l-d10":1.4,
  "l-d11":3.6, "l-d12":2.5,
  "r-b1":0.7,  "r-b2":2.2,  "r-b3":3.7,
  "r-m1":1.3,  "r-m2":2.6,  "r-m3":0.4,  "r-m4":3.9,  "r-m5":1.8,
  "r-d1":0.9,  "r-d2":1.6,  "r-d3":2.3,  "r-d4":3.4,  "r-d5":0.1,
  "r-d6":1.2,  "r-d7":2.9,  "r-d8":4.2,  "r-d9":0.6,  "r-d10":1.9,
  "r-d11":3.2, "r-d12":2.1,
};

type Tier = "bright" | "mid" | "dim";
function getTier(cls: string): Tier {
  if (cls.includes("-b")) return "bright";
  if (cls.includes("-m")) return "mid";
  return "dim";
}

function HexGrid({
  hexes,
  svgRef,
  className,
}: {
  hexes: HexDef[];
  svgRef: React.RefObject<SVGSVGElement | null>;
  className: string;
}) {
  return (
    <svg
      ref={svgRef}
      className={`hex-grid ${className}`}
      width="350" height="450" viewBox="0 0 380 480" fill="none"
    >
      {hexes.map((h) => (
        <polygon
          key={h.id}
          data-id={h.id}
          className={`hx ${getTier(h.cls)} ${h.cls}`}
          points={hexPoints}
          transform={`translate(${h.tx},${h.ty})`}
        />
      ))}
    </svg>
  );
}

function getCenter(poly: SVGPolygonElement) {
  const transform = poly.getAttribute("transform") || "translate(0,0)";
  const match = transform.match(/translate\(([^,]+),([^)]+)\)/);

  if (!match) {
    return { x: 0, y: 0 };
  }

  return { x: parseFloat(match[1]) + 28, y: parseFloat(match[2]) + 32 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function setupMagneticHover(svgEl: SVGSVGElement | null) {
  if (!svgEl) {
    return () => undefined;
  }

  const svg = svgEl;
  const hexes = Array.from(svg.querySelectorAll<SVGPolygonElement>(".hx"));
  const centers = hexes.map(getCenter);
  const origTransforms = hexes.map((hex) => hex.getAttribute("transform") || "");
  const origPositions = centers.map((center) => ({ ...center }));

  const MAGNETIC_RADIUS = 90;
  const MAX_PULL = 7;
  const NEIGHBOR_RADIUS = 72;

  function applyMagnetic(mouseX: number, mouseY: number) {
    hexes.forEach((hex, index) => {
      const cx = origPositions[index].x;
      const cy = origPositions[index].y;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      hex.classList.remove("hovered", "neighbor");

      if (distance < MAGNETIC_RADIUS) {
        const safeDistance = distance || 0.001;
        const strength = Math.pow(1 - distance / MAGNETIC_RADIUS, 1.6);
        const pullX = (dx / safeDistance) * strength * MAX_PULL;
        const pullY = (dy / safeDistance) * strength * MAX_PULL;
        const newTx = origPositions[index].x - 28 + pullX;
        const newTy = origPositions[index].y - 32 + pullY;

        hex.setAttribute("transform", `translate(${newTx},${newTy})`);

        if (distance < 36) {
          hex.classList.add("hovered");
        } else if (distance < NEIGHBOR_RADIUS) {
          hex.classList.add("neighbor");
        }
      } else {
        hex.setAttribute("transform", origTransforms[index]);
      }
    });
  }

  function resetAll() {
    hexes.forEach((hex, index) => {
      hex.setAttribute("transform", origTransforms[index]);
      hex.classList.remove("hovered", "neighbor");
    });
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = svg.getBoundingClientRect();
    const scaleX = 380 / rect.width;
    const scaleY = 480 / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    applyMagnetic(mouseX, mouseY);
  }

  svg.addEventListener("mousemove", handleMouseMove);
  svg.addEventListener("mouseleave", resetAll);

  const enterHandlers = hexes.map((hex, index) => {
    const handleMouseEnter = () => {
      hexes.forEach((otherHex, otherIndex) => {
        if (otherIndex !== index && dist(centers[index], centers[otherIndex]) < NEIGHBOR_RADIUS) {
          otherHex.classList.add("neighbor");
        }
      });
    };

    hex.addEventListener("mouseenter", handleMouseEnter);
    return { hex, handleMouseEnter };
  });

  return () => {
    svg.removeEventListener("mousemove", handleMouseMove);
    svg.removeEventListener("mouseleave", resetAll);
    enterHandlers.forEach(({ hex, handleMouseEnter }) => {
      hex.removeEventListener("mouseenter", handleMouseEnter);
    });
    resetAll();
  };
}

// ─── Focus word corners ───────────────────────────────────────────────
// Spread values match original CSS --focus-bracket-shift-x/y (8px / 6px)
// We animate the whole SVG element (not the inner path) so the bracket
// visually moves away from center — identical to the CSS version.
const CORNER_SPREAD: Record<"tl"|"tr"|"bl"|"br", { x:number; y:number }> = {
  tl: { x:-8, y:-6 },
  tr: { x: 8, y:-6 },
  bl: { x:-8, y: 6 },
  br: { x: 8, y: 6 },
};

const CORNER_ANCHOR: Record<"tl"|"tr"|"bl"|"br", string> = {
  tl: "top-[-0.01em] left-[-0.05em]",
  tr: "top-[-0.01em] right-[-0.05em]",
  bl: "bottom-[0.01em] left-[-0.05em]",
  br: "bottom-[0.01em] right-[-0.05em]",
};

// Total keyframe timeline: popUp → hold → spread
// t0=0  t1=popUpEnd  t2=spreadStart  t3=1
const POP_T   = SPEEDS.CORNER_POP_UP;
const HOLD_T  = SPEEDS.CORNER_SPREAD_DELAY;
const SPREAD_T = 0.1;
const TOTAL_T  = POP_T + HOLD_T + SPREAD_T;

const KF_TIMES = [0, POP_T / TOTAL_T, (POP_T + HOLD_T) / TOTAL_T, 1];

function CornerBracket({
  pos,
  svgPath,
  startAnimation,
}: {
  pos: "tl"|"tr"|"bl"|"br";
  svgPath: string;
  startAnimation: boolean;
}) {
  const sp = CORNER_SPREAD[pos];

  return (
    <motion.svg
      className={`absolute w-[0.5em] h-[0.5em] text-[#6346FF] z-10 overflow-visible
        md:w-[0.58em] md:h-[0.58em] lg:w-[0.62em] lg:h-[0.62em] ${CORNER_ANCHOR[pos]}`}
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="square"
      strokeLinejoin="miter"
      style={{ filter:"drop-shadow(0 0 5px rgba(99,70,255,0.35))" }}
      // Framer Motion props — animate the SVG element itself
      initial={{ opacity:0, scale:0.72, y:8, x:0 }}
      animate={
        startAnimation
          ? {
              // 4-keyframe sequence: hidden → pop in → hold → spread
              opacity: [0,    1,    1,    1   ],
              scale:   [0.72, 1,    1,    1   ],
              y:       [8,    0,    0,    sp.y],
              x:       [0,    0,    0,    sp.x],
            }
          : { opacity:0, scale:0.72, y:8, x:0 }
      }
      transition={{
        duration: TOTAL_T,
        times:    KF_TIMES,
        ease:     "easeOut",
      }}
    >
      <path d={svgPath} />
    </motion.svg>
  );
}

function FocusWord({
  children,
  startAnimation,
}: {
  children: string;
  startAnimation: boolean;
}) {
  return (
    <span
      className="
        relative inline-grid items-center justify-center
        mx-[0.16em] px-[0.08em] pt-[0.01em] pb-[0.03em]
        isolate gap-0 leading-none w-max align-baseline
        md:mx-[0.18em] md:px-[0.1em] md:pt-[0.02em] md:pb-[0.04em]
        lg:px-[0.12em] lg:pt-[0.03em] lg:pb-[0.05em]
      "
    >
      <CornerBracket pos="tl" svgPath="M2 10V2H10"   startAnimation={startAnimation} />
      <CornerBracket pos="tr" svgPath="M10 2H18V10"  startAnimation={startAnimation} />
      <CornerBracket pos="bl" svgPath="M2 10V18H10"  startAnimation={startAnimation} />
      <CornerBracket pos="br" svgPath="M10 18H18V10" startAnimation={startAnimation} />

      <motion.span
        className="relative z-1 text-primary font-bold tracking-[-0.04em] whitespace-nowrap leading-[0.92]"
        initial={{ opacity:0, y:8, scale:0.96 }}
        animate={
          startAnimation
            ? { opacity:1, y:0, scale:1 }
            : { opacity:0, y:8, scale:0.96 }
        }
        transition={{
          duration: SPEEDS.TEXT_POP_IN,
          delay:    SPEEDS.TEXT_POP_IN_DELAY,
          ease:     [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// ─── Main hero component ─────────────────────────────────────────────
export default function HomeHero() {
  const t       = useTranslations("homepage.hero");
  const locale  = useLocale();
  const isKhmer = locale === "kh";

  const titleLine3           = t("titleLine3");
  const titleLine3FocusMatch = titleLine3.match(/^(.*?)(hacker)(.*)$/iu);

  const hexLeftRef  = useRef<SVGSVGElement>(null);
  const hexRightRef = useRef<SVGSVGElement>(null);
  const s1Ref       = useRef<HTMLDivElement>(null);
  const s2Ref       = useRef<HTMLDivElement>(null);
  const s3Ref       = useRef<HTMLDivElement>(null);

  const [focusStarted, setFocusStarted] = useState(false);

  useEffect(() => {
    const cleanupHexLeft = setupMagneticHover(hexLeftRef.current);
    const cleanupHexRight = setupMagneticHover(hexRightRef.current);

    if (s1Ref.current) s1Ref.current.style.boxShadow = generateStars(700, [
      "rgba(0,208,178,0.55)", "rgba(0,208,178,0.35)",
      "rgba(55,65,81,0.45)",  "rgba(55,65,81,0.3)",
      "rgba(107,114,128,0.4)",
    ]);
    if (s2Ref.current) s2Ref.current.style.boxShadow = generateStars(200, [
      "rgba(55,65,81,0.55)", "rgba(55,65,81,0.4)",
      "rgba(0,208,178,0.6)", "rgba(107,114,128,0.45)",
    ]);
    if (s3Ref.current) s3Ref.current.style.boxShadow = generateStars(100, [
      "rgba(0,208,178,0.9)", "rgba(0,208,178,0.7)",
      "rgba(0,208,178,0.5)", "rgba(55,65,81,0.7)",
    ]);

    const timer = setTimeout(() => setFocusStarted(true), SPEEDS.INITIAL_DELAY * 1000);
    return () => {
      cleanupHexLeft();
      cleanupHexRight();
      clearTimeout(timer);
    };
  }, []);

  // Staggered fade-up helper for content blocks
  const fadeUp = (delay: number) => ({
    initial:    { opacity:0, y:18 } as const,
    animate:    { opacity:1, y:0  } as const,
    transition: { duration:0.65, delay, ease:"easeOut" as const },
  });

  return (
    <>
      <style>{`
        /* ── Star animations ── */
        @keyframes mvStar {
          from { transform: translateY(0); }
          to   { transform: translateY(-2000px); }
        }
        @keyframes glowPulse {
          0%,100% { filter: blur(0px);   opacity: 0.55; }
          50%      { filter: blur(0.6px); opacity: 1;    }
        }
        .ao-s1 { animation: mvStar 50s  linear infinite, glowPulse 3s ease-in-out infinite; }
        .ao-s2 { animation: mvStar 100s linear infinite; }
        .ao-s3 { animation: mvStar 150s linear infinite, glowPulse 5s ease-in-out 1.5s infinite; }

        /* ── Scroll bob ── */
        @keyframes ao-bob {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(5px); }
        }
        .scroll-indicator { animation: ao-bob 2.5s ease-in-out infinite; }

        /* ── Planet sweep comets ── */
        @keyframes sweepLeft {
          0%   { stroke-dashoffset: 348.88; opacity: 0; }
          12%  { opacity: 1; }
          55%  { stroke-dashoffset: 87.08;  opacity: 1; }
          72%  { stroke-dashoffset: 87.08;  opacity: 0; }
          100% { stroke-dashoffset: 87.08;  opacity: 0; }
        }
        @keyframes sweepRight {
          0%   { stroke-dashoffset: 348.88; opacity: 0; }
          12%  { opacity: 1; }
          55%  { stroke-dashoffset: 87.08;  opacity: 1; }
          72%  { stroke-dashoffset: 87.08;  opacity: 0; }
          100% { stroke-dashoffset: 87.08;  opacity: 0; }
        }
        @keyframes convergePulse {
          0%,52%  { opacity: 0; r: 0; }
          58%     { opacity: 0; }
          64%     { opacity: 1; r: 6px; filter: drop-shadow(0 0 8px #00D0B2); }
          76%     { opacity: 0; r: 0; }
          100%    { opacity: 0; r: 0; }
        }
        .sweep-left  { animation: sweepLeft  1.8s cubic-bezier(0.25,0.1,0.25,1) 0.3s 1 forwards; }
        .sweep-right { animation: sweepRight 1.8s cubic-bezier(0.25,0.1,0.25,1) 0.3s 1 forwards; }
        .converge    {
          animation: convergePulse 1.8s ease-out 0.3s 1 forwards;
          filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 14px rgba(0,208,178,0.6));
        }

        /* ── Ripple button ── */
        .ripple-button { position: relative; overflow: hidden; }
        .ripple-button:before {
          content: ""; position: absolute; left: 50%;
          transform: translateX(-50%) scaleY(1) scaleX(1.25);
          top: 100%; width: 140%; height: 180%;
          background-color: rgba(0,0,0,0.05); border-radius: 50%;
          display: block; transition: all .5s .1s cubic-bezier(.55,0,.1,1); z-index: -1;
        }
        .ripple-button:after {
          content: ""; position: absolute; left: 55%;
          transform: translateX(-50%) scaleY(1) scaleX(1.45);
          top: 180%; width: 160%; height: 190%;
          background-color: #39bda7; border-radius: 50%;
          display: block; transition: all .5s .1s cubic-bezier(.55,0,.1,1); z-index: -1;
        }
        .ripple-button:hover { border-color: #39bda7; }
        .ripple-button:hover svg { color: black; stroke: black; }
        .dark .ripple-button:hover svg { color: white; stroke: white; }
        .ripple-button:hover:before { top: -35%; background-color: #39bda7; transform: translateX(-50%) scaleY(1.3) scaleX(0.8); }
        .ripple-button:hover:after  { top: -45%; background-color: #39bda7; transform: translateX(-50%) scaleY(1.3) scaleX(0.8); }

        /* ── Hex grid directional masks ── */
        .hx {
          fill: transparent;
          stroke: #00D0B2;
          stroke-width: 1;
          opacity: 0.09;
          transition: opacity .25s ease, filter .25s ease, fill .25s ease, stroke-width .25s ease, transform .18s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
          will-change: transform;
        }
        @keyframes star-bright {
          0%,100% { opacity: 0.07; filter: none; }
          40%,60% { opacity: 0.72; filter: drop-shadow(0 0 4px #00D0B2) drop-shadow(0 0 10px rgba(0,208,178,.5)); }
        }
        @keyframes star-bright-dk {
          0%,100% { opacity: 0.07; filter: none; }
          40%,60% { opacity: 1; filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 16px rgba(0,208,178,.7)) drop-shadow(0 0 32px rgba(0,208,178,.3)); }
        }
        @keyframes star-mid {
          0%,100% { opacity: 0.05; filter: none; }
          50% { opacity: 0.30; filter: drop-shadow(0 0 2px rgba(0,208,178,.38)); }
        }
        @keyframes star-mid-dk {
          0%,100% { opacity: 0.05; filter: none; }
          50% { opacity: 0.45; filter: drop-shadow(0 0 4px rgba(0,208,178,.5)); }
        }
        @keyframes star-dim {
          0%,100% { opacity: 0.03; }
          50% { opacity: 0.10; }
        }
        .hx.bright { animation: star-bright 4s ease-in-out infinite; }
        .hx.mid { animation: star-mid 5s ease-in-out infinite; }
        .hx.dim { animation: star-dim 6.5s ease-in-out infinite; }
        @media (prefers-color-scheme: dark) {
          .hx.bright { animation-name: star-bright-dk; }
          .hx.mid { animation-name: star-mid-dk; }
        }
        :root[class*="dark"] .hx.bright { animation-name: star-bright-dk; }
        :root[class*="dark"] .hx.mid { animation-name: star-mid-dk; }
        .dark .hx.bright { animation-name: star-bright-dk; }
        .dark .hx.mid { animation-name: star-mid-dk; }
        ${Object.entries(HEX_DELAYS).map(([cls, delay]) => `.${cls}{animation-delay:${delay}s}`).join("\n")}
        .hx.hovered {
          opacity: 1 !important;
          fill: rgba(0,208,178,0.08) !important;
          stroke: #00D0B2 !important;
          stroke-width: 1.8 !important;
          filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 16px rgba(0,208,178,.45)) !important;
          animation-play-state: paused !important;
        }
        .dark .hx.hovered {
          filter: drop-shadow(0 0 8px #00D0B2) drop-shadow(0 0 22px rgba(0,208,178,.75)) drop-shadow(0 0 40px rgba(0,208,178,.35)) !important;
        }
        .hx.neighbor {
          opacity: 0.5 !important;
          fill: rgba(0,208,178,0.03) !important;
          stroke: #00D0B2 !important;
          stroke-width: 1.2 !important;
          filter: drop-shadow(0 0 3px rgba(0,208,178,.3)) !important;
          animation-play-state: paused !important;
        }
        .dark .hx.neighbor {
          filter: drop-shadow(0 0 5px rgba(0,208,178,.4)) drop-shadow(0 0 12px rgba(0,208,178,.2)) !important;
        }
        .hex-grid {
          position: absolute;
          pointer-events: all;
          z-index: 6;
        }

        .hex-grid-left {
          left: -20px; top: -10px;
          -webkit-mask-image: linear-gradient(to bottom right, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
          mask-image: linear-gradient(to bottom right, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
        }
        .hex-grid-right {
          right: -158px; top: -15px;
          -webkit-mask-image: linear-gradient(to bottom left, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
          mask-image: linear-gradient(to bottom left, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
        }

        /* ── Accent underline on title line 1 ── */
        .accent-underline { position: relative; display: inline-block; }
        .accent-underline::after {
          content: ''; position: absolute; bottom: 2px; left: 0; right: 0;
          height: 3px; background: linear-gradient(90deg, #00D0B2, transparent);
          border-radius: 4px; opacity: 0.35;
        }
      `}</style>

      <section
        className="
          relative min-h-screen w-full overflow-hidden
          flex flex-col items-center justify-center text-center
          px-[6%] py-25
          bg-white dark:bg-[#09090B]
          text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
          transition-[background] duration-400
        "
        style={{
          fontFamily: isKhmer
            ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
            : "var(--font-google-sans), var(--font-noto-khmer), sans-serif",
        }}
      >

        {/* ── Star dots ── */}
        <div ref={s1Ref} aria-hidden="true"
          className="ao-s1 absolute top-0 left-0 pointer-events-none z-0 w-px h-0.75 bg-primary" />
        <div ref={s2Ref} aria-hidden="true"
          className="ao-s2 absolute top-0 left-0 pointer-events-none z-0 w-0.5 h-0.5 bg-[#374151]" />
        <div ref={s3Ref} aria-hidden="true"
          className="ao-s3 absolute top-0 left-0 pointer-events-none z-0 w-0.5 h-0.5 bg-primary" />

        {/* ── Planet arc ── */}
        <div aria-hidden="true"
          className="absolute left-0 right-0 top-[62%] h-[80%] pointer-events-none z-2 overflow-visible"
        >
          {/* Sphere */}
          <motion.div
            className="
              absolute top-[-2.5%] left-1/2 -translate-x-1/2
              w-[150%] rounded-full overflow-hidden
              bg-[#F7F5F0] dark:bg-[#09090B]
            "
            style={{ paddingTop:"150%" }}
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ duration:0.9, delay:2.0 }}
          >
            <div className="absolute rounded-full w-[46%] h-[42%] top-[-8%] left-[-6%]
              bg-[#01509e] dark:bg-[#0a3a7a] opacity-[0.95] blur-[80px]" />
            <div className="absolute rounded-full w-[38%] h-[34%] top-[-5%] right-[-4%]
              bg-[#00d0b2] opacity-50 dark:opacity-70 blur-[70px]" />
            <div className="absolute rounded-full w-[72%] h-[66%] top-[-55%] left-1/2 -translate-x-1/2
              bg-[#F7F5F0] dark:bg-[#09090B] blur-[75px] dark:blur-[60px]" />
            <div className="absolute rounded-full w-[42%] h-[38%] bottom-[-8%] left-[-4%]
              bg-[#0194c7] dark:bg-[#00a8e8] opacity-75 dark:opacity-85 blur-[72px] dark:blur-[65px]" />
            <div className="absolute rounded-full w-[30%] h-[26%] bottom-[-6%] right-[-2%]
              bg-[#0194c7] dark:bg-[#00c4b4] opacity-50 dark:opacity-65 blur-[60px] dark:blur-[55px]" />
            <div className="absolute rounded-full w-[30%] h-[26%] top-[22%] left-[35%]
              bg-[#00d0b2] opacity-[0.18] dark:opacity-[0.28] blur-[55px] dark:blur-[50px]" />
            {/* Radial overlay */}
            <div className="absolute inset-0 rounded-full pointer-events-none
              [background:radial-gradient(ellipse_at_50%_50%,transparent_0%,transparent_38%,rgba(240,248,255,0.25)_55%,rgba(220,235,245,0.55)_72%,rgba(200,220,240,0.80)_88%,rgba(185,210,235,0.92)_100%)]
              dark:[background:radial-gradient(ellipse_at_50%_50%,transparent_0%,transparent_35%,rgba(9,9,11,0.20)_52%,rgba(9,9,11,0.55)_70%,rgba(9,9,11,0.82)_86%,rgba(9,9,11,0.95)_100%)]" />
            {/* Top shine */}
            <div className="absolute inset-0 rounded-full pointer-events-none
              [background:radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.55)_0%,transparent_48%)]
              dark:[background:radial-gradient(ellipse_at_50%_0%,rgba(0,208,178,0.18)_0%,rgba(0,168,232,0.08)_30%,transparent_55%)]" />
          </motion.div>

          {/* Outer glow ring */}
          <motion.div
            className="
              absolute top-[-3%] left-1/2 -translate-x-1/2 w-[155%] rounded-full z-3
              [box-shadow:0_0_0_2px_rgba(1,80,158,0.5),0_0_20px_8px_rgba(1,80,158,0.4),0_0_55px_22px_rgba(1,80,158,0.2),0_0_110px_45px_rgba(1,80,158,0.1),0_0_180px_80px_rgba(1,80,158,0.06)]
              dark:[box-shadow:0_0_0_2px_rgba(0,208,178,0.6),0_0_20px_8px_rgba(0,168,232,0.5),0_0_55px_22px_rgba(0,208,178,0.28),0_0_110px_45px_rgba(1,80,158,0.18),0_0_180px_80px_rgba(0,208,178,0.1)]
            "
            style={{ paddingTop:"155%" }}
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ duration:0.9, delay:1.0 }}
          />

          {/* Rim border */}
          <motion.div
            className="
              absolute top-[-1%] left-1/2 -translate-x-1/2 w-[152%] rounded-full z-4
              border-2 border-[rgba(0,208,178,0.7)] dark:border-[rgba(0,208,178,0.9)]
              [box-shadow:0_0_14px_4px_rgba(0,208,178,0.4),inset_0_0_22px_6px_rgba(0,208,178,0.12)]
              dark:[box-shadow:0_0_20px_6px_rgba(0,208,178,0.55),0_0_50px_16px_rgba(0,208,178,0.2),inset_0_0_30px_8px_rgba(0,208,178,0.15)]
            "
            style={{ paddingTop:"152%" }}
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ duration:0.9, delay:2.0 }}
          />

          {/* Sweep comet SVG */}
          <div
            className="absolute top-[-3%] left-1/2 -translate-x-1/2 w-[152%] rounded-full pointer-events-none z-6 overflow-visible"
            style={{ paddingTop:"152%" }}
          >
            <svg
              className="absolute top-0 left-0 w-full h-full overflow-visible"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cometGradL" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="200" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="60%"  stopColor="#00D0B2" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#F7F5F0" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="cometGradR" gradientUnits="userSpaceOnUse" x1="200" y1="100" x2="0" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="60%"  stopColor="#00D0B2" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#F7F5F0" stopOpacity="0.95" />
                </linearGradient>
                <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="100" cy="100" r="100" fill="none" stroke="url(#cometGradL)"
                strokeWidth="2.5" strokeLinecap="round" strokeDasharray="70 558.32"
                filter="url(#cometGlow)" className="sweep-left"
                style={{ strokeDashoffset:"348.88" }} />
              <circle cx="100" cy="100" r="100" fill="none" stroke="url(#cometGradR)"
                strokeWidth="2.5" strokeLinecap="round" strokeDasharray="70 558.32"
                filter="url(#cometGlow)" transform="scale(-1,1) translate(-200,0)"
                className="sweep-right" style={{ strokeDashoffset:"348.88" }} />
              <circle cx="100" cy="200" r="0" fill="#00D0B2" className="converge" />
            </svg>
          </div>

          {/* Bottom fade veil */}
          <div className="
            absolute bottom-0 left-0 right-0 h-[35%] z-5
            [background:linear-gradient(to_bottom,transparent,rgba(238,247,245,0.92))]
            dark:[background:linear-gradient(to_bottom,transparent,rgba(9,9,11,0.96))]
          " />
        </div>

        {/* ── Hex grids ── */}
        <HexGrid hexes={LEFT_HEXES}  svgRef={hexLeftRef}  className="hex-grid-left" />
        <HexGrid hexes={RIGHT_HEXES} svgRef={hexRightRef} className="hex-grid-right" />

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center max-w-260 w-full">

          {/* Headline */}
          <motion.h1
            className="
              text-[clamp(2.8rem,6vw,5rem)] font-bold
              leading-[1.08] tracking-[-0.02em]
              text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
              mb-[1.4rem]
            "
            {...fadeUp(0.30)}
          >
            <span className="text-[#01509e] accent-underline">{t("titleLine1")}</span>
            <br />
            {t("titleLine2")}
            <br />
            <span className="text-[#00d0b2] dark:text-primary font-light">
              {titleLine3FocusMatch ? (
                <>
                  {isKhmer
                    ? <span className="font-khmer">{titleLine3FocusMatch[1]}</span>
                    : titleLine3FocusMatch[1]
                  }
                  <FocusWord startAnimation={focusStarted}>
                    {titleLine3FocusMatch[2]}
                  </FocusWord>
                  {titleLine3FocusMatch[3]}
                </>
              ) : titleLine3}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="
              text-base md:text-lg lg:text-xl
              text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]
              max-w-124 mx-auto mb-[2.6rem]
              leading-[1.7] font-normal
            "
            {...fadeUp(0.50)}
          >
            {t("description")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="grid w-full max-w-136 grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center"
            {...fadeUp(0.70)}
          >
            {/* Primary */}
            <button className="
              group relative inline-flex w-full min-w-0 items-center justify-center
              overflow-hidden rounded-xl border-2 border-primary bg-primary
              px-3 py-3 sm:px-7.5 sm:py-3.5
              text-[14px] sm:text-[15px] font-black leading-none text-white
              transition-transform duration-200 hover:-translate-y-px
              before:pointer-events-none before:absolute before:inset-0 before:translate-y-full
              before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)]
              before:transition-transform before:duration-200 before:content-['']
              after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full
              after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)]
              after:transition-transform after:duration-200 after:content-['']
              hover:before:translate-y-0 hover:after:translate-y-0
              sm:w-auto
            ">
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span className="min-w-0 whitespace-nowrap text-center">{t("primaryCta")}</span>
              </span>
            </button>

            {/* Secondary */}
            <button className="
              ripple-button
              bg-white dark:bg-[rgba(0,208,178,0.06)]
              text-black dark:text-white
              border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)]
              w-full min-w-0 justify-center sm:w-auto
              px-4 py-3 sm:px-6.5 sm:py-3.5
              rounded-xl
              text-[0.82rem] sm:text-[0.9rem] leading-tight font-medium font-[inherit]
              flex items-center gap-2 cursor-pointer
              backdrop-blur-sm duration-200
            ">
              <svg className="text-black dark:text-white" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="min-w-0 whitespace-nowrap text-center text-black dark:text-white">{t("secondaryCta")}</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="
              flex justify-center gap-12 mt-16 pt-8
              border-t border-[rgba(0,208,178,0.14)] dark:border-[rgba(0,208,178,0.1)]
              w-full
            "
            {...fadeUp(0.95)}
          >
            <div className="text-center">
              <div className="text-[1.65rem] font-bold tracking-[-0.02em] text-[oklch(0.556_0_0)] dark:text-[oklch(0.985_0_0)] leading-none">
                12<em className="text-primary not-italic">K+</em>
              </div>
              <div className="text-[0.78rem] text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] mt-0.75">
                {t("stats.completed")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[1.65rem] font-bold tracking-[-0.02em] text-[oklch(0.556_0_0)] dark:text-[oklch(0.985_0_0)] leading-none">
                <em className="text-primary not-italic">99</em>.9%
              </div>
              <div className="text-[0.78rem] text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] mt-0.75">
                {t("stats.uptime")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[1.65rem] font-bold tracking-[-0.02em] text-[oklch(0.556_0_0)] dark:text-[oklch(0.985_0_0)] leading-none">
                3<em className="text-primary not-italic">x</em>
              </div>
              <div className="text-[0.78rem] text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] mt-0.75">
                {t("stats.faster")}
              </div>
            </div>
          </motion.div>

        </div>{/* end content */}

        {/* ── Scroll indicator ── */}
        <div className="scroll-indicator absolute bottom-7 left-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase text-[oklch(0.708_0_0)] dark:text-[oklch(0.556_0_0)]">
            {t("scroll")}
          </span>
          <div
            className="w-px h-7"
            style={{ background:"linear-gradient(to bottom, color-mix(in srgb, #00D0B2 40%, transparent), transparent)" }}
          />
        </div>

      </section>
    </>
  );
}