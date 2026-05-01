"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  LoaderCircle,
  User,
  Mail,
  Lock,
  Camera,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";

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

function getDisplayName(aliasName: string, username: string): string {
  return aliasName.trim() || username;
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export default function ProfilePage() {
  const { data, isLoading, isError } = useGetAuthMeQuery();
  const user = data?.user;
  const displayName = user ? getDisplayName(user.alias_name, user.username) : "";

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setFormData((current) => ({
      ...current,
      name: displayName,
      email: user?.email ?? "",
    }));
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
            {isLoading ? "Loading your account details..." : "Manage your account settings"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => (isEditing ? handleSave() : handleEdit())}
          className={`flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold rounded-xl ${
            isEditing
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-teal-500 hover:bg-teal-600 text-white"
          }`}
        >
          {isEditing ? (
            <>
              <CheckCircle size={18} />
              Save Changes
            </>
          ) : (
            <>
              <User size={18} />
              Edit Profile
            </>
          )}
        </motion.button>
      </div>

      {isError ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} />
          Unable to load your profile information right now.
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 flex items-start justify-between">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-linear-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user ? getInitials(displayName) : <LoaderCircle className="animate-spin" size={28} />}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user ? displayName : "Loading..."}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email ?? " "}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Member since</span>
                <span className="text-gray-900 dark:text-white">
                  {user ? formatDate(user.created_at) : "Loading..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Username</span>
                <span className="text-gray-900 dark:text-white">{user?.username ?? "Loading..."}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last updated</span>
                <span className="text-gray-900 dark:text-white">
                  {user ? formatDate(user.last_modified) : "Loading..."}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
              <div className="py-1">
                <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                  <User size={16} />
                  Edit Profile
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                  <Mail size={16} />
                  Change Email
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left">
                  <Lock size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={isEditing ? formData.name : displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={isEditing ? formData.email : user?.email ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-red-200 dark:border-red-900">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
