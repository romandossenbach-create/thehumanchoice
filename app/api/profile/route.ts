import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { roadCorsJson, roadCorsOptions } from "../../cors";

const FEATURED_ATHLETE_ID = "0431b2b7-b3d3-4666-b5ad-f0d53709b686";

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, maximum) : "";
}

export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  const profile = await env.DB.prepare(
    `SELECT id, athlete_number AS athleteNumber, name, last_name AS lastName, country, gender, birth_date AS birthDate, private_mode AS privateMode, training_log_public AS trainingLogPublic, training_log_public_scope AS trainingLogPublicScope, training_log_public_until AS trainingLogPublicUntil
     FROM athletes WHERE owner_user_id = ?
     ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at ASC LIMIT 1`,
  ).bind(user.id, FEATURED_ATHLETE_ID).first();
  return roadCorsJson(request, { profile: profile || null }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error:"Bitte zuerst anmelden." }, { status:401 });
  const body = await request.json<Record<string, unknown>>().catch(() => null);
  if (!body) return roadCorsJson(request, { error:"Ungültige Profildaten." }, { status:400 });
  const name = cleanText(body.name, 40);
  const lastName = cleanText(body.lastName, 60);
  const country = cleanText(body.country, 56);
  const birthDate = cleanText(body.birthDate, 10);
  const gender = body.gender === "female" ? "female" : body.gender === "male" ? "male" : "";
  const shareDuration = body.trainingLogShareDuration;
  const trainingLogPublic = shareDuration === "always" ? 1 : shareDuration === "day" || shareDuration === "private" ? 0 : body.trainingLogPublic === true ? 1 : 0;
  const trainingLogPublicUntil = shareDuration === "day" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;
  const trainingLogPublicScope = body.trainingLogPublicScope === "today" ? "today" : "all";
  if (name.length < 2 || country.length < 2 || !gender) {
    return roadCorsJson(request, { error:"Name, Land und Geschlecht werden benötigt." }, { status:400 });
  }
  const existing = await env.DB.prepare(
    "SELECT id, athlete_number AS athleteNumber, private_mode AS privateMode FROM athletes WHERE owner_user_id = ? LIMIT 1",
  ).bind(user.id).first<{id:string;athleteNumber:number;privateMode:number}>();
  const privateMode = Number(existing?.privateMode || 0);
  let athleteNumber = Number(existing?.athleteNumber || 0);
  if (!athleteNumber) {
    const allocation = await env.DB.prepare(
      "UPDATE athlete_number_sequence SET next_number = next_number + 1 WHERE id = 1 RETURNING next_number - 1 AS athleteNumber",
    ).first<{athleteNumber:number}>();
    athleteNumber = Number(allocation?.athleteNumber || 0);
  }
  if (!athleteNumber) return roadCorsJson(request, { error:"Athleten-ID konnte nicht vergeben werden." }, { status:500 });
  const requestedId = cleanText(body.athleteId, 64);
  const id = existing?.id || (/^[a-zA-Z0-9-]{20,64}$/.test(requestedId) ? requestedId : crypto.randomUUID());
  const claimed = await env.DB.prepare("SELECT owner_user_id AS ownerUserId FROM athletes WHERE id = ?").bind(id).first<{ownerUserId:string}>();
  if (claimed && claimed.ownerUserId !== user.id) return roadCorsJson(request, {error:"Keine Berechtigung."}, {status:403});
  await env.DB.prepare(
    "INSERT INTO athletes (id, athlete_number, name, last_name, country, gender, birth_date, owner_user_id, training_log_public, training_log_public_scope, training_log_public_until, private_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, last_name=excluded.last_name, country=excluded.country, gender=excluded.gender, birth_date=excluded.birth_date, owner_user_id=excluded.owner_user_id, training_log_public=excluded.training_log_public, training_log_public_scope=excluded.training_log_public_scope, training_log_public_until=excluded.training_log_public_until, private_mode=excluded.private_mode",
  ).bind(id, athleteNumber, name, lastName, country, gender, birthDate, user.id, trainingLogPublic, trainingLogPublicScope, trainingLogPublicUntil, privateMode).run();
  return roadCorsJson(request, { profile:{ id, athleteNumber, name, lastName, country, gender, birthDate, privateMode:Boolean(privateMode), trainingLogPublic:Boolean(trainingLogPublic), trainingLogPublicScope, trainingLogPublicUntil } });
}

export async function DELETE(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  const profiles = await env.DB.prepare(
    `SELECT id, profile_photo_key AS profilePhotoKey FROM athletes WHERE owner_user_id = ?`,
  ).bind(user.id).all<{ id: string; profilePhotoKey: string | null }>();
  const ids = profiles.results.map((profile) => profile.id);
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const evidence = await env.DB.prepare(`SELECT evidence_key AS evidenceKey FROM entries WHERE athlete_id IN (${placeholders}) AND evidence_key IS NOT NULL`).bind(...ids).all<{ evidenceKey: string }>();
    const objectKeys = [...profiles.results.map((profile) => profile.profilePhotoKey), ...evidence.results.map((entry) => entry.evidenceKey)].filter((key): key is string => Boolean(key));
    if (objectKeys.length) await env.BUCKET.delete(objectKeys);
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM entries WHERE athlete_id IN (${placeholders})`).bind(...ids),
      env.DB.prepare(`DELETE FROM athletes WHERE id IN (${placeholders})`).bind(...ids),
    ]);
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM challenges WHERE owner_user_id = ?").bind(user.id),
    env.DB.prepare("DELETE FROM road_plans WHERE owner_user_id = ?").bind(user.id),
  ]);
  return roadCorsJson(request, { ok: true });
}

export async function OPTIONS(request: Request) {
  return roadCorsOptions(request);
}
