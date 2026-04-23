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

  const isAuthPage =
    pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/userdashboard") || pathname.startsWith("/guestdashboard");

  return (
    <>
      {!isAuthPage && !isDashboardPage && <Header />}

      <main
        className={cn(
          !isAuthPage && !isDashboardPage && "-mt-14",
          isAuthPage &&
            "min-h-screen flex items-center justify-center"
        )}
      >
        {children}
      </main>

      {!isAuthPage && !isDashboardPage && <Footer />}
    </>
  );
}