#!/usr/bin/env node
// Gives every page its own link preview. Discord and similar apps don't run app.js, so they only see the HTML of the address:
// this writes a copy of index.html with the title, description and image of each page to .deploy/<address>.html, which is also
// how the address gets served. The text comes from the site data, so new teams and characters get theirs by themselves.
// tools/deploy.mjs runs it after copying the site. A page missing from this list would answer with 404.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STAGE = join(ROOT, ".deploy");
const SITE = "https://dominiko.pages.dev";
const read = file => readFileSync(join(ROOT, file), "utf8");
// app.js touches the page right after its data, so only the part before this line can run outside a browser
const app = read("app.js"), dataEnd = app.indexOf("const $ = (s, r = document)");
if (dataEnd < 0) throw new Error("não achei o fim dos dados no app.js; atualize dataEnd em tools/make-embeds.mjs");
const names = "COMPS, PAGES, TEAM_LISTS, ENERGY, MEMORY_TABS, MEMORY_EFFECTS, MEMORY_RELEASE, MEMORY_STATS, WEAPONS, WEAPON_STATS, RESONANCE_EFFECTS, CUB_SKILLS, CONSTRUCTS, CHARACTER_SKILLS, TIMELINE, CHARS, WEAPON_RES, memFile";
const { COMPS, PAGES, TEAM_LISTS, ENERGY, MEMORY_TABS, MEMORY_EFFECTS, MEMORY_RELEASE, MEMORY_STATS, WEAPONS, WEAPON_STATS, RESONANCE_EFFECTS, CUB_SKILLS, CONSTRUCTS, CHARACTER_SKILLS, TIMELINE, CHARS, WEAPON_RES, memFile } =
  vm.runInNewContext(`${["data/assets-data.js", "data/skills-data.js", "data/timeline-data.js"].map(read).join("\n")}\n${app.slice(0, dataEnd)}\n;({ ${names} })`);

// Same as in app.js
const slug = s => s.toLowerCase().replace(/\s+/g, "-");
const linkId = s => slug(s).replace(/[^a-z0-9-]/g, "");
const charId = name => linkId(name.replace(":", ""));
const constructId = name => linkId(name.split(":").at(-1).trim());
const fileName = src => src.split("/").pop().replace(/\.\w+$/, "").replace(/^(Memória|CUB) - /, "").replace(/ (HD|1-4|2-5|3-6)$/, "");
const memoryName = piece => piece.startsWith("assets/") ? fileName(piece) : piece;
function memorySummary(memories) {
  const count = new Map();
  for (const piece of memories) count.set(memoryName(piece), (count.get(memoryName(piece)) || 0) + 1);
  return [...count].map(([name, pieces]) => `${pieces}× ${name}`).join(" · ");
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
const teamsOf = id => COMPS[id].variants || [{ id, cards: COMPS[id].cards }];
// Every card of every team on a page, as characters() in app.js counts them
const builds = Object.entries(PAGES).flatMap(([path, ids]) => ids.flatMap(id => teamsOf(id).flatMap(team =>
  team.cards.map(card => ({ path, team: COMPS[id].name, card })))));
const characters = [...new Map(builds.map(({ card }) => [card.name, card])).values()].map(({ name, portrait }) =>
  ({ name, portrait, builds: builds.filter(b => b.card.name === name) }));
const usedIn = test => plural(builds.filter(b => test(b.card)).length, "build");
// A card can borrow another character's CUB as a placeholder, so the owner is the character named after the folder of the art
const cubs = [...new Map(builds.filter(({ card }) => card.construct?.split("/").at(-2) === charId(card.name)).map(({ card }) =>
  [fileName(card.construct), { name: fileName(card.construct), owner: card.name, art: card.construct }])).values()];

// The file has to exist, or the card would show a broken picture. Discord keeps a preview picture per URL, so new art needs a new file name
const DEFAULT_IMAGE = "assets/embed-icon-4.png";
function image(...options) {
  const found = options.find(src => src && existsSync(join(ROOT, src)));
  if (!found) console.warn(`AVISO  sem imagem para o embed: ${options.filter(Boolean).join(", ") || "(vazio)"}`);
  return found || DEFAULT_IMAGE;
}
// The light square thumbnail of the home page, or the full art when there is none
const portrait = ({ name, portrait: art }) => image(`assets/home/${slug(name.replace(":", ""))}.jpg`, art);
const constructPortrait = name => `${CHARS}/${charId(name)}/Awaken - ${name.replace(":", "").trim()}.png`;
const memoryArt = ([name, , ext]) => ext ? memFile(name, "1-4") : "";
const weaponArt = ([, , , file]) => file ? (file.startsWith("assets/") ? file : `${CHARS}/${file}`) : "";

const pages = new Map();
const add = (path, title, description, picture = DEFAULT_IMAGE) => pages.set(path, { title, description, picture });

/* ---------- teams ---------- */
const roster = cards => cards.map(c => `${c.name}${c.role.includes("captain") ? " (Captain)" : ""}${c.memories ? ` - ${memorySummary(c.memories)}` : ""}`).join("\n");
const teamImage = cards => portrait(cards.find(c => c.role.includes("captain")) || cards[0]);
for (const [kind, { items, label }] of Object.entries(TEAM_LISTS)) for (const item of items) {
  const path = `${kind}/${slug(item)}`, ids = PAGES[path] || [];
  const what = kind === "energy" ? `${item} energy` : `the ${item} ${label.toLowerCase()}`;
  if (!ids.length) {
    add(path, `${item} Teams`, `No teams for ${what} yet.`, image(`assets/${kind === "energy" ? "energy type" : "effects"}/${item}.png`));
    continue;
  }
  // The page lists every build; the newest composition comes first
  const count = ids.reduce((sum, id) => sum + teamsOf(id).length, 0), [first] = teamsOf(ids[0]);
  add(path, `${item} Teams`, `${plural(count, "team")} for ${what}, with memories, weapons and resonances.\nNewest: ${COMPS[ids[0]].name}\n${first.cards.map(c => c.name).join(" · ")}`, teamImage(first.cards));
  for (const id of ids) {
    const { name, variants } = COMPS[id];
    const teamPage = (linkPart, team) => add(`${path}/${linkPart}`, [name, team.name].filter(Boolean).join(" · "), `${item} team\n${roster(team.cards)}`, teamImage(team.cards));
    // A link to a composition with variants opens the first one
    if (variants) teamPage(id, variants[0]);
    for (const team of teamsOf(id)) teamPage(team.id, team);
  }
}

/* ---------- constructs ---------- */
const releaseOf = name => CONSTRUCTS[name]?.[0] ?? 0;
const builtByName = new Map(characters.map(ch => [ch.name, ch]));
const constructRoster = Object.keys(CONSTRUCTS).map(name => builtByName.get(name) || ({ name, portrait: constructPortrait(name), builds: [] }));
const newestConstructs = [...constructRoster].sort((a, b) => releaseOf(b.name) - releaseOf(a.name));
add("constructs", "Constructs", `${plural(constructRoster.length, "construct")}, filtered by element, class, rank and effect.\nNewest: ${newestConstructs.slice(0, 3).map(c => c.name).join(" · ")}`, portrait(newestConstructs[0]));
for (const ch of constructRoster) {
  const [, element, type, rank, effect] = CONSTRUCTS[ch.name];
  const weapon = WEAPONS.find(w => w[0] === ch.name), cub = cubs.find(c => c.owner === ch.name);
  const teams = [...new Set(ch.builds.map(b => b.team))];
  const gear = [weapon && `Weapon: ${weapon[1]}`, cub && `C.U.B.: ${cub.name}`].filter(Boolean).join(" · ");
  const builds = ch.builds.length ? `${plural(ch.builds.length, "build")}: ${teams.join(" · ")}` : "No builds available yet.";
  const description = [[`${rank}-Rank ${type}`, element, effect].filter(Boolean).join(" · "), builds, gear].filter(Boolean).join("\n");
  add(`constructs/${constructId(ch.name)}`, ch.name, description, portrait(ch));
  if (!ch.builds.length) continue;
  add(`character/${charId(ch.name)}`, ch.name, description, portrait(ch));
  add(`character/${constructId(ch.name)}`, ch.name, description, portrait(ch));
  const skills = CHARACTER_SKILLS[ch.name] || [];
  add(`assets/skill/${charId(ch.name)}`, `${ch.name} Skills`, skills.length ? `${plural(skills.length, "skill")} and passives of ${ch.name}.\n${skills.map(([, name]) => name).join(" · ")}` : `Skills of ${ch.name}.`, portrait(ch));
}

/* ---------- assets ---------- */
// The list pages of Assets and their tabs. The newest items are the ones with the highest release number
function listPages(base, title, tabs, summary, release, nameOf, artOf) {
  for (const [tab, items] of tabs) {
    const sorted = [...items].sort((a, b) => release(b) - release(a));
    const newest = sorted.slice(0, 3).map(nameOf).join(" · ");
    const art = sorted.map(artOf).find(Boolean);
    const page = [tab === "All" ? title : `${tab} ${title}`, `${summary(items.length)}${newest ? `\nNewest: ${newest}` : ""}`, art ? image(art) : DEFAULT_IMAGE];
    if (tab === "All") add(`assets/${base}`, ...page);
    add(`assets/${base}/${slug(tab)}`, ...page);
  }
}
const elementTabs = (list, ownerOf) => [["All", list], ...ENERGY.map(e => [e, list.filter(item => CONSTRUCTS[ownerOf(item)]?.[1] === e)])];

const memories = Object.values(MEMORY_TABS).flat();
listPages("memories", "Memories", [["All", memories], ...Object.entries(MEMORY_TABS)], count => `${plural(count, "memory set")}, sortable by ATK, DEF, CRIT and HP, each with its set bonuses.`, ([name]) => MEMORY_RELEASE[name], ([name]) => name, memoryArt);
for (const set of memories) {
  const [name, boost] = set, [ATK, DEF, CRIT, HP] = MEMORY_STATS[name];
  const used = usedIn(c => c.wh === name || (c.memories || []).some(piece => memoryName(piece) === name));
  const bonuses = MEMORY_EFFECTS[name].map((text, i) => `${(i + 1) * 2} pcs: ${text}`).join("\n");
  add(`assets/memory/${linkId(name)}`, `${name} Memory`, `${boost} · ATK ${ATK} · DEF ${DEF} · CRIT ${CRIT} · HP ${HP} · Used in ${used}\n${bonuses}`, memoryArt(set) ? image(memoryArt(set)) : DEFAULT_IMAGE);
}

listPages("weapons", "Weapons", elementTabs(WEAPONS, ([owner]) => owner), count => `${plural(count, "weapon")}, sortable by ATK and CRIT, each with its effect.`, ([owner]) => releaseOf(owner), ([, name]) => name, weaponArt);
for (const weapon of WEAPONS) {
  const [owner, name, type, , effect, rank] = weapon, [ATK, CRIT] = WEAPON_STATS[name];
  const subtitle = owner ? [type, owner].filter(Boolean).join(" · ") : `${rank || 5}-star weapon`;
  add(`assets/weapon/${linkId(name)}`, name, `${subtitle} · ATK ${ATK} · CRIT ${CRIT}\n${effect}`, weaponArt(weapon) ? image(weaponArt(weapon)) : DEFAULT_IMAGE);
}

const resonances = Object.entries(RESONANCE_EFFECTS);
add("assets/resonances", "Weapon Resonance", `${plural(resonances.length, "weapon resonance")} and what each one does.\n${resonances.map(([name]) => name).join(" · ")}`, image(WEAPON_RES(resonances[0][0])));
for (const [name, effect] of resonances) {
  add(`assets/resonance/${linkId(name)}`, name, `Weapon Resonance · Used in ${usedIn(c => (c.matrix || []).includes(WEAPON_RES(name)))}\n${effect}`, image(WEAPON_RES(name)));
}

listPages("cubs", "C.U.B.s", elementTabs(cubs, cub => cub.owner), count => `${count} C.U.B.${count === 1 ? "" : "s"}, each with its skills and the builds that use it.`, cub => releaseOf(cub.owner), cub => cub.name, cub => cub.art);
for (const cub of cubs) {
  const skills = CUB_SKILLS[cub.art.split("/").at(-2)] || [];
  add(`assets/cub/${linkId(cub.name)}`, `${cub.name} C.U.B.`, [`C.U.B. of ${cub.owner} · ${CONSTRUCTS[cub.owner][1]}`, skills.map(([name]) => name).join(" · ")].filter(Boolean).join("\n"), image(cub.art));
}

/* ---------- tools ---------- */
add("calculator", "Planner", "Plan your Black Cards across upcoming patches, add up the cost of the passes you pick, and check your pull odds on any banner, including how often pity triggers.", image("assets/calculator/black-card.png"));
const newestFrame = TIMELINE.at(-1);
add("timeline", "Meta Timeline", `How long each of ${TIMELINE.length} S-Rank frames held its place in the meta before a newer one replaced it, with rankings, class averages and a replacement watch.\nNewest: ${newestFrame.name}`, image(newestFrame.head));
add("editor", "Team Builder", "Put a full team together from the site's characters, memories and resonances, see its cards as the site shows them, and share it as a link or an image.", DEFAULT_IMAGE);
add("contact", "Contact", "Found a wrong build, or have a question or suggestion? Message crazy117 on Discord. Also the credits of the people behind the site's data and art.", image("assets/credits/crazy117.png"));

/* ---------- writing ---------- */
const attr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/\n/g, "&#10;");
// Left to Discord, a long text is cut in the middle of a word
const MAX_TEXT = 300;
const clip = text => text.length <= MAX_TEXT ? text : `${text.slice(0, MAX_TEXT - 1).replace(/\s+\S*$/, "")}…`;
const template = read("index.html");
function swap(html, pattern, value) {
  if (!pattern.test(html)) throw new Error(`tag não encontrada no index.html: ${pattern}`);
  return html.replace(pattern, () => value);
}
const meta = (key, name, value) => [new RegExp(`<meta ${key}="${name}" content="[^"]*">`), `<meta ${key}="${name}" content="${attr(value)}">`];
function pageHtml(path, { title, description, picture }) {
  const text = clip(description);
  const tags = [
    [/<title>[^<]*<\/title>/, `<title>${attr(title)} - Dominik</title>`],
    // Search results show one line, so the line breaks only stay in the card
    meta("name", "description", text.replace(/\n/g, " / ")),
    meta("property", "og:title", title),
    meta("property", "og:description", text),
    meta("property", "og:url", `${SITE}/${path}`),
    meta("property", "og:image", `${SITE}/${encodeURI(picture)}`),
    meta("property", "og:image:alt", title),
    // These describe the logo of the home page
    ...["type", "width", "height"].map(field => [new RegExp(`<meta property="og:image:${field}" content="[^"]*">\\r?\\n`), ""])
  ];
  return tags.reduce((html, [pattern, value]) => swap(html, pattern, value), template);
}
for (const [path, page] of pages) {
  const file = join(STAGE, `${path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pageHtml(path, page));
}
console.log(`${pages.size} páginas com embed próprio em .deploy`);
