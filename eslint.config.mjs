// Looks for mistakes that only show up when a line runs, such as a misspelled name in a rarely used path.
// Run it with: npm run lint
import { readFileSync } from "node:fs";
import js from "@eslint/js";
import globals from "globals";

// The site has no modules: index.html loads these as plain scripts, so they all share their top-level names
const DATA = ["data/assets-data.js", "data/calculator-data.js", "data/timeline-data.js", "data/skills-data.js", "data/catalog-data.js", "data/home-splashes.js", "data/updates-data.js", "data/damage-formulas.js", "data/damage-data.js"];
const SCRIPTS = [...DATA, "i18n.js", "app.js", "editor.js", "admin-panel.js"];
const declared = SCRIPTS.flatMap(file =>
  [...readFileSync(new URL(file, import.meta.url), "utf8").matchAll(/^(const|let|function)\s+([\w$]+)/gm)].map(m => [m[2], m[1] === "let" ? "writable" : "readonly", file]));
const shared = Object.fromEntries(declared.map(([name, kind]) => [name, kind]));
// Two scripts declaring the same name break the page that loads both ("has already been declared"), and the rules
// below can't see it, since every file's names are globals to the others
const twice = declared.filter(([name, , file]) => declared.some(([other, , where]) => other === name && where !== file));
if (twice.length) throw new Error(`Name declared in more than one script: ${[...new Set(twice.map(([name, , file]) => `${name} (${file})`))].join(", ")}`);

export default [
  { ignores: ["drafts/", "node_modules/", "assets/", "assets-web/", ".deploy/", ".smoke/", ".wrangler/", ".netlify/"] },
  js.configs.recommended,
  // { rank, ...plan } is how the code drops a field from a copy
  { rules: { "no-unused-vars": ["error", { ignoreRestSiblings: true }] } },
  {
    files: [...SCRIPTS, "data/pt/*.js"],
    languageOptions: { sourceType: "script", globals: { ...globals.browser, ...shared } },
    // Each file declares its own names, which the list above also holds
    rules: { "no-redeclare": ["error", { builtinGlobals: false }] }
  },
  // Data files only declare: what they hold is used by app.js
  { files: [...DATA, "i18n.js"], rules: { "no-unused-vars": ["error", { vars: "local" }] } },
  { files: ["tools/**/*.mjs", "eslint.config.mjs"], languageOptions: { globals: globals.node } },
  // The API runs on Cloudflare, as modules
  { files: ["functions/**/*.js", "server/**/*.js"], languageOptions: { sourceType: "module", globals: globals.serviceworker } },
  // Its page.evaluate() callbacks run inside the browser
  { files: ["tools/smoke.mjs"], languageOptions: { globals: globals.browser } }
];
