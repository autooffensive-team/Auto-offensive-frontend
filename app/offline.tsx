"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Offline() {
  const t = useTranslations("error.offline");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-li-to-b from-zinc-950 to-zinc-900 px-4">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-800">
            <WifiOff className="w-16 h-16 text-zinc-600" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-zinc-100">
            {t("title")}
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("tryAgain")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t("goHome") || "Go Home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}