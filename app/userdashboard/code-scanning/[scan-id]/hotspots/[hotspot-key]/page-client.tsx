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
  Flame,
  FolderGit2,
  GitBranch,
  LoaderCircle,
  MessageSquare,
  NotebookTabs,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import { useMemo, useState } from "react";

import {
  buildCodeScanningProjectHref,
  isLikelyScanId,
} from "@/lib/scanner-route";
import {
  useGetHotspotDetailQuery,
  useGetScanDetailQuery,
  useListCurrentUserScansQuery,
  useListHotspotsQuery,
} from "@/lib/redux/services/userdashboard/scanner/scanner-api";
import { cn } from "@/lib/utils";
import type { HotspotDetailResponse, HotspotResponse } from "@/types/scanner";

type DetailTab = "where" | "review" | "activity";

type HotspotGroup = {
  filePath: string;
  hotspots: HotspotResponse[];
};

type SnippetLine = {
  lineNumber: number | null;
  html: string;
};

type PrismLanguage = "javascript" | "typescript";

const tabItems: Array<{ id: DetailTab; label: string; icon: typeof FileCode2 }> = [
  { id: "where", label: "Where is the hotspot?", icon: FileCode2 },
  { id: "review", label: "Review & Resolution", icon: NotebookTabs },
  { id: "activity", label: "Activity", icon: MessageSquare },
];

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

// ─── Utility Functions ───────────────────────────────────────────────────────

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readPayloadMessage(payload: unknown): string {
  if (payload == null || typeof payload !== "object") return "";
  const source = payload as { detail?: unknown; message?: unknown; error?: unknown };
  return asText(source.detail).trim() || asText(source.message).trim() || asText(source.error).trim();
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

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getRepoPath(repoUrl: string): string {
  if (!repoUrl) return "Repository not provided";
  try {
    const parsed = new URL(repoUrl);
    return `${parsed.host}${parsed.pathname.replace(/\.git$/i, "")}`;
  } catch {
    return repoUrl.replace(/^https?:\/\//i, "").replace(/\.git$/i, "");
  }
}

function getProbabilityColor(probability: string): { bg: string; text: string } {
  switch (probability.toUpperCase()) {
    case "HIGH":
      return { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" };
    case "MEDIUM":
      return { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" };
    case "LOW":
      return { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" };
    default:
      return { bg: "bg-slate-50 dark:bg-slate-950", text: "text-slate-700 dark:text-slate-300" };
  }
}

function getStatusTone(status: string): string {
  switch (status.toUpperCase()) {
    case "TO_REVIEW":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "REVIEWED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

function formatSecurityCategory(value: string): string {
  if (!value) return "Uncategorized";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function groupHotspotsByFile(items: HotspotResponse[], currentFilePath: string): HotspotGroup[] {
  const groups = new Map<string, HotspotResponse[]>();
  for (const item of items) {
    const filePath = item.file_path || "Unknown file";
    const existing = groups.get(filePath);
    if (existing) existing.push(item);
    else groups.set(filePath, [item]);
  }
  const result = Array.from(groups.entries()).map(([filePath, hotspots]) => ({ filePath, hotspots }));
  result.sort((a, b) => {
    if (a.filePath === currentFilePath) return -1;
    if (b.filePath === currentFilePath) return 1;
    return a.filePath.localeCompare(b.filePath);
  });
  return result;
}

function parseCodeSnippet(snippet: string): SnippetLine[] {
  if (!snippet.trim()) return [];
  return snippet.split("\n").map((row) => {
    const match = row.match(/^(\d+):\s?(.*)$/);
    if (!match) return { lineNumber: null, html: row };
    return { lineNumber: Number(match[1]), html: match[2] || "&nbsp;" };
  });
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
  if (/\binterface\b|\btype\b|\benum\b|:\s*[A-Z_a-z][\w<>\[\]\s|&?,]*/.test(code)) return "typescript";
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

function enhanceHtmlContent(html: string): string {
  if (!html.trim()) return "";
  return highlightPreBlocksWithPrism(html);
}

const htmlContentClasses =
  "issue-html-content space-y-4 text-sm leading-7 text-slate-900 dark:text-slate-100 [&_a]:font-medium [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] dark:[&_code]:bg-slate-800/90 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[15px] [&_p]:leading-7 [&_strong]:font-semibold [&_strong]:text-slate-950 dark:[&_strong]:text-white [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:text-sm [&_h4]:font-semibold";

// ─── Sub-Components ──────────────────────────────────────────────────────────

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
      {message}
    </div>
  );
}

function HotspotSidebar({
  scanId,
  activeHotspotKey,
  groups,
  total,
}: {
  scanId: string;
  activeHotspotKey: string;
  groups: HotspotGroup[];
  total: number;
}) {
  return (
    <aside className="overflow-hidden rounded-lg border border-slate-200 bg-[#FCFCFA] dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-900 md:text-sm dark:text-white">{total} hotspots in this scan</p>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
        {groups.map((group) => (
          <div key={group.filePath} className="border-b border-slate-200 px-3 py-3 last:border-b-0 sm:px-4 sm:py-3.5 md:px-5 md:py-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide sm:mb-3 md:text-sm dark:text-slate-400">
              {group.filePath}
            </p>
            <div className="space-y-1 sm:space-y-1.5">
              {group.hotspots.map((hotspot) => {
                const active = hotspot.key === activeHotspotKey;
                return (
                  <Link
                    key={hotspot.key}
                    href={`/userdashboard/code-scanning/${encodeURIComponent(scanId)}/hotspots/${encodeURIComponent(hotspot.key)}`}
                    className={cn(
                      "block rounded px-2.5 py-1.5 text-xs font-medium transition-all duration-200 sm:px-3 sm:py-2 md:text-sm",
                      active
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    {hotspot.message}
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
  hotspot,
}: {
  projectKey: string;
  filePath: string;
  hotspot: HotspotDetailResponse;
}) {
  const lines = useMemo(
    () => parseCodeSnippet(hotspot.where_is_hotspot.code_snippet),
    [hotspot.where_is_hotspot.code_snippet],
  );
  const startLine = hotspot.where_is_hotspot.text_range.start_line;
  const endLine = hotspot.where_is_hotspot.text_range.end_line;

  if (lines.length === 0) {
    return <EmptyPanel message="No code snippet was returned for this hotspot." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-600 md:text-base dark:text-slate-400">
          <span className="font-mono font-medium truncate">{projectKey}</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="font-mono truncate">{filePath}</span>
        </div>
        <span className="text-sm font-mono font-medium text-slate-600 md:text-base dark:text-slate-400">
          Line {hotspot.where_is_hotspot.line || startLine}
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
                className={cn("flex group", highlighted && "bg-amber-500/10")}
              >
                <div className={cn(
                  "w-12 shrink-0 text-right px-3 py-0 select-none text-slate-500 dark:text-slate-700 border-r border-slate-800",
                  highlighted && "bg-amber-500/10 border-r-amber-500 border-r-2",
                )}>
                  {row.lineNumber ?? ""}
                </div>
                <div
                  className={cn(
                    "flex-1 px-4 py-0 wrap-break-word whitespace-pre-wrap",
                    highlighted && "bg-amber-500/10",
                    "[&_span.k]:font-semibold [&_span.k]:text-purple-400 [&_span.s]:text-emerald-400 [&_span.sym]:text-teal-400 dark:[&_span.k]:text-purple-300 dark:[&_span.s]:text-emerald-300 dark:[&_span.sym]:text-teal-300",
                  )}
                  dangerouslySetInnerHTML={{ __html: row.html }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hotspot message */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 bg-amber-50 dark:bg-amber-950">
        <div className="rounded border border-amber-200 dark:border-amber-800 bg-[#FCFCFA] dark:bg-slate-950 px-4 py-3">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 md:text-base dark:text-amber-200">
                {hotspot.review.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({ hotspot }: { hotspot: HotspotDetailResponse }) {
  const hasDescription = hotspot.review.html_desc.trim().length > 0;
  const hasResolution = hotspot.review.resolution.trim().length > 0;
  const sections = hotspot.more_info.description_sections;
  const enhancedDesc = useMemo(
    () => enhanceHtmlContent(hotspot.review.html_desc),
    [hotspot.review.html_desc],
  );
  const enhancedSections = useMemo(
    () => sections.map((section) => ({ ...section, enhancedContent: enhanceHtmlContent(section.content) })),
    [sections],
  );

  if (!hasDescription && !hasResolution && sections.length === 0) {
    return <EmptyPanel message="No review information was returned for this hotspot." />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {hasDescription && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FCFCFA] shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Rule description
            </p>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <div
              className={htmlContentClasses}
              dangerouslySetInnerHTML={{ __html: enhancedDesc }}
            />
          </div>
        </div>
      )}

      {hasResolution && (
        <div className="overflow-hidden rounded-xl border border-emerald-200 bg-[#FCFCFA] shadow-sm dark:border-emerald-800 dark:bg-slate-950">
          <div className="border-b border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 dark:border-emerald-800 dark:bg-emerald-950">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
              Resolution
            </p>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <div
              className={htmlContentClasses}
              dangerouslySetInnerHTML={{ __html: enhanceHtmlContent(hotspot.review.resolution) }}
            />
          </div>
        </div>
      )}

      {enhancedSections.map((section) => (
        <div
          key={section.key}
          className="overflow-hidden rounded-xl border border-slate-200 bg-[#FCFCFA] shadow-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">
              {formatLabel(section.key)}
            </h3>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            <div
              className={htmlContentClasses}
              dangerouslySetInnerHTML={{ __html: section.enhancedContent }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPanel({ hotspot }: { hotspot: HotspotDetailResponse }) {
  const comments = hotspot.activity.comments;
  const changelog = hotspot.activity.changelog;

  if (comments.length === 0 && changelog.length === 0) {
    return <EmptyPanel message="No activity was returned for this hotspot." />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {comments.length > 0 && (
         <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:bg-slate-950">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 md:text-base dark:text-slate-400">Comments</h3>
          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            {comments.map((comment) => (
              <div key={`${comment.login}-${comment.created_at}`} className="rounded border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 md:text-base dark:text-slate-400">
                  <MessageSquare className="size-3.5" />
                  <span className="font-medium text-slate-900 dark:text-white">{comment.login}</span>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <div
                  className="mt-3 text-base leading-7 text-slate-900 dark:text-slate-100 [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: comment.html_text }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {changelog.length > 0 && (
         <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:bg-slate-950">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 md:text-base dark:text-slate-400">Changelog</h3>
          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            {changelog.map((change) => (
              <div key={`${change.user}-${change.created_at}`} className="rounded border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 md:text-base dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">{change.user}</span>
                  <span>{formatDate(change.created_at)}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {change.diffs.map((diff) => (
                    <div key={`${diff.key}-${diff.old_value}-${diff.new_value}`} className="rounded bg-slate-50 px-3 py-2 text-sm md:text-base dark:bg-slate-900">
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
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CodeScanningHotspotDetailPageClient({
  scanId,
  hotspotKey,
}: {
  scanId: string;
  hotspotKey: string;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("where");
  const routeIdentifier = scanId;
  const routeUsesScanId = isLikelyScanId(routeIdentifier);

  const routeProjectScansQuery = useListCurrentUserScansQuery(
    routeUsesScanId
      ? skipToken
      : { project_key: routeIdentifier, page: 1, page_size: 25 },
    { refetchOnMountOrArgChange: true },
  );
  const resolvedScanId = routeUsesScanId
    ? routeIdentifier
    : routeProjectScansQuery.data?.scans[0]?.scan_id;

  const { data: scanDetail, isLoading: isScanDetailLoading } = useGetScanDetailQuery(
    resolvedScanId ?? skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const { data: allHotspotsResponse } = useListHotspotsQuery(
    { scan_id: resolvedScanId ?? "", page: 1, page_size: 150 },
    { skip: !resolvedScanId, refetchOnMountOrArgChange: true },
  );

  const allHotspots = useMemo(
    () => allHotspotsResponse?.hotspots ?? [],
    [allHotspotsResponse?.hotspots],
  );

  const {
    data: hotspotDetail,
    isLoading,
    isError,
    error,
  } = useGetHotspotDetailQuery(
    { scan_id: resolvedScanId ?? "", hotspot_key: hotspotKey },
    { skip: !resolvedScanId || !hotspotKey, refetchOnMountOrArgChange: true },
  );

  const groupedHotspots = useMemo(
    () => groupHotspotsByFile(allHotspots, hotspotDetail?.where_is_hotspot.file_path ?? ""),
    [allHotspots, hotspotDetail?.where_is_hotspot.file_path],
  );

  const isResolvingRoute = !routeUsesScanId && routeProjectScansQuery.isLoading;
  const routeResolutionFailed = !routeUsesScanId && !routeProjectScansQuery.isLoading && !resolvedScanId;

  if (isResolvingRoute || isScanDetailLoading || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 sm:gap-3 sm:text-sm dark:text-slate-400">
          <LoaderCircle className="size-4 animate-spin text-teal-500 sm:size-5" />
          Loading hotspot detail...
        </div>
      </div>
    );
  }

  if (routeResolutionFailed || isError || !hotspotDetail) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center sm:gap-4 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <AlertTriangle className="size-8 text-red-500 sm:size-10" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">Unable to load hotspot detail</h1>
          <p className="mt-1.5 max-w-xl text-xs text-slate-500 sm:mt-2 sm:text-sm dark:text-slate-400">
            {routeResolutionFailed
              ? "No scan history was found for this project key."
              : readErrorMessage(error, "The scanner hotspot detail endpoint did not return a usable payload.")}
          </p>
        </div>
        <Link
          href={buildCodeScanningProjectHref(routeIdentifier)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-3.5 sm:size-4" />
          Back to project
        </Link>
      </div>
    );
  }

  const projectKey = scanDetail?.project_key || scanDetail?.sonar_project_key || "Project";
  const repoPath = getRepoPath(scanDetail?.repo_url ?? "");
  const probabilityColors = getProbabilityColor(hotspotDetail.review.vulnerability_probability);

  return (
    <>
      <style jsx global>{`
        .issue-html-content {
          color: rgb(15 23 42);
        }
        .dark .issue-html-content {
          color: rgb(241 245 249);
        }
        .issue-html-content > :first-child { margin-top: 0; }
        .issue-html-content > :last-child { margin-bottom: 0; }
        .issue-html-content p + p { margin-top: 0.9rem; }
        .issue-html-content ul, .issue-html-content ol { margin-top: 0.9rem; margin-bottom: 0.9rem; }
        .issue-html-content li + li { margin-top: 0.45rem; }
        .issue-html-content pre {
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          overflow-x: auto;
          border-radius: 0;
          background: rgb(2 6 23 / 0.98);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 28px rgba(15, 23, 42, 0.14);
          padding: 1rem 1.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          color: rgb(226, 232, 240);
          position: relative;
        }
        .issue-html-content pre code { display: block; background: transparent; padding: 0; color: inherit; }
        .issue-html-content pre .token.keyword, .issue-html-content pre .token.control-flow, .issue-html-content pre .token.module { color: rgb(196, 181, 253); font-weight: 600; }
        .issue-html-content pre .token.string, .issue-html-content pre .token.char, .issue-html-content pre .token.attr-value { color: rgb(110, 231, 183); }
        .issue-html-content pre .token.operator, .issue-html-content pre .token.punctuation, .issue-html-content pre .token.entity { color: rgb(103, 232, 249); }
        .issue-html-content pre .token.comment, .issue-html-content pre .token.prolog, .issue-html-content pre .token.doctype { color: rgb(148, 163, 184); font-style: italic; }
        .issue-html-content pre .token.function, .issue-html-content pre .token.method { color: rgb(147, 197, 253); }
        .issue-html-content pre .token.number, .issue-html-content pre .token.boolean, .issue-html-content pre .token.constant { color: rgb(251, 191, 36); }
        .issue-html-content pre .token.class-name, .issue-html-content pre .token.console { color: rgb(244, 114, 182); }
      `}</style>

      <div className="min-h-screen">
        <div className="mx-auto space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4 md:space-y-5 md:px-5 md:py-5 lg:space-y-6 lg:px-7 lg:py-6">
          {/* Header */}
          <motion.section {...sectionMotion} className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 md:text-sm dark:text-slate-400">
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
                <span>Security Hotspot</span>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl md:text-2xl lg:text-3xl dark:text-white">
                    {hotspotDetail.review.message}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 sm:mt-3 sm:gap-x-4 sm:gap-y-2 md:text-sm dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <FolderGit2 className="size-3 sm:size-3.5" />
                      {repoPath}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="size-3 sm:size-3.5" />
                      {scanDetail?.branch || "main"}
                    </span>
                    <span>Line affected: L{hotspotDetail.where_is_hotspot.line || hotspotDetail.where_is_hotspot.text_range.start_line}</span>
                  </div>
                </div>

                <Link
                  href={buildCodeScanningProjectHref(scanDetail?.project_key || routeIdentifier)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:gap-2 sm:px-4 sm:py-2 md:text-base dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="size-3.5 sm:size-4" />
                  Back to project
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Main content */}
          <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
            {/* Hotspots sidebar */}
            <motion.div {...sectionMotion}>
              <HotspotSidebar
                scanId={resolvedScanId ?? routeIdentifier}
                activeHotspotKey={hotspotKey}
                groups={groupedHotspots}
                total={allHotspotsResponse?.total ?? allHotspots.length}
              />
            </motion.div>

            {/* Main hotspot view */}
            <motion.section {...sectionMotion} className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Hotspot summary */}
              <div className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold md:text-sm", probabilityColors.text, probabilityColors.bg)}>
                        {formatLabel(hotspotDetail.review.vulnerability_probability)} probability
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold md:text-sm", getStatusTone(hotspotDetail.review.status))}>
                        {formatLabel(hotspotDetail.review.status)}
                      </span>
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 md:text-sm dark:bg-sky-500/10 dark:text-sky-300">
                        {formatSecurityCategory(hotspotDetail.review.security_category)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                      <span className="text-base font-semibold text-slate-900 md:text-lg dark:text-white">
                        {hotspotDetail.review.rule_name}
                      </span>
                      <span className="text-xs text-slate-500 md:text-sm dark:text-slate-400">
                        {hotspotDetail.review.rule_key}
                      </span>
                      {hotspotDetail.more_info.documentation_url && (
                        <a
                          href={hotspotDetail.more_info.documentation_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline md:text-base dark:text-teal-400"
                        >
                          Documentation
                          <ExternalLink className="size-3 sm:size-3.5" />
                        </a>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500 sm:mt-2 md:text-sm dark:text-slate-400">
                      {hotspotDetail.where_is_hotspot.file_path}:{hotspotDetail.where_is_hotspot.line || hotspotDetail.where_is_hotspot.text_range.start_line}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                  {tabItems.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all duration-200 sm:gap-2 sm:px-3 sm:py-2 md:text-base",
                          active
                            ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                        )}
                      >
                        <Icon className="size-3.5 sm:size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              {activeTab === "where" && (
                <CodeSnippetPanel
                  projectKey={projectKey}
                  filePath={hotspotDetail.where_is_hotspot.file_path}
                  hotspot={hotspotDetail}
                />
              )}
              {activeTab === "review" && <ReviewPanel hotspot={hotspotDetail} />}
              {activeTab === "activity" && <ActivityPanel hotspot={hotspotDetail} />}
            </motion.section>

            {/* Right sidebar */}
            <motion.aside {...sectionMotion} className="space-y-3 sm:space-y-4">
              <div className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm dark:text-slate-400">Security category</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sm font-semibold text-sky-700 md:text-base dark:bg-sky-500/10 dark:text-sky-300">
                    {formatSecurityCategory(hotspotDetail.review.security_category)}
                  </span>
                  <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold md:text-base", probabilityColors.text, probabilityColors.bg)}>
                    {formatLabel(hotspotDetail.review.vulnerability_probability)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm dark:text-slate-400">Review status</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
                  <span className={cn("rounded-full px-2.5 py-1 text-sm font-semibold md:text-base", getStatusTone(hotspotDetail.review.status))}>
                    {formatLabel(hotspotDetail.review.status)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm dark:text-slate-400">Location</p>
                <div className="mt-3 space-y-1 text-sm text-slate-900 sm:mt-4 md:text-base dark:text-slate-100">
                  <p className="break-all font-mono">{hotspotDetail.where_is_hotspot.component_key}</p>
                  <p className="break-all font-mono">{hotspotDetail.where_is_hotspot.file_path}</p>
                  <p className="font-mono">L{hotspotDetail.where_is_hotspot.line || hotspotDetail.where_is_hotspot.text_range.start_line}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#FCFCFA] p-3 sm:p-4 md:p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-sm dark:text-slate-400">Current scan</p>
                <div className="mt-3 space-y-1 text-sm text-slate-900 sm:mt-4 md:text-base dark:text-slate-100">
                  <p className="font-mono">{projectKey}</p>
                  <p className="font-mono">{scanDetail?.branch || "main"}</p>
                  <p>{formatDate(scanDetail?.finished_at || scanDetail?.started_at || scanDetail?.created_at)}</p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}
