import { getGames } from "../../lib/games";
import CatalogueClient from "./CatalogueClient";

export default async function Catalogue() {
  const games = await getGames();

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-5xl font-bold">
          🎲 Catalogue ({games.length} jeux)
        </h1>

        <CatalogueClient games={games} />
      </div>
    </main>
  );
}