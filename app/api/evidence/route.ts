import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";

const validId = (value: unknown) => typeof value === "string" && /^[a-zA-Z0-9-]{20,64}$/.test(value);
const allowedTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401 });
    const form = await request.formData();
    const athleteId = form.get("athleteId");
    const entryId = Number(form.get("entryId"));
    const video = form.get("video");
    if (!validId(athleteId) || !Number.isInteger(entryId) || !(video instanceof File)) return Response.json({ error: "Ungültiger Video-Nachweis." }, { status: 400 });
    if (!allowedTypes.has(video.type)) return Response.json({ error: "Erlaubt sind MP4-, WebM- und MOV-Videos." }, { status: 400 });
    if (video.size > 30 * 1024 * 1024) return Response.json({ error: "Das Video darf maximal 30 MB groß sein." }, { status: 400 });
    const owner = await env.DB.prepare("SELECT e.id, e.evidence_key AS evidenceKey FROM entries e JOIN athletes a ON a.id = e.athlete_id WHERE e.id = ? AND e.athlete_id = ? AND a.owner_user_id = ?").bind(entryId, athleteId, user.id).first<{ id: number; evidenceKey: string | null }>();
    if (!owner) return Response.json({ error: "Trainingseintrag nicht gefunden." }, { status: 404 });
    const extension = video.type === "video/webm" ? "webm" : video.type === "video/quicktime" ? "mov" : "mp4";
    const key = `${athleteId}/${entryId}-${crypto.randomUUID()}.${extension}`;
    await env.BUCKET.put(key, video.stream(), { httpMetadata: { contentType: video.type } });
    await env.DB.prepare("UPDATE entries SET evidence_key = ?, evidence_type = ? WHERE id = ? AND athlete_id = ?").bind(key, video.type, entryId, athleteId).run();
    if (owner.evidenceKey) await env.BUCKET.delete(owner.evidenceKey);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("evidence POST failed", error);
    return Response.json({ error: "Video konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const entryId = Number(new URL(request.url).searchParams.get("entryId"));
    if (!Number.isInteger(entryId)) return new Response("Ungültiger Eintrag.", { status: 400 });
    const row = await env.DB.prepare("SELECT evidence_key AS evidenceKey, evidence_type AS evidenceType FROM entries WHERE id = ?").bind(entryId).first<{ evidenceKey: string | null; evidenceType: string | null }>();
    if (!row?.evidenceKey) return new Response("Kein Video vorhanden.", { status: 404 });
    const object = await env.BUCKET.get(row.evidenceKey);
    if (!object) return new Response("Video nicht gefunden.", { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": row.evidenceType || object.httpMetadata?.contentType || "video/mp4",
        "cache-control": "public, max-age=3600",
        "content-disposition": "inline",
      },
    });
  } catch (error) {
    console.error("evidence GET failed", error);
    return new Response("Video nicht verfügbar.", { status: 500 });
  }
}
