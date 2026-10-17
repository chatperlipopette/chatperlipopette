import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeTitle(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") || "").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ imageUrl: null }, { status: 400 });
  }

  try {
    const api = new URL("https://commons.wikimedia.org/w/api.php");
    api.searchParams.set("action", "query");
    api.searchParams.set("format", "json");
    api.searchParams.set("generator", "search");
    api.searchParams.set("gsrsearch", `filetype:bitmap "${name}" board game`);
    api.searchParams.set("gsrnamespace", "6");
    api.searchParams.set("gsrlimit", "8");
    api.searchParams.set("prop", "imageinfo");
    api.searchParams.set("iiprop", "url|extmetadata");
    api.searchParams.set("iiurlwidth", "500");

    const response = await fetch(api, {
      headers: { "User-Agent": "ChatPerlipopette/1.0 (board-game rental catalogue)" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) return NextResponse.json({ imageUrl: null });

    const data = await response.json();
    const pages = Object.values(data?.query?.pages || {}) as Array<{
      title?: string;
      imageinfo?: Array<{
        thumburl?: string;
        url?: string;
        descriptionurl?: string;
        extmetadata?: Record<string, { value?: string }>;
      }>;
    }>;
    const requested = normalizeTitle(name);

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      const license = info?.extmetadata?.LicenseShortName?.value || "";
      const title = normalizeTitle((page.title || "").replace(/^File:/i, ""));
      const exactTitleMatch = title.includes(requested) || requested.includes(title);
      const commerciallyReusable = /public domain|cc0|cc by(?:-sa)?(?:\s|$)/i.test(license);

      // N'utiliser que des images dont la licence annoncée permet en principe la réutilisation commerciale.
      if (info && exactTitleMatch && commerciallyReusable && (info.thumburl || info.url)) {
        return NextResponse.json({
          imageUrl: info.thumburl || info.url,
          source: "Wikimedia Commons",
          sourceUrl: info.descriptionurl || null,
          license,
        }, {
          headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
        });
      }
    }

    return NextResponse.json({ imageUrl: null });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
