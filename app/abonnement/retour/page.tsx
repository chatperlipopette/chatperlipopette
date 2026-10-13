"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = {
  verified?: boolean;
  paid?: boolean;
  mandateActive?: boolean;
  status?: string;
  message?: string;
  error?: string;
};

export default function AbonnementRetourPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get("checkout_id") || params.get("id");
    if (!checkoutId) {
      setResult({ error: "Aucun identifiant de paiement n'a été transmis par SumUp." });
      setLoading(false);
      return;
    }
    fetch(`/api/abonnement/verifier?checkout_id=${encodeURIComponent(checkoutId)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Vérification impossible.");
        setResult(data);
      })
      .catch((error: unknown) => setResult({ error: error instanceof Error ? error.message : "Erreur de vérification." }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-5 py-16 text-[#24211B]">
      <section className="mx-auto max-w-xl rounded-3xl border border-[#EADCB9] bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black">Retour de SumUp</h1>
        {loading ? (
          <p className="mt-5">Vérification du résultat auprès de SumUp…</p>
        ) : result?.error ? (
          <p className="mt-5 text-red-700">{result.error}</p>
        ) : (
          <>
            <p className="mt-5 leading-7">{result?.message}</p>
            {result?.status && <p className="mt-3 text-sm text-[#5B5140]">État SumUp : {result.status}</p>}
          </>
        )}
        <p className="mt-5 text-sm text-[#5B5140]">
          Pour le moment, cette étape vérifie la réponse SumUp. L'abonnement mensuel ne sera pas activé tant que l'enregistrement sécurisé du mandat et le calendrier des prélèvements ne seront pas configurés.
        </p>
        <Link href="/abonnement" className="mt-7 inline-block rounded-xl bg-[#24211B] px-5 py-3 font-bold text-white">Retour aux abonnements</Link>
      </section>
    </main>
  );
}
