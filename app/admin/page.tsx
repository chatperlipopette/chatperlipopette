import Link from "next/link";

export default function Admin() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] p-10">
      <h1 className="mb-10 text-5xl font-bold">
        🛠 Administration Chat'Perlipopette
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <Link
          href="/admin/scanner"
          className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-bold">
            📷 Scanner un jeu
          </h2>

          <p className="mt-2">
            Ajouter automatiquement un jeu grâce au code-barres.
          </p>
        </Link>

        <Link
          href="/admin/jeux"
          className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-bold">
            🎲 Gérer les jeux
          </h2>

          <p className="mt-2">
            Modifier les jeux, les prix et les disponibilités.
          </p>
        </Link>

        <Link
          href="/admin/reservations"
          className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition"
        >
          <h2 className="text-2xl font-bold">
            📅 Réservations
          </h2>

          <p className="mt-2">
            Voir les locations en cours.
          </p>
        </Link>

      </div>
    </main>
  );
}