/* ---------- Team Builder: the /editor page. app.js loads this file, after data/catalog-data.js, only on that page ---------- */
// A team is kept as names from CATALOG, never as image paths: edCards() turns it into the cards the site draws.
// Submitted teams have this same shape, and the server checks them against the same catalog (server/team.js).
// The cards are the editor: equipment slots open searchable icon pickers directly on the card.
/* exported teamBuilder, edPaint, edClean, edCards, edTheme */ // app.js calls these
const EDITOR_KEY = "dominik-editor";
const ED_BARS = ["blue", "red", "gold"];
const ED_SLOTS = ["Blue", "Red", "Yellow"];
const ED_LIMITS = { name: 60, order: 120, desc: 1500, rotation: 3000 };
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
const edMatrixOptions = ch => CATALOG.matrix.filter(name =>
  ED_MATRIX_COMMON.includes(name) || (ED_MATRIX_CLASS[ch?.class] || []).includes(name));
const edSkillOrder = value => Array.isArray(value) && value.length === ED_CUB_SKILL_ORDER.length
  && value.every(index => Number.isInteger(index) && index >= 0 && index < ED_CUB_SKILL_ORDER.length)
  && new Set(value).size === ED_CUB_SKILL_ORDER.length ? value.slice() : ED_CUB_SKILL_ORDER.slice();
const ED_UPPER_RESONANCES = [
  ["Red Orb", "Red Orb Level +1"], ["Yellow Orb", "Yellow Orb Level +1"], ["Blue Orb", "Blue Orb Level +1"],
  ["Basic Attack", "Basic Attack Level +1"], ["Ex- Precision Action", "Ex- Precision Action · HP +75, CRIT +15"],
  ["Ex- Enhanced Power", "Ex- Enhanced Power · ATK +15, DEF +23"],
  ["Ex- Precision Attack", "Ex- Precision Attack · ATK +15, CRIT +15"],
  ["Ex- Tactical Adjustment", "Ex- Tactical Adjustment · HP +75, ATK +15"],
  ["Any ATK", "Any ATK · Any of the 3 ATK Resonance"]
];
const ED_BOTTOM_RESONANCES = [
  ["Signature Move", "Signature Move Level +1"], ["QTE", "QTE Level +1"], ["Core Passive", "Core Passive +1"],
  ["Class Skill", "Class Skill Level +1"], ["Ex- Precision Action", "Ex- Precision Action · HP +75, CRIT +15"],
  ["Ex- Enhanced Power", "Ex- Enhanced Power · ATK +15, DEF +23"],
  ["Ex- Precision Attack", "Ex- Precision Attack · ATK +15, CRIT +15"],
  ["Ex- Tactical Adjustment", "Ex- Tactical Adjustment · HP +75, ATK +15"],
  ["Any ATK", "Any ATK · Any of the 3 ATK Resonance"]
];
const ED_NEUTRAL = { c1: "#8a8f98", c2: "#101114", cp: "#26282d" };
const ED_ROTATION_HINT = "# Turn 1: Start\nSwap in\nTap Signature\n# Turn 4\nTap Yellow Orb ASAP";
const ED_LEGACY_RESONANCE = { "ALL ATK": "Any ATK", Signature: "Signature Move", Core: "Core Passive", Class: "Class Skill" };

const edChar = name => CATALOG.characters.find(c => c.name === name);
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
  wh: "", matrix: ["", "", ""], cubSkills: ED_CUB_SKILL_ORDER.slice(),
  res: "Any ATK", core: "Signature Move", desc: "", rotation: ""
});
const edBlank = () => ({ v: 1, page: "", name: "", order: "", captain: 1, starter: 0, cards: ED_BARS.map(edBlankCard) });

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
let edMessage = "";
function edImport() {
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
  const kit = ch ? (({ skillArt, element, class: cls, ...rest }) => rest)(ch)
    : { name: "", symbol: "", portrait: "", weapon: "", construct: "", skills: [] };
  const role = [i === team.captain && "captain", i === team.starter && "starter"].filter(Boolean).join(" ");
  const turns = edTurns(c.rotation);
  return {
    ...kit, construct: cub?.construct || "", skills: cub ? c.cubSkills.map(index => cub.skills[index] || "") : [],
    weapon: ch ? edWeaponOptions(ch.name).find(w => w.name === c.weapon && w.rank === c.weaponRank)?.art || "" : "",
    weaponRank: c.weaponRank, bar: ED_BARS[i], role: ch ? role : "", rank: ch ? `assets/rank/${c.rank}.png` : "",
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
const edGroups = (groups, value, blank) => `<option value="">${esc(blank)}</option>` + Object.entries(groups)
  .map(([label, list]) => `<optgroup label="${esc(label)}">${edOptions(list, value)}</optgroup>`).join("");
const edGroupBy = (list, key) => list.reduce((out, item) => ((out[key(item)] ||= []).push(item), out), {});
const edField = (label, control, wide) => `<label class="ed-field${wide ? " wide" : ""}"><span>${label}</span>${control}</label>`;
const edSelect = (name, options) => `<select name="${name}">${options}</select>`;

function edTeamBody(team) {
  const pages = edGroupBy(CATALOG.pages, p => p.kind);
  const pageGroups = Object.fromEntries(Object.entries(pages).map(([kind, list]) => [kind, list.map(p => [p.path, p.name])]));
  const who = i => team.cards[i].char ? team.cards[i].char.split(":")[0] : `${ED_SLOTS[i]} slot`;
  const picks = [0, 1, 2].map(i => [String(i), who(i)]);
  return `<legend>Team</legend><div class="ed-team-layout">
    <section class="ed-team-info" aria-label="Team details">
      <h2 class="ed-team-heading">Team details</h2>
      <div class="ed-team-fields">
        ${edField("Page", edSelect("page", edGroups(pageGroups, team.page, "Pick a page")))}
        ${edField("Team name", `<input name="name" maxlength="${ED_LIMITS.name}" value="${esc(team.name)}" placeholder="Rosetta Darkflow">`)}
        ${edField("Team rotation", `<input name="order" maxlength="${ED_LIMITS.order}" value="${esc(team.order)}" placeholder="Teddy → Lucia → Leia → Teddy">`, true)}
      </div>
    </section>
    <section class="ed-team-roles" aria-label="Battle positions">
      <h2 class="ed-team-heading">Battle positions</h2>
      ${edField("Captain", edSelect("captain", edOptions(picks, String(team.captain))))}
      ${edField("Starter", edSelect("starter", edOptions(picks, String(team.starter))))}
    </section>
  </div>`;
}
// Reads the form back into a team. Fields the page doesn't show right now keep what the team had
function edRead(form) {
  const value = (key, old) => form.elements[key] ? form.elements[key].value : old;
  const radio = (key, old) => form.elements[key]?.value === "" ? old : Number(form.elements[key]?.value ?? old);
  return edClean({
    page: value("page", edDraft.page), name: value("name", edDraft.name), order: value("order", edDraft.order),
    captain: radio("captain", edDraft.captain), starter: radio("starter", edDraft.starter),
    cards: edDraft.cards.map((c, i) => {
      const v = (key, old) => value(`c${i}.${key}`, old);
      return { char: c.char, cub: c.cub, rank: v("rank", c.rank), wh: v("wh", c.wh), res: c.res, core: c.core,
        desc: v("desc", c.desc), rotation: v("rotation", c.rotation),
        mem: c.mem.slice(), memRes: c.memRes.map(pair => pair.slice()), matrix: c.matrix.slice(),
        cubSkills: c.cubSkills.slice() };
    })
  });
}

/* searchable icon choices for each equipment slot */
const edMemInfo = name => MEMORY_EFFECTS[name] ? memoryInfo(name) : "";
let edPickerTarget = null;
let edCubSkillPick = null, edDraggingRole = "";

function edPickerOptions(kind, i, side) {
  const c = edDraft.cards[i];
  const ch = edChar(c.char);
  if (kind === "char") return CATALOG.characters.map(character => ({
    value: character.name, label: character.name, art: character.portrait,
    info: [character.element, character.class].filter(Boolean).join(" · ")
  }));
  if (kind === "mem") return CATALOG.memories.map(name => ({
    value: name, label: name, art: MEM_INDEX.get(name).ext ? memFile(name, "1-4") : "", info: edMemInfo(name)
  }));
  if (kind === "cub") return CATALOG.characters.filter(character => character.construct).map(character => ({
    value: character.construct, label: iconName(character.construct), art: character.construct, info: `${character.name}'s C.U.B.`
  }));
  if (kind === "rank") return CATALOG.ranks.map(rank => ({ value: rank, label: rank, art: `assets/rank/${rank}.png` }));
  if (kind === "weapon") return edWeaponOptions(c.char).map(option => ({
    value: `${option.name}::${option.rank}`, label: option.label, art: option.art, info: option.info
  }));
  if (kind === "mx") return edMatrixOptions(ch).map(name => ({ value: name, label: name, art: WEAPON_RES(name) }));
  if (kind === "memres") {
    const options = side === "bottom" ? ED_BOTTOM_RESONANCES : ED_UPPER_RESONANCES;
    const skillKeys = { "Red Orb": "Red Orb", "Yellow Orb": "Yellow Orb", "Blue Orb": "Blue Orb",
      "Basic Attack": "Basic Attack", "Signature Move": "Signature", "Core Passive": "Core", "Class Skill": "Class" };
    return options.map(([name, info]) => ({
      value: name, label: name,
      art: name === "Any ATK" ? CATALOG.allAtk : ch?.skillArt?.[skillKeys[name]] || CATALOG.memoryResonances[name]
        || (!ch && name === "Basic Attack" ? ED_BASIC_ATTACK_ART : ED_BLANK_RESONANCE),
      info
    }));
  }
  if (kind === "wh") return CATALOG.harmony.map(name => ({
    value: name, label: name, art: memFile(name, "WH", "png"), info: edMemInfo(name)
  }));
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
  const anchorTop = rect.top - bounds.top, anchorBottom = rect.bottom - bounds.top;
  const gap = 6, inset = 8;
  const belowSpace = stage.clientHeight - anchorBottom - gap - inset;
  const aboveSpace = anchorTop - gap - inset;
  const below = belowSpace >= aboveSpace;
  const available = Math.max(1, below ? belowSpace : aboveSpace);
  picker.style.width = `${width}px`;
  picker.style.left = `${left}px`;
  picker.style.maxHeight = `${Math.min(available, window.innerHeight * .7, 500)}px`;
  const height = picker.offsetHeight;
  picker.style.top = `${below ? anchorBottom + gap : Math.max(inset, anchorTop - height - gap)}px`;
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
  picker.innerHTML = `<div class="ed-picker-head"><strong>${esc(title)}</strong><small>Choose an icon</small></div>
    <button type="button" class="ed-picker-close" data-ed-picker-close aria-label="Close">×</button>
    <input id="edPickerSearch" type="search" placeholder="Search ${esc(ED_PICKER_LABELS[kind])}" aria-label="Search ${esc(ED_PICKER_LABELS[kind])}" autocomplete="off">
    <div id="edPickerOptions" class="ed-picker-options" role="group" aria-label="${esc(title)} options">
      ${choices.map(option => `<button type="button" class="ed-picker-option${option.value === current ? " on" : ""}"
        data-ed-picker-value="${esc(option.value)}" data-ed-picker-search="${esc(`${option.label} ${option.info || ""}`.toLowerCase())}"
        aria-pressed="${option.value === current}"${tipAttr(option.label, option.info || "")}>
        ${option.art ? pic(option.art) : `<span class="ed-picker-noart" aria-hidden="true">×</span>`}<span>${esc(option.label)}</span></button>`).join("")}
    </div><p class="ed-picker-empty" hidden>No options match this search.</p>`;
  picker.querySelectorAll("img").forEach(img => { img.draggable = false; });
  picker.hidden = false;
  edPositionPicker(picker, stage, anchor);
  picker.querySelector("#edPickerSearch")?.focus({ preventScroll: true });
}
function edShowResonanceMenu(i, anchor, selectedSlot = -1, side = "") {
  const picker = $("#edPicker"), stage = $("#edStage");
  if (!picker || !stage || !anchor) return;
  clearTimeout(edTimer);
  edTimer = 0;
  const c = edDraft.cards[i], choosing = selectedSlot >= 0;
  const options = choosing ? edPickerOptions("memres", i, side) : [];
  const current = choosing ? c.memRes[selectedSlot][side === "bottom" ? 1 : 0] : "";
  edPickerTarget = { kind: "memresmenu", card: i, slot: selectedSlot, side };
  anchor.setAttribute("aria-expanded", "true");
  picker.className = `ed-picker ed-res-menu${choosing ? " has-options" : ""}`;
  picker.innerHTML = `<div class="ed-picker-head"><strong>${ED_SLOTS[i]} · Memory resonances</strong><small>Choose a memory and resonance side</small></div>
    <button type="button" class="ed-picker-close" data-ed-picker-close aria-label="Close">×</button>
    <div class="ed-res-menu-list">${c.memRes.map(([upper, bottom], slot) => `<section class="ed-res-menu-row">
      <strong>Memory ${slot + 1}</strong>
      <button type="button" data-ed-mem-side="top" data-ed-mem-slot="${slot}" aria-pressed="${choosing && selectedSlot === slot && side === "top"}" aria-label="Memory ${slot + 1}, Upper resonance">
        <small>UPPER</small><span>${esc(upper)}</span></button>
      <button type="button" data-ed-mem-side="bottom" data-ed-mem-slot="${slot}" aria-pressed="${choosing && selectedSlot === slot && side === "bottom"}" aria-label="Memory ${slot + 1}, Bottom resonance">
        <small>BOTTOM</small><span>${esc(bottom)}</span></button>
    </section>`).join("")}</div>`;
  if (choosing) picker.insertAdjacentHTML("beforeend", `<div class="ed-res-menu-options">
    <strong class="ed-res-menu-choice-head">Memory ${selectedSlot + 1} · ${side === "bottom" ? "Bottom" : "Upper"} resonance</strong>
    <div class="ed-picker-options" role="group" aria-label="Memory ${selectedSlot + 1}, ${side === "bottom" ? "Bottom" : "Upper"} resonance options">
      ${options.map(option => `<button type="button" class="ed-picker-option${option.value === current ? " on" : ""}"
        data-ed-memres-value="${esc(option.value)}" aria-pressed="${option.value === current}"${tipAttr(option.label, option.info || "")}>
        ${option.art ? pic(option.art) : `<span class="ed-picker-noart" aria-hidden="true">×</span>`}<span>${esc(option.label)}</span></button>`).join("")}
    </div></div>`);
  picker.querySelectorAll("img").forEach(img => { img.draggable = false; });
  picker.hidden = false;
  edPositionPicker(picker, stage, anchor);
}
function edFilterPicker(query) {
  const term = query.trim().toLowerCase();
  let visible = 0;
  $("#edPickerOptions")?.querySelectorAll(".ed-picker-option").forEach(option => {
    const matches = option.dataset.edPickerSearch.includes(term);
    option.hidden = !matches;
    if (matches) visible++;
  });
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
      node.setAttribute("aria-label", `${labels[drop]} selector`);
      node.title = `Choose ${labels[drop]}`;
    };
    const c = edDraft.cards[i], cardMemories = $(".mem", el);
    const memoryGroup = document.createElement("div");
    memoryGroup.className = "ed-memory-group";
    cardMemories.before(memoryGroup);
    memoryGroup.insertAdjacentHTML("beforeend", `<button type="button" class="ed-memory-resonance-button" data-ed-memres-menu="${i}"
      aria-haspopup="dialog" aria-controls="edPicker" aria-expanded="false">Memory Resonances</button>`);
    memoryGroup.append(cardMemories);
    mark($(".portrait", el), "char");
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
      skill.title = `C.U.B. skill ${k + 1}. Click another skill on this C.U.B. to swap positions.`;
    });
    el.querySelectorAll(".tag.captain,.tag.starter").forEach(tag => {
      const roleName = tag.classList.contains("captain") ? "captain" : "starter";
      tag.dataset.edRole = roleName;
      tag.draggable = true;
      tag.title = `Drag to move ${roleName === "captain" ? "Captain" : "Starter"} to another position`;
    });
    res.setAttribute("aria-label", `Memory resonances. Upper: ${edResonanceSummary(c.memRes.map(pair => pair[0]))}. Bottom: ${edResonanceSummary(c.memRes.map(pair => pair[1]))}.`);
  });
}
function edRender() {
  const stage = $("#edStage");
  if (!stage) return;
  stage.innerHTML = edStageBody();
  edWire();
  edPaint();
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
const edStatus = text => {
  const box = $("#edStatus");
  if (box) box.textContent = text;
};

/* Each position keeps its Notes and Rotation fields visible below the team cards. */
function edDetailBody() {
  return edDraft.cards.map((c, i) => {
    const ch = edChar(c.char), name = key => `c${i}.${key}`;
    return `<fieldset class="ed-card ed-detail ed-${ED_BARS[i]}">
      <legend>${ED_SLOTS[i]} · ${esc(ch?.name || "No character")}</legend><div class="ed-detail-fields">
    ${edField("Notes", `<textarea name="${name("desc")}" rows="8" maxlength="${ED_LIMITS.desc}" placeholder="Why this build, and what to change at other ranks">${esc(c.desc)}</textarea>`)}
    ${edField("Rotation · one step per line, # starts a turn", `<textarea name="${name("rotation")}" rows="10" maxlength="${ED_LIMITS.rotation}" placeholder="${esc(ED_ROTATION_HINT)}">${esc(c.rotation)}</textarea>`)}
      </div></fieldset>`;
  }).join("");
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
      c.char = name;
      if (!c.cub) c.cub = edChar(name)?.construct || "";
    }
  } else if (kind === "char") c.char = "";
  else if (kind === "cub") {
    if (c.cub !== name) c.cubSkills = ED_CUB_SKILL_ORDER.slice();
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
    const team = $("#edTeam");
    if (team) team.innerHTML = edTeamBody(edDraft); // The Captain and Starter options carry the characters' names
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
  queueMicrotask(() => { edWire(); edPaint(); });
  return `<h1>Team Builder</h1>
    <ul class="ed-help">
      <li>Click any equipment slot to search and choose from its icons. Right-click an equipped item to remove it.</li>
      <li>Click one C.U.B. skill and then another to swap their positions, or drag Captain and Starter to another position.</li>
      <li>Use the RES button on the memory box to set each memory's Upper and Bottom resonance.</li>
      <li>Choose None in a selector to clear its slot. Selecting a character already on the team moves it to the chosen slot.</li>
      <li>Notes and Rotation stay visible below the cards for each team position.</li>
      <li>The team stays saved in this browser, and you can share it as a link or an image.</li>
      <li>You can also send it to the site: after a review, it shows up on its page with the other builds.</li>
    </ul>
    <form id="edForm" class="ed" autocomplete="off">
      <fieldset id="edTeam" class="ed-team">${edTeamBody(edDraft)}</fieldset>
      <div class="ed-studio">
        <div class="ed-work">
          <div class="comp-tools ed-tools"><span id="edStatus" class="ed-status" role="status">${esc(message)}</span>
            <button type="button" class="tool" data-ed="link">Copy link</button>
            <button type="button" class="tool" data-export>Export image</button>
            <button type="button" class="tool" data-ed="send">Submit for review</button>
            <button type="button" class="tool" data-ed="reset">Start over</button></div>
          <div id="edStage">${edStageBody()}</div>
          <div id="edDetail">${edDetailBody()}</div>
          <div id="edSend" class="ed-send" hidden>
            <p class="ed-hint">Your team goes to a review queue. Once approved, it shows up on its page as a community build.</p>
            <label class="ed-field"><span>Your name · optional</span><input id="edAuthor" maxlength="32" autocomplete="off"></label>
            <label class="ed-trap" aria-hidden="true">Website<input id="edWebsite" tabindex="-1" autocomplete="off"></label>
            <div id="edCaptcha"></div>
            <button type="button" class="tool" data-ed="confirm" disabled>Send team</button>
          </div>
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
});
addEventListener("submit", e => { if (e.target.id === "edForm") e.preventDefault(); });
addEventListener("dragstart", e => {
  const role = e.target.closest?.("#edStage [data-ed-role]");
  if (!role) {
    if (e.target.closest?.("#edStage")) e.preventDefault();
    return;
  }
  edDraggingRole = role.dataset.edRole;
  e.dataTransfer?.setData("text/plain", edDraggingRole);
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
});
addEventListener("dragover", e => {
  if (!edDraggingRole) return;
  const card = e.target.closest?.("#edStage .card");
  if (!card) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  $("#edStage").querySelectorAll(".ed-role-drop-target").forEach(el => el.classList.remove("ed-role-drop-target"));
  card.classList.add("ed-role-drop-target");
});
addEventListener("dragleave", e => {
  const card = e.target.closest?.("#edStage .card");
  if (card && !card.contains(e.relatedTarget)) card.classList.remove("ed-role-drop-target");
});
addEventListener("drop", e => {
  const card = e.target.closest?.("#edStage .card");
  if (!card || !edDraggingRole) return;
  e.preventDefault();
  const role = edDraggingRole, position = Number(card.dataset.edCard);
  edDraggingRole = "";
  $("#edStage").querySelectorAll(".ed-role-drop-target").forEach(el => el.classList.remove("ed-role-drop-target"));
  if (!Number.isInteger(position) || !edDraft.cards[position]) return;
  edDraft[role] = position;
  edSave();
  edRender();
});
addEventListener("dragend", () => {
  edDraggingRole = "";
  $("#edStage")?.querySelectorAll(".ed-role-drop-target").forEach(el => el.classList.remove("ed-role-drop-target"));
});
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
  if (edPickerTarget?.kind === "memresmenu" && e.target.closest?.("[data-ed-memres-value]")) {
    const { card, slot, side } = edPickerTarget;
    edDraft.cards[card].memRes[slot][side === "bottom" ? 1 : 0] = e.target.closest("[data-ed-memres-value]").dataset.edMemresValue;
    edDraft.cards[card].res = edDraft.cards[card].memRes[0][0];
    edDraft.cards[card].core = edDraft.cards[card].memRes[0][1];
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
      }
      edCubSkillPick = null;
      edRender();
      edStatus("C.U.B. skill positions updated.");
    } else {
      edCubSkillPick = { card, index };
      edRender();
      edStatus("Choose another skill on this C.U.B. to swap positions.");
    }
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
    if (button.dataset.ed === "link") {
      const link = `${location.origin}/editor#t=${edEncode(edDraft)}`;
      navigator.clipboard?.writeText(link).then(() => edStatus("Link copied."), () => edStatus(`Copy this link: ${link}`))
        ?? edStatus(`Copy this link: ${link}`);
    }
    return;
  }
  if (!$("#edStage") || e.defaultPrevented) return; // a tap on a card at the side only slides it to the center
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
