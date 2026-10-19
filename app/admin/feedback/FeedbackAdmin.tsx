"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  game_code: string;
  game_name: string;
  kind: "review" | "question";
  author: string;
  rating: number | null;
  message: string;
  admin_reply: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function FeedbackAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/admin/feedback", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible.");
      setItems(data.items ?? []);
      setReplies(Object.fromEntries((data.items ?? []).map((item: Item) => [item.id, item.admin_reply ?? ""])));
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de chargement."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function update(item: Item, status: Item["status"]) {
    setError("");
    try {
      const response = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status, admin_reply: replies[item.id] ?? "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sauvegarde impossible.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur de sauvegarde."); }
  }

  const visible = items.filter((item) => filter === "all" || item.status === filter);
  return (
    <main className="min-h-screen bg-[#FFF8E8] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="font-bold hover:underline">← Administration</a>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">💬 Avis et questions</h1>
        <p className="mt-2 text-gray-600">Approuve les messages avant publication, réponds aux questions et masque les contenus inadaptés.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[["pending","À vérifier"],["approved","Publiés"],["rejected","Refusés"],["all","Tous"]].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 font-bold ${filter === value ? "bg-[#E8B223]" : "bg-white"}`}>{label}</button>)}
          <button onClick={() => void load()} className="rounded-full border border-gray-300 bg-white px-4 py-2 font-bold">Actualiser</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-3 text-red-800">{error}</p>}
        {loading ? <p className="mt-8">Chargement…</p> : visible.length === 0 ? <p className="mt-8 rounded-2xl bg-white p-6">Aucun message dans cette catégorie.</p> : (
          <div className="mt-6 space-y-5">
            {visible.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-sm font-bold text-[#9A6B00]">{item.kind === "review" ? `Avis · ${item.rating}/5 étoiles` : "Question"} · {item.game_name}</p><h2 className="mt-1 text-xl font-black">{item.author}</h2><p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString("fr-FR")}</p></div>
                  <span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-sm font-bold">{item.status === "pending" ? "À vérifier" : item.status === "approved" ? "Publié" : "Refusé"}</span>
                </div>
                <p className="mt-4 whitespace-pre-line leading-7">{item.message}</p>
                <label className="mt-4 block text-sm font-bold">Ta réponse publique (facultative)
                  <textarea rows={3} maxLength={1500} value={replies[item.id] ?? ""} onChange={(e) => setReplies((prev) => ({ ...prev, [item.id]: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-300 p-3 font-normal" placeholder="Écris ta réponse ici…" />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => void update(item, "approved")} className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white">{item.kind === "question" ? "Publier et répondre" : "Publier l’avis"}</button>
                  <button onClick={() => void update(item, "rejected")} className="rounded-xl bg-red-100 px-4 py-2 font-bold text-red-800">Refuser / masquer</button>
                  {item.status !== "pending" && <button onClick={() => void update(item, "pending")} className="rounded-xl bg-gray-100 px-4 py-2 font-bold">Remettre en attente</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
