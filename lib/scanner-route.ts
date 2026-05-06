export function isLikelyScanId(identifier: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier.trim());
}

export function buildCodeScanningProjectHref(projectKey: string): string {
  return `/userdashboard/code-scanning/${encodeURIComponent(projectKey)}`;
}

export function buildCodeScanningIssueHref(projectKey: string, issueKey: string): string {
  return `${buildCodeScanningProjectHref(projectKey)}/issues/${encodeURIComponent(issueKey)}`;
}
