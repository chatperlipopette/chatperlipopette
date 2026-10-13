"use client";

import Link from "next/link";
import { useState } from "react";

type Plan = "club" | "premium";

const plans: Record<Plan, { name: string; price: string; amount: number; description: string; benefits: string[] }> = {
  club: {
    name: "Club",
    price: "6,99 €",
    amount: 6.99,
    description: "Pour profiter régulièrement de nouvelles parties.",
    benefits: ["Une location offerte par mois, jusqu’à 3 €", "5 % de réduction sur les autres locations", "Cumul des points fidélité", "Bonus d’anniversaire", "Accès aux réservations en avance"],
  },
  premium: {
    name: "Club Premium",
    price: "9,99 €",
    amount: 9.99,
    description: "La formule supérieure pour les joueurs réguliers.",
    benefits: ["Les avantages du Club", "Une formule pensée pour les joueurs réguliers", "Les avantages Premium précis restent à confirmer"],
  },
};

export default function AbonnementPage() {
  const [plan, setPlan] = useState<Plan>("club");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/abonnement/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, consent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de démarrer le paiement.");
      if (!data.checkoutUrl || typeof data.checkoutUrl !== "string" || !data.checkoutUrl.startsWith("https://")) {
        throw new Error("SumUp n'a pas renvoyé de lien sécurisé.");
      }
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-5 py-12 text-[#24211B] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold underline underline-offset-4">← Retour à l’accueil</Link>
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Chat’Perlipopette</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Choisis ton abonnement</h1>
          <p className="mt-4 text-lg leading-7 text-[#5B5140]">Sélectionne la formule qui correspond à ta façon de jouer.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(Object.keys(plans) as Plan[]).map((key) => {
            const item = plans[key];
            const selected = plan === key;
            return (
              <article key={key} className={`rounded-3xl border-2 bg-white p-7 shadow-sm ${selected ? "border-[#B8860B] ring-2 ring-[#E8B223]/40" : "border-[#EADCB9]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-2xl font-black">{item.name}</h2><p className="mt-2 text-[#5B5140]">{item.description}</p></div>
                  {selected && <span className="rounded-full bg-[#FFF1BF] px-3 py-1 text-sm font-extrabold">Sélectionné ✓</span>}
                </div>
                <p className="mt-6"><span className="text-4xl font-black">{item.price}</span><span className="ml-2 text-[#5B5140]">/ mois</span></p>
                <ul className="mt-6 space-y-3 leading-6">{item.benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}</ul>
                <button type="button" onClick={() => setPlan(key)} className={`mt-7 w-full rounded-xl px-5 py-4 text-center font-extrabold transition ${selected ? "bg-[#24211B] text-white" : "bg-[#E8B223] text-black hover:bg-[#D6A014]"}`}>
                  {selected ? "Formule sélectionnée" : `Choisir ${item.name}`}
                </button>
              </article>
            );
          })}
        </div>

        <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#E8B223] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-black">Continuer avec SumUp</h2>
          <p className="mt-2 leading-7 text-[#5B5140]">Formule choisie : <strong>{plans[plan].name} — {plans[plan].price}/mois</strong>.</p>
          <label htmlFor="subscription-email" className="mt-5 block font-bold">Ton adresse e-mail</label>
          <input id="subscription-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.fr" className="mt-2 w-full rounded-xl border border-[#D8CBAA] bg-white px-4 py-3 outline-none focus:border-[#9A6B00]" />
          <label className="mt-5 flex items-start gap-3 leading-6">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#9A6B00]" />
            <span>J’accepte que mes informations de paiement soient enregistrées par SumUp afin de permettre les paiements récurrents de {plans[plan].price} par mois. Je pourrai demander l’arrêt de mon abonnement. Aucun prélèvement ne doit être effectué sans mon accord.</span>
          </label>
          <button type="button" disabled={loading || !email.trim() || !consent} onClick={startCheckout} className="mt-6 w-full rounded-xl bg-[#24211B] px-5 py-4 font-extrabold text-white transition hover:bg-[#40392E] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Préparation de SumUp…" : "Continuer vers le paiement sécurisé"}
          </button>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <p className="mt-4 text-sm leading-6 text-[#6B6253]">La page SumUp est hébergée par SumUp. La validation finale et l’activation de l’abonnement nécessitent encore la vérification du mandat et la mise en place sécurisée des prélèvements mensuels automatiques.</p>
        </section>
        <div className="mt-8 text-center"><Link href="/#fidelite" className="font-bold underline underline-offset-4">Découvrir le programme fidélité</Link></div>
      </div>
    </main>
  );
}
