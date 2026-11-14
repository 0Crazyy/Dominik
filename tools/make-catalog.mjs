#!/usr/bin/env node
// Writes data/catalog-data.js (for the site) and server/catalog.js (for the API): everything a team made in the Team Builder (/editor) can hold, and nothing else.
// The editor offers only these options, and the server will check every submitted team against the same list,
// so a team can never point at an image or a name the site does not have.
// Run it with: node tools/make-catalog.mjs      (tools/deploy.mjs runs it too)
// A character enters the catalog with a build on the site, or with portrait, weapon, C.U.B. and its 6 skills in its folder.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "data/catalog-data.js", SERVER_OUT = "server/catalog.js";
const read = file => readFileSync(join(SITE, file), "utf8");
const exists = path => existsSync(join(SITE, path));
const DATA_END = "const $ = (s, r = document)";

const app = read("app.js"), end = app.indexOf(DATA_END);
if (end < 0) throw new Error(`não achei a linha "${DATA_END}" no app.js; atualize DATA_END em tools/make-catalog.mjs`);
const names = "COMPS, PAGES, TEAM_LISTS, MEMORY_TABS, MEM_INDEX, memFile, CONSTRUCTS, RESONANCE_EFFECTS, WEAPON_RES, ALL_ATK, MEMORY_RES, MEMORY_RES_NAMES, WEAPONS, CHARS, classIcon";
const d = vm.runInNewContext(`${read("data/assets-data.js")}\n${app.slice(0, end)}\n;({ ${names} })`);

const slug = s => s.toLowerCase().replace(/\s+/g, "-");
const linkId = s => slug(s).replace(/[^a-z0-9-]/g, "");
const charId = name => linkId(name.replace(":", ""));
const files = dir => exists(dir) ? readdirSync(join(SITE, dir)) : [];

// Skill icons for memory resonance choices. Rank, leader and awakening icons are not selectable resonances.
const NOT_SLOT = /^(Awakening|Leader|SS-Rank|SSS-Rank|SSS\+ Rank)\./;
const skillArt = name => {
  const dir = `${d.CHARS}/${charId(name)}/skills`;
  return Object.fromEntries(files(dir).filter(f => !NOT_SLOT.test(f)).sort().map(f => [f.replace(/\.[^.]+$/, ""), `${dir}/${f}`]));
};
const rankStep = rank => rank.match(/S/g).length * 100 + (rank.endsWith("+") ? 50 : Number(rank.replace(/\D/g, "") || 0));
const CLASS_FILE = { Tank: "Tanque", Vanguard: "Vanguard" };
const symbolOf = name => {
  const cls = d.CONSTRUCTS[name]?.[2];
  if (cls === "Overlinker") return `${d.CHARS}/adelyde-anabasis/Classe - Adelyde Anabasis.png`;
  return cls ? d.classIcon(CLASS_FILE[cls] || cls) : "";
};

const sharedWeapons = {
  Katana: ["Lucia: Lotus", "Lucia: Dawn", "Lucia: Crimson Abyss", "Lucia: Plume", "Vera: Rozen"],
  "Levi-Gun": ["Liv: Eclipse", "Liv: Lux", "Liv: Luminance"],
  "Dual Guns": ["Lee: Palefire", "Lee: Entropy", "Sophia: Silverfang"],
  Bow: ["Bianca: Veritas", "Alisa: Echo", "Bianca: Zero"],
  Cannon: ["Karenina: Blast", "Karenina: Ember"],
  Dagger: ["Watanabe: Astral", "Watanabe: Nightblade"],
  Greatsword: ["Kamui: Tenebrion", "Kamui: Bastion"],
  Scythe: ["Chrome: Arclight", "Ayla: Brilliance", "Haicma: Starveil"],
  Saw: ["Nanami: Storm", "Nanami: Pulse"]
};
const normalizeWeaponFile = file => file.replace(/\s+\([456]\)(?=\.[^.]+$)/, "");
const weapons = d.WEAPONS.filter(([owner]) => owner).map(([owner, name, type, path]) => {
  const [dir, file] = path.split("/");
  const stem = normalizeWeaponFile(file);
  const ranks = files(`${d.CHARS}/${dir}`).filter(f => /^Arma - /.test(f) && normalizeWeaponFile(f) === stem)
    .map(art => ({ rank: art.match(/\s\(([456])\)(?=\.[^.]+$)/)?.[1] || "6", art: `${d.CHARS}/${dir}/${art}` }));
  return { owner, name, type, ranks: ranks.length ? ranks : [{ rank: file.match(/\s\(([456])\)(?=\.[^.]+$)/)?.[1] || "6", art: `${d.CHARS}/${path}` }] };
});

// Characters with a build: their kit as the site already shows it. A card can borrow another character's C.U.B.
// as a placeholder, so a card whose C.U.B. sits in the character's own folder wins
const characters = new Map();
const cards = Object.values(d.COMPS).flatMap(c => (c.variants || [c]).flatMap(t => t.cards));
for (const card of cards) {
  const own = card.construct?.split("/").at(-2) === charId(card.name), known = characters.get(card.name);
  if (known && (known.own || !own)) continue;
  characters.set(card.name, { own, kit: { name: card.name, symbol: card.symbol || symbolOf(card.name), portrait: card.portrait,
    weapon: card.weapon, construct: card.construct || "", skills: card.skills || [] } });
}
// Characters with art but no build yet
for (const name of Object.keys(d.CONSTRUCTS)) {
  if (characters.has(name)) continue;
  const dir = `${d.CHARS}/${charId(name)}`, list = files(dir);
  const find = re => list.find(f => re.test(f));
  const portrait = find(/^Awaken - /), weapon = find(/^Arma - /), cub = find(/^CUB - (?!Skill )/);
  const skills = [1, 2, 3, 4, 5, 6].map(i => find(new RegExp(`^CUB - Skill ${i}\\.`)));
  if (!portrait || !weapon || !cub || skills.some(s => !s)) continue;
  characters.set(name, { kit: { name, symbol: symbolOf(name), portrait: `${dir}/${portrait}`, weapon: `${dir}/${weapon}`,
    construct: `${dir}/${cub}`, skills: skills.map(s => `${dir}/${s}`) } });
}

const catalog = {
  characters: [...characters.values()].map(({ kit }) => ({ ...kit, element: d.CONSTRUCTS[kit.name]?.[1] || "", class: d.CONSTRUCTS[kit.name]?.[2] || "", skillArt: skillArt(kit.name) }))
    .filter(c => Object.keys(c.skillArt).length).sort((a, b) => a.name.localeCompare(b.name)),
  sharedWeapons,
  weapons,
  // In the game's order: S, S5, SS, SS3, SS6, SSS, SSS3, SSS6, SSS+
  ranks: files("assets/rank").filter(f => /^S+\d?\+?\.png$/.test(f)).map(f => f.slice(0, -4))
    .sort((a, b) => rankStep(a) - rankStep(b)),
  memories: [...d.MEM_INDEX.keys()],
  harmony: [...d.MEM_INDEX.keys()].filter(name => exists(d.memFile(name, "WH", "png"))),
  matrix: Object.keys(d.RESONANCE_EFFECTS).filter(name => exists(d.WEAPON_RES(name))),
  allAtk: d.ALL_ATK,
  memoryResonances: Object.fromEntries(d.MEMORY_RES_NAMES.filter(name => exists(d.MEMORY_RES(name))).map(name => [name, d.MEMORY_RES(name)])),
  pages: Object.entries(d.TEAM_LISTS).flatMap(([kind, list]) => list.items.map(item => ({ path: `${kind}/${slug(item)}`, name: item, kind: list.label })))
};

const missing = [
  ...catalog.characters.flatMap(c => [c.symbol, c.portrait, c.weapon, c.construct, ...c.skills].filter(p => p && !exists(p)).map(p => `${c.name}: ${p}`)),
  ...catalog.weapons.flatMap(w => w.ranks.filter(r => !exists(r.art)).map(r => `${w.owner}: ${r.art}`))
];
if (missing.length) {
  console.error(`ERRO  ${missing.length} imagem(ns) do catálogo não existem:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
const body = `// Generated by tools/make-catalog.mjs: do not edit by hand.\n// What a team made in the Team Builder can hold. The server checks submitted teams against the same list.\nconst CATALOG = ${JSON.stringify(catalog, null, 1)};\n`;
writeFileSync(join(SITE, OUT), body);
// The same list for the API (functions/), which is bundled as a module and so needs an export
writeFileSync(join(SITE, SERVER_OUT), `// Generated by tools/make-catalog.mjs: do not edit by hand.\nexport const CATALOG = ${JSON.stringify(catalog)};\n`);
console.log(`OK  ${OUT} e ${SERVER_OUT}: ${catalog.characters.length} personagens, ${catalog.weapons.length} armas, ${catalog.memories.length} memórias, ${catalog.matrix.length} ressonâncias de arma, ${catalog.pages.length} páginas.`);
