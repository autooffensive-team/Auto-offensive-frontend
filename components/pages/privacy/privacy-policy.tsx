"use client";

import PrivacyHero from "./privacy-hero";
import PrivacyContent from "./privacy-content";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] text-[#1A1A1A] dark:text-[#EDEDED] text-[15px] md:text-[18px] lg:text-[18px] leading-[1.7]">
      <PrivacyHero />
      <PrivacyContent />
    </div>
  );
}