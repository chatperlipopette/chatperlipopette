const GOOGLE_SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1DbiNsGdrjT76s70wAFH92OI2gUTyrRlqg8mGtrD3RxVVgLsHQieMXupWs1CYSZkW6TW1N5wVcBuG/pub?gid=0&single=true&output=csv";

export type Game = {
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
  categories: string;
  annee?: number | null;
  image_url?: string;
  nouveaute?: boolean;
  coup_de_coeur?: boolean;
};

/* NETTOYAGE */
function parseBoolean(value: unknown): boolean {
  const text = clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return ["oui", "yes", "true", "1", "x", "oui!", "nouveau", "nouveaute", "coup de coeur", "favori"].includes(text);
}

function clean(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/^\uFEFF/, "")
    .trim();
}

/**
 * Affiche les durées avec une unité explicite.
 * Les nombres seuls du tableur sont interprétés comme des minutes.
 * Les formats déjà explicites (1h30, 90 min, 2 heures...) sont reconnus.
 */
export function formatDuration(value: unknown): string {
  const raw = clean(value);
  if (!raw) return "";

  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/\\s+/g, " ")
    .trim();

  const formatMinutes = (total: number): string => {
    if (!Number.isFinite(total) || total < 0) return raw;
    const minutes = Math.round(total);
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours === 0) return `${minutes} min`;
    return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
  };

  // Formats comme 1h30, 1 h 30 min, 2 heures ou 1.5 h.
  const hourMatch = normalized.match(/^(\\d+(?:[.,]\\d+)?)\\s*(?:h|heure|heures|hr|hrs)(?:\\s*(\\d+)\\s*(?:m|min|minute|minutes)?)?$/);
  if (hourMatch) {
    const hours = Number(hourMatch[1].replace(",", "."));
    const minutes = Number(hourMatch[2] || 0);
    return formatMinutes(hours * 60 + minutes);
  }

  // Formats comme 45 min, 90 minutes.
  const minuteMatch = normalized.match(/^(\\d+)\\s*(?:m|min|minute|minutes)$/);
  if (minuteMatch) return formatMinutes(Number(minuteMatch[1]));

  // Un nombre seul dans la colonne Durée est considéré comme un nombre de minutes.
  if (/^\\d+(?:[.,]\\d+)?$/.test(normalized)) {
    return formatMinutes(Number(normalized.replace(",", ".")));
  }

  // Pour les plages ou formulations plus complexes, conserver le texte déjà saisi
  // s'il précise son unité, plutôt que de risquer une conversion incorrecte.
  if (/(?:\\bmin(?:ute)?s?\\b|\\bh(?:eure)?s?\\b|\\bheures?\\b)/.test(normalized)) {
    return raw
      .replace(/\\bminutes?\\b/gi, "min")
      .replace(/\\bheures?\\b/gi, "h");
  }

  // Exemples de formats reconnus en plus : 1:30 signifie 1 h 30.
  const colonMatch = normalized.match(/^(\\d{1,2}):(\\d{1,2})$/);
  if (colonMatch && Number(colonMatch[2]) < 60) {
    return formatMinutes(Number(colonMatch[1]) * 60 + Number(colonMatch[2]));
  }

  return raw;
}

/* NOMBRE */
function parseNumber(value: unknown): number | null {
  const text = clean(value)
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!text) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/* NOM DE COLONNE */
function normalizeHeader(value: string): string {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/* LECTEUR CSV */
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && csv[i + 1] === "\n") i++;

      row.push(cell);

      if (row.some((value) => clean(value) !== "")) {
        rows.push(row);
      }

      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);

    if (row.some((value) => clean(value) !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

/* TROUVER UNE COLONNE */
function findColumn(
  headers: string[],
  ...possibilities: string[]
): number {
  const normalized = possibilities.map(normalizeHeader);

  return headers.findIndex((header) => normalized.includes(header));
}

/* DISPONIBILITÉ */
function normalizeAvailability(value: string): string {
  const text = clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["dispo", "disponible", "oui", "yes", "true"].includes(text)) {
    return "dispo";
  }

  if (["indispo", "indisponible", "non", "no", "false"].includes(text)) {
    return "indisponible";
  }

  return text;
}

/* CLASSEMENT AUTOMATIQUE DES JEUX
   Les catégories déjà saisies dans Google Sheets restent prioritaires.
   Pour les jeux sans catégorie, on utilise le nom, la description et les informations disponibles.
*/
function inferCategories(game: {
  nom: string;
  description: string;
  age: number | null;
  nombre_min: number | null;
  nombre_max: number | null;
}): string {
  const text = `${game.nom} ${game.description}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, " ");

  const categories: string[] = [];
  const has = (pattern: RegExp) => pattern.test(text);

  if (has(/cooperatif|cooperation|ensemble|entraide|pandemic|spirit island|the crew|hanabi|magic maze|flash point|sky team|forbidden island/)) categories.push("cooperatif");
  if (has(/ambiance|party game|mime|bluff|fou rire|association d.idees|time.?s up|just one|dixit|codenames|loup garou|loups garous|imposteur|quiz|devinettes/)) categories.push("ambiance");
  if (has(/enquete|enquête|detective|détective|crime|meurtre|mystere|mystère|investigation|unlock|exit le jeu|sherlock|chronicles of crime|suspects|cold case/)) categories.push("enquete");
  if (has(/duel|a deux|à deux|2 joueurs|deux joueurs|patchwork|jaipur|7 wonders duel|7 wonders duel|hive|schotten totten|lost cities/)) categories.push("a deux");
  if (has(/jeu de cartes|cartes|card game|deck.?building|deckbuilding|draft|uno|skyjo|scout|sea salt paper|exploding kittens|dobble|6 qui prend|love letter|the mind/)) categories.push("cartes");
  if (has(/adresse|dexterite|dextérité|equilibre|équilibre|empiler|pichenette|pitchcar|ice cool|jenga|kapla|mikado|rhino hero/)) categories.push("adresse");
  if (has(/strategie|stratégie|gestion|placement|developpement|développement|civilisation|terraforming mars|wingspan|7 wonders|azul|carcassonne|catan|catane|splendor|everdell|ark nova|dune imperium|brass|root|scythe/)) categories.push("strategie");
  if (has(/enigme|énigme|logique|puzzle|casse.?tete|casse-tête|deduction|déduction|enigmes|mastermind|sudoku|tangram/)) categories.push("reflexion");

  if (categories.length === 0) {
    // À défaut d'indice thématique fiable, on utilise l'âge conseillé comme repère familial.
    if (game.age !== null && game.age <= 10) categories.push("famille");
    else categories.push("reflexion");
  }

  if (
    categories.length === 1 &&
    game.nombre_max !== null &&
    game.nombre_max <= 2 &&
    !categories.includes("a deux")
  ) {
    categories.push("a deux");
  }

  return categories.join(", ");
}

/* COURTE PRÉSENTATION DE SECOURS POUR LES JEUX SANS DESCRIPTION */
function makeShortDescription(game: {
  nom: string;
  categories: string;
  nombre_min: number | null;
  nombre_max: number | null;
  duree: string;
  age: number | null;
}): string {
  const categoryNames: Record<string, string> = {
    cooperatif: "coopération, où les joueurs avancent ensemble",
    ambiance: "ambiance, idéal pour partager un moment convivial",
    strategie: "stratégie, pour planifier ses actions et faire les bons choix",
    enquete: "enquête, pour observer les indices et résoudre des mystères",
    famille: "familial, pour réunir petits et grands autour de la table",
    "a deux": "duel, parfait pour un face-à-face à deux",
    cartes: "cartes, pour des parties rythmées et faciles à sortir",
    adresse: "adresse, pour tester sa précision et son habileté",
    reflexion: "réflexion, pour faire travailler sa logique",
  };
  const firstCategory = (game.categories || "").split(",")[0].trim().toLowerCase();
  const theme = categoryNames[firstCategory] || "jeu de société, pour partager un bon moment autour de la table";
  const details: string[] = [];

  if (game.nombre_min !== null && game.nombre_max !== null) {
    details.push(`de ${game.nombre_min} à ${game.nombre_max} joueurs`);
  } else if (game.nombre_min !== null) {
    details.push(`à partir de ${game.nombre_min} joueurs`);
  } else if (game.nombre_max !== null) {
    details.push(`jusqu'à ${game.nombre_max} joueurs`);
  }

  if (game.age !== null) details.push(`dès ${game.age} ans`);
  if (game.duree.trim()) details.push(`environ ${formatDuration(game.duree)}`);

  const practicalInfo = details.length ? ` Il se joue ${details.join(", ")}.` : "";
  return `Découvrez ${game.nom} : un jeu de ${theme}.${practicalInfo} Retrouvez-le à la location chez Chat’Perlipopette !`;
}

/* RÉCUPÉRATION DES JEUX */
export async function getGames(): Promise<Game[]> {
  const response = await fetch(GOOGLE_SHEETS_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer Google Sheets");
  }

  const csv = await response.text();
  const rows = parseCSV(csv);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  const codeBarreIndex = findColumn(
    headers, "colonne_1", "code_barre", "codebarre", "code", "barcode"
  );
  const nomIndex = findColumn(headers, "nom", "nom_du_jeu", "jeu");
  const editeurIndex = findColumn(headers, "editeur");
  const nombreMinIndex = findColumn(
    headers, "nombre_min", "nombre_minimum", "joueurs_min", "joueurs_minimum"
  );
  const nombreMaxIndex = findColumn(
    headers, "nombre_max", "nombre_maximum", "joueurs_max", "joueurs_maximum"
  );
  const dureeIndex = findColumn(headers, "duree", "duree_min", "temps");
  const ageIndex = findColumn(headers, "age", "age_minimum");
  const disponibiliteIndex = findColumn(
    headers, "disponibilite", "disponible", "dispo"
  );
  const prixLocationIndex = findColumn(
    headers, "prix_location", "prix_de_location", "location", "prix"
  );
  const prixCautionIndex = findColumn(
    headers, "prix_caution", "caution", "prix_de_caution"
  );
  const descriptionIndex = findColumn(
    headers, "description", "descriptif", "description_du_jeu", "texte_descriptif"
  );
  const categoriesIndex = findColumn(
    headers, "categories", "categorie", "type_de_jeu"
  );
  const imageUrlIndex = findColumn(
    headers, "image_url", "image", "url_image"
  );
  const anneeIndex = findColumn(
    headers, "annee", "annee_de_sortie", "annee_publication", "date_sortie", "year", "publication_year"
  );
  const nouveauteIndex = findColumn(headers, "nouveaute", "nouveau", "new", "nouveaux_jeux");
  const coupDeCoeurIndex = findColumn(headers, "coup_de_coeur", "coup_de_coeur", "favori", "favoris", "coup_de_coeur_site");

  const games: Game[] = [];

  for (const row of rows.slice(1)) {
    const get = (index: number): string => {
      if (index < 0 || index >= row.length) return "";
      return clean(row[index]);
    };

    const nom = get(nomIndex) || get(codeBarreIndex) || "Jeu sans nom";

    games.push({
      code_barre: get(codeBarreIndex),
      nom,
      editeur: get(editeurIndex),
      nombre_min: parseNumber(get(nombreMinIndex)),
      nombre_max: parseNumber(get(nombreMaxIndex)),
      duree: get(dureeIndex),
      age: parseNumber(get(ageIndex)),
      disponibilite: normalizeAvailability(get(disponibiliteIndex)),
      prix_location: parseNumber(get(prixLocationIndex)),
      prix_caution: parseNumber(get(prixCautionIndex)),
      description:
        get(descriptionIndex) ||
        makeShortDescription({
          nom,
          categories:
            get(categoriesIndex) ||
            inferCategories({
              nom,
              description: get(descriptionIndex),
              age: parseNumber(get(ageIndex)),
              nombre_min: parseNumber(get(nombreMinIndex)),
              nombre_max: parseNumber(get(nombreMaxIndex)),
            }),
          nombre_min: parseNumber(get(nombreMinIndex)),
          nombre_max: parseNumber(get(nombreMaxIndex)),
          duree: get(dureeIndex),
          age: parseNumber(get(ageIndex)),
        }),
      categories:
        get(categoriesIndex) ||
        inferCategories({
          nom,
          description: get(descriptionIndex),
          age: parseNumber(get(ageIndex)),
          nombre_min: parseNumber(get(nombreMinIndex)),
          nombre_max: parseNumber(get(nombreMaxIndex)),
        }),
      annee: parseNumber(get(anneeIndex)),
      image_url: get(imageUrlIndex) || undefined,
      nouveaute: parseBoolean(get(nouveauteIndex)),
      coup_de_coeur: parseBoolean(get(coupDeCoeurIndex)),
    });
  }

  console.log(`Catalogue chargé : ${games.length} jeux`);

  return games;
}
