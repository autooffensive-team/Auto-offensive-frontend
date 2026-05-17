'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   PLASMA WAVE — WebGL shader background
───────────────────────────────────────────────────────────────────────────── */
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

function plasmaHexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

interface PlasmaSideCanvasProps {
  isDark: boolean;
  side: 'left' | 'right';
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

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (roRef.current) roRef.current.disconnect();

    const gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: false,
      antialias: false, depth: false, preserveDrawingBuffer: false,
    });

    if (!gl) { setUseFallback(true); return; }

    setUseFallback(false);
    glRef.current = gl;

    const compileShader = (type: number, src: string): WebGLShader | null => {
      const s = gl.createShader(type);
      if (!s) { setUseFallback(true); return null; }
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        setUseFallback(true); gl.deleteShader(s); return null;
      }
      return s;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, PLASMA_VERT);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, PLASMA_FRAG);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) {
      setUseFallback(true);
      gl.deleteShader(vertShader); gl.deleteShader(fragShader); return;
    }
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setUseFallback(true);
      gl.deleteProgram(prog); gl.deleteShader(vertShader); gl.deleteShader(fragShader); return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    if (!buf) {
      setUseFallback(true);
      gl.deleteProgram(prog); gl.deleteShader(vertShader); gl.deleteShader(fragShader); return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u: Record<string, WebGLUniformLocation | null> = {};
    ['iTime','iResolution','uFocalLength','uSpeed1','uSpeed2','uDir2','uBend1','uBend2','uColor1','uColor2']
      .forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });

    const dir2 = side === 'right' ? -1.0 : 1.0;
    if (u.uFocalLength) gl.uniform1f(u.uFocalLength, 0.75);
    if (u.uSpeed1)      gl.uniform1f(u.uSpeed1, 0.035);
    if (u.uSpeed2)      gl.uniform1f(u.uSpeed2, 0.04);
    if (u.uDir2)        gl.uniform1f(u.uDir2, dir2);
    if (u.uBend1)       gl.uniform1f(u.uBend1, 1.3);
    if (u.uBend2)       gl.uniform1f(u.uBend2, 0.8);
    if (u.uColor1)      gl.uniform3fv(u.uColor1, plasmaHexToRgb('#00ffe0'));
    if (u.uColor2)      gl.uniform3fv(u.uColor2, plasmaHexToRgb('#0070ff'));

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
        canvas.width = w; canvas.height = h;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
      if (glRef.current) {
        glRef.current.viewport(0, 0, w, h);
        if (u.iResolution) glRef.current.uniform2f(u.iResolution, w, h);
      }
    };

    resize();
    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(canvas.parentElement!);

    const start = performance.now();
    const to = timeOffset;

    const draw = (now: number) => {
      if (!glRef.current) return;
      const ggl = glRef.current;
      if (u.iTime) ggl.uniform1f(u.iTime, (now - start) * 0.001 + to);
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
      setResetToken((c) => c + 1);
    };
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    canvas.addEventListener('webglcontextrestored', handleContextRestore);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (roRef.current) roRef.current.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      canvas.removeEventListener('webglcontextrestored', handleContextRestore);
      if (glRef.current === gl) glRef.current = null;
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, [side, timeOffset, resetToken]);

  const maskImage =
    side === 'left'
      ? 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)'
      : 'linear-gradient(to left,  rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.3) 70%, transparent 100%)';

  return (
    <>
      {useFallback ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1, opacity: isDark ? 0.95 : 0.75,
            WebkitMaskImage: maskImage, maskImage,
            background:
              side === 'left'
                ? 'radial-gradient(circle at 0% 50%, rgba(0,255,224,0.36) 0%, rgba(0,112,255,0.28) 28%, rgba(0,112,255,0.14) 48%, transparent 72%)'
                : 'radial-gradient(circle at 100% 50%, rgba(0,255,224,0.36) 0%, rgba(0,112,255,0.28) 28%, rgba(0,112,255,0.14) 48%, transparent 72%)',
            filter: 'blur(14px)',
          }}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: useFallback ? 0 : isDark ? 0.8 : 0.44,
          WebkitMaskImage: maskImage, maskImage,
          display: 'block',
        }}
      />
    </>
  );
}

export function PlasmaSides({ isDark }: { isDark: boolean }) {
  return (
    <>
      <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ zIndex: 1, width: '40%' }}>
        <PlasmaSideCanvas isDark={isDark} side="left" timeOffset={0} />
      </div>
      <div className="absolute inset-y-0 right-0 pointer-events-none" style={{ zIndex: 1, width: '40%' }}>
        <PlasmaSideCanvas isDark={isDark} side="right" timeOffset={3.5} />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOT GRID — Interactive canvas dot grid with mouse interaction
───────────────────────────────────────────────────────────────────────────── */
export function DotGrid({ isDark }: { isDark: boolean }) {
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = window.devicePixelRatio;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr; canvas.height = height * dpr;
        canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        buildGrid(width, height);
      }
    };

    resize();
    roRef.current = new ResizeObserver(resize);
    roRef.current.observe(canvas.parentElement!);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener('mousemove', onMove);
    canvas.parentElement?.addEventListener('mouseleave', onLeave);

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
            dotColor = 'rgba(148,158,172,0.32)';
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
            dotColor = 'rgba(110,118,128,0.38)';
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
      if (roRef.current) roRef.current.disconnect();
      window.removeEventListener('mousemove', onMove);
      canvas.parentElement?.removeEventListener('mouseleave', onLeave);
    };
  }, [buildGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2, display: 'block' }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HERO BACKGROUND — Composite component combining all background layers
   Use this in your hero sections to get the full plasma + dot grid effect.
───────────────────────────────────────────────────────────────────────────── */
export interface HeroBackgroundProps {
  isDark: boolean;
  /** Override the radial gradient style. If not provided, uses the default. */
  gradientStyle?: React.CSSProperties;
  /** Override the center zone fade style. If not provided, uses the default. */
  centerZoneStyle?: React.CSSProperties;
  /** Override the bottom fade style. If not provided, uses the default. */
  bottomFadeStyle?: React.CSSProperties;
}

export function HeroBackground({
  isDark,
  gradientStyle,
  centerZoneStyle,
  bottomFadeStyle,
}: HeroBackgroundProps) {
  const defaultGradientStyle: React.CSSProperties = gradientStyle ?? {
    background: isDark
      ? 'radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.06) 0%, transparent 70%)'
      : 'radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.04) 0%, transparent 70%)',
  };

  const defaultCenterZoneStyle: React.CSSProperties = centerZoneStyle ?? {
    zIndex: 3,
    background: isDark
      ? 'linear-gradient(to right, transparent 0%, rgba(17,17,19,0.0) 28%, rgba(17,17,19,0.55) 42%, rgba(17,17,19,0.55) 58%, rgba(17,17,19,0.0) 72%, transparent 100%)'
      : 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.0) 28%, rgba(255,255,255,0.60) 42%, rgba(255,255,255,0.60) 58%, rgba(255,255,255,0.0) 72%, transparent 100%)',
  };

  const defaultBottomFadeStyle: React.CSSProperties = bottomFadeStyle ?? {
    zIndex: 4,
    background: isDark
      ? 'linear-gradient(to bottom, transparent, rgba(17,17,19,0.8))'
      : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))',
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Radial gradient ambient */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={defaultGradientStyle}
      />

      {/* Plasma wave wings */}
      <PlasmaSides isDark={isDark} />

      {/* Interactive dot grid */}
      <DotGrid isDark={isDark} />

      {/* Centre fade — keeps content readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={defaultCenterZoneStyle}
      />

      {/* Bottom fade into page bg */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={defaultBottomFadeStyle}
      />
    </div>
  );
}
