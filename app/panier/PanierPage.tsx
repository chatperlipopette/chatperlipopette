"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CartItem = { code_barre: string; nom: string; prix_location: number; prix_caution: number };
const CART_KEY = "chatperlipopette-panier-v1";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHFVFRttFhytx7CQ7Ho8Pi7topvrJAYerngds6liFmrA-5N5icXd5Euiu_mcVXAJXp/exec";

function euro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default function PanierPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [partner, setPartner] = useState<{ active: boolean; name?: string; discountType?: string; discountPercent?: number }>({ active: false });
  const [partnerUsername, setPartnerUsername] = useState("");
  const [partnerPassword, setPartnerPassword] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]")); } catch { setItems([]); }
    fetch("/api/partner/session", { cache: "no-store" }).then(r => r.json()).then(d => setPartner(d)).catch(() => setPartner({ active: false }));
  }, []);

  async function activatePartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPartnerBusy(true); setPartnerMessage("");
    try {
      const payload = partnerCode.trim()
        ? { code: partnerCode.trim() }
        : { username: partnerUsername.trim(), password: partnerPassword };
      const response = await fetch("/api/partner/connexion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Activation impossible.");
      const session = await fetch("/api/partner/session", { cache: "no-store" }).then(r => r.json());
      setPartner(session); setPartnerMessage(data.message || "Avantage activé."); setPartnerPassword(""); setPartnerCode("");
    } catch (e) { setPartnerMessage(e instanceof Error ? e.message : "Erreur d'activation."); }
    finally { setPartnerBusy(false); }
  }

  async function deactivatePartner() {
    await fetch("/api/partner/deconnexion", { method: "POST" });
    setPartner({ active: false }); setPartnerMessage("Avantage partenaire désactivé.");
  }

  function update(next: CartItem[]) {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }

  const days = start && end && end > start
    ? Math.max(1, Math.ceil((new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) / 86400000))
    : 0;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, Number(item.prix_location) || 0), 0) * days, [items, days]);
  const discountRate = items.length >= 3 ? 0.05 : items.length === 2 ? 0.02 : 0;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;
  const partnerRate = partner.active ? (partner.discountType === "free" ? 1 : Math.min(100, Math.max(0, Number(partner.discountPercent) || 0)) / 100) : 0;
  const estimatedPartnerDiscount = Math.round(total * partnerRate * 100) / 100;
  const estimatedTotal = Math.max(0, Math.round((total - estimatedPartnerDiscount) * 100) / 100);
  const deposit = Math.round(estimatedTotal * 0.3 * 100) / 100;
  const caution = items.reduce((sum, item) => sum + Math.max(0, Number(item.prix_caution) || 0), 0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!items.length) { setError("Ton panier est vide."); return; }
    if (!days) { setError("Choisis une date de début et une date de retour valides."); return; }
    if (total <= 0) { setError("Le montant de location doit être supérieur à zéro."); return; }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const customer = {
      prenom: String(form.get("prenom") || ""),
      nom: String(form.get("nom") || ""),
      email: String(form.get("email") || ""),
      telephone: String(form.get("telephone") || ""),
      message: String(form.get("message") || ""),
    };
    try {
      // Le serveur relit les prix du catalogue et vérifie l'avantage partenaire.
      const paymentResponse = await fetch("/api/reservation/acompte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(item => ({ code_barre: item.code_barre })), date_debut: start, date_retour: end }),
      });
      const payment = await paymentResponse.json().catch(() => ({}));
      if (!paymentResponse.ok) throw new Error(payment.error || "Impossible de calculer la réservation.");
      const booking = {
        ...customer,
        jeux: items,
        jeu: payment.gameNames,
        codes_barres: items.map((item) => item.code_barre).join(", "),
        date_debut: start,
        date_retour: end,
        nombre_jours: payment.days,
        sous_total_location: payment.subtotal,
        reduction_panier_pourcentage: payment.basketRate,
        reduction_panier: payment.basketDiscount,
        reduction_partenaire: payment.partnerDiscount,
        partenaire: payment.partnerName || "",
        total_location: payment.total,
        caution_totale: payment.caution,
        acompte_30_pourcent: payment.deposit,
        statut_paiement: payment.free ? "Location offerte - paiement non requis" : "En attente de paiement de l'acompte",
      };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(booking),
      });
      if (payment.free) {
        localStorage.removeItem(CART_KEY); setItems([]); setBookingComplete(true); setBusy(false); return;
      }
      if (!payment.checkoutUrl) throw new Error("SumUp n'a pas fourni de lien de paiement.");
      window.location.assign(payment.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessaie.");
      setBusy(false);
    }
  }

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-4 py-10 text-[#24211B]">
      <div className="mx-auto max-w-4xl">
        <Link href="/catalogue" className="font-bold hover:underline">← Retour au catalogue</Link>
        <h1 className="mt-5 text-4xl font-black">🛒 Mon panier</h1>
        <p className="mt-2 text-gray-600">Regroupe plusieurs jeux dans une seule demande de réservation.</p>

        {bookingComplete ? (
          <section className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm"><div className="text-5xl">🎉</div><h2 className="mt-4 text-2xl font-black">Ta location est offerte !</h2><p className="mt-2 text-gray-700">Ta demande a été transmise. Nous allons vérifier les disponibilités et te recontacter pour confirmer.</p><Link href="/catalogue" className="mt-5 inline-block rounded-xl bg-[#E8B223] px-5 py-3 font-bold">Retour au catalogue</Link></section>
        ) : items.length === 0 ? (
          <section className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-bold">Ton panier est vide.</p>
            <Link href="/catalogue" className="mt-5 inline-block rounded-xl bg-[#E8B223] px-5 py-3 font-bold">Découvrir les jeux</Link>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-6">
            <section className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">Tes jeux ({items.length})</h2>
              <div className="mt-4 divide-y">
                {items.map((item) => (
                  <div key={item.code_barre} className="flex items-center justify-between gap-4 py-4">
                    <div><p className="font-bold">{item.nom}</p><p className="text-sm text-gray-600">{euro(item.prix_location)} / jour · Caution {euro(item.prix_caution)}</p></div>
                    <button type="button" onClick={() => update(items.filter((entry) => entry.code_barre !== item.code_barre))} className="rounded-lg border px-3 py-2 text-sm font-bold">Retirer</button>
                  </div>
                ))}
              </div>
              <Link href="/catalogue" className="mt-3 inline-block font-bold text-[#806000] hover:underline">+ Ajouter d'autres jeux</Link>
            </section>

            <section className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">🤝 Avantage partenaire</h2>
              {partner.active ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-green-50 p-4"><div><p className="font-bold text-green-800">Accès activé : {partner.name}</p><p className="text-sm text-green-700">{partner.discountType === "free" ? "Location offerte" : `Réduction supplémentaire de ${partner.discountPercent}%`}</p></div><button type="button" onClick={() => void deactivatePartner()} className="rounded-lg border border-green-300 px-3 py-2 text-sm font-bold text-green-800">Désactiver</button></div>
              ) : (
                <form onSubmit={activatePartner} className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600">Connecte-toi avec ton identifiant partenaire ou saisis un code promotionnel.</p>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Identifiant<input value={partnerUsername} onChange={e=>setPartnerUsername(e.target.value)} className="mt-1 w-full rounded-xl border p-3" autoComplete="username"/></label><label className="text-sm font-semibold">Mot de passe<input type="password" value={partnerPassword} onChange={e=>setPartnerPassword(e.target.value)} className="mt-1 w-full rounded-xl border p-3" autoComplete="current-password"/></label></div>
                  <div className="text-center text-xs font-bold text-gray-400">OU</div>
                  <label className="block text-sm font-semibold">Code partenaire<input value={partnerCode} onChange={e=>setPartnerCode(e.target.value.toUpperCase())} placeholder="Ex. CLUB31" className="mt-1 w-full rounded-xl border p-3 uppercase"/></label>
                  <button disabled={partnerBusy || ((!partnerUsername || !partnerPassword) && !partnerCode.trim())} className="rounded-xl border border-[#E8B223] px-4 py-2 font-bold disabled:opacity-50">{partnerBusy ? "Vérification…" : "Activer mon avantage"}</button>
                </form>
              )}
              {partnerMessage && <p className="mt-3 text-sm font-semibold text-[#806000]">{partnerMessage}</p>}
            </section>

            <section className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">📅 Dates de location</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="font-semibold">Début<input required type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
                <label className="font-semibold">Retour<input required type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
              </div>
            </section>

            <section className="rounded-2xl border-2 border-[#E8B223] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">💶 Récapitulatif</h2>
              <div className="mt-4 space-y-2 text-gray-700">
                <p className="flex justify-between"><span>Durée</span><strong>{days ? `${days} jour(s)` : "À calculer"}</strong></p>
                <p className="flex justify-between"><span>Sous-total</span><strong>{euro(subtotal)}</strong></p>
                {discountRate > 0 && <p className="flex justify-between text-green-700"><span>Réduction fidélité panier ({discountRate * 100} %)</span><strong>− {euro(discount)}</strong></p>}
                {partner.active && <p className="flex justify-between text-green-700"><span>Avantage partenaire</span><strong>{partner.discountType === "free" ? "− " + euro(estimatedPartnerDiscount) : "− " + euro(estimatedPartnerDiscount)}</strong></p>}
                <p className="flex justify-between border-t pt-2 text-lg"><span>Total estimatif location</span><strong>{euro(estimatedTotal)}</strong></p>
                <p className="flex justify-between"><span>Caution (à part)</span><strong>{euro(caution)}</strong></p>
                <p className="flex justify-between text-lg text-[#806000]"><span>Acompte estimé (30 %)</span><strong>{euro(deposit)}</strong></p>
                <p className="text-xs text-gray-500">Réduction de 2 % pour 2 jeux, de 5 % à partir de 3 jeux. La caution n'est pas incluse dans le paiement de l'acompte.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">👤 Tes coordonnées</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="font-semibold">Prénom<input required name="prenom" autoComplete="given-name" className="mt-2 w-full rounded-xl border p-3"/></label>
                <label className="font-semibold">Nom<input required name="nom" autoComplete="family-name" className="mt-2 w-full rounded-xl border p-3"/></label>
                <label className="font-semibold">E-mail<input required type="email" name="email" autoComplete="email" className="mt-2 w-full rounded-xl border p-3"/></label>
                <label className="font-semibold">Téléphone<input required type="tel" name="telephone" autoComplete="tel" className="mt-2 w-full rounded-xl border p-3"/></label>
              </div>
              <label className="mt-4 block font-semibold">Message (facultatif)<textarea name="message" rows={3} className="mt-2 w-full rounded-xl border p-3"/></label>
            </section>

            {error && <p role="alert" className="rounded-xl bg-red-100 p-4 font-semibold text-red-800">{error}</p>}
            <button disabled={busy || !days || !items.length} className="w-full rounded-xl bg-[#24211B] px-6 py-4 text-lg font-black text-white disabled:opacity-50">{busy ? "Préparation du paiement…" : `Payer l'acompte de ${euro(deposit)} avec SumUp`}</button>
            <p className="text-center text-xs text-gray-500">La demande reste soumise à vérification avant confirmation définitive. Le paiement de l'acompte est effectué sur la page sécurisée SumUp.</p>
          </form>
        )}
      </div>
    </main>
  );
}
