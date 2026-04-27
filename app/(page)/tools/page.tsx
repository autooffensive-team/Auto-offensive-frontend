'use client';

import { JSX, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, cubicBezier } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

// ── FaultyTerminal (inlined) ───────────────────────────────────────────
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
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      loadAnimationStartRef.current = 0; timeOffsetRef.current = Math.random() * 100;
    };
  }, [dpr, pause, timeScale, scale, gridMul, digitSize, scanlineIntensity, glitchAmount, flickerAmount, noiseAmp, chromaticAberration, ditherValue, curvature, tintVec, mouseReact, mouseStrength, pageLoadAnimation, brightness, handleMouseMove]);
  return <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className ?? ''}`} style={style} {...rest} />;
}
// ── End FaultyTerminal ─────────────────────────────────────────────────

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

const heroEyebrowTextClass = "text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em]";
const heroTitleTextClass = "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.02] tracking-tight";
const heroDescriptionTextClass = "text-base sm:text-lg lg:text-xl text-[#5C5C5C] dark:text-[#9A9A9A] max-w-xl leading-relaxed";
const heroStatTextClass = "text-xs sm:text-sm font-semibold text-[#9A9A9A]";

// ── Icons ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

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

const categoryColors: Record<string, string> = {
  Recon:   'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  Vuln:    'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
  Fuzzing: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
}

const categoryDot: Record<string, string> = {
  Recon:   'bg-blue-500',
  Vuln:    'bg-red-500',
  Fuzzing: 'bg-purple-500',
}

const categoryLabelKey: Record<string, 'recon' | 'vuln' | 'fuzzing'> = {
  Recon: 'recon',
  Vuln: 'vuln',
  Fuzzing: 'fuzzing',
}

// ── Category stat counts bar ──────────────────────────────────────────
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

export default function ToolsPage() {
  const t = useTranslations('toolsPage')
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const descriptionTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";
  const subtitleTextClass = "text-[16px] md:text-[17px] lg:text-[18px]";

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
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#09090B] border-b border-black/9 dark:border-white/8">

        {/* Layered ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Light mode: soft teal glow left */}
          <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-[#00BCA1]/6 blur-[110px] dark:bg-[#1a3a5c]/70" />
          {/* Teal accent glow — bottom left */}
          <div className="absolute left-1/4 bottom-0 w-[320px] h-55 rounded-full bg-[#00BCA1]/5 blur-[80px] dark:bg-[#00BCA1]/12" />
          {/* Right glow behind knife */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-150 rounded-full bg-[#00BCA1]/5 blur-[130px] dark:bg-[#1e4068]/50" />
          {/* Subtle top-right highlight */}
          <div className="absolute top-0 right-1/4 w-75 h-50 rounded-full bg-[#00BCA1]/4 blur-[80px] dark:bg-[#2a5080]/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-4 items-center">

            {/* ── Right: Swiss Army Knife Image (on top for mobile) ── */}
            <div className="relative flex items-center justify-center lg:justify-end order-first lg:order-last">
              {/* Glow behind image */}
              <div className="absolute inset-0 flex items-center justify-center lg:justify-end pointer-events-none">
                <div className="w-85 h-85 rounded-full bg-[#00BCA1]/10 blur-[70px]" />
              </div>
              <img
                src="/document/glass_swiss_army_knife.webp"
                alt="Pentesting tools suite"
                className="relative z-10 w-48 sm:w-64 md:w-80 lg:w-100 xl:w-110 object-contain
                           drop-shadow-[0_24px_64px_rgba(0,188,161,0.18)]
                           select-none"
                draggable={false}
              />
            </div>

            {/* ── Left: Text + Controls ── */}
            <div className="flex flex-col gap-7 z-10 text-center lg:text-left order-last lg:order-first">

              {/* Title + subtitle */}
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-[#1A1A1A] dark:text-[#EDEDED]">
                  {t('title')}
                </h1>
                <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] max-w-lg mx-auto lg:mx-0 ${descriptionTextClass} leading-relaxed`}>
                  {t('subtitle')}
                </p>
              </div>

              {/* Stats row — always two lines: dots then bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                      {t('categories.recon')} ({tools.filter(t => t.category === 'Recon').length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                      {t('categories.vuln')} ({tools.filter(t => t.category === 'Vuln').length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span className="text-xs text-[#9A9A9A] whitespace-nowrap">
                      {t('categories.fuzzing')} ({tools.filter(t => t.category === 'Fuzzing').length})
                    </span>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <CategoryStatBar tools={tools} />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-[#5C5C5C] dark:text-[#9A9A9A]">Explore by category</p>
                <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
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
        </div>
      </div>

      {/* ── Category Sections ───────────────────────────────────── */}

      {/* ── RECON SECTION ── */}
      <div id="recon-section">
        {/* Recon Full-Screen Hero with Animated Background */}
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#3B82F6" />

          {/* Layered ambient background glows */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light mode: soft blue glow left */}
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-blue-400/8 blur-[140px] dark:bg-blue-600/25" />
            {/* Blue accent glow — bottom left */}
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-blue-400/6 blur-[100px] dark:bg-blue-400/15" />
            {/* Right glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-blue-400/7 blur-[150px] dark:bg-blue-500/20" />
            {/* Subtle top-right highlight */}
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-blue-400/5 blur-[100px] dark:bg-blue-400/12" />
          </div>

          {/* Content Grid */}
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
                
                {/* Right: Animated Grid Pattern */}
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      {/* Curved grid lines */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <g key={`row-${i}`}>
                          <path
                            d={`M 0 ${(i + 1) * 50} Q 100 ${(i + 1) * 50 - 30} 200 ${(i + 1) * 50} T 400 ${(i + 1) * 50}`}
                            stroke="#3B82F6"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.4"
                          />
                        </g>
                      ))}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <g key={`col-${i}`}>
                          <path
                            d={`M ${(i + 1) * 50} 0 Q ${(i + 1) * 50 - 30} 100 ${(i + 1) * 50} 200 T ${(i + 1) * 50} 400`}
                            stroke="#3B82F6"
                            strokeWidth="1.5"
                            fill="none"
                            opacity="0.4"
                          />
                        </g>
                      ))}
                      {/* Center target circles */}
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
        {/* Recon Tools Grid */}
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
        {/* Vuln Full-Screen Hero with Animated Background */}
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#EF4444" />

          {/* Layered ambient background glows */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light mode: soft red glow left */}
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-red-400/8 blur-[140px] dark:bg-red-600/25" />
            {/* Red accent glow — bottom left */}
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-red-400/6 blur-[100px] dark:bg-red-400/15" />
            {/* Right glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-red-400/7 blur-[150px] dark:bg-red-500/20" />
            {/* Subtle top-right highlight */}
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-red-400/5 blur-[100px] dark:bg-red-400/12" />
          </div>

          {/* Content Grid */}
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
                
                {/* Right: Animated Concentric Circles */}
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05"/>
                        </radialGradient>
                      </defs>
                      {/* Concentric circles */}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <circle
                          key={i}
                          cx="200"
                          cy="200"
                          r={30 + i * 20}
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          opacity={0.5 - (i * 0.04)}
                        />
                      ))}
                      {/* Center dot */}
                      <circle cx="200" cy="200" r="6" fill="#EF4444" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Vuln Tools Grid */}
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
        {/* Fuzzing Full-Screen Hero with Animated Background */}
        <div className="relative w-full h-screen overflow-hidden bg-white dark:bg-[#09090B]">
          <CategoryHeroBackground tint="#A855F7" />

          {/* Layered ambient background glows */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light mode: soft purple glow left */}
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-purple-400/8 blur-[140px] dark:bg-purple-600/25" />
            {/* Purple accent glow — bottom left */}
            <div className="absolute left-1/4 bottom-0 w-100 h-75 rounded-full bg-purple-400/6 blur-[100px] dark:bg-purple-400/15" />
            {/* Right glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-purple-400/7 blur-[150px] dark:bg-purple-500/20" />
            {/* Subtle top-right highlight */}
            <div className="absolute top-0 right-1/4 w-100 h-62.5 rounded-full bg-purple-400/5 blur-[100px] dark:bg-purple-400/12" />
          </div>

          {/* Content Grid */}
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
                
                {/* Right: Animated Wave Pattern */}
                <div className="hidden lg:flex items-center justify-end h-full">
                  <div className="relative w-full max-w-md h-96">
                    <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      {/* Wave pattern */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <path
                          key={i}
                          d={`M 0 ${50 + i * 40} Q 50 ${50 + i * 40 - 20} 100 ${50 + i * 40} T 200 ${50 + i * 40} T 300 ${50 + i * 40} T 400 ${50 + i * 40}`}
                          stroke="#A855F7"
                          strokeWidth="2"
                          fill="none"
                          opacity={0.6 - (i * 0.06)}
                        />
                      ))}
                      {/* Diagonal lines for fuzz effect */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line
                          key={`diag-${i}`}
                          x1={i * 60}
                          y1="0"
                          x2={i * 60 + 400}
                          y2="400"
                          stroke="#A855F7"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Fuzzing Tools Grid */}
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