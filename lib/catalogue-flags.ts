export type CatalogueFlags = {
  nouveaute: boolean;
  coup_de_coeur: boolean;
};

export async function getCatalogueFlags(): Promise<Map<string, CatalogueFlags>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Map();

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/catalogue_game_flags?select=game_code,nouveaute,coup_de_coeur`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!response.ok) {
      console.error("Lecture des nouveautés/coups de cœur impossible :", response.status);
      return new Map();
    }
    const data = await response.json() as Array<{
      game_code: string;
      nouveaute: boolean;
      coup_de_coeur: boolean;
    }>;
    return new Map(data.map((row) => [
      String(row.game_code),
      { nouveaute: Boolean(row.nouveaute), coup_de_coeur: Boolean(row.coup_de_coeur) },
    ]));
  } catch (error) {
    console.error("Lecture des badges impossible :", error);
    return new Map();
  }
}
