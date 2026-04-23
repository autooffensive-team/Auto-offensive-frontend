import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UserDashboardShell from "@/components/layout/UserDashboardShell";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=%2Fuserdashboard");
  }

  return <UserDashboardShell>{children}</UserDashboardShell>;
}
