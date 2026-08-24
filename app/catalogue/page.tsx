import { getGames } from "../../lib/games";
import CatalogueClient from "./CatalogueClient";

export default async function Catalogue() {
  try {
    // On indique à TypeScript que les données récupérées
    // correspondent bien à la liste de jeux attendue.
    const games = (await getGames()) as any[];

    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">
        <div className="mx-auto max-w-7xl">

          {/* =========================================
              TITRE
          ========================================= */}
          <h1 className="mb-8 text-4xl font-black text-gray-900">
            🎲 Catalogue ({games.length} jeux)
          </h1>

          {/* =========================================
              CATALOGUE + RECHERCHE + FILTRES
          ========================================= */}
          <CatalogueClient games={games} />

        </div>
      </main>
    );

  } catch (error) {

    console.error("Erreur catalogue :", error);

    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">

            <div className="text-7xl">
              🎲
            </div>

            <h1 className="mt-5 text-3xl font-black text-red-600">
              Impossible de charger le catalogue
            </h1>

            <p className="mt-4 text-gray-600">
              Une erreur est survenue lors de la récupération
              des jeux.
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Consulte la console pour plus de détails.
            </p>

          </div>

        </div>
      </main>
    );
  }
}