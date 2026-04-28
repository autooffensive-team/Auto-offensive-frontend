"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

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

  const [activeTab, setActiveTab] = useState<"github" | "gitlab">("github");

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
      className="min-h-screen bg-[#F7F5F0] font-sans dark:bg-[#09090B]"
      style={{ fontFamily: bodyFontFamily }}
    >
      <section className="relative overflow-hidden border-b border-black/9 bg-white dark:border-white/9 dark:bg-[#111113]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(0,188,161,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#00BCA1]/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp(0)}>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00BCA1]/20 bg-[#00BCA1]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#00BCA1]">
                <GitBranch className="h-3.5 w-3.5" />
                {t("hero.badge")}
              </span>

              <h1
                className="mb-5 text-5xl leading-tight font-black text-[#1A1A1A] sm:text-6xl lg:text-7xl dark:text-[#EDEDED]"
                style={{ fontFamily: displayFontFamily }}
              >
                {t("hero.titleLine1")}
                <br />
                <span className="text-[#00BCA1]">{t("hero.titleLine2")}</span>
              </h1>

              <p className="mb-8 max-w-md text-lg leading-relaxed text-[#5C5C5C] sm:text-xl dark:text-[#9A9A9A]">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#00BCA1] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#00A390]">
                  <GitBranch className="h-4 w-4" />
                  {t("hero.primaryCta")}
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-black/9 bg-white px-5 py-3 text-base font-semibold text-[#1A1A1A] transition-colors hover:border-[#00BCA1] dark:border-white/9 dark:bg-[#111113] dark:text-[#EDEDED]">
                  {t("hero.secondaryCta")} <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="relative">
              <div className="rounded-2xl border border-black/9 bg-white p-6 shadow-xl dark:border-white/9 dark:bg-[#111113]">
                <div className="mb-4 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-[#1A1A1A] dark:text-[#EDEDED]" />
                  <span className="text-base font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">
                    {t("hero.repoName")}
                  </span>
                  <span className="ml-auto rounded-full bg-[#00BCA1]/10 px-2 py-1 text-sm text-[#00BCA1]">
                    {t("hero.active")}
                  </span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg bg-[#F7F5F0] p-3 dark:bg-[#1A1A1A]"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          i === 2 ? "bg-amber-500/20" : "bg-[#00BCA1]/10"
                        }`}
                      >
                        {i === 2 ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-[#00BCA1]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium text-[#1A1A1A] dark:text-[#EDEDED]">
                          {t("hero.scanTitle")}
                        </div>
                        <div className="text-sm text-[#9A9A9A]">
                          {i === 2 ? t("hero.vulnerabilityFound") : t("hero.passed")}
                        </div>
                      </div>
                      <span className="text-sm text-[#9A9A9A]">
                        {i === 1 ? t("hero.time1") : i === 2 ? t("hero.time2") : t("hero.time3")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/9 py-16 dark:border-white/9">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-10">
            <h2 className="mb-3 text-3xl font-bold text-[#1A1A1A] sm:text-4xl dark:text-[#EDEDED]">
              {t("pipeline.title")}
            </h2>
            <p className="text-lg text-[#5C5C5C] dark:text-[#9A9A9A]">{t("pipeline.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.1)}
                whileHover={{ y: -4 }}
                className={`rounded-xl p-5 transition-all ${
                  step.active
                    ? "bg-linear-to-br from-[#3B82F6] to-indigo-600 shadow-lg shadow-blue-500/20"
                    : "border border-black/9 bg-white dark:border-white/9 dark:bg-[#111113]"
                }`}
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
                    step.active ? "bg-white/15 text-white" : "bg-[#00BCA1]/10 text-[#00BCA1]"
                  }`}
                >
                  {step.icon}
                </div>
                <h3
                  className={`mb-2 text-base font-bold ${
                    step.active ? "text-white" : "text-[#1A1A1A] dark:text-[#EDEDED]"
                  }`}
                >
                  {step.num}. {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    step.active ? "text-white/70" : "text-[#5C5C5C] dark:text-[#9A9A9A]"
                  }`}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-[#111113]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              {...fadeUp(0)}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#0D1117] font-mono text-sm"
            >
              <div className="flex items-center gap-2 border-b border-white/5 bg-[#161B22] px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#00BCA1]" />
                <span className="ml-2 text-sm text-slate-500">AUTH_SERVICE.PY</span>
                <span className="ml-auto text-sm font-bold text-red-500">{t("finding.codeBadge")}</span>
              </div>
              <div className="p-5">
                <div className="mb-1 text-slate-500">def validate_user(user_input, password):</div>
                <div className="mb-1 pl-4 text-cyan-400">
                  sql = &quot;SELECT * FROM users WHERE user = &apos;...&apos;&quot; [SQL INJECTION]
                </div>
                <div className="mb-4 pl-4 text-slate-300">cursor.execute(query)</div>
                <div className="mb-4 pl-4 text-slate-300">cursor.execute(query)</div>
                <div className="rounded border border-[#00BCA1]/20 bg-[#00BCA1]/10 px-3 py-3">
                  <div className="mb-2 text-xs font-bold tracking-widest text-[#00BCA1]">
                    {t("finding.remediation")}
                  </div>
                  <div className="text-slate-300">query = &quot;SELECT * FROM users WHERE user = %s&quot;</div>
                  <div className="text-slate-300">cursor.execute(query, (user_input,))</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.1)}
              className="rounded-xl border border-black/9 bg-white p-6 dark:border-white/9 dark:bg-[#111113]"
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <span className="text-sm font-black uppercase tracking-widest text-red-500">
                  {t("finding.title")}
                </span>
              </div>
              <p className="mb-5 text-base leading-relaxed text-[#5C5C5C] dark:text-[#9A9A9A]">
                {t("finding.desc")}
              </p>
              <div className="mb-5 space-y-3">
                <div className="flex justify-between border-b border-black/9 py-2 dark:border-white/9">
                  <span className="text-base text-[#9A9A9A]">{t("finding.confidence")}</span>
                  <span className="text-base font-semibold text-[#00BCA1]">
                    {t("finding.confidenceValue")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/9 py-2 dark:border-white/9">
                  <span className="text-base text-[#9A9A9A]">CWE</span>
                  <span className="text-base font-semibold text-blue-500">CWE-89</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-base text-[#9A9A9A]">{t("finding.fixTime")}</span>
                  <span className="text-base font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">
                    {t("finding.fixTimeValue")}
                  </span>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BCA1] py-3 text-base font-bold text-white transition-colors hover:bg-[#00A390]">
                <Shield className="h-4 w-4" />
                {t("finding.primaryCta")}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-8">
            <h2 className="mb-3 text-3xl font-bold text-[#1A1A1A] sm:text-4xl dark:text-[#EDEDED]">
              {t("integration.title")}
            </h2>
            <p className="text-lg text-[#5C5C5C] dark:text-[#9A9A9A]">{t("integration.subtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div {...fadeUp(0)} className="overflow-hidden rounded-xl border border-white/10 bg-[#0D1117]">
              <div className="flex border-b border-white/10">
                {(["github", "gitlab"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "border-[#00BCA1] bg-[#161B22] text-white"
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
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="flex flex-col gap-5">
              {integrationFeatures.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-xl border border-black/9 bg-white p-4 dark:border-white/9 dark:bg-[#111113]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00BCA1]/10 text-[#00BCA1]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-bold text-[#1A1A1A] dark:text-[#EDEDED]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#5C5C5C] dark:text-[#9A9A9A]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp(0)}
            className="relative overflow-hidden rounded-2xl px-6 py-12"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0f2940 100%)" }}
          >
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-[#00BCA1]/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-[#0077B6]/10 blur-3xl" />

            <div className="relative z-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{t("cta.title")}</h2>
              <p className="mx-auto mb-8 max-w-md text-lg text-[#9A9A9A]">{t("cta.subtitle")}</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <button className="rounded-xl bg-[#00BCA1] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#00A390]">
                  {t("cta.primaryCta")}
                </button>
                <button className="rounded-xl border border-white/20 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/5">
                  {t("cta.secondaryCta")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
