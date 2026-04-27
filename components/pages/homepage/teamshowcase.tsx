"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import AnimatedCta from "./animated-cta";
import ourTeamImage from "@/public/images/Our-team-image.webp";

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
            iconClassName="bg-white text-[#01509e] dark:bg-white dark:text-[#00BCA1]"
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

        {/* Premium Image Card with Elegant Border */}
        <div className="relative group mx-auto w-full max-w-135">
          {/* Enhanced Glow Background */}
          <div
            className="absolute left-1/2 top-1/2 z-0 h-[92%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-3xl opacity-100"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(0,188,161,0.32), transparent 40%), radial-gradient(ellipse at bottom right, rgba(1,80,158,0.28), transparent 55%)",
              filter: "blur(28px)",
            }}
          />

          {/* Decorative Corner Plus Icons */}
          <svg
            className="absolute -top-4.25 -left-4.25 z-20 size-9 text-[#01509e]/60 dark:text-[#00BCA1]/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          <svg
            className="absolute -top-4.25 -right-4.25 z-20 size-9 text-[#01509e]/60 dark:text-[#00BCA1]/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          <svg
            className="absolute -bottom-4.25 -left-4.25 z-20 size-9 text-[#01509e]/60 dark:text-[#00BCA1]/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          <svg
            className="absolute -bottom-4.25 -right-4.25 z-20 size-9 text-[#01509e]/60 dark:text-[#00BCA1]/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          {/* Top and Bottom Border Lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#01509e]/40 to-transparent dark:via-[#00BCA1]/40" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#01509e]/40 to-transparent dark:via-[#00BCA1]/40" />

          {/* Left and Right Border Lines */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#01509e]/40 to-transparent dark:via-[#00BCA1]/40" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-[#01509e]/40 to-transparent dark:via-[#00BCA1]/40" />

          {/* Center Dashed Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 border-l border-dashed border-[#01509e]/20 dark:border-[#00BCA1]/20 pointer-events-none" />

          {/* Main Card Container */}
          <div
            ref={imageRef}
            className="relative z-10 w-full overflow-hidden"
            style={{ aspectRatio: `${ourTeamImage.width} / ${ourTeamImage.height}` }}
          >
            <div
              className="relative h-full w-full overflow-hidden p-[2.5px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,188,161,0.5) 0%, rgba(1,80,158,0.35) 50%, rgba(0,188,161,0.25) 100%)",
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden"
                style={{
                  background: "transparent",
                }}
              >
                <Image
                  src={ourTeamImage}
                  alt="Our team"
                  width={ourTeamImage.width}
                  height={ourTeamImage.height}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="h-auto w-full"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Premium Established Badge */}
          <div className="absolute -right-3 bottom-10 z-30">
            <div
              className="rounded-2xl border-2 border-white/90 px-6 py-4 dark:border-white/15"
              style={{
                background:
                  "linear-gradient(135deg, #01509e 0%, #0047a3 100%)",
              }}
            >
              <p className="m-0 text-[8px] font-bold uppercase tracking-[0.15em] text-white/90">
                {t("established")}
              </p>
              <p className="m-0 text-2xl font-black text-white">
                2026
              </p>
            </div>
          </div>

          {/* Decorative Top Right Accent */}
          <div
            className="absolute -top-1 -right-1 w-24 h-24 z-5 opacity-60 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0,188,161,0.4), transparent 70%)",
              filter: "blur(24px)",
            }}
          />

          {/* Decorative Bottom Left Accent */}
          <div
            className="absolute -bottom-1 -left-1 w-28 h-28 z-5 opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(1,80,158,0.3), transparent 70%)",
              filter: "blur(28px)",
            }}
          />
        </div>
      </div>
    </section>
  );
}