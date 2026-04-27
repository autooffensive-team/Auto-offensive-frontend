"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

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
  ChevronRight,
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
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const descriptionTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";
  const sectionTitleFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const sectionDescriptionFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), sans-serif";
  const sectionDescriptionClass = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.7]";
  const primaryButtonClass =
    "group inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] sm:text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const secondaryButtonClass =
    "group inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] sm:text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const docsButtonClass =
    "group relative inline-flex h-[2.55em] w-fit items-center justify-start overflow-hidden rounded-xl border border-[#E2DDD5] bg-white px-[0.95em] pr-[2.2em] text-[13px] font-semibold text-[#01509E] transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-px hover:border-[#01509E] hover:bg-[#01509E] hover:text-white dark:border-white/10 dark:bg-[#111113] dark:text-[#7AAEF7] dark:hover:border-[#00BCA1] dark:hover:bg-[#00BCA1] dark:hover:text-[#09090B] sm:h-[2.8em] sm:px-[1.2em] sm:pr-[3.3em]";
  const docsButtonIconClass =
    "pointer-events-none absolute right-[0.25em] top-1/2 z-0 flex h-[1.75em] w-[1.75em] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[0.55em] bg-[#01509E] text-white transition-[width,transform,background-color,color] duration-300 group-hover:w-[calc(100%-0.45em)] group-hover:bg-[#01509E] group-hover:text-white dark:bg-[#7AAEF7] dark:text-[#09090B] dark:group-hover:w-[calc(100%-0.45em)] dark:group-hover:bg-[#00BCA1] dark:group-hover:text-[#09090B] sm:right-[0.3em] sm:h-[2.2em] sm:w-[2.2em] sm:rounded-[0.7em] sm:group-hover:w-[calc(100%-0.6em)]";

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
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300" style={{ fontFamily: bodyFontFamily }}>
      {/* ── Hero Section with Content ── */}
      <section
        ref={heroRef}
        className="relative w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 bg-white dark:bg-[#111113] transition-colors duration-300"
      >
        <div className="relative mx-auto flex min-h-[58vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#00BCA1]/6 rounded-full blur-3xl dark:bg-[#00BCA1]/4 transition-colors duration-300" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#01509E]/6 rounded-full blur-3xl dark:bg-[#01509E]/4 transition-colors duration-300" />
            <div
              className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12] transition-opacity duration-300"
              style={{
                backgroundImage: "radial-gradient(rgba(0,188,161,0.06) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative w-full max-w-4xl text-center px-2">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white transition-colors duration-300"
              style={{ fontFamily: displayFontFamily, fontWeight: 700 }}
            >
              {t("hero.titleLine1")}<br />
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
                className={`${primaryButtonClass} min-w-0 flex-1 whitespace-nowrap px-3 py-2.5 sm:flex-none sm:px-3.5 sm:py-2.5 bg-[#00BCA1] text-white hover:bg-[#0AAE98]`}
              >
                <span className="sm:hidden">Start Scanning</span>
                <span className="hidden sm:inline">{t("hero.primaryCta")}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                className={`${secondaryButtonClass} min-w-0 flex-1 whitespace-nowrap px-3 py-2.5 sm:flex-none sm:px-3.5 sm:py-2.5 bg-[#F7F5F0] text-slate-900 border-[#E2DDD5] hover:bg-[#EFE9DE] hover:border-[#CFC7BA] dark:bg-[#09090B] dark:text-slate-100 dark:border-white/10 dark:hover:bg-[#151A18] dark:hover:border-white/20`}
              >
                <span className="sm:hidden">Read the Docs</span>
                <span className="hidden sm:inline">{t("hero.secondaryCta")}</span>
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
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

        {/* Feature Rows - Resource Design Style */}
        <div className="flex flex-col gap-0 mb-0">
          {/* Web Module — Feature Row with C-Border (Image Left) */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={0}
            className={[
              'relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]',
              'ml-4 rounded-r-[28px] border-y border-r border-[#E2DDD5] dark:border-white/10 md:ml-6',
              'transition-colors duration-300',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/document/card_icon_web_automation_dark.webp"
                  alt="Web-Based Pentesting Automation"
                  width={720}
                  height={520}
                  className="w-full max-w-82.5 md:max-w-95 h-auto object-contain"
                />
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.web.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.web.desc")}
              </p>

              <a
                href="#"
                className={docsButtonClass}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">{t("common.viewDocumentation")}</span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </motion.div>

          {/* AI Module — Feature Row with C-Border (Image Right) */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className={[
              'relative flex min-h-96 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px',
              'mr-4 rounded-l-[28px] border-y border-l border-[#E2DDD5] dark:border-white/10 md:mr-6',
              'transition-colors duration-300',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Content */}
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14 transition-colors duration-300">
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4 transition-colors duration-300">
                {t("grid.ai.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#4B5563] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md transition-colors duration-300`}>
                {t("grid.ai.desc")}
              </p>

              {/* Stats */}
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
                    <div className="text-xl font-bold text-[#18181B] dark:text-white transition-colors duration-300">{s.val}</div>
                    <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1 transition-colors duration-300">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <a
                href="#"
                className={docsButtonClass}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">{t("common.viewDocumentation")}</span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

            {/* Right: Image */}
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

        {/* Secondary Modules as Feature Rows */}
        <div className="flex flex-col gap-0">
          {/* SAST Module — Feature Row with C-Border (Image Left) */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={[
              'relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px',
              'ml-4 rounded-r-[28px] border-y border-r border-[#E2DDD5] dark:border-white/10 md:ml-6',
              'transition-colors duration-300',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0 transition-colors duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_sast_dark.webp"
                  alt="Repository Scanning SAST"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>

            {/* Right: Content */}
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

              <a
                href="#"
                className={docsButtonClass}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">{moduleCards[0].link}</span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </motion.div>

          {/* CLI Module — Feature Row with C-Border (Image Right) */}
          <motion.div
            variants={fadeInScale}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={3}
            className={[
              'relative flex min-h-80 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B] -mt-px',
              'mr-4 rounded-l-[28px] border-y border-l border-[#E2DDD5] dark:border-white/10 md:mr-6 md:rounded-r-none md:rounded-l-[28px] md:border-r-0 md:border-l',
              'transition-colors duration-300',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Content */}
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

              <a
                href="#"
                className={docsButtonClass}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">{moduleCards[1].link}</span>
                <span className={docsButtonIconClass} aria-hidden="true">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>

            {/* Right: Image */}
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
            {/* Left Content */}
            <div className="p-10 sm:p-12 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#E2DDD5] dark:border-white/10 transition-colors duration-300">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl font-bold text-[#18181B] dark:text-white mb-6 leading-tight transition-colors duration-300"
              >
                {t("report.titleLine1")}<br />{t("report.titleLine2")}
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
                className={`${primaryButtonClass} w-fit bg-[#00BCA1] text-white hover:bg-[#0AAE98] px-6`}
              >
                <FileText className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-px" />
                <span>{t("common.viewDocumentation")}</span>
              </motion.button>
            </div>

            {/* Right Illustration */}
            <div className="relative flex items-center justify-center p-10 sm:p-12 lg:p-14
              bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300">

              <motion.div
                variants={fadeInScale}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Report Card */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-52 sm:w-60 bg-white dark:bg-[#111113] rounded-xl shadow-xl
                    border border-[#E2DDD5] dark:border-white/10 p-6 relative z-10 transition-colors duration-300"
                >
                  {/* Clipboard */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2
                    w-16 h-6 bg-amber-400 rounded-t-lg shadow-md transition-colors duration-300" />

                  <div className="flex justify-center mb-6 mt-2">
                    <Shield className="w-7 h-7 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
                  </div>

                  <div className="text-center text-xs font-bold text-slate-800 dark:text-white mb-6 tracking-wider uppercase transition-colors duration-300">
                    {t("report.cardTitle")}
                  </div>

                  {/* Chart */}
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

                  {/* Lines */}
                  {[85, 65, 75, 55].map((w, i) => (
                    <div
                      key={i}
                      className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2.5 transition-colors duration-300"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </motion.div>

                {/* Stats Badge */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full
                    bg-emerald-500 flex items-center justify-center
                    shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-900 z-20 transition-colors duration-300"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>

                {/* Critical Count */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-16 top-12 w-32 bg-white dark:bg-[#111113] rounded-lg
                    border border-[#E2DDD5] dark:border-white/10 shadow-lg p-4 transition-colors duration-300"
                >
                  <div className="text-[11px] font-semibold text-[#52525B] dark:text-[#A1A1AA] mb-2 transition-colors duration-300">
                    {t("report.criticalLabel")}
                  </div>
                  <div className="text-2xl font-bold text-red-500 mb-3">3</div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
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
          {/* Connecting line */}
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
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center
                    ${step.bgLight} ${step.bgDark} ${step.color}
                    transition-colors duration-300`}>
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

        {/* CTA Section */}
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