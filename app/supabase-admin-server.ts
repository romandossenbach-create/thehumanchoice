import { SUPABASE_URL } from "./supabase-config";
import { getSupabaseServiceRoleKey } from "./supabase-server";

export type AuthAccount = { id: string; email: string | null; created_at: string };

function keyDiagnostic(key: string): string {
  if (key.startsWith("sb_secret_")) return "Typ: Secret-Key";
  if (key.startsWith("sb_publishable_")) return "Typ: Publishable-Key";
  try {
    const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string; ref?: string };
    return `Typ: Legacy-JWT; Rolle: ${payload.role === "service_role" ? "service_role" : "andere"}; Projekt: ${payload.ref === new URL(SUPABASE_URL).hostname.split(".")[0] ? "passend" : "abweichend"}`;
  } catch { return "Typ: unbekannt"; }
}

export async function listSupabaseAuthAccounts(): Promise<AuthAccount[]> {
  const key = getSupabaseServiceRoleKey();
  const headers: Record<string, string> = { apikey: key };
  // Legacy service_role keys are JWTs; new sb_secret keys must not be Bearer tokens.
  if (!key.startsWith("sb_secret_")) headers.authorization = `Bearer ${key}`;
  const accounts: AuthAccount[] = [];
  for (let page = 1; page <= 1000; page++) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Supabase-Adminabfrage fehlgeschlagen (${response.status}; ${keyDiagnostic(key)}).`);
    const data = await response.json() as { users?: AuthAccount[] };
    if (!Array.isArray(data.users)) throw new Error("Supabase-Adminantwort ungültig.");
    accounts.push(...data.users.map(({ id, email, created_at }) => ({ id, email: email || null, created_at })));
    if (data.users.length < 100) return accounts;
  }
  throw new Error("Supabase-Adminabfrage überschritt das Seitenlimit.");
}
