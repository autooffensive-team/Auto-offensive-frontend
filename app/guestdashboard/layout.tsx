import GuestDashboardShell from "@/components/layout/GuestDashboardShell";

export default function GuestDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestDashboardShell>{children}</GuestDashboardShell>;
}