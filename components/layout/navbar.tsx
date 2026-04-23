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
import { useRouter } from 'next/navigation';
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
};

type FeatureItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

type ResourceItem = {
  title: string;
  description?: string;
  href: string;
  icon: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────
const toolLinks: ToolItem[] = [
  { title: 'Subfinder',    href: '#', icon: '/icons/subfinder.webp'    },
  { title: 'Naabu',        href: '#', icon: '/icons/nabuu.webp'        },
  { title: 'Nmap',         href: '#', icon: '/icons/nmap.webp'         },
  { title: 'Nuclei',       href: '#', icon: '/icons/nuclei.webp'       },
  { title: 'URL Fuzzer',   href: '#', icon: '/icons/url.webp'    },
  { title: 'WPScan',       href: '#', icon: '/icons/wpscan.webp'       },
  { title: 'SQLi',         href: '#', icon: '/icons/sqli.webp'         },
  { title: 'XSS Strike',   href: '#', icon: '/icons/xss.webp'    },
  { title: 'Kiterunner',   href: '#', icon: '/icons/kiterunner.webp'   },
  { title: 'Httpx',        href: '#', icon: '/icons/httpx.webp'        },
  { title: 'Katana',       href: '#', icon: '/icons/katana.webp'       },
  { title: 'Gobuster',       href: '#', icon: '/icons/gobuster.webp'       },
  { title: 'Amass',        href: '#', icon: '/icons/amass.webp'        },
  { title: 'Assetfinder',  href: '#', icon: '/icons/assetfinder.webp'  },
];

const featureLinks: FeatureItem[] = [
  { title: 'Integration CI/CD', description: 'Seamlessly connect with your development pipelines',   href: '/feature/cicd', icon: '/icons/feature-cicd.webp'       },
  { title: 'Ai Pentest',        description: 'Accelerate testing with intelligent automation',        href: '/feature/ai', icon: '/icons/feature-aipentest.webp'  },
  { title: 'CLI Access',        description: 'Execute tools remotely via terminal',                   href: '/feature/cli', icon: '/icons/feature-cli.webp'        },
  { title: 'Automation Tools',  description: 'Run tools instantly from the web UI',                   href: '/feature/webui', icon: '/icons/feature-automation.webp' },
];

const resourceDocLinks: ResourceItem[] = [
  { title: 'CLI Documents',   description: 'Guides for using tools via command line',        href: '/resource/cli',   icon: '/icons/res-cli.webp'   },
  { title: 'API Documents',   description: 'Accelerate testing with intelligent automation', href: '/resource/api',   icon: '/icons/res-api.webp'   },
  { title: 'Tools Documents', description: 'Instructions for using security tools',          href: '/resource/tool',  icon: '/icons/res-tools.webp' },
  { title: 'CI/CD Documents', description: 'Setup guides for pipeline integration',          href: '/resource/ci-cd', icon: '/icons/res-cicd.webp'  },
];

const resourceMiscLinks: ResourceItem[] = [
  { title: 'About Us',    href: '/about-us', icon: '/icons/about_us_icon.webp'   },
  { title: 'Contact Us',  href: '/contact-us',          icon: '/icons/contact_us_icon.webp' },
  { title: 'FAQ',         href: '/help-center',          icon: '/icons/faq.webp'     },
];

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-14 h-7" />;
  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn(
        'relative inline-flex items-center w-14 h-7 rounded-full border-2 transition-colors duration-300 cursor-pointer shrink-0',
        isDark
          ? 'bg-gray-700 border-gray-600'
          : 'bg-gray-200 border-gray-300',
      )}
    >
      {/* Sun icon — left */}
      <span className="absolute left-1 flex items-center justify-center w-5 h-5">
        <SunIcon className={cn('size-3.5 transition-opacity', isDark ? 'opacity-40' : 'opacity-100 text-amber-500')} />
      </span>
      {/* Moon icon — right */}
      <span className="absolute right-1 flex items-center justify-center w-5 h-5">
        <MoonIcon className={cn('size-3.5 transition-opacity', isDark ? 'opacity-100 text-blue-300' : 'opacity-40')} />
      </span>
      {/* Thumb */}
      <span
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-300',
          isDark ? 'translate-x-7 bg-blue-400' : 'translate-x-0.5 bg-amber-400',
        )}
      />
    </button>
  );
}

// ── Language Toggle ───────────────────────────────────────────────────────────
type Lang = 'en' | 'kh';

function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const currentLocale = useLocale();
  const khmerLabel = '\u1781\u17d2\u1798\u17c2\u179a';
  const nextLocale: Lang = currentLocale === 'en' ? 'kh' : 'en';
  const currentLabel = currentLocale === 'en' ? 'EN' : 'KH';
  const nextLabel = currentLocale === 'en' ? khmerLabel : 'EN';

  React.useEffect(() => setMounted(true), []);

  const handleLocaleChange = () => {
    startTransition(() => {
      // eslint-disable-next-line react-hooks/immutability
      window.document.cookie = `locale=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
      router.refresh();
    });
  };

  const options: { value: Lang; label?: string; flagSrc: string }[] = [
    { value: 'en', flagSrc: '/flags/en.png' },
    { value: 'kh', flagSrc: '/flags/kh.png' },
  ];

  if (!mounted) return <div className="w-14 h-7" />;

  const current = options.find(o => o.value === currentLocale) || options[0];

  return (
    <button
      type="button"
      onClick={handleLocaleChange}
      disabled={isPending}
      aria-label={`Switch language to ${nextLocale === 'kh' ? 'Khmer' : 'English'}`}
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-2.5 text-zinc-900 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
    >
      <Image
        src={current.flagSrc}
        alt={current.value}
        width={18}
        height={12}
        className="rounded-[2px] object-cover"
      />
      <span className="text-xs font-semibold tracking-[0.14em]">
        {currentLabel}
      </span>
      <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="text-xs">⇄</span>
        {isPending ? '...' : nextLabel}
      </span>
    </button>
  );
}

// ── Tool List Item (image icon, 2-col grid) ───────────────────────────────────
function ToolItem({ title, href, icon }: ToolItem) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 shadow-sm">
        <Image
          src={icon}
          alt={title}
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {title}
      </span>
    </Link>
  );
}

// ── Feature List Item (image icon + description) ──────────────────────────────
function FeatureItem({ title, description, href, icon }: FeatureItem) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 shadow-sm">
        <Image
          src={icon}
          alt={title}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {title} <span className="text-muted-foreground font-normal">:</span>
        </p>
        <p className="text-xs text-muted-foreground leading-snug">{description}</p>
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
  asMenuLink = false,
}: ResourceItem & { asMenuLink?: boolean }) {
  const content = (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="shrink-0 w-9 h-9 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden shadow-sm">
        <Image
          src={icon}
          alt={title}
          width={24}
          height={24}
          style={{ width: 'auto', height: 'auto' }}
          className="object-contain"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {title} <span className="text-muted-foreground font-normal">:</span>
        </p>
        {description && (
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
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
  asMenuLink = false,
}: ResourceItem & { asMenuLink?: boolean }) {
  const content = (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2 py-2  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="shrink-0 w-8 h-8 rounded-md border border-border bg-background flex items-center justify-center overflow-hidden shadow-sm">
        <Image
          src={icon}
          alt={title}
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
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
        'bg-background/95 [@supports(backdrop-filter:blur(0))]:bg-background/60',
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
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
        'bg-background/95 [@supports(backdrop-filter:blur(0))]:bg-background/60': scrolled,
      })}
    >
      <nav className="mx-auto z-50 flex h-14 w-full max-w-7xl items-center justify-between px-4">

        {/* Left: Logo  */}
        <div >
          <Logo />
        </div>

                {/* Center:  Nav */}
        <div >
       
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>

              {/* ── Tools ── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary text-foreground font-semibold">
                <Link href="/tools">  {t('tools')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background">
                  <div className="w-120 rounded-xl border border-border bg-popover shadow-xl p-3">
                    <ul className="grid grid-cols-2 gap-0.5">
                      {toolLinks.map((item, i) => (
                        <li key={i}>
                          <ToolItem {...item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ── Features ── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=open]:bg-transparent data-[state=open]:text-primary text-foreground font-semibold">
                <Link href="/feature">  {t('features')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background">
                  <div className="w-120 rounded-xl border border-border bg-popover shadow-xl p-3">
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
                  <Link href="/resource">  {t('resources')}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background">
                  <div className="w-120 rounded-xl border border-border bg-popover shadow-xl p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Left: doc links */}
                      <ul className="space-y-0.5 border-r border-border pr-2">
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

          {/* Language toggle */}
          <LanguageToggle />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Login / Register */}
          <Link href="/register"><button className="px-4 py-1.5 rounded-md text-sm font-semibold text-primary  bg-transparent cursor-pointer hover:bg-primary/10 transition-colors">
            {t('loginRegister')}
          </button></Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            className="flex items-center justify-center size-9 rounded-md border border-border bg-transparent cursor-pointer"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</p>
              <p className="text-sm text-foreground">Language and theme</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
          <div className="grid grid-cols-2 gap-0.5">
            {toolLinks.map((link, i) => (
              <ToolItem key={i} {...link} />
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">Features</p>
          <div className="grid grid-cols-1 gap-1">
            {featureLinks.map((link, i) => (
              <FeatureItem key={i} {...link} />
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">Resources</p>
          <div className="grid grid-cols-1 gap-0.5">
            {resourceDocLinks.map((link, i) => (
              <ResourceDocItem key={i} {...link} />
            ))}
            {resourceMiscLinks.map((link, i) => (
              <ResourceMiscItem key={i} {...link} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <button className="w-full py-2 rounded-md border border-primary text-primary text-sm font-semibold bg-transparent cursor-pointer hover:bg-primary/10 transition-colors">
            {t('loginRegister')}
          </button>
        </div>
      </MobileMenu>
    </header>
  );
}
