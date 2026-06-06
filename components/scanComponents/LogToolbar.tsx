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
        "flex flex-wrap items-center justify-center gap-3 rounded-md border bg-black px-4 py-2 backdrop-blur-sm",
        "border-green-500/40 hover:border-green-500/60 transition-colors",
        className
      )}
    >
      {/* Theme selector */}
      <div className="flex items-center gap-1.5">
        <Palette size={13} className="text-green-400/70 shrink-0" />
        <select
          value={themeKey}
          onChange={(e) => onThemeChange(e.target.value as LogThemeKey)}
          className="rounded-md border border-green-500/40 bg-black/50 px-2 py-1 text-[11px] sm:text-xs font-mono text-green-300 outline-none hover:border-green-500 focus:border-green-500 transition-colors cursor-pointer neon-text"
        >
          {themeKeys.map((key) => (
            <option key={key} value={key} className="bg-black text-green-300">
              {LOG_THEMES[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-green-500/30" />

      {/* Size selector */}
      <div className="flex items-center gap-1.5">
        <Type size={13} className="text-green-400/70 shrink-0" />
        <div className="flex rounded-md border border-green-500/40 overflow-hidden">
          {sizeKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onSizeChange(key)}
                className={cn(
                "px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-all duration-200 font-mono",
                key === sizeKey
                  ? "bg-green-500/30 text-green-300 border border-green-500/60 shadow-[0_0_10px_rgba(0,255,0,0.2)]"
                  : "bg-black text-green-400/60 hover:bg-green-500/10 hover:text-green-300"
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
          <div className="h-4 w-px bg-green-500/30" />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md border border-green-500/40 bg-black/50 px-2 py-1 text-[10px] sm:text-[11px] font-mono text-green-300/70 transition-all duration-200 hover:bg-green-500/10 hover:border-green-500/60 hover:text-green-300 hover:shadow-[0_0_10px_rgba(0,255,0,0.2)]"
          >
            <RotateCcw size={10} />
            Default
          </button>
        </>
      )}
    </div>
  );
}
