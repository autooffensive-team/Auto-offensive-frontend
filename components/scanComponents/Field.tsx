"use client";

import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={htmlFor}
        className="text-sm sm:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}