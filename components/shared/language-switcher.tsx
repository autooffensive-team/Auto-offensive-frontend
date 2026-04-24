"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/actions";
import { type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const nextLocale: Locale = locale === "en" ? "kh" : "en";
  const flagSrc = locale === "en" ? "/flags/en.png" : "/flags/kh.png";
  const isEnglish = locale === "en";

  const handleClick = () => {
    startTransition(async () => {
      await setLocale(nextLocale);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Switch language to ${nextLocale === "kh" ? "Khmer" : "English"}`}
      aria-pressed={!isEnglish}
      className="group inline-flex shrink-0 items-center gap-3 rounded-full px-1 py-1 text-zinc-900 transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 dark:text-zinc-100"
    >
      <span
        className={cn(
          "text-sm font-black tracking-[0.22em] transition-all duration-300",
          isEnglish
            ? "text-[#49537B] dark:text-white"
            : "text-zinc-300 dark:text-zinc-600",
        )}
      >
        EN
      </span>

      <span
        className="relative flex h-11 w-29 items-center rounded-full border border-zinc-300/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-1 ring-white/80 transition-all duration-300 group-hover:shadow-[0_14px_35px_rgba(15,23,42,0.18)] dark:border-white/15 dark:bg-zinc-900 dark:ring-white/10"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04)), url(${flagSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="absolute inset-0.75 rounded-full bg-black/12 dark:bg-black/18" />
        <span
          className={cn(
            "absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-zinc-300/80 bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#f8fafc_55%,#d4d4d8_100%)] shadow-[0_6px_18px_rgba(15,23,42,0.24)] transition-all duration-300 dark:border-white/20",
            isEnglish ? "left-1" : "left-[calc(100%-2.5rem)]",
            isPending && "scale-95",
          )}
        />
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-1/2 rounded-full bg-white/18 transition-opacity duration-300",
            isEnglish ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute inset-y-0 right-0 w-1/2 rounded-full bg-white/18 transition-opacity duration-300",
            isEnglish ? "opacity-0" : "opacity-100",
          )}
        />
        {isPending ? (
          <span className="absolute inset-x-0 bottom-[-1.15rem] text-center text-[10px] font-semibold tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            ...
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          "text-sm font-black tracking-[0.22em] transition-all duration-300",
          isEnglish
            ? "text-zinc-300 dark:text-zinc-600"
            : "text-[#49537B] dark:text-white",
        )}
      >
        KH
      </span>
    </button>
  );
}
