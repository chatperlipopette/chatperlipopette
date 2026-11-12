"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  message: string;
  badge: string;
  discount: string;
  image_url: string;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
};

const emptyForm = {
  title: "", message: "", badge: "PROMOTION", discount: "", image_url: "",
  starts_at: "", ends_at: "", active: true,
};

export default function AnnoncesAdminClient() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/annonces", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible.");
      setItems(data.announcements || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  function edit(item: Announcement) {
    setEditing(item.id);
    setForm({
      title: item.title, message: item.message, badge: item.badge || "PROMOTION",
      discount: item.discount || "", image_url: item.image_url || "",
      starts_at: item.starts_at ? item.starts_at.slice(0, 16) : "",
      ends_at: item.ends_at ? item.ends_at.slice(0, 16) : "", active: item.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/annonces", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setForm(emptyForm); setEditing(null); await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return;
    const response = await fetch("/api/admin/annonces", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Suppression impossible."); return; }
    await refresh();
  }

  async function toggle(item: Announcement) {
    const response = await fetch("/api/admin/annonces", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, active: !item.active }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Modification impossible."); return; }
    await refresh();
  }

  const input = "w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-[#D6A014] focus:ring-2 focus:ring-[#E8B223]/30";
  return (
    <main className="min-h-screen bg-[#FFF8E8] p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="text-sm font-bold text-[#765500] hover:underline">← Retour à l’administration</a>
        <h1 className="mt-4 text-3xl font-black text-gray-900 md:text-4xl">📣 Gestion des annonces</h1>
        <p className="mt-2 text-gray-600">Crée tes soldes, promotions et messages pour les visiteurs du site.</p>

        <form onSubmit={save} className="mt-7 space-y-4 rounded-3xl border border-[#EADCB9] bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-xl font-black">{editing ? "Modifier l’annonce" : "Créer une annonce"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold">Titre de l’annonce
              <input className={input+" mt-2"} required maxLength={100} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex. Soldes d’automne 🍂" />
            </label>
            <label className="block text-sm font-bold">Petit badge
              <input className={input+" mt-2"} maxLength={30} value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} placeholder="PROMOTION" />
            </label>
            <label className="block text-sm font-bold md:col-span-2">Message
              <textarea className={input+" mt-2 min-h-24"} required maxLength={500} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Profitez de nos jeux de société à prix réduit !" />
            </label>
            <label className="block text-sm font-bold">Réduction affichée (facultatif)
              <input className={input+" mt-2"} maxLength={40} value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})} placeholder="Ex. -30 % ou 2 € de réduction" />
            </label>
            <label className="block text-sm font-bold">URL de l’image (facultatif)
              <input className={input+" mt-2"} type="url" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://…" />
            </label>
            <label className="block text-sm font-bold">Date et heure de début
              <input className={input+" mt-2"} type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})} />
            </label>
            <label className="block text-sm font-bold">Date et heure de fin
              <input className={input+" mt-2"} type="datetime-local" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})} />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} className="h-4 w-4 accent-[#D6A014]" />
            Annonce activée (visible pendant sa période)
          </label>
          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-xl bg-[#24211B] px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Publier l’annonce"}</button>
            {editing && <button type="button" onClick={()=>{setEditing(null);setForm(emptyForm);}} className="rounded-xl border border-gray-300 px-5 py-3 font-bold">Annuler</button>}
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        </form>

        <section className="mt-9">
          <h2 className="text-2xl font-black">Mes annonces ({items.length})</h2>
          {loading ? <p className="mt-4 text-gray-600">Chargement…</p> : items.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-6 text-gray-600">Aucune annonce pour le moment.</p> : (
            <div className="mt-4 grid gap-4">
              {items.map(item => <article key={item.id} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><span className="text-xs font-black uppercase tracking-wide text-[#916500]">{item.badge}</span><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className="mt-1 text-gray-600">{item.message}</p>{item.discount && <p className="mt-2 font-black text-[#A45B00]">{item.discount}</p>}</div>
                  <span className={item.active ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800" : "rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700"}>{item.active ? "Activée" : "Désactivée"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={()=>edit(item)} className="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-gray-50">Modifier</button>
                  <button onClick={()=>void toggle(item)} className="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-gray-50">{item.active ? "Désactiver" : "Activer"}</button>
                  <button onClick={()=>void remove(item.id)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Supprimer</button>
                </div>
              </article>)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
