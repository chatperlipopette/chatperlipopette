"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = code.trim()
        ? { code: code.trim() }
        : { username: username.trim(), password };
      const response = await fetch("/api/partner/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connexion impossible.");
      router.push("/panier");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-4 py-12 text-[#24211B]">
      <div className="mx-auto max-w-lg">
        <Link href="/panier" className="font-bold hover:underline">← Retour au panier</Link>
        <section className="mt-6 rounded-2xl border border-[#EADCB9] bg-white p-6 shadow-sm sm:p-8">
          <div className="text-4xl">🤝</div>
          <h1 className="mt-3 text-3xl font-black">Espace partenaire</h1>
          <p className="mt-2 text-gray-600">Connecte-toi avec les accès transmis par Chat’Perlipopette pour activer ton avantage sur tes locations.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-bold">Identifiant
              <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Ton identifiant partenaire" className="mt-1 w-full rounded-xl border p-3 font-normal" />
            </label>
            <label className="block text-sm font-bold">Mot de passe
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Ton mot de passe partenaire" className="mt-1 w-full rounded-xl border p-3 font-normal" />
            </label>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-400"><span className="h-px flex-1 bg-gray-200" />ou avec un code<span className="h-px flex-1 bg-gray-200" /></div>
            <label className="block text-sm font-bold">Code partenaire
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex. CLUB31" className="mt-1 w-full rounded-xl border p-3 font-normal uppercase" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm text-red-800">{error}</p>}
            <button disabled={busy || (!code.trim() && (!username.trim() || !password))} className="w-full rounded-xl bg-[#24211B] px-5 py-3 font-bold text-white disabled:opacity-50">
              {busy ? "Connexion…" : "Activer mon avantage"}
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">Cet espace est indépendant de l’administration. Tu n’as pas besoin du mot de passe administrateur.</p>
        </section>
      </div>
    </main>
  );
}
