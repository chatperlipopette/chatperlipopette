import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Qui suis-je ?",
  description:
    "Découvrez la personne derrière Chat’Perlipopette, un projet indépendant de location de jeux de société près de Toulouse.",
  alternates: {
    canonical: "/qui-suis-je",
  },
};

export default function QuiSuisJePage() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] text-[#24211B]">
      <header className="sticky top-0 z-20 border-b border-[#EADCB9] bg-[#E8B223] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Logo Chat’Perlipopette"
              width={52}
              height={52}
              priority
              className="h-13 w-13 object-contain"
            />
            <span className="text-2xl font-black">Chat’Perlipopette</span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold sm:text-base">
            <Link href="/" className="hover:underline">Accueil</Link>
            <Link href="/catalogue" className="hover:underline">Catalogue</Link>
            <Link href="/qui-suis-je" aria-current="page" className="underline underline-offset-4">Qui suis-je ?</Link>
            <Link href="/partenaires" className="hover:underline">Partenaires</Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#FFF1BF] via-[#FFF8E8] to-[#F7D96C]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-[#E8B223] bg-white/70 px-4 py-2 text-sm font-bold text-[#725400]">
              Une petite présentation, tout simplement
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
              Bonjour, moi c’est Théo Lafont Maraval !
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#514735] sm:text-xl">
              Je suis la personne derrière Chat’Perlipopette, un projet né de mon envie de faire découvrir les jeux de société et de donner à chacun l’occasion de partager de bons moments autour d’une table.
            </p>
            <Link href="/catalogue" className="mt-8 inline-flex rounded-xl bg-[#24211B] px-7 py-4 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black">
              Découvrir les jeux
            </Link>
          </div>
          <div className="rounded-3xl border border-[#EADCB9] bg-white/85 p-8 text-center shadow-lg">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#FFF1BF] text-6xl" aria-hidden="true">
              🎲
            </div>
            <p className="mt-5 text-2xl font-black">Un projet à taille humaine</p>
            <p className="mt-3 leading-7 text-[#5B5140]">
              Imaginé et animé par une personne passionnée, près de Toulouse.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:items-start">
          <div>
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">D’où vient l’idée ?</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Le plaisir de jouer et de partager</h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-[#5B5140]">
            <p>
              J’aime l’univers des jeux de société : il y a toujours une nouvelle règle à découvrir, une stratégie à essayer ou un bon moment à partager. Mais acheter chaque jeu que l’on aimerait tester peut vite représenter un budget et prendre de la place.
            </p>
            <p>
              C’est de cette idée qu’est né Chat’Perlipopette : proposer la location de jeux pour permettre de varier les plaisirs, essayer des nouveautés et trouver facilement de quoi animer une soirée, un week-end ou un événement.
            </p>
            <p>
              Derrière le site, il y a une vraie personne. Je fais évoluer le projet petit à petit et je tiens à rester accessible : si vous avez une question, une suggestion ou besoin d’un renseignement, vous pouvez simplement me contacter.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Ma façon de faire</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Simple, pratique et convivial</h2>
            <p className="mt-4 text-lg leading-7 text-[#5B5140]">
              Je souhaite que la location soit facile à comprendre et agréable du premier clic jusqu’à la prochaine partie.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-[#EADCB9] bg-[#FFF8E8] p-6">
              <span className="text-4xl" aria-hidden="true">🔎</span>
              <h3 className="mt-4 text-xl font-extrabold">Bien choisir</h3>
              <p className="mt-2 leading-7 text-[#5B5140]">Un catalogue pour parcourir les jeux et repérer ceux qui correspondent à vos envies.</p>
            </article>
            <article className="rounded-2xl border border-[#EADCB9] bg-[#FFF8E8] p-6">
              <span className="text-4xl" aria-hidden="true">💬</span>
              <h3 className="mt-4 text-xl font-extrabold">Pouvoir échanger</h3>
              <p className="mt-2 leading-7 text-[#5B5140]">Une question avant de réserver ? Vous pouvez me contacter directement.</p>
            </article>
            <article className="rounded-2xl border border-[#EADCB9] bg-[#FFF8E8] p-6">
              <span className="text-4xl" aria-hidden="true">🎉</span>
              <h3 className="mt-4 text-xl font-extrabold">Profiter ensemble</h3>
              <p className="mt-2 leading-7 text-[#5B5140]">L’essentiel, c’est de faire découvrir des jeux et de partager de bons moments.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl bg-[#24211B] px-6 py-10 text-white sm:px-12 sm:py-14">
          <p className="font-extrabold uppercase tracking-widest text-[#F7D96C]">On fait connaissance ?</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Une question ou une idée ?</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
            Je serai ravi d’échanger avec vous. Que ce soit pour choisir un jeu, comprendre la location ou simplement faire une suggestion, n’hésitez pas à m’écrire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="mailto:chatperlipopette31@outlook.fr" className="rounded-xl bg-[#E8B223] px-6 py-4 text-center font-extrabold text-[#24211B] transition hover:bg-[#F7D96C]">
              M’écrire par e-mail
            </a>
            <Link href="/catalogue" className="rounded-xl border border-white/40 px-6 py-4 text-center font-extrabold transition hover:bg-white/10">
              Voir le catalogue
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/60">Chat’Perlipopette · Location de jeux de société dans le secteur de Toulouse.</p>
        </div>
      </section>
    </main>
  );
}
