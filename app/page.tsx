import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8]">
      <header className="bg-[#E8B223] shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">

          <Link href="/" className="flex items-center gap-3">
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

      <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">

        <h2 className="text-4xl font-black leading-tight text-black sm:text-6xl">
          Plus de 488 jeux à louer !
        </h2>

        <p className="mt-5 text-xl text-black sm:mt-6 sm:text-2xl">
          Réservez vos jeux de société en quelques clics.
        </p>

        <Link
          href="/catalogue"
          className="mt-8 inline-block rounded-xl bg-black px-8 py-4 text-lg font-bold text-white transition hover:scale-105 sm:mt-10 sm:px-10 sm:py-5 sm:text-xl"
        >
          Voir le catalogue
        </Link>

      </section>
    </main>
  );
}