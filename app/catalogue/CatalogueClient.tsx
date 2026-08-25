


IMG_0541.png

Oui 👍 Je vois bien le catalogue sur ton iPhone.

Il est déjà fonctionnel avec :

🔎 recherche

👥 joueurs minimum / maximum

🎂 âge maximum

⏱️ durée maximum

🟢 disponibilité

🔄 réinitialisation

Ce que je changerais sur téléphone
Je garderais tous les filtres, mais je rendrais le catalogue plus agréable :

Titre “Catalogue (503 jeux)” plus petit pour éviter qu'il prenne presque tout l'écran.

🔎 Barre de recherche plus compacte.

🎯 Bloc filtres moins haut.

Les filtres pourraient être repliables avec un bouton « Filtres ».

Après les filtres, les jeux apparaîtraient sous forme de cartes adaptées à l'iPhone.

Le bouton Réinitialiser resterait facilement accessible.

Je ne veux pas toucher au fonctionnement actuel des filtres, puisqu'ils fonctionnent déjà.

Pour faire ça proprement, il me faut maintenant le fichier actuel :

app → catalogue → CatalogueClient.tsx

👉 Ouvre CatalogueClient.tsx sur GitHub et envoie-moi une capture du début du fichier.
À partir de ton fichier actuel, je te donnerai le script entier modifié, sans risquer de supprimer tes filtres existants.



Texte collé(4).txt
Document

Parfait 👍 J’ai bien récupéré ton CatalogueClient.tsx actuel. Il contient déjà tous tes filtres et le tri A→Z. 


J’ai préparé une version adaptée au téléphone qui :

📱 replie les filtres sur iPhone pour réduire fortement la hauteur de la page ;

🔎 garde la recherche ;

👥 garde joueurs min/max ;

🎂 garde l’âge maximum ;

⏱️ garde la durée maximum ;

📦 garde la disponibilité ;

🔄 garde la réinitialisation ;

🔢 affiche le nombre de résultats ;

🎲 garde les cartes des jeux et le bouton Voir le jeu ;

🔤 conserve le tri alphabétique A → Z. 


Télécharge le nouveau fichier ici :

📄 Télécharger CatalogueClient_mobile.tsx

Pour l'installer sur GitHub
Dans :

app → catalogue → CatalogueClient.tsx

Clique sur ✏️

Ctrl + A

Supprime tout

Ouvre le fichier téléchargé et copie tout son contenu

Colle-le dans GitHub

Commit changes

Attends que Vercel affiche 🟢 Ready

⚠️ Ne touche pas à app/catalogue/[gameid]/page.tsx : la fiche du jeu fonctionne maintenant.

Après le déploiement, on testera d'abord le catalogue sur ton iPhone avant de modifier autre chose. 


CatalogueClient_mobile.tsx
Code


que dois je faire

Oui 👍 On va le faire ensemble, étape par étape.

Tu es actuellement sur GitHub, dans le fichier CatalogueClient.tsx.

Étape 1 — ouvre le fichier
Va dans :

app → catalogue → CatalogueClient.tsx

Puis clique sur le bouton ✏️ en haut à droite pour modifier le fichier.

Étape 2 — remplace le code
Dans l'éditeur :

Clique dans le code.

Fais Ctrl + A.

Fais Suppr.

Ouvre le fichier que je t'ai préparé :

📄 Ouvrir le nouveau CatalogueClient.tsx

Fais Ctrl + A, puis Ctrl + C.

Retourne sur GitHub.

Fais Ctrl + V dans l'éditeur.

Étape 3 — enregistre
En haut à droite, clique sur :

Commit changes...

Puis confirme avec :

Commit changes

⏳ Ensuite attends que Vercel redéploie le site.

Ne modifie aucun autre fichier pour l'instant.

Si tu veux, envoie-moi une capture de l'écran GitHub où tu es maintenant, et je te dirai exactement où cliquer.


CatalogueClient_mobile.tsx
Code


Bibliothèque
/
CatalogueClient_mobile.tsx


"use client";

import { useMemo, useState } from "react";

type Game = {
  id?: number | string;
  code_barre?: string | null;
  nom?: string | null;
  editeur?: string | null;
  nombre_min?: number | string | null;
  nombre_max?: number | string | null;
  joueurs_min?: number | string | null;
  joueurs_max?: number | string | null;
  duree?: string | number | null;
  age?: number | string | null;
  disponibilite?: string | boolean | null;
  disponible?: string | boolean | null;
  prix_location?: number | string | null;
  prix_caution?: number | string | null;
  description?: string | null;
  image_url?: string | null;
  image?: string | null;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).replace(/\u00A0/g, "").replace(/\s/g, "").replace(",", ".").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function formatPrice(value: unknown): string | null {
  const number = toNumber(value);
  return number === null ? null : number.toFixed(2).replace(".", ",") + " €";
}

function formatDuree(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Durée non renseignée";
  const text = String(value).trim();
  if (!text) return "Durée non renseignée";
  return text.toLowerCase().includes("min") ? text : `${text} min`;
}

function getDuree(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = parseFloat(String(value).replace(",", ".").trim());
  return Number.isFinite(number) ? number : null;
}

function isAvailable(game: Game): boolean {
  if (typeof game.disponible === "boolean") return game.disponible;
  const value = game.disponibilite ?? game.disponible ?? "";
  const text = String(value).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return text === "dispo" || text === "disponible" || text === "oui" || text === "yes" || text === "true";
}

function getNombreMin(game: Game): number | null {
  return toNumber(game.nombre_min ?? game.joueurs_min);
}

function getNombreMax(game: Game): number | null {
  return toNumber(game.nombre_max ?? game.joueurs_max);
}

function getAge(game: Game): number | null {
  return toNumber(game.age);
}

export default function CatalogueClient({ games }: { games: Game[] }) {
  const [search, setSearch] = useState("");
  const [joueursMin, setJoueursMin] = useState("");
  const [joueursMax, setJoueursMax] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [dureeMax, setDureeMax] = useState("");
  const [disponibilite, setDisponibilite] = useState("tous");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = [
    joueursMin,
    joueursMax,
    ageMax,
    dureeMax,
    disponibilite !== "tous" ? disponibilite : "",
  ].filter(Boolean).length;

  const filteredGames = useMemo(() => {
    const recherche = search.trim().toLowerCase();
    const minJoueurs = joueursMin ? Number(joueursMin) : null;
    const maxJoueurs = joueursMax ? Number(joueursMax) : null;
    const maximumAge = ageMax ? Number(ageMax) : null;
    const maximumDuree = dureeMax ? Number(dureeMax) : null;

    const jeuxTries = [...games].sort((a, b) =>
      String(a.nom ?? "").trim().localeCompare(String(b.nom ?? "").trim(), "fr", {
        sensitivity: "base",
        numeric: true,
      })
    );

    return jeuxTries.filter((game) => {
      if (recherche) {
        const nom = String(game.nom ?? "").toLowerCase();
        const editeur = String(game.editeur ?? "").toLowerCase();
        if (!nom.includes(recherche) && !editeur.includes(recherche)) return false;
      }

      const nombreMin = getNombreMin(game);
      const nombreMax = getNombreMax(game);
      if (minJoueurs !== null && nombreMax !== null && nombreMax < minJoueurs) return false;
      if (maxJoueurs !== null && nombreMin !== null && nombreMin > maxJoueurs) return false;

      const age = getAge(game);
      if (maximumAge !== null && (age === null || age > maximumAge)) return false;

      const duree = getDuree(game.duree);
      if (maximumDuree !== null && duree !== null && duree > maximumDuree) return false;

      if (disponibilite === "disponible" && !isAvailable(game)) return false;
      if (disponibilite === "indisponible" && isAvailable(game)) return false;

      return true;
    });
  }, [games, search, joueursMin, joueursMax, ageMax, dureeMax, disponibilite]);

  function resetFilters() {
    setSearch("");
    setJoueursMin("");
    setJoueursMax("");
    setAgeMax("");
    setDureeMax("");
    setDisponibilite("tous");
  }

  return (
    <div className="w-full">
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="🔍 Rechercher un jeu ou un éditeur..."
        aria-label="Rechercher un jeu ou un éditeur"
        className="mb-4 w-full rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-base outline-none transition focus:border-[#E8B223] sm:mb-6 sm:text-lg"
      />

      <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-lg sm:mb-8">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">🎯 Filtres</h2>
            {activeFilters > 0 && (
              <p className="mt-1 text-sm font-semibold text-gray-500">
                {activeFilters} filtre{activeFilters > 1 ? "s" : ""} actif{activeFilters > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="rounded-xl bg-gray-100 px-4 py-3 font-black text-gray-800 active:scale-[0.98] sm:hidden"
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? "▲ Fermer" : "▼ Ouvrir"}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="hidden rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-300 sm:block"
          >
            🔄 Réinitialiser
          </button>
        </div>

        <div className={filtersOpen ? "border-t border-gray-100 px-4 pb-5 sm:block sm:border-0 sm:px-6 sm:pb-6" : "hidden border-t border-gray-100 px-4 pb-5 sm:block sm:border-0 sm:px-6 sm:pb-6"}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">👥 Joueurs minimum</label>
              <select value={joueursMin} onChange={(event) => setJoueursMin(event.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-base outline-none focus:border-[#E8B223]">
                <option value="">Tous</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option><option value="6">6+</option><option value="8">8+</option><option value="10">10+</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">👥 Joueurs maximum</label>
              <select value={joueursMax} onChange={(event) => setJoueursMax(event.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-base outline-none focus:border-[#E8B223]">
                <option value="">Tous</option><option value="2">Jusqu'à 2</option><option value="3">Jusqu'à 3</option><option value="4">Jusqu'à 4</option><option value="5">Jusqu'à 5</option><option value="6">Jusqu'à 6</option><option value="8">Jusqu'à 8</option><option value="10">Jusqu'à 10</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">🎂 Âge maximum</label>
              <select value={ageMax} onChange={(event) => setAgeMax(event.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-base outline-none focus:border-[#E8B223]">
                <option value="">Tous les âges</option><option value="3">Jusqu'à 3 ans</option><option value="6">Jusqu'à 6 ans</option><option value="8">Jusqu'à 8 ans</option><option value="10">Jusqu'à 10 ans</option><option value="12">Jusqu'à 12 ans</option><option value="14">Jusqu'à 14 ans</option><option value="16">Jusqu'à 16 ans</option><option value="18">Jusqu'à 18 ans</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">⏱️ Durée maximum</label>
              <select value={dureeMax} onChange={(event) => setDureeMax(event.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-base outline-none focus:border-[#E8B223]">
                <option value="">Toutes</option><option value="15">15 min maximum</option><option value="30">30 min maximum</option><option value="45">45 min maximum</option><option value="60">1 h maximum</option><option value="90">1 h 30 maximum</option><option value="120">2 h maximum</option><option value="180">3 h maximum</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">📦 Disponibilité</label>
              <select value={disponibilite} onChange={(event) => setDisponibilite(event.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-base outline-none focus:border-[#E8B223]">
                <option value="tous">Tous les jeux</option><option value="disponible">🟢 Disponibles</option><option value="indisponible">🔴 Indisponibles</option>
              </select>
            </div>
          </div>

          <button type="button" onClick={resetFilters} className="mt-4 w-full rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-700 active:scale-[0.98] sm:hidden">
            🔄 Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3 text-base text-gray-700 sm:mb-6 sm:text-lg">
        <span><strong>{filteredGames.length}</strong> jeu{filteredGames.length > 1 ? "x" : ""} trouvé{filteredGames.length > 1 ? "s" : ""}</span>
        {activeFilters > 0 && <button type="button" onClick={resetFilters} className="text-sm font-bold text-gray-600 underline sm:hidden">Effacer</button>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGames.map((game, index) => {
          const nom = game.nom || "Nom non renseigné";
          const editeur = game.editeur || "Non renseigné";
          const nombreMin = getNombreMin(game);
          const nombreMax = getNombreMax(game);
          const age = getAge(game);
          const duree = formatDuree(game.duree);
          const prixLocation = formatPrice(game.prix_location);
          const prixCaution = formatPrice(game.prix_caution);
          const disponible = isAvailable(game);
          const description = game.description?.trim() || "";
          const uniqueKey = `${game.code_barre || nom}-${index}`;
          const gameIdentifier = game.code_barre?.trim() || game.nom?.trim() || "";

          return (
            <div key={uniqueKey} className="overflow-hidden rounded-3xl bg-white shadow-lg">
              <div className="flex h-48 items-center justify-center bg-gray-100 sm:h-56">
                {game.image_url || game.image ? (
                  <img src={game.image_url || game.image || ""} alt={nom} loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400"><div className="text-5xl">🎲</div><p className="mt-2 text-xs">Image bientôt disponible</p></div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-black leading-tight text-gray-900 sm:text-2xl">{nom}</h2>

                {description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{description}</p>}

                <p className="mt-3 text-sm text-gray-700"><strong>Éditeur :</strong> {editeur}</p>
                <p className="mt-2 text-sm text-gray-700">👥 {nombreMin !== null ? nombreMin : "?"}{nombreMax !== null ? ` à ${nombreMax}` : ""} joueurs</p>
                <p className="mt-1 text-sm text-gray-700">🎂 {age !== null ? `${age}+` : "Âge non renseigné"}</p>
                <p className="mt-1 text-sm text-gray-700">⏱️ {duree}</p>

                <div className="mt-4">
                  <p className="text-2xl font-black text-[#E8B223]">{prixLocation ?? "Prix non renseigné"}</p>
                  {prixCaution && <p className="mt-1 text-sm font-medium text-gray-600">🔐 Caution : {prixCaution}</p>}
                </div>

                <div className={`mt-4 rounded-xl py-3 text-center text-sm font-black ${disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {disponible ? "🟢 Disponible" : "🔴 Indisponible"}
                </div>

                {gameIdentifier ? (
                  <a href={`/catalogue/${encodeURIComponent(gameIdentifier)}`} className="mt-4 block min-h-12 w-full rounded-xl bg-black py-3 text-center font-black text-white active:scale-[0.98]">Voir le jeu</a>
                ) : (
                  <div className="mt-4 rounded-xl bg-gray-200 py-3 text-center font-bold text-gray-500">Fiche indisponible</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow sm:p-10">
          <div className="text-5xl">🎲</div>
          <p className="mt-4 text-xl font-black text-gray-700">Aucun jeu trouvé</p>
          <p className="mt-2 text-sm text-gray-500">Essaie avec un autre nom ou modifie les filtres.</p>
          <button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-black px-5 py-3 font-bold text-white">🔄 Réinitialiser</button>
        </div>
      )}
    </div>
  );
}
