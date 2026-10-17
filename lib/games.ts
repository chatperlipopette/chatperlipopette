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
  image_url?: string;
};

/* NETTOYAGE */
function clean(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/^\uFEFF/, "")
    .trim();
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
    .replace(/[\\u0300-\\u036f]/g, " ");

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
      description: get(descriptionIndex) || null,
      categories:
        get(categoriesIndex) ||
        inferCategories({
          nom,
          description: get(descriptionIndex),
          age: parseNumber(get(ageIndex)),
          nombre_min: parseNumber(get(nombreMinIndex)),
          nombre_max: parseNumber(get(nombreMaxIndex)),
        }),
      image_url: get(imageUrlIndex) || undefined,
    });
  }

  console.log(`Catalogue chargé : ${games.length} jeux`);

  return games;
}
