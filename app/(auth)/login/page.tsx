import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 transition-colors duration-300 dark:bg-[#09090B]">
      <div className="grid min-h-150 w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition-colors duration-300 md:grid-cols-2 dark:border-gray-700 dark:bg-[#111114]">

        {/* ── Left Side — Login form panel ── */}
        <div className="flex flex-col justify-center border-b border-slate-200/80 bg-white px-12 py-10 transition-colors duration-300 md:border-b-0 md:border-r dark:border-gray-700 dark:bg-[#111114]">
          {/* Logo at top center */}
          <div className="mb-10 flex justify-center">
            <Link href="/">
              <Image
                src="/Auto_Offensive_Light-mode.png"
                alt="Auto Offensive Logo"
                width={160}
                height={52}
                className="object-contain dark:hidden"
              />
              <Image
                src="/Auto_Offensive_Dark-mode.png"
                alt="Auto Offensive Logo"
                width={160}
                height={52}
                className="hidden object-contain dark:block"
                unoptimized
              />
            </Link>
          </div>

          {/* Login content */}
          <div className="w-full max-w-sm mx-auto">
            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {shouldAutoStartLogin ? "Redirecting to login" : "Continue to login"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {shouldAutoStartLogin
                ? "Please wait a moment while we take you to Keycloak."
                : "Your sign-in session needs a quick restart. Continue when you\u2019re ready."}
            </p>

            {/* Error */}
            {errorText ? (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {errorText}
              </p>
            ) : null}

            {/* Buttons */}
            <div className="mt-8 space-y-3">
              <KeycloakLoginButton
                callbackURL={callbackURL}
                autoStart={shouldAutoStartLogin}
                prompt={prompt}
              />

              {!shouldAutoStartLogin ? (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 bg-white py-6 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to homepage
                  </Link>
                </Button>
              ) : null}
            </div>

            {/* Divider — or explore first */}
            <div className="mt-6 flex items-center">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="px-4 text-xs text-slate-400 dark:text-slate-500">
                or explore first
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Guest button */}
            <div className="mt-4">
              <a
                href="/api/guest/start"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FACC15] bg-[#FEF3C7] px-4 py-4 text-base font-medium text-[#B45309] transition hover:bg-[#FDE68A] dark:border-[#FACC15] dark:bg-[#FEF3C7]/10 dark:text-[#FACC15] dark:hover:bg-[#FEF3C7]/20"
              >
                Try as guest
                <span className="text-sm opacity-70">(3 free scans)</span>
              </a>
            </div>

            {/* Register link */}
            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              No account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* ── Right Side — Image panel ── */}
        <div className="hidden md:flex relative overflow-hidden">
          {/* Background image */}
          <Image
            src="/ready.webp"
            alt="Auto Offensive Security"
            fill
            className="object-cover w-full h-full"
            loading="eager"
            unoptimized
          />
        </div>

      </div>
    </div>
  );
}
