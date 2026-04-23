"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useLocale, useTranslations } from "next-intl";
import img1 from "@/public/home-image/code1.webp";
import img2 from "@/public/home-image/code2.webp";
import img3 from "@/public/home-image/code3.webp";
import AnimatedCta from "./animated-cta";

interface CardData {
  title: string;
  subtitle: string;
  description: string;
  image: StaticImageData;
  accentColor: string;
  blobLeft: string;
  blobRight: string;
  borderColor: string;
  titleColor: string;
}

function getCards(t: (key: string) => string): CardData[] {
  return [
    {
      title: t("cards.consultants.title"),
      subtitle: t("cards.consultants.subtitle"),
      description: t("cards.consultants.description"),
      image: img1,
      accentColor: "#01509e",
      blobLeft: "radial-gradient(ellipse at 20% 80%, rgba(0,208,178,0.28) 0%, transparent 65%)",
      blobRight: "radial-gradient(ellipse at 85% 15%, rgba(1,80,158,0.22) 0%, transparent 60%)",
      borderColor: "rgba(1,80,158,0.18)",
      titleColor: "#01509e",
    },
    {
      title: t("cards.internalTeams.title"),
      subtitle: t("cards.internalTeams.subtitle"),
      description: t("cards.internalTeams.description"),
      image: img2,
      accentColor: "#00D0B2",
      blobLeft: "radial-gradient(ellipse at 15% 75%, rgba(0,208,178,0.32) 0%, transparent 65%)",
      blobRight: "radial-gradient(ellipse at 90% 10%, rgba(0,208,178,0.18) 0%, transparent 60%)",
      borderColor: "rgba(0,208,178,0.3)",
      titleColor: "#00a896",
    },
    {
      title: t("cards.msps.title"),
      subtitle: t("cards.msps.subtitle"),
      description: t("cards.msps.description"),
      image: img3,
      accentColor: "#01509e",
      blobLeft: "radial-gradient(ellipse at 20% 80%, rgba(1,80,158,0.2) 0%, transparent 65%)",
      blobRight: "radial-gradient(ellipse at 85% 15%, rgba(0,208,178,0.25) 0%, transparent 60%)",
      borderColor: "rgba(1,80,158,0.18)",
      titleColor: "#01509e",
    },
  ];
}

const Card: React.FC<{
  card: CardData;
  seeMore: string;
  bodyFontFamily: string;
  displayFontFamily: string;
}> = ({ card, seeMore, bodyFontFamily, displayFontFamily }) => {
  const [hovered, setHovered] = useState(false);
  const isTeal = card.accentColor.toLowerCase() === "#00d0b2";

  return (
    <div
      className="relative flex min-w-0 flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl transition-[border-color] duration-300 [--card-bg:#F7F5F0] dark:[--card-bg:#111114]"
      style={{
        background: "var(--card-bg)",
        border: `1.5px solid ${hovered ? `${card.accentColor}55` : card.borderColor}`,
        minHeight: "clamp(380px, 55vw, 480px)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-400"
        style={{
          background: `${card.blobLeft}, ${card.blobRight}`,
          opacity: hovered ? 1 : 0.75,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-1 [--glass-overlay:linear-gradient(160deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.1)_100%)] dark:[--glass-overlay:linear-gradient(160deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)]"
        style={{ background: "var(--glass-overlay)" }}
      />

      <div className="relative z-2 px-5 pb-4 pt-7 md:px-6 md:pt-8">
        <h3
          className="mb-3 text-[1.75rem] font-bold leading-tight tracking-[-0.01em] md:text-[1.9rem] lg:text-2xl"
          style={{
            color: card.titleColor,
            fontFamily: displayFontFamily,
          }}
        >
          {card.title}
          <br />
          {card.subtitle}
        </h3>

        <p
          className="mb-6 min-h-[3.6em] text-[16px] leading-relaxed text-slate-500 dark:text-slate-300 md:text-[18px] lg:text-[20px]"
          style={{ fontFamily: bodyFontFamily }}
        >
          {card.description}
        </p>

        <AnimatedCta
          className={`w-auto min-w-24 h-10.5! rounded-xl border-2 pl-4! pr-8.5! text-[15px] font-semibold font-[inherit] md:min-w-36 md:pl-4.5! md:pr-10! ${
            isTeal
              ? "border-primary bg-primary text-white hover:bg-[#00b89c]"
              : "border-[#01509e] bg-[#01509e] text-white hover:bg-[#004b92]"
          }`}
          iconClassName={
            isTeal
              ? "bg-white text-[#00D0B2] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(0,149,126,0.22)]"
              : "bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)]"
          }
          labelClassName="whitespace-nowrap"
          icon={
            <svg
              className="h-3 w-3 flex-none"
              viewBox="0 0 12 12"
              fill="none"
            >
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
          {seeMore}
        </AnimatedCta>
      </div>

      <div className="relative z-2 mt-auto w-full px-3 md:px-4 lg:px-5">
        <Image
          src={card.image}
          alt={`${card.title} ${card.subtitle}`}
          className="block w-full object-contain object-bottom"
          sizes="(max-width: 1023px) 100vw, 33vw"
          style={{ maxHeight: "min(460px, 42vh)" }}
          draggable={false}
        />
      </div>
    </div>
  );
};

const ThreeCards: React.FC = () => {
  const t = useTranslations("homepage.audience");
  const locale = useLocale();
  const bodyFontFamily =
    locale === "kh"
      ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
      : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily =
    locale === "kh"
      ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
      : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const cards = getCards(t);

  return (
    <section
      className="flex w-full flex-col items-center bg-[#F7F5F0] px-4 py-12 dark:bg-[#09090B] sm:px-5 md:px-8 md:py-14 lg:px-16 lg:py-16 xl:px-30"
      style={{ fontFamily: bodyFontFamily }}
    >
      <div className="flex w-full max-w-7xl flex-col items-start">
        <p
          className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 md:mb-8 md:text-sm"
          style={{ fontFamily: bodyFontFamily }}
        >
          {t("eyebrow")}
        </p>

        <div
          className="w-full rounded-[26px] p-[1.5px] md:rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,208,178,0.4) 0%, rgba(1,80,158,0.25) 50%, rgba(0,208,178,0.35) 100%)",
          }}
        >
          <div className="flex w-full flex-col gap-3 rounded-[20px] bg-[#F7F5F0] p-2 dark:bg-[#09090B] md:rounded-[22px] lg:flex-row">
            {cards.map((card, i) => (
              <Card
                key={i}
                card={card}
                seeMore={t("seeMore")}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeCards;
