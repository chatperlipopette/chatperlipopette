export default function Scanner() {
  return (
    <main className="min-h-screen bg-[#FFF8E8] p-10">
      <h1 className="mb-8 text-5xl font-bold">
        📷 Scanner un jeu
      </h1>

      <label className="mb-2 block font-bold">
        Code-barres
      </label>

      <input
        type="text"
        placeholder="Scanne le code-barres..."
        className="w-full rounded-xl border p-4 text-xl"
        autoFocus
      />

      <p className="mt-6 text-gray-600">
        Place le curseur dans le champ puis scanne un code-barres avec ton téléphone.
      </p>
    </main>
  );
}
