import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const PARTNER_COOKIE = "chatperlipopette_partner";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET doit contenir au moins 32 caractères.");
  return value;
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}
export function hashPartnerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return \`scrypt:\${salt}:\${scryptSync(password, salt, 64).toString("hex")}\`;
}
export function verifyPartnerPassword(password: string, stored: string) {
  const [algorithm, salt, expectedHex] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return expected.length > 0 && timingSafeEqual(expected, actual);
  } catch { return false; }
}
export function createPartnerCookie(partnerId: string) {
  const expires = String(Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE);
  const payload = \`\${partnerId}.\${expires}\`;
  return { value: \`\${payload}.\${sign(payload)}\`, maxAge: COOKIE_MAX_AGE };
}
export function verifyPartnerCookie(value?: string) {
  if (!value) return null;
  const [partnerId, expires, supplied, extra] = value.split(".");
  if (!partnerId || !expires || !supplied || extra || !/^\d+$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000)) return null;
  const payload = \`\${partnerId}.\${expires}\`;
  try {
    const a = Buffer.from(sign(payload), "hex");
    const b = Buffer.from(supplied, "hex");
    return a.length === b.length && timingSafeEqual(a, b) ? partnerId : null;
  } catch { return null; }
}
export async function getPartnerSessionId() {
  const store = await cookies();
  return verifyPartnerCookie(store.get(PARTNER_COOKIE)?.value);
}
export async function getPartnerById(id: string) {
  const config = getConfig();
  if (!config) return null;
  const response = await fetch(\`\${config.url}/rest/v1/partners?id=eq.\${encodeURIComponent(id)}&select=id,name,username,promo_code,discount_type,discount_percent,active,expires_at,max_uses,usage_count\`, {
    headers: { apikey: config.key, Authorization: \`Bearer \${config.key}\` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("Impossible de vérifier l'accès partenaire.");
  const rows = await response.json();
  const partner = Array.isArray(rows) ? rows[0] : null;
  if (!partner || !partner.active) return null;
  if (partner.expires_at && new Date(partner.expires_at).getTime() < Date.now()) return null;
  if (partner.max_uses !== null && Number(partner.usage_count) >= Number(partner.max_uses)) return null;
  return partner;
}
export function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}
