// GET /api/admin/log?offset=<n>: what the admins did, newest first, 100 at a time. Admins only
import { json, needAdmin } from "../../../server/session.js";

const LIMIT = 100;

export async function onRequestGet({ request, env }) {
  const { error } = await needAdmin(request, env, { write: false });
  if (error) return error;
  const offset = Math.max(0, Math.floor(Number(new URL(request.url).searchParams.get("offset"))) || 0);
  const { results } = await env.DB.prepare(`SELECT a.id, a.action, a.target, a.detail, a.created, a.admin_id, COALESCE(u.name, a.admin_id) AS admin
      FROM admin_log a LEFT JOIN users u ON u.id = a.admin_id ORDER BY a.created DESC LIMIT ${LIMIT + 1} OFFSET ${offset}`).all();
  return json({ log: results.slice(0, LIMIT), more: results.length > LIMIT });
}
