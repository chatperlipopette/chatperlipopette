import Image from "next/image";
import Link from "next/link";
import FeaturedGames from "./FeaturedGames";

export const dynamic = "force-dynamic";

const categories = [
  { emoji: "🤝", title: "Coopération", description: "On gagne ensemble… ou on perd ensemble !" },
  { emoji: "😂", title: "Ambiance", description: "Pour les soirées où l’on a surtout envie de rire." },
  { emoji: "🧠", title: "Stratégie", description: "Pour celles et ceux qui aiment se creuser un peu la tête." },
  { emoji: "👨‍👩‍👧‍👦", title: "En famille", description: "Des jeux à sortir quand tout le monde est autour de la table." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] text-[#29251E]">
      <header className="sticky top-0 z-30 border-b border-[#C99719]/30 bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={54} height={54} priority className="h-14 w-14 object-contain" />
            <span>
              <span className="block text-xl font-black leading-tight sm:text-2xl">Chat'Perlipopette</span>
              <span className="text-xs font-semibold">Ronronnez de plaisir, jouez sans limite !</span>
            </span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold sm:text-base">
            <Link href="/" className="underline underline-offset-4">Accueil</Link>
            <Link href="/catalogue" className="hover:underline">Les jeux</Link>
            <Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link>
            <a href="#abonnements" className="hover:underline">Abonnements</a>
            <a href="#fidelite" className="hover:underline">Fidélité</a>
            <Link href="/partenaires" className="hover:underline">Partenaires</Link>
          </nav>
        </div>
      </header>

      <section className="bg-[#F7E7B8]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#806000]">La location de jeux autour de Toulouse</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">Et si on changeait de jeu, cette fois ?</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#514735]">
              Un jeu pour ce soir, une nouveauté à tester en famille ou de quoi animer un week-end entre amis… Ici, vous pouvez louer des jeux de société sans avoir à acheter une boîte de plus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogue" className="rounded-full bg-[#29251E] px-7 py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-black">Trouver un jeu</Link>
              <Link href="/qui-suis-je" className="rounded-full border-2 border-[#29251E]/70 px-7 py-3.5 font-extrabold transition hover:bg-white/50">Découvrir l'histoire du projet</Link>
            </div>
            <p className="mt-5 text-sm font-semibold text-[#66583D]">Des locations à partir de 4 € · Roquettes et secteur toulousain</p>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-[#E8B223]" />
            <div className="relative overflow-hidden rounded-[1.7rem] border-[7px] border-white bg-white p-3 shadow-xl">
              <Image src="/images/logo.png" alt="Chat'Perlipopette" width={500} height={380} className="mx-auto h-64 w-full object-contain sm:h-80" />
              <div className="rounded-2xl bg-[#FFF8E8] px-5 py-4 text-center">
                <p className="text-xl font-black">Le prochain jeu coup de cœur est peut-être ici.</p>
                <p className="mt-1 text-sm text-[#66583D]">Il ne reste qu’à choisir avec qui jouer !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#806000]">À chacun sa partie</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Vous avez envie de jouer à quoi ?</h2>
            <p className="mt-3 leading-7 text-[#66583D]">Plutôt bluff, réflexion ou fous rires ? Jetez un œil aux différentes catégories.</p>
          </div>
          <Link href="/catalogue" className="font-extrabold underline decoration-[#E8B223] decoration-4 underline-offset-4">Voir tout le catalogue →</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.title} href="/catalogue" className="rounded-2xl border border-[#E6D9B9] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
              <span className="text-3xl" aria-hidden="true">{category.emoji}</span>
              <h3 className="mt-4 text-lg font-black">{category.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#66583D]">{category.description}</p>
              <span className="mt-4 inline-block text-sm font-extrabold">Voir les jeux →</span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedGames />

      <section id="comment-ca-marche" className="border-y border-[#E6D9B9] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#806000]">Pas compliqué</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Comment ça se passe ?</h2>
            <p className="mt-3 leading-7 text-[#66583D]">Quelques étapes et votre prochaine partie est presque prête.</p>
          </div>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Choisissez", "Parcourez le catalogue et trouvez le jeu qui vous fait envie."],
              ["02", "Réservez", "Regardez les informations, les tarifs et les disponibilités du jeu."],
              ["03", "Jouez !", "Il ne reste plus qu’à réunir les joueurs et à profiter du moment."],
            ].map(([number, title, description]) => (
              <article key={number} className="border-t-4 border-[#E8B223] pt-5">
                <span className="text-sm font-black text-[#9A710D]">{number}</span>
                <h3 className="mt-2 text-xl font-black">{title}</h3>
                <p className="mt-2 leading-7 text-[#66583D]">{description}</p>
              </article>
            ))}
          </div>
          <Link href="/catalogue" className="mt-9 inline-flex rounded-full bg-[#E8B223] px-7 py-3.5 font-extrabold transition hover:bg-[#D6A014]">Je choisis mon jeu</Link>
        </div>
      </section>

      <section id="abonnements" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#806000]">Pour les joueurs réguliers</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Les abonnements</h2>
          <p className="mt-3 leading-7 text-[#66583D]">Vous louez souvent des jeux ? Les formules Club peuvent vous intéresser.</p>
        </div>
        <div className="mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border-2 border-[#E8B223] bg-white p-7">
            <p className="font-extrabold text-[#806000]">CLUB</p>
            <p className="mt-3 text-4xl font-black">6,99 € <span className="text-base font-semibold text-[#66583D]">/ mois</span></p>
            <p className="mt-2 text-sm text-[#66583D]">Sans engagement</p>
            <ul className="mt-5 space-y-3 text-sm leading-6">
              <li>🎲 Une location offerte par mois, jusqu’à 3 €</li>
              <li>💛 5 % de réduction sur les autres locations</li>
              <li>⭐ Des points fidélité toujours cumulés</li>
              <li>🎂 Un bonus pour votre anniversaire</li>
              <li>⏰ Accès aux réservations en avance</li>
            </ul>
            <Link href="/abonnement?plan=club" className="mt-7 inline-flex rounded-full bg-[#29251E] px-6 py-3 font-bold text-white hover:bg-black">Voir la formule Club →</Link>
          </article>
          <article className="rounded-2xl border border-[#E6D9B9] bg-[#F7E7B8]/50 p-7">
            <p className="font-extrabold text-[#806000]">CLUB PREMIUM</p>
            <p className="mt-3 text-4xl font-black">9,99 € <span className="text-base font-semibold text-[#66583D]">/ mois</span></p>
            <p className="mt-2 text-sm text-[#66583D]">Pour les joueurs réguliers</p>
            <p className="mt-5 text-sm leading-7 text-[#514735]">Retrouvez les détails de cette formule et ses conditions sur la page abonnement.</p>
            <Link href="/abonnement?plan=premium" className="mt-7 inline-flex rounded-full border-2 border-[#29251E] px-6 py-3 font-bold hover:bg-white">En savoir plus →</Link>
          </article>
        </div>
      </section>

      <section id="fidelite" className="bg-[#F7E7B8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <span className="text-5xl" aria-hidden="true">💛</span>
            <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.16em] text-[#806000]">Un petit merci aux habitués</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">La fidélité, ça compte !</h2>
            <p className="mt-3 leading-7 text-[#66583D]">Vos locations vous rapportent des points et quelques avantages à retrouver au fil du temps.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-white p-5"><span className="text-2xl">⭐</span><h3 className="mt-2 font-black">Des points</h3><p className="mt-1 text-sm leading-6 text-[#66583D]">1 point pour 5 € dépensés.</p></article>
            <article className="rounded-2xl bg-white p-5"><span className="text-2xl">🎁</span><h3 className="mt-2 font-black">Une récompense</h3><p className="mt-1 text-sm leading-6 text-[#66583D]">À 10 points, profitez de 20 % de remise.</p></article>
            <article className="rounded-2xl bg-white p-5"><span className="text-2xl">🤝</span><h3 className="mt-2 font-black">Le parrainage</h3><p className="mt-1 text-sm leading-6 text-[#66583D]">10 % de remise pour vous et votre filleul.</p></article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl bg-[#E8B223] px-7 py-10 sm:px-12 sm:py-12">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#594100]">À vous de jouer</p>
          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-3xl font-black sm:text-4xl">On se fait une partie ?</h2><p className="mt-2 max-w-xl leading-7">Allez voir les jeux disponibles. Vous trouverez peut-être celui qui animera votre prochaine soirée.</p></div>
            <Link href="/catalogue" className="shrink-0 rounded-full bg-[#29251E] px-7 py-3.5 text-center font-extrabold text-white hover:bg-black">Voir les jeux →</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-black">Chat'Perlipopette</p><p className="text-sm">Location de jeux de société · Secteur de Toulouse</p></div>
          <div className="flex flex-wrap gap-5 text-sm font-bold"><Link href="/catalogue" className="hover:underline">Le catalogue</Link><Link href="/qui-suis-je" className="hover:underline">Qui suis-je ?</Link><Link href="/partenaires" className="hover:underline">Partenaires</Link></div>
          <p className="text-sm">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
