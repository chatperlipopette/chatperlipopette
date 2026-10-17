"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminCatalogueLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError("L’authentification n’est pas encore configurée sur le site.");
      setLoading(false);
      return;
    }
    const supabase = createClient(url, key);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin/catalogue` },
    });
    if (authError) {
      setError("Impossible de lancer la connexion Google. Vérifie la configuration Supabase.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8E8] p-5">
      <section className="w-full max-w-md rounded-3xl border border-[#EADCB9] bg-white p-8 text-center shadow-lg">
        <div className="text-5xl">🔐</div>
        <h1 className="mt-4 text-2xl font-black text-gray-900">Espace privé du catalogue</h1>
        <p className="mt-3 text-gray-600">Connecte-toi avec le compte Google autorisé pour gérer les nouveautés et les coups de cœur.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        <button onClick={signIn} disabled={loading} className="mt-6 w-full rounded-xl bg-[#E8B223] px-5 py-3 font-black text-black disabled:opacity-50">{loading ? "Redirection…" : "Continuer avec Google"}</button>
        <a href="/catalogue" className="mt-4 inline-block text-sm font-semibold underline">Retour au catalogue</a>
      </section>
    </main>
  );
}
