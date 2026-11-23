// GET /api/auth/callback: where Discord sends the browser after the login. Checks the state, trades the code for the
// account's id and name, creates or refreshes the account and starts a session. The owner (OWNER_DISCORD_ID) is always an admin.
// A banned account gets no session.
import { cleanName, isOwner, json, readCookie, safeBack, setCookie, startSession } from "../../../server/session.js";

const away = (request, path) => new Response(null, { status: 302,
  headers: { location: path, "cache-control": "no-store", "set-cookie": setCookie(request, "dk_state", "", 0) } });

export async function onRequestGet({ request, env }) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DB) return json({ error: "off" }, 503);
  const url = new URL(request.url);
  const [state, back] = readCookie(request, "dk_state").split(" ");
  const sent = url.searchParams.get("state"), code = url.searchParams.get("code");
  // No state: the login took over ten minutes, or the link did not come from /api/auth/login. Either way, start again
  if (!state || state !== sent) return away(request, "/account?login=expired");
  // The person cancelled on Discord
  if (!code) return away(request, safeBack(back));

  const token = await fetch("https://discord.com/api/oauth2/token", { method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: `${url.origin}/api/auth/callback`,
      client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET }) })
    .then(r => r.ok ? r.json() : null).catch(() => null);
  if (!token?.access_token) return away(request, "/account?login=failed");
  const me = await fetch("https://discord.com/api/users/@me", { headers: { authorization: `Bearer ${token.access_token}` } })
    .then(r => r.ok ? r.json() : null).catch(() => null);
  if (!/^\d{5,25}$/.test(me?.id || "")) return away(request, "/account?login=failed");

  const known = await env.DB.prepare("SELECT banned FROM users WHERE id = ?").bind(me.id).first();
  if (known?.banned) return away(request, "/account?login=banned");
  const now = Date.now(), name = cleanName(me.global_name || me.username);
  await env.DB.prepare(`INSERT INTO users (id, name, role, banned, created, seen) VALUES (?1, ?2, ?3, 0, ?4, ?4)
      ON CONFLICT (id) DO UPDATE SET name = excluded.name, seen = excluded.seen, role = CASE WHEN ?3 = 'admin' THEN 'admin' ELSE users.role END`)
    .bind(me.id, name, isOwner(env, me.id) ? "admin" : "user", now).run();
  return startSession(request, env, me.id, back);
}
