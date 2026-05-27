"use client";

import type { ToolOption } from "@/types/scan";
import { Field } from "./Field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function ToolOptionField({
  option,
  value,
  onChange,
}: {
  option: ToolOption;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  if (option.type === "boolean") {
    return (
      <div className="flex min-h-18 items-center justify-between gap-3 rounded-lg border border-input bg-background p-3">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{option.key}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{option.flag} {option.description ?? ""}</p>
        </div>
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  return (
    <Field label={`${option.key}${option.required ? " *" : ""}`}>
      <Input
        type={option.type === "integer" ? "number" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`${option.flag}${option.description ? ` - ${option.description}` : ""}`}
      />
    </Field>
  );
}