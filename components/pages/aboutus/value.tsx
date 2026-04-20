"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

const VALUES_EN = [
  {
    tag: "Value 01",
    title: "<span class='vdf-t'>Automation</span> First",
    body: "Click, don't type. Every scan, report, detection accessible through a clean Web UI. No terminal required.",
    pill: "Web UI over CLI",
    prog: "95%",
  },
  {
    tag: "Value 02",
    title: "<span class='vdf-t'>Transparent</span> Intelligence",
    body: "Every CVSS score, every finding, every generated report fully explained in plain language. No black boxes.",
    pill: "Json · PDF · Excel · Docs",
    prog: "88%",
  },
  {
    tag: "Value 03",
    title: "Built for <span class='vdf-t'>Builders</span>",
    body: "CI/CD-ready API from day one. Integrate into GitHub, GitLab or Jenkins and shift security left effortlessly.",
    pill: "CI/CD · API · GitHub",
    prog: "92%",
  },
  {
    tag: "Value 04",
    title: "<span class='vdf-t'>AI-Powered</span> Accuracy",
    body: "SonarQube rules plus an AI MCP agent that learns from real-world patterns for smarter and more accurate scans.",
    pill: "MCP Agent · SonarQube",
    prog: "97%",
  },
];

const VALUES_KH = [
  {
    tag: "តម្លៃ 01",
    title: "<span class='vdf-t'>ស្វ័យប្រវត្តិ</span> ជាចម្បង",
    body: "គ្រាន់តែចុច មិនចាំបាច់វាយបញ្ជាទេ។ ការស្កេន របាយការណ៍ និងការរកឃើញទាំងអស់ ប្រើបានតាម Web UI ងាយស្រួល។",
    pill: "Web UI ជំនួស CLI",
    prog: "95%",
  },
  {
    tag: "តម្លៃ 02",
    title: "<span class='vdf-t'>ភាពច្បាស់លាស់</span> នៃព័ត៌មាន",
    body: "ពិន្ទុ CVSS លទ្ធផលរកឃើញ និងរបាយការណ៍ទាំងអស់ ត្រូវបានពន្យល់ដោយភាសាងាយយល់ ដោយមិនលាក់លៀម។",
    pill: "Json · PDF · Excel · Docs",
    prog: "88%",
  },
  {
    tag: "តម្លៃ 03",
    title: "បង្កើតសម្រាប់<span class='vdf-t'>អ្នកអភិវឌ្ឍ</span>",
    body: "API ដែលត្រៀមសម្រាប់ CI/CD តាំងពីដំបូង អាចភ្ជាប់ជាមួយ GitHub, GitLab ឬ Jenkins បានយ៉ាងងាយ។",
    pill: "CI/CD · API · GitHub",
    prog: "92%",
  },
  {
    tag: "តម្លៃ 04",
    title: "<span class='vdf-t'>AI-Powered</span> កាន់តែត្រឹមត្រូវ",
    body: "រួមបញ្ចូលច្បាប់ SonarQube និង AI MCP agent ដែលរៀនពីលំនាំពិតៗ ដើម្បីឱ្យការស្កេនឆ្លាតវៃ និងត្រឹមត្រូវជាងមុន។",
    pill: "MCP Agent · SonarQube",
    prog: "97%",
  },
];

export default function Values() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const values = isKhmer ? VALUES_KH : VALUES_EN;
  const bodyFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const titleFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), monospace"
    : "var(--font-hackdaddy), var(--font-noto-khmer), monospace";

  const ui = isKhmer
    ? {
        eyebrow: "តម្លៃស្នូល",
        titleTop: "ស្ថាបនាលើ",
        titleAccent: "គោលការណ៍",
        titleBottom: "ដែលសំខាន់ពិតៗ",
        subtitle:
          "មុខងារទាំងអស់ដែលយើងបង្កើត ត្រលប់ទៅគោលជំនឿទាំងបួននេះអំពីអ្វីដែលឧបករណ៍សុវត្ថិភាពល្អគួរតែមាន។",
        counter: "01 / 04",
        bgLabel: "VALUES",
      }
    : {
        eyebrow: "Core Values",
        titleTop: "Built on",
        titleAccent: "principles",
        titleBottom: "that matter",
        subtitle:
          "Every feature we ship maps back to one of these four beliefs about what great security tooling should be.",
        counter: "01 / 04",
        bgLabel: "VALUES",
      };

  const sectionRef = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLDivElement>(null);
  const drumWrapRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const facesBuilt = useRef(false);

  useEffect(() => {
    const drum = drumRef.current;
    if (drum) drum.innerHTML = "";
    facesBuilt.current = false;
  }, [locale]);

  useEffect(() => {
    const section = sectionRef.current;
    const drum = drumRef.current;
    const vw = drumWrapRef.current;
    if (!section || !drum || !vw) return;

    const isMobile = window.innerWidth <= 768;
    const totalFaces = values.length;

    if (isMobile) {
      if (facesBuilt.current) return;
      facesBuilt.current = true;
      vw.style.cssText = "height:auto;overflow:visible;";
      drum.style.cssText = "height:auto;transform:none;display:flex;flex-direction:column;gap:10px;";
      values.forEach((value, i) => {
        const el = document.createElement("div");
        el.className = "vs-drum-face" + (i === 0 ? " is-active" : "");
        el.innerHTML = `
          <div class="vdf-tag">${value.tag}</div>
          <h3 class="vdf-title">${value.title}</h3>
          <p class="vdf-body">${value.body}</p>
          <span class="vdf-pill">${value.pill}</span>
          <div class="vdf-bar"><div class="vdf-bar-fill" style="width:${value.prog}"></div></div>
        `;
        drum.appendChild(el);
      });
      return;
    }

    if (facesBuilt.current) return;
    facesBuilt.current = true;

    const faceHeight = 320;
    const radius = Math.round(faceHeight / (2 * Math.tan(Math.PI / totalFaces)));

    vw.style.cssText = `perspective:1200px;perspective-origin:50% 50%;width:100%;height:${faceHeight}px;position:relative;`;
    drum.style.cssText = `position:relative;width:100%;height:${faceHeight}px;transform-style:preserve-3d;will-change:transform;`;

    values.forEach((value, i) => {
      const el = document.createElement("div");
      el.className = "vs-drum-face" + (i === 0 ? " is-active" : "");
      el.id = "vdf" + i;
      el.style.transform = `rotateX(${-(360 / totalFaces) * i}deg) translateZ(${radius}px)`;
      el.innerHTML = `
        <div class="vdf-tag">${value.tag}</div>
        <h3 class="vdf-title">${value.title}</h3>
        <p class="vdf-body">${value.body}</p>
        <span class="vdf-pill">${value.pill}</span>
        <div class="vdf-bar"><div class="vdf-bar-fill" style="width:${value.prog}"></div></div>
        <div class="vdf-bg-num">${String(i + 1).padStart(2, "0")}</div>
      `;
      drum.appendChild(el);
    });

    let targetAngle = 0;
    let currentAngle = 0;
    let activeFace = 0;
    let rafId = 0;

    function activate(idx: number) {
      if (idx === activeFace) return;
      document.getElementById("vdf" + activeFace)?.classList.remove("is-active");
      document.getElementById("vdf" + idx)?.classList.add("is-active");
      if (counterRef.current) {
        counterRef.current.textContent =
          String(idx + 1).padStart(2, "0") + " / " + String(totalFaces).padStart(2, "0");
      }
      activeFace = idx;
    }

    function tick() {
      if (!drum) return;
      currentAngle += (targetAngle - currentAngle) * 0.08;
      drum.style.transform = `rotateX(${currentAngle}deg)`;
      const norm = ((-currentAngle) % 360 + 360) % 360;
      const faceIndex = Math.round(norm / (360 / totalFaces)) % totalFaces;
      activate(faceIndex);
      rafId = requestAnimationFrame(tick);
    }

    function onScroll() {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      targetAngle = -(p * (totalFaces - 0.001) * (360 / totalFaces));
    }

    rafId = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [values]);

  return (
    <>
      <style>{`
        @keyframes vs-float-1 {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-12px, 10px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes vs-float-2 {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(10px, -12px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes vs-blob-in-1 {
          0% { opacity: 0; transform: scale(0.78); }
          45% { opacity: 0.75; transform: scale(1.06); }
          70% { opacity: 1; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes vs-blob-in-2 {
          0% { opacity: 0; transform: scale(0.7); }
          45% { opacity: 0.7; transform: scale(1.08); }
          70% { opacity: 1; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        .vs-section {
          --teal: #00D0B2;
          --bg: #F7F5F0;
          --text: #0a1f1a;
          --muted: #4a6e65;
          --dim: #8aada6;
          --border: rgba(0,208,178,.14);
        }
        .dark .vs-section {
          --bg: #060c0a;
          --text: #f0faf7;
          --muted: #4d8c7e;
          --dim: #3d7068;
          --border: rgba(0,208,178,.12);
        }
        .vs-outer { height: 200vh; position: relative; }
        .vs-drum-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
          transition: background .4s;
        }
        .vs-drum-sticky::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 62% 52% at 50% 46%, color-mix(in srgb, #00D0B2 6%, transparent) 0%, transparent 72%);
          z-index: 0;
        }
        .vs-shell {
          width: 100%;
          max-width: 80rem;
          height: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .vs-blobs {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .vs-blob {
          position: absolute;
          filter: blur(70px);
          border-radius: 9999px;
          will-change: transform, opacity;
        }
        .vs-blob-1 {
          width: 420px;
          height: 300px;
          left: -100px;
          bottom: 4%;
          background: linear-gradient(135deg, rgba(1,80,158,0.16), rgba(0,208,178,0.12));
          opacity: 0;
          animation:
            vs-blob-in-1 1.9s cubic-bezier(.34,1.4,.64,1) .05s forwards,
            vs-float-1 20s ease-in-out 1.95s infinite;
        }
        .vs-blob-2 {
          width: 360px;
          height: 260px;
          right: -60px;
          top: 10%;
          background: linear-gradient(135deg, rgba(0,208,178,0.11), rgba(1,80,158,0.18));
          opacity: 0;
          animation:
            vs-blob-in-2 2.1s cubic-bezier(.34,1.4,.64,1) .15s forwards,
            vs-float-2 24s ease-in-out 2.2s infinite;
        }
        .vs-blob-3 {
          width: 260px;
          height: 220px;
          right: 18%;
          bottom: 8%;
          background: radial-gradient(circle, rgba(1,80,158,0.14) 0%, rgba(0,208,178,0.08) 100%);
          opacity: .65;
          animation: vs-float-1 22s ease-in-out .4s infinite;
        }
        .dark .vs-blob-1 {
          background: linear-gradient(135deg, rgba(1,80,158,0.22), rgba(0,208,178,0.12));
        }
        .dark .vs-blob-2 {
          background: linear-gradient(135deg, rgba(0,208,178,0.1), rgba(1,80,158,0.24));
        }
        .dark .vs-blob-3 {
          background: radial-gradient(circle, rgba(1,80,158,0.18) 0%, rgba(0,208,178,0.08) 100%);
        }
        .vs-grid {
          display: grid;
          grid-template-columns: 38% 62%;
          height: 100vh;
          align-items: stretch;
        }
        .vs-left {
          display: flex;
          align-items: center;
          padding: 0 8% 0 6%;
          border-right: 1px solid var(--border);
          position: relative;
          z-index: 2;
        }
        .vs-left-inner { max-width: 380px; }
        .vs-eyebrow {
          font-size: .62rem;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(0,208,178,.6);
          margin-bottom: 1.4rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vs-eyebrow::before {
          content: "";
          width: 22px;
          height: 1.5px;
          background: #00D0B2;
          border-radius: 2px;
          opacity: .5;
          display: inline-block;
        }
        .vs-title {
          font-size: clamp(2rem, 3vw, 2.8rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -.03em;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .vs-title-ac { color: var(--teal); }
        .vs-sub {
          color: var(--muted);
          line-height: 1.78;
          font-weight: 400;
          margin-bottom: 2rem;
        }
        .vs-counter {
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .12em;
          color: rgba(0,208,178,.45);
          text-transform: uppercase;
          padding: 8px 14px;
          border: 1px solid rgba(0,208,178,.14);
          border-radius: 100px;
          display: inline-block;
        }
        .vs-right {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          min-height: 100vh;
        }
        .vs-bg-label {
          position: absolute;
          font-size: clamp(5rem, 11vw, 10rem);
          font-weight: 700;
          letter-spacing: -.06em;
          color: rgba(10,31,26,.03);
          text-transform: uppercase;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          line-height: 1;
        }
        .dark .vs-bg-label { color: rgba(255,255,255,.025); }
        .vs-h-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
          top: 50%;
        }
        .vs-drum-face {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 10%;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .vdf-tag {
          font-size: .62rem;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #00D0B2;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vdf-tag::before {
          content: "";
          width: 16px;
          height: 1.5px;
          background: #00D0B2;
          border-radius: 2px;
          display: inline-block;
        }
        .vdf-title {
          font-size: clamp(1.8rem, 3.2vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -.03em;
          color: var(--text);
          margin-bottom: .9rem;
          line-height: 1.1;
        }
        .vdf-t { color: #00D0B2; }
        .vdf-body {
          color: var(--muted);
          line-height: 1.82;
          max-width: 420px;
        }
        .vs-copy { font-size: 16px; }
        @media (min-width: 768px) {
          .vs-copy { font-size: 18px; }
        }
        @media (min-width: 1024px) {
          .vs-copy { font-size: 20px; }
        }
        .vdf-pill {
          display: inline-block;
          margin-top: 1rem;
          font-size: .62rem;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #00D0B2;
          background: rgba(0,208,178,.09);
          border-radius: 100px;
          padding: 3px 10px;
        }
        .vdf-bar {
          margin-top: 1rem;
          height: 2px;
          background: rgba(0,208,178,.1);
          border-radius: 2px;
          overflow: hidden;
          width: 180px;
        }
        .vdf-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00D0B2, #00f0c4);
          border-radius: 2px;
        }
        .vdf-bg-num {
          position: absolute;
          right: 4%;
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(8rem, 15vw, 13rem);
          font-weight: 700;
          letter-spacing: -.06em;
          color: rgba(10,31,26,.03);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          transition: color .6s ease;
        }
        .dark .vdf-bg-num { color: rgba(255,255,255,.03); }
        .vs-drum-face.is-active .vdf-bg-num { color: rgba(0,208,178,.07); }
        @media (max-width: 768px) {
          .vs-outer { height: auto !important; }
          .vs-drum-sticky { position: relative !important; height: auto !important; overflow: visible; }
          .vs-grid { display: flex; flex-direction: column; height: auto; padding: 40px 5%; gap: 28px; }
          .vs-left { padding: 0 0 24px; border-right: none; border-bottom: 1px solid var(--border); }
          .vs-left-inner { max-width: 100%; }
          .vs-title { font-size: clamp(1.8rem, 6vw, 2.4rem); }
          .vs-counter { display: none; }
          .vs-right { min-height: auto; overflow: visible; }
          .vs-bg-label, .vs-h-line { display: none; }
          .vs-drum-face {
            position: relative !important;
            transform: none !important;
            backface-visibility: visible !important;
            -webkit-backface-visibility: visible !important;
            height: auto !important;
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 22px 18px;
            opacity: 1 !important;
            background: rgba(0,208,178,.02);
          }
          .vs-drum-face.is-active {
            border-color: rgba(0,208,178,.3);
            background: rgba(0,208,178,.04);
          }
          .vdf-bg-num { display: none; }
          .vdf-title { font-size: clamp(1.3rem, 4.5vw, 1.7rem); }
          .vdf-body { max-width: 100%; }
          .vs-blob-1 { width: 240px; height: 180px; left: -80px; top: 6%; bottom: auto; }
          .vs-blob-2 { width: 220px; height: 160px; right: -70px; top: 24%; }
          .vs-blob-3 { width: 180px; height: 150px; right: -30px; bottom: 10%; }
        }
      `}</style>

      <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,208,178,.15),transparent)" }} />

      <div ref={sectionRef} className="vs-outer vs-section" style={{ fontFamily: bodyFont }}>
        <div className="vs-drum-sticky">
          <div className="vs-blobs" aria-hidden="true">
            <div className="vs-blob vs-blob-1" />
            <div className="vs-blob vs-blob-2" />
            <div className="vs-blob vs-blob-3" />
          </div>
          <div className="vs-shell">
            <div className="vs-grid">
              <div className="vs-left">
                <div className="vs-left-inner">
                  <div className="vs-eyebrow">{ui.eyebrow}</div>
                  <h2 className="vs-title" style={{ fontFamily: titleFont }}>
                    {ui.titleTop} <span className="vs-title-ac">{ui.titleAccent}</span>
                    <br />
                    {ui.titleBottom}
                  </h2>
                  <p className="vs-sub vs-copy">{ui.subtitle}</p>
                  <div className="vs-counter" ref={counterRef}>{ui.counter}</div>
                </div>
              </div>

              <div className="vs-right">
                <div className="vs-bg-label" style={{ fontFamily: titleFont }}>{ui.bgLabel}</div>
                <div className="vs-h-line" />
                <div ref={drumWrapRef} style={{ width: "100%", position: "relative" }}>
                  <div ref={drumRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,208,178,.15),transparent)" }} />
    </>
  );
}
