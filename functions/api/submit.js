// /api/submit: a team made in the Team Builder goes on the site, under the account that sends it. There is no review:
// admins take down what breaks the rules (/admin), and anyone logged in can report a team.
// GET hands out what the form needs; POST stores the team. Nothing here trusts the browser:
// the team is rebuilt from catalog names, and each check below stops one kind of abuse.
import { teamProblem, cleanTeam } from "../../server/team.js";
import { DAY, HOUR, forgetOldAddresses, ipHash, json, needUser, readJson, sha } from "../../server/session.js";

const MAX_BODY = 30000;      // characters; a full team is under half of this
const PER_HOUR = 3, PER_DAY = 5; // teams one account (and one address) can publish
const MIN_WAIT = 10e3;       // nobody builds a team in under 10 seconds
const STAMP_LIFE = 12 * HOUR;

// Proof of when the form was opened: the time, signed so it can't be made up
const stamp = async (time, secret) => `${time}.${await sha(`${time}:${secret}`)}`;

export async function onRequestGet({ env }) {
  if (!env.TURNSTILE_SECRET) return json({ open: false });
  return json({ open: true, siteKey: env.TURNSTILE_SITE_KEY, stamp: await stamp(Date.now(), env.TURNSTILE_SECRET) });
}

export async function onRequestPost({ request, env }) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) return json({ error: "off" }, 503);
  const { user, error } = await needUser(request, env);
  if (error) return error;
  const body = await readJson(request, MAX_BODY);
  if (!body) return json({ error: "bad" }, 400);
  // A field people never see: only a bot fills it in, and it is told all went well
  if (body.website) return json({ ok: true });

  const [time, signature] = String(body.stamp || "").split("."), age = Date.now() - Number(time);
  if (!signature || await stamp(time, secret) !== body.stamp || !(age < STAMP_LIFE)) return json({ error: "stale" }, 400);
  if (age < MIN_WAIT) return json({ error: "early" }, 429);

  const team = cleanTeam(body.team);
  const problem = teamProblem(team);
  if (problem) return json({ error: problem }, 400);

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", String(body.token || "").slice(0, 2048));
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form })
    .then(r => r.json()).catch(() => null);
  if (!check?.success) return json({ error: "captcha" }, 403);

  const now = Date.now(), address = await ipHash(request, env), hash = await sha(JSON.stringify(team));
  const counts = `SELECT
      (SELECT COUNT(*) FROM teams WHERE (user_id = ?1 OR ip_hash = ?2) AND created > ?3) AS hour,
      (SELECT COUNT(*) FROM teams WHERE (user_id = ?1 OR ip_hash = ?2) AND created > ?4) AS day`;
  const over = row => row.hour > PER_HOUR || row.day > PER_DAY;
  const seen = await env.DB.prepare(`${counts}, (SELECT COUNT(*) FROM teams WHERE hash = ?5) AS same`)
    .bind(user.id, address, now - HOUR, now - DAY, hash).first();
  if (seen.same) return json({ error: "duplicate" }, 409);
  if (seen.hour >= PER_HOUR || seen.day >= PER_DAY) return json({ error: "limit" }, 429);

  let added;
  try {
    [, , added] = await env.DB.batch([
      ...forgetOldAddresses(env, now),
      env.DB.prepare("INSERT INTO teams (page, status, team, author, hash, ip_hash, created, reviewed, user_id) VALUES (?, 'approved', ?, ?, ?, ?, ?, ?, ?)")
        .bind(team.page, JSON.stringify(team), user.name, hash, address, now, now, user.id)
    ]);
  } catch {
    // The same team arrived at the same time (the hash is unique)
    return json({ error: "duplicate" }, 409);
  }
  const id = added.meta.last_row_id;
  // Check the limits again after the insert to close the concurrency window:
  // D1 serializes the INSERT, so the new row already counts in the query below.
  if (over(await env.DB.prepare(counts).bind(user.id, address, now - HOUR, now - DAY).first())) {
    await env.DB.prepare("DELETE FROM teams WHERE id = ?").bind(id).run();
    return json({ error: "limit" }, 429);
  }
  return json({ ok: true, id, page: team.page });
}
