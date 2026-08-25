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

  const jeu = games.find((item) => {
    const codeBarre = String(
      (item as any).code_barre ?? ""
    ).trim();

    return codeBarre === code;
  });

  /* =====================================================
     JEU INTROUVABLE
  ===================================================== */

  if (!jeu) {
    return (
      <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10">
        <div className="mx-auto max-w-4xl">

          <Link
            href="/catalogue"
            className="inline-block py-3 font-bold text-gray-700"
          >
            ← Retour au catalogue
          </Link>

          <div className="mt-4 rounded-3xl bg-white p-8 text-center shadow-xl">

            <div className="text-5xl">
              🎲
            </div>

            <h1 className="mt-4 text-2xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Impossible de trouver ce jeu dans le catalogue.
            </p>

          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     DONNÉES
  ===================================================== */

  const nom =
    String((jeu as any).nom ?? "Jeu sans nom").trim();

  const editeur =
    String(
      (jeu as any).editeur ?? "Non renseigné"
    ).trim();

  const codeBarre =
    String(
      (jeu as any).code_barre ?? ""
    ).trim();

  /* =====================================================
     DISPONIBILITÉ
  ===================================================== */

  const disponibilite = String(
    (jeu as any).disponibilite ??
      (jeu as any).disponible ??
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
    (jeu as any).nombre_min !== null &&
    (jeu as any).nombre_min !== undefined &&
    String((jeu as any).nombre_min).trim() !== ""
      ? String((jeu as any).nombre_min)
      : "";

  const nombreMax =
    (jeu as any).nombre_max !== null &&
    (jeu as any).nombre_max !== undefined &&
    String((jeu as any).nombre_max).trim() !== ""
      ? String((jeu as any).nombre_max)
      : "";

  let joueurs = "Non renseigné";

  if (nombreMin && nombreMax) {
    joueurs = `${nombreMin} à ${nombreMax} joueurs`;
  } else if (nombreMin) {
    joueurs = `${nombreMin} joueurs minimum`;
  } else if (nombreMax) {
    joueurs = `${nombreMax} joueurs maximum`;
  }

  /* =====================================================
     ÂGE
  ===================================================== */

  const age =
    (jeu as any).age !== null &&
    (jeu as any).age !== undefined &&
    String((jeu as any).age).trim() !== ""
      ? `${String((jeu as any).age)} ans et plus`
      : "Non renseigné";

  /* =====================================================
     DURÉE
  ===================================================== */

  const duree =
    (jeu as any).duree !== null &&
    (jeu as any).duree !== undefined &&
    String((jeu as any).duree).trim() !== ""
      ? String((jeu as any).duree)
      : "Non renseignée";

  /* =====================================================
     PRIX
  ===================================================== */

  const prixLocation =
    (jeu as any).prix_location !== null &&
    (jeu as any).prix_location !== undefined &&
    String((jeu as any).prix_location).trim() !== ""
      ? `${Number((jeu as any).prix_location)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseigné";

  const prixCaution =
    (jeu as any).prix_caution !== null &&
    (jeu as any).prix_caution !== undefined &&
    String((jeu as any).prix_caution).trim() !== ""
      ? `${Number((jeu as any).prix_caution)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseignée";

  /* =====================================================
     IMAGE
  ===================================================== */

  const image =
    String(
      (jeu as any).image_url ??
        (jeu as any).image ??
        ""
    ).trim();

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  const description =
    String(
      (jeu as any).description ?? ""
    ).trim();

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-3 py-4 sm:px-5 sm:py-6 md:p-10">

      <div className="mx-auto max-w-4xl">

        {/* RETOUR */}

        <Link
          href="/catalogue"
          className="mb-4 inline-flex items-center py-2 text-base font-bold text-gray-700 hover:underline sm:mb-6 sm:text-lg"
        >
          ← Retour au catalogue
        </Link>

        {/* FICHE */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* =================================================
              EN-TÊTE
          ================================================= */}

          <div className="bg-black px-5 py-6 text-white sm:px-7 sm:py-8 md:p-10">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">
              Chat'Perlipopette
            </p>

            <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              {nom}
            </h1>

            {editeur && (
              <p className="mt-2 text-base text-gray-300 sm:text-lg">
                {editeur}
              </p>
            )}

          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-7 md:p-10">

            {/* =================================================
                IMAGE
            ================================================= */}

            {image && (
              <div className="mb-6 flex justify-center sm:mb-8">

                <img
                  src={image}
                  alt={nom}
                  className="max-h-60 w-auto max-w-full rounded-2xl object-contain sm:max-h-72 md:max-h-80"
                />

              </div>
            )}

            {/* =================================================
                DISPONIBILITÉ
            ================================================= */}

            <div
              className={
                disponible
                  ? "rounded-2xl bg-green-100 px-4 py-5 text-center text-green-700 sm:py-6"
                  : "rounded-2xl bg-red-100 px-4 py-5 text-center text-red-700 sm:py-6"
              }
            >

              <p className="text-xl font-black sm:text-2xl">
                {disponible
                  ? "🟢 Disponible"
                  : "🔴 Indisponible"}
              </p>

            </div>

            {/* =================================================
                INFORMATIONS
            ================================================= */}

            <h2 className="mt-7 text-2xl font-black sm:mt-9 sm:text-3xl">
              🎲 Informations
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">

              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-4 sm:p-5">

                <p className="text-sm text-gray-500 sm:text-base">
                  👥 Nombre de joueurs
                </p>

                <p className="mt-1 text-lg font-black sm:text-xl">
                  {joueurs}
                </p>

              </div>

              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-4 sm:p-5">

                <p className="text-sm text-gray-500 sm:text-base">
                  🎂 Âge
                </p>

                <p className="mt-1 text-lg font-black sm:text-xl">
                  {age}
                </p>

              </div>

              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-4 sm:p-5">

                <p className="text-sm text-gray-500 sm:text-base">
                  ⏱️ Durée
                </p>

                <p className="mt-1 text-lg font-black sm:text-xl">
                  {duree}
                </p>

              </div>

              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-4 sm:p-5">

                <p className="text-sm text-gray-500 sm:text-base">
                  🏢 Éditeur
                </p>

                <p className="mt-1 break-words text-lg font-black sm:text-xl">
                  {editeur}
                </p>

              </div>

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            {description && (
              <div className="mt-7 sm:mt-9">

                <h2 className="text-2xl font-black sm:text-3xl">
                  📖 Description
                </h2>

                <div className="mt-3 rounded-2xl bg-gray-50 p-5 sm:mt-4 sm:p-6">

                  <p className="whitespace-pre-line text-base leading-7 text-gray-700 sm:text-lg">
                    {description}
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                TARIFS
            ================================================= */}

            <h2 className="mt-7 text-2xl font-black sm:mt-9 sm:text-3xl">
              💰 Tarifs
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">

              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-5 sm:p-6">

                <p className="text-sm text-gray-600 sm:text-base">
                  Prix de location
                </p>

                <p className="mt-1 text-3xl font-black text-[#E8B223] sm:text-4xl">
                  {prixLocation}
                </p>

              </div>

              <div className="rounded-2xl bg-gray-100 px-5 py-5 sm:p-6">

                <p className="text-sm text-gray-600 sm:text-base">
                  Caution
                </p>

                <p className="mt-1 text-3xl font-black sm:text-4xl">
                  {prixCaution}
                </p>

              </div>

            </div>

            {/* =================================================
                RÉSERVATION
            ================================================= */}

            <div className="mt-7 sm:mt-9">

              {disponible ? (

                <Link
                  href={`/reservation?gameid=${encodeURIComponent(
                    codeBarre
                  )}`}
                  className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-black px-5 py-4 text-center text-lg font-black text-white shadow-lg transition active:scale-[0.98] hover:bg-gray-800 sm:text-xl"
                >
                  📅 Réserver ce jeu
                </Link>

              ) : (

                <div className="rounded-2xl bg-gray-200 p-5 text-center font-bold text-gray-500">
                  Ce jeu n'est pas disponible actuellement.
                </div>

              )}

            </div>

            {/* =================================================
                CODE BARRE
            ================================================= */}

            {codeBarre && (
              <p className="mt-5 break-all text-center text-xs text-gray-400 sm:text-sm">
                Code-barres : {codeBarre}
              </p>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}
