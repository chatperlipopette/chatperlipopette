"use client";

import { useMemo, useState } from "react";

export default function CatalogueClient({ games }: { games: any[] }) {
  const [search, setSearch] = useState("");

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.nom?.toLowerCase().includes(search.toLowerCase())
    );
  }, [games, search]);

  return (
    <>
      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Rechercher un jeu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-300 p-4 text-xl focus:border-[#E8B223] focus:outline-none"
        />
      </div>

      <div className="mb-6 text-lg">
        {filteredGames.length} jeu(x) trouvé(s)
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGames.map((game: any, index: number) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-lg transition hover:scale-105"
          >
            <h2 className="text-2xl font-bold">{game.nom}</h2>

            <p className="mt-3">
              <strong>Éditeur :</strong> {game.editeur}
            </p>

            <p>👥 {game.nombre_min}+ joueurs</p>
            <p>🎂 {game.age}+</p>
            <p>⏱ {game.duree} min</p>

            <p className="mt-4 text-2xl font-bold text-[#E8B223]">
              {game.prix_location} €
            </p>

            <div className="mt-4 rounded-lg bg-green-100 py-2 text-center font-bold text-green-700">
              {game.disponibilité}
            </div>

            <button className="mt-5 w-full rounded-xl bg-black py-3 font-bold text-white">
              Voir le jeu
            </button>
          </div>
        ))}
      </div>
    </>
  );
}