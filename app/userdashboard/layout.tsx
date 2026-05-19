import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UserDashboardShell from "@/components/layout/UserDashboardShell";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";
import type { AuthMeResponse } from "@/types/auth";
import { Toaster } from "sonner";

const gatewayBaseUrl =
  readOptionalEnv("BACKEND_URL", "") || readRequiredEnv("FASTAPI_GATEWAY_URL");

/**
 * Attempt to fetch /auth/me with the given token.
 * Returns the parsed response if successful, null otherwise.
 */
async function fetchAuthMe(accessToken: string): Promise<AuthMeResponse | null> {
  const response = await fetch(new URL("/auth/me", gatewayBaseUrl), {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return (await response.json()) as AuthMeResponse;
}

/**
 * Try to get a working access token and fetch the user profile in one pass.
 * Tries the current token first, then attempts a refresh.
 * Returns { accessToken, authMe } if successful, or null if both tokens are dead.
 */
async function getValidSessionData(
  requestHeaders: Headers,
): Promise<{ accessToken: string; authMe: AuthMeResponse } | null> {
  // Try current access token
  const tokenResult = await auth.api.getAccessToken({
    headers: requestHeaders,
    body: { providerId: "keycloak" },
  }).catch(() => null);

  if (tokenResult?.accessToken) {
    const authMe = await fetchAuthMe(tokenResult.accessToken);
    if (authMe) {
      return { accessToken: tokenResult.accessToken, authMe };
    }
  }

  // Current token expired or rejected by backend — attempt refresh
  const refreshed = await auth.api.refreshToken({
    headers: requestHeaders,
    body: { providerId: "keycloak" },
  }).catch(() => null);

  if (refreshed?.accessToken) {
    const authMe = await fetchAuthMe(refreshed.accessToken);
    if (authMe) {
      return { accessToken: refreshed.accessToken, authMe };
    }
  }

  return null;
}

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login?callbackUrl=%2Fuserdashboard");
  }

  // Validate that the Keycloak token is still usable AND accepted by the backend.
  // If both access + refresh tokens are expired/rejected (e.g. user left overnight),
  // redirect through /logout to properly clear the stale session cookie
  // and Keycloak tokens before landing on /login.
  const sessionData = await getValidSessionData(requestHeaders);

  if (!sessionData) {
    // Session cookie exists but Keycloak tokens are dead.
    // Send through /logout which clears cookies properly as a route handler,
    // then redirects to /login. This avoids the redirect loop where /login
    // sees a stale session and bounces back to /userdashboard.
    redirect("/logout");
  }

  return (
    <>
      <UserDashboardShell initialAuthMe={sessionData.authMe}>
        {children}
      </UserDashboardShell>
      <Toaster duration={5000} position="top-center" />
    </>
  );
}
