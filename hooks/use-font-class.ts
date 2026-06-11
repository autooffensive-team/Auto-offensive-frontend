"use client";

import { useLocale } from "next-intl";

export function useFontClass() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  
  return {
    isKhmer,
    bodyClass: isKhmer ? "font-khmer" : "",
    headingClass: isKhmer ? "font-khmer-hero" : "display-font",
  };
}

export function getFontClass(locale: string) {
  const isKhmer = locale === "km";
  return {
    isKhmer,
    bodyClass: isKhmer ? "font-khmer" : "",
    headingClass: isKhmer ? "font-khmer-hero" : "display-font",
  };
}

export function useIsKhmer() {
  const locale = useLocale();
  return locale === "km";
}
