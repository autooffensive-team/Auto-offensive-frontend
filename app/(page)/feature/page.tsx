"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";
import { HeroBackground } from "@/components/shared/HeroBackground";
import AnimatedCta from "@/components/pages/homepage/animated-cta";
import webAutomationImage from "../../../public/document/card_icon_web_automation_dark.webp";

import {
  GitBranch,
  Terminal,
  FileText,
  Search,
  Bug,
  Zap,
  ClipboardList,
  ArrowRight,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
interface WorkflowStep {
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgDark: string;
  step: number;
}

/* ─── Data ───────────────────────────────────────── */
const workflowSteps: WorkflowStep[] = [
  {
    icon: <Search className="w-6 h-6" />,
    color: "text-[#00BCA1]",
    bgLight: "bg-emerald-50 border-emerald-200",
    bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800",
    step: 1,
  },
  {
    icon: <Bug className="w-6 h-6" />,
    color: "text-red-500",
    bgLight: "bg-red-50 border-red-200",
    bgDark: "dark:bg-red-950/40 dark:border-red-800",
    step: 2,
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "text-violet-500",
    bgLight: "bg-violet-50 border-violet-200",
    bgDark: "dark:bg-violet-950/40 dark:border-violet-800",
    step: 3,
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    color: "text-blue-500",
    bgLight: "bg-blue-50 border-blue-200",
    bgDark: "dark:bg-blue-950/40 dark:border-blue-800",
    step: 4,
  },
];

/* ─── Animation Variants ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg
      bg-[#F2EFE7] dark:bg-[#111113] text-[#52525B] dark:text-[#A1A1AA]
      border border-[#E2DDD5] dark:border-white/10 transition-colors duration-300">
      {children}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function PlatformCapabilities() {
  const t = useTranslations("featuresPage");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const heroTitleFontFamily = isKhmer
    ? "var(--font-hanuman), var(--font-noto-khmer), sans-serif"
    : displayFontFamily;
  const descriptionTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";
  const sectionTitleFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const sectionDescriptionFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), sans-serif";
  const sectionDescriptionClass =
    "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.7]";
  const primaryButtonClass =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-xl border-2 border-[#00BCA1] bg-[#00BCA1] px-3 py-3 sm:px-7.5 sm:py-3.5 text-[14px] sm:text-[15px] font-black leading-none text-black transition-transform duration-200 hover:-translate-y-px before:pointer-events-none before:absolute before:inset-0 before:translate-y-full before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)] before:transition-transform before:duration-200 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)] after:transition-transform after:duration-200 after:content-[''] hover:before:translate-y-0 hover:after:translate-y-0";
  const secondaryButtonClass =
    "ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)] bg-white dark:bg-[rgba(0,208,178,0.06)] px-4 py-3 sm:px-6.5 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-black dark:text-white backdrop-blur-sm duration-200 cursor-pointer";
  const ctaArrowIcon = (
    <svg className="h-3 w-3 flex-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1L11 6L6 11M11 6H1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const reportRef = useRef(null);
  const workflowRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-100px" });
  const reportInView = useInView(reportRef, { once: true, margin: "-100px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-100px" });

  const aiStats = [
    { label: t("grid.ai.stats.threats"), val: "12.4K" },
    { label: t("grid.ai.stats.accuracy"), val: "99.1%" },
  ];

  const moduleCards = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      iconBg: "bg-[#EAF1EC] dark:bg-white/5 border-[#D9F4EF] dark:border-white/10",
      iconColor: "text-[#01509E] dark:text-[#7AAEF7]",
      title: t("grid.cards.sast.title"),
      desc: t("grid.cards.sast.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-[#01509E] dark:text-[#7AAEF7]",
      badge: t("grid.cards.sast.badge"),
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      iconBg: "bg-[#F2EFE7] dark:bg-white/5 border-[#E2DDD5] dark:border-white/10",
      iconColor: "text-[#52525B] dark:text-[#D1D5DB]",
      title: t("grid.cards.cli.title"),
      desc: t("grid.cards.cli.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-[#01509E] dark:text-[#7AAEF7]",
      badge: t("grid.cards.cli.badge"),
    },
  ];

  const reportTags = [
    t("report.tags.executiveOverview"),
    t("report.tags.technicalDeepDive"),
    t("report.tags.developerPatchNotes"),
  ];

  return (
    <div
      className="feature-page min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300"
      style={{ fontFamily: bodyFontFamily }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION — with Dot Grid + Plasma Wave background
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 bg-white dark:bg-[#111113] transition-colors duration-300 overflow-hidden"
      >
        {/* ── Animated Background Layers ── */}
        <HeroBackground isDark={isDark} />

        {/* ── Hero Content ── */}
        <div
          className="relative mx-auto flex min-h-[58vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16"
          style={{ zIndex: 10 }}
        >
          <div className="relative w-full max-w-4xl text-center px-2">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={1}
              className="feature-hero-title text-[clamp(2rem,7vw,80px)] font-bold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white transition-colors duration-300"
              style={{ fontFamily: heroTitleFontFamily, fontWeight: isKhmer ? 800 : 700 }}
            >
              {t("hero.titleLine1")}
              <br />
              <span className="text-[#00BCA1] dark:text-[#7CE5D4] transition-colors duration-300">
                {t("hero.titleLine2")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={2}
              className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-10 max-w-2xl mx-auto transition-colors duration-300`}
            >
              {t("hero.subtitle")}
              <br />
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={3}
              className="flex w-full flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4"
            >
              <button
                className={`${primaryButtonClass}`}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <span className="sm:hidden">Start Scanning</span>
                  <span className="hidden sm:inline">{t("hero.primaryCta")}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button
                className={`${secondaryButtonClass}`}
              >
                <span className="sm:hidden">Read the Docs</span>
                <span className="hidden sm:inline">{t("hero.secondaryCta")}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom Half - Features Grid ── */}
      <section
        ref={gridRef}
        className="relative py-12 sm:py-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className="text-3xl font-bold text-[#18181B] dark:text-white mb-3 transition-colors duration-300"
            style={{ fontFamily: sectionTitleFontFamily }}
          >
            Comprehensive Security Toolkit
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={`${sectionDescriptionClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl transition-colors duration-300`}
            style={{ fontFamily: sectionDescriptionFontFamily }}
          >
            {t("grid.sectionSubtitle")}
          </motion.p>
        </div>

        {/* Feature Rows */}
        <div className="flex flex-col gap-0 mb-0">
          {/* Web Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={0}
            className={[
              "relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]",
              "ml-4 rounded-r-[28px] border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:ml-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={webAutomationImage}
                  alt="Web-Based Pentesting Automation"
                  width={720}
                  height={520}
                  className="w-full max-w-82.5 md:max-w-95 h-auto object-contain"
                />
              </div>
            </div>

            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.web.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.web.desc")}
              </p>
              <AnimatedCta
                as="a"
                href="#"
                className="inline-flex w-fit rounded-lg border-2 border-[#01509e] bg-[#01509e] text-[13px] font-semibold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88] transition-all duration-200"
                iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
                icon={ctaArrowIcon}
              >
                {t("common.viewDocumentation")}
              </AnimatedCta>
            </div>
          </motion.div>

          {/* AI Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className={[
              "relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "mr-4 rounded-l-[28px] border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:mr-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.ai.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#4B5563] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.ai.desc")}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs">
                {aiStats.map((s, idx) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0 }}
                    animate={gridInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="rounded-lg bg-white dark:bg-[#111113] px-4 py-3
                      border border-[#E2DDD5] dark:border-white/10 transition-colors duration-300"
                  >
                    <div className="text-xl font-bold text-[#18181B] dark:text-white transition-colors duration-300">
                      {s.val}
                    </div>
                    <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1 transition-colors duration-300">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatedCta
                as="a"
                href="#"
                className="inline-flex w-fit rounded-lg border-2 border-[#01509e] bg-[#01509e] text-[13px] font-semibold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88] transition-all duration-200"
                iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
                icon={ctaArrowIcon}
              >
                {t("common.viewDocumentation")}
              </AnimatedCta>
            </div>

            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_ai_analysis_dark.webp"
                  alt="AI-Powered Security Analysis"
                  className="w-full max-w-75 md:max-w-87.5 h-auto object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Modules */}
        <div className="flex flex-col gap-0">
          {/* SAST Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={[
              "relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "ml-4 rounded-r-[28px] border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:ml-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_sast_dark.webp"
                  alt="Repository Scanning SAST"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>

            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {moduleCards[0].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {moduleCards[0].desc}
              </p>
              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6 transition-colors duration-300">
                {moduleCards[0].badge}
              </div>
              <AnimatedCta
                as="a"
                href="#"
                className="inline-flex w-fit rounded-lg border-2 border-[#01509e] bg-[#01509e] text-[13px] font-semibold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88] transition-all duration-200"
                iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
                icon={ctaArrowIcon}
              >
                {moduleCards[0].link}
              </AnimatedCta>
            </div>
          </motion.div>

          {/* CLI Module */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={3}
            className={[
              "relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px",
              "mr-4 rounded-l-[28px] border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:mr-6",
              "transition-colors duration-300",
              "flex-col md:flex-row",
            ].join(" ")}
          >
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {moduleCards[1].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {moduleCards[1].desc}
              </p>
              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6 transition-colors duration-300">
                {moduleCards[1].badge}
              </div>
              <AnimatedCta
                as="a"
                href="#"
                className="inline-flex w-fit rounded-lg border-2 border-[#01509e] bg-[#01509e] text-[13px] font-semibold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88] transition-all duration-200"
                iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
                icon={ctaArrowIcon}
              >
                {moduleCards[1].link}
              </AnimatedCta>
            </div>

            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_cli_api_dark.webp"
                  alt="Managed CLI & API"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI Reporting Section ── */}
      <section ref={reportRef} className="relative px-4 sm:px-8 lg:px-10 py-16 max-w-7xl mx-auto">
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={reportInView ? "visible" : "hidden"}
          className="rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10
            bg-white dark:bg-[#111113] backdrop-blur-sm
            transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 sm:p-12 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#E2DDD5] dark:border-white/10 transition-colors duration-300">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl font-bold text-[#18181B] dark:text-white mb-6 leading-tight transition-colors duration-300"
              >
                {t("report.titleLine1")}
                <br />
                {t("report.titleLine2")}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={2}
                className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}
              >
                {t("report.desc")}
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={3}
                className="flex flex-wrap gap-2 mb-10"
              >
                {reportTags.map((tag) => (
                  <FeatureTag key={tag}>{tag}</FeatureTag>
                ))}
              </motion.div>

              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={4}
                className={`${primaryButtonClass} w-fit`}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{t("common.viewDocumentation")}</span>
                </span>
              </motion.button>
            </div>

            <div className="relative flex items-center justify-center p-10 sm:p-12 lg:p-14
              bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300">
              <motion.div
                variants={fadeInScale}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                className="relative w-full h-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-52 sm:w-60 bg-white dark:bg-[#111113] rounded-xl shadow-xl
                    border border-[#E2DDD5] dark:border-white/10 p-6 relative z-10 transition-colors duration-300"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2
                    w-16 h-6 bg-amber-400 rounded-t-lg shadow-md transition-colors duration-300" />
                  <div className="flex justify-center mb-6 mt-2">
                    <Shield className="w-7 h-7 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
                  </div>
                  <div className="text-center text-xs font-bold text-slate-800 dark:text-white mb-6 tracking-wider uppercase transition-colors duration-300">
                    {t("report.cardTitle")}
                  </div>
                  <div className="flex items-end gap-2 justify-center mb-6 h-24">
                    {[32, 52, 40, 64, 44].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={reportInView ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                        style={{ height: h, transformOrigin: "bottom" }}
                        className={`w-3 rounded-sm ${
                          [
                            "bg-red-400",
                            "bg-emerald-400",
                            "bg-blue-400",
                            "bg-amber-400",
                            "bg-violet-400",
                          ][i]
                        }`}
                      />
                    ))}
                  </div>
                  {[85, 65, 75, 55].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2.5 transition-colors duration-300"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full
                    bg-emerald-500 flex items-center justify-center
                    shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-900 z-20 transition-colors duration-300"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -left-16 top-12 w-32 bg-white dark:bg-[#111113] rounded-lg
                    border border-[#E2DDD5] dark:border-white/10 shadow-lg p-4 transition-colors duration-300"
                >
                  <div className="text-[11px] font-semibold text-[#52525B] dark:text-[#A1A1AA] mb-2 transition-colors duration-300">
                    {t("report.criticalLabel")}
                  </div>
                  <div className="text-2xl font-bold text-red-500 mb-3">3</div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 bg-red-400/60 rounded-full" />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Workflow Section ── */}
      <section ref={workflowRef} className="relative px-4 sm:px-8 lg:px-10 py-16 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
            {t("workflow.title")}
          </h2>
          <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl mx-auto transition-colors duration-300`}>
            {t("workflow.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5
            bg-linear-to-r from-transparent via-[#D6D3D1] dark:via-white/10 to-transparent z-0 transition-colors duration-300" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                initial="hidden"
                animate={workflowInView ? "visible" : "hidden"}
                custom={i}
                className="rounded-xl p-8
                  bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10
                  transition-all duration-300 group text-center"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center
                    ${step.bgLight} ${step.bgDark} ${step.color}
                    transition-colors duration-300`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-sm font-bold text-[#D6D3D1] dark:text-[#404040] transition-colors duration-300">
                    0{step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#18181B] dark:text-white mb-3 transition-colors duration-300">
                  {t(`workflow.steps.${i}.title`)}
                </h3>
                <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed transition-colors duration-300`}>
                  {t(`workflow.steps.${i}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          custom={4}
          className="mt-12 flex flex-row flex-wrap items-center justify-center gap-4"
        >
          <button
            className={`${primaryButtonClass} bg-[#00BCA1] text-white hover:bg-[#0AAE98] px-6`}
          >
            <span>{t("workflow.primaryCta")}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <a
            href="/resources"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#52525B] dark:text-[#A1A1AA]
              transition-all duration-300 hover:-translate-y-0.5 hover:text-[#18181B] dark:hover:text-white"
          >
            <span>{t("workflow.secondaryCta")}</span>
            <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
