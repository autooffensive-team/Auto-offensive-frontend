import CodeScanningDetailPageClient from "./page-client";

export default async function CodeScanningDetailPage({
  params,
}: {
  params: Promise<{ "scan-id": string }>;
}) {
  const { "scan-id": scanId } = await params;
  return <CodeScanningDetailPageClient key={scanId} scanId={scanId} />;
}
