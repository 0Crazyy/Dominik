#!/usr/bin/env node
// Refreshes the RC prices of the BC calculator (RC_PACKS and RC_PRICES_DATE in app.js) from the Eneba store.
// tools/deploy.mjs runs it before publishing. By hand: node tools/update-prices.mjs
// The store only shows its packs after running JavaScript, so the page is opened in Microsoft Edge, with no window.
// Any failure keeps the current prices and only warns: a store problem must never stop a publish.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "app.js");
const PAGE = "top-up-punishing-gray-raven-android-rainbow-cards-global";
const STORES = [
  { currency: "BRL", url: `https://www.eneba.com/br/${PAGE}`, price: /^R\$\s*(\d[\d.,]*)$/ },
  { currency: "USD", url: `https://www.eneba.com/${PAGE}?currency=USD`, price: /^\$\s*(\d[\d.,]*)$/ }
];
const BROWSERS = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"];
const MIN_PACKS = 5, MAX_CHANGE = 0.5, PAGE_WAIT = 30000, TOTAL_WAIT = 120000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const keepPrices = reason => console.warn(`AVISO  ${new Date().toLocaleDateString("pt-BR")}: preços do RC mantidos: ${reason}`);

// 1,234.56 or 1.234,56: the last separator is the decimal one
const money = text => Number(text.replace(/[.,](?=.*[.,])/g, "").replace(",", "."));
// A pack shows as two lines: "5 Rainbow Cards" and then its price
function readPacks(text, price) {
  const packs = new Map();
  for (const [, rc, line] of text.matchAll(/^(\d+) Rainbow Cards\n(.+)$/gm)) {
    const found = line.trim().match(price);
    if (found && !packs.has(Number(rc))) packs.set(Number(rc), money(found[1]));
  }
  return packs;
}

async function startBrowser(profile) {
  const path = BROWSERS.find(existsSync);
  if (!path) throw new Error("Microsoft Edge não encontrado");
  // Port 0 lets the browser pick a free one, and it writes the choice to this file in its profile
  const browser = spawn(path, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 60 && !existsSync(portFile); i++) await sleep(250);
  if (!existsSync(portFile)) throw new Error("o Edge não abriu");
  await sleep(250);
  const port = readFileSync(portFile, "utf8").split("\n")[0].trim();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const socket = new WebSocket(targets.find(target => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const waiting = new Map();
  socket.onmessage = message => {
    const reply = JSON.parse(message.data);
    waiting.get(reply.id)?.(reply.result);
    waiting.delete(reply.id);
  };
  const send = (method, params = {}) => new Promise(resolve => {
    waiting.set(++id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
  return { browser, send };
}

async function storePrices(send, { currency, url, price }) {
  await send("Network.enable");
  for (const name of ["exchange", "currency"]) await send("Network.setCookie", { name, value: currency, domain: ".eneba.com", path: "/" });
  await send("Page.navigate", { url });
  for (let waited = 0; waited < PAGE_WAIT; waited += 1000) {
    await sleep(1000);
    const page = await send("Runtime.evaluate", { expression: "document.body?.innerText || ''", returnByValue: true });
    const packs = readPacks(page.result.value, price);
    if (packs.size >= MIN_PACKS) return packs;
  }
  const page = await send("Runtime.evaluate", { expression: "document.body?.innerText || ''", returnByValue: true });
  // The store sometimes answers with its bot check. That is its call to make: wait for the next run, never work around it
  throw new Error(page.result.value.includes("Cloudflare") ? `a loja pediu a verificação anti-bot (${currency}), tente depois` : `a página não mostrou os pacotes em ${currency}`);
}

// Wrong numbers are worse than old ones, so a suspicious reading is refused
function checkedPacks(brl, usd, current) {
  const packs = [...brl].filter(([rc]) => usd.has(rc)).map(([rc, price]) => [rc, price, usd.get(rc)]).sort((a, b) => a[0] - b[0]);
  if (packs.length < MIN_PACKS) throw new Error(`só ${packs.length} pacotes têm preço nas duas moedas`);
  for (const pack of packs) {
    const before = current.find(([rc]) => rc === pack[0]);
    for (const column of [1, 2]) {
      if (!(pack[column] > 0)) throw new Error(`preço inválido no pacote de ${pack[0]} RC`);
      if (before && Math.abs(pack[column] / before[column] - 1) > MAX_CHANGE) throw new Error(`o pacote de ${pack[0]} RC mudou mais de ${MAX_CHANGE * 100}%, confira na loja`);
    }
  }
  return packs;
}

function savePrices(packs) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const list = packs.map(([rc, brl, usd]) => `[${rc}, ${brl.toFixed(2)}, ${usd.toFixed(2)}]`).join(", ");
  const code = readFileSync(FILE, "utf8")
    .replace(/^const RC_PACKS = .*$/m, () => `const RC_PACKS = [${list}];`)
    .replace(/^const RC_PRICES_DATE = .*$/m, () => `const RC_PRICES_DATE = "${today}";`);
  writeFileSync(FILE, code);
  console.log(`Preços do RC atualizados: ${packs.length} pacotes, ${today}.`);
}

const profile = mkdtempSync(join(tmpdir(), "dominik-prices-"));
let browser;
const finish = () => {
  browser?.kill();
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  catch { /* Only a temporary folder: Windows clears it later */ }
  process.exit(0);
};
setTimeout(() => { keepPrices("a loja demorou demais"); finish(); }, TOTAL_WAIT);
try {
  const current = JSON.parse(readFileSync(FILE, "utf8").match(/^const RC_PACKS = (.*);$/m)?.[1] ?? "[]");
  if (!current.length) throw new Error("não achei RC_PACKS no app.js");
  const started = await startBrowser(profile);
  browser = started.browser;
  const [brl, usd] = [await storePrices(started.send, STORES[0]), await storePrices(started.send, STORES[1])];
  savePrices(checkedPacks(brl, usd, current));
} catch (err) {
  keepPrices(err.message);
}
finish();
