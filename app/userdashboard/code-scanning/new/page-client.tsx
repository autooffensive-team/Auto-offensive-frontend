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
  Eye,
  Code2,
  Shield,
  X,
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
import { useGetIntegrationAccountsQuery } from "@/lib/redux/services/userdashboard/integrations/integrations-api";
import { useGetAuthMeQuery } from "@/lib/redux/services/auth/auth-api";
import { useTriggerScanMutation } from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import {
  areProviderAccountQueriesReady,
  buildConnectedProviderMap,
} from "../../../../lib/redux/services/userdashboard/integrations/provider-account-gate";
import type {
  GitProvider,
  ProviderAccount,
  ProviderRepository,
} from "@/types/git-provider";
import { FaGithub, FaGitlab } from "@/components/icons/social-icons";

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
    button: "bg-slate-950 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-[#FCFCFA]",
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

// ─── Language SVG icons ───────────────────────────────────────────────────────

function IconTypeScript({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#3178C6" />
      <path d="M150.5 200.5V220c3.7 1.9 8 3.3 13 4.1 5 .9 10.3 1.3 15.8 1.3 5.3 0 10.4-.5 15.2-1.6 4.8-1.1 9-2.8 12.6-5.3 3.6-2.5 6.5-5.7 8.6-9.8 2.1-4.1 3.2-9.1 3.2-15 0-4.3-.6-8.1-1.9-11.3-1.3-3.2-3.1-6.1-5.5-8.6-2.4-2.5-5.3-4.8-8.7-6.8-3.4-2-7.2-3.9-11.4-5.7-3.1-1.3-5.8-2.6-8.2-3.8-2.4-1.2-4.4-2.5-6-3.8-1.6-1.3-2.9-2.7-3.7-4.2-.9-1.5-1.3-3.2-1.3-5.2 0-1.8.4-3.5 1.2-4.9.8-1.4 1.9-2.6 3.4-3.6 1.5-1 3.2-1.7 5.3-2.2 2.1-.5 4.4-.8 6.9-.8 1.8 0 3.7.1 5.7.4 2 .3 4 .7 6 1.3 2 .6 3.9 1.4 5.8 2.4 1.8 1 3.5 2.2 5 3.6v-18.7c-3.2-1.2-6.7-2.1-10.5-2.7-3.8-.6-8-.9-12.7-.9-5.2 0-10.2.6-14.9 1.7-4.7 1.1-8.9 2.9-12.4 5.4-3.5 2.5-6.3 5.7-8.4 9.6-2.1 3.9-3.1 8.6-3.1 14.1 0 7 1.9 12.9 5.8 17.8 3.9 4.9 9.8 9 17.7 12.4 3.2 1.3 6.2 2.6 8.9 3.9 2.7 1.3 5 2.6 6.9 4 1.9 1.4 3.4 3 4.5 4.7 1.1 1.7 1.6 3.7 1.6 5.9 0 1.7-.4 3.3-1.1 4.7-.7 1.4-1.8 2.6-3.2 3.7-1.4 1-3.2 1.8-5.3 2.4-2.1.6-4.6.9-7.3.9-4.8 0-9.5-.8-14.2-2.5-4.7-1.7-9-4.3-13-7.8Z" fill="white"/>
      <path d="M121.7 120.5H96v-17.4H168v17.4h-25.5v72.5h-20.8v-72.5Z" fill="white"/>
    </svg>
  );
}

function IconJavaScript({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#F7DF1E" />
      <path d="M67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.086-21.994ZM152.381 211.354l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.748-31.792 35.229-31.792 15.294 0 26.292 5.328 34.196 19.247l-18.728 12.03c-4.125-7.389-8.591-10.31-15.466-10.31-7.046 0-11.516 4.47-11.516 10.31 0 7.217 4.47 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.82-24.575Z" fill="#323330"/>
    </svg>
  );
}

function IconPHP({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#4F5B93"/>
      <ellipse cx="128" cy="128" rx="112" ry="60" fill="#8892BF"/>
      <ellipse cx="128" cy="128" rx="112" ry="60" fill="url(#php_g)" opacity="0.4"/>
      <path d="M80 108h16l-6 40H74l2-12H62l-2 12H44l6-40h16l-4 20h14l4-20ZM104 108h28c8 0 12 4 10 12l-4 16c-2 8-8 12-16 12h-12l-2 12h-16l12-52Zm10 12l-4 16h10c2 0 4-1 4-4l2-8c1-3-1-4-3-4h-9ZM146 108h28c8 0 12 4 10 12l-4 16c-2 8-8 12-16 12h-12l-2 12h-16l12-52Zm10 12l-4 16h10c2 0 4-1 4-4l2-8c1-3-1-4-3-4h-9Z" fill="white"/>
      <defs><linearGradient id="php_g" x1="16" y1="90" x2="240" y2="166" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
}

function IconFlutter({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#54C5F8"/>
      <path d="M145.38 48L54 139.38l33.56 33.56 124.93-124.94H145.38Z" fill="white"/>
      <path d="M145.21 152.03L111.62 185.6l33.59 33.59h67.3l-33.56-33.56 33.56-33.6h-67.3Z" fill="white"/>
      <path d="M111.62 185.6l33.59-33.57-33.56-33.56-33.6 33.6 33.57 33.53Z" fill="#01579B" fillOpacity="0.8"/>
    </svg>
  );
}

function IconJava({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#E76F00"/>
      <path d="M96 172s-8 4.6 5.6 6.2c16.3 1.9 24.6 1.6 42.6-1.8 0 0 4.7 2.9 11.3 5.5-40.2 17.2-91-1-59.5-9.9ZM90 148s-9 6.6 4.7 8c17.6 1.8 31.5 1.9 55.6-2.7 0 0 3.3 3.3 8.5 5.1-49.2 14.4-104 1.1-68.8-10.4Z" fill="white"/>
      <path d="M143 100.2c10 11.5-2.7 21.9-2.7 21.9s25.5-13.2 13.8-29.7c-10.9-15.4-19.3-23 26.1-49.3 0 0-71.4 17.8-37.2 57.1Z" fill="white"/>
      <path d="M184 190.8s5.9 4.9-6.5 8.6c-23.6 7.2-98.2 9.3-118.9.3-7.4-3.2 6.5-7.8 10.9-8.7 4.6-1 7.1-0.8 7.1-0.8-8.2-5.8-53.1 11.3-22.8 16.2 82.5 13.4 150.4-6 130.2-15.6ZM99.5 124.6s-37.5 8.9-13.3 12.2c10.2 1.4 30.6 1.1 49.5-.6 15.5-1.4 31.1-4.4 31.1-4.4s-5.5 2.3-9.4 5c-38.1 10-111.6 5.4-90.4-4.8 17.9-8.6 32.5-7.4 32.5-7.4ZM166 158.5c38.7-20.1 20.8-39.4 8.3-36.8-3.1.6-4.4 1.2-4.4 1.2s1.1-1.8 3.3-2.5c24.5-8.6 43.3 25.4-8 38.9 0 0 .6-.5.8-0.8Z" fill="white"/>
      <path d="M152 46s21.4 21.4-20.3 54.4c-33.4 26.3-7.6 41.3 0 58.5-19.5-17.5-33.7-32.9-24.1-47.2C121.8 92.5 160.3 82.2 152 46Z" fill="white"/>
    </svg>
  );
}

function IconPython({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#3776AB"/>
      <path d="M127.5 36c-51.4 0-48.2 22.3-48.2 22.3L79.4 82h49.3v7H57.2S28 85.6 28 137.5c0 51.9 28.7 50 28.7 50h17.2v-24s-.9-28.7 28.2-28.7h48.5s27.3.4 27.3-26.4V63.4S183.2 36 127.5 36Zm-26.9 15.6c4.9 0 8.8 3.9 8.8 8.8 0 4.9-3.9 8.8-8.8 8.8-4.9 0-8.8-3.9-8.8-8.8 0-4.9 3.9-8.8 8.8-8.8Z" fill="#FFD43B"/>
      <path d="M128.5 220c51.4 0 48.2-22.3 48.2-22.3l-.1-23.7h-49.3v-7h71.5s29.2 3.4 29.2-48.5c0-51.9-28.7-50-28.7-50h-17.2v24s.9 28.7-28.2 28.7H105.4s-27.3-.4-27.3 26.4v44.9S72.8 220 128.5 220Zm26.9-15.6c-4.9 0-8.8-3.9-8.8-8.8 0-4.9 3.9-8.8 8.8-8.8 4.9 0 8.8 3.9 8.8 8.8 0 4.9-3.9 8.8-8.8 8.8Z" fill="#3776AB"/>
    </svg>
  );
}

function IconCSharp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#512BD4"/>
      <path d="M128 40L48 87.3v85.4L128 220l80-47.3V87.3L128 40Zm0 20l60 35.5v71L128 202l-60-35.5v-71L128 60Z" fill="white" fillOpacity="0.3"/>
      <path d="M96.5 152.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9 0 16.8 4.8 21.1 12l17.3-10c-7-12.1-20.1-20.3-35.2-20-24.9.4-44.5 21-43.5 45.9 1 24.4 21.2 43.5 45.6 43.5 14.7 0 27.8-7 36-17.9l-16-11.3c-4.5 5.9-11.4 9.8-19.3 9.8-.3 0-.7 0-1-.1-.3 0-.7.1-1.1.1h-3.9ZM176 120h-8v-8h-8v8h-8v8h8v8h8v-8h8v-8ZM204 120h-8v-8h-8v8h-8v8h8v8h8v-8h8v-8Z" fill="white"/>
    </svg>
  );
}

function IconGo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="20" fill="#00ACD7"/>
      <path d="M42 155.5c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h35.7c.4 0 .5.3.3.6l-1.7 2.6c-.2.3-.7.6-1 .6L42 155.5ZM26 165.2c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h45.6c.4 0 .6.3.5.6l-.8 2.4c-.1.4-.5.6-.9.6L26 165.2ZM54 174.9c-.4 0-.5-.3-.3-.6l1.4-2.5c.2-.3.6-.6 1-.6h20c.4 0 .6.3.6.7l-.2 2.4c0 .4-.4.7-.7.7L54 174.9ZM232.5 148.2c-6.3 1.6-10.6 2.8-16.8 4.4-1.5.4-1.6.5-2.9-1-1.5-1.7-2.6-2.8-4.7-3.8-6.3-3.1-12.4-2.2-18.1 1.5-6.8 4.4-10.3 10.9-10.2 19 .1 8 5.6 14.6 13.5 15.7 6.8.9 12.5-1.5 17-6.6.9-1.1 1.7-2.3 2.7-3.7h-19.3c-2.1 0-2.6-1.3-1.9-3 1.3-3.1 3.7-8.3 5.1-10.9.3-.6 1-1.6 2.5-1.6h36.4c-.2 2.7-.2 5.4-.6 8.1-1.1 7.2-3.8 13.8-8.2 19.6-7.2 9.5-16.6 15.4-28.5 17-9.8 1.3-18.9-.6-26.9-6.6-7.4-5.6-11.6-13-12.7-22.2-1.3-10.9 1.9-20.7 8.5-29.3 7.1-9.3 16.5-15.2 28-17.3 9.4-1.7 18.4-.6 26.5 4.9 5.3 3.5 9.1 8.3 11.6 14.3.6.9.2 1.4-1 1.7Z" fill="white"/>
      <path d="M133 184.5c-9.1-.2-17.4-2.8-24.4-8.8-5.9-5.1-9.6-11.6-10.7-19.3-1.8-12.3 1.5-23.1 9.3-32.4 8.4-10 18.7-14.9 31.6-15.5 11.1-.5 21.3 2 29.9 9 7.9 6.5 12.1 14.8 12.5 25 .5 13.5-4 24.6-13.3 33.6-6.8 6.5-14.9 10.5-24.1 11.8-3.6.5-7.2.5-10.8.6Zm25.8-44.9c-.1-1.3-.1-2.3-.3-3.3-1.8-9.9-10.9-15.5-20.4-13.3-9.3 2.1-15.3 8-17.5 17.4-1.8 7.8 2 15.7 9.2 19 5.5 2.5 11 2.3 16.3-.3 7.8-3.8 12.1-9.9 12.7-19.5Z" fill="white"/>
    </svg>
  );
}

const SUPPORTED_LANGUAGES = [
  { name: "TypeScript", detail: "npm / yarn", Icon: IconTypeScript },
  { name: "JavaScript", detail: "npm / yarn", Icon: IconJavaScript },
  { name: "PHP", detail: "Composer", Icon: IconPHP },
  { name: "Flutter", detail: "Dart", Icon: IconFlutter },
  { name: "Java / Kotlin", detail: "Maven · Gradle", Icon: IconJava },
  { name: "Python", detail: "Pip", Icon: IconPython },
  { name: "C#", detail: ".NET", Icon: IconCSharp },
  { name: "Go", detail: "go modules", Icon: IconGo },
];

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

// ─── First-time Onboarding Modal ─────────────────────────────────────────────

function OnboardingModal({
  onAccept,
  onClose,
}: {
  onAccept: () => void;
  onClose: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 md:p-6"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="
            relative w-full sm:max-w-120 md:max-w-130
            overflow-hidden
            rounded-t-3xl sm:rounded-3xl
            border border-slate-200/70 dark:border-slate-700/60
            bg-[#FCFCFA] dark:bg-slate-950
            shadow-xl shadow-black/10
            max-h-[92dvh] sm:max-h-[88dvh]
            flex flex-col
          "
          onClick={(event) => event.stopPropagation()}
        >
          {/* ── Drag handle (mobile only) ── */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">

            {/* ── Header ── */}
            <div className="px-5 sm:px-7 pt-4 sm:pt-6 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="
                  flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center
                  rounded-xl sm:rounded-2xl
                  border border-teal-200/70 bg-teal-50
                  dark:border-teal-500/20 dark:bg-teal-500/10
                ">
                  <Shield size={18} className="text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] sm:text-[17px] font-bold text-slate-900 dark:text-white leading-snug">
                    Before you connect
                  </p>
                  <p className="mt-0.5 text-[12px] sm:text-[13px] lg:text-[14px] text-slate-400 dark:text-slate-500">
                    How Auto Offensive accesses your code
                  </p>
                </div>
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                   className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-[#FCFCFA] text-slate-400 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="h-px mx-5 sm:mx-7 bg-slate-100 dark:bg-slate-800/80" />

            {/* ── Access info rows ── */}
            <div className="px-5 sm:px-7 pt-4 pb-3 space-y-2.5">
              {/* Read-only */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/15">
                  <Eye size={13} className="text-teal-600 dark:text-teal-400" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-slate-900 dark:text-white">
                    Read-only access
                  </p>
                  <p className="mt-1 text-[12px] lg:text-[14px] leading-[1.6] text-slate-500 dark:text-slate-400">
                    After connecting GitHub or GitLab, we can read your authorized repos — public and private.{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      We never edit, delete, create, or push
                    </span>{" "}
                    anything.
                  </p>
                </div>
              </div>

              {/* Scan only */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/15">
                  <Code2 size={13} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] lg:text-[14px] font-semibold text-slate-900 dark:text-white">
                    Used for scanning only
                  </p>
                  <p className="mt-1 text-[12px] lg:text-[14px] leading-[1.6] text-slate-500 dark:text-slate-400">
                    Access is exclusively used to run security and code analysis scans. Your code is never stored or shared with third parties.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Supported languages ── */}
            <div className="px-5 sm:px-7 pb-5">
              <p className="mb-2.5 text-[10px] sm:text-[11px] lg:text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Supported languages & package managers
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-[#FCFCFA] px-3 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/50"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md overflow-hidden">
                      <lang.Icon size={18} />
                    </span>
                    <span className="text-[12px] lg:text-[14px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {lang.name}
                    </span>
                    <span className="ml-auto text-[11px] lg:text-[13px] text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline">
                      {lang.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer: pinned to bottom ── */}
          <div className="
            shrink-0
            border-t border-slate-100 dark:border-slate-800/80
            bg-slate-50/80 dark:bg-slate-900/60
            px-5 sm:px-7 pt-4 pb-5 sm:pb-6
          ">
            {/* Checkbox */}
            <label className="
              flex cursor-pointer items-start gap-3
              rounded-xl border border-slate-200 bg-[#FCFCFA] px-4 py-3
              transition-colors hover:border-slate-300 hover:bg-slate-50/80
              dark:border-slate-700/80 dark:bg-slate-900/60 dark:hover:border-slate-600
            ">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-500 focus:ring-teal-500 dark:border-slate-600"
              />
              <span className="text-[12.5px] sm:text-[13px] lg:text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                I understand Auto Offensive has read-only access to my repositories and agree to the{" "}
                <Link
                  href="/terms-of-service"
                  className="font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </Link>
                .
              </span>
            </label>

            {/* CTA button */}
            <button
              type="button"
              onClick={() => { if (accepted) onAccept(); }}
              disabled={!accepted}
              className="
                mt-3 w-full inline-flex items-center justify-center gap-2
                rounded-xl bg-teal-500 px-5 py-3
                text-[13.5px] sm:text-[14px] font-semibold text-white
                transition-all duration-150
                hover:bg-teal-600
                active:scale-[0.99]
                disabled:cursor-not-allowed disabled:opacity-35
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40
              "
            >
              <CheckCircle2 size={15} strokeWidth={2.5} />
              Got it — connect my account
            </button>

            <p className="mt-2.5 text-center text-[11px] lg:text-[13px] text-slate-400 dark:text-slate-600">
              Hidden after a GitHub or GitLab account is connected
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

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
                      : "w-9 h-9 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
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
                  hidden sm:block text-[11px] lg:text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors
                  ${isActive ? "text-teal-600 dark:text-teal-400" : isCompleted ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}
                `}
              >
                {step.shortLabel}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-3 h-px relative overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
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
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40
        ${isSelected
          ? "border-teal-500/60 bg-teal-50/50 dark:border-teal-500/40 dark:bg-teal-500/[0.07] shadow-sm shadow-teal-500/10"
          : "border-slate-200 bg-[#FCFCFA] hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
        }
      `}
    >
      {isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full bg-teal-500" />
      )}

      <div className="flex items-start gap-3">
        <div className={`
          mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
          ${providerIconColor}
        `}>
          <ProviderIcon size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-0.5">
            {owner && (
              <span className="text-[12px] lg:text-[15px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                {owner}<span className="text-slate-300 dark:text-slate-600">/</span>
              </span>
            )}
            <span className={`text-[13px] lg:text-[16px] font-semibold truncate ${isSelected ? "text-teal-700 dark:text-teal-300" : "text-slate-900 dark:text-white"}`}>
              {name}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500">
              <GitBranch size={10} strokeWidth={2} />
              {defaultBranch}
            </span>
            <span className={`
              inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] lg:text-[13px] font-semibold
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

  // ── Onboarding modal state ──
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [hasDismissedOnboardingModal, setHasDismissedOnboardingModal] = useState(false);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);

  const hasAppliedCallbackResume = useRef(false);

  const { data: authMe } = useGetAuthMeQuery();
  const integrationAccountsQuery = useGetIntegrationAccountsQuery();
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
  const connectedProviderMap = buildConnectedProviderMap(
    integrationAccountsQuery.data ?? [],
  );
  const hasConnectedProvider =
    connectedProviderMap.github || connectedProviderMap.gitlab;
  const isProviderAccountsReady = areProviderAccountQueriesReady(
    integrationAccountsQuery,
  );
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

  // ── Determine whether to show onboarding modal ──
  useEffect(() => {
    const userId = authMe?.user?.user_id?.trim();
    if (!userId || !isProviderAccountsReady) return;

    // Already has a connected provider — skip the modal entirely
    if (hasConnectedProvider) {
      setShowOnboardingModal(false);
      setIsOnboardingReady(true);
      return;
    }

    setShowOnboardingModal(!hasDismissedOnboardingModal);
    setIsOnboardingReady(true);
  }, [
    authMe?.user?.user_id,
    hasConnectedProvider,
    hasDismissedOnboardingModal,
    isProviderAccountsReady,
  ]);

  useEffect(() => {
    if (initialProvider === "github" || initialProvider === "gitlab") {
      setSelectedProvider(initialProvider);
    }
  }, [initialProvider]);

  useEffect(() => {
    if (hasAppliedCallbackResume.current) return;

    const gitState = searchParams.get("git");
    const provider = searchParams.get("provider");
    const isConnectedProvider =
      (provider === "github" || provider === "gitlab") &&
      connectedProviderMap[provider];

    if (!isConnectedProvider) return;

    const shouldResumeRepositoryStep = gitState === "connected" || requestedStep >= 2;
    if (!shouldResumeRepositoryStep) return;

    hasAppliedCallbackResume.current = true;
    setSelectedProvider(provider);
    setCompletedSteps((prev) => {
      if (prev.has(1)) return prev;
      return new Set([...prev, 1]);
    });
    setCurrentStep((prev) => (prev < 2 ? 2 : prev));
  }, [connectedProviderMap, requestedStep, searchParams]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleOnboardingAccept() {
    setHasDismissedOnboardingModal(true);
    setShowOnboardingModal(false);
  }

  function handleOnboardingClose() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/userdashboard/code-scanning");
  }

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
    if (!selectedRepository) return;
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
    <>
      {/* ── Onboarding modal (shown until a provider account is connected) ── */}
      {isOnboardingReady && showOnboardingModal && (
        <OnboardingModal onAccept={handleOnboardingAccept} onClose={handleOnboardingClose} />
      )}

      <div className="min-h-screen">
      <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3 sm:gap-4"
        >
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Zap size={11} className="text-teal-500 sm:size-3.25 lg:size-4 dark:text-teal-400" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-teal-600 sm:text-[10px] md:text-[11px] lg:text-[13px] dark:text-teal-400">
                Repository Scanner
              </span>
            </div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl md:text-2xl lg:text-[18px] dark:text-white">
              New Code Scanning Run
            </h1>
            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs md:text-sm lg:text-[16px] dark:text-slate-400">
              Follow the steps below to connect, select, and trigger a scan.
            </p>
          </div>
          <Link
            href="/userdashboard/code-scanning"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:rounded-xl sm:px-3 sm:py-2 sm:text-[13px] md:px-4 md:py-2.5 md:text-sm lg:text-[16px] lg:px-5 lg:py-3 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={12} className="sm:size-3.5" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </motion.div>

        {/* Banner */}
        {banner ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] lg:text-[14px] ${
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
          className="rounded-xl border border-slate-200 bg-[#FCFCFA] sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Stepper header */}
          <div className="px-3 pt-4 pb-3 border-b border-slate-100 sm:px-5 sm:pt-5 sm:pb-4 md:px-8 md:pt-6 md:pb-5 dark:border-slate-800">
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

            {/* Mobile step label */}
            <div className="mt-3 sm:hidden text-center">
              <span className="text-[10px] lg:text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                Step {currentStep} of {STEPS.length}
              </span>
              <p className="text-xs lg:text-[14px] font-bold text-slate-900 dark:text-white">
                {STEPS[currentStep - 1]?.label}
              </p>
            </div>
          </div>

          {/* Step content */}
          <div className="p-3 sm:p-5 md:p-8">
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
                  <div className="mb-4 sm:mb-5">
                    <p className="text-sm font-bold text-slate-900 sm:text-base md:text-lg lg:text-[18px] dark:text-white">Connect a Provider</p>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs md:text-sm lg:text-[16px] dark:text-slate-400">
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
                          className={`group relative cursor-pointer rounded-xl sm:rounded-2xl border-2 px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-teal-400 bg-teal-50/60 dark:border-teal-500/50 dark:bg-teal-500/10"
                                : "border-slate-200 bg-[#FCFCFA] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                          }`}
                        >
                          {isConnected && (
                            <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] lg:text-[13px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Connected
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl sm:rounded-2xl ${meta.soft}`}>
                              <Icon size={22} />
                            </div>
                            <div>
                              <p className="text-[15px] font-bold text-slate-900 lg:text-[18px] dark:text-white">{meta.label}</p>
                              <p className="mt-0.5 text-[12px] text-slate-500 lg:text-[16px] dark:text-slate-400">
                                {formatConnectedText(accounts)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-[13px] leading-5 text-slate-500 lg:text-[16px] lg:leading-6 dark:text-slate-400">
                            {meta.description}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleConnectProvider(provider); }}
                            disabled={connectingProvider === provider}
                            className={`mt-4 w-full rounded-xl px-4 py-2 text-[13px] font-semibold lg:text-[16px] lg:py-2.5 transition-colors disabled:opacity-50 ${
                              isConnected
                                ? "border border-slate-200 bg-[#FCFCFA] text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                : meta.button
                            }`}
                          >
                            {connectingProvider === provider
                              ? "Redirecting..."
                              : isConnected
                                ? `Re-authorize ${meta.label}`
                                : `Connect ${meta.label}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {providerError && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] lg:text-[14px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 max-w-2xl">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{providerError}</span>
                    </div>
                  )}

                  {/* Step 1 footer */}
                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <p className="text-[13px] text-slate-400 lg:text-[16px] dark:text-slate-500">
                      {canProceedStep1
                        ? `${providerMeta[selectedProvider].label} is connected. You can proceed.`
                        : "Connect a provider to continue."}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      disabled={!canProceedStep1}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold lg:text-[16px] lg:px-6 text-black transition-colors hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <p className="text-sm font-bold text-slate-900 sm:text-base md:text-lg lg:text-[18px] dark:text-white">Choose a Repository</p>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs md:text-sm lg:text-[16px] dark:text-slate-400">
                      Select which repository to scan. Your changes are saved as you select.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="mb-4 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/60">
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
                                relative inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold lg:text-[16px] transition-all duration-150
                                ${isActive
                                   ? "bg-[#FCFCFA] text-slate-900 shadow-sm shadow-gray-200/80 dark:bg-slate-700 dark:text-white dark:shadow-gray-900"
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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

                      <div className="relative mb-3">
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />
                        <input
                          value={repoSearch}
                          onChange={(e) => setRepoSearch(e.target.value)}
                          placeholder={`Search ${providerMeta[selectedProvider].label} repositories…`}
                          className="
                             w-full rounded-xl border border-slate-200 bg-[#FCFCFA] py-2.5 pl-9 pr-14
                            text-[13px] lg:text-[16px] text-slate-900 placeholder-slate-400
                            focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                            dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500
                            dark:focus:border-teal-500
                          "
                        />
                        <span className="
                          absolute right-3 top-1/2 -translate-y-1/2
                          rounded-md border border-slate-200 bg-slate-50
                          px-1.5 py-0.5 text-[10px] lg:text-[13px] font-semibold text-slate-400
                          dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500
                        ">
                          {filteredRepositories.length}
                        </span>
                      </div>

                      {connectedAccounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
                          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            <FolderGit2 size={18} className="text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-[14px] lg:text-[18px] font-semibold text-slate-700 dark:text-slate-300">
                            No account connected
                          </p>
                          <p className="mt-1 text-[13px] lg:text-[16px] text-slate-400 dark:text-slate-500 max-w-xs">
                            Go back and connect{" "}
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {providerMeta[selectedProvider].label}
                            </span>{" "}
                            to load your repositories.
                          </p>
                        </div>
                      ) : filteredRepositories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                          <Search size={16} className="mb-2 text-slate-300 dark:text-slate-600" />
                          <p className="text-[13px] lg:text-[16px] text-slate-400 dark:text-slate-500">
                            No repositories match <span className="font-medium text-slate-600 dark:text-slate-300">&ldquo;{repoSearch}&rdquo;</span>
                          </p>
                        </div>
                      ) : (
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

                    <div className="w-full md:w-72 lg:w-80 shrink-0">
                      <div className="
                        sticky top-4 rounded-xl border border-slate-200 bg-[#FCFCFA]
                        dark:border-slate-800 dark:bg-slate-800/40
                        overflow-hidden
                      ">
                        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] lg:text-[13px] text-slate-400 dark:text-slate-500">
                            Selected
                          </p>
                        </div>

                        {selectedRepository ? (
                          <div className="px-4 py-4 space-y-3">
                            <div className="flex items-start gap-2.5">
                              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                selectedProvider === "gitlab"
                                  ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
                              }`}>
                                {selectedProvider === "gitlab" ? <FaGitlab size={15} /> : <FaGithub size={15} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] lg:text-[16px] font-semibold text-slate-900 dark:text-white truncate">
                                  {asText(selectedRepository.name)}
                                </p>
                                <p className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500 truncate">
                                  {asText(selectedRepository.full_name).split("/")[0]}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500">Visibility</span>
                                <span className={`
                                  inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] lg:text-[13px] font-semibold
                                  ${selectedRepository.is_private
                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  }
                                `}>
                                  {selectedRepository.is_private ? <Lock size={9} strokeWidth={2.5} /> : <Globe size={9} strokeWidth={2.5} />}
                                  {selectedRepository.is_private ? "Private" : "Public"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500">Default branch</span>
                                <span className="flex items-center gap-1 text-[11px] lg:text-[14px] font-medium text-slate-700 dark:text-slate-300">
                                  <GitBranch size={11} strokeWidth={2} />
                                  {asText(selectedRepository.default_branch) || "main"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500">Provider</span>
                                <span className="text-[11px] lg:text-[14px] font-medium text-slate-700 dark:text-slate-300 capitalize">
                                  {selectedProvider}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2.5 dark:bg-teal-500/10">
                              <CheckCircle2 size={13} className="text-teal-500 dark:text-teal-400 shrink-0" />
                              <span className="text-[11px] lg:text-[14px] font-semibold text-teal-700 dark:text-teal-400">
                                Ready to configure
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                              selectedProvider === "gitlab"
                                ? "bg-orange-50 text-orange-300 dark:bg-orange-500/10 dark:text-orange-700"
                                : "bg-slate-100 text-slate-300 dark:bg-slate-700/60 dark:text-slate-600"
                            }`}>
                              {selectedProvider === "gitlab" ? <FaGitlab size={18} /> : <FaGithub size={18} />}
                            </div>
                            <p className="text-[12px] lg:text-[15px] text-slate-400 dark:text-slate-500 leading-snug">
                              Pick a repository<br />from the list
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <button
                      type="button"
                      onClick={() => handleBackToStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] font-semibold lg:text-[16px] text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft size={14} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      disabled={!canProceedStep2}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-[14px] font-semibold lg:text-[16px] lg:px-6 text-black transition-colors hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <p className="text-sm font-bold text-slate-900 sm:text-base md:text-lg lg:text-[18px] dark:text-white">Scan Configuration</p>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs md:text-sm lg:text-[16px] dark:text-slate-400">
                      Finalize your project key and target branch before triggering the scan.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-3 sm:space-y-4">
                       <div className="rounded-xl border border-slate-200 bg-[#FCFCFA] dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                         <div className="px-4 pt-4 pb-3">
                           <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] lg:text-[14px] text-slate-400 dark:text-slate-500">
                             <ShieldCheck size={13} />
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
                              w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5
                              text-[14px] lg:text-[16px] font-mono text-slate-900 placeholder-gray-300
                              focus:border-teal-500 focus:bg-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-teal-500/20
                              dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-600
                              dark:focus:bg-slate-900 transition-colors
                            "
                          />
                        </div>
                        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                          <span className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500 shrink-0">Normalized:</span>
                          <code className={`text-[12px] lg:text-[14px] font-mono truncate ${
                            normalizeProjectKey(projectKey)
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-slate-300 dark:text-slate-600 italic"
                          }`}>
                            {normalizeProjectKey(projectKey) || "not set"}
                          </code>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-[#FCFCFA] dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                        <div className="px-4 pt-4 pb-3">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] lg:text-[14px] text-slate-400 dark:text-slate-500">
                            <GitBranch size={13} />
                            Target Branch
                          </label>
                          <div className="relative">
                            <GitBranch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <select
                              value={selectedBranchValue}
                              onChange={(e) => setBranch(e.target.value)}
                              disabled={!selectedRepository}
                              className="
                                w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5
                                text-[14px] lg:text-[16px] text-slate-900
                              focus:border-teal-500 focus:bg-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-teal-500/20
                                disabled:opacity-50 disabled:cursor-not-allowed
                                dark:border-slate-700 dark:bg-slate-800 dark:text-white
                                dark:focus:bg-slate-900 transition-colors
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
                        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                          {branchesQuery.isFetching ? (
                            <LoaderCircle size={13} className="animate-spin text-slate-400 dark:text-slate-500" />
                          ) : (
                            <GitBranch size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          )}
                          <span className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500">
                            {branchesQuery.isFetching
                              ? "Fetching branches from remote…"
                              : selectedBranchValue
                                ? `Scanning branch: ${selectedBranchValue}`
                                : "Select the branch you want to scan"}
                          </span>
                        </div>
                      </div>

                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] lg:text-[16px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        >
                          <AlertCircle size={15} className="mt-0.5 shrink-0" />
                          <span>{submitError}</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl border border-slate-200 bg-[#FCFCFA] dark:border-slate-800 dark:bg-slate-800/40 overflow-hidden">
                        <div className="border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] lg:text-[14px] text-slate-400 dark:text-slate-500">
                            Scan Target
                          </p>
                        </div>
                        <div className="px-4 py-3.5 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              selectedProvider === "gitlab"
                                ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300"
                            }`}>
                              {selectedProvider === "gitlab" ? <FaGitlab size={15} /> : <FaGithub size={15} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] lg:text-[16px] font-semibold text-slate-900 dark:text-white truncate">
                                {asText(selectedRepository?.name) || "—"}
                              </p>
                              <p className="text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500 truncate">
                                {asText(selectedRepository?.full_name).split("/")[0] || providerMeta[selectedProvider].label}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-700" />

                          <div className="space-y-2.5">
                            {[
                              {
                                label: "Branch",
                                value: selectedBranchValue.trim() || "—",
                                icon: <GitBranch size={12} strokeWidth={2} />,
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
                                <span className="shrink-0 text-[11px] lg:text-[14px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                                  {icon}
                                  {label}
                                </span>
                                <span className={`text-right text-[11px] lg:text-[14px] break-all text-slate-700 dark:text-slate-300 max-w-48 ${mono ? "font-mono" : "font-medium"}`}>
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-[#FCFCFA] dark:border-slate-800 dark:bg-slate-800/40 overflow-hidden">
                        <div className="border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] lg:text-[14px] text-slate-400 dark:text-slate-500">
                            Readiness
                          </p>
                        </div>
                        <div className="px-4 py-3 space-y-2.5">
                          {[
                            { label: "Repository selected", ok: !!selectedRepository },
                            { label: "Branch chosen", ok: !!selectedBranchValue.trim() },
                            { label: "Project key set", ok: !!normalizeProjectKey(projectKey) },
                            { label: "Clone URL available", ok: !!repositoryScanUrl },
                          ].map(({ label, ok }) => (
                            <div key={label} className="flex items-center gap-2.5">
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                                ok ? "bg-teal-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                              }`}>
                                {ok
                                  ? <CheckCircle2 size={11} strokeWidth={3} />
                                  : <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                }
                              </div>
                              <span className={`text-[12px] lg:text-[15px] font-medium ${
                                ok ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                              }`}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                        {!!selectedRepository && !!selectedBranchValue.trim() && !!normalizeProjectKey(projectKey) && !!repositoryScanUrl && (
                          <div className="border-t border-teal-100 bg-teal-50 px-4 py-3 dark:border-teal-500/20 dark:bg-teal-500/10">
                            <div className="flex items-center gap-2">
                              <Zap size={13} className="text-teal-500 dark:text-teal-400 shrink-0" />
                              <span className="text-[11px] lg:text-[15px] font-semibold text-teal-700 dark:text-teal-400">
                                All checks passed — ready to scan
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <button
                      type="button"
                      onClick={() => handleBackToStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] font-semibold lg:text-[16px] text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft size={14} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-[14px] font-semibold lg:text-[16px] lg:px-7 text-black shadow-sm shadow-teal-500/30 transition-all hover:bg-teal-600 hover:shadow-teal-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
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
      </div>
    </>
  );
}
