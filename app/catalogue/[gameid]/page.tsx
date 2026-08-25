import { getGames } from "../../../lib/games";

type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

export default async function GamePage({
  params,
}: Props) {
  const { gameid } = await params;

  const games = await getGames();

  const code = decodeURIComponent(gameid).trim();

  const jeu = games.find(
    (item) =>
      String(item.code_barre ?? "").trim() === code
  );

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-6">

      <h1 className="text-3xl font-black">
        TEST FICHE
      </h1>

      <p className="mt-6">
        Code reçu :
      </p>

      <p className="font-bold">
        {code}
      </p>

      <p className="mt-6">
        Nombre de jeux chargés :
      </p>

      <p className="font-bold">
        {games.length}
      </p>

      <p className="mt-6">
        Jeu trouvé :
      </p>

      <p className="font-bold">
        {jeu?.nom ?? "AUCUN JEU TROUVÉ"}
      </p>

    </main>
  );
}
