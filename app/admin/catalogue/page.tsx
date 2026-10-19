import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { getGames } from "@/lib/games";
import AdminCatalogueClient from "./AdminCatalogueClient";

export const dynamic = "force-dynamic";

export default async function AdminCataloguePage() {
  if (!(await isAdminSession())) redirect("/admin/catalogue/connexion");

  const games = await getGames();
  return <AdminCatalogueClient games={games.map((game) => ({
    code_barre: game.code_barre,
    nom: game.nom,
    nouveaute: game.nouveaute ?? false,
    coup_de_coeur: game.coup_de_coeur ?? false,
    disponibilite: game.disponibilite,
  }))} email="Administrateur" />;
}
