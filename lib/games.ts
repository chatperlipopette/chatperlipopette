"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Game = {
  code_barre: string;
  nom: string;
  editeur: string;
  nombre_min: number | null;
  nombre_max: number | null;
  duree: string;
  age: number | null;
  disponibilite: string;
  prix_location: number | null;
  prix_caution: number | null;
  description: string | null;
  categories?: string | null;
};

type Props = {
  games: Game[];
};

const CATEGORIES = [
  { value: "cooperatif", label: "🤝 Coopératif" },
  { value: "ambiance", label: "😂 Ambiance" },
  { value: "strategie", label: "🧠 Stratégie" },
  { value: "enquete", label: "🔎 Enquête et déduction" },
  { value: "famille", label: "👨‍👩‍👧 Famille" },
  { value: "a deux", label: "💑 À deux" },
  { value: "cartes", label: "🃏 Jeux de cartes" },
  { value: "rapide", label: "⚡ Jeux rapides" },
  { value: "bluff", label: "🎭 Bluff" },
  { value: "expert", label: "🔥 Expert" },
  { value: "enfants", label: "🧸 Enfants" },
  { value: "reflexion", label: "💡 Réflexion" },
  { value: "observation", label: "👀 Observation" },
  { value: "deduction", label: "🕵️ Déduction" },
  { value: "gestion", label: "🏗️ Gestion" },
  { value: "adresse", label: "🎯 Adresse" },
];

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CatalogueClient({ games }: Props) {
  const [search, setSearch] = useState("");
  const [minPlayers, setMinPlayers] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [availability, setAvailability] = useState("");
  const [category, setCategory] = useState("");

  const filteredGames = useMemo(() => {
    return [...games]
      .filter((game) => {
        // Recherche par nom, éditeur ou catégorie
        const searchText = normalizeText(search);

        const matchesSearch =
          !searchText ||
          normalizeText(game.nom).includes(searchText) ||
          normalizeText(game.editeur).includes(searchText) ||
          normalizeText(game.categories).includes(searchText);

        if (!matchesSearch) return false;

        // Filtre par catégorie
        const gameCategories = normalizeText(game.categories)
          .split(/[,;|]/)
          .map((value) => value.trim())
          .filter(Boolean);

        if (category && !gameCategories.includes(category)) {
          return false;
        }

        // Nombre minimum de joueurs souhaité
        if (minPlayers) {
          const value = Number(minPlayers);

          if (game.nombre_max === null || game.nombre_max < value) {
            return false;
          }
        }

        // Nombre maximum de joueurs souhaité
        if (maxPlayers) {
          const value = Number(maxPlayers);

          if (game.nombre_min === null || game.nombre_min > value) {
            return false;
          }
        }

        // Âge maximum
        if (maxAge) {
          const value = Number(maxAge);

          if (game.age === null || game.age > value) {
            return false;
          }
        }

        // Durée maximum
        if (maxDuration) {
          const match = String(game.duree || "").match(/\d+/);

          if (!match || Number(match[0]) > Number(maxDuration)) {
            return false;
          }
        }

        // Disponibilité
        if (availability) {
          const dispo = normalizeText(game.disponibilite);

          const available = [
            "dispo",
            "disponible",
            "oui",
            "yes",
            "true",
          ].includes(dispo);

          if (availability === "dispo" && !available) {
            return false;
          }

          if (availability === "indisponible" && available) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) =>
        a.nom.localeCompare(b.nom, "fr", {
          sensitivity: "base",
        })
      );
  }, [
    games,
    search,
    category,
    minPlayers,
    maxPlayers,
    maxAge,
    maxDuration,
    availability,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setMinPlayers("");
    setMaxPlayers("");
    setMaxAge("");
    setMaxDuration("");
    setAvailability("");
  }

  function isAvailable(game: Game) {
    return [
      "dispo",
      "disponible",
      "oui",
      "yes",
      "true",
    ].includes(normalizeText(game.disponibilite));
  }

  function formatPrice(price: number | null) {
    if (price === null || price === undefined || price === "") {
      return "Prix non renseigné";
    }

    return Number(price).toFixed(2).replace(".", ",") + " €";
  }

  return (
    <div>
      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="🔎 Rechercher un jeu, un éditeur..."
          className="w-full rounded-2xl border-2 border-gray-300 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#E8B223]"
        />
      </div>

      {/* Filtres */}
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-black text-gray-900">
            🎯 Trouve ton jeu idéal
          </h2>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl bg-gray-200 px-5 py-3 font-bold text-gray-800 transition hover:bg-gray-300"
          >
            🔄 Réinitialiser
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-3 block font-bold text-gray-800">
            🎲 Choisir une catégorie
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("")}
              aria-pressed={category === ""}
              className={`rounded-full border-2 px-4 py-2 font-bold transition ${
                category === ""
                  ? "border-[#E8B223] bg-[#E8B223] text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#E8B223]"
              }`}
            >
              🎲 Tous les jeux
            </button>

            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                aria-pressed={category === item.value}
                className={`rounded-full border-2 px-4 py-2 font-bold transition ${
                  category === item.value
                    ? "border-[#E8B223] bg-[#E8B223] text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#E8B223]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Joueurs minimum */}
          <div>
            <label className="mb-2 block font-bold text-gray-800">
              👥 Nombre minimum de joueurs
            </label>
            <select
              value={minPlayers}
              onChange={(event) => setMinPlayers(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >
              <option value="">Tous</option>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>{n} joueur{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          {/* Joueurs maximum */}
          <div>
            <label className="mb-2 block font-bold text-gray-800">
              👥 Nombre maximum de joueurs
            </label>
            <select
              value={maxPlayers}
              onChange={(event) => setMaxPlayers(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >
              <option value="">Tous</option>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (
                <option key={n} value={n}>{n} joueur{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          {/* Âge */}
          <div>
            <label className="mb-2 block font-bold text-gray-800">
              🎂 Âge minimum du jeu
            </label>
            <select
              value={maxAge}
              onChange={(event) => setMaxAge(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >
              <option value="">Tous les âges</option>
              {[3, 4, 6, 8, 10, 12, 14, 16, 18].map((n) => (
                <option key={n} value={n}>{n} ans et plus</option>
              ))}
            </select>
          </div>

          {/* Durée */}
          <div>
            <label className="mb-2 block font-bold text-gray-800">
              ⏱️ Durée maximum
            </label>
            <select
              value={maxDuration}
              onChange={(event) => setMaxDuration(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >
              <option value="">Toutes les durées</option>
              {[
                ["15", "15 minutes"],
                ["30", "30 minutes"],
                ["45", "45 minutes"],
                ["60", "1 heure"],
                ["90", "1 h 30"],
                ["120", "2 heures"],
                ["180", "3 heures"],
              ].map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Disponibilité */}
          <div>
            <label className="mb-2 block font-bold text-gray-800">
              📦 Disponibilité
            </label>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >
              <option value="">Tous les jeux</option>
              <option value="dispo">Disponibles uniquement</option>
              <option value="indisponible">Indisponibles uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nombre de résultats */}
      <p className="mb-6 text-lg text-gray-800">
        <strong>{filteredGames.length}</strong>{" "}
        jeu{filteredGames.length > 1 ? "x" : ""} trouvé
        {filteredGames.length > 1 ? "s" : ""}
      </p>

      {/* Aucun résultat */}
      {filteredGames.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
          <div className="text-6xl">🎲</div>
          <h2 className="mt-4 text-2xl font-black">
            Aucun jeu trouvé
          </h2>
          <p className="mt-2 text-gray-600">
            Essaie de modifier ta recherche ou tes filtres.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Cartes des jeux */}
      {filteredGames.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredGames.map((game, index) => {
            const available = isAvailable(game);
            const gameId = String(game.code_barre || game.nom || index);

            const gameCategories = normalizeText(game.categories)
              .split(/[,;|]/)
              .map((value) => value.trim())
              .filter(Boolean);

            return (
              <article
                key={`${gameId}-${index}`}
                className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-40 items-center justify-center bg-[#FFF8E8]">
                  <div className="text-7xl">🎲</div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    {game.nom}
                  </h2>

                  {gameCategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {gameCategories.map((value) => {
                        const item = CATEGORIES.find(
                          (cat) => cat.value === value
                        );

                        return (
                          <span
                            key={value}
                            className="rounded-full bg-[#FFF1C2] px-3 py-1 text-sm font-bold text-gray-800"
                          >
                            {item?.label || value}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-3 text-gray-700">
                    <strong>Éditeur :</strong>{" "}
                    {game.editeur || "Non renseigné"}
                  </p>

                  <div className="mt-3 space-y-1 text-gray-700">
                    <p>
                      👥 {game.nombre_min ?? "?"}
                      {game.nombre_max !== null
                        ? ` à ${game.nombre_max}`
                        : "+"} joueurs
                    </p>
                    <p>
                      🎂 {game.age !== null
                        ? `${game.age}+`
                        : "Âge non renseigné"}
                    </p>
                    <p>
                      ⏱️ {game.duree || "Durée non renseignée"}
                    </p>
                  </div>

                  {game.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {game.description}
                    </p>
                  )}

                  <div className="mt-5">
                    <p className="text-2xl font-black text-[#B8860B]">
                      {formatPrice(game.prix_location)}
                    </p>
                    {game.prix_caution !== null && (
                      <p className="mt-1 text-sm text-gray-600">
                        Caution : {formatPrice(game.prix_caution)}
                      </p>
                    )}
                  </div>

                  <div
                    className={`mt-5 rounded-xl px-4 py-3 text-center font-bold ${
                      available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {available ? "🟢 Disponible" : "🔴 Indisponible"}
                  </div>

                  <Link
                    href={`/catalogue/${encodeURIComponent(gameId)}`}
                    className="mt-5 block rounded-xl bg-black px-5 py-4 text-center font-bold text-white transition hover:bg-gray-800"
                  >
                    Voir le jeu
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
