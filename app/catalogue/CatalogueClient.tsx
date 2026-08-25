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
};

type Props = {
  games: Game[];
};

export default function CatalogueClient({
  games,
}: Props) {
  const [search, setSearch] = useState("");

  const [minPlayers, setMinPlayers] =
    useState("");

  const [maxPlayers, setMaxPlayers] =
    useState("");

  const [maxAge, setMaxAge] =
    useState("");

  const [maxDuration, setMaxDuration] =
    useState("");

  const [availability, setAvailability] =
    useState("");

  /* =========================================================
     NETTOYAGE RECHERCHE
  ========================================================= */

  const searchText =
    search.trim().toLowerCase();

  /* =========================================================
     FILTRAGE
  ========================================================= */

  const filteredGames = useMemo(() => {
    return games.filter((game) => {

      /* -------------------------------------------------------
         RECHERCHE
      ------------------------------------------------------- */

      const matchesSearch =
        !searchText ||
        game.nom
          .toLowerCase()
          .includes(searchText) ||
        game.editeur
          .toLowerCase()
          .includes(searchText);

      if (!matchesSearch) {
        return false;
      }

      /* -------------------------------------------------------
         JOUEURS MINIMUM
      ------------------------------------------------------- */

      if (minPlayers) {
        const value =
          Number(minPlayers);

        if (
          game.nombre_max !== null &&
          game.nombre_max < value
        ) {
          return false;
        }

        if (
          game.nombre_max === null
        ) {
          return false;
        }
      }

      /* -------------------------------------------------------
         JOUEURS MAXIMUM
      ------------------------------------------------------- */

      if (maxPlayers) {
        const value =
          Number(maxPlayers);

        if (
          game.nombre_min !== null &&
          game.nombre_min > value
        ) {
          return false;
        }

        if (
          game.nombre_min === null
        ) {
          return false;
        }
      }

      /* -------------------------------------------------------
         ÂGE MAXIMUM
      ------------------------------------------------------- */

      if (maxAge) {
        const value =
          Number(maxAge);

        if (
          game.age !== null &&
          game.age > value
        ) {
          return false;
        }

        if (game.age === null) {
          return false;
        }
      }

      /* -------------------------------------------------------
         DURÉE MAXIMUM
      ------------------------------------------------------- */

      if (maxDuration) {
        const limit =
          Number(maxDuration);

        const durationText =
          String(
            game.duree || ""
          ).toLowerCase();

        const match =
          durationText.match(
            /\d+/
          );

        if (!match) {
          return false;
        }

        const duration =
          Number(match[0]);

        if (duration > limit) {
          return false;
        }
      }

      /* -------------------------------------------------------
         DISPONIBILITÉ
      ------------------------------------------------------- */

      if (availability) {

        const dispo =
          String(
            game.disponibilite || ""
          )
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            );

        if (
          availability === "dispo" &&
          dispo !== "dispo" &&
          dispo !== "disponible" &&
          dispo !== "oui" &&
          dispo !== "true"
        ) {
          return false;
        }

        if (
          availability ===
            "indisponible" &&
          dispo !== "indispo" &&
          dispo !== "indisponible" &&
          dispo !== "non" &&
          dispo !== "false"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    games,
    searchText,
    minPlayers,
    maxPlayers,
    maxAge,
    maxDuration,
    availability,
  ]);

  /* =========================================================
     RÉINITIALISER
  ========================================================= */

  function resetFilters() {
    setSearch("");
    setMinPlayers("");
    setMaxPlayers("");
    setMaxAge("");
    setMaxDuration("");
    setAvailability("");
  }

  /* =========================================================
     DISPONIBILITÉ
  ========================================================= */

  function isAvailable(
    game: Game
  ) {
    const value =
      String(
        game.disponibilite || ""
      )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    return (
      value === "dispo" ||
      value === "disponible" ||
      value === "oui" ||
      value === "true"
    );
  }

  /* =========================================================
     PRIX
  ========================================================= */

  function formatPrice(
    price: number | null
  ) {
    if (
      price === null ||
      price === undefined
    ) {
      return "Prix non renseigné";
    }

    return (
      Number(price)
        .toFixed(2)
        .replace(".", ",") +
      " €"
    );
  }

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <div>

      {/* =====================================================
          RECHERCHE
      ===================================================== */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="🔎 Rechercher un jeu ou un éditeur..."
          className="w-full rounded-2xl border-2 border-gray-300 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#E8B223]"
        />

      </div>

      {/* =====================================================
          FILTRES
      ===================================================== */}

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg md:p-8">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <h2 className="text-2xl font-black text-gray-900">
            🎯 Filtres
          </h2>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl bg-gray-200 px-5 py-3 font-bold text-gray-800 transition hover:bg-gray-300"
          >
            🔄 Réinitialiser
          </button>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* JOUEURS MINIMUM */}

          <div>

            <label className="mb-2 block font-bold text-gray-800">
              👥 Joueurs minimum
            </label>

            <select
              value={minPlayers}
              onChange={(event) =>
                setMinPlayers(
                  event.target.value
                )
              }
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous
              </option>

              <option value="1">
                1 joueur
              </option>

              <option value="2">
                2 joueurs
              </option>

              <option value="3">
                3 joueurs
              </option>

              <option value="4">
                4 joueurs
              </option>

              <option value="5">
                5 joueurs
              </option>

              <option value="6">
                6 joueurs
              </option>

              <option value="8">
                8 joueurs
              </option>

              <option value="10">
                10 joueurs
              </option>

            </select>

          </div>

          {/* JOUEURS MAXIMUM */}

          <div>

            <label className="mb-2 block font-bold text-gray-800">
              👥 Joueurs maximum
            </label>

            <select
              value={maxPlayers}
              onChange={(event) =>
                setMaxPlayers(
                  event.target.value
                )
              }
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous
              </option>

              <option value="2">
                2 joueurs
              </option>

              <option value="3">
                3 joueurs
              </option>

              <option value="4">
                4 joueurs
              </option>

              <option value="5">
                5 joueurs
              </option>

              <option value="6">
                6 joueurs
              </option>

              <option value="8">
                8 joueurs
              </option>

              <option value="10">
                10 joueurs
              </option>

            </select>

          </div>

          {/* ÂGE */}

          <div>

            <label className="mb-2 block font-bold text-gray-800">
              🎂 Âge maximum
            </label>

            <select
              value={maxAge}
              onChange={(event) =>
                setMaxAge(
                  event.target.value
                )
              }
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous les âges
              </option>

              <option value="6">
                6 ans
              </option>

              <option value="8">
                8 ans
              </option>

              <option value="10">
                10 ans
              </option>

              <option value="12">
                12 ans
              </option>

              <option value="14">
                14 ans
              </option>

              <option value="16">
                16 ans
              </option>

              <option value="18">
                18 ans
              </option>

            </select>

          </div>

          {/* DURÉE */}

          <div>

            <label className="mb-2 block font-bold text-gray-800">
              ⏱️ Durée maximum
            </label>

            <select
              value={maxDuration}
              onChange={(event) =>
                setMaxDuration(
                  event.target.value
                )
              }
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Toutes
              </option>

              <option value="15">
                15 min
              </option>

              <option value="30">
                30 min
              </option>

              <option value="45">
                45 min
              </option>

              <option value="60">
                1 heure
              </option>

              <option value="90">
                1h30
              </option>

              <option value="120">
                2 heures
              </option>

              <option value="180">
                3 heures
              </option>

            </select>

          </div>

          {/* DISPONIBILITÉ */}

          <div>

            <label className="mb-2 block font-bold text-gray-800">
              📦 Disponibilité
            </label>

            <select
              value={availability}
              onChange={(event) =>
                setAvailability(
                  event.target.value
                )
              }
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous les jeux
              </option>

              <option value="dispo">
                Disponibles uniquement
              </option>

              <option value="indisponible">
                Indisponibles uniquement
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          COMPTEUR
      ===================================================== */}

      <p className="mb-6 text-lg text-gray-800">
        <strong>
          {filteredGames.length}
        </strong>{" "}
        jeu
        {filteredGames.length > 1
          ? "x"
          : ""}{" "}
        trouvé
        {filteredGames.length > 1
          ? "s"
          : ""}
      </p>

      {/* =====================================================
          AUCUN RÉSULTAT
      ===================================================== */}

      {filteredGames.length ===
        0 && (

        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="text-6xl">
            🎲
          </div>

          <h2 className="mt-4 text-2xl font-black">
            Aucun jeu trouvé
          </h2>

          <p className="mt-2 text-gray-600">
            Essayez de modifier votre recherche
            ou vos filtres.
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

      {/* =====================================================
          JEUX
      ===================================================== */}

      {filteredGames.length >
        0 && (

        <div className="grid gap-6 md:grid-cols-2">

          {filteredGames.map(
            (game, index) => {

              const available =
                isAvailable(game);

              const gameId =
                String(
                  game.code_barre ||
                    game.nom ||
                    index
                );

              return (
                <article
                  key={`${gameId}-${index}`}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* IMAGE */}

                  <div className="flex h-48 items-center justify-center bg-gray-100">

                    <div className="text-7xl">
                      🎲
                    </div>

                  </div>

                  {/* CONTENU */}

                  <div className="p-6">

                    <h2 className="text-2xl font-black text-gray-900">
                      {game.nom}
                    </h2>

                    <p className="mt-3 text-gray-700">

                      <strong>
                        Éditeur :
                      </strong>{" "}

                      {game.editeur ||
                        "Non renseigné"}

                    </p>

                    <div className="mt-3 space-y-1 text-gray-700">

                      <p>
                        👥{" "}
                        {game.nombre_min ??
                          "?"}
                        {game.nombre_max
                          ? ` à ${game.nombre_max}`
                          : "+"}{" "}
                        joueurs
                      </p>

                      <p>
                        🎂{" "}
                        {game.age !== null
                          ? `${game.age}+`
                          : "Âge non renseigné"}
                      </p>

                      <p>
                        ⏱️{" "}
                        {game.duree ||
                          "Durée non renseignée"}
                      </p>

                    </div>

                    {/* PRIX */}

                    <div className="mt-5">

                      <p className="text-2xl font-black text-[#E8B223]">
                        {formatPrice(
                          game.prix_location
                        )}
                      </p>

                    </div>

                    {/* DISPONIBILITÉ */}

                    <div
                      className={`mt-5 rounded-xl px-4 py-3 text-center font-bold ${
                        available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >

                      {available
                        ? "🟢 dispo"
                        : "🔴 indisponible"}

                    </div>

                    {/* BOUTON */}

                    <Link
                      href={`/catalogue/${encodeURIComponent(
                        gameId
                      )}`}
                      className="mt-5 block rounded-xl bg-black px-5 py-4 text-center font-bold text-white transition hover:bg-gray-800"
                    >
                      Voir le jeu
                    </Link>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}