"use client";

import Link from "next/link";

export default function FidelitePage() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] px-5 py-12 text-[#29251E] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold underline underline-offset-4">← Retour à l’accueil</Link>

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#8EC9B5] px-7 py-12 sm:px-12 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#245343]">Chat’Perlipopette</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">Le programme fidélité</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#245343]">
            Merci de faire vivre Chat’Perlipopette et de revenir jouer avec nous !
            Cette page sera dédiée aux avantages et aux récompenses réservés aux clients fidèles.
          </p>
        </section>

        <section className="mt-10 rounded-3xl border border-[#EADCB9] bg-white p-7 sm:p-10">
          <h2 className="text-2xl font-black">Vos avantages fidélité</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#5B5140]">
            Les modalités du programme, le cumul des points et les récompenses seront détaillés ici dès que le programme fidélité sera activé.
          </p>
          <p className="mt-4 text-sm text-[#6B6253]">
            À noter : le programme fidélité est distinct des abonnements mensuels.
          </p>
          <Link href="/abonnement" className="mt-7 inline-flex rounded-xl bg-[#29251E] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-black">
            Découvrir les abonnements
          </Link>
        </section>
      </div>
    </main>
  );
}
