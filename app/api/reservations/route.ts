import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReservationInput = {
  game_code?: unknown;
  game_name?: unknown;
  date_debut?: unknown;
  date_retour?: unknown;
  customer_email?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
      .replace(/\/rest\/v1\/?$/i, "")
      .replace(/\/+$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 500 });
    }

    const body = await request.json();
    const items: ReservationInput[] = Array.isArray(body?.items) ? body.items : [body];
    const dateDebut = typeof body?.date_debut === "string" ? body.date_debut : "";
    const dateRetour = typeof body?.date_retour === "string" ? body.date_retour : "";
    const email = typeof body?.customer_email === "string" ? body.customer_email.trim() : "";

    if (!items.length || items.length > 30 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateDebut) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateRetour) ||
        dateRetour <= dateDebut ||
        !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informations de réservation invalides." }, { status: 400 });
    }

    const rows = items.map((item) => ({
      game_code: typeof item.game_code === "string" ? item.game_code.trim() : "",
      game_name: typeof item.game_name === "string" ? item.game_name.trim() : "",
      date_debut: dateDebut,
      date_retour: dateRetour,
      status: "pending",
      customer_email: email,
    }));

    if (rows.some((row) => !row.game_code || !row.game_name)) {
      return NextResponse.json({ error: "Un jeu de la réservation est invalide." }, { status: 400 });
    }

    const response = await fetch(`${url}/rest/v1/game_reservations`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      console.error("Insertion réservation Supabase:", response.status, detail);
      return NextResponse.json({ error: "Impossible d'enregistrer la réservation dans Supabase." }, { status: 502 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    console.error("Erreur API réservations:", error);
    return NextResponse.json({ error: "Impossible de traiter la réservation." }, { status: 500 });
  }
}
