// GET /api/hidden: ids of the official builds (written in app.js) that tools/review-gui.mjs took off the site, as the tool last wrote them to KV.
// The page reads this once per visit, together with /api/teams, and drops those builds, so hiding one needs no deploy
const HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60", "x-content-type-options": "nosniff" };

export async function onRequestGet({ env }) {
  const hidden = await env.CACHE.get("hidden").catch(() => null);
  return new Response(hidden || "[]", { headers: HEADERS });
}
