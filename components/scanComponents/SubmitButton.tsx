"use client";
import { Play } from "lucide-react";

export function SubmitButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-3 text-sm font-bold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Play size={17} />
      {label}
    </button>
  );
}
