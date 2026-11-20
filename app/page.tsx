import Image from "next/image";
import Link from "next/link";
import FeaturedGames from "./FeaturedGames";

export const dynamic = "force-dynamic";

const themes = [
  { number: "01", name: "En famille", line: "Des jeux à partager avec petits et grands.", emoji: "🏡", color: "bg-[#F6C84C]", ink: "text-[#34270B]" },
  { number: "02", name: "Entre amis", line: "Pour lancer une soirée et faire parler autour de la table.", emoji: "🥳", color: "bg-[#F28C62]", ink: "text-[#3B1D13]" },
  { number: "03", name: "Ambiance", line: "Des parties rythmées, des fous rires et des surprises.", emoji: "🎤", color: "bg-[#8EC9B5]", ink: "text-[#14382E]" },
  { number: "04", name: "Stratégie", line: "Pour celles et ceux qui aiment se creuser la tête.", emoji: "♟️", color: "bg-[#9DB7E8]", ink: "text-[#17294B]" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF9EC] text-[#29251E]">
      <header className="relative z-30 border-b border-[#D6A014] bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo Chat'Perlipopette" width={50} height={50} priority className="h-12 w-12 object-contain" />
            <span><span className="block text-xl font-extrabold leading-tight">Chat'Perlipopette</span><span className="text-xs font-medium">Ronronnez de plaisir, jouez sans limite !</span></span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href="/catalogue" className="hover:underline">Catalogue</Link>
            <Link href="/chasse-aux-codes" className="hover:underline">Chasse aux codes</Link>
            <Link href="/fidelite" className="hover:underline">Fidélité</Link>
            <Link href="/abonnement" className="hover:underline">Abonnement</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#F6C84C]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border-[48px] border-white/20" />
        <div className="pointer-events-none absolute -bottom-40 left-[38%] h-80 w-80 rounded-full bg-[#F28C62]/35" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#604600]">La location de jeux près de chez vous</p>
            <h1 className="mt-5 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">On se fait une partie ?</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#443719]">Bienvenue chez Chat'Perlipopette ! Louez vos jeux de société pour découvrir de nouvelles pépites, organiser une soirée ou partager un bon moment en famille. Vous choisissez, je prépare, et à vous de jouer.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/catalogue" className="rounded-md bg-[#29251E] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black">Trouver mon prochain jeu</Link>
              <Link href="/qui-suis-je" className="text-sm font-bold underline decoration-2 underline-offset-4">Découvrir le projet</Link>
            </div>
            <p className="mt-6 text-sm font-semibold text-[#604600]">À partir de 4 € · Roquettes et alentours</p>
          </div>
          <div className="relative mx-auto flex min-h-[350px] w-full max-w-lg items-center justify-center">
            <div className="absolute left-4 top-6 h-56 w-44 rotate-[-10deg] rounded-3xl bg-[#F28C62] shadow-xl sm:left-10 sm:h-64 sm:w-52" />
            <div className="absolute right-4 top-10 h-56 w-44 rotate-[9deg] rounded-3xl bg-[#8EC9B5] shadow-xl sm:right-10 sm:h-64 sm:w-52" />
            <div className="relative z-10 flex h-64 w-64 items-center justify-center rounded-[2rem] border-[8px] border-white bg-white p-5 shadow-2xl sm:h-72 sm:w-72">
              <Image src="/images/logo.png" alt="Chat'Perlipopette" width={320} height={320} className="h-full w-full object-contain" />
            </div>
            <span className="absolute bottom-1 left-3 z-20 rounded-full bg-[#29251E] px-5 py-3 text-sm font-bold text-white shadow-lg">Choisissez. Jouez. Recommencez.</span>
          </div>
        </div>
      </section>

      <section className="bg-[#29251E] text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 text-center sm:grid-cols-3 sm:px-8">
          <div className="py-2"><p className="font-extrabold">Un grand choix de jeux</p><p className="mt-1 text-sm text-white/70">Pour tous les styles de joueurs</p></div>
          <div className="border-white/15 py-2 sm:border-x"><p className="font-extrabold">À Roquettes et alentours</p><p className="mt-1 text-sm text-white/70">Une location près de chez vous</p></div>
          <div className="py-2"><p className="font-extrabold">Réservation en ligne</p><p className="mt-1 text-sm text-white/70">Consultez les jeux et disponibilités</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9A6B00]">À chacun son style</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Quel genre de partie vous tente ?</h2><p className="mt-2 text-[#706653]">Il y a plusieurs façons de passer une bonne soirée.</p></div>
          <Link href="/catalogue" className="text-sm font-bold underline underline-offset-4">Explorer le catalogue →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {themes.map((theme) => (
            <Link key={theme.number} href="/catalogue" className={`group relative flex min-h-[230px] items-end justify-between overflow-hidden rounded-[1.6rem] p-7 transition hover:-translate-y-1 hover:shadow-xl sm:p-9 ${theme.color} ${theme.ink}`}>
              <div className="relative z-10 max-w-xs"><p className="text-xs font-black tracking-[0.2em] opacity-60">{theme.number} / NOS UNIVERS</p><h3 className="mt-3 text-3xl font-black sm:text-4xl">{theme.name}</h3><p className="mt-2 text-sm font-medium leading-6 opacity-80">{theme.line}</p><p className="mt-5 text-sm font-extrabold underline underline-offset-4">Voir les jeux →</p></div>
              <span className="absolute -right-2 -top-8 text-[9rem] opacity-25 transition group-hover:rotate-6 group-hover:scale-110 sm:text-[11rem]">{theme.emoji}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9A6B00]">La sélection</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Les jeux à découvrir</h2><p className="mt-2 text-[#706653]">Nouveautés et coups de cœur du moment.</p></div><Link href="/catalogue" className="text-sm font-bold underline underline-offset-4">Tout le catalogue →</Link></div>
          <FeaturedGames />
          <div className="mt-8 text-center"><Link href="/catalogue" className="inline-flex rounded-md bg-[#E8B223] px-7 py-3.5 text-sm font-extrabold transition hover:bg-[#D6A014]">Voir tous les jeux</Link></div>
        </div>
      </section>

      <section className="bg-[#9DB7E8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#243D6B]">Simple et pratique</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">La location en 3 étapes</h2><p className="mt-4 max-w-md leading-7 text-[#243D6B]">Tout se passe depuis le site : choisissez vos jeux, vérifiez les informations et envoyez votre réservation.</p><Link href="/catalogue" className="mt-6 inline-block rounded-md bg-[#29251E] px-6 py-3.5 text-sm font-bold text-white hover:bg-black">Je choisis mes jeux</Link></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/85 p-5"><p className="text-xs font-black text-[#536F9F]">01</p><h3 className="mt-2 text-lg font-black">Choisissez</h3><p className="mt-2 text-sm leading-6 text-[#514735]">Parcourez le catalogue et repérez vos envies.</p></div>
            <div className="rounded-2xl bg-white/85 p-5"><p className="text-xs font-black text-[#536F9F]">02</p><h3 className="mt-2 text-lg font-black">Réservez</h3><p className="mt-2 text-sm leading-6 text-[#514735]">Vérifiez les disponibilités et les conditions.</p></div>
            <div className="rounded-2xl bg-white/85 p-5"><p className="text-xs font-black text-[#536F9F]">03</p><h3 className="mt-2 text-lg font-black">Jouez !</h3><p className="mt-2 text-sm leading-6 text-[#514735]">Récupérez vos jeux et profitez-en.</p></div>
          </div>
        </div>
      </section>

      <section id="abonnements" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 rounded-[1.6rem] bg-[#8EC9B5] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#245343]">Pour les joueurs réguliers</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Envie de louer plus souvent ?</h2><p className="mt-3 leading-7 text-[#245343]">Découvrez les formules d'abonnement et les avantages du programme fidélité.</p></div>
          <Link href="/abonnement" className="shrink-0 rounded-md bg-[#29251E] px-6 py-3.5 text-center text-sm font-bold text-white hover:bg-black">Voir les abonnements</Link>
        </div>
      </section>

      <footer className="bg-[#E8B223]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-extrabold">Chat'Perlipopette</p><p className="mt-1 text-sm">Location de jeux de société à Roquettes et alentours.</p><p className="mt-1 text-xs">Ronronnez de plaisir, jouez sans limite !</p></div>
          
          <p className="text-xs">© {new Date().getFullYear()} Chat'Perlipopette</p>
        </div>
      </footer>
    </main>
  );
}
