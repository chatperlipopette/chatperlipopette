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
    return new Map(data.map((row) => [
      normalizeCatalogueKey(row.game_code),
      { nouveaute: row.nouveaute === true, coup_de_coeur: row.coup_de_coeur === true },
    ]));
  } catch (error) {
    console.error("Lecture des badges impossible :", error);
    return new Map();
  }
}
