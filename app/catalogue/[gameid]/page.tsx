import { getGames } from "../../../lib/games";
import Link from "next/link";

type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

/* =========================================================
   NORMALISATION DE L'IDENTIFIANT
========================================================= */

function normalizeGameId(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/* =========================================================
   PAGE
========================================================= */

export default async function GamePage({ params }: Props) {
  const resolvedParams = await params;

  const gameid = resolvedParams?.gameid ?? "";

  const decodedGameId = decodeURIComponent(gameid).trim();

  console.log(
    "Identifiant reçu :",
    decodedGameId
  );

  /* =========================================================
     RÉCUPÉRATION DES JEUX
  ========================================================= */

  const games = await getGames();

  /* =========================================================
     RECHERCHE DU JEU
  ========================================================= */

  const normalizedId =
    normalizeGameId(decodedGameId);

  const game = games.find((item) => {
    const codeBarre =
      normalizeGameId(item.code_barre);

    const nom =
      normalizeGameId(item.nom);

    return (
      codeBarre === normalizedId ||
      nom === normalizedId
    );
  });

  console.log(
    "Jeu trouvé :",
    game?.nom
  );

  /* =========================================================
     JEU INTROUVABLE
  ========================================================= */

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

          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">

            <div className="text-7xl">
              🎲
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Impossible de trouver ce jeu.
            </p>

            <div className="mt-6 rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
              Identifiant reçu :
              <br />

              <strong className="break-all">
                {decodedGameId || "aucun"}
              </strong>
            </div>

            <Link
              href="/catalogue"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white hover:bg-gray-800"
            >
              Voir le catalogue
            </Link>

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
        game.disponible ??
        ""
    )
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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
      ? `${Number(game.prix_location)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Prix non renseigné";

  /* =========================================================
     PRIX CAUTION
  ========================================================= */

  const prixCaution =
    game.prix_caution !== null &&
    game.prix_caution !== undefined
      ? `${Number(game.prix_caution)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Caution non renseignée";

  /* =========================================================
     JOUEURS
  ========================================================= */

  const nombreMin =
    game.nombre_min !== null &&
    game.nombre_min !== undefined
      ? String(game.nombre_min)
      : "";

  const nombreMax =
    game.nombre_max !== null &&
    game.nombre_max !== undefined
      ? String(game.nombre_max)
      : "";

  let nombreJoueurs =
    "Nombre de joueurs non renseigné";

  if (nombreMin && nombreMax) {
    nombreJoueurs =
      `${nombreMin} à ${nombreMax} joueurs`;
  } else if (nombreMin) {
    nombreJoueurs =
      `${nombreMin} joueurs minimum`;
  } else if (nombreMax) {
    nombreJoueurs =
      `${nombreMax} joueurs maximum`;
  }

  /* =========================================================
     ÂGE
  ========================================================= */

  const age =
    game.age !== null &&
    game.age !== undefined
      ? `${game.age}+`
      : "Âge non renseigné";

  /* =========================================================
     DURÉE
  ========================================================= */

  let duree =
    "Durée non renseignée";

  if (
    game.duree !== null &&
    game.duree !== undefined
  ) {
    const dureeString =
      String(game.duree).trim();

    if (dureeString) {
      duree =
        dureeString
          .toLowerCase()
          .includes("min")
          ? dureeString
          : `${dureeString} min`;
    }
  }

  /* =========================================================
     CODE BARRE
  ========================================================= */

  const codeBarre =
    String(
      game.code_barre ?? ""
    ).trim();

  /* =========================================================
     NOM
  ========================================================= */

  const nom =
    String(
      game.nom ?? "Jeu sans nom"
    ).trim();

  /* =========================================================
     ÉDITEUR
  ========================================================= */

  const editeur =
    String(
      game.editeur ?? ""
    ).trim();

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-4 py-6 md:px-8 md:py-10">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            RETOUR
        ================================================= */}

        <Link
          href="/catalogue"
          className="mb-6 inline-flex items-center gap-2 font-bold text-gray-700 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        {/* =================================================
            CARTE PRINCIPALE
        ================================================= */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* =================================================
              EN-TÊTE
          ================================================= */}

          <div className="bg-black px-6 py-8 text-white md:px-10">

            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Chat'Perlipopette
            </p>

            <h1 className="mt-2 break-words text-3xl font-black md:text-5xl">
              {nom}
            </h1>

            {editeur && (
              <p className="mt-3 text-lg text-gray-300">
                {editeur}
              </p>
            )}

          </div>

          {/* =================================================
              CONTENU
          ================================================= */}

          <div className="p-5 md:p-10">

            {/* =================================================
                DISPONIBILITÉ
            ================================================= */}

            <div
              className={
                disponible
                  ? "rounded-2xl bg-green-100 p-5 text-center text-green-800"
                  : "rounded-2xl bg-red-100 p-5 text-center text-red-800"
              }
            >

              <p className="text-xl font-black">

                {disponible
                  ? "🟢 Jeu disponible"
                  : "🔴 Jeu actuellement indisponible"}

              </p>

              <p className="mt-1 text-sm">
                {disponible
                  ? "Vous pouvez faire une demande de réservation."
                  : "Ce jeu ne peut pas être réservé pour le moment."}
              </p>

            </div>

            {/* =================================================
                INFORMATIONS
            ================================================= */}

            <div className="mt-8">

              <h2 className="text-2xl font-black">
                🎲 Informations sur le jeu
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* JOUEURS */}

                <div className="rounded-2xl bg-[#FFF8E8] p-5">

                  <p className="text-sm font-semibold text-gray-500">
                    👥 Joueurs
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {nombreJoueurs}
                  </p>

                </div>

                {/* ÂGE */}

                <div className="rounded-2xl bg-[#FFF8E8] p-5">

                  <p className="text-sm font-semibold text-gray-500">
                    🎂 Âge
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {age}
                  </p>

                </div>

                {/* DURÉE */}

                <div className="rounded-2xl bg-[#FFF8E8] p-5">

                  <p className="text-sm font-semibold text-gray-500">
                    ⏱️ Durée
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {duree}
                  </p>

                </div>

                {/* ÉDITEUR */}

                <div className="rounded-2xl bg-[#FFF8E8] p-5">

                  <p className="text-sm font-semibold text-gray-500">
                    🏢 Éditeur
                  </p>

                  <p className="mt-1 break-words text-lg font-black">
                    {editeur || "Non renseigné"}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                TARIFS
            ================================================= */}

            <div className="mt-8">

              <h2 className="text-2xl font-black">
                💰 Tarifs
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* LOCATION */}

                <div className="rounded-2xl border-2 border-[#E8B223] bg-[#FFF8E8] p-6">

                  <p className="text-sm font-semibold text-gray-600">
                    Prix de location
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#E8B223]">
                    {prixLocation}
                  </p>

                </div>

                {/* CAUTION */}

                <div className="rounded-2xl bg-gray-100 p-6">

                  <p className="text-sm font-semibold text-gray-600">
                    Caution
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {prixCaution}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                RÉSERVATION
            ================================================= */}

            <div className="mt-10">

              {disponible ? (

                <Link
                  href={`/reservation?gameid=${encodeURIComponent(
                    codeBarre || nom
                  )}`}
                  className="block w-full rounded-2xl bg-black px-6 py-5 text-center text-xl font-black text-white transition hover:bg-gray-800"
                >
                  📅 Réserver ce jeu
                </Link>

              ) : (

                <div className="rounded-2xl bg-gray-200 px-6 py-5 text-center text-lg font-bold text-gray-500">
                  Réservation momentanément indisponible
                </div>

              )}

            </div>

            {/* =================================================
                CODE BARRE
            ================================================= */}

            {codeBarre && (

              <div className="mt-8 border-t pt-6 text-center">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Code-barres
                </p>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {codeBarre}
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}
