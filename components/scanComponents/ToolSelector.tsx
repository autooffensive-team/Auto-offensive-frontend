"use client";

import { Tool } from "@/types/scan";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
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
  const selectedTool = tools.find((t) => t.tool_id === value);
  const isEmpty = tools.length === 0;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[10px] sm:text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>

      <Combobox
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue);
        }}
        disabled={disabled || isEmpty}
      >
        <ComboboxInput
          id={id}
          placeholder={isEmpty ? "No tools available" : `Select ${label.toLowerCase()}`}
          showTrigger
          openOnClick
          className={cn(
            "w-full",
            "[&_button[data-slot=combobox-trigger]:hover]:bg-teal-50",
            "dark:[&_button[data-slot=combobox-trigger]:hover]:bg-teal-500/10",
            "[&_button[data-slot=combobox-trigger]:hover]:text-teal-600",
            "dark:[&_button[data-slot=combobox-trigger]:hover]:text-teal-400",
            "[&_button[data-slot=combobox-trigger]:hover_svg]:text-teal-600",
            "dark:[&_button[data-slot=combobox-trigger]:hover_svg]:text-teal-400",
            isEmpty && "text-gray-500 dark:text-gray-400"
          )}
          value={selectedTool?.tool_name ?? ""}
          readOnly
          aria-label={`Select ${label.toLowerCase()}`}
        />

        {/* ComboboxContent now portals to document.body — no anchor ref needed */}
        <ComboboxContent>
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
                    "rounded-none border-b border-gray-200/30 dark:border-gray-700/40 last:border-b-0",
                    // alternating row tint — light + dark
                    index % 2 === 0
                      ? "bg-gray-50/60 dark:bg-gray-800/40"
                      : "bg-transparent",
                    // hover + selected — light
                    "hover:bg-teal-50 hover:text-gray-900",
                    "data-[selected=true]:bg-teal-50 data-[selected=true]:text-gray-900",
                    // hover + selected — dark
                    "dark:hover:bg-teal-500/15 dark:hover:text-gray-100",
                    "dark:data-[selected=true]:bg-teal-500/20 dark:data-[selected=true]:text-gray-100",
                  )}
                >
                  <div className="flex flex-col items-start gap-0.5 py-0.5">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500/60" />
                      {tool.tool_name}
                    </span>
                    {tool.tool_description && (
                      <span className="text-[10px] sm:text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-tight text-left pl-3.5">
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
      <div className="h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-10 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}