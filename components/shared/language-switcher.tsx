"use client";

import * as React from "react";
import Image from "next/image";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/actions";
import { type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const khmerLabel = "\u1781\u17d2\u1798\u17c2\u179a";
  const nextLocale: Locale = locale === "en" ? "kh" : "en";
  const currentLabel = locale === "en" ? "EN" : "KH";
  const nextLabel = locale === "en" ? khmerLabel : "EN";
  const flagSrc = locale === "en" ? "/flags/en.png" : "/flags/kh.png";

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
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-2.5 text-zinc-900 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-100 dark:hover:bg-zinc-900"
    >
      <Image
        src={flagSrc}
        alt={locale}
        width={18}
        height={12}
        className="rounded-[2px] object-cover"
      />
      <span className="text-xs font-semibold tracking-[0.14em]">
        {currentLabel}
      </span>
      <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <Languages className="h-3.5 w-3.5" />
        {isPending ? "..." : nextLabel}
      </span>
    </button>
  );
}
