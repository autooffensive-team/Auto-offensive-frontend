"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

// ─── CUSTOMIZATION CONSTANTS ──────────────────────────────────────────────────
const CONFIG = {
  SECTION_ALIGNMENT: "center",
  MAX_WIDTH: "7xl",
  DARK: {
    bg: "#09090B",
    border: "rgba(255,255,255,0.08)",
    text: "#FFFFFF",
    textMuted: "#A1A1A6",
    accent1: "#01509e",
    accent2: "#00d0b2",
    cardBg: "#09090B",
  },
  LIGHT: {
    bg: "#F7F5F0",
    border: "rgba(0,0,0,0.08)",
    text: "#0d1117",
    textMuted: "#6b7a90",
    accent1: "#01509e",
    accent2: "#00d0b2",
    cardBg: "#F7F5F0",
  },
};

const FONT_SIZES = {
  xs: { desktop: "11px", tablet: "10px", mobile: "9px" },
  sm: { desktop: "20px", tablet: "13px", mobile: "12px" },
  base: { desktop: "16px", tablet: "15px", mobile: "14px" },
  lg: { desktop: "20px", tablet: "18px", mobile: "16px" },
  xl: { desktop: "24px", tablet: "22px", mobile: "20px" },
  "2xl": { desktop: "28px", tablet: "26px", mobile: "24px" },
  "3xl": { desktop: "36px", tablet: "32px", mobile: "28px" },
  "4xl": { desktop: "48px", tablet: "40px", mobile: "32px" },
};

const EN_TICKER_ITEMS = [
  "Attack Surface Mapping",
  "Vulnerability Scanning",
  "Auto Exploitation",
  "Pentest Reporting",
  "Continuous Monitoring",
  "CI/CD Integration",
];

const EN_CARDS = [
  {
    num: "01",
    tag: "Recon",
    title: ["Attack Surface", "Mapping"],
    hlLine: 1,
    desc: "Powerful, connected scanners for mapping exposed network assets and web apps, including cloud and APIs. Get a global view of open ports, running services, operating systems, and screenshots - plus ML-driven insights from subdomains, outdated technologies, reverse DNS, WAFs, and hidden files.",
    link: "#",
    image: "/home-image/4.webp",
    imageAlt: "Attack Surface Mapping",
    reverse: false,
    imageW: "520px",
    imageH: "380px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "02",
    tag: "Scanning",
    title: ["Comprehensive", "Vulnerability Scanning"],
    hlLine: 1,
    desc: "Proprietary web app and API scanner with benchmark-proven detection accuracy - outperforming both commercial and open-source tools. Network scanner combines 4 detection engines, ranked #1 in remote detection accuracy across 128 environments against Qualys, Nessus, and OpenVAS.",
    link: "#",
    image: "/home-image/1.webp",
    imageAlt: "Vulnerability Scanning",
    reverse: true,
    imageW: "480px",
    imageH: "320px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "03",
    tag: "Exploitation",
    title: ["Vulnerability", "Exploitation"],
    hlLine: 1,
    desc: "Automatic exploitation of new, critical CVEs with Sniper Auto Exploiter for validating risk and extracting evidence. Purpose-built to safely confirm exploitability of SQL injection, XSS, and more - with evidence-rich results including screenshots, network maps, exploit paths, and traffic logs.",
    link: "#",
    image: "/home-image/3.webp",
    imageAlt: "Vulnerability Exploitation",
    reverse: false,
    imageW: "500px",
    imageH: "400px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "04",
    tag: "Reporting",
    title: ["Pentest Reporting", "& Data Exports"],
    hlLine: 1,
    desc: "Built-in pentest report generator for creating editable DOCX reports 90% faster. Extensive library of customizable findings with vulnerability descriptions, risk ratings, evidence, and remediation steps. Export as PDF, HTML, CSV, XLSX, or via REST API - with branded templates per client.",
    link: "#",
    image: "/home-image/2.webp",
    imageAlt: "Pentest Reporting",
    reverse: true,
    imageW: "460px",
    imageH: "340px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "05",
    tag: "Monitoring",
    title: ["Continuous", "Vulnerability Monitoring"],
    hlLine: 1,
    desc: "Persistent coverage with scheduled scans that automate recurring tests across assets. Real-time alerts for critical issues via email, Slack, or Webhooks. Hands-off monitoring with Pentest Robots that trigger repeatable scan sequences - plus instant REST API access to all scanning capabilities.",
    link: "#",
    image: "/home-image/5.webp",
    imageAlt: "Continuous Monitoring",
    reverse: false,
    imageW: "540px",
    imageH: "360px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "06",
    tag: "CI/CD Integration",
    title: ["Security Baked", "Into Every Pipeline"],
    hlLine: 1,
    desc: "Embed offensive security directly into your CI/CD workflow. Reffensive triggers scans on every build, blocks deployments on critical findings, and feeds results into your existing DevSecOps toolchain - so vulnerabilities are caught before they ever reach production.",
    link: "#",
    image: "/home-image/6.webp",
    imageAlt: "CI/CD Integration",
    reverse: true,
    imageW: "500px",
    imageH: "420px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
];

// ─── Data ────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "ការស្វែងរកផ្ទៃវាយប្រហារ",
  "ការស្កេនចំណុចខ្សោយ",
  "ការសាកល្បងវាយប្រហារដោយស្វ័យប្រវត្តិ",
  "របាយការណ៍ Pentest",
  "ការតាមដានជាបន្តបន្ទាប់",
  "ការភ្ជាប់ CI/CD",
];

const CARDS = [
  {
    num: "01",
    tag: "Recon",
    title: ["ការធ្វើ Mapping នៃ", "Attack Surface"],
    hlLine: 1,
    desc: "Powerful scanning tools ដែលភ្ជាប់គ្នា សម្រាប់ mapping exposed assets នៅលើ network, Web App, Cloud និង API។ ទទួលបាន global view នៃ open ports, running services, operating systems, screenshots — រួមជាមួយ ML-driven insights ពី subdomains, outdated technologies, reverse DNS, WAFs និង hidden files។",
    link: "#",
    image: "/home-image/4.webp",
    imageAlt: "ការស្វែងរកផ្ទៃវាយប្រហារ",
    reverse: false,
    imageW: "520px",
    imageH: "380px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "02",
    tag: "Scanning",
    title: ["ការ scan vulnerability", "បានគ្រប់ជ្រុងជ្រោយ"],
    hlLine: 1,
    desc: "Proprietary Web App និង API scanner ដែលមាន benchmark-proven detection accuracy — outperforming ទាំង commercial និង open-source tools។ Network scanner រួមបញ្ចូល detection engines ចំនួន 4 ហើយត្រូវបាន ranked #1 ក្នុង remote detection accuracy នៅក្នុង 128 environments ប្រៀបធៀបជាមួយ Qualys, Nessus និង OpenVAS។",
    link: "#",
    image: "/home-image/1.webp",
    imageAlt: "ការស្កេនចំណុចខ្សោយ",
    reverse: true,
    imageW: "480px",
    imageH: "320px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "03",
    tag: "Exploitation",
    title: ["ការរកឃើញចំណុចខ្សោយ ", "និងវាយប្រហារ"],
    hlLine: 1,
    desc: "ប្រព័ន្ធអាចធ្វើការសាកល្បងវាយប្រហារដោយស្វ័យប្រវត្តិលើ CVE សំខាន់ៗ ដើម្បីផ្ទៀងផ្ទាត់កម្រិតហានិភ័យ និងប្រមូលភស្តុតាង។ វាជួយបញ្ជាក់ safely confirm ថា SQL injection, XSS និងបញ្ហាផ្សេងៗអាច exploit បានឬអត់ ជាមួយលទ្ធផលដែលមាន screenshot, network map, exploit path និង traffic log។",
    link: "#",
    image: "/home-image/3.webp",
    imageAlt: "ការផ្ទៀងផ្ទាត់ការវាយប្រហារ",
    reverse: false,
    imageW: "500px",
    imageH: "400px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "04",
    tag: "Reporting",
    title: ["របាយការណ៍ Pentest", "និងទាញយកទិន្នន័យ"],
    hlLine: 1,
    desc: "Built-in pentest report generator ដែលអាចបង្កើត DOCX reports ដែលអាចកែសម្រួលបាន លឿនជាងមុនរហូតដល់ 90%។ មាន extensive library findings ធំទូលាយ ដែលអាច customize បាន រួមមាន vulnerability descriptions, risk ratings, evidence និង remediation steps។អាច export ជា PDF, HTML, CSV, XLSX ឬតាម REST API បាន — ជាមួយ templates ដែលអាចដាក់ branding តាម client នីមួយៗ។",
    link: "#",
    image: "/home-image/2.webp",
    imageAlt: "របាយការណ៍ Pentest",
    reverse: true,
    imageW: "460px",
    imageH: "340px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "05",
    tag: "Monitoring",
    title: ["ការតាមដាន Vulnerabilities", "ជាបន្តបន្ទាប់"],
    hlLine: 1,
    desc: "កំណត់ពេលស្កេនជាប្រចាំដើម្បីគ្របដណ្តប់លើ asset ទាំងអស់ដោយស្វ័យប្រវត្តិ។  Real-time alerts សម្រាប់បញ្ហាសំខាន់ៗតាម email, Slack ឬ Webhooks។ Hands-off monitoring ដោយ Pentest Robots ដែល trigger repeatable scan sequences — បូករួមជាមួយការចូលប្រើ REST API ភ្លាមៗសម្រាប់សមត្ថភាពស្កេនទាំងអស់។",
    link: "#",
    image: "/home-image/5.webp",
    imageAlt: "ការតាមដានជាបន្តបន្ទាប់",
    reverse: false,
    imageW: "540px",
    imageH: "360px",
    gapLeft: "20px",
    gapRight: "52px",
    imagePadding: "0px 0px 0px 0px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
  {
    num: "06",
    tag: "CI/CD Integration",
    title: ["បញ្ចូល Security", "ទៅក្នុងគ្រប់ Pipeline"],
    hlLine: 1,
    desc: "បញ្ចូលការត្រួតពិនិត្យសុវត្ថិភាពចូលទៅក្នុង workflow CI/CD របស់អ្នកដោយផ្ទាល់។ Reffensive អាចបើកការស្កេនរាល់ពេល build ទប់ស្កាត់ deployment នៅពេលមានបញ្ហាសំខាន់ និងបញ្ជូនលទ្ធផលទៅ DevSecOps toolchain ដែលអ្នកកំពុងប្រើ ដើម្បីរកឃើញបញ្ហាមុនពេលឡើង production។",
    link: "#",
    image: "/home-image/6.webp",
    imageAlt: "ការភ្ជាប់ CI/CD",
    reverse: true,
    imageW: "500px",
    imageH: "420px",
    gapLeft: "50px",
    gapRight: "52px",
    imagePadding: "20px 0px 0px 20px",
    imageOffsetX: "0px",
    imageOffsetY: "0px",
    imageAlign: "center",
    imageValign: "center",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardData {
  num: string;
  tag: string;
  title: string[];
  hlLine: number;
  desc: string;
  link: string;
  image: string;
  imageAlt: string;
  reverse: boolean;
  imageW: string;
  imageH: string;
  gapLeft: string;
  gapRight: string;
  imagePadding: string;
  imageOffsetX: string;
  imageOffsetY: string;
  imageAlign: string;
  imageValign: string;
}

// ─── Theme Hook ──────────────────────────────────────────────────────────────
// FIX: Listen to BOTH prefers-color-scheme AND Tailwind's .dark class mutation
// so the theme stays in sync regardless of which dark-mode strategy is used.

function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    // Helper: respect the explicit theme class first, then fall back to system preference.
    const check = () => {
      const root = document.documentElement;
      const hasDarkClass = root.classList.contains("dark");
      const hasLightClass = root.classList.contains("light");

      if (hasDarkClass) {
        setIsDark(true);
        return;
      }

      if (hasLightClass) {
        setIsDark(false);
        return;
      }

      setIsDark(mq.matches);
    };

    check();
    mq.addEventListener("change", check);

    // Watch for Tailwind toggling the .dark class on <html>
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mq.removeEventListener("change", check);
      observer.disconnect();
    };
  }, []);

  return isDark ? CONFIG.DARK : CONFIG.LIGHT;
}

type ResponsiveMode = "desktop" | "tablet" | "mobile";

function useResponsiveMode(): ResponsiveMode {
  const getMode = (): ResponsiveMode => {
    if (window.innerWidth < 768) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  };

  const [mode, setMode] = useState<ResponsiveMode>("desktop");

  useEffect(() => {
    const onResize = () => setMode(getMode());

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return mode;
}

// ─── Responsive Font Size ────────────────────────────────────────────────────

function getResponsiveFontSize(sizeKey: keyof typeof FONT_SIZES) {
  return `clamp(${FONT_SIZES[sizeKey].mobile}, ${sizeKey === "4xl" ? "4vw" : "2vw"}, ${FONT_SIZES[sizeKey].desktop})`;
}

// ─── Max Width Wrapper ───────────────────────────────────────────────────────

const MAX_WIDTH_CLASSES = {
  none: "",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

function getAlignmentClass(alignment: string) {
  switch (alignment) {
    case "right":
      return "mr-0 ml-auto";
    case "center":
      return "mx-auto";
    default:
      return "ml-0 mr-auto";
  }
}

// ─── Dual Spine ──────────────────────────────────────────────────────────────

function DualSpine({
  fillPct,
  clipPath,
  colors,
}: {
  fillPct: number;
  clipPath: string;
  colors: typeof CONFIG.DARK;
}) {
  const sides = [
    { style: { left: "calc(50% - 34px)" } },
    { style: { left: "calc(50% + 34px)" } },
  ] as const;

  return (
    <>
      {sides.map((s, i) => (
        <div
          key={i}
          className="fixed top-0 h-screen w-px z-90 pointer-events-none"
          style={{ ...s.style, clipPath }}
        >
          <div
            className="absolute inset-0 w-px h-full"
            style={{ background: colors.border }}
          />
          <div
            className="absolute top-0 left-0 w-px"
            style={{
              height: `${fillPct}%`,
              background: "linear-gradient(180deg, #01509e, #00d0b2)",
              transition: "height 0.08s linear",
            }}
          />
        </div>
      ))}
    </>
  );
}

// ─── Center Logo ──────────────────────────────────────────────────────────────

function CenterLogo({ visible, isDark }: { visible: boolean; isDark: boolean }) {
  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-200 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,188,161,0.28) 0%, rgba(0,188,161,0.12) 42%, rgba(247,245,240,0.1) 62%, transparent 76%)",
          zIndex: 0,
        }}
      />
      <div className="ft-logo-gooey-wrap absolute inset-0 flex items-center justify-center">
        <div className="ft-logo-gooey" aria-hidden="true">
          <div className="ft-logo-liquid" />
          <div className="ft-logo-liquid" />
          <div className="ft-logo-liquid" />
          <div className="ft-logo-liquid" />
        </div>
      </div>
      <Image
        src={isDark ? "/Auto-Offensive-dm.webp" : "/Auto-Offensive.webp"}
        alt="Logo"
        className="relative z-10 object-contain"
        style={{ filter: "drop-shadow(0 0 10px rgba(0,188,161,0.18))" }}
        width={52}
        height={52}
      />
      <svg
        className="absolute w-0 h-0"
        aria-hidden="true"
        focusable="false"
      >
        <filter id="ft-logo-gooey-filter">
          <feGaussianBlur stdDeviation="6" in="SourceGraphic" />
          <feColorMatrix
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 18 -8
            "
          />
        </filter>
      </svg>
    </div>
  );
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
// FIX: ProgressBar now actually tracks scroll width via state.

function ProgressBar({ widthPct }: { widthPct: number }) {
  return (
    <div
      className="fixed top-0 left-0 h-0.5 z-200 transition-[width] duration-100"
      style={{
        width: `${widthPct}%`,
        background: "linear-gradient(90deg, #01509e, #00d0b2)",
      }}
    />
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker({ colors }: { colors: typeof CONFIG.DARK }) {
  const locale = useLocale();
  const items = locale === "kh" ? TICKER_ITEMS : EN_TICKER_ITEMS;
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden border-y py-4 my-0"
      style={{
        borderColor: colors.border,
        background: "rgba(1,80,158,0.02)",
      }}
    >
      <div
        className="flex w-max"
        style={{ animation: "ticker-scroll 24s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-5 px-8 whitespace-nowrap"
            style={{
              fontFamily: "var(--font-hackdaddy), sans-serif",
              color: colors.textMuted,
              fontSize: FONT_SIZES.xs.desktop,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: colors.accent1 }}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card Row ─────────────────────────────────────────────────────────────────

function CardRow({
  card,
  isLast,
  isVisible,
  cardRef,
  colors,
  mode,
  exploreCapabilityLabel,
}: {
  card: CardData;
  isLast: boolean;
  isVisible: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  colors: typeof CONFIG.DARK;
  mode: ResponsiveMode;
  exploreCapabilityLabel: string;
}) {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const labelFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), sans-serif";
  const { reverse, gapLeft, gapRight } = card;
  const isTablet = mode === "tablet";
  const isMobile = mode === "mobile";
  const isCompact = mode !== "desktop";

  const contentPaddingX = isMobile ? "20px" : isTablet ? "32px" : undefined;
  const contentPaddingY = isCompact ? (isMobile ? "40px" : "48px") : undefined;
  const imageWidth = isCompact ? "min(100%, 420px)" : card.imageW;
  const bodyFontSize = isMobile ? "16px" : isTablet ? "18px" : FONT_SIZES.sm.desktop;
  const labelFontSize = isMobile ? "9px" : isTablet ? "10px" : FONT_SIZES.xs.desktop;

  const contentBlock = (
    <div
      className="relative flex flex-col justify-center py-15"
      style={{
        paddingLeft: contentPaddingX ?? gapLeft,
        paddingRight: contentPaddingX ?? gapRight,
        paddingTop: contentPaddingY,
        paddingBottom: contentPaddingY,
        background: colors.cardBg,
        borderRight: !reverse && !isCompact ? `1px solid ${colors.border}` : undefined,
        borderLeft: reverse && !isCompact ? `1px solid ${colors.border}` : undefined,
        borderBottom: isCompact ? `1px solid ${colors.border}` : undefined,
      }}
    >
      <div
        style={{
          transform: isVisible ? "translateX(0)" : reverse ? "translateX(24px)" : "translateX(-24px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.85s 0.2s cubic-bezier(.16,1,.3,1), opacity 0.85s 0.2s",
        }}
      >
        <div className="mb-6 flex items-center gap-3 whitespace-nowrap">
          <span
            className="inline-flex items-center justify-center rounded-xl border px-3 py-2"
            style={{
              fontFamily: labelFontFamily,
              color: colors.accent1,
              borderColor: "rgba(1,80,158,0.18)",
              backgroundColor: "rgba(1,80,158,0.04)",
              fontSize: labelFontSize,
              letterSpacing: "0.2em",
              opacity: 0.7,
              textTransform: "uppercase",
            }}
          >
            {card.num}
          </span>

          <span
            className="inline-flex items-center justify-center rounded-xl border px-3 py-2"
            style={{
              fontFamily: labelFontFamily,
              color: colors.accent1,
              backgroundColor: `rgba(1,80,158,0.07)`,
              border: `1px solid rgba(1,80,158,0.18)`,
              fontSize: labelFontSize,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {card.tag}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-bold leading-[1.15] mb-5"
          style={{
            fontFamily: displayFontFamily,
            fontSize: getResponsiveFontSize("3xl"),
            letterSpacing: "-0.02em",
            color: colors.text,
          }}
        >
          {card.title.map((line, i) => (
            <span key={i} className="block">
              {i === card.hlLine ? (
                <span style={{ color: colors.accent2 }}>{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </h3>

        {/* Description */}
        <p
          className="leading-[1.75] max-w-100 mb-9"
          style={{
            fontFamily: bodyFontFamily,
            color: colors.textMuted,
            fontSize: bodyFontSize,
          }}
        >
          {card.desc}
        </p>

        {/* Link */}
        <a
          href={card.link}
          className="inline-flex items-center gap-2.5 no-underline group"
          style={{
            fontFamily: labelFontFamily,
            color: colors.accent1,
            fontSize: labelFontSize,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {exploreCapabilityLabel}
          <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );

  const spineBlock = (
    <div className="relative flex items-center justify-center">
      <div
        className="w-3 h-3 rounded-full"
        style={{
          border: `2px solid ${colors.accent1}`,
          background: colors.cardBg,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0)",
          transition: "opacity 0.4s 0.4s, transform 0.5s 0.4s cubic-bezier(.34,1.56,.64,1)",
        }}
      />
    </div>
  );

  const imageBlock = (
    <div
      className="relative overflow-hidden group/img"
      style={{
        borderRight: reverse && !isCompact ? `1px solid ${colors.border}` : undefined,
        padding: isCompact ? (isMobile ? "24px 20px 32px" : "28px 32px 40px") : card.imagePadding,
        display: "flex",
        justifyContent: card.imageAlign as React.CSSProperties["justifyContent"],
        alignItems: card.imageValign as React.CSSProperties["alignItems"],
      }}
    >
      <div
        className="relative"
        style={{
          width: imageWidth,
          aspectRatio: `${parseFloat(card.imageW) / parseFloat(card.imageH)}`,
          transform: isVisible
            ? `translateX(${card.imageOffsetX}) translateY(${card.imageOffsetY}) scale(1)`
            : reverse
            ? `translateX(calc(-30px + ${card.imageOffsetX})) translateY(${card.imageOffsetY}) scale(0.97)`
            : `translateX(calc(30px + ${card.imageOffsetX})) translateY(${card.imageOffsetY}) scale(0.97)`,
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.9s 0.15s cubic-bezier(.16,1,.3,1), opacity 0.9s 0.15s",
        }}
      >
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          sizes={isCompact ? "min(100vw, 420px)" : card.imageW}
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );

  if (isCompact) {
    return (
      <div
        ref={cardRef}
        id={isLast ? "lastCard" : undefined}
        className="border-t"
        style={{
          borderColor: colors.border,
          borderBottomWidth: isLast ? "1px" : "0px",
          borderBottomStyle: isLast ? "solid" : "none",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(50px)",
          transition: "opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {contentBlock}
        {imageBlock}
      </div>
    );
  }

  return (
  <div
    ref={cardRef}
    id={isLast ? "lastCard" : undefined}
    className="grid min-h-120 border-t"
    style={{
      gridTemplateColumns: "1fr 80px 1fr",
      borderColor: colors.border,
      // FIX: Use longhand properties to avoid the shorthand/non-shorthand conflict
      borderBottomWidth: isLast ? "1px" : "0px",
      borderBottomStyle: isLast ? "solid" : "none",
      // borderBottomColor is already handled by the 'borderColor' property above
      
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(50px)",
      transition: "opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1)",
    }}
  >
      {reverse ? (
        <>
          {imageBlock}
          {spineBlock}
          {contentBlock}
        </>
      ) : (
        <>
          {contentBlock}
          {spineBlock}
          {imageBlock}
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Features() {
  const locale = useLocale();
  const t = useTranslations("homepage.features");
  const isKhmer = locale === "kh";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const cards = locale === "kh" ? CARDS : EN_CARDS;
  // FIX: scrollPct is now used by ProgressBar
  const [scrollPct, setScrollPct] = useState(0);
  const [spineFill, setSpineFill] = useState(0);
  const [spineClip, setSpineClip] = useState("inset(9999px 0 0 0)");
  const [visibleCards, setVisibleCards] = useState<boolean[]>(cards.map(() => false));
  const [logoVisible, setLogoVisible] = useState(false);

  const colors = useTheme();
  const isDark = colors === CONFIG.DARK;
  const mode = useResponsiveMode();
  const isDesktop = mode === "desktop";
  const sectionPaddingX = mode === "mobile" ? "20px" : mode === "tablet" ? "32px" : "52px";

  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featureSectionRef = useRef<HTMLElement | null>(null);

  // ─── Scroll: progress bar + spine fill + spine clip ───────────────────────
  useEffect(() => {
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScrollPct(pct);
      setSpineFill(pct);

      const vh = window.innerHeight;
      if (firstCardRef.current && lastCardRef.current) {
        const topR = firstCardRef.current.getBoundingClientRect();
        const botR = lastCardRef.current.getBoundingClientRect();
        const clipTop = Math.max(0, topR.top);
        const clipBottom = Math.max(0, vh - botR.bottom);
        setSpineClip(`inset(${clipTop}px 0 ${clipBottom}px 0)`);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Center logo visibility ───────────────────────────────────────────────
  // FIX: Use a scroll listener instead of IntersectionObserver on the section,
  //      so we have direct access to first/lastCardRef bounding rects.
  useEffect(() => {
    const checkLogo = () => {
      if (!firstCardRef.current || !lastCardRef.current) return;
      const vh = window.innerHeight;
      const topR = firstCardRef.current.getBoundingClientRect();
      const botR = lastCardRef.current.getBoundingClientRect();
      const centerY = vh / 2;
      setLogoVisible(topR.top <= centerY && botR.bottom >= centerY);
    };

    window.addEventListener("scroll", checkLogo, { passive: true });
    checkLogo();
    return () => window.removeEventListener("scroll", checkLogo);
  }, []);

  // ─── Card entrance animations ─────────────────────────────────────────────
  // FIX: Set up the IntersectionObserver in a separate effect that runs AFTER
  //      refs are populated, and re-runs if refs change. We use a slight delay
  //      to ensure the DOM has fully rendered before observing.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = cardRefs.current.indexOf(e.target as HTMLDivElement);
          if (e.isIntersecting && idx !== -1) {
            setVisibleCards((prev) => {
              if (prev[idx]) return prev; // already visible, skip re-render
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    // Small timeout ensures refs are all assigned after first render
    const timer = setTimeout(() => {
      cardRefs.current.forEach((el) => {
        if (el) observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []); // runs once after mount; refs are stable

  return (
    <div
      className="relative overflow-x-hidden"
      style={{ background: colors.bg, color: colors.text }}
    >
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ft-logo-gooey-rotate {
          0% { transform: rotate(360deg); }
          50% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ft-logo-liquid-1 {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 100%; }
        }
        @keyframes ft-logo-liquid-2 {
          0% { left: 0; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        @keyframes ft-logo-liquid-3 {
          0% { left: 100%; }
          50% { left: 0; }
          100% { left: 0; }
        }
        @keyframes ft-logo-liquid-4 {
          0% { top: 100%; }
          50% { top: 0; }
          100% { top: 0; }
        }
        .ft-logo-gooey-wrap {
          z-index: 0;
        }
        .ft-logo-gooey {
          position: relative;
          width: 68px;
          height: 68px;
          animation: ft-logo-gooey-rotate 4s ease-in-out infinite;
          filter: url("#ft-logo-gooey-filter");
          opacity: 0.55;
        }
        .ft-logo-liquid {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, rgba(247,245,240,0.75) 0%, #00BCA1 38%, #00BCA1 100%);
        }
        .ft-logo-liquid:nth-child(1) {
          top: 0;
          animation: ft-logo-liquid-1 4s ease-in-out infinite;
        }
        .ft-logo-liquid:nth-child(2) {
          left: 0;
          animation: ft-logo-liquid-2 4s ease-in-out infinite;
        }
        .ft-logo-liquid:nth-child(3) {
          left: 100%;
          animation: ft-logo-liquid-3 4s ease-in-out infinite;
        }
        .ft-logo-liquid:nth-child(4) {
          top: 100%;
          animation: ft-logo-liquid-4 4s ease-in-out infinite;
        }
      `}</style>

      {/* FIX: Pass scrollPct so the bar actually fills */}
      <ProgressBar widthPct={scrollPct} />
      {isDesktop ? <DualSpine fillPct={spineFill} clipPath={spineClip} colors={colors} /> : null}
      {isDesktop ? <CenterLogo visible={logoVisible} isDark={isDark} /> : null}

      <section
        ref={featureSectionRef}
        className={`relative -mt-12 pb-1.5 pt-24 md:-mt-20 md:pt-32 ${MAX_WIDTH_CLASSES[CONFIG.MAX_WIDTH as keyof typeof MAX_WIDTH_CLASSES]} ${getAlignmentClass(CONFIG.SECTION_ALIGNMENT)}`}
        id="features"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-16 h-24 md:-top-24 md:h-32"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${colors.bg} 78%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] -top-8 h-16 rounded-full blur-3xl md:-top-12 md:h-24"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(1,80,158,0.12) 24%, rgba(0,208,178,0.16) 52%, rgba(1,80,158,0.1) 78%, transparent 100%)",
            opacity: isDesktop ? 0.95 : 0.7,
          }}
        />

        {/* Section Header */}
        <div
          className="flex items-center justify-between py-12 border-b"
          style={{
            paddingLeft: sectionPaddingX,
            paddingRight: sectionPaddingX,
            borderColor: colors.border,
          }}
        >
          <h2
            className="font-bold leading-[1.1]"
            style={{
              fontFamily: displayFontFamily,
              fontSize: getResponsiveFontSize("4xl"),
              letterSpacing: "-0.02em",
              color: colors.text,
            }}
          >
            <span className="block">{t("sectionTitleLine1")}</span>
            <span className="block" style={{ color: colors.accent2 }}>
              {t("sectionTitleLine2")}
            </span>
          </h2>
        </div>

        {/* Card Rows */}
        {cards.map((card, i) => (
          <CardRow
            key={i}
            card={card}
            isLast={i === cards.length - 1}
            isVisible={visibleCards[i]}
            cardRef={(el) => {
              cardRefs.current[i] = el;
              if (i === 0) firstCardRef.current = el;
              if (i === cards.length - 1) lastCardRef.current = el;
            }}
            colors={colors}
            mode={mode}
            exploreCapabilityLabel={t("exploreCapability")}
          />
        ))}
      </section>

      <Ticker colors={colors} />
    </div>
  );
}
