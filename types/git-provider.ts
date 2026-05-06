export type GitProvider = "github" | "gitlab";

export type ProviderAccount = {
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

export type ProviderRepository = {
  provider?: GitProvider;
  repository_id?: string;
  name?: string;
  full_name?: string;
  is_private?: boolean;
  default_branch?: string;
  web_url?: string;
  description?: string | null;
  provider_username?: string;
  updated_at?: string;
  clone_url?: string;
  ssh_url?: string;
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

export type ProviderAccountsResponse = {
  provider?: GitProvider;
  accounts?: ProviderAccount[];
  message?: string;
};

export type ProviderRepositoryBranchesResponse = {
  provider?: GitProvider;
  full_name?: string;
  default_branch?: string;
  branches?: ProviderRepositoryBranch[];
  message?: string;
};

export type ProviderConnectUrlResponse = {
  provider?: GitProvider;
  connect_url?: string;
  message?: string;
};

export type ProviderRepositoryBranchesQueryArg = {
  provider: GitProvider;
  fullName: string;
  repositoryId?: string;
  defaultBranch?: string;
};
