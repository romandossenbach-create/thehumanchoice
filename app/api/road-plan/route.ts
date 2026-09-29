import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
import { localDayKey, previousLocalDayKey } from "../../local-date";
import { roadCorsJson, roadCorsOptions } from "../../cors";

type RoadPlanInput = {
  day?: unknown;
  max?: unknown;
  done?: unknown;
  actuals?: unknown;
  adaptive?: unknown;
  date?: unknown;
  actualDay?: unknown;
  celebrated?: unknown;
};

function validDate(value: unknown) {
  return typeof value === "string" && value.length >= 3 && value.length <= 80;
}

function validPlan(body: RoadPlanInput | null) {
  if (!body || !Number.isInteger(body.day) || Number(body.day) < 1 || Number(body.day) > 60) return false;
  if (!Number.isInteger(body.max) || Number(body.max) < 0 || Number(body.max) > 100) return false;
  if (!Array.isArray(body.done) || body.done.some((value) => !Number.isInteger(value) || Number(value) < 0 || Number(value) > 19)) return false;
  if (!body.actuals || typeof body.actuals !== "object" || Array.isArray(body.actuals)) return false;
  if (Object.entries(body.actuals).some(([key, value]) => !/^(?:[0-9]|1[0-9])$/.test(key) || !Number.isInteger(value) || Number(value) < 0 || Number(value) > 5000)) return false;
  if (body.adaptive !== undefined && (!body.adaptive || typeof body.adaptive !== "object" || Array.isArray(body.adaptive) || JSON.stringify(body.adaptive).length > 120000)) return false;
  return validDate(body.date) && validDate(body.actualDay) && typeof body.celebrated === "boolean";
}

export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  let row = await env.DB.prepare(
    `SELECT day, max_reps AS maxReps, done_json AS doneJson, actuals_json AS actualsJson, adaptive_json AS adaptiveJson,
            plan_date AS planDate, actual_day AS actualDay, celebrated
     FROM road_plans WHERE owner_user_id = ? LIMIT 1`,
  ).bind(user.id).first<{day:number;maxReps:number;doneJson:string;actualsJson:string;adaptiveJson:string;planDate:string;actualDay:string;celebrated:number}>();
  if (!row) {
    const athlete = await env.DB.prepare(
      `SELECT id, name, last_name AS lastName FROM athletes WHERE owner_user_id = ? LIMIT 1`,
    ).bind(user.id).first<{id:string;name:string;lastName:string}>();
    if (athlete && athlete.name.trim().toLowerCase() === "thomas" && athlete.lastName.trim().toLowerCase().startsWith("hasen")) {
      const yesterday = previousLocalDayKey();
      const recent = await env.DB.prepare(
        `SELECT reps FROM entries WHERE athlete_id = ? AND entry_date = ? ORDER BY created_at DESC, id DESC LIMIT 10`,
      ).bind(athlete.id, yesterday).all<{reps:number}>();
      if (recent.results.length) {
        const inferredMax = Math.min(100, Math.max(1, Math.round(Math.max(...recent.results.map((entry) => entry.reps)) / 0.6)));
        const today = localDayKey();
        await env.DB.prepare(
          `INSERT INTO road_plans (owner_user_id, day, max_reps, done_json, actuals_json, plan_date, actual_day, celebrated, updated_at)
           VALUES (?, 2, ?, '[]', '{}', ?, ?, 0, CURRENT_TIMESTAMP)`,
        ).bind(user.id, inferredMax, today, today).run();
        row = { day:2, maxReps:inferredMax, doneJson:"[]", actualsJson:"{}", adaptiveJson:"{}", planDate:today, actualDay:today, celebrated:0 };
      }
    }
  }
  if (!row) return roadCorsJson(request, { plan: null });
  try {
    return roadCorsJson(request, { plan: { day:row.day, max:row.maxReps, done:JSON.parse(row.doneJson), actuals:JSON.parse(row.actualsJson), adaptive:JSON.parse(row.adaptiveJson || "{}"), date:row.planDate, actualDay:row.actualDay, celebrated:Boolean(row.celebrated) } });
  } catch {
    return roadCorsJson(request, { plan: null });
  }
}

export async function PUT(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  const body = await request.json<RoadPlanInput>().catch(() => null);
  if (!validPlan(body)) return roadCorsJson(request, { error: "Ungültige Road-to-100-Daten." }, { status: 400 });
  const plan = body as { day:number; max:number; done:number[]; actuals:Record<string,number>; adaptive?:Record<string,unknown>; date:string; actualDay:string; celebrated:boolean };
  await env.DB.prepare(
    `INSERT INTO road_plans (owner_user_id, day, max_reps, done_json, actuals_json, adaptive_json, plan_date, actual_day, celebrated, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(owner_user_id) DO UPDATE SET
       day=excluded.day, max_reps=excluded.max_reps, done_json=excluded.done_json,
       actuals_json=excluded.actuals_json, adaptive_json=excluded.adaptive_json, plan_date=excluded.plan_date,
       actual_day=excluded.actual_day, celebrated=excluded.celebrated, updated_at=CURRENT_TIMESTAMP`,
  ).bind(user.id, plan.day, plan.max, JSON.stringify(plan.done), JSON.stringify(plan.actuals), JSON.stringify(plan.adaptive || {}), plan.date, plan.actualDay, plan.celebrated ? 1 : 0).run();
  return roadCorsJson(request, { ok: true });
}

export async function DELETE(request: Request) {
  const user = await getSupabaseUser(request);
  if (!user) return roadCorsJson(request, { error: "Bitte zuerst anmelden." }, { status: 401 });
  await env.DB.prepare("DELETE FROM road_plans WHERE owner_user_id = ?").bind(user.id).run();
  return roadCorsJson(request, { ok: true });
}

export async function OPTIONS(request: Request) {
  return roadCorsOptions(request);
}
