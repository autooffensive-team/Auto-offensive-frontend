import { baseApi } from "@/lib/redux/services/base-api";
import type {
  GitProvider,
  ProviderRepositoriesResponse,
  ProviderRepository,
  ProviderRepositoryBranch,
  ProviderRepositoryBranchesQueryArg,
  ProviderRepositoryBranchesResponse,
} from "@/types/git-provider";

type BackendRepository = {
  id?: string;
  name?: string;
  full_name?: string;
  url?: string;
  is_private?: boolean;
  default_branch?: string;
  description?: string | null;
};

type BackendBranch = {
  name?: string;
  is_default?: boolean;
};

function normalizeRepository(
  provider: GitProvider,
  repository: BackendRepository,
): ProviderRepository {
  return {
    provider,
    repository_id: repository.id ?? "",
    name: repository.name ?? "",
    full_name: repository.full_name ?? "",
    is_private: Boolean(repository.is_private),
    default_branch: repository.default_branch ?? "",
    web_url: repository.url ?? "",
    description: repository.description ?? null,
  };
}

function normalizeBranch(branch: BackendBranch): ProviderRepositoryBranch {
  return {
    name: branch.name ?? "",
    is_default: Boolean(branch.is_default),
    protected: false,
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

function buildProviderRepositoriesPath(provider: GitProvider): string {
  return `git/${provider}/repositories`;
}

function buildProviderRepositoryBranchesPath({
  provider,
  fullName,
  repositoryId,
}: ProviderRepositoryBranchesQueryArg): string {
  if (provider === "github") {
    const [owner, repo] = fullName.trim().split("/");
    if (!owner || !repo) {
      throw new Error(`GitHub repository fullName must be "owner/repo". Received: ${fullName}`);
    }
    return `git/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`;
  }

  const resolvedRepositoryId = repositoryId?.trim();
  if (!resolvedRepositoryId) {
    throw new Error("GitLab repositoryId is required to fetch branches from the current backend route.");
  }
  return `git/gitlab/repositories/${encodeURIComponent(resolvedRepositoryId)}/branches`;
}

export const gitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      transformResponse: (response: BackendBranch[], _meta, arg) => {
        const branches = Array.isArray(response) ? response.map(normalizeBranch) : [];
        return {
          provider: arg.provider,
          full_name: arg.fullName,
          default_branch: resolveDefaultBranch(branches, arg.defaultBranch),
          branches,
        };
      },
      providesTags: (_result, _error, { provider, fullName, repositoryId }) => [
        { type: "Git" as const, id: `BRANCHES:${provider}:${repositoryId ?? fullName}` },
      ],
    }),
  }),
});

export const {
  useGetProviderRepositoriesQuery,
  useGetProviderRepositoryBranchesQuery,
} = gitApi;
