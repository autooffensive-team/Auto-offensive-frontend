"use client";

import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { Download, FileText, Monitor, Lock, Zap, Shield, Cpu, Radio, ClipboardCheck, Terminal, Copy, Check, ArrowRight, ExternalLink } from "lucide-react";

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

const lineColor: Record<string, string> = {
  cmd: "text-slate-100",
  success: "text-[#00BCA1]",
  muted: "text-slate-500",
  warning: "text-amber-400",
  blank: "",
};

interface FeatureCardItem {
  icon: typeof Monitor;
  accent: string;
  title: string;
  desc: string;
}

interface SpecItem {
  label: string;
  value: string;
}

function AnimatedCLI() {
  const t = useTranslations("featurePages.cli");
  const [visibleLines, setVisibleLines] = useState(0);
  const [copied, setCopied] = useState(false);

  const cliLines = [
    { text: t("terminal.lines.0"), type: "cmd" },
    { text: t("terminal.lines.1"), type: "muted" },
    { text: t("terminal.lines.2"), type: "muted" },
    { text: t("terminal.lines.3"), type: "success" },
    { text: t("terminal.lines.4"), type: "success" },
    { text: t("terminal.lines.5"), type: "warning" },
    { text: t("terminal.lines.6"), type: "success" },
  ];

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= cliLines.length) clearInterval(timer);
    }, 400);
    return () => clearInterval(timer);
  }, [cliLines.length]);

  const handleCopy = () => {
    navigator.clipboard.writeText(t("terminal.copyValue"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInScale}
      className="rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#18181B]"
    >
      {/* Window bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#27272A] border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-3 text-xs text-[#71717A] font-mono">auto-offensive-cli</span>
        </div>
        <button 
          onClick={handleCopy} 
          className="text-[#71717A] hover:text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-[#00BCA1]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-[12px] leading-relaxed min-h-62.5 space-y-1">
        {cliLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={`${lineColor[line.type]} ${!line.text ? "h-3" : ""}`}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < cliLines.length && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-2 h-3.5 bg-emerald-500 align-middle"
          />
        )}
      </div>
    </motion.div>
  );
}

function FeatureCard({ card, index }: { card: FeatureCardItem; index: number }) {
  const Icon = card.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 rounded-2xl p-6 hover:shadow-lg hover:border-[#00BCA1]/40 transition-all duration-300"
    >
      <div 
        className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
        style={{ backgroundColor: `${card.accent}15`, borderColor: `${card.accent}30`, color: card.accent }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-3">{card.title}</h3>
      <p className="text-[14px] md:text-[16px] lg:text-[18px] text-[#52525B] dark:text-[#A1A1AA] leading-[1.6]">
        {card.desc}
      </p>
    </motion.div>
  );
}

export default function CLIFeature() {
  const t = useTranslations("featurePages.cli");
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  /* ─── RESPONSIVE FONT SIZING ─────────────────────────────
     Mobile:  16px  (text-[16px])
     Tablet:  18px  (text-[18px])
     Desktop: 20px  (text-[20px])
  */
  const bodyText = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.65]";
  const smallText = "text-[14px] md:text-[16px] lg:text-[18px] leading-[1.6]";

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const specsRef = useRef(null);
  const workflowRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const specsInView = useInView(specsRef, { once: true, margin: "-80px" });
  const workflowInView = useInView(workflowRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const featureCards = [
    {
      icon: Monitor,
      accent: "#00BCA1",
      title: t("cards.0.title"),
      desc: t("cards.0.desc"),
    },
    {
      icon: Lock,
      accent: "#3B82F6",
      title: t("cards.1.title"),
      desc: t("cards.1.desc"),
    },
    {
      icon: Zap,
      accent: "#8B5CF6",
      title: t("cards.2.title"),
      desc: t("cards.2.desc"),
    },
  ];

  const specs: SpecItem[] = [
    { label: t("specs.items.0.label"), value: t("specs.items.0.value") },
    { label: t("specs.items.1.label"), value: t("specs.items.1.value") },
    { label: t("specs.items.2.label"), value: t("specs.items.2.value") },
    { label: t("specs.items.3.label"), value: t("specs.items.3.value") },
    { label: t("specs.items.4.label"), value: t("specs.items.4.value") },
  ];

  const workflowSteps = [
    { icon: Terminal, title: t("workflow.steps.0.title"), desc: t("workflow.steps.0.desc") },
    { icon: Cpu, title: t("workflow.steps.1.title"), desc: t("workflow.steps.1.desc") },
    { icon: Radio, title: t("workflow.steps.2.title"), desc: t("workflow.steps.2.desc") },
    { icon: ClipboardCheck, title: t("workflow.steps.3.title"), desc: t("workflow.steps.3.desc") },
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
        {/* Subtle dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,188,161,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-40 right-0 w-96 h-96 bg-[#00BCA1]/8 rounded-full blur-3xl dark:bg-[#00BCA1]/4" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-80 h-80 bg-[#01509E]/8 rounded-full blur-3xl dark:bg-[#01509E]/4" />

        <div className="relative w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left — Content */}
            <motion.div 
              className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left"
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              {/* Title */}
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight mb-6 text-[#18181B] dark:text-white max-w-2xl"
                style={{ fontFamily: displayFontFamily }}
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
                className="flex w-full max-w-md flex-row gap-3 sm:gap-4 lg:justify-start"
              >
                <button className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 sm:px-8 py-3 sm:py-3.5 text-[15px] sm:text-base lg:text-[16px] font-semibold bg-[#00BCA1] text-white hover:bg-[#0AAE98] transition-all duration-300 hover:-translate-y-0.5">
                  <Download className="w-4 h-4" />
                  {t("hero.primaryCta")}
                </button>
                <button className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 sm:px-8 py-3 sm:py-3.5 text-[15px] sm:text-base lg:text-[16px] font-semibold bg-[#F7F5F0] text-[#18181B] border border-[#E2DDD5] hover:bg-[#EFE9DE] dark:bg-[#09090B] dark:text-white dark:border-white/10 dark:hover:bg-[#151A18] transition-all duration-300 hover:-translate-y-0.5">
                  <FileText className="w-4 h-4" />
                  {t("hero.secondaryCta")}
                </button>
              </motion.div>
            </motion.div>

            {/* Right — Terminal */}
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              <AnimatedCLI />
            </motion.div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          FEATURES — C-border Right
      ════════════════════════════════ */}
      <section
        ref={featuresRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            Powerful CLI Tools
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            Everything you need to run comprehensive security scans from your terminal.
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featureCards.map((card, i) => (
              <FeatureCard key={i} card={card} index={i + 1} />
            ))}
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          SPECS & BINARY — C-border Left
      ════════════════════════════════ */}
      <section
        ref={specsRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={specsInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("specs.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={specsInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            High-performance binary built for speed and security.
          </motion.p>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={specsInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            flex flex-col md:flex-row"
        >
          {/* Left: Specs List */}
          <div className="flex flex-1 items-stretch bg-[#F7F5F0] dark:bg-[#09090B] p-5 md:p-8">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#111113]">
              {specs.map((spec, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i * 0.1}
                  className={`flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 ${
                    i < specs.length - 1 ? "border-b border-[#E2DDD5] dark:border-white/10" : ""
                  }`}
                >
                  <span className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-widest">
                    {spec.label}
                  </span>
                  <span className="text-[15px] sm:text-base font-mono font-semibold text-[#00BCA1] dark:text-[#7CE5D4]">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Binary Info */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-[#00BCA1]/10">
                <Shield className="w-5 h-5 text-[#00BCA1]" />
              </div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white"
                style={{ fontFamily: displayFontFamily }}
              >
                {t("specs.binaryTitle")}
              </h3>
            </div>

            <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA] mb-6`}>
              {t("specs.binaryDesc")}
            </p>

            <div className="flex flex-wrap gap-2">
              {["Rust", "gRPC", "mTLS"].map((tag) => (
                <code 
                  key={tag} 
                  className="text-xs px-3 py-1.5 rounded-lg font-mono bg-[#F7F5F0] dark:bg-[#1A1A1A] text-[#00BCA1] border border-[#E2DDD5] dark:border-white/10"
                >
                  {tag}
                </code>
              ))}
            </div>
          </div>
        </motion.div>
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
            Simple, streamlined workflow from scan to report in minutes.
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={workflowInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 1}
                  className="flex flex-col items-start p-5 sm:p-6 bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 rounded-xl hover:border-[#00BCA1]/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-[#00BCA1]/10 text-[#00BCA1] border border-[#00BCA1]/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-[15px] sm:text-base font-bold text-[#18181B] dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                    {step.desc}
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
        className="relative px-4 sm:px-8 lg:px-10 py-16 max-w-7xl mx-auto"
      >
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="rounded-3xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#18181B] relative"
        >
          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "radial-gradient(rgba(0,188,161,0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glow */}
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#00BCA1]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight"
              style={{ fontFamily: displayFontFamily }}
            >
              {t("cta.title")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              custom={2}
              className={`${bodyText} text-[#94A3B8] mb-10 max-w-2xl mx-auto`}
            >
              {t("cta.subtitle")}
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={ctaInView ? "visible" : "hidden"}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <button className="px-8 py-3.5 rounded-lg bg-[#00BCA1] text-white font-bold text-base sm:text-[15px] hover:bg-[#0AAE98] transition-colors duration-300 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {t("cta.primaryCta")}
              </button>
              <button className="px-8 py-3.5 rounded-lg border border-white/15 text-white font-semibold text-base sm:text-[15px] hover:bg-white/5 transition-colors duration-300 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {t("cta.secondaryCta")}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
