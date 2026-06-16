"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  LayoutGrid,
  LifeBuoy,
  Plus,
  Settings,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", path: "/guestdashboard", icon: LayoutGrid },
    { label: "Live Scans", path: "/live-scans", icon: Activity },
    { label: "Vulnerabilities", path: "/vulnerabilities", icon: Shield },
    { label: "AI Suggestion", path: "/ai-suggestion", icon: Sparkles },
  ];

  return (
    <aside className="w-56 bg-[#FCFCFA] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen shrink-0 transition-colors">
      <div className="px-3 pt-4 mb-4">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Guest Mode
            </p>
            <p className="text-xs text-gray-500 uppercase">Limited Access</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-5">
        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg py-2 transition">
          Unlock Full Suite
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
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

      <div className="px-3 mb-4">
        <motion.button
          onClick={() => router.push("/basic-scan")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-linear-to-r from-blue-500 to-teal-500 text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          New Scan
        </motion.button>
      </div>

      <div className="px-2 pb-5 space-y-1">
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
