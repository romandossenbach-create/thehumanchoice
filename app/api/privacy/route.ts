import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
const headers = { "cache-control": "private, no-store" };
export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401, headers });
  const row = await env.DB!.prepare("SELECT private_mode AS privateMode FROM athletes WHERE owner_user_id = ? LIMIT 1").bind(user.id).first<{privateMode:number}>();
  if (!row) return Response.json({ error: "Profil nicht gefunden." }, { status: 404, headers });
  return Response.json({ privateMode: Boolean(row.privateMode) }, { headers });
}
export async function PUT(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401, headers });
  const body = await request.json().catch(() => null) as {privateMode?:unknown} | null;
  if (!body || typeof body.privateMode !== "boolean") return Response.json({ error: "ON oder OFF auswählen." }, { status: 400, headers });
  const result = await env.DB!.prepare("UPDATE athletes SET private_mode = ? WHERE owner_user_id = ?").bind(body.privateMode ? 1 : 0, user.id).run();
  if (!result.meta.changes) return Response.json({ error: "Profil nicht gefunden." }, { status: 404, headers });
  return Response.json({ privateMode: body.privateMode }, { headers });
}
