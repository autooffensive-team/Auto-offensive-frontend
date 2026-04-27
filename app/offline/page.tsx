import type { Metadata } from "next";
import Offline from "@/app/offline";

export const metadata: Metadata = {
  title: "Offline | Auto-Offensive",
};

export default function OfflinePage() {
  return <Offline />;
}
