import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import KeycloakLoginButton from "@/components/auth/keycloak-login-button";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getCallbackUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/userdashboard";
  }
  return value;
}

function getErrorText(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return "";
  }
  return "Unable to start login. Please try again.";
}

function isManualLogin(raw: string | string[] | undefined): boolean {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return false;
  }
  return value === "1" || value.toLowerCase() === "true";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (session) {
    redirect("/userdashboard");
  }

  const params = searchParams ? await searchParams : undefined;
  const callbackURL = getCallbackUrl(params?.callbackUrl);
  const errorText = getErrorText(params?.error);
  const manualLogin = isManualLogin(params?.manual);
  const oauthErrorCallbackURL = `/login?callbackUrl=${encodeURIComponent(callbackURL)}&error=oauth_start_failed`;

  const shouldAutoStartLogin = !manualLogin && !errorText;

  const signInResult = shouldAutoStartLogin
    ? await auth.api
        .signInWithOAuth2({
          headers: requestHeaders,
          body: {
            providerId: "keycloak",
            callbackURL,
            errorCallbackURL: oauthErrorCallbackURL,
          },
        })
        .catch(() => null)
    : null;

  if (signInResult?.url) {
    redirect(signInResult.url);
  }

  const fallbackErrorText =
    errorText || (shouldAutoStartLogin && !signInResult ? "Unable to start login. Please try again." : "");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Auto Offensive
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Redirecting to login
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Authentication is handled by Keycloak.
          {shouldAutoStartLogin
            ? " You will be redirected automatically."
            : " Click below when you want to sign in again."}
        </p>

        {fallbackErrorText ? (
          <p className="mt-4 text-sm text-rose-600">{fallbackErrorText}</p>
        ) : null}

        <div className="mt-6">
          <KeycloakLoginButton callbackURL={callbackURL} autoStart={shouldAutoStartLogin} />
        </div>

        <p className="mt-6 text-sm text-slate-600">
          No account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-sky-700 hover:text-sky-800"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
