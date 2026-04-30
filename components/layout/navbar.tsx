'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTheme } from '@/components/theme-provider';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import AuthorizedUserIndicator from '@/components/auth/authorized-user-indicator';
import { authClient } from '@/lib/auth-client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  SunIcon,
  MoonIcon,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
type ToolItem = {
  title: string;
  href: string;
  icon: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type FeatureItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type ResourceItem = {
  title: string;
  description?: string;
  href: string;
  icon: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

// ── Data ─────────────────────────────────────────────────────────────────────
const toolLinks: ToolItem[] = [
  { title: 'Subfinder',    href: '#', icon: '/icons/subfinder.webp'    },
  { title: 'Naabu',        href: '#', icon: '/icons/nabuu.webp'        },
  { title: 'Nmap',         href: '#', icon: '/icons/nmap.webp'         },
  { title: 'Nuclei',       href: '#', icon: '/icons/nuclei.webp'       },
  { title: 'URL Fuzzer',   href: '#', icon: '/icons/url.webp'          },
  { title: 'WPScan',       href: '#', icon: '/icons/wpscan.webp'       },
  { title: 'SQLi',         href: '#', icon: '/icons/sqli.webp'         },
  { title: 'XSS Strike',   href: '#', icon: '/icons/xss.webp'          },
  { title: 'Kiterunner',   href: '#', icon: '/icons/kiterunner.webp'   },
  { title: 'Httpx',        href: '#', icon: '/icons/httpx.webp'        },
  { title: 'Katana',       href: '#', icon: '/icons/katana.webp'       },
  { title: 'Gobuster',     href: '#', icon: '/icons/gobuster.webp'     },
  { title: 'Amass',        href: '#', icon: '/icons/amass.webp'        },
  { title: 'Assetfinder',  href: '#', icon: '/icons/assetfinder.webp'  },
];

const navbarToolLinks = toolLinks.filter(({ title }) =>
  ['Nmap', 'Naabu', 'Subfinder', 'Katana', 'Httpx', 'Gobuster'].includes(title)
);

const featureLinks: FeatureItem[] = [
  { title: 'Integration CI/CD', description: 'Seamlessly connect with your development pipelines',   href: '/feature/cicd',   icon: '/icons/feature-cicd.webp'       },
  { title: 'Ai Pentest',        description: 'Accelerate testing with intelligent automation',        href: '/feature/ai',     icon: '/icons/feature-aipentest.webp'  },
  { title: 'CLI Access',        description: 'Execute tools remotely via terminal',                   href: '/feature/cli',    icon: '/icons/feature-cli.webp'        },
  { title: 'Automation Tools',  description: 'Run tools instantly from the web UI',                   href: '/feature/webui',  icon: '/icons/feature-automation.webp' },
];

const resourceDocLinks: ResourceItem[] = [
  { title: 'CLI Documents',   description: 'Guides for using tools via command line',        href: '/resource/cli',   icon: '/icons/res-cli.webp'   },
  { title: 'API Documents',   description: 'Accelerate testing with intelligent automation', href: '/resource/api',   icon: '/icons/res-api.webp'   },
  { title: 'Tools Documents', description: 'Instructions for using security tools',          href: '/resource/tool',  icon: '/icons/res-tools.webp' },
  { title: 'CI/CD Documents', description: 'Setup guides for pipeline integration',          href: '/resource/ci-cd', icon: '/icons/res-cicd.webp'  },
];

const resourceMiscLinks: ResourceItem[] = [
  { title: 'About Us',   href: '/about-us',   icon: '/icons/about_us_icon.webp'   },
  { title: 'Contact Us', href: '/contact-us', icon: '/icons/contact_us_icon.webp' },
  { title: 'FAQ',        href: '/help-center', icon: '/icons/faq.webp'            },
];

// ── Shared icon box class ────────────────────────────────────────────────────
const iconBoxCls =
  'flex shrink-0 items-center justify-center rounded-[8px] ' +
  'bg-[#F7F5F0] dark:bg-[#1C1C1A] ' +
  'border border-black/[0.045] dark:border-white/[0.09] ' +
  'shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]';

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 100, height: 40 }} />;
  const src = theme === 'dark'
    ? '/Auto_Offensive_Dark-mode.png'
    : '/Auto_Offensive_Light-mode.png';
  return (
    <Link href="/" className="cursor-pointer shrink-0">
      <Image src={src} alt="Auto-Offensive" width={100} height={40} priority style={{ width: 'auto', height: 'auto' }} />
    </Link>
  );
}

// ── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-10 shrink-0 rounded-full" />;
  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="group relative grid size-10 shrink-0 place-items-center rounded-full border border-black/9 dark:border-white/9 bg-transparent text-zinc-700 transition-all duration-300 dark:text-zinc-100"
    >
      <span
        className={cn(
          'col-start-1 row-start-1 p-1.5 leading-none transition-transform duration-500',
          isDark
            ? 'scale-100 rotate-0 text-zinc-400 delay-200'
            : 'scale-0 rotate-360 text-zinc-400 delay-0',
        )}
      >
        <MoonIcon className="size-5" />
      </span>
      <span
        className={cn(
          'col-start-1 row-start-1 p-1.5 leading-none transition-transform duration-500',
          isDark
            ? 'scale-0 -rotate-360 text-amber-500 delay-0'
            : 'scale-100 rotate-360 text-amber-500 delay-200',
        )}
      >
        <SunIcon className="size-5" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

type Lang = 'en' | 'kh';

function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const currentLocale = useLocale();
  const nextLocale: Lang = currentLocale === 'en' ? 'kh' : 'en';
  const isEnglish = currentLocale === 'en';

  React.useEffect(() => setMounted(true), []);

  const handleLocaleChange = () => {
    startTransition(() => {
      window.document.cookie = `locale=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
      router.refresh();
    });
  };

  const options: { value: Lang; flagSrc: string; code: string }[] = [
    { value: 'en', flagSrc: '/flags/en.png', code: 'EN' },
    { value: 'kh', flagSrc: '/flags/kh.png', code: 'KH' },
  ];

  if (!mounted) return <div className="h-10 w-23 shrink-0 rounded-full" />;

  const current = options.find(o => o.value === currentLocale) || options[0];

  return (
    <button
      type="button"
      onClick={handleLocaleChange}
      disabled={isPending}
      aria-label={`Switch language to ${nextLocale === 'kh' ? 'Khmer' : 'English'}`}
      aria-pressed={!isEnglish}
      className="relative inline-flex h-10 w-23 shrink-0 items-center rounded-full border border-black/9 dark:border-white/9 bg-[#F7F5F0]/90 dark:bg-[#09090B]/80 text-[#49537B] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-70 dark:text-white"
    >
      <span
        className={cn(
          'absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-black/9 dark:border-white/9 bg-white dark:bg-zinc-900 transition-all duration-300 ease-out',
          isEnglish ? 'left-1.25' : 'left-[calc(100%-2rem)]',
        )}
      >
        <Image
          src={current.flagSrc}
          alt={current.value}
          width={28}
          height={28}
          className="h-full w-full object-cover"
        />
      </span>
      <span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-lg font-semibold leading-none tracking-[0.02em] transition-all duration-300 ease-out',
          isEnglish ? 'right-3 text-left' : 'left-3 text-left',
          isPending && 'opacity-70',
        )}
      >
        {current.code}
      </span>
    </button>
  );
}

// ── Tool List Item ────────────────────────────────────────────────────────────
function ToolItem({ title, href, icon, onClick }: ToolItem) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A] transition-colors group"
    >
      <div className={cn(iconBoxCls, 'size-11 md:size-12')}>
        <Image
          src={icon}
          alt={title}
          width={30}
          height={30}
          className="h-7.5 w-7.5 object-contain md:h-8 md:w-8"
        />
      </div>
      <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
        {title}
      </span>
    </Link>
  );
}

// ── Feature List Item ─────────────────────────────────────────────────────────
function FeatureItem({ title, description, href, icon, onClick }: FeatureItem) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-start gap-2.5 rounded-[8px] p-2 hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A] transition-colors group"
    >
      <div className={cn(iconBoxCls, 'mt-0.5 size-11 md:size-12')}>
        <Image
          src={icon}
          alt={title}
          width={30}
          height={30}
          className="h-7.5 w-7.5 object-contain md:h-8 md:w-8"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-snug">
          {title}
        </p>
        <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

// ── Resource Doc Item ─────────────────────────────────────────────────────────
function ResourceDocItem({
  title,
  description,
  href,
  icon,
  onClick,
  asMenuLink = false,
}: ResourceItem & { asMenuLink?: boolean }) {
  const content = (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-start gap-2.5 rounded-[8px] p-2 hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A] transition-colors group"
    >
      <div className={cn(iconBoxCls, 'size-10 md:size-11')}>
        <Image
          src={icon}
          alt={title}
          width={26}
          height={26}
          className="h-6.5 w-6.5 object-contain md:h-7 md:w-7"
        />
      </div>
      <div>
        <p className="text-[12.5px] font-semibold text-foreground leading-snug">
          {title}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{description}</p>
        )}
      </div>
    </Link>
  );

  return asMenuLink ? <NavigationMenuLink asChild>{content}</NavigationMenuLink> : content;
}

// ── Resource Misc Item ────────────────────────────────────────────────────────
function ResourceMiscItem({
  title,
  href,
  icon,
  onClick,
  asMenuLink = false,
}: ResourceItem & { asMenuLink?: boolean }) {
  const content = (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A] transition-colors group"
    >
      <div className={cn(iconBoxCls, 'size-10 md:size-11')}>
        <Image
          src={icon}
          alt={title}
          width={26}
          height={26}
          className="h-6.5 w-6.5 object-contain md:h-7 md:w-7"
        />
      </div>
      <span className="text-[12.5px] font-medium text-foreground">{title}</span>
    </Link>
  );

  return asMenuLink ? <NavigationMenuLink asChild>{content}</NavigationMenuLink> : content;
}

// ── Scroll hook ───────────────────────────────────────────────────────────────
function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);
  React.useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);
  React.useEffect(() => { onScroll(); }, [onScroll]);
  return scrolled;
}

// ── Mobile Menu ───────────────────────────────────────────────────────────────
type MobileMenuProps = React.ComponentProps<'div'> & { open: boolean };

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null;
  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-[#F7F5F0]/95 dark:bg-[#09090B]/95 [@supports(backdrop-filter:blur(0))]:bg-[#F7F5F0]/70 dark:[@supports(backdrop-filter:blur(0))]:bg-[#09090B]/70',
        'fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
      )}
    >
      <div
        data-slot={open ? 'open' : 'closed'}
        className={cn(
          'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
          'size-full p-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const isKhmer = locale === 'kh';
  const bodyFontFamily = isKhmer
    ? 'var(--font-noto-khmer), var(--font-google-sans), sans-serif'
    : 'var(--font-google-sans), var(--font-noto-khmer), sans-serif';
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Shared dropdown panel styles
  const dropdownPanelCls =
    'rounded-[13px] border border-black/[0.045] dark:border-white/[0.09] ' +
    'bg-white dark:bg-[#111110] ' +
    'shadow-[0_4px_24px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] ' +
    'dark:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_1px_4px_rgba(0,0,0,0.3)] p-3';
  const authAction = isSessionPending ? (
    <div
      aria-hidden="true"
      className="h-9 w-9 rounded-full border border-black/8 bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.06]"
    />
  ) : session ? (
    <AuthorizedUserIndicator />
  ) : (
    <Link
      href="/register"
      className="rounded-md bg-transparent px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
    >
      {t('signUp')}
    </Link>
  );

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent transition-colors duration-200', {
        'bg-[#F7F5F0]/95 dark:bg-[#09090B]/95 [@supports(backdrop-filter:blur(0))]:bg-[#F7F5F0]/70 dark:[@supports(backdrop-filter:blur(0))]:bg-[#09090B]/70 border-black/[0.07] dark:border-white/[0.07]': scrolled,
      })}
    >
      <nav
        className="mx-auto z-50 flex h-14 w-full max-w-7xl items-center justify-between px-4"
        style={{ fontFamily: bodyFontFamily }}
      >

        {/* Left: Logo */}
        <div>
          <Logo />
        </div>

        {/* Center: Nav */}
        <div>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>

              {/* ── Tools ── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary text-foreground font-semibold">
                  <Link href="/tools">{t('tools')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={cn(dropdownPanelCls, 'w-84')}>
                    <ul className="grid grid-cols-2 gap-0.5">
                      {navbarToolLinks.map((item, i) => (
                        <li key={i}>
                          <ToolItem {...item} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 border-t border-black/[0.07] dark:border-white/6 pt-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools"
                          className="flex items-center justify-between rounded-[8px] px-2 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A]"
                        >
                          <span>See more</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ── Features ── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary text-foreground font-semibold">
                  <Link href="/feature">{t('features')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={cn(dropdownPanelCls, 'w-90')}>
                    <ul className="grid grid-cols-2 gap-1">
                      {featureLinks.map((item, i) => (
                        <li key={i}>
                          <FeatureItem {...item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ── Resources ── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary text-foreground font-semibold">
                  <Link href="/resource">{t('resources')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={cn(dropdownPanelCls, 'w-95')}>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Left: doc links */}
                      <ul className="space-y-0.5 border-r border-black/[0.07] dark:border-white/6 pr-2">
                        {resourceDocLinks.map((item, i) => (
                          <li key={i}>
                            <ResourceDocItem {...item} asMenuLink />
                          </li>
                        ))}
                      </ul>
                      {/* Right: misc links */}
                      <ul className="space-y-0.5 pl-2">
                        {resourceMiscLinks.map((item, i) => (
                          <li key={i}>
                            <ResourceMiscItem {...item} asMenuLink />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Desktop controls */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle />
          {authAction}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            className="flex items-center justify-center size-9 rounded-md border border-black/9 dark:border-white/9 bg-transparent cursor-pointer"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        open={open}
        className="flex flex-col justify-between gap-2 overflow-y-auto"
        style={{ fontFamily: bodyFontFamily }}
      >
        <div className="flex flex-col gap-3">

          {/* Preferences */}
          <div className="flex items-center justify-between rounded-xl border border-black/8 dark:border-white/[0.07] bg-white/70 dark:bg-[#111110]/70 p-3 backdrop-blur-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</p>
              <p className="text-sm text-foreground">Language and theme</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Tools */}
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            {navbarToolLinks.map((link, i) => (
              <ToolItem key={i} {...link} onClick={() => setOpen(false)} />
            ))}
          </div>
          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center justify-between rounded-[8px] border border-black/8 dark:border-white/[0.07] px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-[#F7F5F0] dark:hover:bg-[#1C1C1A]"
          >
            <span>See more</span>
            <span aria-hidden="true">→</span>
          </Link>

          {/* Features */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
            <Link
              href="/feature"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary"
            >
              {isKhmer ? 'បើកទំព័រ' : 'Open page'}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {featureLinks.map((link, i) => (
              <FeatureItem key={i} {...link} onClick={() => setOpen(false)} />
            ))}
          </div>

          {/* Resources */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>
            <Link
              href="/resource"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary"
            >
              {isKhmer ? 'បើកទំព័រ' : 'Open page'}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-0.5">
            {resourceDocLinks.map((link, i) => (
              <ResourceDocItem key={i} {...link} onClick={() => setOpen(false)} />
            ))}
            {resourceMiscLinks.map((link, i) => (
              <ResourceMiscItem key={i} {...link} onClick={() => setOpen(false)} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.07] dark:border-white/6">
          {isSessionPending ? (
            <div
              aria-hidden="true"
              className="h-10 w-full rounded-md border border-black/8 bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.06]"
            />
          ) : session ? (
            <div className="flex justify-center">
              <AuthorizedUserIndicator className="h-10 w-10" />
            </div>
          ) : (
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="w-full rounded-md border border-primary bg-transparent py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {t('signUp')}
            </Link>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}
