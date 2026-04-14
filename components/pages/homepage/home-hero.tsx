"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

const hexPoints = "28,0 56,16 56,48 28,64 0,48 0,16";

type HexDef = { id: string; cls: string; tx: number; ty: number };

const LEFT_HEXES: HexDef[] = [
  { id:"l0",  cls:"st-bright l-b1", tx:2,   ty:2   },
  { id:"l1",  cls:"st-bright l-b2", tx:91,  ty:52  },
  { id:"l2",  cls:"st-bright l-b3", tx:60,  ty:104 },
  { id:"l3",  cls:"st-mid l-m1",    tx:60,  ty:2   },
  { id:"l4",  cls:"st-mid l-m2",    tx:31,  ty:52  },
  { id:"l5",  cls:"st-mid l-m3",    tx:151, ty:52  },
  { id:"l6",  cls:"st-mid l-m4",    tx:31,  ty:156 },
  { id:"l7",  cls:"st-mid l-m5",    tx:2,   ty:208 },
  { id:"l8",  cls:"st-dim l-d1",    tx:120, ty:2   },
  { id:"l9",  cls:"st-dim l-d2",    tx:180, ty:2   },
  { id:"l10", cls:"st-dim l-d3",    tx:240, ty:2   },
  { id:"l11", cls:"st-dim l-d4",    tx:300, ty:2   },
  { id:"l12", cls:"st-dim l-d5",    tx:211, ty:52  },
  { id:"l13", cls:"st-dim l-d6",    tx:271, ty:52  },
  { id:"l14", cls:"st-dim l-d7",    tx:331, ty:52  },
  { id:"l15", cls:"st-dim l-d8",    tx:2,   ty:104 },
  { id:"l16", cls:"st-dim l-d9",    tx:120, ty:104 },
  { id:"l17", cls:"st-dim l-d10",   tx:180, ty:104 },
  { id:"l18", cls:"st-dim l-d11",   tx:240, ty:104 },
  { id:"l19", cls:"st-dim l-d12",   tx:300, ty:104 },
  { id:"l20", cls:"st-dim l-d1",    tx:91,  ty:156 },
  { id:"l21", cls:"st-dim l-d3",    tx:151, ty:156 },
  { id:"l22", cls:"st-dim l-d5",    tx:211, ty:156 },
  { id:"l23", cls:"st-dim l-d7",    tx:271, ty:156 },
  { id:"l24", cls:"st-dim l-d9",    tx:60,  ty:208 },
  { id:"l25", cls:"st-dim l-d11",   tx:120, ty:208 },
  { id:"l26", cls:"st-dim l-d2",    tx:180, ty:208 },
  { id:"l27", cls:"st-dim l-d4",    tx:240, ty:208 },
  { id:"l28", cls:"st-dim l-d6",    tx:31,  ty:260 },
  { id:"l29", cls:"st-dim l-d8",    tx:91,  ty:260 },
  { id:"l30", cls:"st-dim l-d10",   tx:151, ty:260 },
  { id:"l31", cls:"st-dim l-d12",   tx:211, ty:260 },
  { id:"l32", cls:"st-dim l-d1",    tx:2,   ty:312 },
  { id:"l33", cls:"st-dim l-d3",    tx:60,  ty:312 },
  { id:"l34", cls:"st-dim l-d5",    tx:120, ty:312 },
  { id:"l35", cls:"st-dim l-d7",    tx:180, ty:312 },
  { id:"l36", cls:"st-dim l-d9",    tx:31,  ty:364 },
  { id:"l37", cls:"st-dim l-d11",   tx:91,  ty:364 },
  { id:"l38", cls:"st-dim l-d2",    tx:151, ty:364 },
  { id:"l39", cls:"st-dim l-d4",    tx:2,   ty:416 },
  { id:"l40", cls:"st-dim l-d6",    tx:60,  ty:416 },
];

const RIGHT_HEXES: HexDef[] = [
  { id:"r0",  cls:"st-bright r-b1", tx:120, ty:2   },
  { id:"r1",  cls:"st-bright r-b2", tx:31,  ty:52  },
  { id:"r2",  cls:"st-bright r-b3", tx:2,   ty:104 },
  { id:"r3",  cls:"st-mid r-m1",    tx:2,   ty:2   },
  { id:"r4",  cls:"st-mid r-m2",    tx:60,  ty:2   },
  { id:"r5",  cls:"st-mid r-m3",    tx:91,  ty:52  },
  { id:"r6",  cls:"st-mid r-m4",    tx:151, ty:52  },
  { id:"r7",  cls:"st-mid r-m5",    tx:91,  ty:156 },
  { id:"r8",  cls:"st-dim r-d1",    tx:180, ty:2   },
  { id:"r9",  cls:"st-dim r-d2",    tx:240, ty:2   },
  { id:"r10", cls:"st-dim r-d3",    tx:300, ty:2   },
  { id:"r11", cls:"st-dim r-d4",    tx:211, ty:52  },
  { id:"r12", cls:"st-dim r-d5",    tx:271, ty:52  },
  { id:"r13", cls:"st-dim r-d6",    tx:331, ty:52  },
  { id:"r14", cls:"st-dim r-d7",    tx:60,  ty:104 },
  { id:"r15", cls:"st-dim r-d8",    tx:120, ty:104 },
  { id:"r16", cls:"st-dim r-d9",    tx:180, ty:104 },
  { id:"r17", cls:"st-dim r-d10",   tx:240, ty:104 },
  { id:"r18", cls:"st-dim r-d11",   tx:300, ty:104 },
  { id:"r19", cls:"st-dim r-d12",   tx:31,  ty:156 },
  { id:"r20", cls:"st-dim r-d1",    tx:151, ty:156 },
  { id:"r21", cls:"st-dim r-d3",    tx:211, ty:156 },
  { id:"r22", cls:"st-dim r-d5",    tx:271, ty:156 },
  { id:"r23", cls:"st-dim r-d7",    tx:2,   ty:208 },
  { id:"r24", cls:"st-dim r-d9",    tx:60,  ty:208 },
  { id:"r25", cls:"st-dim r-d11",   tx:120, ty:208 },
  { id:"r26", cls:"st-dim r-d2",    tx:180, ty:208 },
  { id:"r27", cls:"st-dim r-d4",    tx:240, ty:208 },
  { id:"r28", cls:"st-dim r-d6",    tx:31,  ty:260 },
  { id:"r29", cls:"st-dim r-d8",    tx:91,  ty:260 },
  { id:"r30", cls:"st-dim r-d10",   tx:151, ty:260 },
  { id:"r31", cls:"st-dim r-d12",   tx:211, ty:260 },
  { id:"r32", cls:"st-dim r-d1",    tx:2,   ty:312 },
  { id:"r33", cls:"st-dim r-d3",    tx:60,  ty:312 },
  { id:"r34", cls:"st-dim r-d5",    tx:120, ty:312 },
  { id:"r35", cls:"st-dim r-d7",    tx:180, ty:312 },
  { id:"r36", cls:"st-dim r-d9",    tx:31,  ty:364 },
  { id:"r37", cls:"st-dim r-d11",   tx:91,  ty:364 },
  { id:"r38", cls:"st-dim r-d2",    tx:151, ty:364 },
  { id:"r39", cls:"st-dim r-d4",    tx:2,   ty:416 },
  { id:"r40", cls:"st-dim r-d6",    tx:60,  ty:416 },
];

function generateStars(count: number, colors: string[]): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    const color = colors[Math.floor(Math.random() * colors.length)];
    out.push(`${x}px ${y}px ${color}`);
  }
  return out.join(", ");
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
      width="350"
      height="450"
      viewBox="0 0 380 480"
      fill="none"
    >
      {hexes.map((h) => (
        <polygon
          key={h.id}
          data-id={h.id}
          className={`hx ${h.cls}`}
          points={hexPoints}
          transform={`translate(${h.tx},${h.ty})`}
        />
      ))}
    </svg>
  );
}

function getCenter(poly: SVGPolygonElement) {
  const t = poly.getAttribute("transform") || "translate(0,0)";
  const m = t.match(/translate\(([^,]+),([^)]+)\)/);
  if (!m) return { x: 0, y: 0 };
  return { x: parseFloat(m[1]) + 28, y: parseFloat(m[2]) + 32 };
}
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function setupMagneticHover(svgEl: SVGSVGElement | null) {
  if (!svgEl) return;

  const hexes = Array.from(svgEl.querySelectorAll<SVGPolygonElement>(".hx"));
  const centers = hexes.map(getCenter);
  const origTransforms = hexes.map((h) => h.getAttribute("transform") || "");
  const origPositions = hexes.map((_, i) => centers[i]);

  const MAGNETIC_RADIUS = 90;
  const MAX_PULL = 7;
  const NEIGHBOR_RADIUS = 72;

  function applyMagnetic(mouseX: number, mouseY: number) {
    hexes.forEach((hex, i) => {
      const cx = origPositions[i].x;
      const cy = origPositions[i].y;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);

      hex.classList.remove("hovered", "neighbor");

      if (d < MAGNETIC_RADIUS) {
        const strength = Math.pow(1 - d / MAGNETIC_RADIUS, 1.6);
        const pullX = (dx / d) * strength * MAX_PULL;
        const pullY = (dy / d) * strength * MAX_PULL;
        const newTx = origPositions[i].x - 28 + pullX;
        const newTy = origPositions[i].y - 32 + pullY;
        hex.setAttribute("transform", `translate(${newTx},${newTy})`);

        if (d < 36) {
          hex.classList.add("hovered");
        } else if (d < NEIGHBOR_RADIUS) {
          hex.classList.add("neighbor");
        }
      } else {
        hex.setAttribute("transform", origTransforms[i]);
      }
    });
  }

  function resetAll() {
    hexes.forEach((hex, i) => {
      hex.setAttribute("transform", origTransforms[i]);
      hex.classList.remove("hovered", "neighbor");
    });
  }

  svgEl.addEventListener("mousemove", (e: MouseEvent) => {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 380 / rect.width;
    const scaleY = 480 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    applyMagnetic(mouseX, mouseY);
  });

  svgEl.addEventListener("mouseleave", resetAll);

  hexes.forEach((hex, i) => {
    hex.addEventListener("mouseenter", () => {
      hexes.forEach((h, j) => {
        if (j !== i && dist(centers[i], centers[j]) < NEIGHBOR_RADIUS) {
          h.classList.add("neighbor");
        }
      });
    });
  });
}

export default function HomeHero() {
  const t = useTranslations("homepage.hero");
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const titleLine3 = t("titleLine3");
  const khmerTitleLine3Match = isKhmer
    ? titleLine3.match(/^([\u1780-\u17FF\u200B-\u200D\s]+)(.*)$/u)
    : null;
  const hexLeftRef  = useRef<SVGSVGElement>(null);
  const hexRightRef = useRef<SVGSVGElement>(null);
  const s1Ref       = useRef<HTMLDivElement>(null);
  const s2Ref       = useRef<HTMLDivElement>(null);
  const s3Ref       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (s1Ref.current) {
      s1Ref.current.style.boxShadow = generateStars(700, [
        "rgba(0,208,178,0.55)",
        "rgba(0,208,178,0.35)",
        "rgba(55,65,81,0.45)",
        "rgba(55,65,81,0.3)",
        "rgba(107,114,128,0.4)",
      ]);
    }
    if (s2Ref.current) {
      s2Ref.current.style.boxShadow = generateStars(200, [
        "rgba(55,65,81,0.55)",
        "rgba(55,65,81,0.4)",
        "rgba(0,208,178,0.6)",
        "rgba(107,114,128,0.45)",
      ]);
    }
    if (s3Ref.current) {
      s3Ref.current.style.boxShadow = generateStars(100, [
        "rgba(0,208,178,0.9)",
        "rgba(0,208,178,0.7)",
        "rgba(0,208,178,0.5)",
        "rgba(55,65,81,0.7)",
      ]);
    }

    setupMagneticHover(hexLeftRef.current);
    setupMagneticHover(hexRightRef.current);
  }, []);

  return (
    <>
      <style>{`
        /* ── Star dots ── */
        .ao-s1, .ao-s2, .ao-s3 {
          position: absolute;
          top: 0; left: 0;
          pointer-events: none;
          z-index: 0;
        }
        .ao-s1 {
          width: 1px; height: 3px;
          background: #00D0B2;
          animation: mvStar 50s linear infinite, glowPulse 3s ease-in-out infinite;
        }
        .ao-s2 {
          width: 2px; height: 2px;
          background: #374151;
          animation: mvStar 100s linear infinite;
        }
        .ao-s3 {
          width: 2px; height: 2px;
          background: #00D0B2;
          animation: mvStar 150s linear infinite, glowPulse 5s ease-in-out 1.5s infinite;
        }
        @keyframes mvStar {
          from { transform: translateY(0); }
          to   { transform: translateY(-2000px); }
        }
        @keyframes glowPulse {
          0%,100% { filter: blur(0px);   opacity: 0.55; }
          50%      { filter: blur(0.6px); opacity: 1;    }
        }

        /* ── Planet arc container ── */
        .ao-planet {
          position: absolute;
          left: 0; right: 0;
          top: 62%;
          height: 80%;
          pointer-events: none;
          z-index: 2;
          overflow: visible;
        }
        @keyframes planetReveal {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        /* ════════════════════════════════════════════
           LIGHT MODE sphere — original F7F5F0 palette
           ════════════════════════════════════════════ */
        .ao-planet-sphere {
          opacity: 0;
          animation: planetReveal 0.9s ease-out 2.0s 1 forwards;
          position: absolute;
          top: -2.5%;
          left: 50%;
          width: 150%;
          padding-top: 150%;
          border-radius: 50%;
          transform: translateX(-50%);
          background: #F7F5F0;
          overflow: hidden;
        }

        /* LEFT blob — deep blue */
        .ao-planet-sphere::before {
          content: '';
          position: absolute;
          border-radius: 50%;
          width: 46%; height: 42%;
          top: -8%; left: -6%;
          background: #01509e;
          opacity: 0.95;
          filter: blur(80px);
        }
        /* RIGHT blob — teal */
        .ao-planet-sphere::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          width: 38%; height: 34%;
          top: -5%; right: -4%;
          background: #00d0b2;
          opacity: 0.50;
          filter: blur(70px);
        }

        .ao-planet-blob-white {
          position: absolute;
          border-radius: 50%;
          width: 72%; height: 66%;
          top: -55%; left: 50%;
          transform: translateX(-50%);
          background: #F7F5F0;
          opacity: 1;
          filter: blur(75px);
        }
        .ao-planet-blob-cyan {
          position: absolute;
          border-radius: 50%;
          width: 42%; height: 38%;
          bottom: -8%; left: -4%;
          background: #0194c7;
          opacity: 0.75;
          filter: blur(72px);
        }
        .ao-planet-blob-cyan2 {
          position: absolute;
          border-radius: 50%;
          width: 30%; height: 26%;
          bottom: -6%; right: -2%;
          background: #0194c7;
          opacity: 0.50;
          filter: blur(60px);
        }
        .ao-planet-blob-mid {
          position: absolute;
          border-radius: 50%;
          width: 30%; height: 26%;
          top: 22%; left: 35%;
          background: #00d0b2;
          opacity: 0.18;
          filter: blur(55px);
        }

        .ao-planet-sphere-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 50% 50%,
            transparent 0%,
            transparent 38%,
            rgba(240,248,255,0.25) 55%,
            rgba(220,235,245,0.55) 72%,
            rgba(200,220,240,0.80) 88%,
            rgba(185,210,235,0.92) 100%
          );
          pointer-events: none;
        }
        .ao-planet-sphere-top {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(255,255,255,0.55) 0%,
            transparent 48%
          );
          pointer-events: none;
        }

        /* ════════════════════════════════════════════
           DARK MODE sphere overrides
           bg: #09090B — deep space, vibrant teal/blue
           ════════════════════════════════════════════ */
        .dark .ao-planet-sphere {
          background: #09090B;
        }
        /* LEFT blob — richer deep blue in dark */
        .dark .ao-planet-sphere::before {
          background: #0a3a7a;
          opacity: 1;
          filter: blur(70px);
        }
        /* RIGHT blob — vivid teal in dark */
        .dark .ao-planet-sphere::after {
          background: #00d0b2;
          opacity: 0.70;
          filter: blur(65px);
        }
        /* Centre blob — pure dark bg instead of off-white */
        .dark .ao-planet-blob-white {
          background: #09090B;
          opacity: 1;
          filter: blur(60px);
        }
        /* Bottom-left cyan — more vivid */
        .dark .ao-planet-blob-cyan {
          background: #00a8e8;
          opacity: 0.85;
          filter: blur(65px);
        }
        /* Bottom-right secondary cyan */
        .dark .ao-planet-blob-cyan2 {
          background: #00c4b4;
          opacity: 0.65;
          filter: blur(55px);
        }
        /* Mid teal softener — more visible in dark */
        .dark .ao-planet-blob-mid {
          background: #00d0b2;
          opacity: 0.28;
          filter: blur(50px);
        }
        /* Dark mode vignette — blend into #09090B at edges */
        .dark .ao-planet-sphere-overlay {
          background: radial-gradient(
            ellipse at 50% 50%,
            transparent 0%,
            transparent 35%,
            rgba(9,9,11,0.20) 52%,
            rgba(9,9,11,0.55) 70%,
            rgba(9,9,11,0.82) 86%,
            rgba(9,9,11,0.95) 100%
          );
        }
        /* Dark mode top wash — subtle teal luminance at crown */
        .dark .ao-planet-sphere-top {
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(0,208,178,0.18) 0%,
            rgba(0,168,232,0.08) 30%,
            transparent 55%
          );
        }

        /* ── glow, rim, fade, sweep — same for both modes ── */
        .ao-planet-glow {
          position: absolute;
          top: -3%; left: 50%;
          width: 155%; padding-top: 155%;
          border-radius: 50%;
          transform: translateX(-50%);
          background: transparent;
          box-shadow:
            0 0 0    2px rgba(1,80,158,0.5),
            0 0 20px 8px rgba(1,80,158,0.4),
            0 0 55px 22px rgba(1,80,158,0.2),
            0 0 110px 45px rgba(1,80,158,0.1),
            0 0 180px 80px rgba(1,80,158,0.06);
          z-index: 3;
          opacity: 0;
          animation: planetReveal 0.9s ease-out 1.0s 1 forwards;
        }
        /* Dark mode glow — more intense teal/blue */
        .dark .ao-planet-glow {
          box-shadow:
            0 0 0    2px rgba(0,208,178,0.6),
            0 0 20px 8px rgba(0,168,232,0.5),
            0 0 55px 22px rgba(0,208,178,0.28),
            0 0 110px 45px rgba(1,80,158,0.18),
            0 0 180px 80px rgba(0,208,178,0.1);
        }
        .ao-planet-rim {
          position: absolute;
          top: -1%; left: 50%;
          width: 152%; padding-top: 152%;
          border-radius: 50%;
          transform: translateX(-50%);
          background: transparent;
          border: 2px solid rgba(0,208,178,0.7);
          box-shadow:
            0 0 14px 4px rgba(0,208,178,0.4),
            inset 0 0 22px 6px rgba(0,208,178,0.12);
          z-index: 4;
          opacity: 0;
          animation: planetReveal 0.9s ease-out 2.0s 1 forwards;
        }
        /* Dark mode rim — brighter teal */
        .dark .ao-planet-rim {
          border-color: rgba(0,208,178,0.9);
          box-shadow:
            0 0 20px 6px rgba(0,208,178,0.55),
            0 0 50px 16px rgba(0,208,178,0.2),
            inset 0 0 30px 8px rgba(0,208,178,0.15);
        }
        .ao-planet-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 35%;
          background: linear-gradient(to bottom, transparent, rgba(238,247,245,0.92));
          z-index: 5;
        }
        /* Dark mode fade — blend into #09090B */
        .dark .ao-planet-fade {
          background: linear-gradient(to bottom, transparent, rgba(9,9,11,0.96));
        }

        .ao-planet-sweep {
          position: absolute;
          top: -3%; left: 50%;
          width: 152%;
          padding-top: 152%;
          border-radius: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 6;
          overflow: visible;
        }
        .ao-sweep-svg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          overflow: visible;
        }

        @keyframes sweepLeft {
          0%   { stroke-dashoffset: var(--sweep-start-l); opacity: 0; }
          12%  { opacity: 1; }
          55%  { stroke-dashoffset: var(--sweep-end-l);   opacity: 1; }
          72%  { stroke-dashoffset: var(--sweep-end-l);   opacity: 0; }
          100% { stroke-dashoffset: var(--sweep-end-l);   opacity: 0; }
        }
        @keyframes sweepRight {
          0%   { stroke-dashoffset: var(--sweep-start-r); opacity: 0; }
          12%  { opacity: 1; }
          55%  { stroke-dashoffset: var(--sweep-end-r);   opacity: 1; }
          72%  { stroke-dashoffset: var(--sweep-end-r);   opacity: 0; }
          100% { stroke-dashoffset: var(--sweep-end-r);   opacity: 0; }
        }
        @keyframes convergePulse {
          0%,52%  { opacity: 0; r: 0; }
          58%     { opacity: 0; }
          64%     { opacity: 1; r: 6px; filter: drop-shadow(0 0 8px #00D0B2); }
          76%     { opacity: 0; r: 0; }
          100%    { opacity: 0; r: 0; }
        }

        /* ── Hex grids ── */
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
          40%,60%  { opacity: 0.72; filter: drop-shadow(0 0 4px #00D0B2) drop-shadow(0 0 10px rgba(0,208,178,.5)); }
        }
        @keyframes star-bright-dk {
          0%,100% { opacity: 0.07; filter: none; }
          40%,60%  { opacity: 1;    filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 16px rgba(0,208,178,.7)) drop-shadow(0 0 32px rgba(0,208,178,.3)); }
        }
        @keyframes star-mid {
          0%,100% { opacity: 0.05; filter: none; }
          50%     { opacity: 0.30; filter: drop-shadow(0 0 2px rgba(0,208,178,.38)); }
        }
        @keyframes star-mid-dk {
          0%,100% { opacity: 0.05; filter: none; }
          50%     { opacity: 0.45; filter: drop-shadow(0 0 4px rgba(0,208,178,.5)); }
        }
        @keyframes star-dim {
          0%,100% { opacity: 0.03; }
          50%     { opacity: 0.10; }
        }

        .st-bright { animation: star-bright 4s ease-in-out infinite; }
        .st-mid    { animation: star-mid   5s ease-in-out infinite; }
        .st-dim    { animation: star-dim   6.5s ease-in-out infinite; }

        @media (prefers-color-scheme: dark) {
          .st-bright { animation-name: star-bright-dk; }
          .st-mid    { animation-name: star-mid-dk; }
        }
        :root[class*="dark"] .st-bright { animation-name: star-bright-dk; }
        :root[class*="dark"] .st-mid    { animation-name: star-mid-dk; }
        .dark .st-bright { animation-name: star-bright-dk; }
        .dark .st-mid    { animation-name: star-mid-dk; }

        .l-b1{animation-delay:0s}   .l-b2{animation-delay:1.5s}  .l-b3{animation-delay:3.0s}
        .l-m1{animation-delay:0.6s} .l-m2{animation-delay:1.9s}  .l-m3{animation-delay:3.3s}
        .l-m4{animation-delay:0.3s} .l-m5{animation-delay:2.4s}
        .l-d1{animation-delay:0.2s} .l-d2{animation-delay:1.1s}  .l-d3{animation-delay:2.0s}
        .l-d4{animation-delay:3.1s} .l-d5{animation-delay:0.8s}  .l-d6{animation-delay:1.7s}
        .l-d7{animation-delay:2.8s} .l-d8{animation-delay:4.0s}  .l-d9{animation-delay:0.5s}
        .l-d10{animation-delay:1.4s}.l-d11{animation-delay:3.6s} .l-d12{animation-delay:2.5s}

        .r-b1{animation-delay:0.7s} .r-b2{animation-delay:2.2s}  .r-b3{animation-delay:3.7s}
        .r-m1{animation-delay:1.3s} .r-m2{animation-delay:2.6s}  .r-m3{animation-delay:0.4s}
        .r-m4{animation-delay:3.9s} .r-m5{animation-delay:1.8s}
        .r-d1{animation-delay:0.9s} .r-d2{animation-delay:1.6s}  .r-d3{animation-delay:2.3s}
        .r-d4{animation-delay:3.4s} .r-d5{animation-delay:0.1s}  .r-d6{animation-delay:1.2s}
        .r-d7{animation-delay:2.9s} .r-d8{animation-delay:4.2s}  .r-d9{animation-delay:0.6s}
        .r-d10{animation-delay:1.9s}.r-d11{animation-delay:3.2s} .r-d12{animation-delay:2.1s}

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
          left: -20px;
          top: -10px;
          -webkit-mask-image: linear-gradient(to bottom right, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
          mask-image: linear-gradient(to bottom right, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
        }
        .hex-grid-right {
          right: -158px;
          top: -15px;
          -webkit-mask-image: linear-gradient(to bottom left, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
          mask-image: linear-gradient(to bottom left, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.1) 68%, transparent 100%);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { opacity:0; animation: fadeUp 0.6s 0.15s ease forwards; }
        .fade-up-2 { opacity:0; animation: fadeUp 0.7s 0.30s ease forwards; }
        .fade-up-3 { opacity:0; animation: fadeUp 0.7s 0.50s ease forwards; }
        .fade-up-4 { opacity:0; animation: fadeUp 0.7s 0.70s ease forwards; }
        .fade-up-5 { opacity:0; animation: fadeUp 0.7s 0.95s ease forwards; }

        .accent-underline {
          position: relative;
          display: inline-block;
        }
        .accent-underline::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00D0B2, transparent);
          border-radius: 4px;
          opacity: 0.35;
        }

        @keyframes ao-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(5px); }
        }
        .scroll-indicator {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          animation: ao-bob 2.5s ease-in-out infinite;
          z-index: 20;
        }

        /* ── Responsive description font sizes ── */
        .hero-description {
          font-size: 16px; /* mobile */
        }
        @media (min-width: 768px) {
          .hero-description {
            font-size: 18px; /* tablet */
          }
        }
        @media (min-width: 1024px) {
          .hero-description {
            font-size: 20px; /* desktop */
          }
        }

        /* Ripple Animation for Preview Button */
        .ripple-button {
          position: relative;
          overflow: hidden;
        }
        .ripple-button:before {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%) scaleY(1) scaleX(1.25);
          top: 100%;
          width: 140%;
          height: 180%;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          display: block;
          transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
          z-index: -1;
        }
        .ripple-button:after {
          content: "";
          position: absolute;
          left: 55%;
          transform: translateX(-50%) scaleY(1) scaleX(1.45);
          top: 180%;
          width: 160%;
          height: 190%;
          background-color: #39bda7;
          border-radius: 50%;
          display: block;
          transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
          z-index: -1;
        }
        .ripple-button:hover {
          border-color: #39bda7;
        }
        .ripple-button:hover svg {
          color: black;
          stroke: black;
        }
        .dark .ripple-button:hover svg {
          color: white;
          stroke: white;
        }
        .ripple-button:hover:before {
          top: -35%;
          background-color: #39bda7;
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }
        .ripple-button:hover:after {
          top: -45%;
          background-color: #39bda7;
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }

      `}</style>

      <section
        className="
          relative min-h-screen overflow-hidden mx-auto max-w-8xl
          flex flex-col items-center justify-center text-center
          px-[6%] py-25
          bg-white dark:bg-[#09090B]
          text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
          transition-[background] duration-400
        "
        style={{
          background: "#fffff",
          fontFamily: isKhmer
            ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
            : "var(--font-google-sans), var(--font-noto-khmer), sans-serif",
        }}
      >

        {/* ── STAR DOTS ── */}
        <div ref={s1Ref} className="ao-s1" aria-hidden="true" />
        <div ref={s2Ref} className="ao-s2" aria-hidden="true" />
        <div ref={s3Ref} className="ao-s3" aria-hidden="true" />

        {/* ── PLANET ARC ── */}
        <div className="ao-planet" aria-hidden="true">
          <div className="ao-planet-sphere">
            <div className="ao-planet-blob-white" />
            <div className="ao-planet-blob-cyan" />
            <div className="ao-planet-blob-cyan2" />
            <div className="ao-planet-blob-mid" />
            <div className="ao-planet-sphere-overlay" />
            <div className="ao-planet-sphere-top" />
          </div>
          <div className="ao-planet-glow"   />
          <div className="ao-planet-rim"    />
          <div className="ao-planet-sweep" aria-hidden="true">
            <svg
              className="ao-sweep-svg"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cometGradL" gradientUnits="userSpaceOnUse"
                  x1="0" y1="100" x2="200" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="60%"  stopColor="#00D0B2" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#F7F5F0" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="cometGradR" gradientUnits="userSpaceOnUse"
                  x1="200" y1="100" x2="0" y2="100">
                  <stop offset="0%"   stopColor="#00D0B2" stopOpacity="0" />
                  <stop offset="60%"  stopColor="#00D0B2" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#F7F5F0" stopOpacity="0.95" />
                </linearGradient>
                <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="100" cy="100" r="100"
                fill="none"
                stroke="url(#cometGradL)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="70 558.32"
                filter="url(#cometGlow)"
                style={{
                  ["--sweep-start-l" as string]: "348.88",
                  ["--sweep-end-l"   as string]: "87.08",
                  strokeDashoffset: "348.88",
                  animation: "sweepLeft 1.8s cubic-bezier(0.25,0.1,0.25,1) 1 forwards",
                  animationDelay: "0.3s",
                } as React.CSSProperties}
              />
              <circle
                cx="100" cy="100" r="100"
                fill="none"
                stroke="url(#cometGradR)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="70 558.32"
                filter="url(#cometGlow)"
                transform="scale(-1,1) translate(-200,0)"
                style={{
                  ["--sweep-start-r" as string]: "348.88",
                  ["--sweep-end-r"   as string]: "87.08",
                  strokeDashoffset: "348.88",
                  animation: "sweepRight 1.8s cubic-bezier(0.25,0.1,0.25,1) 1 forwards",
                  animationDelay: "0.3s",
                } as React.CSSProperties}
              />
              <circle
                cx="100" cy="200" r="0"
                fill="#00D0B2"
                style={{
                  animation: "convergePulse 1.8s ease-out 1 forwards",
                  animationDelay: "0.3s",
                  filter: "drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 14px rgba(0,208,178,0.6))",
                } as React.CSSProperties}
              />
            </svg>
          </div>
          <div className="ao-planet-fade" />
        </div>

        {/* ── HEX GRIDS ── */}
        <HexGrid hexes={LEFT_HEXES}  svgRef={hexLeftRef}  className="hex-grid-left" />
        <HexGrid hexes={RIGHT_HEXES} svgRef={hexRightRef} className="hex-grid-right" />

        {/* ── CONTENT ── */}
        <div className="relative z-10 flex flex-col items-center max-w-256.25 w-full">

          {/* Title */}
          <h1 className="
            text-[clamp(2.8rem,6vw,5rem)] font-bold
            leading-[1.08] tracking-[-0.02em]
            text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
            mb-[1.4rem] fade-up-2
          ">
            <span className="text-[#01509e] accent-underline">{t("titleLine1")}</span>
            <br />
            {t("titleLine2")}
            <br />
            <span className="text-[#00d0b2] dark:text-primary font-light">
              {khmerTitleLine3Match ? (
                <>
                  <span className="font-khmer">{khmerTitleLine3Match[1]}</span>
                  {khmerTitleLine3Match[2]}
                </>
              ) : (
                titleLine3
              )}
            </span>
          </h1>

          {/* Subtitle — responsive 16px / 18px / 20px */}
          <p className="
            hero-description
            fade-up-3
            text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]
            max-w-125 mx-auto mb-[2.6rem]
            leading-[1.7] font-normal
          ">
            {t("description")}
          </p>

          {/* Buttons */}
          <div className="fade-up-4 grid w-full max-w-136 grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center">
            <button className="
              group relative inline-flex w-full min-w-0 items-center justify-center
              overflow-hidden rounded-xl border-2 border-primary bg-primary
              px-3 py-3 text-[14px] sm:px-4 sm:text-[15px] font-black leading-none text-white
              transition-transform duration-200 hover:-translate-y-px
              before:pointer-events-none before:absolute before:inset-0 before:translate-y-full
              before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)]
              before:transition-transform before:duration-200 before:content-['']
              after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full
              after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)]
              after:transition-transform after:duration-200 after:content-['']
              hover:before:translate-y-0 hover:after:translate-y-0
              sm:w-auto sm:px-7.5 sm:py-3.5
            ">
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span className="min-w-0 whitespace-nowrap text-center">{t("primaryCta")}</span>
              </span>
            </button>

            <button className="
              bg-white dark:bg-[rgba(0,208,178,0.06)]
              text-black dark:text-white
              border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)]
              w-full min-w-0 justify-center
              px-4 py-3 rounded-xl
              text-[0.82rem] leading-tight font-medium font-[inherit]
              flex items-center gap-2 cursor-pointer
              backdrop-blur-sm
              duration-200
              ripple-button
              sm:w-auto sm:px-6.5 sm:py-3.5 sm:text-[0.9rem]
            ">
              <svg className="text-black dark:text-white" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="min-w-0 whitespace-nowrap text-center text-black dark:text-white">{t("secondaryCta")}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="
            fade-up-5
            flex justify-center gap-12
            mt-16 pt-8
            border-t border-[rgba(0,208,178,0.14)] dark:border-[rgba(0,208,178,0.1)]
            w-full
          ">
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
          </div>

        </div>{/* end content */}

        {/* ── SCROLL INDICATOR ── */}
        <div className="scroll-indicator flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase text-[oklch(0.708_0_0)] dark:text-[oklch(0.556_0_0)]">
            {t("scroll")}
          </span>
          <div
            className="w-px h-7"
            style={{ background: "linear-gradient(to bottom, color-mix(in srgb, #00D0B2 40%, transparent), transparent)" }}
          />
        </div>

      </section>
    </>
  );
}
