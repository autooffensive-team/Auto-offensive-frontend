'use client';

import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Terminal, Code, GitBranch,  Play, Settings, Shield } from "lucide-react";
import ResourceComponent from "@/components/pages/resourcepage/page-resource";

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
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const displayFontFamily = isKhmer
    ? "var(--font-noto-khmer), sans-serif"
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const descriptionTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";
  const subtitleTextClass = "text-[16px] md:text-[18px] lg:text-[20px]";

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
<ResourceComponent/>
    </div>
  );
}
