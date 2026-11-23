// What every API route shares: answers, hashes, cookies, and who is logged in.
// A session is a random token kept in an HttpOnly cookie; the database keeps only its hash, so a leaked table logs nobody in.
// Routes that change something call sameOrigin() first: with SameSite=Lax on the cookie, that closes cross-site requests (CSRF).

export const HOUR = 3600e3, DAY = 24 * HOUR;
export const SESSION_LIFE = 30 * DAY;
const IP_LIFE = 2 * DAY; // how long the hashed address of a sender is kept

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers } });

export const sha = async text => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
  .map(b => b.toString(16).padStart(2, "0")).join("");

// Random text safe for a cookie or a URL: 32 bytes by default
export const randomToken = (bytes = 32) => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(bytes))))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// The address of a request, hashed with a secret so the stored value can't be turned back into it
export async function ipHash(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "";
  return sha(`${ip}:${env.IP_SALT || env.TURNSTILE_SECRET || "dominik"}`);
}
// Addresses older than two days are dropped from both tables that keep them
export const forgetOldAddresses = (env, now = Date.now()) => [
  env.DB.prepare("UPDATE teams SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created < ?").bind(now - IP_LIFE),
  env.DB.prepare("UPDATE shares SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created < ?").bind(now - IP_LIFE)
];

// A request that changes something has to come from a page of the site itself. Browsers always send Origin on a
// cross-site POST, and Sec-Fetch-Site on any request: a request with neither is not from a browser page, and is refused too
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) return origin === new URL(request.url).origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}

// Reads a JSON body of up to max characters: null when it is too big or not an object
export async function readJson(request, max = 4000) {
  const text = await request.text();
  if (text.length > max) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch { return null; }
}

/* ---------- cookies ---------- */
// On https the names carry the __Host- prefix: the browser then takes the cookie only with Secure, Path=/ and no Domain,
// so no other site or subdomain can set it. The local server (wrangler pages dev) runs on plain http and uses the bare name
const secure = request => new URL(request.url).protocol === "https:";
export const cookieName = (request, base) => secure(request) ? `__Host-${base}` : base;
export function readCookie(request, base) {
  const name = cookieName(request, base);
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const at = part.indexOf("=");
    if (at > 0 && part.slice(0, at).trim() === name) return decodeURIComponent(part.slice(at + 1).trim());
  }
  return "";
}
// Max-Age in seconds; 0 deletes the cookie
export const setCookie = (request, base, value, maxAge) =>
  `${cookieName(request, base)}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure(request) ? "; Secure" : ""}`;

/* ---------- accounts ---------- */
export const isOwner = (env, id) => Boolean(env.OWNER_DISCORD_ID) && id === env.OWNER_DISCORD_ID;
export const isAdmin = (env, user) => Boolean(user) && (user.role === "admin" || isOwner(env, user.id));

// Only a path of this site: "/x" but never "//other.site" or "/\other.site", which browsers read as another site
export const safeBack = back => typeof back === "string" && back.length < 300 && /^\/(?![/\\])/.test(back) ? back : "/";

// The account of the request: null when logged out, the session expired, or the account is banned
export async function currentUser(request, env) {
  const token = readCookie(request, "dk_session");
  if (!token || !env.DB) return null;
  return env.DB.prepare(`SELECT u.id, u.name, u.role, u.created FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires > ? AND u.banned = 0`).bind(await sha(token), Date.now()).first();
}

// Starts a session for an account and answers with a redirect that sets its cookie
export async function startSession(request, env, userId, back) {
  const token = randomToken(), now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires < ?").bind(now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created, expires) VALUES (?, ?, ?, ?)").bind(await sha(token), userId, now, now + SESSION_LIFE)
  ]);
  const headers = new Headers({ location: safeBack(back), "cache-control": "no-store" });
  headers.append("set-cookie", setCookie(request, "dk_session", token, SESSION_LIFE / 1000));
  headers.append("set-cookie", setCookie(request, "dk_state", "", 0));
  return new Response(null, { status: 302, headers });
}

// For a route that needs an account: { user } or { error } (a Response to send back as it is)
export async function needUser(request, env, { write = true } = {}) {
  if (!env.DB) return { error: json({ error: "off" }, 503) };
  if (write && !sameOrigin(request)) return { error: json({ error: "origin" }, 403) };
  const user = await currentUser(request, env);
  return user ? { user } : { error: json({ error: "login" }, 401) };
}
export async function needAdmin(request, env, options) {
  const found = await needUser(request, env, options);
  if (found.error) return found;
  return isAdmin(env, found.user) ? found : { error: json({ error: "admin" }, 403) };
}

// Every admin action is written down, and entries older than a year are dropped
export const logAdmin = (env, adminId, action, target, detail = "") => env.DB.batch([
  env.DB.prepare("DELETE FROM admin_log WHERE created < ?").bind(Date.now() - 365 * DAY),
  env.DB.prepare("INSERT INTO admin_log (admin_id, action, target, detail, created) VALUES (?, ?, ?, ?, ?)")
    .bind(adminId, action, target, String(detail).slice(0, 300), Date.now())
]);

// The name shown for an account: the Discord name, without control characters, cut to the size of the old author field
export const cleanName = raw => String(raw || "").replace(/\p{Cc}/gu, "").replace(/\s+/g, " ").trim().slice(0, 32) || "Unnamed";
