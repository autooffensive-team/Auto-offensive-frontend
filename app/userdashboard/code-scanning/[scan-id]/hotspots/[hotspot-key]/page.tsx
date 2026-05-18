import CodeScanningHotspotDetailPageClient from "./page-client";

export default async function CodeScanningHotspotDetailPage({
  params,
}: {
  params: Promise<{ "scan-id": string; "hotspot-key": string }>;
}) {
  const { "scan-id": rawScanId, "hotspot-key": rawHotspotKey } = await params;
  const scanId = decodeURIComponent(rawScanId);
  const hotspotKey = decodeURIComponent(rawHotspotKey);

  return <CodeScanningHotspotDetailPageClient key={`${scanId}:${hotspotKey}`} scanId={scanId} hotspotKey={hotspotKey} />;
}
