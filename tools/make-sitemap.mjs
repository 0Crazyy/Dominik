#!/usr/bin/env node
// Writes sitemap.xml with every main page of the site, so search engines can find them. tools/deploy.mjs runs it before publishing.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://dominiko.pages.dev";
const app = readFileSync(join(ROOT, "app.js"), "utf8");
const { COMPS, PAGES } = vm.runInNewContext(`${readFileSync(join(ROOT, "data/assets-data.js"), "utf8")}\n${app.slice(0, app.indexOf("const $ = (s, r = document)"))}\n;({ COMPS, PAGES })`);
const names = Object.values(COMPS).flatMap(c => (c.variants || [c]).flatMap(team => team.cards.map(card => card.name)));
// Same address as charId in app.js
const characterId = name => name.replace(":", "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
const pages = ["", "constructs", "calculator", "timeline", "contact", "assets/memories", "assets/weapons", "assets/resonances", "assets/cubs",
  ...Object.keys(PAGES), ...[...new Set(names)].map(name => `character/${characterId(name)}`)];
const urls = pages.map(page => `  <url><loc>${SITE}/${page}</loc></url>`).join("\n");
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`${pages.length} páginas salvas em sitemap.xml`);
