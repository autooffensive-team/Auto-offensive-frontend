"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { FaFacebook, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { useTheme } from "@/components/theme-provider";
import * as React from "react";
import { useTranslations } from "next-intl";

const socialLinks = [
  { icon: FaLinkedin, href: "#" },
  { icon: FaFacebook, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaGithub, href: "#" },
];

export function Footer() {
  const t = useTranslations('footer');
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const logoSrc =
    theme === "dark"
      ? "/Auto_Offensive_Dark-mode.png"
      : "/Auto_Offensive_Light-mode.png";

  return (
    <footer className="w-full border-t bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4  py-12 flex flex-col justify-between gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex flex-col">
            <Link href="/" className="flex items-center mb-4">
              <Image src={logoSrc} alt="Auto-Offensive" width={140} height={80} priority style={{ width: 'auto', height: 'auto' }} />
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Automated penetration testing platform for developers, security engineers, and DevSecOps teams.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social, index) => (
                <Link key={index} href={social.href} className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                  <social.icon className="text-sm text-zinc-700 dark:text-zinc-300" />
                </Link>
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mt-3">&quot;Scan. Detect. Secure.&quot;</p>
          </div>

          <div className="flex flex-col gap-4 lg:ms-18">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Organized and Sponsored by</h3>
            <Image src={theme === "dark" ? "/istad-logo-white.png" : "/istad_logo.png"} alt="ISTAD logo" width={180} height={90} style={{ width: 'auto', height: 'auto' }} />
            <p className="text-sm text-zinc-600 text-center dark:text-zinc-400">Institute of Science and Technology Advanced Development</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest lg:ms-20 justify-center flex text-zinc-500 dark:text-zinc-400 mb-4">{t('product')}</h3>
            <ul className="space-y-2">
              <li><Link href="/tools" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('tools')}</Link></li>
              <li><Link href="/feature" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('features')}</Link></li>
              <li><Link href="/resource" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('resources')}</Link></li>
              <li><Link href="/pricing" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('pricing')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest lg:ms-20 justify-center flex text-zinc-500 dark:text-zinc-400 mb-4">{t('resources')}</h3>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('documentation')}</Link></li>
              <li><Link href="/api-docs" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('apiReference')}</Link></li>
              <li><Link href="/cli-guide" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('cliGuide')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest lg:ms-20 justify-center flex text-zinc-500 dark:text-zinc-400 mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('aboutUs')}</Link></li>
              <li><Link href="/contact-us" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('contactUs')}</Link></li>
              <li><Link href="/help-center" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('community')}</Link></li>
              <li><Link href="/privacy" className="text-sm text-zinc-600 dark:text-zinc-400 lg:ms-20 justify-center flex hover:text-black dark:hover:text-white transition">{t('legal')}</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-2 bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 gap-4">
          <p>© Copyright 2026, {t('allRightsReserved')} Auto-Offensive <br />Built for Security Engineers & Pentesters</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition">{t('privacyPolicy')}</Link>
            <Link href="/terms-of-service" className="hover:text-black dark:hover:text-white transition">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
