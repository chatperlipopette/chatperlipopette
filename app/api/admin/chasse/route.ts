import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdminSession } from "@/lib/admin-auth";
import { getConfig } from "@/lib/partner-access";
import { getGames } from "@/lib/games";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashAnswer(value: string) {
  return createHash("sha256").update(value.trim().toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "")).digest("hex");
}
async function supabase(path: string, init: RequestInit = {}) {
  const cfg = getConfig();
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
      supabase("hunt_clues?select=id,game_code,game_name,game_codes,game_names,clue,active,discount_percent,validity_days,created_at&order=created_at.desc"),
      supabase("hunt_codes?select=id,clue_id,code,customer_email,discount_percent,used_at,used_for,created_at,valid_until&order=created_at.desc"),
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
    const gameCodes = Array.isArray(body.game_codes) ? [...new Set(body.game_codes.filter((v: unknown): v is string => typeof v === "string").map((v: string) => v.trim()).filter(Boolean))] : [];
    const clue = typeof body.clue === "string" ? body.clue.trim() : "";
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    const discountPercent = Number(body.discount_percent);
    const validityDays = Number(body.validity_days);
    if (!gameCodes.length || gameCodes.length > 30 || clue.length < 8 || clue.length > 1000 || answer.length < 1 || answer.length > 120 ||
      !Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100 ||
      !Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365) {
      return NextResponse.json({ error: "Sélectionne au moins un jeu, saisis une énigme et un code secret, puis règle une réduction de 1 à 100 % et une validité de 1 à 365 jours." }, { status: 400 });
    }
    const games = await getGames();
    const selected = gameCodes.map((code: string) => games.find(g => g.code_barre === code)).filter((game): game is NonNullable<typeof game> => game !== undefined);
    if (selected.length !== gameCodes.length) return NextResponse.json({ error: "Un ou plusieurs jeux sélectionnés ne sont plus dans le catalogue." }, { status: 400 });
    const gameNames = selected.map(g => g!.nom);
    const rows = await supabase("hunt_clues?select=id", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        game_code: gameCodes[0], game_name: gameNames.join(", "), game_codes: gameCodes, game_names: gameNames,
        clue, answer_hash: hashAnswer(answer), discount_percent: discountPercent, validity_days: validityDays,
        active: true, updated_at: new Date().toISOString(),
      }),
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
    if (typeof body.id !== "string") return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.active === "boolean") patch.active = body.active;
    if (body.discount_percent !== undefined) {
      const value = Number(body.discount_percent);
      if (!Number.isInteger(value) || value < 1 || value > 100) return NextResponse.json({ error: "La réduction doit être comprise entre 1 et 100 %." }, { status: 400 });
      patch.discount_percent = value;
    }
    if (body.validity_days !== undefined) {
      const value = Number(body.validity_days);
      if (!Number.isInteger(value) || value < 1 || value > 365) return NextResponse.json({ error: "La validité doit être comprise entre 1 et 365 jours." }, { status: 400 });
      patch.validity_days = value;
    }
    if (Object.keys(patch).length === 1) return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
    await supabase(`hunt_clues?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", body: JSON.stringify(patch) });
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
