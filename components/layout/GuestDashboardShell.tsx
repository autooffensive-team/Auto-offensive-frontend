"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft,
  LifeBuoy,
  LayoutDashboard,
  Scan,
  Settings,
  User,
  Moon,
  Sun,
  Menu,
  Crown,
  ShieldAlert,
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { useMounted } from "@/hooks/use-mounted";
import GoToTop from "@/components/ui/go-to-top";

const mainNavItems = [
  { label: "Overview", path: "/guestdashboard", icon: LayoutDashboard },
  { label: "Live Scan", path: "/guestdashboard/live-scan", icon: Scan },
  { label: "Vulnerability", path: "/guestdashboard/vulnerability", icon: ShieldAlert },
];

const accountNavItems = [
  { label: "Settings", path: "/guestdashboard/settings", icon: Settings },
  { label: "Support", path: "/guestdashboard/support", icon: LifeBuoy },
];

function isItemActive(pathname: string, path: string) {
  if (path === "/guestdashboard") {
    return pathname === path;
  }
  return pathname.startsWith(path);
}

export default function GuestDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const pageLabel = useMemo(() => {
    const allItems = [...mainNavItems, ...accountNavItems];
    const match = allItems.find((item) => isItemActive(pathname, item.path));
    return match?.label ?? "Basic Scan";
  }, [pathname]);

  const closeOverlays = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const desktopSidebarWidth = collapsed ? "md:w-24" : "md:w-72";
  const desktopContentOffset = collapsed ? "md:pl-24" : "md:pl-72";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-950 dark:bg-black dark:text-white">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-black/10 bg-white text-slate-950 shadow-2xl shadow-slate-950/25 transition-transform duration-300 md:translate-x-0 dark:border-white/10 dark:bg-slate-950 dark:text-white ${desktopSidebarWidth} ${
          mobileMenuOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="border-b border-black/10 px-4 py-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              onClick={closeOverlays}
              className={`overflow-hidden transition-all ${
                collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {mounted && (
                  <Image
                    src={theme === "dark" ? "/Auto_Offensive_Dark-mode.png" : "/Auto_Offensive_Light-mode.png"}
                    alt="Auto Offensive Logo"
                    width={120}
                    height={120}
                  />
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-slate-700 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              aria-label="Close navigation"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Guest Mode Indicator */}
        <div className="border-b border-black/10 px-4 py-4 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-3 dark:bg-amber-500/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <User size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className={collapsed ? "md:hidden" : ""}>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Guest Mode
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Limited Access
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="px-4 py-4">
          <Link
            href="/register"
            onClick={closeOverlays}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
          >
            <Crown size={18} />
            <span className={collapsed ? "md:hidden" : ""}>Unlock Full Suite
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Basic Features
          </div>
          <ul className="space-y-1.5">
            {mainNavItems.map((item) => {
              const active = isItemActive(pathname, item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={closeOverlays}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-black/10 text-slate-950 shadow-inner shadow-black/5 dark:bg-white/10 dark:text-white dark:shadow-white/5"
                        : "text-slate-500 hover:bg-black/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                        active
                          ? "bg-linear-to-br from-teal-400/30 to-blue-400/30 text-teal-600 dark:text-teal-300"
                          : "bg-black/5 text-slate-400 group-hover:text-slate-600 dark:bg-white/5 dark:text-slate-400 dark:group-hover:text-slate-100"
                      }`}
                    >
                      <item.icon size={18} />
                    </div>
                    <div className={collapsed ? "md:hidden" : ""}>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {item.label === "Overview"
                          ? "Basic scanning only"
                          : item.label === "Live Scan"
                          ? "Run assessments"
                          : "Risk triage"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

           <div className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Account
          </div>
          <ul className="space-y-1.5">
            {accountNavItems.map((item) => {
              const active = isItemActive(pathname, item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={closeOverlays}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-black/10 text-slate-950 dark:bg-white/10 dark:text-white"
                        : "text-slate-500 hover:bg-black/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
                      <item.icon size={18} />
                    </div>
                    <span className={`font-medium ${collapsed ? "md:hidden" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-black/10 p-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-black/6 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
              {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <span className={collapsed ? "md:hidden" : ""}>
              {mounted && theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${desktopContentOffset}`}>
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 shadow-none">
          <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-900 shadow-sm md:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                  Guest Dashboard
                </p>
                <h1 className="truncate text-xl font-semibold text-slate-950 dark:text-white">
                  {pageLabel}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-400 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <GoToTop />
    </div>
  );
}