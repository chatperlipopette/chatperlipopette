import { getGames } from "../../lib/games";
import { getCatalogueFlags, normalizeCatalogueKey } from "../../lib/catalogue-flags";
import CatalogueClient from "./CatalogueClient";

export const dynamic = "force-dynamic";

export default async function Catalogue() {
  try {
    const [sourceGames, flags] = await Promise.all([getGames(), getCatalogueFlags()]);
    const games = sourceGames.map((game) => {
      const key = normalizeCatalogueKey(game.code_barre || game.nom);
      const savedFlags = flags.get(key);
      return {
        ...game,
        // Les réglages Supabase priment lorsqu'une ligne existe. En l'absence
        // de réglage enregistré, conserver les valeurs déjà présentes dans la source.
        nouveaute: savedFlags ? savedFlags.nouveaute : game.nouveaute === true,
        coup_de_coeur: savedFlags ? savedFlags.coup_de_coeur : game.coup_de_coeur === true,
      };
    });

    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-4xl font-black text-gray-900">
            🎲 Catalogue ({games.length} jeux)
          </h1>
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
            <div className="text-7xl">🎲</div>
            <h1 className="mt-5 text-3xl font-black text-red-600">
              Impossible de charger le catalogue
            </h1>
            <p className="mt-4 text-gray-600">
              Une erreur est survenue lors de la récupération des jeux.
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
