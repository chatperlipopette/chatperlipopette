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
    editeur: game.editeur,
    nombre_min: game.nombre_min,
    nombre_max: game.nombre_max,
    duree: game.duree,
    age: game.age,
    disponibilite: game.disponibilite,
    prix_location: game.prix_location,
    prix_caution: game.prix_caution,
    description: game.description,
    categories: game.categories,
    annee: game.annee ?? null,
    image_url: game.image_url ?? "",
    nouveaute: game.nouveaute ?? false,
    coup_de_coeur: game.coup_de_coeur ?? false,
  }))} email="Administrateur" />;
}
