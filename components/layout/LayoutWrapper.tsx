"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";
import GoToTop from "@/components/ui/go-to-top";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/userdashboard") || pathname.startsWith("/guestdashboard");
  const isAppPage = 
    pathname.startsWith("/live-scans") || 
    pathname.startsWith("/medium-scan") || 
    pathname.startsWith("/live-scan-medium") || 
    pathname.startsWith("/vulnerabilities");

  const hideHeaderFooter = isAuthPage || isDashboardPage || isAppPage;

  return (
    <>
      {!hideHeaderFooter && <Header />}

      <main
        className={cn(
          !hideHeaderFooter && "-mt-14",
          isAuthPage &&
            "min-h-screen flex items-center justify-center"
        )}
      >
        {children}
      </main>

      {!hideHeaderFooter && <Footer />}
      {!hideHeaderFooter && <GoToTop />}
    </>
  );
}
