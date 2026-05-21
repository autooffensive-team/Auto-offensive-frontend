"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export default function AiBanner() {
  const t = useTranslations("homepage.aiBanner");
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  return (
    <div className="w-full bg-[#F7F5F0] px-4 pb-8 transition-colors duration-300 dark:bg-[#09090B] sm:px-5 md:px-6">
      <div
        className="relative pt-8 md:pt-10 lg:pt-12"
        style={{ fontFamily: bodyFontFamily }}
      >
        <div className="relative flex min-h-80 items-center justify-center gap-64 overflow-hidden rounded-3xl border border-transparent bg-[#F7F5F0] px-16 py-12 dark:border-white/5 dark:bg-[#111113] max-[900px]:flex-col max-[900px]:gap-0 max-[900px]:px-8 max-[900px]:pt-10 max-[900px]:pb-56 max-[767px]:rounded-[24px] max-[767px]:px-5 max-[767px]:pt-8 max-[767px]:pb-64">
          <div className="absolute pointer-events-none -left-24 -top-32 h-96 w-md rounded-full bg-[#01509e] opacity-95 blur-3xl dark:opacity-40 max-[767px]:-left-16 max-[767px]:-top-24 max-[767px]:h-72 max-[767px]:w-72" />
          <div className="absolute pointer-events-none right-14 -top-20 h-80 w-80 rounded-full bg-[#00d0b2] opacity-50 blur-3xl dark:opacity-20 max-[767px]:right-0 max-[767px]:-top-12 max-[767px]:h-56 max-[767px]:w-56" />
          <div className="absolute pointer-events-none -bottom-32 -right-10 h-80 w-96 rounded-full bg-[#0194c7] opacity-70 blur-3xl dark:opacity-30 max-[767px]:-bottom-24 max-[767px]:-right-12 max-[767px]:h-64 max-[767px]:w-72" />
          <div className="absolute pointer-events-none left-[42%] top-[20%] h-52 w-64 rounded-full bg-[#00d0b2] opacity-20 blur-3xl dark:opacity-10 max-[900px]:left-1/2 max-[900px]:top-auto max-[900px]:bottom-24 max-[900px]:-translate-x-1/2 max-[767px]:h-40 max-[767px]:w-48" />

          <div className="relative z-10 shrink-0 max-w-xl max-[900px]:max-w-136 max-[900px]:text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-black/60 dark:text-white/50 md:text-xs max-[900px]:justify-center"
              style={{ fontFamily: "monospace" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/85 dark:bg-[#00d0b2]" />
              {t("eyebrow")}
            </div>

            <h2
              className="mb-5 text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[oklch(0.145_0_0)] dark:text-white md:text-[2.6rem] lg:text-[3.45rem]"
              style={{ fontFamily: displayFontFamily }}
            >
              <span className="block">{t("titleLine1")}</span>
              <span className="block font-extrabold text-[#01509e] dark:text-[#4fa3e5]">{t("titleLine2")}</span>
              <span className="block font-extrabold text-primary dark:text-[#00BCA1]">{t("titleLine3")}</span>
            </h2>

            <p
              className="max-w-lg text-[16px] font-normal leading-[1.75] text-[oklch(0.556_0_0)] dark:text-white/60 md:text-[18px] lg:text-[20px] max-[900px]:mx-auto"
              style={{ fontFamily: bodyFontFamily }}
            >
              {t("description")}
            </p>
          </div>

          <div
            className="shrink-0 self-stretch pointer-events-none max-[900px]:hidden"
            style={{ width: "min(26rem, 34vw)" }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center max-[900px]:flex">
            <div className="w-72 max-[767px]:w-60">
              <Image
                src="/fox.webp"
                alt="Auto Offensive mascot"
                width={960}
                height={960}
                className="h-auto w-full object-contain object-bottom drop-shadow-2xl brightness-110 dark:brightness-100"
              />
            </div>
          </div>
        </div>

        <div
          className="absolute -top-10 bottom-0 z-20 flex items-end justify-center pointer-events-none max-[900px]:hidden"
          style={{
            right: "calc(50% - min(14rem, 18vw) - 26rem)",
            width: "min(39rem, 51vw)",
          }}
        >
          <Image
            src="/fox.webp"
            alt="Auto Offensive mascot"
            width={960}
            height={960}
            className="h-auto w-full object-contain object-bottom drop-shadow-2xl brightness-110 dark:brightness-100"
          />
        </div>
      </div>
    </div>
  );
}
