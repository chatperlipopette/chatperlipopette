import { NextRequest, NextResponse } from "next/server";
import { createPartnerCookie, getConfig, PARTNER_COOKIE, verifyPartnerPassword } from "@/lib/partner-access";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const config = getConfig();
  if (!config) return NextResponse.json({ error: "Base de données indisponible." }, { status: 503 });
  let body: { username?: unknown; password?: unknown; code?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if ((!code && (!username || !password)) || username.length > 120 || password.length > 200 || code.length > 80) {
    return NextResponse.json({ error: "Saisis ton identifiant et ton mot de passe, ou ton code partenaire." }, { status: 400 });
  }
  const field = code ? "promo_code" : "username";
  const value = code || username;
  const response = await fetch(`${config.url}/rest/v1/partners?${field}=eq.${encodeURIComponent(value)}&select=id,password_hash,name,active,expires_at,max_uses,usage_count`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Impossible de vérifier les identifiants." }, { status: 503 });
  const rows = await response.json();
  const partner = Array.isArray(rows) ? rows[0] : null;
  const valid = partner && partner.active &&
    (!partner.expires_at || new Date(partner.expires_at).getTime() >= Date.now()) &&
    (partner.max_uses === null || Number(partner.usage_count) < Number(partner.max_uses)) &&
    (code ? true : typeof partner.password_hash === "string" && verifyPartnerPassword(password, partner.password_hash));
  if (!valid) return NextResponse.json({ error: "Code ou identifiants invalides, expirés ou désactivés." }, { status: 401 });
  let cookie;
  try { cookie = createPartnerCookie(partner.id); } catch { return NextResponse.json({ error: "La session partenaire n'est pas configurée." }, { status: 503 }); }
  const result = NextResponse.json({ ok: true, name: partner.name || "Partenaire", message: "Avantage partenaire activé." });
  result.cookies.set(PARTNER_COOKIE, cookie.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: cookie.maxAge });
  return result;
}
