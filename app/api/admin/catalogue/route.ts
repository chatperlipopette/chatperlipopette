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

function readableError(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
    return [error.message, cause?.code, cause?.message].filter(Boolean).join(" — ").slice(0, 400);
  }
  return "Erreur inconnue.";
}

export async function GET() {
  try {
    if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    const config = getSupabaseConfig();
    if (!config) return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });

    const response = await fetch(`${config.url}/rest/v1/catalogue_game_flags?select=game_code,nouveaute,coup_de_coeur`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Erreur de lecture Supabase :", response.status, details);
      let parsed: { message?: string; details?: string; hint?: string; code?: string } = {};
      try { parsed = JSON.parse(details); } catch {}
      const diagnostic = [parsed.message, parsed.details, parsed.hint, parsed.code].filter(Boolean).join(" — ");
      return NextResponse.json({ error: diagnostic ? `Supabase (${response.status}) : ${diagnostic.slice(0, 400)}` : `Impossible de lire les réglages du catalogue (HTTP ${response.status}).` }, { status: 502 });
    }
    return NextResponse.json({ flags: await response.json() });
  } catch (error) {
    const diagnostic = readableError(error);
    console.error("Erreur API catalogue :", diagnostic);
    return NextResponse.json({ error: `Erreur de lecture du catalogue : ${diagnostic}` }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
    const config = getSupabaseConfig();
    if (!config) return NextResponse.json({ error: "Configuration de la base de données manquante." }, { status: 503 });

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
    const items = (body as { flags?: unknown })?.flags;
    if (!Array.isArray(items) || items.length > 1000) return NextResponse.json({ error: "Liste de jeux invalide." }, { status: 400 });

    const cleanItems: { game_code: string; nouveaute: boolean; coup_de_coeur: boolean }[] = [];
    for (const item of items) {
      if (!item || typeof item !== "object") return NextResponse.json({ error: "Réglage de jeu invalide." }, { status: 400 });
      const row = item as Record<string, unknown>;
      if (typeof row.game_code !== "string" || !row.game_code.trim() || row.game_code.length > 200 || typeof row.nouveaute !== "boolean" || typeof row.coup_de_coeur !== "boolean") {
        return NextResponse.json({ error: "Un réglage de jeu est invalide." }, { status: 400 });
      }
      cleanItems.push({ game_code: row.game_code.trim(), nouveaute: row.nouveaute, coup_de_coeur: row.coup_de_coeur });
    }
    if (cleanItems.length === 0) return NextResponse.json({ ok: true, count: 0 });
    const uniqueItems = Array.from(new Map(cleanItems.map(item => [item.game_code, item])).values());
    const response = await fetch(`${config.url}/rest/v1/catalogue_game_flags?on_conflict=game_code`, {
      method: "POST",
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(uniqueItems),
      cache: "no-store",
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Erreur de sauvegarde Supabase :", response.status, details);
      let parsed: { message?: string; details?: string; hint?: string; code?: string } = {};
      try { parsed = JSON.parse(details); } catch {}
      const diagnostic = [parsed.message, parsed.details, parsed.hint, parsed.code].filter(Boolean).join(" — ");
      let message = "La sauvegarde a échoué (erreur de base de données).";
      if (details.includes("on_conflict") || details.includes("unique constraint") || details.includes("no unique")) message = "La table catalogue_game_flags doit avoir une contrainte UNIQUE sur game_code.";
      else if (details.includes("column") && details.includes("does not exist")) message = "Les colonnes de catalogue_game_flags ne correspondent pas.";
      else if (response.status === 401 || response.status === 403) message = "Supabase refuse l’écriture. Vérifie la clé de service dans Vercel.";
      else if (diagnostic) message = `Supabase (${response.status}) : ${diagnostic.slice(0, 500)}`;
      return NextResponse.json({ error: message }, { status: 502 });
    }
    // Vérifier les valeurs réellement renvoyées par Supabase : une réponse HTTP
    // réussie ne garantit pas que toutes les lignes attendues ont été écrites.
    const savedRows = await response.json() as Array<{
      game_code: string;
      nouveaute: boolean;
      coup_de_coeur: boolean;
    }>;
    const savedByCode = new Map(savedRows.map((row) => [row.game_code, row]));
    const missing = uniqueItems.filter((item) => {
      const saved = savedByCode.get(item.game_code);
      return !saved || saved.nouveaute !== item.nouveaute || saved.coup_de_coeur !== item.coup_de_coeur;
    });
    if (missing.length > 0) {
      console.error("Vérification après sauvegarde échouée :", {
        expected: uniqueItems.length,
        returned: savedRows.length,
        mismatches: missing.slice(0, 10).map((item) => item.game_code),
      });
      return NextResponse.json({
        error: `Supabase n'a pas confirmé l'enregistrement de ${missing.length} réglage(s). Recharge la page et réessaie.`,
        saved: savedRows.length,
        expected: uniqueItems.length,
      }, { status: 502 });
    }
    return NextResponse.json({ ok: true, count: uniqueItems.length, verified: true });
  } catch (error) {
    const diagnostic = readableError(error);
    console.error("Erreur de sauvegarde du catalogue :", diagnostic);
    return NextResponse.json({ error: `Base de données inaccessible : ${diagnostic}` }, { status: 503 });
  }
}
