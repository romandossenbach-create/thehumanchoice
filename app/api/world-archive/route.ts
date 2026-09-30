import { env } from "cloudflare:workers";
import { getSupabaseUser } from "../../supabase-server";
// Preserve the historical archive; only its visibility changes.
const archive = {"lon": 7.8929, "lat": 46.5588, "html": "<section id=\"details\" class=\"details\" aria-live=\"polite\"><div class=\"detail-head\"><span class=\"red-dot\"></span><span>ERSTER ARCHIVEINTRAG</span><span class=\"id\">PYW-000005</span></div><h2>30 Push-ups · Roman Dossenbach</h2><dl><div><dt>Ort</dt><dd>Mürren Flower Trail, Schweiz · Blick auf die Jungfrau</dd></div><div><dt>Aufnahmebeginn</dt><dd>27.09.2026 · 13:23:59 Uhr (Schweizer Zeit)</dd></div><div><dt>Athlet</dt><dd>Roman Dossenbach · ID 0001</dd></div></dl><p class=\"accuracy\">Die Stecknadel zeigt Mürren ungefähr. Exakte GPS-Koordinaten und die Höhe der Aufnahme sind im Archiv nicht hinterlegt; der Punkt ist deshalb keine sekundengenaue Positionsangabe. Das Originalvideo ist hier noch nicht abrufbar.</p></section>"};
export async function GET(request:Request) {
  const user = await getSupabaseUser(request);
  const visible = await env.DB!.prepare("SELECT id FROM athletes WHERE id = ? AND (private_mode = 0 OR owner_user_id = ?)").bind("0431b2b7-b3d3-4666-b5ad-f0d53709b686", user?.id || "").first();
  return Response.json({points:visible ? [archive] : []}, {headers:{"cache-control":"private, no-store", "vary":"Authorization"}});
}

