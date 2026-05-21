"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";

const heroStyles = `
  @keyframes ph-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ph-slide-reveal {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ph-eyebrow {
    opacity: 0;
    animation: ph-fade-up .55s cubic-bezier(.16,1,.3,1) .1s forwards;
  }
  .terms-hero-title {
    opacity: 0;
    animation: ph-slide-reveal .72s cubic-bezier(.16,1,.3,1) .22s forwards;
  }
  .ph-sub {
    opacity: 0;
    animation: ph-fade-up .62s cubic-bezier(.16,1,.3,1) .38s forwards;
  }
  .ph-tags {
    opacity: 0;
    animation: ph-fade-up .55s ease .54s forwards;
  }
`;

export default function TermsOfServiceHero() {
  const t = useTranslations("termsPage.hero");
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const titleFontFamily = isKhmer
    ? 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif'
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const titleLineHeight = isKhmer ? 1.2 : 1;
  const titleLetterSpacing = isKhmer ? "0" : "-0.03em";

  return (
    <section
      className="relative overflow-hidden border-b border-black/9 dark:border-white/9 bg-white dark:bg-[#111113] min-h-[45vh] flex items-center justify-center"
      style={{ padding: "clamp(100px,14vw,160px) clamp(24px,6vw,80px) clamp(60px,8vw,96px)" }}
    >
      <style>{heroStyles}</style>

      <div className="absolute inset-0 z-0 overflow-hidden">
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
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "inset-0 h-full skew-y-12",
            "fill-[#00509E]/20 stroke-[#00509E]/20 dark:fill-[#00D0B2]/15 dark:stroke-[#00D0B2]/15",
          )}
        />
      </div>

      <div className="relative z-2 w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8 lg:gap-2">
        <div>
          <h1
            className="terms-hero-title font-bold text-[#1A1A1A] dark:text-[#EDEDED]"
            style={{
              fontFamily: titleFontFamily,
              fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
              fontWeight: isKhmer ? 800 : 700,
              lineHeight: titleLineHeight,
              letterSpacing: titleLetterSpacing,
            }}
          >
            {t("titleLine1")}<br />
            <em className="not-italic text-[#00BCA1]">{t("titleLine2")}</em>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p
            className="ph-sub leading-[1.85] text-[#5C5C5C] dark:text-[#9A9A9A] max-w-104"
            style={{ fontSize: "20px" }}
          >
            {t("subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
