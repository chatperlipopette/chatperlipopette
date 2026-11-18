import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdminSession } from "@/lib/admin-auth";
import { getConfig } from "@/lib/partner-access";
import { getGames } from "@/lib/games";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function config() { return getConfig(); }
function hashAnswer(value: string) {
  return createHash("sha256").update(value.trim().toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "")).digest("hex");
}
async function supabase(path: string, init: RequestInit = {}) {
  const cfg = config();
  if (!cfg) throw new Error("Configuration Supabase manquante.");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase (${response.status}) : ${(await response.text()).slice(0, 240)}`);
  return response.status === 204 ? null : response.json();
}

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const [clues, codes, games] = await Promise.all([
      supabase("hunt_clues?select=id,game_code,game_name,clue,active,created_at&order=created_at.desc"),
      supabase("hunt_codes?select=id,clue_id,code,discount_percent,used_at,used_for,created_at&order=created_at.desc"),
      getGames(),
    ]);
    return NextResponse.json({ clues, codes, games: games.map(g => ({ code_barre: g.code_barre, nom: g.nom })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chargement impossible." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const body = await request.json();
    const gameCode = typeof body.game_code === "string" ? body.game_code.trim() : "";
    const gameName = typeof body.game_name === "string" ? body.game_name.trim() : "";
    const clue = typeof body.clue === "string" ? body.clue.trim() : "";
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    if (!gameCode || !gameName || clue.length < 8 || clue.length > 1000 || answer.length < 1 || answer.length > 120) {
      return NextResponse.json({ error: "Choisis un jeu, écris un indice (8 à 1 000 caractères) et une réponse." }, { status: 400 });
    }
    const rows = await supabase("hunt_clues?on_conflict=game_code", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ game_code: gameCode, game_name: gameName, clue, answer_hash: hashAnswer(answer), active: true, updated_at: new Date().toISOString() }),
    });
    return NextResponse.json({ clue: rows?.[0] || null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    await supabase(`hunt_clues?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", body: JSON.stringify({ active: body.active, updated_at: new Date().toISOString() }) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Modification impossible." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.id !== "string") return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    await supabase(`hunt_clues?id=eq.${encodeURIComponent(body.id)}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Suppression impossible." }, { status: 502 });
  }
}
