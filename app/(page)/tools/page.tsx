'use client';

import { JSX, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, cubicBezier } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '@/components/theme-provider';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { HeroBackground } from '@/components/shared/HeroBackground';
import {
  fetchCategories,
  type Category,
} from '@/lib/redux/services/tools-list/category-list';
import {
  fetchTools,
  type Tool,
} from '@/lib/redux/services/tools-list/tools-list';


/* ─────────────────────────────────────────────────────────────────────────────
   FAULTY TERMINAL — unchanged
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
   CATEGORY HERO BACKGROUND — unchanged
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
   ANIMATION VARIANTS — unchanged
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
   DYNAMIC TOOL ICON — replaces the static icons map
   Matches on tool_name string so any new tool auto-gets an icon
───────────────────────────────────────────────────────────────────────────── */
function ToolIcon({ name }: { name: string }): JSX.Element {
  const n = name.toLowerCase();
  if (n.includes('sub') || n.includes('finder') || n.includes('asset')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('naabu') || n.includes('port')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3V1M11 21V19M3 11H1M21 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('dns') || n.includes('resolv')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 14 7 14 11C14 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  if (n.includes('nmap')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 11L8 8L11 13L14 9L17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (n.includes('nuclei') || n.includes('vuln') || n.includes('scan')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 6V11C3 15.42 6.58 19.58 11 20.5C15.42 19.58 19 15.42 19 11V6L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 11L10 13L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (n.includes('wp') || n.includes('wordpress')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11H15M11 7V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('sql') || n.includes('inject')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <ellipse cx="11" cy="7" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 7V11C4 12.66 7.13 14 11 14C14.87 14 18 12.66 18 11V7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 11V15C4 16.66 7.13 18 11 18C14.87 18 18 16.66 18 15V11" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  if (n.includes('strike') || n.includes('3ifr')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 18L9 13M9 13L15 4L18 7L9 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 7L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('url') || n.includes('fuzz') || n.includes('dir')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19M11 3C11 3 14 7 14 11C14 15 11 19 11 19M3 11H19" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
  if (n.includes('kite') || n.includes('crawl') || n.includes('spider')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L19 8V14L11 19L3 14V8L11 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 3V19M3 8L19 14M19 8L3 14" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
  if (n.includes('http') || n.includes('probe')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M9 13L13 9M6 10L5 11C3.34 12.66 3.34 15.34 5 17C6.66 18.66 9.34 18.66 11 17L12 16M10 6L11 5C12.66 3.34 15.34 3.34 17 5C18.66 6.66 18.66 9.34 17 11L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('katana')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9L10 11L7 13M12 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (n.includes('gobuster') || n.includes('bust') || n.includes('brute')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="1.5" fill="currentColor"/>
    </svg>
  );
  if (n.includes('git') || n.includes('leak') || n.includes('secret')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 7H12.5M7 9.5V12.5M12.5 15H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (n.includes('yq') || n.includes('yaml') || n.includes('json')) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 8H14M8 11H14M8 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  // Deterministic fallback
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  if (hash % 3 === 0) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20 7.5V14.5L11 20L2 14.5V7.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
  if (hash % 3 === 1) return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9L10 11L7 13M12 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19M11 3C11 3 14 7 14 11C14 15 11 19 11 19M3 11H19" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY THEME CONFIG
   Maps API category_name → colors used throughout the section
───────────────────────────────────────────────────────────────────────────── */
const PALETTE = [
  {
    tint: '#3B82F6', dot: 'bg-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconBorder: 'border-blue-100 dark:border-blue-800/50', iconText: 'text-blue-500 dark:text-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    badgeDot: 'bg-blue-500',
    cardHover: 'hover:border-blue-400/40 hover:shadow-[0_4px_24px_0_rgba(96,165,250,0.08)]',
    topBar: 'bg-blue-400/60',
    eyebrow: 'text-blue-500 dark:text-blue-400',
    statBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-800/50',
    cta: 'text-blue-500 dark:text-blue-400',
    navBorder: 'border-blue-200 dark:border-blue-800/50',
    navBg: 'bg-blue-50 dark:bg-blue-950/30',
    navText: 'text-blue-600 dark:text-blue-400',
    navHover: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
    glowLeft: 'bg-blue-400/8 blur-[140px] dark:bg-blue-600/25',
    glowBottom: 'bg-blue-400/6 blur-[100px] dark:bg-blue-400/15',
    glowRight: 'bg-blue-400/7 blur-[150px] dark:bg-blue-500/20',
    glowTop: 'bg-blue-400/5 blur-[100px] dark:bg-blue-400/12',
  },
  {
    tint: '#EF4444', dot: 'bg-red-400',
    iconBg: 'bg-red-50 dark:bg-red-950/30', iconBorder: 'border-red-100 dark:border-red-800/50', iconText: 'text-red-500 dark:text-red-400',
    badge: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
    badgeDot: 'bg-red-500',
    cardHover: 'hover:border-red-400/40 hover:shadow-[0_4px_24px_0_rgba(248,113,113,0.08)]',
    topBar: 'bg-red-400/60',
    eyebrow: 'text-red-500 dark:text-red-400',
    statBg: 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-800/50',
    cta: 'text-red-500 dark:text-red-400',
    navBorder: 'border-red-200 dark:border-red-800/50',
    navBg: 'bg-red-50 dark:bg-red-950/30',
    navText: 'text-red-600 dark:text-red-400',
    navHover: 'hover:bg-red-100 dark:hover:bg-red-950/50',
    glowLeft: 'bg-red-400/8 blur-[140px] dark:bg-red-600/25',
    glowBottom: 'bg-red-400/6 blur-[100px] dark:bg-red-400/15',
    glowRight: 'bg-red-400/7 blur-[150px] dark:bg-red-500/20',
    glowTop: 'bg-red-400/5 blur-[100px] dark:bg-red-400/12',
  },
  {
    tint: '#A855F7', dot: 'bg-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconBorder: 'border-purple-100 dark:border-purple-800/50', iconText: 'text-purple-500 dark:text-purple-400',
    badge: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
    badgeDot: 'bg-purple-500',
    cardHover: 'hover:border-purple-400/40 hover:shadow-[0_4px_24px_0_rgba(192,132,252,0.08)]',
    topBar: 'bg-purple-400/60',
    eyebrow: 'text-purple-500 dark:text-purple-400',
    statBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-800/50',
    cta: 'text-purple-500 dark:text-purple-400',
    navBorder: 'border-purple-200 dark:border-purple-800/50',
    navBg: 'bg-purple-50 dark:bg-purple-950/30',
    navText: 'text-purple-600 dark:text-purple-400',
    navHover: 'hover:bg-purple-100 dark:hover:bg-purple-950/50',
    glowLeft: 'bg-purple-400/8 blur-[140px] dark:bg-purple-600/25',
    glowBottom: 'bg-purple-400/6 blur-[100px] dark:bg-purple-400/15',
    glowRight: 'bg-purple-400/7 blur-[150px] dark:bg-purple-500/20',
    glowTop: 'bg-purple-400/5 blur-[100px] dark:bg-purple-400/12',
  },
  {
    tint: '#F59E0B', dot: 'bg-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconBorder: 'border-amber-100 dark:border-amber-800/50', iconText: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    badgeDot: 'bg-amber-500',
    cardHover: 'hover:border-amber-400/40 hover:shadow-[0_4px_24px_0_rgba(251,191,36,0.08)]',
    topBar: 'bg-amber-400/60',
    eyebrow: 'text-amber-500 dark:text-amber-400',
    statBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/50',
    cta: 'text-amber-500 dark:text-amber-400',
    navBorder: 'border-amber-200 dark:border-amber-800/50',
    navBg: 'bg-amber-50 dark:bg-amber-950/30',
    navText: 'text-amber-600 dark:text-amber-400',
    navHover: 'hover:bg-amber-100 dark:hover:bg-amber-950/50',
    glowLeft: 'bg-amber-400/8 blur-[140px] dark:bg-amber-600/25',
    glowBottom: 'bg-amber-400/6 blur-[100px] dark:bg-amber-400/15',
    glowRight: 'bg-amber-400/7 blur-[150px] dark:bg-amber-500/20',
    glowTop: 'bg-amber-400/5 blur-[100px] dark:bg-amber-400/12',
  },
  {
    tint: '#14B8A6', dot: 'bg-teal-400',
    iconBg: 'bg-teal-50 dark:bg-teal-950/30', iconBorder: 'border-teal-100 dark:border-teal-800/50', iconText: 'text-teal-500 dark:text-teal-400',
    badge: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800',
    badgeDot: 'bg-teal-500',
    cardHover: 'hover:border-teal-400/40 hover:shadow-[0_4px_24px_0_rgba(45,212,191,0.08)]',
    topBar: 'bg-teal-400/60',
    eyebrow: 'text-teal-500 dark:text-teal-400',
    statBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-800/50',
    cta: 'text-teal-500 dark:text-teal-400',
    navBorder: 'border-teal-200 dark:border-teal-800/50',
    navBg: 'bg-teal-50 dark:bg-teal-950/30',
    navText: 'text-teal-600 dark:text-teal-400',
    navHover: 'hover:bg-teal-100 dark:hover:bg-teal-950/50',
    glowLeft: 'bg-teal-400/8 blur-[140px] dark:bg-teal-600/25',
    glowBottom: 'bg-teal-400/6 blur-[100px] dark:bg-teal-400/15',
    glowRight: 'bg-teal-400/7 blur-[150px] dark:bg-teal-500/20',
    glowTop: 'bg-teal-400/5 blur-[100px] dark:bg-teal-400/12',
  },
];

type PaletteEntry = typeof PALETTE[0];

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY STAT BAR
───────────────────────────────────────────────────────────────────────────── */
function CategoryStatBar({
  categories,
  tools,
  palette,
}: {
  categories: Category[];
  tools: Tool[];
  palette: Record<string, PaletteEntry>;
}) {
  const total = tools.length || 1;
  return (
    <div className="flex gap-1 h-1 rounded-full overflow-hidden w-full max-w-xs">
      {categories.map((cat) => {
        const count = tools.filter((t) => t.category_name === cat.name).length;
        const p = palette[cat.name] ?? PALETTE[0];
        return (
          <div
            key={cat.category_id}
            className={`rounded-full transition-all duration-500 ${p.dot}`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOADING SKELETON — shown while API fetches
───────────────────────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/5" />
              <div className="w-20 h-6 rounded-md bg-gray-100 dark:bg-white/5" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-5 w-28 rounded bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-full rounded bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
            </div>
            <div className="flex gap-1.5 mt-auto">
              <div className="h-5 w-14 rounded-md bg-gray-100 dark:bg-white/5" />
              <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL CARD — reusable across all category sections
───────────────────────────────────────────────────────────────────────────── */
function ToolCard({
  tool,
  p,
  primaryCta,
  descriptionTextClass,
  subtitleTextClass,
}: {
  tool: Tool;
  p: PaletteEntry;
  primaryCta: string;
  descriptionTextClass: string;
  subtitleTextClass: string;
}) {
  const presets = tool.scan_config?.basic?.presets ?? [];
  const mediumCount = tool.scan_config?.medium?.options?.length ?? 0;
  const examples = Array.isArray(tool.examples) ? tool.examples : [];
  const toolAnchorId = `tool-${tool.tool_name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      id={toolAnchorId}
      variants={cardMotion}
      className={`group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl flex flex-col overflow-hidden ${p.cardHover} transition-all duration-200 cursor-pointer`}
    >
      <div className={`h-0.5 w-full ${p.topBar} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Icon + badges */}
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl ${p.iconBg} border ${p.iconBorder} flex items-center justify-center ${p.iconText} shrink-0`}>
            <ToolIcon name={tool.tool_name} />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tool.is_active && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1] text-white px-2.5 py-1 rounded-md">
                Active
              </span>
            )}
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${p.badge}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${p.badgeDot}`} />
              {tool.category_name}
            </span>
          </div>
        </div>

        {/* Name + description */}
        <div className="flex flex-col gap-1.5">
          <h3 className={`${subtitleTextClass} font-bold text-[#1A1A1A] dark:text-[#EDEDED] leading-snug capitalize`}>
            {tool.tool_name}
          </h3>
          <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed ${descriptionTextClass} line-clamp-3`}>
            {tool.tool_description}
          </p>
        </div>

        {/* Scan presets */}
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <span
                key={preset.name}
                title={preset.description}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border cursor-default select-none ${
                  preset.name === 'light'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                    : 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/50'
                }`}
              >
                {preset.name === 'light'
                  ? <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor"><circle cx="4.5" cy="4.5" r="4.5"/></svg>
                  : <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="4.5" cy="4.5" r="1.5" fill="currentColor"/></svg>
                }
                {preset.name}
              </span>
            ))}
            {mediumCount > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 cursor-default select-none">
                +{mediumCount} opts
              </span>
            )}
          </div>
        )}

        {/* Example targets */}
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {examples.map((ex, idx) => (
              <span
                key={idx}
                title={ex}
                className="text-[11px] bg-[#F7F5F0] dark:bg-[#1A1A1A] border border-black/9 dark:border-white/9 text-[#5C5C5C] dark:text-[#9A9A9A] px-2 py-0.5 rounded-md font-mono truncate max-w-full"
              >
                {ex}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="px-6 py-4 border-t border-black/9 dark:border-white/9 bg-[#FAFAF9] dark:bg-[#0E0E10]">
        <a href="#" className={`${p.cta} text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-3 transition-all`}>
          {primaryCta}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY SECTION — renders hero + tool grid for one category dynamically
───────────────────────────────────────────────────────────────────────────── */
function CategorySection({
  category,
  tools,
  palette,
  index,
  primaryCta,
  descriptionTextClass,
  subtitleTextClass,
}: {
  category: Category;
  tools: Tool[];
  palette: PaletteEntry;
  index: number;
  primaryCta: string;
  descriptionTextClass: string;
  subtitleTextClass: string;
}) {
  const sectionId = `${category.name.toLowerCase().replace(/\s+/g, '-')}-section`;
  const categoryTools = tools.filter((tool) => tool.category_name === category.name);
  const categorySummary =
    category.description?.trim() ||
    (categoryTools.length > 0
      ? `Includes ${categoryTools
          .slice(0, 3)
          .map((tool) => tool.tool_name)
          .join(", ")} and ${Math.max(categoryTools.length - 3, 0)} more tools.`
      : "Tool collection loaded from the live catalog.");

  return (
    <div id={sectionId}>
      {/* Category hero */}
      <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
        <CategoryHeroBackground tint={palette.tint} />
        {/* Glow layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full ${palette.glowLeft}`} />
          <div className={`absolute left-1/4 bottom-0 w-100 h-75 rounded-full ${palette.glowBottom}`} />
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full ${palette.glowRight}`} />
          <div className={`absolute top-0 right-1/4 w-100 h-62.5 rounded-full ${palette.glowTop}`} />
        </div>

        <div className="relative h-full w-full flex items-center justify-center">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial="hidden" animate="visible" variants={pageMotion} className="flex flex-col gap-6 z-10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
                  <span className={`${heroEyebrowTextClass} ${palette.eyebrow}`}>{category.name}</span>
                </div>
                <div className="flex flex-col gap-4">
                  <h2 className={`${heroTitleTextClass} text-[#1A1A1A] dark:text-[#EDEDED]`}>
                    {category.name}
                  </h2>
                  <p className={heroDescriptionTextClass}>
                    {categorySummary}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className={`${heroStatTextClass} ${palette.statBg} border px-4 py-2 rounded-lg`}>
                    {categoryTools.length} tools
                  </span>
                </div>
              </motion.div>

              {/* Decorative SVG — cycles through 3 styles by index */}
              <div className="hidden lg:flex items-center justify-end h-full">
                <div className="relative w-full max-w-md h-96">
                  {index % 3 === 0 && (
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path key={`r-${i}`} d={`M 0 ${(i+1)*50} Q 100 ${(i+1)*50-30} 200 ${(i+1)*50} T 400 ${(i+1)*50}`} stroke={palette.tint} strokeWidth="1.5" fill="none" opacity="0.4"/>
                      ))}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path key={`c-${i}`} d={`M ${(i+1)*50} 0 Q ${(i+1)*50-30} 100 ${(i+1)*50} 200 T ${(i+1)*50} 400`} stroke={palette.tint} strokeWidth="1.5" fill="none" opacity="0.4"/>
                      ))}
                      <circle cx="200" cy="200" r="60" fill="none" stroke={palette.tint} strokeWidth="2" opacity="0.6"/>
                      <circle cx="200" cy="200" r="40" fill="none" stroke={palette.tint} strokeWidth="2" opacity="0.4"/>
                      <circle cx="200" cy="200" r="20" fill="none" stroke={palette.tint} strokeWidth="2" opacity="0.3"/>
                    </svg>
                  )}
                  {index % 3 === 1 && (
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <circle key={i} cx="200" cy="200" r={30 + i * 20} fill="none" stroke={palette.tint} strokeWidth="1.5" opacity={0.5 - i * 0.04}/>
                      ))}
                      <circle cx="200" cy="200" r="6" fill={palette.tint} opacity="0.6"/>
                    </svg>
                  )}
                  {index % 3 === 2 && (
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path key={i} d={`M 0 ${50+i*40} Q 50 ${50+i*40-20} 100 ${50+i*40} T 200 ${50+i*40} T 300 ${50+i*40} T 400 ${50+i*40}`} stroke={palette.tint} strokeWidth="2" fill="none" opacity={0.6 - i * 0.06}/>
                      ))}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line key={`d-${i}`} x1={i*60} y1="0" x2={i*60+400} y2="400" stroke={palette.tint} strokeWidth="1" opacity="0.3"/>
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool cards grid */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        <motion.div initial="hidden" animate="visible" variants={listMotion} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryTools.map((tool) => (
            <ToolCard
              key={tool.tool_id}
              tool={tool}
              p={palette}
              primaryCta={primaryCta}
              descriptionTextClass={descriptionTextClass}
              subtitleTextClass={subtitleTextClass}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ToolsPage() {
  const t = useTranslations('toolsPage');
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ── API state ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = mounted && resolvedTheme === 'dark';

  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [catsResult, toolsResult] = await Promise.allSettled([
        fetchCategories(),
        fetchTools(),
      ]);

      if (catsResult.status === 'fulfilled') {
        setCategories(catsResult.value);
      } else {
        setCategories([]);
      }

      if (toolsResult.status === 'fulfilled') {
        setTools(toolsResult.value);
      } else {
        setTools([]);
      }

      const failures = [catsResult, toolsResult].filter(
        (result) => result.status === 'rejected',
      ) as PromiseRejectedResult[];

      if (failures.length > 0) {
        const firstReason = failures[0]?.reason;
        setError(
          firstReason instanceof Error
            ? firstReason.message
            : 'Failed to load data',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Scroll to tool card when navigating with a hash anchor (e.g. /tools#tool-subfinder)
  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    // Small delay to let DOM render after data loads
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loading]);

  const isKhmer = locale === 'km';
  const bodyFontFamily = isKhmer
    ? 'var(--font-noto-khmer), sans-serif'
    : 'var(--font-google-sans), var(--font-noto-khmer), sans-serif';
  const descriptionTextClass = 'text-[16px] md:text-[18px] lg:text-[20px]';
  const subtitleTextClass = 'text-[16px] md:text-[17px] lg:text-[18px]';

  const heroTitle = 'Security tools in one live catalog';

  const heroSubtitle = useMemo(() => {
    if (tools.length === 0) {
      return t('subtitle');
    }

    const featuredTools = tools
      .slice(0, 3)
      .map((tool) => tool.tool_name)
      .join(', ');

    return `Loaded from the tool list endpoint with live titles and descriptions, featuring ${featuredTools}${tools.length > 3 ? ', and more.' : '.'}`;
  }, [tools, t]);

  // Build palette map keyed by category name
  const paletteMap = useMemo(() => {
    const map: Record<string, PaletteEntry> = {};
    categories.forEach((cat, i) => { map[cat.name] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [categories]);

  const heroBottomFadeStyle = useMemo(() => ({
    zIndex: 4 as const,
    background: isDark
      ? 'linear-gradient(to bottom, transparent, rgba(9,9,11,0.85))'
      : 'linear-gradient(to bottom, transparent, rgba(247,245,240,0.9))',
  }), [isDark]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageMotion}
      className="min-h-screen overflow-x-hidden bg-[#F7F5F0] dark:bg-[#09090B]"
      style={{ fontFamily: bodyFontFamily }}
    >
      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/8 transition-colors duration-300">
        <HeroBackground isDark={isDark} bottomFadeStyle={heroBottomFadeStyle} />

        <div
          className="relative mx-auto flex min-h-[58vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16"
          style={{ zIndex: 10 }}
        >
          <div className="flex w-full max-w-4xl flex-col items-center gap-5 text-center">
            <h1 className="text-3xl sm:text-4xl font-display lg:text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-[#1A1A1A] dark:text-[#EDEDED]">
              {heroTitle}
            </h1>
            <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] max-w-lg ${descriptionTextClass} leading-relaxed`}>
              {heroSubtitle}
            </p>
          </div>

          {/* Stats row — dynamic from API */}
          {!loading && !error && (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <div className="flex items-center gap-5 flex-wrap justify-center">
                {categories.map((cat) => {
                  const p = paletteMap[cat.name] ?? PALETTE[0];
                  return (
                    <div key={cat.category_id} className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />
                      <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                        {cat.name} ({tools.filter((tool) => tool.category_name === cat.name).length})
                      </span>
                    </div>
                  );
                })}
              </div>
              <CategoryStatBar categories={categories} tools={tools} palette={paletteMap} />
            </div>
          )}

          {/* Category nav buttons — dynamic from API */}
          {!loading && !error && categories.length > 0 && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-[#5C5C5C] dark:text-[#9A9A9A]">Explore by category</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {categories.map((cat) => {
                  const p = paletteMap[cat.name] ?? PALETTE[0];
                  const sectionId = `${cat.name.toLowerCase().replace(/\s+/g, '-')}-section`;
                  return (
                    <button
                      key={cat.category_id}
                      onClick={() => {
                        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`px-5 py-3 rounded-xl text-sm font-semibold border ${p.navBorder} ${p.navBg} ${p.navText} ${p.navHover} transition-all shadow-sm hover:shadow-md`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading placeholder for hero stats */}
          {loading && (
            <div className="flex gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-28 rounded-full bg-gray-100 dark:bg-white/5" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ERROR STATE
      ══════════════════════════════════════════════════════════════════ */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#fca5a5" strokeWidth="2"/>
            <path d="M24 14V26M24 32V34" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <p className="text-lg font-medium text-red-500">Failed to load tools</p>
          <p className="text-sm text-[#9A9A9A]">{error}</p>
          <button
            type="button"
            onClick={() => {
              void load();
            }}
            className="mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111113] px-4 py-2 text-sm font-semibold text-[#1A1A1A] dark:text-[#EDEDED] transition hover:border-[#00C896] hover:text-[#00C896]"
          >
            Try again
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LOADING STATE
      ══════════════════════════════════════════════════════════════════ */}
      {loading && <LoadingSkeleton />}

      {/* ══════════════════════════════════════════════════════════════════
          CATEGORY SECTIONS — fully dynamic, one per API category
      ══════════════════════════════════════════════════════════════════ */}
      {!loading && !error && categories.map((category, index) => (
        <CategorySection
          key={category.category_id}
          category={category}
          tools={tools}
          palette={paletteMap[category.name] ?? PALETTE[index % PALETTE.length]}
          index={index}
          primaryCta={t('primaryCta')}
          descriptionTextClass={descriptionTextClass}
          subtitleTextClass={subtitleTextClass}
        />
      ))}
    </motion.div>
  );
}
