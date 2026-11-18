"use client";

import { useEffect, useState } from "react";

type Game = { code_barre: string; nom: string };
type Clue = { id: string; game_code: string; game_name: string; game_codes?: string[]; game_names?: string[]; clue: string; active: boolean; discount_percent: number; validity_days: number; created_at: string };
type HuntCode = { id: string; clue_id: string; code: string; customer_email: string | null; discount_percent: number; used_at: string | null; used_for: string | null; created_at: string; valid_until?: string | null };

export default function ChasseAdminClient() {
  const [games, setGames] = useState<Game[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [codes, setCodes] = useState<HuntCode[]>([]);
  const [gameCodes, setGameCodes] = useState<string[]>([]);
  const [clueText, setClueText] = useState("");
  const [answer, setAnswer] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [validityDays, setValidityDays] = useState("90");
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
    try {
      const response = await fetch("/api/admin/chasse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_codes: gameCodes, clue: clueText, answer, discount_percent: Number(discountPercent), validity_days: Number(validityDays) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setGameCodes([]); setClueText(""); setAnswer("");
      setSuccess("Énigme enregistrée avec les jeux et la réduction choisis.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur."); }
    finally { setSaving(false); }
  }

  async function patch(item: Clue, values: Record<string, unknown>) {
    setError(""); setSuccess("");
    const response = await fetch("/api/admin/chasse", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, ...values }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Modification impossible."); return; }
    setSuccess("Paramètres mis à jour."); await load();
  }

  async function remove(item: Clue) {
    if (!window.confirm(`Supprimer cette énigme et ses codes associés ?`)) return;
    const response = await fetch("/api/admin/chasse", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Suppression impossible."); return; }
    await load();
  }

  return <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10"><div className="mx-auto max-w-6xl">
    <a href="/admin" className="inline-flex rounded-lg bg-white px-4 py-2 font-semibold shadow-sm">← Retour à l’administration</a>
    <h1 className="mt-6 text-3xl font-black">🕵️ Chasse aux codes secrets</h1>
    <p className="mt-2 text-gray-700">Une même énigme peut être associée à plusieurs jeux. Chaque participant reçoit un code personnel, utilisable une seule fois.</p>
    <section className="mt-7 rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Créer une énigme</h2>
      <form onSubmit={save} className="mt-4 space-y-4">
        <fieldset><legend className="text-sm font-bold">Jeux associés (sélection multiple)</legend>
          <p className="mb-2 text-xs text-gray-500">Maintiens Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs jeux.</p>
          <select required multiple value={gameCodes} onChange={e=>setGameCodes(Array.from(e.target.selectedOptions, option=>option.value))} className="mt-1 min-h-48 w-full rounded-xl border p-3 font-normal">
            {games.map(game=><option key={game.code_barre} value={game.code_barre}>{game.nom}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-500">{gameCodes.length} jeu(x) sélectionné(s)</p>
        </fieldset>
        <label className="block text-sm font-bold">Énigme / indice
          <textarea required minLength={8} maxLength={1000} value={clueText} onChange={e=>setClueText(e.target.value)} rows={4} placeholder="Écris l'énigme qui permet de découvrir le code secret…" className="mt-1 w-full rounded-xl border p-3 font-normal"/>
        </label>
        <label className="block text-sm font-bold">Code secret à découvrir
          <input required maxLength={120} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Ex. CHAT31" className="mt-1 w-full rounded-xl border p-3 font-mono font-normal uppercase"/>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">Réduction (%)
            <input required type="number" min="1" max="100" step="1" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/>
          </label>
          <label className="block text-sm font-bold">Validité du code (jours)
            <input required type="number" min="1" max="365" step="1" value={validityDays} onChange={e=>setValidityDays(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/>
          </label>
        </div>
        <p className="text-sm text-gray-500">Le code promo individuel est généré après validation de la bonne réponse. Il ne peut être utilisé qu'une fois.</p>
        <button disabled={saving || loading || !games.length || !gameCodes.length} className="rounded-xl bg-[#24211B] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer l'énigme"}</button>
      </form>
    </section>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
    {success && <p role="status" className="mt-4 rounded-xl bg-green-100 p-4 text-green-800">{success}</p>}
    <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Énigmes publiées</h2><a href="/chasse-aux-codes" target="_blank" className="font-bold text-[#806000] underline">Voir la page publique ↗</a></div>
      {loading ? <p className="mt-4">Chargement…</p> : clues.length === 0 ? <p className="mt-4 rounded-xl bg-white p-5">Aucune énigme pour le moment.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2">{clues.map(item=><article key={item.id} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-black">{(item.game_names || [item.game_name]).join(" · ")}</h3><span className={item.active ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800" : "rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"}>{item.active ? "Publié" : "Masqué"}</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{item.clue}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Réduction (%)<input type="number" min="1" max="100" defaultValue={item.discount_percent || 10} onBlur={e=>{if(Number(e.target.value)!==(item.discount_percent||10)) void patch(item,{discount_percent:Number(e.target.value)});}} className="mt-1 w-full rounded-lg border p-2"/></label><label className="text-sm font-semibold">Validité (jours)<input type="number" min="1" max="365" defaultValue={item.validity_days || 90} onBlur={e=>{if(Number(e.target.value)!==(item.validity_days||90)) void patch(item,{validity_days:Number(e.target.value)});}} className="mt-1 w-full rounded-lg border p-2"/></label></div>
        <p className="mt-2 text-xs text-gray-500">{item.discount_percent || 10} % · valable {item.validity_days || 90} jours</p>
        <div className="mt-4 flex gap-2"><button onClick={()=>void patch(item,{active:!item.active})} className="rounded-lg border px-3 py-2 text-sm font-bold">{item.active ? "Masquer" : "Publier"}</button><button onClick={()=>void remove(item)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Supprimer</button></div></article>)}</div>}
    </section>
    <section className="mt-8"><h2 className="text-xl font-black">Codes générés</h2><p className="mt-1 text-sm text-gray-600">Chaque code est personnel et utilisable une seule fois.</p>
      {codes.length === 0 ? <p className="mt-4 rounded-xl bg-white p-5">Aucun code généré.</p> : <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-[#F7EBCB]"><tr><th className="p-3">Code</th><th className="p-3">Participant</th><th className="p-3">Réduction</th><th className="p-3">Statut</th><th className="p-3">Expire le</th></tr></thead><tbody>{codes.map(code=><tr key={code.id} className="border-t"><td className="p-3 font-mono font-bold">{code.code}</td><td className="p-3">{code.customer_email || "—"}</td><td className="p-3">{code.discount_percent} %</td><td className="p-3">{code.used_at ? "Utilisé" : "Disponible"}</td><td className="p-3">{code.valid_until ? new Date(code.valid_until).toLocaleDateString("fr-FR") : "—"}</td></tr>)}</tbody></table></div>}
    </section>
  </div></main>;
}
