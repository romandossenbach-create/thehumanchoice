import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";
import { env } from "cloudflare:workers";

export function getSupabaseServiceRoleKey(): string {
  const key = (env as unknown as Record<string, string | undefined>).SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Supabase-Adminzugang nicht konfiguriert.");
  return key;
}

const ADMIN_EMAILS = new Set(["roman.dossenbach@gmail.com"]);
const ADMIN_USER_IDS = new Set(["77e8d9e3-e947-4185-955f-28502e4a8deb"]);

export type SupabaseUser = { id: string; email: string; gender: "male" | "female" | null; isAdmin: boolean; aal: "aal1" | "aal2" };

function tokenAal(authorization: string) {
  try {
    const token = authorization.slice(7).split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(token.padEnd(Math.ceil(token.length / 4) * 4, "="))) as { aal?:string };
    return payload.aal === "aal2" ? "aal2" as const : "aal1" as const;
  } catch { return "aal1" as const; }
}

export async function getSupabaseUser(request: Request): Promise<SupabaseUser | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  let response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, authorization },
  });
  if (response.status === 429 || response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, authorization },
    });
  }
  if (response.status === 429 || response.status >= 500) throw new Error(`Authentifizierungsdienst nicht erreichbar (${response.status})`);
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email?: string; user_metadata?:{ gender?:string } };
  if (!user.id || !user.email) return null;
  const email = user.email.toLowerCase();
  const gender = user.user_metadata?.gender === "female" ? "female" as const : user.user_metadata?.gender === "male" ? "male" as const : null;
  return { id:user.id, email:user.email, gender, isAdmin:ADMIN_USER_IDS.has(user.id) || ADMIN_EMAILS.has(email), aal:tokenAal(authorization) };
}

export async function requireAdmin(request: Request) {
  const user = await getSupabaseUser(request);
  return user?.isAdmin && user.aal === "aal2" ? user : null;
}
