import { baseApi } from "@/lib/redux/services/base-api";
import type { ProviderAccount } from "@/types/git-provider";

type BackendIntegrationAccount = {
  id?: string;
  user_id?: string;
  provider_type?: string;
  provider_account_id?: string;
  provider_username?: string;
  provider_email?: string;
  status?: string;
  connected_at?: string;
  updated_at?: string;
};

function normalizeIntegrationAccount(
  account: BackendIntegrationAccount,
): ProviderAccount {
  return {
    id: account.id ?? "",
    user_id: account.user_id ?? "",
    provider_type: account.provider_type ?? "",
    provider_account_id: account.provider_account_id ?? "",
    provider_username: account.provider_username ?? "",
    provider_email: account.provider_email ?? "",
    status: account.status ?? "",
    connected_at: account.connected_at ?? "",
    updated_at: account.updated_at ?? "",
  };
}

export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrationAccounts: builder.query<ProviderAccount[], void>({
      query: () => "integrations/accounts",
      transformResponse: (response: BackendIntegrationAccount[]) =>
        Array.isArray(response)
          ? response.map(normalizeIntegrationAccount)
          : [],
      providesTags: [{ type: "Git" as const, id: "INTEGRATION_ACCOUNTS" }],
    }),
  }),
});

export const { useGetIntegrationAccountsQuery } = integrationsApi;
