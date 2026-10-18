"use client";

import { useEffect, useState } from "react";

type Game = { code_barre: string; nom: string; nouveaute: boolean; coup_de_coeur: boolean };
type Flag = { game_code: string; nouveaute: boolean; coup_de_coeur: boolean };

export default function AdminCatalogueClient({ games, email }: { games: Game[]; email: string }) {
  const [search, setSearch] = useState("");
  const [flags, setFlags] = useState<Record<string, { nouveaute: boolean; coup_de_coeur: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/catalogue", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Chargement impossible.");
        if (active) {
          const next: Record<string, { nouveaute: boolean; coup_de_coeur: boolean }> = {};
          (result.flags as Flag[]).forEach((flag) => {
            next[flag.game_code] = { nouveaute: flag.nouveaute, coup_de_coeur: flag.coup_de_coeur };
          });
          setFlags(next);
        }
      })
      .catch((error) => { if (active) setMessage(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const normalize = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
  const query = normalize(search);
  const visibleGames = query
    ? games.filter((game) => normalize(game.nom).includes(query) || normalize(game.code_barre).includes(query))
    : games;

  function toggle(code: string, field: "nouveaute" | "coup_de_coeur", value: boolean, original: Game) {
    setFlags((current) => ({
      ...current,
      [code]: {
        nouveaute: current[code]?.nouveaute ?? original.nouveaute,
        coup_de_coeur: current[code]?.coup_de_coeur ?? original.coup_de_coeur,
        [field]: value,
      },
    }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const payload = games.map((game) => ({
        game_code: game.code_barre || game.nom,
        nouveaute: flags[game.code_barre || game.nom]?.nouveaute ?? game.nouveaute,
        coup_de_coeur: flags[game.code_barre || game.nom]?.coup_de_coeur ?? game.coup_de_coeur,
      }));
      const response = await fetch("/api/admin/catalogue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sauvegarde impossible.");
      setMessage(`Modifications enregistrées pour ${result.count} jeux.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#806000]">CHAT’PERLIPOPETTE · ADMINISTRATION</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900 md:text-4xl">Nouveautés & coups de cœur</h1>
            <p className="mt-2 text-sm text-gray-600">Connecté avec {email}</p>
          </div>
          <a href="/admin/catalogue/deconnexion" className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-bold">Se déconnecter</a>
        </div>

        <div className="mb-5 rounded-2xl border border-[#EADCB9] bg-white p-4 md:p-6">
          <label htmlFor="search-games" className="mb-2 block font-bold">Rechercher un jeu</label>
          <input id="search-games" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom ou code-barres…" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
          <p className="mt-3 text-sm text-gray-600">{visibleGames.length} jeux affichés sur {games.length}</p>
        </div>

        {message && <p role="status" className="mb-5 rounded-xl border border-[#EADCB9] bg-white p-4 font-semibold">{message}</p>}

        <div key={query} className="overflow-hidden rounded-2xl border border-[#EADCB9] bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_110px_120px] gap-2 border-b bg-[#F8F3E7] p-3 text-sm font-black sm:p-4">
            <span>Jeu</span><span className="text-center">✨ Nouveauté</span><span className="text-center">❤️ Coup de cœur</span>
          </div>
          {loading ? <p className="p-6">Chargement des réglages…</p> : visibleGames.length === 0 ? <p className="p-6 text-gray-600">Aucun jeu ne correspond à « {search} ».</p> : visibleGames.map((game) => {
            const key = game.code_barre || game.nom;
            const value = flags[key] ?? { nouveaute: game.nouveaute, coup_de_coeur: game.coup_de_coeur };
            return (
              <div key={key} className="grid grid-cols-[minmax(0,1fr)_110px_120px] items-center gap-2 border-b border-gray-100 p-3 last:border-0 sm:p-4">
                <div className="min-w-0"><p className="break-words font-bold text-gray-900">{game.nom}</p>{game.code_barre && <p className="text-xs text-gray-500">{game.code_barre}</p>}</div>
                <label className="flex justify-center"><input aria-label={`Nouveauté : ${game.nom}`} type="checkbox" checked={value.nouveaute} onChange={(e) => toggle(key, "nouveaute", e.target.checked, game)} className="h-5 w-5 accent-[#D6A014]" /></label>
                <label className="flex justify-center"><input aria-label={`Coup de cœur : ${game.nom}`} type="checkbox" checked={value.coup_de_coeur} onChange={(e) => toggle(key, "coup_de_coeur", e.target.checked, game)} className="h-5 w-5 accent-pink-600" /></label>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-3 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[#EADCB9] bg-white/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-600">Les changements ne sont publics qu’après sauvegarde.</p>
          <button onClick={save} disabled={loading || saving} className="shrink-0 rounded-xl bg-[#E8B223] px-5 py-3 font-black text-black disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </div>
    </main>
  );
}
