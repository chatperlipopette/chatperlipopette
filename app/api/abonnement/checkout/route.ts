
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
      console.error("Configuration SumUp manquante.");

      return NextResponse.json(
        {
          error:
            "Configuration SumUp incomplète. Vérifie SUMUP_API_KEY et SUMUP_MERCHANT_CODE dans Vercel.",
        },
        { status: 500 },
      );
    }

    const plan = PLANS[planKey];
    const origin = new URL(request.url).origin;

    // Identifiant client stable pour cette adresse e-mail.
    const customerId = createHash("sha256")
      .update(email)
      .digest("hex")
      .slice(0, 32);

    // 1. Créer le client dans SumUp.
    const customerResponse = await sumupRequest(
      "/customers",
      apiKey,
      "POST",
      {
        customer_id: customerId,
        personal_details: {
          email,
        },
      },
    );

    // Si le client existe déjà, on vérifie qu'il est accessible.
    if (
      !customerResponse.ok &&
      customerResponse.status === 409
    ) {
      const existingCustomer = await sumupRequest(
        `/customers/${encodeURIComponent(customerId)}`,
        apiKey,
        "GET",
      );

      if (!existingCustomer.ok) {
        console.error(
          "SumUp customer lookup failed:",
          existingCustomer.status,
          await existingCustomer.text(),
        );

        return NextResponse.json(
          {
            error:
              "Le client existe peut-être déjà, mais SumUp n'a pas permis de le vérifier. Vérifie les autorisations API.",
          },
          { status: 502 },
        );
      }
    } else if (!customerResponse.ok) {
      const detail = await customerResponse.text();

      console.error(
        "SumUp customer creation failed:",
        customerResponse.status,
        detail,
      );

      return NextResponse.json(
        {
          error:
            "SumUp n'a pas pu créer le client. Vérifie la clé API et les autorisations customers.write ou payment_instruments.",
        },
        { status: 502 },
      );
    }

    // 2. Créer le checkout d'initialisation du paiement récurrent.
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

    const checkoutData = await checkoutResponse
      .json()
      .catch(() => ({}));

    if (!checkoutResponse.ok) {
      console.error(
        "SumUp checkout creation failed:",
        checkoutResponse.status,
        checkoutData,
      );

      return NextResponse.json(
        {
          error:
            "SumUp (erreur " +
            checkoutResponse.status +
            ") : " +
            String(
              checkoutData?.message ||
                checkoutData?.detail ||
                checkoutData?.error_message ||
                checkoutData?.title ||
                "Impossible de créer le paiement.",
            ).slice(0, 240),
        },
        { status: 502 },
      );
    }

    if (
      !checkoutData.hosted_checkout_url ||
      !checkoutData.id
    ) {
      console.error(
        "SumUp checkout URL or ID missing.",
      );

      return NextResponse.json(
        {
          error:
            "SumUp n'a pas renvoyé de lien de paiement valide.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      checkoutUrl: checkoutData.hosted_checkout_url,
      checkoutId: checkoutData.id,
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
