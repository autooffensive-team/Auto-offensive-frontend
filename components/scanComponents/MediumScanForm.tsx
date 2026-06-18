"use client";

import { Plus, Trash2, ChevronsRight, GripVertical, RotateCcw, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Tool, MediumStepState, WordlistAsset } from "@/types/scan";
import { Field } from "./Field";
import { ToolSelector } from "./ToolSelector";
import { ToolOptionField } from "./ToolOptionsField";
import { SubmitButton } from "./SubmitButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_STEPS = 4;

// ─── Default layout order ────────────────────────────────────────────────────
const DEFAULT_LAYOUT: LayoutKey[] = ["target", "pipeline", "submit"];
type LayoutKey = "target" | "pipeline" | "submit";

interface MediumScanFormProps {
  target: string;
  onTargetChange: (value: string) => void;
  steps: MediumStepState[];
  onStepChange: (id: string, patch: Partial<MediumStepState>) => void;
  onOptionChange: (stepId: string, key: string, value: string | boolean) => void;
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  tools: Tool[];
  wordlists?: WordlistAsset[];
  disabled: boolean;
  onSubmit: () => void;
}

export function MediumScanForm({
  target,
  onTargetChange,
  steps,
  onStepChange,
  onOptionChange,
  onAddStep,
  onRemoveStep,
  tools,
  wordlists = [],
  disabled,
  onSubmit,
}: MediumScanFormProps) {
  // ─── Draggable layout state ─────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutKey[]>([...DEFAULT_LAYOUT]);
  const [isDraggingWidget, setIsDraggingWidget] = useState<LayoutKey | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<LayoutKey | null>(null);
  const isCustomLayout = layout.join(",") !== DEFAULT_LAYOUT.join(",");

  const handleWidgetDragStart = (key: LayoutKey) => setIsDraggingWidget(key);

  const handleWidgetDragOver = (e: React.DragEvent, key: LayoutKey) => {
    e.preventDefault();
    if (isDraggingWidget && isDraggingWidget !== key) setDragOverWidget(key);
  };

  const handleWidgetDrop = (e: React.DragEvent, targetKey: LayoutKey) => {
    e.preventDefault();
    if (!isDraggingWidget || isDraggingWidget === targetKey) return;
    const newLayout = [...layout];
    const fromIdx = newLayout.indexOf(isDraggingWidget);
    const toIdx = newLayout.indexOf(targetKey);
    newLayout.splice(fromIdx, 1);
    newLayout.splice(toIdx, 0, isDraggingWidget);
    setLayout(newLayout);
    setIsDraggingWidget(null);
    setDragOverWidget(null);
  };

  const handleWidgetDragEnd = () => {
    setIsDraggingWidget(null);
    setDragOverWidget(null);
  };

  const resetLayout = () => setLayout([...DEFAULT_LAYOUT]);

  const canAddStep = steps.length < MAX_STEPS;

  // ─── Widget render map ──────────────────────────────────────────────────
  const widgets: Record<LayoutKey, React.ReactNode> = {
    target: (
      <DraggableWidget
        key="target"
        widgetKey="target"
        label="Target"
        isDragging={isDraggingWidget === "target"}
        isDragOver={dragOverWidget === "target"}
        onDragStart={handleWidgetDragStart}
        onDragOver={handleWidgetDragOver}
        onDrop={handleWidgetDrop}
        onDragEnd={handleWidgetDragEnd}
      >
        <Field label="Target">
          <Input
            value={target}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="example.com or https://example.com"
            disabled={disabled}
            className="font-mono text-sm sm:text-base"
          />
        </Field>
      </DraggableWidget>
    ),

    pipeline: (
      <DraggableWidget
        key="pipeline"
        widgetKey="pipeline"
        label="Pipeline Steps"
        isDragging={isDraggingWidget === "pipeline"}
        isDragOver={dragOverWidget === "pipeline"}
        onDragStart={handleWidgetDragStart}
        onDragOver={handleWidgetDragOver}
        onDrop={handleWidgetDrop}
        onDragEnd={handleWidgetDragEnd}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Pipeline Steps</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  steps.length >= MAX_STEPS
                    ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                )}
              >
                {steps.length}/{MAX_STEPS}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddStep}
              disabled={disabled || !canAddStep}
              className={cn(
                "gap-1.5 text-xs border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500/50",
                !canAddStep && "cursor-not-allowed opacity-50"
              )}
              title={!canAddStep ? `Maximum ${MAX_STEPS} steps allowed` : undefined}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Step
              {!canAddStep && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(max)</span>
              )}
            </Button>
          </div>

          {steps.length === 0 && (
            <div
              className="p-8 text-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 3%, transparent)",
                outline: "1px dashed color-mix(in srgb, var(--color-primary) 20%, transparent)",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
              role="status"
            >
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No pipeline steps yet. Add a step to begin.</p>
            </div>
          )}

          {steps.map((step, index) => (
            <PipelineStep
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
              tools={tools}
              wordlists={wordlists}
              onChange={onStepChange}
              onOptionChange={onOptionChange}
              onRemove={onRemoveStep}
              canRemove={steps.length > 1}
              disabled={disabled}
            />
          ))}
        </div>
      </DraggableWidget>
    ),

    submit: (
      <DraggableWidget
        key="submit"
        widgetKey="submit"
        label="Run Scan"
        isDragging={isDraggingWidget === "submit"}
        isDragOver={dragOverWidget === "submit"}
        onDragStart={handleWidgetDragStart}
        onDragOver={handleWidgetDragOver}
        onDrop={handleWidgetDrop}
        onDragEnd={handleWidgetDragEnd}
      >
        <SubmitButton
          disabled={disabled || !target.trim() || !steps.some((s) => s.toolId)}
          onClick={onSubmit}
          label="Start Medium Scan"
        />
      </DraggableWidget>
    ),
  };

  return (
    <div className="space-y-2">
      {/* Layout customization toolbar */}
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{
        background: "var(--lc-panel-bg)",
        outline: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}
    >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} />
          <span className="text-xs" style={{ color: "var(--color-primary)" }}>
            Drag sections to reorder your layout
          </span>
        </div>
        {isCustomLayout && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            className="h-7 gap-1.5 text-xs hover:text-white"
            style={{ color: "color-mix(in srgb, var(--color-primary) 70%, transparent)" }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset layout
          </Button>
        )}
      </div>

      {/* Draggable widget sections */}
      <div className="space-y-3">
        {layout.map((key) => widgets[key])}
      </div>
    </div>
  );
}

// ─── DraggableWidget wrapper ──────────────────────────────────────────────────
// KEY FIX: clip-path is moved to an absolutely-positioned background layer.
// The outer div has NO clip-path and NO overflow:hidden so that <select>
// and other portal-based dropdowns can render outside the widget bounds.

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
  widgetKey,
  label,
  children,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: DraggableWidgetProps) {
  const borderColor =
    isDragOver && !isDragging
      ? "color-mix(in srgb, var(--color-primary) 55%, transparent)"
      : "color-mix(in srgb, var(--color-primary) 20%, transparent)";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(widgetKey)}
      onDragOver={(e) => onDragOver(e, widgetKey)}
      onDrop={(e) => onDrop(e, widgetKey)}
      onDragEnd={onDragEnd}
      className={cn("group relative transition-all duration-150", isDragging && "opacity-40 scale-[0.98]")}
      style={{
        // NO clip-path here — overflow must stay visible for dropdowns
        position: "relative",
        filter: isDragging ? "brightness(0.7)" : undefined,
      }}
    >
      {/*
       * ── Decorative background layer ──────────────────────────────────────
       * clip-path + background live ONLY here (absolutely positioned).
       * This never affects overflow of content above it.
       */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "var(--lc-panel-bg)",
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          outline: `1px solid ${borderColor}`,
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
            linear-gradient(135deg, var(--color-primary) 0%, transparent 50%) top left / 26px 26px no-repeat,
            linear-gradient(315deg, var(--color-primary) 0%, transparent 50%) bottom right / 26px 26px no-repeat
          `,
          opacity: 0.5,
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
        }}
      />

      {/* Drag handle header */}
      <div
        className="relative z-10 flex cursor-grab items-center gap-2 px-4 py-2.5 select-none active:cursor-grabbing"
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)" }}
      >
        <GripVertical className="h-4 w-4 transition-colors"
          style={{ color: "color-mix(in srgb, var(--color-primary) 40%, transparent)" }} />
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#005F5F", letterSpacing: "0.18em" }}>
          {label}
        </span>
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium" style={{ color: "var(--color-primary)" }}>Drop here</span>
        )}
      </div>

      {/* Widget content — z-index keeps it above bg layer */}
      <div className="relative z-10 p-3 sm:p-4">{children}</div>
    </div>
  );
}

// ─── PipelineStep ─────────────────────────────────────────────────────────────
// Same fix: clip-path moved to bg layer, outer div has overflow:visible

interface PipelineStepProps {
  step: MediumStepState;
  index: number;
  totalSteps: number;
  tools: Tool[];
  wordlists: WordlistAsset[];
  onChange: (id: string, patch: Partial<MediumStepState>) => void;
  onOptionChange: (stepId: string, key: string, value: string | boolean) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  disabled?: boolean;
}

function PipelineStep({
  step,
  index,
  totalSteps,
  tools,
  wordlists,
  onChange,
  onOptionChange,
  onRemove,
  canRemove,
  disabled,
}: PipelineStepProps) {
  const tool = tools.find((t) => t.tool_id === step.toolId);
  const options = tool?.scan_config?.medium?.options ?? [];

  const badgeColors = [
    "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
    "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
    "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
    "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400",
  ];
  const badgeColor = badgeColors[index % badgeColors.length];

  return (
    <div
      className="relative transition-colors"
      style={{
        // NO clip-path on outer — background layer carries it instead
        position: "relative",
      }}
    >
      {/* Decorative bg layer for PipelineStep */}
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "color-mix(in srgb, var(--color-primary) 3%, var(--lc-panel-bg))",
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          outline: "1px solid color-mix(in srgb, var(--color-primary) 16%, transparent)",
        }}
      />

      {index > 0 && (
        <div className="absolute -top-3.5 left-6 flex items-center gap-1.5" style={{ zIndex: 2 }}>
          <ChevronsRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        </div>
      )}

      <div className="relative z-10 p-3 sm:p-4">
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold",
                badgeColor
              )}
              aria-label={`Step ${index + 1}`}
            >
              {index + 1}
            </span>
            <span className="text-sm sm:text-base font-medium text-gray-900/80 dark:text-white/80">
              Pipeline Step
            </span>
            {totalSteps > 1 && index < totalSteps - 1 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">→ next</span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(step.id)}
            disabled={!canRemove || disabled}
            aria-label={`Remove step ${index + 1}`}
            className={cn(
              "h-7 w-7 text-gray-400 dark:text-gray-500",
              "hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400",
              "disabled:pointer-events-none disabled:opacity-30"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToolSelector
            tools={tools}
            value={step.toolId}
            onChange={(value) => onChange(step.id, { toolId: value, options: {} })}
            disabled={disabled}
            id={`step-${step.id}-tool`}
          />

          <Field label="Timeout (seconds)">
            <Input
              type="number"
              min={1}
              value={step.timeout}
              onChange={(e) => onChange(step.id, { timeout: e.target.value })}
              placeholder="Optional"
              disabled={disabled}
              className="font-mono text-sm sm:text-base"
            />
          </Field>
        </div>

        {options.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <ToolOptionField
                key={option.key}
                option={option}
                value={step.options[option.key]}
                wordlists={wordlists}
                onChange={(value) => onOptionChange(step.id, option.key, value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}