#!/usr/bin/env node
// Refreshes timeline-data.js for the Meta Timeline page, and downloads the portrait of any new character.
// Dates come from the S-RANK TIMER tab of the spreadsheet, which shows characters as pictures, so names come from the wiki:
// each column of the tab holds the S-Rank frames of one element and class, in release order.
// tools/deploy.mjs runs it before publishing. By hand: node tools/update-timeline.mjs
// Needs ImageMagick (magick). Any mismatch stops here and keeps the current file.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import vm from "node:vm";

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHEET = "1h1fmMIC0zn_XPgAP8iVCEoNGgFV_DQ2-S44JNqErXFw", TAB = "681191739";
const WIKI = "https://huaxu.app/na/wiki/constructs", ART = "https://assets.huaxu.app/glb/image";
const FOLDER = "assets/timeline", FILE = join(ROOT, "timeline-data.js");
// The column of each element and class in the tab. Its headers are pictures, so this list is written by hand
const COLUMNS = {
  9: ["Fire", "Attacker"], 13: ["Fire", "Tank"], 17: ["Fire", "Amplifier"], 21: ["Fire", "Breaker"],
  28: ["Physical", "Support"], 32: ["Physical", "Attacker"], 36: ["Physical", "Tank"], 40: ["Physical", "Amplifier"], 44: ["Physical", "Breaker"],
  51: ["Lightning", "Attacker"], 55: ["Lightning", "Tank"], 59: ["Lightning", "Amplifier"],
  66: ["Dark", "Attacker"], 70: ["Dark", "Tank"], 74: ["Dark", "Amplifier"], 78: ["Dark", "Breaker"], 82: ["Dark", "Overlinker"],
  89: ["Ice", "Attacker"], 93: ["Ice", "Tank"], 97: ["Ice", "Amplifier"], 101: ["Ice", "Breaker"],
  108: ["Nihil", "Annihilator"], 112: ["Nihil", "Observer"], 116: ["Nihil", "Amplifier"]
};

// The Global patch of each older release date. The tab shows patches as banners, so this list is written by hand. Dates after it
// come from calculator-data.js. In 2024 and 2025 several versions became one Global patch, and those dates point to that patch
const PATCH_NAMES = {
  "2019-12-05": "Base Game", "2019-12-24": "Frozen Darkness", "2020-03-19": "Eternal Engine", "2020-06-10": "Kowloong Metropolis",
  "2020-09-03": "Firn Night", "2020-11-26": "Fake Ascension", "2021-04-08": "Imprisoned Sight", "2021-07-01": "The Last Spark",
  "2021-09-30": "The Surviving Lucem", "2021-11-11": "Recitativo di Fantasia", "2022-01-27": "Her Last Bow", "2022-04-21": "A New Divide",
  "2022-07-08": "Across the Ruined Sea", "2022-09-29": "Spiral of Chronos", "2022-11-17": "Renaissance de Fantastique", "2022-12-24": "Wintry Shackles",
  "2023-03-23": "Chaos Unsnarled", "2023-06-08": "Everglowing Justice", "2023-07-20": "Cradle Parade", "2023-09-28": "Aeon Reforged",
  "2023-11-09": "Polaris Bond", "2024-02-01": "Stars Ensnared", "2024-04-18": "Soaring Beyond", "2024-05-30": "Soaring Beyond",
  "2024-07-11": "Shaper's Ripples", "2024-08-26": "Shaper's Ripples", "2024-11-07": "Wither to Shine", "2024-12-19": "Wither to Shine",
  "2025-01-23": "Dream Till the Timeless End", "2025-04-10": "Dream Till the Timeless End", "2025-07-03": "Through the Tide Home",
  "2025-10-10": "Through the Tide Home", "2025-11-13": "Where Nightmares Dwell", "2025-12-23": "Sightline Breach", "2026-03-16": "A Better Tomorrow"
};

// Dates of the tab that the other sources correct: the Chinese wiki (战双大事记) and grayravens.com/wiki/Patches. Aegis follows the wiki alone
const CN_DATES = { "2024-08-26": "2024-09-26", "2025-10-10": "2025-09-25", "2026-03-16": "2026-03-17" };

// The sheet as CSV. Every value comes quoted, so a quote only ever opens or closes one
function readCsv(text) {
  const rows = [[]];
  for (const [, value, end] of text.matchAll(/"((?:[^"]|"")*)"(,|\n|$)/g)) {
    rows.at(-1).push(value.replace(/""/g, '"'));
    if (end !== ",") rows.push([]);
  }
  return rows;
}
async function get(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} respondeu ${response.status}`);
  return response;
}
// The release dates of each column, oldest first. A date row is followed by a row with day counts, one per frame of that patch
async function sheetDates() {
  const rows = readCsv(await (await get(`https://docs.google.com/spreadsheets/d/${SHEET}/gviz/tq?tqx=out:csv&headers=0&gid=${TAB}`)).text());
  const dates = {};
  let date = "";
  for (const row of rows.slice(3)) {
    const [, d, m, y] = row[0]?.match(/^(\d\d)\/(\d\d)\/(\d{4})$/) || [];
    if (d) date = `${y}-${m}-${d}`;
    row.forEach((cell, column) => {
      if (column && COLUMNS[column] && /^\d/.test(cell.trim())) (dates[column] ||= []).unshift(date);
    });
  }
  return dates;
}
// The wiki keeps its data in a devalue payload: numbers point to other positions of the same list
function wikiData(html) {
  const list = JSON.parse(html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const seen = new Map();
  const read = at => {
    if (seen.has(at)) return seen.get(at);
    const value = list[at];
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value) && ["Reactive", "ShallowReactive", "Ref", "ShallowRef"].includes(value[0])) return read(value[1]);
    const out = Array.isArray(value) ? [] : {};
    seen.set(at, out);
    for (const [key, item] of Object.entries(value)) out[key] = typeof item === "number" ? read(item) : item;
    return out;
  };
  const data = read(0).data;
  return Object.values(data).find(Array.isArray) || Object.values(Object.values(data)[0]).find(Array.isArray) || Object.values(data)[0];
}
// Collab frames carry the character's own name, and the tab leaves them out, like uniframes and A-Rank frames
const inTimeline = c => c.quality === 3 && c.frameType === "omniframe" && c.characterName !== c.frameName;
const title = text => text === "void" ? "Nihil" : text[0].toUpperCase() + text.slice(1);
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const dates = await sheetDates();
const frames = wikiData(await (await get(WIKI)).text()).filter(inTimeline).sort((a, b) => a.priority - b.priority);
const site = vm.runInNewContext(`${readFileSync(join(ROOT, "assets-data.js"), "utf8")}\n;CONSTRUCTS`);
const patches = vm.runInNewContext(`${readFileSync(join(ROOT, "calculator-data.js"), "utf8")}\n;CALC_PATCHES`).filter(p => p.patch);
const patchOf = date => PATCH_NAMES[date] || patches.find(p => date >= p.start && date <= p.end)?.patch || "";
const entries = [];
for (const [column, [element, role]] of Object.entries(COLUMNS)) {
  const group = frames.filter(c => title(c.element) === element && c.class === role), days = dates[column] || [];
  if (group.length !== days.length) throw new Error(`${element} ${role}: ${group.length} personagens na wiki e ${days.length} datas na planilha`);
  group.forEach((c, i) => {
    const name = `${c.characterName}: ${c.frameName}`, onSite = site[name] || site[name.replace("No. ", "No.")];
    entries.push({ name, date: CN_DATES[days[i]] || days[i], patch: patchOf(days[i]), element, role, effect: onSite?.[4] || "", head: `${FOLDER}/${slug(name)}.png`, icon: c.icons.normal });
  });
}
if (entries.length !== frames.length) throw new Error(`${frames.length - entries.length} personagens da wiki sem coluna: atualize COLUMNS`);

mkdirSync(join(ROOT, FOLDER), { recursive: true });
for (const { head, icon } of entries) {
  const file = join(ROOT, head);
  if (existsSync(file)) continue;
  writeFileSync(file, Buffer.from(await (await get(`${ART}/${icon.replace(/^image\//, "")}.png`)).arrayBuffer()));
  await run("magick", [file, "-resize", "256x256>", file]);
}
const list = entries.sort((a, b) => a.date.localeCompare(b.date)).map(({ icon, ...entry }) => `  ${JSON.stringify(entry)}`).join(",\n");
writeFileSync(FILE, `// Who held each element and class, for the Meta Timeline page. Generated: node tools/update-timeline.mjs\nconst TIMELINE = [\n${list}\n];\n`);
console.log(`${entries.length} personagens salvos em timeline-data.js`);
