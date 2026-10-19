import Link from "next/link";
import { getGames, type Game } from "../lib/games";
import { getCatalogueFlags } from "../lib/catalogue-flags";

export default async function FeaturedGames() {
  let games: Game[] = [];
  try {
    const [sourceGames, flags] = await Promise.all([getGames(), getCatalogueFlags()]);
    games = sourceGames.map((game) => {
      const savedFlags = flags.get(game.code_barre || game.nom);
      return { ...game, nouveaute: savedFlags?.nouveaute ?? false, coup_de_coeur: savedFlags?.coup_de_coeur ?? false };
    });
  } catch (error) {
    console.error("Impossible de charger les nouveautés et coups de cœur :", error);
    return null;
  }

  const nouveautés = games.filter((game) => game.nouveaute).sort((a, b) =>
    a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" })
  ).slice(0, 4);
  const coupsDeCoeur = games.filter((game) => game.coup_de_coeur).sort((a, b) =>
    a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" })
  ).slice(0, 4);

  if (nouveautés.length === 0 && coupsDeCoeur.length === 0) return null;

  const renderGames = (items: Game[], badgeLabel: string) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((game) => (
        <article key={game.code_barre || game.nom} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9A6B00]">
            {badgeLabel}
          </p>
          <h3 className="mt-2 text-lg font-black">{game.nom}</h3>
          {game.categories && <p className="mt-2 text-sm text-[#806000]">{game.categories}</p>}
          {game.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5B5140]">{game.description}</p>}
          <Link href={`/catalogue/${encodeURIComponent(game.code_barre || game.nom)}`} className="mt-4 inline-block font-extrabold underline underline-offset-4">
            Découvrir le jeu →
          </Link>
        </article>
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl space-y-12 px-5 py-12 sm:px-8">
      {nouveautés.length > 0 && (
        <div>
          <div className="mb-5">
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Tout juste arrivés</p>
            <h2 className="mt-2 text-3xl font-black">✨ Les nouveautés</h2>
          </div>
          {renderGames(nouveautés, "✨ Nouveauté")}
          <div className="mt-5"><Link href="/catalogue" className="font-extrabold underline underline-offset-4">Voir toutes les nouveautés dans le catalogue →</Link></div>
        </div>
      )}
      {coupsDeCoeur.length > 0 && (
        <div>
          <div className="mb-5">
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">Nos recommandations</p>
            <h2 className="mt-2 text-3xl font-black">❤️ Nos coups de cœur</h2>
          </div>
          {renderGames(coupsDeCoeur, "❤️ Coup de cœur")}
          <div className="mt-5"><Link href="/catalogue" className="font-extrabold underline underline-offset-4">Voir tous les coups de cœur dans le catalogue →</Link></div>
        </div>
      )}
    </section>
  );
}
