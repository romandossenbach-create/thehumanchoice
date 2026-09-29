import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { roadCorsJson, roadCorsOptions } from "../../cors";
import { localDayKey } from "../../local-date";

const ROMAN_USER_ID = "77e8d9e3-e947-4185-955f-28502e4a8deb";
const ROMAN_CHALLENGE_START = "2026-08-06T00:00:00.000Z";
const ROMAN_CHALLENGE_BASE_TOTAL = 48_831;

type ChallengeInput = {
  days?: unknown;
  target?: unknown;
  start?: unknown;
  total?: unknown;
  today?: unknown;
  todayDate?: unknown;
};

function integerInRange(value: unknown, min: number, max: number) {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  let challenge = await env.DB.prepare(
    `SELECT days, target, start, total, today, today_date AS todayDate
     FROM challenges WHERE owner_user_id = ? LIMIT 1`,
  ).bind(user.id).first<{ days:number; target:number; start:string; total:number; today:number; todayDate:string }>();
  const todayKey = localDayKey();
  if (challenge && challenge.todayDate !== todayKey) {
    await env.DB.prepare("UPDATE challenges SET today = 0, today_date = ?, updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ?").bind(todayKey, user.id).run();
    challenge = { ...challenge, today:0, todayDate:todayKey };
  }
  if (user.id === ROMAN_USER_ID && challenge && (
    challenge.days !== 100
    || challenge.target !== 100_000
    || challenge.start !== ROMAN_CHALLENGE_START
    || challenge.total < ROMAN_CHALLENGE_BASE_TOTAL
  )) {
    const total = Math.max(ROMAN_CHALLENGE_BASE_TOTAL, Number(challenge?.total || 0));
    await env.DB.prepare(
      `INSERT INTO challenges (owner_user_id, days, target, start, total, today, today_date, updated_at)
       VALUES (?, 100, 100000, ?, ?, 0, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(owner_user_id) DO UPDATE SET
         days = 100,
         target = 100000,
         start = excluded.start,
         total = excluded.total,
         today = 0,
         today_date = excluded.today_date,
         updated_at = CURRENT_TIMESTAMP`,
    ).bind(user.id, ROMAN_CHALLENGE_START, total, localDayKey()).run();
    challenge = { days:100, target:100_000, start:ROMAN_CHALLENGE_START, total, today:0, todayDate:localDayKey() };
  }
  return roadCorsJson(request, { challenge: challenge || null });
}

export async function PUT(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  const body = await request.json<ChallengeInput>().catch(() => null);
  if (!body
    || !integerInRange(body.days, 1, 3650)
    || !integerInRange(body.target, 1, 100_000_000)
    || !integerInRange(body.total, 0, 100_000_000)
    || !integerInRange(body.today, 0, 1_000_000)
    || typeof body.start !== "string"
    || !Number.isFinite(Date.parse(body.start))
    || typeof body.todayDate !== "string"
    || body.todayDate.length < 3
    || body.todayDate.length > 80) {
    return roadCorsJson(request, { error: "Ungültige Challenge-Daten." }, { status: 400 });
  }
  const existing = await env.DB.prepare("SELECT days, target, start FROM challenges WHERE owner_user_id = ? LIMIT 1").bind(user.id).first<{days:number;target:number;start:string}>();
  if (existing && (existing.days !== body.days || existing.target !== body.target || existing.start !== body.start)) {
    return roadCorsJson(request, { error:"Eine gestartete Challenge kann nicht verändert werden. Lösche sie zuerst vollständig." }, { status:409 });
  }
  const todayKey = localDayKey();
  const submittedForToday = body.todayDate === todayKey;
  await env.DB.prepare(
    `INSERT INTO challenges (owner_user_id, days, target, start, total, today, today_date, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(owner_user_id) DO UPDATE SET
       days = excluded.days,
       target = excluded.target,
       start = excluded.start,
       total = excluded.total,
       today = excluded.today,
       today_date = excluded.today_date,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(user.id, body.days, body.target, body.start, body.total, submittedForToday ? body.today : 0, todayKey).run();
  return roadCorsJson(request, { ok: true });
}

export async function DELETE(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error:"Bitte zuerst anmelden." }, { status:401 });
  await env.DB.prepare("DELETE FROM challenges WHERE owner_user_id = ?").bind(user.id).run();
  return roadCorsJson(request, { ok:true });
}

export async function OPTIONS(request: Request) {
  return roadCorsOptions(request);
}
