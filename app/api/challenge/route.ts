import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { roadCorsJson, roadCorsOptions } from "../../cors";
import { localDayKey, validTimeZone } from "../../local-date";

type ChallengeInput = {
  days?: unknown;
  target?: unknown;
  start?: unknown;
  total?: unknown;
  today?: unknown;
  todayDate?: unknown;
  timeZone?: unknown;
};

function integerInRange(value: unknown, min: number, max: number) {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  let challenge = await env.DB.prepare(
    `SELECT days, target, start, total, today, today_date AS todayDate, time_zone AS timeZone
     FROM challenges WHERE owner_user_id = ? LIMIT 1`,
  ).bind(user.id).first<{ days:number; target:number; start:string; total:number; today:number; todayDate:string; timeZone:string }>();
  const todayKey = localDayKey(new Date(), validTimeZone(challenge?.timeZone));
  if (challenge) {
    const startKey = localDayKey(new Date(challenge.start), validTimeZone(challenge.timeZone));
    const elapsed = Math.floor((Date.parse(`${todayKey}T12:00:00Z`) - Date.parse(`${startKey}T12:00:00Z`)) / 86400000) + 1;
    if (elapsed > challenge.days) {
      const athlete = await env.DB.prepare("SELECT id FROM athletes WHERE owner_user_id = ?").bind(user.id).first<{id:string}>();
      if (athlete) {
        const activityId = `${user.id}:${challenge.start}`;
        const performance = challenge.total / challenge.target * 100;
        const completionKey = new Date(Date.parse(`${startKey}T12:00:00Z`) + (challenge.days - 1) * 86400000).toISOString().slice(0,10);
        const performanceRows = await env.DB.prepare("SELECT entry_date AS day, MAX(reps) AS best FROM entries WHERE athlete_id = ? AND entry_date >= ? AND entry_date <= ? GROUP BY entry_date ORDER BY entry_date").bind(athlete.id,startKey,completionKey).all<{day:string;best:number}>();
        let streak = 0, longestStreak = 0, previousDay = "";
        for (const row of performanceRows.results) {
          const adjacent = previousDay && Date.parse(`${row.day}T12:00:00Z`) - Date.parse(`${previousDay}T12:00:00Z`) === 86400000;
          streak = adjacent ? streak + 1 : 1;
          longestStreak = Math.max(longestStreak, streak);
          previousDay = row.day;
        }
        const personalBest = Math.max(0,...performanceRows.results.map((row) => Number(row.best)));
        const snapshot = JSON.stringify({athlete_id:athlete.id,activity_id:activityId,activity_type:"PERSONAL_CHALLENGE",challenge_type:"PUSH",name:"Your Push Challenge",start:challenge.start,end:completionKey,goal:challenge.target,result:challenge.total,challenge_days:challenge.days,performance_percent:performance,daily_average:challenge.total/challenge.days,personal_bests:{single_set:personalBest},streak:longestStreak,status:"COMPLETED",verification_status:"UNVERIFIED",visibility:"PRIVATE",time_zone:challenge.timeZone});
        await env.DB.batch([
          env.DB.prepare("INSERT OR IGNORE INTO athlete_history (activity_id, athlete_id, activity_type, challenge_type, snapshot_json, status, verification_status, visibility) VALUES (?, ?, 'PERSONAL_CHALLENGE', 'PUSH', ?, 'COMPLETED', 'UNVERIFIED', 'PRIVATE')").bind(activityId, athlete.id, snapshot),
          env.DB.prepare("DELETE FROM challenges WHERE owner_user_id = ? AND start = ?").bind(user.id, challenge.start),
        ]);
        challenge = null;
      }
    }
  }
  if (challenge && challenge.todayDate !== todayKey) {
    await env.DB.prepare("UPDATE challenges SET today = 0, today_date = ?, updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ?").bind(todayKey, user.id).run();
    challenge = { ...challenge, today:0, todayDate:todayKey };
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
  const timeZone = validTimeZone(body.timeZone);
  const todayKey = localDayKey(new Date(), timeZone);
  const submittedForToday = body.todayDate === todayKey;
  await env.DB.prepare(
    `INSERT INTO challenges (owner_user_id, days, target, start, total, today, today_date, time_zone, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(owner_user_id) DO UPDATE SET
       days = excluded.days,
       target = excluded.target,
       start = excluded.start,
       total = excluded.total,
       today = excluded.today,
       today_date = excluded.today_date,
       time_zone = excluded.time_zone,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(user.id, body.days, body.target, body.start, body.total, submittedForToday ? body.today : 0, todayKey, timeZone).run();
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
