export type CITokenScope = "code_scan:ingest" | "code_scan:read";

export type CreateCITokenRequest = {
  project_id: string;
  name: string;
  description?: string;
  scopes?: CITokenScope[];
  expires_at?: string | null;
  no_expiry?: boolean;
};

export type CreateCITokenResponse = {
  token_id: string;
  plain_token: string;
  prefix: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  no_expiry: boolean;
};

export type CITokenResponse = {
  token_id: string;
  project_id: string;
  user_id: string;
  name: string;
  prefix: string;
  description?: string | null;
  scopes: string[];
  is_active: boolean;
  revoked_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  last_used_at?: string | null;
};

export type CITokenListResponse = {
  tokens: CITokenResponse[];
};

export type RevokeCITokenResponse = {
  token_id: string;
  success: boolean;
};
