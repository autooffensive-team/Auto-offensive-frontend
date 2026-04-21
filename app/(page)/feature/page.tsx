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
    icon: <Search className="w-5 h-5" />,
    color: "text-#00BCA1",
    bgLight: "bg-emerald-50 border-emerald-200",
    bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800",
    step: 1,
  },
  {
    icon: <Bug className="w-5 h-5" />,
    color: "text-red-500",
    bgLight: "bg-red-50 border-red-200",
    bgDark: "dark:bg-red-950/40 dark:border-red-800",
    step: 2,
  },
  {
    icon: <Zap className="w-5 h-5" />,
    color: "text-violet-500",
    bgLight: "bg-violet-50 border-violet-200",
    bgDark: "dark:bg-violet-950/40 dark:border-violet-800",
    step: 3,
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    color: "text-blue-500",
    bgLight: "bg-blue-50 border-blue-200",
    bgDark: "dark:bg-blue-950/40 dark:border-blue-800",
    step: 4,
  },
];


/* ─── Animation Variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeInOut" as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: "easeInOut" as const },
  },
};

/* ─── Sub-components ─────────────────────────────────────────── */

function TerminalPreview() {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700/60 overflow-hidden text-left mt-6 shadow-lg">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-800/80 border-b border-slate-700/40">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-#00BCA1/70" />
        <span className="ml-3 text-xs text-slate-400 font-mono">pentest-cli v2.4.1</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-1.5">
        <div className="text-emerald-400">$ subfinder -d target.com -silent</div>
        <div className="text-slate-400">api.target.com</div>
        <div className="text-slate-400">admin.target.com</div>
        <div className="text-emerald-400 mt-2">$ nmap -sV api.target.com</div>
        <div className="text-slate-400">80/tcp  open  http nginx 1.24</div>
        <div className="text-yellow-400">443/tcp open  https</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-#00BCA1">▮</span>
          <span className="text-slate-500">_</span>
        </div>
      </div>
    </div>
  );
}

function AiBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase
      bg-#00BCA1/10 text-#00BCA1 dark:bg-emerald-400/10 dark:text-emerald-400
      border border-#00BCA1/20 dark:border-emerald-400/20 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-#00BCA1 dark:bg-emerald-400 animate-pulse" />
      {text}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full
      bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
      border border-slate-200 dark:border-slate-700">
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
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const reportRef = useRef(null);
  const workflowRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-80px" });
  const reportInView = useInView(reportRef, { once: true, margin: "-80px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-80px" });

  const aiStats = [
    { label: t("grid.ai.stats.threats"), val: "12.4K" },
    { label: t("grid.ai.stats.accuracy"), val: "99.1%" },
  ];

  const moduleCards = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      iconBg: "bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800",
      iconColor: "text-violet-500",
      title: t("grid.cards.sast.title"),
      desc: t("grid.cards.sast.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-emerald-600 dark:text-emerald-400",
      badge: t("grid.cards.sast.badge"),
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      iconBg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
      iconColor: "text-slate-700 dark:text-slate-300",
      title: t("grid.cards.cli.title"),
      desc: t("grid.cards.cli.desc"),
      link: t("common.viewDocumentation"),
      linkColor: "text-slate-700 dark:text-slate-300",
      badge: t("grid.cards.cli.badge"),
    },
  ];

  const reportTags = [
    t("report.tags.executiveOverview"),
    t("report.tags.technicalDeepDive"),
    t("report.tags.developerPatchNotes"),
  ];

  return (
    
      <div className="min-h-screen bg-white dark:bg-[#030712] font-sans text-slate-900 dark:text-white transition-colors duration-300" style={{ fontFamily: bodyFontFamily }}>

        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 text-center px-6"
        >
          {/* Grid background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(0,188,161,0.05) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-7xl h-80 rounded-full
            bg-[#00BCA1]/5 dark:bg-emerald-400/5 blur-3xl" />

          <div className="relative max-w-3xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={0}
              className="flex justify-center mb-6"
            >
              <AiBadge text={t("hero.badge")} />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={1}
              className="text-5xl sm:text-7xl font-black tracking-tight leading-[0.95] mb-6
                text-slate-900 dark:text-white"
              style={{ fontFamily: displayFontFamily }}
            >
              {t("hero.titleLine1")}<br />
              <span className="text-[#00BCA1] dark:text-emerald-400">{t("hero.titleLine2")}</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={2}
              className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              custom={3}
              className="flex flex-wrap gap-3 justify-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  bg-primary hover:bg-emerald-400 text-white transition-colors shadow-lg shadow-primary/20"
              >
                {t("hero.primaryCta")} <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
                  text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700
                  transition-colors"
              >
                {t("hero.secondaryCta")} <ExternalLink className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ── Module Grid ── */}
        <section ref={gridRef} className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">

          {/* Row 1: Wide + Narrow */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

            {/* MODULE 01 — Wide */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={0}
              whileHover={{ y: -4 }}
              className="lg:col-span-3 rounded-2xl p-7 sm:p-8
                bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800
                hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40
                transition-shadow duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50
                  border border-emerald-200 dark:border-emerald-800
                  flex items-center justify-center text-#00BCA1">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase
                  text-emerald-600 dark:text-emerald-400">Module 01</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 leading-snug">
                {t("grid.web.title")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                {t("grid.web.desc")}
              </p>

              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold
                text-emerald-600 dark:text-emerald-400 hover:gap-2.5 transition-all duration-200">
                {t("common.viewDocumentation")} <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <TerminalPreview />
            </motion.div>

            {/* AI-Powered — Narrow */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? "visible" : "hidden"}
              custom={1}
              whileHover={{ y: -4 }}
              className="lg:col-span-2 rounded-2xl p-7 sm:p-8 relative overflow-hidden
                bg-linear-to-br from-primary to-[#2CA3FF]
                hover:shadow-2xl hover:shadow-violet-500/20 transition-shadow duration-300"
            >
              {/* Dot texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              {/* Glow orb */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 w-40 h-40 rounded-full
                bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-3 leading-snug">
                  {t("grid.ai.title")}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {t("grid.ai.desc")}
                </p>

                {/* Mini stat cards */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {aiStats.map((s) => (
                    <div key={s.label} className="rounded-xl bg-white/10 border border-white/10 px-3 py-3">
                      <div className="text-xl font-black text-white">{s.val}</div>
                      <div className="text-[11px] text-white/60 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white
                    bg-white/15 border border-white/20 rounded-xl px-4 py-2.5 transition-colors"
                >
                  {t("common.viewDocumentation")} <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Row 2: SAST + CLI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moduleCards.map((card, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={gridInView ? "visible" : "hidden"}
                custom={2 + i}
                whileHover={{ y: -4 }}
                className="rounded-2xl p-7 sm:p-8
                  bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800
                  hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40
                  transition-shadow duration-300 backdrop-blur-sm"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5
                  ${card.iconBg} ${card.iconColor}`}>
                  {card.icon}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-3 leading-snug">
                  {card.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {card.desc}
                </p>
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-5">
                  {card.badge}
                </div>
                <a href="#" className={`inline-flex items-center gap-1.5 text-sm font-semibold
                  hover:gap-2.5 transition-all duration-200 ${card.linkColor}`}>
                  {card.link} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── AI-Assisted Reporting ── */}
        <section ref={reportRef} className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={reportInView ? "visible" : "hidden"}
            className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800
              bg-white dark:bg-slate-900/60 backdrop-blur-sm
              hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-shadow duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left */}
              <div className="p-8 sm:p-10 lg:p-12">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  custom={1}
                  className="mb-5"
                >
                  <AiBadge text={t("report.badge")} />
                </motion.div>

                <motion.h2
                  variants={fadeUp}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  custom={2}
                  className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight"
                >
                  {t("report.titleLine1")}<br />{t("report.titleLine2")}
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  custom={3}
                  className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-md"
                >
                  {t("report.desc")}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  custom={4}
                  className="flex flex-wrap gap-2 mb-8"
                >
                  {reportTags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </motion.div>

                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  custom={5}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(16,185,129,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold
                    bg-primary hover:bg-emerald-400 text-white transition-colors shadow-lg shadow-primary/20"
                >
                  <FileText className="w-4 h-4" /> {t("common.viewDocumentation")}
                </motion.button>
              </div>

              {/* Right — Report illustration */}
              <div className="relative flex items-center justify-center p-8 sm:p-12
                bg-slate-50 dark:bg-slate-800/40 border-t lg:border-t-0 lg:border-l
                border-slate-200 dark:border-slate-800">

                {/* BG glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />
                </div>

                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate={reportInView ? "visible" : "hidden"}
                  className="relative z-10"
                >
                  {/* Floating report card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 sm:w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
                      border border-slate-200 dark:border-slate-700 p-5 relative"
                  >
                    {/* Clipboard top */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2
                      w-12 h-5 bg-amber-400 rounded-t-lg shadow-md shadow-amber-400/30" />

                    <div className="flex items-center justify-center mb-4 mt-2">
                      <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="text-center text-xs font-black text-slate-800 dark:text-white mb-3 tracking-widest uppercase">
                      {t("report.cardTitle")}
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-1.5 justify-center mb-4">
                      {[
                        { h: 32, color: "bg-red-400" },
                        { h: 52, color: "bg-emerald-400" },
                        { h: 40, color: "bg-blue-400" },
                        { h: 64, color: "bg-amber-400" },
                        { h: 44, color: "bg-violet-400" },
                      ].map((b, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleY: 0 }}
                          animate={reportInView ? { scaleY: 1 } : { scaleY: 0 }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                          style={{ height: b.h, transformOrigin: "bottom" }}
                          className={`w-5 rounded-t-sm ${b.color}`}
                        />
                      ))}
                    </div>

                    {/* Text lines */}
                    {[80, 60, 70, 50].map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-2"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </motion.div>

                  {/* AI badge */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-3 -right-3 w-11 h-11 rounded-full
                      bg-#00BCA1 flex items-center justify-center
                      shadow-lg shadow-#00BCA1/40"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Secondary floating card */}
                  <motion.div
                    animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-12 top-8 w-28 bg-white dark:bg-slate-900 rounded-xl
                      border border-slate-200 dark:border-slate-700 shadow-xl p-3"
                  >
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">{t("report.criticalLabel")}</div>
                    <div className="text-lg font-black text-red-500">3</div>
                    <div className="flex gap-1 mt-1.5">
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

        {/* ── Integrated Attack Workflow ── */}
        <section ref={workflowRef} className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-primary dark:text-emerald-400 mb-3">
              {t("workflow.title")}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {t("workflow.subtitle")}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connector line — hidden on mobile */}
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px
              bg-linear-to-r from-transparent via-#00BCA1/30 to-transparent z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={workflowInView ? "visible" : "hidden"}
                  custom={i}
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl p-6 text-center border
                    bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800
                    hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40
                    transition-all duration-300 backdrop-blur-sm`}
                >
                  {/* Step number */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center
                      ${step.bgLight} ${step.bgDark} ${step.color}`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-black text-slate-300 dark:text-slate-700">
                      0{step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 text-left">
                    {t(`workflow.steps.${i}.title`)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left">
                    {t(`workflow.steps.${i}.desc`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            custom={4}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(16,185,129,0.3)" }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold
            bg-primary hover:bg-emerald-400 text-white transition-colors
                shadow-xl shadow-#00BCA1/20"
            >
              {t("workflow.primaryCta")} <ArrowRight className="w-4 h-4" />
            </motion.button>
            <a href="/resources" className="inline-flex items-center gap-2 text-sm font-semibold
              text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
              transition-colors">
              {t("workflow.secondaryCta")} <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </section>
      </div>

  );
}