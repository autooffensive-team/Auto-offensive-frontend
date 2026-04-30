import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/userdashboard";
  }

  return raw;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const callbackURL = getCallbackUrl(request.nextUrl.searchParams.get("callbackUrl"));
  const errorCallbackURL = `/login?callbackUrl=${encodeURIComponent(callbackURL)}&error=oauth_start_failed`;

  const result = await auth.api.signInWithOAuth2({
    headers: request.headers,
    body: {
      providerId: "keycloak",
      callbackURL,
      errorCallbackURL,
    },
  }).catch(() => null);

  if (!result?.url) {
    const fallbackUrl = new URL("/login", request.url);
    fallbackUrl.searchParams.set("callbackUrl", callbackURL);
    fallbackUrl.searchParams.set("error", "oauth_start_failed");
    fallbackUrl.searchParams.set("manual", "1");

    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.redirect(result.url);
}
