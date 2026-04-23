"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import AnimatedCta from "./animated-cta";

export default function TeamShowcase() {
  const t = useTranslations("homepage.team");
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="overflow-hidden bg-[#F7F5F0] px-6 pb-20 pt-10 transition-colors duration-300 dark:bg-[#09090B] md:px-10"
      style={{ fontFamily: bodyFontFamily }}
    >
      <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1.6fr] lg:gap-20">
        <div className="relative z-10">
          <p className="mb-6 text-xs font-bold uppercase tracking-[3px] text-[#00BCA1]">
            {t("eyebrow")}
          </p>

          <h3
            className="mb-2 font-bold uppercase leading-[1.1] text-[#01509e] dark:text-white"
            style={{
              fontFamily: displayFontFamily,
              fontSize: "clamp(32px, 4.5vw, 56px)",
            }}
          >
            <span className="block whitespace-nowrap">{t("titleLine1")}</span>
            <span className="block whitespace-nowrap text-[#00BCA1]">{t("titleLine2")}</span>
            <span className="block whitespace-nowrap">{t("titleLine3")}</span>
          </h3>

          <div
            className="my-8 h-1.5 w-24 rounded-full"
            style={{ background: "linear-gradient(90deg, #00BCA1, #01509e)" }}
          />

          <div className="mb-10 space-y-6 text-base leading-relaxed text-[#4a4a4a] dark:text-gray-400 md:text-[18px] lg:text-[20px]">
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
          </div>

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

          <div className="absolute -right-4 bottom-10 z-20 rounded-2xl bg-[#01509e] px-6 py-3 shadow-xl dark:bg-[#00BCA1]">
            <p className="m-0 text-[10px] font-bold uppercase text-white/70 dark:text-black/70">{t("established")}</p>
            <p className="m-0 text-xl font-black text-white dark:text-[#09090B]">2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
