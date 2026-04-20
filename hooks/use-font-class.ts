"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function useFontClass() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  
  return {
    isKhmer,
    bodyClass: isKhmer ? "font-khmer" : "",
    headingClass: isKhmer ? "display-font" : "",
  };
}

export function getFontClass(locale: string) {
  const isKhmer = locale === "kh";
  return {
    isKhmer,
    bodyClass: isKhmer ? "font-khmer" : "",
    headingClass: isKhmer ? "display-font" : "",
  };
}

export function useIsKhmer() {
  const locale = useLocale();
  return locale === "kh";
}