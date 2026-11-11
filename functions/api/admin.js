// /api/admin: how the Discord bot of the Dominik server reviews teams. Every call needs the ADMIN_KEY secret,
// which only the bot has. GET lists the teams waiting that the bot has not posted yet; POST records a decision
// and writes the approved teams to KV again, as tools/review-teams.mjs does.
const json = (data, status = 200) => new Response(JSON.stringify(data), { status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const sha = async text => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))].join(",");
// Hashes are compared, so the time the answer takes tells nothing about the key
async function denied(request, env) {
  if (!env.ADMIN_KEY) return json({ error: "off" }, 404);
  const sent = request.headers.get("authorization") || "";
  return await sha(sent) === await sha(`Bearer ${env.ADMIN_KEY}`) ? null : json({ error: "denied" }, 401);
}
async function publish(env) {
  const { results } = await env.DB.prepare("SELECT id, team, author FROM teams WHERE status = 'approved' ORDER BY reviewed").all();
  await env.CACHE.put("teams", JSON.stringify(results.map(row => ({ id: row.id, author: row.author, team: JSON.parse(row.team) }))));
}

export async function onRequestGet({ request, env }) {
  const no = await denied(request, env);
  if (no) return no;
  const { results } = await env.DB.prepare("SELECT id, page, team, author, created FROM teams WHERE status = 'pending' AND message IS NULL ORDER BY created LIMIT 10").all();
  return json({ teams: results.map(row => ({ ...row, team: JSON.parse(row.team) })) });
}

// What each action needs the team to be, and what it becomes
const ACTIONS = { approve: ["pending", "approved"], reject: ["pending", "rejected"], remove: ["approved", "rejected"] };
export async function onRequestPost({ request, env }) {
  const no = await denied(request, env);
  if (no) return no;
  const body = await request.json().catch(() => null), id = Number(body?.id);
  if (!Number.isInteger(id)) return json({ error: "bad" }, 400);
  // The bot tells which message shows the team, so it is posted only once
  if (body.action === "posted") {
    await env.DB.prepare("UPDATE teams SET message = ? WHERE id = ?").bind(String(body.message || "").slice(0, 32), id).run();
    return json({ ok: true });
  }
  const step = ACTIONS[body.action];
  if (!step) return json({ error: "bad" }, 400);
  const reason = body.action === "remove" ? "removed from the site" : typeof body.reason === "string" ? body.reason.slice(0, 200) : "";
  const done = await env.DB.prepare("UPDATE teams SET status = ?, reason = ?, reviewed = ? WHERE id = ? AND status = ?")
    .bind(step[1], reason || null, Date.now(), id, step[0]).run();
  const row = await env.DB.prepare("SELECT page, status FROM teams WHERE id = ?").bind(id).first();
  if (!row) return json({ error: "gone" }, 404);
  // Someone decided first (the terminal tool, or a second click): the answer says how the team stands
  if (!done.meta.changes) return json({ error: "state", status: row.status, page: row.page }, 409);
  if (step.includes("approved")) await publish(env);
  return json({ ok: true, status: row.status, page: row.page });
}
