export type AuthenticatedUser = {
  user_id: string;
  username: string;
  email: string;
  alias_name: string;
  avatar_profile: string;
  created_at: string;
  last_modified: string;
};

export type AuthProviderSync = {
  synced: string[];
  errors: string[];
};

export type AuthMeResponse = {
  user_id: string;
  azp: string;
  actor_type: string;
  roles: string[];
  scopes: string[];
  user: AuthenticatedUser;
  provider_sync: AuthProviderSync;
};
