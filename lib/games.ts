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
};

/* =========================
   NETTOYAGE
========================= */

function clean(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/^\uFEFF/, "")
    .trim();
}

/* =========================
   NOMBRE
========================= */

function parseNumber(value: unknown): number | null {
  const text = clean(value)
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

/* =========================
   NOM DE COLONNE
========================= */

function normalizeHeader(value: string): string {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/* =========================
   LECTEUR CSV
========================= */

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

    if (
      (char === "\n" || char === "\r") &&
      !inQuotes
    ) {
      if (
        char === "\r" &&
        csv[i + 1] === "\n"
      ) {
        i++;
      }

      row.push(cell);

      if (
        row.some(
          (value) => clean(value) !== ""
        )
      ) {
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

    if (
      row.some(
        (value) => clean(value) !== ""
      )
    ) {
      rows.push(row);
    }
  }

  return rows;
}

/* =========================
   TROUVER UNE COLONNE
========================= */

function findColumn(
  headers: string[],
  ...possibilities: string[]
): number {
  const normalizedPossibilities =
    possibilities.map(normalizeHeader);

  return headers.findIndex((header) =>
    normalizedPossibilities.includes(header)
  );
}

/* =========================
   DISPONIBILITÉ
========================= */

function normalizeAvailability(
  value: string
): string {
  const text = clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    text === "dispo" ||
    text === "disponible" ||
    text === "oui" ||
    text === "yes" ||
    text === "true"
  ) {
    return "dispo";
  }

  if (
    text === "indispo" ||
    text === "indisponible" ||
    text === "non" ||
    text === "no" ||
    text === "false"
  ) {
    return "indisponible";
  }

  return text;
}

/* =========================
   RÉCUPÉRATION DES JEUX
========================= */

export async function getGames(): Promise<Game[]> {
  const response = await fetch(
    GOOGLE_SHEETS_URL,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer Google Sheets"
    );
  }

  const csv = await response.text();

  const rows = parseCSV(csv);

  if (rows.length < 2) {
    return [];
  }

  /* =========================
     EN-TÊTES
  ========================= */

  const headers = rows[0].map(
    normalizeHeader
  );

  console.log(
    "Colonnes Google Sheets :",
    headers
  );

  /* =========================
     INDICES DES COLONNES
  ========================= */

  const codeBarreIndex =
    findColumn(
      headers,
      "colonne_1",
      "code_barre",
      "codebarre",
      "code",
      "barcode"
    );

  const nomIndex =
    findColumn(
      headers,
      "nom",
      "nom_du_jeu",
      "jeu"
    );

  const editeurIndex =
    findColumn(
      headers,
      "editeur",
      "éditeur"
    );

  const nombreMinIndex =
    findColumn(
      headers,
      "nombre_min",
      "nombre_minimum",
      "joueurs_min",
      "joueurs_minimum"
    );

  const nombreMaxIndex =
    findColumn(
      headers,
      "nombre_max",
      "nombre_maximum",
      "joueurs_max",
      "joueurs_maximum"
    );

  const dureeIndex =
    findColumn(
      headers,
      "duree",
      "duree_min",
      "temps"
    );

  const ageIndex =
    findColumn(
      headers,
      "age",
      "age_minimum"
    );

  const disponibiliteIndex =
    findColumn(
      headers,
      "disponibilite",
      "disponible",
      "dispo"
    );

  const prixLocationIndex =
    findColumn(
      headers,
      "prix_location",
      "prix_de_location",
      "location",
      "prix"
    );

  const prixCautionIndex =
    findColumn(
      headers,
      "prix_caution",
      "caution",
      "prix_de_caution"
    );

  const descriptionIndex =
    findColumn(
      headers,
      "description",
      "descriptif",
      "description_du_jeu",
      "texte_descriptif"
    );

  console.log(
    "Indices détectés :",
    {
      codeBarreIndex,
      nomIndex,
      editeurIndex,
      nombreMinIndex,
      nombreMaxIndex,
      dureeIndex,
      ageIndex,
      disponibiliteIndex,
      prixLocationIndex,
      prixCautionIndex,
      descriptionIndex,
    }
  );

  /* =========================
     LECTURE DES JEUX
  ========================= */

  const games: Game[] = [];

  for (const row of rows.slice(1)) {

    const get = (
      index: number
    ): string => {

      if (
        index < 0 ||
        index >= row.length
      ) {
        return "";
      }

      return clean(row[index]);
    };

    /*
      On récupère d'abord le nom.
      Si le nom est vide, on utilise
      le code-barres comme secours.
    */

    const nom =
      get(nomIndex) ||
      get(codeBarreIndex) ||
      "Jeu sans nom";

    const game: Game = {

      code_barre:
        get(codeBarreIndex),

      nom,

      editeur:
        get(editeurIndex),

      nombre_min:
        parseNumber(
          get(nombreMinIndex)
        ),

      nombre_max:
        parseNumber(
          get(nombreMaxIndex)
        ),

      duree:
        get(dureeIndex),

      age:
        parseNumber(
          get(ageIndex)
        ),

      disponibilite:
        normalizeAvailability(
          get(disponibiliteIndex)
        ),

      prix_location:
        parseNumber(
          get(prixLocationIndex)
        ),

      prix_caution:
        parseNumber(
          get(prixCautionIndex)
        ),

      description:
        get(descriptionIndex) ||
        null,
    };

    games.push(game);
  }

  console.log(
    `Catalogue chargé : ${games.length} jeux`
  );

  return games;
}