"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type KeycloakLoginButtonProps = {
  callbackURL?: string;
  autoStart?: boolean;
  prompt?: string;
};

function buildLoginUrl(callbackURL: string, prompt: string | undefined): string {
  const searchParams = new URLSearchParams({
    callbackUrl: callbackURL,
  });

  if (prompt) {
    searchParams.set("prompt", prompt);
  }

  return `/api/auth/keycloak/login?${searchParams.toString()}`;
}

export default function KeycloakLoginButton({
  callbackURL = "/userdashboard",
  autoStart = true,
  prompt,
}: KeycloakLoginButtonProps) {
  const [pending, setPending] = useState(false);
  const hasStartedRef = useRef(false);

  const startLogin = useCallback(() => {
    setPending(true);
    window.location.assign(buildLoginUrl(callbackURL, prompt));
  }, [callbackURL, prompt]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    window.setTimeout(() => {
      void startLogin();
    }, 0);
  }, [autoStart, callbackURL, startLogin]);

  return (
    <div className="w-full space-y-4">
      {autoStart || pending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
          <LoaderCircle className="h-4 w-4 animate-spin text-sky-700 dark:text-sky-300" />
          <p>{pending ? "Redirecting to login page..." : "Preparing login..."}</p>
        </div>
      ) : null}
      {!autoStart ? (
        <Button
          type="button"
          onClick={() => {
            void startLogin();
          }}
          disabled={pending}
          className="w-full rounded-xl"
        >
          {pending ? "Redirecting..." : "Continue to login"}
        </Button>
      ) : null}
    </div>
  );
}
