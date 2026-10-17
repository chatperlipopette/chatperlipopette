import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") || "").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ imageUrl: null }, { status: 400 });
  }

  try {
    const searchUrl = new URL("https://boardgamegeek.com/xmlapi2/search");
    searchUrl.searchParams.set("query", name);
    searchUrl.searchParams.set("type", "boardgame");

    const searchResponse = await fetch(searchUrl, {
      headers: { "User-Agent": "ChatPerlipopette/1.0 (board-game rental catalogue)" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 86400 },
    });

    if (!searchResponse.ok) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }

    const xml = await searchResponse.text();
    const requested = normalizeTitle(name);
    const candidates = [...xml.matchAll(/<item\b([^>]*)>([\s\S]*?)<\/item>/g)]
      .map((match) => {
        const id = match[1].match(/\bid="(\d+)"/)?.[1];
        const names = [...match[2].matchAll(/<name\b[^>]*type="primary"[^>]*value="([^"]*)"[^>]*\/>/g)]
          .map((item) => decodeXml(item[1]));
        const title = names[0] || "";
        return { id, title, normalized: normalizeTitle(title) };
      })
      .filter((item) => item.id && item.title);

    const exact = candidates.find((item) => item.normalized === requested);
    const close = exact || candidates.find((item) =>
      item.normalized.startsWith(requested) || requested.startsWith(item.normalized)
    );

    // Ne pas afficher une boîte d'un autre jeu si le titre ne correspond pas.
    if (!close?.id) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }

    const detailsUrl = new URL("https://boardgamegeek.com/xmlapi2/thing");
    detailsUrl.searchParams.set("id", close.id);
    const detailsResponse = await fetch(detailsUrl, {
      headers: { "User-Agent": "ChatPerlipopette/1.0 (board-game rental catalogue)" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 86400 },
    });

    if (!detailsResponse.ok) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }

    const details = await detailsResponse.text();
    const imageUrl = details.match(/<image>(https?:\/\/[^<]+)<\/image>/)?.[1]
      || details.match(/<thumbnail>(https?:\/\/[^<]+)<\/thumbnail>/)?.[1]
      || null;

    return NextResponse.json(
      { imageUrl, source: imageUrl ? "BoardGameGeek" : null },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ imageUrl: null }, { status: 200 });
  }
}
