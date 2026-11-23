// Prints a frame's skills from the Huaxu API at one skill level, with every value filled in, to write its DAMAGE_KITS
// entry in data/damage-data.js by hand. Nothing is written to the site.
// Uso: node tools/kit-from-huaxu.mjs "Kamui: Aeternion" [nível, padrão 18]
//      node tools/kit-from-huaxu.mjs --lista        (nomes e slugs do Huaxu)
const API = "https://api.huaxu.app/servers/na";
const args = process.argv.slice(2);
const get = async path => {
  const r = await fetch(`${API}/${path}`, { headers: { "User-Agent": "Mozilla/5.0 (dominik-kit)" } });
  const body = await r.json().catch(() => null);
  if (!r.ok || body?.status !== "success") throw new Error(`${path}: ${body?.message || `HTTP ${r.status}`}`);
  return body.data;
};
const { characters } = await get("characters");
const fullName = c => c.characterName === c.frameName ? c.characterName : `${c.characterName}: ${c.frameName}`;
if (args.includes("--lista")) {
  for (const c of characters) console.log(`${fullName(c).padEnd(32)} ${c.slug}`);
  process.exit(0);
}
const [name, level = "18"] = args;
if (!name) {
  console.error('Uso: node tools/kit-from-huaxu.mjs "Nome: Frame" [nível]');
  process.exit(1);
}
const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const char = characters.find(c => norm(fullName(c)) === norm(name) || c.slug === name);
if (!char) {
  console.error(`Não achei "${name}" no Huaxu. Use --lista para ver os nomes.`);
  process.exit(1);
}
const data = await get(`characters/${char.slug}/skills`);
const skills = [];
const walk = o => {
  if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === "object") o.name && o.levels ? skills.push(o) : Object.values(o).forEach(walk);
};
// The API can list a skill twice; exact copies print once (Kamui's core passive comes twice with small data differences)
walk(data);
const plain = s => (s || "").replace(/<[^>]+>/g, "").replace(/\\n/g, "\n").replace(/[^\S\n]/g, " ");
console.log(`# ${fullName(char)} (${char.slug}) · ${char.element} · ${char.class} · nível ${level}`);
console.log("# Valores com nível 1 = metade do 18 escalam; os que não mudam com o nível são fixos (level: \"fixed\")\n");
const seen = new Set();
for (const skill of skills) {
  const key = skill.name + JSON.stringify(skill.templates);
  if (seen.has(key)) continue;
  seen.add(key);
  const levels = Object.keys(skill.levels);
  const at = skill.levels[level] ?? skill.levels[levels.at(-1)];
  // A value that is the same at the first and the last level doesn't scale
  const first = skill.levels[levels[0]], last = skill.levels[levels.at(-1)];
  console.log(`## ${skill.name} (níveis ${levels[0]}–${levels.at(-1)})`);
  (skill.templates[at.template] ?? []).forEach((part, i) => {
    const values = at.values?.[i] ?? at.values?.[0] ?? [];
    const low = first.values?.[i] ?? first.values?.[0] ?? [], high = last.values?.[i] ?? last.values?.[0] ?? [];
    const fixed = values.length && low.every((v, n) => v === high[n]);
    console.log(`### ${plain(part.title) || "(sem título)"}${values.length ? (fixed ? "  [fixo]" : "  [escala]") : ""}`);
    console.log(plain(part.description).replace(/\{(\d+)\}/g, (_, n) => values[n] ?? `{${n}}`));
  });
  console.log("");
}
