"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type KeycloakLoginButtonProps = {
  callbackURL?: string;
  autoStart?: boolean;
};

function buildLoginUrl(callbackURL: string): string {
  return `/auth/keycloak/login?callbackUrl=${encodeURIComponent(callbackURL)}`;
}

export default function KeycloakLoginButton({
  callbackURL = "/userdashboard",
  autoStart = true,
}: KeycloakLoginButtonProps) {
  const [pending, setPending] = useState(false);
  const hasStartedRef = useRef(false);

  const startLogin = useCallback(async () => {
    setPending(true);
    window.location.assign(buildLoginUrl(callbackURL));
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
    <div className="w-full space-y-4">
      {autoStart || pending ? (
        <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin text-sky-700" />
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
