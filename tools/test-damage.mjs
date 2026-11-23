// Testa o motor de dano (data/damage-formulas.js) contra os exemplos das fontes de docs/calculo-de-dano.md.
// Uso: node tools/test-damage.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = file => readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8");
const NAMES = "hitDamage, rotationDamage, skillScale, defAfterReduction, phaseBonus, frameStats, memoryTotals, kitDamage, rankReached, buildStats, presetTarget, FRAME_STATS, MEMORY_STATS, WEAPON_STATS, DAMAGE_KITS, ENEMY_PRESETS";
const { hitDamage, rotationDamage, skillScale, defAfterReduction, phaseBonus, frameStats, memoryTotals, kitDamage, rankReached, buildStats, presetTarget,
  FRAME_STATS, MEMORY_STATS, WEAPON_STATS, DAMAGE_KITS, ENEMY_PRESETS } =
  vm.runInNewContext(`${read("damage-formulas.js")}\n${read("damage-data.js")}\n${read("assets-data.js")}\n;({ ${NAMES} })`);

let failed = 0;
function near(name, got, want, tolerance = 1e-4) {
  const ok = Math.abs(got - want) <= tolerance;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FALHOU"} ${name}${ok ? "" : `: deu ${got}, esperado ${want}`}`);
}
const unit = { atk: { base: 1 } };
const fire = { scale: 1, element: "Fire" };
const phys = { scale: 1, element: "Physical" };

// Bilibili 2021: (1+15% ATK)(1+20% elemental)(1+20% extra)(1−24% res)(1−4% extra red) = 1,2082
near("coeficiente do exemplo da wiki Bilibili", hitDamage(fire, {
  atk: { base: 1, pct: 0.15 },
  target: { res: { Fire: 0.24 }, extraRed: 0.04 },
  buffs: [{ factor: "dmg", element: "Fire", value: 0.2 }, { factor: "extraDmg", value: 0.2 }]
}).damage, 1.2082);

// Gray Ravens: DEF 60% com 20% de redução vira 54,5%
near("DEF 60% − 20% = 54,5%", defAfterReduction(0.6, 0.2), 0.5454, 1e-3);
near("redução de DEF não passa de 100%", defAfterReduction(0.6, 1.5), 0);

near("nível 1 vale metade do 18", skillScale(4, 1), 2);
near("nível 25", skillScale(3.4, 25), 4.1);
near("skill que não escala", skillScale(3, 1, true), 3);

const tough = { def: 0.6, physRes: 0.27, armorBar: true, res: { Fire: 0.5 }, extraRed: 0.46 };
near("elemental ignora DEF, barra e CRIT", hitDamage(fire, { ...unit, critStat: 3000, crit: "crit", target: tough }).damage, 0.5 * 0.54);
near("físico: DEF, resistência física e barra", hitDamage(phys, { ...unit, crit: "normal", target: tough }).damage, 0.4 * 0.53 * 0.54);
near("crítico físico = 2× (1 + CRIT DMG)", hitDamage(phys, { ...unit, crit: "crit", buffs: [{ factor: "critDmg", value: 0.5 }] }).damage, 3);
near("crítico médio com 3000 de CRIT (90%)", hitDamage(phys, { ...unit, critStat: 3000 }).damage, 1.9);

const twice = [{ source: "Tank", factor: "extraRedDown", value: 0.2 }, { source: "Tank", factor: "extraRedDown", value: 0.2 }];
near("mesma origem não acumula", hitDamage(fire, { ...unit, target: { extraRed: 0.5 }, buffs: twice }).damage, 0.7);
near("mesmo fator soma", hitDamage(fire, { ...unit, buffs: [{ factor: "extraDmg", value: 0.2 }, { factor: "extraDmg", value: 0.3 }] }).damage, 1.5);
near("stacks", hitDamage(fire, { ...unit, buffs: [{ factor: "dmg", element: "Fire", value: 0.1, stacks: 3 }] }).damage, 1.3);
near("bônus de Ice não vale para Fire", hitDamage(fire, { ...unit, buffs: [{ factor: "dmg", element: "Ice", value: 0.5 }] }).damage, 1);
near("bônus Elemental vale para Fire", hitDamage(fire, { ...unit, buffs: [{ factor: "dmg", element: "Elemental", value: 0.5 }] }).damage, 1.5);
near("Annihilator espalha o bônus de Ice", hitDamage(fire, { ...unit, annihilator: true, buffs: [{ factor: "dmg", element: "Ice", value: 0.5 }] }).damage, 1.5);
near("Annihilator não leva bônus para o físico", hitDamage(phys, { ...unit, crit: "normal", annihilator: true, buffs: [{ factor: "dmg", element: "Ice", value: 0.5 }] }).damage, 1);
near("Base DMG só da skill dele", hitDamage({ ...fire, skill: "Red Orb" }, { ...unit, buffs: [{ factor: "baseDmg", skill: "Blue Orb", value: 1 }] }).damage, 1);
near("resistência negativa aumenta o dano", hitDamage(fire, { ...unit, target: { res: { Fire: 0.1 } }, buffs: [{ factor: "resDown", element: "Fire", value: 0.4 }] }).damage, 1.3);
near("Final ATK fora do ATK%", hitDamage(fire, { atk: { base: 1000, pct: 0.5, final: 60 } }).damage, 1560);

const weak = [{ factor: "resDown", element: "Fire", value: 0.4, weakness: true }];
near("Weakness vale para energia", hitDamage(fire, { ...unit, buffs: weak }).damage, 1.4);
const ignition = hitDamage({ ...fire, kind: "effect", effect: "Ignition" }, { ...unit, buffs: weak });
near("Weakness não vale para efeito", ignition.damage, 1);
near("efeito marcado como sem fonte", ignition.assumed.length, 1);
near("Raydiance leva o bônus de Plasma Beam", hitDamage({ scale: 1, element: "Lightning", kind: "raydiance", effect: "Raydiance" },
  { ...unit, buffs: [{ factor: "effectDmg", effect: "Plasma Beam", value: 0.5 }] }).damage, 1.5);

const rotation = rotationDamage([
  { t: 0, skill: "Signature", buffs: [{ source: "Signature", factor: "extraDmg", value: 1, duration: 5 }], hits: [fire] },
  { t: 4, skill: "Red Orb", hits: [fire] },
  { t: 6, skill: "Red Orb", hits: [fire] }
], unit);
near("rotação: buff dura 5 s", rotation.total, 2 + 2 + 1);
near("rotação: soma por skill", rotation.bySkill["Red Orb"], 3);
const renewed = rotationDamage([
  { t: 0, buffs: [{ source: "A", factor: "extraDmg", value: 1, duration: 5 }] },
  { t: 4, buffs: [{ source: "A", factor: "extraDmg", value: 1, duration: 5 }] },
  { t: 8, hits: [fire] }
], unit);
near("rotação: mesma origem renova sem acumular", renewed.total, 2);

// Tela Stats Growth da Selena: rank S completo dá HP +200, ATK +20, DEF +10, CRIT +10
const full = phaseBonus("S", "SS");
near("fases: rank S completo, ATK", full.atk, 20);
near("fases: rank S completo, HP", full.hp, 200);
near("fases: rank S completo, CRIT", full.crit, 10);
near("fases: S até SS4", phaseBonus("S", "SS", 4).atk + phaseBonus("S", "SS", 4).crit, 20 + 10 + 10 + 5);
near("fases: SSS+ tem todas as fases de S, SS e SSS", phaseBonus("S", "SSS+").atk, 60);

// Bilibili: rank S nível 80 = 459 de ATK (na linha rotulada "CRIT"); nível 1 = 102
const selena = FRAME_STATS["Selena: Pianissimo"];
const bare = { ...selena, promote: [0, 0, 0, 0] };
near("Selena S nível 80 sem promote nem fases = 459 (Bilibili)", frameStats(bare, { rank: "S", level: 80 })[1] - phaseBonus("S", "S").atk, 459, 0.5);
near("Selena S nível 1 = 102", frameStats(bare, { rank: "S", level: 1 })[1], 102);
near("Selena SS0 nível 80, ATK do frame", frameStats(selena, { rank: "SS", level: 80 })[1], 102 + 5.44 * 79 + 324 + 20);
// Build da Selena do usuário (prints de 2026-11-20): Burana 1-2-3-5, Cottie 4-6, todas com 2 hypertunes,
// ressonância superior ATK +15 / CRIT +15 e inferior Core Passive +1 (sem stat). Rank SS0, nível 80.
const piece = name => ({ name, hypertunes: 2, resonances: [{ atk: 15, crit: 15 }] });
const mem = memoryTotals(["Burana", "Burana", "Burana", "Cottie", "Burana", "Cottie"].map(piece), MEMORY_STATS);
near("memórias: ATK = (135+132+135) × 1,175² + 6 × 15", mem[1], 402 * 1.175 ** 2 + 90);
near("memórias: CRIT = 66 × 3 × 1,125² + 6 × 15", mem[3], 198 * 1.125 ** 2 + 90);
near("memórias: DEF só dos slots 4-6", mem[2], 669 * 1.125 ** 2);
// Stats do jogo: ATK 1953, DEF 1390, CRIT 936. A conta erra por até 4 (0,2%)
const [, fAtk, fDef, fCrit] = frameStats(selena, { rank: "SS" });
near("Selena: ATK total do jogo (1953)", fAtk + 436 + mem[1], 1953, 4);
near("Selena: DEF total do jogo (1390)", fDef + mem[2], 1390, 4);
near("Selena: CRIT total do jogo (936)", fCrit + 249 + mem[3], 936, 4);
const ref = buildStats(selena, DAMAGE_KITS["Selena: Pianissimo"].build, { rank: "SS" }, WEAPON_STATS, MEMORY_STATS);
near("buildStats da build de referência = conta acima", ref.atk, fAtk + 436 + mem[1]);

// Kit da Selena: ATK 1000, sem alvo, golpe normal (sem CRIT)
const kit = DAMAGE_KITS["Selena: Pianissimo"];
near("rank: SS3 alcança SS", rankReached("SS", 3, "SS") ? 1 : 0, 1);
near("rank: SS2 não alcança SS3", rankReached("SS", 2, "SS3") ? 1 : 0, 0);
near("rank: SSS alcança SS3", rankReached("SSS", 0, "SS3") ? 1 : 0, 1);
const kitRows = (mode, on, levels = {}, rank = "SS") => Object.fromEntries(kitDamage(kit, {
  rank, phase: 0, mode, levels, on: new Set(on), atk: 1000, crit: "normal", target: presetTarget(ENEMY_PRESETS[0])
}).map(r => [r.name, r]));
const base = ["class", "weapon", "burana2", "pact"];
let k = kitRows("energy", base);
near("kit: Red Orb = 3,6 × 1150 × 1,05 × 1,32", k["Red Orb (3-Ping)"].damage, 3.6 * 1150 * 1.05 * 1.32);
near("kit: modo energia esconde golpes só de efeito", k["Arctic Ice"] ? 1 : 0, 0);
k = kitRows("energy", base, { core: 24 });
near("kit: Core Passive no nível 24", k["Melodic Outburst"].damage, 40 * 40 / 34 * 1150 * 1.05 * 1.32);
k = kitRows("effect", [...base, "burana4"]);
near("kit: Echoing Melody de Glaciation com Burana 4p (× 2)", k["Basic Attack - Echoing Melody"].damage, 6 * 1150 * 1.05 * 1.32 * 2);
near("kit: Glaciation marca a leitura sem fonte", k["Basic Attack - Echoing Melody"].assumed.length, 1);

// Gravação do usuário (2026-11-20): Selena sozinha, líder ligado, sem CUB, alvo "Gardener (Basic)" do treino,
// que se comporta como o boneco nível 80 de 2021. Golpes sem crítico; ATK 1953 e CRIT 936 do jogo
const game = on => Object.fromEntries(kitDamage(kit, {
  rank: "SS", phase: 0, mode: "energy", levels: { core: 24 }, on: new Set(on), atk: 1953, crit: "normal",
  target: presetTarget(ENEMY_PRESETS.find(p => p.id === "dummy"))
}).map(r => [r.name, r.damage]));
const live = game([...base, "burana4", "leader", "notes2"]);
near("jogo: Red Orb 3-ping = 11701 (±0,5%)", live["Red Orb (3-Ping)"] / 11701, 1, 0.005);
near("jogo: Echoing Melody com 2 notas = 2 × 20802 (±0,5%)", live["Basic Attack - Echoing Melody"] / (2 * 20802), 1, 0.005);
near("jogo: Rhythmic Piercing depois dela = 9 × 9243 (±0,5%)", live["Rhythmic Piercing"] / (9 * 9243), 1, 0.005);
// Com o Harmony da arma (Core Passive 27, Signature 20) e o Cottie 4p ativo (Harmony Absorption)
const flow = Object.fromEntries(kitDamage(kit, {
  rank: "SS", phase: 0, mode: "energy", levels: { core: 27, signature: 20 }, on: new Set([...base, "burana4", "leader", "ssBase", "cottie4"]),
  atk: 1953, crit: "normal", target: presetTarget(ENEMY_PRESETS.find(p => p.id === "dummy"))
}).map(r => [r.name, r.damage]));
near("jogo: Note of Termination = 21 × 16575 (±0,5%)", flow["Signature - Note of Termination"] / (21 * 16575), 1, 0.005);
near("jogo: Melodic Outburst = 7 × 25994 (±0,5%)", flow["Melodic Outburst"] / (7 * 25994), 1, 0.005);
// Alvo "Gardener (Basic)" medido: o Red Orb sai igual ao jogo, sem e com o Tank do Wanshi (−20% de Extra DMG Reduction)
const gardener = presetTarget(ENEMY_PRESETS.find(p => p.id === "gardener"));
const orb = extra => kitDamage(kit, { rank: "SS", phase: 0, mode: "energy", levels: {}, on: new Set([...base, "leader"]), atk: 1953, crit: "normal",
  target: gardener, extraBuffs: extra }).find(r => r.name === "Red Orb (3-Ping)").damage;
near("Gardener: Red Orb = 11701 (±0,1%)", orb([]) / 11701, 1, 0.001);
near("Gardener com Tank: Red Orb = 14210 (±0,1%)", orb([{ source: "Tank", factor: "extraRedDown", value: 0.2 }]) / 14210, 1, 0.001);
// Terceira gravação: com Ice Spikes, a Echoing Melody de Glaciation (2 golpes) e o Rhythmic Piercing seguinte (9 golpes)
// deram 64878 e 31236 por golpe. A razão não depende do alvo nem dos debuffs do Wanshi
const ice = Object.fromEntries(kitDamage(kit, { rank: "SS", phase: 0, mode: "effect", levels: {}, on: new Set([...base, "burana4", "leader", "notes2"]),
  atk: 1953, crit: "normal", target: gardener }).map(r => [r.name, r.damage]));
near("Glaciation: Echoing Melody / Rhythmic Piercing por golpe = 64878 / 31236 (±0,1%)",
  (ice["Basic Attack - Echoing Melody"] / 2) / (ice["Rhythmic Piercing"] / 9) / (64878 / 31236), 1, 0.001);
// Valores absolutos de Glaciation no Gardener, com os debuffs do Wanshi: Tank (−20% de Extra DMG Reduction) e
// Frost Corrosion (−25% de resistência a Ice)
const tank = { source: "Tank", factor: "extraRedDown", value: 0.2 }, frost = { source: "Frost Corrosion", factor: "resDown", element: "Ice", value: 0.25 };
const iceRows = extra => Object.fromEntries(kitDamage(kit, { rank: "SS", phase: 0, mode: "effect", levels: {}, on: new Set([...base, "burana4", "leader", "notes2"]),
  atk: 1953, crit: "normal", target: gardener, extraBuffs: extra }).map(r => [r.name, r.damage]));
near("Glaciation: Ice Accumulation com Tank = 4357 (±0,2%)", iceRows([tank])["Ice Accumulation"] / 4357, 1, 0.002);
// Pendente: no mesmo instante, o Ice Accumulation deu 5252, 2,9% abaixo do que o motor prevê (5406). Ele perde algum
// bônus que os golpes de skill da Selena têm; ver docs/calculo-de-dano.md
near("Glaciation: Echoing Melody com Tank e Frost Corrosion = 2 × 64878 (±0,2%)", iceRows([tank, frost])["Basic Attack - Echoing Melody"] / (2 * 64878), 1, 0.002);
near("Glaciation: Rhythmic Piercing com Tank e Frost Corrosion = 9 × 31236 (±0,2%)", iceRows([tank, frost])["Rhythmic Piercing"] / (9 * 31236), 1, 0.002);
// Kamui: Aeternion (sem medição no jogo ainda): o kit monta e segue as regras
const kamui = DAMAGE_KITS["Kamui: Aeternion"];
const kamuiRows = (mode, on, rank = "S", phase = 0, levels = {}) => Object.fromEntries(kitDamage(kamui, {
  rank, phase, mode, levels, on: new Set(on), atk: 1000, critStat: 3000, crit: "crit", target: presetTarget(ENEMY_PRESETS[0])
}).map(r => [r.name, r]));
let km = kamuiRows("energy", []);
near("Kamui: golpe de Fire não crita (CRIT ignorado)", km["Yellow Orb - Flare Burst"].damage, 6 * 1000);
near("Kamui: Firelit Thunder (sempre Plasma Beam) aparece no modo energia", km["Yellow Orb - Firelit Thunder (each swing)"]?.kind === "effect" ? 1 : 0, 1);
near("Kamui: golpe só do efeito some no modo energia", km["Electric Storm Flash strike (every 2s)"] ? 1 : 0, 0);
km = kamuiRows("effect", ["sunfire", "hazePlasma"]);
near("Kamui: Plasma Beam usa Lightning e o efeito, sem o bônus de Fire", km["Signature - Molten Heart"].damage, 167.2 * 1000 * 1.4 * 1.25);
near("Kamui: Coiled Tempest não reduz a resistência a Fire", kamuiRows("energy", ["hazePlasma"])["Yellow Orb - Flare Burst"].damage, 6 * 1000);
near("Kamui: Coiled Tempest −35% em SS3", kamuiRows("effect", ["hazePlasma"], "SS", 3)["QTE"].damage, 6 * 1000 * 1.35);
// Tela do jogo: Kamui SS3 com a build do usuário tem ATK 1874 (o motor fica 0,3% acima, como a Selena)
near("Kamui: ATK da build = 1874 (±0,5%)", buildStats(FRAME_STATS["Kamui: Aeternion"], kamui.build, { rank: "SS", phase: 3 }, WEAPON_STATS, MEMORY_STATS).atk / 1874, 1, 0.005);
near("Kamui: rank S nível 80 sem promote nem fases = 413 (Bilibili)",
  frameStats({ ...FRAME_STATS["Kamui: Aeternion"], promote: [0, 0, 0, 0] }, { rank: "S", level: 80 })[1], 413, 0.5);
// Gravação do usuário: o campo da Signature com e sem o Breaker no Gardener (2065/1701 e 1930/1589)
const field = on => kitDamage(kamui, { rank: "SS", phase: 3, mode: "energy", levels: {}, on: new Set(on), atk: 2000,
  target: presetTarget(ENEMY_PRESETS.find(p => p.id === "gardener")) }).find(r => r.name === "Molten Heart field (per second)").damage;
near("Kamui: Breaker no Gardener = 2065/1701 (±0,1%)", field(["class"]) / field([]) / (2065 / 1701), 1, 0.001);
// Valores absolutos do campo (ATK 1874, time com Plasma Beam, líder, Feynman 2p, Sequence Pact, Cottie 4p depois da Signature)
const tick = on => kitDamage(kamui, { rank: "SS", phase: 3, mode: "energy", levels: { signature: 24 }, atk: 1874,
  on: new Set(["weapon", "feynman2", "leader", "pact", "cottie4", "corrosion", ...on]), target: presetTarget(ENEMY_PRESETS.find(p => p.id === "gardener")) })
  .find(r => r.name === "Molten Heart field (per second)").damage;
near("Kamui: campo = 1589 (±0,3%)", tick([]) / 1589, 1, 0.003);
near("Kamui: campo com Breaker = 1930 (±0,3%)", tick(["class"]) / 1930, 1, 0.003);
near("Kamui: campo com Glorious Afterglow = 1701 (±0,3%)", tick(["afterglow"]) / 1701, 1, 0.003);
near("Kamui: campo com Breaker e Afterglow = 2065 (±0,3%)", tick(["class", "afterglow"]) / 2065, 1, 0.003);
const tickNoCottie = kitDamage(kamui, { rank: "SS", phase: 3, mode: "energy", levels: { signature: 24 }, atk: 1874,
  on: new Set(["weapon", "feynman2", "leader", "pact", "class", "corrosion"]), target: presetTarget(ENEMY_PRESETS.find(p => p.id === "gardener")) })
  .find(r => r.name === "Molten Heart field (per second)").damage;
near("Kamui: campo com Breaker, sem Cottie = 1711 (±0,3%)", tickNoCottie / 1711, 1, 0.003);
near("Kamui: Crown Arc × 5 com 90 Output", kamuiRows("energy", ["crown5"])["Crown Arc (both hits)"].damage, 35.08 * 1000 * 5);
near("Kamui: bônus de SS3 só a partir de SS3", kamuiRows("energy", ["ss3"], "SS", 2)["Red Orb - Searing Leap (3-Ping)"].damage, 14.5 * 1000);
near("Kamui: SS3 Red Orb Base DMG +60%", kamuiRows("energy", ["ss3"], "SS", 3)["Red Orb - Searing Leap (3-Ping)"].damage, 14.5 * 1000 * 1.6);
near("Kamui: Breaker escala com o nível da classe", kamuiRows("energy", ["class"], "S", 0, { class: 24 })["QTE"].damage,
  6 * 1000 * (1 + 0.2 * 40 / 34));
near("kit: Ice Burst não escala, Base DMG +900%", k["Ice Burst (10000 Congelation)"].damage, 1 * 1150 * 1.05 * 1.32 * 10);
near("kit: QTE fica físico no modo efeito", k.QTE.kind === "energy" ? 1 : 0, 1);
k = kitRows("energy", [...base, "ssBase", "qte"], {}, "SS");
near("kit: bônus de SS vale em SS", k["Signature - Majestic Interlude"].damage, 10 * 1150 * 1.05 * 1.32 * 1.3);
near("kit: bônus de SS3 não vale em SS0", k.QTE.damage, 6 * 1150 * 1.05 * 1.32);
near("kit: classe escala com o nível dela", kitRows("energy", ["class"], { class: 24 })["QTE"].damage, 6 * 1000 * (1 + 0.2 * 40 / 34));
// Vera: Geiravor. Tela do jogo: SSS+ com a build do usuário tem ATK 2002 (o motor fica 0,5% acima)
const vera = DAMAGE_KITS["Vera: Geiravor"];
near("Vera: rank S nível 80 sem promote nem fases = 402 (Bilibili)",
  frameStats({ ...FRAME_STATS["Vera: Geiravor"], promote: [0, 0, 0, 0] }, { rank: "S", level: 80 })[1], 402, 0.5);
near("Vera: ATK da build = 2002 (±0,6%)", buildStats(FRAME_STATS["Vera: Geiravor"], vera.build, { rank: "SSS+" }, WEAPON_STATS, MEMORY_STATS).atk / 2002, 1, 0.006);
const veraRows = (on, rank = "SSS+", levels = { signature: 25 }) => Object.fromEntries(kitDamage(vera, { rank, phase: 0, mode: "energy", levels,
  on: new Set(on), atk: 2002, target: presetTarget(ENEMY_PRESETS.find(p => p.id === "gardener")) }).map(r => [r.name, r.damage]));
const veraAlways = ["weapon", "sar", "hervor2", "shakespeare2", "shakespeare4", "burn", "pact", "leader", "sss6", "sssPlus"];
// Gravação do usuário: o primeiro Tempered in Midnight (antes de qualquer cura) deu 43899 por golpe, e o Scorched in Void
// com Absolute Pyre de 6 orbes, Fire Tempered e Glorious Spear (os orbes vermelhos já curaram), 395258 por golpe.
// Em aberto: com o Fire Tempered em 30% (regra do usuário), o motor fica 5% acima com o Glorious Spear e 2,2% abaixo sem
// ele. Só informa, não conta como teste, até uma gravação separar os golpes
const tempered = veraRows(veraAlways)["Signature - Tempered in Midnight"];
const scorchedRatio = spear => veraRows([...veraAlways, "pyre6", "tempered", ...spear])["Signature - Scorched in Void"] / 4 / tempered / (395258 / 43899);
console.log(`info Vera: Scorched in Void / Tempered in Midnight, motor ÷ jogo: ${scorchedRatio(["spear"]).toFixed(3)} com Glorious Spear, ${scorchedRatio([]).toFixed(3)} sem`);
near("Vera: Absolute Pyre não vale para o Tempered in Midnight", veraRows([...veraAlways, "pyre6"])["Signature - Tempered in Midnight"], tempered, 1e-6);
near("Vera: Scorched in Void bate 1 + 3 vezes com 6 orbes em SS", veraRows(["pyre6"], "SS", {})["Signature - Scorched in Void"],
  58 * 2002 * 1.6 * 4 * (1 - 0.195) * (1 - 0.0673), 1e-6);
near("Vera: Rending Ravage só repete a partir de SS3", veraRows(["pyre6"], "SS", {})["Rending Ravage"], 32 * 2002 * 1.6 * (1 - 0.195) * (1 - 0.0673), 1e-6);
const veraFx = on => Object.fromEntries(kitDamage(vera, { rank: "SS", phase: 0, mode: "effect", levels: {}, on: new Set(on), atk: 1000,
  target: presetTarget(ENEMY_PRESETS[0]) }).map(r => [r.name, r.damage]));
near("Vera: Darkflow Aura com 15 stacks = 1600%", veraFx(["aura15"])["Darkflow Aura burst"], 16 * 1000);
near("Vera: Darkflow Aura com 6 stacks = 60% por segundo", veraFx(["aura6"])["Darkflow Aura (per second)"], 0.6 * 1000);
near("Vera: 1 QTE antes do Absolute Pyre = Base DMG +25%", veraRows(["qtePyre1"], "SS", {})["Blue Orb - Scorching Sweep (3-Ping)"],
  9 * 2002 * 1.25 * (1 - 0.195) * (1 - 0.0673), 1e-6);
near("Vera: Frenzied Hunt só no Tempered in Midnight", veraRows(["cubFrenzy"], "SS", {})["Signature - Tempered in Midnight"] / veraRows([], "SS", {})["Signature - Tempered in Midnight"], 1.6);
near("Vera: Blazing Fangs soma 100 de ATK depois do ATK%", veraRows(["cubFangs", "leader"], "SS", {})["QTE"] / veraRows(["leader"], "SS", {})["QTE"], (2002 * 1.1 + 100) / (2002 * 1.1));
near("HP sem fonte fica null", frameStats(selena, { rank: "SS" })[0] === null ? 1 : 0, 1);

console.log(failed ? `\n${failed} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exitCode = failed ? 1 : 0;
