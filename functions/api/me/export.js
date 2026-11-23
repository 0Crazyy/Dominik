// GET /api/me/export: everything the site keeps about this account, as a JSON file to download
// (LGPD art. 18 II and V, GDPR arts. 15 and 20). Hashed addresses are left out: they can't be tied back to anyone, this account included
import { json, needUser } from "../../../server/session.js";

export async function onRequestGet({ request, env }) {
  const { user, error } = await needUser(request, env, { write: false });
  if (error) return error;
  const all = (sql, ...args) => env.DB.prepare(sql).bind(...args).all().then(r => r.results);
  const [account, teams, likes, reports, sessions] = await Promise.all([
    env.DB.prepare("SELECT id, name, role, created, seen FROM users WHERE id = ?").bind(user.id).first(),
    all("SELECT id, page, status, created, team FROM teams WHERE user_id = ? ORDER BY created", user.id),
    all("SELECT team_id, created FROM likes WHERE user_id = ? ORDER BY created", user.id),
    all("SELECT team_id, reason, created, resolved FROM reports WHERE user_id = ? ORDER BY created", user.id),
    all("SELECT created, expires FROM sessions WHERE user_id = ? ORDER BY created", user.id)
  ]);
  const data = { exported: new Date().toISOString(), site: new URL(request.url).origin, account,
    teams: teams.map(t => ({ ...t, team: JSON.parse(t.team) })), likes, reports, sessions };
  return json(data, 200, { "content-disposition": 'attachment; filename="dominik-data.json"' });
}
