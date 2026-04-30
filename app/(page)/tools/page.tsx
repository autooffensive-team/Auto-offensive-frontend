'use client';

import { JSX, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, cubicBezier } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '@/components/theme-provider';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

/* ─────────────────────────────────────────────────────────────────────────────
   PLASMA WAVE — ported from PlatformCapabilities hero
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

function PlasmaSides({ isDark }: { isDark: boolean }) {
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
   DOT GRID — ported from PlatformCapabilities hero
───────────────────────────────────────────────────────────────────────────── */
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
   FAULTY TERMINAL — inlined (unchanged from original tools page)
───────────────────────────────────────────────────────────────────────────── */
type Vec2 = [number, number];
interface FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number; gridMul?: Vec2; digitSize?: number; timeScale?: number;
  pause?: boolean; scanlineIntensity?: number; glitchAmount?: number;
  flickerAmount?: number; noiseAmp?: number; chromaticAberration?: number;
  dither?: number | boolean; curvature?: number; tint?: string;
  mouseReact?: boolean; mouseStrength?: number; dpr?: number;
  pageLoadAnimation?: boolean; brightness?: number;
}
const _vertexShader = `attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;
const _fragmentShader = `precision mediump float;varying vec2 vUv;uniform float iTime;uniform vec3 iResolution;uniform float uScale;uniform vec2 uGridMul;uniform float uDigitSize;uniform float uScanlineIntensity;uniform float uGlitchAmount;uniform float uFlickerAmount;uniform float uNoiseAmp;uniform float uChromaticAberration;uniform float uDither;uniform float uCurvature;uniform vec3 uTint;uniform vec2 uMouse;uniform float uMouseStrength;uniform float uUseMouse;uniform float uPageLoadProgress;uniform float uUsePageLoadAnimation;uniform float uBrightness;float time;float hash21(vec2 p){p=fract(p*234.56);p+=dot(p,p+34.56);return fract(p.x*p.y);}float noise(vec2 p){return sin(p.x*10.0)*sin(p.y*(3.0+sin(time*0.090909)))+0.2;}mat2 rotate(float angle){float c=cos(angle);float s=sin(angle);return mat2(c,-s,s,c);}float fbm(vec2 p){p*=1.1;float f=0.0;float amp=0.5*uNoiseAmp;mat2 m0=rotate(time*0.02);f+=amp*noise(p);p=m0*p*2.0;amp*=0.454545;mat2 m1=rotate(time*0.02);f+=amp*noise(p);p=m1*p*2.0;amp*=0.454545;mat2 m2=rotate(time*0.08);f+=amp*noise(p);return f;}float pattern(vec2 p,out vec2 q,out vec2 r){vec2 o1=vec2(1.0);vec2 o0=vec2(0.0);mat2 r01=rotate(0.1*time);mat2 r1=rotate(0.1);q=vec2(fbm(p+o1),fbm(r01*p+o1));r=vec2(fbm(r1*q+o0),fbm(q+o0));return fbm(p+r);}float digit(vec2 p){vec2 grid=uGridMul*15.0;vec2 s=floor(p*grid)/grid;p=p*grid;vec2 q,r;float intensity=pattern(s*0.1,q,r)*1.3-0.03;if(uUseMouse>0.5){vec2 mw=uMouse*uScale;float d=distance(s,mw);float mi=exp(-d*8.0)*uMouseStrength*10.0;intensity+=mi;float rip=sin(d*20.0-iTime*5.0)*0.1*mi;intensity+=rip;}if(uUsePageLoadAnimation>0.5){float cr=fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);float cd=cr*0.8;float cp=clamp((uPageLoadProgress-cd)/0.2,0.0,1.0);float fa=smoothstep(0.0,1.0,cp);intensity*=fa;}p=fract(p);p*=uDigitSize;float px5=p.x*5.0;float py5=(1.0-p.y)*5.0;float x=fract(px5);float y=fract(py5);float i=floor(py5)-2.0;float j=floor(px5)-2.0;float n=i*i+j*j;float f=n*0.0625;float isOn=step(0.1,intensity-f);float b=isOn*(0.2+y*0.8)*(0.75+x*0.25);return step(0.0,p.x)*step(p.x,1.0)*step(0.0,p.y)*step(p.y,1.0)*b;}float onOff(float a,float b,float c){return step(c,sin(iTime+a*cos(iTime*b)))*uFlickerAmount;}float displace(vec2 look){float y=look.y-mod(iTime*0.25,1.0);float window=1.0/(1.0+50.0*y*y);return sin(look.y*20.0+iTime)*0.0125*onOff(4.0,2.0,0.8)*(1.0+cos(iTime*60.0))*window;}vec3 getColor(vec2 p){float bar=step(mod(p.y+time*20.0,1.0),0.2)*0.4+1.0;bar*=uScanlineIntensity;float displacement=displace(p);p.x+=displacement;if(uGlitchAmount!=1.0){float extra=displacement*(uGlitchAmount-1.0);p.x+=extra;}float middle=digit(p);const float off=0.002;float sum=digit(p+vec2(-off,-off))+digit(p+vec2(0.0,-off))+digit(p+vec2(off,-off))+digit(p+vec2(-off,0.0))+digit(p+vec2(0.0,0.0))+digit(p+vec2(off,0.0))+digit(p+vec2(-off,off))+digit(p+vec2(0.0,off))+digit(p+vec2(off,off));vec3 baseColor=vec3(0.9)*middle+sum*0.1*vec3(1.0)*bar;return baseColor;}vec2 barrel(vec2 uv){vec2 c=uv*2.0-1.0;float r2=dot(c,c);c*=1.0+uCurvature*r2;return c*0.5+0.5;}void main(){time=iTime*0.333333;vec2 uv=vUv;if(uCurvature!=0.0){uv=barrel(uv);}vec2 p=uv*uScale;vec3 col=getColor(p);if(uChromaticAberration!=0.0){vec2 ca=vec2(uChromaticAberration)/iResolution.xy;col.r=getColor(p+ca).r;col.b=getColor(p-ca).b;}col*=uTint;col*=uBrightness;if(uDither>0.0){float rnd=hash21(gl_FragCoord.xy);col+=(rnd-0.5)*(uDither*0.003922);}gl_FragColor=vec4(col,1.0);}`;
function _hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}
function FaultyTerminal({
  scale = 1, gridMul = [2, 1] as Vec2, digitSize = 1.5, timeScale = 0.3,
  pause = false, scanlineIntensity = 0.3, glitchAmount = 1, flickerAmount = 1,
  noiseAmp = 1, chromaticAberration = 0, dither = 0, curvature = 0.2,
  tint = '#ffffff', mouseReact = true, mouseStrength = 0.2,
  dpr = (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1),
  pageLoadAnimation = true, brightness = 1, className, style, ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const loadAnimationStartRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(Math.random() * 100);
  const tintVec = useMemo(() => _hexToRgb(tint), [tint]);
  const ditherValue = useMemo(() => (typeof dither === 'boolean' ? (dither ? 1 : 0) : dither), [dither]);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ctn = containerRef.current; if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: 1 - (e.clientY - rect.top) / rect.height };
  }, []);
  useEffect(() => {
    const ctn = containerRef.current; if (!ctn) return;
    const renderer = new Renderer({ dpr, alpha: true }); rendererRef.current = renderer;
    const gl = renderer.gl; gl.clearColor(0, 0, 0, 0);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: _vertexShader, fragment: _fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        uScale: { value: scale }, uGridMul: { value: new Float32Array(gridMul) },
        uDigitSize: { value: digitSize }, uScanlineIntensity: { value: scanlineIntensity },
        uGlitchAmount: { value: glitchAmount }, uFlickerAmount: { value: flickerAmount },
        uNoiseAmp: { value: noiseAmp }, uChromaticAberration: { value: chromaticAberration },
        uDither: { value: ditherValue }, uCurvature: { value: curvature },
        uTint: { value: new Color(tintVec[0], tintVec[1], tintVec[2]) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: mouseStrength }, uUseMouse: { value: mouseReact ? 1 : 0 },
        uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
        uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
        uBrightness: { value: brightness },
      }
    });
    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });
    function resize() {
      if (!ctn || !renderer) return;
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.iResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    const ro = new ResizeObserver(() => resize()); ro.observe(ctn); resize();
    const update = (t: number) => {
      rafRef.current = requestAnimationFrame(update);
      if (pageLoadAnimation && loadAnimationStartRef.current === 0) loadAnimationStartRef.current = t;
      if (!pause) { const elapsed = (t * 0.001 + timeOffsetRef.current) * timeScale; program.uniforms.iTime.value = elapsed; frozenTimeRef.current = elapsed; }
      else { program.uniforms.iTime.value = frozenTimeRef.current; }
      if (pageLoadAnimation && loadAnimationStartRef.current > 0) {
        program.uniforms.uPageLoadProgress.value = Math.min((t - loadAnimationStartRef.current) / 2000, 1);
      }
      if (mouseReact) {
        const sm = smoothMouseRef.current; const m = mouseRef.current;
        sm.x += (m.x - sm.x) * 0.08; sm.y += (m.y - sm.y) * 0.08;
        const mu = program.uniforms.uMouse.value as Float32Array; mu[0] = sm.x; mu[1] = sm.y;
      }
      renderer.render({ scene: mesh });
    };
    rafRef.current = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);
    if (mouseReact) ctn.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(rafRef.current); ro.disconnect();
      if (mouseReact) ctn.removeEventListener('mousemove', handleMouseMove);
      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      programRef.current = null;
      rendererRef.current = null;
      loadAnimationStartRef.current = 0; timeOffsetRef.current = Math.random() * 100;
    };
  }, [dpr, pause, timeScale, scale, gridMul, digitSize, scanlineIntensity, glitchAmount, flickerAmount, noiseAmp, chromaticAberration, ditherValue, curvature, tintVec, mouseReact, mouseStrength, pageLoadAnimation, brightness, handleMouseMove]);
  return <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className ?? ''}`} style={style} {...rest} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY HERO BACKGROUND (unchanged)
───────────────────────────────────────────────────────────────────────────── */
function CategoryHeroBackground({ tint }: { tint: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 opacity-[0.12] dark:opacity-20">
        <FaultyTerminal
          tint={tint}
          brightness={1}
          scale={3}
          digitSize={1.8}
          scanlineIntensity={0.12}
          glitchAmount={1.05}
          flickerAmount={0.25}
          noiseAmp={0.7}
          mouseReact={false}
          pageLoadAnimation={false}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS (unchanged)
───────────────────────────────────────────────────────────────────────────── */
const pageMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: cubicBezier(0.25, 0.46, 0.45, 0.94) } },
};

const listMotion = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: cubicBezier(0.25, 0.46, 0.45, 0.94) } },
};

const heroEyebrowTextClass = 'text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em]';
const heroTitleTextClass = 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.02] tracking-tight';
const heroDescriptionTextClass = 'text-base sm:text-lg lg:text-xl text-[#5C5C5C] dark:text-[#9A9A9A] max-w-xl leading-relaxed';
const heroStatTextClass = 'text-xs sm:text-sm font-semibold text-[#9A9A9A]';

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS (unchanged)
───────────────────────────────────────────────────────────────────────────── */
const icons: Record<string, () => JSX.Element> = {
  subfinder: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  naabu: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3V1M11 21V19M3 11H1M21 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  dnsx: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 14 7 14 11C14 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  assetfinder: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20 7.5V14.5L11 20L2 14.5V7.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  nmap: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 11L8 8L11 13L14 9L17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  nuclei: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 6V11C3 15.42 6.58 19.58 11 20.5C15.42 19.58 19 15.42 19 11V6L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 11L10 13L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wpscan: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11H15M11 7V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  sqli: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <ellipse cx="11" cy="7" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 7V11C4 12.66 7.13 14 11 14C14.87 14 18 12.66 18 11V7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 11V15C4 16.66 7.13 18 11 18C14.87 18 18 16.66 18 15V11" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  strike3ifr: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 18L9 13M9 13L15 4L18 7L9 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 7L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  urlfuzzer: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19M11 3C11 3 14 7 14 11C14 15 11 19 11 19M3 11H19" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  kitecrawler: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L19 8V14L11 19L3 14V8L11 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 3V19M3 8L19 14M19 8L3 14" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  httprobe: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M9 13L13 9M6 10L5 11C3.34 12.66 3.34 15.34 5 17C6.66 18.66 9.34 18.66 11 17L12 16M10 6L11 5C12.66 3.34 15.34 3.34 17 5C18.66 6.66 18.66 9.34 17 11L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  katana: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9L10 11L7 13M12 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gobuster: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="1.5" fill="currentColor"/>
    </svg>
  ),
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY STAT BAR (unchanged)
───────────────────────────────────────────────────────────────────────────── */
function CategoryStatBar({ tools }: { tools: { category: string }[] }) {
  const counts = { Recon: 0, Vuln: 0, Fuzzing: 0 }
  tools.forEach((t) => { if (t.category in counts) counts[t.category as keyof typeof counts]++ })
  const total = tools.length

  return (
    <div className="flex gap-1 h-1 rounded-full overflow-hidden w-full max-w-xs">
      <div className="bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${(counts.Recon / total) * 100}%` }} />
      <div className="bg-red-400 rounded-full transition-all duration-500" style={{ width: `${(counts.Vuln / total) * 100}%` }} />
      <div className="bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${(counts.Fuzzing / total) * 100}%` }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ToolsPage() {
  const t = useTranslations('toolsPage')
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = mounted && resolvedTheme === 'dark';

  useEffect(() => { setMounted(true); }, []);

  const isKhmer = locale === 'kh';
  const bodyFontFamily = isKhmer
    ? 'var(--font-noto-khmer), sans-serif'
    : 'var(--font-google-sans), var(--font-noto-khmer), sans-serif';
  const descriptionTextClass = 'text-[16px] md:text-[18px] lg:text-[20px]';
  const subtitleTextClass = 'text-[16px] md:text-[17px] lg:text-[18px]';

  /* Plasma gradient styles (match features page) */
  const gradientStyle = useMemo(
    () => ({
      background: isDark
        ? 'radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.06) 0%, transparent 70%)'
        : 'radial-gradient(ellipse 50% 60% at 10% 50%, rgba(0,208,178,0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 90% 50%, rgba(1,80,158,0.04) 0%, transparent 70%)',
    }),
    [isDark]
  );

  const centerZoneStyle = useMemo(
    () => ({
      zIndex: 3 as const,
      background: isDark
        ? 'linear-gradient(to right, transparent 0%, rgba(17,17,19,0.0) 28%, rgba(17,17,19,0.55) 42%, rgba(17,17,19,0.55) 58%, rgba(17,17,19,0.0) 72%, transparent 100%)'
        : 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.0) 28%, rgba(255,255,255,0.60) 42%, rgba(255,255,255,0.60) 58%, rgba(255,255,255,0.0) 72%, transparent 100%)',
    }),
    [isDark]
  );

  const bottomFadeStyle = useMemo(
    () => ({
      zIndex: 4 as const,
      background: isDark
        ? 'linear-gradient(to bottom, transparent, rgba(9,9,11,0.85))'
        : 'linear-gradient(to bottom, transparent, rgba(247,245,240,0.9))',
    }),
    [isDark]
  );

  const tools = [
    { id: 'subfinder',   name: 'Subfinder',     category: 'Recon',   description: t('items.subfinder'),   tags: ['subdomain', 'passive', 'dns'] },
    { id: 'naabu',       name: 'Naabu',         category: 'Recon',   description: t('items.naabu'),       tags: ['port-scan', 'network'] },
    { id: 'dnsx',        name: 'Dnsx',          category: 'Recon',   description: t('items.dnsx'),        tags: ['dns', 'resolver'] },
    { id: 'assetfinder', name: 'AssetFinder',   category: 'Recon',   description: t('items.assetfinder'), tags: ['subdomain', 'osint'] },
    { id: 'nmap',        name: 'Nmap',          category: 'Recon',   description: t('items.nmap'),        tags: ['network', 'port-scan'] },
    { id: 'nuclei',      name: 'Nuclei',        category: 'Vuln',    description: t('items.nuclei'),      tags: ['scanner', 'templates', 'yaml'], badge: t('popular') },
    { id: 'wpscan',      name: 'WPScan',        category: 'Vuln',    description: t('items.wpscan'),      tags: ['wordpress', 'cms'] },
    { id: 'sqli',        name: 'SQLi Detector', category: 'Vuln',    description: t('items.sqli'),        tags: ['sql', 'injection'] },
    { id: 'strike3ifr',  name: '3ifR Strike',   category: 'Vuln',    description: t('items.strike3ifr'),  tags: ['redteam', 'bypass'] },
    { id: 'urlfuzzer',   name: 'URL Fuzzer',    category: 'Fuzzing', description: t('items.urlfuzzer'),   tags: ['fuzzing', 'directory'] },
    { id: 'kitecrawler', name: 'Kitecrawler',   category: 'Fuzzing', description: t('items.kitecrawler'), tags: ['crawler', 'api'] },
    { id: 'httprobe',    name: 'Httprobe',      category: 'Fuzzing', description: t('items.httprobe'),    tags: ['http', 'probe'] },
    { id: 'katana',      name: 'Katana',        category: 'Fuzzing', description: t('items.katana'),      tags: ['crawler', 'js'] },
    { id: 'gobuster',    name: 'Gobuster',      category: 'Fuzzing', description: t('items.gobuster'),    tags: ['bruteforce', 'dns'] },
  ]

  const Icon = ({ id }: { id: string }) => {
    const Comp = icons[id]
    return Comp ? <Comp /> : null
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageMotion}
      className="min-h-screen mt-17 overflow-x-hidden bg-[#F7F5F0] dark:bg-[#09090B]"
      style={{ fontFamily: bodyFontFamily }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION — centered layout with image above, content below
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/8 transition-colors duration-300">

        {/* ── Animated Background Layers ── */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
            style={gradientStyle}
          />
          <PlasmaSides isDark={isDark} />
          <DotGrid isDark={isDark} />
          <div className="absolute inset-0 pointer-events-none" style={centerZoneStyle} />
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={bottomFadeStyle} />
        </div>

        {/* ── Hero Content — centered ── */}
        <div
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 flex flex-col items-center text-center gap-8"
          style={{ zIndex: 10 }}
        >
          {/* Image */}
          <div className="relative flex items-center justify-center">
            {/* Soft glow behind image */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 320, height: 320,
                background: 'radial-gradient(circle, rgba(0,188,161,0.18) 0%, transparent 70%)',
                filter: 'blur(32px)',
              }}
            />
            <img
              src="/document/glass_swiss_army_knife.webp"
              alt="Pentesting tools suite"
              className="relative z-10 w-44 sm:w-56 md:w-64 lg:w-72 object-contain
                         drop-shadow-[0_24px_64px_rgba(0,188,161,0.22)]
                         select-none"
              draggable={false}
            />
          </div>

          {/* Text block */}
          <div className="flex flex-col items-center gap-4 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-[#1A1A1A] dark:text-[#EDEDED]">
              {t('title')}
            </h1>
            <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] max-w-lg ${descriptionTextClass} leading-relaxed`}>
              {t('subtitle')}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <div className="flex items-center gap-5 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                  {t('categories.recon')} ({tools.filter(tool => tool.category === 'Recon').length})
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                  {t('categories.vuln')} ({tools.filter(tool => tool.category === 'Vuln').length})
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                  {t('categories.fuzzing')} ({tools.filter(tool => tool.category === 'Fuzzing').length})
                </span>
              </div>
            </div>
            <CategoryStatBar tools={tools} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-[#5C5C5C] dark:text-[#9A9A9A]">Explore by category</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={() => {
                  const element = document.getElementById('recon-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-5 py-3 rounded-xl text-sm font-semibold border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all shadow-sm hover:shadow-md"
              >
                Recon
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('vuln-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-5 py-3 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all shadow-sm hover:shadow-md"
              >
                Vulnerability
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('fuzzing-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-5 py-3 rounded-xl text-sm font-semibold border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-all shadow-sm hover:shadow-md"
              >
                Fuzzing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CATEGORY SECTIONS — all unchanged from original
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── RECON SECTION ── */}
      <div id="recon-section">
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#3B82F6" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-blue-400/8 blur-[140px] dark:bg-blue-600/25" />
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-blue-400/6 blur-[100px] dark:bg-blue-400/15" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-blue-400/7 blur-[150px] dark:bg-blue-500/20" />
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-blue-400/5 blur-[100px] dark:bg-blue-400/12" />
          </div>
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial="hidden" animate="visible" variants={pageMotion} className="flex flex-col gap-6 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className={`${heroEyebrowTextClass} text-blue-500 dark:text-blue-400`}>{t('categories.recon')}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className={`${heroTitleTextClass} text-[#1A1A1A] dark:text-[#EDEDED]`}>
                      Reconnaissance Tools
                    </h2>
                    <p className={heroDescriptionTextClass}>
                      {t('hero.reconDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`${heroStatTextClass} bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50 px-4 py-2 rounded-lg`}>
                      {tools.filter(t => t.category === 'Recon').length} tools
                    </span>
                  </div>
                </motion.div>
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <g key={`row-${i}`}>
                          <path
                            d={`M 0 ${(i + 1) * 50} Q 100 ${(i + 1) * 50 - 30} 200 ${(i + 1) * 50} T 400 ${(i + 1) * 50}`}
                            stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.4"
                          />
                        </g>
                      ))}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <g key={`col-${i}`}>
                          <path
                            d={`M ${(i + 1) * 50} 0 Q ${(i + 1) * 50 - 30} 100 ${(i + 1) * 50} 200 T ${(i + 1) * 50} 400`}
                            stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.4"
                          />
                        </g>
                      ))}
                      <circle cx="200" cy="200" r="60" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.6"/>
                      <circle cx="200" cy="200" r="40" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.4"/>
                      <circle cx="200" cy="200" r="20" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={listMotion} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.filter(tool => tool.category === 'Recon').map((tool) => (
              <motion.div key={tool.id} variants={cardMotion} className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl flex flex-col overflow-hidden hover:border-blue-400/40 hover:shadow-[0_4px_24px_0_rgba(96,165,250,0.08)] transition-all duration-200 cursor-pointer">
                <div className="h-0.5 w-full bg-blue-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                      <Icon id={tool.id} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {tool.badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1] text-white px-2.5 py-1 rounded-md">{tool.badge}</span>}
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {t('categories.recon')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className={`${subtitleTextClass} font-bold text-[#1A1A1A] dark:text-[#EDEDED] leading-snug`}>{tool.name}</h3>
                    <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed ${descriptionTextClass}`}>{tool.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-[11px] bg-[#F7F5F0] dark:bg-[#1A1A1A] border border-black/9 dark:border-white/9 text-[#5C5C5C] dark:text-[#9A9A9A] px-2 py-0.5 rounded-md font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-black/9 dark:border-white/9 bg-[#FAFAF9] dark:bg-[#0E0E10]">
                  <a href="#" className="text-blue-500 dark:text-blue-400 text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">
                    {t('primaryCta')}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── VULN SECTION ── */}
      <div id="vuln-section">
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#EF4444" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-red-400/8 blur-[140px] dark:bg-red-600/25" />
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-red-400/6 blur-[100px] dark:bg-red-400/15" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-red-400/7 blur-[150px] dark:bg-red-500/20" />
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-red-400/5 blur-[100px] dark:bg-red-400/12" />
          </div>
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial="hidden" animate="visible" variants={pageMotion} className="flex flex-col gap-6 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className={`${heroEyebrowTextClass} text-red-500 dark:text-red-400`}>{t('categories.vuln')}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className={`${heroTitleTextClass} text-[#1A1A1A] dark:text-[#EDEDED]`}>
                      Vulnerability Scanning
                    </h2>
                    <p className={heroDescriptionTextClass}>
                      {t('hero.vulnDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`${heroStatTextClass} bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800/50 px-4 py-2 rounded-lg`}>
                      {tools.filter(t => t.category === 'Vuln').length} tools
                    </span>
                  </div>
                </motion.div>
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05"/>
                        </radialGradient>
                      </defs>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <circle key={i} cx="200" cy="200" r={30 + i * 20}
                          fill="none" stroke="#EF4444" strokeWidth="1.5" opacity={0.5 - (i * 0.04)}
                        />
                      ))}
                      <circle cx="200" cy="200" r="6" fill="#EF4444" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial="hidden" animate="visible" variants={listMotion} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.filter(tool => tool.category === 'Vuln').map((tool) => (
              <motion.div key={tool.id} variants={cardMotion} className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl flex flex-col overflow-hidden hover:border-red-400/40 hover:shadow-[0_4px_24px_0_rgba(248,113,113,0.08)] transition-all duration-200 cursor-pointer">
                <div className="h-0.5 w-full bg-red-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/50 flex items-center justify-center text-red-500 dark:text-red-400 shrink-0">
                      <Icon id={tool.id} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {tool.badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1] text-white px-2.5 py-1 rounded-md">{tool.badge}</span>}
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                        {t('categories.vuln')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className={`${subtitleTextClass} font-bold text-[#1A1A1A] dark:text-[#EDEDED] leading-snug`}>{tool.name}</h3>
                    <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed ${descriptionTextClass}`}>{tool.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-[11px] bg-[#F7F5F0] dark:bg-[#1A1A1A] border border-black/9 dark:border-white/9 text-[#5C5C5C] dark:text-[#9A9A9A] px-2 py-0.5 rounded-md font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-black/9 dark:border-white/9 bg-[#FAFAF9] dark:bg-[#0E0E10]">
                  <a href="#" className="text-red-500 dark:text-red-400 text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">
                    {t('primaryCta')}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FUZZING SECTION ── */}
      <div id="fuzzing-section">
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#A855F7" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-purple-400/8 blur-[140px] dark:bg-purple-600/25" />
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-purple-400/6 blur-[100px] dark:bg-purple-400/15" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-purple-400/7 blur-[150px] dark:bg-purple-500/20" />
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-purple-400/5 blur-[100px] dark:bg-purple-400/12" />
          </div>
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial="hidden" animate="visible" variants={pageMotion} className="flex flex-col gap-6 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className={`${heroEyebrowTextClass} text-purple-500 dark:text-purple-400`}>{t('categories.fuzzing')}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className={`${heroTitleTextClass} text-[#1A1A1A] dark:text-[#EDEDED]`}>
                      Fuzzing & Discovery
                    </h2>
                    <p className={heroDescriptionTextClass}>
                      {t('hero.fuzzingDescription')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={`${heroStatTextClass} bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/50 px-4 py-2 rounded-lg`}>
                      {tools.filter(t => t.category === 'Fuzzing').length} tools
                    </span>
                  </div>
                </motion.div>
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path key={i}
                          d={`M 0 ${50 + i * 40} Q 50 ${50 + i * 40 - 20} 100 ${50 + i * 40} T 200 ${50 + i * 40} T 300 ${50 + i * 40} T 400 ${50 + i * 40}`}
                          stroke="#A855F7" strokeWidth="2" fill="none" opacity={0.6 - (i * 0.06)}
                        />
                      ))}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line key={`diag-${i}`} x1={i * 60} y1="0" x2={i * 60 + 400} y2="400"
                          stroke="#A855F7" strokeWidth="1" opacity="0.3"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-14">
          <motion.div initial="hidden" animate="visible" variants={listMotion} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.filter(tool => tool.category === 'Fuzzing').map((tool) => (
              <motion.div key={tool.id} variants={cardMotion} className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl flex flex-col overflow-hidden hover:border-purple-400/40 hover:shadow-[0_4px_24px_0_rgba(192,132,252,0.08)] transition-all duration-200 cursor-pointer">
                <div className="h-0.5 w-full bg-purple-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
                      <Icon id={tool.id} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {tool.badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1] text-white px-2.5 py-1 rounded-md">{tool.badge}</span>}
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {t('categories.fuzzing')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className={`${subtitleTextClass} font-bold text-[#1A1A1A] dark:text-[#EDEDED] leading-snug`}>{tool.name}</h3>
                    <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed ${descriptionTextClass}`}>{tool.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-[11px] bg-[#F7F5F0] dark:bg-[#1A1A1A] border border-black/9 dark:border-white/9 text-[#5C5C5C] dark:text-[#9A9A9A] px-2 py-0.5 rounded-md font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-black/9 dark:border-white/9 bg-[#FAFAF9] dark:bg-[#0E0E10]">
                  <a href="#" className="text-purple-500 dark:text-purple-400 text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">
                    {t('primaryCta')}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

    </motion.div>
  )
}