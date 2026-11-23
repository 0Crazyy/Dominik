// GET /api/auth/dev?as=admin|user|other&back=/path: logs in as a test account, to try accounts with no Discord app.
// Answers only when the DEV_LOGIN variable exists (it is set in .dev.vars alone, never on the published site)
// and the page is opened from this computer. Anywhere else it is a 404, like a route that does not exist.
import { json, startSession } from "../../../server/session.js";

const ACCOUNTS = {
  admin: { id: "dev-admin", name: "Test admin", role: "admin" },
  user: { id: "dev-user", name: "Test user", role: "user" },
  other: { id: "dev-other", name: "Other user", role: "user" }
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.DEV_LOGIN || !["127.0.0.1", "localhost"].includes(url.hostname) || !env.DB) return json({ error: "missing" }, 404);
  const account = ACCOUNTS[url.searchParams.get("as")] || ACCOUNTS.user, now = Date.now();
  const known = await env.DB.prepare("SELECT banned FROM users WHERE id = ?").bind(account.id).first();
  if (known?.banned) return new Response(null, { status: 302, headers: { location: "/account?login=banned" } });
  // The role is set only when the account is created, so a test of promote and demote keeps its result
  await env.DB.prepare("INSERT INTO users (id, name, role, banned, created, seen) VALUES (?1, ?2, ?3, 0, ?4, ?4) ON CONFLICT (id) DO UPDATE SET seen = excluded.seen")
    .bind(account.id, account.name, account.role, now).run();
  return startSession(request, env, account.id, url.searchParams.get("back"));
}
