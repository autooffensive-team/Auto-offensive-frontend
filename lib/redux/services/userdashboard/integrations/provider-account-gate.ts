import type { GitProvider, ProviderAccount } from "@/types/git-provider";

type ProviderAccountQueryState = {
  isLoading?: boolean;
};

function hasAccountIdentity(account: ProviderAccount): boolean {
  return Boolean(
    account.id?.trim() ||
      account.provider_account_id?.trim() ||
      account.provider_username?.trim() ||
      account.provider_email?.trim(),
  );
}

export function hasConnectedProviderAccount(accounts: ProviderAccount[]): boolean {
  return accounts.some(hasAccountIdentity);
}

function resolveGitProvider(value: string): GitProvider | null {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("github")) return "github";
  if (normalized.includes("gitlab")) return "gitlab";
  return null;
}

export function buildConnectedProviderMap(
  accounts: ProviderAccount[],
): Record<GitProvider, boolean> {
  return accounts.reduce<Record<GitProvider, boolean>>(
    (result, account) => {
      if (!hasAccountIdentity(account)) return result;

      const provider = resolveGitProvider(account.provider_type ?? "");
      if (provider) {
        result[provider] = true;
      }

      return result;
    },
    { github: false, gitlab: false },
  );
}

export function areProviderAccountQueriesReady(
  ...queries: ProviderAccountQueryState[]
): boolean {
  return queries.every((query) => !query.isLoading);
}
