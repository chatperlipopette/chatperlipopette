import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { getConfig } from "@/lib/partner-access";
import { hashPartnerPassword } from "@/lib/partner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function configOrResponse() {
  const config = getConfig();
  return config || null;
}
export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const config = configOrResponse();
  if (!config) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/partners?select=id,name,username,promo_code,discount_type,discount_percent,active,expires_at,max_uses,usage_count,created_at&order=created_at.desc`, { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Impossible de charger les partenaires." }, { status: 502 });
  return NextResponse.json({ partners: await response.json() });
}
export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const config = configOrResponse();
  if (!config) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const promoCode = typeof body.promo_code === "string" ? body.promo_code.trim().toUpperCase() : "";
  const discountType = body.discount_type === "free" ? "free" : body.discount_type === "percent" ? "percent" : "";
  const discountPercent = Number(body.discount_percent);
  const maxUses = body.max_uses === "" || body.max_uses === null || body.max_uses === undefined ? null : Number(body.max_uses);
  const expiresAt = typeof body.expires_at === "string" && body.expires_at ? body.expires_at : null;
  if (!name || name.length > 120 || (!username && !promoCode) || username.length > 120 || (username && password.length < 8) || password.length > 200 || (!discountType) || (discountType === "percent" && (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100)) || (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) || (promoCode && !/^[A-Z0-9_-]{4,40}$/.test(promoCode))) {
    return NextResponse.json({ error: "Vérifie le nom, le compte (mot de passe de 8 caractères minimum), le code et l'avantage." }, { status: 400 });
  }
  const row = { name, username: username || null, password_hash: username ? hashPartnerPassword(password) : null, promo_code: promoCode || null, discount_type: discountType, discount_percent: discountType === "percent" ? discountPercent : 0, active: true, max_uses: maxUses, expires_at: expiresAt };
  const response = await fetch(`${config.url}/rest/v1/partners`, { method: "POST", headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(row), cache: "no-store" });
  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: detail.includes("23505") ? "Cet identifiant ou ce code existe déjà." : "Impossible de créer le partenaire. Vérifie la migration Supabase." }, { status: 502 });
  }
  const rows = await response.json();
  return NextResponse.json({ partner: rows[0] }, { status: 201 });
}
export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const config = configOrResponse();
  if (!config) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  let body: { id?: unknown; active?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  if (typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
  const response = await fetch(`${config.url}/rest/v1/partners?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ active: body.active }), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Impossible de modifier ce partenaire." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const config = configOrResponse();
  if (!config) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 503 });
  let body: { id?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  if (typeof body.id !== "string") return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  const response = await fetch(`${config.url}/rest/v1/partners?id=eq.${encodeURIComponent(body.id)}`, { method: "DELETE", headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Impossible de supprimer ce partenaire." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
