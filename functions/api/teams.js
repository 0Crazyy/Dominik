// GET /api/teams: every team on the site, with its author and likes, read from the database.
// Newest first, as the page lists them. Each page asks once per visit. The answer is kept 30 s in the Cloudflare cache of each data center, so busy hours
// don't read the database on every visit. After publishing, liking or deleting, the page asks with ?fresh=<time>,
// which skips that cache, so the person sees the change at once.
const TTL = 30;

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url), cache = caches.default, cacheable = !url.search;
  if (cacheable) {
    const hit = await cache.match(request);
    if (hit) return hit;
  }
  const { results } = await env.DB.prepare(`SELECT t.id, t.team, t.created, t.user_id, COALESCE(u.name, t.author) AS author,
      (SELECT COUNT(*) FROM likes l WHERE l.team_id = t.id) AS likes
      FROM teams t LEFT JOIN users u ON u.id = t.user_id WHERE t.status = 'approved' ORDER BY t.created DESC`).all();
  const body = JSON.stringify(results.map(row => ({ id: row.id, author: row.author, user: row.user_id || "", created: row.created, likes: row.likes, team: JSON.parse(row.team) })));
  const headers = { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff" };
  if (cacheable) waitUntil(cache.put(request, new Response(body, { headers: { ...headers, "cache-control": `public, max-age=${TTL}` } })));
  // The browser itself keeps nothing: the next page asks again, and gets the data center's copy
  return new Response(body, { headers: { ...headers, "cache-control": "no-store" } });
}
