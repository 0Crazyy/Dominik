#!/usr/bin/env node
// Refreshes calculator-data.js with the patch income in the RESUME tab of the spreadsheet.
// Run it when a new patch shows up there: node tools/update-calculator.mjs
// Dates, rank and income come from the sheet, and "daily", "weekly" and "events" from the tab of each patch. "frame" and the collab rows are written by hand in calculator-data.js,
// because the sheet shows frames as pictures there: a new patch comes in with no frame, so fill it in after running this.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SHEET = "1h1fmMIC0zn_XPgAP8iVCEoNGgFV_DQ2-S44JNqErXFw";
const RANGE = "F19:S60";
const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "calculator-data.js");
const HEADER = `// Patch income for the BC calculator, from the RESUME tab of the spreadsheet.
// Refresh it with: node tools/update-calculator.mjs     (frame and collab rows are kept, the rest is replaced)
// Rows with forecast: true are not in the sheet: the tool works them out from the same period a year before.
`;
// Names the site shows instead of the sheet's, and the frames expected after the last patch of the sheet, in order
const SHEET_NAMES = { "Chrome or Jetavie": "Chrome" };
const NEXT_FRAMES = ["Jetavie"];
const PATCHES_PER_YEAR = 9;
// A confirmed patch whose income jumps this much is held back as a likely typo. To accept a real fix: node tools/update-calculator.mjs --force
const MAX_CHANGE = 0.5, MIN_CHANGE = 500, FORCE = process.argv.includes("--force");

// The sheet as CSV. Every value comes quoted, so a quote only ever opens or closes one, and a value can hold line breaks
function readCsv(text) {
  const rows = [[]];
  for (const [, value, end] of text.matchAll(/"((?:[^"]|"")*)"(,|\n|$)/g)) {
    rows.at(-1).push(value.replace(/""/g, '"'));
    if (end !== ",") rows.push([]);
  }
  return rows;
}
// The sheet is in Brazilian format: 11.488 is a number with a thousands dot, 05/11/26 is day/month/year
const number = text => {
  if (!/^\d[\d.]*$/.test(text)) throw new Error(`esperava um número e veio "${text}"`);
  return Number(text.replace(/\./g, ""));
};
const date = text => {
  const [, d, m, y] = text.match(/^(\d\d)\/(\d\d)\/(\d\d)$/) || [];
  if (!d) throw new Error(`esperava uma data e veio "${text}"`);
  return `20${y}-${m}-${d}`;
};
function readRow(cells) {
  // F rank, G patch, H empty, I start, J days, K end, L BC, M limited, N construct, O not used by the planner, P weapon, Q C.U.B., R voucher, S shard
  const [rank, patch, , start, , end, bc, limited, construct, , weapon, cub, voucher, shard] = cells;
  if (!patch) return null;
  return {
    patch: SHEET_NAMES[patch] || patch, start: date(start), end: date(end),
    // "?" marks a patch still unconfirmed: its income is a prediction. The planner treats it as an S-Rank
    rank: rank === "A" ? "A" : "S", ...(rank === "?" && { predicted: true }),
    gains: { bc: number(bc), limited: number(limited), weapon: number(weapon), cub: number(cub), construct: number(construct), voucher: number(voucher), shard: number(shard) }
  };
}

async function readTab(tab, range = "") {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(tab)}${range && `&range=${range}`}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`a planilha respondeu ${response.status}`);
  return readCsv(await response.text());
}
// Where each currency sits in a patch tab. Column M is left out: the planner does not use it
const TAB_COLUMNS = { bc: 6, limited: 8, construct: 10, weapon: 14, cub: 16, voucher: 18, shard: 20 };
// The first "Modes" block of a patch tab lists what repeats: rows starting with "Daily" are dailies, the rest weeklies.
// A patch with no tab of its own gets nothing here (the sheet answers with another tab), and counts in full on the page
async function patchIncome({ patch, end }) {
  const lines = await readTab(patch);
  const first = lines.findIndex(line => line[1] === "Modes");
  if (first < 0 || lines[first + 1][1] !== "Daily") return {};
  const last = lines.findIndex((line, i) => i > first && line[1] === "Modes");
  const income = { daily: {}, weekly: {}, events: [], oneOff: {} };
  for (const line of lines.slice(first + 1, last).filter(line => line[1])) {
    const part = line[1].startsWith("Daily") ? income.daily : income.weekly;
    for (const [key, column] of Object.entries(TAB_COLUMNS)) {
      if (line[column]) part[key] = (part[key] || 0) + number(line[column]);
    }
  }
  // Below that block come the events. Only the ones ending before the patch does are kept: the rest last all of it, and an
  // event with no end date, or with an end before its start, counts until the end too
  const total = lines.findIndex(line => line[1]?.startsWith("All Tickets TOTAL"));
  for (const line of lines.slice(last + 1, total)) {
    // Compensation repays a problem of that patch, so the forecast can't expect it again
    if (line[1]?.includes("Compensation")) {
      for (const [key, column] of Object.entries(TAB_COLUMNS)) {
        if (line[column]) income.oneOff[key] = (income.oneOff[key] || 0) + number(line[column]);
      }
    }
    if (!/^\d\d\/\d\d\/\d\d$/.test(line[5] || "")) continue;
    const eventEnd = date(line[5]);
    if (eventEnd >= end || eventEnd < date(line[4])) continue;
    const gains = {};
    for (const [key, column] of Object.entries(TAB_COLUMNS)) if (line[column]) gains[key] = number(line[column]);
    income.events.push({ name: line[1].trim(), end: eventEnd, gains });
  }
  return income;
}

const rows = (await readTab("RESUME", RANGE)).map(readRow).filter(Boolean);
if (!rows.length) throw new Error("nenhum patch encontrado: o layout da aba RESUME mudou?");

const old = vm.runInNewContext(`${readFileSync(FILE, "utf8")}\n;CALC_PATCHES`);
// A new year's sheet starts almost empty, and the forecast needs the last patches: confirmed ones it no longer lists stay here
const merged = old.filter(p => p.patch && !p.predicted && !rows.some(row => row.patch === p.patch)), missing = [], held = [];
// Official names are not frame names, so a patch new to the sheet takes the frame of the oldest prediction it replaces
const waiting = old.filter(p => p.predicted && !rows.some(row => row.patch === p.patch));
for (const row of rows) {
  const at = old.findIndex(p => p.patch === row.patch), before = old[at];
  const jump = !FORCE && before && !before.predicted && Object.keys(row.gains).find(key =>
    Math.abs(row.gains[key] - before.gains[key]) > Math.max(before.gains[key] * MAX_CHANGE, MIN_CHANGE));
  if (jump) {
    held.push(`${row.patch} (${jump}: ${before.gains[jump]} -> ${row.gains[jump]})`);
    merged.push(before);
  } else {
    const frame = before ? before.frame : waiting.shift()?.frame ?? "";
    if (!frame && !row.predicted) missing.push(row.patch);
    merged.push({ ...row, ...await patchIncome(row), frame });
  }
  for (let i = at + 1; at >= 0 && old[i]?.collab; i++) merged.push(old[i]);
}

const dayOf = iso => Date.parse(`${iso}T00:00Z`) / 864e5;
const isoOf = day => new Date(day * 864e5).toISOString().slice(0, 10);
// Same rule as the page: weeklies reset on Mondays, and day 0 was a Thursday
const mondays = (from, to) => Math.floor((to + 3) / 7) - Math.floor((from + 2) / 7);
// A patch copied from the same period a year before: same length and income, with weeklies following the Mondays of the new dates
function forecast(slot, after, name, frame) {
  const start = dayOf(after.end) + 1, end = start + dayOf(slot.end) - dayOf(slot.start);
  const share = mondays(start, end) / mondays(dayOf(slot.start), dayOf(slot.end));
  const gains = Object.fromEntries(Object.entries(slot.gains).map(([key, value]) =>
    [key, Math.max(0, value - (slot.oneOff?.[key] || 0) + Math.round((slot.weekly?.[key] || 0) * (share - 1)))]));
  return { patch: name, start: isoOf(start), end: isoOf(end), rank: slot.rank, predicted: true, forecast: true, gains, frame };
}
const series = merged.filter(p => !p.collab);
// A frame stops being a forecast as soon as a patch of the sheet takes it
const nextFrames = NEXT_FRAMES.filter(name => !merged.some(patch => patch.frame === name));
for (let i = 0; i < PATCHES_PER_YEAR; i++) {
  const frame = nextFrames[i] || "";
  const next = forecast(series[series.length - PATCHES_PER_YEAR], series.at(-1), frame || `Future patch ${i + 1}`, frame);
  series.push(next);
  merged.push(next);
}

const body = merged.map(p => `  ${JSON.stringify(p).replace(/"(\w+)":/g, " $1: ").replace(/^\{ /, "{ ").replace(/,/g, ", ").replace(/\}/g, " }").replace(/ {2,}/g, " ")}`).join(",\n");
writeFileSync(FILE, `${HEADER}const CALC_PATCHES = [\n${body}\n];\n`);
console.log(`${rows.length} patches salvos em calculator-data.js`);
for (const patch of old.filter(p => p.patch && !p.forecast && !rows.some(r => r.patch === p.patch))) console.warn(`Saiu da planilha: ${patch.patch}`);
for (const patch of missing) console.warn(`Falta o "frame" de ${patch}: preencha em calculator-data.js`);
for (const patch of held) console.warn(`AVISO  mudança grande mantida fora: ${patch}. Se estiver certa: node tools/update-calculator.mjs --force`);
