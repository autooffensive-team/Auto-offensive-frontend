type IssueRouteItem = {
  key: string;
  message: string;
};

export function isLikelyScanId(identifier: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier.trim());
}

export function buildCodeScanningProjectHref(projectKey: string): string {
  return `/userdashboard/code-scanning/${encodeURIComponent(projectKey)}`;
}

export function slugifyIssueMessage(message: string): string {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "issue";
}

export function buildIssueRouteEntries<T extends IssueRouteItem>(issues: readonly T[]) {
  const seenCounts = new Map<string, number>();

  return issues.map((issue) => {
    const baseSlug = slugifyIssueMessage(issue.message);
    const nextCount = (seenCounts.get(baseSlug) ?? 0) + 1;
    seenCounts.set(baseSlug, nextCount);

    return {
      ...issue,
      slug: nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`,
    };
  });
}

export function buildCodeScanningIssueHref(
  projectKey: string,
  issue: IssueRouteItem,
  issuesForRouting?: readonly IssueRouteItem[],
): string {
  const routeSegment = issuesForRouting
    ? buildIssueRouteEntries(issuesForRouting).find((entry) => entry.key === issue.key)?.slug ?? issue.key
    : issue.key;

  return `${buildCodeScanningProjectHref(projectKey)}/issues/${encodeURIComponent(routeSegment)}`;
}

export function resolveIssueKeyFromRouteSegment(
  routeSegment: string,
  issuesForRouting: readonly IssueRouteItem[],
): string | null {
  const normalizedSegment = routeSegment.trim();
  if (!normalizedSegment) {
    return null;
  }

  if (isLikelyScanId(normalizedSegment)) {
    return normalizedSegment;
  }

  return buildIssueRouteEntries(issuesForRouting).find((entry) => entry.slug === normalizedSegment)?.key ?? null;
}
