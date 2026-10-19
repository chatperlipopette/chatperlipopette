"use client";

import { useEffect, useState } from "react";

type Feedback = {
  id: string;
  kind: "review" | "question";
  author: string;
  rating: number | null;
  message: string;
  admin_reply: string | null;
  created_at: string;
};

export default function GameFeedback({ gameCode, gameName }: { gameCode: string; gameName: string }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [kind, setKind] = useState<"review" | "question">("review");
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const response = await fetch(`/api/feedback?game=${encodeURIComponent(gameCode)}`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setItems(data.items ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { void load(); }, [gameCode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_code: gameCode, game_name: gameName, kind, author, rating: kind === "review" ? rating : null, message, website: honeypot }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Envoi impossible.");
      setNotice("Merci ! Ton message a été envoyé et sera visible après vérification.");
      setAuthor("");
      setMessage("");
      setRating(5);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-[#EADCB9] bg-white p-5 shadow-sm sm:p-8">
      <div>
        <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">La communauté</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">⭐ Avis et questions</h2>
        <p className="mt-2 text-gray-600">Partage ton avis sur ce jeu ou pose-moi une question. Les messages sont vérifiés avant publication.</p>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? <p className="text-gray-500">Chargement des messages…</p> : items.length === 0 ? (
          <p className="rounded-xl bg-[#FFF8E8] p-4 text-gray-600">Pas encore de message. Tu peux être le premier !</p>
        ) : items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-[#FFF8E8] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-extrabold">{item.author}</p>
              <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-[#8A6200]">{item.kind === "review" ? `Avis · ${"★".repeat(item.rating ?? 0)}${"☆".repeat(5 - (item.rating ?? 0))}` : "Question"}</p>
            <p className="mt-3 whitespace-pre-line leading-7 text-gray-800">{item.message}</p>
            {item.admin_reply && <div className="mt-4 rounded-xl border-l-4 border-[#E8B223] bg-white p-4"><p className="font-extrabold">💬 Réponse de Chat’Perlipopette</p><p className="mt-2 whitespace-pre-line text-gray-700">{item.admin_reply}</p></div>}
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4 border-t border-[#EADCB9] pt-6">
        <h3 className="text-xl font-black">Laisser un message</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setKind("review")} className={`rounded-full px-4 py-2 font-bold ${kind === "review" ? "bg-[#E8B223] text-black" : "bg-gray-100"}`}>⭐ Donner un avis</button>
          <button type="button" onClick={() => setKind("question")} className={`rounded-full px-4 py-2 font-bold ${kind === "question" ? "bg-[#E8B223] text-black" : "bg-gray-100"}`}>💬 Poser une question</button>
        </div>
        <label className="block text-sm font-bold">Ton prénom ou pseudonyme
          <input required maxLength={60} value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal" placeholder="Ex. Camille" />
        </label>
        {kind === "review" && <fieldset><legend className="text-sm font-bold">Ta note</legend><div className="mt-1 flex gap-1" aria-label={`Note : ${rating} sur 5`}>{[1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoile${n > 1 ? "s" : ""}`} className={`text-3xl ${n <= rating ? "text-[#E8B223]" : "text-gray-300"}`}>★</button>)}</div></fieldset>}
        <label className="block text-sm font-bold">{kind === "review" ? "Ton commentaire" : "Ta question"}
          <textarea required minLength={3} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal" placeholder={kind === "review" ? "Qu’as-tu pensé de ce jeu ?" : "Pose ta question ici…"} />
        </label>
        <div className="hidden" aria-hidden="true"><label>Ne pas remplir<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label></div>
        {notice && <p role="status" className="rounded-xl bg-[#FFF8E8] p-3 text-sm">{notice}</p>}
        <button disabled={sending} className="w-full rounded-xl bg-[#24211B] px-5 py-3 font-extrabold text-white transition hover:bg-black disabled:opacity-60">{sending ? "Envoi…" : "Envoyer pour vérification"}</button>
        <p className="text-xs leading-5 text-gray-500">N’indique pas de coordonnées personnelles dans ton commentaire. Les messages sont modérés avant d’être publiés.</p>
      </form>
    </section>
  );
}
