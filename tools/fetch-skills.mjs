#!/usr/bin/env node
// Fetches the "Skills & Passives" section of character pages on https://grayravens.com/wiki and writes them to data/skills-data.js
// in the same format as the existing entries: "Name": [[type, skill name, effect], ...].
// Usage:
//   node tools/fetch-skills.mjs --comparar            refetches the characters that already have text and lists the differences
//   node tools/fetch-skills.mjs                       preview: fetches the characters that still have no text and prints a summary
//   node tools/fetch-skills.mjs --gravar              same, and appends them to data/skills-data.js
//   node tools/fetch-skills.mjs "Lee: Palefire" ...   only these characters
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(SITE, "data", "skills-data.js");
const args = process.argv.slice(2);
const flag = f => args.includes(f), names = args.filter(a => !a.startsWith("--"));

const load = async (path, prefix, name) => {
  const src = (await readFile(path, "utf8")) + `\n;return ${name};`;
  return new Function(prefix + src)();
};
const CONSTRUCTS = await load(join(SITE, "data", "assets-data.js"), "", "CONSTRUCTS");
const HAVE = await load(FILE, "", "CHARACTER_SKILLS");

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘" };
const decode = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
  if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1));
  return ENT[e] ?? m;
});
// HTML of a table cell -> plain text, one line per <br> / paragraph
const text = html => decode(html
  .replace(/<img[^>]*>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?p[^>]*>/gi, "\n").replace(/<\/?li[^>]*>/gi, "\n")
  .replace(/<[^>]+>/g, ""))
  .split("\n").map(l => l.replace(/[ \t\u00a0]+/g, " ").trim()).filter(Boolean).join("\n");

function parse(html) {
  const start = html.indexOf('id="Skills_&amp;_Passives"');
  if (start < 0) throw new Error("seção Skills & Passives não encontrada");
  const end = html.indexOf("<h2", start + 50);
  const section = html.slice(start, end < 0 ? undefined : end);
  const out = [];
  // Each tab: <div class="no-history-tab-header">TYPE</div> followed by one table with the skill name and the text
  const parts = section.split('<div class="no-history-tab-header">').slice(1);
  for (const part of parts) {
    const type = decode(part.slice(0, part.indexOf("</div>"))).trim();
    const th = part.match(/<th[^>]*custom-table&#95;th[^>]*>([\s\S]*?)<\/th>/)?.[1];
    const td = part.match(/<td[^>]*>([\s\S]*?)<\/td>/)?.[1];
    if (th === undefined || td === undefined) throw new Error(`aba "${type}" sem nome ou texto`);
    const name = text(th).replace(/\s+—\s+.*$/, "").trim();
    // The site writes the leader skill as "Leader - Name"; the wiki has only the name
    out.push([type, type === "Leader" ? `Leader - ${name}` : name, text(td)]);
  }
  return out;
}

const wikiUrl = name => "https://grayravens.com/wiki/" + encodeURIComponent(name.replace(/ /g, "_")).replace(/%3A/g, ":");
async function fetchSkills(name) {
  const r = await fetch(wikiUrl(name), { headers: { "User-Agent": "Mozilla/5.0 (skills-import)" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return parse(await r.text());
}

const todo = names.length ? names : Object.keys(CONSTRUCTS).filter(n => flag("--comparar") ? HAVE[n] : !HAVE[n]);
const got = {}, failed = [];
for (const name of todo) {
  try { got[name] = await fetchSkills(name); console.log(`ok   ${name} (${got[name].length} skills)`); }
  catch (e) { failed.push(`${name}: ${e.message}`); console.log(`ERRO ${name}: ${e.message}`); }
  await new Promise(r => setTimeout(r, 400));
}

if (flag("--comparar")) {
  let diffs = 0;
  for (const [name, skills] of Object.entries(got)) {
    const old = HAVE[name], line = x => JSON.stringify(x);
    if (old.length !== skills.length) { console.log(`${name}: ${old.length} skills no site, ${skills.length} na wiki`); diffs++; }
    skills.forEach(s => {
      const o = old.find(x => x[0] === s[0]);
      if (!o) { console.log(`${name} / ${s[0]}: tipo novo na wiki`); diffs++; return; }
      for (const k of [1, 2]) if (o[k] !== s[k]) { diffs++; console.log(`${name} / ${s[0]} [${k === 1 ? "nome" : "texto"}]\n  site: ${line(o[k]).slice(0, 220)}\n  wiki: ${line(s[k]).slice(0, 220)}`); }
    });
  }
  console.log(`\n${Object.keys(got).length} personagens comparados, ${diffs} diferença(s).`);
} else if (flag("--gravar")) {
  const src = await readFile(FILE, "utf8");
  const body = Object.entries(got).map(([name, skills]) =>
    `  ${JSON.stringify(name)}: [\n${skills.map(s => "    " + JSON.stringify(s)).join(",\n")}\n  ]`).join(",\n");
  const i = src.lastIndexOf("\n};");
  if (i < 0) throw new Error("fim de CHARACTER_SKILLS não encontrado");
  await writeFile(FILE, src.slice(0, i) + ",\n" + body + src.slice(i), "utf8");
  console.log(`\n${Object.keys(got).length} personagens gravados em data/skills-data.js.`);
} else console.log(`\n${Object.keys(got).length} personagens lidos. Use --gravar para escrever em data/skills-data.js.`);
if (failed.length) console.log("Falharam:\n- " + failed.join("\n- "));
