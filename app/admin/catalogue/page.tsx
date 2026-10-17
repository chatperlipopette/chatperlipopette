import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGames } from "@/lib/games";
import AdminCatalogueClient from "./AdminCatalogueClient";

export const dynamic = "force-dynamic";

export default async function AdminCataloguePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user) redirect("/admin/catalogue/connexion");
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow">
          <h1 className="text-2xl font-black text-red-700">Accès non autorisé</h1>
          <p className="mt-3 text-gray-700">Ce compte Google n’est pas autorisé à gérer le catalogue.</p>
          <form action="/admin/catalogue/deconnexion" method="post" className="mt-5">
            <button className="rounded-xl bg-gray-900 px-4 py-3 font-bold text-white">Se déconnecter</button>
          </form>
        </div>
      </main>
    );
  }

  const games = await getGames();
  return <AdminCatalogueClient games={games.map((game) => ({
    code_barre: game.code_barre,
    nom: game.nom,
    nouveaute: game.nouveaute ?? false,
    coup_de_coeur: game.coup_de_coeur ?? false,
  }))} email={user.email ?? ""} />;
}
