"use client";

import { CheckCircle2 } from "lucide-react";
import { Tool, ScanPreset } from "@/types/scan";
import { Field } from "./Field";
import { ToolSelector } from "./ToolSelector";
import { SubmitButton } from "./SubmitButton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Target">
          <Input
            value={target}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="example.com, https://example.com, 10.0.0.0/24"
            disabled={disabled}
          />
        </Field>
        
        <ToolSelector
          tools={tools}
          value={toolId}
          onChange={onToolChange}
          disabled={disabled}
        />
      </div>

      <PresetSelector
        presets={presets}
        selected={preset}
        onSelect={onPresetChange}
        disabled={disabled || presets.length === 0}
      />

      <SubmitButton 
        disabled={disabled || !target.trim() || !toolId || !preset} 
        onClick={onSubmit} 
        label="Start Basic Scan" 
      />
    </div>
  );
}

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
        className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center"
        role="status"
      >
        <p className="text-sm text-muted-foreground">No presets available for this tool</p>
      </div>
    );
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium">Preset</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {presets.map((preset) => {
          const isSelected = selected === preset.name;
          
          return (
            <label
              key={preset.name}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-card-foreground">{preset.name}</span>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </div>
              
              {preset.description && (
                <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
              )}
              
              {preset.flags && preset.flags.length > 0 && (
                <code className="mt-2 text-xs text-muted-foreground">
                  {preset.flags.join(" ")}
                </code>
              )}
              
              <input
                type="radio"
                name="preset"
                value={preset.name}
                checked={isSelected}
                onChange={() => onSelect(preset.name)}
                className="sr-only"
                aria-label={`Select preset ${preset.name}`}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
