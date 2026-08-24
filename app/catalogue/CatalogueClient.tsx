"use client";

import { useMemo, useState } from "react";

type Game = {
  id?: number | string;
  code_barre?: string | null;
  nom?: string | null;
  editeur?: string | null;

  nombre_min?: number | string | null;
  nombre_max?: number | string | null;

  joueurs_min?: number | string | null;
  joueurs_max?: number | string | null;

  duree?: string | number | null;
  age?: number | string | null;

  disponibilite?: string | boolean | null;
  disponible?: string | boolean | null;

  prix_location?: number | string | null;
  prix_caution?: number | string | null;

  description?: string | null;

  image_url?: string | null;
  image?: string | null;
};

/* =========================================================
   OUTILS
========================================================= */

function toNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text = String(value)
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number)
    ? number
    : null;
}

/* =========================================================
   PRIX
========================================================= */

function formatPrice(value: unknown): string | null {
  const number = toNumber(value);

  if (number === null) {
    return null;
  }

  return (
    number.toFixed(2).replace(".", ",") +
    " €"
  );
}

/* =========================================================
   DURÉE
========================================================= */

function formatDuree(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Durée non renseignée";
  }

  const text = String(value).trim();

  if (!text) {
    return "Durée non renseignée";
  }

  if (
    text.toLowerCase().includes("min")
  ) {
    return text;
  }

  return `${text} min`;
}

function getDuree(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = parseFloat(
    String(value)
      .replace(",", ".")
      .trim()
  );

  return Number.isFinite(number)
    ? number
    : null;
}

/* =========================================================
   DISPONIBILITÉ
========================================================= */

function isAvailable(game: Game): boolean {
  if (
    typeof game.disponible ===
    "boolean"
  ) {
    return game.disponible;
  }

  const value =
    game.disponibilite ??
    game.disponible ??
    "";

  const text = String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );

  return (
    text === "dispo" ||
    text === "disponible" ||
    text === "oui" ||
    text === "yes" ||
    text === "true"
  );
}

/* =========================================================
   JOUEURS
========================================================= */

function getNombreMin(
  game: Game
): number | null {
  return toNumber(
    game.nombre_min ??
      game.joueurs_min
  );
}

function getNombreMax(
  game: Game
): number | null {
  return toNumber(
    game.nombre_max ??
      game.joueurs_max
  );
}

/* =========================================================
   ÂGE
========================================================= */

function getAge(
  game: Game
): number | null {
  return toNumber(game.age);
}

/* =========================================================
   CATALOGUE
========================================================= */

export default function CatalogueClient({
  games,
}: {
  games: Game[];
}) {

  /* =======================================================
     RECHERCHE
  ======================================================= */

  const [search, setSearch] =
    useState("");

  /* =======================================================
     FILTRES
  ======================================================= */

  const [joueursMin, setJoueursMin] =
    useState("");

  const [joueursMax, setJoueursMax] =
    useState("");

  /*
   * ÂGE MAXIMUM
   *
   * Exemple :
   * 12 ans → jeux de 12 ans et moins
   */

  const [ageMax, setAgeMax] =
    useState("");

  const [dureeMax, setDureeMax] =
    useState("");

  const [disponibilite, setDisponibilite] =
    useState("tous");

  /* =======================================================
     FILTRAGE + TRI
  ======================================================= */

  const filteredGames =
    useMemo(() => {

      const recherche =
        search
          .trim()
          .toLowerCase();

      const minJoueurs =
        joueursMin
          ? Number(joueursMin)
          : null;

      const maxJoueurs =
        joueursMax
          ? Number(joueursMax)
          : null;

      /*
       * ÂGE MAXIMUM
       */

      const maximumAge =
        ageMax
          ? Number(ageMax)
          : null;

      const maximumDuree =
        dureeMax
          ? Number(dureeMax)
          : null;

      /* =================================================
         TRI A → Z
      ================================================= */

      const jeuxTries =
        [...games].sort(
          (a, b) => {

            const nomA =
              String(
                a.nom ?? ""
              ).trim();

            const nomB =
              String(
                b.nom ?? ""
              ).trim();

            return nomA.localeCompare(
              nomB,
              "fr",
              {
                sensitivity: "base",
                numeric: true,
              }
            );
          }
        );

      /* =================================================
         FILTRES
      ================================================= */

      return jeuxTries.filter(
        (game) => {

          /* =============================================
             RECHERCHE
          ============================================= */

          if (recherche) {

            const nom =
              String(
                game.nom ?? ""
              ).toLowerCase();

            const editeur =
              String(
                game.editeur ?? ""
              ).toLowerCase();

            if (
              !nom.includes(
                recherche
              ) &&
              !editeur.includes(
                recherche
              )
            ) {
              return false;
            }
          }

          /* =============================================
             JOUEURS MINIMUM
             
             Exemple :
             4+ → jeux pouvant accueillir
             au moins 4 joueurs.
          ============================================= */

          const nombreMin =
            getNombreMin(game);

          const nombreMax =
            getNombreMax(game);

          if (
            minJoueurs !== null &&
            nombreMax !== null &&
            nombreMax < minJoueurs
          ) {
            return false;
          }

          /* =============================================
             JOUEURS MAXIMUM
             
             Exemple :
             jusqu'à 4 → jeux dont le
             minimum ne dépasse pas 4.
          ============================================= */

          if (
            maxJoueurs !== null &&
            nombreMin !== null &&
            nombreMin > maxJoueurs
          ) {
            return false;
          }

          /* =============================================
             ÂGE MAXIMUM
             
             Exemple :
             "Jusqu'à 12 ans"
             
             Affiche :
             3 ans  ✅
             6 ans  ✅
             8 ans  ✅
             10 ans ✅
             12 ans ✅
             14 ans ❌
             16 ans ❌
             18 ans ❌
          ============================================= */

          const age =
            getAge(game);

          if (
            maximumAge !== null
          ) {

            /*
             * Si aucune information d'âge
             * n'est renseignée, on ne l'affiche
             * pas lorsqu'un filtre d'âge est actif.
             */

            if (
              age === null ||
              age > maximumAge
            ) {
              return false;
            }
          }

          /* =============================================
             DURÉE MAXIMUM
          ============================================= */

          const duree =
            getDuree(game.duree);

          if (
            maximumDuree !== null &&
            duree !== null &&
            duree > maximumDuree
          ) {
            return false;
          }

          /* =============================================
             DISPONIBILITÉ
          ============================================= */

          if (
            disponibilite ===
              "disponible" &&
            !isAvailable(game)
          ) {
            return false;
          }

          if (
            disponibilite ===
              "indisponible" &&
            isAvailable(game)
          ) {
            return false;
          }

          return true;
        }
      );

    }, [
      games,
      search,
      joueursMin,
      joueursMax,
      ageMax,
      dureeMax,
      disponibilite,
    ]);

  /* =======================================================
     RÉINITIALISATION
  ======================================================= */

  function resetFilters() {

    setSearch("");

    setJoueursMin("");

    setJoueursMax("");

    setAgeMax("");

    setDureeMax("");

    setDisponibilite("tous");
  }

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <div>

      {/* =================================================
          RECHERCHE
      ================================================= */}

      <input
        type="text"
        value={search}
        onChange={(event) =>
          setSearch(
            event.target.value
          )
        }
        placeholder="🔍 Rechercher un jeu ou un éditeur..."
        className="mb-6 w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-xl outline-none transition focus:border-[#E8B223]"
      />

      {/* =================================================
          FILTRES
      ================================================= */}

      <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h2 className="text-2xl font-bold text-gray-900">
            🎯 Filtres
          </h2>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-gray-200 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-300"
          >
            🔄 Réinitialiser
          </button>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

          {/* =================================================
              JOUEURS MINIMUM
          ================================================= */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              👥 Joueurs minimum
            </label>

            <select
              value={joueursMin}
              onChange={(event) =>
                setJoueursMin(
                  event.target.value
                )
              }
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous
              </option>

              <option value="1">
                1+
              </option>

              <option value="2">
                2+
              </option>

              <option value="3">
                3+
              </option>

              <option value="4">
                4+
              </option>

              <option value="5">
                5+
              </option>

              <option value="6">
                6+
              </option>

              <option value="8">
                8+
              </option>

              <option value="10">
                10+
              </option>

            </select>

          </div>

          {/* =================================================
              JOUEURS MAXIMUM
          ================================================= */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              👥 Joueurs maximum
            </label>

            <select
              value={joueursMax}
              onChange={(event) =>
                setJoueursMax(
                  event.target.value
                )
              }
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous
              </option>

              <option value="2">
                Jusqu'à 2
              </option>

              <option value="3">
                Jusqu'à 3
              </option>

              <option value="4">
                Jusqu'à 4
              </option>

              <option value="5">
                Jusqu'à 5
              </option>

              <option value="6">
                Jusqu'à 6
              </option>

              <option value="8">
                Jusqu'à 8
              </option>

              <option value="10">
                Jusqu'à 10
              </option>

            </select>

          </div>

          {/* =================================================
              ÂGE MAXIMUM
          ================================================= */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              🎂 Âge maximum
            </label>

            <select
              value={ageMax}
              onChange={(event) =>
                setAgeMax(
                  event.target.value
                )
              }
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Tous les âges
              </option>

              <option value="3">
                Jusqu'à 3 ans
              </option>

              <option value="6">
                Jusqu'à 6 ans
              </option>

              <option value="8">
                Jusqu'à 8 ans
              </option>

              <option value="10">
                Jusqu'à 10 ans
              </option>

              <option value="12">
                Jusqu'à 12 ans
              </option>

              <option value="14">
                Jusqu'à 14 ans
              </option>

              <option value="16">
                Jusqu'à 16 ans
              </option>

              <option value="18">
                Jusqu'à 18 ans
              </option>

            </select>

          </div>

          {/* =================================================
              DURÉE MAXIMUM
          ================================================= */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              ⏱️ Durée maximum
            </label>

            <select
              value={dureeMax}
              onChange={(event) =>
                setDureeMax(
                  event.target.value
                )
              }
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 outline-none focus:border-[#E8B223]"
            >

              <option value="">
                Toutes
              </option>

              <option value="15">
                15 min maximum
              </option>

              <option value="30">
                30 min maximum
              </option>

              <option value="45">
                45 min maximum
              </option>

              <option value="60">
                1 h maximum
              </option>

              <option value="90">
                1 h 30 maximum
              </option>

              <option value="120">
                2 h maximum
              </option>

              <option value="180">
                3 h maximum
              </option>

            </select>

          </div>

          {/* =================================================
              DISPONIBILITÉ
          ================================================= */}

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              📦 Disponibilité
            </label>

            <select
              value={disponibilite}
              onChange={(event) =>
                setDisponibilite(
                  event.target.value
                )
              }
              className="w-full rounded-lg border-2 border-gray-300 bg-white p-3 outline-none focus:border-[#E8B223]"
            >

              <option value="tous">
                Tous les jeux
              </option>

              <option value="disponible">
                🟢 Disponibles
              </option>

              <option value="indisponible">
                🔴 Indisponibles
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          NOMBRE DE RÉSULTATS
      ================================================= */}

      <div className="mb-6 text-lg text-gray-700">

        {filteredGames.length} jeu
        {filteredGames.length > 1
          ? "x"
          : ""}{" "}

        trouvé
        {filteredGames.length > 1
          ? "s"
          : ""}

      </div>

      {/* =================================================
          GRILLE DES JEUX
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {filteredGames.map(
          (game, index) => {

            const nom =
              game.nom ||
              "Nom non renseigné";

            const editeur =
              game.editeur ||
              "Non renseigné";

            const nombreMin =
              getNombreMin(game);

            const nombreMax =
              getNombreMax(game);

            const age =
              getAge(game);

            const duree =
              formatDuree(
                game.duree
              );

            const prixLocation =
              formatPrice(
                game.prix_location
              );

            const prixCaution =
              formatPrice(
                game.prix_caution
              );

            const disponible =
              isAvailable(game);

            const description =
              game.description?.trim() ||
              "";

            const uniqueKey =
              `${game.code_barre || nom}-${index}`;

            /* =================================================
               IDENTIFIANT DE LA FICHE
            ================================================= */

            const gameIdentifier =
              game.code_barre?.trim() ||
              game.nom?.trim() ||
              "";

            return (
              <div
                key={uniqueKey}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
              >

                {/* IMAGE */}

                <div className="flex h-56 items-center justify-center bg-gray-100">

                  {game.image_url ||
                  game.image ? (

                    <img
                      src={
                        game.image_url ||
                        game.image ||
                        ""
                      }
                      alt={nom}
                      className="h-full w-full object-contain"
                    />

                  ) : (

                    <div className="text-center text-gray-400">

                      <div className="text-6xl">
                        🎲
                      </div>

                      <p className="mt-2 text-sm">
                        Image bientôt disponible
                      </p>

                    </div>

                  )}

                </div>

                {/* INFORMATIONS */}

                <div className="p-6">

                  <h2 className="text-2xl font-bold leading-tight text-gray-900">
                    {nom}
                  </h2>

                  {description && (

                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      {description}
                    </p>

                  )}

                  <p className="mt-4 text-gray-700">

                    <strong>
                      Éditeur :
                    </strong>{" "}

                    {editeur}

                  </p>

                  <p className="mt-2 text-gray-700">

                    👥{" "}

                    {nombreMin !== null
                      ? nombreMin
                      : "?"}

                    {nombreMax !== null
                      ? ` à ${nombreMax}`
                      : ""}{" "}

                    joueurs

                  </p>

                  <p className="mt-1 text-gray-700">

                    🎂{" "}

                    {age !== null
                      ? `${age}+`
                      : "Âge non renseigné"}

                  </p>

                  <p className="mt-1 text-gray-700">

                    ⏱️ {duree}

                  </p>

                  {/* PRIX */}

                  <div className="mt-5">

                    <p className="text-2xl font-bold text-[#E8B223]">

                      {prixLocation ??
                        "Prix non renseigné"}

                    </p>

                    {prixCaution && (

                      <p className="mt-1 text-sm font-medium text-gray-600">

                        🔐 Caution :{" "}

                        {prixCaution}

                      </p>

                    )}

                  </div>

                  {/* DISPONIBILITÉ */}

                  <div
                    className={`mt-4 rounded-lg py-2 text-center font-bold ${
                      disponible
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >

                    {disponible
                      ? "🟢 Disponible"
                      : "🔴 Indisponible"}

                  </div>

                  {/* VOIR LE JEU */}

                  {gameIdentifier ? (

                    <a
                      href={`/catalogue/${encodeURIComponent(
                        gameIdentifier
                      )}`}
                      className="mt-5 block w-full rounded-xl bg-black py-3 text-center font-bold text-white transition hover:bg-gray-800"
                    >
                      Voir le jeu
                    </a>

                  ) : (

                    <div className="mt-5 rounded-xl bg-gray-200 py-3 text-center font-bold text-gray-500">
                      Fiche indisponible
                    </div>

                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =================================================
          AUCUN RÉSULTAT
      ================================================= */}

      {filteredGames.length === 0 && (

        <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow">

          <div className="text-6xl">
            🎲
          </div>

          <p className="mt-4 text-xl font-bold text-gray-700">
            Aucun jeu trouvé
          </p>

          <p className="mt-2 text-gray-500">
            Essaie avec un autre nom ou modifie les filtres.
          </p>

        </div>

      )}

    </div>
  );
}