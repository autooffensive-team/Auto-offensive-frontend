"use client";

import { Plus, Trash2, ChevronsRight } from "lucide-react";
import { Tool, MediumStepState } from "@/types/scan";
import { Field } from "./Field";
import { ToolSelector } from "./ToolSelector";
import { ToolOptionField } from "./ToolOptionsField";
import { SubmitButton } from "./SubmitButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  return (
    <div className="space-y-4">
      <Field label="Target">
        <Input
          value={target}
          onChange={(e) => onTargetChange(e.target.value)}
          placeholder="example.com or https://example.com"
          disabled={disabled}
        />
      </Field>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Pipeline Steps</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddStep}
            disabled={disabled}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </div>

        {steps.map((step, index) => (
          <PipelineStep
            key={step.id}
            step={step}
            index={index}
            tools={tools}
            onChange={onStepChange}
            onOptionChange={onOptionChange}
            onRemove={onRemoveStep}
            canRemove={steps.length > 1}
            disabled={disabled}
          />
        ))}
      </div>

      <SubmitButton
        disabled={disabled || !target.trim() || !steps.some((s) => s.toolId)}
        onClick={onSubmit}
        label="Start Medium Scan"
      />
    </div>
  );
}

interface PipelineStepProps {
  step: MediumStepState;
  index: number;
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
  tools,
  onChange,
  onOptionChange,
  onRemove,
  canRemove,
  disabled,
}: PipelineStepProps) {
  const tool = tools.find((t) => t.tool_id === step.toolId);
  const options = tool?.scan_config?.medium?.options ?? [];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span 
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
            aria-label={`Step ${index + 1}`}
          >
            {index + 1}
          </span>
          {index > 0 && (
            <ChevronsRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="text-sm font-medium text-card-foreground">Pipeline Step</span>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(step.id)}
          disabled={!canRemove || disabled}
          aria-label={`Remove step ${index + 1}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ToolSelector
          tools={tools}
          value={step.toolId}
          onChange={(value) => onChange(step.id, { toolId: value, options: {} })}
          disabled={disabled}
          id={`step-${step.id}-tool`}
        />
        
        <Field label="Timeout seconds">
          <Input
            type="number"
            min={1}
            value={step.timeout}
            onChange={(e) => onChange(step.id, { timeout: e.target.value })}
            placeholder="Optional"
            disabled={disabled}
          />
        </Field>
      </div>

      {options.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
  );
}
