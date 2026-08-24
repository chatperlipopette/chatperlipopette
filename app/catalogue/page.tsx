import Image from "next/image";
import Link from "next/link";
import { getGames } from "../../lib/games";
import CatalogueClient from "./CatalogueClient";

export default async function Catalogue() {
  try {
    const games = await getGames();

    return (
      <main className="min-h-screen bg-[#FFF8E8]">

        {/* EN-TÊTE */}
        <header className="bg-[#E8B223] shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Image
                src="/images/logo.png"
                alt="Logo Chat'Perlipopette"
                width={70}
                height={70}
                className="h-[70px] w-[70px] object-contain"
              />

              <div>
                <h1 className="text-2xl font-bold text-black sm:text-4xl">
                  Chat'Perlipopette
                </h1>

                <p className="text-sm text-black sm:text-base">
                  Location de jeux de société
                </p>
              </div>
            </Link>

            <nav className="flex gap-6 font-bold text-black sm:gap-8">
              <Link
                href="/"
                className="hover:underline"
              >
                Accueil
              </Link>

              <Link
                href="/catalogue"
                className="hover:underline"
              >
                Catalogue
              </Link>
            </nav>

          </div>
        </header>

        {/* CATALOGUE */}
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">

          <h2 className="mb-6 text-3xl font-black text-gray-900 sm:mb-8 sm:text-4xl">
            🎲 Catalogue ({games.length} jeux)
          </h2>

          <CatalogueClient
            games={games}
          />

        </section>

      </main>
    );

  } catch (error) {

    console.error(
      "Erreur catalogue :",
      error
    );

    return (
      <main className="min-h-screen bg-[#FFF8E8]">

        {/* EN-TÊTE */}
        <header className="bg-[#E8B223] shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Image
                src="/images/logo.png"
                alt="Logo Chat'Perlipopette"
                width={70}
                height={70}
                className="h-[70px] w-[70px] object-contain"
              />

              <div>
                <h1 className="text-2xl font-bold text-black sm:text-4xl">
                  Chat'Perlipopette
                </h1>

                <p className="text-sm text-black sm:text-base">
                  Location de jeux de société
                </p>
              </div>
            </Link>

            <nav className="flex gap-6 font-bold text-black sm:gap-8">
              <Link href="/" className="hover:underline">
                Accueil
              </Link>

              <Link href="/catalogue" className="hover:underline">
                Catalogue
              </Link>
            </nav>

          </div>
        </header>

        {/* ERREUR */}
        <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">

          <div className="rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">

            <div className="text-6xl sm:text-7xl">
              🎲
            </div>

            <h2 className="mt-5 text-2xl font-black text-red-600 sm:text-3xl">
              Impossible de charger le catalogue
            </h2>

            <p className="mt-4 text-gray-600">
              Une erreur est survenue lors de la récupération
              des jeux.
            </p>

          </div>

        </section>

      </main>
    );
  }
}