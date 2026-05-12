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
              tools.map((tool, index) => (
                <ComboboxItem 
                  key={tool.tool_id} 
                  value={tool.tool_id}
                  aria-selected={tool.tool_id === value}
                  className={cn(
                    "rounded-none border-b border-border/30 last:border-b-0",
                    index % 2 === 0 ? "bg-muted/20" : "bg-transparent"
                  )}
                >
                  <div className="flex flex-col items-start gap-0.5 py-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                      {tool.tool_name}
                    </span>
                    {tool.tool_description && (
                      <span className="text-[11px] text-muted-foreground leading-tight text-left pl-3.5">
                        {tool.tool_description}
                      </span>
                    )}
                  </div>
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
