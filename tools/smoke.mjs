#!/usr/bin/env node
// Opens the site in a real browser and looks for what check-assets cannot see: errors on the page, requests that fail,
// pages that come up empty, sideways scrolling and the main clicks that stop working. Desktop and phone sizes, every page of sitemap.xml.
// Run it with: npm run smoke                       (once per computer: npm install)
//              node tools/smoke.mjs timeline energy/fire    (only these pages, with screenshots, and no click tests; "home" is the home page)
// Screenshots go to .smoke/. They are for looking at: nothing here judges how a page looks.
// Exit code 1 = something is broken. Pages added since the last deploy are not in sitemap.xml: name them as above.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = join(ROOT, ".smoke");
const WORKERS = 6;
const SIZES = {
  desktop: { viewport: { width: 1366, height: 800 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
};
// Default run: one page of each kind gets a screenshot, since all of them together would be too many to look at
const SHOT_PAGES = ["/", "/constructs", "/energy/fire", "/character/leia-fortunaster", "/calculator", "/timeline", "/assets/memories"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".xml": "application/xml", ".txt": "text/plain" };

// The rules _headers gives every page. The strict Content-Security-Policy there blocks things only on the published site, so it has to apply here too
const siteHeaders = () => {
  const block = readFileSync(join(ROOT, "_headers"), "utf8").match(/^\/\*\r?\n((?:[ \t]+.*\r?\n?)+)/m)?.[1] || "";
  return Object.fromEntries(block.split(/\r?\n/).filter(Boolean).map(line => line.trim().match(/^([^:]+):\s*(.*)$/).slice(1)));
};

// Answers like Cloudflare does: files as they are, and index.html for page addresses (the real site has a copy of it for each)
function serve() {
  const headers = siteHeaders();
  const server = createServer((req, res) => {
    const answer = (status, body, type = "text/plain") => { res.writeHead(status, { ...headers, "Content-Type": type }); res.end(body); };
    let path;
    try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { return answer(400, "bad address"); }
    const file = normalize(join(ROOT, path));
    if (file !== ROOT && !file.startsWith(ROOT + sep)) return answer(403, "outside the site");
    if (existsSync(file) && statSync(file).isFile()) return answer(200, readFileSync(file), TYPES[extname(file).toLowerCase()] || "application/octet-stream");
    if (extname(path)) return answer(404, "not found");
    answer(200, readFileSync(join(ROOT, "index.html")), TYPES[".html"]);
  });
  return new Promise(done => server.listen(0, "127.0.0.1", () => done(server)));
}

// Problem text -> where it happened, because one broken file shows up on every page
const problems = new Map();
const report = (size, where, text) => {
  if (!problems.has(text)) problems.set(text, new Set());
  problems.get(text).add(`[${size}] ${where}`);
};

// Everything the browser complains about. Other sites (the web font) are left out: being offline is not a bug of the site
function watch(page, size, where, base) {
  const ours = url => url.startsWith(base);
  page.on("pageerror", e => report(size, where, `erro de JavaScript: ${e.message}`));
  page.on("console", m => {
    // "Failed to load resource" repeats what the response listener below says, with less detail
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource") && (ours(m.location().url || base) || /Content Security Policy/i.test(m.text()))) report(size, where, `console: ${m.text()}`);
  });
  page.on("response", r => { if (ours(r.url()) && r.status() >= 400) report(size, where, `${r.status()} em ${decodeURI(r.url().slice(base.length))}`); });
  page.on("requestfailed", r => { if (ours(r.url()) && r.failure()?.errorText !== "net::ERR_ABORTED") report(size, where, `falhou ${decodeURI(r.url().slice(base.length))}`); });
}

// Waits for the images and for skills-data.js, which loads late. A page that never goes quiet is still checked
const settle = page => page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

async function checkPage(context, size, path, base, shot) {
  const page = await context.newPage();
  watch(page, size, path, base);
  try {
    await page.goto(base + path, { waitUntil: "load" });
    await settle(page);
    const width = SIZES[size].viewport.width;
    const state = await page.evaluate(width => {
      const main = document.querySelector("#main");
      const wide = [...document.querySelectorAll("body *")].find(el => el.getBoundingClientRect().right > width + 1);
      return {
        filled: main?.children.length > 0, lost: /Page not found/.test(main?.textContent || ""), extra: document.documentElement.scrollWidth - width,
        wide: wide && `${wide.tagName.toLowerCase()}${wide.id ? `#${wide.id}` : ""}${typeof wide.className === "string" && wide.className ? `.${wide.className.trim().split(/\s+/).join(".")}` : ""}`
      };
    }, width);
    if (!state.filled) report(size, path, "a página abriu vazia");
    if (state.lost) report(size, path, "a página diz que não existe");
    if (state.extra > 1) report(size, path, `rolagem lateral de ${state.extra}px (começa em ${state.wide})`);
    if (shot) {
      const name = path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
      await page.screenshot({ path: join(SHOTS, size, `${name}.png`), fullPage: true });
    }
  } catch (e) {
    report(size, path, `não abriu: ${e.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

// The clicks people depend on most. Each one starts from a fresh page, so one failure does not hide the others
const FLOWS = {
  "busca": async (page, size) => {
    await page.goto("/");
    if (size === "mobile") await page.click("#menuBtn");
    await page.fill("#searchBox", "Leia");
    await page.click("#searchResults a");
    await page.waitForURL(url => url.pathname !== "/");
    await page.waitForSelector("#main h1");
  },
  "troca de time": async page => {
    await page.goto("/energy/fire");
    const before = await page.textContent("#compBox");
    await page.click('.picker button[aria-pressed="false"]');
    await page.waitForFunction(old => document.querySelector("#compBox")?.textContent !== old, before);
  },
  "detalhe de arma": async page => {
    await page.goto("/assets/weapons");
    await page.click('#main a[href^="/assets/weapon/"]');
    await page.waitForURL(/\/assets\/weapon\//);
    await page.waitForSelector("#main h1");
  },
  "menu do celular": async (page, size) => {
    if (size !== "mobile") return;
    await page.goto("/");
    await page.click("#menuBtn");
    await page.click('#sideNav a[href="/constructs"]');
    await page.waitForURL(/\/constructs$/);
    await page.waitForFunction(() => !document.querySelector("#side").classList.contains("open"));
  }
};

async function checkFlow(browser, size, name, base) {
  const context = await browser.newContext({ ...SIZES[size], baseURL: base });
  context.setDefaultTimeout(8000);
  const page = await context.newPage();
  watch(page, size, `clique "${name}"`, base);
  try {
    await FLOWS[name](page, size);
  } catch (e) {
    report(size, `clique "${name}"`, e.message.split("\n")[0]);
  } finally {
    await context.close();
  }
}

async function pool(jobs) {
  const next = async () => { for (let job; (job = jobs.shift());) await job(); };
  await Promise.all(Array.from({ length: WORKERS }, next));
}

// Git Bash rewrites /timeline into a Windows path, so addresses are written without the first slash
const chosen = process.argv.slice(2).map(arg => {
  if (arg.includes(":")) { console.error(`Endereço inválido: ${arg}. Escreva sem a barra inicial, assim: timeline`); process.exit(2); }
  return arg === "home" ? "/" : `/${arg.replace(/^\/+/, "")}`;
});
const paths = chosen.length ? chosen : [...readFileSync(join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
const started = Date.now();

rmSync(SHOTS, { recursive: true, force: true });
Object.keys(SIZES).forEach(size => mkdirSync(join(SHOTS, size), { recursive: true }));
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
// The Edge that comes with Windows, so nothing has to be downloaded. On another system: SMOKE_BROWSER=chrome
const browser = await chromium.launch({ channel: process.env.SMOKE_BROWSER || "msedge" });

try {
  const contexts = Object.fromEntries(await Promise.all(Object.keys(SIZES).map(async size => [size, await browser.newContext(SIZES[size])])));
  const jobs = Object.keys(SIZES).flatMap(size => [
    ...paths.map(path => () => checkPage(contexts[size], size, path, base, chosen.length > 0 || SHOT_PAGES.includes(path))),
    ...(chosen.length ? [] : Object.keys(FLOWS).map(name => () => checkFlow(browser, size, name, base)))
  ]);
  const total = jobs.length;
  await pool(jobs);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  for (const [text, places] of problems) {
    const list = [...places].sort();
    console.log(`ERRO   ${text}\n       em ${list.slice(0, 3).join(", ")}${list.length > 3 ? ` e mais ${list.length - 3}` : ""}`);
  }
  console.log(`${total} verificações em ${seconds}s: ${problems.size} problema(s). Prints em .smoke/`);
} finally {
  await browser.close();
  server.close();
}
process.exit(problems.size ? 1 : 0);
