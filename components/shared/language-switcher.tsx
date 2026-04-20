"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { setLocale } from "@/i18n/actions";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = async (newLocale: Locale) => {
    await setLocale(newLocale);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          <Globe className="h-4 w-4 text-zinc-500" />
          <span className="font-medium uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-38 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-sans">
        {locales.map((loc: Locale) => (
          <DropdownMenuItem 
            key={loc} 
            onClick={() => handleLocaleChange(loc)}
            className="flex justify-between items-center"
          >
            {loc === "en" ? "English" : "ភាសាខ្មែរ"}
            {locale === loc && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}