import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession, passwordsMatch } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword || configuredPassword.length < 12 || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "La connexion administrateur n’est pas encore configurée." }, { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string" || password.length > 1024 ||
      !passwordsMatch(password, configuredPassword)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  let session: ReturnType<typeof createAdminSession>;
  try { session = createAdminSession(); } catch {
    return NextResponse.json({ error: "La session administrateur n’est pas configurée." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
