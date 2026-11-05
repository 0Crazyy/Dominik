#!/usr/bin/env node
// Checks that every image the site uses exists, with the exact upper/lower case of the file name:
// Windows ignores case, but Netlify does not, so a wrong case only breaks once published.
// Run it with: node tools/check-assets.mjs     (the pre-commit hook in tools/githooks runs it too)
// Exit code 1 = something is broken. A missing home thumbnail or light copy is only a warning: the site falls back to the full art.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "Dominik");
const read = file => readFileSync(join(SITE, file), "utf8");
// app.js touches the page right after its data, so only the part before this line can run outside a browser
const DATA_END = "const $ = (s, r = document)";

function loadData() {
  const app = read("app.js"), end = app.indexOf(DATA_END);
  if (end < 0) throw new Error(`não achei a linha "${DATA_END}" no app.js; atualize DATA_END em tools/check-assets.mjs`);
  const names = "COMPS, PAGES, MEMORY_TABS, MEM_INDEX, MEMORY_EFFECTS, WEAPONS, ENERGY, EFFECT, SPECIAL_EFFECT, CHARS, memFile, memSet";
  return vm.runInNewContext(`${read("assets-data.js")}\n${app.slice(0, end)}\n;({ ${names} })`);
}

function listFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) listFiles(full, out);
    else out.push(relative(SITE, full).split(sep).join("/"));
  }
  return out;
}

// Image paths written in full in the code. Paths built with ${...} are covered by the data checks below.
function literalPaths(file) {
  const code = read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  return [...code.matchAll(/assets\/[^"'`()$<>\n]+?\.(?:png|webp|jpe?g|gif|svg)/g)].map(m => m[0]);
}

const fold = s => s.normalize("NFC").toLowerCase();
const slug = s => s.toLowerCase().replace(/\s+/g, "-");

function check() {
  const errors = [], warnings = [], used = new Map();
  const use = (path, where) => { if (!used.has(path)) used.set(path, where); };
  const d = loadData();

  const teams = Object.entries(d.COMPS).flatMap(([id, c]) => {
    if (c.icon) use(c.icon, `time ${id}`);
    return (c.variants || [{ id, cards: c.cards }]).map(t => ({ label: t.id === id ? id : `${id} / ${t.id}`, cards: t.cards }));
  });
  const thumbs = new Map();
  for (const { label, cards } of teams) for (const card of cards) {
    const where = `${card.name} (${label})`;
    for (const value of Object.values(card).flat()) {
      if (typeof value === "string" && value.startsWith("assets/")) use(value, where);
    }
    if (card.wh) {
      if (d.MEM_INDEX.has(card.wh)) use(d.memFile(card.wh, "WH", "png"), where);
      else errors.push(`memória "${card.wh}" não existe em MEMORY_TABS: ${where}`);
    }
    if (card.portrait) thumbs.set(`assets/home/${slug(card.name.replace(":", ""))}.jpg`, card.name);
  }

  for (const [path, ids] of Object.entries(d.PAGES)) for (const id of ids) {
    if (!d.COMPS[id]) errors.push(`PAGES["${path}"] cita "${id}", que não existe em COMPS`);
  }
  for (const [tab, sets] of Object.entries(d.MEMORY_TABS)) for (const [name, , ext] of sets) {
    if (ext) d.memSet(name).forEach(path => use(path, `memória ${name} (${tab})`));
    if (!d.MEMORY_EFFECTS[name]) errors.push(`memória "${name}" não tem texto em MEMORY_EFFECTS (a página Memories quebra)`);
  }
  for (const [owner, , , file] of d.WEAPONS) if (file) use(`${d.CHARS}/${file}`, `arma de ${owner}`);
  for (const e of d.ENERGY) use(`assets/energy type/${e}.png`, "ícones de Energy Type");
  for (const e of [...d.EFFECT, ...d.SPECIAL_EFFECT]) use(`assets/effects/${e}.png`, "ícones de Effect");
  for (const file of ["app.js", "index.html", "style.css"]) literalPaths(file).forEach(path => use(path, file));

  const files = listFiles(join(SITE, "assets"));
  const exact = new Set(files), folded = new Map(files.map(f => [fold(f), f]));
  for (const [path, where] of used) {
    if (exact.has(path)) continue;
    const near = folded.get(fold(path));
    errors.push(near ? `nome difere do arquivo: ${path}\n    arquivo real: ${near}\n    usado em: ${where}` : `não encontrado: ${path}\n    usado em: ${where}`);
  }
  for (const [path, name] of thumbs) {
    if (!exact.has(path)) warnings.push(`sem miniatura: ${path} (${name}); rode tools/make-thumbs.ps1`);
  }
  const light = new Set(listFiles(join(SITE, "assets-web")));
  for (const path of used.keys()) {
    if (exact.has(path) && !path.startsWith("assets/embed-icon.") && !light.has(`${path.replace("assets/", "assets-web/")}.webp`)) {
      warnings.push(`sem cópia leve: ${path}; rode node tools/optimize-images.mjs`);
    }
  }
  return { errors, warnings, total: used.size };
}

if (!existsSync(join(SITE, "app.js"))) {
  console.error(`app.js não encontrado em ${SITE}`);
  process.exit(1);
}
try {
  const { errors, warnings, total } = check();
  warnings.forEach(w => console.warn(`AVISO  ${w}`));
  errors.forEach(e => console.error(`ERRO   ${e}`));
  console.log(`${total} imagens verificadas: ${errors.length} erro(s), ${warnings.length} aviso(s).`);
  process.exit(errors.length ? 1 : 0);
} catch (err) {
  console.error(`ERRO   não consegui ler os dados do site: ${err.message}`);
  process.exit(1);
}
