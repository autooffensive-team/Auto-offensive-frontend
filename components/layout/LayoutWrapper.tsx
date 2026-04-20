"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isAuthPage =
    normalizedPath === "/login" ||
    normalizedPath === "/register" ||
    normalizedPath.endsWith("/login") ||
    normalizedPath.endsWith("/register");

  return (
    <>
      {!isAuthPage && <Header />}

      <main
        className={cn(
          !isAuthPage && "-mt-14",
          isAuthPage &&
            "min-h-screen flex items-center justify-center"
        )}
      >
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </>
  );
}
