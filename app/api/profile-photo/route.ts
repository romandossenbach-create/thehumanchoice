import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";

const validId = (value: unknown) => typeof value === "string" && /^[a-zA-Z0-9-]{20,64}$/.test(value);
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const user = await getSupabaseUser(request);
    if (!user) return Response.json({ error: "Bitte anmelden." }, { status: 401 });
    const form = await request.formData();
    const athleteId = form.get("athleteId");
    const photo = form.get("photo");
    if (!validId(athleteId) || !(photo instanceof File) || form.get("realPhoto") !== "true") return Response.json({ error: "Ungültiges Profilfoto." }, { status: 400 });
    if (!allowedTypes.has(photo.type)) return Response.json({ error: "Erlaubt sind JPG-, PNG- und WebP-Fotos." }, { status: 400 });
    if (photo.size > 5 * 1024 * 1024) return Response.json({ error: "Das Foto darf maximal 5 MB groß sein." }, { status: 400 });
    const athlete = await env.DB.prepare("SELECT profile_photo_key AS profilePhotoKey FROM athletes WHERE id = ? AND owner_user_id = ?").bind(athleteId, user.id).first<{ profilePhotoKey: string | null }>();
    if (!athlete) return Response.json({ error: "Bitte zuerst dein Profil und ein Training speichern." }, { status: 404 });
    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const key = `profiles/${athleteId}-${crypto.randomUUID()}.${extension}`;
    await env.BUCKET.put(key, photo.stream(), { httpMetadata: { contentType: photo.type } });
    await env.DB.prepare("UPDATE athletes SET profile_photo_key = ?, profile_photo_type = ? WHERE id = ? AND owner_user_id = ?").bind(key, photo.type, athleteId, user.id).run();
    if (athlete.profilePhotoKey) await env.BUCKET.delete(athlete.profilePhotoKey);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("profile photo POST failed", error);
    return Response.json({ error: "Profilfoto konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const athleteId = new URL(request.url).searchParams.get("athleteId");
    if (!validId(athleteId)) return new Response("Ungültiges Profil.", { status: 400 });
    const user = await getSupabaseUser(request);
    const row = await env.DB.prepare("SELECT profile_photo_key AS profilePhotoKey, profile_photo_type AS profilePhotoType FROM athletes WHERE id = ? AND (private_mode = 0 OR owner_user_id = ?)").bind(athleteId, user?.id || "").first<{ profilePhotoKey: string | null; profilePhotoType: string | null }>();
    if (!row?.profilePhotoKey) return new Response("Kein Profilfoto vorhanden.", { status: 404 });
    const object = await env.BUCKET.get(row.profilePhotoKey);
    if (!object) return new Response("Profilfoto nicht gefunden.", { status: 404 });
    return new Response(object.body, { headers: { "content-type": row.profilePhotoType || object.httpMetadata?.contentType || "image/jpeg", "cache-control": "private, no-store", "vary": "Authorization", "x-content-type-options": "nosniff" } });
  } catch (error) {
    console.error("profile photo GET failed", error);
    return new Response("Profilfoto nicht verfügbar.", { status: 500 });
  }
}
