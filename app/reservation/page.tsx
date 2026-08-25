import { getGames } from "../../lib/games";
import ReservationForm from "./ReservationForm";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    gameid?: string;
  }>;
};

export default async function ReservationPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const gameid = params.gameid;

  const games = await getGames();

  /* =========================================================
     IDENTIFIANT REÇU
  ========================================================= */

  const decodedGameId = gameid
    ? decodeURIComponent(gameid).trim()
    : "";

  console.log(
    "Identifiant réservation reçu :",
    decodedGameId
  );

  /* =========================================================
     RECHERCHE DU JEU
  ========================================================= */

  const game = games.find((item) => {
    const codeBarre = String(
      item.code_barre ?? ""
    ).trim();

    const nom = String(
      item.nom ?? ""
    ).trim();

    return (
      codeBarre === decodedGameId ||
      nom === decodedGameId
    );
  });

  console.log(
    "Jeu réservation :",
    game?.nom
  );

  /* =========================================================
     JEU INTROUVABLE
  ========================================================= */

  if (!game) {
    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">
        <div className="mx-auto max-w-3xl">

          <Link
            href="/catalogue"
            className="mb-6 inline-block font-bold text-gray-700 hover:underline"
          >
            ← Retour au catalogue
          </Link>

          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">

            <div className="text-7xl">
              🎲
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Impossible de trouver le jeu demandé.
            </p>

            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
              Identifiant reçu :
              <br />

              <strong>
                {decodedGameId || "aucun"}
              </strong>
            </p>

          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     DISPONIBILITÉ
  ========================================================= */

  const disponibilite = String(
    game.disponibilite ?? ""
  )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );

  const disponible =
    disponibilite === "dispo" ||
    disponibilite === "disponible" ||
    disponibilite === "oui" ||
    disponibilite === "true";

  /* =========================================================
     PRIX LOCATION
  ========================================================= */

  const prixLocation =
    game.prix_location !== null &&
    game.prix_location !== undefined
      ? `${Number(
          game.prix_location
        )
          .toFixed(2)
          .replace(".", ",")} €`
      : "Prix non renseigné";

  /* =========================================================
     PRIX CAUTION
  ========================================================= */

  const prixCaution =
    game.prix_caution !== null &&
    game.prix_caution !== undefined
      ? `${Number(
          game.prix_caution
        )
          .toFixed(2)
          .replace(".", ",")} €`
      : "Caution non renseignée";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">

      <div className="mx-auto max-w-4xl">

        {/* =====================================================
            RETOUR
        ===================================================== */}

        <Link
          href={`/catalogue/${encodeURIComponent(
            String(
              game.code_barre ?? ""
            )
          )}`}
          className="mb-6 inline-block font-bold text-gray-700 hover:underline"
        >
          ← Retour au jeu
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* ===================================================
              EN-TÊTE
          =================================================== */}

          <div className="bg-black p-8 text-white">

            <p className="text-sm font-semibold uppercase tracking-wide text-gray-300">
              Demande de réservation
            </p>

            <h1 className="mt-2 text-4xl font-black">
              {game.nom}
            </h1>

            <p className="mt-3 text-gray-300">
              Réservez votre jeu pour la période souhaitée.
            </p>

          </div>

          <div className="p-6 md:p-10">

            {/* =================================================
                RÉCAPITULATIF
            ================================================= */}

            <div className="rounded-2xl bg-[#FFF8E8] p-6">

              <h2 className="text-xl font-bold">
                🎲 Votre réservation
              </h2>

              <div className="mt-4 space-y-2 text-gray-700">

                <p>
                  <strong>
                    Jeu :
                  </strong>{" "}
                  {game.nom}
                </p>

                <p>
                  <strong>
                    Éditeur :
                  </strong>{" "}
                  {game.editeur ||
                    "Non renseigné"}
                </p>

                <p>
                  <strong>
                    Prix de location :
                  </strong>{" "}

                  <span className="font-bold text-[#E8B223]">
                    {prixLocation}
                  </span>
                </p>

                <p>
                  <strong>
                    Caution :
                  </strong>{" "}

                  {prixCaution}
                </p>

              </div>

            </div>

            {/* =================================================
                INDISPONIBLE
            ================================================= */}

            {!disponible && (
              <div className="mt-6 rounded-xl bg-red-100 p-5 text-center font-bold text-red-700">
                🔴 Ce jeu n'est actuellement pas disponible.
              </div>
            )}

            {/* =================================================
                FORMULAIRE
            ================================================= */}

            {disponible && (
              <ReservationForm
                codeBarre={String(
                  game.code_barre ?? ""
                )}
                jeu={String(
                  game.nom ?? ""
                )}
              />
            )}

          </div>

        </div>

      </div>

    </main>
  );
}