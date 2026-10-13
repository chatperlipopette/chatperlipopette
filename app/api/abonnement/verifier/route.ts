import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutId = String(searchParams.get("checkout_id") || "").trim();
  if (!checkoutId || !/^[a-zA-Z0-9-]{8,100}$/.test(checkoutId)) {
    return NextResponse.json({ error: "Identifiant de paiement manquant ou invalide." }, { status: 400 });
  }

  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Configuration SumUp manquante." }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("SumUp checkout verification failed", response.status, data);
      return NextResponse.json({ error: "Impossible de vérifier le paiement auprès de SumUp." }, { status: 502 });
    }

    const transactionStatuses = Array.isArray(data.transactions)
      ? data.transactions.map((transaction: { status?: string }) => String(transaction.status || "").toUpperCase())
      : [];
    const paid = String(data.status || "").toUpperCase() === "PAID"
      || transactionStatuses.includes("SUCCESSFUL");
    const mandateActive = String(data.mandate?.status || "").toLowerCase() === "active"
      && String(data.mandate?.type || "").toLowerCase() === "recurrent";

    return NextResponse.json({
      verified: true,
      paid,
      mandateActive,
      status: String(data.status || "UNKNOWN"),
      message: paid && mandateActive
        ? "Le paiement de configuration a été confirmé et un mandat récurrent est actif. L'abonnement ne sera activé qu'après enregistrement sécurisé du moyen de paiement et de son calendrier de prélèvement."
        : "Le paiement ou l'autorisation récurrente n'est pas encore confirmé. Aucun abonnement actif n'a été créé.",
    });
  } catch (error) {
    console.error("SumUp checkout verification error", error);
    return NextResponse.json({ error: "Erreur lors de la vérification du paiement." }, { status: 500 });
  }
}
