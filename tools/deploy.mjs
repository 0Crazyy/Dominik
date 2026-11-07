#!/usr/bin/env node
// Publishes the site. The repository root also holds tools/ and .claude/, so only the files below go up:
// they are copied to .deploy/ and that folder is what Cloudflare Pages receives.
// Run it with: node tools/deploy.mjs     (--stage-only copies the files and stops before publishing)
// Once per computer: npx wrangler@4 login. Once ever: npx wrangler@4 pages project create dominiko --production-branch main
import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STAGE = join(ROOT, ".deploy");
const SITE_FILES = ["_headers", "_redirects", "404.html", "robots.txt", "sitemap.xml", "index.html", "style.css", "app.js", "data", "assets", "assets-web"];

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
run("node", ["tools/check-assets.mjs"]);
rmSync(STAGE, { recursive: true, force: true });
for (const file of SITE_FILES) cpSync(join(ROOT, file), join(STAGE, file), { recursive: true });
run("node", ["tools/make-embeds.mjs"]);
if (stageOnly) process.exit(0);
run("npx", ["--yes", "wrangler@4", "pages", "deploy", ".deploy", "--project-name", "dominiko", "--branch", "main", "--commit-dirty=true"]);
