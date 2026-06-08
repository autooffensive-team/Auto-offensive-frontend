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
  { id: "basic",    label: "Basic",    icon: ScanLine,       description: "Quick scan with presets" },
  { id: "medium",   label: "Medium",   icon: Wrench,         description: "Customizable tool pipeline" },
  { id: "advanced", label: "Advanced", icon: SquareTerminal, description: "Full command control" },
];

interface ScanModeTabsProps {
  value: ScanMode;
  onChange: (mode: ScanMode) => void;
}

export function ScanModeTabs({ value, onChange }: ScanModeTabsProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 p-1.5"
      style={{
        background: "var(--lc-panel-bg)",
        outline: "1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)",
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        position: "relative",
      }}
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
            style={
              isActive
                ? {
                    background: "var(--color-primary)",
                    color: "#000",
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                    fontWeight: 700,
                  }
                : {}
            }
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? ""
                : "text-gray-500 dark:text-gray-400 hover:text-[--color-primary] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
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

// ── ScanModePanel ─────────────────────────────────────────────────────────────
// KEY FIX: clip-path is moved to an absolutely-positioned background layer so
// it never clips child elements (dropdowns, popovers, etc.) that overflow.
// The outer <section> has NO clip-path and overflow:visible.
export function ScanModePanel({ mode, children, isActive }: ScanModePanelProps) {
  if (!isActive) return null;

  return (
    <section
      id={`panel-${mode}`}
      role="tabpanel"
      aria-labelledby={`tab-${mode}`}
      className="relative p-4 sm:p-5 md:p-6"
      // NO clip-path here — see bg layer below
    >
      {/* ── Decorative background layer — clip-path lives only here ── */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "var(--lc-panel-bg)",
          outline: "1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)",
          clipPath:
            "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}
      />

      {/* ── Corner accent triangles ── */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `
            linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 18px 18px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 18px 18px no-repeat
          `,
          opacity: 0.5,
          clipPath:
            "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}
      />

      {/* ── Panel content — z-index above decorative layers ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </section>
  );
}

export function ScanModeHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
          outline: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
          clipPath:
            "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
          color: "var(--color-primary)",
        }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-card-foreground">
          {title}
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}