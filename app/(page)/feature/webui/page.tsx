"use client";

import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import { GridBackground } from "@/components/shared/GridBackground";
import {
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Terminal,
  Scan,
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
  Rocket,
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
      <div className="min-h-44 p-5 font-mono text-[12px] leading-relaxed sm:min-h-48">
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
          className="inline-block w-2 h-3.5 bg-emerald-500 align-middle"
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
function ToolConfig({ items }: { items: { name: string; desc: string }[] }) {
  const [tools, setTools] = useState([
    { ...items[0], on: true, color: "text-[#00BCA1]", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
    { ...items[1], on: true, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
    { ...items[2], on: true, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" },
    { ...items[3], on: false, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
  ]);

  useEffect(() => {
    setTools([
      { ...items[0], on: true, color: "text-[#00BCA1]", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
      { ...items[1], on: true, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
      { ...items[2], on: true, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" },
      { ...items[3], on: false, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800" },
    ]);
  }, [items]);

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
  const heroTitleFont = isKhmer
    ? 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif'
    : displayFont;
  const heroTitleLineHeight = isKhmer ? 1.2 : 1.1;
  const heroTitleLetterSpacing = isKhmer ? "0" : "-0.025em";

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
      title: isKhmer ? "ពិនិត្យ & អនុវត្ត" : "Review & act",
      desc: isKhmer
        ? "ទទួលបានលទ្ធផលជារចនាសម្ព័ន្ធ មាន severity និងការណែនាំដោះស្រាយ។"
        : "Get structured results with severity ratings, fix guidance, and exportable reports right in your dashboard.",
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

  const heroChecklist = isKhmer
    ? [
        "មិនចាំបាច់ដំឡើង",
        "ប្រើបានគ្រប់ទីកន្លែង",
        "អាប់ដេតជានិច្ច",
        "ចែករំលែកជាមួយក្រុមបានងាយស្រួល",
      ]
    : [
        "No installation required",
        "Works everywhere",
        "Always up-to-date",
        "Share with your team",
      ];

  const heroStats = isKhmer
    ? [
        { value: "15+", label: "Tools" },
        { value: "0 min", label: "Setup" },
        { value: "99.1%", label: "Uptime" },
      ]
    : [
        { value: "15+", label: "Tools" },
        { value: "0 min", label: "Setup" },
        { value: "99.1%", label: "Uptime" },
      ];

  const liveSection = isKhmer
    ? {
        title: "កំណត់ និងស្កេនពេលវេលាជាក់ស្តែង",
        desc: "បើក/បិទឧបករណ៍ កំណត់ target ហើយមើលលទ្ធផលដែលបង្ហាញភ្លាមៗលើ dashboard។",
        configTitle: "ជ្រើសរើសឧបករណ៍របស់អ្នក",
        configDesc: "បើក ឬបិទឧបករណ៍សុវត្ថិភាព ហើយដំណើរការស្កេនភ្លាមៗ។",
        runScan: "Run Scan",
      }
    : {
        title: "Configure and scan in real time",
        desc: "Toggle tools, set targets, and watch results stream live to your dashboard.",
        configTitle: "Select your tools",
        configDesc: "Toggle security tools on or off, then run your scan.",
        runScan: "Run Scan",
      };

  const toolItems = isKhmer
    ? [
        { name: "Subfinder", desc: "ស្វែងរក subdomain" },
        { name: "Naabu", desc: "ស្កេន port" },
        { name: "Nuclei", desc: "ស្កេន vulnerability" },
        { name: "HTTPx", desc: "ពិនិត្យ HTTP services" },
      ]
    : [
        { name: "Subfinder", desc: "Subdomain enumeration" },
        { name: "Naabu", desc: "Port scanning" },
        { name: "Nuclei", desc: "Vulnerability templates" },
        { name: "HTTPx", desc: "HTTP probing" },
      ];

  const compareSection = isKhmer
    ? {
        title: "ហេតុអ្វីប្រើ Web UI?",
        desc: "ប្រៀបធៀបអ្វីដែលត្រូវធ្វើ ដើម្បីដំណើរការឧបករណ៍ដូចគ្នានៅ local និងនៅលើ Nexus Web UI។",
        recommendedBadge: "Nexus Web UI (ណែនាំ)",
        browserNative: "Browser-native",
        browserItems: [
          "បើក browser",
          "ជ្រើស tool និង target",
          "ចុច Run",
          "លទ្ធផលបង្ហាញភ្លាមៗ",
          "ចែករំលែកជាមួយក្រុមបាន",
        ],
        localInstall: "Local Setup",
        manualSetup: "ត្រូវដំឡើង tools",
        localItems: [
          "ត្រូវដំឡើង tools",
          "គ្រប់គ្រង dependencies",
          "កំណត់ PATH",
          "ចែករំលែកដោយដៃ",
        ],
        dockerTitle: "Docker / VPS",
        selfHosted: "ត្រូវរៀបចំ server",
        dockerItems: [
          "ត្រូវរៀបចំ server",
          "ថែទាំ uptime",
          "គ្រប់គ្រង network",
          "update ដោយដៃ",
        ],
      }
    : {
        title: "Why browser-native?",
        desc: "Skip the setup headaches. Compare what it takes to run the same tools locally vs. on Nexus.",
        recommendedBadge: "Nexus Web UI ✦ Recommended",
        browserNative: "Browser-native",
        browserItems: [
          "Open a browser tab",
          "Select tools & target",
          "Click Run",
          "Results stream instantly",
          "Share link with team",
        ],
        localInstall: "Local install",
        manualSetup: "Manual setup",
        localItems: [
          "Install Go + dependencies",
          "Install each tool individually",
          "Manage version conflicts",
          "Configure PATH variables",
          "Share results manually",
        ],
        dockerTitle: "Docker / VPS",
        selfHosted: "Self-hosted",
        dockerItems: [
          "Provision and pay for a VPS",
          "Build and run containers",
          "Maintain server uptime",
          "Handle networking / firewall",
          "Update images manually",
        ],
      };

  const proTip = isKhmer
    ? {
        title: "មើលលទ្ធផលភ្លាមៗ (Real-time)",
        body: "មិនចាំបាច់រង់ចាំ scan បញ្ចប់ទាំងស្រុង។",
      }
    : {
        title: "Pro Tip",
        body: "Stream results in real-time. No delays, no waiting for full scans to complete.",
      };

  const webuiLabels = isKhmer
    ? {
        heroPrimary: "ចាប់ផ្តើមស្កេន",
        heroSecondary: "មើល Demo",
        stepFourTitle: "ពិនិត្យ & អនុវត្ត",
        stepFourDesc: "ទទួលបានលទ្ធផលជារចនាសម្ព័ន្ធ មាន severity និងការណែនាំដោះស្រាយ។",
        scanDashboard: "Scan dashboard",
        running: "running",
        benefitsTitle: "អត្ថប្រយោជន៍សម្រាប់សហគ្រាស",
        ctaTitle: "ត្រៀមស្វ័យប្រវត្តិកម្មការស្កេនរបស់អ្នកហើយឬនៅ?",
        ctaSubtitle: "Reconnaissance pipelines កម្រិតសហគ្រាស ក្នុងរយៈពេលប៉ុន្មានវិនាទី មិនមែនម៉ោងទៀតទេ។",
        ctaPrimary: "ចាប់ផ្តើមស្កេនឥតគិតថ្លៃ",
        ctaSecondary: "មើលឯកសារ",
      }
    : {
        heroPrimary: t("hero.primaryCta"),
        heroSecondary: t("hero.secondaryCta"),
        stepFourTitle: "Review & act",
        stepFourDesc: "Get structured results with severity ratings, fix guidance, and exportable reports right in your dashboard.",
        scanDashboard: "Scan dashboard",
        running: "running",
        benefitsTitle: t("benefits.title"),
        ctaTitle: t("cta.title"),
        ctaSubtitle: t("cta.subtitle"),
        ctaPrimary: t("cta.primaryCta"),
        ctaSecondary: t("cta.secondaryCta"),
      };

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
        {/* Dashed grid background */}
        <GridBackground
          variant="dashed"
          gridSize={22}
        />

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
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 text-[#18181B] dark:text-white max-w-2xl"
                style={{
                  fontFamily: heroTitleFont,
                  fontWeight: isKhmer ? 800 : 700,
                  lineHeight: heroTitleLineHeight,
                  letterSpacing: heroTitleLetterSpacing,
                }}
              >
                                Orchestrate <span className="text-[#00BCA1]">Scans Without</span> the <span className="text-[#01509E]">CLI.</span>
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
                {heroChecklist.map((item) => (
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
                className="flex flex-row gap-3 sm:gap-4 mb-8 lg:justify-start"
              >
                <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border-2 border-[#00BCA1] bg-[#00BCA1] px-3 py-3 sm:px-7.5 sm:py-3.5 text-[14px] sm:text-[15px] font-black leading-none text-black transition-transform duration-200 hover:-translate-y-px before:pointer-events-none before:absolute before:inset-0 before:translate-y-full before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)] before:transition-transform before:duration-200 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)] after:transition-transform after:duration-200 after:content-[''] hover:before:translate-y-0 hover:after:translate-y-0">
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    <Scan className="w-4 h-4" />
                    <span className="whitespace-nowrap">{webuiLabels.heroPrimary}</span>
                  </span>
                </button>
                <button className="ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)] bg-white dark:bg-[rgba(0,208,178,0.06)] px-4 py-3 sm:px-6.5 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-black dark:text-white backdrop-blur-sm duration-200 cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                  <span className="whitespace-nowrap">{webuiLabels.heroSecondary}</span>
                </button>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md"
              >
                {heroStats.map((item) => (
                  <StatCard key={item.label} value={item.value} label={item.label} />
                ))}
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
            {liveSection.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={liveInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {liveSection.desc}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={liveInView ? "visible" : "hidden"}
          className="relative flex min-h-105 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
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
                  className="inline-block w-2 h-3.25 bg-emerald-500 align-middle"
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
              {liveSection.configTitle}
            </h3>
            <p className={`${smallText} text-[#52525B] dark:text-[#A1A1AA] mb-6`}>
              {liveSection.configDesc}
            </p>
            <ToolConfig items={toolItems} />
            <button className="mt-6 w-full py-3.5 rounded-xl bg-[#00BCA1] text-white font-semibold text-base hover:bg-[#0AAE98] transition-colors duration-200">
              {liveSection.runScan}
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
          className="relative flex min-h-95 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            flex-col md:flex-row"
        >
          {/* Left: content */}
          <div className="flex flex-1 flex-col justify-center bg-[#F7F5F0] dark:bg-[#09090B] px-6 py-8 md:px-12 md:py-12">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-4.75 top-10 bottom-10 w-px bg-[#E2DDD5] dark:bg-white/10 z-0" />
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
                  <div className="text-[12px] font-semibold text-[#18181B] dark:text-white mb-3">{webuiLabels.scanDashboard}</div>
                  {/* Fake scan bars */}
                  {[
                    { label: toolItems[0].name, w: "85%", color: "bg-[#00BCA1]" },
                    { label: toolItems[1].name, w: "60%", color: "bg-amber-400" },
                    { label: toolItems[2].name, w: "40%", color: "bg-red-400" },
                  ].map((bar) => (
                    <div key={bar.label} className="mb-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#52525B] dark:text-[#A1A1AA]">{bar.label}</span>
                        <span className="text-[#00BCA1]">{webuiLabels.running}</span>
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
                  {proTip.title}
                </div>
                <p className="text-[12px] text-[#94A3B8] font-mono leading-relaxed">
                  {proTip.body}
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
            {compareSection.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={compareInView ? "visible" : "hidden"}
            custom={1}
            className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] max-w-xl`}
          >
            {compareSection.desc}
          </motion.p>
        </div>

        {/* C-border Right */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={compareInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            ml-4 md:ml-6 rounded-r-[28px]
            border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35
            transition-colors duration-300
            p-6 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nexus */}
            <div className="rounded-2xl bg-transparent border-2 border-[#00BCA1] p-6 hover:shadow-[0_0_12px_rgba(0,188,161,0.15)] transition-all duration-300">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#0F6E56] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4">
                {compareSection.recommendedBadge}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">{compareSection.browserNative}</h3>
              {compareSection.browserItems.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#00BCA1] shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Local setup */}
            <div className="rounded-2xl bg-transparent border border-[#E2DDD5] dark:border-white/10 p-6 hover:border-[#00BCA1] hover:shadow-[0_0_12px_rgba(0,188,161,0.15)] transition-all duration-300">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F5F0] dark:bg-[#09090B] text-[#71717A] border border-[#E2DDD5] dark:border-white/10 mb-4">
                {compareSection.localInstall}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">{compareSection.manualSetup}</h3>
              {compareSection.localItems.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <XCircle className="w-5 h-5 text-[#D85A30] shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Docker */}
            <div className="rounded-2xl bg-transparent border border-[#E2DDD5] dark:border-white/10 p-6 hover:border-[#00BCA1] hover:shadow-[0_0_12px_rgba(0,188,161,0.15)] transition-all duration-300">
              <div className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F5F0] dark:bg-[#09090B] text-[#71717A] border border-[#E2DDD5] dark:border-white/10 mb-4">
                {compareSection.dockerTitle}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white mb-4">{compareSection.selfHosted}</h3>
              {compareSection.dockerItems.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] mb-2.5">
                  <XCircle className="w-5 h-5 text-[#D85A30] shrink-0" />
                  {item}
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
              {webuiLabels.benefitsTitle}
          </motion.h2>
        </div>

        {/* C-border Left */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
          className="relative overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]
            mr-4 md:mr-6 rounded-l-[28px]
            border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35
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
                className="rounded-2xl bg-transparent border border-[#E2DDD5] dark:border-white/10 p-6 transition-all duration-300 hover:border-[#00BCA1] hover:shadow-[0_0_12px_rgba(0,188,161,0.15)]"
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
                className="w-full max-w-xs sm:max-w-xs lg:max-w-sm xl:max-w-md object-contain drop-shadow-2xl lg:-translate-y-15"
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
                style={{ fontFamily: displayFont }}
              >
                {webuiLabels.ctaTitle}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate={ctaInView ? "visible" : "hidden"}
                custom={2}
                className={`${bodyText} text-[#52525B] dark:text-[#A1A1AA] mb-8 max-w-lg`}
              >
                {webuiLabels.ctaSubtitle}
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
                    <span className="whitespace-nowrap">{webuiLabels.ctaPrimary}</span>
                  </span>
                </button>
                <button className="ripple-button inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)] bg-white dark:bg-[rgba(0,208,178,0.06)] px-4 py-3 sm:px-6.5 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-black dark:text-white backdrop-blur-sm duration-200 cursor-pointer hover:bg-white/80">
                  <ExternalLink className="w-4 h-4" />
                  <span className="whitespace-nowrap">{webuiLabels.ctaSecondary}</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
