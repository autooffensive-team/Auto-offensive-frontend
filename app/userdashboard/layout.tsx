import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UserDashboardShell from "@/components/layout/UserDashboardShell";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";
import type { AuthMeResponse } from "@/types/auth";
import { Toaster } from "sonner";
import { hasValidGuestSession } from "@/lib/guest/guest-session";
import { GuestProvider } from "@/lib/guest/GuestContext";

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
    // Token exists but /auth/me failed - this can happen right after login
    // Return token anyway, let the app try to fetch user data via Redux
    console.warn("[userdashboard/layout] Token exists but /auth/me failed, continuing anyway");
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
    // Refreshed token exists but /auth/me failed
    console.warn("[userdashboard/layout] Refreshed token exists but /auth/me failed, continuing anyway");
  }

  // Both tokens are dead or refresh failed
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

  // ─── Authenticated user flow ───────────────────────────────
  if (session) {
    // Simple approach: try to get user data, if it fails, redirect to logout
    const tokenResult = await auth.api.getAccessToken({
      headers: requestHeaders,
      body: { providerId: "keycloak" },
    }).catch(() => null);

    if (tokenResult?.accessToken) {
      const authMe = await fetchAuthMe(tokenResult.accessToken);
      if (authMe) {
        return (
          <>
            <UserDashboardShell initialAuthMe={authMe} isGuest={false}>
              {children}
            </UserDashboardShell>
            <Toaster duration={5000} position="top-center" />
          </>
        );
      }
    }

    // Token dead or /auth/me failed - just logout and start fresh
    redirect("/logout");
  }

  // ─── Guest user flow ───────────────────────────────────────────────────
  const guestAccess = await hasValidGuestSession();

  if (!guestAccess) {
    redirect("/login?callbackUrl=%2Fuserdashboard");
  }

  return (
    <GuestProvider>
      <UserDashboardShell isGuest={true}>
        {children}
      </UserDashboardShell>
      <Toaster duration={5000} position="top-center" />
    </GuestProvider>
  );
}
