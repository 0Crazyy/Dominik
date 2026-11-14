#!/usr/bin/env node
// Copies the skill icons of each character from the game-asset folder to assets/characters/<id>/skills/.
// The source files have code names (r3adelaidehong1.png); the suffix says which skill it is.
// Only characters that still have no skills/ folder are touched. Run without flags to preview; --aplicar writes the files.
// Afterwards run: node tools/optimize-images.mjs
// Usage: node tools/import-skill-icons.mjs [--aplicar] [--origem "<pasta>"]
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHARS = join(SITE, "assets", "characters");
const APPLY = process.argv.includes("--aplicar");
const oi = process.argv.indexOf("--origem");
const SRC = oi > 0 ? process.argv[oi + 1]
  : "C:/Users/fabio/Pictures/PGR/01 Assets do Jogo/Skills/- Personagens, Memórias e Ícones";

// File suffix -> icon name used by skillIcon() in app.js. Core is also copied as Class: the finished characters do the same.
const SUFFIX = { pugong: "Basic Attack", hong: "Red Orb", huang: "Yellow Orb", lan: "Blue Orb", hexin: "Core",
  dazhao: "Signature", a: "Leader", s: "SS-Rank", ss: "SSS-Rank", sss: "SSS+ Rank" };
// QTE and Awakening are the same generic art for every character: copied from one that is already done
const GENERIC = ["QTE", "Awakening"], GENERIC_FROM = join(CHARS, "adelyde-anabasis", "skills");

const key = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const sites = (await readdir(CHARS, { withFileTypes: true })).filter(d => d.isDirectory() && d.name !== "roleicon").map(d => d.name);
const byKey = new Map(sites.map(id => [key(id), id]));

let done = 0; const problems = [];
for (const dir of (await readdir(SRC, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)) {
  const [a, b] = dir.split("꞉").map(s => s.trim());
  if (!b) continue; // "- CUBs Rank A", "Ícones de Classe" and the like
  const id = byKey.get(key(a === b ? a : a + b));
  if (!id) { problems.push(`${dir}: sem pasta no site`); continue; }
  const out = join(CHARS, id, "skills");
  if (existsSync(out)) continue;

  // r3adelaidehong1.png -> adelaidehong1.png (some files come without the r3)
  const files = (await readdir(join(SRC, dir))).filter(f => /1\.png$/i.test(f) && !/^rolehead/i.test(f)).map(f => [f, f.replace(/^r\d/, "")]);
  // The name before "hong" is the character's code; "exhuang" and the like (extra forms) must not be taken as the base
  const shortest = re => files.filter(([, n]) => re.test(n)).sort((x, y) => x[1].length - y[1].length)[0];
  const anchor = shortest(/hong1\.png$/) || shortest(/lan1\.png$/);
  if (!anchor) { problems.push(`${dir}: sem ícone de Red Orb nem de Blue Orb para achar o prefixo`); continue; }
  const base = anchor[1].replace(/(hong|lan)1\.png$/, "");

  const plan = [], missing = [];
  for (const [suf, name] of Object.entries(SUFFIX)) {
    // Basic attack art is shared between frames of the same class, so the file may carry another character's code
    const f = suf === "pugong" ? files.find(([, n]) => n.endsWith("pugong1.png")) : files.find(([, n]) => n === `${base}${suf}1.png`);
    if (!f) { missing.push(name); continue; }
    plan.push([join(SRC, dir, f[0]), `${name}.png`]);
    if (suf === "hexin") plan.push([join(SRC, dir, f[0]), "Class.png"]);
  }
  for (const g of GENERIC) plan.push([join(GENERIC_FROM, `${g}.png`), `${g}.png`]);
  if (missing.length) problems.push(`${dir} (${id}): faltam ${missing.join(", ")}`);

  if (APPLY) {
    await mkdir(out, { recursive: true });
    for (const [from, to] of plan) await copyFile(from, join(out, to));
  }
  done++;
}
console.log(`${done} personagens ${APPLY ? "importados" : "prontos para importar (use --aplicar)"}.`);
if (problems.length) console.log("Atenção:\n- " + problems.join("\n- "));
