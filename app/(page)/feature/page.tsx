"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  Monitor,
  Brain,
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

/* ─── Types ─────────────────────────────────────────────────── */
interface WorkflowStep {
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgDark: string;
  step: number;
}

/* ─── Data ───────────────────────────────────────────────────── */
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

/* ─── Animation Variants ─────────────────────────────────────── */
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

/* ─── Sub-components ─────────────────────────────────────────── */

function TerminalPreview() {
  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800/50 overflow-hidden text-left mt-10 shadow-2xl">
      <div className="flex items-center gap-2 px-5 py-4 bg-slate-900/50 border-b border-slate-800/50 backdrop-blur">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#00BCA1]/80" />
        <span className="ml-4 text-xs text-slate-500 font-mono font-medium">pentest-cli v2.4.1</span>
      </div>
      <div className="p-6 font-mono text-sm space-y-2 text-slate-300">
        <div className="text-emerald-400 font-semibold">$ subfinder -d target.com -silent</div>
        <div className="text-slate-400">api.target.com</div>
        <div className="text-slate-400">admin.target.com</div>
        <div className="text-emerald-400 mt-4 font-semibold">$ nmap -sV api.target.com</div>
        <div className="text-slate-400">80/tcp  open  http nginx 1.24</div>
        <div className="text-yellow-400">443/tcp open  https</div>
        <div className="flex items-center gap-1 mt-3">
          <span className="text-#00BCA1">▮</span>
          <span className="text-slate-600 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}

function ProfessionalBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00BCA1] animate-pulse" />
      <span className="text-xs font-medium tracking-wide uppercase text-slate-600 dark:text-slate-400">
        {text}
      </span>
    </div>
  );
}

function FeatureTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg
      bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300
      border border-slate-200 dark:border-slate-700/50">
      {children}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
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
      iconBg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50",
      iconColor: "text-violet-600 dark:text-violet-400",
      title: t("grid.cards.sast.title"),
      desc: t("grid.cards.sast.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-emerald-600 dark:text-emerald-400",
      badge: t("grid.cards.sast.badge"),
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      iconBg: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50",
      iconColor: "text-slate-600 dark:text-slate-400",
      title: t("grid.cards.cli.title"),
      desc: t("grid.cards.cli.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-emerald-600 dark:text-emerald-400",
      badge: t("grid.cards.cli.badge"),
    },
  ];

  const reportTags = [
    t("report.tags.executiveOverview"),
    t("report.tags.technicalDeepDive"),
    t("report.tags.developerPatchNotes"),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300" style={{ fontFamily: bodyFontFamily }}>
      
      {/* ── Hero Section with Content ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col px-6"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl dark:bg-emerald-500/3" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl dark:bg-blue-500/3" />
        </div>

        {/* Top Half - Hero Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center pt-20 sm:pt-32 lg:pt-40">
          <div className="w-full max-w-4xl mx-auto text-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={0}
              className="mb-6 flex justify-center"
            >
              <ProfessionalBadge text={t("hero.badge")} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-8
                text-slate-900 dark:text-white"
              style={{ fontFamily: displayFontFamily, fontWeight: 700 }}
            >
              {t("hero.titleLine1")}<br />
              <span className="text-#00BCA1 dark:text-emerald-400">
                {t("hero.titleLine2")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={2}
              className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto`}
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold
                  bg-primary hover:bg-emerald-500 text-white transition-all duration-200
                  shadow-lg shadow-emerald-500/20"
              >
                {t("hero.primaryCta")} <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold
                  bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800
                  text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/50
                  transition-all duration-200"
              >
                {t("hero.secondaryCta")} <ExternalLink className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Half - Features Grid */}
        <div ref={gridRef} className="relative flex-1 flex flex-col justify-start py-16 sm:py-20 max-w-7xl w-full mx-auto">
          <div className="mb-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={0}
              className="inline-block mb-4"
            >
              <ProfessionalBadge text="Core Capabilities" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={1}
              className="text-3xl font-bold text-slate-900 dark:text-white mb-3"
            >
              Comprehensive Security Toolkit
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={2}
              className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 max-w-2xl`}
            >
              Enterprise-grade tools designed for security professionals
            </motion.p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {/* Web Module — Large */}
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={0}
              className="lg:col-span-3 rounded-xl p-8 sm:p-10
                bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50
                hover:border-slate-300 dark:hover:border-slate-700/50 transition-all duration-300
                hover:shadow-lg dark:hover:shadow-black/20 group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40
                  border border-emerald-300 dark:border-emerald-800/50
                  flex items-center justify-center text-emerald-600 dark:text-emerald-400
                  group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                  Module 01
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {t("grid.web.title")}
              </h3>
              <p className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 leading-relaxed mb-8`}>
                {t("grid.web.desc")}
              </p>

              <motion.a
                whileHover={{ x: 6 }}
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold
                  text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300
                  transition-colors duration-200"
              >
                {t("common.viewDocumentation")} <ArrowRight className="w-4 h-4" />
              </motion.a>

              <TerminalPreview />
            </motion.div>

            {/* AI Module — Small */}
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={1}
              className="lg:col-span-2 rounded-xl p-8 sm:p-10 relative overflow-hidden
                bg-linear-to-br from-emerald-50 to-teal-50 dark:from-slate-900/60 dark:to-slate-900/40
                border border-emerald-200/50 dark:border-slate-800/50
                hover:border-emerald-300/50 dark:hover:border-slate-700/50 transition-all duration-300
                hover:shadow-lg dark:hover:shadow-black/20 group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10
                  border border-emerald-300/30 dark:border-emerald-800/30
                  flex items-center justify-center text-emerald-600 dark:text-emerald-400
                  mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-5 h-5" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {t("grid.ai.title")}
                </h3>
                <p className={`${descriptionTextClass} text-slate-700 dark:text-slate-400 leading-relaxed mb-8`}>
                  {t("grid.ai.desc")}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {aiStats.map((s, idx) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0 }}
                      animate={gridInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="rounded-lg bg-white dark:bg-slate-800/40 px-4 py-3
                        border border-slate-200/50 dark:border-slate-700/30"
                    >
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{s.val}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-500 mt-1">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600
                    dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300
                    transition-colors"
                >
                  {t("common.viewDocumentation")} <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Secondary Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {moduleCards.map((card, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                initial="hidden"
                animate={gridInView ? "visible" : "hidden"}
                custom={2 + i}
                className="rounded-xl p-8 sm:p-10
                  bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50
                  hover:border-slate-300 dark:hover:border-slate-700/50 transition-all duration-300
                  hover:shadow-lg dark:hover:shadow-black/20 group"
              >
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-6
                  ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {card.title}
                </h3>
                <p className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 leading-relaxed mb-6`}>
                  {card.desc}
                </p>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-6">
                  {card.badge}
                </div>
                <motion.a
                  whileHover={{ x: 6 }}
                  href="#"
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${card.linkColor}`}
                >
                  {card.link} <ArrowRight className="w-4 h-4" />
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Reporting Section ── */}

      {/* ── AI Reporting Section ── */}
      <section ref={reportRef} className="relative px-6 sm:px-8 lg:px-10 py-24 max-w-7xl mx-auto">
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={reportInView ? "visible" : "hidden"}
          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/50
            bg-white dark:bg-slate-900/40 backdrop-blur-sm
            hover:border-slate-300 dark:hover:border-slate-700/50 transition-all duration-300
            hover:shadow-lg dark:hover:shadow-black/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-10 sm:p-12 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/50">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={0}
                className="mb-6"
              >
                <ProfessionalBadge text={t("report.badge")} />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
              >
                {t("report.titleLine1")}<br />{t("report.titleLine2")}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={reportInView ? "visible" : "hidden"}
                custom={2}
                className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-md`}
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
                  bg-primary hover:bg-emerald-500 text-white transition-all duration-200
                  shadow-lg shadow-emerald-500/20 w-fit"
              >
                <FileText className="w-5 h-5" /> {t("common.viewDocumentation")}
              </motion.button>
            </div>

            {/* Right Illustration */}
            <div className="relative flex items-center justify-center p-10 sm:p-12 lg:p-14
              bg-slate-50/50 dark:bg-slate-950/50">

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
                  className="w-52 sm:w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl
                    border border-slate-200 dark:border-slate-700 p-6 relative z-10"
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
                  className="absolute -left-16 top-12 w-32 bg-white dark:bg-slate-900 rounded-lg
                    border border-slate-200 dark:border-slate-700 shadow-lg p-4"
                >
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
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
      <section ref={workflowRef} className="relative px-6 sm:px-8 lg:px-10 py-24 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <ProfessionalBadge text="Methodology" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {t("workflow.title")}
          </h2>
          <p className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 max-w-2xl mx-auto`}>
            {t("workflow.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[5%] right-[5%] h-0.5
            bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                initial="hidden"
                animate={workflowInView ? "visible" : "hidden"}
                custom={i}
                className="rounded-xl p-8
                  bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50
                  hover:border-slate-300 dark:hover:border-slate-700/50 transition-all duration-300
                  hover:shadow-lg dark:hover:shadow-black/20 group text-center"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center
                    ${step.bgLight} ${step.bgDark} ${step.color}
                    group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-300 dark:text-slate-700">
                    0{step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {t(`workflow.steps.${i}.title`)}
                </h3>
                <p className={`${descriptionTextClass} text-slate-600 dark:text-slate-400 leading-relaxed`}>
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
              bg-primary hover:bg-emerald-500 text-white transition-all duration-200
              shadow-lg shadow-emerald-500/20"
          >
            {t("workflow.primaryCta")} <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.02 }}
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200
              transition-colors duration-200"
          >
            {t("workflow.secondaryCta")} <ExternalLink className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
