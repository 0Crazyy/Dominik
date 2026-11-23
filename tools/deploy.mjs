#!/usr/bin/env node
// Publishes the site. The repository root also holds tools/ and .claude/, so only the files below go up:
// they are copied to .deploy/ and that folder is what Cloudflare Pages receives.
// The API is not in the list: wrangler reads functions/ (and server/, which it imports) and wrangler.toml from the root by itself.
// Run it with: node tools/deploy.mjs     (--stage-only copies the files and stops before publishing)
// Once per computer: npx wrangler login. Once ever: npx wrangler pages project create dominiko --production-branch main
import { spawnSync } from "node:child_process";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STAGE = join(ROOT, ".deploy");
const SITE_FILES = ["_headers", "_redirects", "404.html", "robots.txt", "sitemap.xml", "index.html", "style.css", "app.js", "i18n.js", "editor.js", "admin-panel.js", "data", "assets", "assets-web"];

const run = (command, args) => {
  const { status } = spawnSync(command, args, { cwd: ROOT, stdio: "inherit", shell: true });
  if (status) process.exit(status);
};

// Refreshed only when publishing: --stage-only has to work offline. A store or sheet problem warns, and the current data goes up
const refresh = script => {
  const { status } = spawnSync("node", [script], { cwd: ROOT, stdio: "inherit", shell: true });
  if (status) console.warn(`AVISO  ${script} falhou: seguindo com os dados atuais.`);
};
const stageOnly = process.argv.includes("--stage-only");
if (!stageOnly) ["tools/update-prices.mjs", "tools/update-calculator.mjs", "tools/update-timeline.mjs", "tools/make-sitemap.mjs"].forEach(refresh);
run("node", ["tools/make-catalog.mjs"]);
run("node", ["tools/check-assets.mjs"]);
rmSync(STAGE, { recursive: true, force: true });
// The Portuguese translation is not finished: data/pt/ stays out and the published i18n.js is switched off (English only, no language button).
// Nor is the damage calculator: its two data files stay out and the published app.js has it switched off
const DRAFT_PATHS = [join(ROOT, "data", "pt"), join(ROOT, "data", "damage-formulas.js"), join(ROOT, "data", "damage-data.js")];
for (const file of SITE_FILES) cpSync(join(ROOT, file), join(STAGE, file), { recursive: true, filter: src => !DRAFT_PATHS.some(path => src === path || src.startsWith(path + sep)) });
const i18n = readFileSync(join(STAGE, "i18n.js"), "utf8").replace("const I18N_ENABLED = true;", "const I18N_ENABLED = false;");
if (i18n.split("const I18N_ENABLED = false;").length !== 2) { console.error("ERRO   i18n.js sem a linha \"const I18N_ENABLED = false;\": o deploy parou para não publicar a tradução."); process.exit(1); }
writeFileSync(join(STAGE, "i18n.js"), i18n);
const appJs = readFileSync(join(STAGE, "app.js"), "utf8").replace("const DAMAGE_ENABLED = true;", "const DAMAGE_ENABLED = false;");
if (appJs.split("const DAMAGE_ENABLED = false;").length !== 2) { console.error("ERRO   app.js sem a linha \"const DAMAGE_ENABLED = false;\": o deploy parou para não publicar a calculadora de dano."); process.exit(1); }
writeFileSync(join(STAGE, "app.js"), appJs);
run("node", ["tools/make-embeds.mjs"]);
if (stageOnly) process.exit(0);
run("npx", ["wrangler", "pages", "deploy", ".deploy", "--project-name", "dominiko", "--branch", "main", "--commit-dirty=true"]);
