"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaLinkedin, FaGithub, FaTwitter } from "@/components/icons/social-icons";
import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";

const socialLinks = [
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
  { icon: FaFacebook, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaGithub, href: "#", label: "GitHub" },
];

export function Footer() {
  const t = useTranslations('footer');
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === "dark"
      ? "/Auto_Offensive_Dark-mode.png"
      : "/Auto_Offensive_Light-mode.png";

  const istadLogoSrc = resolvedTheme === "dark" ? "/istad-logo-white.png" : "/istad_logo.png";

  return (
    <footer suppressHydrationWarning className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 mt-auto relative overflow-hidden">

      {/* Watermark background text */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none overflow-hidden">
        <h1
          className="font-black tracking-tighter whitespace-nowrap text-zinc-900 dark:text-zinc-100 opacity-[0.03]"
          style={{
            fontFamily: "var(--font-hackdaddy), monospace",
            fontSize: "clamp(2rem, 12vw, 15rem)",
            transform: "translateY(25%)",
          }}
        >
          AUTO OFFENSIVE
        </h1>
      </div>

      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-zinc-400 dark:via-zinc-600 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section - Logo and Description */}
        <div className="py-10 md:py-12 flex flex-col items-center text-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            {/* Auto-Offensive Logo */}
            <Link href="/" className="inline-flex items-center">
              <Image
                src={logoSrc}
                alt="Auto-Offensive"
                width={150}
                height={85}
                priority
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-16 bg-zinc-200 dark:bg-zinc-700" />

            {/* ISTAD Sponsor */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('sponsoredBy')}
              </p>
              <Image
                src={istadLogoSrc}
                alt="ISTAD logo"
                width={100}
                height={50}
                style={{ width: 'auto', height: 'auto', maxHeight: '45px' }}
              />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug max-w-50">
                Institute of Science and Technology Advanced Development
              </p>
            </div>
          </div>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl mt-4">
            Automated penetration testing platform for developers, security engineers, and DevSecOps teams. Built to find vulnerabilities before attackers do.
          </p>

          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-base font-medium text-zinc-600 dark:text-zinc-400 tracking-wide italic">&quot;Scan. Detect. Secure.&quot;</span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-150"
              >
                <social.icon className="text-lg text-zinc-700 dark:text-zinc-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="py-10 md:py-12 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">

          {/* Product */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              {t('product')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t('tools')}
                </Link>
              </li>
              <li>
                <Link href="/feature" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href="/resource" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t('resources')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              {t('features')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/feature/ai" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  AI Security
                </Link>
              </li>
              <li>
                <Link href="/feature/webui" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Web UI
                </Link>
              </li>
              <li>
                <Link href="/feature/cli" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  CLI
                </Link>
              </li>
              <li>
                <Link href="/feature/cicd" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  CI/CD
                </Link>
              </li>
            </ul>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              Documentation
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Overview
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Scanning
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Dashboard &amp; Analytics
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  REST API
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  CLI Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  CI/CD Integration
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              {t('company')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Legal
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms-of-service" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 py-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © Copyright 2026, {t('allRightsReserved')} Auto-Offensive · Built for Security Engineers &amp; Pentesters
          </p>
        </div>

      </div>
    </footer>
  );
}
