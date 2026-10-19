import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

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
    const [blocks, reservations] = await Promise.all([
      db("catalogue_game_availability?select=game_code,blocked_manually,block_reason"),
      db("game_reservations?select=game_code,date_debut,date_retour,status&status=in.(pending,confirmed)&date_retour=gte." + new Date().toISOString().slice(0, 10)),
    ]);
    return NextResponse.json({ blocks, reservations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chargement indisponible." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.game_code !== "string" || !body.game_code.trim() || typeof body.blocked_manually !== "boolean") {
      return NextResponse.json({ error: "Réglage de disponibilité invalide." }, { status: 400 });
    }
    // catalogue_game_availability currently contains only these three columns.
    // Do not send updated_at unless that column exists in the deployed schema.
    const rows = await db("catalogue_game_availability?on_conflict=game_code", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify([{
        game_code: body.game_code.trim(),
        blocked_manually: body.blocked_manually,
        block_reason: typeof body.block_reason === "string" ? body.block_reason.trim().slice(0, 250) : null,
      }]),
    });
    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sauvegarde impossible." }, { status: 502 });
  }
}
