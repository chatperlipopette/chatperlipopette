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

  /*
   * Recherche du jeu
   */

  const jeu = games.find((item) => {
    const codeBarre = String(
      (item as any).code_barre ?? ""
    ).trim();

    return codeBarre === code;
  });

  /*
   * Jeu introuvable
   */

  if (!jeu) {
    return (
      <main className="min-h-screen bg-[#FFF8E8] p-6 md:p-10">

        <div className="mx-auto max-w-4xl">

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

            <h1 className="mt-5 text-3xl font-black">
              Jeu introuvable
            </h1>

            <p className="mt-3 text-gray-600">
              Impossible de trouver ce jeu dans le catalogue.
            </p>

            <p className="mt-5 break-all rounded-xl bg-gray-100 p-4 text-sm text-gray-500">
              Code reçu :
              <br />
              <strong>
                {code}
              </strong>
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * Données du jeu
   */

  const nom =
    String((jeu as any).nom ?? "Jeu sans nom").trim();

  const editeur =
    String((jeu as any).editeur ?? "Non renseigné").trim();

  const codeBarre =
    String((jeu as any).code_barre ?? "").trim();

  /*
   * Disponibilité
   */

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

  /*
   * Joueurs
   */

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

  /*
   * Âge
   */

  const age =
    (jeu as any).age !== null &&
    (jeu as any).age !== undefined &&
    String((jeu as any).age).trim() !== ""
      ? `${String((jeu as any).age)} ans et plus`
      : "Non renseigné";

  /*
   * Durée
   */

  const duree =
    (jeu as any).duree !== null &&
    (jeu as any).duree !== undefined &&
    String((jeu as any).duree).trim() !== ""
      ? String((jeu as any).duree)
      : "Non renseignée";

  /*
   * Prix location
   */

  const prixLocation =
    (jeu as any).prix_location !== null &&
    (jeu as any).prix_location !== undefined &&
    String((jeu as any).prix_location).trim() !== ""
      ? `${Number((jeu as any).prix_location)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseigné";

  /*
   * Caution
   */

  const prixCaution =
    (jeu as any).prix_caution !== null &&
    (jeu as any).prix_caution !== undefined &&
    String((jeu as any).prix_caution).trim() !== ""
      ? `${Number((jeu as any).prix_caution)
          .toFixed(2)
          .replace(".", ",")} €`
      : "Non renseignée";

  /*
   * Image
   */

  const image =
    String(
      (jeu as any).image_url ??
        (jeu as any).image ??
        ""
    ).trim();

  /*
   * Description
   */

  const description =
    String(
      (jeu as any).description ?? ""
    ).trim();

  /*
   * PAGE
   */

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-4 md:p-10">

      <div className="mx-auto max-w-4xl">

        <Link
          href="/catalogue"
          className="mb-6 inline-block font-bold text-gray-700 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* EN-TÊTE */}

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

            {/* IMAGE */}

            {image && (
              <div className="mb-8 flex justify-center">

                <img
                  src={image}
                  alt={nom}
                  className="max-h-80 w-full rounded-2xl object-contain"
                />

              </div>
            )}

            {/* DISPONIBILITÉ */}

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

            {/* INFORMATIONS */}

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

            {/* DESCRIPTION */}

            {description && (
              <div className="mt-8">

                <h2 className="text-2xl font-black">
                  📖 Description
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-gray-700">
                  {description}
                </p>

              </div>
            )}

            {/* TARIFS */}

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

            {/* RÉSERVATION */}

            {disponible ? (

              <Link
                href={`/reservation?gameid=${encodeURIComponent(
                  codeBarre
                )}`}
                className="mt-8 block w-full rounded-2xl bg-black px-6 py-5 text-center text-xl font-black text-white hover:bg-gray-800"
              >
                📅 Réserver ce jeu
              </Link>

            ) : (

              <div className="mt-8 rounded-2xl bg-gray-200 p-5 text-center font-bold text-gray-500">
                Ce jeu n'est pas disponible actuellement.
              </div>

            )}

            {/* CODE BARRE */}

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
