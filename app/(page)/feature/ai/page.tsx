"use client";

import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Brain, ArrowRight, ExternalLink, Plus, Rocket, Zap, Wrench, RefreshCw, Map, BarChart, Link2, FileText } from "lucide-react";
import { useRef } from "react";
import { GridBackground } from "@/components/shared/GridBackground";

const severityData = [
  { label: "Critical", count: 38, color: "#ef4444", pct: 31 },
  { label: "High", count: 52, color: "#f97316", pct: 42 },
  { label: "Medium", count: 34, color: "#3b82f6", pct: 27 },
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
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function AIFeature() {
  const t = useTranslations("featurePages.ai");
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const heroTitleFontFamily = isKhmer
    ? 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif'
    : displayFontFamily;
  const heroTitleLineHeight = isKhmer ? 1.2 : 1.1;
  const heroTitleLetterSpacing = isKhmer ? "0" : "-0.025em";

  /* ─── RESPONSIVE FONT SIZING ─────────────────────────────
     Mobile:  16px  (text-[16px])
     Tablet:  18px  (text-[18px])
     Desktop: 20px  (text-[20px])
  */
  const bodyText = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.65]";
  const smallText = "text-[14px] md:text-[16px] lg:text-[18px] leading-[1.6]";

  const heroRef = useRef(null);
  const workflowRef = useRef(null);
  const dashboardRef = useRef(null);
  const edgeRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-80px" });
  const dashboardInView = useInView(dashboardRef, { once: true, margin: "-80px" });
  const edgeInView = useInView(edgeRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const workflowSteps = [
    {
      num: "1",
      icon: BarChart,
      title: t("workflow.steps.0.title"),
      desc: t("workflow.steps.0.desc"),
    },
    {
      num: "2",
      icon: Brain,
      title: t("workflow.steps.1.title"),
      desc: t("workflow.steps.1.desc"),
    },
    {
      num: "3",
      icon: FileText,
      title: t("workflow.steps.2.title"),
      desc: t("workflow.steps.2.desc"),
    },
  ];

  const dashboardBullets = [
    { icon: BarChart, text: t("dashboard.bullets.0") },
    { icon: Link2, text: t("dashboard.bullets.1") },
    { icon: FileText, text: t("dashboard.bullets.2") },
  ];

  const aiEdgeItems = [
    {
      icon: Zap,
      title: t("edge.items.0.title"),
      desc: t("edge.items.0.desc"),
      dark: false,
    },
    {
      icon: Wrench,
      title: t("edge.items.1.title"),
      desc: t("edge.items.1.desc"),
      dark: true,
    },
    {
      icon: RefreshCw,
      title: t("edge.items.2.title"),
      desc: t("edge.items.2.desc"),
      dark: false,
    },
    {
      icon: Map,
      title: t("edge.items.3.title"),
      desc: t("edge.items.3.desc"),
      dark: false,
    },
  ];

  return (
    <div 
      className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] text-[#18181B] dark:text-white transition-colors duration-300"
      style={{ fontFamily: bodyFontFamily }}
    >

      {/* ════════════════════════════════
          HERO SECTION
      ════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full bg-white dark:bg-[#111113] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 transition-colors duration-300"
      >
        {/* Dashed grid background */}
        <GridBackground
          variant="dashed"
          gridSize={22}
        />

        <div className="relative w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Content */}
            <motion.div 
              className="flex flex-col items-center justify-center text-center"
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              {/* Title */}
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-[#18181B] dark:text-white max-w-2xl"
                style={{
                  fontFamily: heroTitleFontFamily,
                  fontWeight: isKhmer ? 800 : 700,
                  lineHeight: heroTitleLineHeight,
                  letterSpacing: heroTitleLetterSpacing,
                }}
              >
                {t("hero.titleLine1")}{" "}
                <span className="text-[#00BCA1] dark:text-[#7CE5D4] block">
                  {t("hero.titleLine2")}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                custom={1}
                className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] mb-8 max-w-xl`}
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                custom={2}
                className="flex flex-row gap-3 sm:gap-4 justify-center"
              >
                <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border-2 border-[#00BCA1] bg-[#00BCA1] px-3 py-3 sm:px-7.5 sm:py-3.5 text-[14px] sm:text-[15px] font-black leading-none text-black transition-transform duration-200 hover:-translate-y-px before:pointer-events-none before:absolute before:inset-0 before:translate-y-full before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)] before:transition-transform before:duration-200 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)] after:transition-transform after:duration-200 after:content-[''] hover:before:translate-y-0 hover:after:translate-y-0">
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="whitespace-nowrap">{t("hero.primaryCta")}</span>
                  </span>
                </button>
                <button className="ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)] bg-white dark:bg-[rgba(0,208,178,0.06)] px-4 py-3 sm:px-6.5 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-black dark:text-white backdrop-blur-sm duration-200 cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t("hero.secondaryCta")}</span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          WORKFLOW — C-border Right
      ════════════════════════════════ */}
      <section
        ref={workflowRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("workflow.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("workflow.subtitle")}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {workflowSteps.map((step, i) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 1}
                  className="bg-transparent border border-[#E2DDD5] dark:border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-[#00BCA1] hover:shadow-[0_0_12px_rgba(0,188,161,0.15)]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00BCA1]/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5 text-[#00BCA1]" />
                  </div>
                  <h3 className="text-[15px] sm:text-base font-bold text-[#18181B] dark:text-white mb-2">
                    {step.num}. {step.title}
                  </h3>
                  <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA] leading-[1.6]`}>
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          DASHBOARD — C-border Left
      ════════════════════════════════ */}
      <section
        ref={dashboardRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={dashboardInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("dashboard.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={dashboardInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("dashboard.desc")}
          </motion.p>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={dashboardInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            flex flex-col md:flex-row"
        >
          {/* Left: Severity Chart */}
          <div className="flex flex-1 items-stretch bg-[#F7F5F0] dark:bg-[#09090B] p-5 md:p-8">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#111113] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#E2DDD5] dark:border-white/10">
                <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white">
                  {t("dashboard.severityTitle")}
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#0F6E56] dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                  {t("dashboard.realTime")}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-6">
                <div className="relative w-32 h-32 shrink-0">
                  <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
                    {severityData.map((d, i) => {
                      const prev = severityData.slice(0, i).reduce((a, b) => a + b.pct, 0);
                      return (
                        <circle
                          key={i}
                          cx="64"
                          cy="64"
                          r="48"
                          fill="none"
                          stroke={d.color}
                          strokeWidth="16"
                          strokeDasharray={`${(d.pct / 100) * 301.4} 301.4`}
                          strokeDashoffset={`-${(prev / 100) * 301.4}`}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#18181B] dark:text-white">124</span>
                    <span className="text-xs text-[#71717A] dark:text-[#A1A1AA]">{t("dashboard.total")}</span>
                  </div>
                </div>

                <div className="flex-1">
                  {severityData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 mb-3 last:mb-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-sm text-[#52525B] dark:text-[#A1A1AA]">
                        {t(`severity.${d.label.toLowerCase()}`)} ({d.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E2DDD5] dark:border-white/10">
                <div>
                  <div className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-widest mb-2">
                    {t("dashboard.meanTimeToFix")}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-white">
                    {t("dashboard.meanTimeValue")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-widest mb-2">
                    {t("dashboard.exploitability")}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-500">
                    {t("dashboard.exploitabilityValue")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Features List */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <h3
              className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mb-6"
              style={{ fontFamily: displayFontFamily }}
            >
              Key Features
            </h3>
            <div className="space-y-4">
              {dashboardBullets.map((item, i) => {
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i + 1}
                    className="flex items-start gap-3"
                  >
                    <IconComp className="w-5 h-5 text-[#00BCA1] shrink-0 mt-0.5" />
                    <span className={`${smallText} text-[#52525B] dark:text-[#A1A1AA]`}>
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          AI EDGE — C-border Right
      ════════════════════════════════ */}
      <section
        ref={edgeRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={edgeInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("edge.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={edgeInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("edge.subtitle")}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={edgeInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {aiEdgeItems.map((item, i) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 1}
                  className={`rounded-xl p-5 sm:p-6 border transition-all duration-300 bg-transparent border-[#E2DDD5] dark:border-white/10 hover:border-[#00BCA1] hover:shadow-[0_0_12px_rgba(0,188,161,0.15)]`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <IconComp className="w-5 h-5 text-[#00BCA1]" />
                    <h3 className="text-[15px] sm:text-base font-bold text-[#18181B] dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className={`${smallText} leading-[1.6] text-[#52525B] dark:text-[#A1A1AA]`}>
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          CTA SECTION
      ════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative px-4 sm:px-6 lg:px-8 py-16 w-full"
      >
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="rounded-3xl overflow-visible border border-transparent dark:border-white/5 bg-[#F7F5F0] dark:bg-[#111113] relative"
        >
          {/* Blobs — clipped inside the frame */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -left-24 -top-32 h-96 w-80 rounded-full bg-[#01509e] opacity-95 blur-3xl dark:opacity-40" />
            <div className="absolute right-14 -top-20 h-80 w-80 rounded-full bg-[#00d0b2] opacity-50 blur-3xl dark:opacity-20" />
            <div className="absolute -bottom-32 -right-10 h-80 w-96 rounded-full bg-[#0194c7] opacity-70 blur-3xl dark:opacity-30" />
            <div className="absolute left-[42%] top-[20%] h-52 w-64 rounded-full bg-[#00d0b2] opacity-20 blur-3xl dark:opacity-10" />
            <div className="absolute left-[15%] bottom-[10%] h-56 w-56 rounded-full bg-[#e53e3e] opacity-40 blur-3xl dark:opacity-20" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-8 px-8 py-5 sm:px-12 sm:py-6 lg:px-16 lg:py-6 max-w-7xl mx-auto">
            {/* Left — Image (pops outside the frame) */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              custom={0}
              className="flex items-center justify-center lg:-my-20 lg:-ml-8"
            >
              <img
                src="/shadow_isolated_automation.webp"
                alt="Automation illustration"
                className="w-full max-w-xs sm:max-w-xs lg:max-w-sm xl:max-w-md object-contain drop-shadow-2xl lg:-translate-y-16"
              />
            </motion.div>

            {/* Right — Content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
                custom={1}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-4 leading-tight"
                style={{ fontFamily: displayFontFamily }}
              >
                {t("cta.title")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
                custom={2}
                className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] mb-8 max-w-lg`}
              >
                {t("cta.subtitle")}
              </motion.p>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
                custom={3}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border-2 border-[#00BCA1] bg-[#00BCA1] px-3 py-3 sm:px-7.5 sm:py-3.5 text-[14px] sm:text-[15px] font-black leading-none text-black transition-transform duration-200 hover:-translate-y-px before:pointer-events-none before:absolute before:inset-0 before:translate-y-full before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)] before:transition-transform before:duration-200 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)] after:transition-transform after:duration-200 after:content-[''] hover:before:translate-y-0 hover:after:translate-y-0">
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span className="whitespace-nowrap">{t("cta.primaryCta")}</span>
                  </span>
                </button>
                <button className="ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)] bg-white dark:bg-[rgba(0,208,178,0.06)] px-4 py-3 sm:px-6.5 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-black dark:text-white backdrop-blur-sm duration-200 cursor-pointer hover:bg-white/80">
                  <ExternalLink className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t("cta.secondaryCta")}</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
