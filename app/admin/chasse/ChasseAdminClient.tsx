"use client";

import { useEffect, useState } from "react";

type Game = { code_barre: string; nom: string };
type Clue = { id: string; game_code: string; game_name: string; clue: string; active: boolean; created_at: string };
type HuntCode = { id: string; clue_id: string; code: string; discount_percent: number; used_at: string | null; used_for: string | null; created_at: string };

export default function ChasseAdminClient() {
  const [games, setGames] = useState<Game[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [codes, setCodes] = useState<HuntCode[]>([]);
  const [gameCode, setGameCode] = useState("");
  const [clueText, setClueText] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/chasse", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible.");
      setGames(data.games || []); setClues(data.clues || []); setCodes(data.codes || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de chargement."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    const game = games.find(item => item.code_barre === gameCode);
    if (!game) { setError("Choisis un jeu dans le catalogue."); setSaving(false); return; }
    try {
      const response = await fetch("/api/admin/chasse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_code: game.code_barre, game_name: game.nom, clue: clueText, answer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setClueText(""); setAnswer(""); setSuccess("Indice enregistré. Le jeu est maintenant visible dans la chasse publique.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur."); }
    finally { setSaving(false); }
  }

  async function toggle(item: Clue) {
    setError("");
    const response = await fetch("/api/admin/chasse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, active: !item.active }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Modification impossible."); return; }
    await load();
  }

  async function remove(item: Clue) {
    if (!window.confirm(`Supprimer l'indice pour « ${item.game_name} » et ses codes associés ?`)) return;
    const response = await fetch("/api/admin/chasse", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Suppression impossible."); return; }
    await load();
  }

  return <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10"><div className="mx-auto max-w-6xl">
    <a href="/admin" className="inline-flex rounded-lg bg-white px-4 py-2 font-semibold shadow-sm">← Retour à l’administration</a>
    <h1 className="mt-6 text-3xl font-black">🕵️ Chasse aux codes secrets</h1>
    <p className="mt-2 text-gray-700">Crée un indice par jeu. Tous les visiteurs peuvent participer. Une bonne réponse génère un code personnel offrant 10 % de réduction.</p>
    <section className="mt-7 rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Créer ou remplacer un indice</h2>
      <form onSubmit={save} className="mt-4 space-y-4">
        <label className="block text-sm font-bold">Jeu du catalogue
          <select required value={gameCode} onChange={e=>setGameCode(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal">
            <option value="">Sélectionner un jeu</option>
            {games.map(game=><option key={game.code_barre} value={game.code_barre}>{game.nom}</option>)}
          </select>
        </label>
        <label className="block text-sm font-bold">Indice ou énigme
          <textarea required minLength={8} maxLength={1000} value={clueText} onChange={e=>setClueText(e.target.value)} rows={4} placeholder="Écris un indice qui permettra de découvrir le code…" className="mt-1 w-full rounded-xl border p-3 font-normal"/>
        </label>
        <label className="block text-sm font-bold">Réponse attendue
          <input required maxLength={120} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="La réponse exacte à l'énigme" className="mt-1 w-full rounded-xl border p-3 font-normal"/>
        </label>
        <p className="text-sm text-gray-500">La réponse n'est jamais envoyée au navigateur public. Les codes sont individuels, à usage unique, et expirent après 90 jours.</p>
        <button disabled={saving || loading || !games.length} className="rounded-xl bg-[#24211B] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer l'indice"}</button>
      </form>
    </section>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
    {success && <p role="status" className="mt-4 rounded-xl bg-green-100 p-4 text-green-800">{success}</p>}
    <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Indices publiés</h2><a href="/chasse-aux-codes" target="_blank" className="font-bold text-[#806000] underline">Voir la page publique ↗</a></div>
      {loading ? <p className="mt-4">Chargement…</p> : clues.length === 0 ? <p className="mt-4 rounded-xl bg-white p-5">Aucun indice pour le moment.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2">{clues.map(item=><article key={item.id} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-black">{item.game_name}</h3><span className={item.active ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800" : "rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"}>{item.active ? "Publié" : "Masqué"}</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{item.clue}</p><div className="mt-4 flex gap-2"><button onClick={()=>void toggle(item)} className="rounded-lg border px-3 py-2 text-sm font-bold">{item.active ? "Masquer" : "Publier"}</button><button onClick={()=>void remove(item)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Supprimer</button></div></article>)}</div>}
    </section>
    <section className="mt-8"><h2 className="text-xl font-black">Codes générés</h2><p className="mt-1 text-sm text-gray-600">Un code est créé après chaque bonne réponse.</p>
      {codes.length === 0 ? <p className="mt-4 rounded-xl bg-white p-5">Aucun code généré.</p> : <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-[#F7EBCB]"><tr><th className="p-3">Code</th><th className="p-3">Réduction</th><th className="p-3">Statut</th><th className="p-3">Créé le</th></tr></thead><tbody>{codes.map(code=><tr key={code.id} className="border-t"><td className="p-3 font-mono font-bold">{code.code}</td><td className="p-3">{code.discount_percent} %</td><td className="p-3">{code.used_at ? "Utilisé" : "Disponible"}</td><td className="p-3">{new Date(code.created_at).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></div>}
    </section>
  </div></main>;
}
