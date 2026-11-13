import Link from "next/link";
import ReservationsClient from "./ReservationsClient";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

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

async function getReservations(): Promise<{ items: Reservation[]; error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return { items: [], error: "Configuration Supabase manquante dans les variables d’environnement Vercel." };

  try {
    const response = await fetch(
      `${url}/rest/v1/game_reservations?select=*&order=created_at.desc&limit=500`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 240);
      console.error("Lecture des réservations Supabase:", response.status, detail);
      return {
        items: [],
        error: response.status === 404
          ? "La table game_reservations est introuvable dans Supabase. Vérifie le schéma de la base de données."
          : `Supabase a répondu avec le code ${response.status}. Vérifie les droits et la table game_reservations.`,
      };
    }
    const data = await response.json();
    return { items: Array.isArray(data) ? data : [], error: null };
  } catch {
    return { items: [], error: "Impossible de joindre Supabase. Vérifie l’URL de la base de données dans Vercel." };
  }
}

function date(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(parsed);
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "pending": return "En attente";
    case "confirmed": return "Confirmée";
    case "cancelled": return "Annulée";
    case "returned": return "Retournée";
    case "completed": return "Terminée";
    default: return status || "Inconnu";
  }
}

export default async function AdminReservationsPage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");
  const { items, error } = await getReservations();

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="inline-flex rounded-lg bg-white px-4 py-2 font-semibold shadow-sm hover:shadow">
          ← Retour à l’administration
        </Link>
        <h1 className="mt-6 text-3xl font-bold md:text-4xl">📅 Gestion des réservations</h1>
        <p className="mt-2 text-gray-700">Les réservations enregistrées dans Supabase apparaissent ici automatiquement.</p>

        {error ? (
          <div role="alert" className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900">
            <h2 className="font-bold">Impossible de charger les réservations</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-2 text-sm">Les variables secrètes ne sont jamais affichées sur cette page.</p>
          </div>
        ) : (
          <>
            <ReservationsClient initialItems={items} />
          </>
        )}
        <p className="mt-6 text-sm text-gray-600">Pour protéger les données des clients, cette page est accessible uniquement avec une session administrateur valide.</p>
      </div>
    </main>
  );
}
