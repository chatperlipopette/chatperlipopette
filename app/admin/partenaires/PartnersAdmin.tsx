"use client";
import { useEffect, useState } from "react";
type Partner = { id: string; name: string; username: string | null; promo_code: string | null; discount_type: "free" | "percent"; discount_percent: number; active: boolean; expires_at: string | null; max_uses: number | null; usage_count: number };
export default function PartnersAdmin() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"free" | "percent">("percent");
  const [percent, setPercent] = useState("20");
  const [expires, setExpires] = useState("");
  const [maxUses, setMaxUses] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const r = await fetch("/api/admin/partners", { cache: "no-store" }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Chargement impossible."); setPartners(d.partners || []); }
    catch (e) { setError(e instanceof Error ? e.message : "Erreur."); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const r = await fetch("/api/admin/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, username, password, promo_code: code, discount_type: type, discount_percent: Number(percent), expires_at: expires ? new Date(expires + "T23:59:59").toISOString() : null, max_uses: maxUses ? Number(maxUses) : null }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Création impossible.");
      setName(""); setUsername(""); setPassword(""); setCode(""); setExpires(""); setMaxUses(""); setSuccess("Partenaire créé."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur."); } finally { setSaving(false); }
  }
  async function toggle(p: Partner) {
    setError(""); const r = await fetch("/api/admin/partners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, active: !p.active }) });
    const d = await r.json(); if (!r.ok) { setError(d.error || "Modification impossible."); return; } await load();
  }
  async function remove(p: Partner) {
    if (!window.confirm(`Supprimer le partenaire « ${p.name} » ?`)) return;
    const r = await fetch("/api/admin/partners", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
    const d = await r.json(); if (!r.ok) { setError(d.error || "Suppression impossible."); return; } await load();
  }
  return <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10"><div className="mx-auto max-w-6xl">
    <a href="/admin" className="inline-flex rounded-lg bg-white px-4 py-2 font-semibold shadow-sm">← Retour à l’administration</a>
    <h1 className="mt-6 text-3xl font-black">🤝 Partenaires et avantages</h1>
    <p className="mt-2 text-gray-700">Crée des accès privés ou des codes à partager. Les avantages s’appliquent à tous les jeux du catalogue, sur le prix de location (hors caution).</p>
    <section className="mt-7 rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Créer un partenaire</h2>
      <form onSubmit={create} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">Nom du partenaire<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Association, comité d'entreprise…" className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Identifiant (facultatif si code seul)<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="ex. association31" className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Mot de passe (8 caractères minimum)<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe de connexion" className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Code promotionnel (facultatif)<input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ex. CLUB31" className="mt-1 w-full rounded-xl border p-3 uppercase font-normal"/></label>
        <label className="text-sm font-bold">Type d’avantage<select value={type} onChange={e=>setType(e.target.value as "free"|"percent")} className="mt-1 w-full rounded-xl border p-3 font-normal"><option value="percent">Réduction en pourcentage</option><option value="free">Location gratuite</option></select></label>
        {type === "percent" && <label className="text-sm font-bold">Réduction (%)<input type="number" min="1" max="100" value={percent} onChange={e=>setPercent(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>}
        <label className="text-sm font-bold">Date d’expiration (facultatif)<input type="date" value={expires} onChange={e=>setExpires(e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Nombre maximal d’utilisations (facultatif)<input type="number" min="1" value={maxUses} onChange={e=>setMaxUses(e.target.value)} placeholder="Illimité" className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
        <div className="md:col-span-2"><button disabled={saving} className="rounded-xl bg-[#24211B] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Création…" : "Créer le partenaire"}</button></div>
      </form>
      <p className="mt-3 text-xs text-gray-500">Tu peux créer un compte (identifiant + mot de passe), un code seul, ou les deux. Les mots de passe sont stockés sous forme chiffrée (hachage), jamais en clair.</p>
    </section>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}{success && <p className="mt-4 rounded-xl bg-green-100 p-4 text-green-800">{success}</p>}
    <section className="mt-7"><h2 className="text-xl font-black">Partenaires enregistrés</h2>{loading ? <p className="mt-4">Chargement…</p> : partners.length === 0 ? <p className="mt-4 rounded-xl bg-white p-5">Aucun partenaire pour le moment.</p> : <div className="mt-4 grid gap-4 md:grid-cols-2">{partners.map(p=><article key={p.id} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{p.name}</h3><p className="mt-1 text-sm text-gray-600">{p.username ? `Identifiant : ${p.username}` : "Accès par code uniquement"}</p>{p.promo_code && <p className="mt-1 font-bold tracking-wide">Code : {p.promo_code}</p>}</div><span className={p.active ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800" : "rounded-full bg-gray-100 px-3 py-1 text-xs font-bold"}>{p.active ? "Actif" : "Désactivé"}</span></div><p className="mt-3 font-semibold">{p.discount_type === "free" ? "Location gratuite" : `−${p.discount_percent}% sur la location`}</p><p className="mt-1 text-sm text-gray-600">Utilisations : {p.usage_count}{p.max_uses ? ` / ${p.max_uses}` : " (sans limite)"}</p>{p.expires_at && <p className="text-sm text-gray-600">Expire le {new Date(p.expires_at).toLocaleDateString("fr-FR")}</p>}<div className="mt-4 flex gap-2"><button onClick={()=>void toggle(p)} className="rounded-lg border px-3 py-2 text-sm font-bold">{p.active ? "Désactiver" : "Réactiver"}</button><button onClick={()=>void remove(p)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700">Supprimer</button></div></article>)}</div>}</section>
  </div></main>;
}
