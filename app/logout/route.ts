import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";

const appUrl = readOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
const keycloakIssuer = readRequiredEnv("KEYCLOAK_ISSUER");

export async function GET(request: NextRequest) {
  const tokenResult = await auth.api.getAccessToken({
    headers: request.headers,
    body: {
      providerId: "keycloak",
    },
  }).catch(() => null);

  await auth.api
    .signOut({
      headers: request.headers,
    })
    .catch(() => null);

  const postLogoutRedirectUrl = new URL("/login?manual=1&prompt=login", appUrl);
  const redirectUrl = tokenResult?.idToken
    ? new URL(`${keycloakIssuer}/protocol/openid-connect/logout`)
    : postLogoutRedirectUrl;

  if (tokenResult?.idToken) {
    redirectUrl.searchParams.set("id_token_hint", tokenResult.idToken);
    redirectUrl.searchParams.set(
      "post_logout_redirect_uri",
      postLogoutRedirectUrl.toString(),
    );
  }

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");

  return response;
}
