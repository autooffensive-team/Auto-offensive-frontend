export type DashboardOverviewResponse = {
  totalIpAddresses: number;
  totalHostnames: number;
  totalOpenPorts: number;
  totalProtocols: number;
  totalServices: number;
  totalTechnologies: number;
  totalVulnerabilities: number;
  totalCodeScanIssues: number;
  totalDependencyIssues: number;
  totalCodeScans: number;
  scanTools: DashboardScanToolSummary[];
};

export type DashboardScanToolSummary = {
  toolName: string;
  totalIssues: number;
  totalScans: number;
};

export type DashboardChartDataset = {
  label: string;
  data: number[];
};

export type DashboardSeverityResponse = {
  labels: string[];
  datasets: DashboardChartDataset[];
};

export type DashboardTrendQuery = {
  range?: string;
  startDate?: string;
  endDate?: string;
};

export type DashboardTrendResponse = {
  labels: string[];
  datasets: DashboardChartDataset[];
};

export type DashboardTopPort = {
  port: number;
  protocol: string;
  count: number;
  percentage: number;
};

export type DashboardTopService = {
  serviceName: string;
  count: number;
  affectedHosts: number;
};

export type DashboardTopTechnology = {
  technology: string;
  version: string;
  count: number;
};

export type DashboardTopListQuery = {
  limit?: number;
};

export type DashboardRiskBucket = {
  bucket: string;
  count: number;
};

export type DashboardRiskDistributionResponse = {
  labels: string[];
  datasets: DashboardChartDataset[];
  buckets: DashboardRiskBucket[];
};

export type DashboardMostVulnerableAsset = {
  assetId: string;
  hostname: string;
  ip: string | null;
  vulnerabilityCount: number;
  highestSeverity: string;
  riskScore: number;
};

export type DashboardMostVulnerableQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  search?: string;
  hostname?: string;
  ip?: string;
  highestSeverity?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
};

export type DashboardMostVulnerableResponse = {
  items: DashboardMostVulnerableAsset[];
  page: number;
  pageSize: number;
  total: number;
};
