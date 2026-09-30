import { PUBLIC_PERFORMANCE_SQL } from "../../performance-visibility";
import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { roadCorsJson, roadCorsOptions } from "../../cors";
import { localDayKey, localMonthKey, validTimeZone } from "../../local-date";

const FEATURED_ATHLETE_ID = "0431b2b7-b3d3-4666-b5ad-f0d53709b686";
const FELIX_ATHLETE_ID = "d81960f3-9b74-47fb-a348-f8c72725732b";
const COOLDOWN_EXEMPT_ATHLETE_IDS = new Set([
  FEATURED_ATHLETE_ID, // Roman: time-critical world record training
  "6486023e-5793-44d6-ae04-41c8292f37dc", // existing exemption
]);
// Roman's imported totals before the entries recorded by this app.  Keep the
// historical part fixed, then always add the live D1 entries on top of it.
const FEATURED_LEGACY_TOTAL = 78105;
const FEATURED_SEPTEMBER_LEGACY_TOTAL = 18355;
const FEATURED_START_DATE = "2026-07-07";
const FEATURED_HISTORICAL_PERSONAL_BEST = 111;
// Felix Leypoldt's personally verified total from 7 July until the app was
// installed. It contributes only to his all-time total, never to a day/month.
const FELIX_LEGACY_TOTAL = 9786;
const FELIX_START_DATE = "2026-07-07";
// Historical whole-session entries: retain totals, calculate PB from sets.
const FELIX_40_PLUS_40 = "d32dc5cc-f442-4355-b7eb-2d77f435c8d3";
const FELIX_50_PLUS_50 = "c990a414-f4dc-4a82-98d2-d10d33d977a3";
const ROMAN_UNCONFIRMED_120 = "f9bf3293-7565-4e24-9cfd-7887ba941661";
const MAX_SET_REPS = 121;

function cooldownSeconds(reps: number) {
  if (reps <= 20) return 20;
  if (reps <= 40) return 40;
  if (reps <= 60) return 60;
  if (reps <= 80) return 90;
  return 120;
}

function utcTimestamp(value: string) {
  return `${value.replace(" ", "T")}Z`;
}

function inclusiveUtcDays(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

export async function GET(request: Request) {
  try {
    const month = localMonthKey();
    const todayDate = localDayKey();
    const user = new URL(request.url).searchParams.get("owner") === "1" ? await getSupabaseUser(request) : null;
    const result = await env.DB.prepare(
      `SELECT a.id, a.private_mode AS privateMode, a.owner_user_id AS ownerUserId, a.athlete_number AS athleteNumber, a.name, a.last_name AS lastName, a.country, a.gender, a.birth_date AS birthDate, (a.training_log_public = 1 OR datetime(a.training_log_public_until) > CURRENT_TIMESTAMP) AS trainingLogPublic, SUM(e.reps) AS total,
       SUM(CASE WHEN substr(e.entry_date, 1, 7) = ? THEN e.reps ELSE 0 END) AS month,
      SUM(CASE WHEN e.entry_date = ? THEN e.reps ELSE 0 END) AS today,
      MAX(CASE WHEN e.request_id = ? AND e.reps = 80 THEN 40 WHEN e.request_id = ? AND e.reps = 100 THEN 50 WHEN e.request_id = ? AND e.reps = 120 THEN 0 WHEN e.reps BETWEEN 1 AND 121 THEN e.reps ELSE 0 END) AS personalBest,
      MAX(CASE WHEN e.evidence_key IS NULL THEN 0 WHEN e.request_id = ? AND e.reps = 80 THEN 40 WHEN e.request_id = ? AND e.reps = 100 THEN 50 WHEN e.request_id = ? AND e.reps = 120 THEN 0 WHEN e.reps BETWEEN 1 AND 121 THEN e.reps ELSE 0 END) AS verifiedPersonalBest,
      COUNT(DISTINCT CASE WHEN substr(e.entry_date, 1, 7) = ? THEN e.entry_date END) AS activeDays,
      MAX(CASE WHEN e.evidence_key IS NOT NULL THEN 1 ELSE 0 END) AS hasEvidence,
      MAX(CASE WHEN a.profile_photo_key IS NOT NULL THEN 1 ELSE 0 END) AS hasProfilePhoto
       FROM athletes a LEFT JOIN entries e ON e.athlete_id = a.id
       WHERE (${PUBLIC_PERFORMANCE_SQL}) OR a.owner_user_id = ?
       GROUP BY a.id, a.athlete_number, a.name, a.last_name, a.country, a.gender, a.birth_date, a.training_log_public, a.training_log_public_until ORDER BY total DESC, month DESC, a.name ASC`,
    ).bind(month, todayDate, FELIX_40_PLUS_40, FELIX_50_PLUS_50, ROMAN_UNCONFIRMED_120, FELIX_40_PLUS_40, FELIX_50_PLUS_50, ROMAN_UNCONFIRMED_120, month, user?.id || "__no_viewer__").all();
    const performances = result.results.map((row) => {
      const monthTotal = Number(row.month || 0);
      const activeDays = Number(row.activeDays || 0);
      const birthDate = String(row.birthDate || "");
      const today = new Date();
      const born = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? new Date(`${birthDate}T12:00:00Z`) : null;
      let age: number | null = null;
      if (born && !Number.isNaN(born.getTime())) {
        age = today.getUTCFullYear() - born.getUTCFullYear();
        if (today.getUTCMonth() < born.getUTCMonth() || (today.getUTCMonth() === born.getUTCMonth() && today.getUTCDate() < born.getUTCDate())) age--;
      }
      const id = String(row.id);
      const isFeatured = id === FEATURED_ATHLETE_ID;
      const isFelix = id === FELIX_ATHLETE_ID;
      const legacyTotal = isFeatured ? FEATURED_LEGACY_TOTAL : isFelix ? FELIX_LEGACY_TOTAL : 0;
      const total = Number(row.total || 0) + legacyTotal;
      const displayedMonth = isFeatured && month === "2026-09" ? FEATURED_SEPTEMBER_LEGACY_TOTAL + monthTotal : monthTotal;
      const averagePeriodDays = isFeatured || isFelix ? inclusiveUtcDays(isFeatured ? FEATURED_START_DATE : FELIX_START_DATE, todayDate) : null;
      const birthYear = born ? born.getUTCFullYear() : null;
      return { verifiedAchievementMinimum:isFeatured ? 2_000_000 : id === "6486023e-5793-44d6-ae04-41c8292f37dc" ? 1_000_000 : 0, privateMode:Boolean(row.privateMode), ownerUserId:String(row.ownerUserId), id, athleteNumber:Number(row.athleteNumber), name: String(row.name).split(/\\s+/)[0], lastNameInitials: String(row.lastName || "").slice(0, 2), country: String(row.country), gender:row.gender === "female" ? "female" : "male", age, birthYear, today:Number(row.today || 0), personalBest:isFeatured ? Math.max(FEATURED_HISTORICAL_PERSONAL_BEST, Number(row.personalBest || 0)) : Number(row.personalBest || 0), verifiedPersonalBest:Number(row.verifiedPersonalBest || 0), total, month:displayedMonth, activeDays, average:averagePeriodDays ? Math.round(total / averagePeriodDays) : activeDays ? Math.round(monthTotal / activeDays) : 0, averagePeriodDays, hasEvidence: Boolean(row.hasEvidence), hasProfilePhoto: Boolean(row.hasProfilePhoto), trainingLogPublic:!Boolean(row.privateMode) && Boolean(row.trainingLogPublic), isFeatured, challenge:isFeatured ? { day:44, total:47451, goal:100000 } : null };
    });
    const monthLabel = new Intl.DateTimeFormat("de-CH", { month: "long", year: "numeric", timeZone: "Europe/Zurich" }).format(new Date());
    const publicPerformances = performances.filter((row) => !row.privateMode);
    const stripAccess = ({privateMode, ownerUserId, ...performance}: typeof performances[number]) => performance;
    const leaders = publicPerformances.map(stripAccess);
    const owned = user ? performances.find((row) => row.ownerUserId === user.id) : null;
    return roadCorsJson(request,
      { leaders, ownerPerformance:owned ? stripAccess(owned) : null, summary: { total:leaders.reduce((sum,row)=>sum+row.total,0), month:leaders.reduce((sum,row)=>sum+row.month,0), athletes:leaders.length }, monthLabel },
      { headers: { "cache-control": "private, no-store, no-cache, must-revalidate", "vary":"Authorization" } },
    );
  } catch (error) {
    console.error("leaderboard GET failed", error);
    return Response.json({ error: "Rangliste vorübergehend nicht verfügbar." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const requestedAthleteId = cleanText(body.athleteId, 64);
    const requestId = cleanText(body.requestId, 64);
    const name = cleanText(body.name, 40);
    const lastName = cleanText(body.lastName, 60);
    const country = cleanText(body.country, 56);
    const gender = body.gender === "female" ? "female" : body.gender === "male" ? "male" : "";
    const requestedBirthDate = cleanText(body.birthDate, 10);
    const birthDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedBirthDate) && requestedBirthDate <= localDayKey() ? requestedBirthDate : "";
    const reps = Number(body.reps);
    const source = body.source === "road-to-100" ? "road-to-100" : body.source === "your-choice" ? "your-choice" : "human-choice";
    if (!/^[a-zA-Z0-9-]{20,64}$/.test(requestedAthleteId) || !/^[a-zA-Z0-9-]{20,64}$/.test(requestId)) return roadCorsJson(request, { error: "Ungültige Athletenkennung." }, { status: 400 });
    if (name.length < 2 || country.length < 2 || !gender) return roadCorsJson(request, { error: "Name, Land und Geschlecht werden benötigt." }, { status: 400 });
    if (!Number.isInteger(reps) || reps < 1 || reps > MAX_SET_REPS) return roadCorsJson(request, { error: "Pro Satz sind höchstens 121 Push-ups erlaubt." }, { status: 400 });
    const performanceTimeZone = validTimeZone(body.timeZone);
    const today = localDayKey(new Date(), performanceTimeZone);
    const ownedProfile = await env.DB.prepare("SELECT id FROM athletes WHERE owner_user_id = ? ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at ASC LIMIT 1").bind(user.id, FEATURED_ATHLETE_ID).first<{ id: string }>();
    const athleteId = ownedProfile?.id || requestedAthleteId;
    const existing = await env.DB.prepare("SELECT owner_user_id AS ownerUserId, athlete_number AS athleteNumber FROM athletes WHERE id = ?").bind(athleteId).first<{ ownerUserId: string; athleteNumber:number|null }>();
    if (existing?.ownerUserId && existing.ownerUserId !== user.id) return roadCorsJson(request, { error: "Dieses Profil gehört zu einem anderen Konto." }, { status: 403 });
    let athleteNumber = existing?.athleteNumber ?? null;
    if (!athleteNumber) {
      const allocation = await env.DB.prepare("UPDATE athlete_number_sequence SET next_number = next_number + 1 WHERE id = 1 RETURNING next_number - 1 AS athleteNumber").first<{ athleteNumber:number }>();
      athleteNumber = Number(allocation?.athleteNumber || 0);
      if (!athleteNumber) throw new Error("Athletennummer konnte nicht vergeben werden.");
    }
    await env.DB.prepare(`INSERT INTO athletes (id, athlete_number, name, last_name, country, gender, birth_date, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, last_name = excluded.last_name, country = excluded.country, gender = excluded.gender, birth_date = excluded.birth_date, owner_user_id = excluded.owner_user_id`).bind(athleteId, athleteNumber, name, lastName, country, gender, birthDate, user.id).run();
    let wasInserted = false;
    if (COOLDOWN_EXEMPT_ATHLETE_IDS.has(athleteId)) {
      const insertion = await env.DB.prepare(
        "INSERT OR IGNORE INTO entries (athlete_id, request_id, reps, entry_date, source) VALUES (?, ?, ?, ?, ?)",
      ).bind(athleteId, requestId, reps, today, source).run();
      wasInserted = Number(insertion.meta.changes || 0) > 0;
    } else {
      const insertion = await env.DB.prepare(
        `INSERT OR IGNORE INTO entries (athlete_id, request_id, reps, entry_date, source)
         SELECT ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM entries
           WHERE athlete_id = ?
             AND datetime(created_at, '+' || CASE
               WHEN reps <= 20 THEN 20
               WHEN reps <= 40 THEN 40
               WHEN reps <= 60 THEN 60
               WHEN reps <= 80 THEN 90
               ELSE 120 END || ' seconds') > CURRENT_TIMESTAMP
         )`,
      ).bind(athleteId, requestId, reps, today, source, athleteId).run();
      wasInserted = Number(insertion.meta.changes || 0) > 0;
    }
    const entry = await env.DB.prepare("SELECT id, reps, created_at AS createdAt FROM entries WHERE request_id = ? AND athlete_id = ?").bind(requestId, athleteId).first<{ id: number; reps: number; createdAt: string }>();
    if (!entry) {
      const latest = await env.DB.prepare("SELECT reps, created_at AS createdAt FROM entries WHERE athlete_id = ? ORDER BY created_at DESC, id DESC LIMIT 1").bind(athleteId).first<{ reps: number; createdAt: string }>();
      const nextAllowedAt = latest ? new Date(Date.parse(utcTimestamp(latest.createdAt)) + cooldownSeconds(latest.reps) * 1000) : new Date();
      const retryAfterSeconds = Math.max(1, Math.ceil((nextAllowedAt.getTime() - Date.now()) / 1000));
      return roadCorsJson(request, { error: `Bitte noch ${retryAfterSeconds} Sekunden bis zum nächsten Satz warten.`, retryAfterSeconds, nextAllowedAt: nextAllowedAt.toISOString() }, { status: 429, headers: { "cache-control": "no-store", "retry-after": String(retryAfterSeconds) } });
    }
    const cooldown = COOLDOWN_EXEMPT_ATHLETE_IDS.has(athleteId) ? 0 : cooldownSeconds(entry.reps);
    const createdAt = utcTimestamp(entry.createdAt);
    const nextAllowedAt = new Date(Date.parse(createdAt) + cooldown * 1000).toISOString();
    let challenge: { days:number; target:number; start:string; total:number; today:number; todayDate:string } | null = null;
    if (wasInserted) {
      const todayLabel = today;
      await env.DB.prepare(
        `UPDATE challenges SET
           total = total + ?,
           today = CASE WHEN today_date = ? THEN today + ? ELSE ? END,
           today_date = ?,
           updated_at = CURRENT_TIMESTAMP
         WHERE owner_user_id = ?`,
      ).bind(reps, todayLabel, reps, reps, todayLabel, user.id).run();
      challenge = await env.DB.prepare(
        `SELECT days, target, start, total, today, today_date AS todayDate
         FROM challenges WHERE owner_user_id = ? LIMIT 1`,
      ).bind(user.id).first<typeof challenge>();
    }
    return roadCorsJson(request, { ok: true, athleteId, entryId: entry.id, createdAt, cooldownSeconds: cooldown, nextAllowedAt, challengeUpdated:Boolean(challenge), challenge }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("leaderboard POST failed", error);
    return roadCorsJson(request, { error: "Eintrag konnte nicht gespeichert werden. Bitte erneut versuchen." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const entryId = Number(body.entryId), reps = Number(body.reps);
    if (!Number.isInteger(entryId) || !Number.isInteger(reps) || reps < 1 || reps > MAX_SET_REPS) return roadCorsJson(request, { error:"Ungültige Korrektur." }, { status:400 });
    const entry = await env.DB.prepare(`SELECT e.id,e.reps,e.entry_date AS entryDate FROM entries e JOIN athletes a ON a.id=e.athlete_id WHERE e.id=? AND a.owner_user_id=?`).bind(entryId,user.id).first<{id:number;reps:number;entryDate:string}>();
    if(!entry)return roadCorsJson(request,{error:"Satz nicht gefunden."},{status:404});
    const delta=reps-entry.reps;
    await env.DB.batch([
      env.DB.prepare("UPDATE entries SET reps=?, edited_at=CURRENT_TIMESTAMP WHERE id=?").bind(reps,entryId),
      env.DB.prepare(`UPDATE challenges SET total=MAX(0,total+?),today=CASE WHEN today_date=? THEN MAX(0,today+?) ELSE today END,updated_at=CURRENT_TIMESTAMP WHERE owner_user_id=?`).bind(delta,localDayKey(),delta,user.id),
    ]);
    return roadCorsJson(request,{ok:true,entryId,reps,createdAt:new Date().toISOString(),corrected:true});
  } catch(error){console.error("leaderboard PATCH failed",error);return roadCorsJson(request,{error:"Korrektur konnte nicht gespeichert werden."},{status:500})}
}

export async function OPTIONS(request: Request) {
  return roadCorsOptions(request);
}
