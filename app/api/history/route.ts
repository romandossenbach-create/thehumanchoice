import { canViewAthletePerformance, PRIVATE_ACTIVITY_MESSAGE } from "../../performance-visibility";
import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { localDayKey, validTimeZone } from "../../local-date";
import { COMPOSITE_SESSIONS, singleSetRepetitions } from "../../single-set";

const validId = (value: unknown): value is string => typeof value === "string" && /^[a-zA-Z0-9-]{20,64}$/.test(value);
async function ownsProfile(athleteId: string, userId: string) {
  return Boolean(await env.DB.prepare("SELECT id FROM athletes WHERE id = ? AND owner_user_id = ?").bind(athleteId, userId).first());
}

export async function GET(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    const requestUrl = new URL(request.url);
    const athleteId = requestUrl.searchParams.get("athleteId");
    if (!validId(athleteId)) return Response.json({ error: "Ungültiges Profil." }, { status: 400 });
    const offset = Number(requestUrl.searchParams.get("offset") ?? "0");
    if (!Number.isSafeInteger(offset) || offset < 0) return Response.json({ error: "Ungültige Seitenposition." }, { status: 400 });
    const access = await env.DB.prepare("SELECT private_mode AS privateMode, owner_user_id AS ownerUserId, training_log_public AS permanentlyPublic, (datetime(training_log_public_until) > CURRENT_TIMESTAMP) AS temporarilyPublic, training_log_public_scope AS publicScope FROM athletes WHERE id = ?").bind(athleteId).first<{privateMode:number;ownerUserId:string;permanentlyPublic:number;temporarilyPublic:number;publicScope:string}>();
    if (!access) return Response.json({ error:"Athlet nicht gefunden." }, { status:404 });
    const isOwner = Boolean(user && access.ownerUserId === user.id);
    if (!canViewAthletePerformance(user, access)) return Response.json({ error:PRIVATE_ACTIVITY_MESSAGE }, { status:403, headers:{"cache-control":"private, no-store"} });
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone:"Europe/Zurich", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date());
    const visibleAsCommunity = !isOwner;
    const todayOnly = visibleAsCommunity && access.publicScope === "today";
    const pageSize = 200; // A page size limits one response, never the number of stored sets.
    const statement = todayOnly
      ? env.DB.prepare(`SELECT id, request_id AS requestId, reps, entry_date AS entryDate, created_at AS createdAt, edited_at AS editedAt, evidence_key IS NOT NULL AS hasEvidence FROM entries WHERE athlete_id = ? AND entry_date = ? ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(athleteId, today, pageSize, offset)
      : env.DB.prepare(`SELECT id, request_id AS requestId, reps, entry_date AS entryDate, created_at AS createdAt, edited_at AS editedAt, evidence_key IS NOT NULL AS hasEvidence FROM entries WHERE athlete_id = ? ORDER BY entry_date DESC, created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(athleteId, pageSize, offset);
    const result = await statement.all();
    const entries = result.results.map((row) => ({ ...row, setReps: singleSetRepetitions(String(row.requestId), Number(row.reps)) }));
    const challenge = offset === 0 && (isOwner || !access.privateMode) ? await env.DB.prepare(`SELECT days, target, start, total, time_zone AS timeZone FROM challenges WHERE owner_user_id = ? LIMIT 1`).bind(access.ownerUserId).first<{days:number;target:number;start:string;total:number;timeZone:string}>() : null;
    const challengeZone = validTimeZone(challenge?.timeZone);
    const startKey = challenge ? localDayKey(new Date(challenge.start), challengeZone) : "";
    const challengeToday = localDayKey(new Date(), challengeZone);
    const challengeDay = challenge ? Math.floor((Date.parse(`${challengeToday}T12:00:00Z`) - Date.parse(`${startKey}T12:00:00Z`)) / 86400000) + 1 : 0;
    const activeChallenge = challenge && challenge.days > 0 && challenge.target > 0 && challengeDay >= 1 && challengeDay <= challenge.days
      ? { days:challenge.days, target:challenge.target, total:challenge.total, day:challengeDay } : null;
    return Response.json({ entries, nextOffset:result.results.length === pageSize ? offset + pageSize : null, readOnly:visibleAsCommunity, challenge:activeChallenge }, { headers:{"cache-control":"private, no-store"} });
  } catch (error) {
    console.error("history GET failed", error);
    return Response.json({ error: "Trainingshistorie nicht verfügbar." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const athleteId = body.athleteId;
    const entryId = Number(body.entryId);
    const reps = Number(body.reps);
    if (!validId(athleteId) || !Number.isInteger(entryId) || !Number.isInteger(reps) || reps < 1 || reps > 121) {
      return Response.json({ error: "Ungültige Korrektur." }, { status: 400 });
    }
    if (!await ownsProfile(athleteId, user.id)) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const previous = await env.DB.prepare("SELECT reps, request_id AS requestId, entry_date AS entryDate FROM entries WHERE id = ? AND athlete_id = ?").bind(entryId, athleteId).first<{ reps:number; requestId:string; entryDate:string }>();
    if (!previous) return Response.json({ error: "Eintrag nicht gefunden." }, { status: 404 });
    if (COMPOSITE_SESSIONS[previous.requestId]) return Response.json({ error: "Diese Session besteht aus mehreren Sätzen und kann nicht als einzelner Satz korrigiert werden." }, { status: 409 });
    await env.DB.prepare("UPDATE entries SET reps = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ? AND athlete_id = ?").bind(reps, entryId, athleteId).run();
    const difference = reps - Number(previous.reps || 0);
    const todayIso = localDayKey();
    const todayLabel = todayIso;
    await env.DB.prepare(`UPDATE challenges SET total = MAX(0, total + ?), today = CASE WHEN ? = ? AND today_date = ? THEN MAX(0, today + ?) ELSE today END, updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ?`).bind(difference, previous.entryDate, todayIso, todayLabel, difference, user.id).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("history PATCH failed", error);
    return Response.json({ error: "Korrektur konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const athleteId = body.athleteId;
    const entryId = Number(body.entryId);
    if (!validId(athleteId) || !Number.isInteger(entryId)) return Response.json({ error: "Ungültiger Eintrag." }, { status: 400 });
    if (!await ownsProfile(athleteId, user.id)) return Response.json({ error: "Keine Berechtigung." }, { status: 403 });
    const row = await env.DB.prepare("SELECT evidence_key AS evidenceKey, reps, entry_date AS entryDate FROM entries WHERE id = ? AND athlete_id = ?").bind(entryId, athleteId).first<{ evidenceKey: string | null; reps:number; entryDate:string }>();
    if (!row) return Response.json({ error: "Eintrag nicht gefunden." }, { status: 404 });
    await env.DB.prepare("DELETE FROM entries WHERE id = ? AND athlete_id = ?").bind(entryId, athleteId).run();
    const todayIso = localDayKey();
    const todayLabel = todayIso;
    await env.DB.prepare(`UPDATE challenges SET total = MAX(0, total - ?), today = CASE WHEN ? = ? AND today_date = ? THEN MAX(0, today - ?) ELSE today END, updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ?`).bind(row.reps, row.entryDate, todayIso, todayLabel, row.reps, user.id).run();
    if (row.evidenceKey) await env.BUCKET.delete(row.evidenceKey);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("history DELETE failed", error);
    return Response.json({ error: "Eintrag konnte nicht gelöscht werden." }, { status: 500 });
  }
}
