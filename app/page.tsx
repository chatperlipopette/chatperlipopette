import Image from "next/image";
import Link from "next/link";
import FeaturedGames from "./FeaturedGames";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF9EC] text-[#29251E]">
      <header className="relative z-30 border-b border-[#D6A014] bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={48} height={48} priority className="h-12 w-12 object-contain" />
            <span><span className="block text-xl font-extrabold leading-tight">Chat'Perlipopette</span><span className="text-xs font-medium">Ronronnez de plaisir, jouez sans limite !</span></span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href="/catalogue" className="hover:underline">Le catalogue</Link>
            <Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link>
            <Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link>
            <Link href="/partenaires" className="hover:underline">Partenaires</Link>
          </nav>
        </div>
      </header>

      <section className="bg-[#F7E7B8]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#806000]">Location de jeux de société · Roquettes</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">Le prochain bon moment commence autour d'un jeu.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#514735]">Envie de découvrir un jeu, de changer vos habitudes ou de préparer une soirée ? Chez Chat'Perlipopette, vous pouvez louer des jeux de société et en profiter sans devoir acheter chaque boîte.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/catalogue" className="rounded-md bg-[#29251E] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-black">Découvrir le catalogue</Link>
              <Link href="/qui-suis-je" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[#806000]">En savoir plus sur le projet</Link>
            </div>
            <p className="mt-6 text-sm text-[#66583D]">Locations à partir de 4 € · Réservation directement sur le site</p>
          </div>
          <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-[#E8B223] sm:h-80 sm:w-80" />
            <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl border border-[#E6D9B9] bg-white p-8 shadow-[0_18px_50px_rgba(74,54,12,0.12)] sm:h-80 sm:w-80">
              <Image src="/images/logo.png" alt="Chat'Perlipopette" width={320} height={320} className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E8DFC9] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#E8DFC9] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="py-5 text-center"><p className="font-bold">Un large choix de jeux</p><p className="mt-1 text-sm text-[#706653]">Pour tous les goûts et toutes les envies</p></div>
          <div className="py-5 text-center"><p className="font-bold">À Roquettes et alentours</p><p className="mt-1 text-sm text-[#706653]">Un service de proximité</p></div>
          <div className="py-5 text-center"><p className="font-bold">Réservation en ligne</p><p className="mt-1 text-sm text-[#706653]">Consultez les jeux et disponibilités</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A6B00]">À découvrir</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Les jeux à l'honneur</h2><p className="mt-2 text-[#706653]">Nouveautés et coups de cœur sélectionnés dans le catalogue.</p></div>
          <Link href="/catalogue" className="text-sm font-bold underline underline-offset-4">Voir tout le catalogue</Link>
        </div>
        <FeaturedGames />
        <div className="mt-8 text-center"><Link href="/catalogue" className="inline-flex rounded-md border-2 border-[#29251E] px-6 py-3 text-sm font-bold transition hover:bg-[#29251E] hover:text-white">Parcourir tous les jeux</Link></div>
      </section>

      <section className="border-y border-[#E8DFC9] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9A6B00]">Comment ça marche ?</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Trois étapes, et la partie peut commencer.</h2><p className="mt-4 leading-7 text-[#706653]">Tout se fait simplement depuis le site. Vous choisissez les jeux qui vous plaisent, puis vous faites votre réservation.</p><Link href="/catalogue" className="mt-6 inline-block text-sm font-bold underline underline-offset-4">Choisir mes jeux</Link></div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="border-t-4 border-[#E8B223] pt-4"><p className="text-xs font-bold text-[#9A6B00]">01</p><h3 className="mt-2 font-extrabold">Choisissez</h3><p className="mt-2 text-sm leading-6 text-[#706653]">Parcourez le catalogue et trouvez votre prochaine partie.</p></div>
              <div className="border-t-4 border-[#E8B223] pt-4"><p className="text-xs font-bold text-[#9A6B00]">02</p><h3 className="mt-2 font-extrabold">Réservez</h3><p className="mt-2 text-sm leading-6 text-[#706653]">Vérifiez les disponibilités et les conditions de location.</p></div>
              <div className="border-t-4 border-[#E8B223] pt-4"><p className="text-xs font-bold text-[#9A6B00]">03</p><h3 className="mt-2 font-extrabold">Profitez</h3><p className="mt-2 text-sm leading-6 text-[#706653]">Récupérez vos jeux et place aux parties !</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="abonnements" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 rounded-2xl bg-[#F7E7B8] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#806000]">Pour les joueurs réguliers</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Vous avez envie de louer souvent ?</h2><p className="mt-3 leading-7 text-[#514735]">Découvrez les formules d'abonnement et les avantages du programme fidélité.</p></div>
          <Link href="/abonnement" className="shrink-0 rounded-md bg-[#29251E] px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-black">Voir les abonnements</Link>
        </div>
      </section>

      <footer className="border-t border-[#D6A014] bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-extrabold">Chat'Perlipopette</p><p className="mt-1 text-sm">Location de jeux de société à Roquettes et alentours.</p><p className="mt-1 text-xs">Ronronnez de plaisir, jouez sans limite !</p></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"><Link href="/catalogue" className="hover:underline">Catalogue</Link><Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link><Link href="/partenaires" className="hover:underline">Partenaires</Link><Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link></div>
          <p className="text-xs">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
