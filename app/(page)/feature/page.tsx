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
      border border-[#E2DDD5] dark:border-white/10">
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
        className="relative w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 bg-white dark:bg-[#111113]"
      >
        <div className="relative mx-auto flex min-h-[58vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-18">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#00BCA1]/6 rounded-full blur-3xl dark:bg-[#00BCA1]/4" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#01509E]/6 rounded-full blur-3xl dark:bg-[#01509E]/4" />
            <div
              className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
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
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white"
              style={{ fontFamily: displayFontFamily, fontWeight: 700 }}
            >
              {t("hero.titleLine1")}<br />
              <span className="text-[#00BCA1] dark:text-[#7CE5D4]">
                {t("hero.titleLine2")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={2}
              className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-10 max-w-2xl mx-auto`}
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={3}
              className="flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4 w-full"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap
                  bg-[#00BCA1] hover:bg-[#0AAE98] text-white transition-all duration-200
                  shadow-lg shadow-[#00BCA1]/20"
              >
                {t("hero.primaryCta")} <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-8 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap
                  bg-[#F7F5F0] dark:bg-[#09090B] hover:bg-[#EFE9DE] dark:hover:bg-[#151A18]
                  text-slate-900 dark:text-slate-100 border border-[#E2DDD5] dark:border-white/10
                  transition-all duration-200"
              >
                {t("hero.secondaryCta")} <ExternalLink className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom Half - Features Grid ── */}
      <section
        ref={gridRef}
        className="relative py-16 sm:py-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 bg-[#F7F5F0] dark:bg-[#09090B]"
      >
        <div className="mb-12">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={1}
            className="text-3xl font-bold text-[#18181B] dark:text-white mb-3"
          >
            Comprehensive Security Toolkit
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={gridInView ? "visible" : "hidden"}
            custom={2}
            className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl`}
          >
            Enterprise-grade tools designed for security professionals
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
                'hover:border-[#D9D2C8] dark:hover:border-white/15 transition-colors duration-300',
                'group',
                'flex-col md:flex-row'
              ].join(' ')}
            >
            {/* Left: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0">
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
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14">

              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4">
                {t("grid.web.title")}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md`}>
                {t("grid.web.desc")}
              </p>

              <motion.a
                whileHover={{ x: 6 }}
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold
                  text-[#01509E] dark:text-[#7AAEF7] hover:text-[#0A7C69] dark:hover:text-[#A8D8FF]
                  transition-colors duration-200 w-fit"
              >
                {t("common.viewDocumentation")} <ArrowRight className="w-4 h-4" />
              </motion.a>
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
                'hover:border-[#D9D2C8] dark:hover:border-white/15 transition-colors duration-300',
                'group',
                'flex-col md:flex-row'
              ].join(' ')}
            >
              {/* Left: Content */}
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14">
                <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4">
                  {t("grid.ai.title")}
                </h3>
              <p className={`${descriptionTextClass} text-[#4B5563] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md`}>
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
                      border border-[#E2DDD5] dark:border-white/10"
                  >
                    <div className="text-xl font-bold text-[#18181B] dark:text-white">{s.val}</div>
                    <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.a
                whileHover={{ x: 6 }}
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#01509E]
                  dark:text-[#7AAEF7] hover:text-[#0A7C69] dark:hover:text-[#A8D8FF]
                  transition-colors duration-200 w-fit"
              >
                {t("common.viewDocumentation")} <ChevronRight className="w-4 h-4" />
              </motion.a>
            </div>

            {/* Right: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0">
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
              'hover:border-[#D9D2C8] dark:hover:border-white/15 transition-all duration-300',
              'group',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/document/card_icon_sast_dark.webp"
                  alt="Repository Scanning SAST"
                  className="w-full max-w-72.5 md:max-w-85 h-auto object-contain"
                />
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14">

              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4">
                {moduleCards[0].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md`}>
                {moduleCards[0].desc}
              </p>

              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6">
                {moduleCards[0].badge}
              </div>

              <motion.a
                whileHover={{ x: 6 }}
                href="#"
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${moduleCards[0].linkColor} w-fit`}
              >
                {moduleCards[0].link} <ArrowRight className="w-4 h-4" />
              </motion.a>
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
              'hover:border-[#D9D2C8] dark:hover:border-white/15 transition-all duration-300',
              'group',
              'flex-col md:flex-row'
            ].join(' ')}
          >
            {/* Left: Content */}
            <div className="order-2 flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:order-0 md:px-12 md:py-14">

              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mb-4">
                {moduleCards[1].title}
              </h3>
              <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md`}>
                {moduleCards[1].desc}
              </p>

              <div className="text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] mb-6">
                {moduleCards[1].badge}
              </div>

              <motion.a
                whileHover={{ x: 6 }}
                href="#"
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${moduleCards[1].linkColor} w-fit`}
              >
                {moduleCards[1].link} <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>

            {/* Right: Image */}
            <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-4 md:p-8 md:order-0">
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
      <section ref={reportRef} className="relative px-4 sm:px-8 lg:px-10 py-24 max-w-7xl mx-auto">
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={reportInView ? "visible" : "hidden"}
          className="rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10
            bg-white dark:bg-[#111113] backdrop-blur-sm
            hover:border-[#CBEDE6] dark:hover:border-white/20 transition-all duration-300
            hover:shadow-[0_18px_50px_rgba(1,80,158,0.08)] dark:hover:shadow-black/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-10 sm:p-12 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#E2DDD5] dark:border-white/10">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl font-bold text-[#18181B] dark:text-white mb-6 leading-tight"
              >
                {t("report.titleLine1")}<br />{t("report.titleLine2")}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={2}
                className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-md`}
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
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg text-sm font-semibold
                  bg-[#00BCA1] hover:bg-[#0AAE98] text-white transition-all duration-200
                  shadow-lg shadow-[#00BCA1]/20 w-fit"
              >
                <FileText className="w-5 h-5" /> {t("common.viewDocumentation")}
              </motion.button>
            </div>

            {/* Right Illustration */}
            <div className="relative flex items-center justify-center p-10 sm:p-12 lg:p-14
              bg-[#F7F5F0] dark:bg-[#09090B]">

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
                    border border-[#E2DDD5] dark:border-white/10 p-6 relative z-10"
                >
                  {/* Clipboard */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2
                    w-16 h-6 bg-amber-400 rounded-t-lg shadow-md" />

                  <div className="flex justify-center mb-6 mt-2">
                    <Shield className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                  </div>

                  <div className="text-center text-xs font-bold text-slate-800 dark:text-white mb-6 tracking-wider uppercase">
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
                      className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2.5"
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
                    shadow-lg shadow-emerald-500/40 border-2 border-white dark:border-slate-900 z-20"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>

                {/* Critical Count */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-16 top-12 w-32 bg-white dark:bg-[#111113] rounded-lg
                    border border-[#E2DDD5] dark:border-white/10 shadow-lg p-4"
                >
                  <div className="text-[11px] font-semibold text-[#52525B] dark:text-[#A1A1AA] mb-2">
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
      <section ref={workflowRef} className="relative px-4 sm:px-8 lg:px-10 py-24 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-[#18181B] dark:text-white mb-4">
            {t("workflow.title")}
          </h2>
          <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] max-w-2xl mx-auto`}>
            {t("workflow.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5
            bg-linear-to-r from-transparent via-[#D6D3D1] dark:via-white/10 to-transparent z-0" />

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
                  hover:border-[#CBEDE6] dark:hover:border-white/20 transition-all duration-300
                  hover:shadow-lg dark:hover:shadow-black/20 group text-center"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center
                    ${step.bgLight} ${step.bgDark} ${step.color}
                    group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <span className="text-sm font-bold text-[#D6D3D1] dark:text-[#404040]">
                    0{step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#18181B] dark:text-white mb-3">
                  {t(`workflow.steps.${i}.title`)}
                </h3>
                <p className={`${descriptionTextClass} text-[#52525B] dark:text-[#A1A1AA] leading-relaxed`}>
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
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold
              bg-[#00BCA1] hover:bg-[#0AAE98] text-white transition-all duration-200
              shadow-lg shadow-[#00BCA1]/20"
          >
            {t("workflow.primaryCta")} <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.02 }}
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold
              text-[#52525B] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white
              transition-colors duration-200"
          >
            {t("workflow.secondaryCta")} <ExternalLink className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
