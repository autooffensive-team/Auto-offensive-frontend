"use client";

import React, { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useSessionHealth } from "@/hooks/use-session-health";
import { useTheme } from "@/components/theme-provider";
import img1 from "@/public/home-image/code1.webp";
import img2 from "@/public/home-image/code2.webp";
import img3 from "@/public/home-image/code3.webp";

interface CardData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: StaticImageData;
  accentColor: string;
  checkColor: string;
  bgGradient: string;
  bgGradientLight: string;
  borderColor: string;
  borderColorLight: string;
  titleColor: string;
  titleColorLight: string;
  ctaColor: string;
  ctaTextColor: string;
  scanMode: "basic" | "medium" | "advanced";
}

function getCards(t: ReturnType<typeof useTranslations>): CardData[] {
  return [
    {
      id: "basic-scan",
      title: t("cards.consultants.title"),
      subtitle: t("cards.consultants.subtitle"),
      description: t("cards.consultants.description"),
      features: t.raw("cards.consultants.features") as string[],
      image: img1,
      accentColor: "#e05a5a",
      checkColor: "#e07070",
      bgGradient:
        "radial-gradient(ellipse at 30% 0%, rgba(90,20,20,0.95) 0%, rgba(30,10,40,0.98) 50%, rgba(15,10,30,1) 100%)",
      bgGradientLight:
        "radial-gradient(ellipse at 30% 0%, rgba(255,220,215,0.9) 0%, rgba(250,235,232,0.7) 40%, rgba(247,245,240,1) 100%)",
      borderColor: "rgba(200,80,80,0.25)",
      borderColorLight: "rgba(200,80,80,0.35)",
      titleColor: "#e07a7a",
      titleColorLight: "#b83a3a",
      ctaColor: "#d4a017",
      ctaTextColor: "#1a1000",
      scanMode: "basic",
    },
    {
      id: "medium-scan",
      title: t("cards.internalTeams.title"),
      subtitle: t("cards.internalTeams.subtitle"),
      description: t("cards.internalTeams.description"),
      features: t.raw("cards.internalTeams.features") as string[],
      image: img2,
      accentColor: "#4a8fd4",
      checkColor: "#5a9fe4",
      bgGradient:
        "radial-gradient(ellipse at 50% 0%, rgba(15,40,80,0.98) 0%, rgba(10,25,55,0.99) 50%, rgba(8,15,40,1) 100%)",
      bgGradientLight:
        "radial-gradient(ellipse at 50% 0%, rgba(210,230,255,0.85) 0%, rgba(230,240,252,0.6) 40%, rgba(247,245,240,1) 100%)",
      borderColor: "rgba(74,143,212,0.3)",
      borderColorLight: "rgba(74,143,212,0.35)",
      titleColor: "#6aaae8",
      titleColorLight: "#2a6ab8",
      ctaColor: "#d4a017",
      ctaTextColor: "#1a1000",
      scanMode: "medium",
    },
    {
      id: "advanced-scan",
      title: t("cards.msps.title"),
      subtitle: t("cards.msps.subtitle"),
      description: t("cards.msps.description"),
      features: t.raw("cards.msps.features") as string[],
      image: img3,
      accentColor: "#7a8a9a",
      checkColor: "#8a9aaa",
      bgGradient:
        "radial-gradient(ellipse at 70% 0%, rgba(30,35,45,0.98) 0%, rgba(20,25,35,0.99) 50%, rgba(12,15,22,1) 100%)",
      bgGradientLight:
        "radial-gradient(ellipse at 70% 0%, rgba(220,225,235,0.85) 0%, rgba(232,235,240,0.6) 40%, rgba(247,245,240,1) 100%)",
      borderColor: "rgba(120,140,160,0.2)",
      borderColorLight: "rgba(100,120,150,0.3)",
      titleColor: "#c8d4e0",
      titleColorLight: "#3a4a5a",
      ctaColor: "#d4a017",
      ctaTextColor: "#1a1000",
      scanMode: "advanced",
    },
  ];
}

function getDesktopColumns(activeCardId: string | null) {
  switch (activeCardId) {
    case "basic-scan":
      return "1.85fr 0.72fr 0.72fr";
    case "medium-scan":
      return "0.72fr 1.85fr 0.72fr";
    case "advanced-scan":
      return "0.72fr 0.72fr 1.85fr";
    default:
      return "1fr 1fr 1fr";
  }
}

const CheckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg
    className="mt-0.75 h-4 w-4 flex-none"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8.5L6.5 12L13 5"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Card: React.FC<{
  card: CardData;
  seeMore: string;
  seeLess: string;
  bodyFontFamily: string;
  displayFontFamily: string;
  expanded: boolean;
  hasActiveCard: boolean;
  isDark: boolean;
  onToggle: () => void;
  onStartNow: () => void;
}> = ({
  card,
  seeMore,
  seeLess,
  bodyFontFamily,
  displayFontFamily,
  expanded,
  hasActiveCard,
  isDark,
  onToggle,
  onStartNow,
}) => {
  const [hovered, setHovered] = useState(false);
  const keepLargeSideImage = hasActiveCard && !expanded;

  const bgGradient = isDark ? card.bgGradient : card.bgGradientLight;
  const borderColor = isDark ? card.borderColor : card.borderColorLight;
  const titleColor = isDark ? card.titleColor : card.titleColorLight;

  // Light mode glow shadow for that "aura" feel
  const lightBoxShadow = !isDark
    ? `0 4px 24px -4px ${card.accentColor}20, 0 0 48px -12px ${card.accentColor}15, inset 0 1px 0 0 rgba(255,255,255,0.8)`
    : undefined;

  return (
    <div
      className="group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-180"
      style={{
        background: bgGradient,
        border: `1px solid ${hovered || expanded ? borderColor.replace("0.2", "0.5").replace("0.25", "0.5").replace("0.3", "0.55").replace("0.35", "0.6") : borderColor}`,
        boxShadow: lightBoxShadow,
        // On mobile: auto height so content fits naturally. On desktop: fixed height via lg:h-180.
        minHeight: "auto",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle top shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accentColor}${isDark ? "55" : "60"}, transparent)`,
          opacity: hovered || expanded ? 1 : isDark ? 0.4 : 0.7,
          transition: "opacity 0.4s",
        }}
      />

      {/* Light mode: colored aura glow at top */}
      {!isDark && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${card.accentColor}18 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Light mode: subtle inner border glow */}
      {!isDark && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 30px -10px ${card.accentColor}12`,
          }}
        />
      )}

      {/* Noise grain overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content — on mobile pb-8 is enough since there's no image; on desktop keep original pb-3 */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-8 md:px-7 md:pt-9 lg:px-8 lg:pb-3 lg:pt-10">
        {/* Title */}
        <h3
          className="mb-3 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-[1.85rem] lg:text-[1.95rem]"
          style={{
            color: titleColor,
            fontFamily: displayFontFamily,
            textShadow: isDark ? `0 0 40px ${card.accentColor}40` : `0 0 20px ${card.accentColor}25`,
          }}
        >
          <span className="whitespace-nowrap">
            {card.title} {card.subtitle}
          </span>
        </h3>

        <p
          className="mb-5 text-[15px] leading-relaxed text-white/50 md:text-[16px] lg:min-h-[4.8em] lg:text-[17px]"
          style={{ fontFamily: bodyFontFamily, color: isDark ? undefined : "rgba(60,60,70,0.7)" }}
        >
          {card.description}
        </p>

        {/* Toggle button */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${card.id}-details`}
          onClick={onToggle}
          className="inline-flex h-11 w-fit items-center gap-3 rounded-xl border px-5 text-[14px] font-semibold backdrop-blur-sm transition-all duration-300"
          style={{
            borderColor: `${card.accentColor}40`,
            background: isDark ? `rgba(255,255,255,0.05)` : `linear-gradient(135deg, ${card.accentColor}08, rgba(255,255,255,0.6))`,
            color: isDark ? "rgba(255,255,255,0.8)" : "rgba(60,60,70,0.85)",
            boxShadow: isDark ? undefined : `0 2px 8px -2px ${card.accentColor}15`,
          }}
        >
          <span>{expanded ? seeLess : seeMore}</span>
          <svg
            className={`h-3.5 w-3.5 flex-none transition-transform duration-300 ${expanded ? "rotate-90" : "-rotate-90"}`}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M4 2L8 6L4 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="h-1 lg:h-2" />

        {/* Expandable features */}
        <div
          id={`${card.id}-details`}
          className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            expanded
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <ul
              className="space-y-3.5 border-t pb-1 pt-5 text-[13.5px] leading-[1.65] md:text-[14.5px]"
              style={{
                borderColor: `${card.accentColor}25`,
                fontFamily: bodyFontFamily,
                color: isDark ? "rgba(255,255,255,0.65)" : "rgba(60,60,70,0.7)",
              }}
            >
              {card.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon color={card.checkColor} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA at bottom of expanded content */}
            <button
              type="button"
              onClick={onStartNow}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#00BCA1] px-6 text-[14px] font-bold tracking-wide text-black transition-all duration-200 hover:bg-[#0AAE98] active:scale-[0.97]"
            >
              Start now
              <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/*
        Card bottom image — HIDDEN on mobile/tablet, only shown on lg+ (desktop).
        On desktop it's absolutely positioned as before; on mobile it's simply not rendered.
      */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden justify-center px-1 lg:flex transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <Image
          src={card.image}
          alt={`${card.title} ${card.subtitle}`}
          className="block w-full object-contain object-bottom"
          sizes="33vw"
          style={{
            width: keepLargeSideImage ? "164%" : "108%",
            maxWidth: keepLargeSideImage ? "164%" : "108%",
            maxHeight: "min(470px, 62vh)",
            transform: keepLargeSideImage
              ? "scale(1.03) translateY(8px)"
              : "scale(1.06) translateY(6px)",
            transformOrigin: "bottom center",
          }}
          draggable={false}
        />
      </div>

      {/* Bottom vignette — only relevant on desktop where image is visible */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-11 hidden h-24 lg:block"
        style={{
          background: `linear-gradient(to top, ${card.bgGradient.split(",")[0].replace("radial-gradient(ellipse at 30% 0%,", "").replace("radial-gradient(ellipse at 50% 0%,", "").replace("radial-gradient(ellipse at 70% 0%,", "").trim().split(" ")[0].replace("rgba(90,20,20,0.95)", "rgba(30,5,10,1)").replace("rgba(15,40,80,0.98)", "rgba(8,15,35,1)").replace("rgba(30,35,45,0.98)", "rgba(12,15,22,1)")} 0%, transparent 100%)`,
          opacity: expanded ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      />
    </div>
  );
};

const ThreeCards: React.FC = () => {
  const t = useTranslations("homepage.audience");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const sessionHealthy = useSessionHealth(!!session);
  const { resolvedTheme } = useTheme();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  // Default to dark during SSR to avoid hydration mismatch
  const isDark = !mounted || resolvedTheme === "dark";

  const bodyFontFamily =
    locale === "km"
      ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
      : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily =
    locale === "km"
      ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
      : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  const cards = getCards(t);

  const handleStartNow = (scanMode: "basic" | "medium" | "advanced") => {
    if (session && sessionHealthy !== false) {
      // Logged-in user → go to userdashboard scan page
      router.push(`/userdashboard/scan?mode=${scanMode}`);
    } else {
      // Not logged in → start guest session with free 3 trial scans
      window.location.href = "/api/guest/start";
    }
  };

  return (
    <section
      className="flex w-full flex-col items-center bg-[#F7F5F0] dark:bg-[#09090B] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 transition-colors duration-300"
      style={{ fontFamily: bodyFontFamily }}
    >
      <div className="flex w-full max-w-7xl flex-col items-start">
        {/* Eyebrow label */}
        <p
          className="mb-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#52525B] dark:text-white/30 md:mb-10 md:text-[12px]"
          style={{ fontFamily: bodyFontFamily }}
        >
          {t("eyebrow")}
        </p>

        {/* Outer border wrapper */}
        <div
          className="w-full rounded-[28px] border border-[#E2DDD5] dark:border-white/10 p-px dark:p-px"
          style={{
            background:
              "linear-gradient(135deg, rgba(200,100,100,0.3) 0%, rgba(74,143,212,0.2) 40%, rgba(120,140,160,0.25) 100%)",
          }}
        >
          {/* Grid container */}
          <div
            className="flex w-full flex-col gap-3 rounded-[27px] bg-[#F7F5F0] dark:bg-[#09090B] p-2 transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid lg:items-stretch"
            style={{
              gridTemplateColumns: getDesktopColumns(activeCardId),
            }}
          >
            {cards.map((card, i) => (
              <Card
                key={i}
                card={card}
                seeMore={t("seeMore")}
                seeLess={t("seeLess")}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
                expanded={activeCardId === card.id}
                hasActiveCard={activeCardId !== null}
                isDark={isDark}
                onToggle={() =>
                  setActiveCardId((current) =>
                    current === card.id ? null : card.id
                  )
                }
                onStartNow={() => handleStartNow(card.scanMode)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeCards;