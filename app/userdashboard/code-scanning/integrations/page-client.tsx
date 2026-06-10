"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  KeyRound,
  LoaderCircle,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useCreateScannerProjectMutation,
  useListScannerProjectsQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type { CITokenResponse } from "@/types/ci-token";

type ExpiryPreset = "30d" | "90d" | "180d" | "custom" | "never";

function normalizeProjectKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[\-._:]+|[\-._:]+$/g, "");
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isTokenExpired(token: CITokenResponse): boolean {
  if (!token.expires_at) {
    return false;
  }
  return new Date(token.expires_at).getTime() < Date.now();
}

function deriveTokenStatus(token: CITokenResponse): {
  label: string;
  className: string;
} {
  if (token.revoked_at || !token.is_active) {
    return {
      label: "Revoked",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
    };
  }
  if (isTokenExpired(token)) {
    return {
      label: "Expired",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }
  return {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
}

function toExpiryISOString(preset: ExpiryPreset, customDate: string): string | null {
  if (preset === "never") {
    return null;
  }
  if (preset === "custom") {
    if (!customDate) {
      return null;
    }
    return new Date(`${customDate}T23:59:59`).toISOString();
  }

  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 180;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}

function buildGithubPrivateRepoSnippet(projectId: string): string {
  const resolvedProjectId = projectId || "YOUR_PROJECT_ID";

  return `name: Platform code scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      # Assumptions:
      # 1. This repository is already connected in your platform with a GitHub account
      # 2. The connected GitHub account can access this private repository
      # 3. AUTO_OFFENSIVE_CI_TOKEN belongs to the same code-scanning project shown in the UI
      - name: Trigger backend-managed scan
        run: |
          cat <<EOF > payload.json
          {
            "project_id": "${resolvedProjectId}",
            "repo_url": "https://github.com/\${{ github.repository }}.git",
            "branch": "\${{ github.ref_name }}"
          }
          EOF
          curl -sS -X POST "\${{ secrets.AUTO_OFFENSIVE_URL }}/api/scanner/ci/start" \\
            -H "Content-Type: application/json" \\
            -H "X-CI-Token: \${{ secrets.AUTO_OFFENSIVE_CI_TOKEN }}" \\
            --data @payload.json`;
}

function buildGitlabSnippet(projectId: string): string {
  const resolvedProjectId = projectId || "YOUR_PROJECT_ID";

  return `platform_scan:
  script:
    - |
      cat <<EOF > payload.json
      {
        "project_id": "${resolvedProjectId}",
        "repo_url": "$CI_PROJECT_URL.git",
        "branch": "$CI_COMMIT_REF_NAME"
      }
      EOF
      curl -sS -X POST "$AUTO_OFFENSIVE_URL/api/scanner/ci/start" \\
        -H "Content-Type: application/json" \\
        -H "X-CI-Token: $AUTO_OFFENSIVE_CI_TOKEN" \\
        --data @payload.json
  variables:
    AUTO_OFFENSIVE_URL: $AUTO_OFFENSIVE_URL
    AUTO_OFFENSIVE_CI_TOKEN: $AUTO_OFFENSIVE_CI_TOKEN`;
}

function buildJenkinsSnippet(projectId: string): string {
  const resolvedProjectId = projectId || "YOUR_PROJECT_ID";

  return `stage('Platform Code Scan') {
  steps {
    withCredentials([string(credentialsId: 'auto-offensive-ci-token', variable: 'AUTO_OFFENSIVE_CI_TOKEN')]) {
      sh '''
        cat <<EOF > payload.json
        {
          "project_id": "${resolvedProjectId}",
          "repo_url": "$GIT_URL",
          "branch": "$BRANCH_NAME"
        }
        EOF
        curl -sS -X POST "$AUTO_OFFENSIVE_URL/api/scanner/ci/start" \\
          -H "Content-Type: application/json" \\
          -H "X-CI-Token: $AUTO_OFFENSIVE_CI_TOKEN" \\
          --data @payload.json
      '''
    }
  }
}`;
}

function ExampleBlock({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
        >
          <Copy size={13} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-xs leading-6 text-slate-200">
        <code>{body}</code>
      </pre>
    </div>
  );
}

export default function CodeScanningIntegrationsPageClient() {
  const searchParams = useSearchParams();
  const requestedProjectId = searchParams.get("project");

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectKeyInput, setProjectKeyInput] = useState("");
  const [projectKeyTouched, setProjectKeyTouched] = useState(false);
  const [projectCreationError, setProjectCreationError] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("90d");
  const [customDate, setCustomDate] = useState("");
  const [creationError, setCreationError] = useState<string | null>(null);
  const [latestPlainToken, setLatestPlainToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const { data: projects = [], isLoading: isProjectsLoading } = useListScannerProjectsQuery();
  const effectiveSelectedProjectId = useMemo(() => {
    if (selectedProjectId && projects.some((project) => project.project_id === selectedProjectId)) {
      return selectedProjectId;
    }
    if (requestedProjectId && projects.some((project) => project.project_id === requestedProjectId)) {
      return requestedProjectId;
    }
    return projects[0]?.project_id ?? "";
  }, [projects, requestedProjectId, selectedProjectId]);

  const [createScannerProject, { isLoading: isCreatingProject }] = useCreateScannerProjectMutation();

  const selectedProject = useMemo(
    () => projects.find((project) => project.project_id === effectiveSelectedProjectId) ?? null,
    [projects, effectiveSelectedProjectId],
  );
  const suggestedProjectKey = useMemo(
    () => normalizeProjectKey(projectName) || "",
    [projectName],
  );
  const pendingProjectKey = useMemo(() => {
    if (!projectKeyTouched) {
      return suggestedProjectKey;
    }
    return normalizeProjectKey(projectKeyInput);
  }, [projectKeyInput, projectKeyTouched, suggestedProjectKey]);
  const effectiveProjectKey = selectedProject?.project_key ?? "";

  const snippets = useMemo(() => {
    return {
      githubPrivate: buildGithubPrivateRepoSnippet(effectiveSelectedProjectId),
      gitlab: buildGitlabSnippet(effectiveSelectedProjectId),
      jenkins: buildJenkinsSnippet(effectiveSelectedProjectId),
    };
  }, [effectiveSelectedProjectId]);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProjectCreationError(null);

    if (!projectName.trim()) {
      setProjectCreationError("Project name is required.");
      return;
    }
    if (!pendingProjectKey) {
      setProjectCreationError("Project key is required.");
      return;
    }

    try {
      const response = await createScannerProject({
        display_name: projectName.trim(),
        project_key: pendingProjectKey,
        description: projectDescription.trim() || undefined,
      }).unwrap();

      setSelectedProjectId(response.project_id);
      setProjectName("");
      setProjectDescription("");
      setProjectKeyInput("");
      setProjectKeyTouched(false);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { detail?: string } }).data?.detail === "string"
          ? (error as { data: { detail: string } }).data.detail
          : "Failed to create scanner project.";
      setProjectCreationError(message);
    }
  }

  async function handleCopyToken() {
    if (!latestPlainToken) {
      return;
    }
    await navigator.clipboard.writeText(latestPlainToken);
    setCopiedToken(true);
    window.setTimeout(() => setCopiedToken(false), 1500);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CI/CD Integration
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generate project-scoped CI tokens for backend-managed code scanning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/userdashboard/code-scanning"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              Back to scans
            </Link>
            <Link
              href="/userdashboard/code-scanning/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#00d0b2] px-4 text-sm font-semibold text-slate-900 transition hover:bg-[#00b89e]"
            >
              Import repo
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <form className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40" onSubmit={handleCreateProject}>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Create code-scanning project
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    This project is only for SonarQube code scanning and CI tokens.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Project name
                    </label>
                    <input
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                      placeholder="Rumsay Client"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#00d0b2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Project key
                    </label>
                    <input
                      value={projectKeyTouched ? projectKeyInput : suggestedProjectKey}
                      onChange={(event) => {
                        setProjectKeyTouched(true);
                        setProjectKeyInput(event.target.value);
                      }}
                      placeholder="github-rumsay-client"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:border-[#00d0b2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {pendingProjectKey ? (
                        <>
                          Normalized key:{" "}
                          <span className="font-mono text-slate-700 dark:text-slate-200">{pendingProjectKey}</span>
                        </>
                      ) : (
                        "Use the key you want to group scans under in the code-scanning dashboard."
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(event) => setProjectDescription(event.target.value)}
                    placeholder="Optional notes for this code-scanning project"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#00d0b2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                {projectCreationError ? (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{projectCreationError}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00d0b2] px-4 text-sm font-semibold text-slate-900 transition hover:bg-[#00b89e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreatingProject ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Create project
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Create this once, then generate CI tokens below.
                  </span>
                </div>
              </form>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Code-scanning project
                </label>
                <select
                  value={effectiveSelectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#00d0b2] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  disabled={isProjectsLoading || projects.length === 0}
                >
                  {projects.length === 0 ? (
                    <option value="">No code-scanning projects yet</option>
                  ) : null}
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 shrink-0 text-amber-500" size={18} />
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Token handling
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    CI tokens are project-scoped and shown once. Store them in your CI secret manager.
                  </p>
                </div>
              </div>

              {latestPlainToken ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        Token created
                      </p>
                      <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                        Copy this now. It will not be shown again.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopyToken()}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                    >
                      <Copy size={13} />
                      {copiedToken ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-950 px-3 py-3 text-xs text-slate-100">
                    {latestPlainToken}
                  </code>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Generate a token to unlock the copy-paste CI snippets below.
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Selected project
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {selectedProject?.display_name ?? "No project selected"}
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                  {effectiveSelectedProjectId || "Project ID will appear here"}
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                  {effectiveProjectKey || "Project key will appear here"}
                </p>
                {selectedProject?.description ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {selectedProject.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Existing tokens
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Revoke tokens that should no longer be trusted by CI runners.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              CI setup examples
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Store only your frontend URL and the generated CI token in the CI system. The frontend proxies to the backend, and SonarQube credentials stay server-side.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ExampleBlock title="GitHub Actions · Private Repo" body={snippets.githubPrivate} />
            <ExampleBlock title="GitLab CI" body={snippets.gitlab} />
            <ExampleBlock title="Jenkins" body={snippets.jenkins} />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>
              For private GitHub repositories, the backend can only clone successfully when the same repository is already connected in your platform through a GitHub account with access.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
