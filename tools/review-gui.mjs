#!/usr/bin/env node
// Painel local para revisar os times enviados pelo Team Builder, no navegador.
// Rode com: node tools/review-gui.mjs            abre http://127.0.0.1:8799 com a fila e os times aprovados
//           node tools/review-gui.mjs --local    trabalha no banco do "npx wrangler@4 pages dev", não no site de verdade
//           node tools/review-gui.mjs --porta 9000
// Usa o login do wrangler (npx wrangler@4 login), como tools/review-teams.mjs. Só escuta em 127.0.0.1: nada fica publicado.
// Aprovar ou tirar do ar regrava a chave "teams" do KV, então o site muda em até 1 minuto, sem deploy.
// As builds oficiais (escritas no app.js) também aparecem: ocultar uma grava o id dela na chave "hidden" do KV, e o site a esconde sem deploy.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import vm from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMP = ".wrangler/review"; // relativo e sem espaços: vai em linha de comando
const SITE = "https://dominiko.pages.dev";
const where = process.argv.includes("--local") ? "--local" : "--remote";
const portArg = process.argv.indexOf("--porta");
const PORT = portArg > 0 ? Number(process.argv[portArg + 1]) || 8799 : 8799;
const TOKEN = randomBytes(16).toString("hex"); // só a página servida por este processo sabe; barra envios vindos de outros sites
const kvId = readFileSync(join(ROOT, "wrangler.toml"), "utf8").match(/\[\[kv_namespaces\]\][^[]*?\bid\s*=\s*"([^"]+)"/)?.[1];
if (!kvId) throw new Error("não achei o id do KV no wrangler.toml");
mkdirSync(join(ROOT, TEMP), { recursive: true });

function wrangler(args) {
  const { status, stdout, stderr } = spawnSync(`npx --yes wrangler@4 ${args.join(" ")}`, { cwd: ROOT, encoding: "utf8", shell: true });
  if (status) throw new Error(`o wrangler falhou: ${(stderr || stdout).trim().slice(-600)}\nSe for falta de login, rode: npx wrangler@4 login`);
  return stdout;
}
// Leituras vão na linha de comando, então não podem ter texto digitado por alguém. Escritas vão em arquivo
function read(query) {
  const out = wrangler(["d1", "execute", "dominik", where, "--json", "--command", `"${query}"`]);
  return JSON.parse(out.slice(out.indexOf("[")))[0].results;
}
function write(query) {
  writeFileSync(join(ROOT, TEMP, "write.sql"), query);
  wrangler(["d1", "execute", "dominik", where, "--yes", `--file=${TEMP}/write.sql`]);
}
const quote = text => `'${String(text).replace(/'/g, "''")}'`;
function publish() {
  const teams = read("SELECT id, team, author FROM teams WHERE status = 'approved' ORDER BY reviewed")
    .map(row => ({ id: row.id, author: row.author, team: JSON.parse(row.team) }));
  writeFileSync(join(ROOT, TEMP, "teams.json"), JSON.stringify(teams));
  wrangler(["kv", "key", "put", "teams", `--namespace-id=${kvId}`, `--path=${TEMP}/teams.json`, where]);
  return teams.length;
}
// Onde ficam as imagens de cada personagem, memória e ressonância: o catálogo do Team Builder e a tabela de memórias do app.js
function artIndex() {
  try {
    const catalog = new Function(readFileSync(join(ROOT, "data/catalog-data.js"), "utf8") + ";return CATALOG")();
    const app = readFileSync(join(ROOT, "app.js"), "utf8");
    const a = app.indexOf("const MEMORY_TABS"), b = app.indexOf("\n", app.indexOf("const memFile"));
    const { MEM_INDEX } = new Function(app.slice(a, b) + ";return { MEM_INDEX }")();
    return { chars: Object.fromEntries(catalog.characters.map(c => [c.name, { portrait: c.portrait, symbol: c.symbol, weapon: c.weapon, construct: c.construct, element: c.element, class: c.class }])),
      weapons: Object.fromEntries(catalog.weapons.map(w => [w.owner, { name: w.name, type: w.type, ranks: Object.fromEntries(w.ranks.map(r => [r.rank, r.art])) }])),
      pages: catalog.pages, mem: Object.fromEntries(MEM_INDEX), res: catalog.memoryResonances, allAtk: catalog.allAtk };
  } catch { return null; } // sem imagens o painel continua mostrando os textos
}
// As builds oficiais, lidas do app.js como o make-catalog faz. O id é o de uma variante, ou o da composição quando ela não tem variantes
function officials() {
  const app = readFileSync(join(ROOT, "app.js"), "utf8"), end = app.indexOf("const $ = (s, r = document)");
  if (end < 0) throw new Error('não achei a linha "const $ = (s, r = document)" no app.js');
  const { COMPS, PAGES } = vm.runInNewContext(`${readFileSync(join(ROOT, "data/assets-data.js"), "utf8")}
${app.slice(0, end)}
;({ COMPS, PAGES })`);
  const rows = [];
  for (const [comp, c] of Object.entries(COMPS)) {
    const page = Object.keys(PAGES).find(path => PAGES[path].includes(comp));
    if (!page) continue;
    for (const t of c.variants || [{ id: comp, name: "", cards: c.cards }]) {
      rows.push({ id: t.id, page, name: [c.name, t.name].filter(Boolean).join(" · "), group: t.group || "", cards: t.cards.map(card => ({ char: card.name, portrait: card.portrait })) });
    }
  }
  return rows;
}
function readHidden() {
  try {
    const list = JSON.parse(wrangler(["kv", "key", "get", "hidden", `--namespace-id=${kvId}`, "--text", where]));
    return Array.isArray(list) ? list.filter(id => typeof id === "string") : [];
  } catch (e) {
    if (/404|not found/i.test(e.message)) return []; // ainda não existe: nada foi ocultado
    throw e;
  }
}
function writeHidden(ids) {
  writeFileSync(join(ROOT, TEMP, "hidden.json"), JSON.stringify(ids));
  wrangler(["kv", "key", "put", "hidden", `--namespace-id=${kvId}`, `--path=${TEMP}/hidden.json`, where]);
}
const list = () => {
  const rows = read("SELECT id, page, status, team, author, created, reviewed, reason FROM teams WHERE status IN ('pending', 'approved') ORDER BY created");
  const parse = row => ({ ...row, team: JSON.parse(row.team) });
  const hidden = readHidden(), all = officials();
  return { pending: rows.filter(r => r.status === "pending").map(parse), approved: rows.filter(r => r.status === "approved").map(parse),
    official: all.filter(o => !hidden.includes(o.id)), hidden: all.filter(o => hidden.includes(o.id)), site: SITE, local: where === "--local", art: artIndex() };
};
// Cada ação só vale para o estado certo; se outra pessoa decidiu antes, nada muda
const ACTIONS = { approve: ["pending", "approved"], reject: ["pending", "rejected"], remove: ["approved", "rejected"] };
function act({ id, action, reason }) {
  if (action === "hide" || action === "show") {
    if (!officials().some(o => o.id === id)) throw new Error(`Official build "${id}" does not exist`);
    const hidden = readHidden().filter(x => x !== id);
    if (action === "hide") hidden.push(id);
    writeHidden(hidden);
    return { published: null, hidden: hidden.length };
  }
  id = Number(id);
  const step = ACTIONS[action];
  if (!Number.isInteger(id) || !step) throw new Error("Invalid request");
  const why = action === "remove" ? "removed from the site" : String(reason || "").slice(0, 200);
  write(`UPDATE teams SET status = '${step[1]}', reason = ${why ? quote(why) : "NULL"}, reviewed = ${Date.now()} WHERE id = ${id} AND status = '${step[0]}';`);
  const [row] = read(`SELECT status FROM teams WHERE id = ${id}`);
  if (!row) throw new Error(`Team #${id} does not exist`);
  if (row.status !== step[1]) throw new Error(`Team #${id} is already "${row.status}", so it cannot be ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "taken down"}`);
  return { published: step.includes("approved") ? publish() : null };
}


const json = (res, code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
const server = createServer((req, res) => {
  // Só aceita quem chama pelo endereço local: barra outros sites falando com este servidor (CSRF e DNS rebinding)
  if (![`127.0.0.1:${PORT}`, `localhost:${PORT}`].includes(req.headers.host)) return json(res, 403, { error: "Invalid host" });
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return res.end(readFileSync(join(ROOT, "tools/review-gui.html"), "utf8").replace("__TOKEN__", TOKEN));
  }
  if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }
  if (req.headers["x-token"] !== TOKEN) return json(res, 403, { error: "Not allowed" });
  if (req.method === "GET" && req.url === "/list") {
    try { return json(res, 200, list()); } catch (e) { return json(res, 500, { error: e.message }); }
  }
  if (req.method === "POST" && req.url === "/act") {
    let text = "";
    req.on("data", chunk => { text += chunk; if (text.length > 5000) req.destroy(); });
    return req.on("end", () => {
      try { json(res, 200, act(JSON.parse(text))); } catch (e) { json(res, 400, { error: e.message }); }
    });
  }
  json(res, 404, { error: "Not found" });
});
server.on("error", err => { console.error(err.code === "EADDRINUSE" ? `ERRO  a porta ${PORT} já está em uso. Use --porta OUTRA.` : `ERRO  ${err.message}`); process.exit(1); });
server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`Painel de revisão em ${url}${where === "--local" ? "  (banco local)" : ""}\nCtrl+C para fechar.`);
  if (!process.argv.includes("--sem-abrir")) spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
});
