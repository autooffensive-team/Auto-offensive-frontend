"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const [phase, setPhase] = useState<"loading" | "fadeout" | "done">("loading");

  useEffect(() => {
    // Show preloader for 2.2s, then fade out over 600ms
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 2200);
    const doneTimer = setTimeout(() => setPhase("done"), 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-white dark:bg-[#09090B]
        transition-opacity duration-[600ms] ease-out
        ${phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
    >
      {/* Logo container with animations */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Pulse ring behind logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="preloader-ring w-32 h-32 rounded-full border-2 border-primary/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="preloader-ring-delay w-44 h-44 rounded-full border border-primary/15" />
        </div>

        {/* Logo */}
        <div className="preloader-logo relative z-10">
          <Image
            src="/Auto-Offensive.webp"
            alt="Auto-Offensive"
            width={80}
            height={80}
            priority
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Loading bar */}
        <div className="relative z-10 w-40 h-[2px] bg-muted-foreground/10 rounded-full overflow-hidden mt-4">
          <div className="preloader-bar h-full bg-primary rounded-full" />
        </div>
      </div>

      <style>{`
        @keyframes preloaderPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.6; }
        }
        @keyframes preloaderLogoIn {
          0% { opacity: 0; transform: scale(0.7); filter: blur(4px); }
          40% { opacity: 1; transform: scale(1.05); filter: blur(0); }
          60% { transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes preloaderBar {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
        .preloader-ring {
          animation: preloaderPulse 1.6s ease-in-out infinite;
        }
        .preloader-ring-delay {
          animation: preloaderPulse 1.6s ease-in-out 0.4s infinite;
        }
        .preloader-logo {
          animation: preloaderLogoIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .preloader-bar {
          animation: preloaderBar 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
