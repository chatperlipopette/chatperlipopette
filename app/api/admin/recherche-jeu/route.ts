import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function attribute(tag: string, name: string): string {
  const match = tag.match(new RegExp(name + '="([^"]*)"'));
  return match ? decodeXml(match[1]) : "";
}

function valueOf(xml: string, name: string): string {
  const match = xml.match(new RegExp("<" + name + "\\b[^>]*value=" + '"([^"]*)"', "i"));
  return match ? decodeXml(match[1]) : "";
}

function textOf(xml: string, name: string): string {
  const match = xml.match(new RegExp("<" + name + "\\b[^>]*>([\\s\\S]*?)</" + name + ">", "i"));
  return match ? decodeXml(match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()) : "";
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

async function bggFetch(url: string): Promise<string> {
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, {
      headers: { "User-Agent": "ChatPerlipopette/1.0 (catalogue administration)" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (response.status !== 202) break;
    await new Promise((resolve) => setTimeout(resolve, 1800 * (attempt + 1)));
  }
  if (!response || !response.ok) throw new Error("Le service de recherche de jeux est temporairement indisponible. Réessaie dans quelques instants.");
  return response.text();
}

export async function GET(request: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const query = (request.nextUrl.searchParams.get("q") || "").trim();
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ error: "Saisis un nom de jeu ou un code-barres valide." }, { status: 400 });
  }

  try {
    const searchUrl = new URL("https://boardgamegeek.com/xmlapi2/search");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("type", "boardgame");
    const searchXml = await bggFetch(searchUrl.toString());
    const items = [...searchXml.matchAll(/<item\b([^>]*)>([\s\S]*?)<\/item>/gi)]
      .map((match) => {
        const nameTag = match[2].match(/<name\b[^>]*type="primary"[^>]*>/i)?.[0] || match[2].match(/<name\b[^>]*>/i)?.[0] || "";
        return { id: attribute(match[1], "id"), name: attribute(nameTag, "value"), year: valueOf(match[2], "yearpublished") };
      })
      .filter((item) => item.id && item.name)
      .slice(0, 10);

    if (!items.length) {
      return NextResponse.json({ game: null, message: "Aucune fiche trouvée dans la base BoardGameGeek." });
    }

    const normalizedQuery = normalize(query);
    const selected = items.find((item) => normalize(item.name) === normalizedQuery)
      || items.find((item) => normalize(item.name).startsWith(normalizedQuery))
      || items[0];

    const thingUrl = new URL("https://boardgamegeek.com/xmlapi2/thing");
    thingUrl.searchParams.set("id", selected.id);
    const thingXml = await bggFetch(thingUrl.toString());
    const itemXml = thingXml.match(/<item\b[^>]*>([\s\S]*?)<\/item>/i)?.[1];
    if (!itemXml) return NextResponse.json({ game: null, message: "La fiche détaillée n’est pas disponible." });

    const publisherTag = itemXml.match(/<link\b[^>]*type="boardgamepublisher"[^>]*>/i)?.[0] || "";
    const image = textOf(itemXml, "image") || textOf(itemXml, "thumbnail");
    const description = textOf(itemXml, "description").slice(0, 4500);
    const duration = valueOf(itemXml, "playingtime") || valueOf(itemXml, "minplaytime");
    const age = valueOf(itemXml, "minage");
    const year = valueOf(itemXml, "yearpublished") || selected.year;

    return NextResponse.json({
      game: {
        code_barre: "",
        nom: textOf(itemXml, "name") || selected.name,
        editeur: attribute(publisherTag, "value"),
        nombre_min: Number(valueOf(itemXml, "minplayers")) || null,
        nombre_max: Number(valueOf(itemXml, "maxplayers")) || null,
        duree: duration ? duration + " min" : "",
        age: age ? Number(age) || null : null,
        description,
        categories: "autres",
        annee: year ? Number(year) || null : null,
        image_url: image,
      },
      source: "BoardGameGeek",
      sourceUrl: "https://boardgamegeek.com/boardgame/" + selected.id,
    });
  } catch (error) {
    console.error("Recherche automatique de jeu impossible :", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Recherche automatique impossible.",
    }, { status: 502 });
  }
}
