import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { TRAINING_LOG_TEST_CAMPAIGN } from "../../training-log-campaign";

export async function POST(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error:"Bitte anmelden." }, { status:401 });
  const now = Date.now();
  if (!TRAINING_LOG_TEST_CAMPAIGN.active || now < Date.parse(TRAINING_LOG_TEST_CAMPAIGN.startsAt) || now >= Date.parse(TRAINING_LOG_TEST_CAMPAIGN.endsAt)) return Response.json({ error:"Die Testfreigabe ist nicht mehr aktiv." }, { status:410 });
  await env.DB.prepare("UPDATE athletes SET training_log_public_until = ?, training_log_public_scope = 'today' WHERE owner_user_id = ?").bind(TRAINING_LOG_TEST_CAMPAIGN.endsAt, user.id).run();
  return Response.json({ ok:true, until:TRAINING_LOG_TEST_CAMPAIGN.endsAt });
}

export async function DELETE(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return Response.json({ error:"Bitte anmelden." }, { status:401 });
  await env.DB.prepare("UPDATE athletes SET training_log_public_until = NULL WHERE owner_user_id = ?").bind(user.id).run();
  return Response.json({ ok:true });
}
