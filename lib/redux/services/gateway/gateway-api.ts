import { baseApi } from "@/lib/redux/services/base-api";

export type GatewayHealthResponse = {
  status: string;
};

export const gatewayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGatewayHealth: builder.query<GatewayHealthResponse, void>({
      query: () => "health",
      providesTags: [{ type: "Gateway", id: "HEALTH" }],
    }),
  }),
});

export const { useGetGatewayHealthQuery } = gatewayApi;
