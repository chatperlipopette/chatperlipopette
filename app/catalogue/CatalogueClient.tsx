"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDuration } from "../../lib/games";

type Game = {
  code_barre: string;
  nom: string;
  editeur: string;
  nombre_min: number | null;
  nombre_max: number | null;
  duree: string;
  age: number | null;
  disponibilite: string;
  prix_location: number | null;
  prix_caution: number | null;
  description: string | null;
  categories?: string | null;
  annee?: number | null;
  image_url?: string;
  nouveaute?: boolean;
  coup_de_coeur?: boolean;
};

type Props = {
  games: Game[];
};

const CATEGORIES = [
  { value: "cooperatif", label: "🤝 Coopératif" },
  { value: "ambiance", label: "😂 Ambiance" },
  { value: "strategie", label: "🧠 Stratégie" },
  { value: "enquete", label: "🔎 Enquête" },
  { value: "famille", label: "👨‍👩‍👧 Famille" },
  { value: "a deux", label: "💑 À deux" },
  { value: "cartes", label: "🃏 Cartes" },
  { value: "adresse", label: "🎯 Adresse" },
  { value: "reflexion", label: "🧩 Réflexion" },
];

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categoryLabel(value: string): string {
  const labels: Record<string, string> = {
    cooperatif: "🤝 Coopératif",
    ambiance: "😂 Ambiance",
    strategie: "🧠 Stratégie",
    enquete: "🔎 Enquête",
    famille: "👨‍👩‍👧 Famille",
    "a deux": "💑 À deux",
    cartes: "🃏 Cartes",
    adresse: "🎯 Adresse",
    reflexion: "🧩 Réflexion",
    autres: "🎲 Autres jeux",
  };
  return labels[normalize(value)] || value.charAt(0).toUpperCase() + value.slice(1);
}

function GameCover({ game }: { game: Game }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const primaryImageUrl = game.image_url?.startsWith("https://") ? game.image_url : null;
  const imageUrl = primaryImageUrl && !imageFailed ? primaryImageUrl : fallbackUrl;

  useEffect(() => {
    // Si l'image enregistrée est valide, on la garde. Sinon, recherche d'une image de secours.
    if (primaryImageUrl && !imageFailed) return;

    let cancelled = false;
    setFallbackUrl(null);

    fetch(`/api/game-cover?name=${encodeURIComponent(game.nom)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && typeof data?.imageUrl === "string" && data.imageUrl.startsWith("https://")) {
          setFallbackUrl(data.imageUrl);
        }
      })
      .catch(() => {
        // La recherche externe peut échouer : le dé de remplacement reste visible.
      });

    return () => {
      cancelled = true;
    };
  }, [primaryImageUrl, game.nom, imageFailed]);

  return (
    <div className="flex h-52 items-center justify-center bg-[#F8F3E7] p-3">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`Boîte du jeu ${game.nom}`}
          loading="lazy"
          className="h-full w-full object-contain"
          onError={() => {
            if (primaryImageUrl && !imageFailed) {
              setImageFailed(true);
            } else {
              setFallbackUrl(null);
            }
          }}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-[#806000]"
          role="img"
          aria-label={`Couverture indisponible pour ${game.nom}`}
        >
          <span className="text-6xl" aria-hidden="true">🎲</span>
          <span className="text-xs font-semibold">Photo indisponible</span>
        </div>
      )}
    </div>
  );
}

function durationInMinutes(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;

  const raw = value.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  // A range must use its longest endpoint, including explicit units.
  const range = raw.match(/^(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|heure|heures|min|m|minute|minutes)?\s*(?:-|–|—|a|to)\s*(\d+(?:[.,]\d+)?)\s*(h|hr|hrs|heure|heures|min|m|minute|minutes)?$/);
  if (range) {
    const first = Number(range[1].replace(",", "."));
    const second = Number(range[3].replace(",", "."));
    const firstUnit = range[2] || range[4] || "";
    const secondUnit = range[4] || range[2] || "";
    const toMinutes = (n: number, unit: string) => /^(h|hr|hrs|heure|heures)$/.test(unit) ? n * 60 : n;
    return Math.max(toMinutes(first, firstUnit), toMinutes(second, secondUnit));
  }

  // Use the shared formatter to interpret values like 1h30 and bare numbers consistently.
  const formatted = formatDuration(value).toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hours = formatted.match(/(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|heure|heures)(?:\b|$)/);
  const minutes = formatted.match(/(\d+)\s*(?:m|min|minute|minutes)\b/);
  if (hours || minutes) {
    return (hours ? Number(hours[1].replace(",", ".")) * 60 : 0) +
      (minutes ? Number(minutes[1]) : 0);
  }

  if (/^\d+(?:[.,]\d+)?$/.test(formatted)) {
    return Number(formatted.replace(",", "."));
  }

  return null;
}
function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Non indiqué";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CatalogueClient({ games }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("tous");
  const [availability, setAvailability] = useState("tous");
  const [specialFilter, setSpecialFilter] = useState("tous");
  const [ageFilter, setAgeFilter] = useState("tous");
  const [durationFilter, setDurationFilter] = useState("tous");
  const [playersFilter, setPlayersFilter] = useState("tous");
  const [maxPriceFilter, setMaxPriceFilter] = useState("tous");

  const filteredGames = useMemo(() => {
    const searchTerms = normalize(search).split(" ").filter(Boolean);

    return games.filter((game) => {
      const searchable = normalize(
        [
          game.nom,
          game.code_barre,
          game.editeur,
          game.description,
          game.categories,
          game.duree,
          game.age === null ? "" : String(game.age),
          game.nombre_min === null ? "" : String(game.nombre_min),
          game.nombre_max === null ? "" : String(game.nombre_max),
        ].filter(Boolean).join(" ")
      );

      // Toutes les parties de la recherche doivent être présentes, quel que soit leur ordre.
      const matchesSearch = searchTerms.every((term) => searchable.includes(term));

      const gameCategories = (game.categories || "")
        .split(",")
        .map((item) => normalize(item))
        .filter(Boolean);
      const matchesCategory =
        category === "tous" || gameCategories.includes(normalize(category));

      const normalizedAvailability = normalize(game.disponibilite);
      const isAvailable =
        normalizedAvailability === "dispo" ||
        normalizedAvailability === "disponible" ||
        normalizedAvailability === "oui";

      const matchesAvailability =
        availability === "tous" ||
        (availability === "disponibles" && isAvailable) ||
        (availability === "indisponibles" && !isAvailable);

      const matchesSpecial =
        specialFilter === "tous" ||
        (specialFilter === "nouveautes" && game.nouveaute === true) ||
        (specialFilter === "coups-de-coeur" && game.coup_de_coeur === true);

      const matchesAge =
        ageFilter === "tous" ||
        (game.age !== null && game.age <= Number(ageFilter));

      const minutes = durationInMinutes(game.duree);
      const matchesDuration =
        durationFilter === "tous" ||
        (minutes !== null && (
          (durationFilter === "15" && minutes < 15) ||
          (durationFilter === "15-30" && minutes >= 15 && minutes <= 30) ||
          (durationFilter === "30-60" && minutes > 30 && minutes <= 60) ||
          (durationFilter === "60+" && minutes > 60)
        ));

      const matchesPlayers =
        playersFilter === "tous" ||
        (game.nombre_min !== null && game.nombre_max !== null && (
          (playersFilter === "1" && game.nombre_min <= 1 && game.nombre_max >= 1) ||
          (playersFilter === "2" && game.nombre_min <= 2 && game.nombre_max >= 2) ||
          (playersFilter === "3-4" && game.nombre_min <= 4 && game.nombre_max >= 3) ||
          (playersFilter === "5-6" && game.nombre_min <= 6 && game.nombre_max >= 5) ||
          (playersFilter === "7+" && game.nombre_max >= 7)
        ));

      const matchesPrice =
        maxPriceFilter === "tous" ||
        (game.prix_location !== null && game.prix_location <= Number(maxPriceFilter));

      return matchesSearch && matchesCategory && matchesAvailability && matchesSpecial &&
        matchesAge && matchesDuration && matchesPlayers && matchesPrice;
    });
  }, [games, search, category, availability, specialFilter, ageFilter, durationFilter, playersFilter, maxPriceFilter]);

  const similarGames = useMemo(() => {
    if (specialFilter !== "coups-de-coeur") return [];
    const likedGames = games.filter((game) => game.coup_de_coeur === true);
    const likedIds = new Set(likedGames.map((game) => game.code_barre || game.nom));
    const likedCategories = new Set(
      likedGames.flatMap((game) => (game.categories || "").split(",").map((item) => normalize(item)).filter(Boolean))
    );
    if (likedCategories.size === 0) return [];
    return games
      .filter((game) => {
        const id = game.code_barre || game.nom;
        if (likedIds.has(id) || game.coup_de_coeur === true) return false;
        return (game.categories || "").split(",").map((item) => normalize(item)).some((category) => likedCategories.has(category));
      })
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }))
      .slice(0, 8);
  }, [games, specialFilter]);

  return (
    <section>
      <div className="mb-8 rounded-3xl border border-[#EADCB9] bg-white p-5 shadow-sm md:p-7">
        <label htmlFor="game-search" className="mb-2 block text-sm font-bold text-gray-700">
          Rechercher un jeu
        </label>
        <input
          id="game-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom du jeu, éditeur, mot-clé…"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-[#D6A014] focus:ring-2 focus:ring-[#E8B223]/30"
        />

        <div className="mt-5">
          <p className="mb-3 text-sm font-bold text-gray-700">À découvrir</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "tous", label: "🎲 Tous les jeux" },
              { value: "nouveautes", label: "✨ Nouveautés" },
              { value: "coups-de-coeur", label: "❤️ Coups de cœur" },
            ].map((item) => (
              <button key={item.value} type="button" onClick={() => setSpecialFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${specialFilter === item.value ? "border-[#24211B] bg-[#24211B] text-white" : "border-gray-300 bg-white text-gray-800 hover:border-[#E8B223]"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-bold text-gray-700">Filtrer par catégorie</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("tous")}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${category === "tous" ? "border-[#24211B] bg-[#24211B] text-white" : "border-gray-300 bg-white text-gray-800 hover:border-[#E8B223]"}`}
            >
              🎲 Toutes
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${category === item.value ? "border-[#24211B] bg-[#24211B] text-white" : "border-gray-300 bg-white text-gray-800 hover:border-[#E8B223]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="age-filter" className="text-sm font-bold text-gray-700">Âge minimum conseillé</label>
            <select id="age-filter" value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="tous">Tous les âges</option>
              <option value="3">Jusqu'à 3 ans</option>
              <option value="6">Jusqu'à 6 ans</option>
              <option value="8">Jusqu'à 8 ans</option>
              <option value="10">Jusqu'à 10 ans</option>
              <option value="12">Jusqu'à 12 ans</option>
              <option value="14">Jusqu'à 14 ans</option>
              <option value="18">Jusqu'à 18 ans</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="duration-filter" className="text-sm font-bold text-gray-700">Durée d'une partie</label>
            <select id="duration-filter" value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="tous">Toutes les durées</option>
              <option value="15">Moins de 15 minutes</option>
              <option value="15-30">15 à 30 minutes</option>
              <option value="30-60">30 à 60 minutes</option>
              <option value="60+">Plus d'une heure</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="players-filter" className="text-sm font-bold text-gray-700">Nombre de joueurs</label>
            <select id="players-filter" value={playersFilter} onChange={(event) => setPlayersFilter(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="tous">Tous les nombres</option>
              <option value="1">Solo</option>
              <option value="2">2 joueurs</option>
              <option value="3-4">3 à 4 joueurs</option>
              <option value="5-6">5 à 6 joueurs</option>
              <option value="7+">7 joueurs et plus</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="price-filter" className="text-sm font-bold text-gray-700">Prix maximum de location</label>
            <select id="price-filter" value={maxPriceFilter} onChange={(event) => setMaxPriceFilter(event.target.value)} className="rounded-xl border border-gray-300 bg-white px-3 py-2">
              <option value="tous">Tous les prix</option>
              <option value="2">Jusqu'à 2 €</option>
              <option value="5">Jusqu'à 5 €</option>
              <option value="10">Jusqu'à 10 €</option>
              <option value="15">Jusqu'à 15 €</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="availability-filter" className="text-sm font-bold text-gray-700">
            Disponibilité
          </label>
          <select
            id="availability-filter"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2"
          >
            <option value="tous">Tous les jeux</option>
            <option value="disponibles">Disponibles uniquement</option>
            <option value="indisponibles">Indisponibles uniquement</option>
          </select>
          <p className="text-sm text-gray-600 sm:ml-auto">
            {filteredGames.length} jeu{filteredGames.length > 1 ? "x" : ""} trouvé{filteredGames.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="rounded-3xl border border-[#EADCB9] bg-white p-10 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">🔎</div>
          <h2 className="mt-4 text-2xl font-black text-gray-900">Aucun jeu trouvé</h2>
          <p className="mt-2 text-gray-600">Essaie un autre mot-clé ou retire certains filtres.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("tous");
              setAvailability("tous");
              setSpecialFilter("tous");
              setAgeFilter("tous");
              setDurationFilter("tous");
              setPlayersFilter("tous");
              setMaxPriceFilter("tous");
            }}
            className="mt-5 rounded-xl bg-[#E8B223] px-5 py-3 font-bold text-black hover:bg-[#D6A014]"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(
            new Set(
              filteredGames.flatMap((game) =>
                (game.categories || "autres").split(",").map((item) => item.trim()).filter(Boolean)
              )
            )
          ).map((group) => {
            const groupedGames = filteredGames
              .filter((game) => (game.categories || "autres").split(",").map((item) => item.trim()).includes(group))
              .sort((a, b) => {
                const yearA = a.annee && a.annee > 0 ? a.annee : Number.MAX_SAFE_INTEGER;
                const yearB = b.annee && b.annee > 0 ? b.annee : Number.MAX_SAFE_INTEGER;
                return a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" });
              });
            return (
              <section key={group}>
                <h2 className="mb-4 text-2xl font-black text-gray-900">{categoryLabel(group)} <span className="text-base font-semibold text-gray-500">({groupedGames.length})</span></h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedGames.map((game, index) => {
            const gameId = game.code_barre || game.nom || String(index);
            const available = ["dispo", "disponible", "oui"].includes(normalize(game.disponibilite));
            const displayDescription =
              game.description?.trim() ||
              `Découvrez ${game.nom}, un jeu de société à partager selon vos envies. ${game.nombre_min !== null && game.nombre_max !== null ? `Il se joue de ${game.nombre_min} à ${game.nombre_max} joueurs. ` : ""}${game.age !== null ? `Accessible dès ${game.age} ans. ` : ""}${game.duree ? `Comptez environ ${formatDuration(game.duree)}. ` : ""}À louer chez Chat’Perlipopette !`;

            return (
              <article
                key={gameId}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#EADCB9] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <GameCover game={game} />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black leading-tight text-gray-900">{game.nom}</h2>
                      {game.nouveaute && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-extrabold text-blue-800">✨ Nouveauté</span>}
                      {game.coup_de_coeur && <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-extrabold text-pink-800">❤️ Coup de cœur</span>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {available ? "Disponible" : "Indisponible"}
                    </span>
                  </div>

                  {game.editeur && <p className="text-sm text-gray-500">Éditeur : {game.editeur}</p>}
                  {game.annee && <p className="text-sm text-gray-500">Année de sortie : {game.annee}</p>}
                  {game.categories && <p className="mt-2 text-sm font-semibold text-[#806000]">{game.categories}</p>}

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {(game.nombre_min !== null || game.nombre_max !== null) && (
                      <p>👥 {game.nombre_min ?? "?"}–{game.nombre_max ?? "?"} joueurs</p>
                    )}
                    {game.age !== null && <p>🎂 Dès {game.age} ans</p>}
                    {game.duree && <p>⏱️ {formatDuration(game.duree)}</p>}
                  </div>

                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-600">{displayDescription}</p>

                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-lg font-black text-gray-900">{formatPrice(game.prix_location)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Caution</p>
                        <p className="font-bold text-gray-800">{formatPrice(game.prix_caution)}</p>
                      </div>
                    </div>
                    <Link
                      href={`/catalogue/${encodeURIComponent(gameId)}`}
                      className="mt-4 block rounded-xl bg-[#E8B223] px-4 py-3 text-center font-extrabold text-black transition hover:bg-[#D6A014]"
                    >
                      Voir le jeu
                    </Link>
                  </div>
                </div>
              </article>
            );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {specialFilter === "coups-de-coeur" && similarGames.length > 0 && (
        <section className="mt-12">
          <div className="mb-5">
            <p className="font-extrabold uppercase tracking-widest text-[#9A6B00]">À découvrir aussi</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">🎲 Des jeux dans le même style</h2>
            <p className="mt-2 text-gray-600">D’autres jeux qui partagent les catégories de tes coups de cœur, sans être marqués comme coups de cœur.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarGames.map((game) => (
              <article key={game.code_barre || game.nom} className="rounded-2xl border border-[#EADCB9] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-gray-900">{game.nom}</h3>
                {game.categories && <p className="mt-2 text-sm font-semibold text-[#806000]">{game.categories}</p>}
                {game.editeur && <p className="mt-2 text-sm text-gray-500">Éditeur : {game.editeur}</p>}
                <Link href={`/catalogue/${encodeURIComponent(game.code_barre || game.nom)}`} className="mt-4 inline-block font-extrabold underline underline-offset-4">
                  Voir le jeu →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
