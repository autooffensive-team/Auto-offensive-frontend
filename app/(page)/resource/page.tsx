'use client';

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Terminal, Code, GitBranch, ArrowRight, Play, Settings, Shield } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function ResourcePage() {
  const t = useTranslations('resourcePage')
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  const docCategories = [
    {
      id: "tools",
      icon: Shield,
      title: t("categories.cards.tools.title"),
      description: t("categories.cards.tools.description"),
      links: Array.from({ length: 6 }, (_, i) => ({
        title: t(`categories.cards.tools.links.${i}.title`),
        tag: t(`categories.cards.tools.links.${i}.tag`),
      })),
      color: "#00BCA1",
    },
    {
      id: "api",
      icon: Code,
      title: t("categories.cards.api.title"),
      description: t("categories.cards.api.description"),
      links: Array.from({ length: 6 }, (_, i) => ({
        title: t(`categories.cards.api.links.${i}.title`),
        tag: t(`categories.cards.api.links.${i}.tag`),
      })),
      color: "#3B82F6",
    },
    {
      id: "cli",
      icon: Terminal,
      title: t("categories.cards.cli.title"),
      description: t("categories.cards.cli.description"),
      links: Array.from({ length: 6 }, (_, i) => ({
        title: t(`categories.cards.cli.links.${i}.title`),
        tag: t(`categories.cards.cli.links.${i}.tag`),
      })),
      color: "#8B5CF6",
    },
    {
      id: "cicd",
      icon: GitBranch,
      title: t("categories.cards.cicd.title"),
      description: t("categories.cards.cicd.description"),
      links: Array.from({ length: 6 }, (_, i) => ({
        title: t(`categories.cards.cicd.links.${i}.title`),
        tag: t(`categories.cards.cicd.links.${i}.tag`),
      })),
      color: "#F59E0B",
    },
  ];

  const quickLinks = [
    { title: t("quickLinks.items.0.title"), desc: t("quickLinks.items.0.desc"), icon: Play },
    { title: t("quickLinks.items.1.title"), desc: t("quickLinks.items.1.desc"), icon: Settings },
    { title: t("quickLinks.items.2.title"), desc: t("quickLinks.items.2.desc"), icon: Code },
    { title: t("quickLinks.items.3.title"), desc: t("quickLinks.items.3.desc"), icon: BookOpen },
  ];

  const featuredResources = [
    { type: t("featured.items.0.type"), title: t("featured.items.0.title"), desc: t("featured.items.0.desc"), tag: t("featured.items.0.tag"), cta: t("featured.items.0.cta") },
    { type: t("featured.items.1.type"), title: t("featured.items.1.title"), desc: t("featured.items.1.desc"), tag: t("featured.items.1.tag"), cta: t("featured.items.1.cta") },
    { type: t("featured.items.2.type"), title: t("featured.items.2.title"), desc: t("featured.items.2.desc"), tag: t("featured.items.2.tag"), cta: t("featured.items.2.cta") },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B]" style={{ fontFamily: bodyFontFamily }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,188,161,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-[#00BCA1]/5 dark:bg-emerald-400/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
          <motion.div {...fadeUp(0)} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase bg-[#00BCA1]/10 text-[#00BCA1] border border-[#00BCA1]/20 rounded-full px-3 py-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-black text-[#1A1A1A] dark:text-[#EDEDED] leading-tight mb-6">
            {t("hero.titleLine1")}<br />
            <span className="text-[#00BCA1]">{t("hero.titleLine2")}</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-[#5C5C5C] dark:text-[#9A9A9A] text-lg max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* ── Documentation Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div {...fadeUp(0)} className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
            {t("categories.title")}
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
            {t("categories.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                {...fadeUp(0.1 + idx * 0.1)}
                whileHover={{ y: -4 }}
                className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6 hover:border-[#00BCA1]/40 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-[#5C5C5C] dark:text-[#9A9A9A] text-sm leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {cat.links.map((link, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F5F0] dark:hover:bg-[#1A1A1A] group/link transition-colors"
                    >
                      <span className="text-[#1A1A1A] dark:text-[#EDEDED] text-sm font-medium group-hover/link:text-[#00BCA1] transition-colors">
                        {link.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F5F0] dark:bg-[#1A1A1A] text-[#9A9A9A] border border-black/9 dark:border-white/9">
                          {link.tag}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#9A9A9A] group-hover/link:text-[#00BCA1] group-hover/link:translate-x-1 transition-all" />
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-black/9 dark:border-white/9">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: cat.color }}
                  >
                    {t("categories.viewAll")} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="bg-white dark:bg-[#111113] border-y border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div {...fadeUp(0)} className="mb-8">
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#EDEDED]">
              {t("quickLinks.title")}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={idx}
                  href="#"
                  {...fadeUp(0.1 + idx * 0.1)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-black/9 dark:border-white/9 hover:border-[#00BCA1]/40 hover:bg-[#F7F5F0] dark:hover:bg-[#1A1A1A] transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00BCA1]/10 flex items-center justify-center text-[#00BCA1] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">
                      {link.title}
                    </div>
                    <div className="text-xs text-[#9A9A9A]">
                      {link.desc}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Resources ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div {...fadeUp(0)} className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
            {t("featured.title")}
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
            {t("featured.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredResources.map((item, idx) => (
            <motion.div
              key={idx}
              {...fadeUp(0.1 + idx * 0.1)}
              className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6 hover:shadow-lg hover:border-[#00BCA1]/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1]/10 text-[#00BCA1] px-2.5 py-1 rounded-md">
                  {item.type}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F5F0] dark:bg-[#1A1A1A] text-[#9A9A9A] border border-black/9 dark:border-white/9">
                  {item.tag}
                </span>
              </div>

              <h3 className="font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-2 group-hover:text-[#00BCA1] transition-colors">
                {item.title}
              </h3>
              <p className="text-[#5C5C5C] dark:text-[#9A9A9A] text-sm leading-relaxed mb-4">
                {item.desc}
              </p>

              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[#00BCA1] text-sm font-semibold group-hover:gap-3 transition-all"
              >
                {item.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-2xl px-6 sm:px-10 py-12 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0f2940 50%, #0D1B2A 100%)" }}
        >
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#00BCA1]/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#0077B6]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t("newsletter.title")}
              </h2>
              <p className="text-[#9A9A9A] text-sm">
                {t("newsletter.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder={t("newsletter.placeholder")}
                className="flex-1 md:w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-[#9A9A9A] focus:outline-none focus:border-[#00BCA1] transition"
              />
              <button className="bg-[#00BCA1] hover:bg-[#00A390] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap">
                {t("newsletter.cta")}
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}