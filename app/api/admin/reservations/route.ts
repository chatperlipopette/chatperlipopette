import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!Number.isInteger(Number(id)) || !["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
      .replace(/\/rest\/v1\/?$/i, "")
      .replace(/\/+$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 500 });

    const response = await fetch(
      `${url}/rest/v1/game_reservations?id=eq.${encodeURIComponent(String(id))}`,
      {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status }),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.error("Mise à jour réservation:", response.status, (await response.text()).slice(0, 300));
      return NextResponse.json({ error: "Supabase n'a pas pu modifier cette réservation." }, { status: 502 });
    }
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation: rows[0] });
  } catch {
    return NextResponse.json({ error: "Impossible de modifier la réservation." }, { status: 500 });
  }
}
