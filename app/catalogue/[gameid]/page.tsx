import { getGames } from "../../../lib/games";
import Link from "next/link";

type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

export default async function GamePage({
  params,
}: Props) {
  const { gameid } = await params;

  const games = await getGames();

  const code = decodeURIComponent(gameid).trim();

  const jeu = games.find(
    (item) =>
      String(item.code_barre ?? "").trim() === code
  );

  /* =====================================================
     JEU INTROUVABLE
  ===================================================== */

  if (!jeu) {
    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6">

        <div className="mx-auto max-w-3xl">

          <Link
            href="/catalogue"
            className="font-bold text-gray-700 hover:underline"
          >
            ← Retour au catalogue
          </Link>

          <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-xl">

            <div className="text-6xl">
              🎲
            </div>

            <h1 className="mt-4 text-3xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Ce jeu n'a pas été trouvé dans le catalogue.
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     DISPONIBILITÉ
  ===================================================== */

  const disponibilite = String(
    jeu.disponibilite ??
      jeu.disponible ??
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

  /* =====================================================
     JOUEURS
  ===================================================== */

  const nombreMin =
    jeu.nombre_min !== null &&
    jeu.nombre_min !== undefined
      ? String(jeu.nombre_min)
      : "";

  const nombreMax =
    jeu.nombre_max !== null &&
    jeu.nombre_max !== undefined
      ? String(jeu.nombre_max)
      : "";

  let joueurs =
    "Non renseigné";

  if (nombreMin && nombreMax) {
    joueurs =
      `${nombreMin} à ${nombreMax} joueurs`;
  } else if (nombreMin) {
    joueurs =
      `${nombreMin} joueurs minimum`;
  } else if (nombreMax) {
    joueurs =
      `${nombreMax} joueurs maximum`;
  }

  /* =====================================================
     ÂGE
  ===================================================== */

  const age =
    jeu.age !== null &&
    jeu.age !== undefined
      ? `${jeu.age} ans et plus`
      : "Non renseigné";

  /* =====================================================
     DURÉE
  ===================================================== */

  const duree =
    jeu.duree !== null &&
    jeu.duree !== undefined &&
    String(jeu.duree).trim() !== ""
      ? String(jeu.duree)
      : "Non renseignée";

  /* =====================================================
     PRIX
  ===================================================== */

  const prixLocation =
    jeu.prix_location !== null &&
    jeu.prix_location !== undefined
      ? `${Number(jeu.prix_location)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseigné";

  const prixCaution =
    jeu.prix_caution !== null &&
    jeu.prix_caution !== undefined
      ? `${Number(jeu.prix_caution)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseignée";

  /* =====================================================
     DONNÉES PRINCIPALES
  ===================================================== */

  const nom =
    String(
      jeu.nom ?? "Jeu sans nom"
    ).trim();

  const editeur =
    String(
      jeu.editeur ?? "Non renseigné"
    ).trim();

  const codeBarre =
    String(
      jeu.code_barre ?? ""
    ).trim();

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10">

      <div className="mx-auto max-w-4xl">

        {/* RETOUR */}

        <Link
          href="/catalogue"
          className="mb-6 inline-block font-bold text-gray-700 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        {/* FICHE */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* =================================================
              EN-TÊTE
          ================================================= */}

          <div className="bg-black p-6 text-white md:p-10">

            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Chat'Perlipopette
            </p>

            <h1 className="mt-2 break-words text-3xl font-black md:text-5xl">
              {nom}
            </h1>

            <p className="mt-3 text-gray-300">
              {editeur}
            </p>

          </div>

          <div className="p-5 md:p-10">

            {/* =================================================
                DISPONIBILITÉ
            ================================================= */}

            <div
              className={
                disponible
                  ? "rounded-2xl bg-green-100 p-5 text-center text-green-700"
                  : "rounded-2xl bg-red-100 p-5 text-center text-red-700"
              }
            >

              <p className="text-xl font-black">

                {disponible
                  ? "🟢 Disponible"
                  : "🔴 Indisponible"}

              </p>

            </div>

            {/* =================================================
                INFORMATIONS
            ================================================= */}

            <h2 className="mt-8 text-2xl font-black">
              🎲 Informations
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#FFF8E8] p-5">
                <p className="text-sm text-gray-500">
                  👥 Nombre de joueurs
                </p>

                <p className="mt-1 text-lg font-black">
                  {joueurs}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFF8E8] p-5">
                <p className="text-sm text-gray-500">
                  🎂 Âge
                </p>

                <p className="mt-1 text-lg font-black">
                  {age}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFF8E8] p-5">
                <p className="text-sm text-gray-500">
                  ⏱️ Durée
                </p>

                <p className="mt-1 text-lg font-black">
                  {duree}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFF8E8] p-5">
                <p className="text-sm text-gray-500">
                  🏢 Éditeur
                </p>

                <p className="mt-1 break-words text-lg font-black">
                  {editeur}
                </p>
              </div>

            </div>

            {/* =================================================
                TARIFS
            ================================================= */}

            <h2 className="mt-8 text-2xl font-black">
              💰 Tarifs
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#FFF8E8] p-6">

                <p className="text-sm text-gray-600">
                  Prix de location
                </p>

                <p className="mt-2 text-3xl font-black text-[#E8B223]">
                  {prixLocation}
                </p>

              </div>

              <div className="rounded-2xl bg-gray-100 p-6">

                <p className="text-sm text-gray-600">
                  Caution
                </p>

                <p className="mt-2 text-3xl font-black">
                  {prixCaution}
                </p>

              </div>

            </div>

            {/* =================================================
                RÉSERVATION
            ================================================= */}

            {disponible && (

              <Link
                href={`/reservation?gameid=${encodeURIComponent(
                  codeBarre
                )}`}
                className="mt-8 block w-full rounded-2xl bg-black px-6 py-5 text-center text-xl font-black text-white hover:bg-gray-800"
              >
                📅 Réserver ce jeu
              </Link>

            )}

            {!disponible && (

              <div className="mt-8 rounded-2xl bg-gray-200 p-5 text-center font-bold text-gray-500">
                Ce jeu n'est pas disponible actuellement.
              </div>

            )}

            {/* =================================================
                CODE BARRE
            ================================================= */}

            {codeBarre && (

              <p className="mt-6 break-all text-center text-sm text-gray-400">
                Code-barres : {codeBarre}
              </p>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}
