// Looks for mistakes that only show up when a line runs, such as a misspelled name in a rarely used path.
// Run it with: npm run lint
import { readFileSync } from "node:fs";
import js from "@eslint/js";
import globals from "globals";

// The site has no modules: index.html loads these as plain scripts, so they all share their top-level names
const DATA = ["data/assets-data.js", "data/calculator-data.js", "data/timeline-data.js", "data/skills-data.js", "data/catalog-data.js", "data/home-splashes.js"];
const SCRIPTS = [...DATA, "app.js", "editor.js"];
const shared = Object.fromEntries(SCRIPTS.flatMap(file =>
  [...readFileSync(new URL(file, import.meta.url), "utf8").matchAll(/^(const|let|function)\s+([\w$]+)/gm)].map(m => [m[2], m[1] === "let" ? "writable" : "readonly"])));

export default [
  { ignores: ["node_modules/", "assets/", "assets-web/", ".deploy/", ".smoke/", ".wrangler/", ".netlify/"] },
  js.configs.recommended,
  // { rank, ...plan } is how the code drops a field from a copy
  { rules: { "no-unused-vars": ["error", { ignoreRestSiblings: true }] } },
  {
    files: SCRIPTS,
    languageOptions: { sourceType: "script", globals: { ...globals.browser, ...shared } },
    // Each file declares its own names, which the list above also holds
    rules: { "no-redeclare": ["error", { builtinGlobals: false }] }
  },
  // Data files only declare: what they hold is used by app.js
  { files: DATA, rules: { "no-unused-vars": ["error", { vars: "local" }] } },
  { files: ["tools/**/*.mjs", "eslint.config.mjs"], languageOptions: { globals: globals.node } },
  // The API runs on Cloudflare, as modules
  { files: ["functions/**/*.js", "server/**/*.js"], languageOptions: { sourceType: "module", globals: globals.serviceworker } },
  // Its page.evaluate() callbacks run inside the browser
  { files: ["tools/smoke.mjs"], languageOptions: { globals: globals.browser } }
];
