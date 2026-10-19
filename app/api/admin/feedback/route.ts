import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}
function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const cfg = config();
  if (!cfg) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  const response = await fetch(`${cfg.url}/rest/v1/game_feedback?select=*&order=created_at.desc&limit=500`, { headers: headers(cfg.key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Impossible de lire les messages." }, { status: 502 });
  return NextResponse.json({ items: await response.json() });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = body.status;
  const admin_reply = typeof body.admin_reply === "string" ? body.admin_reply.trim() : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["pending", "approved", "rejected"].includes(String(status)) || admin_reply.length > 1500) return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
  const cfg = config();
  if (!cfg) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  const url = new URL(`${cfg.url}/rest/v1/game_feedback`);
  url.searchParams.set("id", `eq.${id}`);
  const response = await fetch(url, { method: "PATCH", headers: { ...headers(cfg.key), Prefer: "return=minimal" }, body: JSON.stringify({ status, admin_reply: admin_reply || null }), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "La modification n’a pas été enregistrée." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
