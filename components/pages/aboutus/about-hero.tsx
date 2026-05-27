"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function AboutHero() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const content = isKhmer
    ? {
        titleTop: "ស្គាល់ពី",
        titleAccent: "វេទិកា Security",
        titleBottom: "ជំនាន់ថ្មីរបស់យើង",
        subtitle:
          "Auto-Offensive គឺជា PaaS ដែលប្រើ AI ដើម្បី automate ការស្កេនសុវត្ថិភាពលើ web, network និង code — ដោយមិនចាំបាច់ដំឡើង CLI ឬ setup អ្វីឡើយ។",
        ctaButton: "↓ ស្វែងយល់រឿងរ៉ាវរបស់យើង",
        stats: ["ទម្រង់របាយការណ៍", "ស្កេនលឿនជាងមុន", "ត្រៀមសម្រាប់ API", "MCP + SonarQube"],
        scroll: "រំកិល",
      }
    : {
        titleTop: "Meet Our",
        titleAccent: "Next-Gen",
        titleBottom: "Security Platform",
        subtitle:
          "Auto-Offensive is a PaaS that automates web, network and code security scanning powered by AI, with zero CLI setup required.",
        ctaButton: "↓ Discover Our Story",
        stats: ["Report Formats", "Faster Scanning", "API Ready", "MCP + SonarQube"],
        scroll: "Scroll",
      };

  const bodyFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const titleFont = isKhmer
    ? "var(--font-hanuman), var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), monospace";
  const titleLineHeight = isKhmer ? 1.2 : 1.08;
  const titleTracking = isKhmer ? "-0.02em" : "-0.04em";
  const ctaText = isKhmer ? "ស្វែងយល់រឿងរ៉ាវរបស់យើង" : "Discover Our Story";

  const hl0Ref = useRef<HTMLSpanElement>(null);
  const hl1Ref = useRef<HTMLSpanElement>(null);
  const hl2Ref = useRef<HTMLSpanElement>(null);
  const hsubRef = useRef<HTMLParagraphElement>(null);
  const hbtnsRef = useRef<HTMLDivElement>(null);
  const hstatsRef = useRef<HTMLDivElement>(null);
  const counter1Ref = useRef<HTMLSpanElement>(null);
  const counter2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      [hl0Ref, hl1Ref, hl2Ref].forEach((ref, n) =>
        setTimeout(() => ref.current?.classList.add("in"), 180 + n * 110)
      );
      setTimeout(() => hsubRef.current?.classList.add("in"), 520);
      setTimeout(() => hbtnsRef.current?.classList.add("in"), 660);
      setTimeout(() => {
        hstatsRef.current?.classList.add("in");
        const countUp = (el: HTMLSpanElement | null, target: number) => {
          if (!el) return;
          const duration = 1100;
          let start: number | null = null;
          const frame = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            el.textContent = String(Math.floor(p * p * (3 - 2 * p) * target));
            if (p < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        };
        countUp(counter1Ref.current, 5);
        countUp(counter2Ref.current, 3);
      }, 860);
    }, 80);

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        .ao-hli { transform: translateY(112%); }
        .ao-hli.in { transform: translateY(0); transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .ao-sub { opacity: 0; transform: translateY(8px); }
        .ao-sub.in { opacity: 1; transform: translateY(0); transition: opacity .65s .5s, transform .65s .5s cubic-bezier(.16,1,.3,1); }
        .ao-btns { opacity: 0; }
        .ao-btns.in { opacity: 1; transition: opacity .55s .68s; }
        .ao-stats { opacity: 0; }
        .ao-stats.in { opacity: 1; transition: opacity .55s .88s; }
        @keyframes ao-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }
        .ao-scroll {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          animation: ao-bob 2.5s ease-in-out infinite;
        }
        .ripple-button {
          position: relative;
          isolation: isolate;
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
          background-color: rgba(0, 208, 178, 0.12);
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
          background-color: rgba(0, 208, 178, 0.42);
          border-radius: 50%;
          display: block;
          transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
          z-index: -1;
        }
        .ripple-button:hover {
          border-color: #39bda7;
          box-shadow:
            0 0 0 1px rgba(0, 208, 178, 0.14),
            0 10px 24px rgba(0, 208, 178, 0.14);
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
          background-color: rgba(0, 208, 178, 0.88);
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }
        .ripple-button:hover:after {
          top: -45%;
          background-color: #00d0b2;
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }
        .dark .ripple-button {
          box-shadow: none;
        }
        .dark .ripple-button:before {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .dark .ripple-button:after {
          background-color: #39bda7;
        }
        .dark .ripple-button:hover {
          border-color: #39bda7;
        }
        .dark .ripple-button:hover:before,
        .dark .ripple-button:hover:after {
          background-color: #39bda7;
        }
        .ao-content {
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
        }
        .ao-body-text {
          font-size: 16px;
        }
        .ao-stat-value {
          font-size: clamp(1.75rem, 3vw, 2.15rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 0.45rem;
          color: oklch(0.145 0 0);
        }
        .dark .ao-stat-value {
          color: oklch(0.985 0 0);
        }
        .ao-stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          line-height: 1.5;
          text-transform: uppercase;
          color: oklch(0.708 0 0);
        }
        .dark .ao-stat-label {
          color: oklch(0.556 0 0);
        }
        .ao-stats-grid {
          width: min(100%, 660px);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .ao-stat-card {
          padding: 1.35rem 1.5rem;
          text-align: center;
          min-height: 88px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ao-stat-card + .ao-stat-card {
          border-left: 1px solid color-mix(in srgb, #00D0B2 15%, transparent);
        }
        @media (min-width: 768px) {
          .ao-body-text {
            font-size: 18px;
          }
        }
        @media (min-width: 1024px) {
          .ao-body-text {
            font-size: 20px;
          }
        }
        @media (max-width: 900px) {
          .ao-stat-card {
            padding: 1.15rem 1rem;
          }
        }
        @media (max-width: 767px) {
          .ao-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: min(100%, 420px);
          }
          .ao-stat-card {
            min-height: 104px;
            padding: 1.1rem 0.9rem;
          }
          .ao-stat-card + .ao-stat-card {
            border-left: none;
          }
          .ao-stat-card:nth-child(odd) {
            border-right: 1px solid color-mix(in srgb, #00D0B2 15%, transparent);
          }
          .ao-stat-card:nth-child(-n + 2) {
            border-bottom: 1px solid color-mix(in srgb, #00D0B2 15%, transparent);
          }
          .ao-stat-label {
            font-size: 0.68rem;
          }
          .ao-scroll {
            bottom: 18px;
          }
        }
      `}</style>

      <section
        className="
          about-hero ao-hero
          relative min-h-screen overflow-hidden
          flex flex-col items-center justify-center text-center
          px-[6%] py-25
          bg-white dark:bg-[oklch(0.145_0_0)]
          text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
          transition-[background] duration-400
        "
        style={{ fontFamily: bodyFont }}
      >
        <div className="absolute inset-0 z-0">
          <GridPattern
            width={40}
            height={40}
            x={-1}
            y={-1}
            squares={[
              [4, 4],
              [5, 1],
              [8, 2],
              [5, 3],
              [5, 5],
              [10, 10],
              [12, 15],
              [15, 10],
              [10, 15],
              [13, 8],
              [7, 12],
              [16, 5],
            ]}
            className={cn(
              "mask-[radial-gradient(600px_circle_at_center,white,transparent)]",
              "inset-0 h-full skew-y-12",
              "fill-secondary-start/20 stroke-secondary-start/20 dark:fill-primary/15 dark:stroke-primary/15",
            )}
          />
        </div>

        <div className="ao-content relative z-10 flex flex-col items-center">
          <h1
            className="about-hero-title mb-[1.4rem] max-w-225 text-[clamp(2.6rem,6vw,5.25rem)] text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]"
            style={{
              fontFamily: titleFont,
              fontWeight: isKhmer ? 800 : 700,
              lineHeight: titleLineHeight,
              letterSpacing: titleTracking,
            }}
          >
            <span className={cn("block", !isKhmer && "overflow-hidden")}>
              <span ref={hl0Ref} className="ao-hli block">{content.titleTop}</span>
            </span>
            <span className={cn("block", !isKhmer && "overflow-hidden")}>
              <span ref={hl1Ref} className="ao-hli block">
                <span className="text-primary">{content.titleAccent}</span>
              </span>
            </span>
            <span className={cn("block", !isKhmer && "overflow-hidden")}>
              <span ref={hl2Ref} className="ao-hli block">
                <span className="font-light text-[#01509e] dark:text-[#01509e]">{content.titleBottom}</span>
              </span>
            </span>
          </h1>

          <p
            ref={hsubRef}
            className="ao-sub ao-body-text mb-[2.4rem] mx-auto max-w-125 leading-[1.8] text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]"
          >
            {content.subtitle}
          </p>

          <div ref={hbtnsRef} className="ao-btns mb-[3.2rem] flex flex-wrap items-center justify-center gap-2.5 md:mb-[3.8rem]">
            <a
              href="#team-footer-section"
              className="ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.45)] bg-[rgba(255,255,255,0.95)] px-6 py-3.5 text-[14px] font-bold leading-none text-black transition-all duration-200 hover:-translate-y-px dark:border-[rgba(0,208,178,0.2)] dark:bg-[rgba(0,208,178,0.06)] dark:text-white md:px-7 md:py-3.5 md:text-[15px]"
            >
              <ChevronDown size={18} strokeWidth={2.6} aria-hidden="true" />
              <span className="whitespace-nowrap">{ctaText}</span>
            </a>
          </div>

          <div ref={hstatsRef} className="ao-stats ao-stats-grid overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,#00D0B2_15%,transparent)]">
            <div className="ao-stat-card">
              <div className="ao-stat-value"><span ref={counter1Ref}>0</span><span className="text-primary">+</span></div>
              <div className="ao-stat-label">{content.stats[0]}</div>
            </div>
            <div className="ao-stat-card">
              <div className="ao-stat-value"><span ref={counter2Ref}>0</span><span className="text-primary">x</span></div>
              <div className="ao-stat-label">{content.stats[1]}</div>
            </div>
            <div className="ao-stat-card">
              <div className="ao-stat-value">CI/<span className="text-primary">CD</span></div>
              <div className="ao-stat-label">{content.stats[2]}</div>
            </div>
            <div className="ao-stat-card">
              <div className="ao-stat-value"><span className="text-primary">AI</span></div>
              <div className="ao-stat-label">{content.stats[3]}</div>
            </div>
          </div>
        </div>

        <div className="ao-scroll pointer-events-none flex flex-col items-center gap-1.5">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[oklch(0.708_0_0)] dark:text-[oklch(0.556_0_0)]">
            {content.scroll}
          </span>
          <div
            className="h-7 w-px"
            style={{ background: "linear-gradient(to bottom, color-mix(in srgb, #00D0B2 40%, transparent), transparent)" }}
          />
        </div>
      </section>
    </>
  );
}
