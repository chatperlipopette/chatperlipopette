import { NextRequest, NextResponse } from "next/server";

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
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase (${response.status}) : ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gameCode = String(body.code_barre || "").trim();
    const gameName = String(body.jeu || "").trim();
    const start = String(body.date_debut || "");
    const end = String(body.date_retour || "");
    const email = String(body.email || "").trim();
    if (!gameCode || !gameName || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) {
      return NextResponse.json({ error: "Jeu ou dates de réservation invalides." }, { status: 400 });
    }

    const blocks = await db(`catalogue_game_availability?game_code=eq.${encodeURIComponent(gameCode)}&select=blocked_manually,block_reason`);
    if (blocks[0]?.blocked_manually) {
      return NextResponse.json({ error: `Ce jeu est bloqué manuellement.${blocks[0].block_reason ? " Motif : " + blocks[0].block_reason : ""}` }, { status: 409 });
    }

    const reservations = await db(
      `game_reservations?game_code=eq.${encodeURIComponent(gameCode)}&status=in.(pending,confirmed)&date_debut=lte.${end}&date_retour=gte.${start}&select=id,date_debut,date_retour,status`
    );
    if (reservations.length) {
      return NextResponse.json({ error: "Ce jeu est déjà demandé ou réservé sur ces dates. Choisis une autre période." }, { status: 409 });
    }

    const inserted = await db("game_reservations", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([{
        game_code: gameCode,
        game_name: gameName,
        date_debut: start,
        date_retour: end,
        status: "pending",
        customer_email: email || null,
      }]),
    });
    return NextResponse.json({ ok: true, reservationId: inserted[0]?.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de vérifier la disponibilité." }, { status: 502 });
  }
}
