import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UserDashboardShell from "@/components/layout/UserDashboardShell";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";
import type { AuthMeResponse } from "@/types/auth";
import { Toaster } from "sonner";

const gatewayBaseUrl =
  readOptionalEnv("BACKEND_URL", "") || readRequiredEnv("FASTAPI_GATEWAY_URL");

async function getInitialAuthMe(requestHeaders: Headers): Promise<AuthMeResponse | null> {
  const tokenResult = await auth.api.getAccessToken({
    headers: requestHeaders,
    body: {
      providerId: "keycloak",
    },
  }).catch(() => null);

  const accessToken = tokenResult?.accessToken;
  if (!accessToken) {
    return null;
  }

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

  const initialAuthMe = await getInitialAuthMe(requestHeaders);

  return (
    <>
      <UserDashboardShell initialAuthMe={initialAuthMe}>
        {children}
      </UserDashboardShell>
      <Toaster duration={5000} />
    </>
  );
}
