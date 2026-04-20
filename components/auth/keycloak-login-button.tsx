"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

type KeycloakLoginButtonProps = {
  callbackURL?: string;
  autoStart?: boolean;
};

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unable to start login.";
  }

  const maybe = error as { message?: unknown };
  if (typeof maybe.message === "string" && maybe.message.trim()) {
    return maybe.message;
  }

  return "Unable to start login.";
}

export default function KeycloakLoginButton({
  callbackURL = "/userdashboard",
  autoStart = true,
}: KeycloakLoginButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const startLogin = useCallback(async () => {
    setPending(true);
    setError(null);

    const result = await authClient.signIn.oauth2({
      providerId: "keycloak",
      callbackURL,
      errorCallbackURL: `/login?callbackUrl=${encodeURIComponent(callbackURL)}`,
    });

    if (result.error) {
      setError(getErrorMessage(result.error));
      setPending(false);
    }
  }, [callbackURL]);

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
    <div className="w-full space-y-3">
      <p className="text-sm text-slate-600">
        {pending ? "Redirecting to Keycloak..." : "Preparing login..."}
      </p>
      {!autoStart ? (
        <button
          type="button"
          onClick={() => {
            void startLogin();
          }}
          disabled={pending}
          className="inline-flex items-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Try Keycloak login again
        </button>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
