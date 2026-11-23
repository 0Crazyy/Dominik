// POST /api/like { id, on }: likes a team (on: true) or takes the like back (on: false). One like per account per team.
// Answers { likes, on } with the team's new count
import { HOUR, json, needUser, readJson } from "../../server/session.js";

const PER_HOUR = 200; // likes one account can give in an hour: far more than a person clicks, far less than a script

export async function onRequestPost({ request, env }) {
  const { user, error } = await needUser(request, env);
  if (error) return error;
  const body = await readJson(request);
  const id = Number(body?.id), on = body?.on === true;
  if (!Number.isInteger(id)) return json({ error: "bad" }, 400);
  const team = await env.DB.prepare("SELECT id FROM teams WHERE id = ? AND status = 'approved'").bind(id).first();
  if (!team) return json({ error: "gone" }, 404);
  const now = Date.now();
  if (on) {
    const { given } = await env.DB.prepare("SELECT COUNT(*) AS given FROM likes WHERE user_id = ? AND created > ?").bind(user.id, now - HOUR).first();
    if (given >= PER_HOUR) return json({ error: "limit" }, 429);
    await env.DB.prepare("INSERT OR IGNORE INTO likes (user_id, team_id, created) VALUES (?, ?, ?)").bind(user.id, id, now).run();
  } else {
    await env.DB.prepare("DELETE FROM likes WHERE user_id = ? AND team_id = ?").bind(user.id, id).run();
  }
  const { likes } = await env.DB.prepare("SELECT COUNT(*) AS likes FROM likes WHERE team_id = ?").bind(id).first();
  return json({ likes, on });
}
