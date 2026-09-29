import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";

const noCache = { "cache-control":"private, no-store" };

export async function GET(request:Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error:"Bitte anmelden." }, { status:401, headers:noCache });
  const row = await env.DB.prepare("SELECT id, training_log_public AS enabled, training_log_public_scope AS scope, training_log_public_until AS until FROM athletes WHERE owner_user_id = ? LIMIT 1").bind(user.id).first<{id:string;enabled:number;scope:string|null;until:string|null}>();
  if (!row) return Response.json({ error:"Zuerst ein Athletenprofil erstellen." }, { status:404, headers:noCache });
  const activeUntil = row.until && Date.parse(row.until) > Date.now() ? row.until : null;
  return Response.json({ athleteId:row.id, duration:row.enabled ? "always" : activeUntil ? (Date.parse(activeUntil) - Date.now() > 86_400_000 ? "week" : "day") : "private", scope:row.scope === "today" ? "today" : "all", until:activeUntil }, { headers:noCache });
}

export async function PUT(request:Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error:"Bitte anmelden." }, { status:401, headers:noCache });
  const body = await request.json().catch(() => null) as { duration?:unknown; scope?:unknown } | null;
  if (!body || !["private","day","week","always"].includes(String(body.duration)) || !["today","all"].includes(String(body.scope))) return Response.json({ error:"Freigabe und Umfang auswählen." }, { status:400, headers:noCache });
  const duration = body.duration as "private"|"day"|"week"|"always", scope=body.scope as "today"|"all";
  const until=duration === "day" || duration === "week" ? new Date(Date.now()+(duration === "day" ? 1 : 7)*86_400_000).toISOString() : null;
  const result=await env.DB.prepare("UPDATE athletes SET training_log_public = ?, training_log_public_until = ?, training_log_public_scope = ? WHERE owner_user_id = ?").bind(duration === "always" ? 1 : 0, until, scope, user.id).run();
  if (!result.meta.changes) return Response.json({ error:"Zuerst ein Athletenprofil erstellen." }, { status:404, headers:noCache });
  return Response.json({ duration, scope, until }, { headers:noCache });
}
