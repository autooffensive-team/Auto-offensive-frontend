"use client";

import { useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = () => {
    setIsPending(true);
    window.location.assign("/logout");
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-xl"
    >
      {isPending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Signing out
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  );
}
