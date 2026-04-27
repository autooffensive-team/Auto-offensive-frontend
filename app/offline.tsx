"use client";

import { useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export default function Offline() {
  const t = useTranslations("error.offline");
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    // Small delay for UX feedback
    await new Promise((res) => setTimeout(res, 800));
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 text-[#111111] dark:bg-[#09090B] dark:text-[#EDEDED]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center py-16">
        <div className="w-full max-w-3xl text-center">
          <div className="mb-10 flex justify-center">
            <Image
              src="/Auto_Offensive_Light-mode.png"
              alt="Auto Offensive"
              width={4096}
              height={1776}
              unoptimized
              style={{ height: "auto" }}
              className="block h-auto w-45 dark:hidden sm:w-55"
            />
            <Image
              src="/Auto_Offensive_Dark-mode.png"
              alt="Auto Offensive"
              width={4096}
              height={1774}
              unoptimized
              style={{ height: "auto" }}
              className="hidden h-auto w-45 dark:block sm:w-55"
            />
          </div>

          <div className="relative mb-10">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#00BCA1]/10 dark:bg-[#00BCA1]/12">
              <WifiOff className="h-12 w-12 text-[#00BCA1] dark:text-[#5eead4]" />
            </div>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-4xl font-bold sm:text-5xl ${locale === "kh" ? "font-khmer tracking-normal" : "tracking-tight"}`}
            >
              {t("title")}
            </h2>
            <p className="mx-auto max-w-xl text-base leading-8 text-[#5C5C5C] dark:text-[#A1A1AA]">
              {t("description")}
            </p>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={handleRetry}
              disabled={isChecking}
              className="h-11 rounded-xl bg-[#00BCA1] px-6 text-white hover:bg-[#00a88f] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#12d1b3]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking..." : t("tryAgain")}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-black/10 bg-transparent px-6 text-[#111111] hover:bg-black/4 dark:border-white/12 dark:bg-transparent dark:text-[#EDEDED] dark:hover:bg-white/6"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("goHome") || "Go Home"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
