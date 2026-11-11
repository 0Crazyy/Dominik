// What the API accepts as a team. cleanTeam() is edClean() of editor.js: keep the two alike.
// Everything in a team is a name from the catalog or a short text, so a stored team can never carry an image path or markup.
import { CATALOG } from "./catalog.js";

export const LIMITS = { name: 60, order: 120, desc: 1500, rotation: 3000, author: 32 };
const BLANK = { rank: "SS", res: "Any ATK", core: "Signature Move" };
const UPPER_RESONANCES = [
  "Red Orb", "Yellow Orb", "Blue Orb", "Basic Attack", "Ex- Precision Action", "Ex- Enhanced Power",
  "Ex- Precision Attack", "Ex- Tactical Adjustment", "Any ATK"
];
const BOTTOM_RESONANCES = [
  "Signature Move", "QTE", "Core Passive", "Class Skill", "Ex- Precision Action", "Ex- Enhanced Power",
  "Ex- Precision Attack", "Ex- Tactical Adjustment", "Any ATK"
];
const MATRIX_COMMON = ["Incandescence", "Dead Line Timing", "Matrix Lightning", "Shock Saturation", "Nsec Transmission", "Shock Echo"];
const MATRIX_TANK = ["Resonant Echo", "Domain Deconstruction", "Boundary's Annihilation", "Gravity Barrier", "Absolute Defense"];
const MATRIX_SUPPORT = ["Glorious Spear", "Superconducting Axial Ray", "Honed Gel", "Stellar Magnetic Rail", "Peaceful Radiant"];
const MATRIX_CLASS = {
  Attacker: ["Glorious Afterglow"],
  Breaker: [...MATRIX_TANK, "Glorious Afterglow"],
  Tank: MATRIX_TANK,
  Support: MATRIX_SUPPORT,
  Amplifier: MATRIX_SUPPORT,
  Overlinker: MATRIX_SUPPORT
};
const matrixFor = ch => CATALOG.matrix.filter(name => MATRIX_COMMON.includes(name) || (MATRIX_CLASS[ch?.class] || []).includes(name));
const CUB_SKILL_ORDER = [0, 1, 2, 3, 4, 5];
const LEGACY_RESONANCE = { "ALL ATK": "Any ATK", Signature: "Signature Move", Core: "Core Passive", Class: "Class Skill" };
const weaponGroups = Object.values(CATALOG.sharedWeapons);
const weaponsFor = name => {
  const owners = weaponGroups.find(group => group.includes(name)) || [name];
  return CATALOG.weapons.filter(w => owners.includes(w.owner) && CATALOG.characters.some(c => c.name === w.owner));
};

export function cleanTeam(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const text = (value, max) => typeof value === "string" ? value.slice(0, max).trim() : "";
  const pick = (value, list, fallback = "") => list.includes(value) ? value : fallback;
  const list = (value, n, options) => Array.from({ length: n }, (_, i) => pick(Array.isArray(value) ? value[i] : "", options));
  const cards = Array.isArray(r.cards) ? r.cards : [], cubs = new Set(CATALOG.characters.map(ch => ch.construct).filter(Boolean));
  return {
    v: 1,
    page: pick(r.page, CATALOG.pages.map(p => p.path)),
    name: text(r.name, LIMITS.name),
    order: text(r.order, LIMITS.order),
    captain: pick(r.captain, [0, 1, 2], 1),
    starter: pick(r.starter, [0, 1, 2], 0),
    cards: [0, 1, 2].map(i => {
      const c = cards[i] && typeof cards[i] === "object" ? cards[i] : {};
      const ch = CATALOG.characters.find(x => x.name === c.char);
      const weapon = ch && weaponsFor(ch.name).some(w => w.owner === c.weapon && w.ranks.some(r => r.rank === c.weaponRank))
        ? CATALOG.weapons.find(w => w.owner === c.weapon) : null;
      const weaponRank = weapon?.ranks.find(r => r.rank === c.weaponRank)?.rank || "";
      const oldUpper = LEGACY_RESONANCE[c.res] || c.res;
      const oldBottom = LEGACY_RESONANCE[c.core] || c.core;
      const memRes = Array.from({ length: 6 }, (_, slot) => {
        const pair = Array.isArray(c.memRes?.[slot]) ? c.memRes[slot] : [];
        return [
          pick(pair[0], UPPER_RESONANCES, UPPER_RESONANCES.includes(oldUpper) ? oldUpper : BLANK.res),
          pick(pair[1], BOTTOM_RESONANCES, BOTTOM_RESONANCES.includes(oldBottom) ? oldBottom : BLANK.core)
        ];
      });
      const cubSkills = Array.isArray(c.cubSkills) && c.cubSkills.length === CUB_SKILL_ORDER.length
        && c.cubSkills.every(index => Number.isInteger(index) && index >= 0 && index < CUB_SKILL_ORDER.length)
        && new Set(c.cubSkills).size === CUB_SKILL_ORDER.length ? c.cubSkills.slice() : CUB_SKILL_ORDER.slice();
      return {
        char: ch ? ch.name : "",
        cub: c.cub === "" ? "" : cubs.has(c.cub) ? c.cub : ch?.construct || "",
        rank: pick(c.rank, CATALOG.ranks, BLANK.rank),
        weapon: weaponRank ? weapon.owner : "",
        weaponRank,
        mem: list(c.mem, 6, CATALOG.memories),
        memRes,
        wh: pick(c.wh, CATALOG.harmony),
        matrix: list(c.matrix, 3, matrixFor(ch)),
        cubSkills,
        res: memRes[0][0],
        core: memRes[0][1],
        desc: text(c.desc, LIMITS.desc),
        rotation: text(c.rotation, LIMITS.rotation)
      };
    })
  };
}
export const cleanAuthor = raw => typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, LIMITS.author) : "";

// Links are what spam is sent for, and nothing in a build needs one
const LINK = /https?:|www\.|discord\.gg|t\.me\/|\b[\w-]+\.(com|net|org|gg|io|ru|xyz|top|shop|site|online|info|link|ly|app|dev)\b/i;
// Why a clean team can't be sent: a code the Team Builder turns into a message, or "" when it can
export function teamProblem(team, author = "") {
  if (!team.page) return "page";
  if (team.name.length < 3) return "name";
  const chars = team.cards.map(c => c.char);
  if (chars.some(c => !c) || new Set(chars).size < 3) return "characters";
  if (team.cards.some(c => c.mem.some(m => !m))) return "memories";
  const texts = [team.name, team.order, author, ...team.cards.flatMap(c => [c.desc, c.rotation])];
  if (texts.some(t => LINK.test(t))) return "links";
  return "";
}
