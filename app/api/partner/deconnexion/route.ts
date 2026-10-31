import { NextRequest, NextResponse } from "next/server";
import { PARTNER_COOKIE } from "@/lib/partner-access";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PARTNER_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
