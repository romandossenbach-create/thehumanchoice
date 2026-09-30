import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { roadCorsJson, roadCorsOptions } from "../../cors";
export async function GET(request:Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request,{error:"Bitte anmelden."},{status:401,headers:{"cache-control":"private, no-store"}});
  const row = await env.DB.prepare("SELECT private_mode AS privateMode FROM athletes WHERE owner_user_id = ? LIMIT 1").bind(user.id).first<{privateMode:number}>();
  if (!row) return roadCorsJson(request,{error:"Profil nicht gefunden."},{status:404,headers:{"cache-control":"private, no-store"}});
  return roadCorsJson(request,{privateMode:Boolean(row.privateMode)},{headers:{"cache-control":"private, no-store"}});
}
export async function PUT(request:Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request,{error:"Bitte anmelden."},{status:401});
  const body = await request.json<{privateMode?:unknown}>().catch(()=>null);
  if (typeof body?.privateMode !== "boolean") return roadCorsJson(request,{error:"Ungültige Einstellung."},{status:400});
  const result = await env.DB.prepare("UPDATE athletes SET private_mode = ? WHERE owner_user_id = ?").bind(Number(body.privateMode),user.id).run();
  if (!result.meta.changes) return roadCorsJson(request,{error:"Zuerst ein Athletenprofil erstellen."},{status:404});
  return roadCorsJson(request,{privateMode:body.privateMode},{headers:{"cache-control":"private, no-store"}});
}
export async function OPTIONS(request:Request) { return roadCorsOptions(request); }
