#!/usr/bin/env node
// Creates the light WebP copies the site really loads: Dominik/assets/<file> -> Dominik/assets-web/<file>.webp
// The full name stays in the copy (X.png.webp) because X.png and X.webp can sit side by side.
// The originals in assets/ are never changed, and app.js keeps pointing at them: web() in app.js swaps the path on render.
// Run it after adding or replacing images: node tools/optimize-images.mjs     (--force redoes every file)
// Needs ImageMagick (magick). Only files that are new or changed are processed.
import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "Dominik");
const FROM = join(SITE, "assets"), TO = join(SITE, "assets-web");
const FORCE = process.argv.includes("--force");
const QUALITY = "85", JOBS = 6;

// Not loaded through web(): home thumbnails and the link preview are used as they are, the rest is unused source art
const SKIP = [/^home\//, /^embed-icon\./, / 3D\.\w+$/, /\/PGR_[^/]+$/];
// Largest size of each kind of image, about twice what the biggest view shows (the focus view enlarges cards 1.35x)
const DEFAULT_SIZE = "512x512";
const SIZES = [
  [/^logo\./, "192x192"],
  [/^classes\//, "256x256"],
  [/^resonances\//, "320x320"],
  [/\/Awaken - /, "384x384"],
  // Weapon Harmony art is zoomed up to 6x by WH_FRAME, so it needs far more pixels than its slot suggests
  [/ WH\.\w+$/, "1200x1800"]
];
const sizeFor = path => (SIZES.find(([rule]) => rule.test(path)) || [, DEFAULT_SIZE])[1];

async function listImages(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) await listImages(full, out);
    else if (/\.(png|jpe?g|webp)$/i.test(e.name)) out.push(relative(FROM, full).split(sep).join("/"));
  }
  return out;
}

const mtime = file => stat(file).then(s => s.mtimeMs, () => 0);

async function fitsIn(file, size) {
  const { stdout } = await run("magick", ["identify", "-format", "%w %h", `${file}[0]`]);
  const [w, h] = stdout.trim().split(" ").map(Number), [maxW, maxH] = size.split("x").map(Number);
  return w <= maxW && h <= maxH;
}

async function optimize(path) {
  const src = join(FROM, path), dest = join(TO, `${path}.webp`), size = sizeFor(path);
  if (!FORCE && await mtime(dest) >= await mtime(src)) return false;
  await mkdir(dirname(dest), { recursive: true });
  // A WebP that is already small enough is copied: encoding it again would only lose quality
  if (/\.webp$/i.test(path) && await fitsIn(src, size)) await copyFile(src, dest);
  else await run("magick", [src, "-strip", "-resize", `${size}>`, "-quality", QUALITY, "-define", "webp:method=6", dest]);
  return true;
}

const images = (await listImages(FROM)).filter(path => !SKIP.some(rule => rule.test(path)));
let next = 0, made = 0, failed = 0;
await Promise.all(Array.from({ length: JOBS }, async () => {
  while (next < images.length) {
    const path = images[next++];
    try {
      if (await optimize(path)) made++;
    } catch (err) {
      failed++;
      console.error(`ERRO   ${path}: ${err.message}`);
    }
  }
}));
console.log(`${images.length} imagens: ${made} geradas, ${images.length - made - failed} já em dia, ${failed} com erro.`);
process.exit(failed ? 1 : 0);
