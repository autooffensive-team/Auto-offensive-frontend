'use client';

import { useLocale } from "next-intl";
import ResourceComponent from "@/components/pages/resourcepage/page-resource";

export default function ResourcePage() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-kantumruy-pro), sans-serif"
    : "var(--font-google-sans), var(--font-kantumruy-pro), sans-serif";

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B]" style={{ fontFamily: bodyFontFamily }}>
      <ResourceComponent />
    </div>
  );
}
