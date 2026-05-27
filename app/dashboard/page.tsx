import { redirect } from "next/navigation";

type DashboardCallbackPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readFirst(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
  return "";
}

export default async function DashboardCallbackPage({
  searchParams,
}: DashboardCallbackPageProps) {
  const params = (await searchParams) ?? {};
  const gitState = readFirst(params.git);
  const provider = readFirst(params.provider);
  const username = readFirst(params.username);
  const message = readFirst(params.message);

  const target = new URLSearchParams();

  if (provider === "github" || provider === "gitlab") {
    target.set("provider", provider);
  }

  if (gitState === "connected" || gitState === "error") {
    target.set("git", gitState);
    target.set("step", gitState === "connected" ? "2" : "1");
  }

  if (username) {
    target.set("username", username);
  }

  if (message) {
    target.set("message", message);
  }

  const query = target.toString();
  redirect(query ? `/userdashboard/code-scanning/new?${query}` : "/userdashboard");
}
