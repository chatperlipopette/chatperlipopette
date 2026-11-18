"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Clue = { id: string; game_code: string; game_name: string; clue: string };
type Result = { code: string; discount_percent: number } | null;

export default function ChassePublique() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chasse", { cache: "no-store" }).then(r=>r.json()).then(d=>{ if (Array.isArray(d.clues)) setClues(d.clues); }).catch(()=>{});
  }, []);

  async function solve(id: string) {
    setBusy(id); setMessages(current=>({...current,[id]:""}));
    try {
      const response = await fetch("/api/chasse", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,answer:answers[id] || ""}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vérification impossible.");
      setResults(current=>({...current,[id]:{code:data.code,discount_percent:data.discount_percent}}));
      setMessages(current=>({...current,[id]:"Bravo ! Garde ton code pour ta réservation."}));
    } catch(e) { setMessages(current=>({...current,[id]:e instanceof Error ? e.message : "Erreur."})); }
    finally { setBusy(null); }
  }

  return <main className="min-h-screen bg-[#FFF8E8] px-4 py-10 text-[#24211B]"><div className="mx-auto max-w-5xl">
    <Link href="/catalogue" className="font-bold hover:underline">← Retour au catalogue</Link>
    <header className="mt-6 rounded-3xl bg-[#24211B] p-8 text-center text-white"><div className="text-5xl">🕵️</div><h1 className="mt-3 text-3xl font-black">La chasse aux codes secrets</h1><p className="mt-3 text-white/80">Résous les énigmes liées à nos jeux et gagne un code personnel de réduction de 10 % !</p></header>
    {clues.length === 0 ? <p className="mt-8 rounded-2xl bg-white p-8 text-center">Aucune énigme n'est publiée pour le moment. Reviens bientôt !</p> : <div className="mt-8 grid gap-5 md:grid-cols-2">{clues.map(item=><article key={item.id} className="rounded-2xl border border-[#EADCB9] bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-[#9A6B00]">Énigme liée à un jeu</p><h2 className="mt-2 text-xl font-black">{item.game_name}</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-gray-700">{item.clue}</p>{results[item.id] ? <div className="mt-5 rounded-xl bg-green-50 p-4"><p className="font-bold text-green-800">🎉 {messages[item.id]}</p><p className="mt-2 text-sm text-green-800">Ton code personnel :</p><p className="mt-1 font-mono text-2xl font-black tracking-widest">{results[item.id]?.code}</p><p className="mt-2 text-sm text-green-800">−10 % sur ta location · utilisable une seule fois</p><button onClick={()=>navigator.clipboard?.writeText(results[item.id]?.code || "")} className="mt-3 rounded-lg border border-green-300 px-3 py-2 text-sm font-bold text-green-900">Copier le code</button></div> : <form className="mt-5 space-y-3" onSubmit={e=>{e.preventDefault();void solve(item.id);}}><label className="block text-sm font-bold">Ta réponse<input value={answers[item.id] || ""} onChange={e=>setAnswers(current=>({...current,[item.id]:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="Entre ta réponse…" required/></label><button disabled={busy===item.id} className="w-full rounded-xl bg-[#E8B223] px-4 py-3 font-extrabold text-black disabled:opacity-50">{busy===item.id ? "Vérification…" : "Valider ma réponse"}</button>{messages[item.id] && <p role="alert" className="text-sm font-semibold text-red-700">{messages[item.id]}</p>}</form>}</article>)}</div>}
    <p className="mt-8 text-center text-sm text-gray-600">Chaque code est individuel, valable 90 jours et à usage unique. Offre non cumulable avec d'autres codes de chasse.</p>
  </div></main>;
}
