// /api/admin/users: the accounts, for the admin panel (/admin). Admins only; every change is logged.
// GET ?q=<name or Discord id>&offset=<n>: up to 50 accounts, admins and the most recent first.
// POST { id, action, removeTeams }: ban (logs the account out everywhere and blocks new logins; removeTeams also
// takes its teams off the site), unban, promote (make admin), demote. The owner (OWNER_DISCORD_ID) can't be banned or
// demoted, and an admin can't do either to their own account
import { isOwner, json, logAdmin, needAdmin, readJson } from "../../../server/session.js";

const LIMIT = 50;

export async function onRequestGet({ request, env }) {
  const { error } = await needAdmin(request, env, { write: false });
  if (error) return error;
  const url = new URL(request.url), q = (url.searchParams.get("q") || "").trim().slice(0, 60);
  const offset = Math.max(0, Math.floor(Number(url.searchParams.get("offset"))) || 0);
  const { results } = await env.DB.prepare(`SELECT u.id, u.name, u.role, u.banned, u.created, u.seen,
      (SELECT COUNT(*) FROM teams t WHERE t.user_id = u.id AND t.status = 'approved') AS teams,
      (SELECT COUNT(*) FROM reports r JOIN teams t ON t.id = r.team_id WHERE t.user_id = u.id) AS reported
      FROM users u WHERE ?1 = '' OR u.id = ?1 OR u.name LIKE ?2
      ORDER BY u.role = 'admin' DESC, u.seen DESC LIMIT ${LIMIT + 1} OFFSET ${offset}`).bind(q, `%${q.replace(/[%_]/g, "")}%`).all();
  const users = results.slice(0, LIMIT).map(u => ({ ...u, banned: Boolean(u.banned), owner: isOwner(env, u.id), admin: u.role === "admin" || isOwner(env, u.id) }));
  return json({ users, more: results.length > LIMIT });
}

const ACTIONS = ["ban", "unban", "promote", "demote"];
export async function onRequestPost({ request, env }) {
  const { user, error } = await needAdmin(request, env);
  if (error) return error;
  const body = await readJson(request);
  const id = typeof body?.id === "string" ? body.id : "", action = body?.action;
  if (!id || !ACTIONS.includes(action)) return json({ error: "bad" }, 400);
  if (["ban", "demote"].includes(action) && (isOwner(env, id) || id === user.id)) return json({ error: isOwner(env, id) ? "owner" : "self" }, 400);
  const target = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
  if (!target) return json({ error: "gone" }, 404);
  const now = Date.now(), steps = [];
  if (action === "ban") {
    // A banned admin loses the role too, so unbanning never hands it back by surprise
    steps.push(env.DB.prepare("UPDATE users SET banned = 1, role = 'user' WHERE id = ?").bind(id), env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id));
    if (body.removeTeams === true) steps.push(env.DB.prepare("UPDATE teams SET status = 'removed', reason = 'author banned', reviewed = ? WHERE user_id = ? AND status = 'approved'").bind(now, id));
  }
  if (action === "unban") steps.push(env.DB.prepare("UPDATE users SET banned = 0 WHERE id = ?").bind(id));
  if (action === "promote") steps.push(env.DB.prepare("UPDATE users SET role = 'admin' WHERE id = ? AND banned = 0").bind(id));
  if (action === "demote") steps.push(env.DB.prepare("UPDATE users SET role = 'user' WHERE id = ?").bind(id));
  await env.DB.batch(steps);
  await logAdmin(env, user.id, action, `user ${id}`, action === "ban" && body.removeTeams === true ? "teams removed" : "");
  return json({ ok: true });
}
