// GET /api/auth/login?back=/path: sends the browser to Discord to log in. Discord sends it back to /api/auth/callback.
// The random state goes in a short cookie and in the Discord link: the callback checks they match, so nobody can
// slip their own login into someone else's browser. Only "identify" is asked: the Discord id and name, no email
import { json, randomToken, safeBack, setCookie } from "../../../server/session.js";

export async function onRequestGet({ request, env }) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DB) return json({ error: "off" }, 503);
  const url = new URL(request.url), state = randomToken(16);
  const back = safeBack(url.searchParams.get("back"));
  const discord = new URL("https://discord.com/oauth2/authorize");
  discord.search = new URLSearchParams({ response_type: "code", client_id: env.DISCORD_CLIENT_ID, scope: "identify",
    redirect_uri: `${url.origin}/api/auth/callback`, state, prompt: "none" });
  return new Response(null, { status: 302, headers: {
    location: discord.toString(), "cache-control": "no-store",
    // Ten minutes to log in on Discord. The path to return to travels with the state, never in the Discord link
    "set-cookie": setCookie(request, "dk_state", `${state} ${back}`, 600)
  } });
}
