import CodeScanningIssueDetailPageClient from "./page-client";

export default async function CodeScanningIssueDetailPage({
  params,
}: {
  params: Promise<{ "scan-id": string; "issue-key": string }>;
}) {
  const { "scan-id": rawScanId, "issue-key": rawIssueKey } = await params;
  const scanId = decodeURIComponent(rawScanId);
  const issueKey = decodeURIComponent(rawIssueKey);

  return <CodeScanningIssueDetailPageClient key={`${scanId}:${issueKey}`} scanId={scanId} issueKey={issueKey} />;
}
