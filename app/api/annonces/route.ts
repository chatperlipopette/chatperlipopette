import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return NextResponse.json({ announcements: [] });
  try {
    const response = await fetch(
      `${url}/rest/v1/site_announcements?select=id,title,message,badge,discount,category,starts_at,ends_at&active=eq.true&order=created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) return NextResponse.json({ announcements: [] });
    const rows = await response.json();
    const now = Date.now();
    const announcements = rows.filter((item: { starts_at: string | null; ends_at: string | null }) =>
      (!item.starts_at || new Date(item.starts_at).getTime() <= now) &&
      (!item.ends_at || new Date(item.ends_at).getTime() >= now)
    );
    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ announcements: [] });
  }
}
