"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import AnimatedCta from "./animated-cta";

export default function TeamShowcase() {
  const t = useTranslations("homepage.team");
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="bg-[#F7F5F0] pb-20 px-10 overflow-hidden"
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      <div className="max-w-300 mx-auto grid grid-cols-[1fr_1.6fr] gap-16 items-center">

        {/* ── Left: Text Content ── */}
        <div>
          {/* Label */}
          <p className="text-xs font-semibold tracking-[3px] uppercase text-[#00BCA1] mb-4">
            Our company
          </p>

          {/* Heading */}
          <h2
            className="font-bold leading-[1.18] text-[#01509e] mb-2"
            style={{
              fontFamily: "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif",
              fontSize: "clamp(28px, 3.5vw, 44px)",
            }}
          >
            <span className="block whitespace-nowrap">{t("titleLine1")}</span>
            <span className="block whitespace-nowrap text-[#00BCA1]">{t("titleLine2")}</span>
            <span className="block whitespace-nowrap">{t("titleLine3")}</span>
          </h2>

          <div
            className="my-8 h-1.5 w-24 rounded-full"
            style={{ background: "linear-gradient(90deg, #00BCA1, #01509e)" }}
          />

          {/* Paragraphs */}
            <p className="text-[15px] leading-[1.8] text-[#4a4a4a] mb-4.5">
              We launched as a team of passionate professionals — and we&apos;ve kept
              that mindset ever since. Our experts still drive product development
              today, focusing relentlessly on accuracy, speed, and control.
            </p>

          <AnimatedCta
            as="a"
            href="about-us"
            className="w-auto rounded-xl border-2 border-[#01509e] bg-[#01509e] text-[15px] font-bold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88]"
            iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
            icon={
              <svg className="h-3 w-3 flex-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L11 6L6 11M11 6H1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            {t("cta")}
          </AnimatedCta>
        </div>

        <div className="relative group">
          <div
            className="absolute z-0 rounded-[2.5rem]"
            style={{
              inset: "-20px",
              background: "linear-gradient(135deg, rgba(0,188,161,0.2) 0%, rgba(1,80,158,0.15) 100%)",
            }}
          />

          <div
            ref={imageRef}
            className="relative z-10 overflow-hidden rounded-[24px] border border-white/10"
            style={{
              boxShadow: "0 30px 70px rgba(1,80,158,0.15)",
              background: "linear-gradient(145deg, #f0f9ff, #e6fcf9)",
            }}
          >
            <div
              className="flex w-full flex-col items-center justify-center gap-4 dark:bg-[#121214]"
              style={{ aspectRatio: "16 / 10" }}
            >
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00BCA1" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm font-bold text-[#00BCA1]">{t("imagePlaceholder")}</p>
            </div>
          </div>

          <div className="absolute -left-4 -top-6 z-20 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-xl dark:border-white/5 dark:bg-[#1c1c1e]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#00BCA1] to-[#01509e]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <div>
              <p className="m-0 text-[10px] font-bold uppercase text-gray-400">{t("teamSizeLabel")}</p>
              <p className="m-0 text-lg font-black text-[#01509e] dark:text-white">{t("teamSizeValue")}</p>
            </div>
          </div>

          {/* Floating year badge — bottom-right */}
          <div
            className="absolute bottom-12 -right-4 z-2 bg-[#01509e] rounded-xl px-4.5 py-2.5"
            style={{ boxShadow: "0 8px 24px rgba(1,80,158,0.25)" }}
          >
            <p className="text-[11px] text-white/70 font-medium m-0 mb-0.5">
              Est.
            </p>
            <p className="text-xl font-bold text-white m-0">2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
