// POST /api/team-delete { id }: takes a team off the site.
// Its author erases it for good (with its likes and reports), so the same team can be published again later.
// An admin only takes it down (status removed): it stays in /admin, can be restored, and the action is logged
import { isAdmin, json, logAdmin, needUser, readJson } from "../../server/session.js";

export async function onRequestPost({ request, env }) {
  const { user, error } = await needUser(request, env);
  if (error) return error;
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!Number.isInteger(id)) return json({ error: "bad" }, 400);
  const team = await env.DB.prepare("SELECT user_id, status FROM teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "gone" }, 404);
  if (team.user_id && team.user_id === user.id) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM likes WHERE team_id = ?").bind(id),
      env.DB.prepare("DELETE FROM reports WHERE team_id = ?").bind(id),
      env.DB.prepare("DELETE FROM teams WHERE id = ?").bind(id)
    ]);
    return json({ ok: true, erased: true });
  }
  if (!isAdmin(env, user)) return json({ error: "admin" }, 403);
  if (team.status !== "approved") return json({ error: "state", status: team.status }, 409);
  await env.DB.prepare("UPDATE teams SET status = 'removed', reason = 'removed by an admin', reviewed = ? WHERE id = ?").bind(Date.now(), id).run();
  await env.DB.prepare("UPDATE reports SET resolved = ? WHERE team_id = ? AND resolved IS NULL").bind(Date.now(), id).run();
  await logAdmin(env, user.id, "remove", `team ${id}`, "from the team page");
  return json({ ok: true, removed: true });
}
