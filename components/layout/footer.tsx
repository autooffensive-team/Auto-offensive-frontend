"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaLinkedin, FaTelegram, FaYoutube } from "@/components/icons/social-icons";
import { useTranslations } from "next-intl";

const socialLinks = [
  { icon: FaFacebook,  href: "https://www.facebook.com/share/1DMqBN53KR/?mibextid=wwXIfr", label: "Facebook",  color: "hover:bg-[#1877F2] hover:border-[#1877F2] hover:shadow-[0_0_0_4px_rgba(24,119,242,0.2)]" },
  { icon: FaYoutube,   href: "https://www.youtube.com/@AutoOffensive", label: "YouTube",   color: "hover:bg-[#FF0000] hover:border-[#FF0000] hover:shadow-[0_0_0_4px_rgba(255,0,0,0.2)]"   },
  { icon: FaLinkedin,  href: "#", label: "LinkedIn",  color: "hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:shadow-[0_0_0_4px_rgba(10,102,194,0.2)]" },
  { icon: FaTelegram,  href: "https://t.me/autooffensive", label: "Telegram",  color: "hover:bg-[#26A5E4] hover:border-[#26A5E4] hover:shadow-[0_0_0_4px_rgba(38,165,228,0.2)]" },
];

export function Footer() {
  const t = useTranslations('footer');

  const DOCS_HOST = (process.env.NEXT_PUBLIC_DOCS_APP_URL || '').replace(/\/$/, '');
  const toDocsUrl = (path: string) => `${DOCS_HOST}/docs/${path.replace(/^\//, '')}`;

  return (
    <footer suppressHydrationWarning className="relative mt-auto w-full overflow-hidden border-t border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-0"
        style={{
          backgroundImage: `
          linear-gradient(to right, var(--color-secondary-mid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-secondary-mid) 1px, transparent 1px)
        `,
          backgroundPosition: "center center",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 40% 50% at center, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 40% 50% at center, black, transparent)",
        }}
      />

      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.12]"
        style={{
          backgroundImage: `
          linear-gradient(to right, var(--color-primary) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)
        `,
          backgroundPosition: "center center",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 40% 50% at center, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 40% 50% at center, black, transparent)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden select-none">
        <h1
          className="font-black tracking-tighter whitespace-nowrap"
          style={{
            fontFamily: "var(--font-hackdaddy), monospace",
            fontSize: "clamp(2rem, 12vw, 15rem)",
            transform: "translateY(25%)",
            background:
              "linear-gradient(to bottom, var(--color-secondary-start), var(--color-secondary-mid), var(--color-secondary-end))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: 0.12,
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.05) 90%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.05) 90%, rgba(0,0,0,0) 100%)",
          }}
        >
          AUTO OFFENSIVE
        </h1>
      </div>

      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-zinc-400 to-transparent dark:via-zinc-600" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 py-10 text-center md:py-12">
          <Link href="/" className="inline-flex items-center sm:hidden">
            <Image
              src="/Auto_Offensive_Light-mode.png"
              alt="Auto-Offensive"
              width={150}
              height={85}
              priority
              className="block dark:hidden"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src="/Auto_Offensive_Dark-mode.png"
              alt="Auto-Offensive"
              width={150}
              height={85}
              priority
              className="hidden dark:block"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          <div className="flex w-full flex-col items-center gap-4 sm:hidden">
            <p className="max-w-xs px-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("description")}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium tracking-wide italic text-zinc-600 dark:text-zinc-400">
                &quot;{t("tagline")}&quot;
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900 ${social.color}`}
                >
                  <social.icon className="text-xl text-zinc-600 transition-colors duration-300 group-hover:text-white dark:text-zinc-300 dark:group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 sm:hidden" />

          <div className="flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            <Link href="/" className="hidden items-center sm:inline-flex">
              <Image
                src="/Auto_Offensive_Light-mode.png"
                alt="Auto-Offensive"
                width={150}
                height={85}
                priority
                className="block dark:hidden"
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                src="/Auto_Offensive_Dark-mode.png"
                alt="Auto-Offensive"
                width={150}
                height={85}
                priority
                className="hidden dark:block"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>

            <div className="hidden h-16 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />

            <div className="flex flex-col items-center gap-2">
              <p className="order-1 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                {t("sponsoredBy")}
              </p>
              <Image
                src="/istad_logo.png"
                alt="ISTAD logo"
                width={150}
                height={75}
                className="order-2 block dark:hidden"
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                src="/istad-logo-white.png"
                alt="ISTAD logo"
                width={150}
                height={75}
                className="order-2 hidden dark:block"
                style={{ width: "auto", height: "auto" }}
              />
              <p className="order-3 max-w-70 text-center text-xs leading-snug text-zinc-600 dark:text-zinc-400 sm:max-w-50">
                {t("sponsorName")}
              </p>
            </div>
          </div>

          <p className="hidden max-w-3xl px-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:block sm:px-0 sm:text-lg">
            {t("description")}
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 sm:inline-flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium tracking-wide italic text-zinc-600 dark:text-zinc-400 sm:text-base">
              &quot;{t("tagline")}&quot;
            </span>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-2 sm:flex">
            {socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.href}
                aria-label={social.label}
                className={`group flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900 ${social.color}`}
              >
                <social.icon className="text-lg text-zinc-600 transition-colors duration-300 group-hover:text-white dark:text-zinc-300 dark:group-hover:text-white" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-zinc-100 py-10 md:py-12 dark:border-zinc-800 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("product")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("tools")}
                </Link>
              </li>
              <li>
                <Link href="/feature" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("features")}
                </Link>
              </li>
              <li>
                <Link href="/resource" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("resources")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("features")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/feature/ai" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("aiSecurity")}
                </Link>
              </li>
              <li>
                <Link href="/feature/webui" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("webUi")}
                </Link>
              </li>
              <li>
                <Link href="/feature/cli" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  CLI
                </Link>
              </li>
              <li>
                <Link href="/feature/cicd" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  CI/CD
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("documentation")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={toDocsUrl('/')} className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t("introduction")}
                </a>
              </li>
              <li>
                <a href={toDocsUrl('/scanning')} className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t("platformFeatures")}
                </a>
              </li>
              <li>
                <a href={toDocsUrl('/api')} className="text-base text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-150">
                  {t("developerReference")}
                </a>
              </li>
            </ul>
          </div>


          {/* Company */}
          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("company")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("legal")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("help")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms-of-service" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("termsAndConditions")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-zinc-600 transition-colors duration-150 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  {t("privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-100 py-6 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © Copyright 2026, {t("allRightsReserved")} Auto-Offensive · {t("builtFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}
