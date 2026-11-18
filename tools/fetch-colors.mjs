#!/usr/bin/env node
// Copies the game's text colors into the skill texts of data/skills-data.js, without changing the words.
// The texts come from the Gray Ravens wiki with no colors; https://api.huaxu.app hands out the game's own text with
// <color=#...> tags. This script renders each Huaxu skill at level 18, takes its colored parts in order, finds each one in the
// site's text of the same skill and wraps it: [r]...[/r] for red (values, game terms) and [b]...[/b] for blue (conditions).
// app.js (highlight) turns these marks into the site's colors; a text with no marks keeps the old automatic coloring.
// Usage:
//   node tools/fetch-colors.mjs                       preview: what would be marked, character by character
//   node tools/fetch-colors.mjs "Lee: Palefire" ...   only these characters
//   node tools/fetch-colors.mjs --detalhe             also prints each marked line
//   node tools/fetch-colors.mjs --gravar              writes the marks into data/skills-data.js
//   node tools/fetch-colors.mjs --cubs [--gravar]     the same for the C.U.B. skills (CUB_SKILLS in data/assets-data.js)
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(SITE, "data", "skills-data.js");
const API = "https://api.huaxu.app/servers/na";
const LEVEL = "18"; // the level the site's texts use
const args = process.argv.slice(2);
const flag = f => args.includes(f), names = args.filter(a => !a.startsWith("--"));

const src = await readFile(FILE, "utf8");
const SKILLS = new Function(src + "\n;return CHARACTER_SKILLS;")();

// Game colors -> site marks. Gray (#645F5D) is text of a level not reached yet: the site shows it plain
const COLOR = { d91414: "r", ff6347: "r", "0f70bc": "b", "0d70bc": "b" };
const MAX_MARK = 80; // a whole colored sentence (a level bonus) stays plain: the mark is for values, terms and conditions

const get = async path => {
  const r = await fetch(`${API}/${path}`, { headers: { "User-Agent": "Mozilla/5.0 (dominik-colors)" } });
  const body = await r.json().catch(() => null);
  if (!r.ok || body?.status !== "success") throw new Error(`${path}: ${body?.message || `HTTP ${r.status}`}`);
  return body.data;
};
const clean = s => s.replace(/\\n/g, "\n").replace(/[^\S\n]/g, " "); // nbsp and other odd spaces become plain spaces
// A Huaxu skill at level 18 -> list of [mark, text] in reading order
function coloredParts(skill) {
  const level = skill.levels?.[LEVEL] || skill.levels?.[Object.keys(skill.levels || {}).at(-1)];
  if (!level) return [];
  const parts = [];
  for (const [i, tpl] of Object.entries(skill.templates?.[level.template] || [])) {
    const values = level.values?.[i] || level.values?.[0] || [];
    parts.push(...partsOf(`${tpl.title || ""}\n${tpl.description || ""}`.replace(/\{(\d+)\}/g, (_, n) => values[n] ?? `{${n}}`)));
  }
  return parts;
}
// Game text with <color> tags -> list of [mark, text]. Nested tags happen ("<color=#D91414><color=#D91414>5%"): the innermost color wins
function partsOf(raw) {
  const parts = [];
  for (const m of clean(raw).matchAll(/<color=#(\w{6})>((?:(?!<\/?color).)*)<\/color>/gis)) {
    const mark = COLOR[m[1].toLowerCase()], inner = m[2].replace(/<[^>]+>/g, "").trim();
    if (mark && inner && inner.length <= MAX_MARK) parts.push([mark, inner]);
  }
  return parts;
}
const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// "3/4/5" in the game is "3 /4 /5" or "3 / 4 / 5" on the wiki: spaces around slashes and before units are optional
const pattern = text => new RegExp(text.trim().split(/\s*\/\s*/).map(p => escRe(p).replace(/\s+/g, "\\s+")).join("\\s*\\/\\s*")
  .replace(/^(\d)/, "(?<![\\d.])$1").replace(/(\d)$/, "$1(?![\\d.])"));

// Marks each part in the site text, in order: a part not found after the last one is searched from the start once more
function markText(text, parts) {
  let out = text, from = 0, found = 0;
  const missed = [];
  for (const [mark, part] of parts) {
    const re = pattern(part);
    const open = `[${mark}]`, close = `[/${mark}]`;
    const search = start => {
      const rest = out.slice(start);
      // Skip what is already inside a mark
      for (const m of rest.matchAll(new RegExp(re.source, "g"))) {
        const at = start + m.index, before = out.slice(0, at);
        if ((before.match(/\[[rb]\]/g) || []).length > (before.match(/\[\/[rb]\]/g) || []).length) continue;
        return { at, len: m[0].length };
      }
      return null;
    };
    const hit = search(from) || search(0);
    if (!hit) { missed.push(part); continue; }
    out = out.slice(0, hit.at) + open + out.slice(hit.at, hit.at + hit.len) + close + out.slice(hit.at + hit.len);
    from = hit.at + open.length + hit.len + close.length;
    found++;
  }
  return { text: out, found, missed };
}

// Huaxu names a collab frame "2B: 2B" and writes "No. 21" where the site has "No.21": names are compared without spaces
const nameKey = s => s.toLowerCase().replace(/\s+/g, "");
const report = [];

// --cubs: the C.U.B. skills of CUB_SKILLS in data/assets-data.js, whose texts are at the highest level, like Huaxu's main description.
// Each text is replaced where it is in the file, so the rest of assets-data.js stays byte for byte
if (flag("--cubs")) {
  const ASSETS = join(SITE, "data", "assets-data.js");
  let assets = await readFile(ASSETS, "utf8");
  const CUBS = new Function(assets + "\n;return CUB_SKILLS;")();
  const { readdir } = await import("node:fs/promises");
  const huaxu = new Map((await get("cubs")).cubs?.map(c => [nameKey(c.name), c.slug]) || []);
  const words = s => new Set(norm(s).split(" ").filter(w => w.length > 3));
  let total = 0, missedAll = 0;
  for (const [folder, skills] of Object.entries(CUBS)) {
    const file = (await readdir(join(SITE, "assets", "characters", folder)).catch(() => [])).find(f => /^CUB - (?!Active |Skill )/.test(f));
    // A C.U.B. with no owner has a folder of its own, named like Huaxu's slug ("yuan-ye")
    const slugs = new Set(huaxu.values());
    const cubName = file?.replace(/^CUB - /, "").replace(/\.\w+$/, "") || folder;
    const slug = huaxu.get(nameKey(cubName)) || (slugs.has(folder) ? folder : null);
    if (!slug) { report.push(`${folder}: C.U.B. "${cubName}" não achado no Huaxu`); continue; }
    let data;
    try { data = await get(`cubs/${slug}`); } catch (e) { report.push(`${folder}: ${e.message}`); continue; }
    const theirs = (data.skills || []).map(s => ({ text: `${s.name}\n${s.description || ""}`, words: words(s.description || "") }));
    let found = 0, missed = [];
    for (const [, text] of skills) {
      const plain = text.replace(/\[\/?[rb]\]/g, ""), mine = words(plain);
      // The C.U.B. texts of the site join or split Huaxu's skills, so every Huaxu skill that shares words with this one is used, best first
      const parts = theirs.map(t => ({ ...t, score: [...t.words].filter(w => mine.has(w)).length / Math.max(1, t.words.size) }))
        .filter(t => t.score > 0.5).sort((a, b) => b.score - a.score).flatMap(t => partsOf(t.text));
      const m = markText(plain, parts);
      found += m.found; missed.push(...m.missed);
      if (flag("--detalhe")) console.log(`\n${cubName}\n  ${m.text.slice(0, 400)}`);
      if (m.found && flag("--gravar")) {
        const from = JSON.stringify(text), to = JSON.stringify(m.text);
        if (assets.split(from).length !== 2) { report.push(`${cubName}: texto não achado uma única vez em assets-data.js`); continue; }
        assets = assets.replace(from, () => to);
      }
    }
    total += found; missedAll += missed.length;
    console.log(`${missed.length ? "AVISO" : "ok   "} ${cubName}: ${found} marcas${missed.length ? `, ${missed.length} não achados` : ""}`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n${total} marcas, ${missedAll} trecho(s) não achados.`);
  if (report.length) console.log("Problemas:\n- " + report.join("\n- "));
  if (flag("--gravar")) { await writeFile(ASSETS, assets, "utf8"); console.log("Marcas gravadas em data/assets-data.js."); }
  else console.log("Prévia: nada foi gravado. Use --cubs --gravar para escrever em data/assets-data.js.");
  process.exit(0);
}

const list = await get("characters");
const slugs = new Map(list.characters.flatMap(c => [[nameKey(`${c.characterName}: ${c.frameName}`), c.slug],
  ...(c.characterName === c.frameName ? [[nameKey(c.characterName), c.slug]] : [])]));
const slugOf = name => slugs.get(nameKey(name));
const todo = names.length ? names : Object.keys(SKILLS);
const result = {};
let totalFound = 0, totalMissed = 0;
for (const name of todo) {
  const slug = slugOf(name);
  if (!SKILLS[name]) { report.push(`${name}: não está em skills-data.js`); continue; }
  if (!slug) { report.push(`${name}: não achei no Huaxu`); continue; }
  let data;
  try { data = await get(`characters/${slug}/skills`); } catch (e) { report.push(`${name}: ${e.message}`); continue; }
  const huaxu = new Map();
  for (const group of [...(data.normal || []), ...(data.leap || [])]) for (const s of group.skills || []) huaxu.set(norm(s.name), s);
  let found = 0, missed = 0, noMatch = [];
  result[name] = SKILLS[name].map(([type, skillName, text]) => {
    const plain = text.replace(/\[\/?[rb]\]/g, "");
    const key = norm(skillName.replace(/^Leader - /, "").replace(/^Signature - /, ""));
    const s = huaxu.get(norm(skillName)) || huaxu.get(key) || [...huaxu.entries()].find(([k]) => k.endsWith(key) || key.endsWith(k))?.[1];
    if (!s) { noMatch.push(skillName); return [type, skillName, plain]; }
    const m = markText(plain, coloredParts(s));
    found += m.found; missed += m.missed.length;
    if (flag("--detalhe")) {
      console.log(`\n${name} / ${skillName}`);
      m.text.split("\n").filter(l => /\[[rb]\]/.test(l)).forEach(l => console.log("  " + l));
      if (m.missed.length) console.log("  não achados: " + m.missed.map(x => JSON.stringify(x)).join(", "));
    }
    return [type, skillName, m.text];
  });
  totalFound += found; totalMissed += missed;
  console.log(`${missed ? "AVISO" : "ok   "} ${name}: ${found} marcas${missed ? `, ${missed} trecho(s) do Huaxu não achados no texto` : ""}${noMatch.length ? `; skills sem par no Huaxu: ${noMatch.join(", ")}` : ""}`);
  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n${Object.keys(result).length} personagens, ${totalFound} marcas, ${totalMissed} trecho(s) não achados.`);
if (report.length) console.log("Problemas:\n- " + report.join("\n- "));
if (flag("--gravar")) {
  let out = src;
  for (const [name, skills] of Object.entries(result)) {
    const start = out.indexOf(`  ${JSON.stringify(name)}: [\n`);
    const end = out.indexOf("\n  ]", start);
    if (start < 0 || end < 0) { console.log(`ERRO ${name}: bloco não encontrado no arquivo`); continue; }
    const body = `  ${JSON.stringify(name)}: [\n${skills.map(s => "    " + JSON.stringify(s)).join(",\n")}`;
    out = out.slice(0, start) + body + out.slice(end);
  }
  await writeFile(FILE, out, "utf8");
  console.log("Marcas gravadas em data/skills-data.js.");
} else console.log("Prévia: nada foi gravado. Use --gravar para escrever em data/skills-data.js.");
