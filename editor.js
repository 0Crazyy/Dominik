/* ---------- Team Builder: the /editor page. app.js loads this file, after data/catalog-data.js, only on that page ---------- */
// A team is kept as names from CATALOG, never as image paths: edCards() turns it into the cards the site draws.
// Submitted teams have this same shape, and the server checks them against the same catalog (server/team.js).
// The cards are the editor: equipment slots open searchable icon pickers directly on the card.
/* exported teamBuilder, edPaint, edClean, edCards, edTheme */ // app.js calls these
const EDITOR_KEY = "dominik-editor";
const ED_BARS = ["blue", "red", "gold"];
const ED_SLOTS = ["Blue", "Red", "Yellow"];
const ED_TAGS = ["Budget", "Warzone", "PPC", "General"]; // keep in step with TAGS in server/team.js
const ED_LIMITS = { name: 60, order: 120, desc: 3000, rotation: 3000 };
const ED_MAIN = [0, 1, 2, 4], ED_SUB = [3, 5]; // 4 pieces of the main set and 2 of the sub set, as memBuild() lays them out
const ED_CUB_SKILL_ORDER = [0, 1, 2, 3, 4, 5];
// Resonance picker art when no character is picked: Lucia: Lotus's Basic Attack, and a plain white card for the rest
const ED_BASIC_ATTACK_ART = "assets/characters/lucia-lotus/skills/Basic Attack.png", ED_BLANK_RESONANCE = "assets/icons/resonance-blank.png";
const ED_MATRIX_COMMON = ["Incandescence", "Dead Line Timing", "Matrix Lightning", "Shock Saturation", "Nsec Transmission", "Shock Echo"];
const ED_MATRIX_TANK = ["Resonant Echo", "Domain Deconstruction", "Boundary's Annihilation", "Gravity Barrier", "Absolute Defense"];
const ED_MATRIX_SUPPORT = ["Glorious Spear", "Superconducting Axial Ray", "Honed Gel", "Stellar Magnetic Rail", "Peaceful Radiant"];
const ED_MATRIX_CLASS = {
  Attacker: ["Glorious Afterglow"],
  Breaker: [...ED_MATRIX_TANK, "Glorious Afterglow"],
  Tank: ED_MATRIX_TANK,
  Support: ED_MATRIX_SUPPORT,
  Amplifier: ED_MATRIX_SUPPORT,
  Overlinker: ED_MATRIX_SUPPORT
};
// Weapon resonances a new character comes with, by class (the others start empty)
const ED_MATRIX_DEFAULT = {
  Tank: ["Domain Deconstruction"], Breaker: ["Domain Deconstruction"],
  Amplifier: ["Superconducting Axial Ray", "Glorious Spear"], Overlinker: ["Superconducting Axial Ray", "Glorious Spear"], Support: ["Superconducting Axial Ray", "Glorious Spear"]
};
const ED_SIGNATURE_MEMORY_SLOTS = [0, 1, 2, 4];
const edMatrixOptions = ch => CATALOG.matrix.filter(name =>
  ED_MATRIX_COMMON.includes(name) || (ED_MATRIX_CLASS[ch?.class] || []).includes(name));
// How often each weapon resonance appears in the site's own builds, overall and per class: the most used lead the menu
let edMatrixUse = null, edMemUse = null;
const edSiteCards = () => Object.values(COMPS).flatMap(comp => [...(comp.cards || []), ...(comp.variants || []).flatMap(v => v.cards || [])]);
const edBump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
// In how many builds of the site this character wears each memory (once per card, whichever slots it fills)
function edMemoryUse(char) {
  if (!char) return new Map();
  if (!edMemUse) {
    const byArt = new Map(CATALOG.memories.flatMap(name => memSet(name).map(art => [art, name])));
    edMemUse = new Map();
    edSiteCards().forEach(card => new Set((card.memories || []).map(art => byArt.get(art)).filter(Boolean))
      .forEach(name => edBump(edMemUse, `${card.name}|${name}`)));
  }
  const use = new Map();
  CATALOG.memories.forEach(name => { const n = edMemUse.get(`${char}|${name}`); if (n) use.set(name, n); });
  return use;
}
function edMatrixCounts() {
  if (edMatrixUse) return edMatrixUse;
  const byArt = new Map(CATALOG.matrix.map(name => [WEAPON_RES(name), name]));
  const use = edMatrixUse = { all: new Map(), cls: new Map() };
  edSiteCards().forEach(card => {
    const cls = edChar(card.name)?.class || "";
    (card.matrix || []).forEach(art => {
      const name = byArt.get(art);
      if (!name) return;
      edBump(use.all, name);
      edBump(use.cls, `${cls}|${name}`);
    });
  });
  return use;
}
// Options for the weapon resonance menu: most used first (class of the character, then overall), the first few up front
function edMatrixChoices(ch) {
  const use = edMatrixCounts(), cls = ch?.class || "";
  return edMatrixOptions(ch).map((name, index) => ({ name, index, own: use.cls.get(`${cls}|${name}`) || 0, all: use.all.get(name) || 0 }))
    .sort((a, b) => b.own - a.own || b.all - a.all || a.index - b.index)
    .map(({ name }, rank) => ({ value: name, label: name, art: WEAPON_RES(name), more: rank >= ED_MATRIX_MAIN }));
}
// Options flagged "more" sit behind an "Others" button, unless the current choice is one of them
function edMoreSplit(options, current, keepClosed = false) {
  const extra = options.filter(option => option.more);
  return { ordered: [...options.filter(option => !option.more), ...extra], open: !keepClosed && extra.some(option => option.value === current), count: extra.length };
}
const edMoreButton = (count, open) => count
  ? `<button type="button" class="ed-picker-more" data-ed-more aria-expanded="${open}">${open ? "Show fewer" : `Others (${count})`}</button>` : "";
const edSkillOrder = value => Array.isArray(value) && value.length === ED_CUB_SKILL_ORDER.length
  && value.every(index => Number.isInteger(index) && index >= 0 && index < ED_CUB_SKILL_ORDER.length)
  && new Set(value).size === ED_CUB_SKILL_ORDER.length ? value.slice() : ED_CUB_SKILL_ORDER.slice();
const ED_UPPER_RESONANCES = [
  ["Red Orb", "Red Orb Level +1"], ["Yellow Orb", "Yellow Orb Level +1"], ["Blue Orb", "Blue Orb Level +1"],
  ["Basic Attack", "Basic Attack Level +1"], ["Ex- Precision Action", "Ex- Precision Action · HP +75, CRIT +15"],
  ["Ex- Enhanced Power", "Ex- Enhanced Power · ATK +15, DEF +23"],
  ["Ex- Precision Attack", "Ex- Precision Attack · ATK +15, CRIT +15"],
  ["Ex- Tactical Adjustment", "Ex- Tactical Adjustment · HP +75, ATK +15"],
  ["Any ATK", "Any ATK · Any of the 3 ATK Resonance"],
  ["Random", "Random · Left as rolled, to save materials"], ["None", "None · No resonance"]
];
const ED_BOTTOM_RESONANCES = [
  ["Signature Move", "Signature Move Level +1"], ["QTE", "QTE Level +1"], ["Core Passive", "Core Passive +1"],
  ["Class Skill", "Class Skill Level +1"], ["Ex- Precision Action", "Ex- Precision Action · HP +75, CRIT +15"],
  ["Ex- Enhanced Power", "Ex- Enhanced Power · ATK +15, DEF +23"],
  ["Ex- Precision Attack", "Ex- Precision Attack · ATK +15, CRIT +15"],
  ["Ex- Tactical Adjustment", "Ex- Tactical Adjustment · HP +75, ATK +15"],
  ["Any ATK", "Any ATK · Any of the 3 ATK Resonance"],
  ["Random", "Random · Left as rolled, to save materials"], ["None", "None · No resonance"]
];
// Memory resonances shown up front; the rest sit behind the "Others" button
const ED_UPPER_MAIN = ["Any ATK", "Ex- Enhanced Power", "Ex- Precision Attack", "Ex- Tactical Adjustment"];
const ED_BOTTOM_MAIN = ["Signature Move", "Core Passive", "Class Skill"];
const ED_MATRIX_MAIN = 4, ED_MEMORY_MAIN = 6;
const ED_NEUTRAL = { c1: "#8a8f98", c2: "#101114", cp: "#26282d" };
const ED_ROTATION_HINT = "# Turn 1: Start\nSwap in\nTap Signature\n# Turn 4\nTap Yellow Orb ASAP";
const ED_LEGACY_RESONANCE = { "ALL ATK": "Any ATK", Signature: "Signature Move", Core: "Core Passive", Class: "Class Skill" };

const edChar = name => CATALOG.characters.find(c => c.name === name);
// Memories whose set bonus fits a character, read from the bonus name of each set ("Fire Boost", "Plasma Beam Boost", "Support Boost I"):
// its element first, then its Effect, then its class. Each one maps to { order, label }
const ED_MEMORY_BOOST = new Map(Object.values(MEMORY_TABS).flat().map(([name, boost]) => [name, ` ${boost} `]));
function edMemoryFit(ch) {
  const fit = new Map();
  if (!ch) return fit;
  const [, element = ch.element, cls = ch.class, , effect = ""] = CONSTRUCTS[ch.name] || [];
  const traits = [element, effect, cls].filter(Boolean);
  for (const name of CATALOG.memories) {
    // A signature memory belongs to its own frame, so it never fits another one by element or Effect
    if (SIGNATURE_OWNER[name] && SIGNATURE_OWNER[name] !== ch.name) continue;
    const boost = ED_MEMORY_BOOST.get(name) || "", at = traits.findIndex(trait => boost.includes(` ${trait} `));
    if (at >= 0) fit.set(name, { order: at, label: traits[at] });
  }
  return fit;
}
const edWeaponGroups = Object.values(CATALOG.sharedWeapons);
const edWeaponsFor = name => {
  const owners = edWeaponGroups.find(group => group.includes(name)) || [name];
  return CATALOG.weapons.filter(w => owners.includes(w.owner) && CATALOG.characters.some(c => c.name === w.owner));
};
const edWeaponOptions = name => edWeaponsFor(name).flatMap(w => w.ranks.map(({ rank, art }) =>
  ({ name: w.owner, rank, label: `${w.name} · ${rank}★`, art, info: `${w.owner} · ${w.type}` })));
const edBlankCard = () => ({
  char: "", cub: "", rank: "SS", mem: ["", "", "", "", "", ""],
  memRes: Array.from({ length: 6 }, () => ["Any ATK", "Signature Move"]),
  wh: "", matrix: ["", "", ""], cubSkills: ED_CUB_SKILL_ORDER.slice(), cubOff: ED_CUB_SKILL_ORDER.map(() => false),
  res: "Any ATK", core: "Signature Move", desc: "", rotation: ""
});
const edBlank = () => ({ v: 1, page: "", name: "", order: "", captain: 1, starter: 0, tags: [], cards: ED_BARS.map(edBlankCard) });

// Whatever comes from a link, from storage or from the API passes through here: unknown names are dropped and text is
// cut to size. cleanTeam() of server/team.js does the same to teams sent for review: keep the two alike
function edClean(raw) {
  const r = raw && typeof raw === "object" ? raw : {}, team = edBlank();
  const text = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
  const pick = (value, list, fallback = "") => list.includes(value) ? value : fallback;
  const list = (value, n, options) => Array.from({ length: n }, (_, i) => pick(Array.isArray(value) ? value[i] : "", options));
  const cards = Array.isArray(r.cards) ? r.cards : [], usedChars = new Set();
  const cubs = new Set(CATALOG.characters.map(ch => ch.construct).filter(Boolean));
  return {
    ...team,
    page: pick(r.page, CATALOG.pages.map(p => p.path)),
    name: text(r.name, ED_LIMITS.name),
    order: text(r.order, ED_LIMITS.order),
    captain: pick(r.captain, [0, 1, 2], team.captain),
    starter: pick(r.starter, [0, 1, 2], team.starter),
    tags: ED_TAGS.filter(tag => Array.isArray(r.tags) && r.tags.includes(tag)),
    cards: team.cards.map((blank, i) => {
      const c = cards[i] && typeof cards[i] === "object" ? cards[i] : {};
      let ch = edChar(c.char);
      if (ch && usedChars.has(ch.name)) ch = null;
      if (ch) usedChars.add(ch.name);
      const weaponOptions = ch ? edWeaponOptions(ch.name) : [];
      const weapon = weaponOptions.find(w => w.name === c.weapon && w.rank === c.weaponRank);
      const matrixOptions = edMatrixOptions(ch);
      const legacyUpper = ED_LEGACY_RESONANCE[c.res] || c.res;
      const legacyBottom = ED_LEGACY_RESONANCE[c.core] || c.core;
      const memRes = Array.from({ length: 6 }, (_, slot) => {
        const pair = Array.isArray(c.memRes?.[slot]) ? c.memRes[slot] : [];
        return [
          pick(pair[0], ED_UPPER_RESONANCES.map(([value]) => value), legacyUpper && ED_UPPER_RESONANCES.some(([value]) => value === legacyUpper) ? legacyUpper : blank.memRes[slot][0]),
          pick(pair[1], ED_BOTTOM_RESONANCES.map(([value]) => value), legacyBottom && ED_BOTTOM_RESONANCES.some(([value]) => value === legacyBottom) ? legacyBottom : blank.memRes[slot][1])
        ];
      });
      const cub = c.cub === "" ? "" : cubs.has(c.cub) ? c.cub : ch?.construct || "";
      return {
        char: ch ? ch.name : "",
        cub,
        rank: pick(c.rank, CATALOG.ranks, blank.rank),
        weapon: weapon ? weapon.name : "",
        weaponRank: weapon ? weapon.rank : "",
        mem: list(c.mem, 6, CATALOG.memories),
        memRes,
        wh: pick(c.wh, CATALOG.harmony),
        matrix: list(c.matrix, 3, matrixOptions),
        cubSkills: edSkillOrder(c.cubSkills),
        // Which C.U.B. skills the owner has not unlocked at SSS+, by skill (not by position)
        cubOff: ED_CUB_SKILL_ORDER.map(k => Array.isArray(c.cubOff) && c.cubOff[k] === true),
        res: memRes[0][0],
        core: memRes[0][1],
        desc: text(c.desc, ED_LIMITS.desc),
        rotation: text(c.rotation, ED_LIMITS.rotation)
      };
    })
  };
}

let edDraft = (() => {
  try { return edClean(JSON.parse(localStorage.getItem(EDITOR_KEY))); } catch { return edBlank(); }
})();
const edSave = () => {
  try { localStorage.setItem(EDITOR_KEY, JSON.stringify(edDraft)); } catch { /* storage blocked: the team lasts until the page closes */ }
};

// Share links carry the whole team after #t=, so they need no server
const edEncode = team => btoa(Array.from(new TextEncoder().encode(JSON.stringify(team)), b => String.fromCharCode(b)).join(""))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const edDecode = code => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g, "+").replace(/_/g, "/")), ch => ch.charCodeAt(0))));
// The short link (/editor?s=<code>) is made by /api/share. If it can't be made, the long link above still works
async function edCopyLink() {
  const long = `${location.origin}/editor#t=${edEncode(edDraft)}`;
  const copy = (link, ok) => navigator.clipboard?.writeText(link).then(() => edStatus(ok), () => edStatus(`Copy this link: ${link}`))
    ?? edStatus(`Copy this link: ${link}`);
  if (!edDraft.cards.some(c => c.char)) return copy(long, "Link copied.");
  edStatus("Making the link...");
  const result = await fetch("/api/share", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ team: edDraft }) })
    .then(r => r.json()).catch(() => ({}));
  if (result.code) return copy(`${location.origin}/editor?s=${result.code}`, "Short link copied.");
  const reasons = { links: "Links are not allowed in the texts, so only the long link was made.", limit: "Too many short links made for now, so the long link was copied." };
  copy(long, reasons[result.error] || "The short link is not available right now: the long link was copied.");
}
let edMessage = "";
// A short link names a team stored by the API: it is fetched, and the page draws again once it is here
async function edLoadShared(code) {
  const result = await fetch(`/api/share?c=${code}`).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!result?.team) return edStatus("This team link is broken or has expired. Your saved team is still here.");
  edDraft = edClean(result.team);
  edSave();
  edMessage = "Team loaded from the link.";
  route();
}
function edImport() {
  const shared = new URLSearchParams(location.search).get("s");
  if (/^[a-z0-9]{6,12}$/.test(shared || "")) {
    history.replaceState(null, "", location.pathname);
    pageUrl = location.href;
    edMessage = "Loading the team from the link...";
    edLoadShared(shared);
    return;
  }
  const code = location.hash.match(/^#t=([\w-]+)$/)?.[1];
  if (!code) return;
  try {
    edDraft = edClean(edDecode(code));
    edSave();
    edMessage = "Team loaded from the link.";
  } catch {
    edMessage = "This team link is broken. Your saved team is still here.";
  }
  history.replaceState(null, "", location.pathname);
  pageUrl = location.href;
}

// A rotation is typed as lines: "# Turn name" starts a turn, each other line is a step
function edTurns(text) {
  const turns = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) turns.push({ turn: line.replace(/^#+\s*/, "") || "Turn", steps: [] });
    else {
      if (!turns.length) turns.push({ turn: "Rotation", steps: [] });
      turns.at(-1).steps.push(line);
    }
  }
  return turns.filter(t => t.steps.length);
}
// One slot of the team as a card the site can draw, even while it has no character yet
function edCardView(c, i, team) {
  const ch = edChar(c.char);
  const cub = CATALOG.characters.find(candidate => candidate.construct === c.cub);
  const kit = ch ? (({ skillArt, element, class: cls, signature, ...rest }) => rest)(ch)
    : { name: "", symbol: "", portrait: "", weapon: "", construct: "", skills: [] };
  const role = [i === team.captain && "captain", i === team.starter && "starter"].filter(Boolean).join(" ");
  const turns = edTurns(c.rotation);
  return {
    ...kit, construct: cub?.construct || "", skills: cub ? c.cubSkills.map(index => cub.skills[index] || "") : [],
    skillsOff: cub ? c.cubSkills.map(index => c.cubOff[index]) : [],
    weapon: ch ? edWeaponOptions(ch.name).find(w => w.name === c.weapon && w.rank === c.weaponRank)?.art || "" : "",
    weaponRank: c.weaponRank, bar: ED_BARS[i], role, rank: ch ? `assets/rank/${c.rank}.png` : "",
    memories: c.mem.map((name, slot) => name ? memSet(name)[slot % 3] : ""),
    wh: c.wh, matrix: c.matrix.map(name => name ? WEAPON_RES(name) : ""),
    memoryResonances: c.memRes,
    resonance: ch && c.memRes.every(pair => pair[0] === c.memRes[0][0])
      ? edResonanceArt(ch, c.memRes[0][0]) : "",
    core: ch && c.memRes.every(pair => pair[1] === c.memRes[0][1])
      ? edResonanceArt(ch, c.memRes[0][1]) : "",
    desc: c.desc, rotation: turns.length ? { order: team.order, turns, source: null } : undefined
  };
}
function edResonanceArt(ch, name) {
  const skill = { "Signature Move": "Signature", "Core Passive": "Core", "Class Skill": "Class" }[name] || name;
  return name === "Any ATK" ? CATALOG.allAtk : ch.skillArt[skill] || CATALOG.memoryResonances[name] || "";
}
// The team as the cards the rest of the site draws. Slots without a character are left out
function edCards(team) {
  return team.cards.flatMap((c, i) => edChar(c.char) ? [edCardView(c, i, team)] : []);
}
const edTheme = team => COMPS[(PAGES[team.page] || [])[0]] || ED_NEUTRAL;

/* form pieces, used by the Team box and by the panel a card opens */
const edOptions = (list, value, blank) => (blank === undefined ? "" : `<option value="">${esc(blank)}</option>`) + list.map(item => {
  const [v, label] = Array.isArray(item) ? item : [item, item];
  return `<option value="${esc(v)}"${v === value ? " selected" : ""}>${esc(label)}</option>`;
}).join("");
const edGroupBy = (list, key) => list.reduce((out, item) => ((out[key(item)] ||= []).push(item), out), {});
const edField = (label, control, wide) => `<label class="ed-field${wide ? " wide" : ""}"><span>${label}</span>${control}</label>`;
const edSelect = (name, options) => `<select name="${name}">${options}</select>`;

const edShortName = card => card.char ? card.char.split(":")[0] : "";
const ED_ORDER_SEP = " → ";
// The rotation order is kept as text ("Teddy → Lucia → Teddy"), the same text the site shows; the chips just edit it
const edOrderTokens = order => order.split("→").map(t => t.trim()).filter(Boolean);
function edOrderBody(team) {
  const tokens = edOrderTokens(team.order);
  const slotOf = token => team.cards.findIndex(c => edShortName(c) === token);
  const chips = tokens.map((token, n) => {
    const i = slotOf(token), ch = i >= 0 ? edChar(team.cards[i].char) : null;
    return `<button type="button" class="ed-order-chip ed-${ED_BARS[Math.max(i, 0)]}" data-ed-order-remove="${n}" aria-label="Remove ${esc(token)} (step ${n + 1})"${tipAttr(token, "Click to remove")}>
      <b>${n + 1}</b>${ch ? pic(ch.portrait) : ""}<span>${esc(token)}</span></button>`;
  }).join(`<i class="ed-order-arrow" aria-hidden="true">→</i>`);
  const adds = team.cards.map((c, i) => {
    const ch = edChar(c.char);
    return `<button type="button" class="ed-order-add ed-${ED_BARS[i]}" data-ed-order-add="${i}"${ch ? "" : " disabled"}
      aria-label="Add ${esc(ch ? edShortName(c) : `${ED_SLOTS[i]} slot`)} to the rotation"${tipAttr(ch ? edShortName(c) : "", "Add to the rotation")}>
      ${ch ? pic(ch.portrait) : `<span class="ed-order-empty" aria-hidden="true">+</span>`}<span>${esc(ch ? edShortName(c) : ED_SLOTS[i])}</span></button>`;
  }).join("");
  return `<div class="ed-order-line" aria-live="polite">${chips || `<span class="ed-order-hint">Tap a character below to build the order they swap in.</span>`}</div>
    <div class="ed-order-bar"><div class="ed-order-adds">${adds}</div>
    <button type="button" class="ed-order-tool" data-ed-order-undo${tokens.length ? "" : " disabled"}>↶ Undo</button>
    <button type="button" class="ed-order-tool" data-ed-order-clear${tokens.length ? "" : " disabled"}>Clear</button></div>`;
}
function edPageBody(team) {
  const dir = kind => kind === "Energy" ? "energy-type" : "effects";
  return Object.entries(edGroupBy(CATALOG.pages, p => p.kind)).map(([kind, list]) => `<div class="ed-page-group">
    <small>${esc(kind)}</small><div class="ed-page-options">${list.map(p => `<button type="button" class="ed-page-option${p.path === team.page ? " on" : ""}"
      data-ed-page="${esc(p.path)}" aria-pressed="${p.path === team.page}"${tipAttr(p.name, kind)}>${menuIcon(dir(kind), p.name)}<span>${esc(p.name)}</span></button>`).join("")}</div></div>`).join("");
}
const edTagsBody = team => ED_TAGS.map(tag => `<button type="button" class="ed-tag${team.tags.includes(tag) ? " on" : ""}"
  data-ed-tag="${tag}" aria-pressed="${team.tags.includes(tag)}">${tag}</button>`).join("");
// Leader and Starter list the characters by name, so this part is drawn again when a character changes
function edRolesBody(team) {
  const picks = [0, 1, 2].map(i => [String(i), edShortName(team.cards[i]) || `${ED_SLOTS[i]} slot`]);
  return `<h2 class="ed-team-heading">Battle positions</h2>
      ${edField("Leader", edSelect("captain", edOptions(picks, String(team.captain))))}
      ${edField("Starter", edSelect("starter", edOptions(picks, String(team.starter))))}`;
}
function edTeamBody(team) {
  return `<legend>Team</legend><div class="ed-team-layout">
    <section class="ed-team-info" aria-label="Team details">
      <label class="ed-team-name"><span>Team name</span>
        <input name="name" maxlength="${ED_LIMITS.name}" value="${esc(team.name)}" placeholder="Rosetta Darkflow" autocomplete="off"></label>
      <div class="ed-team-block"><h2 class="ed-team-heading">Tags</h2><div id="edTags" class="ed-tags">${edTagsBody(team)}</div></div>
      <div class="ed-team-block"><h2 class="ed-team-heading">Page</h2>
        <input type="hidden" name="page" value="${esc(team.page)}"><div id="edPageChoice" class="ed-page-groups">${edPageBody(team)}</div></div>
      <div class="ed-team-block"><h2 class="ed-team-heading">Team rotation</h2>
        <input type="hidden" name="order" value="${esc(team.order)}"><div id="edOrder">${edOrderBody(team)}</div></div>
    </section>
    <div class="ed-team-side">
      <section id="edRoles" class="ed-team-roles" aria-label="Battle positions">${edRolesBody(team)}</section>
      <section class="ed-team-actions" aria-label="Share and send">
        <h2 class="ed-team-heading">Share</h2>
        <button type="button" class="tool ed-primary" data-ed="send">Submit for review</button>
        <button type="button" class="tool" data-ed="link">Copy link</button>
        <button type="button" class="tool" data-export>Export image</button>
        <button type="button" class="tool ed-danger" data-ed="reset">Start over</button>
        <div id="edSend" class="ed-send" hidden>
          <p class="ed-hint">Your team goes to a review queue. Once approved, it shows up on its page as a community build.</p>
          <label class="ed-field"><span>Your name · optional</span><input id="edAuthor" maxlength="32" autocomplete="off"></label>
          <label class="ed-trap" aria-hidden="true">Website<input id="edWebsite" tabindex="-1" autocomplete="off"></label>
          <div id="edCaptcha"></div>
          <button type="button" class="tool ed-primary" data-ed="confirm" disabled>Send team</button>
        </div>
      </section>
    </div>
  </div>`;
}
// Reads the form back into a team. Fields the page doesn't show right now keep what the team had
function edRead(form) {
  const value = (key, old) => form.elements[key] ? form.elements[key].value : old;
  const radio = (key, old) => form.elements[key]?.value === "" ? old : Number(form.elements[key]?.value ?? old);
  return edClean({
    page: value("page", edDraft.page), name: value("name", edDraft.name), order: value("order", edDraft.order),
    captain: radio("captain", edDraft.captain), starter: radio("starter", edDraft.starter), tags: edDraft.tags,
    cards: edDraft.cards.map((c, i) => {
      const v = (key, old) => value(`c${i}.${key}`, old);
      return { char: c.char, cub: c.cub, rank: v("rank", c.rank), wh: v("wh", c.wh), res: c.res, core: c.core,
        desc: v("desc", c.desc), rotation: v("rotation", c.rotation),
        mem: c.mem.slice(), memRes: c.memRes.map(pair => pair.slice()), matrix: c.matrix.slice(),
        cubSkills: c.cubSkills.slice(), cubOff: c.cubOff.slice() };
    })
  });
}

/* searchable icon choices for each equipment slot */
const edMemInfo = name => MEMORY_EFFECTS[name] ? memoryInfo(name) : "";
let edPickerTarget = null;
let edCubSkillPick = null;

const ED_RES_SKILL_KEYS = { "Red Orb": "Red Orb", "Yellow Orb": "Yellow Orb", "Blue Orb": "Blue Orb", "Basic Attack": "Basic Attack",
  "Signature Move": "Signature", "QTE": "QTE", "Core Passive": "Core", "Class Skill": "Class" };
const edMemResArt = (ch, name) => name === "Any ATK" ? CATALOG.allAtk : ch?.skillArt?.[ED_RES_SKILL_KEYS[name]] || CATALOG.memoryResonances[name]
  || (!ch && name === "Basic Attack" ? ED_BASIC_ATTACK_ART : ED_BLANK_RESONANCE);
function edPickerOptions(kind, i, side) {
  const c = edDraft.cards[i];
  const ch = edChar(c.char);
  if (kind === "char") {
    // With a team page chosen, its element (or Derivative Effect) decides who is up front; the rest wait behind "Others"
    const page = CATALOG.pages.find(p => p.path === edDraft.page);
    const fits = character => !page || (page.kind === "Energy" ? character.element === page.name : (CONSTRUCTS[character.name]?.[4] || "") === page.name);
    return CATALOG.characters.map(character => ({
      value: character.name, label: character.name, art: character.portrait,
      info: [character.element, character.class].filter(Boolean).join(" · "), more: !fits(character)
    })).sort((a, b) => (CONSTRUCTS[b.value]?.[0] ?? 0) - (CONSTRUCTS[a.value]?.[0] ?? 0)); // newest first
  }
  // What puts a memory up front for this character: its signature, a bonus that fits it, or being in a build of this team or of the site
  const edUpFront = () => {
    const signatures = new Map();
    if (ch?.signature) signatures.set(ch.signature, edShortName(c));
    return { signatures, worn: edMemoryUse(c.char), fit: edMemoryFit(ch), inDraft: new Set(edDraft.cards.flatMap(card => [...card.mem, card.wh].filter(Boolean))) };
  };
  if (kind === "mem") {
    // This character's signature memory comes first, then the memories the site's builds of this character use most
    const { signatures, worn, fit } = edUpFront();
    const rank = name => signatures.has(name) ? [0, [...signatures.keys()].indexOf(name)] : worn.has(name) ? [1, -worn.get(name)]
      : fit.has(name) ? [2, fit.get(name).order] : [3, 0];
    const list = CATALOG.memories.map((name, index) => ({
      value: name, label: name, art: MEM_INDEX.get(name).ext ? memFile(name, "1-4") : "",
      info: (signatures.has(name) ? `Signature memory of ${signatures.get(name)}\n\n` : "") + edMemInfo(name),
      badge: signatures.has(name) ? "Signature" : worn.has(name) ? `In ${worn.get(name)} build${worn.get(name) > 1 ? "s" : ""}` : "",
      fit: fit.get(name)?.label || "", order: [...rank(name), index]
    })).sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.order[2] - b.order[2]);
    // Up front: this character's signature, memories already in this team, the few the site's builds of this character use most,
    // and every memory whose bonus fits the character. With no character picked, the first few of the list
    const inDraft = new Set(edDraft.cards.flatMap(card => card.mem.filter(Boolean)));
    let shown = 0;
    list.forEach(option => {
      const name = option.value;
      option.more = !(signatures.has(name) || inDraft.has(name) || fit.has(name) || ((worn.has(name) || !ch) && shown++ < ED_MEMORY_MAIN));
    });
    return list;
  }
  // The catalog lists frames oldest first; C.U.B.s are picked newest first
  if (kind === "cub") {
    // Like the memories: the C.U.B.s of the character's element up front, the rest (even other frames' signatures) behind "Others".
    // Lingya always stays up front, for its exclusive orb generation. A C.U.B. goes on one character only, so those on other cards are left out
    return CATALOG.characters.filter((character, at, all) => character.construct && all.findIndex(other => other.construct === character.construct) === at
      && !edDraft.cards.some((card, k) => k !== i && card.cub === character.construct)).reverse().map(character => ({
      value: character.construct, label: iconName(character.construct), art: character.construct, info: `${character.name}'s C.U.B.`,
      more: !!ch && character.element !== ch.element && !character.construct.includes("/lingya/")
    }));
  }
  if (kind === "rank") return CATALOG.ranks.map(rank => ({ value: rank, label: rank, art: `assets/rank/${rank}.png` }));
  if (kind === "weapon") return edWeaponOptions(c.char).map(option => ({
    value: `${option.name}::${option.rank}`, label: option.label, art: option.art, info: option.info, stars: option.rank
  }));
  if (kind === "mx") return edMatrixChoices(ch);
  if (kind === "memres") {
    const options = side === "bottom" ? ED_BOTTOM_RESONANCES : ED_UPPER_RESONANCES;
    const main = side === "bottom" ? ED_BOTTOM_MAIN : ED_UPPER_MAIN;
    // The subtext is what tells apart skills that share an icon, so it is shown under the name, not only in the tooltip
    return options.map(([name, info]) => ({
      value: name, label: name, art: edMemResArt(ch, name), info, more: !main.includes(name),
      sub: info.replace(name, "").replace(/^[\s·]+/, "") || info
    }));
  }
  if (kind === "wh") {
    // Same rule as the memories: only the signature, the ones of the same element or Effect and those in use stay up front. The rest wait behind "Others"
    const { signatures, worn, fit, inDraft } = edUpFront();
    return CATALOG.harmony.map(name => ({
      value: name, label: name, art: memFile(name, "WH", "png"),
      info: (signatures.has(name) ? `Signature memory of ${signatures.get(name)}

` : "") + edMemInfo(name),
      badge: signatures.has(name) ? "Signature" : worn.has(name) ? `In ${worn.get(name)} build${worn.get(name) > 1 ? "s" : ""}` : "",
      more: !(signatures.has(name) || fit.has(name) || worn.has(name) || inDraft.has(name))
    }));
  }
  return [];
}
function edPickerCurrent(kind, c, slot, side) {
  if (kind === "char") return c.char;
  if (kind === "cub") return c.cub;
  if (kind === "rank") return c.rank;
  if (kind === "weapon") return c.weapon ? `${c.weapon}::${c.weaponRank}` : "";
  if (kind === "mem") return c.mem[slot];
  if (kind === "mx") return c.matrix[slot];
  if (kind === "memres") return c.memRes[slot][side === "bottom" ? 1 : 0];
  if (kind === "wh") return c.wh;
  return "";
}
const ED_PICKER_LABELS = {
  char: "Character", cub: "C.U.B.", rank: "Rank", weapon: "Weapon", mem: "Memory",
  mx: "Weapon resonance", memres: "Memory resonance", wh: "Weapon Harmony"
};
function edPositionPicker(picker, stage, anchor) {
  const bounds = stage.getBoundingClientRect(), rect = anchor.getBoundingClientRect();
  const width = Math.max(1, Math.min(440, stage.clientWidth - 16));
  const left = Math.max(8, Math.min(rect.left - bounds.left, stage.clientWidth - width - 8));
  const anchorBottom = rect.bottom - bounds.top, gap = 6;
  // Always opens below the icon, like every menu: the C.U.B. sits at the bottom of its card, where the stage ends, and the menu
  // simply runs over what follows (the stage does not clip it)
  picker.style.width = `${width}px`;
  picker.style.left = `${left}px`;
  picker.style.maxHeight = `${Math.min(window.innerHeight * .7, 500)}px`;
  picker.style.top = `${anchorBottom + gap}px`;
}
function edShowPicker(kind, i, slot, side, anchor) {
  const picker = $("#edPicker"), stage = $("#edStage");
  if (!picker || !stage) return;
  clearTimeout(edTimer);
  edTimer = 0;
  picker.className = "ed-picker";
  picker.classList.remove("ed-res-menu");
  const c = edDraft.cards[i], options = edPickerOptions(kind, i, side);
  const current = edPickerCurrent(kind, c, slot, side);
  const title = kind === "memres"
    ? `${ED_SLOTS[i]} · Memory ${slot + 1} · ${side === "bottom" ? "Bottom" : "Upper"} resonance`
    : `${ED_SLOTS[i]} · ${kind === "mem" ? `Memory ${slot + 1}` : ED_PICKER_LABELS[kind]}`;
  const choices = [
    ...(kind === "char" || kind === "mem" || kind === "cub" || kind === "weapon" || kind === "mx" || kind === "wh"
      ? [{ value: "", label: "None" }] : []),
    ...options
  ];
  edPickerTarget = { kind, card: i, slot, side };
  const split = edMoreSplit(choices, current, kind === "char");
  picker.innerHTML = `<div class="ed-picker-head"><strong>${esc(title)}</strong><small>Choose an icon</small></div>
    <button type="button" class="ed-picker-close" data-ed-picker-close aria-label="Close">×</button>
    <input id="edPickerSearch" type="search" placeholder="Search ${esc(ED_PICKER_LABELS[kind])}" aria-label="Search ${esc(ED_PICKER_LABELS[kind])}" autocomplete="off">
    <div id="edPickerOptions" class="ed-picker-options" role="group" aria-label="${esc(title)} options">
      ${split.ordered.map(option => `<button type="button" class="ed-picker-option${option.value === current ? " on" : ""}${option.badge ? " hot" : option.fit ? " fit" : ""}${option.more ? " more" : ""}"${option.more && !split.open ? " hidden" : ""}
        data-ed-picker-value="${esc(option.value)}" data-ed-picker-search="${esc(`${option.label} ${option.info || ""}`.toLowerCase())}"
        aria-pressed="${option.value === current}"${tipAttr(option.label, option.info || "")}>
        ${option.badge || option.fit ? `<em class="ed-badge">${esc(option.badge || option.fit)}</em>` : ""}
        ${option.art ? pic(option.art) : `<span class="ed-picker-noart" aria-hidden="true">×</span>`}${option.stars ? starOverlay(Number(option.stars)) : ""}<span>${esc(option.label)}</span></button>`).join("")}
      ${edMoreButton(split.count, split.open)}
    </div><p class="ed-picker-empty" hidden>No options match this search.</p>`;
  picker.querySelectorAll("img").forEach(img => { img.draggable = false; });
  picker.hidden = false;
  edPositionPicker(picker, stage, anchor);
  picker.querySelector("#edPickerSearch")?.focus({ preventScroll: true });
}
// A resonance as a row button shows it: its icon and its name
const ED_RES_FAINT = ["Random", "None"]; // resonances that matter little: shown dimmed
let edApplyAll = { top: false, bottom: false };
const edResChip = (ch, name) => `<span class="ed-res-chip${ED_RES_FAINT.includes(name) ? " faint" : ""}">${pic(edMemResArt(ch, name))}<span>${esc(name)}</span></span>`;
// One resonance chosen in the menu. With "apply to all" on for that side, the six memories of the card take it
function edSetMemRes(card, slot, side, value) {
  const c = edDraft.cards[card], at = side === "bottom" ? 1 : 0;
  if (edApplyAll[side === "bottom" ? "bottom" : "top"]) c.memRes.forEach(pair => { pair[at] = value; });
  else c.memRes[slot][at] = value;
  c.res = c.memRes[0][0];
  c.core = c.memRes[0][1];
}
function edShowResonanceMenu(i, anchor, selectedSlot = -1, side = "") {
  const picker = $("#edPicker"), stage = $("#edStage");
  if (!picker || !stage || !anchor) return;
  clearTimeout(edTimer);
  edTimer = 0;
  const c = edDraft.cards[i], ch = edChar(c.char), choosing = selectedSlot >= 0;
  const options = choosing ? edPickerOptions("memres", i, side) : [];
  const current = choosing ? c.memRes[selectedSlot][side === "bottom" ? 1 : 0] : "";
  const split = edMoreSplit(options, current);
  edPickerTarget = { kind: "memresmenu", card: i, slot: selectedSlot, side };
  anchor.setAttribute("aria-expanded", "true");
  picker.className = `ed-picker ed-res-menu${choosing ? " has-options" : ""}`;
  picker.innerHTML = `<div class="ed-picker-head"><strong>${ED_SLOTS[i]} · Memory resonances</strong><small>Choose a memory and resonance side</small></div>
    <button type="button" class="ed-picker-close" data-ed-picker-close aria-label="Close">×</button>
    <div class="ed-res-menu-list">${c.memRes.map(([upper, bottom], slot) => `<section class="ed-res-menu-row">
      <strong>Memory ${slot + 1}</strong>
      <button type="button" data-ed-mem-side="top" data-ed-mem-slot="${slot}" aria-pressed="${choosing && selectedSlot === slot && side === "top"}" aria-label="Memory ${slot + 1}, Upper resonance">
        <small>UPPER</small>${edResChip(ch, upper)}</button>
      <button type="button" data-ed-mem-side="bottom" data-ed-mem-slot="${slot}" aria-pressed="${choosing && selectedSlot === slot && side === "bottom"}" aria-label="Memory ${slot + 1}, Bottom resonance">
        <small>BOTTOM</small>${edResChip(ch, bottom)}</button>
    </section>`).join("")}</div>`;
  if (choosing) picker.insertAdjacentHTML("beforeend", `<div class="ed-res-menu-options">
    <div class="ed-res-menu-choice-head"><strong>Memory ${selectedSlot + 1} · ${side === "bottom" ? "Bottom" : "Upper"} resonance</strong>
      <label class="ed-res-menu-all"><input type="checkbox" data-ed-apply-all="${side === "bottom" ? "bottom" : "top"}"${edApplyAll[side === "bottom" ? "bottom" : "top"] ? " checked" : ""}> Apply to all 6</label></div>
    <div class="ed-picker-options" role="group" aria-label="Memory ${selectedSlot + 1}, ${side === "bottom" ? "Bottom" : "Upper"} resonance options">
      ${split.ordered.map(option => `<button type="button" class="ed-picker-option${option.value === current ? " on" : ""}${option.more ? " more" : ""}"${option.more && !split.open ? " hidden" : ""}
        data-ed-memres-value="${esc(option.value)}" aria-pressed="${option.value === current}"${tipAttr(option.label, option.info || "")}>
        ${option.art ? pic(option.art) : `<span class="ed-picker-noart" aria-hidden="true">×</span>`}<span>${esc(option.label)}</span>${option.sub ? `<small>${esc(option.sub)}</small>` : ""}</button>`).join("")}
      ${edMoreButton(split.count, split.open)}
    </div></div>`);
  picker.querySelectorAll("img").forEach(img => { img.draggable = false; });
  picker.hidden = false;
  edPositionPicker(picker, stage, anchor);
}
function edFilterPicker(query) {
  const term = query.trim().toLowerCase();
  let visible = 0;
  const more = $("#edPickerOptions [data-ed-more]"), expanded = more?.getAttribute("aria-expanded") === "true";
  // Searching looks through every option; with no search, the "Others" ones follow the button
  $("#edPickerOptions")?.querySelectorAll(".ed-picker-option").forEach(option => {
    const matches = option.dataset.edPickerSearch.includes(term);
    option.hidden = term ? !matches : option.classList.contains("more") && !expanded;
    if (matches) visible++;
  });
  if (more) more.hidden = !!term;
  const empty = $(".ed-picker-empty");
  if (empty) empty.hidden = visible > 0;
}
function edResonanceSummary(values) {
  const counts = new Map();
  values.forEach(name => counts.set(name, (counts.get(name) || 0) + 1));
  return [...counts].map(([name, count]) => `${count}× ${name}`).join(" · ");
}

/* stage: the three cards as the site draws them, with every icon slot an editor target */
function edStageBody() {
  const theme = edTheme(edDraft), views = edDraft.cards.map((c, i) => edCardView(c, i, edDraft));
  shownTeam = { id: "", title: edDraft.name.trim() || "Untitled team", cards: edCards(edDraft), theme };
  // #compBox is what the sliding cards measure, as on team pages
  return `<div id="compBox">${pager(views)}<section class="comp ed-live" style="--c1:${theme.c1};--c2:${theme.c2};--cp:${theme.cp}">${views.map(card).join("")}</section></div><div id="edPicker" class="ed-picker" hidden></div>`;
}
function edSetDetailWidth() {
  $("#edStage")?.classList.toggle("ed-sliding", isSliding());
  const card = $("#edStage .comp .card"), detail = $("#edDetail");
  if (card && detail) detail.style.setProperty("--ed-slide-width", `${card.offsetWidth}px`);
}
function edBeltIndex(belt) {
  const middle = belt.scrollLeft + belt.clientWidth / 2;
  return [...belt.children].reduce((best, item, i) => {
    const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
    return distance < best.distance ? { index: i, distance } : best;
  }, { index: 0, distance: Infinity }).index;
}
function edSyncDetailBelt(source) {
  if (!matchMedia("(max-width:600px)").matches) return;
  const target = source.matches("#edDetail") ? $("#edStage .comp") : $("#edDetail");
  if (!target) return;
  if (!source.children.length || source.children.length !== target.children.length) return;
  const active = edBeltIndex(source);
  const item = target.children[active];
  const left = item.offsetLeft + item.offsetWidth / 2 - target.clientWidth / 2;
  if (Math.abs(target.scrollLeft - left) > 1) target.scrollLeft = left;
}
let edBeltTouch = null;
$("#main").addEventListener("touchstart", e => {
  const belt = e.target.closest?.("#edStage .comp, #edDetail");
  if (!belt || e.touches.length !== 1 || e.target.closest("input,textarea,select,button,a")) return;
  edBeltTouch = { belt, index: edBeltIndex(belt), x: e.touches[0].clientX, y: e.touches[0].clientY, horizontal: false };
}, { passive: true });
$("#main").addEventListener("touchmove", e => {
  if (!edBeltTouch || e.touches.length !== 1) return;
  const dx = e.touches[0].clientX - edBeltTouch.x, dy = e.touches[0].clientY - edBeltTouch.y;
  if (!edBeltTouch.horizontal && Math.abs(dx) < 8) return;
  if (Math.abs(dx) <= Math.abs(dy)) return;
  edBeltTouch.horizontal = true;
  e.preventDefault();
}, { passive: false });
const edEndBeltTouch = e => {
  const touch = edBeltTouch;
  edBeltTouch = null;
  if (!touch?.horizontal) return;
  const end = e.changedTouches[0]?.clientX;
  if (end === undefined || Math.abs(end - touch.x) < 36) return;
  const step = end < touch.x ? 1 : -1;
  const target = touch.belt.children[Math.max(0, Math.min(touch.index + step, touch.belt.children.length - 1))];
  if (target) touch.belt.scrollTo({
    left: target.offsetLeft + target.offsetWidth / 2 - touch.belt.clientWidth / 2,
    behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth"
  });
};
$("#main").addEventListener("touchend", edEndBeltTouch, { passive: true });
$("#main").addEventListener("touchcancel", () => { edBeltTouch = null; }, { passive: true });
const edDetailSizer = new ResizeObserver(edSetDetailWidth);
// The cards come out of card() as the site shows them; links and native image dragging are disabled for editing.
function edWire() {
  const stage = $("#edStage");
  if (!stage) return;
  const comp = $(".comp", stage);
  edDetailSizer.disconnect();
  if (comp) edDetailSizer.observe(comp);
  edSetDetailWidth();
  stage.querySelectorAll("a[href]").forEach(a => a.removeAttribute("href"));
  stage.querySelectorAll("img").forEach(img => { img.draggable = false; });
  stage.querySelectorAll(".card").forEach((el, i) => {
    el.dataset.edCard = i;
    el.removeAttribute("tabindex");
    el.removeAttribute("role");
    el.setAttribute("aria-label", `Edit the ${ED_SLOTS[i]} slot`);
    const mark = (node, drop, slot, side) => {
      if (!node) return;
      node.dataset.edDrop = drop;
      if (slot !== undefined) node.dataset.edSlot = slot;
      if (side) node.dataset.edSide = side;
      node.draggable = false;
      node.tabIndex = 0;
      node.setAttribute("role", "button");
      const labels = { char: "character", rank: "rank", weapon: "weapon", wh: "Weapon Harmony",
          mem: `Memory ${Number(slot) + 1}`, mx: `Weapon resonance ${Number(slot) + 1}`, cub: "C.U.B.",
          cubskill: `C.U.B. skill ${Number(slot) + 1}` };
      // An accessible name has to include the text the slot shows (an empty slot shows "Construct", a weapon its name)
      const shown = node.textContent.trim().replace(/\s+/g, " ");
      node.setAttribute("aria-label", `${shown ? `${shown}, ` : ""}${labels[drop]} selector`);
      node.title = `Choose ${labels[drop]}`;
      if (drop === "mem" || drop === "mx") node.title += ". Drag it onto another slot of this card to swap them";
    };
    const c = edDraft.cards[i], cardMemories = $(".mem", el);
    const memoryGroup = document.createElement("div");
    memoryGroup.className = "ed-memory-group";
    cardMemories.before(memoryGroup);
    memoryGroup.insertAdjacentHTML("beforeend", `<button type="button" class="ed-memory-resonance-button" data-ed-memres-menu="${i}"
      aria-haspopup="dialog" aria-controls="edPicker" aria-expanded="false">Memory Resonances</button>`);
    memoryGroup.append(cardMemories);
    mark($(".portrait", el), "char");
    if (c.char) $(".portrait", el).title = "Choose character, or drag it onto another card to swap positions";
    mark($(".rank", el), "rank");
    const wp = el.querySelectorAll(".wp > .slot"), ch = edChar(c.char);
    if (ch && edWeaponOptions(ch.name).length) mark(wp[0], "weapon");
    else if (!ch) mark(wp[0], "char");
    mark(wp[1], "wh");
    el.querySelectorAll(".mem .slot").forEach((s, k) => {
      mark(s, "mem", k);
      s.setAttribute("aria-label", `Memory ${k + 1}`);
    });
    el.querySelectorAll(".mx .slot").forEach((s, k) => mark(s, "mx", k));
    const res = $(".res", el);
    res.innerHTML = `<div class="ed-res-total"><small>Upper · 6</small><span>${esc(edResonanceSummary(c.memRes.map(pair => pair[0])))}</span></div>
      <div class="ed-res-total"><small>Bottom · 6</small><span>${esc(edResonanceSummary(c.memRes.map(pair => pair[1])))}</span></div>`;
    const cubSlot = $(".kit > .slot", el);
    mark(cubSlot, "cub");
    const cub = CATALOG.characters.find(candidate => candidate.construct === c.cub);
    el.querySelectorAll(".kit > .cell > .slot").forEach((skill, k) => {
      if (!cub?.skills.length) return;
      mark(skill, "cubskill", k);
      skill.dataset.edCubSkillIndex = k;
      skill.setAttribute("aria-pressed", String(edCubSkillPick?.card === i && edCubSkillPick.index === k));
      skill.classList.toggle("ed-cub-skill-selected", edCubSkillPick?.card === i && edCubSkillPick.index === k);
      skill.title = `C.U.B. skill ${k + 1}. Drag it onto another skill to swap positions, or click it twice to grey it out (not unlocked).`;
    });
    el.querySelectorAll(".tag.captain,.tag.starter").forEach(tag => {
      const roleName = tag.classList.contains("captain") ? "captain" : "starter";
      tag.dataset.edRole = roleName;
      tag.title = `Drag to move ${roleName === "captain" ? "Leader" : "Starter"} to another position`;
    });
    // Swapping two positions: one button on each edge two cards share, or on phones, where one card shows at a time, arrows inside it
    if (i < ED_BARS.length - 1) el.insertAdjacentHTML("beforeend", `<button type="button" class="ed-swap" data-ed-move="${i}" data-ed-to="${i + 1}"
      aria-label="Swap ${ED_SLOTS[i]} and ${ED_SLOTS[i + 1]}" title="Swap ${ED_SLOTS[i]} and ${ED_SLOTS[i + 1]}, with their equipment">⇄</button>`);
    el.insertAdjacentHTML("beforeend", `<div class="ed-move">${[i - 1, i + 1].filter(to => ED_BARS[to]).map(to => `<button type="button"
      class="ed-move-${to < i ? "left" : "right"}" data-ed-move="${i}" data-ed-to="${to}" aria-label="Move to ${ED_SLOTS[to]}"
      title="Move to ${ED_SLOTS[to]}, with the equipment">${to < i ? "‹" : "›"}</button>`).join("")}</div>`);
    res.setAttribute("aria-label", `Memory resonances. Upper: ${edResonanceSummary(c.memRes.map(pair => pair[0]))}. Bottom: ${edResonanceSummary(c.memRes.map(pair => pair[1]))}.`);
  });
}
// On phones the cards slide: drawing them again keeps the one on screen, or shows "follow" (where a card just moved)
function edRender(follow) {
  const stage = $("#edStage");
  if (!stage) return;
  const at = follow ?? ($(".comp", stage) && isSliding() ? activeSlide() : 0);
  // The cards grow with their rotation and notes. When the person is working in the boxes below them (adding steps, typing),
  // the page scrolls by the same amount, so what they are using stays where it was instead of sliding away
  const detail = $("#edDetail"), seen = () => detail?.getBoundingClientRect();
  const before = seen(), working = before && before.top < innerHeight && before.bottom > 0 && before.top > stage.getBoundingClientRect().top;
  stage.innerHTML = edStageBody();
  edWire();
  edPaint();
  const box = $(".comp", stage), card = box?.children[at];
  if (at > 0 && card && isSliding()) box.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - box.clientWidth / 2;
  const moved = working ? seen().top - before.top : 0;
  if (moved) scrollBy(0, moved);
}
// Moves a whole position, character and equipment, to another slot. Leader and Starter stay with their characters
function edMoveCard(from, to) {
  if (from === to || !edDraft.cards[from] || !edDraft.cards[to]) return;
  [edDraft.cards[from], edDraft.cards[to]] = [edDraft.cards[to], edDraft.cards[from]];
  for (const field of ["captain", "starter"]) {
    if (edDraft[field] === from) edDraft[field] = to;
    else if (edDraft[field] === to) edDraft[field] = from;
  }
  edDraft = edClean(edDraft);
  edSave();
  edPickerTarget = null;
  edCubSkillPick = null;
  edRender(to);
  $("#edRoles").innerHTML = edRolesBody(edDraft);
  $("#edOrder").innerHTML = edOrderBody(edDraft);
  $("#edDetail").innerHTML = edDetailBody();
  edStatus(`${ED_SLOTS[from]} and ${ED_SLOTS[to]} swapped, with their equipment.`);
}
function edPaint() {
  const c = edTheme(edDraft);
  $("#main").style.background = edDraft.page ? `linear-gradient(180deg, ${c.c1}38 0%, ${c.c2}1f 100%), var(--bg)` : "";
  const exportButton = $("#main [data-export]");
  if (exportButton) exportButton.disabled = !edCards(edDraft).length;
}
let edTimer = 0;
function edRefresh(now) {
  clearTimeout(edTimer);
  if (now) edRender();
  else edTimer = setTimeout(edRender, 150);
}
// Messages show as a toast at the bottom of the screen, so they are seen wherever the page is scrolled. Each fades after a while
let edStatusTimer = 0;
const edStatus = text => {
  const box = $("#edStatus");
  if (!box) return;
  clearTimeout(edStatusTimer);
  box.textContent = text;
  box.classList.toggle("on", !!text);
  if (text) edStatusTimer = setTimeout(() => box.classList.remove("on"), 7000);
};

/* Rotation builder. The rotation stays the text of the position ("# Turn" lines and one step per line); the buttons read and write
   that text, so links, saving, sending and the cards need nothing else. A step is "Tap X", "Hold X" or the move alone, plus " 2x" */
const edRotText = turns => turns.map(t => [...(t.name === null ? [] : [`# ${t.name}`]), ...t.steps].join("\n")).join("\n");
function edRotParse(text) {
  const turns = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) turns.push({ name: line.replace(/^#+\s*/, ""), steps: [] });
    else {
      if (!turns.length) turns.push({ name: null, steps: [] });
      turns.at(-1).steps.push(line);
    }
  }
  return turns;
}
// A step written the standard way, or null for a free step
function edStepParse(text) {
  for (const move of ROTATION_MOVES) {
    const hit = text.match(new RegExp(`^${move.press ? "(Tap|Hold) " : "()"}${move.name}(?: (\\d+)x)?$`));
    if (hit) return { move, hold: hit[1] === "Hold", count: Number(hit[2]) || 1 };
  }
  return null;
}
const edStepText = ({ move, hold, count }) => `${move.press ? (hold ? "Hold " : "Tap ") : ""}${move.name}${count > 1 ? ` ${count}x` : ""}`;
const ED_ROT_GROUPS = [["Attacks", ["Basic Attack", "Signature", "QTE"]], ["Orbs", ["1st Orb", "Red Orb", "Yellow Orb", "Blue Orb"]],
  ["Actions", ["Swap in", "Swap out", "Dodge"]]];
let edRotActive = [null, null, null]; // the turn each position adds its next step to
let edTab = ["notes", "notes", "notes"];
const edRotIcon = (ch, text) => rotationIcon(ch?.name, text);
function edRotPalette(i) {
  const ch = edChar(edDraft.cards[i].char);
  return ED_ROT_GROUPS.map(([label, names]) => `<div class="ed-rot-group"><small>${label}</small><div>${names.map(name => {
    const move = ROTATION_MOVES.find(m => m.name === name);
    return `<button type="button" class="ed-rot-move" data-rot-act="add" data-rot-i="${i}" data-rot-move="${esc(name)}" aria-label="Add ${esc(name)}">
      ${edRotIcon(ch, move.word) || `<span class="ed-rot-glyph" aria-hidden="true">+</span>`}<span>${esc(name)}</span></button>`;
  }).join("")}</div></div>`).join("");
}
// The turns and steps, redrawn on every change; the palette and the text box around it stay where they are
function edRotTurnsBody(i) {
  const c = edDraft.cards[i], ch = edChar(c.char), turns = edRotParse(c.rotation);
  const active = Math.min(edRotActive[i] ?? turns.length - 1, turns.length - 1);
  const btn = (act, t, s, label, inner, extra = "") => `<button type="button" class="ed-rot-btn" data-rot-act="${act}" data-rot-i="${i}" data-rot-t="${t}" data-rot-s="${s}" aria-label="${label}"${extra}>${inner}</button>`;
  const body = turns.map((turn, t) => `<section class="ed-rot-turn${t === active ? " on" : ""}">
    <div class="ed-rot-turn-head">${turn.name === null ? `<span>Steps</span>` : `<input class="ed-rot-name" data-rot-name data-rot-i="${i}" data-rot-t="${t}" value="${esc(turn.name)}" maxlength="60" aria-label="Turn name" autocomplete="off">`}
      ${btn("pick", t, 0, "Add the next steps to this turn", t === active ? "Adding here" : "Add here", ` aria-pressed="${t === active}"`)}
      ${btn("drop", t, 0, "Remove this turn", "✕")}</div>
    <ol>${turn.steps.map((text, s) => {
      const step = edStepParse(text), last = turn.steps.length - 1;
      return `<li class="ed-rot-step"><b>${s + 1}</b>${edRotIcon(ch, text)}
        ${step ? `<span class="ed-rot-text">${esc(text)}</span>` : `<input class="ed-rot-text" data-rot-text data-rot-i="${i}" data-rot-t="${t}" data-rot-s="${s}" value="${esc(text)}" maxlength="120" aria-label="Step ${s + 1}" autocomplete="off">`}
        <span class="ed-rot-tools">
        ${step?.move.press ? btn("hold", t, s, `Hold: ${step.hold ? "on" : "off"}`, "Hold", ` aria-pressed="${step.hold}"`) : ""}
        ${step ? btn("less", t, s, "Fewer times", "−", step.count > 1 ? "" : " disabled") + btn("more", t, s, "More times", "+") : ""}
        ${btn("up", t, s, "Move up", "↑", s ? "" : " disabled")}${btn("down", t, s, "Move down", "↓", s < last ? "" : " disabled")}${btn("del", t, s, "Remove step", "✕")}</span></li>`;
    }).join("")}</ol></section>`).join("");
  const steps = turns.flatMap(t => t.steps).length;
  const preview = ch && steps ? `<div class="rotation ed-rot-preview"><h3>On the card</h3>${rotationBox({ name: ch.name, rotation: { order: edDraft.order, turns: edTurns(c.rotation), source: null } })}</div>` : "";
  return `${body || `<p class="ed-hint">Tap a move above to start the rotation.</p>`}
    <button type="button" class="tool ed-rot-addturn" data-rot-act="turn" data-rot-i="${i}">+ Turn</button>${preview}`;
}
function edRotBody(i) {
  const c = edDraft.cards[i];
  return `<div class="ed-rot" data-ed-rot="${i}">
    <div class="ed-rot-palette" role="group" aria-label="Add a move">${edRotPalette(i)}</div>
    <div class="ed-rot-free"><input data-rot-free="${i}" maxlength="120" placeholder="Other step…" aria-label="Other step" autocomplete="off">
      <button type="button" class="tool" data-rot-act="free" data-rot-i="${i}">Add</button></div>
    <div id="edRotTurns${i}" class="ed-rot-turns">${edRotTurnsBody(i)}</div>
    <div id="edRotLive${i}" class="ed-rot-live" role="status" aria-live="polite"></div>
    <details class="ed-rot-text-edit"><summary>Edit as text</summary>
      ${edField("One step per line, # starts a turn", `<textarea name="c${i}.rotation" rows="10" maxlength="${ED_LIMITS.rotation}" placeholder="${esc(ED_ROTATION_HINT)}">${esc(c.rotation)}</textarea>`)}</details></div>`;
}
/* Each position keeps its Notes and Rotation below the team cards, in two tabs so the page stays short. Both stay in the form */
function edDetailBody() {
  return edDraft.cards.map((c, i) => {
    const ch = edChar(c.char), tab = (key, label) => `<button type="button" class="${edTab[i] === key ? "on" : ""}" data-ed-tab="${key}" data-ed-tab-i="${i}" aria-pressed="${edTab[i] === key}">${label}</button>`;
    return `<fieldset class="ed-card ed-detail ed-${ED_BARS[i]}">
      <legend>${ED_SLOTS[i]} · ${esc(ch?.name || "No character")}</legend>
      <div class="ed-tabs">${tab("notes", "Notes")}${tab("rotation", "Rotation")}</div><div class="ed-detail-fields">
    <div data-ed-pane="notes"${edTab[i] === "notes" ? "" : " hidden"}>${edField("Notes", `<textarea name="c${i}.desc" rows="8" maxlength="${ED_LIMITS.desc}" placeholder="Why this build, and what to change at other ranks">${esc(c.desc)}</textarea>`)}</div>
    <div data-ed-pane="rotation"${edTab[i] === "rotation" ? "" : " hidden"}>${edRotBody(i)}</div>
      </div></fieldset>`;
  }).join("");
}
// Changes the rotation of one position through its text field, so everything that listens to the form follows
function edRotEdit(i, change, say, focus) {
  const turns = edRotParse(edDraft.cards[i].rotation);
  change(turns);
  const text = edRotText(turns);
  if (text.length > ED_LIMITS.rotation) return edStatus(`A rotation can have up to ${ED_LIMITS.rotation} characters.`);
  const field = $("#edForm").elements[`c${i}.rotation`];
  field.value = text;
  field.dispatchEvent(new Event("input", { bubbles: true })); // the form handler saves and redraws the turns
  const live = $(`#edRotLive${i}`);
  if (live && say) live.textContent = say;
  for (const selector of [focus].flat()) {
    const target = selector && $(`#edRotTurns${i} ${selector}`);
    if (target && !target.disabled) return target.focus({ preventScroll: true });
  }
}
function edRotAdd(i, text) {
  let at;
  edRotEdit(i, turns => {
    if (!turns.length) turns.push({ name: "Turn 1", steps: [] });
    at = Math.min(edRotActive[i] ?? turns.length - 1, turns.length - 1);
    turns[at].steps.push(text);
    edRotActive[i] = at;
  }, `${text} added`);
}

/* applying a selection */
function edApply(kind, name, i, slot, rank = "", side = "") {
  let c = edDraft.cards[i];
  if (kind === "char" && name) {
    const from = edDraft.cards.findIndex((other, index) => index !== i && other.char === name);
    if (from >= 0) {
      [edDraft.cards[i], edDraft.cards[from]] = [edDraft.cards[from], edDraft.cards[i]];
      for (const field of ["captain", "starter"]) {
        if (edDraft[field] === from) edDraft[field] = i;
        else if (edDraft[field] === i) edDraft[field] = from;
      }
      c = edDraft.cards[i];
    } else {
      const ch = edChar(name), old = edChar(c.char);
      c.char = name;
      // What the previous character brought (its signature C.U.B., memory and resonances) is replaced by the new one's;
      // anything the person picked themselves stays
      const oldMatrix = ED_MATRIX_DEFAULT[old?.class] || [];
      // Signature C.U.B. with skills 1, 2 and 3 on (4 to 6 off)
      // Always the new character's own; a frame with no C.U.B. art leaves the card without one
      // A C.U.B. goes on one character only, so a rank A one another card already carries is left off
      const cubWanted = ch?.construct && !edDraft.cards.some((other, k) => k !== i && other.cub === ch.construct) ? ch.construct : "";
      if (c.cub !== cubWanted) {
        c.cub = cubWanted;
        c.cubSkills = ED_CUB_SKILL_ORDER.slice();
        c.cubOff = ED_CUB_SKILL_ORDER.map(k => k > 2);
      }
      // Signature memory in slots 1, 2, 3 and 5
      // A new character's signature replaces whatever was there; with none, only the previous character's own signature goes
      for (const slot of ED_SIGNATURE_MEMORY_SLOTS) {
        if (ch?.signature) c.mem[slot] = ch.signature;
        else if (old?.signature && c.mem[slot] === old.signature) c.mem[slot] = "";
      }
      // The class's weapon resonances
      const matrixNow = ED_MATRIX_DEFAULT[ch?.class] || [];
      for (let slot = 0; slot < 3; slot++) {
        if (c.matrix[slot] && c.matrix[slot] !== oldMatrix[slot]) continue;
        const res = matrixNow[slot];
        c.matrix[slot] = res && edMatrixOptions(ch).includes(res) ? res : "";
      }
      // A new character comes with the signature weapon at 6★, unless the weapon already set still fits
      const options = edWeaponOptions(name);
      if (!options.some(w => w.name === c.weapon && w.rank === c.weaponRank)) {
        const signature = options.find(w => w.name === name && w.rank === "6") || options.find(w => w.name === name);
        c.weapon = signature ? signature.name : "";
        c.weaponRank = signature ? signature.rank : "";
      }
    }
  } else if (kind === "char") c.char = "";
  else if (kind === "cub") {
    if (c.cub !== name) {
      c.cubSkills = ED_CUB_SKILL_ORDER.slice();
      c.cubOff = ED_CUB_SKILL_ORDER.map(() => false);
    }
    c.cub = name;
  }
  else if (kind === "rank") c.rank = name || "SS";
  else if (kind === "weapon") { c.weapon = name; c.weaponRank = rank; }
  else if (kind === "mem") {
    c.mem[slot] = name;
    if (!name) c.memRes[slot] = ["Any ATK", "Signature Move"];
  }
  else if (kind === "memres") c.memRes[slot][side === "bottom" ? 1 : 0] = name || (side === "bottom" ? "Signature Move" : "Any ATK");
  else if (kind === "mx") c.matrix[slot] = name;
  else if (kind === "wh") c.wh = name;
  c.res = c.memRes[0][0];
  c.core = c.memRes[0][1];
  edDraft = edClean(edDraft);
  edSave();
  edStatus("");
  edPickerTarget = null;
  edCubSkillPick = null;
  edRender();
  if (kind === "char") {
    if ($("#edRoles")) $("#edRoles").innerHTML = edRolesBody(edDraft);
    if ($("#edOrder")) $("#edOrder").innerHTML = edOrderBody(edDraft);
  }
  if (kind === "char") $("#edDetail").innerHTML = edDetailBody();
}
/* sending a team for review: /api/submit */
const ED_ERRORS = {
  page: "Pick the page this team belongs to before sending it.",
  name: "Give the team a name before sending it.",
  characters: "A team needs three different characters to be sent.",
  memories: "Fill in the six memories of each character before sending.",
  links: "Links are not allowed in the texts. Remove them and send again.",
  captcha: "The verification failed. Wait for it to finish and send again.",
  early: "That was fast. Wait a few seconds and send again.",
  stale: "This page was open for too long. Send again.",
  duplicate: "This exact team was already sent.",
  limit: "You sent several teams in a short time. Try again later.",
  full: "The review queue is full right now. Try again in a few days.",
  off: "Sending teams is not available right now.",
  network: "The team could not be sent. Check your connection and try again."
};
// Mirrors teamProblem() of server/team.js, so most mistakes are caught before the verification shows up
function edProblem(team) {
  if (!team.page) return "page";
  if (team.name.trim().length < 3) return "name";
  const chars = team.cards.map(c => c.char);
  if (chars.some(c => !c) || new Set(chars).size < 3) return "characters";
  if (team.cards.some(c => c.mem.some(m => !m))) return "memories";
  return "";
}
// What the form needs from the server: whether sending is open, the key of the verification and a time stamp
let edConfig = null, edCaptcha = null, edToken = "", edWidget;
const edLoadConfig = () => fetch("/api/submit").then(r => r.json()).catch(() => ({ open: false }));
const edSendButton = on => { const b = $('[data-ed="confirm"]'); if (b) b.disabled = !on; };
async function edOpenSend() {
  const problem = edProblem(edDraft);
  if (problem) return edStatus(ED_ERRORS[problem]);
  const config = await edConfig;
  if (!config.open || !$("#edSend")) return edStatus(ED_ERRORS.off);
  $("#edSend").hidden = false;
  edStatus("");
  try {
    await (edCaptcha ||= loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"));
  } catch {
    edCaptcha = null;
    return edStatus(ED_ERRORS.network);
  }
  const box = $("#edCaptcha");
  if (!box || box.childElementCount) return;
  edToken = "";
  edWidget = window.turnstile.render(box, { sitekey: config.siteKey, theme: "dark",
    callback: token => { edToken = token; edSendButton(true); },
    "expired-callback": () => { edToken = ""; edSendButton(false); },
    "error-callback": () => { edToken = ""; edSendButton(false); edStatus(ED_ERRORS.captcha); } });
}
async function edSend() {
  const problem = edProblem(edDraft);
  if (problem) return edStatus(ED_ERRORS[problem]);
  edSendButton(false);
  edStatus("Sending...");
  const { stamp } = await edConfig;
  const body = { team: edDraft, author: $("#edAuthor").value, website: $("#edWebsite").value, stamp, token: edToken };
  const result = await fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then(r => r.json()).catch(() => ({ error: "network" }));
  // A verification is good for one try: a new one runs and turns the button back on
  edToken = "";
  try { window.turnstile.reset(edWidget); } catch { /* the widget is gone: the next click on Submit draws it again */ }
  if (result.ok) {
    $("#edSend").hidden = true;
    return edStatus("Team sent. It shows up on its page once it is reviewed.");
  }
  if (result.error === "stale") edConfig = edLoadConfig();
  edStatus(ED_ERRORS[result.error] || ED_ERRORS.network);
}

function teamBuilder() {
  edImport();
  edConfig ||= edLoadConfig();
  const message = edMessage;
  edMessage = "";
  // The cards go out as plain HTML with the page; editable slots are marked once they are in the document
  queueMicrotask(() => { edWire(); edPaint(); edStatus(message); });
  return `<h1>Team Builder</h1>
    <ul class="ed-help">
      <li>Click any equipment slot to search and choose from its icons. Right-click an equipped item to remove it.</li>
      <li>Click one C.U.B. skill and then another to swap their positions, or drag it onto the other. Drag Leader and Starter to another card.</li>
      <li>Drag a portrait onto another card, or use the arrows between the cards, to swap two positions with all their equipment.</li>
      <li>Use the Memory Resonances button on the memory box to set each memory's Upper and Bottom resonance.</li>
      <li>Choose None in a selector to clear its slot. Selecting a character already on the team moves it to the chosen slot.</li>
      <li>Each position has Notes and Rotation tabs below the cards. Build a rotation by tapping moves, or switch to "Edit as text".</li>
      <li>The team stays saved in this browser, and you can share it as a link or an image.</li>
      <li>You can also send it to the site: after a review, it shows up on its page with the other builds.</li>
    </ul>
    <form id="edForm" class="ed" autocomplete="off">
      <fieldset id="edTeam" class="ed-team">${edTeamBody(edDraft)}</fieldset>
      <div id="edStatus" class="ed-status" role="status" aria-live="polite"></div>
      <div class="ed-studio">
        <div class="ed-work">
          <div id="edStage">${edStageBody()}</div>
          <div id="edDetail">${edDetailBody()}</div>
        </div>
      </div>
    </form>`;
}

$("#main").addEventListener("scroll", e => {
  if (e.target.matches?.("#edStage .comp, #edDetail")) edSyncDetailBelt(e.target);
}, true);
addEventListener("input", e => {
  const el = e.target;
  if (el.id === "edPickerSearch") {
    edFilterPicker(el.value);
    return;
  }
  const form = el.closest?.("#edForm");
  if (!form || !el.name) return;
  edDraft = edRead(form);
  // Picking a main or sub set fills its memory slots; each slot can still be changed on its own, on the card
  const set = el.name.match(/^c(\d)\.(main|sub)$/);
  if (set && el.value) (set[2] === "main" ? ED_MAIN : ED_SUB).forEach(s => { edDraft.cards[set[1]].mem[s] = el.value; });
  edSave();
  edStatus("");
  edRefresh(el.tagName === "SELECT");
  const rot = el.name.match(/^c(\d)\.rotation$/);
  if (rot) $(`#edRotTurns${rot[1]}`).innerHTML = edRotTurnsBody(Number(rot[1]));
});
addEventListener("submit", e => { if (e.target.id === "edForm") e.preventDefault(); });
/* Dragging with a mouse: a C.U.B. skill onto another skill of its card, Leader or Starter onto another card, and a portrait onto
   another card to swap the two positions. A copy of the icon follows the pointer at full strength while its own spot stays empty;
   let go anywhere it can't land, and it goes back. Touch screens use taps and the arrow buttons instead */
let edDrag = null, edDragged = false;
const ED_DRAG_FROM = "#edStage [data-ed-cub-skill-index], #edStage [data-ed-role], #edStage .portrait[data-ed-drop], #edStage [data-ed-drop=mem], #edStage [data-ed-drop=mx]";
function edDropTarget(drag, under) {
  const card = under?.closest?.("#edStage .card[data-ed-card]");
  if (!card) return null;
  const at = Number(card.dataset.edCard);
  if (drag.kind === "skill") {
    const skill = under.closest("[data-ed-cub-skill-index]");
    return skill && at === drag.card && skill !== drag.source ? skill : null;
  }
  if (drag.kind === "mem" || drag.kind === "mx") {
    const slot = under.closest(`[data-ed-drop="${drag.kind}"]`);
    return slot && at === drag.card && slot !== drag.source ? slot : null;
  }
  return at !== drag.card ? card : null;
}
function edDropOn(drag, target) {
  if (drag.kind === "card") return edMoveCard(drag.card, Number(target.dataset.edCard));
  if (drag.kind === "mem" || drag.kind === "mx") {
    const c = edDraft.cards[drag.card], from = Number(drag.source.dataset.edSlot), to = Number(target.dataset.edSlot);
    // A memory moves with its own resonances; weapon resonances move alone
    const list = drag.kind === "mem" ? [c.mem, c.memRes] : [c.matrix];
    for (const items of list) [items[from], items[to]] = [items[to], items[from]];
    c.res = c.memRes[0][0];
    c.core = c.memRes[0][1];
    edDraft = edClean(edDraft);
    edStatus(drag.kind === "mem" ? "Memory positions updated." : "Weapon resonance positions updated.");
  } else if (drag.kind === "skill") {
    const order = edDraft.cards[drag.card].cubSkills, from = Number(drag.source.dataset.edCubSkillIndex), to = Number(target.dataset.edCubSkillIndex);
    [order[from], order[to]] = [order[to], order[from]];
    edCubSkillPick = null;
    edStatus("C.U.B. skill positions updated.");
  } else {
    edDraft[drag.source.dataset.edRole] = Number(target.dataset.edCard);
    $("#edRoles").innerHTML = edRolesBody(edDraft);
  }
  edSave();
  edRender();
}
function edEndDrag(drop) {
  const drag = edDrag;
  edDrag = null;
  if (!drag?.ghost) return;
  edDragged = true;
  setTimeout(() => { edDragged = false; }, 0);
  document.documentElement.classList.remove("ed-dragging");
  drag.target?.classList.remove("ed-drop-on");
  if (drop && drag.target) {
    drag.ghost.remove();
    return edDropOn(drag, drag.target);
  }
  const done = () => { drag.ghost.remove(); drag.source.classList.remove("ed-drag-origin"); };
  drag.ghost.classList.add("back");
  drag.ghost.style.transform = "";
  drag.ghost.addEventListener("transitionend", done, { once: true });
  setTimeout(done, 260);
}
addEventListener("pointerdown", e => {
  if (e.button !== 0 || e.pointerType === "touch") return;
  const source = e.target.closest?.(ED_DRAG_FROM);
  if (!source) return;
  const card = Number(source.closest(".card").dataset.edCard);
  const kind = source.matches("[data-ed-cub-skill-index]") ? "skill" : source.matches("[data-ed-role]") ? "role" : source.matches(".portrait") ? "card" : source.dataset.edDrop;
  if (kind === "card" && !edDraft.cards[card]?.char) return;
  // An empty memory or resonance slot has nothing to move: a click still opens its menu
  if ((kind === "mem" || kind === "mx") && !(kind === "mem" ? edDraft.cards[card]?.mem : edDraft.cards[card]?.matrix)?.[Number(source.dataset.edSlot)]) return;
  // Keeps the browser from selecting text or starting its own drag; the click still comes when the pointer doesn't move
  e.preventDefault();
  edDrag = { kind, source, card, x: e.clientX, y: e.clientY, ghost: null, target: null };
});
addEventListener("pointermove", e => {
  if (!edDrag) return;
  const drag = edDrag;
  if (!drag.ghost) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    const rect = drag.source.getBoundingClientRect(), cardBox = drag.source.closest(".card");
    const ghost = drag.ghost = drag.source.cloneNode(true);
    for (const name of [...ghost.attributes].map(a => a.name)) if (name.startsWith("data-") || ["id", "title", "tabindex", "role", "aria-pressed", "aria-label"].includes(name)) ghost.removeAttribute(name);
    ghost.classList.remove("ed-cub-skill-selected");
    ghost.classList.add("ed-ghost");
    ghost.setAttribute("aria-hidden", "true");
    // The copy leaves the card, so it takes the card's scale (--u) and the icon's size with it
    ghost.style.cssText = `--u:${Math.min(1, cardBox.clientWidth / 360)}px;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
    document.body.append(ghost);
    drag.source.classList.add("ed-drag-origin");
    document.documentElement.classList.add("ed-dragging");
  }
  drag.ghost.style.transform = `translate(${e.clientX - drag.x}px,${e.clientY - drag.y}px)`;
  const target = edDropTarget(drag, document.elementFromPoint(e.clientX, e.clientY));
  if (target === drag.target) return;
  drag.target?.classList.remove("ed-drop-on");
  target?.classList.add("ed-drop-on");
  drag.target = target;
});
addEventListener("pointerup", () => edEndDrag(true));
addEventListener("pointercancel", () => edEndDrag(false));
addEventListener("keydown", e => { if (e.key === "Escape" && edDrag?.ghost) edEndDrag(false); });
// The click that ends a drag is not a click on the icon
addEventListener("click", e => {
  if (!edDragged) return;
  edDragged = false;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);
// No native dragging of the card art
addEventListener("dragstart", e => { if (e.target.closest?.("#edStage")) e.preventDefault(); });
addEventListener("contextmenu", e => {
  if (e.button !== 2) return;
  const drop = e.target.closest?.("#edStage [data-ed-drop]");
  if (!drop || !["char", "mem", "weapon", "wh", "mx", "cub"].includes(drop.dataset.edDrop)) return;
  const card = Number(drop.closest(".card")?.dataset.edCard);
  const slot = Number(drop.dataset.edSlot);
  const kind = drop.dataset.edDrop;
  if (!Number.isInteger(card) || !edDraft.cards[card]) return;
  if (!edPickerCurrent(kind, edDraft.cards[card], slot)) return;
  e.preventDefault();
  edApply(kind, "", card, slot);
});
addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (edPickerTarget) {
      if (edPickerTarget.kind === "memresmenu")
        $(`#edStage [data-ed-memres-menu="${edPickerTarget.card}"]`)?.setAttribute("aria-expanded", "false");
      edPickerTarget = null;
      $("#edPicker").hidden = true;
    }
  }
  const drop = e.target.closest?.("#edStage [data-ed-drop]");
  if (drop && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    drop.click();
  }
});

addEventListener("click", e => {
  const picker = $("#edPicker");
  if (edPickerTarget?.kind === "memresmenu" && e.target.closest?.("[data-ed-mem-side]")) {
    const resonanceChoice = e.target.closest("[data-ed-mem-side]");
    return edShowResonanceMenu(edPickerTarget.card,
      $(`#edStage [data-ed-memres-menu="${edPickerTarget.card}"]`),
      Number(resonanceChoice.dataset.edMemSlot), resonanceChoice.dataset.edMemSide);
  }
  const applyAll = e.target.closest?.("[data-ed-apply-all]");
  if (edPickerTarget?.kind === "memresmenu" && applyAll) {
    const { card, slot, side } = edPickerTarget, key = applyAll.dataset.edApplyAll;
    edApplyAll[key] = applyAll.checked;
    // Turning it on spreads the value the chosen slot has now, when the open side is the one just ticked
    if (applyAll.checked && slot >= 0 && (side === "bottom") === (key === "bottom")) edSetMemRes(card, slot, side, edDraft.cards[card].memRes[slot][key === "bottom" ? 1 : 0]);
    edDraft = edClean(edDraft);
    edSave();
    edRender();
    return edShowResonanceMenu(card, $(`#edStage [data-ed-memres-menu="${card}"]`), slot, side);
  }
  if (edPickerTarget?.kind === "memresmenu" && e.target.closest?.("[data-ed-memres-value]")) {
    const { card, slot, side } = edPickerTarget;
    edSetMemRes(card, slot, side, e.target.closest("[data-ed-memres-value]").dataset.edMemresValue);
    edDraft = edClean(edDraft);
    edSave();
    edStatus("");
    const cardEl = $(`#edStage .card[data-ed-card="${card}"]`), c = edDraft.cards[card];
    const res = $(".res", cardEl);
    res.innerHTML = `<div class="ed-res-total"><small>Upper · 6</small><span>${esc(edResonanceSummary(c.memRes.map(pair => pair[0])))}</span></div>
      <div class="ed-res-total"><small>Bottom · 6</small><span>${esc(edResonanceSummary(c.memRes.map(pair => pair[1])))}</span></div>`;
    res.setAttribute("aria-label", `Memory resonances. Upper: ${edResonanceSummary(c.memRes.map(pair => pair[0]))}. Bottom: ${edResonanceSummary(c.memRes.map(pair => pair[1]))}.`);
    return edShowResonanceMenu(card, $(`#edStage [data-ed-memres-menu="${card}"]`), slot, side);
  }
  if (edPickerTarget && picker && !picker.contains(e.target)) {
    if (edPickerTarget.kind === "memresmenu")
      $(`#edStage [data-ed-memres-menu="${edPickerTarget.card}"]`)?.setAttribute("aria-expanded", "false");
    edPickerTarget = null;
    picker.hidden = true;
  }
  const resonanceMenuButton = e.target.closest?.("[data-ed-memres-menu]");
  if (resonanceMenuButton) {
    const card = Number(resonanceMenuButton.dataset.edMemresMenu);
    if (edPickerTarget?.kind === "memresmenu" && edPickerTarget.card === card) {
      edPickerTarget = null;
      picker.hidden = true;
      resonanceMenuButton.setAttribute("aria-expanded", "false");
      return;
    }
    return edShowResonanceMenu(card, resonanceMenuButton);
  }
  const cubSkill = e.target.closest?.("#edStage [data-ed-cub-skill-index]");
  if (cubSkill) {
    const card = Number(cubSkill.closest(".card")?.dataset.edCard);
    const index = Number(cubSkill.dataset.edCubSkillIndex);
    if (!Number.isInteger(card) || !edDraft.cards[card] || !Number.isInteger(index)) return;
    if (edCubSkillPick?.card === card) {
      if (edCubSkillPick.index !== index) {
        const order = edDraft.cards[card].cubSkills;
        [order[edCubSkillPick.index], order[index]] = [order[index], order[edCubSkillPick.index]];
        edSave();
        edStatus("C.U.B. skill positions updated.");
      } else {
        // Clicking the chosen skill again (a double click) greys it out, or brings it back
        const off = edDraft.cards[card].cubOff, skill = edDraft.cards[card].cubSkills[index];
        off[skill] = !off[skill];
        edSave();
        edStatus(off[skill] ? "C.U.B. skill greyed out: not unlocked." : "C.U.B. skill back in use.");
      }
      edCubSkillPick = null;
      edRender();
    } else {
      edCubSkillPick = { card, index };
      edRender();
      edStatus("Click another skill to swap, the same one again to grey it out, or drag it onto another skill.");
    }
    return;
  }
  const moreButton = e.target.closest?.("[data-ed-more]");
  if (moreButton) {
    const open = moreButton.getAttribute("aria-expanded") !== "true", extra = moreButton.parentElement.querySelectorAll(".ed-picker-option.more");
    extra.forEach(option => { option.hidden = !open; });
    moreButton.setAttribute("aria-expanded", String(open));
    moreButton.textContent = open ? "Show fewer" : `Others (${extra.length})`;
    return;
  }
  const pickerChoice = e.target.closest?.("[data-ed-picker-value]");
  if (pickerChoice && edPickerTarget) {
    const { kind, card, slot, side } = edPickerTarget, value = pickerChoice.dataset.edPickerValue;
    const [name, rank = ""] = kind === "weapon" && value ? value.split("::") : [value, ""];
    return edApply(kind, name, card, slot, rank, side);
  }
  if (e.target.closest?.("[data-ed-picker-close]")) {
    if (edPickerTarget?.kind === "memresmenu")
      $(`#edStage [data-ed-memres-menu="${edPickerTarget.card}"]`)?.setAttribute("aria-expanded", "false");
    edPickerTarget = null;
    $("#edPicker").hidden = true;
    return;
  }
  const button = e.target.closest?.("[data-ed]");
  if (button) {
    if (button.dataset.ed === "reset") {
      if (!confirm("Clear this team and start over?")) return;
      edDraft = edBlank();
      edSave();
      edPickerTarget = null;
      edCubSkillPick = null;
      return route();
    }
    if (button.dataset.ed === "send") edOpenSend();
    if (button.dataset.ed === "confirm") edSend();
    if (button.dataset.ed === "link") edCopyLink();
    return;
  }
  if (!$("#edStage") || e.defaultPrevented) return; // a tap on a card at the side only slides it to the center
  const move = e.target.closest("#edStage [data-ed-move]");
  if (move) return edMoveCard(Number(move.dataset.edMove), Number(move.dataset.edTo));
  const cardEl = e.target.closest("[data-ed-card]");
  if (!cardEl) {
    return;
  }
  if (cardEl.classList.contains("peek")) return;
  const i = Number(cardEl.dataset.edCard);
  const drop = e.target.closest("[data-ed-drop]");
  if (e.target.closest("[data-note]")) return; // the Notes/Rotation tabs of the card keep working as everywhere else
  if (drop) {
    const type = drop.dataset.edDrop, s = Number(drop.dataset.edSlot);
    return edShowPicker(type, i, s, drop.dataset.edSide, drop);
  }
});

/* Team box controls: page icons, rotation chips and tags */
addEventListener("click", e => {
  const form = $("#edForm");
  if (!form || !e.target.closest) return;
  const set = (name, value) => {
    form.elements[name].value = value;
    form.elements[name].dispatchEvent(new Event("input", { bubbles: true }));
  };
  const page = e.target.closest("[data-ed-page]");
  if (page) {
    set("page", page.dataset.edPage === edDraft.page ? "" : page.dataset.edPage); // a second tap clears it
    $("#edPageChoice").innerHTML = edPageBody(edDraft);
    return;
  }
  const tag = e.target.closest("[data-ed-tag]");
  if (tag) {
    const tags = edDraft.tags.includes(tag.dataset.edTag) ? edDraft.tags.filter(t => t !== tag.dataset.edTag) : [...edDraft.tags, tag.dataset.edTag];
    edDraft = edClean({ ...edDraft, tags });
    edSave();
    edStatus("");
    $("#edTags").innerHTML = edTagsBody(edDraft);
    return;
  }
  const add = e.target.closest("[data-ed-order-add]"), remove = e.target.closest("[data-ed-order-remove]");
  const undo = e.target.closest("[data-ed-order-undo]"), clear = e.target.closest("[data-ed-order-clear]");
  if (!add && !remove && !undo && !clear) return;
  const tokens = edOrderTokens(edDraft.order);
  if (add) tokens.push(edShortName(edDraft.cards[Number(add.dataset.edOrderAdd)]));
  else if (remove) tokens.splice(Number(remove.dataset.edOrderRemove), 1);
  else if (undo) tokens.pop();
  else tokens.length = 0;
  let order = tokens.join(ED_ORDER_SEP);
  while (order.length > ED_LIMITS.order && tokens.length) { tokens.pop(); order = tokens.join(ED_ORDER_SEP); }
  set("order", order);
  $("#edOrder").innerHTML = edOrderBody(edDraft);
});

/* Rotation builder controls: the Notes/Rotation tabs, the move buttons, and the buttons of each turn and step */
addEventListener("click", e => {
  if (!$("#edForm") || !e.target.closest) return;
  const tab = e.target.closest("[data-ed-tab]");
  if (tab) {
    const i = Number(tab.dataset.edTabI);
    edTab[i] = tab.dataset.edTab;
    const box = tab.closest(".ed-detail");
    box.querySelectorAll("[data-ed-tab]").forEach(b => { b.classList.toggle("on", b === tab); b.setAttribute("aria-pressed", b === tab); });
    box.querySelectorAll("[data-ed-pane]").forEach(pane => { pane.hidden = pane.dataset.edPane !== edTab[i]; });
    return;
  }
  const b = e.target.closest("[data-rot-act]");
  if (!b || b.disabled) return;
  const i = Number(b.dataset.rotI), t = Number(b.dataset.rotT), s = Number(b.dataset.rotS), act = b.dataset.rotAct;
  const at = `[data-rot-act="${act}"][data-rot-t="${t}"][data-rot-s="${s}"]`;
  const edit = (change, say, focus) => edRotEdit(i, turns => change(turns, turns[t]?.steps), say, focus);
  const redraw = () => { $(`#edRotTurns${i}`).innerHTML = edRotTurnsBody(i); };
  if (act === "add") return edRotAdd(i, edStepText({ move: ROTATION_MOVES.find(m => m.name === b.dataset.rotMove), hold: false, count: 1 }));
  if (act === "free") {
    const input = $(`[data-rot-free="${i}"]`), text = input.value.replace(/\s+/g, " ").trim();
    if (!text) return input.focus();
    input.value = "";
    return edRotAdd(i, text.startsWith("#") ? text.replace(/^#+\s*/, "") : text);
  }
  if (act === "turn") {
    return edRotEdit(i, turns => { turns.push({ name: `Turn ${turns.length + 1}`, steps: [] }); edRotActive[i] = turns.length - 1; }, "Turn added");
  }
  if (act === "pick") { edRotActive[i] = t; redraw(); return $(`#edRotTurns${i} .ed-rot-turn.on [data-rot-act="pick"]`)?.focus(); }
  if (act === "drop") {
    return edRotEdit(i, turns => { turns.splice(t, 1); edRotActive[i] = null; }, "Turn removed");
  }
  const withStep = change => edit((turns, steps) => { const step = edStepParse(steps[s]); if (step) steps[s] = edStepText(change(step)); }, "", at);
  if (act === "hold") return withStep(step => ({ ...step, hold: !step.hold }));
  if (act === "less") return withStep(step => ({ ...step, count: Math.max(1, step.count - 1) }));
  if (act === "more") return withStep(step => ({ ...step, count: step.count + 1 }));
  if (act === "up" || act === "down") {
    const to = s + (act === "up" ? -1 : 1);
    return edit((turns, steps) => { [steps[s], steps[to]] = [steps[to], steps[s]]; }, `Step moved to ${to + 1}`,
      [`[data-rot-act="${act}"][data-rot-t="${t}"][data-rot-s="${to}"]`, `[data-rot-act="${act === "up" ? "down" : "up"}"][data-rot-t="${t}"][data-rot-s="${to}"]`]);
  }
  if (act === "del") {
    return edit((turns, steps) => { steps.splice(s, 1); }, "Step removed", [`[data-rot-act="del"][data-rot-t="${t}"][data-rot-s="${s}"]`, `[data-rot-act="pick"][data-rot-t="${t}"]`]);
  }
});
// Typing into a turn name or a free step is applied once the field is left
addEventListener("change", e => {
  const el = e.target;
  if (!el.matches?.("[data-rot-name], [data-rot-text]") || !$("#edForm")) return;
  const i = Number(el.dataset.rotI), t = Number(el.dataset.rotT), s = Number(el.dataset.rotS);
  const value = el.value.replace(/\s+/g, " ").trim().replace(/^#+\s*/, "");
  edRotEdit(i, turns => {
    if (el.matches("[data-rot-name]")) turns[t].name = value || "Turn";
    else if (value) turns[t].steps[s] = value;
    else turns[t].steps.splice(s, 1);
  });
});
addEventListener("keydown", e => {
  const input = e.target.matches?.("[data-rot-free]") ? e.target : null;
  if (input && e.key === "Enter") {
    e.preventDefault();
    input.closest(".ed-rot-free").querySelector("[data-rot-act]").click();
  }
});
