"use client";

import { useState } from "react";

type Reservation = {
  id: string | number;
  game_name?: string | null;
  game_code?: string | null;
  date_debut?: string | null;
  date_retour?: string | null;
  status?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  created_at?: string | null;
};

function date(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(parsed);
}

function statusLabel(status?: string | null) {
  if (status === "pending") return "En attente";
  if (status === "confirmed") return "Acceptée";
  if (status === "cancelled") return "Refusée";
  if (status === "returned") return "Retournée";
  if (status === "completed") return "Terminée";
  return status || "Inconnu";
}

export default function ReservationsClient({ initialItems }: { initialItems: Reservation[] }) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState("");

  async function changeStatus(item: Reservation, status: "confirmed" | "cancelled" | "pending") {
    setBusyId(item.id);
    setError("");
    try {
      const response = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      setItems(current => current.map(row => String(row.id) === String(item.id) ? { ...row, status } : row));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = items.filter(item => item.status === "pending").length;
  const confirmed = items.filter(item => item.status === "confirmed").length;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">Total</p><p className="mt-1 text-3xl font-bold">{items.length}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">En attente</p><p className="mt-1 text-3xl font-bold">{pending}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">Acceptées</p><p className="mt-1 text-3xl font-bold">{confirmed}</p></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 font-semibold text-red-800">{error}</p>}
      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 shadow"><h2 className="text-xl font-bold">Aucune réservation enregistrée</h2><p className="mt-2 text-gray-700">Les nouvelles demandes apparaîtront ici.</p></div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map(item => (
            <article key={String(item.id)} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-lg font-bold">{item.game_name || "Jeu sans nom"}</h2><p className="text-xs text-gray-500">{item.game_code || ""} · Réf. {item.id}</p></div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.status === "confirmed" ? "bg-green-100 text-green-800" : item.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{statusLabel(item.status)}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-gray-500">Client</p><p className="font-semibold">{item.customer_name || "Non renseigné"}</p><p>{item.customer_email || "E-mail non renseigné"}</p><p>{item.customer_phone || ""}</p></div>
                <div><p className="text-gray-500">Début</p><p className="font-semibold">{date(item.date_debut)}</p></div>
                <div><p className="text-gray-500">Retour</p><p className="font-semibold">{date(item.date_retour)}</p></div>
                <div><p className="text-gray-500">Demande reçue</p><p className="font-semibold">{date(item.created_at)}</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.status !== "confirmed" && <button disabled={busyId === item.id} onClick={() => changeStatus(item, "confirmed")} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busyId === item.id ? "Enregistrement…" : "✓ Accepter"}</button>}
                {item.status !== "cancelled" && <button disabled={busyId === item.id} onClick={() => changeStatus(item, "cancelled")} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">✕ Refuser</button>}
                {item.status !== "pending" && <button disabled={busyId === item.id} onClick={() => changeStatus(item, "pending")} className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-50">Remettre en attente</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
