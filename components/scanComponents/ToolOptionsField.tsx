"use client";

import type { ToolOption, WordlistAsset } from "@/types/scan";
import { Field } from "./Field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ToolOptionField({
  option,
  value,
  onChange,
  wordlists = [],
}: {
  option: ToolOption;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
  wordlists?: WordlistAsset[];
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

  if (option.type === "wordlist") {
    const selected = typeof value === "string" ? value : "";
    return (
      <Field label={`${option.key}${option.required ? " *" : ""}`}>
        <select
          value={selected}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <option value="">
            {wordlists.length ? "Select wordlist" : "No wordlists available"}
          </option>
          {wordlists.map((wordlist) => (
            <option key={wordlist.slug} value={wordlist.slug}>
              {wordlist.name} ({wordlist.slug}, {wordlist.line_count} lines)
            </option>
          ))}
        </select>
        {option.description ? (
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{option.description}</p>
        ) : null}
      </Field>
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