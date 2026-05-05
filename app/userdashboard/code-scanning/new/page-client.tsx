"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FolderGit2,
  Layers,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { buildCodeScanningProjectHref } from "@/lib/scanner-route";
import {
  useGetProviderAccountsQuery,
  useGetProviderRepositoriesQuery,
  useGetProviderRepositoryBranchesQuery,
  useLazyGetProviderConnectUrlQuery,
} from "@/lib/redux/services/userdashboard/git/git-api";
import {
  useListCurrentUserScanIdsQuery,
  useTriggerScanMutation,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import type {
  GitProvider,
  ProviderAccount,
  ProviderRepository,
} from "@/types/git-provider";
import { FaGithub, FaGitlab } from "react-icons/fa";

const providers: GitProvider[] = ["github", "gitlab"];

const providerMeta: Record<
  GitProvider,
  {
    label: string;
    description: string;
    soft: string;
    button: string;
    Icon: typeof FaGithub;
  }
> = {
  github: {
    label: "GitHub",
    description: "Connect repositories from GitHub and bootstrap a code scanner project in one flow.",
    soft: "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950",
    button: "bg-slate-950 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
    Icon: FaGithub,
  },
  gitlab: {
    label: "GitLab",
    description: "Authorize GitLab, inspect namespaces, and prepare a repository for code scanning.",
    soft: "bg-orange-500 text-white",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
    Icon: FaGitlab,
  },
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readPayloadMessage(payload: unknown): string {
  if (payload == null || typeof payload !== "object") {
    return "";
  }

  const source = payload as { detail?: unknown; message?: unknown; error?: unknown };
  const detail = asText(source.detail).trim();
  if (detail) {
    return detail;
  }

  const message = asText(source.message).trim();
  if (message) {
    return message;
  }

  return asText(source.error).trim();
}

function readErrorMessage(error: unknown, fallback: string): string {
  const queryError = error as FetchBaseQueryError | { message?: string } | undefined;
  if (!queryError) {
    return fallback;
  }

  if ("status" in queryError) {
    const payloadMessage = readPayloadMessage(queryError.data);
    if (payloadMessage) {
      return payloadMessage;
    }
    if (typeof queryError.status === "number") {
      return `Request failed with status ${queryError.status}`;
    }
  }

  const message = "message" in queryError ? asText(queryError.message).trim() : "";
  return message || fallback;
}

function formatConnectedText(accounts: ProviderAccount[]): string {
  if (accounts.length === 0) {
    return "Not connected";
  }

  const username = asText(accounts[0]?.provider_username).trim();
  if (username) {
    return `Connected as ${username}`;
  }

  return `${accounts.length} connected account${accounts.length === 1 ? "" : "s"}`;
}

function filterRepositories(items: ProviderRepository[], searchTerm: string): ProviderRepository[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) {
    return items;
  }

  return items.filter((repository) => {
    const fullName = asText(repository.full_name).toLowerCase();
    const name = asText(repository.name).toLowerCase();
    const description = asText(repository.description).toLowerCase();
    return (
      fullName.includes(query) ||
      name.includes(query) ||
      description.includes(query)
    );
  });
}

function normalizeProjectKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[\-._:]+|[\-._:]+$/g, "");
}

function buildDefaultProjectKey(provider: GitProvider, repository: ProviderRepository): string {
  const fullName = asText(repository.full_name).trim();
  const name = asText(repository.name).trim();
  const base = fullName || name || provider;
  return normalizeProjectKey(`${provider}-${base}`);
}

function resolveRepositoryScanUrl(repository: ProviderRepository | null): string {
  if (!repository) {
    return "";
  }
  return asText(repository.clone_url).trim() || asText(repository.web_url).trim();
}

export default function CodeScanningNewPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProvider = searchParams.get("provider");

  const [selectedProvider, setSelectedProvider] = useState<GitProvider>(
    initialProvider === "gitlab" ? "gitlab" : "github",
  );
  const [selectedRepoKey, setSelectedRepoKey] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [branch, setBranch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [connectErrors, setConnectErrors] = useState<Partial<Record<GitProvider, string>>>({});
  const [connectingProvider, setConnectingProvider] = useState<GitProvider | null>(null);
  const [projectKeyTouched, setProjectKeyTouched] = useState(false);

  const githubAccountsQuery = useGetProviderAccountsQuery("github");
  const gitlabAccountsQuery = useGetProviderAccountsQuery("gitlab");
  const githubRepositoriesQuery = useGetProviderRepositoriesQuery("github");
  const gitlabRepositoriesQuery = useGetProviderRepositoriesQuery("gitlab");
  const currentScanRefsQuery = useListCurrentUserScanIdsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [triggerScan, { isLoading: isCreating }] = useTriggerScanMutation();
  const [triggerConnectUrl] = useLazyGetProviderConnectUrlQuery();

  const accountsByProvider = {
    github: githubAccountsQuery.data?.accounts ?? [],
    gitlab: gitlabAccountsQuery.data?.accounts ?? [],
  };
  const repositoriesByProvider = {
    github: githubRepositoriesQuery.data?.repositories ?? [],
    gitlab: gitlabRepositoriesQuery.data?.repositories ?? [],
  };

  const banner = useMemo(() => {
    const provider = searchParams.get("provider");
    const gitState = searchParams.get("git");
    const username = searchParams.get("username");
    const message = searchParams.get("message");

    if ((provider === "github" || provider === "gitlab") && gitState === "connected") {
      const label = providerMeta[provider].label;
      return {
        type: "success" as const,
        message: username
          ? `${label} connected as ${username}. Continue with repository selection.`
          : `${label} connected successfully.`,
      };
    }

    if ((provider === "github" || provider === "gitlab") && gitState === "error") {
      const label = providerMeta[provider].label;
      return {
        type: "error" as const,
        message: message || `Failed to connect ${label}.`,
      };
    }

    return null;
  }, [searchParams]);

  const repositories = repositoriesByProvider[selectedProvider];
  const connectedAccounts = accountsByProvider[selectedProvider];
  const filteredRepositories = useMemo(
    () => filterRepositories(repositories, repoSearch),
    [repositories, repoSearch],
  );

  const selectedRepository = useMemo(
    () =>
      repositories.find((repository) => {
        const key = asText(repository.repository_id) || asText(repository.full_name);
        return key === selectedRepoKey;
      }) ?? null,
    [repositories, selectedRepoKey],
  );
  const repositoryScanUrl = resolveRepositoryScanUrl(selectedRepository);

  const branchesQuery = useGetProviderRepositoryBranchesQuery(
    selectedRepository
      ? {
          provider: selectedProvider,
          fullName: asText(selectedRepository.full_name),
          repositoryId: asText(selectedRepository.repository_id),
          defaultBranch: asText(selectedRepository.default_branch),
        }
      : skipToken,
  );

  const branchOptions = branchesQuery.data?.branches ?? [];
  const resolvedDefaultBranch =
    asText(branchesQuery.data?.default_branch).trim() ||
    asText(selectedRepository?.default_branch).trim();
  const selectedBranchValue = branch || resolvedDefaultBranch || "";
  const normalizedProjectKey = normalizeProjectKey(projectKey);
  const existingProject = useMemo(
    () =>
      (currentScanRefsQuery.data?.tasks ?? []).find(
        (task) => task.project_key === normalizedProjectKey,
      ) ?? null,
    [currentScanRefsQuery.data?.tasks, normalizedProjectKey],
  );

  const providerError =
    connectErrors[selectedProvider] ||
    (selectedProvider === "github" && githubAccountsQuery.isError
      ? readErrorMessage(githubAccountsQuery.error, "Unable to load GitHub accounts.")
      : "") ||
    (selectedProvider === "gitlab" && gitlabAccountsQuery.isError
      ? readErrorMessage(gitlabAccountsQuery.error, "Unable to load GitLab accounts.")
      : "") ||
    (selectedProvider === "github" && githubRepositoriesQuery.isError
      ? readErrorMessage(githubRepositoriesQuery.error, "Unable to load GitHub repositories.")
      : "") ||
    (selectedProvider === "gitlab" && gitlabRepositoriesQuery.isError
      ? readErrorMessage(gitlabRepositoriesQuery.error, "Unable to load GitLab repositories.")
      : "");

  function handleSelectProvider(provider: GitProvider) {
    setSelectedProvider(provider);
    setSelectedRepoKey("");
    setRepoSearch("");
    setBranch("");
    setSubmitError(null);
  }

  function handleSelectRepository(repository: ProviderRepository) {
    const key = asText(repository.repository_id) || asText(repository.full_name);
    setSelectedRepoKey(key);
    setBranch("");
    setSubmitError(null);

    if (!projectKeyTouched) {
      setProjectKey(buildDefaultProjectKey(selectedProvider, repository));
    }
  }

  async function handleConnectProvider(provider: GitProvider) {
    setConnectingProvider(provider);
    setConnectErrors((current) => ({ ...current, [provider]: "" }));

    try {
      const payload = await triggerConnectUrl(provider, false).unwrap();
      const connectUrl = asText(payload.connect_url).trim();
      if (!connectUrl) {
        setConnectErrors((current) => ({
          ...current,
          [provider]: `Missing ${providerMeta[provider].label} connect URL from backend.`,
        }));
        return;
      }

      window.location.assign(connectUrl);
    } catch (error) {
      setConnectErrors((current) => ({
        ...current,
        [provider]: readErrorMessage(
          error,
          `Failed to start ${providerMeta[provider].label} connect flow.`,
        ),
      }));
    } finally {
      setConnectingProvider(null);
    }
  }

  async function handleCreate() {
    const trimmedProjectKey = normalizeProjectKey(projectKey);
    if (!trimmedProjectKey) {
      setSubmitError("Project key is required.");
      return;
    }
    if (existingProject) {
      setSubmitError("This SonarQube project already exists. Open the existing project instead of starting another scan.");
      return;
    }
    if (!selectedRepository) {
      setSubmitError("Choose a repository from a connected provider.");
      return;
    }
    if (!repositoryScanUrl) {
      setSubmitError("The selected repository does not expose an HTTP clone URL.");
      return;
    }

    setSubmitError(null);

    try {
      await triggerScan({
        project_key: trimmedProjectKey,
        branch: selectedBranchValue.trim() || null,
        repo_url: repositoryScanUrl,
      }).unwrap();

      const params = new URLSearchParams({
        started: trimmedProjectKey,
      });
      router.push(`/userdashboard/code-scanning?${params.toString()}`);
    } catch (error) {
      setSubmitError(readErrorMessage(error, "Failed to create scanner project."));
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Layers size={13} className="text-teal-500 dark:text-teal-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="text-[28px] font-bold leading-tight text-gray-900 dark:text-white">
            New Code Scanning Project
          </h1>
          <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
            Connect a provider, choose a repository, and create a scanner project once.
          </p>
        </div>

        <Link
          href="/userdashboard/code-scanning"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>
      </motion.div>

      {banner ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {banner.type === "success" ? (
            <CheckCircle2 size={15} />
          ) : (
            <XCircle size={15} />
          )}
          {banner.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            1. Connect provider
          </p>
          <div className="mt-4 space-y-3">
            {providers.map((provider) => {
              const meta = providerMeta[provider];
              const Icon = meta.Icon;
              const accounts = accountsByProvider[provider];
              const isSelected = provider === selectedProvider;
              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSelectProvider(provider)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                    isSelected
                      ? "border-teal-300 bg-teal-50/60 dark:border-teal-500/40 dark:bg-teal-500/10"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.soft}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                        {meta.label}
                      </p>
                      <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">
                        {formatConnectedText(accounts)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
              {providerMeta[selectedProvider].label} access
            </p>
            <p className="mt-2 text-[13px] leading-6 text-gray-500 dark:text-gray-400">
              {providerMeta[selectedProvider].description}
            </p>
            <button
              type="button"
              onClick={() => handleConnectProvider(selectedProvider)}
              disabled={connectingProvider === selectedProvider}
              className={`mt-4 w-full rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50 ${providerMeta[selectedProvider].button}`}
            >
              {connectingProvider === selectedProvider
                ? "Redirecting..."
                : connectedAccounts.length > 0
                  ? `Reconnect ${providerMeta[selectedProvider].label}`
                  : `Connect ${providerMeta[selectedProvider].label}`}
            </button>
            {providerError ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{providerError}</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="rounded-[28px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    2. Choose repository
                  </p>
                  <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                    Connected provider repositories appear here.
                  </p>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  {filteredRepositories.length} shown
                </div>
              </div>

              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  value={repoSearch}
                  onChange={(event) => setRepoSearch(event.target.value)}
                  placeholder={`Search ${providerMeta[selectedProvider].label} repositories...`}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="mt-4 grid max-h-[520px] gap-3 overflow-auto pr-1">
                {filteredRepositories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-[14px] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    {connectedAccounts.length === 0
                      ? `Connect ${providerMeta[selectedProvider].label} first to load repositories.`
                      : "No repositories match your search."}
                  </div>
                ) : (
                  filteredRepositories.map((repository) => {
                    const key = asText(repository.repository_id) || asText(repository.full_name);
                    const isSelected = key === selectedRepoKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectRepository(repository)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          isSelected
                            ? "border-teal-300 bg-teal-50/70 dark:border-teal-500/40 dark:bg-teal-500/10"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <FolderGit2 size={16} className="text-teal-500 dark:text-teal-400" />
                              <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                                {asText(repository.full_name) || asText(repository.name)}
                              </p>
                            </div>
                            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                              {asText(repository.description) || "No description provided"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              repository.is_private
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            }`}
                          >
                            {repository.is_private ? "Private" : "Public"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400">
                          <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-gray-700 dark:bg-gray-950/60">
                            Default: {asText(repository.default_branch) || "main"}
                          </span>
                          {asText(repository.web_url) ? (
                            <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-gray-700 dark:bg-gray-950/60">
                              Repository linked
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[26px] border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                3. Scan configuration
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    Project key
                  </label>
                  <input
                    value={projectKey}
                    onChange={(event) => {
                      setProjectKeyTouched(true);
                      setProjectKey(event.target.value);
                    }}
                    placeholder="github-acme-api-security"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                  />
                  <p className="mt-2 text-[12px] text-gray-500 dark:text-gray-400">
                    Used as the scanner project identifier. Invalid characters are normalized before submit.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    Branch
                  </label>
                  <select
                    value={selectedBranchValue}
                    onChange={(event) => setBranch(event.target.value)}
                    disabled={!selectedRepository}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">
                      {selectedRepository
                        ? branchesQuery.isFetching
                          ? "Loading branches..."
                          : "Select branch"
                        : "Choose repository first"}
                    </option>
                    {branchOptions.map((item) => (
                      <option key={asText(item.name)} value={asText(item.name)}>
                        {asText(item.name)}
                        {item.is_default ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900 dark:text-white">
                    <ShieldCheck size={15} className="text-teal-500 dark:text-teal-400" />
                    Scanner source preview
                  </div>
                  <div className="mt-3 space-y-2 text-[13px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-start justify-between gap-3">
                      <span>Provider</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {providerMeta[selectedProvider].label}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Repository</span>
                      <span className="text-right font-medium text-gray-900 dark:text-white">
                        {asText(selectedRepository?.full_name) || "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Branch</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBranchValue.trim() || "Not selected"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Clone URL</span>
                      <span className="max-w-[220px] break-all text-right font-medium text-gray-900 dark:text-white">
                        {repositoryScanUrl || "Not available"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Project key</span>
                      <span className="max-w-[220px] break-all text-right font-medium text-gray-900 dark:text-white">
                        {normalizedProjectKey || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Project status</span>
                      <span
                        className={`text-right font-medium ${
                          existingProject
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {currentScanRefsQuery.isFetching
                          ? "Checking..."
                          : existingProject
                            ? "Already created"
                            : "Ready to create"}
                      </span>
                    </div>
                  </div>
                </div>

                {existingProject ? (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>
                      This SonarQube project already exists, so another scan cannot be started from this setup flow.
                    </span>
                  </div>
                ) : null}

                {submitError ? (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                ) : null}

                {existingProject ? (
                  <Link
                    href={buildCodeScanningProjectHref(existingProject.project_key)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500 bg-teal-50 px-4 py-2.5 text-[14px] font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/15"
                  >
                    <ShieldCheck size={15} />
                    Open existing project
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating || currentScanRefsQuery.isFetching}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
                  >
                    {isCreating ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Plus size={15} />
                    )}
                    {isCreating ? "Creating project..." : "Create scanner project"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
