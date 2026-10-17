import { createClient } from "@supabase/supabase-js";

export type CatalogueFlags = {
  nouveaute: boolean;
  coup_de_coeur: boolean;
};

export async function getCatalogueFlags(): Promise<Map<string, CatalogueFlags>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Map();

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("catalogue_game_flags")
    .select("game_code, nouveaute, coup_de_coeur");

  if (error) {
    console.error("Lecture des nouveautés/coups de cœur impossible :", error.message);
    return new Map();
  }

  return new Map((data ?? []).map((row) => [
    String(row.game_code),
    {
      nouveaute: Boolean(row.nouveaute),
      coup_de_coeur: Boolean(row.coup_de_coeur),
    },
  ]));
}
