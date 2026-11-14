// /api/share: short links for teams made in the Team Builder. POST stores a team and answers with a short code, GET hands the team
// back for a code. The link is /editor?s=<code>. The team is rebuilt from catalog names, as in submit.js, so a stored team can't carry
// anything else. There is no verification step (sharing has to be quick), so the limits per address and the size caps are what stop abuse.
import { cleanTeam, teamLinks } from "../../server/team.js";

const HOUR = 3600e3, DAY = 24 * HOUR;
const MAX_BODY = 40000;          // characters; a full team is far under this
const MAX_SHARES = 20000;        // rows kept: a flood stops here
const PER_HOUR = 20, PER_DAY = 60; // new links one address can make (sharing the same team again costs nothing)
const IP_LIFE = 2 * DAY;         // how long the hashed address of a sender is kept
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l: a code is easy to read out and to type
const CODE = /^[a-z0-9]{6,12}$/;

const json = (data, status = 200, cache = "no-store") => new Response(JSON.stringify(data), { status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache, "x-content-type-options": "nosniff" } });
const sha = async text => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
  .map(b => b.toString(16).padStart(2, "0")).join("");
const makeCode = () => Array.from(crypto.getRandomValues(new Uint8Array(7)), b => ALPHABET[b % ALPHABET.length]).join("");

export async function onRequestGet({ request, env }) {
  const code = new URL(request.url).searchParams.get("c") || "";
  if (!CODE.test(code)) return json({ error: "bad" }, 400);
  if (!env.DB) return json({ error: "off" }, 503);
  const row = await env.DB.prepare("SELECT team FROM shares WHERE code = ?").bind(code).first();
  // A code never changes what it points to, so the answer can be cached
  return row ? json({ team: JSON.parse(row.team) }, 200, "public, max-age=3600") : json({ error: "missing" }, 404);
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "off" }, 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "bad" }, 403);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "bad" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { /* handled below */ }
  if (!body || typeof body !== "object") return json({ error: "bad" }, 400);

  const team = cleanTeam(body.team);
  if (!team.cards.some(c => c.char)) return json({ error: "empty" }, 400);
  // Links are what spam is sent for, and nothing in a build needs one
  if (teamLinks(team)) return json({ error: "links" }, 400);

  const hash = await sha(JSON.stringify(team)), now = Date.now();
  const same = await env.DB.prepare("SELECT code FROM shares WHERE hash = ?").bind(hash).first();
  if (same) return json({ code: same.code });

  const ip = request.headers.get("cf-connecting-ip") || "", ipHash = await sha(`${ip}:${env.TURNSTILE_SECRET || "share"}`);
  const seen = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM shares) AS total,
      (SELECT COUNT(*) FROM shares WHERE ip_hash = ?1 AND created > ?2) AS hour,
      (SELECT COUNT(*) FROM shares WHERE ip_hash = ?1 AND created > ?3) AS day`)
    .bind(ipHash, now - HOUR, now - DAY).first();
  if (seen.hour >= PER_HOUR || seen.day >= PER_DAY) return json({ error: "limit" }, 429);
  if (seen.total >= MAX_SHARES) return json({ error: "full" }, 503);

  await env.DB.prepare("UPDATE shares SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created < ?").bind(now - IP_LIFE).run();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    try {
      await env.DB.prepare("INSERT INTO shares (code, team, hash, ip_hash, created) VALUES (?, ?, ?, ?, ?)")
        .bind(code, JSON.stringify(team), hash, ipHash, now).run();
      return json({ code });
    } catch {
      // The code is taken, or the same team arrived at the same time: use the one that is stored
      const stored = await env.DB.prepare("SELECT code FROM shares WHERE hash = ?").bind(hash).first();
      if (stored) return json({ code: stored.code });
    }
  }
  return json({ error: "busy" }, 503);
}
