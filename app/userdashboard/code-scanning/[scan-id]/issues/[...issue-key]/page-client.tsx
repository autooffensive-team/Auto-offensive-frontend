"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  LoaderCircle,
  NotebookTabs,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import { useMemo, useState } from "react";

import {
  buildCodeScanningIssueHref,
  buildCodeScanningProjectHref,
  isLikelyScanId,
  resolveIssueKeyFromRouteSegment,
} from "@/lib/scanner-route";
import {
  useGetIssueDetailQuery,
  useGetScanDetailQuery,
  useListCurrentUserScansQuery,
  useListIssuesQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import { cn } from "@/lib/utils";
import type { IssueDetailResponse, IssueResponse } from "@/types/scanner";

type DetailTab = "where" | "why";

type IssueGroup = {
  filePath: string;
  issues: IssueResponse[];
};

type SnippetLine = {
  lineNumber: number | null;
  html: string;
};

type PrismLanguage = "javascript" | "typescript";

const tabItems: Array<{ id: DetailTab; label: string; icon: typeof FileCode2 }> = [
  { id: "where", label: "Where is the issue?", icon: FileCode2 },
  { id: "why", label: "Why is this an issue?", icon: NotebookTabs },
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

function getIssueSeverityColor(severity: string): { bg: string; border: string; text: string } {
  switch (severity.toUpperCase()) {
    case "BLOCKER":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-700 dark:text-red-300",
      };
    case "CRITICAL":
      return {
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-700 dark:text-orange-300",
      };
    case "MAJOR":
      return {
        bg: "bg-amber-50 dark:bg-amber-950",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
      };
    case "MINOR":
      return {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-950",
        border: "border-slate-200 dark:border-slate-800",
        text: "text-slate-700 dark:text-slate-300",
      };
  }
}

function getIssueTypeTone(type: string): string {
  switch (type.toUpperCase()) {
    case "BUG":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "VULNERABILITY":
      return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
    case "CODE_SMELL":
      return "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function detectPrismLanguage(code: string): PrismLanguage {
  if (/\binterface\b|\btype\b|\benum\b|:\s*[A-Z_a-z][\w<>\[\]\s|&?,]*/.test(code)) {
    return "typescript";
  }

  return "javascript";
}

function highlightPreBlocksWithPrism(html: string): string {
  return html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (_, preAttributes, preContent) => {
    const codeMatch = preContent.match(/<code([^>]*)>([\s\S]*?)<\/code>/i);
    const codeAttributes = codeMatch?.[1] ?? "";
    const rawCode = codeMatch?.[2] ?? preContent;
    const decodedCode = decodeHtmlEntities(rawCode).trimEnd();
    const language = detectPrismLanguage(decodedCode);
    const grammar = Prism.languages[language] ?? Prism.languages.javascript;
    const highlightedCode = Prism.highlight(decodedCode, grammar, language);

    return `<pre${preAttributes}><code${codeAttributes} class="language-${language}">${highlightedCode}</code></pre>`;
  });
}

function enhanceIssueHtmlContent(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const exampleVariants = [
    {
      labels: ["Noncompliant code example", "Non-compliant code example"],
      type: "noncompliant",
      className: "issue-example-title issue-example-title--noncompliant",
    },
    {
      labels: ["Compliant solution", "Compliant code example"],
      type: "compliant",
      className: "issue-example-title issue-example-title--compliant",
    },
  ];

  let nextHtml = html;

  for (const variant of exampleVariants) {
    for (const label of variant.labels) {
      const escapedLabel = escapeRegExp(label);
      const titleWithPrePattern = new RegExp(
        `<(p|h[1-6])>\\s*${escapedLabel}\\s*<\\/\\1>\\s*<pre(?![^>]*data-diff-type=)([^>]*)>`,
        "gi",
      );
      const titlePattern = new RegExp(`<(p|h[1-6])>\\s*${escapedLabel}\\s*<\\/\\1>`, "gi");

      nextHtml = nextHtml.replace(
        titleWithPrePattern,
        `<div class="${variant.className}">${label}</div><pre data-diff-type="${variant.type}"$2>`,
      );
      nextHtml = nextHtml.replace(
        titlePattern,
        `<div class="${variant.className}">${label}</div>`,
      );
    }
  }

  return highlightPreBlocksWithPrism(nextHtml);
}

const issueHtmlContentClasses =
  "issue-html-content space-y-4 text-sm leading-7 text-slate-900 dark:text-slate-100 [&_a]:font-medium [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] dark:[&_code]:bg-slate-800/90 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[15px] [&_p]:leading-7 [&_strong]:font-semibold [&_strong]:text-slate-950 dark:[&_strong]:text-white [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:text-sm [&_h4]:font-semibold";

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
      {message}
    </div>
  );
}

function IssueSidebar({
  projectKey,
  activeIssueKey,
  groups,
  total,
  allIssues,
}: {
  projectKey: string;
  activeIssueKey: string | null;
  groups: IssueGroup[];
  total: number;
  allIssues: IssueResponse[];
}) {
  return (
    <aside className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{total} issues in this scan</p>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
        {groups.map((group) => (
          <div key={group.filePath} className="border-b border-slate-200 px-5 py-4 last:border-b-0 dark:border-slate-800">
            <p className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {group.filePath}
            </p>
            <div className="space-y-1.5">
              {group.issues.map((issue) => {
                const active = issue.key === activeIssueKey;
                return (
                  <Link
                    key={issue.key}
                    href={buildCodeScanningIssueHref(projectKey, issue, allIssues)}
                    className={cn(
                      "block rounded px-3 py-2 text-xs font-medium transition-all duration-200",
                      active
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
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
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-mono font-medium truncate">{projectKey}</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="font-mono truncate">{filePath}</span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
          Line {issue.where_is_issue.line || startLine}
        </span>
      </div>

      <div className="overflow-x-auto bg-slate-950 dark:bg-slate-900">
        <div className="font-mono text-sm leading-6 text-slate-100">
          {lines.map((row) => {
            const highlighted =
              row.lineNumber != null && row.lineNumber >= startLine && row.lineNumber <= endLine;

            return (
              <div
                key={`${row.lineNumber}-${row.html}`}
                className={cn(
                  "flex group",
                  highlighted && "bg-red-500/10",
                )}
              >
                {/* Line number */}
                <div className={cn(
                  "w-12 shrink-0 text-right px-3 py-0 select-none text-slate-500 dark:text-slate-700 border-r border-slate-800",
                  highlighted && "bg-red-500/10 border-r-red-500 border-r-2"
                )}>
                  {row.lineNumber ?? ""}
                </div>
                
                {/* Code content */}
                <div
                  className={cn(
                    "flex-1 px-4 py-0 wrap-break-word whitespace-pre-wrap",
                    highlighted && "bg-red-500/10",
                    "[&_span.k]:font-semibold [&_span.k]:text-purple-400 [&_span.s]:text-emerald-400 [&_span.sym]:text-teal-400 dark:[&_span.k]:text-purple-300 dark:[&_span.s]:text-emerald-300 dark:[&_span.sym]:text-teal-300",
                  )}
                  dangerouslySetInnerHTML={{ __html: row.html }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Error message popup */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 bg-red-50 dark:bg-red-950">
        <div className="rounded border border-red-200 dark:border-red-800 bg-white dark:bg-slate-950 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                {issue.why_is_issue.issue_message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyPanel({ issue }: { issue: IssueDetailResponse }) {
  const sections = issue.more_info.description_sections;
  const hasSections = sections.length > 0 || issue.why_is_issue.html_desc.trim().length > 0;
  const explanationHtml = useMemo(
    () => enhanceIssueHtmlContent(issue.why_is_issue.html_desc),
    [issue.why_is_issue.html_desc],
  );
  const enhancedSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        enhancedContent: enhanceIssueHtmlContent(section.content),
      })),
    [sections],
  );

  if (!hasSections) {
    return <EmptyPanel message="No rule explanation was returned for this issue." />;
  }

  return (
    <div className="space-y-4">
      {issue.why_is_issue.html_desc.trim() ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Why is this an issue?
            </p>
          </div>
          <div className="p-5">
            <div
              className={issueHtmlContentClasses}
              dangerouslySetInnerHTML={{ __html: explanationHtml }}
            />
          </div>
        </div>
      ) : null}

      {enhancedSections.map((section) => (
        <div
          key={section.key}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">
              {formatSectionTitle(section.key)}
            </h3>
          </div>
          <div className="p-5">
            <div
              className={issueHtmlContentClasses}
              dangerouslySetInnerHTML={{ __html: section.enhancedContent }}
            />
          </div>
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
        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Comments</h3>
          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div key={`${comment.login}-${comment.created_at}`} className="rounded border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <MessageSquare className="size-3.5" />
                  <span className="font-medium text-slate-900 dark:text-white">{comment.login}</span>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <div
                  className="mt-3 text-sm leading-6 text-slate-900 dark:text-slate-100 [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: comment.html_text }}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {changelog.length > 0 ? (
        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Changelog</h3>
          <div className="mt-4 space-y-4">
            {changelog.map((change) => (
              <div key={`${change.user}-${change.created_at}`} className="rounded border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">{change.user}</span>
                  <span>{formatDate(change.created_at)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {change.diffs.map((diff) => (
                    <div key={`${diff.key}-${diff.old_value}-${diff.new_value}`} className="rounded bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
                      <span className="font-medium text-slate-900 dark:text-white">{formatLabel(diff.key)}:</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{diff.old_value || "empty"}</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">→</span>{" "}
                      <span className="text-slate-900 dark:text-slate-100">{diff.new_value || "empty"}</span>
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
  issueRouteSegment,
}: {
  scanId: string;
  issueRouteSegment: string;
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
  const resolvedIssueKey = useMemo(
    () => resolveIssueKeyFromRouteSegment(issueRouteSegment, allIssues),
    [allIssues, issueRouteSegment],
  );
  const {
    data: issueDetail,
    isLoading,
    isError,
    error,
  } = useGetIssueDetailQuery(
    {
      scan_id: resolvedScanId ?? "",
      issue_key: resolvedIssueKey ?? "",
    },
    {
      skip: !resolvedScanId || !resolvedIssueKey,
      refetchOnMountOrArgChange: true,
    },
  );
  const currentIssueSummary = useMemo(
    () => allIssues.find((item) => item.key === resolvedIssueKey),
    [allIssues, resolvedIssueKey],
  );
  const groupedIssues = useMemo(
    () => groupIssuesByFile(allIssues, issueDetail?.where_is_issue.file_path ?? ""),
    [allIssues, issueDetail?.where_is_issue.file_path],
  );
  const isResolvingRoute = !routeUsesScanId && routeProjectScansQuery.isLoading;
  const routeResolutionFailed = !routeUsesScanId && !routeProjectScansQuery.isLoading && !resolvedScanId;
  const isIssueListLoading = Boolean(resolvedScanId) && allIssuesResponse === undefined;
  const isResolvingIssueRoute = !resolvedIssueKey && isIssueListLoading;
  const issueRouteResolutionFailed = !isIssueListLoading && !resolvedIssueKey;

  if (isResolvingRoute || isResolvingIssueRoute || isScanDetailLoading || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <LoaderCircle className="size-5 animate-spin text-teal-500" />
          Loading issue detail...
        </div>
      </div>
    );
  }

  if (routeResolutionFailed || issueRouteResolutionFailed || isError || !issueDetail) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 text-center">
        <AlertTriangle className="size-10 text-red-500" />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Unable to load issue detail</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
            {routeResolutionFailed
              ? "No scan history was found for this project key."
              : issueRouteResolutionFailed
                ? "No issue in this scan matched the URL segment."
                : readErrorMessage(error, "The scanner issue detail endpoint did not return a usable payload.")}
          </p>
        </div>
        <Link
          href={buildCodeScanningProjectHref(routeIdentifier)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-4" />
          Back to project issues
        </Link>
      </div>
    );
  }

  const projectKey = scanDetail?.project_key || scanDetail?.sonar_project_key || "Project";
  const repoPath = getRepoPath(scanDetail?.repo_url ?? "");
  const softwareQuality = mapSoftwareQuality(currentIssueSummary?.type);
  const severityColors = getIssueSeverityColor(issueDetail.why_is_issue.severity);

  return (
    <>
      <style jsx global>{`
        .issue-html-content {
          color: rgb(15 23 42);
        }

        .dark .issue-html-content {
          color: rgb(241 245 249);
        }

        .issue-html-content > :first-child {
          margin-top: 0;
        }

        .issue-html-content > :last-child {
          margin-bottom: 0;
        }

        .issue-html-content p + p {
          margin-top: 0.9rem;
        }

        .issue-html-content ul,
        .issue-html-content ol {
          margin-top: 0.9rem;
          margin-bottom: 0.9rem;
        }

        .issue-html-content li + li {
          margin-top: 0.45rem;
        }

        .issue-html-content .issue-example-title {
          display: inline-flex;
          align-items: center;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          border-radius: 9999px;
          padding: 0.38rem 0.9rem;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .issue-html-content .issue-example-title--noncompliant {
          color: rgb(185, 28, 28);
        }

        .issue-html-content .issue-example-title--compliant {
          color: rgb(21, 128, 61);
        }

        .dark .issue-html-content .issue-example-title--noncompliant {
          color: rgb(252, 165, 165);
        }

        .dark .issue-html-content .issue-example-title--compliant {
          color: rgb(134, 239, 172);
        }

        .issue-html-content pre {
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          overflow-x: auto;
          border-radius: 0;
          background: rgb(2 6 23 / 0.98);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 12px 28px rgba(15, 23, 42, 0.14);
          padding: 1rem 1.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          color: rgb(226, 232, 240);
          position: relative;
        }

        .issue-html-content pre code {
          display: block;
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .issue-html-content pre .token.keyword,
        .issue-html-content pre .token.control-flow,
        .issue-html-content pre .token.module {
          color: rgb(196, 181, 253);
          font-weight: 600;
        }

        .issue-html-content pre .token.string,
        .issue-html-content pre .token.char,
        .issue-html-content pre .token.attr-value {
          color: rgb(110, 231, 183);
        }

        .issue-html-content pre .token.operator,
        .issue-html-content pre .token.punctuation,
        .issue-html-content pre .token.entity {
          color: rgb(103, 232, 249);
        }

        .issue-html-content pre .token.comment,
        .issue-html-content pre .token.prolog,
        .issue-html-content pre .token.doctype {
          color: rgb(148, 163, 184);
          font-style: italic;
        }

        .issue-html-content pre .token.function,
        .issue-html-content pre .token.method {
          color: rgb(147, 197, 253);
        }

        .issue-html-content pre .token.number,
        .issue-html-content pre .token.boolean,
        .issue-html-content pre .token.constant {
          color: rgb(251, 191, 36);
        }

        .issue-html-content pre .token.class-name,
        .issue-html-content pre .token.console {
          color: rgb(244, 114, 182);
        }

      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <motion.section {...sectionMotion} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Link href="/userdashboard/code-scanning" className="font-semibold text-teal-600 hover:underline dark:text-teal-400">
                Code scanning
              </Link>
              <span>/</span>
              <Link
                href={buildCodeScanningProjectHref(scanDetail?.project_key || routeIdentifier)}
                className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                {projectKey}
              </Link>
              <span>/</span>
              <span>Issue detail</span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold text-slate-900 dark:text-white">
                  {issueDetail.why_is_issue.issue_message}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <FolderGit2 className="size-3.5" />
                    {repoPath}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="size-3.5" />
                    {scanDetail?.branch || "main"}
                  </span>
                  <span>Line affected: L{issueDetail.where_is_issue.line || issueDetail.where_is_issue.text_range.start_line}</span>
                </div>
              </div>

              <Link
                href={buildCodeScanningProjectHref(scanDetail?.project_key || routeIdentifier)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="size-4" />
                Back to project
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
          {/* Issues sidebar */}
          <motion.div {...sectionMotion}>
            <IssueSidebar
              projectKey={scanDetail?.project_key || routeIdentifier}
              activeIssueKey={resolvedIssueKey}
              groups={groupedIssues}
              total={allIssuesResponse?.total ?? allIssues.length}
              allIssues={allIssues}
            />
          </motion.div>

          {/* Main issue view */}
          <motion.section {...sectionMotion} className="space-y-5">
            {/* Issue summary */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", severityColors.text, severityColors.bg)}>
                      {issueDetail.why_is_issue.severity}
                    </span>
                    {currentIssueSummary?.type ? (
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", getIssueTypeTone(currentIssueSummary.type))}>
                        {formatLabel(currentIssueSummary.type)}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {formatLabel(issueDetail.why_is_issue.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {issueDetail.why_is_issue.rule_name}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{issueDetail.why_is_issue.rule_key}</span>
                    {issueDetail.more_info.documentation_url ? (
                      <a
                        href={issueDetail.more_info.documentation_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
                      >
                        Documentation
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
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
                        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
                        active
                          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "where" && <CodeSnippetPanel projectKey={projectKey} filePath={issueDetail.where_is_issue.file_path} issue={issueDetail} />}
            {activeTab === "why" && <WhyPanel issue={issueDetail} />}
          </motion.section>

          {/* Right sidebar */}
          <motion.aside {...sectionMotion} className="space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Software quality impacted</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  {softwareQuality}
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", severityColors.text, severityColors.bg)}>
                  {formatLabel(issueDetail.why_is_issue.severity)}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Code attributes</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {issueDetail.why_is_issue.tags.length > 0 ? (
                  issueDetail.why_is_issue.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600 dark:text-slate-400">No tags returned.</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Location</p>
              <div className="mt-4 space-y-1 text-xs text-slate-900 dark:text-slate-100">
                <p className="break-all font-mono">{issueDetail.where_is_issue.component_key}</p>
                <p className="break-all font-mono">{issueDetail.where_is_issue.file_path}</p>
                <p className="font-mono">L{issueDetail.where_is_issue.line || issueDetail.where_is_issue.text_range.start_line}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Current scan</p>
              <div className="mt-4 space-y-1 text-xs text-slate-900 dark:text-slate-100">
                <p className="font-mono">{projectKey}</p>
                <p className="font-mono">{scanDetail?.branch || "main"}</p>
                <p>{formatDate(scanDetail?.finished_at || scanDetail?.started_at || scanDetail?.created_at)}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </>
  );
}
