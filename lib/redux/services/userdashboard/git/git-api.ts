import { baseApi } from "@/lib/redux/services/base-api";
import type {
  ProviderAccount,
  ProviderAccountsResponse,
  ProviderConnectUrlResponse,
  GitProvider,
  ProviderRepositoriesResponse,
  ProviderRepository,
  ProviderRepositoryBranch,
  ProviderRepositoryBranchesQueryArg,
  ProviderRepositoryBranchesResponse,
} from "@/types/git-provider";

type BackendRepository = {
  id?: string;
  repository_id?: string;
  name?: string;
  full_name?: string;
  url?: string;
  web_url?: string;
  is_private?: boolean;
  default_branch?: string;
  description?: string | null;
  provider_username?: string;
  updated_at?: string;
  clone_url?: string;
  ssh_url?: string;
};

type BackendBranch = {
  name?: string;
  is_default?: boolean;
  protected?: boolean;
};

type BackendBranchesResponse = {
  provider?: GitProvider;
  full_name?: string;
  default_branch?: string;
  branches?: BackendBranch[];
};

type BackendAccount = {
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

function normalizeRepository(
  provider: GitProvider,
  repository: BackendRepository,
): ProviderRepository {
  return {
    provider,
    repository_id: repository.repository_id ?? repository.id ?? "",
    name: repository.name ?? "",
    full_name: repository.full_name ?? "",
    is_private: Boolean(repository.is_private),
    default_branch: repository.default_branch ?? "",
    web_url: repository.web_url ?? repository.url ?? "",
    description: repository.description ?? null,
    provider_username: repository.provider_username ?? "",
    updated_at: repository.updated_at ?? "",
    clone_url: repository.clone_url ?? "",
    ssh_url: repository.ssh_url ?? "",
  };
}

function normalizeBranch(branch: BackendBranch): ProviderRepositoryBranch {
  return {
    name: branch.name ?? "",
    is_default: Boolean(branch.is_default),
    protected: Boolean(branch.protected),
  };
}

function resolveDefaultBranch(
  branches: ProviderRepositoryBranch[],
  fallbackDefaultBranch?: string,
): string {
  const preferred = fallbackDefaultBranch?.trim();
  if (preferred) {
    return preferred;
  }

  const detected = branches.find((branch) => branch.is_default && branch.name?.trim())?.name?.trim();
  return detected ?? "";
}

function normalizeAccount(account: BackendAccount): ProviderAccount {
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

function buildProviderRepositoriesPath(provider: GitProvider): string {
  return `integrations/${provider}/repositories`;
}

function buildProviderAccountsPath(provider: GitProvider): string {
  return `integrations/${provider}/accounts`;
}

function buildProviderConnectUrlPath(provider: GitProvider): string {
  return `integrations/${provider}/connect-url`;
}

function buildProviderRepositoryBranchesPath({
  provider,
  fullName,
}: ProviderRepositoryBranchesQueryArg): string {
  const resolvedFullName = fullName.trim();
  if (!resolvedFullName) {
    throw new Error("Repository fullName is required to fetch branches.");
  }
  return `integrations/${provider}/repositories/branches?full_name=${encodeURIComponent(resolvedFullName)}`;
}

export const gitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProviderAccounts: builder.query<ProviderAccountsResponse, GitProvider>({
      query: (provider) => buildProviderAccountsPath(provider),
      transformResponse: (response: BackendAccount[], _meta, provider) => ({
        provider,
        accounts: Array.isArray(response) ? response.map(normalizeAccount) : [],
      }),
      providesTags: (_result, _error, provider) => [
        { type: "Git" as const, id: `ACCOUNTS:${provider}` },
      ],
    }),
    getProviderRepositories: builder.query<ProviderRepositoriesResponse, GitProvider>({
      query: (provider) => buildProviderRepositoriesPath(provider),
      transformResponse: (response: BackendRepository[], _meta, provider) => ({
        provider,
        repositories: Array.isArray(response)
          ? response.map((repository) => normalizeRepository(provider, repository))
          : [],
      }),
      providesTags: (_result, _error, provider) => [
        { type: "Git" as const, id: `REPOSITORIES:${provider}` },
      ],
    }),
    getProviderRepositoryBranches: builder.query<
      ProviderRepositoryBranchesResponse,
      ProviderRepositoryBranchesQueryArg
    >({
      query: (arg) => buildProviderRepositoryBranchesPath(arg),
      transformResponse: (response: BackendBranchesResponse, _meta, arg) => {
        const payload = response;
        const branches = Array.isArray(payload?.branches)
          ? payload.branches.map(normalizeBranch)
          : [];
        return {
          provider: payload?.provider ?? arg.provider,
          full_name: payload?.full_name ?? arg.fullName,
          default_branch: resolveDefaultBranch(branches, payload?.default_branch ?? arg.defaultBranch),
          branches,
        };
      },
      providesTags: (_result, _error, { provider, fullName, repositoryId }) => [
        { type: "Git" as const, id: `BRANCHES:${provider}:${repositoryId ?? fullName}` },
      ],
    }),
    getProviderConnectUrl: builder.query<ProviderConnectUrlResponse, GitProvider>({
      query: (provider) => buildProviderConnectUrlPath(provider),
    }),
  }),
});

export const {
  useGetProviderAccountsQuery,
  useGetProviderRepositoriesQuery,
  useGetProviderRepositoryBranchesQuery,
  useGetProviderConnectUrlQuery,
  useLazyGetProviderConnectUrlQuery,
} = gitApi;
