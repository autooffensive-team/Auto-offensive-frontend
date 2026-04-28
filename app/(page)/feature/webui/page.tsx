"use client";

import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Terminal,
  Search,
  Globe,
  Shield,
  Zap,
  Clock,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  MonitorCheck,
  Layers,
  RefreshCw,
} from "lucide-react";

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

/* ─── Reusable Docs Button ───────────────────────── */
function DocsButton({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <a
      href="#"
      className="group relative inline-flex h-[2.55em] w-fit items-center justify-start overflow-hidden rounded-xl border border-[#E2DDD5] bg-white px-[0.95em] pr-[2.2em] text-[13px] font-semibold text-[#01509E] transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-px hover:border-[#01509E] hover:bg-[#01509E] hover:text-white dark:border-white/10 dark:bg-[#111113] dark:text-[#7AAEF7] dark:hover:border-[#00BCA1] dark:hover:bg-[#00BCA1] dark:hover:text-[#09090B] sm:h-[2.8em] sm:px-[1.2em] sm:pr-[3.3em]"
    >
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#09090B]">
        {children}
      </span>
      <span className="pointer-events-none absolute right-[0.25em] top-1/2 z-0 flex h-[1.75em] w-[1.75em] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[0.55em] bg-[#01509E] text-white transition-[width,transform,background-color,color] duration-300 group-hover:w-[calc(100%-0.45em)] group-hover:bg-[#01509E] group-hover:text-white dark:bg-[#7AAEF7] dark:text-[#09090B] dark:group-hover:w-[calc(100%-0.45em)] dark:group-hover:bg-[#00BCA1] dark:group-hover:text-[#09090B] sm:right-[0.3em] sm:h-[2.2em] sm:w-[2.2em] sm:rounded-[0.7em] sm:group-hover:w-[calc(100%-0.6em)]">
        {icon ?? <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
    </a>
  );
}

/* ─── Terminal Animation ─────────────────────────── */
function TerminalHero() {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = [
    { prefix: "$", text: "nexus scan --target api.example.com", color: "#e2e8f0" },
    { prefix: "[INFO]", text: "Initializing scan engine…", color: "#94a3b8" },
    { prefix: "[SUBFINDER]", text: "Found 12 subdomains", color: "#34d399" },
    { prefix: "  ↳", text: "dev.example.com, staging.example.com, admin.example.com", color: "#34d399" },
    { prefix: "[NAABU]", text: "Open ports: 80, 443, 8080, 8443", color: "#fbbf24" },
    { prefix: "[NUCLEI]", text: "[CRITICAL] CVE-2023-44487 — HTTP/2 Rapid Reset", color: "#f87171" },
    { prefix: "[NUCLEI]", text: "[HIGH] Exposed admin panel at /admin", color: "#f87171" },
    { prefix: "[DONE]", text: "Scan complete — 2 critical, 3 high, 6 info", color: "#94a3b8" },
  ];

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= lines.length) clearInterval(timer);
    }, 480);
    return () => clearInterval(timer);
  }, []);

  const prefixColor = (prefix: string) => {
    if (prefix === "[SUBFINDER]") return "#34d399";
    if (prefix === "[NAABU]") return "#fbbf24";
    if (prefix.startsWith("[NUCLEI]")) return "#f87171";
    if (prefix === "[DONE]") return "#94a3b8";
    if (prefix === "  ↳") return "#34d399";
    return "#64748b";
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#18181B]">
      {/* Window bar */}
      <div className="bg-[#27272A] px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-xs text-[#71717A] font-mono">nexus — bash</span>
        <div className="ml-auto text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
          ● running
        </div>
      </div>
      {/* Terminal body */}
      <div className="min-h-[176px] p-5 font-mono text-[12px] leading-relaxed sm:min-h-[192px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-2 mb-1"
          >
            <span style={{ color: prefixColor(line.prefix) }} className="shrink-0">{line.prefix}</span>
            <span style={{ color: line.color }}>{line.text}</span>
          </motion.div>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-2 h-[14px] bg-emerald-500 align-middle"
        />
      </div>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white dark:bg-[#111113] px-4 py-3 border border-[#E2DDD5] dark:border-white/10">
      <div className="text-xl font-bold text-[#18181B] dark:text-white">{value}</div>
      <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1">{label}</div>
    </div>
  );
}

/* ─── Interactive Tool Toggles ───────────────────── */
function ToolConfig() {
  const [tools, setTools] = useState([
    { name: "Subfinder", desc: "Subdomain enumeration", on: true, color: "text-[#00BCA1]", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
    { name: "Naabu", desc: "Port scanning", on: true, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
    { name: "Nuclei", desc: "Vulnerability templates", on: true, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" },
    { name: "HTTPx", desc: "HTTP probing", on: false, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
  ]);

  const toggle = (i: number) => {
    setTools(prev => prev.map((t, idx) => idx === i ? { ...t, on: !t.on } : t));
  };

  return (
    <div className="flex flex-col gap-2.5">
      {tools.map((tool, i) => (
        <button
          key={tool.name}
          onClick={() => toggle(i)}
          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left w-full
            ${tool.on
              ? "border-[#00BCA1] bg-emerald-50/60 dark:bg-emerald-950/20"
              : "border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B]"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${tool.on ? tool.bg + " " + tool.color : "bg-[#F7F5F0] dark:bg-[#09090B] border-[#E2DDD5] dark:border-white/10 text-[#71717A]"}`}>
              {tool.name[0]}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#18181B] dark:text-white">{tool.name}</div>
              <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">{tool.desc}</div>
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${tool.on ? "bg-[#00BCA1]" : "bg-[#D6D3D1] dark:bg-[#3F3F46]"}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${tool.on ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function WebUIFeature() {
  const t = useTranslations("featurePages.webui");
  const locale = useLocale();
  const isKhmer = locale === "kh";

  const bodyFont = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFont = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  /* ─── RESPONSIVE FONT SIZING ─────────────────────────────
     Mobile:  16px  (text-base)
     Tablet:  18px  (text-[18px])
     Desktop: 20px  (text-[20px])
  */
  const bodyText = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.65]";
  const smallText = "text-[14px] md:text-[16px] lg:text-[18px] leading-[1.6]";

  const primaryBtn =
    "group inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const secondaryBtn =
    "group inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";

  const heroRef = useRef(null);
  const liveRef = useRef(null);
  const howRef = useRef(null);
  const compareRef = useRef(null);
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const liveInView = useInView(liveRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-80px" });
  const compareInView = useInView(compareRef, { once: true, margin: "-80px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const howSteps = [
    {
      icon: <Globe className="w-6 h-6" />,
      color: "text-[#00BCA1]",
      bgLight: "bg-emerald-50 border-emerald-200",
      bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800",
      title: t("howItWorks.steps.0.title"),
      desc: t("howItWorks.steps.0.desc"),
    },
    {
      icon: <Settings className="w-6 h-6" />,
      color: "text-violet-500",
      bgLight: "bg-violet-50 border-violet-200",
      bgDark: "dark:bg-violet-950/40 dark:border-violet-800",
      title: t("howItWorks.steps.1.title"),
      desc: t("howItWorks.steps.1.desc"),
    },
    {
      icon: <Zap className="w-6 h-6" />,
      color: "text-amber-500",
      bgLight: "bg-amber-50 border-amber-200",
      bgDark: "dark:bg-amber-950/40 dark:border-amber-800",
      title: t("howItWorks.steps.2.title"),
      desc: t("howItWorks.steps.2.desc"),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      color: "text-blue-500",
      bgLight: "bg-blue-50 border-blue-200",
      bgDark: "dark:bg-blue-950/40 dark:border-blue-800",
      title: "Review & act",
      desc: "Get structured results with severity ratings, fix guidance, and exportable reports right in your dashboard.",
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      color: "text-[#00BCA1]",
      bgLight: "bg-emerald-50 border-emerald-200",
      bgDark: "dark:bg-emerald-950/40 dark:border-emerald-800",
      title: t("benefits.items.0.title"),
      desc: t("benefits.items.0.desc"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: "text-violet-500",
      bgLight: "bg-violet-50 border-violet-200",
      bgDark: "dark:bg-violet-950/40 dark:border-violet-800",
      title: t("benefits.items.1.title"),
      desc: t("benefits.items.1.desc"),
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      color: "text-blue-500",
      bgLight: "bg-blue-50 border-blue-200",
      bgDark: "dark:bg-blue-950/40 dark:border-blue-800",
      title: t("benefits.items.2.title"),
      desc: t("benefits.items.2.desc"),
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] text-[#18181B] dark:text-white transition-colors duration-300"
      style={{ fontFamily: bodyFont }}
    >

      {/* ════════════════════════════════
          HERO — NORMAL SECTION HEIGHT
      ════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen w-full items-center bg-white dark:bg-[#111113] px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20 transition-colors duration-300"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            {/* Left — Content */}
            <motion.div 
              className="flex flex-col items-center justify-center text-center lg:max-w-xl lg:items-start lg:text-left"
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
            >
              {/* Main Title */}
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5 text-[#18181B] dark:text-white max-w-2xl"
                style={{ fontFamily: displayFont }}
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
                className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] mb-6 max-w-lg`}
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Benefits Checklist */}
              <motion.ul
                variants={fadeUp}
                custom={2}
                className="flex flex-col gap-2.5 sm:gap-3 mb-6 sm:mb-8 w-full max-w-md"
              >
                {[
                  "No installation required",
                  "Works everywhere",
                  "Always up-to-date",
                  "Share with your team",
                ].map((item) => (
                  <motion.li 
                    key={item} 
                    className="flex items-center justify-center gap-3 text-[15px] md:text-[17px] lg:text-[18px] text-[#52525B] dark:text-[#A1A1AA] lg:justify-start"
                    variants={fadeUp}
                  >
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#00BCA1] shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex w-full max-w-md flex-row gap-3 sm:gap-4 mb-8 lg:justify-start"
              >
                <button
                  className={`${primaryBtn} min-w-0 flex-1 bg-[#00BCA1] text-white hover:bg-[#0AAE98] px-4 sm:px-8 py-3 sm:py-3.5 text-[15px] sm:text-base lg:text-[16px]`}
                >
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  {t("hero.primaryCta")}
                </button>
                <button
                  className={`${secondaryBtn} min-w-0 flex-1 bg-[#F7F5F0] text-[#18181B] border-[#E2DDD5] hover:bg-[#EFE9DE] dark:bg-[#09090B] dark:text-white dark:border-white/10 dark:hover:bg-[#151A18] px-4 sm:px-8 py-3 sm:py-3.5 text-[15px] sm:text-base lg:text-[16px]`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("hero.secondaryCta")}
                </button>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md"
              >
                <StatCard value="15+" label="Tools" />
                <StatCard value="0 min" label="Setup" />
                <StatCard value="99.1%" label="Uptime" />
              </motion.div>
            </motion.div>

            {/* Right — Terminal Hero (Responsive) */}
            <motion.div
              variants={fadeInScale}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              className="w-full flex items-center justify-center"
            >
              <div className="w-full max-w-lg">
                <TerminalHero />
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          LIVE SCAN SECTION  — C-border Right
      ════════════════════════════════ */}
      <section
        ref={liveRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={liveInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFont }}
          >
            Configure and scan in real time
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={liveInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            Toggle tools, set targets, and watch results stream live to your dashboard.
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={liveInView ? "visible" : "hidden"}
          className="relative flex min-h-[420px] overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            flex-col md:flex-row"
        >
          {/* Left: Terminal output */}
          <div className="flex flex-1 items-stretch bg-[#F7F5F0] dark:bg-[#09090B] p-5 md:p-8">
            <div className="w-full rounded-2xl overflow-hidden border border-[#E2DDD5] dark:border-white/10 bg-[#18181B]">
              <div className="bg-[#27272A] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                <span className="text-xs text-[#71717A] font-mono">$ nexus-cli</span>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">● running</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                {[
                  { time: "14:20:01", tag: "INFO", tagColor: "#64748b", text: "Initializing scan engine…", textColor: "#94a3b8" },
                  { time: "14:20:05", tag: "SUBFINDER", tagColor: "#34d399", text: "Found 12 subdomains", textColor: "#34d399" },
                  { time: "", tag: "", tagColor: "", text: "  ↳ dev.example.com, staging.example.com", textColor: "#34d399" },
                  { time: "", tag: "", tagColor: "", text: "  ↳ admin.example.com, api.example.com", textColor: "#34d399" },
                  { time: "14:20:12", tag: "NAABU", tagColor: "#fbbf24", text: "Open ports: 80, 443, 8080, 8443", textColor: "#fbbf24" },
                  { time: "", tag: "", tagColor: "", text: "Scanning 4 ports with 10 threads", textColor: "#94a3b8" },
                  { time: "", tag: "", tagColor: "", text: "Connected to 4/4 ports", textColor: "#94a3b8" },
                  { time: "14:20:45", tag: "NUCLEI", tagColor: "#f87171", text: "[CRITICAL] CVE-2023-44487 found", textColor: "#f87171" },
                ].map((line, i) => (
                  <div key={i} className="mb-1 flex gap-2">
                    {line.time && <span className="text-[#52525B]">[{line.time}]</span>}
                    {line.tag && <span style={{ color: line.tagColor }}>{line.tag}:</span>}
                    <span style={{ color: line.textColor }}>{line.text}</span>
                  </div>
                ))}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block w-2 h-[13px] bg-emerald-500 align-middle"
                />
              </div>
            </div>
          </div>

          {/* Right: Tool config */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <h3
              className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mb-3"
              style={{ fontFamily: displayFont }}
            >
              Select your tools
            </h3>
            <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA] mb-6`}>
              Toggle security tools on or off, then run your scan.
            </p>
            <ToolConfig />
            <button className="mt-6 w-full py-3.5 rounded-xl bg-[#00BCA1] text-white font-semibold text-base hover:bg-[#0AAE98] transition-colors duration-200">
              Run Scan
            </button>
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          HOW IT WORKS — C-border Left
      ════════════════════════════════ */}
      <section
        ref={howRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFont }}
          >
            {t("howItWorks.title")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {t("howItWorks.subtitle")}
          </motion.p>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={howInView ? "visible" : "hidden"}
          className="relative flex min-h-[380px] overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            flex-col md:flex-row"
        >
          {/* Left: content */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-[19px] top-10 bottom-10 w-px bg-[#E2DDD5] dark:bg-white/10 z-0" />
              <div className="flex flex-col gap-6 relative z-10">
                {howSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={howInView ? "visible" : "hidden"}
                    custom={i + 1}
                    className="flex gap-4 items-start"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 bg-white dark:bg-[#111113] ${step.color} border-[#E2DDD5] dark:border-white/10 transition-colors duration-300`}>
                      {step.icon}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="text-base sm:text-[16px] lg:text-lg font-bold text-[#18181B] dark:text-white mb-1">
                        {step.title}
                      </h3>
                      <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA]`}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: note card */}
          <div className="flex flex-1 items-center justify-center bg-[#F7F5F0] dark:bg-[#09090B] p-6 md:p-10">
            <div className="w-full max-w-xs space-y-4">
              {/* Browser mockup card */}
              <div className="rounded-2xl bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-[#F7F5F0] dark:bg-[#18181B] px-4 py-2.5 flex items-center gap-2 border-b border-[#E2DDD5] dark:border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-3 flex-1 bg-white dark:bg-[#27272A] rounded-md px-3 py-1 text-[11px] font-mono text-[#71717A]">
                    app.nexus.io/scan
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[12px] font-semibold text-[#18181B] dark:text-white mb-3">Scan dashboard</div>
                  {/* Fake scan bars */}
                  {[
                    { label: "Subfinder", w: "85%", color: "bg-[#00BCA1]" },
                    { label: "Naabu", w: "60%", color: "bg-amber-400" },
                    { label: "Nuclei", w: "40%", color: "bg-red-400" },
                  ].map((bar) => (
                    <div key={bar.label} className="mb-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#52525B] dark:text-[#A1A1AA]">{bar.label}</span>
                        <span className="text-[#00BCA1]">running</span>
                      </div>
                      <div className="h-1.5 bg-[#F7F5F0] dark:bg-[#27272A] rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={howInView ? { width: bar.w } : { width: 0 }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                          className={`h-1.5 ${bar.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="rounded-xl bg-[#18181B] border border-white/5 p-4">
                <div className="text-[11px] font-bold font-mono text-amber-400 mb-1.5 tracking-widest uppercase">
                  Pro Tip
                </div>
                <p className="text-[12px] text-[#94A3B8] font-mono leading-relaxed">
                  Stream results in real-time. No delays, no waiting for full scans to complete.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          COMPARISON — C-border Right
      ════════════════════════════════ */}
      <section
        ref={compareRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={compareInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFont }}
          >
            Why browser-native?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={compareInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            Skip the setup headaches. Compare what it takes to run the same tools locally vs. on Nexus.
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={compareInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nexus */}
            <div className="rounded-2xl bg-white dark:bg-[#111113] border-2 border-[#00BCA1] p-6">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#0F6E56] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4">
                Nexus Web UI ✦ Recommended
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">Browser-native</h3>
              {[
                "Open a browser tab",
                "Select tools & target",
                "Click Run",
                "Results stream instantly",
                "Share link with team",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#00BCA1] shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Local setup */}
            <div className="rounded-2xl bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 p-6">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F5F0] dark:bg-[#09090B] text-[#71717A] border border-[#E2DDD5] dark:border-white/10 mb-4">
                Local install
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">Manual setup</h3>
              {[
                { text: "Install Go + dependencies", ok: false },
                { text: "Install each tool individually", ok: false },
                { text: "Manage version conflicts", ok: false },
                { text: "Configure PATH variables", ok: false },
                { text: "Share results manually", ok: false },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <XCircle className="w-5 h-5 text-[#D85A30] shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* Docker */}
            <div className="rounded-2xl bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 p-6">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F5F0] dark:bg-[#09090B] text-[#71717A] border border-[#E2DDD5] dark:border-white/10 mb-4">
                Docker / VPS
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">Self-hosted</h3>
              {[
                { text: "Provision and pay for a VPS", ok: false },
                { text: "Build and run containers", ok: false },
                { text: "Maintain server uptime", ok: false },
                { text: "Handle networking / firewall", ok: false },
                { text: "Update images manually", ok: false },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <XCircle className="w-5 h-5 text-[#D85A30] shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          BENEFITS — C-border Left
      ════════════════════════════════ */}
      <section
        ref={benefitsRef}
        className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300"
      >
        <div className="mb-10">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18181B] dark:text-white mb-3"
            style={{ fontFamily: displayFont }}
          >
            {t("benefits.title")}
          </motion.h2>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#E2DDD5] dark:border-white/10
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                initial="hidden"
                animate={benefitsInView ? "visible" : "hidden"}
                custom={i}
                className="rounded-2xl bg-white dark:bg-[#111113] border border-[#E2DDD5] dark:border-white/10 p-6 transition-colors duration-300"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${b.bgLight} ${b.bgDark} ${b.color}`}>
                  {b.icon}
                </div>
                <h3 className="text-base sm:text-[16px] lg:text-lg font-bold text-[#18181B] dark:text-white mb-2">{b.title}</h3>
                <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA]`}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ════════════════════════════════
          CTA
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
              style={{ fontFamily: displayFont }}
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
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button className="px-8 py-3.5 rounded-xl bg-[#00BCA1] text-white font-bold text-base sm:text-lg hover:bg-[#0AAE98] transition-colors duration-200 flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                {t("cta.primaryCta")}
              </button>
              <button className="px-7 py-3.5 rounded-xl border border-white/15 text-white font-semibold text-base sm:text-lg hover:bg-white/5 transition-colors duration-200 flex items-center justify-center gap-2">
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
