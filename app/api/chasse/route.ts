import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getConfig } from "@/lib/partner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashAnswer(value: string) {
  return createHash("sha256").update(value.trim().toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "")).digest("hex");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function db(path: string, init: RequestInit = {}) {
  const cfg = getConfig();
  if (!cfg) throw new Error("Configuration Supabase manquante.");
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Impossible de communiquer avec Supabase.");
  return response.status === 204 ? null : response.json();
}

export async function GET() {
  try {
    const clues = await db("hunt_clues?select=id,game_code,game_name,clue&active=eq.true&order=created_at.desc");
    return NextResponse.json({ clues });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chasse indisponible." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const answer = typeof body.answer === "string" ? body.answer : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!id || answer.length < 1 || answer.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Indique une adresse e-mail valide et ta réponse." }, { status: 400 });
    const rows = await db(`hunt_clues?select=id,answer_hash,active&id=eq.${encodeURIComponent(id)}&active=eq.true`);
    const clue = rows?.[0];
    if (!clue || !safeEqual(hashAnswer(answer), clue.answer_hash)) return NextResponse.json({ error: "Ce n'est pas la bonne réponse. Réessaie !" }, { status: 400 });

    const existing = await db(`hunt_codes?select=code,used_at,created_at&clue_id=eq.${encodeURIComponent(id)}&customer_email=eq.${encodeURIComponent(email)}`);
    if (existing?.length) {
      const previous = existing[0];
      if (!previous.used_at && new Date(previous.created_at).getTime() >= Date.now() - 90 * 86400000) {
        return NextResponse.json({ success: true, code: previous.code, discount_percent: 10, message: "Tu as déjà obtenu ton code pour cette énigme." });
      }
      return NextResponse.json({ error: "Cette adresse e-mail a déjà obtenu et utilisé son code pour cette énigme." }, { status: 409 });
    }
    const code = `CHAT${randomBytes(4).toString("hex").toUpperCase()}`;
    await db("hunt_codes", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ clue_id: id, code, customer_email: email, discount_percent: 10 }),
    });
    return NextResponse.json({ success: true, code, discount_percent: 10, message: "Bravo ! Voici ton code personnel de réduction de 10 %." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vérification impossible." }, { status: 503 });
  }
}
