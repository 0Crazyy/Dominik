// /api/submit: a team sent from the Team Builder goes to the review queue (tools/review-teams.mjs approves it).
// GET hands out what the form needs; POST stores the team. Nothing here trusts the browser:
// the team is rebuilt from catalog names, and each check below stops one kind of abuse.
import { cleanAuthor, cleanTeam, teamProblem } from "../../server/team.js";

const HOUR = 3600e3, DAY = 24 * HOUR;
const MAX_BODY = 30000;      // characters; a full team is under half of this
const MAX_PENDING = 30;      // teams waiting for review: a flood stops here
const PER_HOUR = 3, PER_DAY = 5; // teams one address can send
const MIN_WAIT = 10e3;       // nobody builds a team in under 10 seconds
const STAMP_LIFE = 12 * HOUR;
const IP_LIFE = 2 * DAY;     // how long the hashed address of a sender is kept

const json = (data, status = 200) => new Response(JSON.stringify(data), { status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const sha = async text => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
  .map(b => b.toString(16).padStart(2, "0")).join("");
// Proof of when the form was opened: the time, signed so it can't be made up
const stamp = async (time, secret) => `${time}.${await sha(`${time}:${secret}`)}`;

export async function onRequestGet({ env }) {
  if (!env.TURNSTILE_SECRET) return json({ open: false });
  return json({ open: true, siteKey: env.TURNSTILE_SITE_KEY, stamp: await stamp(Date.now(), env.TURNSTILE_SECRET) });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return json({ error: "off" }, 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "bad" }, 403);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "bad" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { /* handled below */ }
  if (!body || typeof body !== "object") return json({ error: "bad" }, 400);
  // A field people never see: only a bot fills it in, and it is told all went well
  if (body.website) return json({ ok: true });

  const [time, signature] = String(body.stamp || "").split("."), age = Date.now() - Number(time);
  if (!signature || await stamp(time, secret) !== body.stamp || !(age < STAMP_LIFE)) return json({ error: "stale" }, 400);
  if (age < MIN_WAIT) return json({ error: "early" }, 429);

  const team = cleanTeam(body.team), author = cleanAuthor(body.author);
  const problem = teamProblem(team, author);
  if (problem) return json({ error: problem }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "";
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", String(body.token || "").slice(0, 2048));
  if (ip) form.append("remoteip", ip);
  const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form })
    .then(r => r.json()).catch(() => null);
  if (!check?.success) return json({ error: "captcha" }, 403);

  // The address is only kept hashed, and only to count what it sent
  const now = Date.now(), ipHash = await sha(`${ip}:${secret}`), hash = await sha(JSON.stringify(team));
  const seen = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM teams WHERE hash = ?1) AS same,
      (SELECT COUNT(*) FROM teams WHERE status = 'pending') AS pending,
      (SELECT COUNT(*) FROM teams WHERE ip_hash = ?2 AND created > ?3) AS hour,
      (SELECT COUNT(*) FROM teams WHERE ip_hash = ?2 AND created > ?4) AS day`)
    .bind(hash, ipHash, now - HOUR, now - DAY).first();
  if (seen.same) return json({ error: "duplicate" }, 409);
  if (seen.hour >= PER_HOUR || seen.day >= PER_DAY) return json({ error: "limit" }, 429);
  if (seen.pending >= MAX_PENDING) return json({ error: "full" }, 503);

  const [, added] = await env.DB.batch([
    env.DB.prepare("UPDATE teams SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created < ?").bind(now - IP_LIFE),
    env.DB.prepare("INSERT INTO teams (page, team, author, hash, ip_hash, created) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(team.page, JSON.stringify(team), author, hash, ipHash, now)
  ]);
  // Check the limits again after the insert to close the concurrency window:
  // D1 serializes the INSERT, so the new row already counts in the queries below.
  const after = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM teams WHERE status = 'pending') AS pending,
      (SELECT COUNT(*) FROM teams WHERE ip_hash = ?1 AND created > ?2) AS hour,
      (SELECT COUNT(*) FROM teams WHERE ip_hash = ?1 AND created > ?3) AS day`)
    .bind(ipHash, now - HOUR, now - DAY).first();
  if (after.pending > MAX_PENDING || after.hour > PER_HOUR || after.day > PER_DAY) {
    await env.DB.prepare("DELETE FROM teams WHERE hash = ?").bind(hash).run();
    return json({ error: after.pending > MAX_PENDING ? "full" : "limit" }, 503);
  }
  if (env.DISCORD_WEBHOOK_URL) {
    const content = `New team to review (#${added.meta.last_row_id}): **${team.name.replace(/[*_`~|\\@#<>]/g, "")}** on ${team.page}, ${seen.pending + 1} waiting.`;
    waitUntil(fetch(env.DISCORD_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }) }).catch(() => {}));
  }
  return json({ ok: true });
}
