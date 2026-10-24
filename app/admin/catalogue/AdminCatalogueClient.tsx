"use client";

import { useEffect, useState } from "react";

type Game = {
  code_barre: string; nom: string; editeur: string; nombre_min: number | null; nombre_max: number | null;
  duree: string; age: number | null; disponibilite: string; prix_location: number | null; prix_caution: number | null;
  description: string | null; categories: string; annee: number | null; image_url: string;
  nouveaute: boolean; coup_de_coeur: boolean;
};
type GameDraft = Omit<Game, "nouveaute" | "coup_de_coeur"> & { nouveaute: boolean; coup_de_coeur: boolean };
const emptyDraft: GameDraft = {
  code_barre: "", nom: "", editeur: "", nombre_min: null, nombre_max: null, duree: "", age: null,
  disponibilite: "dispo", prix_location: null, prix_caution: null, description: "", categories: "autres",
  annee: null, image_url: "", nouveaute: false, coup_de_coeur: false,
};
type Flag = { game_code: string; nouveaute: boolean; coup_de_coeur: boolean };
type AvailabilityBlock = { game_code: string; blocked_manually: boolean; block_reason: string | null };
type Reservation = { game_code: string; date_debut: string; date_retour: string; status: string };

function normalizeFlagKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]/g, "");
}

export default function AdminCatalogueClient({ games, email }: { games: Game[]; email: string }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [originalCode, setOriginalCode] = useState("");
  const [draft, setDraft] = useState<GameDraft>(emptyDraft);
  const [gameSaving, setGameSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [flags, setFlags] = useState<Record<string, { nouveaute: boolean; coup_de_coeur: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [blocks, setBlocks] = useState<Record<string, AvailabilityBlock>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockReasonDraft, setBlockReasonDraft] = useState<Record<string, string>>({});
  const [availabilitySaving, setAvailabilitySaving] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/catalogue", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Chargement impossible.");
        if (active) {
          const next: Record<string, { nouveaute: boolean; coup_de_coeur: boolean }> = {};
          (result.flags as Flag[]).forEach((flag) => {
            next[normalizeFlagKey(flag.game_code)] = { nouveaute: flag.nouveaute === true, coup_de_coeur: flag.coup_de_coeur === true };
          });
          setFlags(next);
        }
      })
      .catch((error) => { if (active) setMessage(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/disponibilite", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Disponibilités indisponibles.");
        if (!active) return;
        const nextBlocks: Record<string, AvailabilityBlock> = {};
        (result.blocks as AvailabilityBlock[]).forEach((item) => { nextBlocks[item.game_code] = item; });
        setBlocks(nextBlocks);
        setReservations((result.reservations as Reservation[]) || []);
      })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);

  async function saveAvailability(game: Game, blocked: boolean) {
    const key = game.code_barre || game.nom;
    setAvailabilitySaving(key);
    setMessage("");
    try {
      const response = await fetch("/api/admin/disponibilite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_code: key, blocked_manually: blocked, block_reason: blockReasonDraft[key] || "" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d'enregistrer la disponibilité.");
      setBlocks((current) => ({ ...current, [key]: { game_code: key, blocked_manually: blocked, block_reason: blockReasonDraft[key] || null } }));
      setMessage(blocked ? `${game.nom} est bloqué manuellement.` : `Blocage manuel retiré pour ${game.nom}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sauvegarde impossible.");
    } finally {
      setAvailabilitySaving(null);
    }
  }

  const normalize = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
  const query = normalize(search);
  const visibleGames = query
    ? games.filter((game) => normalize(game.nom).includes(query) || normalize(game.code_barre).includes(query))
    : games;

  function startNewGame() {
    setOriginalCode("");
    setDraft({ ...emptyDraft });
    setEditorOpen(true);
    setMessage("");
  }

  function startEditGame(game: Game) {
    setOriginalCode(game.code_barre || game.nom);
    setDraft({ ...emptyDraft, ...game, description: game.description || "", image_url: game.image_url || "" });
    setEditorOpen(true);
    setMessage("");
  }

  function updateDraft(field: keyof GameDraft, value: string | boolean) {
    setDraft((current) => ({
      ...current,
      [field]: ["age", "nombre_min", "nombre_max", "prix_location", "prix_caution", "annee"].includes(field)
        ? (value === "" ? null : Number(String(value).replace(",", ".")))
        : value,
    }));
  }

  async function saveGame() {
    if (!draft.nom.trim()) {
      setMessage("Le nom du jeu est obligatoire.");
      return;
    }
    setGameSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/jeux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_code: originalCode, game: draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d’enregistrer ce jeu.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setGameSaving(false);
    }
  }

  function toggle(code: string, field: "nouveaute" | "coup_de_coeur", value: boolean, original: Game) {
    setFlags((current) => ({
      ...current,
      [normalizeFlagKey(code)]: {
        nouveaute: current[normalizeFlagKey(code)]?.nouveaute ?? false,
        coup_de_coeur: current[normalizeFlagKey(code)]?.coup_de_coeur ?? false,
        [field]: value,
      },
    }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      // Utiliser la même clé normalisée à l'enregistrement et à la lecture publique.
      // Cela évite qu'un espace, un accent ou une différence de casse fasse perdre un coup de cœur.
      const payloadByKey = new Map<string, { game_code: string; nouveaute: boolean; coup_de_coeur: boolean }>();
      games.forEach((game) => {
        const rawKey = game.code_barre || game.nom;
        const key = normalizeFlagKey(rawKey);
        if (!key) return;
        payloadByKey.set(key, {
          game_code: key,
          nouveaute: flags[key]?.nouveaute ?? false,
          coup_de_coeur: flags[key]?.coup_de_coeur ?? false,
        });
      });
      const payload = Array.from(payloadByKey.values());
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

        <div className="mb-5 flex justify-end">
          <button type="button" onClick={startNewGame} className="rounded-xl bg-[#E8B223] px-5 py-3 font-black text-black">+ Ajouter un jeu</button>
        </div>

        {editorOpen && <section className="mb-6 rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">{originalCode ? "Modifier un jeu" : "Ajouter un jeu"}</h2>
            <button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg border px-3 py-2 font-semibold">Fermer</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ["nom", "Nom du jeu", "text"], ["code_barre", "Code-barres / identifiant", "text"],
              ["editeur", "Éditeur", "text"], ["age", "Âge conseillé (ans)", "number"],
              ["nombre_min", "Joueurs minimum", "number"], ["nombre_max", "Joueurs maximum", "number"],
              ["duree", "Durée (ex. 30 min ou 1 h 30)", "text"], ["prix_location", "Prix de location (€)", "number"],
              ["prix_caution", "Caution (€)", "number"], ["annee", "Année de sortie", "number"],
              ["categories", "Catégories", "text"], ["image_url", "URL de l’image", "url"],
            ] as const).map(([field, label, type]) => <label key={field} className="block text-sm font-semibold">
              {label}
              <input type={type} min={type === "number" ? 0 : undefined} step={["prix_location", "prix_caution"].includes(field) ? "0.01" : "1"}
                value={String(draft[field] ?? "")} onChange={(e) => updateDraft(field, e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
            </label>)}
            <label className="block text-sm font-semibold">Disponibilité
              <select value={draft.disponibilite} onChange={(e) => updateDraft("disponibilite", e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal">
                <option value="dispo">Disponible</option><option value="indisponible">Indisponible</option>
              </select>
            </label>
            <label className="block text-sm font-semibold sm:col-span-2 lg:col-span-3">Description
              <textarea value={draft.description || ""} onChange={(e) => updateDraft("description", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
            </label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.nouveaute} onChange={(e) => updateDraft("nouveaute", e.target.checked)} /> Nouveauté</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.coup_de_coeur} onChange={(e) => updateDraft("coup_de_coeur", e.target.checked)} /> Coup de cœur</label>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={saveGame} disabled={gameSaving} className="rounded-xl bg-[#E8B223] px-5 py-3 font-black disabled:opacity-50">{gameSaving ? "Enregistrement…" : "Enregistrer le jeu"}</button>
          </div>
        </section>}

        <div className="mb-5 rounded-2xl border border-[#EADCB9] bg-white p-4 md:p-6">
          <label htmlFor="search-games" className="mb-2 block font-bold">Rechercher un jeu</label>
          <input id="search-games" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom ou code-barres…" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
          <p className="mt-3 text-sm text-gray-600">{visibleGames.length} jeux affichés sur {games.length}</p>
        </div>

        {message && <p role="status" className="mb-5 rounded-xl border border-[#EADCB9] bg-white p-4 font-semibold">{message}</p>}

        <div key={query} className="overflow-hidden rounded-2xl border border-[#EADCB9] bg-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_80px_90px_120px] gap-2 border-b bg-[#F8F3E7] p-3 text-xs font-black sm:p-4 sm:text-sm">
            <span>Jeu</span><span className="text-center">✨ Nouveau</span><span className="text-center">❤️ Coup de cœur</span><span className="text-center">Disponibilité</span>
          </div>
          {loading ? <p className="p-6">Chargement des réglages…</p> : visibleGames.length === 0 ? <p className="p-6 text-gray-600">Aucun jeu ne correspond à « {search} ».</p> : visibleGames.map((game) => {
            const key = game.code_barre || game.nom;
            const value = flags[normalizeFlagKey(key)] ?? { nouveaute: false, coup_de_coeur: false };
            return (
              <div key={key} className="grid grid-cols-[minmax(0,1fr)_80px_90px_120px] items-center gap-2 border-b border-gray-100 p-3 last:border-0 sm:p-4">
                <div className="min-w-0"><p className="break-words font-bold text-gray-900">{game.nom}</p>{game.code_barre && <p className="text-xs text-gray-500">{game.code_barre}</p>}<p className="mt-1 text-xs text-gray-500">Âge : {game.age === null ? "non indiqué" : `${game.age} ans`} · Location : {game.prix_location === null ? "non indiqué" : `${game.prix_location} €`}</p><button type="button" onClick={() => startEditGame(game)} className="mt-2 rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold">Modifier la fiche</button></div>
                <label className="flex justify-center"><input aria-label={`Nouveauté : ${game.nom}`} type="checkbox" checked={value.nouveaute} onChange={(e) => toggle(key, "nouveaute", e.target.checked, game)} className="h-5 w-5 accent-[#D6A014]" /></label>
                <label className="flex justify-center"><input aria-label={`Coup de cœur : ${game.nom}`} type="checkbox" checked={value.coup_de_coeur} onChange={(e) => toggle(key, "coup_de_coeur", e.target.checked, game)} className="h-5 w-5 accent-pink-600" /></label>
                <div className="flex flex-col items-center gap-1">
                  {(() => {
                    const block = blocks[key];
                    const overlapping = reservations.filter((r) => r.game_code === key && r.status !== "cancelled");
                    const booked = overlapping.length > 0;
                    const manuallyBlocked = block?.blocked_manually ?? false;
                    const sourceUnavailable = ["indisponible", "indispo", "non", "no", "false"].includes(normalize(game.disponibilite));
                    return <>
                      <span className={`rounded-full px-2 py-1 text-center text-xs font-bold ${manuallyBlocked || sourceUnavailable ? "bg-red-100 text-red-800" : booked ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                        {manuallyBlocked ? "Bloqué admin" : booked ? "Réservé" : sourceUnavailable ? "Indisponible" : "Libre"}
                      </span>
                      <button type="button" disabled={availabilitySaving === key} onClick={() => saveAvailability(game, !manuallyBlocked)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold disabled:opacity-50">
                        {availabilitySaving === key ? "…" : manuallyBlocked ? "Débloquer" : "Bloquer"}
                      </button>
                      {manuallyBlocked && <input aria-label={`Motif de blocage : ${game.nom}`} value={blockReasonDraft[key] ?? block?.block_reason ?? ""} onChange={(e) => setBlockReasonDraft((current) => ({ ...current, [key]: e.target.value }))} onBlur={() => saveAvailability(game, true)} placeholder="Motif (facultatif)" className="w-28 rounded border px-1 py-1 text-xs" />}
                      {booked && <span className="text-center text-[10px] text-gray-500">{overlapping.map((r) => `${r.date_debut} → ${r.date_retour}`).join(", ")}</span>}
                    </>;
                  })()}
                </div>
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
