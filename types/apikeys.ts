// ─── API Key Types ─────────────────────────────────────────────────────────────

export type ApiKeyScope = string;

/** Response from POST /api/v1/apikeys/create */
export type CreateApiKeyResponse = {
  key_id: string;
  /** Plain-text key — shown only once. Never stored on the server again. */
  plain_key: string;
  prefix: string;
  name: string;
  description: string;
  created_at: string;
};

/** Request body for POST /api/v1/apikeys/create */
export type CreateApiKeyRequest = {
  project_id: string;
  body: {
    name: string;
    description?: string;
    /** Omitted — backend supplies its own default scopes */
  };
};

/** A single API key as returned by list/get endpoints */
export type ApiKey = {
  key_id: string;
  project_id: string;
  user_id: string;
  name: string;
  prefix: string;
  description: string;
  scopes: ApiKeyScope[];
  is_active: boolean;
  revoked_at: string | null;
  expired_at: string | null;
};

/** Response from GET /api/v1/apikeys/project/{project_id} */
export type ApiKeyListResponse = {
  keys: ApiKey[];
};

/** Response from DELETE /api/v1/apikeys/{key_id}/revoke */
export type RevokeApiKeyResponse = {
  key_id: string;
  success: boolean;
};

/** Query params for listing keys */
export type ListApiKeysRequest = {
  project_id: string;
  active_only?: boolean;
};
