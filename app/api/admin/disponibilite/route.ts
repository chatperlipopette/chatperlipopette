import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

function readableError(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
    return [error.message, cause?.code, cause?.message].filter(Boolean).join(" — ").slice(0, 400);
  }
  return "Erreur inconnue.";
}

async function db(path: string, init: RequestInit = {}) {
  const cfg = config();
  if (!cfg) throw new Error("Configuration Supabase manquante : vérifie les variables Vercel du projet qui sert le site.");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init.headers || {}) },
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
    const diagnostic = readableError(error);
    console.error("Erreur chargement disponibilité :", diagnostic);
    return NextResponse.json({ error: diagnostic }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.game_code !== "string" || !body.game_code.trim() || typeof body.blocked_manually !== "boolean") {
      return NextResponse.json({ error: "Réglage de disponibilité invalide." }, { status: 400 });
    }
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
    const diagnostic = readableError(error);
    console.error("Erreur sauvegarde disponibilité :", diagnostic);
    return NextResponse.json({ error: diagnostic }, { status: 502 });
  }
}
