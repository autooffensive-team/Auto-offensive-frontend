"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Globe,
  FolderGit2,
  Radar,
  Scan,
  Code,
  ShieldAlert,
  FileText,
  User,
  Settings,
  LogOut,
  Lock,
  LogIn,
  UserPlus,
  Moon,
  Sun,
  Menu,
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { useMounted } from "@/hooks/use-mounted";
import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";
import GoToTop from "@/components/ui/go-to-top";
import { MobileScreenWarning } from "@/components/shared/MobileScreenWarning";
import { GuestLockModal } from "@/components/guest/GuestLockModal";
import { GuestScanLimitBar } from "@/components/guest/GuestScanLimitBar";
import type { AuthMeResponse } from "@/types/auth";

/**
 * Resolve an avatar path to a usable image URL.
 * Handles absolute URLs, data URIs, and relative backend paths.
 */
function resolveAvatarUrl(value?: string | null): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("/")
  ) {
    return normalized;
  }
  return `/api/backend/${normalized.replace(/^\/+/, "")}`;
}

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
  guestAllowed: boolean;
};

const mainNavItems: NavItem[] = [
  { label: "Overview", path: "/userdashboard", icon: LayoutDashboard, description: "Executive summary", guestAllowed: true },
  { label: "Assets", path: "/userdashboard/assets", icon: Globe, description: "Surface inventory", guestAllowed: false },
  { label: "Projects", path: "/userdashboard/projects", icon: FolderGit2, description: "Engagement tracking", guestAllowed: false },
  { label: "Tools Scan", path: "/userdashboard/scan", icon: Radar, description: "Run assessments", guestAllowed: true },
  { label: "Code Scan", path: "/userdashboard/code-scanning", icon: Code, description: "Repository analysis", guestAllowed: false },
  { label: "Findings", path: "/userdashboard/findings", icon: ShieldAlert, description: "Risk triage", guestAllowed: false },
  { label: "Reports", path: "/userdashboard/reports", icon: FileText, description: "Evidence exports", guestAllowed: false },
];

const accountNavItems: NavItem[] = [
  { label: "Profile", path: "/userdashboard/profile", icon: User, description: "User profile", guestAllowed: false },
  { label: "Settings", path: "/userdashboard/settings", icon: Settings, description: "Preferences", guestAllowed: false },
];

function isItemActive(pathname: string, path: string) {
  if (path === "/userdashboard") {
    return pathname === path;
  }
  return pathname.startsWith(path);
}

function getDashboardDisplayName(
  aliasName?: string,
  username?: string,
): string {
  const trimmedAlias = aliasName?.trim() ?? "";
  if (!trimmedAlias || trimmedAlias.toLowerCase() === "string") {
    return username?.trim() || "User";
  }
  return trimmedAlias;
}

export default function UserDashboardShell({
  initialAuthMe,
  isGuest = false,
  children,
}: {
  initialAuthMe?: AuthMeResponse | null;
  isGuest?: boolean;
  children: React.ReactNode;
}) {
  // Only call useGetAuthMeQuery for authenticated users — guests don't have tokens
  const { data } = useGetAuthMeQuery(undefined, { skip: isGuest });
  const authMe = isGuest ? null : (data ?? initialAuthMe ?? null);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const profileRef = useRef<HTMLDivElement>(null);

  const pageLabel = useMemo(() => {
    const allItems = [...mainNavItems, ...accountNavItems];
    const match = allItems.find((item) => isItemActive(pathname, item.path));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  const displayName = isGuest
    ? "Guest"
    : getDashboardDisplayName(authMe?.user.alias_name, authMe?.user.username);
  const email = isGuest ? "" : (authMe?.user.email ?? "");
  const avatarUrl = isGuest ? null : resolveAvatarUrl(authMe?.user.avatar_profile);
  const initials = isGuest
    ? "G"
    : (displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U");

  const closeOverlays = () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    closeOverlays();
    setLogoutConfirmOpen(false);
    window.location.replace("/logout");
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLockedClick = (label: string) => {
    setLockedFeatureName(label);
    setLockModalOpen(true);
    closeOverlays();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setLockModalOpen(false);
        setLogoutConfirmOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const desktopSidebarWidth = collapsed ? "md:w-[72px]" : "md:w-72";
  const desktopContentOffset = collapsed ? "md:pl-[72px]" : "md:pl-72";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-950 dark:bg-black dark:text-white">
      <MobileScreenWarning />
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-black/10 bg-white text-slate-950 transition-all duration-300 md:translate-x-0 dark:border-white/10 dark:bg-slate-950 dark:text-white ${desktopSidebarWidth} ${mobileMenuOpen ? "translate-x-0" : ""
          }`}
      >
        <div className={`relative border-b border-black/10 px-4 py-5 dark:border-white/10 ${collapsed ? "md:px-2 md:py-4" : ""}`}>
          <div className={`flex items-center ${collapsed ? "md:flex-col md:gap-2" : "justify-between"}`}>
            <Link
              href="/"
              onClick={closeOverlays}
              className="overflow-hidden transition-all"
            >
              <div className="flex items-center gap-3">
                {mounted && (
                  <>
                    {/* Full logo with name — shown when expanded */}
                    <Image
                      src={theme === "dark" ? "/Auto_Offensive_Dark-mode.png" : "/Auto_Offensive_Light-mode.png"}
                      alt="Auto Offensive Logo"
                      width={120}
                      height={120}
                      priority
                      className={`transition-all ${collapsed ? "md:hidden" : "block"}`}
                      style={{ width: "auto", height: "auto" }}
                    />
                    {/* Icon-only logo — shown when collapsed */}
                    <Image
                      src={theme === "dark" ? "/Auto-Offensive-dm.webp" : "/Auto-Offensive.webp"}
                      alt="Auto Offensive Logo"
                      width={36}
                      height={36}
                      className={`transition-all ${collapsed ? "hidden md:block" : "hidden"}`}
                      style={{ width: "36px", height: "36px" }}
                    />
                  </>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700 md:flex dark:text-slate-500 dark:hover:text-slate-200"
              aria-label="Toggle sidebar size"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

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

        <div className={`px-4 py-3 ${collapsed ? "md:px-1.5" : ""}`}>
          <Link
            href="/userdashboard/scan"
            onClick={closeOverlays}
            title={collapsed ? "New Scan" : undefined}
            className={`flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-105 ${collapsed ? "md:h-10 md:w-10 md:mx-auto md:rounded-lg md:px-0 md:py-0" : ""}`}
          >
            <Scan size={16} />
            <span className={collapsed ? "md:hidden" : ""}>New Scan</span>
          </Link>
        </div>

        <nav className={`flex-1 overflow-y-auto px-3 pb-4 ${collapsed ? "md:px-1.5" : ""}`}>
          <div className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 ${collapsed ? "md:hidden" : ""}`}>
            Workspace
          </div>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isItemActive(pathname, item.path);
              const isLocked = isGuest && !item.guestAllowed;

              // ─── Locked item for guest ─────────────────────────────
              if (isLocked) {
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => handleLockedClick(item.label)}
                      title={collapsed ? `${item.label} (Locked)` : undefined}
                      className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""} text-slate-400 opacity-60 hover:opacity-80 dark:text-slate-500`}
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500">
                        <item.icon size={16} strokeWidth={1.8} />
                        <Lock size={8} className="absolute -right-1 -top-1 text-amber-500" />
                      </div>
                      <div className={collapsed ? "md:hidden" : ""}>
                        <p className="font-medium text-left">{item.label}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-600 text-left">
                          {item.description}
                        </p>
                      </div>
                      {!collapsed && (
                        <Lock size={12} className="ml-auto text-amber-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              }

              // ─── Normal nav item ───────────────────────────────────
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={closeOverlays}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""} ${active
                        ? "bg-black/10 text-slate-950 shadow-inner shadow-black/5 dark:bg-white/10 dark:text-white dark:shadow-white/5"
                        : "text-slate-500 hover:bg-black/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-white"
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${active
                          ? "border-primary text-primary dark:text-primary"
                          : "border-slate-200 text-slate-400 group-hover:border-primary group-hover:text-primary dark:border-white/10 dark:text-slate-400 dark:group-hover:border-primary dark:group-hover:text-primary"
                        }`}
                    >
                      <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    </div>
                    <div className={collapsed ? "md:hidden" : ""}>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={`mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 ${collapsed ? "md:hidden" : ""}`}>
            Account
          </div>
          <ul className="space-y-1">
            {accountNavItems.map((item) => {
              const active = isItemActive(pathname, item.path);
              const isLocked = isGuest && !item.guestAllowed;

              if (isLocked) {
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => handleLockedClick(item.label)}
                      title={collapsed ? `${item.label} (Locked)` : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""} text-slate-400 opacity-60 hover:opacity-80 dark:text-slate-500`}
                    >
                      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500">
                        <item.icon size={16} strokeWidth={1.8} />
                        <Lock size={8} className="absolute -right-1 -top-1 text-amber-500" />
                      </div>
                      <span className={`font-medium ${collapsed ? "md:hidden" : ""}`}>
                        {item.label}
                      </span>
                      {!collapsed && (
                        <Lock size={12} className="ml-auto text-amber-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={closeOverlays}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""} ${active
                        ? "bg-black/10 text-slate-950 dark:bg-white/10 dark:text-white"
                        : "text-slate-500 hover:bg-black/6 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-white"
                      }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition group-hover:border-primary group-hover:text-primary dark:border-white/10 dark:text-slate-400 dark:group-hover:border-primary dark:group-hover:text-primary">
                      <item.icon size={16} strokeWidth={1.8} />
                    </div>
                    <span className={`font-medium ${collapsed ? "md:hidden" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Logout button in sidebar */}
            {!isGuest && (
              <li>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  title={collapsed ? "Logout" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""} text-rose-600 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-70 dark:text-rose-400 dark:hover:bg-rose-500/10`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-500 dark:border-rose-800 dark:text-rose-400">
                    <LogOut size={16} strokeWidth={1.8} />
                  </div>
                  <span className={`font-medium ${collapsed ? "md:hidden" : ""}`}>
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className={`border-t border-black/10 p-3 dark:border-white/10 ${collapsed ? "md:p-1.5" : ""}`}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-slate-600 transition hover:bg-black/6 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white ${collapsed ? "md:justify-center md:px-0 md:py-2.5" : ""}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
              {mounted && theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </div>
            <span className={collapsed ? "md:hidden" : ""}>
              {mounted && theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {/* Guest: Login/Register buttons instead of profile */}
          {isGuest && (
            <div className={`mt-2 flex gap-2 ${collapsed ? "md:flex-col md:items-center" : ""}`}>
              <Link
                href="/login"
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${collapsed ? "md:h-10 md:w-10 md:flex-none md:rounded-lg md:px-0" : ""}`}
              >
                <LogIn size={14} />
                <span className={collapsed ? "md:hidden" : ""}>Login</span>
              </Link>
              <Link
                href="/register"
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-105 ${collapsed ? "md:h-10 md:w-10 md:flex-none md:rounded-lg md:px-0" : ""}`}
              >
                <UserPlus size={14} />
                <span className={collapsed ? "md:hidden" : ""}>Register</span>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${desktopContentOffset}`}>
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 shadow-none">
          <div className="mx-auto flex max-w-400 items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-5 md:py-3.5">
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
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isGuest ? "text-amber-600 dark:text-amber-400" : "text-teal-600 dark:text-teal-300"}`}>
                  {isGuest ? "Guest Dashboard" : "User Dashboard"}
                </p>
                <h1 className="truncate text-xl font-semibold text-slate-950 dark:text-white">
                  {pageLabel}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/resource"
                onClick={closeOverlays}
                className="hidden items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white md:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <BookOpen size={16} />
                Docs
              </Link>

              {/* ─── Guest header: badge + login ─── */}
              {isGuest ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                    Guest Mode
                  </span>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-black/8 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <LogIn size={14} />
                    Login
                  </Link>
                </div>
              ) : (
                /* ─── Authenticated header: profile dropdown ─── */
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen((value) => !value);
                    }}
                    className="flex items-center gap-3 rounded-full border border-black/8 bg-white/80 px-2 py-2 pr-4 text-left transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-slate-950">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${displayName} avatar`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {email || "Authenticated user"}
                      </p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-14 w-64 overflow-hidden rounded-3xl border border-black/8 bg-white dark:border-white/10 dark:bg-slate-900"
                      >
                        <div className="border-b border-black/6 px-5 py-4 dark:border-white/10">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {displayName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {email}
                          </p>
                        </div>
                        <div className="p-2">
                          {accountNavItems.slice(0, 2).map((item) => (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={closeOverlays}
                              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                            >
                              <item.icon size={16} />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={handleLogoutClick}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-rose-600 transition hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-70 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <LogOut size={16} />
                            {isLoggingOut ? "Signing out..." : "Logout"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={`mx-auto max-w-400 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-5 ${isGuest ? "pb-20" : ""}`}>
          {children}
        </main>
      </div>

      {/* Guest scan limit bar at bottom */}
      {isGuest && <GuestScanLimitBar />}

      {/* Lock modal for guest users */}
      {isGuest && (
        <GuestLockModal
          isOpen={lockModalOpen}
          onClose={() => setLockModalOpen(false)}
          featureName={lockedFeatureName}
        />
      )}

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutConfirmOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                  <LogOut className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Are you sure you want to logout?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  You will be signed out of your account and redirected to the homepage.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-70 dark:bg-rose-600 dark:hover:bg-rose-700"
                  >
                    {isLoggingOut ? "Signing out..." : "Yes, logout"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GoToTop />
    </div>
  );
}
