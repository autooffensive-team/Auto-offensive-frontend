import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { auth } from "@/lib/auth";
import KeycloakLoginButton from "@/components/auth/keycloak-login-button";
import { Button } from "@/components/ui/button";

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

function getPrompt(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
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
  const prompt = getPrompt(params?.prompt);
  const shouldAutoStartLogin = !manualLogin && !errorText;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
          <LoaderCircle
            className={`h-6 w-6 text-sky-700 ${shouldAutoStartLogin ? "animate-spin" : ""}`}
          />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Auto Offensive
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          {shouldAutoStartLogin ? "Redirecting to login page" : "Continue to login"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {shouldAutoStartLogin
            ? "Please wait a moment while we take you to Keycloak."
            : "Your sign-in session needs a quick restart. Continue when you're ready."}
        </p>

        {errorText ? (
          <p className="mt-4 text-sm text-rose-600">{errorText}</p>
        ) : null}

        <div className="mt-6 flex gap-3 rounded-xl overflow-hidden">
          <div className="flex-1">
            <KeycloakLoginButton
              callbackURL={callbackURL}
              autoStart={shouldAutoStartLogin}
              prompt={prompt}
            />
          </div>

          {!shouldAutoStartLogin ? (
            <div className="flex-1">
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full rounded-xl border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>
            </div>
          ) : null}
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