"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Activity,
  Shield,
  Settings,
  LifeBuoy,
  Plus,
  User,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", path: "/guestdashboard", icon: LayoutGrid },
    { label: "Live Scans", path: "/live-scans", icon: Activity },
    { label: "Vulnerabilities", path: "/vulnerabilities", icon: Shield },
  ];

  return (
    <aside
      className="w-64 h-[calc(100vh-64px)] sticky top-16 
      bg-white dark:bg-[#0f172a] 
      border-r border-gray-200 dark:border-gray-800 
      flex flex-col text-gray-700 dark:text-gray-300"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <User size={16} className="text-gray-500 dark:text-gray-400" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Guest Mode
            </p>
            <p className="text-xs text-gray-500 uppercase">Limited Access</p>
          </div>
        </div>
      </div>

      {/* Unlock */}
      <div className="px-4 py-4">
        <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 transition">
          Unlock Full Suite
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              onClick={() => router.push(item.path)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-gray-900 text-teal-400 dark:bg-black"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* New Scan */}
      <div className="px-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-md"
        >
          <Plus size={16} />
          New Scan
        </motion.button>
      </div>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2">
        {[
          { label: "Settings", icon: Settings },
          { label: "Support", icon: LifeBuoy },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
              text-gray-600 dark:text-gray-400 
              hover:bg-gray-100 dark:hover:bg-gray-800 
              hover:text-black dark:hover:text-white transition"
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
