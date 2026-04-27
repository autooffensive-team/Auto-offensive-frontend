"use client";

import { Fragment, useEffect, useRef } from "react";
import { useLocale } from "next-intl";

const SLIDES_EN = [
  {
    num: "01",
    tag: "Who We Are",
    title: ["Security testing", "for every engineer."],
    accentIndex: 1,
    body: "Auto-Offensive is a PaaS that automates web, network and code security scanning powered by AI via MCP Protocol, with zero CLI setup required.",
    visual: "shield",
  },
  {
    num: "02",
    tag: "The Problem",
    title: ["Pen-testing was", "too inaccessible."],
    accentIndex: 1,
    body: "Traditional tools demand years of CLI expertise, locking out developers and students. We built a platform that removes those barriers with a Web UI-first experience.",
    visual: "terminal",
  },
  {
    num: "03",
    tag: "Who We Serve",
    title: ["Built for real users,", "not just", "experts."],
    accentIndex: 0,
    body: "Software engineers, penetration testers, security researchers, students and learners all get the same enterprise-grade scanning power.",
    visual: "stats",
  },
  {
    num: "04",
    tag: "Our Vision",
    title: ["Shift security left", "into every", "pipeline."],
    accentIndex: 1,
    body: "Auto-Offensive integrates into GitHub, GitLab and CI/CD workflows through API so code quality and vulnerabilities are scanned automatically on every push.",
    visual: "pipeline",
    quote: "\"Enterprise-grade offensive security in the hands of every engineer.\"",
  },
];

const SLIDES_KH = [
  {
    num: "01",
    tag: "យើងជានរណា",
    title: ["ការធ្វើតេស្តសុវត្ថិភាព", "សម្រាប់អ្នកអភិវឌ្ឍគ្រប់រូប។"],
    accentIndex: 1,
    body: "Auto-Offensive គឺជា PaaS ដែលជួយស្កេនសុវត្ថិភាពលើវេបសាយ បណ្ដាញ និងកូដដោយស្វ័យប្រវត្តិ ដំណើរការដោយ AI តាម MCP Protocol ហើយមិនចាំបាច់ប្រើ CLI ទេ។",
    visual: "shield",
  },
  {
    num: "02",
    tag: "បញ្ហា",
    title: ["Pentest ពិបាកប្រើ", "សម្រាប់មនុស្សភាគច្រើន។"],
    accentIndex: 1,
    body: "ឧបករណ៍បែបបុរាណត្រូវការជំនាញ CLI ច្រើនឆ្នាំ ធ្វើឱ្យអ្នកអភិវឌ្ឍ និងសិស្សានុសិស្សពិបាកចូលប្រើ។ យើងបង្កើតវេទិកាដែលចាប់ផ្តើមពី Web UI ងាយស្រួល។",
    visual: "terminal",
  },
  {
    num: "03",
    tag: "អ្នកដែលយើងបម្រើ",
    title: ["បង្កើតសម្រាប់អ្នកប្រើពិត", "មិនមែនសម្រាប់តែអ្នកជំនាញទេ។"],
    accentIndex: 0,
    body: "អ្នកអភិវឌ្ឍកម្មវិធី អ្នកធ្វើ Pentest អ្នកស្រាវជ្រាវសុវត្ថិភាព និងសិស្សានុសិស្ស ទទួលបានសមត្ថភាពស្កេនកម្រិតស្ថាប័នដូចគ្នា។",
    visual: "stats",
  },
  {
    num: "04",
    tag: "ចក្ខុវិស័យរបស់យើង",
    title: ["នាំសុវត្ថិភាពទៅមុខ", "ក្នុងគ្រប់ pipeline។"],
    accentIndex: 1,
    body: "Auto-Offensive អាចភ្ជាប់ជាមួយ GitHub, GitLab និងលំហូរ CI/CD តាម API ដើម្បីស្កេនគុណភាពកូដ និងចន្លោះខ្សោយរាល់ពេល push ដោយស្វ័យប្រវត្តិ។",
    visual: "pipeline",
    quote: "\"សុវត្ថិភាព offensive កម្រិតស្ថាប័ន សម្រាប់អ្នកអភិវឌ្ឍគ្រប់រូប។\"",
  },
];

function SlidePathPointer({ from, to, nextLabel }: { from: string; to: string; nextLabel: string }) {
  return (
    <div
      className="ms-path-pointer relative flex h-full w-[30vw] shrink-0 flex-col items-center justify-center gap-2.5 pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex w-full items-center justify-between px-0.5">
        <span className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[rgba(0,208,178,.35)]">{from}</span>
        <span className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[rgba(0,208,178,.6)]">{to}</span>
      </div>

      <svg
        className="w-full overflow-visible"
        style={{ height: "48px" }}
        viewBox="0 0 320 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path d="M 0 24 Q 80 4 160 24 Q 240 44 320 24" stroke="rgba(0,208,178,0.22)" strokeWidth="1" strokeDasharray="5 5" fill="none" />
        <path d="M 0 24 Q 80 4 160 24 Q 240 44 320 24" stroke="rgba(0,208,178,0.55)" strokeWidth="1.5" fill="none" strokeDasharray="30 290" strokeDashoffset="0" className="ms-pp-animated-dash" />
        <path d="M 310 18 L 320 24 L 310 30" stroke="rgba(0,208,178,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle r="3" fill="#00D0B2" opacity="0.9">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 0 24 Q 80 4 160 24 Q 240 44 320 24" calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" />
        </circle>
        <circle r="7" fill="#00D0B2" opacity="0.15">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 0 24 Q 80 4 160 24 Q 240 44 320 24" calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" />
        </circle>
      </svg>

      <div className="flex items-center gap-2 text-[0.5rem] font-bold uppercase tracking-[0.22em] text-[rgba(0,208,178,.3)]">
        <span className="ms-pp-step-icon text-[0.65rem] text-[rgba(0,208,178,.25)]">□</span>
        {nextLabel}
        <span className="ms-pp-step-icon ms-pp-step-icon--last text-[0.65rem] text-[rgba(0,208,178,.25)]">□</span>
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div className="relative flex h-45 w-40 items-center justify-center">
      <svg viewBox="0 0 120 140" fill="none" style={{ width: "100%", height: "100%", position: "relative", zIndex: 2 }}>
        <path d="M60 4L8 26v42c0 36 24 68 52 78 28-10 52-42 52-78V26L60 4z" stroke="rgba(0,208,178,.15)" strokeWidth="1.5" />
        <path d="M60 14L16 33v35c0 30 20 57 44 66 24-9 44-36 44-66V33L60 14z" stroke="rgba(0,208,178,.3)" strokeWidth="1" />
        <path d="M60 24L24 40v28c0 24 16 46 36 54 20-8 36-30 36-54V40L60 24z" fill="rgba(0,208,178,.05)" stroke="#00D0B2" strokeWidth="1.5" />
        <path d="M42 68l12 12 24-24" stroke="#00D0B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="ms-vis-pulse" />
      <div className="ms-vis-pulse" style={{ animationDelay: ".6s" }} />
    </div>
  );
}

function TerminalVisual({ lines }: { lines: string[] }) {
  return (
    <div
      className="w-full max-w-[320px] overflow-hidden rounded-[10px] border border-[rgba(0,208,178,.14)] bg-[rgba(10,31,26,.06)] dark:bg-[rgba(0,0,0,.5)]"
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      <div className="flex items-center border-b border-[rgba(0,208,178,.14)] bg-[rgba(0,208,178,.04)] px-3.5 py-2">
        <span className="inline-block h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="mx-1 inline-block h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="inline-block h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex flex-col gap-1.25 p-3.5">
        {lines.map((line, idx) => {
          const type = idx === 0 ? "cmd" : idx === 2 || idx === 4 ? "ok" : "out";
          const prompt = idx === 0 ? "$" : " ";
          return (
            <div key={line} className="flex gap-2 text-[0.72rem] leading-normal">
              <span className="shrink-0 text-[rgba(0,208,178,.5)]">{prompt}</span>
              <span className={type === "ok" ? "text-primary" : type === "out" ? "italic" : ""}>{line}</span>
            </div>
          );
        })}
        <div className="flex gap-2 text-[0.72rem] leading-normal">
          <span className="shrink-0 text-[rgba(0,208,178,.5)]">$</span>
          <span className="ms-vt-cursor" />
        </div>
      </div>
    </div>
  );
}

function StatsVisual({ active, labels }: { active: boolean; labels: string[] }) {
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);
  const b3 = useRef<HTMLDivElement>(null);
  const c1 = useRef<HTMLSpanElement>(null);
  const c2 = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    setTimeout(() => { if (b1.current) b1.current.style.width = "85%"; }, 300);
    setTimeout(() => { if (b2.current) b2.current.style.width = "72%"; }, 400);
    setTimeout(() => { if (b3.current) b3.current.style.width = "95%"; }, 500);

    const animateCounter = (el: HTMLSpanElement, target: number) => {
      const dur = 1200;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.floor(p * p * (3 - 2 * p) * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (c1.current) animateCounter(c1.current, 5);
    if (c2.current) animateCounter(c2.current, 3);
  }, [active]);

  const statItems = [
    { countRef: c1, barRef: b1, suffix: "+", label: labels[0] },
    { countRef: c2, barRef: b2, suffix: "x", label: labels[1] },
    { countRef: null, barRef: b3, static: "AI", label: labels[2] },
  ];

  return (
    <div className="ms-vis-stats flex w-full max-w-75 flex-col gap-4.5">
      {statItems.map((item, idx) => (
        <div key={idx}>
          <div className="mb-1 text-[1.8rem] leading-none font-bold tracking-[-0.04em]" style={{ color: "var(--text)", fontFamily: "var(--font-title, monospace)" }}>
            {item.static ? (
              item.static
            ) : (
              <>
                <span ref={item.countRef}>0</span>
                <em className="not-italic text-primary">{item.suffix}</em>
              </>
            )}
          </div>
          <div className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.08em]" style={{ color: "var(--dim)", fontFamily: "var(--font-body, sans-serif)" }}>
            {item.label}
          </div>
          <div className="h-0.5 overflow-hidden rounded-xs bg-[rgba(0,208,178,.12)]">
            <div ref={item.barRef} className="ms-vs-fill h-full w-0 rounded-xs bg-linear-to-r from-primary to-[#00f5c8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PipelineVisual({ steps }: { steps: string[] }) {
  return (
    <div className="ms-vis-pipeline flex w-full max-w-47.5 flex-col items-center">
      {steps.map((step, i) => (
        <div key={step} className="flex w-full flex-col items-center">
          <div
            className={`ms-vp-step flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2 text-[0.78rem] font-semibold transition-all duration-[400ms]${i < 3 ? " active" : ""}`}
            style={{ fontFamily: "var(--font-body, sans-serif)" }}
          >
            <div className="ms-vp-icon text-base">□</div>
            <span>{step}</span>
          </div>
          {i < steps.length - 1 && <div className="ms-vp-line mx-auto h-3.5 w-px" />}
        </div>
      ))}
    </div>
  );
}

function PipelineVisualFilled({ steps }: { steps: string[] }) {
  return (
    <div className="ms-vis-pipeline flex w-full max-w-47.5 flex-col items-center">
      {steps.map((step, i) => (
        <div key={step} className="flex w-full flex-col items-center">
          <div
            className={`ms-vp-step flex w-full items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2 text-[0.78rem] font-semibold transition-all duration-[400ms]${i < 3 ? " active" : ""}`}
            style={{ fontFamily: "var(--font-body, sans-serif)" }}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`ms-vp-check flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border${i < 3 ? " ms-vp-check--active" : ""}`}
                aria-hidden="true"
              >
                {i < 3 ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6.25L4.75 9L10 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="ms-vp-check-dot h-1.5 w-1.5 rounded-full" />
                )}
              </span>
              <span className="truncate">{step}</span>
            </div>
            <span className="ms-vp-step-index shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.16em]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          {i < steps.length - 1 && <div className="ms-vp-line mx-auto h-3.5 w-px" />}
        </div>
      ))}
    </div>
  );
}

export default function OurMission() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const slides = isKhmer ? SLIDES_KH : SLIDES_EN;
  const bodyFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const titleFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), monospace"
    : "var(--font-hackdaddy), var(--font-noto-khmer), monospace";

  const copy = isKhmer
    ? {
        next: "បន្ទាប់",
        terminal: [
          "aof scan --target app.example.com",
          "? Running AI-powered CVSS checks...",
          "✓ 3 critical · 7 high · 12 medium",
          "? Generating PDF report via SonarQube...",
          "? Report saved: scan_report.pdf",
        ],
        stats: [
          "ទម្រង់របាយការណ៍ 5+",
          "លឿនជាងការធ្វើ Pentest ដោយដៃ",
          "MCP Protocol + SonarQube Rules",
        ],
        pipeline: ["Push Code", "Auto Scan", "AI Detect", "Report", "Fix"],
        aria: "ទៅកាន់ស្លាយ",
      }
    : {
        next: "NEXT",
        terminal: [
          "aof scan --target app.example.com",
          "? Running AI-powered CVSS checks...",
          "✓ 3 critical · 7 high · 12 medium",
          "? Generating PDF report via SonarQube...",
          "? Report saved: scan_report.pdf",
        ],
        stats: [
          "Report formats (HTML · PDF · Excel · Docs)",
          "Faster than manual pen-testing",
          "MCP Protocol + SonarQube Rules",
        ],
        pipeline: ["Push Code", "Auto Scan", "AI Detect", "Report", "Fix"],
        aria: "Go to slide",
      };

  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeIdx = useRef(0);
  const isMobile = useRef(false);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!outer || !track) return;

    const totalSlides = slides.length;

    function setSlide(idx: number) {
      if (idx === activeIdx.current && activeIdx.current !== 0) return;
      activeIdx.current = idx;
      slideRefs.current.forEach((slide, i) => slide?.classList.toggle("active", i === idx));
      dotsRef.current.forEach((dot, i) => dot?.classList.toggle("active", i === idx));
      if (counterRef.current) {
        counterRef.current.textContent =
          String(idx + 1).padStart(2, "0") + " — " + String(totalSlides).padStart(2, "0");
      }
    }

    function onScroll() {
      if (isMobile.current) return;
      if (!outer) return;
      const rect = outer.getBoundingClientRect();
      const total = outer.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      const raw = p * (totalSlides - 0.001);
      const idx = Math.min(totalSlides - 1, Math.floor(raw));
      const frac = raw - idx;
      const slideWidth = outer.clientWidth || window.innerWidth;
      if (track) track.style.transform = `translateX(${-(idx * slideWidth + frac * slideWidth)}px)`;
      if (progress) progress.style.width = p * 100 + "%";
      setSlide(idx);
    }

    function syncViewportMode() {
      isMobile.current = window.matchMedia("(max-width: 768px)").matches;

      if (isMobile.current) {
        if (track) track.style.transform = "none";
        if (progress) progress.style.width = "0%";
        setSlide(0);
        return;
      }

      onScroll();
    }

    setSlide(0);
    syncViewportMode();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncViewportMode);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncViewportMode);
    };
  }, [slides]);

  return (
    <>
      <style>{`
        .ms-section {
          --teal: #00D0B2;
          --bg: #F7F5F0;
          --text: #0a1f1a;
          --muted: #4a6e65;
          --dim: #8aada6;
          --border: rgba(0,208,178,.14);
          --font-body: ${bodyFont};
          --font-title: ${titleFont};
        }
        .dark .ms-section {
          --bg: #060c0a;
          --text: #f0faf7;
          --muted: #4d8c7e;
          --dim: #3d7068;
          --border: rgba(0,208,178,.12);
        }
        .ms-sticky { background: var(--bg); }
        .ms-bg-grid {
          background-image:
            linear-gradient(rgba(0,208,178,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,208,178,.04) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .ms-slide-dot-line {
          width: 1px;
          flex-shrink: 0;
          background: repeating-linear-gradient(to bottom, rgba(0,208,178,.35) 0px, rgba(0,208,178,.35) 4px, transparent 4px, transparent 10px);
          border-radius: 2px;
        }
        .ms-slide.active .ms-slide-dot-line {
          background: repeating-linear-gradient(to bottom, rgba(0,208,178,.7) 0px, rgba(0,208,178,.7) 4px, transparent 4px, transparent 10px);
        }
        .ms-slide-num { color: rgba(10,31,26,.08); }
        .dark .ms-slide-num { color: rgba(255,255,255,.08); }
        .ms-slide.active .ms-slide-num { color: rgba(0,208,178,.2); }
        .ms-slide-tag::before {
          content: "";
          width: 20px;
          height: 1px;
          background: #00D0B2;
          opacity: .5;
        }
        .ms-bq-bar { background: linear-gradient(180deg, #00D0B2, transparent); }
        @keyframes ms-pulse {
          0% { transform: translate(-50%,-50%) scale(1); opacity: .6; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        .ms-vis-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid rgba(0,208,178,.3);
          animation: ms-pulse 2.5s ease-out infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .ms-vt-cursor {
          display: inline-block;
          width: 7px;
          height: .9em;
          background: #00D0B2;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        .ms-vs-fill { transition: width 1.2s cubic-bezier(.4,0,.2,1) .3s; }
        .ms-pd { background: rgba(0,208,178,.2); }
        .ms-pd.active { background: #00D0B2; transform: scale(1.4); }
        .ms-vp-step {
          border-color: rgba(0,208,178,.14);
          background: rgba(0,208,178,.03);
          color: var(--dim);
        }
        .ms-vp-step.active {
          border-color: rgba(0,208,178,.35);
          background: rgba(0,208,178,.08);
          color: var(--text);
        }
        .ms-vp-check {
          border-color: rgba(0,208,178,.16);
          background: rgba(0,208,178,.05);
          color: rgba(0,208,178,.35);
        }
        .ms-vp-check--active {
          border-color: rgba(0,208,178,.4);
          background: rgba(0,208,178,.14);
          color: #00D0B2;
        }
        .ms-vp-check-dot { background: rgba(0,208,178,.35); }
        .ms-vp-step-index { color: rgba(0,208,178,.35); }
        .ms-vp-step.active .ms-vp-step-index { color: rgba(0,208,178,.7); }
        .ms-vp-icon { color: rgba(0,208,178,.3); }
        .ms-vp-step.active .ms-vp-icon { color: #00D0B2; }
        .ms-vp-line { background: rgba(0,208,178,.14); }
        @keyframes ms-dash-travel {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: -320; }
        }
        .ms-pp-animated-dash { animation: ms-dash-travel 2.8s linear infinite; }
        @keyframes ms-pp-icon-pulse {
          0% { opacity: .2; transform: scale(.9); }
          100% { opacity: .7; transform: scale(1.1); }
        }
        .ms-pp-step-icon { animation: ms-pp-icon-pulse 2s ease-in-out infinite alternate; }
        .ms-pp-step-icon--last { animation-delay: .4s; }
        .ms-copy { font-size: 16px; }
        @media (min-width: 768px) {
          .ms-copy { font-size: 18px; }
        }
        @media (min-width: 1024px) {
          .ms-copy { font-size: 20px; }
        }
        @media (max-width: 768px) {
          .ms-outer { height: auto !important; }
          .ms-sticky {
            position: relative !important;
            height: auto !important;
            overflow-x: clip;
            overflow-y: visible;
          }
          .ms-bg-grid, .ms-bg-glow { display: none; }
          .ms-top-strip {
            position: relative;
            padding: 18px 5% 12px;
            text-align: center;
          }
          .ms-track-wrap {
            position: relative;
            padding: 0;
            overflow-x: clip;
            overflow-y: visible;
            display: block;
            height: auto;
          }
          .ms-track {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: 100% !important;
            height: auto;
            transform: none !important;
          }
          .ms-slide {
            width: 100% !important;
            height: auto;
            min-height: auto;
            padding: 32px 5% 40px;
            border-bottom: 1px solid var(--border);
            overflow-x: clip;
          }
          .ms-slide-inner {
            grid-template-columns: 1fr !important;
            gap: 20px;
            width: min(100%, 34rem);
            max-width: 100%;
            margin-inline: auto;
            justify-items: center;
          }
          .ms-slide-num-col {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 16px !important;
          }
          .ms-slide-dot-line {
            width: min(100%, 72px);
            height: 1px;
            background: repeating-linear-gradient(to right, rgba(0,208,178,.4) 0px, rgba(0,208,178,.4) 4px, transparent 4px, transparent 10px);
          }
          .ms-slide-num {
            margin-left: 0;
            text-align: center;
            font-size: clamp(2.75rem, 16vw, 4rem);
          }
          .ms-slide-content,
          .ms-slide-visual,
          .ms-slide-body,
          .ms-bq {
            min-width: 0;
            max-width: 100%;
          }
          .ms-slide-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .ms-slide-tag { justify-content: center; }
          .ms-slide-body { margin-inline: auto; }
          .ms-bq {
            margin-inline: auto;
            text-align: center;
            padding-left: 0;
            padding-top: 1rem;
          }
          .ms-bq-bar {
            top: 0;
            bottom: auto;
            left: 50%;
            width: 56px;
            height: 2px;
            transform: translateX(-50%);
          }
          .ms-slide-visual {
            width: 100%;
            justify-content: center;
          }
          .ms-vis-stats { max-width: 100%; }
          .ms-vis-pipeline { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 8px; }
          .ms-vp-step { width: calc(50% - 4px); padding: 7px 10px; font-size: .72rem; }
          .ms-vp-line { display: none; }
          .ms-progress-wrap { display: none; }
          .ms-path-pointer { display: none; }
        }
        @media (max-width: 480px) {
          .ms-vp-step { width: 100%; }
        }
      `}</style>

      <div ref={outerRef} className="ms-outer ms-section relative h-[400vh] overflow-x-clip" style={{ fontFamily: bodyFont }}>
        <div className="ms-sticky sticky top-0 h-screen overflow-hidden transition-[background] duration-400">
          <div className="ms-bg-grid absolute inset-0 pointer-events-none" />
          <div className="ms-bg-glow absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,208,178,.04)_0%,transparent_70%)]" />

          <div className="ms-top-strip absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-[rgba(0,208,178,.14)] px-[4%] py-3.5">
            <span />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[rgba(0,208,178,.5)]">
              <span ref={counterRef}>01 — 04</span>
            </span>
          </div>

          <div className="ms-track-wrap absolute inset-0 flex items-center overflow-hidden pt-11 pb-11">
            <div ref={trackRef} className="ms-track flex h-full w-[400%] items-center will-change-transform">
              {slides.map((slide, i) => (
                <Fragment key={slide.num}>
                  <div
                    className={`ms-slide relative flex h-full w-[103vw] shrink-0 items-center justify-center px-[4%]${i === 0 ? " active" : ""}`}
                    ref={(el) => { slideRefs.current[i] = el; }}
                  >
                    <div className="ms-slide-inner grid w-full max-w-7xl items-center gap-9 mx-auto" style={{ gridTemplateColumns: "auto 1fr 1fr" }}>
                      <div className="ms-slide-num-col flex flex-row items-stretch overflow-visible" style={{ gap: "125px" }}>
                        <div className="ms-slide-dot-line" />
                        <div className="ms-slide-num whitespace-nowrap text-[clamp(4rem,8vw,7rem)] leading-none font-bold tracking-[-0.06em] select-none transition-colors duration-500" style={{ fontFamily: titleFont }}>
                          {slide.num}
                        </div>
                      </div>

                      <div className="ms-slide-content">
                        <div className="ms-slide-tag mb-4 flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[rgba(0,208,178,.6)]">
                          {slide.tag}
                        </div>
                        <h2 className="ms-slide-title mb-4 text-[clamp(1.8rem,3vw,3rem)] leading-[1.1] font-bold tracking-[-0.03em]" style={{ color: "var(--text)", fontFamily: titleFont }}>
                          {slide.title.map((line, lineIndex) => (
                            <Fragment key={line}>
                              {lineIndex === slide.accentIndex ? <span className="text-primary">{line}</span> : line}
                              {lineIndex < slide.title.length - 1 && <br />}
                            </Fragment>
                          ))}
                        </h2>
                        <p className="ms-slide-body ms-copy max-w-100 leading-[1.75]" style={{ color: "var(--muted)", fontFamily: bodyFont }}>
                          {slide.body}
                        </p>
                        {slide.quote && (
                          <blockquote className="ms-bq ms-copy relative mt-[1.4rem] max-w-90 pl-[1.2rem] italic leading-[1.75]" style={{ color: "var(--dim)", fontFamily: bodyFont }}>
                            <span className="ms-bq-bar absolute top-0 bottom-0 left-0 w-0.5 rounded-xs" />
                            {slide.quote}
                          </blockquote>
                        )}
                      </div>

                      <div className="ms-slide-visual flex h-full items-center justify-center">
                        {slide.visual === "shield" && <ShieldVisual />}
                        {slide.visual === "terminal" && <TerminalVisual lines={copy.terminal} />}
                        {slide.visual === "stats" && <StatsVisual active={i === 2} labels={copy.stats} />}
                        {slide.visual === "pipeline" && <PipelineVisualFilled steps={copy.pipeline} />}
                      </div>
                    </div>
                  </div>

                  {i < slides.length - 1 && (
                    <SlidePathPointer from={slides[i].num} to={slides[i + 1].num} nextLabel={copy.next} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="ms-progress-wrap absolute bottom-0 left-0 right-0 z-10 flex items-center gap-5 border-t border-[rgba(0,208,178,.14)] px-[4%] py-3">
            <div className="ms-progress-track h-px flex-1 overflow-hidden rounded-[1px] bg-[rgba(0,208,178,.1)]">
              <div ref={progressRef} className="ms-progress-fill h-full w-0 rounded-[1px] bg-primary" />
            </div>
            <div className="ms-progress-dots flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.num}
                  className={`ms-pd h-1.5 w-1.5 rounded-full border-0 p-0 cursor-pointer transition-all duration-300${i === 0 ? " active" : ""}`}
                  ref={(el) => { dotsRef.current[i] = el; }}
                  aria-label={`${copy.aria} ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

