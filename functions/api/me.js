// /api/me: the account of this browser.
// GET answers { user, liked } (user is null when logged out); with ?teams=1 it adds the account's own teams, for /account.
// DELETE erases the account and everything it made (LGPD art. 18 VI, GDPR art. 17): its teams, likes, reports and sessions.
import { isAdmin, isOwner, json, needUser, setCookie } from "../../server/session.js";

export async function onRequestGet({ request, env }) {
  const { user } = await needUser(request, env, { write: false });
  if (!user) return json({ user: null, liked: [] });
  const liked = await env.DB.prepare("SELECT team_id FROM likes WHERE user_id = ?").bind(user.id).all();
  const out = { user: { id: user.id, name: user.name, admin: isAdmin(env, user), owner: isOwner(env, user.id) }, liked: liked.results.map(r => r.team_id) };
  if (new URL(request.url).searchParams.get("teams")) {
    const { results } = await env.DB.prepare(`SELECT t.id, t.page, t.team, t.status, t.created, (SELECT COUNT(*) FROM likes l WHERE l.team_id = t.id) AS likes
        FROM teams t WHERE t.user_id = ? ORDER BY t.created DESC`).bind(user.id).all();
    out.teams = results.map(row => ({ id: row.id, page: row.page, name: JSON.parse(row.team).name, status: row.status, created: row.created, likes: row.likes }));
  }
  return json(out);
}

export async function onRequestDelete({ request, env }) {
  const { user, error } = await needUser(request, env);
  if (error) return error;
  // The owner's account keeps the site running: it is never erased from here
  if (isOwner(env, user.id)) return json({ error: "owner" }, 400);
  const mine = "SELECT id FROM teams WHERE user_id = ?1";
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM likes WHERE user_id = ?1 OR team_id IN (${mine})`).bind(user.id),
    env.DB.prepare(`DELETE FROM reports WHERE user_id = ?1 OR team_id IN (${mine})`).bind(user.id),
    env.DB.prepare("DELETE FROM teams WHERE user_id = ?1").bind(user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(user.id),
    env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(user.id)
  ]);
  return json({ ok: true }, 200, { "set-cookie": setCookie(request, "dk_session", "", 0) });
}
