#!/usr/bin/env node
// Reviews the teams people sent from the Team Builder. Approved teams show up on the site right away, with no deploy.
// Run it with: node tools/review-teams.mjs              the queue, one team at a time
//              node tools/review-teams.mjs --aprovados  the teams on the site, to take one down
//              add --local to work on the copy of "npx wrangler@4 pages dev" instead of the real site
// It uses your wrangler login (npx wrangler@4 login). The database is D1 "dominik"; the site reads the approved
// teams from one KV key ("teams"), which this tool writes again after every change.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMP = ".wrangler/review"; // relative and without spaces: it goes on a command line
const SITE = "https://dominiko.pages.dev";
const where = process.argv.includes("--local") ? "--local" : "--remote";
const kvId = readFileSync(join(ROOT, "wrangler.toml"), "utf8").match(/\[\[kv_namespaces\]\][^[]*?\bid\s*=\s*"([^"]+)"/)?.[1];
if (!kvId) throw new Error("não achei o id do KV no wrangler.toml");
mkdirSync(join(ROOT, TEMP), { recursive: true });

function wrangler(args) {
  const { status, stdout, stderr } = spawnSync(`npx --yes wrangler@4 ${args.join(" ")}`, { cwd: ROOT, encoding: "utf8", shell: true });
  if (status) {
    console.error(`ERRO  o wrangler falhou:\n${(stderr || stdout).trim()}\nSe for falta de login, rode: npx wrangler@4 login`);
    process.exit(1);
  }
  return stdout;
}
// Reads go on the command line, so they must have no text typed by anyone. Writes go in a file
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
  console.log(`OK  ${teams.length} time(s) aprovado(s) no site. Aparecem em até 1 minuto.`);
}

const day = ms => new Date(ms).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const indent = text => text.split("\n").map(line => `      ${line}`).join("\n");
function show(row, position) {
  const team = JSON.parse(row.team);
  const sets = mem => [...new Set(mem)].map(name => `${mem.filter(m => m === name).length}x ${name}`).join(", ");
  console.log(`\n${"=".repeat(70)}\n${position}  #${row.id}  "${team.name}"  em ${row.page}\nEnviado em ${day(row.created)}${row.author ? ` por ${row.author}` : " sem nome"}`);
  if (team.order) console.log(`Rotação do time: ${team.order}`);
  team.cards.forEach((c, i) => {
    const role = [i === team.captain && "capitão", i === team.starter && "inicia"].filter(Boolean).join(", ");
    console.log(`\n  ${["Azul", "Vermelho", "Amarelo"][i]}: ${c.char} ${c.rank}${role ? ` (${role})` : ""}`);
    console.log(`    Memórias: ${sets(c.mem)}${c.wh ? ` | Harmony: ${c.wh}` : ""}`);
    const memoryResonances = c.memRes?.map(([upper, bottom], slot) => `${slot + 1}: ${upper} / ${bottom}`).join(", ");
    console.log(`    Ressonâncias das memórias: ${memoryResonances || `6x: ${c.res} e ${c.core}`}`);
    console.log(`    Ressonância da arma: ${c.matrix.filter(Boolean).join(", ") || "nenhuma"}`);
    if (c.desc) console.log(`    Notas:\n${indent(c.desc)}`);
    if (c.rotation) console.log(`    Rotação:\n${indent(c.rotation)}`);
  });
  console.log(`\nVer como fica: ${SITE}/editor#t=${Buffer.from(JSON.stringify(team)).toString("base64url")}`);
}

// Lines are read one by one, so the answers can also come from a file or a pipe
const lines = createInterface({ input: process.stdin })[Symbol.asyncIterator]();
const ask = async text => {
  process.stdout.write(text);
  const { value, done } = await lines.next();
  return done ? "" : value;
};
let changed = false;
if (process.argv.includes("--aprovados")) {
  const rows = read("SELECT id, page, team, author FROM teams WHERE status = 'approved' ORDER BY page, reviewed");
  if (!rows.length) console.log("Nenhum time aprovado no site.");
  for (const row of rows) console.log(`#${row.id}  ${row.page}  "${JSON.parse(row.team).name}"${row.author ? `  por ${row.author}` : ""}  ${SITE}/${row.page}?team=c-${row.id}`);
  while (rows.length) {
    const id = Number((await ask("\nNúmero do time para tirar do site (Enter para sair): ")).replace("#", ""));
    if (!id) break;
    if (!rows.some(row => row.id === id)) { console.log("Esse número não está na lista."); continue; }
    write(`UPDATE teams SET status = 'rejected', reason = 'removido do site', reviewed = ${Date.now()} WHERE id = ${id};`);
    console.log(`#${id} removido.`);
    changed = true;
  }
} else {
  const rows = read("SELECT id, page, team, author, created FROM teams WHERE status = 'pending' ORDER BY created");
  console.log(rows.length ? `${rows.length} time(s) esperando revisão.` : "Nenhum time esperando revisão.");
  for (const [i, row] of rows.entries()) {
    show(row, `${i + 1}/${rows.length}`);
    let answer = "";
    while (!["a", "r", "p", "s"].includes(answer)) answer = (await ask("\n[a] aprovar  [r] rejeitar  [p] pular  [s] sair: ")).trim().toLowerCase() || "s";
    if (answer === "s") break;
    if (answer === "p") continue;
    if (answer === "a") {
      write(`UPDATE teams SET status = 'approved', reviewed = ${Date.now()} WHERE id = ${row.id};`);
      console.log(`#${row.id} aprovado.`);
      changed = true;
    } else {
      const reason = (await ask("Motivo (só você vê; Enter para deixar vazio): ")).trim().slice(0, 200);
      write(`UPDATE teams SET status = 'rejected', reason = ${quote(reason)}, reviewed = ${Date.now()} WHERE id = ${row.id};`);
      console.log(`#${row.id} rejeitado.`);
    }
  }
}
if (changed) publish();
process.exit(0);
