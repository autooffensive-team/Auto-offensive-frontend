"use client";

import { Plus, Trash2, ChevronsRight, GripVertical, RotateCcw, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Tool, MediumStepState } from "@/types/scan";
import { Field } from "./Field";
import { ToolSelector } from "./ToolSelector";
import { ToolOptionField } from "./ToolOptionsField";
import { SubmitButton } from "./SubmitButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_STEPS = 4;

// ─── Default layout order ────────────────────────────────────────────────────
// Each widget key maps to a display label; order array controls render sequence
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
  disabled,
  onSubmit,
}: MediumScanFormProps) {
  // ─── Draggable layout state ─────────────────────────────────────────────
  const [layout, setLayout] = useState<LayoutKey[]>([...DEFAULT_LAYOUT]);
  const [isDraggingWidget, setIsDraggingWidget] = useState<LayoutKey | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<LayoutKey | null>(null);
  const isCustomLayout = layout.join(",") !== DEFAULT_LAYOUT.join(",");

  const handleWidgetDragStart = (key: LayoutKey) => {
    setIsDraggingWidget(key);
  };

  const handleWidgetDragOver = (e: React.DragEvent, key: LayoutKey) => {
    e.preventDefault();
    if (isDraggingWidget && isDraggingWidget !== key) {
      setDragOverWidget(key);
    }
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
            className="font-mono text-sm"
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
              <h3 className="text-sm font-medium text-foreground">Pipeline Steps</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  steps.length >= MAX_STEPS
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
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
                "gap-1.5 text-xs",
                !canAddStep && "cursor-not-allowed opacity-50"
              )}
              title={!canAddStep ? `Maximum ${MAX_STEPS} steps allowed` : undefined}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Step
              {!canAddStep && (
                <span className="ml-1 text-[10px] text-muted-foreground">(max)</span>
              )}
            </Button>
          </div>

          {steps.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No pipeline steps yet. Add a step to begin.</p>
            </div>
          )}

          {steps.map((step, index) => (
            <PipelineStep
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
              tools={tools}
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
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Drag sections to reorder your layout
          </span>
        </div>
        {isCustomLayout && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetLayout}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
  return (
    <div
      draggable
      onDragStart={() => onDragStart(widgetKey)}
      onDragOver={(e) => onDragOver(e, widgetKey)}
      onDrop={(e) => onDrop(e, widgetKey)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-150",
        isDragging && "opacity-40 scale-[0.98] shadow-none border-dashed",
        isDragOver && !isDragging && "border-primary/60 shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]",
        !isDragging && !isDragOver && "border-border"
      )}
    >
      {/* Drag handle header */}
      <div
        className={cn(
          "flex cursor-grab items-center gap-2 border-b border-border/50 px-4 py-2.5",
          "select-none active:cursor-grabbing",
          isDragOver && !isDragging && "border-primary/30"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        {isDragOver && !isDragging && (
          <span className="ml-auto text-[10px] font-medium text-primary">Drop here</span>
        )}
      </div>

      {/* Widget content */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── PipelineStep ─────────────────────────────────────────────────────────────

interface PipelineStepProps {
  step: MediumStepState;
  index: number;
  totalSteps: number;
  tools: Tool[];
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
  onChange,
  onOptionChange,
  onRemove,
  canRemove,
  disabled,
}: PipelineStepProps) {
  const tool = tools.find((t) => t.tool_id === step.toolId);
  const options = tool?.scan_config?.medium?.options ?? [];

  // Step badge color cycles through a small set so each step is visually distinct
  const badgeColors = [
    "bg-primary/10 text-primary border border-primary/20",
    "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
    "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
    "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400",
  ];
  const badgeColor = badgeColors[index % badgeColors.length];

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-background/50 transition-colors",
        "hover:border-border/80"
      )}
    >
      {/* Connector line for non-first steps */}
      {index > 0 && (
        <div className="absolute -top-3.5 left-6 flex items-center gap-1.5">
          <ChevronsRight className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden="true" />
        </div>
      )}

      <div className="p-4">
        {/* Step header */}
        <div className="mb-4 flex items-center justify-between gap-3">
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
            <span className="text-sm font-medium text-foreground/80">
              Pipeline Step
            </span>
            {totalSteps > 1 && index < totalSteps - 1 && (
              <span className="text-xs text-muted-foreground/50">→ next</span>
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
              "h-7 w-7 text-muted-foreground/50",
              "hover:bg-destructive/10 hover:text-destructive",
              "disabled:pointer-events-none disabled:opacity-30"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Tool selector + timeout */}
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
              className="font-mono text-sm"
            />
          </Field>
        </div>

        {/* Tool-specific options */}
        {options.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <ToolOptionField
                key={option.key}
                option={option}
                value={step.options[option.key]}
                onChange={(value) => onOptionChange(step.id, option.key, value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}