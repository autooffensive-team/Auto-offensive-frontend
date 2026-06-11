"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LOG_THEMES,
  LOG_SIZES,
  DEFAULT_THEME,
  DEFAULT_SIZE,
  type LogThemeKey,
  type LogSizeKey,
  type LogTheme,
  type LogSizeConfig,
} from "@/lib/log-themes";

const STORAGE_KEY = "ao-log-preferences";

type LogPreferences = {
  theme: LogThemeKey;
  size: LogSizeKey;
  decorations: boolean; // NEW: Track decoration preference
};

function readFromStorage(): LogPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LogPreferences>;
      return {
        theme: parsed.theme && parsed.theme in LOG_THEMES ? parsed.theme : DEFAULT_THEME,
        size: parsed.size && parsed.size in LOG_SIZES ? parsed.size : DEFAULT_SIZE,
        decorations: parsed.decorations !== undefined ? parsed.decorations : true, // Default to true
      };
    }
  } catch {
    // Corrupted storage — use defaults
  }
  return { theme: DEFAULT_THEME, size: DEFAULT_SIZE, decorations: true };
}

function savePreferences(prefs: LogPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or blocked — ignore
  }
}

export function useLogPreferences() {
  // Always start with defaults to match SSR output and avoid hydration mismatch
  const [prefs, setPrefs] = useState<LogPreferences>({ theme: DEFAULT_THEME, size: DEFAULT_SIZE, decorations: true });
  const [hydrated, setHydrated] = useState(false);

  // After mount, read the real preferences from localStorage
  useEffect(() => {
    setPrefs(readFromStorage());
    setHydrated(true);
  }, []);

  const setTheme = useCallback((theme: LogThemeKey) => {
    setPrefs((prev) => {
      const next = { ...prev, theme };
      savePreferences(next);
      return next;
    });
  }, []);

  const setSize = useCallback((size: LogSizeKey) => {
    setPrefs((prev) => {
      const next = { ...prev, size };
      savePreferences(next);
      return next;
    });
  }, []);

  const setDecorations = useCallback((decorations: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, decorations };
      savePreferences(next);
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    const defaults: LogPreferences = { theme: DEFAULT_THEME, size: DEFAULT_SIZE, decorations: true };
    setPrefs(defaults);
    savePreferences(defaults);
  }, []);

  const currentTheme: LogTheme = LOG_THEMES[prefs.theme];
  const currentSize: LogSizeConfig = LOG_SIZES[prefs.size];

  return {
    themeKey: prefs.theme,
    sizeKey: prefs.size,
    decorationsEnabled: prefs.decorations,
    theme: currentTheme,
    size: currentSize,
    setTheme,
    setSize,
    setDecorations,
    resetToDefault,
    allThemes: LOG_THEMES,
    allSizes: LOG_SIZES,
    hydrated,
  };
}
