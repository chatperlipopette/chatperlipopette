
import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";

export const runtime = "nodejs";

const PLANS = {
  club: { name: "Club", amount: 6.99 },
  premium: { name: "Club Premium", amount: 9.99 },
} as const;

const SUMUP_API = "https://api.sumup.com/v0.1";

async function sumupRequest(
  path: string,
  apiKey: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
) {
  return fetch(`${SUMUP_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const planKey = body?.plan as keyof typeof PLANS;
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const consent = body?.consent === true;

    if (!Object.prototype.hasOwnProperty.call(PLANS, planKey)) {
      return NextResponse.json(
        { error: "Formule invalide." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Saisis une adresse e-mail valide." },
        { status: 400 },
      );
    }

    if (!consent) {
      return NextResponse.json(
        {
          error:
            "Le consentement aux paiements récurrents est obligatoire.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUMUP_API_KEY?.trim();
    const merchantCode =
      process.env.SUMUP_MERCHANT_CODE?.trim();

    if (!apiKey || !merchantCode) {
      return NextResponse.json(
        {
          error:
            "Configuration SumUp incomplète dans Vercel.",
        },
        { status: 500 },
      );
    }

    const plan = PLANS[planKey];
    const origin = new URL(request.url).origin;

    // Identifiant stable de 16 caractères.
    const customerId = createHash("sha256")
      .update(email)
      .digest("hex")
      .slice(0, 16);

    // Étape 1 : créer le client SumUp.
    const customerResponse = await sumupRequest(
      "/customers",
      apiKey,
      "POST",
      {
        customer_id: customerId,
        personal_details: { email },
      },
    );

    if (
      !customerResponse.ok &&
      customerResponse.status !== 409
    ) {
      const detail = await customerResponse.text();

      console.error(
        "SumUp customer error:",
        customerResponse.status,
        detail,
      );

      return NextResponse.json(
        {
          error:
            "Erreur lors de la création du client SumUp. Vérifie les autorisations API et les logs Vercel.",
        },
        { status: 502 },
      );
    }

    // Étape 2 : créer le checkout récurrent.
    const checkoutResponse = await sumupRequest(
      "/checkouts",
      apiKey,
      "POST",
      {
        checkout_reference: `cp-sub-${randomUUID()}`,
        amount: plan.amount,
        currency: "EUR",
        merchant_code: merchantCode,
        description:
          `Chat'Perlipopette - ${plan.name} - abonnement mensuel`,
        customer_id: customerId,
        purpose: "SETUP_RECURRING_PAYMENT",
        redirect_url: `${origin}/abonnement/retour`,
        hosted_checkout: { enabled: true },
      },
    );

    const data = await checkoutResponse
      .json()
      .catch(() => ({}));

    if (!checkoutResponse.ok) {
      console.error(
        "SumUp checkout error:",
        checkoutResponse.status,
        data,
      );

      return NextResponse.json(
        {
          error:
            `SumUp (erreur ${checkoutResponse.status}) : ` +
            String(
              data?.message ||
                data?.detail ||
                data?.error_message ||
                data?.title ||
                "Échec de création du paiement.",
            ).slice(0, 240),
        },
        { status: 502 },
      );
    }

    if (!data.hosted_checkout_url || !data.id) {
      return NextResponse.json(
        {
          error:
            "SumUp n'a pas renvoyé de lien de paiement valide.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      checkoutUrl: data.hosted_checkout_url,
      checkoutId: data.id,
      plan: planKey,
      amount: plan.amount,
    });
  } catch (error) {
    console.error("Subscription checkout error:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de préparer le paiement pour le moment.",
      },
      { status: 500 },
    );
  }
}
