"use client";

import { CheckCircle2, GripVertical, LayoutGrid, RotateCcw } from "lucide-react";
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
  const [layout, setLayout]       = useState<LayoutKey[]>([...DEFAULT_LAYOUT]);
  const [dragging, setDragging]   = useState<LayoutKey | null>(null);
  const [dragOver, setDragOver]   = useState<LayoutKey | null>(null);
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
          <Field label="Target">
            <Input
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="example.com, https://example.com, 10.0.0.0/24"
              disabled={disabled}
              className="font-mono text-sm"
            />
          </Field>

          {/* ToolSelector dropdown — hover color fix via wrapper */}
          <div className="[&_select]:hover:border-primary/50 [&_select]:focus:border-primary [&_select]:focus:ring-primary/20">
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
        <PresetSelector
          presets={presets}
          selected={preset}
          onSelect={onPresetChange}
          disabled={disabled || presets.length === 0}
        />
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
        <SubmitButton
          disabled={disabled || !target.trim() || !toolId || !preset}
          onClick={onSubmit}
          label="Start Basic Scan"
        />
      </DraggableWidget>
    ),
  };

  return (
    <div className="space-y-2">
      {/* Layout toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Drag sections to reorder your layout</span>
        </div>
        {isCustom && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLayout([...DEFAULT_LAYOUT])}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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

// ─── DraggableWidget (identical pattern to MediumScanForm) ────────────────────
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
}

function DraggableWidget({
  widgetKey, label, children,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: DraggableWidgetProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(widgetKey)}
      onDragOver={(e) => onDragOver(e, widgetKey)}
      onDrop={(e) => onDrop(e, widgetKey)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-150",
        isDragging  && "opacity-40 scale-[0.98] border-dashed border-border",
        isDragOver && !isDragging && "border-primary/60 shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]",
        !isDragging && !isDragOver && "border-border"
      )}
    >
      {/* Drag handle */}
      <div
        className={cn(
          "flex cursor-grab select-none items-center gap-2 border-b border-border/50 px-4 py-2.5",
          "active:cursor-grabbing",
          isDragOver && !isDragging && "border-primary/30"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          {label}
        </span>
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium text-primary">Drop here</span>
        )}
      </div>

      <div className="p-4">{children}</div>
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
        className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center"
        role="status"
      >
        <p className="text-sm text-muted-foreground/60">No presets available for this tool.</p>
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
                "relative flex cursor-pointer flex-col rounded-lg border p-4 transition-all duration-150",
                "focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-1",
                // selected state
                isSelected
                  ? "border-primary/60 bg-card shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/3",
                disabled && "pointer-events-none opacity-50"
              )}
            >


              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {p.name}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border/60" />
                )}
              </div>

              {p.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              )}

              {p.flags && p.flags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {p.flags.map((flag) => (
                    <code
                      key={flag}
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[10px]",
                        isSelected
                          ? "bg-primary/10 text-primary/80"
                          : "bg-muted text-muted-foreground"
                      )}
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