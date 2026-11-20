import Image from "next/image";
import Link from "next/link";
import FeaturedGames from "./FeaturedGames";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] text-[#29251E]">
      <header className="sticky top-0 z-30 bg-[#E8B223] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={54} height={54} priority className="h-14 w-14 object-contain" />
            <span>
              <span className="block text-xl font-black leading-tight sm:text-2xl">Chat'Perlipopette</span>
              <span className="text-xs font-semibold">Ronronnez de plaisir, jouez sans limite !</span>
            </span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold">
            <Link href="/catalogue" className="hover:underline">Catalogue</Link>
            <Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link>
            <Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link>
            <a href="#abonnements" className="hover:underline">Abonnements</a>
            <Link href="/partenaires" className="hover:underline">Partenaires</Link>
          </nav>
        </div>
      </header>

      <section className="bg-[#F7E7B8]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[#725400]">Location de jeux de société près de Toulouse</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Envie de jouer à autre chose ?</h1>
            <p className="mt-5 text-lg leading-8 text-[#514735]">
              Bienvenue chez Chat'Perlipopette ! Je propose des jeux de société à la location, pour changer un peu des jeux qu'on connaît déjà, tester une nouveauté ou trouver de quoi occuper une bonne soirée entre amis ou en famille.
            </p>
            <p className="mt-3 text-lg leading-8 text-[#514735]">
              Pas besoin d'acheter une boîte qui restera ensuite sur une étagère : vous choisissez, vous louez, et surtout… vous jouez !
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogue" className="rounded-lg bg-[#29251E] px-6 py-3 font-bold text-white hover:bg-black">Voir les jeux</Link>
              <Link href="/qui-suis-je" className="rounded-lg border-2 border-[#29251E] px-6 py-3 font-bold hover:bg-white/50">En savoir un peu plus</Link>
            </div>
            <p className="mt-4 text-sm text-[#66583D]">À partir de 4 € la location · Roquettes et alentours</p>
          </div>
          <div className="mx-auto w-full max-w-md">
            <Image src="/images/logo.png" alt="Chat'Perlipopette" width={520} height={420} className="mx-auto max-h-[360px] w-full object-contain" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">À vous de choisir</h2>
            <p className="mt-2 text-[#66583D]">Jeux d'ambiance, de stratégie, coopératifs ou familiaux : il y a de quoi trouver votre bonheur.</p>
          </div>
          <Link href="/catalogue" className="mt-2 font-bold underline underline-offset-4">Tout voir dans le catalogue</Link>
        </div>
        <FeaturedGames />
        <div className="mt-6">
          <Link href="/catalogue" className="inline-block rounded-lg bg-[#E8B223] px-6 py-3 font-bold hover:bg-[#D6A014]">Parcourir les jeux</Link>
        </div>
      </section>

      <section className="border-y border-[#E6D9B9] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <h2 className="text-3xl font-black">Comment louer ?</h2>
          <div className="mt-7 grid gap-8 md:grid-cols-3">
            <div><p className="text-sm font-bold text-[#806000]">01</p><h3 className="mt-1 text-xl font-bold">Choisissez votre jeu</h3><p className="mt-2 leading-7 text-[#66583D]">Faites un tour dans le catalogue et regardez les jeux qui vous intéressent.</p></div>
            <div><p className="text-sm font-bold text-[#806000]">02</p><h3 className="mt-1 text-xl font-bold">Faites votre réservation</h3><p className="mt-2 leading-7 text-[#66583D]">Consultez le prix, la caution et les disponibilités, puis envoyez votre réservation.</p></div>
            <div><p className="text-sm font-bold text-[#806000]">03</p><h3 className="mt-1 text-xl font-bold">Il ne reste qu'à jouer</h3><p className="mt-2 leading-7 text-[#66583D]">Récupérez vos jeux et profitez-en. Bonne partie !</p></div>
          </div>
          <Link href="/catalogue" className="mt-8 inline-block font-bold underline underline-offset-4">Voir le catalogue et les tarifs</Link>
        </div>
      </section>

      <section id="abonnements" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="rounded-2xl bg-[#F7E7B8] p-7 sm:p-9">
          <h2 className="text-2xl font-black">Vous louez régulièrement ?</h2>
          <p className="mt-2 max-w-2xl leading-7 text-[#514735]">Il existe aussi des formules d'abonnement pour profiter de petits avantages sur vos locations.</p>
          <Link href="/abonnement" className="mt-5 inline-block rounded-lg bg-[#29251E] px-6 py-3 font-bold text-white hover:bg-black">Voir les abonnements</Link>
        </div>
      </section>

      <section id="fidelite" className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="flex flex-col gap-3 border-t border-[#E6D9B9] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-black">Un programme fidélité</h2><p className="mt-1 text-[#66583D]">Vos locations vous permettent aussi de cumuler des points et de profiter de réductions.</p></div>
          <Link href="/catalogue" className="font-bold underline underline-offset-4">Découvrir les jeux</Link>
        </div>
      </section>

      <footer className="bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-black">Chat'Perlipopette</p><p className="text-sm">Location de jeux de société · Roquettes et alentours</p></div>
          <div className="flex flex-wrap gap-4 text-sm font-bold"><Link href="/catalogue" className="hover:underline">Catalogue</Link><Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link><Link href="/partenaires" className="hover:underline">Partenaires</Link></div>
          <p className="text-sm">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
