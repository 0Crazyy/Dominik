// POST /api/report { id, reason }: tells the admins a team breaks the rules. One report per account per team;
// a second one answers { ok, already }. The reports wait in the Reports tab of /admin
import { DAY, json, needUser, readJson } from "../../server/session.js";

const PER_DAY = 10;
// Keep in step with REPORT_REASONS in app.js
const REASONS = ["Offensive or hateful", "Spam or advertising", "Wrong or misleading build", "Copied from someone else", "Other"];

export async function onRequestPost({ request, env }) {
  const { user, error } = await needUser(request, env);
  if (error) return error;
  const body = await readJson(request);
  const id = Number(body?.id), reason = REASONS.includes(body?.reason) ? body.reason : "";
  const note = typeof body?.note === "string" ? body.note.replace(/\s+/g, " ").trim().slice(0, 300) : "";
  if (!Number.isInteger(id) || !reason) return json({ error: "bad" }, 400);
  const team = await env.DB.prepare("SELECT user_id FROM teams WHERE id = ? AND status = 'approved'").bind(id).first();
  if (!team) return json({ error: "gone" }, 404);
  if (team.user_id === user.id) return json({ error: "own" }, 400);
  const now = Date.now();
  const { sent } = await env.DB.prepare("SELECT COUNT(*) AS sent FROM reports WHERE user_id = ? AND created > ?").bind(user.id, now - DAY).first();
  if (sent >= PER_DAY) return json({ error: "limit" }, 429);
  const done = await env.DB.prepare("INSERT OR IGNORE INTO reports (team_id, user_id, reason, created) VALUES (?, ?, ?, ?)")
    .bind(id, user.id, note ? `${reason}: ${note}` : reason, now).run();
  return json({ ok: true, already: !done.meta.changes });
}
