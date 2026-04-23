"use client";

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
  MoreVertical,

} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    scanComplete: true,
    vulnerabilityFound: true,
    weeklyReport: false,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
          Configure your preferences
        </p>
      </div>

        <div className="space-y-6 max-w-3xl">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6 relative">
              <Bell size={24} className="text-gray-500" />
              <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <div className="absolute right-0">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
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
                  <Shield size={16} />
                  Delete Account
                </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({ ...notifications, email: !notifications.email })
                  }
                  className={`w-12 h-6 rounded-full transition ${
                    notifications.email ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition ${
                      notifications.email ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Scan Complete
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify when scan completes
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      scanComplete: !notifications.scanComplete,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition ${
                    notifications.scanComplete ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition ${
                      notifications.scanComplete ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Vulnerability Found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify when vulnerabilities are found
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      vulnerabilityFound: !notifications.vulnerabilityFound,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition ${
                    notifications.vulnerabilityFound
                      ? "bg-teal-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition ${
                      notifications.vulnerabilityFound
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Weekly Report
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive weekly security summary
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      weeklyReport: !notifications.weeklyReport,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition ${
                    notifications.weeklyReport
                      ? "bg-teal-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition ${
                      notifications.weeklyReport
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6 relative">
              <Shield size={24} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security
              </h2>
              <div className="absolute right-0">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                  <div className="py-1">
                    <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                      <Key size={16} />
                      API Keys
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                      <Shield size={16} />
                      Two-Factor Auth
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                    theme === "light"
                      ? "border-teal-500 bg-teal-500/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun size={20} className={theme === "light" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                    <span className="text-gray-900 dark:text-white">Light</span>
                  </div>
                  {theme === "light" && (
                    <div className="w-5 h-5 rounded-full bg-teal-500" />
                  )}
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                    theme === "dark"
                      ? "border-teal-500 bg-teal-500/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon size={20} className={theme === "dark" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                    <span className="text-gray-900 dark:text-white">Dark</span>
                  </div>
                  {theme === "dark" && (
                    <div className="w-5 h-5 rounded-full bg-teal-500" />
                  )}
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                    theme === "system"
                      ? "border-teal-500 bg-teal-500/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Monitor size={20} className={theme === "system" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                    <span className="text-gray-900 dark:text-white">System</span>
                  </div>
                  {theme === "system" && (
                    <div className="w-5 h-5 rounded-full bg-teal-500" />
                  )}
                </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition">
                <div className="flex items-center gap-3">
                  <Key size={20} className="text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    API Keys
                  </span>
                </div>
                <span className="text-sm text-gray-500">Manage</span>
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6 relative">
              <Palette size={24} className="text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
              <div className="absolute right-0">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                  <div className="py-1">
                    <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                      <Moon size={16} />
                      Light
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                      <Sun size={16} />
                      Dark
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left">
                      <Monitor size={16} />
                      System
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setTheme("light")}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                  theme === "light"
                    ? "border-teal-500 bg-teal-500/5"
                    : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun size={20} className={theme === "light" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                  <span className="text-gray-900 dark:text-white">Light</span>
                </div>
                {theme === "light" && (
                  <div className="w-5 h-5 rounded-full bg-teal-500" />
                )}
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                  theme === "dark"
                    ? "border-teal-500 bg-teal-500/5"
                    : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon size={20} className={theme === "dark" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                  <span className="text-gray-900 dark:text-white">Dark</span>
                </div>
                {theme === "dark" && (
                  <div className="w-5 h-5 rounded-full bg-teal-500" />
                )}
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                  theme === "system"
                    ? "border-teal-500 bg-teal-500/5"
                    : "border-gray-200 dark:border-gray-800 hover:border-teal-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor size={20} className={theme === "system" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"} />
                  <span className="text-gray-900 dark:text-white">System</span>
                </div>
                {theme === "system" && (
                  <div className="w-5 h-5 rounded-full bg-teal-500" />
                )}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
