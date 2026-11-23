// /api/admin/teams: the teams, for the admin panel (/admin). Admins only; every change is logged.
// GET ?status=approved|reported|removed|pending|rejected&q=<text>&offset=<n>: up to 50 teams, newest first.
// POST { id, action }: remove (take off the site), restore (put back), approve and reject (teams sent before accounts,
// which still wait), dismiss (close the reports of a team and keep it)
import { json, logAdmin, needAdmin, readJson } from "../../../server/session.js";

const LIMIT = 50;
const STATUSES = ["approved", "removed", "pending", "rejected"];
// What each action needs the team to be, and what it becomes (dismiss keeps the status)
const ACTIONS = {
  remove: [["approved"], "removed"],
  restore: [["removed", "rejected"], "approved"],
  approve: [["pending"], "approved"],
  reject: [["pending"], "rejected"],
  dismiss: [["approved", "removed"], null]
};

export async function onRequestGet({ request, env }) {
  const { error } = await needAdmin(request, env, { write: false });
  if (error) return error;
  const url = new URL(request.url), status = url.searchParams.get("status") || "approved";
  const q = (url.searchParams.get("q") || "").trim().slice(0, 60), offset = Math.max(0, Math.floor(Number(url.searchParams.get("offset"))) || 0);
  const reported = status === "reported";
  if (!reported && !STATUSES.includes(status)) return json({ error: "bad" }, 400);
  // Each filter adds its value to binds and refers to it by number
  const binds = [], where = [];
  where.push(reported ? "EXISTS (SELECT 1 FROM reports r WHERE r.team_id = t.id AND r.resolved IS NULL)" : `t.status = ?${binds.push(status)}`);
  // A number finds that team; text finds the team name, the page or the author
  if (/^\d+$/.test(q)) where.push(`t.id = ?${binds.push(Number(q))}`);
  else if (q) {
    const n = binds.push(`%${q.replace(/[%_]/g, "")}%`);
    where.push(`(t.team LIKE ?${n} OR t.page LIKE ?${n} OR COALESCE(u.name, t.author) LIKE ?${n})`);
  }
  const { results } = await env.DB.prepare(`SELECT t.id, t.page, t.team, t.status, t.created, t.reason, t.user_id, COALESCE(u.name, t.author) AS author, u.banned,
      (SELECT COUNT(*) FROM likes l WHERE l.team_id = t.id) AS likes,
      (SELECT json_group_array(r.reason) FROM reports r WHERE r.team_id = t.id AND r.resolved IS NULL) AS reports
      FROM teams t LEFT JOIN users u ON u.id = t.user_id WHERE ${where.join(" AND ")} ORDER BY t.created DESC LIMIT ${LIMIT + 1} OFFSET ${offset}`)
    .bind(...binds).all();
  const teams = results.slice(0, LIMIT).map(row => ({ ...row, team: JSON.parse(row.team), reports: JSON.parse(row.reports || "[]"), banned: Boolean(row.banned) }));
  return json({ teams, more: results.length > LIMIT });
}

export async function onRequestPost({ request, env }) {
  const { user, error } = await needAdmin(request, env);
  if (error) return error;
  const body = await readJson(request);
  const id = Number(body?.id), action = ACTIONS[body?.action];
  if (!Number.isInteger(id) || !action) return json({ error: "bad" }, 400);
  const team = await env.DB.prepare("SELECT status FROM teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "gone" }, 404);
  const [from, to] = action;
  // Someone else decided first: the answer says how the team stands
  if (!from.includes(team.status)) return json({ error: "state", status: team.status }, 409);
  const now = Date.now(), steps = [];
  if (to) steps.push(env.DB.prepare("UPDATE teams SET status = ?, reason = ?, reviewed = ? WHERE id = ?")
    .bind(to, to === "approved" ? null : `${body.action} by an admin`, now, id));
  // Taking a team down, or deciding its reports are fine, closes its reports
  if (["remove", "dismiss"].includes(body.action)) steps.push(env.DB.prepare("UPDATE reports SET resolved = ? WHERE team_id = ? AND resolved IS NULL").bind(now, id));
  if (steps.length) await env.DB.batch(steps);
  await logAdmin(env, user.id, body.action, `team ${id}`);
  return json({ ok: true, status: to || team.status });
}
