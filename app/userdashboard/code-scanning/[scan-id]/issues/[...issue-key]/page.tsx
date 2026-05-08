import CodeScanningIssueDetailPageClient from "./page-client";

export default async function CodeScanningIssueDetailPage({
  params,
}: {
  params: Promise<{ "scan-id": string; "issue-key": string[] }>;
}) {
  const { "scan-id": rawScanId, "issue-key": rawIssueSegments } = await params;
  const scanId = decodeURIComponent(rawScanId);
  const issueRouteSegment = rawIssueSegments.map((segment) => decodeURIComponent(segment)).join("/");

  return <CodeScanningIssueDetailPageClient key={`${scanId}:${issueRouteSegment}`} scanId={scanId} issueRouteSegment={issueRouteSegment} />;
}
