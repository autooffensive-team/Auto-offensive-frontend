"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";

import {
  GitBranch,
  Terminal,
  FileText,
  Search,
  Bug,
  Zap,
  ClipboardList,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";

/* ─── Plasma Wave GLSL ───────────────────────────────────────────────────── */
const PLASMA_VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const PLASMA_FRAG = /* glsl */ `
precision mediump float;
uniform float iTime;
uniform vec2  iResolution;
uniform float uFocalLength;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform vec3  uColor1;
uniform vec3  uColor2;

const float lt   = 0.3;
const float pi   = 3.14159;
const float pi2  = 6.28318;
const float pi_2 = 1.5708;
#define MAX_STEPS 14

void mainImage(out vec4 C, in vec2 U) {
  float t = iTime * pi;
  float s = 1.0;
  float d = 0.0;
  vec2  R = iResolution;
  vec3 o = vec3(0.0, 0.0, -7.0);
  vec3 u = normalize(vec3((U - 0.5 * R) / R.y, uFocalLength));
  vec2 k = vec2(0.0);
  vec3 p;
  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;
  for (int i = 0; i < MAX_STEPS; ++i) {
    p = o + u * d;
    p.x -= 15.0;
    float px = p.x;
    float wob1 = uBend1 + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + cos(t2 + px * 1.1) * 0.1;
    float px2 = px + pi_2;
    vec2 sinOffset = sin(vec2(px, px2) + tSpeed1) * wob1;
    vec2 cosOffset = cos(vec2(px, px2) + tSpeed2) * wob2;
    vec2 yz = p.yz;
    float pxLt = px + lt;
    k.x = max(pxLt, length(yz - sinOffset) - lt);
    k.y = max(pxLt, length(yz - cosOffset) - lt);
    float current = min(k.x, k.y);
    s = min(s, current);
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }
  float sqrtD = sqrt(d);
  vec3 raw = max(cos(d * pi2) - s * sqrtD - vec3(k, 0.0), 0.0);
  raw.gb += 0.1;
  float maxC = max(raw.r, max(raw.g, raw.b));
  if (maxC < 0.15) discard;
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));
  float w1 = max(0.0, 1.0 - k.x * 2.0);
  float w2 = max(0.0, 1.0 - k.y * 2.0);
  float wt = w1 + w2 + 0.001;
  vec3 c = (uColor1 * w1 + uColor2 * w2) / wt * lum * 3.5;
  C = vec4(c, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

/* ─── Plasma Side Canvas (one instance per side) ────────────────────────── */
interface PlasmaSideCanvasProps {
  isDark: boolean;
  side: "left" | "right";
  timeOffset?: number;
}

function PlasmaSideCanvas({ isDark, side, timeOffset = 0 }: PlasmaSideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafRef = useRef<number>(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (roRef.current) {
      roRef.current.disconnect();
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      setUseFallback(true);
      return;
    }

    setUseFallback(false);
    glRef.current = gl;

    const compileShader = (type: number, src: string): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) {
        setUseFallback(true);
        return null;
      }
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        setUseFallback(true);
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, PLASMA_VERT);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, PLASMA_FRAG);

    if (!vertShader || !fragShader) {
      return;
    }

    const prog = gl.createProgram();
    if (!prog) {
      setUseFallback(true);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setUseFallback(true);
      gl.deleteProgram(prog);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    if (!buf) {
      setUseFallback(true);
      gl.deleteProgram(prog);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u: Record<string, WebGLUniformLocation | null> = {};
    [
      "iTime",
      "iResolution",
      "uFocalLength",
      "uSpeed1",
      "uSpeed2",
      "uDir2",
      "uBend1",
      "uBend2",
      "uColor1",
      "uColor2",
    ].forEach((n) => {
      u[n] = gl.getUniformLocation(prog, n);
    });

    const dir2 = side === "right" ? -1.0 : 1.0;
    if (u.uFocalLength) gl.uniform1f(u.uFocalLength, 0.75);
    if (u.uSpeed1) gl.uniform1f(u.uSpeed1, 0.035);
    if (u.uSpeed2) gl.uniform1f(u.uSpeed2, 0.04);
    if (u.uDir2) gl.uniform1f(u.uDir2, dir2);
    if (u.uBend1) gl.uniform1f(u.uBend1, 1.3);
    if (u.uBend2) gl.uniform1f(u.uBend2, 0.8);
    if (u.uColor1) gl.uniform3fv(u.uColor1, hexToRgb("#00ffe0"));
    if (u.uColor2) gl.uniform3fv(u.uColor2, hexToRgb("#0070ff"));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = rect.width * dpr;
      const h = rect.height * dpr;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        if (glRef.current) {
          glRef.current.viewport(0, 0, w, h);
          if (u.iResolution) {
            glRef.current.uniform2f(u.iResolution, w, h);
          }
        }
      }
    };

    // Initial resize
    resize();

    // ResizeObserver for responsive resizing
    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(canvas.parentElement);

    const start = performance.now();
    const to = timeOffset;

    const draw = (now: number) => {
      if (!glRef.current) return;

      const ggl = glRef.current;
      if (u.iTime) {
        ggl.uniform1f(u.iTime, (now - start) * 0.001 + to);
      }

      ggl.clearColor(0, 0, 0, 0);
      ggl.clear(ggl.COLOR_BUFFER_BIT);
      ggl.drawArrays(ggl.TRIANGLES, 0, 3);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(rafRef.current);
    };

    const handleContextRestore = () => {
      setResetToken((current) => current + 1);
    };

    canvas.addEventListener("webglcontextlost", handleContextLoss);
    canvas.addEventListener("webglcontextrestored", handleContextRestore);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (roRef.current) {
        roRef.current.disconnect();
      }
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
      canvas.removeEventListener("webglcontextrestored", handleContextRestore);
      if (glRef.current === gl) {
        glRef.current = null;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, [side, timeOffset, resetToken]);

  const maskImage =
    side === "left"
      ? "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)"
      : "linear-gradient(to left,  rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)";

  return (
    <>
      {useFallback ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            opacity: isDark ? 0.95 : 0.75,
            WebkitMaskImage: maskImage,
            maskImage,
            background:
              side === "left"
                ? "radial-gradient(circle at 0% 50%, rgba(0,255,224,0.36) 0%, rgba(0,112,255,0.28) 28%, rgba(0,112,255,0.14) 48%, transparent 72%)"
                : "radial-gradient(circle at 100% 50%, rgba(0,255,224,0.36) 0%, rgba(0,112,255,0.28) 28%, rgba(0,112,255,0.14) 48%, transparent 72%)",
            filter: "blur(14px)",
          }}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: useFallback ? 0 : isDark ? 0.8 : 0.44,
          WebkitMaskImage: maskImage,
          maskImage,
          display: "block",
        }}
      />
    </>
  );
}

/* ─── Left + Right plasma wings ─────────────────────────────────────────── */
function PlasmaSides({ isDark }: { isDark: boolean }) {
  return (
    <>
      <div
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{ zIndex: 1, width: "40%" }}
      >
        <PlasmaSideCanvas isDark={isDark} side="left" timeOffset={0} />
      </div>

      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{ zIndex: 1, width: "40%" }}
      >
        <PlasmaSideCanvas isDark={isDark} side="right" timeOffset={3.5} />
      </div>
    </>
  );
}

/* ─── Dot Grid Component ─────────────────────────────────────────────────── */
function DotGrid({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dotsRef = useRef<
    { ox: number; oy: number; x: number; y: number; vx: number; vy: number }[]
  >([]);
  const rafRef = useRef<number>(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const GAP = 22;
  const DOT_SIZE = 1.5;
  const PROXIMITY = 140;
  const SHOCK_RADIUS = 270;
  const SHOCK_STRENGTH = 5.5;
  const RESISTANCE = 0.87;
  const RETURN_SPEED = 0.058;

  const buildGrid = useCallback((w: number, h: number) => {
    const dots: typeof dotsRef.current = [];
    const cols = Math.ceil(w / GAP) + 2;
    const rows = Math.ceil(h / GAP) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * GAP;
        const oy = r * GAP;
        dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0,
      height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.scale(dpr, dpr);
        buildGrid(width, height);
      }
    };

    resize();

    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(canvas.parentElement);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMove);
    canvas.parentElement?.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dark = isDarkRef.current;

      for (const d of dotsRef.current) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SHOCK_RADIUS) {
          const force = (1 - dist / SHOCK_RADIUS) * SHOCK_STRENGTH;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          d.vx += nx * force;
          d.vy += ny * force;
        }

        d.vx += (d.ox - d.x) * RETURN_SPEED;
        d.vy += (d.oy - d.y) * RETURN_SPEED;
        d.vx *= RESISTANCE;
        d.vy *= RESISTANCE;
        d.x += d.vx;
        d.y += d.vy;

        const proximity = Math.max(0, 1 - dist / PROXIMITY);
        const size = DOT_SIZE + proximity * 0.6;
        let dotColor: string;

        if (dark) {
          if (proximity > 0) {
            const alpha = 0.45 + proximity * 0.55;
            const blend = Math.sin(d.ox * 0.02 + d.oy * 0.015) * 0.5 + 0.5;
            const r = Math.round(blend * 0 + (1 - blend) * 0);
            const g = Math.round(blend * 255 + (1 - blend) * 112);
            const b = Math.round(blend * 224 + (1 - blend) * 255);
            dotColor = `rgba(${r},${g},${b},${alpha})`;
          } else {
            dotColor = "rgba(148,158,172,0.32)";
          }
        } else {
          if (proximity > 0) {
            const alpha = 0.35 + proximity * 0.65;
            const blend = Math.sin(d.ox * 0.02 + d.oy * 0.015) * 0.5 + 0.5;
            const r = Math.round(blend * 0 + (1 - blend) * 0);
            const g = Math.round(blend * 208 + (1 - blend) * 80);
            const b = Math.round(blend * 178 + (1 - blend) * 200);
            dotColor = `rgba(${r},${g},${b},${alpha})`;
          } else {
            dotColor = "rgba(110,118,128,0.38)";
          }
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (roRef.current) {
        roRef.current.disconnect();
      }
      window.removeEventListener("mousemove", onMove);
      canvas.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, [buildGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2, display: "block" }}
    />
  );
}

/* ─── Types ─────────────────────────────────────── */
interface WorkflowStep {
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgDark: string;
  step: number;
}

/* ─── Data ───────────────────────────────────────── */
const workflowSteps: WorkflowStep[] = [
  {
    icon: <Search className="w-6 h-6" />,
    color: "text-[#00BCA1]",
    bgLight: "bg-emerald-50 border-emerald-200",
    bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800",
    step: 1,
  },
  {
    icon: <Bug className="w-6 h-6" />,
    color: "text-red-500",
    bgLight: "bg-red-50 border-red-200",
    bgDark: "dark:bg-red-950/40 dark:border-red-800",
    step: 2,
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "text-violet-500",
    bgLight: "bg-violet-50 border-violet-200",
    bgDark: "dark:bg-violet-950/40 dark:border-violet-800",
    step: 3,
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    color: "text-blue-500",
    bgLight: "bg-blue-50 border-blue-200",
    bgDark: "dark:bg-blue-950/40 dark:border-blue-800",
    step: 4,
  },
];

/* ─── Animation Variants ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg
      bg-[#F2EFE7] dark:bg-[#111113] text-[#52525B] dark:text-[#A1A1AA]
      border border-[#E2DDD5] dark:border-white/10 transition-colors duration-300">
      {children}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function PlatformCapabilities() {
  const t = useTranslations("featuresPage");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const descriptionTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";
  const sectionTitleFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const sectionDescriptionFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), sans-serif";
  const sectionDescriptionClass =
    "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.7]";
  const primaryButtonClass =
    "group inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] sm:text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const secondaryButtonClass =
    "group inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] sm:text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const docsButtonClass =
    "group relative inline-flex h-[2.55em] w-fit items-center justify-start overflow-hidden rounded-xl border border-[#E2DDD5] bg-white px-[0.95em] pr-[2.2em] text-[13px] font-semibold text-[#01509E] transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-px hover:border-[#01509E] hover:bg-[#01509E] hover:text-white dark:border-white/10 dark:bg-[#111113] dark:text-[#7AAEF7] dark:hover:border-[#00BCA1] dark:hover:bg-[#00BCA1] dark:hover:text-[#09090B] sm:h-[2.8em] sm:px-[1.2em] sm:pr-[3.3em]";
  const docsButtonIconClass =
    "pointer-events-none absolute right-[0.25em] top-1/2 z-0 flex h-[1.75em] w-[1.75em] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[0.55em] bg-[#01509E] text-white transition-[width,transform,background-color,color] duration-300 group-hover:w-[calc(100%-0.45em)] group-hover:bg-[#01509E] group-hover:text-white dark:bg-[#7AAEF7] dark:text-[#09090B] dark:group-hover:w-[calc(100%-0.45em)] dark:group-hover:bg-[#00BCA1] dark:group-hover:text-[#09090B] sm:right-[0.3em] sm:h-[2.2em] sm:w-[2.2em] sm:rounded-[0.7em] sm:group-hover:w-[calc(100%-0.6em)]";

  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const reportRef = useRef(null);
  const workflowRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-100px" });
  const reportInView = useInView(reportRef, { once: true, margin: "-100px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-100px" });

  const gradientStyle = useMemo(
    () => ({
      background: isDark
        ? "radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.06) 0%, transparent 70%)"
        : "radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.04) 0%, transparent 70%)",
    }),
    [isDark]
  );

  const centerZoneStyle = useMemo(
    () => ({
      zIndex: 3 as const,
      background: isDark
        ? "linear-gradient(to right, transparent 0%, rgba(17,17,19,0.0) 28%, rgba(17,17,19,0.55) 42%, rgba(17,17,19,0.55) 58%, rgba(17,17,19,0.0) 72%, transparent 100%)"
        : "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.0) 28%, rgba(255,255,255,0.60) 42%, rgba(255,255,255,0.60) 58%, rgba(255,255,255,0.0) 72%, transparent 100%)",
    }),
    [isDark]
  );

  const bottomFadeStyle = useMemo(
    () => ({
      zIndex: 4 as const,
      background: isDark
        ? "linear-gradient(to bottom, transparent, rgba(17,17,19,0.8))"
        : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))",
    }),
    [isDark]
  );

  const aiStats = [
    { label: t("grid.ai.stats.threats"), val: "12.4K" },
    { label: t("grid.ai.stats.accuracy"), val: "99.1%" },
  ];

  const moduleCards = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      iconBg: "bg-[#EAF1EC] dark:bg-white/5 border-[#D9F4EF] dark:border-white/10",
      iconColor: "text-[#01509E] dark:text-[#7AAEF7]",
      title: t("grid.cards.sast.title"),
      desc: t("grid.cards.sast.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-[#01509E] dark:text-[#7AAEF7]",
      badge: t("grid.cards.sast.badge"),
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      iconBg: "bg-[#F2EFE7] dark:bg-white/5 border-[#E2DDD5] dark:border-white/10",
      iconColor: "text-[#52525B] dark:text-[#D1D5DB]",
      title: t("grid.cards.cli.title"),
      desc: t("grid.cards.cli.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-[#01509E] dark:text-[#7AAEF7]",
      badge: t("grid.cards.cli.badge"),
    },
  ];

  const reportTags = [
    t("report.tags.executiveOverview"),
    t("report.tags.technicalDeepDive"),
    t("report.tags.developerPatchNotes"),
  ];

  return (
    <div
      className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300"
      style={{ fontFamily: bodyFontFamily }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION — with Dot Grid + Plasma Wave background
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 bg-white dark:bg-[#111113] transition-colors duration-300 overflow-hidden"
      >
        {/* ── Animated Background Layers ── */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
            style={gradientStyle}
          />

          <PlasmaSides isDark={isDark} />

          <DotGrid isDark={isDark} />

          <div
            className="absolute inset-0 pointer-events-none"
            style={centerZoneStyle}
          />

          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={bottomFadeStyle}
          />
        </div>

        {/* ── Hero Content ── */}
        <div
          className="relative mx-auto flex min-h-[58vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16"
          style={{ zIndex: 10 }}
        >
          <div className="relative w-full max-w-4xl text-center px-2">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white transition-colors duration-300"
              style={{ fontFamily: displayFontFamily, fontWeight: 700 }}
            >
              {t("hero.titleLine1")}
              <br />
              <span className="text-[#00BCA1] dark:text-[#7CE5D4] transition-colors duration-300">
                {t("hero.titleLine2")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={2}
              className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-10 max-w-2xl mx-auto transition-colors duration-300`}
            >
              {t("hero.subtitle")}
              <br />
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={3}
              className="flex w-full flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4"
            >
              <button
                className={`${primaryButtonClass} min-w-0 flex-1 whitespace-nowrap px-3 py-2.5 sm:flex-none sm:px-3.5 sm:py-2.5 bg-[#00BCA1] text-white hover:bg-[#0AAE98]`}
              >
                <span className="sm:hidden">Start Scanning</span>
                <span className="hidden sm:inline">{t("hero.primaryCta")}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                className={`${secondaryButtonClass} min-w-0 flex-1 whitespace-nowrap px-3 py-2.5 sm:flex-none sm:px-3.5 sm:py-2.5 bg-[#F7F5F0] text-slate-900 border-[#E2DDD5] hover:bg-[#EFE9DE] hover:border-[#CFC7BA] dark:bg-[#09090B] dark:text-slate-100 dark:border-white/10 dark:hover:bg-[#151A18] dark:hover:border-white/20`}
              >
                <span className="sm:hidden">Read the Docs</span>
                <span className="hidden sm:inline">{t("hero.secondaryCta")}</span>
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom Half - Features Grid ── */}
      <section
        ref={gridRef}
        className="relative py-12 sm:py-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className="text-3xl font-bold text-[#18181B] dark:text-white mb-3 transition-colors duration-300"
            style={{ fontFamily: sectionTitleFontFamily }}
          >
            Comprehensive Security Toolkit
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={`${sectionDescriptionClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl transition-colors duration-300`}
            style={{ fontFamily: sectionDescriptionFontFamily }}
          >
            {t("grid.sectionSubtitle")}
          </motion.p>
        </div>

        {/* Feature Rows */}
        <div className="flex flex-col gap-0 mb-0">
          {/* Web Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={0}
            className={[
              "relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]",
              "ml-4 rounded-r-[28px] border-y border-r border-[#E2DDD5] dark:border-white/10 md:ml-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/document/card_icon_web_automation_dark.webp"
                  alt="Web-Based Pentesting Automation"
                  width={720}
                  height={520}
                  className="w-full max-w-82.5 md:max-w-95 h-auto object-contain"
                />
              </div>
            </div>

            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.web.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.web.desc")}
              </p>
              <a href="#" className={docsButtonClass}>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">
                  {t("common.viewDocumentation")}
                </span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </motion.div>

          {/* AI Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className={[
              "relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "mr-4 rounded-l-[28px] border-y border-l border-[#E2DDD5] dark:border-white/10 md:mr-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.ai.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#4B5563] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.ai.desc")}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs">
                {aiStats.map((s, idx) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0 }}
                    animate={gridInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="rounded-lg bg-white dark:bg-[#111113] px-4 py-3
                      border border-[#E2DDD5] dark:border-white/10 transition-colors duration-300"
                  >
                    <div className="text-xl font-bold text-[#18181B] dark:text-white transition-colors duration-300">
                      {s.val}
                    </div>
                    <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1 transition-colors duration-300">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <a href="#" className={docsButtonClass}>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">
                  {t("common.viewDocumentation")}
                </span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_ai_analysis_dark.webp"
                  alt="AI-Powered Security Analysis"
                  className="w-full max-w-75 md:max-w-87.5 h-auto object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Modules */}
        <div className="flex flex-col gap-0">
          {/* SAST Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={[
              "relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "ml-4 rounded-r-[28px] border-y border-r border-[#E2DDD5] dark:border-white/10 md:ml-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_sast_dark.webp"
                  alt="Repository Scanning SAST"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>

            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {moduleCards[0].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {moduleCards[0].desc}
              </p>
              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6 transition-colors duration-300">
                {moduleCards[0].badge}
              </div>
              <a href="#" className={docsButtonClass}>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">
                  {moduleCards[0].link}
                </span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </motion.div>

          {/* CLI Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={3}
            className={[
              "relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "mr-4 rounded-l-[28px] border-y border-l border-[#E2DDD5] dark:border-white/10 md:mr-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {moduleCards[1].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {moduleCards[1].desc}
              </p>
              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6 transition-colors duration-300">
                {moduleCards[1].badge}
              </div>
              <a href="#" className={docsButtonClass}>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">
                  {moduleCards[1].link}
                </span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_cli_api_dark.webp"
                  alt="Managed CLI & API"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI Reporting Section ── */}
      <section ref={reportRef} className="relative px-4 sm:px-8 lg:px-10 py-16 max-w-7xl mx-auto">
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={reportInView ? "visible" : "hidden"}
          className="rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10
            bg-white dark:bg-[#111113] backdrop-blur-sm
            transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 sm:p-12 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#E2DDD5] dark:border-white/10 transition-colors duration-300">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl font-bold text-[#18181B] dark:text-white mb-6 leading-tight transition-colors duration-300"
              >
                {t("report.titleLine1")}
                <br />
                {t("report.titleLine2")}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={2}
                className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}
              >
                {t("report.desc")}
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={3}
                className="flex flex-wrap gap-2 mb-10"
              >
                {reportTags.map((tag) => (
                  <FeatureTag key={tag}>{tag}</FeatureTag>
                ))}
              </motion.div>

              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={4}
                className={`${primaryButtonClass} w-fit bg-[#00BCA1] text-white hover:bg-[#0AAE98] px-6`}
              >
                <FileText className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-px" />
                <span>{t("common.viewDocumentation")}</span>
              </motion.button>
            </div>

            <div className="relative flex items-center justify-center p-10 sm:p-12 lg:p-14
              bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300">
              <motion.div
                variants={fadeInScale}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                className="relative w-full h-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-52 sm:w-60 bg-white dark:bg-[#111113] rounded-xl shadow-xl
                    border border-[#E2DDD5] dark:border-white/10 p-6 relative z-10 transition-colors duration-300"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2
                    w-16 h-6 bg-amber-400 rounded-t-lg shadow-md transition-colors duration-300" />
                  <div className="flex justify-center mb-6 mt-2">
                    <Shield className="w-7 h-7 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
                  </div>
                  <div className="text-center text-xs font-bold text-slate-800 dark:text-white mb-6 tracking-wider uppercase transition-colors duration-300">
                    {t("report.cardTitle")}
                  </div>
                  <div className="flex items-end gap-2 justify-center mb-6 h-24">
                    {[32, 52, 40, 64, 44].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={reportInView ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                        style={{ height: h, transformOrigin: "bottom" }}
                        className={`w-3 rounded-sm ${
                          [
                            "bg-red-400",
                            "bg-emerald-400",
                            "bg-blue-400",
                            "bg-amber-400",
                            "bg-violet-400",
                          ][i]
                        }`}
                      />
                    ))}
                  </div>
                  {[85, 65, 75, 55].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2.5 transition-colors duration-300"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full
                    bg-emerald-500 flex items-center justify-center
                    shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-900 z-20 transition-colors duration-300"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -left-16 top-12 w-32 bg-white dark:bg-[#111113] rounded-lg
                    border border-[#E2DDD5] dark:border-white/10 shadow-lg p-4 transition-colors duration-300"
                >
                  <div className="text-[11px] font-semibold text-[#52525B] dark:text-[#A1A1AA] mb-2 transition-colors duration-300">
                    {t("report.criticalLabel")}
                  </div>
                  <div className="text-2xl font-bold text-red-500 mb-3">3</div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 bg-red-400/60 rounded-full" />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Workflow Section ── */}
      <section ref={workflowRef} className="relative px-4 sm:px-8 lg:px-10 py-16 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
            {t("workflow.title")}
          </h2>
          <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl mx-auto transition-colors duration-300`}>
            {t("workflow.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5
            bg-linear-to-r from-transparent via-[#D6D3D1] dark:via-white/10 to-transparent z-0 transition-colors duration-300" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                initial="hidden"
                animate={workflowInView ? "visible" : "hidden"}
                custom={i}
                className="rounded-xl p-8
                  bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10
                  transition-all duration-300 group text-center"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center
                    ${step.bgLight} ${step.bgDark} ${step.color}
                    transition-colors duration-300`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-sm font-bold text-[#D6D3D1] dark:text-[#404040] transition-colors duration-300">
                    0{step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#18181B] dark:text-white mb-3 transition-colors duration-300">
                  {t(`workflow.steps.${i}.title`)}
                </h3>
                <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed transition-colors duration-300`}>
                  {t(`workflow.steps.${i}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          custom={4}
          className="mt-12 flex flex-row flex-wrap items-center justify-center gap-4"
        >
          <button
            className={`${primaryButtonClass} bg-[#00BCA1] text-white hover:bg-[#0AAE98] px-6`}
          >
            <span>{t("workflow.primaryCta")}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <a
            href="/resources"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#52525B] dark:text-[#A1A1AA]
              transition-all duration-300 hover:-translate-y-0.5 hover:text-[#18181B] dark:hover:text-white"
          >
            <span>{t("workflow.secondaryCta")}</span>
            <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
