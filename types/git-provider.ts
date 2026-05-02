export type GitProvider = "github" | "gitlab";

export type ProviderRepository = {
  provider?: GitProvider;
  repository_id?: string;
  name?: string;
  full_name?: string;
  is_private?: boolean;
  default_branch?: string;
  web_url?: string;
  description?: string | null;
};

export type ProviderRepositoryBranch = {
  name?: string;
  is_default?: boolean;
  protected?: boolean;
};

export type ProviderRepositoriesResponse = {
  provider?: GitProvider;
  repositories?: ProviderRepository[];
  message?: string;
};

export type ProviderRepositoryBranchesResponse = {
  provider?: GitProvider;
  full_name?: string;
  default_branch?: string;
  branches?: ProviderRepositoryBranch[];
  message?: string;
};

export type ProviderRepositoryBranchesQueryArg = {
  provider: GitProvider;
  fullName: string;
  repositoryId?: string;
  defaultBranch?: string;
};
