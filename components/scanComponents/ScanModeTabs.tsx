"use client";

import { ScanLine, Wrench, SquareTerminal, LucideIcon } from "lucide-react";
import { ScanMode } from "@/types/scan";
import { cn } from "@/lib/utils";

interface ScanModeOption {
  id: ScanMode;
  label: string;
  icon: LucideIcon;
  description: string;
}

const SCAN_MODES: ScanModeOption[] = [
  { 
    id: "basic", 
    label: "Basic", 
    icon: ScanLine,
    description: "Quick scan with presets"
  },
  { 
    id: "medium", 
    label: "Medium", 
    icon: Wrench,
    description: "Customizable tool pipeline"
  },
  { 
    id: "advanced", 
    label: "Advanced", 
    icon: SquareTerminal,
    description: "Full command control"
  },
];

interface ScanModeTabsProps {
  value: ScanMode;
  onChange: (mode: ScanMode) => void;
}

export function ScanModeTabs({ value, onChange }: ScanModeTabsProps) {
  return (
    <div 
      className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-1.5"
      role="tablist"
      aria-label="Scan mode selection"
    >
      {SCAN_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.id;
        
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            id={`tab-${mode.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${mode.id}`}
            onClick={() => onChange(mode.id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive 
                ? "bg-[#00d0b2] text-black" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface ScanModePanelProps {
  mode: ScanMode;
  children: React.ReactNode;
  isActive: boolean;
}

export function ScanModePanel({ mode, children, isActive }: ScanModePanelProps) {
  if (!isActive) return null;
  
  return (
    <section
      id={`panel-${mode}`}
      role="tabpanel"
      aria-labelledby={`tab-${mode}`}
      className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 md:p-6"
    >
      {children}
    </section>
  );
}

export function ScanModeHeader({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-card-foreground">{title}</h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
