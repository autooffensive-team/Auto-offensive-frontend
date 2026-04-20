import { headers } from "next/headers";
import { ShieldCheck, UserRound, Mail, BadgeCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/auth/sign-out-button";
import BackendHealthCard from "@/components/userdashboard/backend-health-card";

export default async function UserDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_-44px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0f1720] md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
              <ShieldCheck className="h-4 w-4" />
              Authenticated Session
            </p>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                You returned from Keycloak successfully and Better Auth created a session for this frontend.
              </p>
            </div>
          </div>

          <SignOutButton />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Display Name
            </p>
            <p className="mt-2 text-lg font-semibold">
              {session?.user?.name || "Unknown user"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="mt-2 text-lg font-semibold">
              {session?.user?.email || "No email returned"}
            </p>
          </div>

          <BackendHealthCard />

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5 md:col-span-2">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Session Snapshot
            </p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
