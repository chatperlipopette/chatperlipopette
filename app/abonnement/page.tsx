import Link from "next/link";

type Plan = "club" | "premium";

const plans: Record<Plan, { name: string; price: string; description: string; benefits: string[] }> = {
  club: {
    name: "Club",
    price: "6,99 €",
    description: "Pour profiter régulièrement de nouvelles parties.",
    benefits: [
      "Une location offerte par mois, jusqu’à 3 €",
      "5 % de réduction sur les autres locations",
      "Cumul des points fidélité",
      "Bonus d’anniversaire",
      "Accès aux réservations en avance",
    ],
  },
  premium: {
    name: "Club Premium",
    price: "9,99 €",
    description: "La formule supérieure pour les joueurs réguliers.",
    benefits: [
      "Les avantages du Club",
      "Une formule pensée pour les joueurs réguliers",
      "Les avantages Premium précis restent à confirmer",
    ],
  },
};

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const selectedPlan: Plan | null =
    params.plan === "club" || params.plan === "premium" ? params.plan : null;

  return (
    <main className="min-h-screen bg-[#FFF8E8] px-5 py-12 text-[#24211B] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-bold underline underline-offset-4">← Retour à l’accueil</Link>
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Chat’Perlipopette</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Choisis ton abonnement</h1>
          <p className="mt-4 text-lg leading-7 text-[#5B5140]">Sélectionne la formule qui correspond à ta façon de jouer.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {(Object.keys(plans) as Plan[]).map((key) => {
            const plan = plans[key];
            const selected = selectedPlan === key;
            return (
              <article key={key} className={`rounded-3xl border-2 bg-white p-7 shadow-sm ${selected ? "border-[#B8860B] ring-2 ring-[#E8B223]/40" : "border-[#EADCB9]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">{plan.name}</h2>
                    <p className="mt-2 text-[#5B5140]">{plan.description}</p>
                  </div>
                  {selected && <span className="rounded-full bg-[#FFF1BF] px-3 py-1 text-sm font-extrabold">Sélectionné ✓</span>}
                </div>
                <p className="mt-6"><span className="text-4xl font-black">{plan.price}</span><span className="ml-2 text-[#5B5140]">/ mois</span></p>
                <ul className="mt-6 space-y-3 leading-6">
                  {plan.benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}
                </ul>
                <Link
                  href={`/abonnement?plan=${key}`}
                  className={`mt-7 block rounded-xl px-5 py-4 text-center font-extrabold transition ${selected ? "bg-[#24211B] text-white" : "bg-[#E8B223] text-black hover:bg-[#D6A014]"}`}
                >
                  {selected ? "Formule sélectionnée" : `Choisir ${plan.name}`}
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[#E8B223] bg-[#FFF1BF] p-6">
          <h2 className="text-lg font-black">Dernière étape : le paiement</h2>
          {selectedPlan ? (
            <p className="mt-2 leading-7">Tu as sélectionné <strong>{plans[selectedPlan].name}</strong> à <strong>{plans[selectedPlan].price}/mois</strong>. La sélection fonctionne, mais le paiement récurrent n’est pas encore relié à cette page. Aucun abonnement ni paiement n’a été créé.</p>
          ) : (
            <p className="mt-2 leading-7">Choisis d’abord Club ou Club Premium. Le paiement récurrent doit ensuite être connecté avant de pouvoir finaliser l’abonnement.</p>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/#fidelite" className="font-bold underline underline-offset-4">Découvrir le programme fidélité</Link>
        </div>
      </div>
    </main>
  );
}
