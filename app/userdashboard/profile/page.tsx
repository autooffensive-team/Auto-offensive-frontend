"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  LoaderCircle,
  User,
  Mail,
  Lock,
  CheckCircle,
  Shield,
  Calendar,
  Clock,
  AtSign,
} from "lucide-react";
import { useState } from "react";

import { UploadProfile } from "@/components/ui/upload-profile";
import {
  useGetAuthMeQuery,
  useUpdateMyUserMutation,
} from "@/lib/redux/services/auth/auth-api";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeAliasName(aliasName?: string): string {
  const trimmedAlias = aliasName?.trim() ?? "";
  if (!trimmedAlias || trimmedAlias.toLowerCase() === "string") {
    return "";
  }
  return trimmedAlias;
}

function getDisplayName(aliasName?: string, username?: string): string {
  return normalizeAliasName(aliasName) || username?.trim() || "User";
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useGetAuthMeQuery();
  const [updateMyUser, { isLoading: isSaving }] = useUpdateMyUserMutation();
  const user = data?.user;
  const displayName = user ? getDisplayName(user.alias_name, user.username) : "";

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [formData, setFormData] = useState({
    aliasName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (!user || isSaving) {
      return;
    }

    const nextAliasName = formData.aliasName.trim() || user.username.trim();

    try {
      setSaveError("");
      await updateMyUser({ alias_name: nextAliasName }).unwrap();
      setSaveSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch {
      setSaveSuccess("");
      setSaveError("Unable to update your profile right now.");
    }
  };

  const handleEdit = () => {
    setSaveError("");
    setSaveSuccess("");
    setFormData((current) => ({
      ...current,
      aliasName: normalizeAliasName(user?.alias_name) || (user?.username ?? ""),
      email: user?.email ?? "",
    }));
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Banner */}
      <div className="relative h-60 overflow-hidden bg-[#F7F5F0] dark:bg-[#111113]">
        {/* Gradient orbs — same vibe as ai-banner */}
        <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[#01509e] opacity-90 blur-3xl dark:opacity-40" />
        <div className="pointer-events-none absolute -top-10 right-10 h-64 w-64 rounded-full bg-[#00d0b2] opacity-50 blur-3xl dark:opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-80 rounded-full bg-[#0194c7] opacity-70 blur-3xl dark:opacity-30" />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-48 w-56 rounded-full bg-[#00d0b2] opacity-20 blur-3xl dark:opacity-10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Error Banner */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={16} />
            Unable to load your profile information right now.
          </motion.div>
        )}

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={16} />
            {saveError}
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
          >
            <CheckCircle size={16} />
            {saveSuccess}
          </motion.div>
        )}

        {/* Profile Header Row */}
        <div className="relative -mt-14 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Avatar + Name */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="ring-2 ring-primary rounded-2xl overflow-hidden">
              {user ? (
                <UploadProfile
                  compact
                  currentImage={user.avatar_profile}
                  displayName={displayName}
                  onUploaded={() => { void refetch(); }}
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                  <LoaderCircle className="animate-spin text-white" size={28} />
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {user ? displayName : (
                  <span className="inline-block h-7 w-36 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.email ?? (
                  <span className="inline-block h-4 w-48 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                )}
              </p>
            </div>
          </div>

          {/* Edit / Save button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (isEditing ? handleSave() : handleEdit())}
            disabled={!user || isSaving}
            className={`self-end sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors ${
              isEditing
                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200 dark:shadow-green-900/40"
                : "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200 dark:shadow-teal-900/40"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isSaving ? (
              <><LoaderCircle size={16} className="animate-spin" /> Saving...</>
            ) : isEditing ? (
              <><CheckCircle size={16} /> Save Changes</>
            ) : (
              <><User size={16} /> Edit Profile</>
            )}
          </motion.button>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5 pb-10">

          {/* ── Left: Stats card ── */}
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="lg:col-span-1 space-y-5"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              {/* Teal top accent */}
              <div  />
              <div className="p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Account Details
                </p>

                <StatRow
                  icon={<AtSign size={15} />}
                  label="Username"
                  value={user?.username ?? "—"}
                  loading={isLoading}
                />
                <StatRow
                  icon={<Calendar size={15} />}
                  label="Member since"
                  value={user ? formatDate(user.created_at) : "—"}
                  loading={isLoading}
                />
                <StatRow
                  icon={<Clock size={15} />}
                  label="Last updated"
                  value={user ? formatDate(user.last_modified) : "—"}
                  loading={isLoading}
                />
              </div>
            </div>

            {/* Security badge */}
            <div className="bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">Secure Account</span>
              </div>
              <p className="text-xs text-teal-600/80 dark:text-teal-400/80 leading-relaxed">
                Your account is protected. Keep your password strong and update it regularly.
              </p>
            </div>
          </motion.div>

          {/* ── Right: Forms ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Account Information */}
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
                  <User size={14} className="text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Account Information</h3>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <FieldWrapper label="Display Name" icon={<User size={15} />}>
                  <input
                    type="text"
                    value={isEditing ? formData.aliasName : displayName}
                    onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                    disabled={!isEditing}
                    className={fieldClass(isEditing)}
                    placeholder="How your name should appear"
                  />
                </FieldWrapper>
                <FieldWrapper label="Email Address" icon={<Mail size={15} />}>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled
                    className={fieldClass(false)}
                    placeholder="your@email.com"
                  />
                </FieldWrapper>
              </div>
              <div className="px-6 pb-6">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If the backend sends the placeholder value <code>string</code>, this page now falls back to your username until you save a real display name.
                </p>
              </div>
            </motion.div>

            {/* Change Password */}
            <motion.div
              custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
                  <Lock size={14} className="text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
              </div>
              <div className="p-6 space-y-4">
                <FieldWrapper label="Current Password" icon={<Lock size={15} />}>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    disabled
                    className={fieldClass(false)}
                    placeholder="••••••••"
                  />
                </FieldWrapper>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrapper label="New Password" icon={<Lock size={15} />}>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      disabled
                      className={fieldClass(false)}
                      placeholder="••••••••"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Confirm Password" icon={<Lock size={15} />}>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled
                      className={fieldClass(false)}
                      placeholder="••••••••"
                    />
                  </FieldWrapper>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password update is not connected to a backend endpoint on this page yet.
                </p>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="show"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/40 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
                  <AlertCircle size={14} className="text-red-500" />
                </div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Once you delete your account, there is no going back. All data will be permanently removed.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Lock size={14} />
                  Delete Account
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function fieldClass(editing: boolean) {
  return [
    "w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none",
    editing
      ? "border-teal-300 dark:border-teal-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-70",
  ].join(" ");
}

function FieldWrapper({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
        {icon}
        {label}
      </div>
      {loading ? (
        <span className="h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : (
        <span className="text-xs font-medium text-gray-900 dark:text-white">{value}</span>
      )}
    </div>
  );
}
