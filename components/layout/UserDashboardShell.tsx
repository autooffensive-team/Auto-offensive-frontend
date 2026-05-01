"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  LayoutDashboard,
  Globe,
  FolderGit2,
  Scan,
  Code,
  ShieldAlert,
  FileText,
  User,
  Settings,
  Search,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { useMounted } from "@/hooks/use-mounted";
import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";
import GoToTop from "@/components/ui/go-to-top";

const mainNavItems = [
  { label: "Overview", path: "/userdashboard", icon: LayoutDashboard },
  { label: "Assets", path: "/userdashboard/assets", icon: Globe },
  { label: "Projects", path: "/userdashboard/projects", icon: FolderGit2 },
  { label: "Scans", path: "/userdashboard/scan", icon: Scan },
  { label: "Code Scan", path: "/userdashboard/code-scanning", icon: Code },
  { label: "Findings", path: "/userdashboard/findings", icon: ShieldAlert },
  { label: "Reports", path: "/userdashboard/reports", icon: FileText },
];

const accountNavItems = [
  { label: "Profile", path: "/userdashboard/profile", icon: User },
  { label: "Settings", path: "/userdashboard/settings", icon: Settings },
  { label: "Support", path: "/userdashboard/support", icon: LifeBuoy },
];

const notifications = [
  {
    id: 1,
    title: "Critical issue triaged",
    message: "The SQL injection finding for api.example.com was escalated.",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 2,
    title: "Scan finished",
    message: "External perimeter scan completed with 18 findings.",
    time: "42 min ago",
    unread: true,
  },
  {
    id: 3,
    title: "Weekly report ready",
    message: "Your executive summary for this week is available.",
    time: "Today",
    unread: false,
  },
];

function isItemActive(pathname: string, path: string) {
  if (path === "/userdashboard") {
    return pathname === path;
  }
  return pathname.startsWith(path);
}

export default function UserDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useGetAuthMeQuery();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pageLabel = useMemo(() => {
    const allItems = [...mainNavItems, ...accountNavItems];
    const match = allItems.find((item) => isItemActive(pathname, item.path));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  const displayName = data?.user.alias_name.trim() || data?.user.username || "User";
  const email = data?.user.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const closeOverlays = () => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    closeOverlays();
    window.location.assign("/logout");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-slate-700 transition hover:bg-black/10 md:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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

        <div className="px-4 py-4">
          <Link
            href="/userdashboard/scan"
            onClick={closeOverlays}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-105"
          >
            <Scan size={18} />
            <span className={collapsed ? "md:hidden" : ""}>New Scan</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Workspace
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
                          ? "Executive summary"
                          : item.label === "Assets"
                          ? "Surface inventory"
                          : item.label === "Projects"
                          ? "Engagement tracking"
                          : item.label === "Scans"
                          ? "Run assessments"
                          : item.label === "Code Scan"
                          ? "Repository analysis"
                          : item.label === "Findings"
                          ? "Risk triage"
                          : "Evidence exports"}
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                  User Dashboard
                </p>
                <h1 className="truncate text-xl font-semibold text-slate-950 dark:text-white">
                  {pageLabel}
                </h1>
              </div>
            </div>

            <div className="hidden flex-1 justify-center lg:flex">
              <label className="flex w-full max-w-xl items-center gap-3 rounded-full border border-black/8 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scans, assets, reports, or findings"
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/resource"
                onClick={closeOverlays}
                className="hidden items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white md:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <BookOpen size={16} />
                Docs
              </Link>

              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((value) => !value);
                    setProfileOpen(false);
                  }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/80 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  aria-label="Open notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500" />
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-14 w-88 overflow-hidden rounded-3xl border border-black/8 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
                    >
                      <div className="border-b border-black/6 px-5 py-4 dark:border-white/10">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          Notification Center
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Live updates from your latest assessments
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 border-b border-black/5 px-5 py-4 last:border-b-0 dark:border-white/8"
                          >
                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                item.unread ? "bg-teal-400" : "bg-slate-300"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {item.message}
                              </p>
                              <p className="mt-2 text-xs text-slate-400">
                                {item.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((value) => !value);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-full border border-black/8 bg-white/80 px-2 py-2 pr-4 text-left shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-teal-400 via-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
                    {initials}
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
                      className="absolute right-0 top-14 w-64 overflow-hidden rounded-3xl border border-black/8 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
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
                          onClick={handleLogout}
                          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
