"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  Layers,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  XCircle,
  Zap,
  Lock,
  Globe,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useGetProviderAccountsQuery,
  useGetProviderRepositoriesQuery,
  useGetProviderRepositoryBranchesQuery,
  useLazyGetProviderConnectUrlQuery,
} from "@/lib/redux/services/userdashboard/git/git-api";
import { useTriggerScanMutation } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
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
  if (payload == null || typeof payload !== "object") return "";
  const source = payload as { detail?: unknown; message?: unknown; error?: unknown };
  const detail = asText(source.detail).trim();
  if (detail) return detail;
  const message = asText(source.message).trim();
  if (message) return message;
  return asText(source.error).trim();
}

function readErrorMessage(error: unknown, fallback: string): string {
  const queryError = error as FetchBaseQueryError | { message?: string } | undefined;
  if (!queryError) return fallback;
  if ("status" in queryError) {
    const payloadMessage = readPayloadMessage(queryError.data);
    if (payloadMessage) return payloadMessage;
    if (typeof queryError.status === "number") return `Request failed with status ${queryError.status}`;
  }
  const message = "message" in queryError ? asText(queryError.message).trim() : "";
  return message || fallback;
}

function formatConnectedText(accounts: ProviderAccount[]): string {
  if (accounts.length === 0) return "Not connected";
  const username = asText(accounts[0]?.provider_username).trim();
  if (username) return `Connected as ${username}`;
  return `${accounts.length} connected account${accounts.length === 1 ? "" : "s"}`;
}

function filterRepositories(items: ProviderRepository[], searchTerm: string): ProviderRepository[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return items;
  return items.filter((repository) => {
    const fullName = asText(repository.full_name).toLowerCase();
    const name = asText(repository.name).toLowerCase();
    const description = asText(repository.description).toLowerCase();
    return fullName.includes(query) || name.includes(query) || description.includes(query);
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
  if (!repository) return "";
  return asText(repository.clone_url).trim() || asText(repository.web_url).trim();
}

function resolveRequestedStep(searchParams: ReturnType<typeof useSearchParams>): number {
  const rawStep = Number(searchParams.get("step"));
  if (!Number.isInteger(rawStep)) return 1;
  if (rawStep < 1 || rawStep > STEPS.length) return 1;
  return rawStep;
}

// ─── Stepper config ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Connect Provider", shortLabel: "Provider", icon: Layers },
  { id: 2, label: "Choose Repository", shortLabel: "Repository", icon: FolderGit2 },
  { id: 3, label: "Scan Configuration", shortLabel: "Configure", icon: ShieldCheck },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = completedSteps.has(step.id);
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`
                  relative flex items-center justify-center rounded-full transition-all duration-300
                  ${isCompleted
                    ? "w-9 h-9 bg-teal-500 text-white shadow-md shadow-teal-500/30"
                    : isActive
                      ? "w-9 h-9 bg-teal-500 text-white ring-4 ring-teal-500/20 shadow-md shadow-teal-500/30"
                      : "w-9 h-9 bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 size={17} strokeWidth={2.5} />
                ) : (
                  <StepIcon size={15} strokeWidth={2} />
                )}
                {isActive && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-teal-400 opacity-25" />
                )}
              </div>
              <span
                className={`
                  hidden sm:block text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors
                  ${isActive ? "text-teal-600 dark:text-teal-400" : isCompleted ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}
                `}
              >
                {step.shortLabel}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-3 h-px relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`absolute inset-y-0 left-0 bg-teal-500 transition-all duration-500 ${
                    completedSteps.has(step.id) ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Repository Card ──────────────────────────────────────────────────────────

function RepositoryCard({
  repository,
  provider,
  isSelected,
  onClick,
}: {
  repository: ProviderRepository;
  provider: GitProvider;
  isSelected: boolean;
  onClick: () => void;
}) {
  const name = asText(repository.name);
  const owner = asText(repository.full_name).split("/")[0] ?? "";
  const defaultBranch = asText(repository.default_branch) || "main";
  const isPrivate = repository.is_private;

  const ProviderIcon = provider === "gitlab" ? FaGitlab : FaGithub;
  const providerIconColor =
    provider === "gitlab"
      ? isSelected
        ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
        : "bg-orange-50 text-orange-400 dark:bg-orange-500/10 dark:text-orange-500 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20"
      : isSelected
        ? "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40
        ${isSelected
          ? "border-teal-500/60 bg-teal-50/50 dark:border-teal-500/40 dark:bg-teal-500/[0.07] shadow-sm shadow-teal-500/10"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800/50"
        }
      `}
    >
      {/* Selected indicator stripe */}
      {isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full bg-teal-500" />
      )}

      <div className="flex items-start gap-3">
        {/* Provider icon box */}
        <div className={`
          mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
          ${providerIconColor}
        `}>
          <ProviderIcon size={15} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-0.5">
            {owner && (
              <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium shrink-0">
                {owner}<span className="text-gray-300 dark:text-gray-600">/</span>
              </span>
            )}
            <span className={`text-[13px] font-semibold truncate ${isSelected ? "text-teal-700 dark:text-teal-300" : "text-gray-900 dark:text-white"}`}>
              {name}
            </span>
          </div>



          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <GitBranch size={10} strokeWidth={2} />
              {defaultBranch}
            </span>
            <span className={`
              inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold
              ${isPrivate
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              }
            `}>
              {isPrivate ? <Lock size={9} strokeWidth={2.5} /> : <Globe size={9} strokeWidth={2.5} />}
              {isPrivate ? "Private" : "Public"}
            </span>
          </div>
        </div>

        {/* Checkmark */}
        {isSelected && (
          <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 mt-0.5">
            <CheckCircle2 size={12} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CodeScanningNewPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProvider = searchParams.get("provider");
  const requestedStep = resolveRequestedStep(searchParams);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
  const hasAppliedCallbackResume = useRef(false);

  const githubAccountsQuery = useGetProviderAccountsQuery("github");
  const gitlabAccountsQuery = useGetProviderAccountsQuery("gitlab");
  const githubRepositoriesQuery = useGetProviderRepositoriesQuery("github");
  const gitlabRepositoriesQuery = useGetProviderRepositoriesQuery("gitlab");
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
      return { type: "error" as const, message: message || `Failed to connect ${label}.` };
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

  useEffect(() => {
    if (initialProvider === "github" || initialProvider === "gitlab") {
      setSelectedProvider(initialProvider);
    }
  }, [initialProvider]);

  useEffect(() => {
    if (hasAppliedCallbackResume.current) {
      return;
    }

    const gitState = searchParams.get("git");
    const provider = searchParams.get("provider");
    const isConnectedProvider =
      (provider === "github" || provider === "gitlab") &&
      accountsByProvider[provider].length > 0;

    if (!isConnectedProvider) {
      return;
    }

    const shouldResumeRepositoryStep = gitState === "connected" || requestedStep >= 2;
    if (!shouldResumeRepositoryStep) {
      return;
    }

    hasAppliedCallbackResume.current = true;
    setSelectedProvider(provider);
    setCompletedSteps((prev) => {
      if (prev.has(1)) return prev;
      return new Set([...prev, 1]);
    });
    setCurrentStep((prev) => (prev < 2 ? 2 : prev));
  }, [accountsByProvider, requestedStep, searchParams]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

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
        [provider]: readErrorMessage(error, `Failed to start ${providerMeta[provider].label} connect flow.`),
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
      const payload = await triggerScan({
        project_key: trimmedProjectKey,
        branch: selectedBranchValue.trim() || null,
        repo_url: repositoryScanUrl,
      }).unwrap();
      const params = new URLSearchParams({
        started: trimmedProjectKey,
        scan_id: payload.scan_id,
      });
      router.push(`/userdashboard/code-scanning?${params.toString()}`);
    } catch (error) {
      setSubmitError(readErrorMessage(error, "Failed to trigger code scan."));
    }
  }

  // ─── Step navigation ────────────────────────────────────────────────────────

  function goToStep(step: number) {
    if (step < currentStep || completedSteps.has(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  }

  function handleNextFromStep1() {
    setCompletedSteps((prev) => new Set([...prev, 1]));
    setCurrentStep(2);
  }

  function handleNextFromStep2() {
    if (!selectedRepository) {
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, 2]));
    setCurrentStep(3);
  }

  function handleBackToStep(step: number) {
    setCurrentStep(step);
  }

  const canProceedStep1 = connectedAccounts.length > 0;
  const canProceedStep2 = !!selectedRepository;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Zap size={13} className="text-teal-500 dark:text-teal-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Repository Scanner
            </span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight text-gray-900 dark:text-white">
            New Code Scanning Run
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400">
            Follow the steps below to connect, select, and trigger a scan.
          </p>
        </div>
        <Link
          href="/userdashboard/code-scanning"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 sm:px-4 sm:py-2.5 text-[13px] sm:text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Projects</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </motion.div>

      {/* Banner */}
      {banner ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {banner.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {banner.message}
        </motion.div>
      ) : null}

      {/* Stepper card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[28px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Stepper header */}
        <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

          {/* Mobile step label */}
          <div className="mt-3 sm:hidden text-center">
            <span className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">
              Step {currentStep} of {STEPS.length}
            </span>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">
              {STEPS[currentStep - 1]?.label}
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="p-5 sm:p-8">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Connect Provider ── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-5">
                  <p className="text-[18px] font-bold text-gray-900 dark:text-white">Connect a Provider</p>
                  <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                    Select a Git provider and authorize access to continue.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-2xl">
                  {providers.map((provider) => {
                    const meta = providerMeta[provider];
                    const Icon = meta.Icon;
                    const accounts = accountsByProvider[provider];
                    const isSelected = provider === selectedProvider;
                    const isConnected = accounts.length > 0;

                    return (
                      <div
                        key={provider}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectProvider(provider)}
                        onKeyDown={(e) => e.key === "Enter" && handleSelectProvider(provider)}
                        className={`group relative cursor-pointer rounded-2xl border-2 px-5 py-5 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-teal-400 bg-teal-50/60 dark:border-teal-500/50 dark:bg-teal-500/10"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                        }`}
                      >
                        {isConnected && (
                          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Connected
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.soft}`}>
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-gray-900 dark:text-white">{meta.label}</p>
                            <p className="mt-0.5 text-[12px] text-gray-500 dark:text-gray-400">
                              {formatConnectedText(accounts)}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-[13px] leading-5 text-gray-500 dark:text-gray-400">
                          {meta.description}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleConnectProvider(provider); }}
                          disabled={connectingProvider === provider}
                          className={`mt-4 w-full rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors disabled:opacity-50 ${meta.button}`}
                        >
                          {connectingProvider === provider
                            ? "Redirecting..."
                            : isConnected
                              ? `Reconnect ${meta.label}`
                              : `Connect ${meta.label}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {providerError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 max-w-2xl">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{providerError}</span>
                  </div>
                )}

                {/* Step 1 footer */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <p className="text-[13px] text-gray-400 dark:text-gray-500">
                    {canProceedStep1
                      ? `${providerMeta[selectedProvider].label} is connected. You can proceed.`
                      : "Connect a provider to continue."}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    disabled={!canProceedStep1}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next: Choose Repository
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Choose Repository ── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <p className="text-[18px] font-bold text-gray-900 dark:text-white">Choose a Repository</p>
                  <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                    Select which repository to scan. Your changes are saved as you select.
                  </p>
                </div>

                {/* Two-column layout on md+ */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">

                  {/* ── Left column: provider tabs + search + list ── */}
                  <div className="flex-1 min-w-0">

                    {/* Provider tab switcher — Vercel-style segmented control */}
                    <div className="mb-4 inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/60">
                      {providers.map((provider) => {
                        const meta = providerMeta[provider];
                        const Icon = meta.Icon;
                        const isActive = provider === selectedProvider;
                        const accounts = accountsByProvider[provider];
                        const isConnected = accounts.length > 0;
                        return (
                          <button
                            key={provider}
                            type="button"
                            onClick={() => handleSelectProvider(provider)}
                            className={`
                              relative inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-150
                              ${isActive
                                ? "bg-white text-gray-900 shadow-sm shadow-gray-200/80 dark:bg-gray-700 dark:text-white dark:shadow-gray-900"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              }
                            `}
                          >
                            <Icon size={13} />
                            {meta.label}
                            {isConnected && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search input */}
                    <div className="relative mb-3">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                      <input
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        placeholder={`Search ${providerMeta[selectedProvider].label} repositories…`}
                        className="
                          w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-14
                          text-[13px] text-gray-900 placeholder-gray-400
                          focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                          dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500
                          dark:focus:border-teal-500
                        "
                      />
                      <span className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        rounded-md border border-gray-200 bg-gray-50
                        px-1.5 py-0.5 text-[10px] font-semibold text-gray-400
                        dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500
                      ">
                        {filteredRepositories.length}
                      </span>
                    </div>

                    {/* Repository list */}
                    {connectedAccounts.length === 0 ? (
                      /* Empty — not connected */
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                          <FolderGit2 size={18} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">
                          No account connected
                        </p>
                        <p className="mt-1 text-[13px] text-gray-400 dark:text-gray-500 max-w-xs">
                          Go back and connect{" "}
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            {providerMeta[selectedProvider].label}
                          </span>{" "}
                          to load your repositories.
                        </p>
                      </div>
                    ) : filteredRepositories.length === 0 ? (
                      /* Empty — no match */
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
                        <Search size={16} className="mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-[13px] text-gray-400 dark:text-gray-500">
                          No repositories match <span className="font-medium text-gray-600 dark:text-gray-300">&ldquo;{repoSearch}&rdquo;</span>
                        </p>
                      </div>
                    ) : (
                      /* Repository list */
                      <div className="flex flex-col gap-2 max-h-105 overflow-y-auto pr-0.5 -mr-0.5">
                        {filteredRepositories.map((repository) => {
                          const key = asText(repository.repository_id) || asText(repository.full_name);
                          return (
                            <RepositoryCard
                              key={key}
                              repository={repository}
                              provider={selectedProvider}
                              isSelected={key === selectedRepoKey}
                              onClick={() => handleSelectRepository(repository)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Right column: selected repo summary ── */}
                  <div className="w-full md:w-60 lg:w-65 shrink-0">
                    <div className="
                      sticky top-4 rounded-xl border border-gray-200 bg-gray-50/60
                      dark:border-gray-800 dark:bg-gray-800/40
                      overflow-hidden
                    ">
                      {/* Header */}
                      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                          Selected
                        </p>
                      </div>

                      {selectedRepository ? (
                        <div className="px-4 py-4 space-y-3">
                          {/* Repo name */}
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              selectedProvider === "gitlab"
                                ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
                            }`}>
                              {selectedProvider === "gitlab" ? <FaGitlab size={13} /> : <FaGithub size={13} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                                {asText(selectedRepository.name)}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                {asText(selectedRepository.full_name).split("/")[0]}
                              </p>
                            </div>
                          </div>

                          {/* Meta rows */}
                          <div className="space-y-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">Visibility</span>
                              <span className={`
                                inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold
                                ${selectedRepository.is_private
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                }
                              `}>
                                {selectedRepository.is_private ? <Lock size={8} strokeWidth={2.5} /> : <Globe size={8} strokeWidth={2.5} />}
                                {selectedRepository.is_private ? "Private" : "Public"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">Default branch</span>
                              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                <GitBranch size={10} strokeWidth={2} />
                                {asText(selectedRepository.default_branch) || "main"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">Provider</span>
                              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {selectedProvider}
                              </span>
                            </div>
                          </div>

                          {/* Confirm badge */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-500/10">
                            <CheckCircle2 size={12} className="text-teal-500 dark:text-teal-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                              Ready to configure
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                          <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
                            selectedProvider === "gitlab"
                              ? "bg-orange-50 text-orange-300 dark:bg-orange-500/10 dark:text-orange-700"
                              : "bg-gray-100 text-gray-300 dark:bg-gray-700/60 dark:text-gray-600"
                          }`}>
                            {selectedProvider === "gitlab" ? <FaGitlab size={16} /> : <FaGithub size={16} />}
                          </div>
                          <p className="text-[12px] text-gray-400 dark:text-gray-500 leading-snug">
                            Pick a repository<br />from the list
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 footer */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <button
                    type="button"
                    onClick={() => handleBackToStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    disabled={!canProceedStep2}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next: Configure Scan
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Scan Configuration ── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <p className="text-[18px] font-bold text-gray-900 dark:text-white">Scan Configuration</p>
                  <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                    Finalize your project key and target branch before triggering the scan.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

                  {/* ── Left: form fields ── */}
                  <div className="space-y-4">

                    {/* Project key field */}
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                      <div className="px-4 pt-4 pb-3">
                        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                          <ShieldCheck size={11} />
                          Project Key
                        </label>
                        <input
                          value={projectKey}
                          onChange={(e) => {
                            setProjectKeyTouched(true);
                            setProjectKey(e.target.value);
                          }}
                          placeholder="github-acme-api-security"
                          className="
                            w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5
                            text-[14px] font-mono text-gray-900 placeholder-gray-300
                            focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20
                            dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-600
                            dark:focus:bg-gray-900 transition-colors
                          "
                        />
                      </div>
                      {/* Live normalized preview */}
                      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">Normalized:</span>
                        <code className={`text-[12px] font-mono truncate ${
                          normalizeProjectKey(projectKey)
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-gray-300 dark:text-gray-600 italic"
                        }`}>
                          {normalizeProjectKey(projectKey) || "not set"}
                        </code>
                      </div>
                    </div>

                    {/* Branch field */}
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                      <div className="px-4 pt-4 pb-3">
                        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                          <GitBranch size={11} />
                          Target Branch
                        </label>
                        <div className="relative">
                          <GitBranch size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                          <select
                            value={selectedBranchValue}
                            onChange={(e) => setBranch(e.target.value)}
                            disabled={!selectedRepository}
                            className="
                              w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3.5 py-2.5
                              text-[14px] text-gray-900
                              focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20
                              disabled:opacity-50 disabled:cursor-not-allowed
                              dark:border-gray-700 dark:bg-gray-800 dark:text-white
                              dark:focus:bg-gray-900 transition-colors
                            "
                          >
                            <option value="">
                              {selectedRepository
                                ? branchesQuery.isFetching
                                  ? "Loading branches…"
                                  : "Select a branch"
                                : "Choose a repository first"}
                            </option>
                            {branchOptions.map((item) => (
                              <option key={asText(item.name)} value={asText(item.name)}>
                                {asText(item.name)}{item.is_default ? " (default)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Branch hint footer */}
                      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                        {branchesQuery.isFetching ? (
                          <LoaderCircle size={11} className="animate-spin text-gray-400 dark:text-gray-500" />
                        ) : (
                          <GitBranch size={11} className="text-gray-400 dark:text-gray-500 shrink-0" />
                        )}
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          {branchesQuery.isFetching
                            ? "Fetching branches from remote…"
                            : selectedBranchValue
                              ? `Scanning branch: ${selectedBranchValue}`
                              : "Select the branch you want to scan"}
                        </span>
                      </div>
                    </div>

                    {/* Error */}
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                      >
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{submitError}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* ── Right: scan summary panel ── */}
                  <div className="flex flex-col gap-3">

                    {/* Repo context card */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40 overflow-hidden">
                      <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                          Scan Target
                        </p>
                      </div>
                      <div className="px-4 py-3.5 space-y-3">
                        {/* Provider + repo */}
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            selectedProvider === "gitlab"
                              ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300"
                          }`}>
                            {selectedProvider === "gitlab" ? <FaGitlab size={13} /> : <FaGithub size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                              {asText(selectedRepository?.name) || "—"}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                              {asText(selectedRepository?.full_name).split("/")[0] || providerMeta[selectedProvider].label}
                            </p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-700" />

                        {/* Meta rows */}
                        <div className="space-y-2">
                          {[
                            {
                              label: "Branch",
                              value: selectedBranchValue.trim() || "—",
                              icon: <GitBranch size={10} strokeWidth={2} />,
                              mono: false,
                            },
                            {
                              label: "Clone URL",
                              value: repositoryScanUrl
                                ? repositoryScanUrl.replace(/^https?:\/\//, "")
                                : "—",
                              icon: null,
                              mono: true,
                            },
                          ].map(({ label, value, icon, mono }) => (
                            <div key={label} className="flex items-start justify-between gap-2">
                              <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                {icon}
                                {label}
                              </span>
                              <span className={`text-right text-[11px] break-all text-gray-700 dark:text-gray-300 max-w-37.5 ${mono ? "font-mono" : "font-medium"}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Readiness checklist */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40 overflow-hidden">
                      <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                          Readiness
                        </p>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        {[
                          {
                            label: "Repository selected",
                            ok: !!selectedRepository,
                          },
                          {
                            label: "Branch chosen",
                            ok: !!selectedBranchValue.trim(),
                          },
                          {
                            label: "Project key set",
                            ok: !!normalizeProjectKey(projectKey),
                          },
                          {
                            label: "Clone URL available",
                            ok: !!repositoryScanUrl,
                          },
                        ].map(({ label, ok }) => (
                          <div key={label} className="flex items-center gap-2">
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                              ok
                                ? "bg-teal-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}>
                              {ok
                                ? <CheckCircle2 size={10} strokeWidth={3} />
                                : <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                              }
                            </div>
                            <span className={`text-[12px] font-medium ${
                              ok ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                            }`}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* All-clear banner */}
                      {!!selectedRepository && !!selectedBranchValue.trim() && !!normalizeProjectKey(projectKey) && !!repositoryScanUrl && (
                        <div className="border-t border-teal-100 bg-teal-50 px-4 py-2.5 dark:border-teal-500/20 dark:bg-teal-500/10">
                          <div className="flex items-center gap-1.5">
                            <Zap size={11} className="text-teal-500 dark:text-teal-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                              All checks passed — ready to scan
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3 footer */}
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <button
                    type="button"
                    onClick={() => handleBackToStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-teal-500/30 transition-all hover:bg-teal-600 hover:shadow-teal-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isCreating ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Zap size={14} />
                    )}
                    {isCreating ? "Triggering scan…" : "Trigger Scan"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}