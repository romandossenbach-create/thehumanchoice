import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../supabase-server";
import { listSupabaseAuthAccounts } from "../../../supabase-admin-server";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Admin-Zugang mit 2FA erforderlich." }, { status: 403, headers: { "cache-control": "private, no-store" } });
  try {
  const [accounts, result, profileCount] = await Promise.all([listSupabaseAuthAccounts(), env.DB.prepare(`
    SELECT a.id, a.athlete_number AS athleteNumber, a.name, a.last_name AS lastName,
      a.gender, a.birth_date AS birthDate, a.created_at AS registeredAt,
      a.owner_user_id AS ownerUserId, a.training_log_public AS permanentlyPublic,
      a.training_log_public_until AS publicUntil, a.training_log_public_scope AS publicScope,
      COUNT(e.id) AS sets, COUNT(DISTINCT e.entry_date) AS activeDays,
      COALESCE(SUM(e.reps), 0) AS totalReps, MAX(e.created_at) AS lastActivity,
      SUM(CASE WHEN e.evidence_key IS NOT NULL THEN 1 ELSE 0 END) AS evidenceEntries
    FROM athletes a LEFT JOIN entries e ON e.athlete_id = a.id
    GROUP BY a.id
    ORDER BY a.athlete_number ASC
  `).all(), env.DB.prepare("SELECT COUNT(*) AS total FROM athletes").first<{ total: number }>()]);
  const linkedIds = new Set(result.results.map(row => String(row.ownerUserId || "")).filter(Boolean));
  const accountById = new Map(accounts.map(account => [account.id, account]));
  const accountIds = new Set(accounts.map(account => account.id));
  const missingProfiles = accounts.filter(account => !linkedIds.has(account.id));
  const unlinkedProfiles = result.results.filter(row => !row.ownerUserId || !accountIds.has(String(row.ownerUserId))).map(row => ({ athleteNumber: row.athleteNumber, name: row.name, lastName: row.lastName, ownerUserId: row.ownerUserId }));
  const athletes = result.results.map((row) => {
    const days = Number(row.activeDays || 0);
    const until = row.publicUntil ? Date.parse(String(row.publicUntil)) : NaN;
    return {
      id: row.id, athleteNumber: row.athleteNumber, name: row.name, lastName: row.lastName,
      email: accountById.get(String(row.ownerUserId || ""))?.email || null,
      gender: row.gender, birthDate: row.birthDate, registeredAt: row.registeredAt,
      daysSinceRegistration: Math.max(0, Math.floor((Date.now() - Date.parse(String(row.registeredAt).replace(" ", "T") + "Z")) / 86400000)),
      activeDays: days, sets: Number(row.sets || 0), sessions: null,
      totalReps: Number(row.totalReps || 0), averagePerActiveDay: days ? Number(row.totalReps || 0) / days : 0,
      lastActivity: row.lastActivity,
      trainingLogPublic: Number(row.permanentlyPublic) === 1 || (Number.isFinite(until) && until > Date.now()),
      publicScope: row.publicScope,
      verificationLevel1: null, verificationLevel2: null,
      evidenceEntries: Number(row.evidenceEntries || 0), futureRootA: null, futureRootB: null,
      hasOwnerAccountLink: Boolean(row.ownerUserId),
    };
  });
  return Response.json({ athletes, counts: { athleteProfiles: Number(profileCount?.total || 0), supabaseAccounts: accounts.length, adminRows: athletes.length },
    missingProfiles: missingProfiles.map(account => ({ id: account.id, email: account.email, registeredAt: account.created_at })), unlinkedProfiles,
    limitations: ["Historische Freigabezeitstempel fehlen; Level 1 kann rückwirkend nicht belegt werden.", "Sessions sind im Datenmodell nicht getrennt von Sätzen erfasst."],
  }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Adminabfrage fehlgeschlagen." }, { status: 502, headers: { "cache-control": "private, no-store" } });
  }
}
