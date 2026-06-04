// ─── Log Color Themes ─────────────────────────────────────────────────────────
// Each theme defines colors for the HTML-based log panels (basic/medium)
// and an xterm.js theme object for the advanced terminal.

export type LogThemeKey =
  | "default"
  | "light"
  | "solarizedLight"
  | "matrix"
  | "dracula"
  | "solarized"
  | "nord"
  | "monokai";

export type LogThemeColors = {
  name: string;
  /** Background of the log container */
  bg: string;
  /** Timestamp color */
  timestamp: string;
  /** Source bracket color */
  source: string;
  /** ERROR level */
  error: string;
  /** WARN level */
  warn: string;
  /** INFO level */
  info: string;
  /** Default text */
  text: string;
  /** Muted/dim text */
  muted: string;
  /** ASCII art color — must be visible on the bg */
  asciiColor: string;
  /** Whether this is a light background theme (affects colorizeLogText) */
  isLight: boolean;
};

export type XtermThemeColors = {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightCyan: string;
};

export type LogTheme = {
  name: string;
  html: LogThemeColors;
  xterm: XtermThemeColors;
};

export const LOG_THEMES: Record<LogThemeKey, LogTheme> = {
  // ─── Dark Themes ────────────────────────────────────────────────────────────

  default: {
    name: "Default (Dark)",
    html: {
      name: "Default (Dark)",
      bg: "bg-[#0a0a0a]",
      timestamp: "text-gray-500",
      source: "text-teal-400",
      error: "text-red-400",
      warn: "text-amber-400",
      info: "text-emerald-300",
      text: "text-gray-200",
      muted: "text-gray-500",
      asciiColor: "#2dd4bf",
      isLight: false,
    },
    xterm: {
      background: "#0a0a0a",
      foreground: "#e2e8f0",
      cursor: "#2dd4bf",
      cursorAccent: "#0a0a0a",
      selectionBackground: "#134e4a",
      black: "#1e293b",
      red: "#f87171",
      green: "#4ade80",
      yellow: "#facc15",
      blue: "#60a5fa",
      magenta: "#c084fc",
      cyan: "#4ade80",
      white: "#e2e8f0",
      brightBlack: "#94a3b8",
      brightCyan: "#86efac",
    },
  },

  matrix: {
    name: "Matrix",
    html: {
      name: "Matrix",
      bg: "bg-[#020603]",
      timestamp: "text-emerald-900",
      source: "text-emerald-400",
      error: "text-red-500",
      warn: "text-lime-400",
      info: "text-emerald-300",
      text: "text-emerald-200",
      muted: "text-emerald-800",
      asciiColor: "#39ff88",
      isLight: false,
    },
    xterm: {
      background: "#020603",
      foreground: "#b7f7c9",
      cursor: "#39ff88",
      cursorAccent: "#020603",
      selectionBackground: "#0f2e1b",
      black: "#0d0d0d",
      red: "#ff6b6b",
      green: "#39ff88",
      yellow: "#a3e635",
      blue: "#38bdf8",
      magenta: "#86efac",
      cyan: "#2dd4bf",
      white: "#eafff0",
      brightBlack: "#14532d",
      brightCyan: "#86efac",
    },
  },

  dracula: {
    name: "Dracula",
    html: {
      name: "Dracula",
      bg: "bg-[#282a36]",
      timestamp: "text-[#6272a4]",
      source: "text-[#ff79c6]",
      error: "text-[#ff5555]",
      warn: "text-[#ffb86c]",
      info: "text-[#50fa7b]",
      text: "text-[#f8f8f2]",
      muted: "text-[#6272a4]",
      asciiColor: "#bd93f9",
      isLight: false,
    },
    xterm: {
      background: "#282a36",
      foreground: "#f8f8f2",
      cursor: "#f8f8f2",
      cursorAccent: "#282a36",
      selectionBackground: "#44475a",
      black: "#21222c",
      red: "#ff5555",
      green: "#50fa7b",
      yellow: "#f1fa8c",
      blue: "#bd93f9",
      magenta: "#ff79c6",
      cyan: "#8be9fd",
      white: "#f8f8f2",
      brightBlack: "#6272a4",
      brightCyan: "#a4ffff",
    },
  },

  solarized: {
    name: "Solarized Dark",
    html: {
      name: "Solarized Dark",
      bg: "bg-[#002b36]",
      timestamp: "text-[#586e75]",
      source: "text-[#268bd2]",
      error: "text-[#dc322f]",
      warn: "text-[#b58900]",
      info: "text-[#859900]",
      text: "text-[#93a1a1]",
      muted: "text-[#586e75]",
      asciiColor: "#2aa198",
      isLight: false,
    },
    xterm: {
      background: "#002b36",
      foreground: "#839496",
      cursor: "#93a1a1",
      cursorAccent: "#002b36",
      selectionBackground: "#073642",
      black: "#073642",
      red: "#dc322f",
      green: "#859900",
      yellow: "#b58900",
      blue: "#268bd2",
      magenta: "#d33682",
      cyan: "#2aa198",
      white: "#eee8d5",
      brightBlack: "#586e75",
      brightCyan: "#93a1a1",
    },
  },

  nord: {
    name: "Nord",
    html: {
      name: "Nord",
      bg: "bg-[#2e3440]",
      timestamp: "text-[#4c566a]",
      source: "text-[#88c0d0]",
      error: "text-[#bf616a]",
      warn: "text-[#ebcb8b]",
      info: "text-[#a3be8c]",
      text: "text-[#d8dee9]",
      muted: "text-[#4c566a]",
      asciiColor: "#88c0d0",
      isLight: false,
    },
    xterm: {
      background: "#2e3440",
      foreground: "#d8dee9",
      cursor: "#d8dee9",
      cursorAccent: "#2e3440",
      selectionBackground: "#434c5e",
      black: "#3b4252",
      red: "#bf616a",
      green: "#a3be8c",
      yellow: "#ebcb8b",
      blue: "#81a1c1",
      magenta: "#b48ead",
      cyan: "#88c0d0",
      white: "#e5e9f0",
      brightBlack: "#4c566a",
      brightCyan: "#8fbcbb",
    },
  },

  monokai: {
    name: "Monokai",
    html: {
      name: "Monokai",
      bg: "bg-[#272822]",
      timestamp: "text-[#75715e]",
      source: "text-[#66d9ef]",
      error: "text-[#f92672]",
      warn: "text-[#e6db74]",
      info: "text-[#a6e22e]",
      text: "text-[#f8f8f2]",
      muted: "text-[#75715e]",
      asciiColor: "#66d9ef",
      isLight: false,
    },
    xterm: {
      background: "#272822",
      foreground: "#f8f8f2",
      cursor: "#f8f8f0",
      cursorAccent: "#272822",
      selectionBackground: "#49483e",
      black: "#272822",
      red: "#f92672",
      green: "#a6e22e",
      yellow: "#f4bf75",
      blue: "#66d9ef",
      magenta: "#ae81ff",
      cyan: "#a1efe4",
      white: "#f8f8f2",
      brightBlack: "#75715e",
      brightCyan: "#a1efe4",
    },
  },

  // ─── Light Themes ───────────────────────────────────────────────────────────

  light: {
    name: "Light",
    html: {
      name: "Light",
      bg: "bg-[#f8fafc]",
      timestamp: "text-gray-500",
      source: "text-teal-700",
      error: "text-red-700",
      warn: "text-amber-700",
      info: "text-emerald-700",
      text: "text-gray-800",
      muted: "text-gray-400",
      asciiColor: "#0f766e",
      isLight: true,
    },
    xterm: {
      background: "#f8fafc",
      foreground: "#0f172a",
      cursor: "#0f766e",
      cursorAccent: "#f8fafc",
      selectionBackground: "#bfdbfe",
      black: "#1e293b",
      red: "#b91c1c",
      green: "#166534",
      yellow: "#92400e",
      blue: "#1d4ed8",
      magenta: "#7e22ce",
      cyan: "#0f766e",
      white: "#334155",
      brightBlack: "#475569",
      brightCyan: "#0d9488",
    },
  },

  solarizedLight: {
    name: "Solarized Light",
    html: {
      name: "Solarized Light",
      bg: "bg-[#fdf6e3]",
      timestamp: "text-[#93a1a1]",
      source: "text-[#268bd2]",
      error: "text-[#dc322f]",
      warn: "text-[#b58900]",
      info: "text-[#859900]",
      text: "text-[#657b83]",
      muted: "text-[#93a1a1]",
      asciiColor: "#268bd2",
      isLight: true,
    },
    xterm: {
      background: "#fdf6e3",
      foreground: "#657b83",
      cursor: "#586e75",
      cursorAccent: "#fdf6e3",
      selectionBackground: "#eee8d5",
      black: "#073642",
      red: "#dc322f",
      green: "#859900",
      yellow: "#b58900",
      blue: "#268bd2",
      magenta: "#d33682",
      cyan: "#2aa198",
      white: "#eee8d5",
      brightBlack: "#93a1a1",
      brightCyan: "#586e75",
    },
  },
};

// ─── Font Size Presets ────────────────────────────────────────────────────────

export type LogSizeKey = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export type LogSizeConfig = {
  label: string;
  /** Tailwind text size class */
  className: string;
  /** Pixel value for xterm fontSize option */
  xtermFontSize: number;
  /** Tailwind line-height class */
  lineHeight: string;
  /** Line-height multiplier used by xterm */
  terminalLineHeight: number;
};

export const LOG_SIZES: Record<LogSizeKey, LogSizeConfig> = {
  xs: { label: "XS", className: "text-[14px]", xtermFontSize: 14, lineHeight: "leading-tight", terminalLineHeight: 1.5 },
  sm: { label: "S", className: "text-[16px]", xtermFontSize: 17, lineHeight: "leading-snug", terminalLineHeight: 1.6 },
  md: { label: "M", className: "text-[18px]", xtermFontSize: 19, lineHeight: "leading-[1.9]", terminalLineHeight: 1.75 },
  lg: { label: "L", className: "text-[21px]", xtermFontSize: 20, lineHeight: "leading-[1.9]", terminalLineHeight: 2.0 },
  xl: { label: "XL", className: "text-[24px]", xtermFontSize: 22, lineHeight: "leading-[2.45]", terminalLineHeight: 2.2 },
  xxl: { label: "XXL", className: "text-[28px]", xtermFontSize: 24, lineHeight: "leading-[3.3]", terminalLineHeight: 2.45 },
};

/** Default theme key */
export const DEFAULT_THEME: LogThemeKey = "default";

/** Default size key — 18px */
export const DEFAULT_SIZE: LogSizeKey = "lg";
