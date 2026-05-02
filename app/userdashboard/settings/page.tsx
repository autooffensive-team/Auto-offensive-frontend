"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Shield,
  Key,
  User,
  Mail,
  Palette,
  Monitor,
  Moon,
  Sun,
  LogOut,
  Copy,
  Check,
  LoaderCircle,
  AlertCircle,
  ChevronRight,
  Clock,
  BadgeCheck,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(username?: string): string {
  return (username ?? "").slice(0, 2).toUpperCase() || "U";
}

function getDisplayName(aliasName?: string, username?: string): string {
  const trimmedAlias = aliasName?.trim() ?? "";
  if (!trimmedAlias || trimmedAlias.toLowerCase() === "string") {
    return username?.trim() || "User";
  }
  return trimmedAlias;
}

// Roles to hide — these are Keycloak internals, not meaningful to show the user
const HIDDEN_ROLES = new Set([
  "DEFAULT-ROLES-AUTO-OFFENSIVE",
  "MANAGE-ACCOUNT",
  "MANAGE-ACCOUNT-LINKS",
  "VIEW-PROFILE",
]);

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 shrink-0 ${
        checked ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            <Check size={13} className="text-teal-500" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            <Copy size={13} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: "easeOut" }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-gray-900 dark:text-white">
          {label}
        </p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ─── Theme option button ──────────────────────────────────────────────────────

function ThemeOption({
  value,
  current,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  value: string;
  current?: string;
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
        active
          ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          active
            ? "bg-teal-100 dark:bg-teal-500/20"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        <Icon
          size={17}
          className={
            active
              ? "text-teal-600 dark:text-teal-400"
              : "text-gray-500 dark:text-gray-400"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[14px] font-semibold ${
            active
              ? "text-teal-700 dark:text-teal-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {label}
        </p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0"
          >
            <Check size={11} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Nav row (Security section items) ────────────────────────────────────────

function NavRow({
  icon: Icon,
  label,
  description,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all group text-left ${
        danger
          ? "border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/6"
          : "border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500/50 hover:bg-teal-50/40 dark:hover:bg-teal-500/4"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          danger
            ? "bg-red-50 dark:bg-red-500/10"
            : "bg-gray-100 dark:bg-gray-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20"
        }`}
      >
        <Icon
          size={15}
          className={
            danger
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
          }
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`text-[14px] font-medium ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-[12px] mt-0.5 ${
            danger
              ? "text-red-400/70 dark:text-red-500/60"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {description}
        </p>
      </div>
      <ChevronRight
        size={15}
        className={
          danger
            ? "text-red-400 shrink-0"
            : "text-gray-400 group-hover:text-teal-500 transition-colors shrink-0"
        }
      />
    </button>
  );
}

// ─── Profile skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-4 w-36 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-52 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // ── Auth/Me API ──
  const {
    data: meData,
    isLoading: meLoading,
    isError: meError,
    refetch: meRefetch,
    isFetching: meFetching,
  } = useGetAuthMeQuery();

  // ── Notification state (local — wire to API if backend supports it) ──
  const [notifications, setNotifications] = useState({
    email: true,
    scanComplete: true,
    vulnerabilityFound: true,
    weeklyReport: false,
  });

  function toggleNotif(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Derived user data ──
  const user = meData?.user ?? null;
  const visibleRoles = (meData?.roles ?? []).filter(
    (r) => !HIDDEN_ROLES.has(r)
  );
  const displayName = user
    ? getDisplayName(user.alias_name, user.username)
    : "";

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Layers size={13} className="text-teal-500 dark:text-teal-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Account
          </span>
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
          Settings
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and security
        </p>
      </motion.div>

      <div className="space-y-4 max-w-2xl">

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, ease: "easeOut" }}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
        >
          {/* Accent stripe */}
          <div className="h-1 w-full bg-linear-to-r from-teal-500 to-teal-400" />

          <div className="p-6">
            {meLoading ? (
              <ProfileSkeleton />
            ) : meError ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/6 px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-red-700 dark:text-red-400">
                  <AlertCircle size={14} />
                  Failed to load profile
                </div>
                <button
                  onClick={() => meRefetch()}
                  disabled={meFetching}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-500/30 px-3 py-1 text-[12px] font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                >
                  <RefreshCw
                    size={11}
                    className={meFetching ? "animate-spin" : ""}
                  />
                  Retry
                </button>
              </div>
            ) : user ? (
              <>
                <div className="flex items-start gap-4">
                  {/* Avatar initials */}
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrin
                  k-0 shadow-sm select-none">
                    <span className="text-white font-bold text-[20px]">
                      {getInitials(displayName)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + role badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                        {displayName}
                      </h3>
                      {visibleRoles.map((role) => (
                        <span
                          key={role}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 text-[10px] font-semibold uppercase tracking-wider"
                        >
                          <BadgeCheck size={9} />
                          {role}
                        </span>
                      ))}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Mail
                        size={12}
                        className="text-gray-400 dark:text-gray-500 shrink-0"
                      />
                      <span className="text-[13px] text-gray-500 dark:text-gray-400 truncate font-mono">
                        {user.email}
                      </span>
                      <CopyButton value={user.email} />
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                        <Clock size={11} />
                        Member since {formatDate(user.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                        #{user.user_id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile actions */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <button className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500 dark:text-gray-400" />
                      Edit Profile
                    </div>
                    <ChevronRight size={13} className="text-gray-400" />
                  </button>
                  <button className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-500 dark:text-gray-400" />
                      Change Email
                    </div>
                    <ChevronRight size={13} className="text-gray-400" />
                  </button>
                  <button className="col-span-2 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-500/20 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <LogOut size={14} />
                      Sign Out
                    </div>
                    <ChevronRight size={13} className="opacity-60" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* ── Appearance ── */}
        <Section title="Appearance" icon={Palette} delay={0.1}>
          <div className="space-y-2">
            <ThemeOption
              value="light"
              current={theme}
              icon={Sun}
              label="Light"
              description="Clean white interface"
              onClick={() => setTheme("light")}
            />
            <ThemeOption
              value="dark"
              current={theme}
              icon={Moon}
              label="Dark"
              description="Easy on the eyes at night"
              onClick={() => setTheme("dark")}
            />
            <ThemeOption
              value="system"
              current={theme}
              icon={Monitor}
              label="System"
              description="Follows your OS preference automatically"
              onClick={() => setTheme("system")}
            />
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications" icon={Bell} delay={0.15}>
          <NotifRow
            label="Email Notifications"
            description="Receive scan alerts and updates via email"
            checked={notifications.email}
            onChange={() => toggleNotif("email")}
          />
          <NotifRow
            label="Scan Complete"
            description="Notify when a repository scan finishes"
            checked={notifications.scanComplete}
            onChange={() => toggleNotif("scanComplete")}
          />
          <NotifRow
            label="Vulnerability Found"
            description="Alert immediately when vulnerabilities are detected"
            checked={notifications.vulnerabilityFound}
            onChange={() => toggleNotif("vulnerabilityFound")}
          />
          <NotifRow
            label="Weekly Report"
            description="Receive a weekly security summary digest"
            checked={notifications.weeklyReport}
            onChange={() => toggleNotif("weeklyReport")}
          />
        </Section>

        {/* ── Security ── */}
        <Section title="Security" icon={Shield} delay={0.2}>
          <div className="space-y-2">
            <NavRow
              icon={Key}
              label="API Keys"
              description="Manage your API access tokens"
            />
            <NavRow
              icon={Shield}
              label="Two-Factor Authentication"
              description="Add an extra layer of account security"
            />
          </div>

          {/* Danger zone */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-500 dark:text-red-400 mb-3">
              Danger Zone
            </p>
            <NavRow
              icon={Shield}
              label="Delete Account"
              description="Permanently remove your account and all data"
              danger
            />
          </div>
        </Section>

      </div>
    </div>
  );
}
