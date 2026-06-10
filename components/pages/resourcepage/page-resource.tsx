"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect, useMemo } from "react";
import { HeroBackground } from "@/components/shared/HeroBackground";
import AnimatedCta from "@/components/pages/homepage/animated-cta";
import resourceCenterImage from "../../../public/images/ddoc.png";
import darkIconApi from "../../../public/document/dark_icon_api.webp";
import darkIconCicd from "../../../public/document/dark_icon_cicd.webp";
import darkIconCli from "../../../public/document/dark_icon_cli.webp";
import darkIconTools from "../../../public/document/dark_icon_tools.webp";
import {
  ArrowRight,
  Cpu,
  Database,
  FolderOpen,
  GitBranch,
  Search,
  Shield,
  TerminalSquare,
  Wrench,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type QuickCard = {
  title: string;
  what: string;
  why: string;
  how: string;
  icon: ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
};

type MiniCard = {
  title: string;
  description: string;
  version: string;
  level: number;
  icon: ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
};

type FeatureCard = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  meta?: string;
  badge?: string;
  tags?: string[];
  icon: ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  imageSide: "left" | "right";
  imageSrc: string | StaticImageData;
  imageAlt: string;
};

type StatusItem = {
  service: string
  version: string
  status: 'operational' | 'degraded' | 'maintenance'
  lastAudit: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const ctaArrowIcon = (
  <svg
    className="h-3 w-3 flex-none"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M6 1L11 6L6 11M11 6H1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ResourceComponent() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const bodyFontFamily = isKhmer
    ? 'var(--font-noto-khmer), "Noto Sans Khmer", sans-serif'
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  const displayFontFamily = isKhmer
    ? 'var(--font-noto-khmer), "Noto Sans Khmer", sans-serif'
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  const heroTitleFontFamily = isKhmer
    ? 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif'
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  const featureTitleFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";

  /* ── Hero bg computed styles ── */
  const heroBottomFadeStyle = useMemo(
    () => ({
      zIndex: 4 as const,
      background: isDark
        ? "linear-gradient(to bottom, transparent, rgba(9,9,11,0.85))"
        : "linear-gradient(to bottom, transparent, rgba(247,245,240,0.9))",
    }),
    [isDark],
  );

  const sectionLabels = isKhmer
    ? {
        heroBadge: '',
        heroTitleLine1: (<>ឯកសារ និង <span className="text-[#01509e] dark:text-[#4fa3e5]">Resources</span></>),
        heroTitleLine2: '',
        heroSubtitle:
          'មគ្គុទ្ទេសក៍ ឯកសារ API និងមេរៀនជាច្រើន ដែលជួយឱ្យអ្នកយល់ និងប្រើ Auto-Offensive បានយ៉ាងមានប្រសិទ្ធភាព ព្រមទាំងបង្កើនជំនាញសុវត្ថិភាពរបស់អ្នក។',
        quickStart: 'ផ្លូវចាប់ផ្តើមរហ័ស (Quick Start Paths)',
        technical: 'Technical Deep Dives',
        technicalSubtitle: 'បណ្ណាល័យឯកសារបច្ចេកទេសសម្រាប់ scanner និង tools សំខាន់ៗ។',
        technicalCta: 'មើលឧបករណ៍ទាំងអស់',
        workflowSteps: 'ដំណាក់កាលការងារ Pentest (Workflow)',
        what: 'តើវាជាអ្វី?',
        why: 'ហេតុអ្វីត្រូវប្រើ?',
        how: 'របៀបប្រើ',
        systemStatus: 'ស្ថានភាពប្រព័ន្ធ (System Status)',
        systemStatusSubtitle: 'ស្ថានភាពពេលវេលាជាក់ស្តែង នៃសេវាកម្មទាំងអស់',
        component: 'Component',
        version: 'Version',
        status: 'ស្ថានភាព',
        lastAudit: 'Last Audit',
        operational: 'ដំណើរការធម្មតា',
        degraded: 'ដំណើរការខ្សោយ',
        maintenance: 'កំពុងថែទាំ',
        mobileTableHint: 'អាចអូសឆ្វេង ឬស្ដាំ ដើម្បីមើលតារាងទាំងមូល។',
        featureCards: 'ឯកសារ និង Resources',
      }
    : {
        heroBadge: '',
        heroTitleLine1: (<>Docs & <span className="text-[#01509e] dark:text-[#4fa3e5]">Resources</span></>),
        heroTitleLine2: '',
        heroSubtitle:
          'Comprehensive guides, API references, and tutorials to help you master the Auto-Offensive toolkit and level up your offensive security skills.',
        quickStart: 'Quick Start Paths',
        technical: 'Technical Deep Dives',
        technicalSubtitle: 'Library of technical scanner guides and core tool documentation.',
        technicalCta: 'Browse all tools',
        workflowSteps: 'Pentest Workflow',
        what: 'What',
        why: 'Why',
        how: 'How',
        systemStatus: 'System Status',
        systemStatusSubtitle: 'Real-time service health across the platform',
        component: 'Component',
        version: 'Version',
        status: 'Status',
        lastAudit: 'Last Audit',
        operational: 'Operational',
        degraded: 'Degraded',
        maintenance: 'Maintenance',
        mobileTableHint: 'Swipe left or right to view the full table.',
        featureCards: 'Docs & Integrations',
      }

  const quickCards: QuickCard[] = isKhmer
    ? [
        {
          title: 'ឯកសារ CLI',
          what: 'កម្មវិធី binary តែមួយ សម្រាប់គ្រប់គ្រងការងារ offensive security នៅលើម៉ាស៊ីនរបស់អ្នក។',
          why: 'អាចពង្រីកការធ្វើ pentest បានងាយស្រួល ដោយមិនចាំបាច់ចាកចេញពី terminal។',
          how: 'curl -sSfL guardian.sh | sh',
          icon: TerminalSquare,
        },
        {
          title: 'ឯកសារ API',
          what: 'REST API សម្រាប់គ្រប់គ្រង និងដំណើរការការស្កេនសុវត្ថិភាពតាមកម្មវិធី។',
          why: 'អាចបង្កើត workflow សុវត្ថិភាព និងរបាយការណ៍ដោយស្វ័យប្រវត្តិ។',
          how: 'GET /v2/scans/{id}/report',
          icon: Cpu,
        },
        {
          title: 'ការភ្ជាប់ CI/CD',
          what: 'Plugin ដែលភ្ជាប់ជាមួយ GitHub Actions, GitLab និង Jenkins។',
          why: 'ជួយទប់ស្កាត់កូដដែលមានបញ្ហាសុវត្ថិភាព មុនពេលដាក់ចូល production។',
          how: 'uses: guardian/scan-action@v1',
          icon: GitBranch,
        },
      ]
    : [
        {
          title: 'CLI Documents',
          what: 'The unified binary for local orchestration of offensive operations.',
          why: 'Scale your pentesting without leaving the terminal environment.',
          how: 'curl -sSfL guardian.sh | sh',
          icon: TerminalSquare,
        },
        {
          title: 'API Documents',
          what: 'RESTful endpoints for programmatic vulnerability management.',
          why: 'Build custom security workflows and automated reporting loops.',
          how: 'GET /v2/scans/{id}/report',
          icon: Cpu,
        },
        {
          title: 'CI/CD Integration',
          what: 'Native plugins for GitHub Actions, GitLab, and Jenkins.',
          why: 'Stop vulnerable code before it reaches your production clusters.',
          how: 'uses: guardian/scan-action@v1',
          icon: GitBranch,
        },
      ]

  const miniCards: MiniCard[] = isKhmer
    ? [
        {
          title: 'Nmap Integration',
          description: 'សម្រាប់ស្វែងរក network និង auditing',
          version: 'V2.4',
          level: 2,
          icon: Search,
        },
        {
          title: 'Subfinder Core',
          description: 'ស្វែងរក subdomain (passive)',
          version: 'V1.9',
          level: 1,
          icon: FolderOpen,
        },
        {
          title: 'Nuclei Engine',
          description: 'ស្កេន vulnerability តាម template',
          version: 'V3.0',
          level: 3,
          icon: Shield,
        },
        {
          title: 'Payload DB',
          description: 'បណ្ណាល័យ exploit និង payload',
          version: 'V2.1',
          level: 2,
          icon: Database,
        },
      ]
    : [
        {
          title: 'Nmap Integration',
          description: 'Advanced network discovery and security auditing protocols.',
          version: 'V2.4',
          level: 2,
          icon: Search,
        },
        {
          title: 'Subfinder Core',
          description: 'Passive subdomain discovery engine for surface mapping.',
          version: 'V1.9',
          level: 1,
          icon: FolderOpen,
        },
        {
          title: 'Nuclei Engine',
          description: 'Template-based vulnerability scanner for large scale testing.',
          version: 'V3.0',
          level: 3,
          icon: Shield,
        },
        {
          title: 'Payload DB',
          description: 'Extensive library of verified exploits and payloads.',
          version: 'V2.1',
          level: 2,
          icon: Database,
        },
      ]

  const featureCards: FeatureCard[] = isKhmer
    ? [
        {
          title: 'ឯកសារ CLI',
          description:
            'រៀនប្រើ command line សម្រាប់ automation, កំណត់ parameter និង stealth execution។',
          href: '/resource/cli',
          cta: 'មើល CLI Reference',
          meta: 'បានអាប់ដេត 2 ម៉ោងមុន',
          icon: TerminalSquare,
          imageSide: 'left',
          imageSrc: '/images/cli-illustration.png',
          imageAlt: 'CLI illustration',
        },
        {
          title: 'ឯកសារ API',
          description:
            'ឯកសារ REST API សម្រាប់ដំណើរការ penetration testing ដោយស្វ័យប្រវត្តិ។',
          href: '/resource/api',
          cta: 'Explore Endpoints',
          icon: Cpu,
          imageSide: 'right',
          imageSrc: '/images/api-illustration.png',
          imageAlt: 'API illustration',
        },
        {
          title: 'ឯកសារ Tools',
          description:
            'ពន្យល់លម្អិតអំពីរបៀបដំណើរការនៃ fuzzing និង exploitation tools។',
          href: '/resource/tool',
          cta: 'Access Toolkits',
          badge: 'HOT',
          icon: Wrench,
          imageSide: 'left',
          imageSrc: '/images/tools-illustration.png',
          imageAlt: 'Tools illustration',
        },
        {
          title: 'ការភ្ជាប់ CI/CD',
          description:
            'ភ្ជាប់ Auto-Offensive ទៅក្នុង GitHub, GitLab ឬ Jenkins ដើម្បីធ្វើ security scan ដោយស្វ័យប្រវត្តិ។',
          href: '/resource/ci-cd',
          cta: 'មើលឯកសារ CI/CD',
          tags: ['GITHUB ACTIONS', 'GITLAB CI', 'AZURE DEVOPS'],
          icon: GitBranch,
          imageSide: 'right',
          imageSrc: '/images/cicd-illustration.png',
          imageAlt: 'CI/CD illustration',
        },
      ]
    : [
        {
          title: 'CLI Documents',
          description:
            'Master the command line interface. Detailed documentation on automated offensive scripts, parameter tuning, and stealth execution modes.',
          href: '/resource/cli',
          cta: 'View CLI Reference',
          meta: 'Updated 2h ago',
          icon: TerminalSquare,
          imageSide: 'left',
          imageSrc: '/images/cli-illustration.png',
          imageAlt: 'CLI illustration',
        },
        {
          title: 'API Documents',
          description:
            'Full RESTful API endpoints for orchestrating automated penetration testing at scale.',
          href: '/resource/api',
          cta: 'Explore Endpoints',
          icon: Cpu,
          imageSide: 'right',
          imageSrc: '/images/api-illustration.png',
          imageAlt: 'API illustration',
        },
        {
          title: 'Tools Documents',
          description:
            'Deep dives into the internal logic of our proprietary fuzzing and exploitation toolsets.',
          href: '/resource/tool',
          cta: 'Access Toolkits',
          badge: 'HOT',
          icon: Wrench,
          imageSide: 'left',
          imageSrc: '/images/tools-illustration.png',
          imageAlt: 'Tools illustration',
        },
        {
          title: 'CI/CD Integration',
          description:
            'Seamlessly inject Auto-Offensive audits into your GitLab, GitHub, or Jenkins pipelines. Ensure security remains continuous.',
          href: '/resource/ci-cd',
          cta: 'Open CI/CD Docs',
          tags: ['GITHUB ACTIONS', 'GITLAB CI', 'AZURE DEVOPS'],
          icon: GitBranch,
          imageSide: 'right',
          imageSrc: '/images/cicd-illustration.png',
          imageAlt: 'CI/CD illustration',
        },
      ]

  const workflowSteps = isKhmer
    ? [
        { no: '1', title: 'Reconnaissance', desc: 'ស្វែងរក ports និង services ដោយស្វ័យប្រវត្តិ' },
        { no: '2', title: 'Vulnerability Mapping', desc: 'ប្រើ AI ដើម្បីភ្ជាប់ទៅ CVE និងរកបញ្ហា' },
        { no: '3', title: 'Exploitation', desc: 'សាកល្បងបញ្ហាដោយសុវត្ថិភាព' },
      ]
    : [
        { no: '1', title: 'Reconnaissance Phase', desc: 'Automated port & service discovery' },
        { no: '2', title: 'Vulnerability Mapping', desc: 'AI-driven template matching' },
        { no: '3', title: 'Exploitation Logic', desc: 'Safe verification of vulnerabilities' },
      ]

  const workflowCopy = isKhmer
    ? {
        titleLine1: 'Autonomous Penetration',
        titleLine2: 'Testing Workflow',
        whatTitle: 'វាជាអ្វី?',
        whatBody:
          'ប្រព័ន្ធស្កេនច្រើនជំហាន ដែលដើរតាមលក្ខណៈគិតរបស់ pentester ប៉ុន្តែលឿន និងមានប្រសិទ្ធភាពខ្ពស់ជាង។',
        whyTitle: 'ហេតុអ្វីសំខាន់?',
        whyBody:
          'scanner ធម្មតា រកបានតែ bug ប៉ុណ្ណោះ ប៉ុន្តែនេះអាចរក attack path និងបង្ហាញហានិភ័យពិតប្រាកដ។',
        howTitle: 'របៀបប្រើ',
        howBody:
          'គ្រាន់តែកំណត់ scope → ប្រព័ន្ធនឹងដំណើរការដោយស្វ័យប្រវត្តិរហូតដល់ report ចុងក្រោយ។',
      }
    : {
        titleLine1: 'Autonomous Penetration',
        titleLine2: 'Testing Workflow',
        whatTitle: 'What is the Workflow?',
        whatBody:
          'A multi-staged recursive engine that mimics human pentester logic but at machine speed and scale, ensuring no corner of your infrastructure is left unchecked.',
        whyTitle: 'Why does it matter?',
        whyBody:
          'Traditional scanners find bugs; the Autonomous Workflow finds attack paths. It correlates findings across multiple vectors to demonstrate real business risk.',
        howTitle: 'How do I activate it?',
        howBody:
          'Simply define your scope and confidence level. Guardian handles the rest, from initial discovery to finalized remediation reports.',
      }

  const statusRows: StatusItem[] = [
    {
      service: isKhmer ? "Scanner API v2" : "Scanner API v2",
      version: isKhmer ? "2.4.1" : "2.4.1-Stable",
      status: "operational",
      lastAudit: isKhmer ? "24 មេសា 2026" : "April 24, 2026",
    },
    {
      service: isKhmer ? "CLI Modules" : "CLI Core Modules",
      version: isKhmer ? "1.9.0" : "1.9.0-Legacy",
      status: "degraded",
      lastAudit: isKhmer ? "12 ឧសភា 2026" : "May 12, 2026",
    },
    {
      service: isKhmer ? "Payload DB" : "Payload Database",
      version: "v2024.11",
      status: "operational",
      lastAudit: isKhmer ? "ថ្ងៃនេះ" : "Today",
    },
  ];

  const statusBadgeClasses: Record<StatusItem["status"], string> = {
    operational:
      "bg-[#CFF5E8] text-[#006B57] dark:bg-[#0E2E2A] dark:text-[#7CE5D4]",
    degraded:
      "bg-[#FDE68A] text-[#7A4B00] dark:bg-[#3A2E0F] dark:text-[#F4D56A]",
    maintenance:
      "bg-[#DBEAFE] text-[#0D4E85] dark:bg-[#102C42] dark:text-[#87C5FF]",
  };

  function resolveFeatureImageSrc(card: FeatureCard) {
    const assetMap: Record<string, StaticImageData> = {
      "/images/cli-illustration.png": darkIconCli,
      "/images/api-illustration.png": darkIconApi,
      "/images/tools-illustration.png": darkIconTools,
      "/images/cicd-illustration.png": darkIconCicd,
    };
    if (typeof card.imageSrc !== "string") {
      return card.imageSrc;
    }
    return assetMap[card.imageSrc] ?? card.imageSrc;
  }

  function FeatureRow({ card, index }: { card: FeatureCard; index: number }) {
    const Icon = card.icon;
    const isImageLeft = card.imageSide === "left";
    const cardNumber = String(index + 1).padStart(2, "0");
    const imageSrc = resolveFeatureImageSrc(card);

    const contentBlock = (
      <div className="order-2 flex flex-1 flex-col justify-center gap-5 bg-[#F7F5F0] px-6 py-8 dark:bg-[#09090B] md:order-0 md:px-12 md:py-14">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-[#9CA3AF]">
            {cardNumber} / 04
          </span>
          {card.badge && (
            <span className="rounded-lg bg-[#f91616] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              {card.badge}
            </span>
          )}
        </div>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00BCA1]/15 text-[#00BCA1] dark:bg-[#00BCA1]/10">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <h3
            className="text-2xl font-bold text-[#0F172A] dark:text-white"
            style={{ fontFamily: featureTitleFontFamily }}
          >
            {card.title}
          </h3>
        </div>
        <p className="resource-page-copy max-w-md text-[#52525B] dark:text-[#A1A1AA]">
          {card.description}
        </p>
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED] dark:bg-white/5 dark:text-[#C4B5FD]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <AnimatedCta
            as="a"
            href={card.href ?? "#"}
            className="resource-page-button inline-flex w-auto rounded-lg border-2 border-[#01509e] bg-[#01509e] text-[14px] font-semibold tracking-wide text-white hover:bg-[#004b92] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88] transition-all duration-200"
            iconClassName="bg-white text-[#01509e] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(1,80,158,0.18)] dark:bg-white dark:text-[#00BCA1]"
            icon={ctaArrowIcon}
          >
            {card.cta}
          </AnimatedCta>
          {card.meta && (
            <span className="text-xs text-[#9CA3AF]">{card.meta}</span>
          )}
        </div>
      </div>
    );

    const imageBlock = (
      <div className="order-1 flex flex-1 items-center justify-center bg-[#F7F5F0] p-6 dark:bg-[#09090B] md:order-0 md:p-10">
        <div className="relative aspect-4/3 w-full max-w-115">
          <Image
            src={imageSrc}
            alt={card.imageAlt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
    );

    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={[
          "relative flex min-h-95 overflow-hidden bg-[#F7F5F0] dark:bg-[#09090B]",
          index > 0 ? "-mt-px" : "",
          isImageLeft
            ? "ml-4 rounded-r-[28px] border-y border-r border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:ml-6"
            : "mr-4 rounded-l-[28px] border-y border-l border-[#00BCA1]/70 dark:border-[#00BCA1]/35 md:ml-0 md:mr-6 md:rounded-r-none md:rounded-l-[28px] md:border-r-0 md:border-l",
          "transition-colors duration-300",
          "flex-col md:flex-row",
        ].join(" ")}
      >
        {isImageLeft ? (
          <>
            {imageBlock}
            {contentBlock}
          </>
        ) : (
          <>
            {contentBlock}
            {imageBlock}
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="resource-page" style={{ fontFamily: bodyFontFamily }}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/8 transition-colors duration-300">
        {/* ── Animated Background Layers ── */}
        <HeroBackground isDark={isDark} bottomFadeStyle={heroBottomFadeStyle} />

        {/* ── Hero Content (unchanged) ── */}
        <div
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-18 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-16 md:pt-24"
          style={{ position: "relative", zIndex: 10 }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="order-2 text-center md:order-1 md:text-left"
          >
            {sectionLabels.heroBadge ? (
              <motion.div
                variants={fadeUp}
                className="mb-5 inline-flex rounded-full bg-[#BDEEF0]/40 px-3 py-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B7C83]">
                  {sectionLabels.heroBadge}
                </span>
              </motion.div>
            ) : null}
            <motion.h1
              variants={fadeUp}
              className="resource-hero-title mx-auto max-w-[12ch] text-[clamp(2.65rem,7vw,80px)] font-bold leading-[0.95] text-[#18181B] dark:text-white md:mx-0"
              style={{
                fontFamily: heroTitleFontFamily,
                fontWeight: isKhmer ? 800 : 700,
              }}
            >
              {sectionLabels.heroTitleLine1}
              {sectionLabels.heroTitleLine2 ? (
                <>
                  <br />
                  <span className="text-[#00BCA1]">
                    {sectionLabels.heroTitleLine2}
                  </span>
                </>
              ) : null}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="resource-page-copy mx-auto mt-6 max-w-3xl text-[#52525B] dark:text-[#A1A1AA] md:mx-0"
            >
              {sectionLabels.heroSubtitle}
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="order-1 flex justify-center md:order-2 md:-mt-4 md:justify-end"
          >
            <div className="relative flex h-75 w-full max-w-125 items-center justify-center md:h-115 md:max-w-135">
              <div className="absolute right-4 top-2 h-36 w-36 rounded-full bg-[#86EFAC]/20 blur-[50px]" />
              <Image
                src={resourceCenterImage}
                alt="Resource Center"
                width={520}
                height={520}
                className="relative z-10 h-full w-auto object-contain"
                preload
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Start ───────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-4 py-12 dark:bg-[#09090B] md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-[clamp(2rem,3vw,2.25rem)] font-bold text-[#18181B] dark:text-white">
              {sectionLabels.quickStart}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {quickCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="rounded-2xl border border-[#EEF2F0] bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-[#00BCA1]/60 hover:shadow-[0_0_0_1px_rgba(0,188,161,0.18),0_0_16px_rgba(0,188,161,0.10)] dark:border-white/10 dark:bg-[#111113] md:p-6"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F7F7] text-[#0B6E73] dark:bg-white/5 dark:text-[#7CE5D4]">
                    <Icon size={18} />
                  </div>
                  <h3 className="mb-5 text-xl font-bold text-[#18181B] dark:text-white">
                    {card.title}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#008C83]">
                        {sectionLabels.what}
                      </p>
                      <p className="resource-page-copy mt-1 text-[#4B5563] dark:text-[#A1A1AA]">
                        {card.what}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-mid">
                        {sectionLabels.why}
                      </p>
                      <p className="resource-page-copy mt-1 text-[#4B5563] dark:text-[#A1A1AA]">
                        {card.why}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#18181B] dark:text-white">
                        {sectionLabels.how}
                      </p>
                      <div className="mt-1 rounded-md bg-[#E7ECEA] px-3 py-2 font-mono text-[11px] text-[#374151] dark:bg-[#1B1B1F] dark:text-[#E4E4E7]">
                        {card.how}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Technical Deep Dives ──────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-4 pb-14 dark:bg-[#09090B] md:pb-18">
        <div className="mx-auto max-w-7xl rounded-xl bg-[#EAF1EC] px-5 py-10 dark:bg-[#101713] md:px-6 md:py-12">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[clamp(2rem,3vw,2.25rem)] font-bold text-[#18181B] dark:text-white">
                {sectionLabels.technical}
              </h2>
              <p className="resource-page-copy mt-2 text-[#4B5563] dark:text-[#A1A1AA]">
                {sectionLabels.technicalSubtitle}
              </p>
            </div>
            <Link href="/resource/tool" className="inline-flex items-center gap-2 text-[15px] font-bold text-[#008C83]">
              {sectionLabels.technicalCta}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {miniCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="rounded-xl border border-[#EDF2EE] bg-white p-5 dark:border-white/10 dark:bg-[#111113]"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] dark:text-[#D1D5DB]">
                      <Icon size={16} />
                    </div>
                    <span className="rounded-lg bg-[#E8ECE8] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#52525B] dark:bg-white/5 dark:text-white">
                      {card.version}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#18181B] dark:text-white">
                    {card.title}
                  </h3>
                  <p className="resource-page-copy mt-2 text-[#52525B] dark:text-[#A1A1AA]">
                    {card.description}
                  </p>
                  <div className="mt-5 flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${i < card.level ? "bg-[#00BCA1]" : "bg-[#D6D3D1] dark:bg-white/15"}`}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-4 pb-14 dark:bg-[#09090B] md:pb-18">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-[clamp(2rem,3vw,2.25rem)] font-bold text-[#18181B] dark:text-white">
              {sectionLabels.featureCards}
            </h2>
          </div>
          <div className="flex flex-col gap-0">
            {featureCards.map((card, index) => (
              <FeatureRow key={card.title} card={card} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-4 pb-14 dark:bg-[#09090B] md:pb-18">
        <div className="mx-auto max-w-7xl">
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* Title — shows on top centered on mobile, hidden on desktop (shown in second column instead) */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center lg:hidden"
            >
              <h2
                className="text-[clamp(2.2rem,5vw,2.8125rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[#18181B] dark:text-white"
                style={{ fontFamily: displayFontFamily }}
              >
                <span className="block">{workflowCopy.titleLine1}</span>
                <span className="block text-[#01509E]">
                  {workflowCopy.titleLine2}
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-6 overflow-visible"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#18181B] dark:text-white">
                  {sectionLabels.workflowSteps}
                </h2>
              </div>

              {/* Roadmap with winding path */}
              <div className="relative w-full" style={{ height: "540px" }}>
                {/* Animated road CSS */}
                <style jsx>{`
                  @keyframes dashFlow {
                    0% {
                      stroke-dashoffset: 0;
                    }
                    100% {
                      stroke-dashoffset: -40;
                    }
                  }
                  @keyframes dotPulse {
                    0%,
                    100% {
                      opacity: 0.4;
                      r: 3;
                    }
                    50% {
                      opacity: 1;
                      r: 5;
                    }
                  }
                  @keyframes travelDot {
                    0% {
                      offset-distance: 0%;
                      opacity: 0;
                    }
                    5% {
                      opacity: 1;
                    }
                    95% {
                      opacity: 1;
                    }
                    100% {
                      offset-distance: 100%;
                      opacity: 0;
                    }
                  }
                  .road-dashes {
                    animation: dashFlow 1.5s linear infinite;
                  }
                  .dot-pulse {
                    animation: dotPulse 2s ease-in-out infinite;
                  }
                  .travel-dot {
                    offset-path: path(
                      "M 100 60 C 100 60, 200 90, 320 140 S 450 210, 400 270 S 250 320, 200 350 S 100 390, 150 440 S 300 490, 350 510"
                    );
                    animation: travelDot 4s ease-in-out infinite;
                  }
                `}</style>

                {/* Winding road SVG */}
                <svg
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  viewBox="0 0 500 540"
                  fill="none"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {/* Road body (wide, light) */}
                  <path
                    d="M 100 60 C 100 60, 200 90, 320 140 S 450 210, 400 270 S 250 320, 200 350 S 100 390, 150 440 S 300 490, 350 510"
                    stroke="#d1e8e3"
                    strokeWidth="34"
                    strokeLinecap="round"
                    fill="none"
                    className="dark:opacity-20"
                  />
                  {/* Road center dashes — animated flow */}
                  <path
                    d="M 100 60 C 100 60, 200 90, 320 140 S 450 210, 400 270 S 250 320, 200 350 S 100 390, 150 440 S 300 490, 350 510"
                    stroke="#00BCA1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="12 8"
                    fill="none"
                    className="road-dashes dark:opacity-60"
                  />
                  {/* Glowing travel dot along the path */}
                  <circle
                    r="6"
                    fill="#00BCA1"
                    className="travel-dot"
                    opacity="0.9"
                  >
                    <animate
                      attributeName="r"
                      values="4;7;4"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Small dot markers along the road — with pulse */}
                  <circle
                    cx="170"
                    cy="95"
                    r="4"
                    fill="none"
                    stroke="#00BCA1"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "0s" }}
                  />
                  <circle
                    cx="290"
                    cy="125"
                    r="4"
                    fill="none"
                    stroke="#00BCA1"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <circle
                    cx="380"
                    cy="170"
                    r="4"
                    fill="none"
                    stroke="#00BCA1"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <circle
                    cx="430"
                    cy="230"
                    r="4"
                    fill="none"
                    stroke="#01509e"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "0.9s" }}
                  />
                  <circle
                    cx="310"
                    cy="310"
                    r="4"
                    fill="none"
                    stroke="#01509e"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <circle
                    cx="160"
                    cy="380"
                    r="4"
                    fill="none"
                    stroke="#01509e"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "1.5s" }}
                  />
                  <circle
                    cx="230"
                    cy="460"
                    r="4"
                    fill="none"
                    stroke="#01509e"
                    strokeWidth="1.5"
                    className="dot-pulse dark:opacity-60"
                    style={{ animationDelay: "1.8s" }}
                  />
                </svg>

                {/* Step 1 — Top left */}
                <div className="absolute top-4 left-[4%] flex items-center gap-3 z-10">
                  <div className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#00BCA1] bg-transparent">
                    <div className="h-3.5 w-3.5 rounded-full bg-[#00BCA1]" />
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-white/95 dark:bg-[#1a1f1d]/95 backdrop-blur-sm px-5 py-3.5 border border-[#e2e8e6] dark:border-white/10">
                    <div className="h-9 w-0.75 rounded-full bg-[#00BCA1]" />
                    <div>
                      <p className="text-[15px] font-bold text-[#18181B] dark:text-white">
                        <span className="text-[#00BCA1] mr-1.5">1.</span>
                        {workflowSteps[0].title}
                      </p>
                      <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                        {workflowSteps[0].desc}
                      </p>
                    </div>
                  </div>
                </div>

                  {/* Step 2 — Middle right */}
                  <div className="absolute top-55 right-[4%] flex items-center gap-3 z-10">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/95 dark:bg-[#1a1f1d]/95 backdrop-blur-sm px-5 py-3.5 border border-[#e2e8e6] dark:border-white/10">
                      <div className="h-9 w-0.75 rounded-full bg-[#00BCA1]" />
                      <div>
                        <p className="text-[15px] font-bold text-[#18181B] dark:text-white">
                          <span className="text-[#00BCA1] mr-1.5">2.</span>
                          {workflowSteps[1].title}
                        </p>
                        <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                          {workflowSteps[1].desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#00BCA1] bg-transparent">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#00BCA1]" />
                    </div>
                  </div>

                  {/* Step 3 — Bottom left */}
                  <div className="absolute bottom-4 left-[4%] flex items-center gap-3 z-10">
                    <div className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#01509e] bg-transparent">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#01509e]" />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/95 dark:bg-[#1a1f1d]/95 backdrop-blur-sm px-5 py-3.5 border border-[#e2e8e6] dark:border-white/10">
                      <div className="h-9 w-0.75 rounded-full bg-[#01509e]" />
                      <div>
                        <p className="text-[15px] font-bold text-[#18181B] dark:text-white">
                          <span className="text-[#01509e] mr-1.5">3.</span>
                          {workflowSteps[2].title}
                        </p>
                        <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5">
                          {workflowSteps[2].desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2
                className="hidden lg:block max-w-[15ch] text-[clamp(2.2rem,5vw,2.8125rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[#18181B] dark:text-white lg:max-w-[16ch]"
                style={{ fontFamily: displayFontFamily }}
              >
                <span className="block">{workflowCopy.titleLine1}</span>
                <span className="block text-[#01509E]">
                  {workflowCopy.titleLine2}
                </span>
              </h2>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-8 w-1.5 rounded-full bg-[#0A8A68]" />
                    <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
                      {workflowCopy.whatTitle}
                    </h3>
                  </div>
                  <p className="resource-page-copy pl-4 text-[#52525B] dark:text-[#A1A1AA]">
                    {workflowCopy.whatBody}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-8 w-1.5 rounded-full bg-secondary-mid" />
                    <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
                      {workflowCopy.whyTitle}
                    </h3>
                  </div>
                  <p className="resource-page-copy pl-4 text-[#52525B] dark:text-[#A1A1AA]">
                    {workflowCopy.whyBody}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-8 w-1.5 rounded-full bg-[#01509E]" />
                    <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
                      {workflowCopy.howTitle}
                    </h3>
                  </div>
                  <p className="resource-page-copy pl-4 text-[#52525B] dark:text-[#A1A1AA]">
                    {workflowCopy.howBody}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── System Status ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F0] px-4 py-14 dark:bg-[#09090B] md:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#18181B] dark:text-white">
              {sectionLabels.systemStatus}
            </h2>
            <p className="resource-page-copy mt-3 text-[#52525B] dark:text-[#A1A1AA]">
              {sectionLabels.systemStatusSubtitle}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#01509e] bg-[#F7F5F0] dark:border-white/10 dark:bg-[#09090B]">
            <div className="border-b border-[#01509e]/20 bg-[#F7F5F0] px-4 py-3 text-[13px] font-medium text-[#01509E] dark:border-white/10 dark:bg-[#09090B] md:hidden">
              {sectionLabels.mobileTableHint}
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-190">
                <thead className="bg-[#F2EFE7] dark:bg-[#111113]">
                  <tr>
                    <th className="resource-page-meta px-6 py-4 text-left font-bold uppercase tracking-[0.18em] text-[#18181B] dark:text-white">
                      {sectionLabels.component}
                    </th>
                    <th className="resource-page-meta px-6 py-4 text-left font-bold uppercase tracking-[0.18em] text-[#18181B] dark:text-white">
                      {sectionLabels.version}
                    </th>
                    <th className="resource-page-meta px-6 py-4 text-left font-bold uppercase tracking-[0.18em] text-[#18181B] dark:text-white">
                      {sectionLabels.status}
                    </th>
                    <th className="resource-page-meta px-6 py-4 text-left font-bold uppercase tracking-[0.18em] text-[#18181B] dark:text-white">
                      {sectionLabels.lastAudit}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map((row, index) => (
                    <tr
                      key={row.service}
                      className={`border-b border-[#01509e]/20 dark:border-white/10 last:border-b-0 ${index % 2 === 0 ? "bg-[#F7F5F0] dark:bg-[#09090B]" : "bg-[#F2EFE7] dark:bg-[#111113]"}`}
                    >
                      <td className="resource-page-meta whitespace-nowrap px-6 py-5 font-bold text-[#18181B] dark:text-white">
                        {row.service}
                      </td>
                      <td className="resource-page-meta whitespace-nowrap px-6 py-5 text-[#52525B] dark:text-[#A1A1AA]">
                        {row.version}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-xl px-3 py-1.5 text-[15px] font-semibold tracking-[0.02em] ${statusBadgeClasses[row.status]}`}
                        >
                          {sectionLabels[row.status]}
                        </span>
                      </td>
                      <td className="resource-page-meta whitespace-nowrap px-6 py-5 text-[#71717A] dark:text-[#A1A1AA]">
                        {row.lastAudit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}