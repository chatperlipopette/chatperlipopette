export type CatalogueFlags = {
  nouveaute: boolean;
  coup_de_coeur: boolean;
};

// Rend les identifiants cohérents même si un code-barres ou un nom contient
// des espaces, des accents ou des différences de majuscules.
export function normalizeCatalogueKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]/g, "");
}

export async function getCatalogueFlags(): Promise<Map<string, CatalogueFlags>> {
  // Cette fonction est appelée uniquement côté serveur. Utiliser la clé de service
  // permet de lire les réglages même si la table est protégée par RLS.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) {
    console.error("Configuration Supabase manquante pour les nouveautés/coups de cœur.");
    return new Map();
  }

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/catalogue_game_flags?select=game_code,nouveaute,coup_de_coeur`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) {
      console.error("Lecture des nouveautés/coups de cœur impossible :", response.status, (await response.text()).slice(0, 300));
      return new Map();
    }
    const data = await response.json() as Array<{
      game_code: string;
      nouveaute: boolean;
      coup_de_coeur: boolean;
    }>;
    // Les anciennes lignes pouvaient contenir le code avec espaces/accents,
    // tandis que les nouvelles sauvegardes utilisent la clé déjà normalisée.
    // En cas de doublon, la clé normalisée doit toujours gagner (même si elle vaut false).
    const flags = new Map<string, CatalogueFlags>();
    const canonicalKeys = new Set<string>();
    for (const row of data) {
      const key = normalizeCatalogueKey(row.game_code);
      if (!key) continue;
      const isCanonical = row.game_code === key;
      if (canonicalKeys.has(key) && !isCanonical) continue;
      flags.set(key, { nouveaute: row.nouveaute === true, coup_de_coeur: row.coup_de_coeur === true });
      if (isCanonical) canonicalKeys.add(key);
    }
    return flags;
  } catch (error) {
    console.error("Lecture des badges impossible :", error);
    return new Map();
  }
}
