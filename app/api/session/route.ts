import { getSupabaseUser } from "../../supabase-server";

export async function GET(request: Request) {
  const user = await getSupabaseUser(request);
  if (user?.isAdmin && user.aal !== "aal2") return Response.json({ error:"Zwei-Faktor-Code erforderlich.", mfaRequired:true }, { status:403 });
  return Response.json({ user: user ? { displayName: user.email, email: user.email, gender:user.gender, isAdmin:user.isAdmin, admin2faVerified:user.isAdmin && user.aal === "aal2" } : null });
}
