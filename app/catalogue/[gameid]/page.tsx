type Props = {
  params: Promise<{
    gameid: string;
  }>;
};

export default async function GamePage({ params }: Props) {
  const { gameid } = await params;

  return (
    <main className="min-h-screen bg-[#FFF8E8] p-10">
      <h1 className="text-4xl font-black">
        Page du jeu
      </h1>

      <p className="mt-4 text-xl">
        Code reçu :
      </p>

      <p className="mt-2 text-2xl font-bold">
        {gameid}
      </p>
    </main>
  );
}
