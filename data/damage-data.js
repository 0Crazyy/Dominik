/* Game data for the damage engine (data/damage-formulas.js), only for the frames it covers so far.
   Every entry says where its numbers come from. Nothing here is estimated: a missing number stays missing.

   FRAME_STATS: name: {
     start:   the rank the frame starts at (its Phases count from there)
     base:    stats at level 1 of the starting rank, as [HP, ATK, DEF, CRIT]; null where no source agrees
     growth:  per rank, the "Growth" column of the Stats Growth screen, as [HP, ATK, DEF, CRIT] per level
     promote: the stats of the Promote screen at max promotion, as [HP, ATK, DEF, CRIT]
     source, checked } */
const FRAME_STATS = {
  "Selena: Pianissimo": {
    start: "S",
    // Bilibili wiki (https://wiki.biligame.com/zspms/赛琳娜·希声, 2026-07-24) lists level 1 / level 80 of rank S, with the
    // rows mislabeled: the "CRIT" row (102 / 459) grows 4.52 per level, which is the in-game ATK growth, the "ATK" row
    // (64 / 287) grows 2.83 like DEF, and the "DEF" row (40 / 182) grows 1.79 like CRIT. The HP row (418 / 1507) matches
    // no growth, so HP stays unknown. The same rows show that a level adds growth from level 2 on: level − 1 steps.
    base: [null, 102, 64, 40],
    growth: {
      S: [18.46, 4.52, 2.83, 1.79],
      SS: [22.19, 5.44, 3.40, 2.15],
      SSS: [25.91, 6.35, 3.97, 2.51],
      "SSS+": [29.63, 7.26, 4.54, 2.87]
    },
    promote: [1323, 324, 202, 128],
    source: "In-game Stats Growth and Promote screens; base from the Bilibili wiki",
    checked: "2026-11-20"
  },
  "Kamui: Aeternion": {
    start: "S",
    // Bilibili wiki (https://wiki.biligame.com/zspms/神威·不落日, 2026-07-17), rows labeled right this time: rank S level
    // 1 / 80 = ATK 92 / 413, DEF 64 / 287, CRIT 40 / 182; the S growth below comes from those (level − 1 steps).
    // With the user's build the sum is ATK 1880 against 1874 in game (0.3% high; Selena was 0.2% high, and DEF and CRIT
    // miss by the same 1.3 and 1.4 on both frames: a rounding the engine doesn't copy)
    base: [null, 92, 64, 40],
    growth: {
      S: [null, 4.063, 2.823, 1.797],
      SS: [24.22, 4.89, 3.40, 2.15],
      SSS: [28.29, 5.71, 3.97, 2.51],
      "SSS+": [32.35, 6.53, 4.54, 2.87]
    },
    promote: [1444, 291, 202, 128],
    source: "In-game Stats Growth and Promote screens; base and S growth from the Bilibili wiki",
    checked: "2026-11-20"
  },
  "Vera: Geiravor": {
    start: "S",
    // Bilibili wiki (https://wiki.biligame.com/zspms/薇拉·灼惘, 2026-06-10), rows labeled right: rank S level 1 / 80 =
    // HP 461 / 2069, ATK 89 / 402, DEF 68 / 307, CRIT 38 / 171, which grow by the in-game S growth below.
    // With the user's SSS+ build the sum is ATK 2012 against 2002 in game (0.5% high), DEF 12 low and CRIT 7 high:
    // see docs/calculo-de-dano.md
    base: [461, 89, 68, 38],
    growth: {
      S: [20.35, 3.96, 3.03, 1.69],
      SS: [24.45, 4.76, 3.64, 2.03],
      SSS: [28.56, 5.55, 4.25, 2.38],
      "SSS+": [32.65, 6.35, 4.86, 2.72]
    },
    promote: [1458, 283, 216, 121],
    source: "In-game Stats Growth and Promote screens; base from the Bilibili wiki",
    checked: "2026-11-20"
  }
};

/* DAMAGE_KITS: name: {
     effect, effectElement: the frame's Effect, and the element whose Resistance and DMG its Effect hits take
       (the in-game "DMG Boost Description" pairs Glaciation with Ice); effectLabel: when the Effect versions happen
     build: the reference build the panel starts from: rank, weapon, memories in slot order, hypertunes and stat
       resonances per memory. Skill levels are not part of it: the panel starts every skill at 18 and the player
       adds what resonances and Harmony give
     moves: [{ name, level, energy?, effect?, rank? }]
       level   which skill level scales it: red, yellow, blue, basic, core, signature, qte, class, or fixed (never scales)
       energy  multiplier at skill level 18 of the Energy version (2 = 200%)
       effect  multiplier of the Effect version (the "When there are Ice Spikes, deals X Glaciation DMG instead" text).
               A move with only effect is an Effect hit; a move with both swaps with the panel's Energy / Effect switch
       rank    rank (and Phase) it unlocks at, as "SS" or "SS3"
       icon    the skill icon (skills/<icon>.png) when the level doesn't name it; Effect hits show the Effect icon
       always  an Effect-only move that also happens without the Effect active (shown in both modes)
     element: the frame's element (Physical when missing). Frames without FRAME_STATS have no build ATK: the panel
       asks for the ATK shown in the game
     options: [{ id, group, label, on, rank?, buffs }]: what the panel can switch on. on: true = on by default.
       Weapon resonances and the sets of memories other than the frame's signature memory (SIGNATURE_MEMORY) start off
       group: class, weapon, memories, skills, team or rank (the panel's sections); label: "Name: what it does";
       a "skills" option shows inside the box of one skill: "at" names its level key (red, basic, core...), or else
       the box of the first move its buffs name. A "rank" option has no switch: the chosen rank turns it on;
       excludes: the id (or a list of ids) of options that can't be on at the same time (turning one on turns those off)
       buffs use the format at the top of damage-formulas.js; "skill" limits a buff to moves of that name (or names),
       and "rank" makes one buff of the option wait for a higher rank */
const SELENA_SIGNATURES = ["Signature - Majestic Interlude", "Signature - Note of Termination"];
const DAMAGE_KITS = {
  "Selena: Pianissimo": {
    effect: "Glaciation",
    effectElement: "Ice",
    effectLabel: "Ice Spikes up",
    source: "https://huaxu.app/na/wiki/constructs/pianissimo/skills (game text, values at skill level 18)",
    checked: "2026-11-20",
    // Checked against the user's in-game recordings (docs/calculo-de-dano.md)
    verified: true,
    // The user's account on 2026-11-20 (in-game ATK 1953, DEF 1390, CRIT 936 at SS0)
    build: {
      rank: "SS",
      weapon: "Orpheus' Lullaby",
      memories: ["Burana", "Burana", "Burana", "Cottie", "Burana", "Cottie"],
      hypertunes: 2,
      resonances: [{ atk: 15, crit: 15 }],
      // Harmony Absorption on Cottie makes its 2 pieces count as 4
      resonanceText: "ATK +15 / CRIT +15 resonances"
    },
    moves: [
      { name: "Red Orb (3-Ping)", level: "red", energy: 3.6 },
      { name: "Yellow Orb (3-Ping)", level: "yellow", energy: 4.2 },
      { name: "Rhythmic Piercing", level: "blue", energy: 6.4, effect: 13 },
      { name: "Basic Attack - Intro (all hits)", level: "basic", energy: 7.3 },
      { name: "Basic Attack - Inverse Chord (all hits)", level: "basic", energy: 8.88 },
      { name: "Basic Attack - Echoing Melody", level: "basic", energy: 3.2, effect: 6 },
      { name: "Basic Attack - Inverted Divisi", level: "basic", energy: 4 },
      { name: "Concerto Orb", level: "core", energy: 6, effect: 16 },
      { name: "Melodic Outburst", level: "core", energy: 40, effect: 100 },
      { name: "Signature - Rainy Prelude", level: "signature", energy: 4.8 },
      { name: "Signature - Majestic Interlude", level: "signature", energy: 10, effect: 30 },
      { name: "Signature - Note of Termination", level: "signature", energy: 35, effect: 75 },
      { name: "QTE", level: "qte", energy: 6 },
      { name: "Lingering Echoes (each of 4 attacks)", level: "fixed", energy: 20, rank: "SS", icon: "SS-Rank" },
      { name: "Arctic Ice", level: "fixed", effect: 1 },
      { name: "Ice Spikes", level: "fixed", effect: 1.8 },
      { name: "Ice Accumulation", level: "fixed", effect: 1 },
      { name: "Ice Burst (10000 Congelation)", level: "fixed", effect: 1, base: 9 }
    ],
    options: [
      { id: "class", group: "class", label: "Attacker: Extra DMG Bonus +20% (scales with the class level)", on: true, level: "class",
        buffs: [{ source: "Attacker", factor: "extraDmg", value: 0.2 }] },
      { id: "weapon", group: "weapon", label: "Orpheus' Lullaby: ATK +10%", on: true, buffs: [{ source: "Orpheus' Lullaby", factor: "atk", value: 0.1 }] },
      { id: "burana2", group: "memories", label: "Burana 2-piece: ATK +5%, Physical and Glaciation DMG +5%", on: true, buffs: [
        { source: "Burana 2-piece", factor: "atk", value: 0.05 },
        { source: "Burana 2-piece DMG", factor: "dmg", element: "Physical", value: 0.05 },
        { source: "Burana 2-piece Glaciation", factor: "effectDmg", effect: "Glaciation", value: 0.05 }] },
      { id: "burana4", group: "memories", label: "Burana 4-piece: Echoing Melody, Rhythmic Piercing and both Signatures deal double DMG", on: true, buffs: [
        // × 2 on its own, not Base DMG +100%: measured in game (2026-11-20), Echoing Melody with 2 Musical Notes dealt
        // 320% × (1 + 100%) × 2 = 1280%; as Base DMG it would have been 960%
        { source: "Burana 4-piece", factor: "times", value: 2, skill: ["Basic Attack - Echoing Melody", "Rhythmic Piercing", ...SELENA_SIGNATURES] }] },
      { id: "pact", group: "memories", label: "Sequence Pact: Extra DMG Bonus +12% (12 hypertuned resonances)", on: true,
        buffs: [{ source: "Sequence Pact", factor: "extraDmg", value: 0.12 }] },
      { id: "leader", group: "team", label: "Leader - Freezing Intro: Physical and Glaciation DMG +10%, ATK of Attackers +10%", on: true, buffs: [
        { source: "Leader", factor: "dmg", element: "Physical", value: 0.1 },
        { source: "Leader Glaciation", factor: "effectDmg", effect: "Glaciation", value: 0.1 },
        { source: "Leader ATK", factor: "atk", value: 0.1 }] },
      { id: "ssBase", group: "rank", label: "SS: Base DMG of Majestic Interlude and Note of Termination +30%", on: true, rank: "SS",
        buffs: [{ source: "Rainbow-Hued Melody", factor: "baseDmg", value: 0.3, skill: SELENA_SIGNATURES }] },
      { id: "concerto", group: "rank", label: "SS: after Melodic Outburst, Concerto Orbs deal double DMG", on: true, rank: "SS",
        buffs: [{ source: "Rainbow-Hued Melody Concerto", factor: "times", value: 2, skill: "Concerto Orb",
          assumed: "\"Deals double DMG\" of Concerto Orb is applied as × 2 on its own" }] },
      { id: "qte", group: "rank", label: "SS3: after a Majestic Interlude or Note of Termination, QTE Base DMG +500%", on: true, rank: "SS3",
        buffs: [{ source: "Interstellar Resonance", factor: "baseDmg", value: 5, skill: "QTE" }] },
      // Orpheus' Lullaby hands the same Base DMG bonus to the next Rhythmic Piercing (measured: 640% × 2 × 2 = 2560%)
      { id: "notes2", group: "skills", at: "basic", excludes: ["notes3", "notes4", "notes5"], label: "Echoing Melody charged with 2 Musical Notes: Base DMG +100%, and the next Rhythmic Piercing too (Orpheus' Lullaby)", on: false,
        buffs: [{ source: "Musical Notes", factor: "baseDmg", value: 1, skill: ["Basic Attack - Echoing Melody", "Rhythmic Piercing"] }] },
      { id: "notes3", group: "skills", at: "basic", excludes: ["notes2", "notes4", "notes5"], label: "Echoing Melody charged with 3 Musical Notes: Base DMG +200%, and the next Rhythmic Piercing too (Orpheus' Lullaby)", on: false,
        buffs: [{ source: "Musical Notes", factor: "baseDmg", value: 2, skill: ["Basic Attack - Echoing Melody", "Rhythmic Piercing"] }] },
      // Interstellar Resonance Lv. 2 (SSS): up to 5 Musical Notes, and 4/5 Notes raise Echoing Melody's Base DMG bonus "to
      // 300% / 600% instead". The Rhythmic Piercing share follows the same Orpheus' Lullaby reading as 2 and 3 Notes
      { id: "notes4", group: "skills", at: "basic", rank: "SSS", excludes: ["notes2", "notes3", "notes5"], label: "Echoing Melody charged with 4 Musical Notes: Base DMG +300%, and the next Rhythmic Piercing too (Orpheus' Lullaby)", on: false,
        buffs: [{ source: "Musical Notes", factor: "baseDmg", value: 3, skill: ["Basic Attack - Echoing Melody", "Rhythmic Piercing"],
          assumed: "Orpheus' Lullaby hands the 4 and 5 Musical Notes bonus to Rhythmic Piercing too, as measured with 2 Notes" }] },
      { id: "notes5", group: "skills", at: "basic", rank: "SSS", excludes: ["notes2", "notes3", "notes4"], label: "Echoing Melody charged with 5 Musical Notes: Base DMG +600%, and the next Rhythmic Piercing too (Orpheus' Lullaby)", on: false,
        buffs: [{ source: "Musical Notes", factor: "baseDmg", value: 6, skill: ["Basic Attack - Echoing Melody", "Rhythmic Piercing"],
          assumed: "Orpheus' Lullaby hands the 4 and 5 Musical Notes bonus to Rhythmic Piercing too, as measured with 2 Notes" }] },
      // Interstellar Resonance Lv. 1 (SS3): each Musical Note consumed adds 20% to the next Melodic Outburst, up to 100%
      { id: "outburstNotes", group: "skills", at: "core", rank: "SS3", label: "Melodic Outburst after 5 Musical Notes consumed: Base DMG +100%", on: false,
        buffs: [{ source: "Interstellar Resonance Notes", factor: "baseDmg", value: 1, skill: "Melodic Outburst" }] },
      // Interstellar Resonance Lv. 2 and Timeless Song (game text, skills-data.js)
      { id: "sssEchoes", group: "rank", label: "SSS: Lingering Echoes deal 100% more Extra DMG", on: true, rank: "SSS",
        buffs: [{ source: "Interstellar Resonance Echoes", factor: "extraDmg", value: 1, skill: "Lingering Echoes (each of 4 attacks)",
          assumed: "\"During Lingering Echoes, Selena deals 100% more Extra DMG\" is read as Extra DMG Bonus +100% on its attacks" }] },
      { id: "sss3", group: "rank", label: "SSS3: Extra DMG Bonus of Majestic Interlude and Note of Termination +60%", on: true, rank: "SSS3",
        buffs: [{ source: "Timeless Song 1", factor: "extraDmg", value: 0.6, skill: SELENA_SIGNATURES }] },
      { id: "sss6", group: "rank", label: "SSS6: Extra DMG Bonus of Echoing Melody and Melodic Outburst +30%", on: true, rank: "SSS6",
        buffs: [{ source: "Timeless Song 2", factor: "extraDmg", value: 0.3, skill: ["Basic Attack - Echoing Melody", "Melodic Outburst"] }] },
      { id: "sssPlus", group: "rank", label: "SSS+: Extra DMG Bonus of Rhythmic Piercing, Concerto Orbs and Signal Orbs +40%", on: true, rank: "SSS+",
        buffs: [{ source: "Timeless Song 3", factor: "extraDmg", value: 0.4, skill: ["Rhythmic Piercing", "Concerto Orb", "Red Orb (3-Ping)", "Yellow Orb (3-Ping)"],
          assumed: "Timeless Song: \"Signal Orbs\" is read as the Red and Yellow Orb 3-Pings" }] },
      // Measured: active through the Flow State and the Note of Termination of the user's rotation
      { id: "cottie4", group: "memories", label: "Cottie 4-piece (2 pieces + Harmony Absorption): Extra DMG Bonus +15% for 10s after a Signature", on: false,
        buffs: [{ source: "Cottie 4-piece", factor: "extraDmg", value: 0.15 }] },
      // The Harmony skill is one switch: the Base DMG part counts in both modes, the Glaciation DMG parts only on
      // Glaciation hits (Ice Spikes up)
      { id: "harmony", group: "weapon", label: "Frostbound Finale (Harmony Awakening): after a Rhythmic Piercing, the next Majestic Interlude deals 100% more Base DMG; with Ice Spikes up, Glaciation DMG of Melodic Outburst and Note of Termination +50%, Majestic Interlude +100%", on: true, buffs: [
        { source: "Frostbound Finale", factor: "baseDmg", value: 1, skill: "Signature - Majestic Interlude" },
        { source: "Frostbound Finale Ice", factor: "effectDmg", effect: "Glaciation", value: 0.5, skill: ["Melodic Outburst", "Signature - Note of Termination"] },
        { source: "Frostbound Finale Ice Majestic", factor: "effectDmg", effect: "Glaciation", value: 1, skill: "Signature - Majestic Interlude" }] }
    ]
  }
};

// Kamui: Aeternion. Skill values from Huaxu (tools/kit-from-huaxu.mjs), weapon and memories from assets-data.js.
// Not checked in game yet, and no FRAME_STATS: ATK comes from the player. Plasma Beam hits take Lightning Resistance
// and Lightning DMG, as the in-game screen pairs Plasma Beam with Lightning (the same reading checked for Selena's Glaciation)
const KAMUI_ORBS = ["Red Orb - Searing Leap (3-Ping)", "Red Orb - Blazing Rise (3-Ping)", "Red Orb - Corona Slash (3-Ping)",
  "Blue Orb - Solar Overflow (3-Ping)", "Blue Orb - Solar Cinders (3-Ping)"];
const KAMUI_SIGNATURE = ["Signature - Molten Heart", "Molten Heart field (per second)"];
DAMAGE_KITS["Kamui: Aeternion"] = {
  element: "Fire",
  effect: "Plasma Beam",
  effectElement: "Lightning",
  effectLabel: "Electric Storm Flash",
  source: "https://huaxu.app/na/wiki/constructs/aeternion/skills (game text, values at skill level 18)",
  checked: "2026-11-20",
  // The user's Kamui (2026-11-20, in-game ATK 1874, DEF 1441, CRIT 876): SS3, Feynman 4 + Cottie 2 with Harmony
  // Absorption (Cottie 4-piece; the weapon has no Harmony Awakening), every memory hypertuned twice (Sequence Pact +12%),
  // upper resonances per slot as below
  build: { rank: "SS", phase: 3, weapon: "Solar Flare", memories: ["Feynman", "Feynman", "Feynman", "Cottie", "Feynman", "Cottie"],
    hypertunes: 2, slotResonances: [{ atk: 15, def: 23 }, { atk: 15, def: 23 }, { atk: 15, crit: 15 }, { atk: 15, crit: 15 }, { hp: 75, atk: 15 }, { hp: 75, atk: 15 }],
    resonanceText: "ATK +15 resonances" },
  moves: [
    { name: "Red Orb - Searing Leap (3-Ping)", level: "red", energy: 14.5, effect: 15.2 },
    { name: "Red Orb - Blazing Rise (3-Ping)", level: "red", energy: 14, effect: 14.4 },
    { name: "Red Orb - Corona Slash (3-Ping)", level: "red", energy: 13, effect: 13.9 },
    { name: "Yellow Orb - Flare Burst", level: "yellow", energy: 6 },
    { name: "Yellow Orb - Fusion Slash (60 Output)", level: "yellow", energy: 30 },
    { name: "Yellow Orb - Solar Poise (90 Output)", level: "yellow", energy: 47.5, effect: 38 },
    { name: "Yellow Orb - Firelit Thunder (each swing)", level: "yellow", effect: 6, always: true },
    { name: "Yellow Orb - Scorching Strike (all hits)", level: "yellow", energy: 6, effect: 8 },
    { name: "Blue Orb - Solar Overflow (3-Ping)", level: "blue", energy: 6 },
    { name: "Blue Orb - Solar Cinders (3-Ping)", level: "blue", energy: 7 },
    { name: "Basic Attack - Converged Charge (all hits)", level: "basic", energy: 7 },
    { name: "Basic Attack - Spreading Discharge (all hits)", level: "basic", energy: 9, effect: 10 },
    { name: "Basic Attack - Ignited Radiance", level: "basic", energy: 142.48, effect: 139.64 },
    { name: "Crown Arc (both hits)", level: "core", energy: 35.08, effect: 34.4 },
    { name: "Radiant Expulsion (counter)", level: "core", energy: 4 },
    { name: "Electric Storm Flash strike (every 2s)", level: "fixed", effect: 8 },
    { name: "Signature - Molten Heart", level: "signature", energy: 170.6, effect: 167.2 },
    { name: "Molten Heart field (per second)", level: "signature", energy: 0.5, effect: 0.5, icon: "Signature" },
    { name: "QTE", level: "qte", energy: 6, effect: 6 },
    { name: "QTE damage over time (per second)", level: "qte", energy: 0.5, effect: 0.5, icon: "QTE" }
  ],
  options: [
    { id: "class", group: "class", label: "Breaker: target's Extra DMG Reduction −20% (scales with the class level)", on: true, level: "class",
      buffs: [{ source: "Breaker", factor: "extraRedDown", value: 0.2 }] },
    { id: "hypermatrix", group: "class", label: "Hypermatrix Deduction (4s after a Matrix): the Breaker reduction is 30% instead", on: false, level: "class",
      buffs: [{ source: "Breaker", factor: "extraRedDown", value: 0.3 }] },
    { id: "weapon", group: "weapon", label: "Solar Flare: ATK +10%, Base DMG of Molten Heart doubles", on: true, buffs: [
      { source: "Solar Flare", factor: "atk", value: 0.1 },
      { source: "Solar Flare Molten Heart", factor: "baseDmg", value: 1, skill: "Signature - Molten Heart",
        assumed: "Solar Flare: \"Base DMG doubles\" is read as Base DMG +100%" }] },
    { id: "feynman2", group: "memories", label: "Feynman 2-piece: ATK +5%, Fire and Plasma Beam DMG +5%", on: true, buffs: [
      { source: "Feynman 2-piece", factor: "atk", value: 0.05 },
      { source: "Feynman 2-piece Fire", factor: "dmg", element: "Fire", value: 0.05 },
      { source: "Feynman 2-piece Plasma Beam", factor: "effectDmg", effect: "Plasma Beam", value: 0.05 }] },
    { id: "flare", group: "skills", label: "Ignited Radiance with max Flare Points: Base DMG +45%", on: true, buffs: [
      { source: "Flare Points", factor: "baseDmg", value: 0.45, skill: "Basic Attack - Ignited Radiance" }] },
    { id: "feynman4", group: "memories", label: "Feynman 4-piece: the Flare Points bonus doubles (+90% at max)", on: true, buffs: [
      { source: "Flare Points", factor: "baseDmg", value: 0.9, skill: "Basic Attack - Ignited Radiance" }] },
    { id: "sunfire", group: "skills", at: "yellow", label: "Sunfire (10s after Fusion Slash): Fire and Plasma Beam DMG +40%", on: true, buffs: [
      { source: "Sunfire", factor: "dmg", element: "Fire", value: 0.4 },
      { source: "Sunfire Plasma Beam", factor: "effectDmg", effect: "Plasma Beam", value: 0.4 }] },
    // In a team with the Plasma Beam Effect the target only gets Coiled Tempest: the in-game Status Overview (user's
    // recording, 2026-11-20) listed Coiled Tempest and the Breaker skill, and no Scorching Invasion
    { id: "hazePlasma", group: "team", excludes: "hazeFire", label: "Team with Plasma Beam: Coiled Tempest, target's Plasma Beam Resistance −25% (−35% at SS3, −45% at SSS)", on: true, buffs: [
      { source: "Coiled Tempest", factor: "effectResDown", effect: "Plasma Beam", value: 0.25 },
      { source: "Coiled Tempest SS3", factor: "effectResDown", effect: "Plasma Beam", value: 0.1, rank: "SS3",
        assumed: "\"Scorching Invasion and Coiled Tempest effects increase by 10%\" is read as 10 more points of resistance reduction" },
      { source: "Coiled Tempest SSS", factor: "effectResDown", effect: "Plasma Beam", value: 0.1, rank: "SSS" }] },
    { id: "hazeFire", group: "team", excludes: "hazePlasma", label: "Team without Plasma Beam: Scorching Invasion, target's Fire Resistance −25% (−35% at SS3, −45% at SSS)", on: false, buffs: [
      { source: "Scorching Invasion", factor: "resDown", element: "Fire", value: 0.25 },
      { source: "Scorching Invasion SS3", factor: "resDown", element: "Fire", value: 0.1, rank: "SS3",
        assumed: "\"Scorching Invasion and Coiled Tempest effects increase by 10%\" is read as 10 more points of resistance reduction" },
      { source: "Scorching Invasion SSS", factor: "resDown", element: "Fire", value: 0.1, rank: "SSS" }] },
    { id: "crown5", group: "skills", label: "Crown Arc cast with 90 Output: 5 times the DMG", on: true, buffs: [
      { source: "Crown Arc Output", factor: "times", value: 5, skill: "Crown Arc (both hits)" }] },
    { id: "pact", group: "memories", label: "Sequence Pact: Extra DMG Bonus +12% (12 hypertuned resonances)", on: true,
      buffs: [{ source: "Sequence Pact", factor: "extraDmg", value: 0.12 }] },
    // Measured: the field ticks went from 1930 to 2065 (×1.0699 = 1 + 130.8/1874): the weapon's 436 ATK grows by 30% before
    // the ATK% buffs, not by the "artificial 500 ATK" the 2024 wiki gives (×1.080)
    { id: "corrosion", group: "weapon", label: "Domain Deconstruction (weapon resonance): Corrosion, target's All Resistances −8%", on: false,
      buffs: [{ source: "Corrosion", factor: "resDown", element: "All", value: 0.08,
        assumed: "Corrosion's \"All Resistances\" is applied to the element resistances, not to Plasma Beam Resistance" }] },
    { id: "afterglow", group: "weapon", label: "Glorious Afterglow (weapon resonance), 8s after a 3-Ping: the weapon's ATK +30% (+131)", on: false,
      buffs: [{ source: "Glorious Afterglow", factor: "baseAtk", value: 0.3 * 436 }] },
    { id: "cottie4", group: "memories", label: "Cottie 4-piece (2 pieces + Harmony Absorption): Extra DMG Bonus +15% for 10s after a Signature", on: false,
      buffs: [{ source: "Cottie 4-piece", factor: "extraDmg", value: 0.15 }] },
    { id: "darwin2", group: "memories", label: "Darwin 2-piece (Harmony Absorption), 5 stacks: Extra DMG Bonus +15%", on: false, buffs: [
      { source: "Darwin 2-piece", factor: "extraDmg", value: 0.15 }] },
    { id: "leader", group: "team", label: "Leader - Solar Wind: Fire and Plasma Beam DMG +10%, Breaker Omniframes DMG +5%", on: true, buffs: [
      { source: "Leader", factor: "dmg", element: "Fire", value: 0.1 },
      { source: "Leader Plasma Beam", factor: "effectDmg", effect: "Plasma Beam", value: 0.1 },
      { source: "Leader Breaker", factor: "extraDmg", value: 0.05, assumed: "Leader - Solar Wind: \"DMG +5%\" of Breakers is read as Extra DMG Bonus" }] },
    { id: "ss", group: "rank", label: "SS: Base DMG of Solar Poise (hold Yellow Orb) +200%", on: true, rank: "SS",
      buffs: [{ source: "Solar Pulse", factor: "baseDmg", value: 2, skill: "Yellow Orb - Solar Poise (90 Output)" }] },
    { id: "ss3", group: "rank", label: "SS3: Red and Blue Orb Base DMG +60%, Ignited Radiance +30%", on: true, rank: "SS3", buffs: [
      { source: "Dawn's Clarity orbs", factor: "baseDmg", value: 0.6, skill: KAMUI_ORBS },
      { source: "Dawn's Clarity Ignited", factor: "baseDmg", value: 0.3, skill: "Basic Attack - Ignited Radiance" }] },
    { id: "sss", group: "rank", label: "SSS: Base DMG of Molten Heart and its field +50%", on: true, rank: "SSS", buffs: [
      { source: "Dawn's Clarity Signature", factor: "baseDmg", value: 0.5, skill: KAMUI_SIGNATURE }] },
    { id: "sss3", group: "rank", label: "SSS3: Extra DMG Bonus of Crown Arc and Ignited Radiance +40%", on: true, rank: "SSS3",
      buffs: [{ source: "Daybreak Nimbus 1", factor: "extraDmg", value: 0.4, skill: ["Crown Arc (both hits)", "Basic Attack - Ignited Radiance"] }] },
    { id: "sss6", group: "rank", label: "SSS6: Extra DMG Bonus of Red and Blue Orb skills +200%", on: true, rank: "SSS6",
      buffs: [{ source: "Daybreak Nimbus 2", factor: "extraDmg", value: 2, skill: KAMUI_ORBS }] },
    { id: "sssPlus", group: "rank", label: "SSS+: Extra DMG Bonus of Molten Heart and its field +30%", on: true, rank: "SSS+",
      buffs: [{ source: "Daybreak Nimbus 3", factor: "extraDmg", value: 0.3, skill: KAMUI_SIGNATURE }] }
  ]
};

// Vera: Geiravor. Skill values from Huaxu (tools/kit-from-huaxu.mjs), weapon and memories from assets-data.js.
// Darkflow hits (Penal Immersion, from holding Signature) take Dark Resistance and Dark DMG: the in-game screen pairs
// Darkflow with Dark, the same reading checked for Selena's Glaciation. Checked against the user's recording of
// 2026-11-20 only in part (docs/calculo-de-dano.md): the Scorched in Void / Tempered in Midnight ratio fits within 0.7%
const VERA_HOLD = ["Shadowhunt Tremor (partial charge)", "Shadowhunt Tremor (full charge)", "Hellfire Crucible", "Razor Whirlwind", "Rending Ravage"];
const VERA_AURA = ["Darkflow Aura burst", "Darkflow Aura (per second)"];
// Darkflow Aura by stacks (core passive text): the burst and the damage per second, as multiples of the 100% the moves carry
const VERA_AURA_STEPS = [[1, 1, 0.2], [3, 2, 0.4], [6, 4, 0.6], [10, 8, 0.8], [15, 16, 1]];
const veraAura = ([stacks, burst, tick]) => ({
  id: `aura${stacks}`, group: "skills", at: "fixed", on: stacks === 15,
  excludes: VERA_AURA_STEPS.filter(([n]) => n !== stacks).map(([n]) => `aura${n}`),
  label: `Darkflow Aura at ${stacks} stack${stacks > 1 ? "s" : ""}: burst ${burst * 100}%, then ${Math.round(tick * 100)}% per second`,
  buffs: [
    { source: "Darkflow stacks", factor: "times", value: burst, skill: VERA_AURA[0] },
    { source: "Darkflow stacks per second", factor: "times", value: tick, skill: VERA_AURA[1] }]
});
const VERA_SIGNATURES = ["Signature - Tempered in Midnight", "Signature - Scorched in Void"];
// Absolute Pyre: Tempered in Midnight grants Base DMG +10% per Yellow Orb it cleared (up to 6), +50% of that at SSS3.
// The same orb count sets how many more times Scorched in Void (SS) and Rending Ravage (SS3) hit, and SSS adds Base DMG
// to the held Basic Attacks while Absolute Pyre is up
const VERA_MORE_TIMES = [1, 1, 2, 2, 3, 3];
// "Increases her Base DMG": every hit of her skills but the Tempered in Midnight that grants it
const VERA_PYRE_SKILLS = ["Red Orb - Rising Flames (3-Ping)", "Red Orb - Searing Current (3-Ping)", "Blue Orb - Scorching Sweep (3-Ping)",
  "Basic Attack - Flash Break", "Basic Attack - Inverse Edge", "Basic Attack - Ashen Dance (each counter)", ...VERA_HOLD,
  "Signature - Scorched in Void", "QTE"];
const veraPyre = orbs => ({
  id: `pyre${orbs}`, group: "skills", at: "signature", on: orbs === 6,
  excludes: [1, 2, 3, 4, 5, 6].filter(n => n !== orbs).map(n => `pyre${n}`),
  label: `Absolute Pyre from ${orbs} Yellow Orb${orbs > 1 ? "s" : ""}: Base DMG +${orbs * 10}% (+${orbs * 15}% at SSS3); Scorched in Void (SS) and Rending Ravage (SS3) hit ${VERA_MORE_TIMES[orbs - 1]} more time${VERA_MORE_TIMES[orbs - 1] > 1 ? "s" : ""}; SSS: held Basic Attacks Base DMG +50%`,
  buffs: [
    // Measured: the Tempered in Midnight that grants it doesn't take it
    { source: "Absolute Pyre", factor: "baseDmg", value: orbs * 0.1, skill: VERA_PYRE_SKILLS },
    // Heat Unsheathed: "DMG boost percentage of Absolute Pyre increases by 50%" is half of the bonus more (the user)
    { source: "Absolute Pyre SSS3", factor: "baseDmg", value: orbs * 0.05, skill: VERA_PYRE_SKILLS, rank: "SSS3" },
    { source: "Burning On", factor: "times", value: 1 + VERA_MORE_TIMES[orbs - 1], skill: "Signature - Scorched in Void", rank: "SS" },
    { source: "Nightfall Inferno", factor: "times", value: 1 + VERA_MORE_TIMES[orbs - 1], skill: "Rending Ravage", rank: "SS3" },
    { source: "Nightfall Inferno Base DMG", factor: "baseDmg", value: 0.5, skill: VERA_HOLD, rank: "SSS" }]
});
DAMAGE_KITS["Vera: Geiravor"] = {
  element: "Fire",
  effect: "Darkflow",
  effectElement: "Dark",
  effectLabel: "Penal Immersion",
  source: "https://huaxu.app/na/wiki/constructs/geiravor/skills (game text, values at skill level 18)",
  checked: "2026-11-20",
  // The user's Vera (2026-11-20, in-game ATK 2002, DEF 1557, CRIT 986): SSS+, Hervor 4 + Shakespeare 2 with Harmony
  // Absorption (Shakespeare 4-piece), upper resonances with ATK, lower Signature +1, weapon resonances Superconducting
  // Axial Ray, Glorious Spear and Dead Line Timing
  build: { rank: "SSS+", weapon: "Deathless Flame", memories: ["Hervor", "Hervor", "Hervor", "Shakespeare", "Hervor", "Shakespeare"],
    hypertunes: 2, resonances: [{ atk: 15, crit: 15 }], resonanceText: "ATK +15 / CRIT +15 resonances" },
  moves: [
    { name: "Red Orb - Rising Flames (3-Ping)", level: "red", energy: 6, effect: 3 },
    { name: "Red Orb - Searing Current (3-Ping)", level: "red", energy: 12, effect: 6 },
    { name: "Blue Orb - Scorching Sweep (3-Ping)", level: "blue", energy: 9 },
    { name: "Basic Attack - Flash Break", level: "basic", energy: 9 },
    { name: "Basic Attack - Inverse Edge", level: "basic", energy: 12, effect: 12 },
    { name: "Basic Attack - Ashen Dance (each counter)", level: "basic", energy: 6, effect: 6 },
    { name: "Shadowhunt Tremor (partial charge)", level: "core", energy: 4 },
    { name: "Shadowhunt Tremor (full charge)", level: "core", energy: 10 },
    { name: "Hellfire Crucible", level: "core", energy: 10, effect: 3 },
    { name: "Razor Whirlwind", level: "core", energy: 16, effect: 5 },
    { name: "Rending Ravage", level: "core", energy: 32, effect: 7 },
    { name: "Signature - Tempered in Midnight", level: "signature", energy: 24, effect: 15 },
    { name: "Signature - Scorched in Void", level: "signature", energy: 58, effect: 30 },
    { name: "QTE", level: "qte", energy: 6, effect: 6 },
    { name: "Shakespeare 4-piece Explosion (on a Burned target)", level: "fixed", energy: 6 },
    // 100% each: the stacks option multiplies them (burst 100% to 1600%, 20% to 100% per second)
    { name: "Darkflow Aura burst", level: "fixed", effect: 1 },
    { name: "Darkflow Aura (per second)", level: "fixed", effect: 1 }
  ],
  options: [
    // She is the Amplifier: her own switch-in buff reaches her too. With Darkflow stacks her element counts as Dark
    { id: "class", group: "class", label: "Amplifier, 10s after switching in: ATK +20%, Fire DMG +20% (Dark DMG with Darkflow stacks; scales with the class level)", on: false, level: "class", buffs: [
      { source: "Amplifier", factor: "atk", value: 0.2 },
      { source: "Amplifier Fire", factor: "dmg", element: "Fire", value: 0.2 },
      { source: "Amplifier Dark", factor: "dmg", element: "Dark", value: 0.2,
        assumed: "Amplifier: with Darkflow stacks, \"element regarded as Dark\" is read as Dark DMG +20% instead of Fire" }] },
    { id: "weapon", group: "weapon", label: "Deathless Flame: ATK +10%, Base DMG of Scorched in Void doubles", on: true, buffs: [
      { source: "Deathless Flame", factor: "atk", value: 0.1 },
      { source: "Deathless Flame Scorched", factor: "baseDmg", value: 1, skill: "Signature - Scorched in Void",
        assumed: "Deathless Flame: \"Base DMG doubles\" is read as Base DMG +100%" }] },
    { id: "sar", group: "weapon", label: "Superconducting Axial Ray (weapon resonance): team ATK +8%", on: false,
      buffs: [{ source: "Superconducting Axial Ray", factor: "atk", value: 0.08, assumed: "\"Full ATK +8%\" of the weapon resonances is read as ATK +8%" }] },
    // Her Red Orbs heal her, so with this resonance it is up for most of the rotation
    { id: "spear", group: "weapon", label: "Glorious Spear (weapon resonance), 8s after a heal: ATK +10%", on: false,
      buffs: [{ source: "Glorious Spear", factor: "atk", value: 0.1, assumed: "\"Full ATK +10%\" of the weapon resonances is read as ATK +10%" }] },
    { id: "hervor2", group: "memories", label: "Hervor 2-piece: ATK +5%, Fire and Darkflow DMG +5%", on: true, buffs: [
      { source: "Hervor 2-piece", factor: "atk", value: 0.05 },
      { source: "Hervor 2-piece Fire", factor: "dmg", element: "Fire", value: 0.05 },
      { source: "Hervor 2-piece Darkflow", factor: "effectDmg", effect: "Darkflow", value: 0.05 }] },
    { id: "shakespeare2", group: "memories", label: "Shakespeare 2-piece: ATK +3%, Fire DMG +7%", on: false, buffs: [
      { source: "Shakespeare 2-piece", factor: "atk", value: 0.03 },
      { source: "Shakespeare 2-piece Fire", factor: "dmg", element: "Fire", value: 0.07 }] },
    { id: "shakespeare4", group: "memories", label: "Shakespeare 4-piece (2 pieces + Harmony Absorption): Extra DMG Bonus +10%", on: false,
      buffs: [{ source: "Shakespeare 4-piece", factor: "extraDmg", value: 0.1 }] },
    { id: "burn", group: "memories", label: "Burn (Shakespeare 4-piece, 8s after a hit, 10s cooldown): target's Fire Resistance −15%", on: false,
      buffs: [{ source: "Burn", factor: "resDown", element: "Fire", value: 0.15 }] },
    { id: "pact", group: "memories", label: "Sequence Pact: Extra DMG Bonus +12% (12 hypertuned resonances)", on: true,
      buffs: [{ source: "Sequence Pact", factor: "extraDmg", value: 0.12 }] },
    { id: "leader", group: "team", label: "Leader - Abyssal Condemnation: ATK +10%; Amplifiers Fire and Darkflow DMG +5%", on: true, buffs: [
      { source: "Leader", factor: "atk", value: 0.1 },
      { source: "Leader Fire", factor: "dmg", element: "Fire", value: 0.05 },
      { source: "Leader Darkflow", factor: "effectDmg", effect: "Darkflow", value: 0.05 }] },
    ...[6, 5, 4, 3, 2, 1].map(veraPyre),
    { id: "qtePyre1", group: "skills", at: "qte", excludes: "qtePyre", label: "1 QTE before entering Absolute Pyre: Base DMG +25% in it", on: false,
      buffs: [{ source: "Cremating Judgment", factor: "baseDmg", value: 0.25, skill: VERA_PYRE_SKILLS }] },
    { id: "qtePyre", group: "skills", at: "qte", excludes: "qtePyre1", label: "2 QTEs before entering Absolute Pyre: Base DMG +50% in it (the most)", on: false,
      buffs: [{ source: "Cremating Judgment", factor: "baseDmg", value: 0.5, skill: VERA_PYRE_SKILLS }] },
    ...VERA_AURA_STEPS.map(veraAura),
    // Wrathfang (assets-data.js CUB_SKILLS). Its own Active Skills use the CUB's ATK, which the site doesn't have, so they
    // aren't listed; nor is the Frenzied Hunt joint attack, whose ATK source the text doesn't say
    { id: "cubFrenzy", group: "cub", label: "Wrathfang - Frenzied Hunt: Tempered in Midnight Base DMG +10% per Yellow Orb cleared (+60% with 6)", on: false,
      buffs: [{ source: "Frenzied Hunt", factor: "baseDmg", value: 0.6, skill: "Signature - Tempered in Midnight" }] },
    { id: "cubJagged", group: "cub", label: "Wrathfang - Jagged Assault: Fire DMG +10% (Dark DMG with Darkflow stacks)", on: false, buffs: [
      { source: "Jagged Assault", factor: "dmg", element: "Fire", value: 0.1 },
      { source: "Jagged Assault Dark", factor: "dmg", element: "Dark", value: 0.1 }] },
    { id: "cubPredation", group: "cub", label: "Wrathfang - Nightfall Predation, 8s after a CUB Active Skill: Extra DMG Bonus +5%", on: false,
      buffs: [{ source: "Nightfall Predation", factor: "extraDmg", value: 0.05 }] },
    { id: "cubFangs", group: "cub", label: "Wrathfang - Blazing Fangs: ATK +100", on: false,
      buffs: [{ source: "Blazing Fangs", factor: "finalAtk", value: 100,
        assumed: "Blazing Fangs: the flat ATK +100 is added after ATK% (Final ATK, as the wiki has for CUB ATK) and isn't in the stats screen" }] },
    // Nightfall Inferno raises Fire Tempered "by 10%" at SS3: in the game's wording, "its effect increased by 10%" adds 10
    // points, 20% → 30% (the user, 2026-11-20). The SSS level repeats the line and adds 10 more: 40% (the user)
    { id: "tempered", group: "skills", at: "core", excludes: "radiation", label: "Fire Tempered (8s after Vera heals): Fire DMG +20% (+30% from SS3, +40% from SSS)", on: true, buffs: [
      { source: "Fire Tempered", factor: "dmg", element: "Fire", value: 0.2 },
      { source: "Fire Tempered SS3", factor: "dmg", element: "Fire", value: 0.1, rank: "SS3" },
      { source: "Fire Tempered SSS", factor: "dmg", element: "Fire", value: 0.1, rank: "SSS" }] },
    { id: "radiation", group: "skills", at: "core", excludes: "tempered", label: "Dark Radiation (8s after Vera heals, with Darkflow stacks): Dark DMG +20% (+30% from SS3, +40% from SSS)", on: false, buffs: [
      { source: "Dark Radiation", factor: "dmg", element: "Dark", value: 0.2 },
      { source: "Dark Radiation SS3", factor: "dmg", element: "Dark", value: 0.1, rank: "SS3",
        assumed: "Nightfall Inferno: the Fire Tempered increase is read as reaching Dark Radiation too" },
      { source: "Dark Radiation SSS", factor: "dmg", element: "Dark", value: 0.1, rank: "SSS" }] },
    { id: "sss6", group: "rank", label: "SSS6: Extra DMG Bonus of Shadowhunt Tremor, Hellfire Crucible, Razor Whirlwind and Rending Ravage +50%", on: true, rank: "SSS6",
      buffs: [{ source: "Heat Unsheathed 2", factor: "extraDmg", value: 0.5, skill: VERA_HOLD }] },
    { id: "sssPlus", group: "rank", label: "SSS+: Extra DMG Bonus of Tempered in Midnight and Scorched in Void +50%", on: true, rank: "SSS+",
      buffs: [{ source: "Heat Unsheathed 3", factor: "extraDmg", value: 0.5, skill: VERA_SIGNATURES }] }
  ]
};

/* ENEMY_PRESETS: targets measured by the community in 2021 (Bilibili wiki damage calculator; see docs/calculo-de-dano.md).
   def, physRes, elemRes (every element but Physical), res (per element, over elemRes), extraRed.
   Effect Resistance has no source: it stays 0. */
const ENEMY_PRESETS = [
  { id: "none", label: "No defenses (theoretical)", def: 0, physRes: 0, elemRes: 0, extraRed: 0 },
  // Measured by the user on 2026-11-20 (docs/calculo-de-dano.md): the same Red Orb without and with a Tank's −20% Extra
  // DMG Reduction gives DEF and Extra DMG Reduction. Ice Resistance −3.8%: Selena's Glaciation Echoing Melody (64878) and
  // Rhythmic Piercing (31236) with the Tank and Wanshi's Frost Corrosion (−25% Ice Resistance) up, and Ice Accumulation
  // (4357) with the Tank, all fit this value. Measured for Ice only: the other elements stay at 0 until measured
  // Fire 19.5%: Kamui's Molten Heart field (1589 a tick with Cottie 4-piece and Domain Deconstruction's Corrosion, −8% All
  // Resistances; no Breaker, no Afterglow; ATK 1874, Signature level 24). It also absorbs anything about Kamui the engine
  // misses; a second Kamui hit would confirm it
  { id: "gardener", label: "Training: Gardener (Basic) (2026)", def: 0.0597, physRes: 0, elemRes: 0, res: { Ice: -0.038, Fire: 0.195 }, extraRed: 0.0673 },
  { id: "dummy", label: "Training dummy, level 80 (2021)", def: 0.0904, physRes: 0, elemRes: 0.24, extraRed: 0.0399 },
  { id: "trial", label: "Trial Zone, Nightmare boss (2021)", def: 0.713, physRes: 0, elemRes: 0.888, extraRed: 0.68 },
  { id: "cageAdv", label: "Phantasm Pain Cage, Advanced Zone, Hell boss (2021)", def: 0.6, physRes: 0, elemRes: 0.65, extraRed: 0.46 },
  { id: "cageFinal", label: "Phantasm Pain Cage, Final Zone, Hell boss (2021)", def: 0.6, physRes: 0.27, elemRes: 0.659, extraRed: 0.46 }
];
