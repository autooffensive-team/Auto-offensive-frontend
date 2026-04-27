"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Brain, ArrowRight, ExternalLink, Zap, Wrench, RefreshCw, Map, BarChart, Link2, FileText } from "lucide-react";

const severityData = [
  { label: "Critical", count: 38, color: "#ef4444", pct: 31 },
  { label: "High", count: 52, color: "#f97316", pct: 42 },
  { label: "Medium", count: 34, color: "#3b82f6", pct: 27 },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

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
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans" style={{ fontFamily: bodyFontFamily }}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,188,161,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-[#00BCA1]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-widest uppercase bg-[#00BCA1]/10 text-[#00BCA1] border border-[#00BCA1]/20 rounded-full px-3 py-1.5 mb-6">
                <Brain className="w-3.5 h-3.5" />
                {t("hero.badge")}
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1A1A1A] dark:text-[#EDEDED] leading-tight mb-5" style={{ fontFamily: displayFontFamily }}>
                {t("hero.titleLine1")}<br />
                <span className="text-[#00BCA1]">{t("hero.titleLine2")}</span>
              </h1>

              <p className="text-lg sm:text-xl leading-relaxed mb-8 max-w-md text-[#5C5C5C] dark:text-[#9A9A9A]">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#00BCA1] hover:bg-[#00A390] text-white rounded-xl text-base font-bold transition-colors">
                  {t("hero.primaryCta")}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 text-[#1A1A1A] dark:text-[#EDEDED] rounded-xl text-base font-semibold hover:border-[#00BCA1] transition-colors">
                  {t("hero.secondaryCta")} <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div {...fadeUp(0.2)} className="relative">
              <div className="bg-white dark:bg-[#111113] rounded-2xl border border-black/9 dark:border-white/9 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-[#EDEDED]">{t("hero.previewTitle")}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00BCA1]/10 text-[#00BCA1]">{t("hero.previewBadge")}</span>
                </div>
                
                {/* Severity Donut Chart */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="94.2 301.4" />
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="126.6 301.4" strokeDashoffset="-94.2" />
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="80.8 301.4" strokeDashoffset="-220.8" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">124</span>
                      <span className="text-xs text-[#9A9A9A]">{t("hero.findingsLabel")}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg p-3">
                    <div className="text-xs text-[#9A9A9A] mb-1">{t("severity.critical")}</div>
                    <div className="text-xl font-bold text-red-500">38</div>
                  </div>
                  <div className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg p-3">
                    <div className="text-xs text-[#9A9A9A] mb-1">{t("severity.high")}</div>
                    <div className="text-xl font-bold text-orange-500">52</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              {t("workflow.title")}
            </h2>
            <p className="text-lg text-[#5C5C5C] dark:text-[#9A9A9A]">
              {t("workflow.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step, i) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={i}
                  {...fadeUp(0.1 + i * 0.1)}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00BCA1]/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-[#00BCA1]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-2">
                    {step.num}. {step.title}
                  </h3>
                  <p className="text-base text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Dashboard */}
      <section className="py-16 bg-white dark:bg-[#111113] border-y border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Severity Card */}
            <motion.div {...fadeUp(0)} className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-2xl p-6 border border-black/9 dark:border-white/9">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#EDEDED]">{t("dashboard.severityTitle")}</h3>
                <span className="text-xs bg-[#00BCA1]/10 text-[#00BCA1] px-2 py-1 rounded-full font-semibold">{t("dashboard.realTime")}</span>
              </div>

              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-28 h-28">
                  <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
                    {severityData.map((d, i) => {
                      const prev = severityData.slice(0, i).reduce((a, b) => a + b.pct, 0);
                      return (
                        <circle
                          key={i}
                          cx="56"
                          cy="56"
                          r="40"
                          fill="none"
                          stroke={d.color}
                          strokeWidth="14"
                          strokeDasharray={`${(d.pct / 100) * 251.2} 251.2`}
                          strokeDashoffset={`-${(prev / 100) * 251.2}`}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">124</span>
                    <span className="text-xs text-[#9A9A9A]">{t("dashboard.total")}</span>
                  </div>
                </div>

                <div>
                  {severityData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-base text-[#5C5C5C] dark:text-[#9A9A9A]">{t(`severity.${d.label.toLowerCase()}`)} ({d.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/9 dark:border-white/9">
                <div>
                  <div className="text-xs text-[#9A9A9A] uppercase tracking-wider mb-1">{t("dashboard.meanTimeToFix")}</div>
                  <div className="text-2xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">{t("dashboard.meanTimeValue")}</div>
                </div>
                <div>
                  <div className="text-xs text-[#9A9A9A] uppercase tracking-wider mb-1">{t("dashboard.exploitability")}</div>
                  <div className="text-xl font-black text-red-500">{t("dashboard.exploitabilityValue")}</div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div {...fadeUp(0.1)}>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-4">
                {t("dashboard.title")}
              </h2>
              <p className="text-lg text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed mb-6">
                {t("dashboard.desc")}
              </p>
              <div className="space-y-3">
                {dashboardBullets.map((item, i) => {
                  const IconComp = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <IconComp className="w-5 h-5 text-[#00BCA1]" />
                      <span className="text-base text-[#5C5C5C] dark:text-[#9A9A9A]">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Edge */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              {t("edge.title")}
            </h2>
            <p className="text-lg text-[#5C5C5C] dark:text-[#9A9A9A]">
              {t("edge.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {aiEdgeItems.map((item, i) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={i}
                  {...fadeUp(0.1 + i * 0.1)}
                  whileHover={{ y: -2 }}
                  className={`rounded-xl p-6 border transition-all ${
                    item.dark
                      ? "bg-[#0D1117] border-white/10"
                      : "bg-white dark:bg-[#111113] border-black/9 dark:border-white/9"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <IconComp className={`w-5 h-5 ${item.dark ? "text-[#00BCA1]" : "text-[#00BCA1]"}`} />
                    <h3 className={`text-lg font-bold ${item.dark ? "text-white" : "text-[#1A1A1A] dark:text-[#EDEDED]"}`}>
                      {item.title}
                    </h3>
                  </div>
                  <p className={`text-base leading-relaxed ${item.dark ? "text-slate-400" : "text-[#5C5C5C] dark:text-[#9A9A9A]"}`}>
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="relative rounded-2xl px-6 py-12 overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0f2940 100%)" }}>
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#00BCA1]/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#0077B6]/10 blur-3xl" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                {t("cta.title")}
              </h2>
              <p className="text-lg text-[#9A9A9A] mb-8 max-w-md mx-auto">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-[#00BCA1] hover:bg-[#00A390] text-white px-6 py-3 rounded-xl text-base font-bold transition-colors">
                  {t("cta.primaryCta")}
                </button>
                <button className="border border-white/20 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-white/5 transition-colors">
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
