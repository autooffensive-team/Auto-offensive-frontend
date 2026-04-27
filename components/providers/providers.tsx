"use client";

import { ReduxProvider } from "./redux-provider";
import { OfflineProvider } from "./offline-provider";
import { PwaProvider } from "./pwa-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <PwaProvider />
      <OfflineProvider>{children}</OfflineProvider>
    </ReduxProvider>
  );
}
