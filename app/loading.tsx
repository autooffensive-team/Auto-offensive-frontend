"use client";

import { usePathname } from "next/navigation";
import { HomeSkeleton } from "@/components/skeletons";
import DashboardOverviewSkeleton from "@/components/skeletons/dashboard-overview-skeleton";

export default function Loading() {
  const pathname = usePathname();

  // When navigating to the user dashboard, show the dashboard skeleton
  // instead of the landing page skeleton
  if (pathname.startsWith("/userdashboard")) {
    return <DashboardOverviewSkeleton />;
  }

  return <HomeSkeleton />;
}
