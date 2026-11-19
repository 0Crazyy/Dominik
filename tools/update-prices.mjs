#!/usr/bin/env node
// Refreshes the RC prices of the BC calculator (RC_PACKS and RC_PRICES_DATE in app.js) from the Codashop store:
// dollars from its US page, reais from its Brazilian page. The Android packs are read (iOS has the same packs and prices).
// tools/deploy.mjs runs it before publishing. By hand: node tools/update-prices.mjs
// The store writes its packs into the page itself, so a plain download is enough.
// Any failure keeps the current prices and only warns: a store problem must never stop a publish.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "app.js");
const STORES = [
  { currency: "BRL", url: "https://www.codashop.com/pt-br/punishing-gray-raven", price: /^R\$\s*(\d[\d.,]*)$/ },
  { currency: "USD", url: "https://www.codashop.com/en-us/punishing-gray-raven", price: /^(?:US)?\$\s*(\d[\d.,]*)$/ }
];
const MIN_PACKS = 5, MAX_CHANGE = 0.5, PAGE_WAIT = 30000;

const keepPrices = reason => console.warn(`AVISO  ${new Date().toLocaleDateString("pt-BR")}: preços do RC mantidos: ${reason}`);

// 1,234.56 or 1.234,56: the last separator is the decimal one
const money = text => Number(text.replace(/[.,](?=.*[.,])/g, "").replace(",", "."));
// The page as lines of visible text
const pageText = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "\n")
  .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").split("\n").map(line => line.trim()).filter(Boolean);
// A pack shows as "(Android) 28 Rainbow Cards", a label ("From", "Melhor oferta") and then its price
function readPacks(lines, price) {
  const packs = new Map();
  lines.forEach((line, i) => {
    const rc = Number(line.match(/^\(Android\)\s+(\d+)\s+Rainbow Cards$/i)?.[1]);
    if (!rc || packs.has(rc)) return;
    const found = lines.slice(i + 1, i + 4).map(next => next.match(price)).find(Boolean);
    if (found) packs.set(rc, money(found[1]));
  });
  return packs;
}

async function storePrices({ currency, url, price }) {
  const answer = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" }, signal: AbortSignal.timeout(PAGE_WAIT) });
  if (!answer.ok) throw new Error(`a loja respondeu ${answer.status} (${currency})`);
  const packs = readPacks(pageText(await answer.text()), price);
  // The store may answer with a bot check instead of the page. That is its call to make: wait for the next run, never work around it
  if (packs.size < MIN_PACKS) throw new Error(`a página não mostrou os pacotes em ${currency}`);
  return packs;
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

try {
  const current = JSON.parse(readFileSync(FILE, "utf8").match(/^const RC_PACKS = (.*);$/m)?.[1] ?? "[]");
  if (!current.length) throw new Error("não achei RC_PACKS no app.js");
  const [brl, usd] = [await storePrices(STORES[0]), await storePrices(STORES[1])];
  savePrices(checkedPacks(brl, usd, current));
} catch (err) {
  keepPrices(err.message);
}
