import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/userdashboard";
  }
  return raw;
}

export async function GET(request: Request) {
  const requestHeaders = await headers();
  await auth.api.signOut({
    headers: requestHeaders,
  });

  const requestUrl = new URL(request.url);
  const callbackURL = getCallbackUrl(requestUrl.searchParams.get("callbackUrl"));

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("manual", "1");
  redirectUrl.searchParams.set("callbackUrl", callbackURL);

  return NextResponse.redirect(redirectUrl);
}
