import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body?.amount);
    const game = String(body?.game ?? "").trim();

    // Le serveur recalcule les règles de base et refuse les montants invalides.
    if (!Number.isFinite(amount) || amount < 0.01 || amount > 10000 || !game) {
      return NextResponse.json(
        { error: "Montant ou jeu invalide pour l'acompte." },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUMUP_API_KEY?.trim();
    const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim();

    if (!apiKey || !merchantCode) {
      return NextResponse.json(
        { error: "Configuration SumUp incomplète dans Vercel." },
        { status: 500 },
      );
    }

    const origin = new URL(request.url).origin;
    const checkoutReference = `cp-acompte-${randomUUID()}`;

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: checkoutReference,
        amount: Math.round(amount * 100) / 100,
        currency: "EUR",
        merchant_code: merchantCode,
        description: `Chat'Perlipopette - acompte location - ${game.slice(0, 80)}`,
        redirect_url: `${origin}/reservation/retour?reference=${encodeURIComponent(checkoutReference)}`,
        hosted_checkout: { enabled: true },
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.hosted_checkout_url || !data.id) {
      console.error("SumUp deposit checkout error:", response.status, data);
      return NextResponse.json(
        { error: "SumUp n'a pas pu créer le paiement de l'acompte. Réessaie plus tard." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      checkoutUrl: data.hosted_checkout_url,
      checkoutId: data.id,
      reference: checkoutReference,
      amount: Math.round(amount * 100) / 100,
    });
  } catch (error) {
    console.error("Reservation deposit checkout error:", error);
    return NextResponse.json(
      { error: "Impossible de préparer le paiement de l'acompte." },
      { status: 500 },
    );
  }
}
