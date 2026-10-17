"use client";

import { useState } from "react";

export default function AdminCatalogueLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Connexion impossible.");
      window.location.assign("/admin/catalogue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8E8] p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#EADCB9] bg-white p-8 text-center shadow-lg">
        <div className="text-5xl">🔐</div>
        <h1 className="mt-4 text-2xl font-black text-gray-900">Espace privé du catalogue</h1>
        <p className="mt-3 text-gray-600">Saisis ton mot de passe administrateur pour gérer les nouveautés et les coups de cœur.</p>
        <form onSubmit={signIn} className="mt-6 text-left">
          <label htmlFor="admin-password" className="mb-2 block font-bold text-gray-800">Mot de passe</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Ton mot de passe" />
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
          <button type="submit" disabled={loading || !password} className="mt-5 w-full rounded-xl bg-[#E8B223] px-5 py-3 font-black text-black disabled:opacity-50">{loading ? "Connexion…" : "Se connecter"}</button>
        </form>
        <a href="/catalogue" className="mt-4 inline-block text-sm font-semibold underline">Retour au catalogue</a>
      </section>
    </main>
  );
}
