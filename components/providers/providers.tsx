"use client";

import { ReduxProvider } from "./redux-provider";
import { OfflineProvider } from "./offline-provider";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <OfflineProvider>{children}</OfflineProvider>
    </ReduxProvider>
  );
}
