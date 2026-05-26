"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import HolographicPlanetLazy from "./holographic-planet-lazy";
import FocusWord from "@/components/ui/focus-word";

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

// ─── Main hero component ─────────────────────────────────────────────
export default function HomeHero() {
  const t       = useTranslations("homepage.hero");
  const locale  = useLocale();
  const isKhmer = locale === "km";

  const titleLine3           = t("titleLine3");
  const titleLine3FocusMatch = titleLine3.match(/^(.*?)(hacker)(.*)$/iu);
  const khmerWordToAccent = "សម្រាប់";

  const hexLeftRef  = useRef<SVGSVGElement>(null);
  const hexRightRef = useRef<SVGSVGElement>(null);
  const s1Ref       = useRef<HTMLDivElement>(null);
  const s2Ref       = useRef<HTMLDivElement>(null);
  const s3Ref       = useRef<HTMLDivElement>(null);

  const [focusStarted, setFocusStarted] = useState(false);

  useEffect(() => {
    const cleanupHexLeft = setupMagneticHover(hexLeftRef.current);
    const cleanupHexRight = setupMagneticHover(hexRightRef.current);

    // Reduce star count on mobile for better paint performance
    const isMobile = window.innerWidth < 768;
    const starMultiplier = isMobile ? 0.4 : 1;

    if (s1Ref.current) s1Ref.current.style.boxShadow = generateStars(Math.round(700 * starMultiplier), [
      "rgba(0,208,178,0.55)", "rgba(0,208,178,0.35)",
      "rgba(55,65,81,0.45)",  "rgba(55,65,81,0.3)",
      "rgba(107,114,128,0.4)",
    ]);
    if (s2Ref.current) s2Ref.current.style.boxShadow = generateStars(Math.round(200 * starMultiplier), [
      "rgba(55,65,81,0.55)", "rgba(55,65,81,0.4)",
      "rgba(0,208,178,0.6)", "rgba(107,114,128,0.45)",
    ]);
    if (s3Ref.current) s3Ref.current.style.boxShadow = generateStars(Math.round(100 * starMultiplier), [
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

  // Staggered fade-in helper for content blocks (no vertical shift to avoid layout jump)
  const fadeUp = (delay: number) => ({
    initial:    { opacity:0 } as const,
    animate:    { opacity:1 } as const,
    transition: { duration:0.65, delay, ease:"easeOut" as const },
  });

  return (
    <>
      <style>{`
        /* ── Star animations (GPU-composited: transform + opacity only) ── */
        @keyframes mvStar {
          from { transform: translateY(0) translateZ(0); }
          to   { transform: translateY(-2000px) translateZ(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.55; transform: translateY(var(--star-y, 0)) translateZ(0) scale(1); }
          50%     { opacity: 1;    transform: translateY(var(--star-y, 0)) translateZ(0) scale(1.15); }
        }
        .ao-s1 { animation: mvStar 50s  linear infinite; opacity: 0.7; will-change: transform; }
        .ao-s2 { animation: mvStar 100s linear infinite; will-change: transform; }
        .ao-s3 { animation: mvStar 150s linear infinite; opacity: 0.8; will-change: transform; }

        /* ── Scroll bob (GPU-composited) ── */
        @keyframes ao-bob {
          0%,100% { transform: translateX(-50%) translateY(0) translateZ(0); }
          50%      { transform: translateX(-50%) translateY(5px) translateZ(0); }
        }
        .scroll-indicator { animation: ao-bob 2.5s ease-in-out infinite; will-change: transform; }

        /* ── Planet hero intro + sweep comets (GPU-accelerated) ── */
        @keyframes planetHeroIntro {
          0% {
            opacity: 1;
            transform: scale(1) translateZ(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateZ(0);
          }
        }
        @keyframes cometSweepIntro {
          0% {
            opacity: 0;
            transform: scale(0.92) translateZ(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateZ(0);
          }
        }
        @keyframes sweepLeft {
          0%   { transform: rotate(-112deg) scale(0.96) translateZ(0); opacity: 0; }
          14%  { opacity: 0.42; }
          34%  { opacity: 0.98; }
          70%  { transform: rotate(10deg) scale(1) translateZ(0); opacity: 1; }
          88%  { transform: rotate(16deg) scale(1.01) translateZ(0); opacity: 0.22; }
          100% { transform: rotate(16deg) scale(1.01) translateZ(0); opacity: 0; }
        }
        @keyframes sweepRight {
          0%   { transform: rotate(112deg) scale(0.96) translateZ(0); opacity: 0; }
          14%  { opacity: 0.42; }
          34%  { opacity: 0.98; }
          70%  { transform: rotate(-10deg) scale(1) translateZ(0); opacity: 1; }
          88%  { transform: rotate(-16deg) scale(1.01) translateZ(0); opacity: 0.22; }
          100% { transform: rotate(-16deg) scale(1.01) translateZ(0); opacity: 0; }
        }
        @keyframes sweepLeftTrail {
          0%   { transform: rotate(-118deg) scale(0.94) translateZ(0); opacity: 0; }
          22%  { opacity: 0.48; }
          72%  { transform: rotate(6deg) scale(1) translateZ(0); opacity: 0.62; }
          90%  { transform: rotate(10deg) scale(1) translateZ(0); opacity: 0.12; }
          100% { transform: rotate(10deg) scale(1) translateZ(0); opacity: 0; }
        }
        @keyframes sweepRightTrail {
          0%   { transform: rotate(118deg) scale(0.94) translateZ(0); opacity: 0; }
          22%  { opacity: 0.48; }
          72%  { transform: rotate(-6deg) scale(1) translateZ(0); opacity: 0.62; }
          90%  { transform: rotate(-10deg) scale(1) translateZ(0); opacity: 0.12; }
          100% { transform: rotate(-10deg) scale(1) translateZ(0); opacity: 0; }
        }
        @keyframes convergePulse {
          0%,50%  { opacity: 0; transform: scale(0) translateZ(0); }
          56%     { opacity: 0; transform: scale(0) translateZ(0); }
          62%     { opacity: 1; transform: scale(1) translateZ(0); }
          74%     { opacity: 0.6; transform: scale(1.8) translateZ(0); }
          88%     { opacity: 0; transform: scale(2.5) translateZ(0); }
          100%    { opacity: 0; transform: scale(2.5) translateZ(0); }
        }
        @keyframes convergeRing {
          0%,54%  { opacity: 0; transform: scale(0) translateZ(0); }
          60%     { opacity: 0; transform: scale(0) translateZ(0); }
          66%     { opacity: 0.8; transform: scale(1) translateZ(0); }
          82%     { opacity: 0; transform: scale(3.5) translateZ(0); }
          100%    { opacity: 0; transform: scale(3.5) translateZ(0); }
        }
        @keyframes convergeFlash {
          0%,56%  { opacity: 0; }
          62%     { opacity: 1; }
          70%     { opacity: 0; }
          100%    { opacity: 0; }
        }
        .planet-intro {
          animation: planetHeroIntro 0.01s linear 0s both;
          transform-origin: 50% 50%;
          will-change: transform, opacity;
          contain: layout style paint;
        }
        .hero-comet-orbit {
          animation: cometSweepIntro 1.15s ease-out 0.78s both;
          will-change: transform, opacity;
        }
        .sweep-left {
          transform-origin: 100px 100px;
          will-change: transform, opacity;
          animation: sweepLeft 3.8s cubic-bezier(0.16, 1, 0.3, 1) 1.02s 1 forwards;
        }
        .sweep-left-trail {
          transform-origin: 100px 100px;
          will-change: transform, opacity;
          animation: sweepLeftTrail 4s cubic-bezier(0.16, 1, 0.3, 1) 0.9s 1 forwards;
        }
        .sweep-right {
          transform-origin: 100px 100px;
          will-change: transform, opacity;
          animation: sweepRight 3.8s cubic-bezier(0.16, 1, 0.3, 1) 1.02s 1 forwards;
        }
        .sweep-right-trail {
          transform-origin: 100px 100px;
          will-change: transform, opacity;
          animation: sweepRightTrail 4s cubic-bezier(0.16, 1, 0.3, 1) 0.9s 1 forwards;
        }
        .converge {
          transform-origin: 100px 200px;
          will-change: transform, opacity;
          animation: convergePulse 2.9s ease-out 0.82s 1 forwards;
        }
        .converge-ring {
          transform-origin: 100px 200px;
          will-change: transform, opacity;
          animation: convergeRing 2.9s ease-out 0.82s 1 forwards;
        }
        .converge-flash {
          will-change: opacity;
          animation: convergeFlash 2.9s ease-out 0.82s 1 forwards;
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
          transition: opacity .25s ease, fill .25s ease, stroke .25s ease, stroke-width .25s ease, transform .18s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
          will-change: transform, opacity;
        }
        /* GPU-composited: opacity-only animations (no filter) */
        @keyframes star-bright {
          0%,100% { opacity: 0.07; }
          40%,60% { opacity: 0.72; }
        }
        @keyframes star-bright-dk {
          0%,100% { opacity: 0.07; }
          40%,60% { opacity: 1; }
        }
        @keyframes star-mid {
          0%,100% { opacity: 0.05; }
          50% { opacity: 0.30; }
        }
        @keyframes star-mid-dk {
          0%,100% { opacity: 0.05; }
          50% { opacity: 0.45; }
        }
        @keyframes star-dim {
          0%,100% { opacity: 0.03; }
          50% { opacity: 0.10; }
        }
        .hx.bright { animation: star-bright 4s ease-in-out infinite; will-change: opacity; }
        .hx.mid { animation: star-mid 5s ease-in-out infinite; will-change: opacity; }
        .hx.dim { animation: star-dim 6.5s ease-in-out infinite; will-change: opacity; }
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
          stroke: #00FFD4 !important;
          stroke-width: 1.8 !important;
          animation-play-state: paused !important;
        }
        .dark .hx.hovered {
          stroke: #00FFE8 !important;
          fill: rgba(0,208,178,0.12) !important;
        }
        .hx.neighbor {
          opacity: 0.5 !important;
          fill: rgba(0,208,178,0.03) !important;
          stroke: #00D0B2 !important;
          stroke-width: 1.2 !important;
          animation-play-state: paused !important;
        }
        .dark .hx.neighbor {
          opacity: 0.6 !important;
          fill: rgba(0,208,178,0.05) !important;
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

        /* ── Reduced motion: disable all animations ── */
        @media (prefers-reduced-motion: reduce) {
          .ao-s1, .ao-s2, .ao-s3, .scroll-indicator,
          .hx.bright, .hx.mid, .hx.dim,
          .planet-intro, .hero-comet-orbit,
          .sweep-left, .sweep-right, .sweep-left-trail, .sweep-right-trail,
          .converge, .converge-ring, .converge-flash {
            animation: none !important;
          }
          .ao-s1, .ao-s2, .ao-s3 { opacity: 0.6; }
          .hx.bright { opacity: 0.5; }
          .hx.mid { opacity: 0.2; }
          .hx.dim { opacity: 0.08; }
          .hero-comet-orbit { opacity: 0; }
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

        {/* ── Holographic Planet ── */}
        <div aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 top-[15%] md:top-[-5%] h-[80%] w-full max-w-7xl pointer-events-none z-2 overflow-visible"
        >
          {/* Three.js holographic planet */}
          <div
            className="absolute top-[-2.5%] left-1/2 -translate-x-1/2 w-[180%] sm:w-[180%] md:w-[200%] lg:w-[220%] max-w-500"
            style={{ aspectRatio: "1 / 1" }}
          >
            <div className="planet-intro absolute inset-0">
              <HolographicPlanetLazy />
            </div>
          </div>

          {/* Sweep comet SVG */}
          <div
            className="hero-comet-orbit absolute top-[1%] left-1/2 -translate-x-1/2 w-[120%] rounded-full pointer-events-none z-6 overflow-visible"
            style={{ paddingTop:"152%", willChange: "transform", contain: "layout style" }}
          >
            <svg
              className="absolute top-0 left-0 w-full h-full overflow-visible"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Main comet gradient — bright head with teal-to-white */}
                <linearGradient id="cometGradL" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="200" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="34%"  stopColor="#00BFA5" stopOpacity="0.62" />
                  <stop offset="76%"  stopColor="#00FFD4" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="cometGradR" gradientUnits="userSpaceOnUse" x1="200" y1="100" x2="0" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="34%"  stopColor="#00BFA5" stopOpacity="0.62" />
                  <stop offset="76%"  stopColor="#00FFD4" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
                {/* Softer trail gradient */}
                <linearGradient id="trailGradL" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="200" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="44%"  stopColor="#00D0B2" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00FFD4" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="trailGradR" gradientUnits="userSpaceOnUse" x1="200" y1="100" x2="0" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="44%"  stopColor="#00D0B2" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#00FFD4" stopOpacity="0.5" />
                </linearGradient>
                {/* Convergence radial glow */}
                <radialGradient id="convergeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"  stopColor="#00FFD4" stopOpacity="1" />
                  <stop offset="40%" stopColor="#00D0B2" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00D0B2" stopOpacity="0" />
                </radialGradient>
                <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* ── Left comet: soft trail layer (wider, dimmer, slightly delayed) ── */}
              <g className="sweep-left-trail" style={{ opacity: 0, transformOrigin: "100px 100px" }}>
                <circle cx="100" cy="100" r="100" fill="none" stroke="url(#trailGradL)"
                  strokeWidth="7.5" strokeLinecap="round" strokeDasharray="102 526.32"
                  strokeDashoffset="0" />
              </g>
              {/* ── Left comet: bright head layer ── */}
              <g className="sweep-left" style={{ opacity: 0, transformOrigin: "100px 100px" }}>
                <circle cx="100" cy="100" r="100" fill="none" stroke="url(#cometGradL)"
                  strokeWidth="3.2" strokeLinecap="round" strokeDasharray="70 558.32"
                  strokeDashoffset="0"
                  filter="url(#cometGlow)" />
              </g>

              {/* ── Right comet: soft trail layer ── */}
              <g className="sweep-right-trail" style={{ opacity: 0, transformOrigin: "100px 100px" }}>
                <g transform="scale(-1,1) translate(-200,0)">
                  <circle cx="100" cy="100" r="100" fill="none" stroke="url(#trailGradR)"
                    strokeWidth="7.5" strokeLinecap="round" strokeDasharray="102 526.32"
                    strokeDashoffset="0" />
                </g>
              </g>
              {/* ── Right comet: bright head layer ── */}
              <g className="sweep-right" style={{ opacity: 0, transformOrigin: "100px 100px" }}>
                <g transform="scale(-1,1) translate(-200,0)">
                  <circle cx="100" cy="100" r="100" fill="none" stroke="url(#cometGradR)"
                    strokeWidth="3.2" strokeLinecap="round" strokeDasharray="70 558.32"
                    strokeDashoffset="0"
                    filter="url(#cometGlow)" />
                </g>
              </g>

              {/* ── Convergence burst: expanding ring ── */}
              <circle cx="100" cy="200" r="4" fill="none" stroke="#00D0B2" strokeWidth="1.5"
                className="converge-ring" style={{ opacity: 0, transform: "scale(0)", transformOrigin: "100px 200px" }} />
              {/* ── Convergence burst: core pulse ── */}
              <circle cx="100" cy="200" r="5" fill="url(#convergeGlow)"
                className="converge" style={{ opacity: 0, transform: "scale(0)", transformOrigin: "100px 200px" }}
                filter="url(#softGlow)" />
              {/* ── Convergence burst: bright flash ── */}
              <circle cx="100" cy="200" r="2" fill="#ffffff"
                className="converge-flash" style={{ opacity: 0 }}
                filter="url(#softGlow)" />
            </svg>
          </div>

          {/* Bottom fade veil */}
          <div className="
            absolute bottom-0 left-0 right-0 h-[35%] z-5
            [background:linear-gradient(to_bottom,transparent,rgba(255,255,255,1))]
            dark:[background:linear-gradient(to_bottom,transparent,rgba(9,9,11,0.96))]
          " />
        </div>

        {/* ── Hex grids (hidden on mobile for performance) ── */}
        <div className="hidden md:block">
          <HexGrid hexes={LEFT_HEXES}  svgRef={hexLeftRef}  className="hex-grid-left" />
          <HexGrid hexes={RIGHT_HEXES} svgRef={hexRightRef} className="hex-grid-right" />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center max-w-260 w-full">

          {/* Headline */}
          <motion.h1
            className="
              text-[clamp(2.8rem,6vw,5rem)] font-bold
              leading-[1.08] tracking-[-0.02em] font-display
              text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
              mb-6
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
                    ? (
                      <span className="font-khmer">
                        {titleLine3FocusMatch[1].split(khmerWordToAccent).map((part, index, array) => (
                          <span key={`${part}-${index}`}>
                            {part}
                            {index < array.length - 1 ? (
                              <span
                                style={{
                                  fontFamily: 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif',
                                  fontWeight: 800,
                                }}
                              >
                                {khmerWordToAccent}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </span>
                    )
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
              max-w-124 mx-auto mb-8
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
            <Link
              href="/userdashboard"
              className="
                group relative inline-flex w-full min-w-0 items-center justify-center
                overflow-hidden rounded-xl border-2 border-primary bg-primary
                px-3 py-3 sm:px-7.5 sm:py-3.5
                text-[14px] sm:text-[15px] font-black leading-none text-black
                transition-transform duration-200 hover:-translate-y-px
                before:pointer-events-none before:absolute before:inset-0 before:translate-y-full
                before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)]
                before:transition-transform before:duration-200 before:content-['']
                after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full
                after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)]
                after:transition-transform after:duration-200 after:content-['']
                hover:before:translate-y-0 hover:after:translate-y-0
                sm:w-auto
              "
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span className="min-w-0 whitespace-nowrap text-center">{t("primaryCta")}</span>
              </span>
            </Link>

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
              flex justify-center gap-12 mt-8 pt-8
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
