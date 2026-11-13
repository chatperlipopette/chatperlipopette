import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
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
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase (${response.status}) : ${body.slice(0, 350)}`);
  return body ? JSON.parse(body) : [];
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function GET() {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const announcements = await db("site_announcements?select=*&order=created_at.desc");
    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture impossible." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
    if (!title || !message) return NextResponse.json({ error: "Le titre et le message sont obligatoires." }, { status: 400 });
    const startsAt = body.starts_at ? new Date(body.starts_at) : null;
    const endsAt = body.ends_at ? new Date(body.ends_at) : null;
    if ((startsAt && !Number.isFinite(startsAt.getTime())) || (endsAt && !Number.isFinite(endsAt.getTime()))) {
      return NextResponse.json({ error: "Une date est invalide." }, { status: 400 });
    }
    if (startsAt && endsAt && endsAt <= startsAt) return NextResponse.json({ error: "La fin doit être après le début." }, { status: 400 });
    const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() : "";
    if (imageUrl && !/^https:\/\//i.test(imageUrl)) return NextResponse.json({ error: "L’image doit utiliser une adresse HTTPS." }, { status: 400 });
    const record = {
      title, message,
      badge: typeof body.badge === "string" ? body.badge.trim().slice(0, 30) : "INFO",
      discount: typeof body.discount === "string" ? body.discount.trim().slice(0, 40) : "",
      category: typeof body.category === "string" ? body.category.trim().slice(0, 40) : "tous",
      image_url: imageUrl || null,
      starts_at: startsAt?.toISOString() || null,
      ends_at: endsAt?.toISOString() || null,
      active: body.active !== false,
      updated_at: new Date().toISOString(),
    };
    const id = typeof body.id === "string" ? body.id : "";
    const result = id
      ? await db(`site_announcements?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) })
      : await db("site_announcements", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(record) });
    if (id && !result.length) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, announcement: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const { id } = await request.json();
    if (typeof id !== "string" || !id) return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
    await db(`site_announcements?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Suppression impossible." }, { status: 502 });
  }
}
