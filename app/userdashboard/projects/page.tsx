import { headers } from "next/headers";

import ProjectsPageClient from "./projects-page-client";
import { auth } from "@/lib/auth";
import { readOptionalEnv, readRequiredEnv } from "@/lib/server-env";
import type { UserProject } from "@/lib/redux/services/userdashboard/project/project-api";

const gatewayBaseUrl =
  readOptionalEnv("BACKEND_URL", "") || readRequiredEnv("FASTAPI_GATEWAY_URL");

async function getInitialProjects(requestHeaders: Headers): Promise<UserProject[]> {
  const tokenResult = await auth.api.getAccessToken({
    headers: requestHeaders,
    body: {
      providerId: "keycloak",
    },
  }).catch(() => null);

  const accessToken = tokenResult?.accessToken;
  if (!accessToken) {
    return [];
  }

  const response = await fetch(new URL("/projects", gatewayBaseUrl), {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return [];
  }

  const body = (await response.json()) as UserProject[] | { projects?: UserProject[] };
  return Array.isArray(body) ? body : body.projects ?? [];
}

export default async function ProjectsPage() {
  const requestHeaders = await headers();
  const initialProjects = await getInitialProjects(requestHeaders);

  return <ProjectsPageClient initialProjects={initialProjects} />;
}
