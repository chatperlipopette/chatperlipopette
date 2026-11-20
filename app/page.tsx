import Image from "next/image";
import Link from "next/link";
import FeaturedGames from "./FeaturedGames";

export const dynamic = "force-dynamic";

const categories = [
  { emoji: "🎉", title: "Jeux d'ambiance", text: "Pour rire, mettre l'ambiance et passer une bonne soirée." },
  { emoji: "🧠", title: "Jeux de stratégie", text: "Pour réfléchir, prévoir ses coups et se challenger." },
  { emoji: "👨‍👩‍👧‍👦", title: "Jeux en famille", text: "Des jeux à partager avec petits et grands." },
  { emoji: "🤝", title: "Jeux coopératifs", text: "Cette fois, on joue ensemble plutôt que les uns contre les autres." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] text-[#29251E]">
      <header className="sticky top-0 z-30 bg-[#E8B223] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={54} height={54} priority className="h-14 w-14 object-contain" />
            <span><span className="block text-xl font-black leading-tight sm:text-2xl">Chat'Perlipopette</span><span className="text-xs font-semibold">Ronronnez de plaisir, jouez sans limite !</span></span>
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

      <section className="overflow-hidden bg-[#F7E7B8]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-[#725400]">Location de jeux de société · Roquettes et alentours</p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Et si on changeait un peu de jeu ?</h1>
            <p className="mt-5 text-lg leading-8 text-[#514735]">Bienvenue chez Chat'Perlipopette ! Je propose des jeux de société à la location. Pour découvrir un jeu avant de l'acheter, préparer une soirée entre amis ou trouver une activité à partager en famille, il y a sûrement une boîte qui vous attend.</p>
            <p className="mt-3 text-lg leading-8 text-[#514735]">Le principe est tout simple : vous choisissez, vous louez et vous en profitez. Pas besoin de remplir vos placards pour varier les parties !</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogue" className="rounded-lg bg-[#29251E] px-6 py-3 font-bold text-white shadow-sm hover:bg-black">Voir le catalogue</Link>
              <Link href="/qui-suis-je" className="rounded-lg border-2 border-[#29251E] px-6 py-3 font-bold hover:bg-white/50">Qui se cache derrière ?</Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#66583D]">Locations à partir de 4 € · Réservation en ligne</p>
          </div>
          <div className="relative mx-auto flex min-h-[340px] w-full max-w-lg items-center justify-center">
            <div className="absolute left-5 top-8 h-56 w-56 rotate-[-9deg] rounded-[2rem] bg-[#E8B223] shadow-lg sm:left-12" />
            <div className="absolute right-5 top-14 h-52 w-52 rotate-[8deg] rounded-[2rem] border-4 border-white bg-[#FFF8E8] shadow-lg sm:right-12" />
            <div className="relative z-10 flex h-64 w-64 items-center justify-center rounded-[2rem] bg-white p-5 shadow-xl sm:h-72 sm:w-72">
              <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={300} height={300} className="h-full w-full object-contain" />
            </div>
            <span className="absolute bottom-3 left-5 z-20 -rotate-3 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-md">On choisit, on joue ! 🎲</span>
            <span className="absolute right-3 top-2 z-20 rotate-3 rounded-xl bg-[#29251E] px-4 py-3 text-sm font-bold text-white shadow-md">À vous la partie</span>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E6D9B9] bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 text-center sm:grid-cols-3 sm:px-8">
          <div><p className="text-lg font-black">📍 Roquettes</p><p className="text-sm text-[#66583D]">Et les communes alentours</p></div>
          <div><p className="text-lg font-black">🎲 Un grand choix de jeux</p><p className="text-sm text-[#66583D]">Pour toutes sortes de soirées</p></div>
          <div><p className="text-lg font-black">📅 Réservation en ligne</p><p className="text-sm text-[#66583D]">Consultez les disponibilités</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-extrabold uppercase tracking-wider text-[#9A6B00]">Il y en a pour tous les goûts</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Vous avez envie de jouer à quoi ?</h2><p className="mt-2 text-[#66583D]">Quelques idées pour commencer à fouiller dans le catalogue.</p></div>
          <Link href="/catalogue" className="mt-2 font-bold underline underline-offset-4">Voir tous les jeux →</Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.title} href="/catalogue" className="group rounded-2xl border border-[#E6D9B9] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7E7B8] text-3xl">{category.emoji}</span>
              <h3 className="mt-4 text-xl font-black group-hover:underline">{category.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#66583D]">{category.text}</p>
              <p className="mt-4 text-sm font-bold">Trouver un jeu →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-extrabold uppercase tracking-wider text-[#9A6B00]">À découvrir</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Quelques jeux à mettre sur la table</h2><p className="mt-2 text-[#66583D]">Les nouveautés et les jeux que j'ai envie de vous faire découvrir.</p></div>
            <Link href="/catalogue" className="font-bold underline underline-offset-4">Parcourir le catalogue →</Link>
          </div>
          <FeaturedGames />
          <div className="mt-6 text-center"><Link href="/catalogue" className="inline-block rounded-lg bg-[#E8B223] px-6 py-3 font-bold hover:bg-[#D6A014]">Je regarde tous les jeux</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-sm font-extrabold uppercase tracking-wider text-[#9A6B00]">Facile comme une partie</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Comment ça marche ?</h2><p className="mt-4 leading-7 text-[#66583D]">Vous n'avez encore jamais loué de jeu ? Pas de souci, tout se passe depuis le site.</p><Link href="/catalogue" className="mt-6 inline-block rounded-lg bg-[#29251E] px-6 py-3 font-bold text-white hover:bg-black">Choisir mes jeux</Link></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E6D9B9] bg-white p-5"><span className="text-3xl">🔎</span><p className="mt-3 text-sm font-bold text-[#9A6B00]">01</p><h3 className="mt-1 text-lg font-black">Je choisis</h3><p className="mt-2 text-sm leading-6 text-[#66583D]">Je parcours le catalogue et je trouve mon prochain jeu.</p></div>
            <div className="rounded-2xl border border-[#E6D9B9] bg-white p-5"><span className="text-3xl">🗓️</span><p className="mt-3 text-sm font-bold text-[#9A6B00]">02</p><h3 className="mt-1 text-lg font-black">Je réserve</h3><p className="mt-2 text-sm leading-6 text-[#66583D]">Je vérifie les disponibilités, le tarif et la caution.</p></div>
            <div className="rounded-2xl border border-[#E6D9B9] bg-white p-5"><span className="text-3xl">🎲</span><p className="mt-3 text-sm font-bold text-[#9A6B00]">03</p><h3 className="mt-1 text-lg font-black">Je joue !</h3><p className="mt-2 text-sm leading-6 text-[#66583D]">Je récupère ma réservation et place aux parties.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div id="abonnements" className="rounded-2xl bg-[#F7E7B8] p-7 sm:p-9"><p className="text-sm font-extrabold uppercase tracking-wider text-[#725400]">Les habitués aussi sont gâtés</p><h2 className="mt-2 text-2xl font-black">Vous louez régulièrement ?</h2><p className="mt-3 leading-7 text-[#514735]">Des formules d'abonnement permettent de profiter d'avantages sur vos locations.</p><Link href="/abonnement" className="mt-5 inline-block rounded-lg bg-[#29251E] px-5 py-3 font-bold text-white hover:bg-black">Voir les abonnements</Link></div>
          <div className="rounded-2xl border-2 border-[#E8B223] bg-white p-7 sm:p-9"><p className="text-sm font-extrabold uppercase tracking-wider text-[#9A6B00]">Merci de votre fidélité</p><h2 className="mt-2 text-2xl font-black">Des points à cumuler</h2><p className="mt-3 leading-7 text-[#66583D]">Vos locations vous permettent de cumuler des points et de profiter de réductions.</p><Link href="/catalogue" className="mt-5 inline-block font-bold underline underline-offset-4">Découvrir les jeux →</Link></div>
        </div>
      </section>

      <section className="bg-[#F7E7B8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><h2 className="text-2xl font-black">Une question avant de vous lancer ?</h2><p className="mt-1 text-[#514735]">Je vous explique le fonctionnement et l'histoire du projet.</p></div>
          <Link href="/qui-suis-je" className="shrink-0 rounded-lg border-2 border-[#29251E] px-5 py-3 text-center font-bold hover:bg-white/50">En savoir plus sur Chat'Perlipopette</Link>
        </div>
      </section>

      <footer className="bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-black text-lg">Chat'Perlipopette</p><p className="text-sm">Location de jeux de société · Roquettes et alentours</p><p className="mt-1 text-sm">Ronronnez de plaisir, jouez sans limite !</p></div>
          <div className="flex flex-wrap gap-4 text-sm font-bold"><Link href="/catalogue" className="hover:underline">Catalogue</Link><Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link><Link href="/partenaires" className="hover:underline">Partenaires</Link><Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link></div>
          <p className="text-sm">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
