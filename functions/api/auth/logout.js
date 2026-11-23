// POST /api/auth/logout: ends the session of this browser
import { json, readCookie, sameOrigin, setCookie, sha } from "../../../server/session.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "origin" }, 403);
  const token = readCookie(request, "dk_session");
  if (token && env.DB) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha(token)).run();
  return json({ ok: true }, 200, { "set-cookie": setCookie(request, "dk_session", "", 0) });
}
