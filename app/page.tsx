import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8]">
      <header className="bg-[#E8B223] shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">

          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="Logo Chat'Perlipopette"
              width={80}
              height={80}
            />

            <div>
              <h1 className="text-4xl font-bold text-black">
                Chat'Perlipopette
              </h1>

              <p className="text-black">
                Location de jeux de société
              </p>
            </div>
          </div>

          <nav className="flex gap-8 font-bold text-black">
            <Link href="/">Accueil</Link>
            <Link href="/catalogue">Catalogue</Link>
          </nav>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-20 text-center">

        <h2 className="text-6xl font-black text-black">
          Plus de 488 jeux à louer !
        </h2>

        <p className="mt-6 text-2xl text-black">
          Réservez vos jeux de société en quelques clics.
        </p>

        <Link
          href="/catalogue"
          className="mt-10 inline-block rounded-xl bg-black px-10 py-5 text-xl font-bold text-white"
        >
          Voir le catalogue
        </Link>

      </section>

    </main>
  );
}