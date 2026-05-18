"use client";

import { motion, useInView } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ExternalLink,
  FileText,
  Fingerprint,
  GitBranch,
  Link2,
  Search,
  Shield,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState, useRef } from "react";

const githubYaml = `name: Security Scan
on: [push, pull_request]

jobs:
  guardian-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Auto-Offensive Scan
        uses: auto-offensive/scan@v1
        with:
          api_key: \${{ secrets.AUTO_OFFENSIVE_API_KEY }}`;

const gitlabYaml = `auto-offensive-scan:
  stage: security
  image: auto-offensive/scanner:latest
  script:
    - ao scan --full-depth
    - ao report --format sarif
  artifacts:
    reports:
      sast: ao-report.json
  only:
    - merge_requests
    - main`;

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

export default function CICDFeature() {
  const t = useTranslations("featurePages.cicd");
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

  const [activeTab, setActiveTab] = useState<"github" | "gitlab">("github");

  const heroRef = useRef(null);
  const pipelineRef = useRef(null);
  const findingRef = useRef(null);
  const integrationRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const pipelineInView = useInView(pipelineRef, { once: true, margin: "-80px" });
  const findingInView = useInView(findingRef, { once: true, margin: "-80px" });
  const integrationInView = useInView(integrationRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const pipelineSteps: {
    num: string;
    icon: ReactNode;
    title: string;
    desc: string;
    active: boolean;
  }[] = [
    {
      num: "1",
      icon: <Link2 className="h-5 w-5" />,
      title: t("pipeline.steps.0.title"),
      desc: t("pipeline.steps.0.desc"),
      active: false,
    },
    {
      num: "2",
      icon: <Fingerprint className="h-5 w-5" />,
      title: t("pipeline.steps.1.title"),
      desc: t("pipeline.steps.1.desc"),
      active: false,
    },
    {
      num: "3",
      icon: <Search className="h-5 w-5" />,
      title: t("pipeline.steps.2.title"),
      desc: t("pipeline.steps.2.desc"),
      active: true,
    },
    {
      num: "4",
      icon: <Bell className="h-5 w-5" />,
      title: t("pipeline.steps.3.title"),
      desc: t("pipeline.steps.3.desc"),
      active: false,
    },
  ];

  const integrationFeatures: { icon: ReactNode; title: string; desc: string }[] = [
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: t("integration.items.0.title"),
      desc: t("integration.items.0.desc"),
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: t("integration.items.1.title"),
      desc: t("integration.items.1.desc"),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("integration.items.2.title"),
      desc: t("integration.items.2.desc"),
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
                  <GitBranch className="w-4 h-4" />
                  {t("hero.primaryCta")}
                </button>
                <button className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 sm:px-8 py-3 sm:py-3.5 text-[15px] sm:text-base lg:text-[16px] font-semibold bg-[#F7F5F0] text-[#18181B] border border-[#E2DDD5] hover:bg-[#EFE9DE] dark:bg-[#09090B] dark:text-white dark:border-white/10 dark:hover:bg-[#151A18] transition-all duration-300 hover:-translate-y-0.5">
                  <ExternalLink className="w-4 h-4" />
                  {t("hero.secondaryCta")}
                </button>
              </motion.div>
            </motion.div>

            {/* Right — Git Repo Card */}
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              <div className="rounded-2xl border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#111113] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E2DDD5] dark:border-white/10">
                  <div className="p-2 rounded-lg bg-[#00BCA1]/10">
                    <GitBranch className="w-5 h-5 text-[#00BCA1]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] sm:text-base font-semibold text-[#18181B] dark:text-white">
                      {t("hero.repoName")}
                    </div>
                    <div className="text-xs text-[#71717A] dark:text-[#A1A1AA]">Latest scan</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-[#0F6E56] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {t("hero.active")}
                  </span>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i * 0.1}
                      className="flex items-center gap-3 rounded-lg bg-[#F7F5F0] dark:bg-[#1A1A1A] p-4"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                          i === 2 ? "bg-amber-100 dark:bg-amber-950/40" : "bg-emerald-100 dark:bg-emerald-950/40"
                        }`}
                      >
                        {i === 2 ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-[#00BCA1]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] sm:text-[15px] font-semibold text-[#18181B] dark:text-white">
                          {t("hero.scanTitle")}
                        </div>
                        <div className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                          {i === 2 ? t("hero.vulnerabilityFound") : t("hero.passed")}
                        </div>
                      </div>
                      <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] shrink-0">
                        {i === 1 ? t("hero.time1") : i === 2 ? t("hero.time2") : t("hero.time3")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          PIPELINE STEPS — C-border Right
      ════════════════════════════════ */}
      <section
        ref={pipelineRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={pipelineInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("pipeline.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={pipelineInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("pipeline.subtitle")}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={pipelineInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={pipelineInView ? "visible" : "hidden"}
                custom={i + 1}
                whileHover={{ y: -4 }}
                className={`rounded-xl p-5 sm:p-6 border transition-all duration-300 ${
                  step.active
                    ? "border-[#00BCA1] bg-linear-to-br from-[#00BCA1]/5 to-[#0AAE98]/5 dark:from-[#00BCA1]/10 dark:to-[#0AAE98]/10"
                    : "border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#111113]"
                }`}
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
                    step.active 
                      ? "bg-[#00BCA1]/20 text-[#00BCA1]" 
                      : "bg-[#F0F0F0] dark:bg-[#1A1A1A] text-[#52525B] dark:text-[#A1A1AA]"
                  }`}
                >
                  {step.icon}
                </div>
                <h3
                  className={`mb-2 text-[15px] sm:text-base font-bold ${
                    step.active ? "text-[#00BCA1]" : "text-[#18181B] dark:text-white"
                  }`}
                >
                  {step.num}. {step.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    step.active ? "text-[#00BCA1]/70" : "text-[#52525B] dark:text-[#A1A1AA]"
                  }`}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          FINDING DETAILS — C-border Left
      ════════════════════════════════ */}
      <section
        ref={findingRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={findingInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            Detailed Vulnerability Analysis
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={findingInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            Get actionable insights with code snippets and remediation guidance.
          </motion.p>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={findingInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            flex flex-col md:flex-row"
        >
          {/* Left: Code Block */}
          <div className="flex flex-1 items-stretch bg-[#F7F5F0] dark:bg-[#09090B] p-5 md:p-8">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#18181B]">
              <div className="bg-[#27272A] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                <span className="text-xs text-[#71717A] font-mono">AUTH_SERVICE.PY</span>
                <span className="text-[11px] font-bold text-red-400 font-mono">{t("finding.codeBadge")}</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <div className="mb-1 text-slate-500">def validate_user(user_input, password):</div>
                <div className="mb-1 pl-4 text-cyan-400">
                  sql = &quot;SELECT * FROM users WHERE user = &apos;...&apos;&quot; [SQL INJECTION]
                </div>
                <div className="mb-4 pl-4 text-slate-300">cursor.execute(query)</div>
                <div className="rounded border border-[#00BCA1]/20 bg-[#00BCA1]/10 px-3 py-3 mt-4">
                  <div className="mb-2 text-xs font-bold tracking-widest text-[#00BCA1]">
                    {t("finding.remediation")}
                  </div>
                  <div className="text-slate-300">query = &quot;SELECT * FROM users WHERE user = %s&quot;</div>
                  <div className="text-slate-300">cursor.execute(query, (user_input,))</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Finding Details */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                {t("finding.title")}
              </span>
            </div>

            <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA] mb-6`}>
              {t("finding.desc")}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E2DDD5] dark:border-white/10">
                <span className="text-[14px] text-[#71717A] dark:text-[#A1A1AA]">{t("finding.confidence")}</span>
                <span className="text-[15px] font-semibold text-[#00BCA1]">
                  {t("finding.confidenceValue")}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#E2DDD5] dark:border-white/10">
                <span className="text-[14px] text-[#71717A] dark:text-[#A1A1AA]">CWE</span>
                <span className="text-[15px] font-semibold text-blue-500">CWE-89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#71717A] dark:text-[#A1A1AA]">{t("finding.fixTime")}</span>
                <span className="text-[15px] font-semibold text-[#18181B] dark:text-white">
                  {t("finding.fixTimeValue")}
                </span>
              </div>
            </div>

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#00BCA1] py-3 text-[15px] font-bold text-white hover:bg-[#0AAE98] transition-colors duration-300">
              <Shield className="h-4 w-4" />
              {t("finding.primaryCta")}
            </button>
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          INTEGRATION — C-border Right
      ════════════════════════════════ */}
      <section
        ref={integrationRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={integrationInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFontFamily }}
          >
            {t("integration.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={integrationInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("integration.subtitle")}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={integrationInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            flex flex-col md:flex-row"
        >
          {/* Left: Code Tabs */}
          <div className="flex flex-1 items-stretch bg-[#F7F5F0] dark:bg-[#09090B] p-5 md:p-8">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#0D1117]">
              <div className="flex border-b border-white/10 bg-[#161B22]">
                {(["github", "gitlab"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-[#00BCA1] bg-[#0D1117] text-white"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab === "github" ? t("integration.tabs.github") : t("integration.tabs.gitlab")}
                  </button>
                ))}
              </div>
              <pre className="m-0 overflow-x-auto p-5 font-mono text-sm leading-relaxed text-slate-300">
                <code>{activeTab === "github" ? githubYaml : gitlabYaml}</code>
              </pre>
            </div>
          </div>

          {/* Right: Features */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <h3
              className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mb-6"
              style={{ fontFamily: displayFontFamily }}
            >
              Why integrate?
            </h3>
            <div className="space-y-4">
              {integrationFeatures.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate={integrationInView ? "visible" : "hidden"}
                  custom={i + 1}
                  className="flex gap-4 items-start"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00BCA1]/10 text-[#00BCA1] shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-[15px] sm:text-base font-bold text-[#18181B] dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA]`}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                <ArrowRight className="w-4 h-4" />
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
