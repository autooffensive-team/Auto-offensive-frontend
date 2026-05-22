"use client";

import { usePathname } from "next/navigation";
import { useOptionalGuestContext } from "@/lib/guest/GuestContext";
import { GuestPageGuard } from "@/components/guest/GuestPageGuard";

/**
 * Template component that wraps all userdashboard pages.
 * For guest users, it blocks access to locked routes and shows a lock screen.
 * For authenticated users, it renders children normally (no-op).
 *
 * Using template.tsx instead of modifying each page ensures we don't break
 * any existing page code while still blocking guest access.
 */

const GUEST_ALLOWED_PATHS = new Set([
  "/userdashboard",
  "/userdashboard/scan",
]);

function isGuestAllowed(pathname: string): boolean {
  // Exact match
  if (GUEST_ALLOWED_PATHS.has(pathname)) return true;
  // Allow scan sub-paths (e.g. /userdashboard/scan?mode=basic)
  if (pathname.startsWith("/userdashboard/scan")) return true;
  return false;
}

function getFeatureNameFromPath(pathname: string): string {
  const segment = pathname.replace("/userdashboard/", "").split("/")[0];
  const names: Record<string, string> = {
    assets: "Assets",
    projects: "Projects",
    "code-scanning": "Code Scanning",
    findings: "Findings",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",
  };
  return names[segment] || "This Feature";
}

export default function UserDashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const guest = useOptionalGuestContext();

  // Not a guest — render everything normally
  if (!guest || !guest.isGuest) {
    return <>{children}</>;
  }

  // Guest on an allowed path — render normally
  if (isGuestAllowed(pathname)) {
    return <>{children}</>;
  }

  // Guest on a locked path — show lock screen
  return (
    <GuestPageGuard featureName={getFeatureNameFromPath(pathname)}>
      {null}
    </GuestPageGuard>
  );
}
