"use server";

import { cookies } from "next/headers";
import { type Locale } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/");
}