import { getGames } from "../../../lib/games";
import Link from "next/link";

type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

function normaliser(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default async function GamePage({ params }: Props) {
  const { gameid } = await params;

  const identifiant = decodeURIComponent(gameid).trim();

  const games = await getGames();

  const jeu = games.find((item) => {
    const codeBarre = normaliser(item.code_barre);
    const nom = normaliser(item.nom);
    const recherche = normaliser(identifiant);

    return (
      codeBarre === recherche ||
      nom === recherche
    );
  });

  /* =====================================================
     JEU INTROUVABLE
  ===================================================== */

  if (!jeu) {
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

            <div className="text-6xl">
              🎲
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Impossible de trouver ce jeu.
            </p>

            <p className="mt-5 break-all rounded-xl bg-gray-100 p-4 text-sm text-gray-500">
              Identifiant :
              <br />
              <strong>
                {identifiant}
              </strong>
            </p>

          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     DISPONIBILITÉ
  ===================================================== */

  const disponibilite = normaliser(
    jeu.disponibilite ??
      jeu.disponible ??
      ""
  );

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
    "Nombre de joueurs non renseigné";

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
    jeu.age !== null &&
    jeu.age !== undefined
      ? `${jeu.age}+`
      : "Âge non renseigné";

  /* =====================================================
     DURÉE
  ===================================================== */

  let duree = "Durée non renseignée";

  if (
    jeu.duree !== null &&
    jeu.duree !== undefined
  ) {
    const valeur = String(jeu.duree).trim();

    if (valeur) {
      duree = valeur.toLowerCase().includes("min")
        ? valeur
        : `${valeur} min`;
    }
  }

  /* =====================================================
     PRIX LOCATION
  ===================================================== */

  const prixLocation =
    jeu.prix_location !== null &&
    jeu.prix_location !== undefined
      ? `${Number(jeu.prix_location)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Prix non renseigné";

  /* =====================================================
     CAUTION
  ===================================================== */

  const prixCaution =
    jeu.prix_caution !== null &&
    jeu.prix_caution !== undefined
      ? `${Number(jeu.prix_caution)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Caution non renseignée";

  /* =====================================================
     INFORMATIONS
  ===================================================== */

  const nom =
    String(jeu.nom ?? "Jeu sans nom").trim();

  const editeur =
    String(jeu.editeur ?? "").trim();

  const codeBarre =
    String(jeu.code_barre ?? "").trim();

  const image =
    String(
      jeu.image_url ??
      jeu.image ??
      ""
    ).trim();

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10">

      <div className="mx-auto max-w-5xl">

        {/* RETOUR */}

        <Link
          href="/catalogue"
          className="mb-6 inline-block font-bold text-gray-700 hover:underline"
        >
          ← Retour au catalogue
        </Link>

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

            {editeur && (
              <p className="mt-3 text-lg text-gray-300">
                {editeur}
              </p>
            )}

          </div>

          <div className="p-5 md:p-10">

            {/* =================================================
                IMAGE
            ================================================= */}

            {image && (
              <div className="mb-8 flex justify-center">

                <div className="overflow-hidden rounded-2xl bg-gray-100">

                  <img
                    src={image}
                    alt={nom}
                    className="max-h-80 w-full object-contain"
                  />

                </div>

              </div>
            )}

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
                  : "🔴 Jeu indisponible"}

              </p>

              <p className="mt-1 text-sm">
                {disponible
                  ? "Vous pouvez demander une réservation."
                  : "Ce jeu n'est pas disponible actuellement."}
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
                  {editeur || "Non renseigné"}
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

              <div className="rounded-2xl border-2 border-[#E8B223] bg-[#FFF8E8] p-6">

                <p className="text-sm font-semibold text-gray-600">
                  Prix de location
                </p>

                <p className="mt-2 text-3xl font-black text-[#E8B223]">
                  {prixLocation}
                </p>

              </div>

              <div className="rounded-2xl bg-gray-100 p-6">

                <p className="text-sm font-semibold text-gray-600">
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

                <div className="rounded-2xl bg-gray-200 px-6 py-5 text-center font-bold text-gray-500">
                  Réservation indisponible
                </div>

              )}

            </div>

            {/* =================================================
                CODE BARRE
            ================================================= */}

            {codeBarre && (
              <div className="mt-8 border-t pt-5 text-center">

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
