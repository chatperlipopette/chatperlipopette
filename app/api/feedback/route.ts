import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
  const cfg = config();
  if (!cfg) return NextResponse.json({ error: "Le stockage des messages n’est pas encore configuré." }, { status: 503 });
  const game = request.nextUrl.searchParams.get("game")?.trim();
  if (!game || game.length > 200) return NextResponse.json({ error: "Jeu invalide." }, { status: 400 });
  try {
    const url = new URL(`${cfg.url}/rest/v1/game_feedback`);
    url.searchParams.set("select", "id,kind,author,rating,message,admin_reply,created_at");
    url.searchParams.set("game_code", `eq.${game}`);
    url.searchParams.set("status", "eq.approved");
    url.searchParams.set("order", "created_at.desc");
    const response = await fetch(url, { headers: headers(cfg.key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Impossible de charger les messages." }, { status: 502 });
    return NextResponse.json({ items: await response.json() });
  } catch {
    return NextResponse.json({ error: "Base de données momentanément inaccessible." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  const game_code = typeof body.game_code === "string" ? body.game_code.trim() : "";
  const game_name = typeof body.game_name === "string" ? body.game_name.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const kind = body.kind;
  const rating = body.rating;
  if (!game_code || game_code.length > 200 || !game_name || game_name.length > 200) return NextResponse.json({ error: "Jeu invalide." }, { status: 400 });
  if (!author || author.length > 60 || message.length < 3 || message.length > 1500) return NextResponse.json({ error: "Indique un pseudonyme et un message de 3 à 1 500 caractères." }, { status: 400 });
  if (kind !== "review" && kind !== "question") return NextResponse.json({ error: "Type de message invalide." }, { status: 400 });
  if (kind === "review" && (!Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5)) return NextResponse.json({ error: "Choisis une note entre 1 et 5 étoiles." }, { status: 400 });
  const cfg = config();
  if (!cfg) return NextResponse.json({ error: "Le stockage des messages n’est pas encore configuré." }, { status: 503 });
  try {
    const response = await fetch(`${cfg.url}/rest/v1/game_feedback`, {
      method: "POST",
      headers: { ...headers(cfg.key), Prefer: "return=minimal" },
      body: JSON.stringify({ game_code, game_name, kind, author, rating: kind === "review" ? rating : null, message, status: "pending" }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Erreur Supabase feedback:", response.status, (await response.text()).slice(0, 300));
      return NextResponse.json({ error: "L’envoi a échoué. Réessaie plus tard." }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Base de données momentanément inaccessible." }, { status: 503 });
  }
}
