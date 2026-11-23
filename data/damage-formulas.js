/* Damage engine: pure functions, no DOM, so tools/test-damage.mjs can run them in Node.
   The research behind every rule is in docs/calculo-de-dano.md. Main sources:
   - https://grayravens.com/wiki/Damage_Details (Physical and Elemental DMG factors)
   - Bilibili wiki "伤害公式与原理" (2021) and its damage calculator
   - TapTap "战双伤害机制讲解" (2025-02-19)
   - The in-game "DMG Boost Description" screen (which factors each damage type takes)
   - Patch notes 2026-08-17: Physical DMG no longer varies

   Energy hit:
     scale × (baseATK × (1 + ATK%) + finalATK) × (1 + DMG of its element) × (1 + Base DMG of its skill)
       × (1 + Extra DMG Bonus) × (1 − resistance + resistance reduction) × (1 − Extra DMG Reduction + reduction of it)
     Physical also takes (1 − DEF), the armor bar (+20% Physical resistance) and CRIT.
     Elemental takes no DEF, no armor bar and never crits.
   Effect hit (Ignition, Plasma Beam...): the official screen lists its factors, but nobody published how they
   combine. The engine multiplies them like the energy ones and marks the result as assumed.

   Numbers are fractions: 0.2 is 20%, and a 200% skill has scale 2.

   A buff is { source, factor, value, ... }:
     factor  "atk" (ATK%), "finalAtk" (flat ATK added after ATK%), "baseAtk" (flat ATK added before ATK%, like a
             weapon resonance that raises the weapon's own ATK), "dmg" (DMG of an element), "effectDmg", "baseDmg", "extraDmg",
             "critRate", "critDmg", and on the enemy "defDown", "resDown", "effectResDown", "extraRedDown"
     element for "dmg"/"resDown": "Physical", "Fire", "Ice", "Lightning", "Dark", "Nihil",
             "Elemental" (every element but Physical) or "All"
     effect  for "effectDmg"/"effectResDown": "Ignition", "Plasma Beam", "Glaciation", "Ultima Slash", "Darkflow",
             "Raydiance", "Disruption"
     skill   the skill name (or list of names) the buff is limited to; without it, it reaches every hit
     "times" multiplies the hit by value on its own, for texts like "deals double DMG" that don't name a factor
     assumed a note shown with the result when the buff's reading has no source
     weakness true on a resistance reduction that is a Weakness: effect hits don't take Energy Weakness
     stacks  how many stacks are up (value is per stack)
     duration seconds, for rotationDamage; without it the buff lasts the whole rotation
   Buffs from the same source don't stack (the game only renews the duration): only the strongest counts.
   Buffs of the same factor add up; different factors multiply. */

// Which factors each kind of hit takes, from the in-game "DMG Boost Description" screen.
// Raydiance also takes the Lightning, Plasma Beam and Raydiance factors, and Energy Weakness.
const FACTOR_MATRIX = {
  energy: { energyRes: true, energyDmg: true, energyWeak: true, effectRes: false, effectDmg: false, effectWeak: false },
  effect: { energyRes: true, energyDmg: true, energyWeak: false, effectRes: true, effectDmg: true, effectWeak: true },
  raydiance: { energyRes: true, energyDmg: true, energyWeak: true, effectRes: true, effectDmg: true, effectWeak: true }
};
const DAMAGE_ELEMENTS = ["Physical", "Fire", "Ice", "Lightning", "Dark", "Nihil"];
const DAMAGE_EFFECT_OF = { Raydiance: ["Plasma Beam", "Raydiance"] };
// 100 CRIT stat gives 3% CRIT Rate (Gray Ravens wiki)
const CRIT_PER_STAT = 0.0003;
// The armor bar adds 20% Physical resistance; elemental ignores it (Bilibili 2021, TapTap 2025)
const ARMOR_BAR_RES = 0.2;

// Ranks in order. Every rank but SSS+ has 10 Phases (in-game Evolve guide)
const RANKS = ["B", "A", "S", "SS", "SSS", "SSS+"];
// What each Phase gives, the same in every rank (in-game Evolution Overview, Selena: Pianissimo, 2026-11-20):
// Phase 1 ATK +10, 2 HP +50, 3 DEF +5, 4 CRIT +5, 5 HP +50, and 6-10 repeat it
const PHASE_STATS = [["atk", 10], ["hp", 50], ["def", 5], ["crit", 5], ["hp", 50]];
// Stats from Phases: all 10 of each rank from the frame's starting rank up to the current one, plus `phase` of the
// current one. A full rank gives HP +200, ATK +20, DEF +10, CRIT +10, which is the "Phase Bonus" of the Stats Growth screen.
function phaseBonus(startRank, rank, phase = 0) {
  const from = RANKS.indexOf(startRank), to = RANKS.indexOf(rank);
  if (from < 0 || to < from) throw new Error(`Rank ${rank} can't come from ${startRank}`);
  const phases = (to - from) * 10 + (rank === "SSS+" ? 0 : Math.min(10, phase));
  const out = { hp: 0, atk: 0, def: 0, crit: 0 };
  for (let i = 0; i < phases; i++) {
    const [stat, value] = PHASE_STATS[i % PHASE_STATS.length];
    out[stat] += value;
  }
  return out;
}

// A frame's own stats, before weapon, memories and CUB: base at level 1 + growth of the current rank for each level
// after the first + promotion + Phases. frame is a FRAME_STATS entry; stats are [HP, ATK, DEF, CRIT], null when unknown.
function frameStats(frame, { rank, phase = 0, level = 80 }) {
  const growth = frame.growth[rank];
  if (!growth) throw new Error(`No growth for rank ${rank}`);
  const phases = phaseBonus(frame.start, rank, phase);
  return ["hp", "atk", "def", "crit"].map((stat, i) => frame.base[i] === null || growth[i] === null ? null
    : frame.base[i] + growth[i] * (level - 1) + frame.promote[i] + phases[stat]);
}

// Memory slots 1-3 give only HP and CRIT, slots 4-6 only ATK and DEF, the same in any slot of the row
// (Gray Ravens "Beginner's Guide"; TapTap 2021 with Frederick's numbers, the same as MEMORY_STATS).
// Each memory has 2 resonances, and each hypertuned one raises that piece's stats (in-game, 2026-11-20):
// slots 1-3 HP +17.5% and CRIT +12.5%, slots 4-6 ATK +17.5% and DEF +12.5%. Resonance stats (HP +75, ATK +15...) are flat.
// The two hypertunes multiply (× 1.175²): checked against Selena's in-game ATK, DEF and CRIT, it misses by 4 at most,
// where adding them (+35%) misses by 9. Not confirmed by any source; see docs/calculo-de-dano.md.
const HYPERTUNE = { upper: { hp: 0.175, crit: 0.125 }, lower: { atk: 0.175, def: 0.125 } };
/* Stats from the 6 memories, as [HP, ATK, DEF, CRIT].
   pieces: 6 entries in slot order, { name, hypertunes: 0-2, resonances: [{ hp?, atk?, def?, crit? }] }
   stats: MEMORY_STATS (assets-data.js), name: [ATK, DEF, CRIT, HP] */
function memoryTotals(pieces, stats) {
  const out = { hp: 0, atk: 0, def: 0, crit: 0 };
  pieces.forEach((piece, slot) => {
    if (!piece) return;
    const [atk, def, crit, hp] = stats[piece.name];
    const own = slot < 3 ? { hp, crit } : { atk, def };
    const tune = HYPERTUNE[slot < 3 ? "upper" : "lower"];
    for (const [stat, value] of Object.entries(own)) out[stat] += value * (1 + tune[stat]) ** (piece.hypertunes ?? 0);
    for (const res of piece.resonances ?? []) for (const stat in out) out[stat] += res[stat] ?? 0;
  });
  return [out.hp, out.atk, out.def, out.crit];
}

// A skill's multiplier at another level, from its level 18 value: level 1 is half of level 18, and it grows
// linearly (Bilibili wiki). Skills that don't scale carry fixed: true.
const skillScale = (scale18, level = 18, fixed = false) => fixed ? scale18 : scale18 * (level + 16) / 34;

// DEF reduction multiplies the "protection" DEF / (1 − DEF), not the DEF itself. DEF can't go under 0.
function defAfterReduction(def, reduction) {
  if (def <= 0) return 0;
  const protection = def / (1 - def) * Math.max(0, 1 - reduction);
  return protection / (1 + protection);
}

// Does a buff for this element reach a hit of that element? An Annihilator in the team makes every elemental
// DMG and resistance reduction count for all elements (class text in skills-data.js); Physical isn't elemental.
function elementMatches(buffElement, hitElement, annihilator) {
  if (buffElement === "All" || buffElement === hitElement) return true;
  const elemental = hitElement !== "Physical";
  if (buffElement === "Elemental") return elemental;
  return annihilator && elemental && buffElement !== "Physical";
}

// Keeps one buff per source (the strongest) and drops the ones that don't reach this hit
function activeBuffs(buffs, hit, annihilator) {
  const effects = DAMAGE_EFFECT_OF[hit.effect] ?? (hit.effect ? [hit.effect] : []);
  const reaches = b => {
    if (b.skill && ![b.skill].flat().includes(hit.skill)) return false;
    if (b.factor === "dmg" || b.factor === "resDown") return elementMatches(b.element ?? "All", hit.element, annihilator);
    if (b.factor === "effectDmg" || b.factor === "effectResDown") return effects.includes(b.effect);
    return true;
  };
  const bySource = new Map();
  buffs.filter(reaches).forEach((b, i) => {
    const key = b.source ?? `#${i}`;
    const old = bySource.get(key);
    if (!old || buffValue(b) > buffValue(old)) bySource.set(key, b);
  });
  return [...bySource.values()];
}
const buffValue = b => b.value * (b.stacks ?? 1);
const sum = (buffs, test) => buffs.filter(test).reduce((total, b) => total + buffValue(b), 0);

/* Damage of one hit.
   hit: { scale (level 18), kind: "energy" | "effect" | "raydiance", element, effect?, skill?, fixed?, count? }
   ctx: { atk: { base, pct?, final? }, critStat?, level?, crit?: "average" | "crit" | "normal", annihilator?,
          target: { def?, physRes?, res?: { Fire: 0.24, ... }, effectRes?: { Ignition: ... }, extraRed?, armorBar? },
          buffs? }
   Returns { damage, factors: [[name, multiplier]], assumed: [what has no source] }. */
function hitDamage(hit, ctx) {
  const kind = hit.kind ?? "energy";
  const matrix = FACTOR_MATRIX[kind];
  if (!matrix) throw new Error(`Unknown hit kind: ${kind}`);
  if (!DAMAGE_ELEMENTS.includes(hit.element)) throw new Error(`Unknown element: ${hit.element}`);
  const buffs = activeBuffs(ctx.buffs ?? [], hit, ctx.annihilator);
  const target = ctx.target ?? {};
  const physical = hit.element === "Physical";
  const energyHit = kind === "energy";
  const factors = [];
  const assumed = [];
  const add = (name, value) => factors.push([name, value]);
  const of = factor => sum(buffs, b => b.factor === factor);

  add("Skill multiplier", skillScale(hit.scale, ctx.level, hit.fixed) * (hit.count ?? 1));
  const atk = ctx.atk ?? { base: 0 };
  add("ATK", (atk.base + of("baseAtk")) * (1 + (atk.pct ?? 0) + of("atk")) + (atk.final ?? 0) + of("finalAtk"));
  if (matrix.energyDmg) add(`${hit.element} DMG`, 1 + of("dmg"));
  if (matrix.effectDmg) add(`${hit.effect} DMG`, 1 + of("effectDmg"));
  add("Base DMG", 1 + of("baseDmg"));
  add("Extra DMG Bonus", 1 + of("extraDmg"));
  for (const b of buffs.filter(b => b.factor === "times")) add(b.source ?? "× DMG", b.value);
  for (const b of buffs) if (b.assumed) assumed.push(b.assumed);

  if (matrix.energyRes) {
    let res = physical ? (target.physRes ?? 0) + (target.armorBar && energyHit ? ARMOR_BAR_RES : 0) : (target.res?.[hit.element] ?? 0);
    res -= sum(buffs, b => b.factor === "resDown" && (matrix.energyWeak || !b.weakness));
    // Resistance can go negative, which raises the damage (TapTap 2025)
    add(`${hit.element} Resistance`, 1 - res);
  }
  if (matrix.effectRes) {
    const res = (target.effectRes?.[hit.effect] ?? 0) - sum(buffs, b => b.factor === "effectResDown" && (matrix.effectWeak || !b.weakness));
    add(`${hit.effect} Resistance`, 1 - res);
  }
  add("Extra DMG Reduction", 1 - (target.extraRed ?? 0) + of("extraRedDown"));

  if (physical && energyHit) {
    add("DEF", 1 - defAfterReduction(target.def ?? 0, of("defDown")));
    // A CRIT doubles the hit before CRIT DMG bonuses (Gray Ravens wiki, TapTap 2025). Physical DMG has no variance
    // since 2026-08-17.
    const critMult = 2 * (1 + of("critDmg"));
    const rate = Math.min(1, Math.max(0, (ctx.critStat ?? 0) * CRIT_PER_STAT + of("critRate")));
    const mode = ctx.crit ?? "average";
    if (mode === "crit") add("CRIT", critMult);
    else if (mode === "average") add(`CRIT (${Math.round(rate * 1000) / 10}% rate)`, 1 + rate * (critMult - 1));
  }
  if (!energyHit) assumed.push(`${hit.effect ?? kind} DMG: the factors come from the game, how they combine has no published source`);

  return { damage: factors.reduce((total, [, value]) => total * value, 1), factors, assumed };
}

// Has the frame reached a rank such as "SS" or "SS3" (rank + Phase)?
function rankReached(rank, phase, need) {
  if (!need) return true;
  const [, needRank, needPhase = 0] = need.match(/^(S+\+?)(\d*)$/) ?? [];
  const have = RANKS.indexOf(rank), want = RANKS.indexOf(needRank);
  return have > want || (have === want && phase >= +needPhase);
}
/* Every move of a kit (DAMAGE_KITS in damage-data.js) with the panel's choices.
   opts: { rank, phase, mode: "energy" | "effect", levels: { red: 18, ... }, on: Set of option ids, atk, critStat,
           crit, target, extraBuffs? }
   In "effect" mode, a move with an Effect version uses it and Effect-only moves show; in "energy" mode they hide,
   except moves marked always (Effect hits that happen without the Effect active, like Kamui's Firelit Thunder).
   Returns [{ name, kind, element, level, scale, damage, factors, assumed }]. */
function kitDamage(kit, opts) {
  const level = key => key === "fixed" ? 18 : opts.levels?.[key] ?? 18;
  const buffs = [...(opts.extraBuffs ?? [])];
  for (const option of kit.options ?? []) {
    if (!opts.on?.has(option.id) || !rankReached(opts.rank, opts.phase ?? 0, option.rank)) continue;
    const grow = option.level ? skillScale(1, level(option.level)) : 1;
    // A buff can also need a rank of its own (the part of an option that a higher rank adds)
    buffs.push(...option.buffs.filter(b => rankReached(opts.rank, opts.phase ?? 0, b.rank))
      .map(b => b.factor === "times" ? b : { ...b, value: b.value * grow }));
  }
  const rows = [];
  for (const move of kit.moves) {
    if (!rankReached(opts.rank, opts.phase ?? 0, move.rank)) continue;
    const effectHit = move.energy === undefined || (opts.mode === "effect" && move.effect !== undefined);
    if (effectHit && opts.mode !== "effect" && !move.always) continue;
    const hit = effectHit
      ? { scale: move.effect, kind: "effect", element: kit.effectElement, effect: kit.effect }
      : { scale: move.energy, kind: "energy", element: kit.element ?? "Physical" };
    const own = move.base ? [{ source: move.name, factor: "baseDmg", value: move.base }] : [];
    const result = hitDamage({ ...hit, skill: move.name, fixed: move.level === "fixed" }, {
      atk: { base: opts.atk }, critStat: opts.critStat, crit: opts.crit, level: level(move.level), target: opts.target,
      buffs: [...buffs, ...own]
    });
    rows.push({ name: move.name, kind: hit.kind, element: hit.element, level: move.level === "fixed" ? null : level(move.level),
      scale: skillScale(hit.scale, level(move.level), move.level === "fixed"), ...result });
  }
  return rows;
}
// The in-game ATK and CRIT of a kit's reference build at a rank: frame + weapon + memories.
// weapons: WEAPON_STATS ([ATK, CRIT]), memories: MEMORY_STATS, both from assets-data.js
function buildStats(frame, build, { rank, phase = 0 }, weapons, memories) {
  const [, atk, , crit] = frameStats(frame, { rank, phase });
  const [wAtk, wCrit] = weapons[build.weapon];
  // build.slotResonances: one stat resonance per slot; otherwise build.resonances on every piece
  const mem = memoryTotals(build.memories.map((name, i) => ({ name, hypertunes: build.hypertunes,
    resonances: build.slotResonances ? [build.slotResonances[i]] : build.resonances })), memories);
  return { atk: atk + wAtk + mem[1], crit: crit + wCrit + mem[3] };
}
// An ENEMY_PRESETS entry as the target hitDamage takes
const presetTarget = p => ({ def: p.def, physRes: p.physRes, extraRed: p.extraRed,
  res: Object.fromEntries(DAMAGE_ELEMENTS.filter(e => e !== "Physical").map(e => [e, p.res?.[e] ?? p.elemRes])) });

/* Damage of a rotation.
   actions: [{ t (seconds), skill?, hits: [hit], buffs?: [buff] }]. An action's buffs start at its t, before its own
   hits; put a buff on its own action to start it after them. A buff with the source of one still up replaces it,
   which renews the duration.
   ctx: as in hitDamage; ctx.buffs last the whole rotation.
   Returns { total, actions: [{ t, skill, damage }], bySkill: { name: damage }, assumed: [unique notes] }. */
function rotationDamage(actions, ctx) {
  let timed = [];
  const out = { total: 0, actions: [], bySkill: {}, assumed: [] };
  for (const action of [...actions].sort((a, b) => a.t - b.t)) {
    for (const buff of action.buffs ?? []) {
      timed = timed.filter(b => buff.source === undefined || b.source !== buff.source);
      timed.push({ ...buff, start: action.t });
    }
    const up = timed.filter(b => b.duration === undefined || action.t < b.start + b.duration);
    let damage = 0;
    for (const hit of action.hits ?? []) {
      const result = hitDamage({ skill: action.skill, ...hit }, { ...ctx, buffs: [...(ctx.buffs ?? []), ...up] });
      damage += result.damage;
      result.assumed.forEach(note => out.assumed.includes(note) || out.assumed.push(note));
    }
    const skill = action.skill ?? "?";
    out.actions.push({ t: action.t, skill, damage });
    out.bySkill[skill] = (out.bySkill[skill] ?? 0) + damage;
    out.total += damage;
  }
  return out;
}
