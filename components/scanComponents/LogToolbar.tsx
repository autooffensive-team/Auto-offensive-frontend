"use client";

import { Palette, RotateCcw, Type } from "lucide-react";
import { LOG_THEMES, LOG_SIZES, DEFAULT_THEME, DEFAULT_SIZE, type LogThemeKey, type LogSizeKey } from "@/lib/log-themes";
import { cn } from "@/lib/utils";

interface LogToolbarProps {
  themeKey: LogThemeKey;
  sizeKey: LogSizeKey;
  onThemeChange: (theme: LogThemeKey) => void;
  onSizeChange: (size: LogSizeKey) => void;
  onReset?: () => void;
  className?: string;
}

const themeKeys = Object.keys(LOG_THEMES) as LogThemeKey[];
const sizeKeys = Object.keys(LOG_SIZES) as LogSizeKey[];

export function LogToolbar({
  themeKey,
  sizeKey,
  onThemeChange,
  onSizeChange,
  onReset,
  className,
}: LogToolbarProps) {
  const isDefault = themeKey === DEFAULT_THEME && sizeKey === DEFAULT_SIZE;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 px-3 py-2",
        className
      )}
    >
      {/* Theme selector */}
      <div className="flex items-center gap-1.5">
        <Palette size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
        <select
          value={themeKey}
          onChange={(e) => onThemeChange(e.target.value as LogThemeKey)}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-[11px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 outline-none focus:border-teal-500 transition-colors cursor-pointer"
        >
          {themeKeys.map((key) => (
            <option key={key} value={key}>
              {LOG_THEMES[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

      {/* Size selector */}
      <div className="flex items-center gap-1.5">
        <Type size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {sizeKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onSizeChange(key)}
              className={cn(
                "px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-colors",
                key === sizeKey
                  ? "bg-teal-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {LOG_SIZES[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset to Default button */}
      {onReset && !isDefault && (
        <>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <RotateCcw size={10} />
            Default
          </button>
        </>
      )}
    </div>
  );
}
