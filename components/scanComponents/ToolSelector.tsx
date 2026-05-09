"use client";

import { Tool } from "@/types/scan";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface ToolSelectorProps {
  tools: Tool[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function ToolSelector({
  tools,
  value,
  onChange,
  disabled,
  label = "Tool",
  id = "tool-selector",
}: ToolSelectorProps) {
  const anchorRef = useComboboxAnchor();
  const selectedTool = tools.find((t) => t.tool_id === value);
  const isEmpty = tools.length === 0;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      
      <Combobox
        value={value}
        onValueChange={(newValue) => { if (newValue) onChange(newValue); }}
        disabled={disabled || isEmpty}
      >
        <div ref={anchorRef}>
          <ComboboxInput
            id={id}
            placeholder={isEmpty ? "No tools available" : `Select ${label.toLowerCase()}`}
            showTrigger
            className={cn(
              "w-full [&_button[data-slot=combobox-trigger]:hover]:bg-primary/10 [&_button[data-slot=combobox-trigger]:hover]:text-primary [&_button[data-slot=combobox-trigger]:hover_svg]:text-primary",
              isEmpty && "text-muted-foreground"
            )}
            value={selectedTool?.tool_name ?? ""}
            readOnly
            aria-label={`Select ${label.toLowerCase()}`}
          />
        </div>
        
        <ComboboxContent anchor={anchorRef.current}>
          <ComboboxList>
            {isEmpty ? (
              <ComboboxItem value="" disabled>
                No tools available
              </ComboboxItem>
            ) : (
              tools.map((tool) => (
                <ComboboxItem 
                  key={tool.tool_id} 
                  value={tool.tool_id}
                  aria-selected={tool.tool_id === value}
                >
                  {tool.tool_name}
                </ComboboxItem>
              ))
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function ToolSelectorSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading tool selector">
      <div className="h-4 w-12 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}
