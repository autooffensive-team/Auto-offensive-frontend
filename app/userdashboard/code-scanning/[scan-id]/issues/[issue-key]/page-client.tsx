"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  LoaderCircle,
  MessageSquare,
  NotebookTabs,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { buildCodeScanningIssueHref, buildCodeScanningProjectHref, isLikelyScanId } from "@/lib/scanner-route";
import {
  useGetIssueDetailQuery,
  useGetScanDetailQuery,
  useListCurrentUserScansQuery,
  useListIssuesQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import { cn } from "@/lib/utils";
import type { IssueDetailResponse, IssueResponse } from "@/types/scanner";

type DetailTab = "where" | "why" | "activity";

type IssueGroup = {
  filePath: string;
  issues: IssueResponse[];
};

type SnippetLine = {
  lineNumber: number | null;
  html: string;
};

const tabItems: Array<{ id: DetailTab; label: string; icon: typeof FileCode2 }> = [
  { id: "where", label: "Where is the issue?", icon: FileCode2 },
  { id: "why", label: "Why is this an issue?", icon: NotebookTabs },
  { id: "activity", label: "Activity", icon: ScrollText },
];

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" as const },
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

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string | null | undefined): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getRepoPath(repoUrl: string): string {
  if (!repoUrl) {
    return "Repository not provided";
  }

  try {
    const parsed = new URL(repoUrl);
    return `${parsed.host}${parsed.pathname.replace(/\.git$/i, "")}`;
  } catch {
    return repoUrl.replace(/^https?:\/\//i, "").replace(/\.git$/i, "");
  }
}

function getIssueSeverityTone(severity: string): string {
  switch (severity.toUpperCase()) {
    case "BLOCKER":
      return "bg-red-600 text-white";
    case "CRITICAL":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "MAJOR":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "MINOR":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function getIssueTypeTone(type: string): string {
  switch (type.toUpperCase()) {
    case "BUG":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "VULNERABILITY":
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    case "CODE_SMELL":
      return "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function mapSoftwareQuality(type: string | undefined): string {
  switch ((type || "").toUpperCase()) {
    case "BUG":
      return "Reliability";
    case "VULNERABILITY":
      return "Security";
    case "CODE_SMELL":
      return "Maintainability";
    default:
      return "Issue";
  }
}

function groupIssuesByFile(items: IssueResponse[], currentFilePath: string): IssueGroup[] {
  const groups = new Map<string, IssueResponse[]>();

  for (const item of items) {
    const filePath = item.file_path || "Unknown file";
    const existing = groups.get(filePath);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(filePath, [item]);
    }
  }

  const result = Array.from(groups.entries()).map(([filePath, issues]) => ({
    filePath,
    issues,
  }));

  result.sort((a, b) => {
    if (a.filePath === currentFilePath) {
      return -1;
    }
    if (b.filePath === currentFilePath) {
      return 1;
    }
    return a.filePath.localeCompare(b.filePath);
  });

  return result;
}

function parseCodeSnippet(snippet: string): SnippetLine[] {
  if (!snippet.trim()) {
    return [];
  }

  return snippet.split("\n").map((row) => {
    const match = row.match(/^(\d+):\s?(.*)$/);
    if (!match) {
      return { lineNumber: null, html: row };
    }

    return {
      lineNumber: Number(match[1]),
      html: match[2] || "&nbsp;",
    };
  });
}

function formatSectionTitle(key: string): string {
  return formatLabel(key);
}

const issueHtmlContentClasses =
  "issue-html-content space-y-4 text-sm leading-7 text-[#253554] dark:text-gray-300 [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-[#f3f6fb] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] dark:[&_code]:bg-gray-900 [&_li]:ml-5 [&_li]:list-disc [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:text-sm [&_h4]:font-semibold";

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d7e0ef] bg-white p-8 text-center text-sm text-[#52648f] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      {message}
    </div>
  );
}

function IssueSidebar({
  projectKey,
  issueKey,
  groups,
  total,
}: {
  projectKey: string;
  issueKey: string;
  groups: IssueGroup[];
  total: number;
}) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-[#d7e0ef] px-5 py-4 dark:border-gray-800">
        <p className="text-lg font-bold text-[#071120] dark:text-white">{total} issues</p>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
        {groups.map((group) => (
          <div key={group.filePath} className="border-b border-[#e4eaf4] px-5 py-4 last:border-b-0 dark:border-gray-800">
            <p className="mb-3 text-sm font-medium text-[#4f6290] dark:text-gray-400">{group.filePath}</p>
            <div className="space-y-2">
              {group.issues.map((issue) => {
                const active = issue.key === issueKey;
                return (
                  <Link
                    key={issue.key}
                    href={buildCodeScanningIssueHref(projectKey, issue.key)}
                    className={cn(
                      "block rounded-xl border px-3 py-3 text-sm transition",
                      active
                        ? "border-[#9fb6ff] bg-[#eef3ff] text-[#17233f] dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-white"
                        : "border-transparent text-[#253554] hover:border-[#d7e0ef] hover:bg-[#f8fbff] dark:text-gray-300 dark:hover:border-gray-800 dark:hover:bg-gray-900",
                    )}
                  >
                    {issue.message}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function CodeSnippetPanel({
  projectKey,
  filePath,
  issue,
}: {
  projectKey: string;
  filePath: string;
  issue: IssueDetailResponse;
}) {
  const lines = useMemo(() => parseCodeSnippet(issue.where_is_issue.code_snippet), [issue.where_is_issue.code_snippet]);
  const startLine = issue.where_is_issue.text_range.start_line;
  const endLine = issue.where_is_issue.text_range.end_line;

  if (lines.length === 0) {
    return <EmptyPanel message="No code snippet was returned for this issue." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7e0ef] px-5 py-4 dark:border-gray-800">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[#52648f] dark:text-gray-400">
          <span className="truncate">{projectKey}</span>
          <ChevronRight className="size-4" />
          <span className="truncate">{filePath}</span>
        </div>
        <span className="text-sm text-[#52648f] dark:text-gray-400">Line {issue.where_is_issue.line || startLine}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {lines.map((row) => {
            const highlighted =
              row.lineNumber != null && row.lineNumber >= startLine && row.lineNumber <= endLine;

            return (
              <div key={`${row.lineNumber}-${row.html}`} className="border-b border-[#f1f4fa] last:border-b-0 dark:border-gray-900">
                <div className={cn("grid grid-cols-[72px_minmax(0,1fr)]", highlighted && "bg-red-50/50 dark:bg-red-500/5")}>
                  <div className="border-r border-[#e4eaf4] px-4 py-2 text-sm text-[#6b7da4] dark:border-gray-800 dark:text-gray-500">
                    {row.lineNumber ?? ""}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2 font-mono text-[13px] leading-7 text-[#17233f] dark:text-gray-100",
                      highlighted && "border-l-2 border-red-400",
                      "[&_span.k]:font-semibold [&_span.k]:text-fuchsia-600 [&_span.s]:text-emerald-600 [&_span.sym]:text-teal-700 dark:[&_span.k]:text-fuchsia-300 dark:[&_span.s]:text-emerald-300 dark:[&_span.sym]:text-teal-300",
                    )}
                    dangerouslySetInnerHTML={{ __html: row.html }}
                  />
                </div>

                {row.lineNumber === startLine ? (
                  <div className="ml-[72px] border-l-2 border-red-400 px-4 pb-4">
                    <div className="rounded-xl border border-red-200 bg-white px-4 py-3 text-base font-semibold text-[#17233f] shadow-sm dark:border-red-500/20 dark:bg-gray-950 dark:text-white">
                      {issue.why_is_issue.issue_message}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WhyPanel({ issue }: { issue: IssueDetailResponse }) {
  const sections = issue.more_info.description_sections;
  const hasSections = sections.length > 0 || issue.why_is_issue.html_desc.trim().length > 0;

  if (!hasSections) {
    return <EmptyPanel message="No rule explanation was returned for this issue." />;
  }

  return (
    <div className="space-y-4">
      {issue.why_is_issue.html_desc.trim() ? (
        <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div
            className={issueHtmlContentClasses}
            dangerouslySetInnerHTML={{ __html: issue.why_is_issue.html_desc }}
          />
        </div>
      ) : null}

      {sections.map((section) => (
        <div key={section.key} className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">
            {formatSectionTitle(section.key)}
          </h3>
          <div
            className={cn("mt-4", issueHtmlContentClasses)}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
      ))}
    </div>
  );
}

function ActivityPanel({ issue }: { issue: IssueDetailResponse }) {
  const comments = issue.activity.comments;
  const changelog = issue.activity.changelog;

  if (comments.length === 0 && changelog.length === 0) {
    return <EmptyPanel message="No activity was returned for this issue." />;
  }

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <section className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Comments</h3>
          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div key={`${comment.login}-${comment.created_at}`} className="rounded-xl border border-[#e4eaf4] p-4 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#52648f] dark:text-gray-400">
                  <MessageSquare className="size-4" />
                  <span className="font-medium text-[#17233f] dark:text-white">{comment.login}</span>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <div
                  className="mt-3 text-sm leading-7 text-[#253554] dark:text-gray-300 [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: comment.html_text }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {changelog.length > 0 ? (
        <section className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Changelog</h3>
          <div className="mt-4 space-y-4">
            {changelog.map((change) => (
              <div key={`${change.user}-${change.created_at}`} className="rounded-xl border border-[#e4eaf4] p-4 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#52648f] dark:text-gray-400">
                  <span className="font-medium text-[#17233f] dark:text-white">{change.user}</span>
                  <span>{formatDate(change.created_at)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {change.diffs.map((diff) => (
                    <div key={`${diff.key}-${diff.old_value}-${diff.new_value}`} className="rounded-lg bg-[#f7faff] px-3 py-2 text-sm dark:bg-gray-900">
                      <span className="font-medium text-[#17233f] dark:text-white">{formatLabel(diff.key)}:</span>{" "}
                      <span className="text-[#52648f] dark:text-gray-400">{diff.old_value || "empty"}</span>{" "}
                      <span className="text-[#52648f] dark:text-gray-400">to</span>{" "}
                      <span className="text-[#17233f] dark:text-gray-100">{diff.new_value || "empty"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function CodeScanningIssueDetailPageClient({
  scanId,
  issueKey,
}: {
  scanId: string;
  issueKey: string;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("where");
  const routeIdentifier = scanId;
  const routeUsesScanId = isLikelyScanId(routeIdentifier);

  const routeProjectScansQuery = useListCurrentUserScansQuery(
    routeUsesScanId
      ? skipToken
      : {
          project_key: routeIdentifier,
          page: 1,
          page_size: 25,
        },
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const resolvedScanId = routeUsesScanId ? routeIdentifier : routeProjectScansQuery.data?.scans[0]?.scan_id;

  const {
    data: scanDetail,
    isLoading: isScanDetailLoading,
  } = useGetScanDetailQuery(resolvedScanId ?? skipToken, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: issueDetail,
    isLoading,
    isError,
    error,
  } = useGetIssueDetailQuery(
    {
      scan_id: resolvedScanId ?? "",
      issue_key: issueKey,
    },
    {
      skip: !resolvedScanId,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: allIssuesResponse } = useListIssuesQuery(
    {
      scan_id: resolvedScanId ?? "",
      page: 1,
      page_size: 150,
    },
    {
      skip: !resolvedScanId,
      refetchOnMountOrArgChange: true,
    },
  );

  const allIssues = useMemo(() => allIssuesResponse?.issues ?? [], [allIssuesResponse?.issues]);
  const currentIssueSummary = useMemo(
    () => allIssues.find((item) => item.key === issueKey),
    [allIssues, issueKey],
  );
  const groupedIssues = useMemo(
    () => groupIssuesByFile(allIssues, issueDetail?.where_is_issue.file_path ?? ""),
    [allIssues, issueDetail?.where_is_issue.file_path],
  );
  const isResolvingRoute = !routeUsesScanId && routeProjectScansQuery.isLoading;
  const routeResolutionFailed = !routeUsesScanId && !routeProjectScansQuery.isLoading && !resolvedScanId;

  if (isResolvingRoute || isScanDetailLoading || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-2xl border border-[#d7e0ef] bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-sm text-[#52648f] dark:text-gray-400">
          <LoaderCircle className="size-5 animate-spin text-teal-500" />
          Loading issue detail...
        </div>
      </div>
    );
  }

  if (routeResolutionFailed || isError || !issueDetail) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[#d7e0ef] bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
        <AlertTriangle className="size-10 text-red-500" />
        <div>
          <h1 className="text-xl font-bold text-[#17233f] dark:text-white">Unable to load issue detail</h1>
          <p className="mt-2 max-w-xl text-sm text-[#52648f] dark:text-gray-400">
            {routeResolutionFailed
              ? "No scan history was found for this project key."
              : readErrorMessage(error, "The scanner issue detail endpoint did not return a usable payload.")}
          </p>
        </div>
        <Link
          href={buildCodeScanningProjectHref(routeIdentifier)}
          className="rounded-xl border border-[#b9c6df] px-4 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          Back to project issues
        </Link>
      </div>
    );
  }

  const projectKey = scanDetail?.project_key || scanDetail?.sonar_project_key || "Project";
  const repoPath = getRepoPath(scanDetail?.repo_url ?? "");
  const softwareQuality = mapSoftwareQuality(currentIssueSummary?.type);

  return (
    <>
      <style jsx global>{`
        .issue-html-content pre {
          margin-top: 0.75rem;
          overflow-x: auto;
          border: 1px solid #d7e0ef;
          border-radius: 0.75rem;
          background: #ffffff;
          padding: 1rem 1.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.75;
          white-space: pre-wrap;
        }

        .issue-html-content pre[data-diff-type="noncompliant"] {
          background:
            linear-gradient(
              to bottom,
              #ffffff 0,
              #ffffff 1rem,
              rgba(254, 226, 226, 0.95) 1rem,
              rgba(254, 226, 226, 0.95) calc(100% - 1rem),
              #ffffff calc(100% - 1rem),
              #ffffff 100%
            );
        }

        .issue-html-content pre[data-diff-type="compliant"] {
          background:
            linear-gradient(
              to bottom,
              #ffffff 0,
              #ffffff 1rem,
              rgba(220, 252, 231, 0.95) 1rem,
              rgba(220, 252, 231, 0.95) calc(100% - 1rem),
              #ffffff calc(100% - 1rem),
              #ffffff 100%
            );
        }

        .dark .issue-html-content pre {
          border-color: rgb(31 41 55);
          background: rgb(3 7 18);
        }

        .dark .issue-html-content pre[data-diff-type="noncompliant"] {
          background:
            linear-gradient(
              to bottom,
              rgb(3 7 18) 0,
              rgb(3 7 18) 1rem,
              rgba(127, 29, 29, 0.34) 1rem,
              rgba(127, 29, 29, 0.34) calc(100% - 1rem),
              rgb(3 7 18) calc(100% - 1rem),
              rgb(3 7 18) 100%
            );
        }

        .dark .issue-html-content pre[data-diff-type="compliant"] {
          background:
            linear-gradient(
              to bottom,
              rgb(3 7 18) 0,
              rgb(3 7 18) 1rem,
              rgba(6, 95, 70, 0.34) 1rem,
              rgba(6, 95, 70, 0.34) calc(100% - 1rem),
              rgb(3 7 18) calc(100% - 1rem),
              rgb(3 7 18) 100%
            );
        }
      `}</style>

      <div className="space-y-5 text-[#17233f] dark:text-gray-100">
      <motion.section
        {...sectionMotion}
        className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#52648f] dark:text-gray-400">
            <Link href="/userdashboard/code-scanning" className="font-semibold text-teal-600 hover:underline dark:text-teal-300">
              Code scanning
            </Link>
            <span>/</span>
            <Link
              href={buildCodeScanningProjectHref(scanDetail?.project_key || routeIdentifier)}
              className="font-semibold text-teal-600 hover:underline dark:text-teal-300"
            >
              {projectKey}
            </Link>
            <span>/</span>
            <span>Issue detail</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-[#071120] dark:text-white">{issueDetail.why_is_issue.issue_message}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#52648f] dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <FolderGit2 className="size-3.5" />
                  {repoPath}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitBranch className="size-3.5" />
                  {scanDetail?.branch || "main"}
                </span>
                <span>Line affected: L{issueDetail.where_is_issue.line || issueDetail.where_is_issue.text_range.start_line}</span>
                <span>Last scan: {formatDate(scanDetail?.finished_at || scanDetail?.started_at || scanDetail?.created_at)}</span>
              </div>
            </div>

            <Link
              href={buildCodeScanningProjectHref(scanDetail?.project_key || routeIdentifier)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d7e0ef] px-3 py-2 text-sm font-semibold text-[#253554] transition hover:bg-[#eef3fb] dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              <ArrowLeft className="size-4" />
              Back to project
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_270px]">
        <motion.div {...sectionMotion}>
          <IssueSidebar
            projectKey={scanDetail?.project_key || routeIdentifier}
            issueKey={issueKey}
            groups={groupedIssues}
            total={allIssuesResponse?.total ?? allIssues.length}
          />
        </motion.div>

        <motion.section {...sectionMotion} className="space-y-5">
          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", getIssueSeverityTone(issueDetail.why_is_issue.severity))}>
                    {issueDetail.why_is_issue.severity}
                  </span>
                  {currentIssueSummary?.type ? (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", getIssueTypeTone(currentIssueSummary.type))}>
                      {formatLabel(currentIssueSummary.type)}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-xs font-semibold text-[#44608c] dark:bg-gray-800 dark:text-gray-300">
                    {formatLabel(issueDetail.why_is_issue.status)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-lg font-semibold text-[#253554] dark:text-gray-100">
                  <span>{issueDetail.why_is_issue.rule_name}</span>
                  <span className="text-base text-[#52648f] dark:text-gray-400">{issueDetail.why_is_issue.rule_key}</span>
                  {issueDetail.more_info.documentation_url ? (
                    <a
                      href={issueDetail.more_info.documentation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline dark:text-teal-300"
                    >
                      Documentation
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-[#52648f] dark:text-gray-400">
                  {issueDetail.where_is_issue.file_path}:{issueDetail.where_is_issue.line || issueDetail.where_is_issue.text_range.start_line}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                        : "bg-white text-[#52648f] ring-1 ring-[#d7e0ef] hover:bg-[#f4f8fd] dark:bg-gray-950 dark:text-gray-400 dark:ring-gray-800 dark:hover:bg-gray-900",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "where" ? (
            <CodeSnippetPanel projectKey={projectKey} filePath={issueDetail.where_is_issue.file_path} issue={issueDetail} />
          ) : null}

          {activeTab === "why" ? <WhyPanel issue={issueDetail} /> : null}

          {activeTab === "activity" ? <ActivityPanel issue={issueDetail} /> : null}
        </motion.section>

        <motion.aside {...sectionMotion} className="space-y-4">
          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Software quality impacted</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                {softwareQuality}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", getIssueSeverityTone(issueDetail.why_is_issue.severity))}>
                {formatLabel(issueDetail.why_is_issue.severity)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Code attributes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {issueDetail.why_is_issue.tags.length > 0 ? (
                issueDetail.why_is_issue.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-xs font-medium text-[#52648f] dark:bg-gray-900 dark:text-gray-300">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#52648f] dark:text-gray-400">No tags returned.</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Location</p>
            <div className="mt-4 space-y-2 text-sm text-[#253554] dark:text-gray-300">
              <p className="break-all">{issueDetail.where_is_issue.component_key}</p>
              <p>{issueDetail.where_is_issue.file_path}</p>
              <p>Line {issueDetail.where_is_issue.line || issueDetail.where_is_issue.text_range.start_line}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d7e0ef] bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b7da4] dark:text-gray-500">Current scan</p>
            <div className="mt-4 space-y-2 text-sm text-[#253554] dark:text-gray-300">
              <p>{projectKey}</p>
              <p>{scanDetail?.branch || "main"}</p>
              <p>{formatDate(scanDetail?.finished_at || scanDetail?.started_at || scanDetail?.created_at)}</p>
            </div>
          </div>
        </motion.aside>
      </div>
      </div>
    </>
  );
}
