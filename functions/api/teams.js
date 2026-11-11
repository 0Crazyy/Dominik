// GET /api/teams: every approved community team, as tools/review-teams.mjs last wrote them to KV.
// Pages read this once per visit, so it never touches the database
const HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60", "x-content-type-options": "nosniff" };

export async function onRequestGet({ env }) {
  const teams = await env.CACHE.get("teams").catch(() => null);
  return new Response(teams || "[]", { headers: HEADERS });
}
