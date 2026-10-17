import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "chatperlipopette_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET doit contenir au moins 32 caractères.");
  return secret;
}

function signature(expiresAt: string): string {
  return createHmac("sha256", sessionSecret()).update(expiresAt).digest("hex");
}

export function createAdminSession(): { value: string; maxAge: number } {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return { value: `${expiresAt}.${signature(expiresAt)}`, maxAge: SESSION_SECONDS };
}

export function verifyAdminSession(value?: string): boolean {
  if (!value) return false;
  const [expiresAt, suppliedSignature, extra] = value.split(".");
  if (!expiresAt || !suppliedSignature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  try {
    const expected = Buffer.from(signature(expiresAt), "hex");
    const supplied = Buffer.from(suppliedSignature, "hex");
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function passwordsMatch(supplied: string, configured: string): boolean {
  const suppliedBuffer = Buffer.from(supplied);
  const configuredBuffer = Buffer.from(configured);
  return suppliedBuffer.length === configuredBuffer.length &&
    timingSafeEqual(suppliedBuffer, configuredBuffer);
}
