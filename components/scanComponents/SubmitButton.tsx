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
      className="mt-6 inline-flex w-full items-center justify-center gap-2 px-3 py-3 text-xs font-bold text-black sm:px-4 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
      style={{
        background: "var(--color-primary)",
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        outline: "1px solid var(--color-primary)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "";
      }}
    >
      <Play size={17} />
      {label}
    </button>
  );
}
