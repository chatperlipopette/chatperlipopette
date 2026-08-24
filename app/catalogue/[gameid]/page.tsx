import { getGames } from "../../../lib/games";
import Link from "next/link";

type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeGameId(
  value: unknown
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(
      /[^a-z0-9 ]/g,
      ""
    );
}

/* =========================================================
   PAGE
========================================================= */

export default async function GamePage({
  params,
}: Props) {

  const { gameid } =
    await params;

  const games =
    await getGames();

  const decodedId =
    decodeURIComponent(gameid);

  const normalizedDecodedId =
    normalizeGameId(
      decodedId
    );

  /* =======================================================
     RECHERCHE DU JEU
  ======================================================= */

  const game =
    games.find(
      (item) => {

        const codeBarre =
          normalizeGameId(
            item.code_barre
          );

        const nom =
          normalizeGameId(
            item.nom
          );

        return (
          codeBarre ===
            normalizedDecodedId ||
          nom ===
            normalizedDecodedId
        );
      }
    );

  /* =======================================================
     JEU INTROUVABLE
  ======================================================= */

  if (!game) {

    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">

        <div className="mx-auto max-w-4xl">

          <Link
            href="/catalogue"
            className="mb-6 inline-block font-bold text-gray-700 hover:underline"
          >
            ← Retour au catalogue
          </Link>

          <div className="rounded-2xl bg-white p-10 text-center shadow-lg">

            <div className="text-6xl">
              🎲
            </div>

            <h1 className="mt-4 text-3xl font-bold">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Ce jeu n'a pas été trouvé dans le catalogue.
            </p>

            <p className="mt-4 break-all text-sm text-gray-400">
              Référence recherchée :
              {" "}
              {decodedId}
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* =========================================================
     DISPONIBILITÉ
  ========================================================= */

  const disponibilite =
    String(
      game.disponibilite ??
      ""
    )
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "");

  const disponible =
    disponibilite === "dispo" ||
    disponibilite === "disponible" ||
    disponibilite === "oui" ||
    disponibilite === "true";

  /* =========================================================
     PRIX
  ========================================================= */

  const prixLocation =
    game.prix_location !==
      null &&
    game.prix_location !==
      undefined &&
    game.prix_location !== ""
      ? `${Number(
          game.prix_location
        )
          .toFixed(2)
          .replace(".", ",")} €`
      : "Prix non renseigné";

  const prixCaution =
    game.prix_caution !==
      null &&
    game.prix_caution !==
      undefined &&
    game.prix_caution !== ""
      ? `${Number(
          game.prix_caution
        )
          .toFixed(2)
          .replace(".", ",")} €`
      : "Caution non renseignée";

  /* =========================================================
     JOUEURS
  ========================================================= */

  const nombreMin =
    game.nombre_min !==
      null &&
    game.nombre_min !==
      undefined
      ? String(
          game.nombre_min
        )
      : null;

  const nombreMax =
    game.nombre_max !==
      null &&
    game.nombre_max !==
      undefined
      ? String(
          game.nombre_max
        )
      : null;

  const nombreJoueurs =
    nombreMin
      ? nombreMax
        ? `${nombreMin} à ${nombreMax} joueurs`
        : `${nombreMin} joueurs`
      : "Nombre de joueurs non renseigné";

  /* =========================================================
     ÂGE
  ========================================================= */

  const age =
    game.age !== null &&
    game.age !== undefined &&
    game.age !== ""
      ? `${game.age}+`
      : "Âge non renseigné";

  /* =========================================================
     DURÉE
  ========================================================= */

  const duree =
    game.duree !== null &&
    game.duree !== undefined &&
    game.duree !== ""
      ? String(
          game.duree
        )
          .toLowerCase()
          .includes("min")
        ? String(
            game.duree
          )
        : `${game.duree} min`
      : "Durée non renseignée";

  /* =========================================================
     IDENTIFIANT
  ========================================================= */

  const gameIdentifier =
    String(
      game.code_barre ||
      game.nom ||
      ""
    ).trim();

  /* =========================================================
     IMAGE
  ========================================================= */

  const image =
    (game as any).image_url ||
    (game as any).image ||
    null;

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">

      <div className="mx-auto max-w-5xl">

        {/* RETOUR */}

        <Link
          href="/catalogue"
          className="mb-6 inline-block font-bold text-gray-700 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* IMAGE */}

          <div className="flex min-h-[300px] items-center justify-center bg-gray-100 p-6">

            {image ? (

              <img
                src={image}
                alt={
                  game.nom ||
                  "Image du jeu"
                }
                className="max-h-[400px] w-full object-contain"
              />

            ) : (

              <div className="text-center text-gray-400">

                <div className="text-8xl">
                  🎲
                </div>

                <p className="mt-3">
                  Image bientôt disponible
                </p>

              </div>

            )}

          </div>

          <div className="p-6 md:p-10">

            {/* NOM */}

            <h1 className="text-4xl font-black text-gray-900 md:text-5xl">
              {game.nom ||
                "Jeu sans nom"}
            </h1>

            {/* ÉDITEUR */}

            <p className="mt-3 text-lg text-gray-600">

              Éditeur :

              {" "}

              <strong className="text-gray-900">
                {game.editeur ||
                  "Non renseigné"}
              </strong>

            </p>

            {/* DESCRIPTION */}

            <div className="mt-8">

              <h2 className="text-2xl font-bold text-gray-900">
                📖 Description
              </h2>

              {game.description &&
              game.description.trim() !== "" ? (

                <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-gray-700">
                  {game.description}
                </p>

              ) : (

                <p className="mt-3 text-gray-500">
                  Description non renseignée.
                </p>

              )}

            </div>

            {/* INFORMATIONS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm font-semibold text-gray-500">
                  Nombre de joueurs
                </p>

                <p className="mt-1 text-lg font-bold">
                  👥 {nombreJoueurs}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm font-semibold text-gray-500">
                  Âge minimum
                </p>

                <p className="mt-1 text-lg font-bold">
                  🎂 {age}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm font-semibold text-gray-500">
                  Durée
                </p>

                <p className="mt-1 text-lg font-bold">
                  ⏱️ {duree}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm font-semibold text-gray-500">
                  Référence
                </p>

                <p className="mt-1 text-lg font-bold break-all">
                  {game.code_barre ||
                    "Pas de code-barres"}
                </p>

              </div>

            </div>

            {/* LOCATION */}

            <div className="mt-8 rounded-2xl bg-[#FFF8E8] p-6">

              <h2 className="text-2xl font-bold">
                💰 Location
              </h2>

              <p className="mt-4 text-4xl font-black text-[#E8B223]">
                {prixLocation}
              </p>

              <p className="mt-2 text-lg text-gray-700">

                🔐 Caution :

                {" "}

                <strong>
                  {prixCaution}
                </strong>

              </p>

            </div>

            {/* DISPONIBILITÉ */}

            <div
              className={`mt-6 rounded-xl p-4 text-center text-lg font-bold ${
                disponible
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >

              {disponible
                ? "🟢 Ce jeu est disponible"
                : "🔴 Ce jeu est actuellement indisponible"}

            </div>

            {/* RÉSERVATION */}

            {disponible &&
              gameIdentifier && (

                <Link
                  href={`/reservation?gameid=${encodeURIComponent(
                    gameIdentifier
                  )}`}
                  className="mt-6 block w-full rounded-xl bg-black py-4 text-center text-lg font-bold text-white transition hover:scale-[1.01] hover:bg-gray-800"
                >
                  📅 Réserver ce jeu
                </Link>

              )}

            {!disponible && (

              <div className="mt-6 rounded-xl bg-gray-100 p-4 text-center font-semibold text-gray-500">
                Ce jeu ne peut pas être réservé actuellement.
              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}