"use client";

import { useGetGatewayHealthQuery } from "@/lib/redux/services/gateway/gateway-api";

export default function BackendHealthCard() {
  const { data, error, isLoading, isFetching } = useGetGatewayHealthQuery();

  let statusText = "Unknown";
  if (isLoading || isFetching) {
    statusText = "Checking gateway...";
  } else if (error) {
    statusText = "Gateway unavailable";
  } else if (data?.status) {
    statusText = data.status;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        Backend Health (RTK Query via Next API)
      </p>
      <p className="mt-2 text-lg font-semibold">{statusText}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Browser calls <code>/api/backend/health</code>, backend URL stays server-side.
      </p>
    </div>
  );
}
