import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    console.error("Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }

  return { url: url.replace(/\/$/, ""), key };
}

export async function GET() {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });
    }

    const response = await fetch(
      `${config.url}/rest/v1/catalogue_game_flags?select=game_code,nouveaute,coup_de_coeur`,
      {
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erreur de lecture Supabase :", response.status, await response.text());
      return NextResponse.json({ error: "Impossible de lire les réglages du catalogue." }, { status: 502 });
    }

    return NextResponse.json({ flags: await response.json() });
  } catch (error) {
    console.error("Erreur API catalogue :", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminSession())) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const items = (body as { flags?: unknown })?.flags;
    if (!Array.isArray(items) || items.length > 1000) {
      return NextResponse.json({ error: "Liste de jeux invalide." }, { status: 400 });
    }

    const cleanItems: { game_code: string; nouveaute: boolean; coup_de_coeur: boolean }[] = [];
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json({ error: "Réglage de jeu invalide." }, { status: 400 });
      }

      const row = item as Record<string, unknown>;
      if (
        typeof row.game_code !== "string" ||
        !row.game_code.trim() ||
        row.game_code.length > 200 ||
        typeof row.nouveaute !== "boolean" ||
        typeof row.coup_de_coeur !== "boolean"
      ) {
        return NextResponse.json({ error: "Un réglage de jeu est invalide." }, { status: 400 });
      }

      cleanItems.push({
        game_code: row.game_code.trim(),
        nouveaute: row.nouveaute,
        coup_de_coeur: row.coup_de_coeur,
      });
    }

    if (cleanItems.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const response = await fetch(
      `${config.url}/rest/v1/catalogue_game_flags?on_conflict=game_code`,
      {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(cleanItems),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Erreur de sauvegarde Supabase :", response.status, await response.text());
      return NextResponse.json({ error: "La sauvegarde a échoué." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, count: cleanItems.length });
  } catch (error) {
    console.error("Erreur de sauvegarde du catalogue :", error);
    return NextResponse.json({ error: "Base de données inaccessible." }, { status: 503 });
  }
}
