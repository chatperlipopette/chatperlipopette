import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";

export const runtime = "nodejs";

const PLANS = {
  club: { name: "Club", amount: 6.99 },
  premium: { name: "Club Premium", amount: 9.99 },
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planKey = body?.plan as keyof typeof PLANS;
    const email = String(body?.email || "").trim().toLowerCase();
    const consent = body?.consent === true;

    if (!(planKey in PLANS)) {
      return NextResponse.json({ error: "Formule invalide." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Saisis une adresse e-mail valide." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Le consentement aux paiements récurrents est obligatoire." }, { status: 400 });
    }

    const apiKey = process.env.SUMUP_API_KEY;
    const merchantCode = process.env.SUMUP_MERCHANT_CODE;
    if (!apiKey || !merchantCode) {
      return NextResponse.json({ error: "La configuration SumUp côté serveur est incomplète." }, { status: 500 });
    }

    const plan = PLANS[planKey];
    const origin = new URL(request.url).origin;
    const customerId = createHash("sha256").update(email).digest("hex").slice(0, 16);
    const reference = "cp-sub-" + randomUUID();

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: reference,
        amount: plan.amount,
        currency: "EUR",
        merchant_code: merchantCode,
        description: `Chat'Perlipopette - ${plan.name} - abonnement mensuel`,
        customer_id: customerId,
        purpose: "SETUP_RECURRING_PAYMENT",
        redirect_url: `${origin}/abonnement/retour`,
        hosted_checkout: { enabled: true },
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("SumUp checkout creation failed", response.status, data);
      const apiMessage = String(data?.message || data?.error_message || data?.error || "").slice(0, 240);
      const errorCode = String(data?.error_code || data?.code || "").slice(0, 80);
      const errorParam = String(data?.param || data?.parameter || "").slice(0, 80);
      const detail = [apiMessage, errorCode ? "code=" + errorCode : "", errorParam ? "paramètre=" + errorParam : ""].filter(Boolean).join(" ; ");
      return NextResponse.json(
        {
          error: "SumUp (erreur " + response.status + ") : " + (detail || "Vérifie le code marchand et les autorisations API."),
        },
        { status: 502 },
      );
    }

    if (!data.hosted_checkout_url || !data.id) {
      console.error("SumUp response missing checkout URL or ID", data);
      return NextResponse.json({ error: "SumUp n'a pas renvoyé de lien de paiement exploitable." }, { status: 502 });
    }

    // Important: this creates only the initial recurring-payment setup checkout.
    // A recurring mandate/token must be confirmed and stored server-side before monthly charges can be made.
    return NextResponse.json({
      checkoutUrl: data.hosted_checkout_url,
      checkoutId: data.id,
      plan: planKey,
      amount: plan.amount,
    });
  } catch (error) {
    console.error("Subscription checkout error", error);
    return NextResponse.json({ error: "Impossible de préparer le paiement pour le moment." }, { status: 500 });
  }
}
