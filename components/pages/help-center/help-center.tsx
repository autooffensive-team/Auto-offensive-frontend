import HelpCenterHero from "./help-center-hero";
import HelpCenterContent from "./help-center-content";
import { useLocale } from "next-intl";

export default function HelpCenter() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const bodyFontFamily = isKhmer
    ? "var(--font-kantumruy-pro), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-kantumruy-pro), sans-serif";

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] text-[#1A1A1A] dark:text-[#EDEDED] text-[15px] md:text-[18px] lg:text-[18px] leading-[1.7]" style={{ fontFamily: bodyFontFamily }}>
      <HelpCenterHero />
      <HelpCenterContent />
    </div>
  );
}