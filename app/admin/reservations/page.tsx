import Link from "next/link";
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
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
  const pending = items.filter((item) => item.status === "pending").length;
  const confirmed = items.filter((item) => item.status === "confirmed").length;

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
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">Total</p><p className="mt-1 text-3xl font-bold">{items.length}</p></div>
              <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">En attente</p><p className="mt-1 text-3xl font-bold">{pending}</p></div>
              <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-600">Confirmées</p><p className="mt-1 text-3xl font-bold">{confirmed}</p></div>
            </div>
            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white p-8 shadow">
                <h2 className="text-xl font-bold">Aucune réservation enregistrée</h2>
                <p className="mt-2 text-gray-700">La page fonctionne, mais aucune ligne n’a été trouvée dans game_reservations.</p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="p-4">Jeu</th><th className="p-4">Client</th><th className="p-4">Début</th><th className="p-4">Retour</th><th className="p-4">Statut</th><th className="p-4">Créée le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={String(item.id)} className="border-t border-gray-100 align-top">
                        <td className="p-4"><p className="font-semibold">{item.game_name || "Jeu sans nom"}</p><p className="mt-1 text-xs text-gray-500">{item.game_code || ""}</p><p className="mt-1 text-xs text-gray-500">Réf. {String(item.id)}</p></td>
                        <td className="p-4"><p>{item.customer_name || "Nom non renseigné"}</p><p className="text-gray-600">{item.customer_email || "E-mail non renseigné"}</p><p className="text-gray-600">{item.customer_phone || ""}</p></td>
                        <td className="p-4 whitespace-nowrap">{date(item.date_debut)}</td>
                        <td className="p-4 whitespace-nowrap">{date(item.date_retour)}</td>
                        <td className="p-4"><span className="inline-block rounded-full bg-amber-100 px-3 py-1 font-medium">{statusLabel(item.status)}</span></td>
                        <td className="p-4 whitespace-nowrap">{date(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        <p className="mt-6 text-sm text-gray-600">Pour protéger les données des clients, cette page est accessible uniquement avec une session administrateur valide.</p>
      </div>
    </main>
  );
}
