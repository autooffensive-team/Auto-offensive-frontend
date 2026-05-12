import { baseApi } from "@/lib/redux/services/base-api";
import type {
  DashboardMostVulnerableQuery,
  DashboardMostVulnerableResponse,
  DashboardOverviewResponse,
  DashboardRiskDistributionResponse,
  DashboardSeverityResponse,
  DashboardTopListQuery,
  DashboardTopPort,
  DashboardTopService,
  DashboardTopTechnology,
  DashboardTrendQuery,
  DashboardTrendResponse,
} from "@/types/overview";

const DASHBOARD_PROXY_PATH = "dashboard";

type QueryScalar = string | number | boolean | null | undefined;

function buildDashboardUrl(
  path: string,
  query?: Record<string, QueryScalar> | void,
): string {
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null || value === "") continue;
      searchParams.set(key, String(value));
    }
  }

  const search = searchParams.toString();
  return search
    ? `${DASHBOARD_PROXY_PATH}/${path}?${search}`
    : `${DASHBOARD_PROXY_PATH}/${path}`;
}

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverviewResponse, void>({
      query: () => buildDashboardUrl("overview"),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_OVERVIEW" }],
    }),
    getDashboardVulnerabilitySeverity: builder.query<DashboardSeverityResponse, void>({
      query: () => buildDashboardUrl("vulnerabilities/severity"),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_SEVERITY" }],
    }),
    getDashboardVulnerabilityTrend: builder.query<DashboardTrendResponse, DashboardTrendQuery | void>({
      query: (args) => buildDashboardUrl("vulnerabilities/trend", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_VULNERABILITY_TREND" }],
    }),
    getDashboardTopPorts: builder.query<DashboardTopPort[], DashboardTopListQuery | void>({
      query: (args) => buildDashboardUrl("ports/top", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_TOP_PORTS" }],
    }),
    getDashboardTopServices: builder.query<DashboardTopService[], DashboardTopListQuery | void>({
      query: (args) => buildDashboardUrl("services/top", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_TOP_SERVICES" }],
    }),
    getDashboardTopTechnologies: builder.query<DashboardTopTechnology[], DashboardTopListQuery | void>({
      query: (args) => buildDashboardUrl("technologies/top", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_TOP_TECHNOLOGIES" }],
    }),
    getDashboardAssetsTrend: builder.query<DashboardTrendResponse, DashboardTrendQuery | void>({
      query: (args) => buildDashboardUrl("assets/trend", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_ASSETS_TREND" }],
    }),
    getDashboardRiskDistribution: builder.query<DashboardRiskDistributionResponse, void>({
      query: () => buildDashboardUrl("risk/distribution"),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_RISK_DISTRIBUTION" }],
    }),
    getDashboardMostVulnerableAssets: builder.query<
      DashboardMostVulnerableResponse,
      DashboardMostVulnerableQuery | void
    >({
      query: (args) => buildDashboardUrl("assets/most-vulnerable", args),
      providesTags: [{ type: "Gateway" as const, id: "DASHBOARD_MOST_VULNERABLE" }],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardVulnerabilitySeverityQuery,
  useGetDashboardVulnerabilityTrendQuery,
  useGetDashboardTopPortsQuery,
  useGetDashboardTopServicesQuery,
  useGetDashboardTopTechnologiesQuery,
  useGetDashboardAssetsTrendQuery,
  useGetDashboardRiskDistributionQuery,
  useGetDashboardMostVulnerableAssetsQuery,
} = overviewApi;
