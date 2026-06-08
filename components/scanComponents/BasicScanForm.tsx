"use client";

import {
  CheckCircle2,
  GripVertical,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Tool, ScanPreset } from "@/types/scan";
import { Field } from "./Field";
import { ToolSelector } from "./ToolSelector";
import { SubmitButton } from "./SubmitButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Layout drag state ────────────────────────────────────────────────────────
type LayoutKey = "target" | "preset" | "submit";
const DEFAULT_LAYOUT: LayoutKey[] = ["target", "preset", "submit"];

interface BasicScanFormProps {
  target: string;
  onTargetChange: (value: string) => void;
  toolId: string;
  onToolChange: (value: string) => void;
  preset: string;
  onPresetChange: (value: string) => void;
  tools: Tool[];
  disabled: boolean;
  onSubmit: () => void;
}

export function BasicScanForm({
  target,
  onTargetChange,
  toolId,
  onToolChange,
  preset,
  onPresetChange,
  tools,
  disabled,
  onSubmit,
}: BasicScanFormProps) {
  const selectedTool = tools.find((t) => t.tool_id === toolId);
  const presets = selectedTool?.scan_config?.basic?.presets ?? [];

  // ─── Drag state ─────────────────────────────────────────────────────────
  const [layout, setLayout]     = useState<LayoutKey[]>([...DEFAULT_LAYOUT]);
  const [dragging, setDragging] = useState<LayoutKey | null>(null);
  const [dragOver, setDragOver] = useState<LayoutKey | null>(null);
  const isCustom = layout.join(",") !== DEFAULT_LAYOUT.join(",");

  const handleDragStart = (key: LayoutKey) => setDragging(key);
  const handleDragOver  = (e: React.DragEvent, key: LayoutKey) => {
    e.preventDefault();
    if (dragging && dragging !== key) setDragOver(key);
  };
  const handleDrop = (e: React.DragEvent, target: LayoutKey) => {
    e.preventDefault();
    if (!dragging || dragging === target) return;
    const next = [...layout];
    const from = next.indexOf(dragging);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, dragging);
    setLayout(next);
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  // ─── Widget map ──────────────────────────────────────────────────────────
  const widgets: Record<LayoutKey, React.ReactNode> = {
    target: (
      <DraggableWidget
        key="target"
        widgetKey="target"
        label="Target"
        isDragging={dragging === "target"}
        isDragOver={dragOver === "target"}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div id="tour-basic-target">
            <Field label="Target">
              <Input
                value={target}
                onChange={(e) => onTargetChange(e.target.value)}
                placeholder="example.com, https://example.com, 10.0.0.0/24"
                disabled={disabled}
                className="font-mono text-xs sm:text-sm"
              />
            </Field>
          </div>

          {/* ToolSelector dropdown — hover color fix via wrapper */}
          <div id="tour-basic-tool" className="[&_select]:hover:border-teal-500/50 [&_select]:focus:border-teal-500 [&_select]:focus:ring-teal-500/20">
            <ToolSelector
              tools={tools}
              value={toolId}
              onChange={onToolChange}
              disabled={disabled}
            />
          </div>
        </div>
      </DraggableWidget>
    ),

    preset: (
      <DraggableWidget
        key="preset"
        widgetKey="preset"
        label="Preset"
        isDragging={dragging === "preset"}
        isDragOver={dragOver === "preset"}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        <div id="tour-basic-preset">
          <PresetSelector
            presets={presets}
            selected={preset}
            onSelect={onPresetChange}
            disabled={disabled || presets.length === 0}
          />
        </div>
      </DraggableWidget>
    ),

    submit: (
      <DraggableWidget
        key="submit"
        widgetKey="submit"
        label="Run Scan"
        isDragging={dragging === "submit"}
        isDragOver={dragOver === "submit"}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        <div id="tour-basic-submit">
          <SubmitButton
            disabled={disabled || !target.trim() || !toolId || !preset}
            onClick={onSubmit}
            label="Start Basic Scan"
          />
        </div>
      </DraggableWidget>
    ),

  };

  return (
    <div className="space-y-2">
      {/* Layout toolbar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
          outline: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)",
          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5" style={{ color: "color-mix(in srgb, var(--color-primary) 55%, transparent)" }} />
          <span className="text-[10px] sm:text-xs" style={{ color: "color-mix(in srgb, var(--color-primary) 55%, transparent)" }}>
            Drag sections to reorder your layout
          </span>
        </div>
        {isCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLayout([...DEFAULT_LAYOUT])}
            className="h-7 gap-1.5 text-xs hover:text-white"
            style={{ color: "color-mix(in srgb, var(--color-primary) 70%, transparent)" }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset layout
          </Button>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {layout.map((key) => widgets[key])}
      </div>
    </div>
  );
}

// ─── DraggableWidget ──────────────────────────────────────────────────────────
interface DraggableWidgetProps {
  widgetKey: LayoutKey;
  label: string;
  children: React.ReactNode;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (key: LayoutKey) => void;
  onDragOver: (e: React.DragEvent, key: LayoutKey) => void;
  onDrop: (e: React.DragEvent, key: LayoutKey) => void;
  onDragEnd: () => void;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

function DraggableWidget({
  widgetKey, label, children,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
  badge, icon,
}: DraggableWidgetProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(widgetKey)}
      onDragOver={(e) => onDragOver(e, widgetKey)}
      onDrop={(e) => onDrop(e, widgetKey)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative transition-all duration-150",
        isDragging  && "opacity-40 scale-[0.98]",
      )}
      style={{
        background: "color-mix(in srgb, var(--color-primary) 2%, var(--background))",
        outline: isDragOver && !isDragging
          ? "1px solid color-mix(in srgb, var(--color-primary) 55%, transparent)"
          : "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        filter: isDragging ? "brightness(0.7)" : undefined,
      }}
    >
      {/* corner accents */}
      <span aria-hidden="true" style={{
        pointerEvents: "none", position: "absolute", inset: 0,
        background: `
          linear-gradient(135deg, var(--color-primary) 0%, transparent 55%) top left / 14px 14px no-repeat,
          linear-gradient(315deg, var(--color-primary) 0%, transparent 55%) bottom right / 14px 14px no-repeat
        `,
        opacity: 0.45, zIndex: 0,
      }} />

      {/* Drag handle */}
      <div
        className={cn(
          "relative z-10 flex cursor-grab select-none items-center gap-2 px-4 py-2.5",
          "active:cursor-grabbing",
        )}
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)" }}
      >
        <GripVertical className="h-4 w-4 transition-colors"
          style={{ color: "color-mix(in srgb, var(--color-primary) 40%, transparent)" }} />
        {icon && <span style={{ color: "color-mix(in srgb, var(--color-primary) 50%, transparent)" }}>{icon}</span>}
        <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase tracking-widest"
          style={{ color: "color-mix(in srgb, var(--color-primary) 55%, transparent)", letterSpacing: "0.18em" }}>
          {label}
        </span>
        {badge && <span className="ml-1">{badge}</span>}
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium" style={{ color: "var(--color-primary)" }}>Drop here</span>
        )}
      </div>

      <div className="relative z-10 p-3 sm:p-4">{children}</div>
    </div>
  );
}

// ─── PresetSelector ───────────────────────────────────────────────────────────
interface PresetSelectorProps {
  presets: ScanPreset[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

function PresetSelector({ presets, selected, onSelect, disabled }: PresetSelectorProps) {
  if (presets.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-100/20 dark:bg-gray-800/20 p-6 text-center"
        role="status"
      >
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">No presets available for this tool.</p>
      </div>
    );
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {presets.map((p) => {
          const isSelected = selected === p.name;
          return (
            <label
              key={p.name}
              className={cn(
                "relative flex cursor-pointer flex-col p-3 sm:p-4 transition-all duration-150",
                "focus-within:ring-2 focus-within:ring-offset-1",
                disabled && "pointer-events-none opacity-50"
              )}
              style={{
                background: isSelected
                  ? "color-mix(in srgb, var(--color-primary) 8%, var(--background))"
                  : "color-mix(in srgb, var(--color-primary) 2%, var(--background))",
                outline: isSelected
                  ? "1px solid color-mix(in srgb, var(--color-primary) 55%, transparent)"
                  : "1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              {/* corner accent when selected */}
              {isSelected && (
                <span aria-hidden="true" style={{
                  pointerEvents: "none", position: "absolute", inset: 0,
                  background: `
                    linear-gradient(135deg, var(--color-primary) 0%, transparent 50%) top left / 12px 12px no-repeat,
                    linear-gradient(315deg, var(--color-primary) 0%, transparent 50%) bottom right / 12px 12px no-repeat
                  `,
                  opacity: 0.5,
                }} />
              )}
              <div className="relative flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-semibold"
                  style={{ color: isSelected ? "var(--color-primary)" : undefined }}>
                  {p.name}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200/60 dark:border-gray-700/60" />
                )}
              </div>

              {p.description && (
                <p className="relative mt-1.5 text-[10px] sm:text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {p.description}
                </p>
              )}

              {p.flags && p.flags.length > 0 && (
                <div className="relative mt-2.5 flex flex-wrap gap-1">
                  {p.flags.map((flag) => (
                    <code
                      key={flag}
                      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        background: isSelected
                          ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
                          : "color-mix(in srgb, var(--color-primary) 6%, transparent)",
                        color: "color-mix(in srgb, var(--color-primary) 80%, var(--foreground))",
                      }}
                    >
                      {flag}
                    </code>
                  ))}
                </div>
              )}

              <input
                type="radio"
                name="preset"
                value={p.name}
                checked={isSelected}
                onChange={() => onSelect(p.name)}
                className="sr-only"
                aria-label={`Select preset ${p.name}`}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
