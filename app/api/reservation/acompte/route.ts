import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getGames } from "@/lib/games";
import { getPartnerById, getPartnerSessionId, getConfig } from "@/lib/partner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0 && body?.amount !== undefined && body?.game) {
      const legacyAmount = Number(body.amount);
      const legacyGame = String(body.game).trim();
      if (!Number.isFinite(legacyAmount) || legacyAmount < 0.01 || legacyAmount > 10000 || !legacyGame) {
        return NextResponse.json({ error: "Montant ou jeu invalide pour l'acompte." }, { status: 400 });
      }
      return createLegacyCheckout(request, legacyAmount, legacyGame);
    }
    const start = typeof body?.date_debut === "string" ? body.date_debut : "";
    const end = typeof body?.date_retour === "string" ? body.date_retour : "";
    if (!items.length || items.length > 30 || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end <= start) {
      return NextResponse.json({ error: "Panier ou dates de location invalides." }, { status: 400 });
    }
    const days = Math.max(1, Math.ceil((new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) / 86400000));
    if (!Number.isFinite(days) || days > 365) return NextResponse.json({ error: "Durée de location invalide." }, { status: 400 });

    const requestedCodes = items.map((item: { code_barre?: unknown }) => typeof item?.code_barre === "string" ? item.code_barre.trim() : "");
    if (requestedCodes.some((code: string) => !code) || new Set(requestedCodes).size !== requestedCodes.length) {
      return NextResponse.json({ error: "Un ou plusieurs identifiants de jeux sont invalides." }, { status: 400 });
    }
    const games = await getGames();
    const selected = requestedCodes.map((code: string) => games.find(game => (game.code_barre || game.nom) === code));
    if (selected.some(game => !game)) return NextResponse.json({ error: "Un jeu du panier n'existe plus dans le catalogue. Recharge ton panier." }, { status: 400 });
    const chosen = selected.filter((game): game is NonNullable<typeof game> => Boolean(game));
    if (chosen.some(game => !Number.isFinite(Number(game.prix_location)) || Number(game.prix_location) < 0)) {
      return NextResponse.json({ error: "Un jeu du panier n'a pas de prix de location valide." }, { status: 400 });
    }
    const subtotal = Math.round(chosen.reduce((sum, game) => sum + Number(game.prix_location || 0), 0) * days * 100) / 100;
    const basketRate = chosen.length >= 3 ? 0.05 : chosen.length === 2 ? 0.02 : 0;
    const basketDiscount = Math.round(subtotal * basketRate * 100) / 100;
    const afterBasket = Math.max(0, subtotal - basketDiscount);

    let partner = null;
    const partnerId = await getPartnerSessionId();
    if (partnerId) partner = await getPartnerById(partnerId);
    const partnerRate = partner?.discount_type === "free" ? 1 : partner?.discount_type === "percent" ? Math.min(100, Math.max(0, Number(partner.discount_percent) || 0)) / 100 : 0;
    const partnerDiscount = Math.round(afterBasket * partnerRate * 100) / 100;
    const total = Math.max(0, Math.round((afterBasket - partnerDiscount) * 100) / 100);
    const deposit = Math.round(total * 0.3 * 100) / 100;
    const caution = Math.round(chosen.reduce((sum, game) => sum + Math.max(0, Number(game.prix_caution) || 0), 0) * 100) / 100;
    const gameNames = chosen.map(game => game.nom).join(", ");

    if (total === 0) {
      if (partner) await incrementPartnerUsage(partner.id);
      return NextResponse.json({ free: true, days, subtotal, basketDiscount, basketRate: basketRate * 100, partnerDiscount, partnerName: partner?.name || null, total, deposit: 0, caution, gameNames });
    }
    const apiKey = process.env.SUMUP_API_KEY?.trim();
    const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim();
    if (!apiKey || !merchantCode) return NextResponse.json({ error: "Configuration SumUp incomplète dans Vercel." }, { status: 500 });
    const origin = new URL(request.url).origin;
    const checkoutReference = `cp-acompte-${randomUUID()}`;
    const paymentResponse = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_reference: checkoutReference,
        amount: deposit,
        currency: "EUR",
        merchant_code: merchantCode,
        description: `Chat'Perlipopette - acompte location - ${gameNames.slice(0, 80)}`,
        redirect_url: `${origin}/reservation/retour?reference=${encodeURIComponent(checkoutReference)}`,
        hosted_checkout: { enabled: true },
      }),
      cache: "no-store",
    });
    const payment = await paymentResponse.json().catch(() => ({}));
    if (!paymentResponse.ok || !payment.hosted_checkout_url || !payment.id) {
      console.error("SumUp deposit checkout error:", paymentResponse.status, payment);
      return NextResponse.json({ error: "SumUp n'a pas pu créer le paiement de l'acompte. Réessaie plus tard." }, { status: 502 });
    }
    if (partner) await incrementPartnerUsage(partner.id);
    return NextResponse.json({
      checkoutUrl: payment.hosted_checkout_url, checkoutId: payment.id, reference: checkoutReference,
      days, subtotal, basketDiscount, basketRate: basketRate * 100, partnerDiscount,
      partnerName: partner?.name || null, total, deposit, caution, gameNames,
    });
  } catch (error) {
    console.error("Reservation deposit checkout error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de préparer le paiement." }, { status: 500 });
  }
}

async function incrementPartnerUsage(id: string) {
  const config = getConfig();
  if (!config) return;
  // Une utilisation est comptabilisée lorsqu'un checkout est créé (ou que la location est gratuite).
  const read = await fetch(`${config.url}/rest/v1/partners?id=eq.${encodeURIComponent(id)}&select=usage_count`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store",
  });
  if (!read.ok) return;
  const rows = await read.json();
  const count = Number(rows?.[0]?.usage_count || 0);
  await fetch(`${config.url}/rest/v1/partners?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ usage_count: count + 1 }), cache: "no-store",
  });
}

async function createLegacyCheckout(request: NextRequest, amount: number, game: string) {
  const apiKey = process.env.SUMUP_API_KEY?.trim();
  const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim();
  if (!apiKey || !merchantCode) return NextResponse.json({ error: "Configuration SumUp incomplète dans Vercel." }, { status: 500 });
  const origin = new URL(request.url).origin;
  const checkoutReference = \`cp-acompte-\${randomUUID()}\`;
  const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: { Authorization: \`Bearer \${apiKey}\`, "Content-Type": "application/json" },
    body: JSON.stringify({ checkout_reference: checkoutReference, amount: Math.round(amount * 100) / 100, currency: "EUR", merchant_code: merchantCode, description: \`Chat'Perlipopette - acompte location - \${game.slice(0, 80)}\`, redirect_url: \`\${origin}/reservation/retour?reference=\${encodeURIComponent(checkoutReference)}\`, hosted_checkout: { enabled: true } }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.hosted_checkout_url || !data.id) return NextResponse.json({ error: "SumUp n'a pas pu créer le paiement de l'acompte. Réessaie plus tard." }, { status: 502 });
  return NextResponse.json({ checkoutUrl: data.hosted_checkout_url, checkoutId: data.id, reference: checkoutReference, amount: Math.round(amount * 100) / 100 });
}
