import Image from "next/image";
import Link from "next/link";

const categories = [
  { emoji: "🤝", title: "Jeux coopératifs", description: "Unissez vos forces pour gagner ensemble." },
  { emoji: "😂", title: "Jeux d’ambiance", description: "Des fous rires et des parties animées." },
  { emoji: "🧠", title: "Jeux de stratégie", description: "Réfléchissez, anticipez et prenez les bonnes décisions." },
  { emoji: "👨‍👩‍👧‍👦", title: "Jeux en famille", description: "Des moments à partager avec petits et grands." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] text-[#24211B]">
      <header className="sticky top-0 z-20 bg-[#E8B223] shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Logo Chat'Perlipopette"
              width={64}
              height={64}
              priority
              className="h-16 w-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">Chat'Perlipopette</h1>
              <p className="text-sm font-medium">Location de jeux de société</p>
            </div>
          </Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-6 font-bold sm:gap-8">
            <Link href="/" className="underline underline-offset-4">Accueil</Link>
            <Link href="/catalogue" className="transition hover:underline">Catalogue</Link>
            <a href="#abonnements" className="transition hover:underline">Abonnements</a>
            <a href="#fidelite" className="transition hover:underline">Fidélité</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF1BF] via-[#FFF8E8] to-[#F7D96C]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-[#E8B223] bg-white/70 px-4 py-2 text-sm font-bold">
              🎲 Le plaisir de jouer, sans acheter
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
              Plus de 488 jeux à louer !
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 sm:text-xl">
              Découvrez de nouveaux jeux de société, partagez de bons moments et trouvez le jeu parfait pour votre prochaine soirée.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalogue" className="rounded-xl bg-[#24211B] px-7 py-4 text-center font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black">
                Voir les jeux et les tarifs →
              </Link>
              <a href="#comment-ca-marche" className="rounded-xl border-2 border-[#24211B] px-7 py-4 text-center font-extrabold transition hover:bg-white/70">
                Comment ça marche ?
              </a>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#5B5140]">Locations à partir de 4 € · Secteur de Toulouse</p>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="rotate-2 rounded-3xl border-4 border-white bg-[#E8B223] p-5 shadow-2xl">
              <div className="-rotate-2 rounded-2xl bg-white p-7 text-center">
                <div className="text-7xl" aria-hidden="true">🎲</div>
                <p className="mt-4 text-2xl font-black">À vous de jouer !</p>
                <p className="mt-2 text-[#5B5140]">Une soirée, un week-end ou un événement : trouvez votre prochaine partie.</p>
                <div className="mt-5 flex justify-center gap-3 text-3xl" aria-hidden="true">
                  <span>🃏</span><span>🎯</span><span>🧩</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Le catalogue</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Quel jeu vous ferait plaisir ?</h2>
          <p className="mt-4 text-lg leading-7 text-[#5B5140]">Ambiance, coopération, stratégie ou jeux en famille : il y a toujours une nouvelle expérience à découvrir.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.title} href="/catalogue" className="group rounded-2xl border border-[#EADCB9] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#E8B223] hover:shadow-lg">
              <span className="text-4xl" aria-hidden="true">{category.emoji}</span>
              <h3 className="mt-4 text-xl font-extrabold group-hover:underline">{category.title}</h3>
              <p className="mt-2 leading-6 text-[#5B5140]">{category.description}</p>
              <span className="mt-5 inline-block font-bold">Explorer le catalogue →</span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/catalogue" className="inline-flex rounded-xl bg-[#E8B223] px-7 py-4 font-extrabold transition hover:bg-[#D6A014]">
            Parcourir tous les jeux
          </Link>
        </div>
      </section>

      <section id="comment-ca-marche" className="bg-[#24211B] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-extrabold uppercase tracking-widest text-[#F7D96C]">Simple et pratique</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Comment ça marche ?</h2>
            <p className="mt-4 text-lg leading-7 text-white/75">Quelques étapes pour préparer votre prochaine partie.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8B223] text-xl font-black text-black">1</span>
              <h3 className="mt-5 text-xl font-extrabold">Choisissez vos jeux</h3>
              <p className="mt-2 leading-7 text-white/75">Parcourez le catalogue et repérez les jeux qui vous tentent.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8B223] text-xl font-black text-black">2</span>
              <h3 className="mt-5 text-xl font-extrabold">Consultez les tarifs</h3>
              <p className="mt-2 leading-7 text-white/75">Vérifiez les informations de location et la caution indiquées pour chaque jeu.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8B223] text-xl font-black text-black">3</span>
              <h3 className="mt-5 text-xl font-extrabold">Place au jeu !</h3>
              <p className="mt-2 leading-7 text-white/75">Préparez votre soirée, votre week-end ou votre événement autour d’une belle partie.</p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/catalogue" className="inline-flex rounded-xl bg-[#E8B223] px-8 py-4 font-extrabold text-black transition hover:bg-[#F7D96C]">
              Trouver mon prochain jeu →
            </Link>
          </div>
        </div>
      </section>

      <section id="abonnements" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Les abonnements</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Jouez plus, profitez davantage</h2>
            <p className="mt-4 text-lg leading-7 text-[#5B5140]">Choisissez la formule adaptée à votre envie de découvrir de nouveaux jeux.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            <article className="rounded-3xl border-2 border-[#E8B223] bg-[#FFF8E8] p-7 shadow-sm">
              <p className="font-extrabold uppercase tracking-widest text-[#806000]">Club</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black">6,99 €</span>
                <span className="text-[#5B5140]">/ mois</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#5B5140]">Sans engagement</p>
              <ul className="mt-6 space-y-3 leading-6">
                <li>🎲 Une location offerte par mois, jusqu’à 3 €</li>
                <li>💛 5 % de réduction sur les autres locations</li>
                <li>⭐ Vous continuez à cumuler vos points fidélité</li>
                <li>🎂 Un bonus pour votre anniversaire</li>
                <li>⏰ Accès aux réservations en avance</li>
              </ul>
              <Link href="/abonnement?plan=club" className="mt-7 block rounded-xl bg-[#24211B] px-5 py-3 text-center font-extrabold text-white transition hover:bg-black">Choisir Club →</Link>
            </article>
            <article className="rounded-3xl border border-[#EADCB9] bg-white p-7 shadow-sm">
              <p className="font-extrabold uppercase tracking-widest text-[#806000]">Club Premium</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-black">9,99 €</span>
                <span className="text-[#5B5140]">/ mois</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#5B5140]">Pour les joueurs réguliers</p>
              <p className="mt-5 leading-7 text-[#5B5140]">Une formule supérieure pour profiter encore plus de Chat’Perlipopette. Les avantages spécifiques du Premium doivent être confirmés avant d’activer la souscription.</p>
              <Link href="/abonnement?plan=premium" className="mt-7 block rounded-xl border-2 border-[#24211B] px-5 py-3 text-center font-extrabold transition hover:bg-[#FFF8E8]">Choisir Club Premium →</Link>
            </article>
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-[#6B6253]">Information : cette section présente les formules. Vérifie que le paiement récurrent est bien activé dans le parcours d’abonnement avant de proposer la souscription aux visiteurs.</p>
        </div>
      </section>

      <section id="fidelite" className="bg-[#FFF1BF]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <div className="text-6xl" aria-hidden="true">💛⭐</div>
            <p className="mt-5 font-extrabold uppercase tracking-widest text-[#806000]">Programme fidélité</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Chaque location compte !</h2>
            <p className="mt-4 text-lg leading-7 text-[#5B5140]">Cumulez des points au fil de vos locations et profitez d’avantages en invitant vos proches.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-[#EADCB9] bg-white p-6">
              <span className="text-3xl" aria-hidden="true">⭐</span>
              <h3 className="mt-3 text-xl font-extrabold">Cumulez des points</h3>
              <p className="mt-2 leading-6 text-[#5B5140]">1 point pour 5 € dépensés.</p>
            </article>
            <article className="rounded-2xl border border-[#EADCB9] bg-white p-6">
              <span className="text-3xl" aria-hidden="true">🎁</span>
              <h3 className="mt-3 text-xl font-extrabold">Obtenez une récompense</h3>
              <p className="mt-2 leading-6 text-[#5B5140]">À 10 points, profitez d’une récompense de 20 %.</p>
            </article>
            <article className="rounded-2xl border border-[#EADCB9] bg-white p-6">
              <span className="text-3xl" aria-hidden="true">🤝</span>
              <h3 className="mt-3 text-xl font-extrabold">Parrainez un proche</h3>
              <p className="mt-2 leading-6 text-[#5B5140]">Avec votre code de parrainage, vous obtenez 10 % de remise et votre filleul aussi.</p>
            </article>
            <article className="rounded-2xl border border-[#EADCB9] bg-white p-6">
              <span className="text-3xl" aria-hidden="true">🎲</span>
              <h3 className="mt-3 text-xl font-extrabold">Continuez à découvrir</h3>
              <p className="mt-2 leading-6 text-[#5B5140]">Explorez le catalogue pour préparer votre prochaine partie.</p>
              <Link href="/catalogue" className="mt-4 inline-block font-extrabold underline underline-offset-4">Voir le catalogue →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Pourquoi louer ?</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Plus de jeux, plus de découvertes</h2>
          </div>
          <div className="space-y-4 text-lg leading-7 text-[#5B5140]">
            <p>🎉 <strong className="text-[#24211B]">Pour une soirée :</strong> changez de jeu et surprenez vos amis.</p>
            <p>👨‍👩‍👧‍👦 <strong className="text-[#24211B]">Pour la famille :</strong> partagez un moment sans acheter une boîte de plus.</p>
            <p>🏢 <strong className="text-[#24211B]">Pour vos événements :</strong> pensez aux jeux pour les associations, entreprises et rassemblements.</p>
            <p>💛 <strong className="text-[#24211B]">Pour votre budget :</strong> découvrez un jeu à partir de 4 € la location.</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#E8B223] px-6 py-10 text-center shadow-lg sm:px-12 sm:py-14">
          <h2 className="text-3xl font-black sm:text-4xl">Prêt à lancer les dés ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7">Parcourez le catalogue et trouvez les jeux qui rendront votre prochain moment inoubliable.</p>
          <Link href="/catalogue" className="mt-7 inline-flex rounded-xl bg-[#24211B] px-8 py-4 font-extrabold text-white transition hover:bg-black">
            Voir le catalogue
          </Link>
        </div>
      </section>

      <footer className="bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
          <div>
            <p className="font-black">Chat'Perlipopette</p>
            <p className="text-sm">Location de jeux de société · Secteur de Toulouse</p>
          </div>
          <Link href="/catalogue" className="font-bold hover:underline">Découvrir le catalogue →</Link>
          <p className="text-sm">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
