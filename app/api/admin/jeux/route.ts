import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getGames, Game } from "@/lib/games";

export const dynamic = "force-dynamic";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

async function db(path: string, init: RequestInit = {}) {
  const cfg = config();
  if (!cfg) throw new Error("Configuration Supabase manquante.");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase (${response.status}) : ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : [];
}

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    return NextResponse.json({ games: await getGames() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de charger les jeux." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });

  try {
    const body = await request.json() as { game?: Partial<Game>; original_code?: string; is_deleted?: boolean };
    const game = body.game;
    if (!game || typeof game.nom !== "string" || !game.nom.trim()) {
      return NextResponse.json({ error: "Le nom du jeu est obligatoire." }, { status: 400 });
    }
    const cleanGame: Game = {
      code_barre: String(game.code_barre || "").trim(),
      nom: game.nom.trim().slice(0, 200),
      editeur: String(game.editeur || "").trim().slice(0, 200),
      nombre_min: numeric(game.nombre_min),
      nombre_max: numeric(game.nombre_max),
      duree: String(game.duree || "").trim().slice(0, 100),
      age: numeric(game.age),
      disponibilite: String(game.disponibilite || "dispo").trim().slice(0, 50),
      prix_location: numeric(game.prix_location),
      prix_caution: numeric(game.prix_caution),
      description: String(game.description || "").trim().slice(0, 5000) || null,
      categories: String(game.categories || "autres").trim().slice(0, 300),
      annee: numeric(game.annee),
      image_url: String(game.image_url || "").trim().slice(0, 1000) || undefined,
      nouveaute: Boolean(game.nouveaute),
      coup_de_coeur: Boolean(game.coup_de_coeur),
    };
    if (cleanGame.nombre_min !== null && cleanGame.nombre_max !== null && cleanGame.nombre_max < cleanGame.nombre_min) {
      return NextResponse.json({ error: "Le nombre maximum de joueurs doit être supérieur ou égal au minimum." }, { status: 400 });
    }

    const originalCode = String(body.original_code || "").trim();
    const key = originalCode || cleanGame.code_barre || `admin:${crypto.randomUUID()}`;
    if (!cleanGame.code_barre) cleanGame.code_barre = key;

    await db("catalogue_game_edits?on_conflict=game_code", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{
        game_code: key,
        game_data: cleanGame,
        is_deleted: Boolean(body.is_deleted),
        updated_at: new Date().toISOString(),
      }]),
    });
    return NextResponse.json({ ok: true, game: cleanGame });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 502 });
  }
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
}
