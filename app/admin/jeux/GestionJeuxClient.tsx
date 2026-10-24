"use client";

import { useMemo, useState } from "react";

type Game = {
  code_barre: string;
  nom: string;
  editeur: string;
  nombre_min: number | null;
  nombre_max: number | null;
  duree: string;
  age: number | null;
  disponibilite: string;
  prix_location: number | null;
  prix_caution: number | null;
  description: string | null;
  categories: string;
  annee?: number | null;
  image_url?: string;
  nouveaute?: boolean;
  coup_de_coeur?: boolean;
};

export default function GestionJeuxClient({ games }: { games: Game[] }) {
  const [items, setItems] = useState<Game[]>(games);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const visibleGames = useMemo(() => {
    const normalize = (value: unknown) => String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr")
      .trim()
      .replace(/\s+/g, " ");
    const q = normalize(search);
    if (!q) return items;
    return items.filter((game) => {
      // Cherche dans tous les champs descriptifs, pas seulement le nom et le code.
      const searchable = [
        game.nom,
        game.code_barre,
        game.editeur,
        game.description,
        game.categories,
        game.duree,
        game.age,
        game.nombre_min,
        game.nombre_max,
        game.annee,
      ].map(normalize).join(" ");
      return searchable.includes(q);
    });
  }, [items, search]);

  function updatePrice(code: string, field: "prix_location" | "prix_caution", value: string) {
    const number = value.trim() === "" ? null : Number(value.replace(",", "."));
    setItems((current) => current.map((game) =>
      (game.code_barre || game.nom) === code
        ? { ...game, [field]: number !== null && Number.isFinite(number) ? number : null }
        : game
    ));
  }

  async function saveGame(game: Game) {
    const key = game.code_barre || game.nom;
    setSaving(key);
    setMessage("");
    try {
      const response = await fetch("/api/admin/jeux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_code: key, game }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d'enregistrer les prix.");
      setMessage("Prix enregistrés pour « " + game.nom + " ».");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#806000]">CHAT’PERLIPOPETTE · ADMINISTRATION</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900 md:text-4xl">🎲 Gérer les jeux et les prix</h1>
            <p className="mt-2 text-gray-600">Modifie le prix de location et la caution, puis enregistre chaque jeu.</p>
          </div>
          <a href="/admin" className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-bold">← Administration</a>
        </div>

        <label className="mb-5 block font-bold">
          Rechercher un jeu
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom ou code-barres…" className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal" />
        </label>

        {message && <p role="status" className="mb-4 rounded-xl border border-[#EADCB9] bg-white p-4 font-semibold">{message}</p>}
        <p className="mb-3 text-sm text-gray-600">{visibleGames.length} jeu(x) affiché(s) sur {items.length}</p>

        <div className="space-y-3">
          {visibleGames.map((game) => {
            const key = game.code_barre || game.nom;
            return (
              <section key={key} className="grid gap-4 rounded-2xl border border-[#EADCB9] bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_150px_150px_130px] md:items-end">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-black text-gray-900">{game.nom}</h2>
                  {game.code_barre && <p className="text-xs text-gray-500">Code : {game.code_barre}</p>}
                  <p className="mt-1 text-sm text-gray-600">Prix actuel : {game.prix_location ?? "non défini"} € · Caution : {game.prix_caution ?? "non définie"} €</p>
                </div>
                <label className="block text-sm font-bold">Location (€)
                  <input type="number" min="0" step="0.01" value={game.prix_location ?? ""} onChange={(event) => updatePrice(key, "prix_location", event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                </label>
                <label className="block text-sm font-bold">Caution (€)
                  <input type="number" min="0" step="0.01" value={game.prix_caution ?? ""} onChange={(event) => updatePrice(key, "prix_caution", event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                </label>
                <button type="button" onClick={() => saveGame(game)} disabled={saving !== null} className="rounded-xl bg-[#E8B223] px-4 py-3 font-black text-black disabled:opacity-50">
                  {saving === key ? "Enregistrement…" : "Enregistrer"}
                </button>
              </section>
            );
          })}
          {visibleGames.length === 0 && <p className="rounded-xl bg-white p-6 text-gray-600">Aucun jeu trouvé.</p>}
        </div>
      </div>
    </main>
  );
}
