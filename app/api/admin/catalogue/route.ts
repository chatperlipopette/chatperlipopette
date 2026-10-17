import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function isAdmin() {
  const auth = await createSupabaseServerClient();
  const { data: { user }, error } = await auth.auth.getUser();
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (error || !user?.email || !allowedEmail || user.email.toLowerCase() !== allowedEmail) {
    return null;
  }
  return user;
}

export async function GET() {
  const user = await isAdmin();
  if (!user) return NextResponse.json({ error: "Accès réservé à l’administrateur." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await db.from("catalogue_game_flags").select("game_code, nouveaute, coup_de_coeur");
  if (error) return NextResponse.json({ error: "Impossible de lire les réglages du catalogue." }, { status: 500 });
  return NextResponse.json({ flags: data ?? [] });
}

export async function PATCH(request: Request) {
  const user = await isAdmin();
  if (!user) return NextResponse.json({ error: "Accès réservé à l’administrateur." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }
  const items = (body as { flags?: unknown })?.flags;
  if (!Array.isArray(items) || items.length > 1000) {
    return NextResponse.json({ error: "Liste de jeux invalide." }, { status: 400 });
  }

  const cleanItems: { game_code: string; nouveaute: boolean; coup_de_coeur: boolean }[] = [];
  for (const item of items) {
    const row = item as Record<string, unknown>;
    if (typeof row.game_code !== "string" || !row.game_code.trim() || row.game_code.length > 200 ||
        typeof row.nouveaute !== "boolean" || typeof row.coup_de_coeur !== "boolean") {
      return NextResponse.json({ error: "Un réglage de jeu est invalide." }, { status: 400 });
    }
    cleanItems.push({
      game_code: row.game_code.trim(),
      nouveaute: row.nouveaute,
      coup_de_coeur: row.coup_de_coeur,
    });
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await db.from("catalogue_game_flags").upsert(cleanItems, { onConflict: "game_code" });
  if (error) {
    console.error("Sauvegarde catalogue impossible :", error.message);
    return NextResponse.json({ error: "La sauvegarde a échoué." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: cleanItems.length });
}
