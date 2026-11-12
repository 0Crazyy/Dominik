/* =====================================================
   DATA - to add a new composition:
   1) copy an object in COMPS and change its data
   2) add its id to the page's "comps" list in PAGES
   A composition holds either "cards", or "variants" ([{ id, name, cards }]): with variants,
   (a variant can also have "group" and "label": the picker lists it as "label" under that group)
   clicking the composition reveals them and the build shows once one is picked.
   Images (optional): put them in /assets and use the path,
   e.g. portrait:"assets/rosetta.png". No image = empty slot.
   Extra fields: symbol (class icon), weapon, wh (Weapon Harmony memory name, framed in
   WH_FRAME), memories (6), matrix (3 weapon resonances),
   resonance + core (the two "6x" icons), construct (CUB), skills (6 CUB skills),
   rank (badge beside the portrait; levels have their own file, like SS3.png. Left out, it is SSS on free frames and SS on the rest).
   ===================================================== */
const CHARS = "assets/characters", MEM = "assets/memories", RES = "assets/resonances";
const WEAPON_RES = n => `${RES}/Ressonância de Arma - ${n} HD.png`;
const ALL_ATK = `${RES}/Ressonância - ALL ATK.png`;
// Memory sets, in the tabs and order of the game's Select Memory Set screen, plus Nihil and Uniframe.
// Each tab is a folder in assets/memories, and files are named "Memória - <name> <1-4|2-5|3-6|WH>.<ext>".
// Entry: [name, boost, art extension]. No extension = no art yet: its Assets card shows empty slots
// and a build shows its name instead. When the art arrives, just add the extension here.
const MEMORY_TABS = {
  Common: [["Frederick", "Dodge Boost", "png"], ["Cottie", "Signature Move Boost", "png"], ["Hanna", "3-Ping Boost", "png"],
    ["Darwin", "Orb Skill Boost", "png"], ["Condelina", "Basic Attack Boost", "png"]],
  Support: [["Guinevere", "Support Boost II", "png"], ["Philip II", "Support Boost I", "png"], ["Einsteina", "Survival Boost II", "png"],
    ["Catherine", "Survival Boost I", "png"], ["Da Vinci", "QTE Boost", "png"], ["Gloria", "Weaken Enemy II", "png"]],
  Effect: [["Clusius", "Ignition Boost", "png"], ["Bunsen", "Ultima Slash Boost", "png"], ["Poincare", "Darkflow Boost", "png"],
    ["Klenova", "Glaciation Boost", "png"], ["Wilde", "Plasma Beam Boost", "png"]],
  Physical: [["Santiago", "Physical Boost", "webp"], ["Keats", "Physical Boost", "png"], ["Burana", "Physical Boost", "png"],
    ["Chang Wuzi", "Physical Boost", "png"], ["Signa", "Physical Boost", "png"], ["Charlotte", "Physical Boost", "png"],
    ["Leeuwenhoek", "Physical Support Boost", "png"], ["Patton", "Physical Boost", "png"]],
  Fire: [["Feynman", "Fire Boost", "webp"], ["Hervor", "Fire Boost", "png"], ["Heraclitus", "Fire Boost", "png"],
    ["Alphonse", "Fire Boost", "png"], ["Turing", "Fire Boost", "png"], ["Unimate", "Fire Boost", "png"],
    ["Elizabeth", "Fire Boost", "png"], ["Shakespeare", "Fire Boost", "png"]],
  Ice: [["Pavlichenko", "Ice Boost", "webp"], ["Joanna", "Ice Boost", "png"], ["Liston", "Ice Boost", "png"],
    ["Ji Bo'an", "Ice Boost", "png"], ["Aline", "Ice Boost", "png"], ["Chen Jiyuan", "Ice Boost", "png"], ["Mousme", "Ice Boost", "png"]],
  Lightning: [["Cogito", "Lightning Boost", "webp"], ["Natasha", "Lightning Boost", "png"], ["Herschell", "Lightning Boost", "png"],
    ["Fran", "Lightning Boost", "png"], ["Diesel", "Lightning Boost", "png"], ["Tifa", "Lightning Boost", "png"], ["Heisen", "Lightning Boost", "png"]],
  Dark: [["Pesanteur", "Dark Boost", "webp"], ["Nimue", "Dark Boost", "png"], ["Jeanne", "Dark Boost", "png"],
    ["Barcelo", "Dark Boost", "png"], ["Derketo", "Dark Boost", "webp"], ["Boone", "Dark Boost", "png"],
    ["Seraphine", "Dark Boost", "png"], ["Flamel", "ATK Boost", "png"], ["Bathlon", "Dark Boost", "png"]],
  Nihil: [["Bulgakov", "Nihil Boost", "webp"], ["Sothoth", "Nihil Boost", "png"], ["Cleopatra", "Nihil Boost", "png"]],
  Uniframe: [["Liliana", "ATK Boost", "png"], ["Shelley", "Lightning Boost", "png"], ["Isabel", "Ice Boost", "png"], ["Marco", "Physical Boost", "png"],
    ["Jack", "Fire Boost", "png"], ["Lucrezia", "Lightning Boost", "png"], ["Wu'an", "ATK Boost", "png"], ["Koya", "ATK Boost", "png"]]
};
const MEM_INDEX = new Map(Object.entries(MEMORY_TABS).flatMap(([tab, sets]) => sets.map(([name, , ext]) => [name, { tab, ext }])));
const memFile = (name, piece, ext = MEM_INDEX.get(name).ext) => `${MEM}/${MEM_INDEX.get(name).tab}/Memória - ${name} ${piece}.${ext}`;
// The three arts of a memory set, in slot order: 1-4, 2-5, 3-6
const memSet = name => ["1-4", "2-5", "3-6"].map(p => MEM_INDEX.get(name).ext ? memFile(name, p) : name);
// 4 pieces of "main" (slots 1, 2, 3, 5) + 2 pieces of "sub" (slots 4, 6)
const memBuild = (main, sub) => [main[0], main[1], main[2], sub[0], main[1], sub[2]];
const cubSkills = (dir, ext = "png") => [1, 2, 3, 4, 5, 6].map(i => `${dir}/CUB - Skill ${i}.${ext}`);

const SELENA = `${CHARS}/selena-pianissimo`;
const WANSHI = `${CHARS}/wanshi-lucid-dreamer`;
const HELENTINE = `${CHARS}/helentine-lacrimosa`;
const BURANA = memSet("Burana");
const LISTON = memSet("Liston");
const CHEN_JIYUAN = memSet("Chen Jiyuan");
const COTTIE = memSet("Cottie");
const GUINEVERE = memSet("Guinevere");
const DA_VINCI = memSet("Da Vinci");
const LUCIA_IC = `${CHARS}/lucia-inverse-crown`;
const TEDDY = `${CHARS}/teddy-spectre`;
const LEIA = `${CHARS}/leia-fortunaster`;
const LUNA = `${CHARS}/luna-oblivion`;
const NIRVATIA = `${CHARS}/nirvatia-dirge`;
const PAVLICHENKO = memSet("Pavlichenko");
const JOANNA = memSet("Joanna");
const MOUSME = memSet("Mousme");
const GLORIA = memSet("Gloria");

const LUCIA_P = `${CHARS}/lucia-pyroath`;
const VERA = `${CHARS}/vera-geiravor`;
const KAMUI = `${CHARS}/kamui-aeternion`;
const LIV = `${CHARS}/liv-limpidity`;
const NANAMI = `${CHARS}/nanami-startrail`;
const BIANCA = `${CHARS}/bianca-crepuscule`;
const ADELYDE = `${CHARS}/adelyde-anabasis`;
const ROSETTA = `${CHARS}/rosetta-arete`;
const LILITH = `${CHARS}/lilith-daemonissa`;
const KURUMI = `${CHARS}/kurumi-tokisaki`;
const HANYING = `${CHARS}/hanying-solacetune`;
const WATANABE = `${CHARS}/watanabe-epitaph`;
const VERONICA = `${CHARS}/veronica-aegis`;
const KARENINA = `${CHARS}/karenina-effulgence`;
const KEATS = memSet("Keats");
const SANTIAGO = memSet("Santiago");
const HERACLITUS = memSet("Heraclitus");
const HERVOR = memSet("Hervor");
const FEYNMAN = memSet("Feynman");
const NATASHA = memSet("Natasha");
const HERSCHELL = memSet("Herschell");
const JEANNE = memSet("Jeanne");
const PESANTEUR = memSet("Pesanteur");
const NIMUE = memSet("Nimue");
const BARCELO = memSet("Barcelo");
const DERKETO = memSet("Derketo");
const CHANG_WUZI = memSet("Chang Wuzi");
const ALPHONSE = memSet("Alphonse");
const SHAKESPEARE = memSet("Shakespeare");
const HEISEN = memSet("Heisen");
const BATHLON = memSet("Bathlon");
const PATTON = memSet("Patton");
const CLEOPATRA = memSet("Cleopatra");
const BULGAKOV = memSet("Bulgakov");
// As in the reference image: Nimue and Bulgakov show their 3-6 art first, so the pieces are rotated
const rotated = ([a, b, c]) => [c, a, b];

// Weapon Harmony: each memory is framed once here, as [x%, y%, zoom]. A card only says wh: "Da Vinci".
// A memory missing from this list still works: it just shows the whole art until a frame is added.
const WH_FRAME = {
  "Bathlon": [54, 15, 5.4],
  "Chen Jiyuan": [50, 21, 3.5],
  "Cottie": [49, 6, 3.2],
  "Da Vinci": [50, 31, 4.6],
  "Darwin": [48, 21, 4.07],
  "Einsteina": [48, 33, 5.5],
  "Guinevere": [50, 48, 6],
  "Heisen": [44, 9, 3.7],
  "Klenova": [56, 41, 3.5],
  "Patton": [52, 23, 4.3],
  "Shakespeare": [33, 6, 3]
};

const GA = "Glorious Afterglow", GS = "Glorious Spear", ML = "Matrix Lightning", SAR = "Superconducting Axial Ray",
  DD = "Domain Deconstruction", INC = "Incandescence", DLT = "Dead Line Timing";
const matrix = (...names) => names.map(WEAPON_RES);
const classIcon = name => `assets/classes/${name}.png`;

// Wanshi runs the same build in every team he appears in
const WANSHI_BUILD = {
  rank: "assets/rank/SSS.png",
  symbol: "assets/classes/Tanque.png",
  portrait: "assets/characters/roleicon/wanshi_awk.png",
  weapon: "assets/weapons/e3revolvermd010011.png",
  wh: "Da Vinci",
  memories: memBuild(LISTON, DA_VINCI),
  matrix: ["Domain Deconstruction", "Matrix Lightning", "Incandescence"].map(WEAPON_RES),
  resonance: ALL_ATK,
  core: `${WANSHI}/Skill - Signature HD.png`,
  construct: `${WANSHI}/CUB - Snowveil.png`,
  skills: cubSkills(WANSHI)
};

// Parts of a character's card that stay the same across teams; each card adds its memories, matrix and desc
const LUCIA_IC_KIT = {
  name: "Lucia: Inverse Crown", symbol: classIcon("Attacker"), portrait: `${LUCIA_IC}/Awaken - Lucia Inverse Crown.png`,
  weapon: `${LUCIA_IC}/Arma - Lucia Inverse Crown.webp`, matrix: matrix(GA, INC, DLT),
  resonance: ALL_ATK, core: `${LUCIA_IC}/Skill - Signature HD.png`, construct: `${LUCIA_IC}/CUB - Allos.webp`, skills: cubSkills(LUCIA_IC, "webp")
};
const SELENA_KIT = {
  name: "Selena: Pianissimo", symbol: classIcon("Attacker"), portrait: `${SELENA}/Awaken - Selena Pianissimo.png`,
  weapon: `${SELENA}/Arma - Selena Pianissimo.png`, memories: memBuild(BURANA, COTTIE),
  resonance: ALL_ATK, core: `${SELENA}/Skill - Core Passiva.png`, construct: `${SELENA}/CUB - Snow Waltz.png`, skills: cubSkills(SELENA)
};
const LIV_KIT = {
  name: "Liv: Limpidity", symbol: classIcon("Attacker"), portrait: `${LIV}/Awaken - Liv Limpidity.png`,
  weapon: `${LIV}/Arma - Liv Limpidity.png`, matrix: matrix(GA, INC, ML),
  resonance: ALL_ATK, core: `${LIV}/Skill - Core Passiva HD.png`, construct: `${LIV}/CUB - Levvi.png`, skills: cubSkills(LIV)
};
const HANYING_KIT = {
  name: "Hanying: Solacetune", symbol: classIcon("Tanque"), portrait: `${HANYING}/Awaken - Hanying Solacetune.png`,
  weapon: `${HANYING}/Arma - Hanying Solacetune.png`,
  resonance: ALL_ATK, core: `${HANYING}/Skill - Core Passiva.png`, construct: `${HANYING}/CUB - Dreamwing.png`, skills: cubSkills(HANYING)
};
const VERONICA_KIT = {
  name: "Veronica: Aegis", symbol: classIcon("Amplifier"), portrait: `${VERONICA}/Awaken - Veronica Aegis.png`,
  weapon: `${VERONICA}/Arma - Veronica Aegis.png`, wh: "Da Vinci", memories: memBuild(KEATS, DA_VINCI), matrix: matrix(SAR, GS, INC),
  resonance: ALL_ATK, core: `${VERONICA}/Skill - Signature.png`, construct: `${VERONICA}/CUB - Scaled Rampart.png`,
  // Order as in the reference images: slots 1 and 3 are her Skill 3 and Skill 1
  skills: [3, 2, 1, 4, 5, 6].map(i => `${VERONICA}/CUB - Skill ${i}.png`)
};
const KARENINA_KIT = {
  name: "Karenina: Effulgence", symbol: classIcon("Breaker"), portrait: `${KARENINA}/Awaken - Karenina Effulgence.png`,
  weapon: `${KARENINA}/Arma - Karenina Effulgence.webp`, wh: "Patton", memories: memBuild(SANTIAGO, PATTON), matrix: matrix(DD, GA, INC),
  resonance: ALL_ATK, core: `${KARENINA}/Skill - Signature 2X.png`, construct: `${KARENINA}/CUB - Patrick.webp`, skills: cubSkills(KARENINA, "webp")
};
const HELENTINE_KIT = {
  name: "Helentine: Lacrimosa", symbol: classIcon("Amplifier"), portrait: `${HELENTINE}/Awaken - Helentine.png`,
  weapon: `${HELENTINE}/Arma - Helentine Lacrimosa.webp`, matrix: matrix(SAR, GS, INC),
  resonance: ALL_ATK, core: `${HELENTINE}/Skill - Signature 2X.png`, construct: `${HELENTINE}/CUB - Grand Duke.webp`, skills: cubSkills(HELENTINE, "webp")
};
const VERA_KIT = {
  name: "Vera: Geiravor", symbol: classIcon("Amplifier"), portrait: `${VERA}/Awaken - Vera-chan Geiravor.png`,
  weapon: `${VERA}/Arma - Vera Geiravor.png`, wh: "Shakespeare", memories: memBuild(HERVOR, SHAKESPEARE), matrix: matrix(SAR, GS, INC),
  resonance: ALL_ATK, core: `${VERA}/Skill - Signature 2X.png`, construct: `${VERA}/CUB - Wrathfang.png`, skills: cubSkills(VERA)
};
const KAMUI_KIT = {
  name: "Kamui: Aeternion", symbol: classIcon("Breaker"), portrait: `${KAMUI}/Awaken - Kamui.png`,
  weapon: `${KAMUI}/Arma - Kamui Aeternion.png`, wh: "Darwin", memories: memBuild(FEYNMAN, COTTIE),
  resonance: ALL_ATK, core: `${KAMUI}/Skill - Signature 2.png`, construct: `${KAMUI}/CUB - Ignis.png`, skills: cubSkills(KAMUI, "webp")
};
const TEDDY_KIT = {
  rank: "assets/rank/SSS.png",
  name: "Teddy: Spectre", symbol: classIcon("Amplifier"), portrait: `${TEDDY}/Awaken - Teddy Spectre.png`,
  weapon: `${TEDDY}/Arma - Teddy Spectre.png`, matrix: matrix(SAR, GS, INC),
  resonance: ALL_ATK, core: `${TEDDY}/Skill - Signature HD.png`, construct: `${TEDDY}/CUB - Beep-Boop.png`,
  // Order as in the reference image: slot 5 is Teddy's Skill 6, slot 6 is Bianca's Skill 6
  skills: [...cubSkills(TEDDY).slice(0, 4), `${TEDDY}/CUB - Skill 6.png`, `${CHARS}/bianca-crepuscule/CUB - Skill 6.png`]
};
const LEIA_KIT = {
  name: "Leia: Fortunaster", symbol: classIcon("Breaker"), portrait: `${LEIA}/Awaken - Leia Fortunaster.png`,
  weapon: `${LEIA}/Arma - Leia Fortunaster.png`,
  matrix: matrix(DD, GA, ML), resonance: ALL_ATK, core: `${LEIA}/Skill - Core Passiva.png`, construct: `${LEIA}/CUB - Vulpecula.png`, skills: cubSkills(LEIA)
};
const NANAMI_KIT = {
  name: "Nanami: Startrail", symbol: classIcon("Tanque"), portrait: `${NANAMI}/Awaken - Nanami Startrail.png`,
  weapon: `${NANAMI}/Arma - Nanami Startrail.png`, matrix: matrix(DD, ML, INC),
  resonance: ALL_ATK, core: `${NANAMI}/Skill - Signature HD.png`, construct: `${NANAMI}/CUB - Bramble Angler.png`, skills: cubSkills(NANAMI)
};
const ADELYDE_KIT = {
  name: "Adelyde: Anabasis", symbol: `${ADELYDE}/Classe - Adelyde Anabasis.png`, portrait: `${ADELYDE}/Awaken - Adelyde Anabasis.png`,
  weapon: `${ADELYDE}/Arma - Adelyde Anabasis.webp`, wh: "Bathlon", memories: memBuild(PESANTEUR, BATHLON), matrix: matrix(SAR, GS, ML),
  resonance: ALL_ATK, core: `${ADELYDE}/Skill - Signature 2X.png`, construct: `${ADELYDE}/CUB - Kelpie.webp`, skills: cubSkills(ADELYDE, "webp")
};
const ROSETTA_KIT = {
  name: "Rosetta: Arete", symbol: classIcon("Breaker"), portrait: `${ROSETTA}/Awaken - Rosetta Arete.png`,
  weapon: `${ROSETTA}/Arma - Mirage Alberd.webp`, wh: "Cottie", memories: memBuild(NIMUE, COTTIE), matrix: matrix(DD, DLT, GA),
  resonance: ALL_ATK, core: `${ROSETTA}/Skill - Signature.webp`, construct: `${ROSETTA}/CUB - Buzzling.webp`, skills: cubSkills(ROSETTA, "webp")
};
const LILITH_KIT = {
  name: "Lilith: Daemonissa", symbol: classIcon("Amplifier"), portrait: `${LILITH}/Awaken - Lilith Daemonissa.png`,
  weapon: `${LILITH}/Arma - Lilith Daemonissa.png`, resonance: ALL_ATK, core: `${LILITH}/Skill - Signature HD.png`,
  construct: `${LILITH}/CUB - Billie.png`, skills: cubSkills(LILITH)
};

const VERA_DESC = "Standard DPS build for Vera-chan. She doesn't need her Signature memories to shine.\n• Below SSS: Hervor lets her do 2 Signatures without DLT, and without forcing a teammate's CUB down to Lingya.\n• Secondary memory: many options at SS/SS3, even more at SSS.\n• If Kamui runs Shakespeare: swap it here for Cottie (the Extra DMG works, since her first Signature enters her passive) or for Guinevere to buff Kamui even more.\n• At SSS: Shakespeare + Cottie together for even more damage.";
const KAMUI_DESC = "After a hotfix, his yellow orb no longer recovers Signature Energy so easily.\n• Cottie: needed below SS3 to do 2 Signatures smoothly. Like Rosetta, he needs Cottie at lower ranks, but no DLT.\n• 2 Darwin: recommended for maximum output, since he deals a lot of damage before his Signature and uses many 3-pings.\n• 4 Cottie: also works in WZ, but not much in PPC.";
const LUCIA_IC_DESC = "Standard DPS build for Alpha: Inverse Crown.\n• No Cottie: her Signature runs on Malison, her own energy, which only her skills generate. Only SS3 gives her more energy.\n• Since Cottie is out, other memories work too, even Da Vinci.";
const VERONICA_DESC ="Support-DPS build for Veronica.\n• Role: bridges Selena's noise system, or backs up Karenina and Hanying.\n• With Selena and everyone below SSS: she finishes her long damage output right in time to switch to Karenina.";
const KARENINA_DESC = "Build for every Physical need of Karenina.\n• No Cottie: her skills already generate a lot of energy.\n• Exceptions: very specific moments, staying long on the field, or spamming Signatures at SS3 and above.";
const ROSETTA_DESC ="Cottie is needed at lower ranks for smooth damage loops.\n• DLT at SS0: not needed if she does a single Signature on her first damage loop and then switches. After that, she can do 2 Signatures in a row until the WZ timer runs out.\n• SS3 and above: no DLT needed.";
const ADELYDE_DESC = "Like Alpha: Inverse Crown, Cottie doesn't work on her.\n• Why: her skills grant Anabasis points, which she uses as Signature Energy, so Cottie's buffs do nothing. Only SS3 and SSS make her faster. She's free, but this hurts players with few vouchers and future players who won't get the Journey of Promise copy.\n• Otherwise: anything works alongside her Signature memory, without DLT.";
const ADELYDE_QTE_DESC = `${ADELYDE_DESC}\n• QTE: her SSS skill increases any QTE damage by 50%. To abuse the Attacker's SS3 QTE damage, use Da Vinci instead of Bathlon.`;

// Colors sampled from the reference images
const FIRE_THEME = { c1: "#f57f80", c2: "#170f0f", cp: "#3a2326" };
const LIGHTNING_THEME = { c1: "#c3a14e", c2: "#13110b", cp: "#332c19" };
const DARK_THEME = { c1: "#b38aff", c2: "#120f17", cp: "#2a2347" };
const ICE_THEME = { c1: "#2fb4e0", c2: "#07131a", cp: "#0d2c3a" };
const NIHIL_THEME = { c1: "#ee77b2", c2: "#160f12", cp: "#361d2a" };
const PHYSICAL_THEME = { c1: "#7ff0bc", c2: "#0f1515", cp: "#1e332c" };

// Shown above any build with this character until the date below (Brasília time)
const NEW_CHARACTER_NOTICE = {
  name: "Leia: Fortunaster", until: "2026-11-12T02:00:00-03:00",
  text: "Leia: Fortunaster is a recent character, so there is little feedback on these builds so far. It's recommended to wait at least 1 week for more information. Take it with a grain of salt."
};

// Ranks a build is made for
const RANK_SS = { rank: "assets/rank/SS.png" }, RANK_SS3 = { rank: "assets/rank/SS3.png" };
const rankArt = c => c.rank || (TL_FREE[c.name] ? "assets/rank/SSS.png" : RANK_SS.rank);
// A Comet's Afterglow teams follow Spider 2B's Leia guide. Leia's build only changes with her rank
const LEIA_SS = { ...RANK_SS, wh: "Chen Jiyuan", memories: memBuild(MOUSME, CHEN_JIYUAN),
  desc: [
    "Hypertune set for SS and below.",
    "• No Weapon Harmony: 2 Einsteina instead of 2 Chen Jiyuan.",
    "• Why no Cottie: without SS3's starting Signature Energy she can't reach her Signature fast, so 4 Chen Jiyuan deals more damage.",
    "• Bottom resonance: Core Passive gives her the most damage. Pick Breaker class skill if your main DPS is highly invested."
  ].join("\n") };
const LEIA_SS3 = { ...RANK_SS3, wh: "Einsteina", memories: memBuild(MOUSME, COTTIE),
  desc: [
    "Hypertune set for SS3 and above.",
    "• Why Cottie: SS3 gives her 20 Signature Energy on entry, so she can use her Signature right after the Gravity Orb form swap.",
    "• No Weapon Harmony: keep 2 Cottie.",
    "• Glaciation: if Selena runs 4 Burana + 4 Da Vinci and Helentine runs 4 Guinevere + 2 Cottie + 2 Einsteina, switch to 4 Chen Jiyuan.",
    "• Bottom resonance: Breaker class skill also works."
  ].join("\n") };
const TEDDY_CLASS = { ...TEDDY_KIT, core: `${TEDDY}/Skill - Class Skill.png` };
// As requested: 4x Da Vinci + 2x Guinevere, with Guinevere in slots 1 and 3
const TEDDY_SUPPORT = { ...TEDDY_CLASS, wh: "Guinevere", memories: [GUINEVERE[0], DA_VINCI[1], GUINEVERE[2], DA_VINCI[0], DA_VINCI[1], DA_VINCI[2]] };
const WANSHI_COMET = { name: "Wanshi: Lucid Dreamer", ...WANSHI_BUILD, core: `${WANSHI}/Skill - Class Skill.png` };
const cometTeam = (leia, rotation) => [
  { bar: "blue", role: "", ...LEIA_KIT, ...leia, rotation: rotation.leia },
  { bar: "red", role: "captain", ...LUCIA_IC_KIT, wh: "Chen Jiyuan", memories: memBuild(PAVLICHENKO, CHEN_JIYUAN), desc: LUCIA_IC_DESC, rotation: rotation.lucia },
  { bar: "gold", role: "starter", ...TEDDY_SUPPORT, desc: "", rotation: rotation.teddy }
];
const altIceTeam = (leia, rotation) => [
  { bar: "blue", role: "starter", ...WANSHI_COMET, wh: "Liston", memories: memBuild(DA_VINCI, LISTON),
    desc: "• No Weapon Harmony: keep 2 Liston.", rotation: rotation.wanshi },
  { bar: "red", role: "captain", ...LEIA_KIT, ...leia, rotation: rotation.leia },
  { bar: "gold", role: "", ...TEDDY_CLASS, wh: "Guinevere", memories: memBuild(JOANNA, GUINEVERE),
    desc: "Sub DPS build.\n• Bottom resonance: Signature also works, or half of each.", rotation: rotation.teddy }
];
const cometGlaciation = (helentine, leia, rotation) => [
  { bar: "blue", role: "captain", ...HELENTINE_KIT, memories: memBuild(CHEN_JIYUAN, COTTIE), ...helentine, rotation: rotation.helentine },
  { bar: "red", role: "", ...LEIA_KIT, ...leia, rotation: rotation.leia },
  { bar: "gold", role: "starter", ...TEDDY_SUPPORT, rotation: rotation.teddy,
    desc: "Other options for this spot:\n• Alisa: Echo: same build.\n• Wanshi: 4 Liston + 4 Da Vinci, a little worse.\n• Selena: 4 Burana + 4 Da Vinci." }
];

// A team is named after the patch (Global) of its newest character. Teams of one page that share
// a patch go together as "variants" of that patch; newest patch first in PAGES.
const COMPS = {
  "glaciation": {
    name: "Of Solitude and Stillness", c1: "#2fb4e0", c2: "#07131a", cp: "#0d2c3a",
    cards: [
      { bar: "blue", role: "captain starter", ...SELENA_KIT, wh: "Klenova", matrix: matrix(DLT, GA, INC),
        desc: "Standard Glaciation build for Selena.\n• Done right, her final Signature lands during the effect with a little time to spare." },
      { bar: "red", name: "Wanshi: Lucid Dreamer", role: "", ...WANSHI_BUILD,
        desc: "Support build.\n• He stacks the effect for everyone.\n• At SSS: do fast Signatures with him and switch to Helentine at maximum stacks." },
      { bar: "gold", role: "", ...HELENTINE_KIT, wh: "Cottie", memories: memBuild(CHEN_JIYUAN, GUINEVERE),
        desc: "Standard metan (phentamine) build.\n• She needs Wanshi's stacks to start dealing damage.\n• The effect lasts as long as you have pings and energy." }
    ]
  },
  "comets-afterglow": {
    name: "A Comet's Afterglow", ...ICE_THEME,
    variants: [
      { id: "leia-sub-dps", group: "Spider 2B · Alpha Ice", label: "SS Sub-Dps", name: "Spider 2B SS Leia Sub-Dps", cards: cometTeam(LEIA_SS, LEIA_ROTATIONS.alphaSS) },
      { id: "leia-cottie", group: "Spider 2B · Alpha Ice", label: "SS3 Cottie", name: "Spider 2B SS3 Leia Cottie", cards: cometTeam(LEIA_SS3, LEIA_ROTATIONS.alphaSS3) },
      { id: "leia-alt-ice", group: "Spider 2B · Alt Ice", label: "SS", name: "Spider 2B SS Leia Alt Ice", cards: altIceTeam(LEIA_SS, LEIA_ROTATIONS.altIceSS) },
      { id: "leia-alt-ice-ss3", group: "Spider 2B · Alt Ice", label: "SS3", name: "Spider 2B SS3 Leia Alt Ice", cards: altIceTeam(LEIA_SS3, LEIA_ROTATIONS.altIceSS3) },
      { id: "leia-pain-cage", group: "Spider 2B · Pain Cage", label: "Leia", name: "Spider 2B Leia Pain Cage", cards: [
        { bar: "blue", role: "", ...WANSHI_COMET, wh: "Einsteina", memories: memBuild(DA_VINCI, GLORIA), desc: "" },
        { bar: "red", role: "captain", ...LEIA_KIT, wh: "Cottie", memories: memBuild(MOUSME, COTTIE),
          desc: "Main DPS for Pain Cage.\n• No Weapon Harmony: keep 2 Cottie." },
        { bar: "gold", role: "starter", ...TEDDY_CLASS, wh: "Guinevere", memories: memBuild(CHEN_JIYUAN, GUINEVERE), desc: "" }
      ] },
      // The same teams as Spider 2B's SS ones, with Leia playing Player03's orb rotation. Lucia, Teddy and Wanshi keep the guide's
      { id: "leia-orb-alpha", group: "Leia Orb rotation", label: "Alpha Ice · SS Sub-Dps", name: "Leia Orb rotation SS Alpha Ice", cards: cometTeam(LEIA_SS, withPlayer03Leia(LEIA_ROTATIONS.alphaSS)) },
      { id: "leia-orb-alt-ice", group: "Leia Orb rotation", label: "Alt Ice · SS", name: "Leia Orb rotation SS Alt Ice", cards: altIceTeam(LEIA_SS, withPlayer03Leia(LEIA_ROTATIONS.altIceSS)) }
    ]
  },
  "comets-afterglow-glaciation": {
    name: "A Comet's Afterglow", ...ICE_THEME,
    variants: [
      { id: "leia-glaciation", group: "Spider 2B · Glaciation", label: "SS", name: "Spider 2B SS Leia Glaciation", cards: cometGlaciation(
        { wh: "Einsteina", desc: "If Leia runs Einsteina instead, use 4 Cottie here." }, LEIA_SS, LEIA_ROTATIONS.glaciationSS) },
      { id: "leia-glaciation-ss3", group: "Spider 2B · Glaciation", label: "SS3", name: "Spider 2B SS3 Leia Glaciation", cards: cometGlaciation(
        { wh: "Cottie", desc: "If Leia doesn't run Einsteina, use 2 Cottie and 2 Einsteina here." }, LEIA_SS3, LEIA_ROTATIONS.glaciationSS3) }
    ]
  },
  "better-tomorrow-nihil": {
    name: "A Better Tomorrow", ...NIHIL_THEME,
    variants: [{ id: "luna-rosetta-nirvatia", name: "Luna · Rosetta · Nirvatia", cards: [
      { bar: "blue", name: "Luna: Oblivion", role: "captain",
        symbol: classIcon("Annihilator"),
        portrait: `${LUNA}/Awaken - Luna Oblivion.png`,
        weapon: `${LUNA}/Arma - Luna Oblivion.png`,
        wh: "Cottie",
        memories: memBuild(CLEOPATRA, COTTIE),
        matrix: matrix(GA, INC, ML),
        resonance: ALL_ATK,
        core: `${LUNA}/Skill - Signature HD.png`,
        construct: `${LUNA}/CUB - Guardrake.png`,
        skills: cubSkills(LUNA),
        desc: "\"The\" set for every Nihil occasion; not much to change.\n• Cottie: she still needs it to run smoothly.\n• DLT: not needed for the basics since her leap." },
      { bar: "red", role: "starter", ...ROSETTA_KIT, wh: "Bathlon", memories: memBuild(rotated(NIMUE), BATHLON), matrix: matrix(DD, ML, GA),
        resonance: `${ROSETTA}/Skill - Ataque Básico.webp`,
        desc: "Made for the Nihil team: one Signature per entrance.\n• SS3 and above: still play her as at SS0. Awkward, but every help counts.\n• Bathlon over Cottie: she deals some damage and, with Luna's class skill effect, debuffs enemies, while Cottie would only help herself. A good fit given the lack of Ishmael." },
      { bar: "gold", name: "Nirvatia: Dirge", role: "",
        symbol: classIcon("Amplifier"),
        portrait: `${NIRVATIA}/Awaken - Nirvatia Dirge.png`,
        weapon: `${NIRVATIA}/Arma - Obituary for Yesterday..webp`,
        wh: "Guinevere",
        memories: memBuild(rotated(BULGAKOV), GUINEVERE),
        matrix: matrix(SAR, GS, INC),
        resonance: ALL_ATK,
        core: `${NIRVATIA}/Skill - Signature HD.png`,
        construct: `${NIRVATIA}/CUB - Morigan.webp`,
        skills: cubSkills(NIRVATIA, "webp"),
        desc: "An odd one.\n• Why no elemental memory: Nihil has none (like Shakespeare or Bathlon for other elements) to give her when a teammate holds Cottie.\n• To buff teammates: Guinevere or Da Vinci, depending on your team.\n• Without Luna and/or Ishmael: Cottie on her is an option too.\n• 2 Signatures: only at SSS. At SS3, DLT wasn't enough; untested whether SSS needs DLT." }
    ] }]
  },
  "homecoming-voyage": {
    name: "Homecoming Voyage", ...ICE_THEME,
    variants: [{ id: "ic-ss3", name: "IC SS3", cards: [
      { bar: "blue", name: "Wanshi: Lucid Dreamer", role: "starter", ...WANSHI_BUILD,
        desc: "Support DPS build for Wanshi.\n• No Cottie: 2 Cottie's Signature Energy is useless on him, and 4 Cottie's Extra DMG Bonus needs a Signature Move, while half his damage is outside it.\n• Memories: his damage loop doesn't change with any set, so try combos alongside his Signature memory." },
      { bar: "red", role: "captain", ...LUCIA_IC_KIT, ...RANK_SS3, wh: "Chen Jiyuan", memories: memBuild(PAVLICHENKO, CHEN_JIYUAN), desc: LUCIA_IC_DESC },
      { bar: "gold", role: "", ...TEDDY_KIT, wh: "Chen Jiyuan", memories: memBuild(JOANNA, CHEN_JIYUAN),
        desc: "Standard DPS build for Teddy.\n• Memories: anything works alongside her Signature memory. She doesn't need 2 Cottie's Signature Energy, and her damage loop doesn't change.\n• Guinevere: also a good choice, depending on your teammates' memories." }
    ] }]
  },
  "dying-sun-fire": {
    name: "The Dying Sun", ...FIRE_THEME,
    variants: [{ id: "watanabe-vera-kamui", name: "Watanabe · Vera · Kamui", cards: [
      { bar: "blue", name: "Watanabe: Epitaph", role: "starter",
        symbol: classIcon("Tanque"),
        portrait: `${WATANABE}/Awaken - Watanabe Epitaph.png`,
        weapon: `${WATANABE}/Arma - Watanabe Epitaph.png`,
        wh: "Da Vinci",
        memories: memBuild(ALPHONSE, DA_VINCI),
        matrix: matrix(DD, ML, INC),
        resonance: `${WATANABE}/Skill - Orb Vermelho.png`,
        core: `${WATANABE}/Skill - Signature.png`,
        construct: `${WATANABE}/CUB - Shadow Wing.png`,
        skills: cubSkills(WATANABE),
        desc: "Watanabe-kun doesn't fear death; death fears Watanabe. Build for the synergy with Vera-chan and Kamui-kun.\n• One Signature per entrance, since the other two take most of the time with their damage loops.\n• When one finishes and the other is on cooldown, he fills the gap with good damage and a very fast loop, under 4 seconds." },
      { bar: "red", role: "", ...VERA_KIT, desc: VERA_DESC },
      { bar: "gold", role: "captain", ...KAMUI_KIT, matrix: matrix(DD, GA, ML), desc: KAMUI_DESC }
    ] }, { id: "lucia-vera-kamui", name: "Lucia · Vera · Kamui", cards: [
      { bar: "blue", name: "Lucia: Pyroath", role: "starter",
        symbol: classIcon("Attacker"),
        portrait: `${LUCIA_P}/Awaken - Lucia Pyroath.png`,
        weapon: `${LUCIA_P}/Arma - Lucia Pyroath.webp`,
        wh: "Da Vinci",
        // As in the reference image: slot 5 is Shakespeare, not Heraclitus
        memories: [HERACLITUS[0], HERACLITUS[1], HERACLITUS[2], DA_VINCI[0], SHAKESPEARE[1], DA_VINCI[2]],
        matrix: matrix(GA, INC, DLT),
        resonance: ALL_ATK,
        core: `${LUCIA_P}/Skill - Signature 2X.webp`,
        construct: `${LUCIA_P}/CUB - Corvus.webp`,
        skills: cubSkills(LUCIA_P, "webp"),
        desc: "She aged badly, and we saw this coming since her release.\n• Da Vinci: buffs the teammates while she does one Signature per entrance.\n• Long Signature only: the short one would need Cottie for 2 Signatures and wastes time better spent on another character. So no DLT either.\n• Only really useful at SS3 and above, for field damage or QTEs of thousands of percent. At SS0, be patient with her." },
      { bar: "red", role: "", ...VERA_KIT, desc: VERA_DESC },
      { bar: "gold", role: "captain", ...KAMUI_KIT, matrix: matrix(DD, GA, ML), desc: KAMUI_DESC }
    ] }]
  },
  "helentine-liv-nanami": {
    name: "Of Solitude and Stillness", ...LIGHTNING_THEME,
    cards: [
      { bar: "blue", role: "", ...HELENTINE_KIT, wh: "Guinevere", memories: memBuild(HEISEN, GUINEVERE),
        desc: "The meta(nphetamine) set for Helentine. I couldn't test her enough to confirm the best build.\n• This build: works well when Nanami runs Da Vinci.\n• Signature + Da Vinci: works well when Nanami runs Heisen." },
      { bar: "red", role: "captain", ...LIV_KIT, wh: "Heisen", memories: memBuild(NATASHA, HEISEN),
        desc: "Standard build for Liv. Heisen, Cottie, Signature memory: anything works, so pick by your team.\n• Heisen: if no teammate runs it, put it on her, with Cottie or Signature.\n• Tested: with Nanami on Heisen and Helentine on Da Vinci, Liv's Signature memory and Heisen were almost the same." },
      { bar: "gold", role: "starter", ...NANAMI_KIT, wh: "Da Vinci", memories: memBuild(HERSCHELL, DA_VINCI),
        desc: "Since her leap, Nanami unofficially got a Breaker-level upgrade. Before, she needed no secondary memory.\n• If Helentine runs Da Vinci instead of Guinevere: use Heisen here, since her field Tank debuff applies Heisen's effects constantly." }
    ]
  },
  "anchored-dark": {
    name: "Anchored in Faith", ...DARK_THEME,
    variants: [{ id: "bianca-adelyde-rosetta", name: "Bianca · Adelyde · Rosetta", cards: [
      { bar: "blue", name: "Bianca: Crepuscule", role: "starter",
        symbol: classIcon("Attacker"),
        portrait: `${BIANCA}/Awaken - Bianca Crepuscule.png`,
        weapon: `${BIANCA}/Arma - Bianca Crepuscule.png`,
        wh: "Bathlon",
        memories: memBuild(JEANNE, BATHLON),
        matrix: matrix(GA, ML, DLT),
        resonance: ALL_ATK,
        core: `${BIANCA}/Skill - Signature HD.png`,
        construct: `${BIANCA}/CUB - Noctiluca.png`,
        skills: cubSkills(BIANCA),
        desc: "No Cottie below SSS.\n• Cottie: helps her damage loop, but she loses a lot of damage waiting to activate her Signature, which triggers the buffs. Using pings to recover energy is better. Cottie only pays off from SSS.\n• DLT: not used in a trio where everyone does one Signature." },
      { bar: "red", role: "", ...ADELYDE_KIT,
        desc: ADELYDE_QTE_DESC },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }, { id: "adelyde-lilith-rosetta", name: "Adelyde · Lilith · Rosetta", cards: [
      { bar: "blue", role: "", ...ADELYDE_KIT, matrix: matrix(ML, INC, DLT),
        desc: `${ADELYDE_DESC}\n• Resonances: if Lilith has the Amplifier weapon resonances, focus Adelyde on damage ones. If not, put them here.` },
      { bar: "red", role: "starter", ...LILITH_KIT, wh: "Da Vinci",
        memories: memBuild(BARCELO, DA_VINCI),
        matrix: matrix(SAR, GS, ML),
        desc: "Support Sub DPS build for Lilith, if you prefer her over Bianca's weak SS0.\n• With Adelyde: works if Lilith is SSS or above, since the Overliker's class skill is quite a clickbait.\n• Resonances: she carries the main Amplifier weapon resonances, so Adelyde can focus on damage ones.\n• Signatures: 4-stack ones over 5-stack ones, to share field time with everyone." },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }, { id: "kurumi-adelyde-rosetta", name: "Kurumi · Adelyde · Rosetta", cards: [
      { bar: "blue", name: "Kurumi Tokisaki", role: "starter",
        symbol: classIcon("Attacker"),
        portrait: `${KURUMI}/Awaken - Kurumi Tokisaki.png`,
        weapon: `${KURUMI}/Arma - Kurumi Tokisaki.webp`,
        wh: "Darwin",
        memories: memBuild(BATHLON, DERKETO),
        matrix: matrix(GA, ML, INC),
        resonance: ALL_ATK,
        core: `${KURUMI}/Skill - Signature 2X.webp`,
        construct: `${KURUMI}/CUB - Zafkiel.webp`,
        skills: cubSkills(KURUMI, "webp"),
        desc: "Anything works on Kurumi.\n• Cottie and DLT: not needed; her skills generate a lot of energy, even at low rank.\n• 2 Signatures: doable at any rank, but not worth it if Kurumi is below SSS, Adelyde is SSS or Rosetta is SS3.\n• Boone vs Derketo: Boone has 2 more ATK per memory, but Derketo gives a round 7100 BP (SS, fully hypertuned, 6-star weapon). 4 ATK isn't much, so choose your priority." },
      { bar: "red", role: "", ...ADELYDE_KIT,
        desc: ADELYDE_QTE_DESC },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }]
  },
  "hanying-adelyde-rosetta": {
    name: "Anchored in Faith", ...PHYSICAL_THEME,
    cards: [
      { bar: "blue", role: "", ...HANYING_KIT, wh: "Da Vinci", memories: memBuild(CHANG_WUZI, DA_VINCI), matrix: matrix(DD, ML, INC),
        desc: "Support Sub-DPS build for Hanying. Alongside Adelyde, she builds the Ultima Slash stacks.\n• One Signature is enough with Adelyde's effect; 2 is overkill for Rosetta's effect.\n• Domain Deconstruction: if both Hanying and Rosetta have weapon resonances, put it on Hanying." },
      { bar: "red", role: "", ...ADELYDE_KIT, wh: "Patton", memories: memBuild(PESANTEUR, PATTON),
        desc: "A great stacker for Ultima Slash.\n• Cottie doesn't work on her (same as Alpha: Inverse Crown), but that doesn't hurt her Ultima Slash performance.\n• Stacks: grow over time in the seconds after her Signature, with decent Ultima Slash damage and few orbs, unlike Hanying.\n• Patton: the best choice here, since Cottie doesn't work." },
      { bar: "gold", role: "captain starter", ...ROSETTA_KIT, matrix: matrix(GA, ML, INC),
        desc: "As the starter, Rosetta saves plenty of pings for when she returns; with Adelyde's entrance, DLT isn't needed.\n• Domain Deconstruction: if Hanying has it, focus Rosetta on the damage resonances above. If not, put DD back on her.\n• Grayscale Link: in my tests, same colors on her first Signature after entering, then different colors on her second before leaving, shared the damage better.\n• 2 Signatures: 4 Cottie worked better than 2 Cottie + Weapon Harmony Darwin, for the same reason." }
    ]
  },
  "kamui-lilith-nanami": {
    name: "The Dying Sun", ...LIGHTNING_THEME,
    cards: [
      { bar: "blue", role: "captain", ...KAMUI_KIT, matrix: matrix(GA, ML, INC),
        desc: "DPS build that speeds up his damage steps (see the Fire team notes). Needed here to race the short Plasma Beam window.\n• Enough for 2 full Signatures plus his strong basic attacks, with about a second to spare.\n• Rotation: 3-pings and tapped yellow orb for the first Signature, held yellow orb for the second.\n• Resonances: if Nanami has no weapon resonance for Domain Deconstruction but Kamui-kun does, use DD first, then Glorious Afterglow, then Matrix Lightning." },
      { bar: "red", role: "", ...LILITH_KIT, wh: "Guinevere",
        // As in the reference image: 4x Da Vinci + 2x Guinevere, with Guinevere in slots 1 and 3
        memories: [GUINEVERE[0], DA_VINCI[1], GUINEVERE[2], DA_VINCI[0], DA_VINCI[1], DA_VINCI[2]],
        matrix: matrix(SAR, GS, INC),
        desc: "Support build for the Plasma Beam effect.\n• She only activates the effect by herself, so Kamui deals his damage in time. She needs no memories for that.\n• Support memories: buff everyone who spends more time on the field than her." },
      { bar: "gold", role: "starter", ...NANAMI_KIT, wh: "Heisen", memories: memBuild(HERSCHELL, HEISEN),
        desc: "The DPS build for Nanami in every case; the same one from her Lightning release.\n• Deals good Lightning damage without worrying about the effect timer.\n• Buffs teammates with Heisen.\n• Fills the gap between Lilith and Kamui. She'll stay in this effect for a long time." }
    ]
  },
  "steering-physical": {
    name: "Steering by Light", ...PHYSICAL_THEME,
    variants: [{ id: "selena-veronica-karenina", name: "Selena · Veronica · Karenina", cards: [
      { bar: "blue", role: "", ...SELENA_KIT, wh: "Cottie", matrix: matrix(GA, INC, DLT),
        desc: "Since her second leap (and another Za Warudo), Selena has a use in the Physical team, if your Hanying isn't a higher rank than your Karenina.\n• Cottie: its DMG Boost works better, since entering her passive counts as her 1st Signature." },
      { bar: "red", role: "starter", ...VERONICA_KIT, desc: VERONICA_DESC },
      { bar: "gold", role: "captain", ...KARENINA_KIT, desc: KARENINA_DESC }
    ] }, { id: "hanying-veronica-karenina", name: "Hanying · Veronica · Karenina", cards: [
      { bar: "blue", role: "", ...HANYING_KIT, wh: "Patton", memories: memBuild(CHANG_WUZI, PATTON), matrix: matrix(DD, DLT, INC),
        desc: "If your Hanying is a higher rank than your Karenina, use her instead of Selena: her Tank debuffs are very strong, even at only 10%.\n• Since her leap, anything works alongside her Signature memory.\n• Domain Deconstruction: if both Hanying and Karenina have weapon resonances, put it on Hanying and a damage resonance on Karenina." },
      { bar: "red", role: "starter", ...VERONICA_KIT, desc: VERONICA_DESC },
      { bar: "gold", role: "captain", ...KARENINA_KIT, desc: KARENINA_DESC }
    ] }]
  },
  "liv-vera-karenina": {
    name: "Steering by Light", ...DARK_THEME,
    cards: [
      { bar: "blue", role: "starter", ...LIV_KIT, wh: "Bathlon", memories: memBuild(COTTIE, BATHLON),
        desc: "Darkflow set for Liv.\n• Starter: she's the only one of the trio that consumes stacks; the others only add stacks or don't use them.\n• Below SSS: Core Passive as the memory skill." },
      { bar: "red", role: "", ...VERA_KIT, wh: "Guinevere", memories: memBuild(DA_VINCI, GUINEVERE),
        desc: "Pure support build for Vera-chan.\n• She only stacks Darkflow for the others, so one Signature does it all, and her Signature memory would only add orbs she doesn't need.\n• Thanks to her core passive, she still deals decent damage when you charge her power through her QTEs." },
      { bar: "gold", role: "captain", ...KARENINA_KIT, wh: "Bathlon", memories: memBuild(SANTIAGO, BATHLON),
        desc: "Same as her Physical build, swapping the Physical memory for the Dark one, Bathlon. Nothing else changes." }
    ]
  },
  "homecoming-ignition": {
    name: "Homecoming Voyage", ...FIRE_THEME,
    cards: [
      { bar: "blue", role: "captain", ...LUCIA_IC_KIT, wh: "Shakespeare", memories: memBuild(PAVLICHENKO, SHAKESPEARE), desc: LUCIA_IC_DESC },
      { bar: "red", role: "starter", ...VERONICA_KIT, wh: "Shakespeare", memories: memBuild(KEATS, SHAKESPEARE),
        desc: "Standard Ignition DPS build for Veronica. Almost anything works: she has no energy needs that call for Cottie.\n• 4 Guinevere: can replace 4 Shakespeare to buff everyone.\n• 4 Cottie + 4 Shakespeare: also usable, dropping Keats." },
      { bar: "gold", role: "", ...NANAMI_KIT, wh: "Da Vinci", memories: memBuild(HERSCHELL, DA_VINCI),
        desc: "Standard Ignition DPS build for Nanami. Any memory set works with her Signature memory, so adapt to your team.\n• Solo: she needs DLT and Cottie to sustain.\n• Team: Da Vinci is the better call." }
    ]
  }
};

// Left to right on the home grid and top to bottom in the menu
const ENERGY = ["Fire", "Lightning", "Ice", "Dark", "Physical", "Nihil"];
const EFFECT = ["Ignition", "Plasma Beam", "Glaciation", "Darkflow", "Ultima Slash", "Disruption"];
// Add a name here to list it in the menu (icon in assets/effects/<name>.png, teams in PAGES as "special/<slug>")
const SPECIAL_EFFECT = ["Raydiance"];
const TEAM_LISTS = {
  energy: { label: "Energy", items: ENERGY },
  effect: { label: "Derivative Effect", items: EFFECT },
  special: { label: "Special Derivative Effect", items: SPECIAL_EFFECT }
};
// Home grid: what sits under each energy, as in the game's Energy and Effect screen
const ENERGY_EFFECT = { "Physical": "Ultima Slash", "Fire": "Ignition", "Ice": "Glaciation", "Lightning": "Plasma Beam", "Dark": "Darkflow", "Nihil": "Disruption" };
const ENERGY_SPECIAL = { "Lightning": "Raydiance" };
// Home tile colors: each effect shares the color of its energy type
const TILE_COLOR = {
  "Fire": "#ff6a5e", "Lightning": "#e6bd52", "Ice": "#3fc1ff", "Physical": "#5fdca6", "Dark": "#b38aff", "Nihil": "#ac2c75",
  "Ignition": "#ff6a5e", "Plasma Beam": "#e6bd52", "Glaciation": "#3fc1ff", "Ultima Slash": "#5fdca6", "Darkflow": "#b38aff"
};
// Home conveyor: these characters come first, then everyone else who has a build
const HERO_FIRST = ["Wanshi: Lucid Dreamer", "Vera: Geiravor", "Nanami: Startrail", "Lilith: Daemonissa", "Veronica: Aegis"];
// Each page lists its available compositions (COMPS ids)
const PAGES = {
  "energy/fire": ["dying-sun-fire"],
  "energy/lightning": ["helentine-liv-nanami"],
  "energy/ice": ["comets-afterglow", "homecoming-voyage"],
  "energy/physical": ["steering-physical"],
  "energy/dark": ["anchored-dark"],
  "energy/nihil": ["better-tomorrow-nihil"],
  "effect/ignition": ["homecoming-ignition"],
  "effect/plasma-beam": ["kamui-lilith-nanami"],
  "effect/glaciation": ["comets-afterglow-glaciation", "glaciation"],
  "effect/ultima-slash": ["hanying-adelyde-rosetta"],
  "effect/darkflow": ["liv-vera-karenina"]
};

const $ = (s, r = document) => r.querySelector(s);
const slug = s => s.toLowerCase().replace(/\s+/g, "-");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// Images load from the light copies made by tools/optimize-images.mjs. The data keeps the original path, which stays in
// data-full: the error handler falls back to it, and style.css reads its extension to scale the memory art
// ?v=4: browsers kept the old rank badges for 7 days under these same names, and a new address is the only way past that copy
const web = src => src.replace("assets/", "assets-web/") + ".webp" + (src.startsWith("assets/rank/") ? "?v=4" : "");
const pic = (src, attrs = 'alt=""') => `<img src="${esc(web(src))}" data-full="${esc(src)}" ${attrs} loading="lazy" decoding="async">`;
// Name shown when hovering an icon, read from its file name ("Memória - Cottie 1-4.png" is "Cottie")
function iconName(src = "") {
  const file = src.split("/").pop().replace(/\.\w+$/, "");
  if (file === "Tanque") return "Tank";
  if (file === "Skill - Orb Vermelho") return "Red Orb";
  if (file === "Skill - Ataque Básico") return "Basic Attack";
  if (file === "Ressonância - ALL ATK") return "Any ATK";
  if (file === "Classe - Adelyde Anabasis") return "Overlinker";
  if (file.startsWith("Skill - Signature")) return "Signature";
  if (file.startsWith("Skill - Core")) return "Core Passive";
  if (file.startsWith("Skill - Class")) return "Class Skill";
  const name = file.replace(/^(Memória|Ressonância de Arma|Ressonância|CUB) - /, "").replace(/ (HD|1-4|2-5|3-6)$/, "");
  const skill = name.match(/^Skill (\d)$/);
  return skill ? cubSkill(src, skill[1])?.[0] || `CUB ${name}` : name;
}
const cubSkill = (src, n) => CUB_SKILLS[src.split("/").at(-2)]?.[n - 1];
const memoryInfo = name => MEMORY_EFFECTS[name].map((text, i) => `${(i + 1) * 2} pcs: ${text}`).join("\n\n");
// What an icon does, when known: shown under its name
function iconInfo(src = "") {
  const memory = src.match(/Memória - (.+) (?:1-4|2-5|3-6)\.\w+$/)?.[1], skill = src.match(/CUB - Skill (\d)\.\w+$/)?.[1];
  if (memory) return memoryInfo(memory);
  if (skill) return cubSkill(src, skill)?.[1] || "";
  return RESONANCE_EFFECTS[iconName(src)] || "";
}
const tipAttr = (name, info) => (name ? ` data-tip="${esc(name)}"` : "") + (name && info ? ` data-info="${esc(info)}"` : "");
// Detail pages: /assets/<memory|weapon|resonance|cub|skill>/<id> and /constructs/<id>
const linkId = s => slug(s).replace(/[^a-z0-9-]/g, "");
const memoryHref = name => `/assets/memory/${linkId(name)}`;
const weaponHref = name => `/assets/weapon/${linkId(name)}`;
const resonanceHref = name => `/assets/resonance/${linkId(name)}`;
const cubHref = name => `/assets/cub/${linkId(name)}`;
const charId = name => linkId(name.replace(":", ""));
const constructId = name => linkId(name.split(":").at(-1).trim());
const skillHref = name => `/assets/skill/${charId(name)}`;
const characterHref = name => `/constructs/${constructId(name)}`;
// With href, the slot is a link. With a tip but no image, it shows that name in place of the art
const slot = (src, label = "", overlay = "", tip = iconName(src), href = "", info = iconInfo(src)) => {
  const tag = href ? "a" : "div", named = !src && tip;
  return `<${tag} class="slot${named ? " named" : ""}"${href ? ` href="${esc(href)}"` : ""}${tipAttr(tip, info)}>${src ? pic(src) : esc(label)}${src || named ? overlay : ""}</${tag}>`;
};
// Both bars are 2048x230 and span the whole slot
const STAR_BARS = {
  4: "assets/overlay/UI-Supply-4Star.png",
  5: "assets/overlay/UI-Supply-5Star.png",
  6: "assets/overlay/UI-Supply-6Star.png"
};
const STARS_BAR = STAR_BARS[6], WH_BAR = "assets/overlay/UI-Weapon-Harmony.png", BAR_RATIO = 230 / 2048;
const starOverlay = rank => pic(STAR_BARS[rank] || STARS_BAR, `class="stars" alt="${rank || 6} stars"`);
const STARS = starOverlay(6);
const numbered = (src, i, href = "") => `<div class="cell">${slot(src, "", "", undefined, href)}<span>${i}</span></div>`;
const n = (k, f) => Array.from({ length: k }, (_, i) => f(i));

/* ---------- sidebar ---------- */
const menu = $("#teamsMenu"), btn = $("#teamsBtn"), assetsMenu = $("#assetsMenu"), assetsBtn = $("#assetsBtn");
// Effect icons have transparent padding (Energy Type icons fill their file): enlarge and center each art to match
const ICON_FIT = {
  "Ignition": "scale(1.26) translate(-1.4%,1.8%)",
  "Plasma Beam": "scale(1.08) translate(1.6%,0)",
  "Glaciation": "scale(1.15) translate(-.4%,.1%)",
  "Ultima Slash": "scale(1.13) translate(-4.7%,-1.7%)",
  "Darkflow": "scale(1.19) translate(3%,2.5%)"
};
const menuIcon = (dir, e) => pic(`assets/${dir}/${e}.png`, `alt=""${ICON_FIT[e] ? ` style="transform:${ICON_FIT[e]}"` : ""}`);
const group = (label, key, arr, iconDir) =>
  `<button class="sub" data-grp="${key}" aria-expanded="false"><svg class="ico" aria-hidden="true"><use href="#i-${key}"/></svg>${label} <i>▾</i></button>` +
  `<div class="subList" data-list="${key}" hidden>${arr.map(e => `<a href="/${key}/${slug(e)}">${menuIcon(iconDir, e)}${e}</a>`).join("") || `<p class="subEmpty">Nothing here yet</p>`}</div>`;
menu.innerHTML = group(TEAM_LISTS.energy.label, "energy", ENERGY, "energy type") + group(TEAM_LISTS.effect.label, "effect", EFFECT, "effects") +
  group(TEAM_LISTS.special.label, "special", SPECIAL_EFFECT, "effects");
// A list of the side menu glides open and shut at one pace, so the group closing and the one opening balance out. Only clicks animate: a page opening its own group doesn't
const MENU_SLIDE = { duration: 280, easing: "cubic-bezier(.4,0,.2,1)" };
function slideMenu(el, open, animate) {
  if (el.sliding ? el.slidingOpen === open : el.hidden === !open) return;
  const from = el.hidden ? 0 : el.getBoundingClientRect().height;
  el.sliding?.cancel();
  el.sliding = null;
  if (!animate || matchMedia("(prefers-reduced-motion:reduce)").matches) {
    el.style.overflow = "";
    el.hidden = !open;
    return;
  }
  el.hidden = false;
  el.style.overflow = "hidden";
  const to = open ? el.scrollHeight : 0, margin = getComputedStyle(el).marginBottom;
  const frames = [{ height: `${from}px`, opacity: from ? 1 : 0, marginBottom: from ? margin : "0px" }, { height: `${to}px`, opacity: open ? 1 : 0, marginBottom: open ? margin : "0px" }];
  el.slidingOpen = open;
  el.sliding = el.animate(frames, MENU_SLIDE);
  el.sliding.onfinish = () => {
    el.sliding = null;
    el.style.overflow = "";
    el.hidden = !open;
  };
}
// One group open at a time on each level: open together, the groups outgrow the screen
function toggle(open, b = btn, m = menu, animate = true) {
  b.setAttribute("aria-expanded", open);
  slideMenu(m, open, animate);
  if (!open) return;
  const [otherBtn, otherMenu] = b === btn ? [assetsBtn, assetsMenu] : [btn, menu];
  otherBtn.setAttribute("aria-expanded", false);
  slideMenu(otherMenu, false, animate);
}
function openGroup(key, open, animate = true) {
  const b = $(`[data-grp="${key}"]`);
  b.setAttribute("aria-expanded", open);
  slideMenu($(`[data-list="${key}"]`), open, animate);
  if (open) Object.keys(TEAM_LISTS).filter(k => k !== key).forEach(k => openGroup(k, false, animate));
}
// Phones: the side panel is a top bar and its menu opens with the ☰ button
const menuBtn = $("#menuBtn");
function setNav(open) {
  $("#side").classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.onclick = () => setNav(!$("#side").classList.contains("open"));
$("#sideNav").addEventListener("click", e => {
  if (e.target.closest("a")) setNav(false);
  // Enter on a result leaves the focus in the box, which would hold the menu open over the new page
  if (e.target.closest("a.sr")) searchBox.blur();
});
btn.onclick = () => toggle(btn.getAttribute("aria-expanded") !== "true");
assetsBtn.onclick = () => toggle(assetsBtn.getAttribute("aria-expanded") !== "true", assetsBtn, assetsMenu);
// Desktop: the side menu is a rail of icons that opens over the page while in use, so the page never moves.
// Open groups stay open in the rail, showing their icons: every link keeps its height, so nothing moves under the mouse
const side = $("#side"), pinBtn = $("#pinBtn"), railScreen = matchMedia("(min-width:761px) and (hover:hover)"), PIN_KEY = "dominik-menu-pinned";
const isRail = () => railScreen.matches && !side.classList.contains("pinned");
// Opens the groups of the page on screen and closes the rest, so a group left open from another page doesn't linger
function showGroups() {
  const kind = location.pathname.split("/")[1];
  toggle(kind === "assets", assetsBtn, assetsMenu, false);
  toggle(!!TEAM_LISTS[kind], btn, menu, false);
  Object.keys(TEAM_LISTS).forEach(k => openGroup(k, k === kind, false));
}
let sideTimer, changingPage = false, pointer = null;
addEventListener("pointermove", e => { pointer = e; }, { passive: true });
// The page change animation covers the whole window, so the browser counts the mouse as gone from the menu.
// The menu ignores that exit, and closes after the animation only if the mouse really is off it
function holdRail(done) {
  changingPage = true;
  done.finally(() => {
    changingPage = false;
    const under = pointer && document.elementFromPoint(pointer.clientX, pointer.clientY);
    if (under && !side.contains(under)) setWide(false, 0);
  });
}
// The waits keep a mouse just passing by from opening it, and a slip off the edge from closing it
function setWide(wide, wait) {
  clearTimeout(sideTimer);
  sideTimer = setTimeout(() => {
    if (!isRail() || side.classList.contains("wide") === wide) return;
    if (!wide && (changingPage || side.matches(":hover") || $(":focus-visible", side))) return;
    side.classList.toggle("wide", wide);
    if (!wide) clearSearch();
  }, wait);
}
side.addEventListener("mouseenter", () => setWide(true, 90));
side.addEventListener("mouseleave", () => setWide(false, 260));
side.addEventListener("focusin", e => { if (e.target.matches(":focus-visible")) setWide(true, 0); });
side.addEventListener("focusout", () => setWide(false, 200));
function setPinned(on) {
  side.classList.toggle("pinned", on);
  side.classList.toggle("wide", !on);
  pinBtn.setAttribute("aria-pressed", on);
}
pinBtn.onclick = () => {
  const on = !side.classList.contains("pinned");
  setPinned(on);
  try { localStorage.setItem(PIN_KEY, on ? "1" : ""); }
  catch { /* the choice just lasts until the page closes */ }
};
railScreen.addEventListener("change", () => side.classList.remove("wide"));
try {
  if (localStorage.getItem(PIN_KEY)) { side.classList.add("pinned"); pinBtn.setAttribute("aria-pressed", true); }
} catch { /* no saved choice: the rail stays */ }
menu.onclick = e => {
  const b = e.target.closest(".sub");
  if (b) openGroup(b.dataset.grp, b.getAttribute("aria-expanded") !== "true");
};

/* ---------- cards ---------- */
function weaponArt(c) {
  if (!c.wh) return slot("", "");
  const [x, y, zoom] = WH_FRAME[c.wh] || [50, 50, 1];
  return `<a class="slot" href="${esc(memoryHref(c.wh))}"${tipAttr(c.wh)}>${pic(memFile(c.wh, "WH", "png"), `alt="" style="transform-origin:${x}% ${y}%;transform:scale(${zoom})"`)}<span class="wh-bar">${pic(WH_BAR, 'alt=""')}<b>WEAPON HARMONY</b></span></a>`;
}
// A rotation step shows the icon of the first button it names, from the character's skills. The 1st Orb has no fixed color, so no icon
const ROTATION_ART = { Signature: "Signature", Basic: "Basic Attack", Red: "Red Orb", Yellow: "Yellow Orb", Blue: "Blue Orb" };
const ROTATION_WORD = /1st Orb|White|Green|Ping|Dodge|Signature|Basic|Red|Yellow|Blue/;
function rotationLine(name, text) {
  const art = ROTATION_ART[text.match(ROTATION_WORD)?.[0]];
  return `<span class="rot-line">${art ? pic(skillIcon(name, art)) : ""}<span>${esc(text)}</span></span>`;
}
function rotationBox(c) {
  const turns = c.rotation.turns.map(({ turn, steps, note }) => `<h4>${esc(turn)}</h4>
    <ol>${steps.map(step => `<li>${[step].flat().map(text => rotationLine(c.name, text)).join("")}</li>`).join("")}</ol>${note ? `<p class="rot-note">${esc(note)}</p>` : ""}`).join("");
  // A rotation with source: null (one written in the Team Builder) shows no source link
  const source = c.rotation.source === undefined ? { label: "Spider 2B's Leia guide", href: LEIA_GUIDE } : c.rotation.source;
  return `<p class="rot-order">${esc(c.rotation.order)}</p>${turns}${source ? `<a class="rot-source" href="${esc(source.href)}" target="_blank" rel="noopener noreferrer">Source: ${esc(source.label)}</a>` : ""}`;
}
// With a rotation, the text box of the card gets a tab for each. A card with no notes opens on the rotation
function cardNotes(c) {
  if (!c.rotation) return `<p class="desc">${esc(c.desc)}</p>`;
  const tab = (key, label, on) => `<button type="button" class="${on ? "on" : ""}" data-note="${key}" aria-pressed="${on}">${label}</button>`;
  return `<div class="notes"><div class="note-tabs">${c.desc ? tab("desc", "Notes", true) : ""}${tab("rotation", "Rotation", !c.desc)}</div>
    ${c.desc ? `<p class="desc" data-pane="desc">${esc(c.desc)}</p>` : ""}<div class="desc rotation" data-pane="rotation"${c.desc ? " hidden" : ""}>${rotationBox(c)}</div></div>`;
}
function showNote(tab) {
  const box = tab.closest(".notes");
  box.querySelectorAll("[data-note]").forEach(button => {
    button.classList.toggle("on", button === tab);
    button.setAttribute("aria-pressed", button === tab);
  });
  box.querySelectorAll("[data-pane]").forEach(pane => { pane.hidden = pane.dataset.pane !== tab.dataset.note; });
}
function card(c) {
  const [, weapon = "", weaponType = "weapon", , weaponEffect = ""] = WEAPONS.find(w => w[0] === c.name) || [];
  const memory = (piece, i) => {
    if (!piece) return slot("", i + 1);
    const art = piece.startsWith("assets/") ? piece : "", name = art ? iconName(art) : piece;
    return slot(art, name, `<span class="n">${i + 1}</span>`, name, memoryHref(name), memoryInfo(name));
  };
  const tags = c.role.split(" ").filter(Boolean).map(t => `<span class="tag ${t}"${t === "captain" ? tipAttr(...(LEADER_SKILLS[c.name] || [])) : ""}>${t.toUpperCase()}</span>`).join("");
  const cub = c.construct ? cubHref(iconName(c.construct)) : "";
  // A skill icon leads to the character's skills; "Any ATK" is not a skill of theirs
  const skillSlot = src => slot(src, "", "", undefined, src?.includes("/Skill - ") ? skillHref(c.name) : "");
  const resonance = src => src ? resonanceHref(iconName(src)) : "";
  return `<article class="card c-${c.bar}" tabindex="0" role="button" aria-label="Expand ${esc(c.name)}"><div class="cin">
    <h3><a href="${characterHref(c.name)}">${esc(c.name)}</a></h3>
    <div class="top"><div class="sym slot"${tipAttr(c.symbol && iconName(c.symbol))}>${c.symbol ? pic(c.symbol) : "Class"}</div>
      <div class="portrait slot"${tipAttr(c.portrait && c.name)}>${c.portrait ? pic(c.portrait, `alt="${esc(c.name)}"`) : "Construct"}</div>
      <div class="rank"${tipAttr(c.name && iconName(rankArt(c)))}>${c.name ? pic(rankArt(c), 'alt="rank"') : ""}</div></div>
    <div class="box">
      <div class="mem">${n(6, i => memory((c.memories || [])[i], i)).join("")}</div>
      <div class="wp">${slot(c.weapon, weaponType, c.weapon ? starOverlay(weaponRank(weapon, c.weapon, c.weaponRank)) : "", weapon, weapon && weaponHref(weapon), weaponEffect)}${weaponArt(c)}</div>
      <div class="mxw">
        <div class="mx">${n(3, i => numbered((c.matrix || [])[i], i + 1, resonance((c.matrix || [])[i]))).join("")}</div>
        <div class="res"><span>6×</span>${skillSlot(c.resonance)}<span>6×</span>${skillSlot(c.core)}</div>
      </div>
    </div>
    <div class="box kit">${slot(c.construct, "C.U.B.", STARS, undefined, cub)}${n(6, i => numbered((c.skills || [])[i], i + 1, cub)).join("")}</div>
    ${cardNotes(c)}
    </div><i class="bar bar-top"></i><i class="bar bar-bot"></i><div class="tags">${tags}</div>
  </article>`;
}
function comp(id, cards = COMPS[id].cards) {
  const c = COMPS[id];
  return `<section class="comp" style="--c1:${c.c1};--c2:${c.c2};--cp:${c.cp}">${cards.map(card).join("")}</section>`;
}

/* ---------- focus view: enlarged card in the center, the others behind it ---------- */
const FOCUS_CLOSE_MS = 360; // keep in sync with .stage.closing in style.css
// The source card fades back this long before the enlarged one lands on it (the opacity transition of .comp .card)
const FOCUS_FADE_MS = 180;
// The enlarged card is laid out at this width, then scaled to fill the screen
const FOCUS_W = 640;
// The text box of the enlarged card opens beside it, at the card's full height. Its width on screen, whatever the card's scale:
// narrower on small windows, to leave room for the card
const focusPanel = w => Math.min(460, w * .36);
let view = null;
const place = (el, x, y, s) => { el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) scale(${s})`; };
function toOrigin(v) {
  const { clientWidth: w, clientHeight: h } = v.stage;
  v.clones.forEach((el, i) => {
    const r = v.sources[i].getBoundingClientRect();
    const s = r.width / el.offsetWidth;
    // Lined up by the top: without its text box, the enlarged card is shorter than the one it came from
    place(el, r.left + r.width / 2 - w / 2, r.top + el.offsetHeight * s / 2 - h / 2, s);
  });
}
function layout() {
  const { stage, clones, active } = view, count = clones.length;
  const w = stage.clientWidth, h = stage.clientHeight, cw = clones[0].offsetWidth, ch = clones[active].offsetHeight;
  const extended = clones[active].classList.contains("extended");
  // With the panel, the margins stay wide enough for the Export button, so it never covers the tabs
  const big = Math.min(1.6, (h - 110) / ch, (w - (extended ? 290 + focusPanel(w) : 32)) / cw), small = big * .68;
  const panel = extended ? focusPanel(w) / big : 0;
  stage.style.setProperty("--panel", `${panel}px`);
  stage.style.setProperty("--panel-u", `${1.1 / big}px`);
  const spread = Math.min(((cw + panel) * big + cw * small) / 2 - cw * small * .25, w / 2 - cw * small * .2);
  clones.forEach((el, i) => {
    const d = (i - active + count) % count, pos = d <= count / 2 ? d : d - count, side = pos !== 0;
    place(el, side ? pos * spread : -panel * big / 2, 0, side ? small : big);
    el.classList.toggle("side", side);
    el.tabIndex = side ? 0 : -1;
    el.setAttribute("aria-label", el.dataset.name);
    if (side) el.setAttribute("role", "button"); else el.removeAttribute("role");
  });
}
function go(step) {
  view.active = (view.active + step + view.clones.length) % view.clones.length;
  layout();
}
function setBackground(locked) {
  document.documentElement.classList.toggle("locked", locked);
  $("#main").inert = $("#side").inert = locked;
}
// With less room than this three cards no longer fit at a readable size: they slide one at a time, each already at full size,
// so there is nothing to enlarge. Keep in sync with the @container of .comp in style.css
const isSliding = () => ($("#compBox")?.clientWidth || 0) < 960;
function openFocus(src) {
  if (isSliding()) return;
  const comp = src.closest(".comp"), sources = [...comp.querySelectorAll(".card")];
  setBackground(true);
  const stage = document.createElement("div");
  stage.className = "stage";
  stage.style.cssText = comp.style.cssText;
  stage.setAttribute("role", "dialog");
  stage.setAttribute("aria-modal", "true");
  stage.setAttribute("aria-label", "Character card");
  stage.innerHTML = `<button class="ctl close" aria-label="Close">×</button>
    <button class="ctl prev" aria-label="Previous character">‹</button>
    <button class="ctl next" aria-label="Next character">›</button>
    <button class="ctl export" data-export-active>Export image</button>`;
  // Same proportions as the card on the page (--u in style.css), so nothing jumps on the first frame of the move
  const unit = FOCUS_W * Math.min(1, src.offsetWidth / 360) / src.offsetWidth;
  const clones = sources.map(s => {
    const c = s.cloneNode(true);
    c.classList.add("fcard");
    c.dataset.name = $("h3", c).textContent;
    c.style.width = `${FOCUS_W}px`;
    c.style.setProperty("--u", `${unit}px`);
    c.classList.toggle("extended", !!$(".notes,.desc:not(:empty)", c));
    return c;
  });
  stage.append(...clones);
  document.body.append(stage);
  clones.forEach(c => {
    const h = Math.round(c.offsetHeight / 2) * 2; // even sizes keep the center on a whole pixel
    c.style.height = `${h}px`;
    c.style.margin = `${-h / 2}px 0 0 ${-FOCUS_W / 2}px`;
  });
  view = { stage, clones, sources, comp, src, active: sources.indexOf(src) };
  stage.onclick = e => {
    if (e.target.closest(".close")) return closeFocus();
    if (e.target.closest(".prev")) return go(-1);
    if (e.target.closest(".next")) return go(1);
    const save = e.target.closest("[data-export-active]");
    if (save) return exportBuild(save, [shownTeam.cards[view.active]]);
    const c = e.target.closest(".fcard");
    if (!c) return closeFocus();
    if (c.classList.contains("side")) { e.preventDefault(); view.active = clones.indexOf(c); layout(); }
    else if (e.target.closest("[data-note]")) showNote(e.target.closest("[data-note]"));
  };
  toOrigin(view);
  comp.classList.add("focused");
  stage.offsetWidth; // commit the start position so the move below animates
  stage.classList.add("open");
  layout();
  $(".close", stage).focus();
}
function closeFocus(instant) {
  if (!view) return;
  const v = view;
  view = null;
  setBackground(false);
  const showSources = () => v.comp.classList.remove("focused");
  const finish = () => { v.stage.remove(); showSources(); };
  if (instant) return finish();
  v.src.focus({ preventScroll: true });
  v.stage.classList.remove("open");
  v.stage.classList.add("closing");
  v.clones.forEach(c => c.classList.remove("side"));
  toOrigin(v);
  const time = matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : FOCUS_CLOSE_MS;
  setTimeout(showSources, Math.max(0, time - FOCUS_FADE_MS));
  setTimeout(finish, time);
}
$("#main").addEventListener("click", e => {
  setNav(false);
  const c = e.target.closest(".comp .card");
  // A card at the side comes to the center first, even if the tap lands on one of its links
  if (c?.classList.contains("peek")) { e.preventDefault(); return slideTo([...c.parentNode.children].indexOf(c)); }
  const step = e.target.closest("[data-slide],[data-slide-step]");
  if (step) return slideTo(step.dataset.slide ? Number(step.dataset.slide) : activeSlide() + Number(step.dataset.slideStep));
  const save = e.target.closest("[data-export]");
  if (save) return exportBuild(save, shownTeam.cards);
  const note = e.target.closest("[data-note]");
  if (note) return showNote(note);
  // Team Builder cards are for editing: clicks there place and clear pieces instead of enlarging the card
  if (c && !e.target.closest("a") && !c.closest(".ed-live")) openFocus(c);
});
$("#main").addEventListener("click", e => {
  const filter = e.target.closest("[data-filter]");
  if (filter) {
    const { filter: group, value } = filter.dataset;
    constructFilter[group] = value;
    showFilters(`[data-filter="${group}"][data-value="${CSS.escape(value)}"]`);
    return;
  }
  if (e.target.closest("[data-clear-filters]")) {
    CONSTRUCT_FILTERS.forEach(group => { constructFilter[group] = ""; });
    showFilters("[data-toggle-filters]");
    return;
  }
  if (e.target.closest("[data-toggle-filters]")) {
    filtersOpen = !filtersOpen;
    showFilters("[data-toggle-filters]");
    return;
  }
  const copy = e.target.closest("[data-copy]");
  if (copy) {
    navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
      copy.textContent = "Copied!";
      setTimeout(() => { copy.textContent = "Copy"; }, 1500);
    });
    return;
  }
  const column = e.target.closest("[data-sort]")?.dataset.sort;
  if (!column) return;
  const box = $("#sortTable"), { table } = box.dataset;
  tableSort[table] = nextSort(table, column);
  box.innerHTML = sortTable(table);
  setQuery(sortQuery(table));
  $(`[data-sort="${column}"]`).focus();
});
addEventListener("keydown", e => {
  const activate = e.key === "Enter" || e.key === " ";
  if (e.key === "Escape") setNav(false);
  if (!view) {
    if (activate && e.target.matches(".comp .card")) { e.preventDefault(); openFocus(e.target); }
    return;
  }
  if (e.key === "Escape") closeFocus();
  else if (e.key === "ArrowLeft") go(-1);
  else if (e.key === "ArrowRight") go(1);
  else if (activate && e.target.matches(".fcard.side")) { e.preventDefault(); e.target.click(); }
});
addEventListener("resize", () => { if (view) layout(); });

/* ---------- sliding cards: narrow windows and phones ---------- */
// The swipe itself is the browser's scroll snap; this only follows it
function activeSlide() {
  const box = $(".comp");
  if (!box) return 0;
  const middle = box.scrollLeft + box.clientWidth / 2, cards = [...box.children];
  const gap = c => Math.abs(c.offsetLeft + c.offsetWidth / 2 - middle);
  return cards.indexOf(cards.reduce((best, c) => gap(c) < gap(best) ? c : best));
}
function slideTo(index) {
  const box = $(".comp"), card = box.children[(index + box.children.length) % box.children.length];
  box.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - box.clientWidth / 2, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
}
function showSlide() {
  const box = $(".comp");
  if (!box) return;
  const on = isSliding(), active = on ? activeSlide() : -1, cards = [...box.children];
  if (on) closeFocus(true);
  cards.forEach((c, i) => c.classList.toggle("peek", on && i !== active));
  document.querySelectorAll("[data-slide]").forEach((b, i) => b.setAttribute("aria-current", i === active));
  // The page ends with the card on screen, not with the tallest of the three. 30 is the padding of .comp
  box.style.height = on ? `${cards[active].offsetHeight + 30}px` : "";
}
const slideSizes = new ResizeObserver(showSlide);
new MutationObserver(() => {
  slideSizes.disconnect();
  document.querySelectorAll(".comp .card").forEach(c => slideSizes.observe(c));
  showSlide();
}).observe($("#main"), { childList: true, subtree: true });
$("#main").addEventListener("scroll", e => { if (e.target.matches?.(".comp")) showSlide(); }, true);

/* ---------- pages ---------- */
// Every character with a build and all their builds, read from PAGES and COMPS, so a new team shows up by itself
// on the conveyor and on the character pages. Energy pages come first, then Derivative Effect pages.
let characterList = null;
// A community team (id c-12) has no file of its own on the server, so it opens as its page plus ?team=
const buildHref = (path, id) => /^c-\d+$/.test(id) ? `/${path}?team=${id}` : `/${path}/${id}`;
function characters() {
  if (characterList) return characterList;
  const found = new Map();
  const pages = Object.entries(PAGES).sort(([a], [b]) => b.startsWith("energy") - a.startsWith("energy"));
  for (const [path, ids] of pages) for (const id of ids) {
    const { name: team, cards, variants } = COMPS[id], [kind, key] = path.split("/");
    const page = TEAM_LISTS[kind].items.find(e => slug(e) === key);
    for (const t of variants || [{ id, cards }]) for (const c of t.cards) {
      if (!found.has(c.name)) found.set(c.name, { name: c.name, portrait: c.portrait, symbol: c.symbol, builds: [] });
      found.get(c.name).builds.push({ href: buildHref(path, t.id), page, team, variant: t.name, card: c, mates: t.cards.filter(x => x !== c) });
    }
  }
  return characterList = [...found.values()];
}
const constructPortrait = name => `${CHARS}/${charId(name)}/Awaken - ${name.replace(":", "").trim()}.png`;
function constructRoster() {
  const built = new Map(characters().map(ch => [ch.name, ch]));
  return Object.keys(CONSTRUCTS).map(name => built.get(name) || ({ name, portrait: constructPortrait(name), builds: [] }));
}
// Each CUB shown in a build, under the character it belongs to. A card can borrow another character's CUB as a
// placeholder, so the owner is the character named after the folder of the art
function cubList() {
  const found = new Map();
  for (const ch of characters()) for (const { card } of ch.builds) {
    if (!card.construct || card.construct.split("/").at(-2) !== charId(ch.name)) continue;
    const name = iconName(card.construct);
    if (!found.has(name)) found.set(name, { name, owner: ch.name, art: card.construct, skills: card.skills || [] });
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function heroChars() {
  const rank = c => { const i = HERO_FIRST.indexOf(c.name); return i < 0 ? HERO_FIRST.length : i; };
  return characters().map(c => ({ ...c, href: characterHref(c.name) })).sort((a, b) => rank(a) - rank(b));
}
function heroBelt() {
  const chars = heroChars();
  const link = (c, copy) => `<a href="${c.href}"${copy ? ` tabindex="-1" aria-hidden="true"` : ""}>
    <img src="assets/home/${slug(c.name.replace(":", ""))}.jpg" data-full="${esc(c.portrait)}" alt="" loading="lazy" decoding="async">
    <span class="hero-name">${esc(c.name)}</span></a>`;
  // The list runs twice so the loop has no visible seam; the track moves exactly half its width
  // A random negative delay starts the loop at a different point on each visit (5s per character, as in style.css)
  const start = (Math.random() * chars.length * 5).toFixed(1);
  return `<div class="hero-art" role="navigation" aria-label="Constructs"><div class="hero-track" style="--n:${chars.length};animation-delay:-${start}s">${chars.map(c => link(c)).join("")}${chars.map(c => link(c, true)).join("")}</div></div>`;
}
// Below the team grid, and quieter than it: the tools, then the game data with live counts
function homeLinks() {
  // Constructs, Memories, Weapon Resonance and C.U.B.s use the drawn art, like the side menu; the rest are the symbols in index.html
  const artIcons = new Set(["constructs", "memories", "resonance", "cubs"]);
  const link = ([name, href, icon, text]) => `<a class="home-link" href="${href}"><span class="hl-art">${
    artIcons.has(icon)
      ? `<span class="ico ico-art ico-${icon}" aria-hidden="true"></span>`
      : `<svg class="ico" aria-hidden="true"><use href="#i-${icon}"/></svg>`
  }</span><span class="hl-tx"><b>${name}</b><small>${text}</small></span></a>`;
  const count = (list, one, many = `${one}s`) => `${list.length} ${list.length === 1 ? one : many}`;
  const chars = heroChars(), cubs = cubList(), memories = Object.values(MEMORY_TABS).flat(), resonances = Object.keys(RESONANCE_EFFECTS);
  const tools = [
    ["Planner", "/calculator", "calculator", "Plan your Black Cards across patches and check your pull odds."],
    ["Meta Timeline", "/timeline", "timeline", "See how long each frame held its place and who may be replaced next."],
    ["Team Builder", "/editor", "editor", "Put a team together, see its cards and share it as a link or an image."]
  ];
  const data = [
    ["Constructs", "/constructs", "constructs", count(chars, "construct")],
    ["Memories", "/assets/memories", "memories", count(memories, "set")],
    ["Weapons", "/assets/weapons", "weapons", count(WEAPONS, "weapon")],
    ["Weapon Resonance", "/assets/resonances", "resonance", count(resonances, "resonance")],
    ["C.U.B.s", "/assets/cubs", "cubs", count(cubs, "C.U.B.")]
  ];
  return `<h2 class="grp">Tools</h2><div class="home-links tools">${tools.map(link).join("")}</div>
    <h2 class="grp">Game data</h2><div class="home-links data">${data.map(link).join("")}</div>`;
}
// Teams are named after the patch of their newest character, so a team named after the patch running today is new. The tag leaves by itself when that patch ends
const isNewTeam = id => CALC_PATCHES.some(p => patchTime(p, calcToday()) && p.patch.toLowerCase() === COMPS[id].name.toLowerCase());
function splashMarkup(phrase) {
  let splashChar = 0;
  const typed = text => Array.from(text, char => `<span style="animation-delay:${splashChar++ * 30}ms">${esc(char)}</span>`).join("");
  return phrase.split(/(\*\*.+?\*\*)/g).map(part => {
    const bold = part.startsWith("**") && part.endsWith("**");
    const text = typed(bold ? part.slice(2, -2) : part);
    return bold ? `<strong>${text}</strong>` : text;
  }).join("");
}
function home() {
  const tile = (e, p, iconDir, color = TILE_COLOR[e]) => {
    if (!e) return `<span class="tile-gap">N/A</span>`;
    const ids = PAGES[`${p}/${slug(e)}`] || [], count = ids.reduce((sum, id) => sum + (COMPS[id].variants || [0]).length, 0);
    return `<a class="tile${count ? "" : " none"}" style="--c:${color}" href="/${p}/${slug(e)}">
      ${pic(`assets/${iconDir}/${e}.png`, 'class="t-bg" alt=""')}
      <span class="t-ic">${menuIcon(iconDir, e)}</span>
      <span class="t-tx"><b>${e}</b><small>${count ? `${count} team${count > 1 ? "s" : ""}` : "No teams yet"}</small></span>
      ${ids.some(isNewTeam) ? `<span class="t-new">New</span>` : ""}
    </a>`;
  };
  // Cells go column by column: the row names, then each energy with its effects
  const labels = Object.values(TEAM_LISTS).map(l => `<h2 class="home-label">${l.label}</h2>`).join("");
  const columns = ENERGY.map(e => tile(e, "energy", "energy type") + tile(ENERGY_EFFECT[e], "effect", "effects", TILE_COLOR[e]) + tile(ENERGY_SPECIAL[e], "special", "effects", TILE_COLOR[e])).join("");
  const splash = HOME_SPLASHES[Math.floor(Math.random() * HOME_SPLASHES.length)];
  return `<section class="hero">
      <div class="hero-tx">
        <button class="hero-mark" type="button" aria-label="Show another phrase" data-splash="${esc(splash)}"><img src="assets-web/logo.webp.webp" alt=""></button>
        <p class="hero-splash">${splashMarkup(splash)}</p>
      </div>
      ${heroBelt()}
    </section>
    <div class="home-grid">${labels}${columns}</div>
    ${homeLinks()}`;
}
// A team page lists its builds, newest patch first, with a search box above. Each build has a page of its own with the
// cards, at /energy/ice/<build>: the variant id, or the composition id when it has no variants (a composition id with
// variants opens its first one, as older links did)
let shown = "", chosen = "";
// Every build of a page, flat: a composition with variants gives one per variant
const pageBuilds = path => PAGES[path].flatMap(id => (COMPS[id].variants || [{ id, name: COMPS[id].name, cards: COMPS[id].cards }])
  .map(v => ({ comp: id, variant: COMPS[id].variants ? v.id : "", name: v.name, group: v.group, cards: v.cards })));
// The patch and the group, without repeating the patch when a build has no group of its own
const buildTags = (comp, group) => `${isNewTeam(comp) ? `<i class="new">New</i>` : ""}${[COMPS[comp].name, group !== COMPS[comp].name && group].filter(Boolean).map(t => `<i>${esc(t)}</i>`).join("")}`;
function listRow(path, b) {
  const { name: patch } = COMPS[b.comp];
  // The captain leads the row, as the build's main character
  const main = b.cards.find(c => /\bcaptain\b/.test(c.role)) || b.cards[0], mates = b.cards.filter(c => c !== main);
  const search = [b.name, patch, b.group, ...b.cards.map(c => c.name)].filter(Boolean).join(" ").toLowerCase();
  return `<a class="brow" href="${buildHref(path, b.variant || b.comp)}" data-search="${esc(search)}">
    <span class="brow-art">${main.portrait ? pic(main.portrait) : ""}</span>
    <span class="brow-tx"><b>${esc(b.name)}</b>
      <small><em>${esc(main.name)}</em> with ${mates.map(c => esc(c.name.split(":")[0])).join(" and ")}</small>
      <span class="brow-tags">${buildTags(b.comp, b.group)}</span></span>
  </a>`;
}
function buildList(path) {
  const builds = pageBuilds(path);
  return `<div class="picker"><label class="bsearch"><svg class="ico" aria-hidden="true"><use href="#i-search"/></svg><input type="search" placeholder="Search ${builds.length} build${builds.length === 1 ? "" : "s"}" aria-label="Search builds by name, patch or character"></label>
    <div class="blist">${builds.map(b => listRow(path, b)).join("")}</div>
    <p class="empty" hidden>No builds match this search.</p></div>`;
}
const noticeTimeLeft = () => Date.parse(NEW_CHARACTER_NOTICE.until) - Date.now();
const notice = cards => noticeTimeLeft() > 0 && cards.some(c => c.name === NEW_CHARACTER_NOTICE.name) ? `<p class="notice" role="note">${esc(NEW_CHARACTER_NOTICE.text)}</p>` : "";
let shownTeam = null; // the build on screen, for the export button
const pickedVariant = sel => COMPS[sel].variants?.find(x => x.id === chosen);
const pickedCards = sel => sel && (COMPS[sel].variants ? pickedVariant(sel)?.cards : COMPS[sel].cards);
// Sits above the page title, so it has its own box and changes along with the build on screen
const teamNotice = sel => { const cards = pickedCards(sel); return cards ? notice(cards) : ""; };
// Only shows while the cards slide: who is in the team, and a way to change card without swiping
function pager(cards) {
  const member = (c, i) => `<button class="pg-${c.bar}" data-slide="${i}" aria-label="Show ${esc(c.name)}">${c.portrait ? pic(c.portrait) : ""}<span>${esc(c.name.split(":")[0])}</span></button>`;
  return `<div class="pager" role="group" aria-label="Team members"><button class="pg-step" data-slide-step="-1" aria-label="Previous character">‹</button>${cards.map(member).join("")}<button class="pg-step" data-slide-step="1" aria-label="Next character">›</button></div>`;
}
function compBody(sel) {
  const shownCards = pickedCards(sel);
  if (!shownCards) return "";
  shownTeam = { id: sel, title: [COMPS[sel].name, pickedVariant(sel)?.name].filter(Boolean).join(" · "), cards: shownCards };
  return `<div class="comp-tools"><button class="tool" data-export>Export image</button></div>` + pager(shownCards) + comp(sel, shownCards);
}
function team(path, pick) {
  const [kind, key] = path.split("/");
  const list = TEAM_LISTS[kind]?.items.find(e => slug(e) === key);
  if (!list) return `<p class="empty">Page not found.</p>`;
  const ids = PAGES[path] || [];
  if (pick) {
    const back = `<div class="backs"><a class="back" href="/${path}">‹ ${esc(list)} builds</a></div>`;
    if (!shown) return `${back}<p class="empty">Build not found.</p>`;
    const name = pickedVariant(shown)?.name || COMPS[shown].name, group = pickedVariant(shown)?.group;
    return `<div id="noticeBox">${teamNotice(shown)}</div>${back}<h1>${esc(name)}</h1>
      <p class="sub">${esc(list)} · ${TEAM_LISTS[kind].label}</p><p class="brow-tags build-tags">${buildTags(shown, group)}</p>
      <div id="compBox">${compBody(shown)}</div>`;
  }
  const head = `<h1>${list}</h1><p class="sub">${TEAM_LISTS[kind].label}</p>`;
  if (!ids.length) return head + `<p class="empty">No teams yet.</p>`;
  return head + buildList(path);
}

/* ---------- assets pages ---------- */
const thumb = (src, overlay = "") => `<div class="slot">${src ? pic(src) + overlay : ""}</div>`;
const FIVE_STAR = new Set(["Gloria"]);
const weaponRank = (name, file = "", rank = "") => Number(rank || String(file || "").match(/\s\(([456])\)(?=\.[^.]+$)/)?.[1] || (FIVE_STAR.has(name) ? 5 : 6));
const starsOf = (name, file = "", rank = "") => starOverlay(weaponRank(name, file, rank));
const memoryArt = (name, ext) => (ext ? memSet(name) : ["", "", ""]).map(src => thumb(src, starsOf(name))).join("");
// The tables of the Assets pages. Clicking a column header or the release button goes through its two orders, then
// back to the default one. The order stays while browsing and goes in the address (?sort=), so a link keeps it
const STAT_NAMES = ["ATK", "DEF", "CRIT", "HP"];
const SORT_DEFAULT = { memories: "Release-high", weapons: "Release-high", cubs: "Release-high", resonances: "" };
const tableSort = { ...SORT_DEFAULT }, shownRows = { memories: [], weapons: [], cubs: [], resonances: [] };
// The default order stays out of the address
const sortQuery = table => ({ sort: tableSort[table] === SORT_DEFAULT[table] ? "" : tableSort[table] });
// The two orders of a column: Name goes A to Z first, the others start from the highest value
const columnSorts = column => column === "Name" ? ["az", "za"] : [`${column}-high`, `${column}-low`];
function nextSort(table, column) {
  const [first, second] = columnSorts(column), sort = tableSort[table];
  return sort === first ? second : sort === second ? SORT_DEFAULT[table] : first;
}
function sortedRows(table) {
  const sort = tableSort[table], rows = shownRows[table], { name, value } = SORT_TABLES[table];
  if (!sort) return rows;
  const byName = (a, b) => name(a).localeCompare(name(b));
  if (sort === "az") return [...rows].sort(byName);
  if (sort === "za") return [...rows].sort((a, b) => byName(b, a));
  const [column, order] = sort.split("-"), sign = order === "high" ? -1 : 1;
  return [...rows].sort((a, b) => sign * (value(a, column) - value(b, column)) || byName(a, b));
}
const memoryStats = name => { const [ATK, DEF, CRIT, HP] = MEMORY_STATS[name]; return { ATK, DEF, CRIT, HP }; };
const memoryRow = ([name, boost, ext]) => `<tr>
    <td><div class="mt-name"><div class="mt-art">${thumb(ext && memFile(name, "1-4"), starsOf(name))}</div>
      <div><a href="${memoryHref(name)}">${esc(name)}</a><small>${esc(boost)}</small></div></div></td>
    ${MEMORY_STATS[name].map(value => `<td>${value}</td>`).join("")}</tr>`;
const weaponFile = file => file && (file.startsWith("assets/") ? file : `${CHARS}/${file}`);
const weaponThumb = (file, name, rank = "") => thumb(weaponFile(file), file ? starsOf(name, file, rank) : "");
// A character without a build has no page to link to
const ownerLink = name => CONSTRUCTS[name] ? `<a href="${characterHref(name)}">${esc(name)}</a>` : esc(name);
const weaponRow = ([owner, name, type, file, , rank]) => {
  const listedOwner = owner || FIVE_STAR_WEAPON_OWNERS[name];
  const subtitle = owner
    ? `${ownerLink(owner)}${type ? ` · ${esc(type)}` : ""}`
    : listedOwner ? `${ownerLink(listedOwner)}${type ? ` · ${esc(type)}` : ""}` : esc(type);
  return `<tr>
    <td><div class="mt-name"><div class="mt-art wpn-art">${weaponThumb(file, name, rank)}</div>
      <div><a href="${weaponHref(name)}">${esc(name)}</a><small>${subtitle}</small></div></div></td>
    ${WEAPON_STATS[name].map(value => `<td>${value}</td>`).join("")}</tr>`;
};
const SORT_TABLES = {
  memories: { columns: STAT_NAMES, row: set => memoryRow(set), name: ([name]) => name,
    value: ([name], column) => column === "Release" ? MEMORY_RELEASE[name] : MEMORY_STATS[name][STAT_NAMES.indexOf(column)] },
  // Character-bound weapons follow their frame's release; standalone weapons sort after them
  weapons: { columns: ["ATK", "CRIT"], row: weapon => weaponRow(weapon), name: ([, name]) => name,
    value: ([owner, name], column) => column === "Release" ? CONSTRUCTS[owner]?.[0] ?? 0 : WEAPON_STATS[name][column === "ATK" ? 0 : 1] },
  // Same for a CUB. They all have the same ATK, so no stat column
  cubs: { columns: [], row: cub => cubRow(cub), name: cub => cub.name, value: cub => CONSTRUCTS[cub.owner][0] },
  resonances: { columns: [], row: resonance => resonanceRow(resonance), name: ([name]) => name, noRelease: true }
};
// Replaces the query of the address without adding a history entry. Empty values are left out
function setQuery(values) {
  const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value)).toString();
  const url = location.pathname + (query ? `?${query}` : "");
  if (url === location.pathname + location.search) return;
  history.replaceState(null, "", url);
  pageUrl = location.href;
}
// Shows a table with the order in the address, if it has one, or else the one in use
function openTable(table, rows) {
  shownRows[table] = rows;
  const sort = new URLSearchParams(location.search).get("sort");
  if (["Name", "Release", ...SORT_TABLES[table].columns].flatMap(columnSorts).includes(sort)) tableSort[table] = sort;
  setQuery(sortQuery(table));
  return `<div id="sortTable" data-table="${table}">${sortTable(table)}</div>`;
}
function sortTable(table) {
  const sort = tableSort[table], { columns, row, noRelease } = SORT_TABLES[table];
  const state = column => { const [first, second] = columnSorts(column); return sort === first ? 1 : sort === second ? 2 : 0; };
  const head = ["Name", ...columns].map(column => {
    const on = state(column), arrow = ["", "▼", "▲"][on];
    const aria = !on ? "none" : (on === 1) === (column === "Name") ? "ascending" : "descending";
    return `<th scope="col" aria-sort="${aria}"><button data-sort="${column}">${column}<i>${arrow}</i></button></th>`;
  }).join("");
  const release = state("Release");
  const bar = noRelease ? "" : `<div class="sortbar"><span>Sort by</span><button class="tool${release ? " on" : ""}" data-sort="Release" aria-pressed="${!!release}">Release order${["", ": newest first", ": oldest first"][release]}</button></div>`;
  return `${bar}
    <table class="mtable"><thead><tr>${head}</tr></thead><tbody>${sortedRows(table).map(row).join("")}</tbody></table>`;
}
const assetTabs = (base, tabs, tab, label) => `<div class="atabs" role="navigation" aria-label="${label}">${tabs.map(t =>
  `<a href="/assets/${base}/${slug(t)}"${t === tab ? ` class="on" aria-current="page"` : ""}>${t}</a>`).join("")}</div>`;
// Constructs page: newest first. The filters stay while browsing and go in the address (?element=Ice), so a link keeps them
const CONSTRUCT_FILTERS = ["Element", "Class", "Rank", "Effect"];
const constructFilter = {};
let filtersOpen = false; // phones only: there the filters start hidden behind a button
const filterQuery = () => Object.fromEntries(CONSTRUCT_FILTERS.map(group => [group.toLowerCase(), constructFilter[group]]));
function readFilters() {
  const query = new URLSearchParams(location.search);
  for (const group of CONSTRUCT_FILTERS) if (query.has(group.toLowerCase())) constructFilter[group] = query.get(group.toLowerCase());
  setQuery(filterQuery());
}
const constructValue = (c, group) => CONSTRUCTS[c.name][CONSTRUCT_FILTERS.indexOf(group) + 1];
// Class files that are not named after the class. Only rank S has art: any other rank shows its letter
const CLASS_ART = { Tank: classIcon("Tanque"), Overlinker: `${ADELYDE}/Classe - Adelyde Anabasis.png` };
const filterIcon = (group, value) => group === "Element" ? menuIcon("energy type", value) : group === "Effect" ? menuIcon("effects", value)
  : group === "Class" ? value === "Vanguard" ? `<b>V</b>` : pic(CLASS_ART[value] || classIcon(value))
    : value === "S" ? pic("assets/rank/S.png") : `<b>${esc(value)}</b>`;
function constructFilters() {
  const active = CONSTRUCT_FILTERS.filter(group => constructFilter[group]).length;
  const bar = `<div class="filter-bar"><button class="tool filter-toggle" data-toggle-filters aria-expanded="${filtersOpen}">Filters${active ? ` (${active})` : ""}</button>${active ? `<button class="tool" data-clear-filters>Clear filters</button>` : ""}</div>`;
  return `${bar}<div class="filters${filtersOpen ? " open" : ""}">${CONSTRUCT_FILTERS.map(group => {
    const found = new Set(constructRoster().map(c => constructValue(c, group)).filter(Boolean));
    const values = group === "Element" ? ENERGY.filter(e => found.has(e)) : group === "Rank" ? [...found].sort().reverse() : [...found].sort();
    const chip = (label, value) => `<button class="tool chip${(constructFilter[group] || "") === value ? " on" : ""}" data-filter="${group}" data-value="${esc(value)}" aria-pressed="${(constructFilter[group] || "") === value}">${value ? `<span class="chip-icon">${filterIcon(group, value)}</span>` : ""}${esc(label)}</button>`;
    return `<div class="filter" role="group" aria-label="${group}"><span>${group}</span>${chip("All", "")}${values.map(v => chip(v, v)).join("")}</div>`;
  }).join("")}</div>`;
}
function constructCards() {
  const list = constructRoster().filter(c => CONSTRUCT_FILTERS.every(group => !constructFilter[group] || constructValue(c, group) === constructFilter[group]))
    .sort((a, b) => CONSTRUCTS[b.name][0] - CONSTRUCTS[a.name][0]);
  if (!list.length) return `<p class="sub">No constructs match these filters.</p>`;
  return `<div class="agrid">${list.map(c => {
    const [, element, type, rank, effect] = CONSTRUCTS[c.name];
    const count = c.builds.length;
    const builds = count ? `${count} build${count === 1 ? "" : "s"}` : "No builds yet";
    return charCard(c, characterHref(c.name), [rank, type, element, effect, builds].filter(Boolean).join(" · "));
  }).join("")}</div>`;
}
const constructsView = () => `${constructFilters()}${constructCards()}`;
function showFilters(focus) {
  $("#constructs").innerHTML = constructsView();
  setQuery(filterQuery());
  $(focus).focus();
}
const statRow = stats => `<dl class="stats">${Object.entries(stats).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
// Top of a detail page. Coming from a team, it also leads back to that exact build
let buildReturn = "";
const backLink = (href, label) => `<div class="backs">${buildReturn ? `<a class="back-build" href="${esc(buildReturn)}">‹ Back to build</a>` : ""}<a class="back" href="${href}">‹ ${label}</a></div>`;
// Every build where a card passes the test, for the bottom of a detail page
function usedIn(test) {
  const found = characters().flatMap(ch => ch.builds.filter(b => test(b.card)).map(b => ({ ...b, name: ch.name, portrait: ch.portrait })));
  const links = found.map(b => `<a href="${esc(b.href)}">${pic(b.portrait)}<span><b>${esc(b.name)}</b><small>${esc([b.variant || b.team, b.page].filter(Boolean).join(" · "))}</small></span></a>`).join("");
  return `<section class="used"><h2>Used in ${found.length} build${found.length === 1 ? "" : "s"}</h2>${links ? `<div class="used-list">${links}</div>` : ""}</section>`;
}
function memoryPage([name, boost, ext]) {
  const { tab } = MEM_INDEX.get(name);
  const effects = MEMORY_EFFECTS[name].map((text, i) => `<h2>${(i + 1) * 2} pcs</h2><p>${esc(text)}</p>`).join("");
  return `${backLink(`/assets/memories/${slug(tab)}`, `${tab} memories`)}<h1>${esc(name)}</h1><p class="sub">${esc(boost)}</p>
    <div class="detail"><div class="mem">${memoryArt(name, ext)}</div>
      <div class="fx">${statRow(memoryStats(name))}<p class="note">HP and CRIT are on slots 1, 2 and 3. ATK and DEF are on slots 4, 5 and 6.</p>${effects}</div></div>
    ${usedIn(c => c.wh === name || (c.memories || []).some(piece => piece === name || iconName(piece) === name))}`;
}
function weaponPage([owner, name, type, file, effect, rank]) {
  const [ATK, CRIT] = WEAPON_STATS[name];
  const listedOwner = owner || FIVE_STAR_WEAPON_OWNERS[name];
  const subtitle = listedOwner
    ? [type, listedOwner].filter(Boolean).join(" · ")
    : [type, `${rank || weaponRank(name, file)}-star weapon`].filter(Boolean).join(" · ");
  const users = WEAPON_USERS[type] || (listedOwner ? [listedOwner] : []);
  const usableBy = users.length
    ? `<section class="used"><h2>Usable by</h2><p>${users.map(ownerLink).join(" · ")}</p></section>`
    : "";
  const buildUsage = owner ? usedIn(c => c.name === owner) : "";
  return `${backLink("/assets/weapons", "Weapons")}<h1>${esc(name)}</h1><p class="sub">${esc(subtitle)}</p>
    <div class="detail wpn-detail">${weaponThumb(file, name, rank)}<div class="fx">${statRow({ ATK, CRIT })}<h2>Effect</h2><p>${esc(effect)}</p></div></div>
    ${usableBy}${buildUsage}`;
}
const resonanceRow = ([name, effect]) => `<tr>
    <td><div class="mt-name"><div class="mt-art wpn-art">${thumb(WEAPON_RES(name))}</div>
      <div><a href="${resonanceHref(name)}">${esc(name)}</a><small>${esc(effect)}</small></div></div></td></tr>`;
function resonancePage([name, effect]) {
  return `${backLink("/assets/resonances", "Weapon Resonance")}<h1>${esc(name)}</h1><p class="sub">Weapon Resonance</p>
    <div class="detail wpn-detail">${thumb(WEAPON_RES(name))}<div class="fx"><h2>Effect</h2><p>${esc(effect)}</p></div></div>
    ${usedIn(c => (c.matrix || []).includes(WEAPON_RES(name)))}`;
}
const cubRow = cub => `<tr>
    <td><div class="mt-name"><div class="mt-art cub-art">${thumb(cub.art, STARS)}</div>
      <div><a href="${cubHref(cub.name)}">${esc(cub.name)}</a><small>${ownerLink(cub.owner)} · ${esc(CONSTRUCTS[cub.owner][1])}</small></div></div></td></tr>`;
function cubPage(cub) {
  const folder = cub.art.split("/").at(-2), skills = CUB_SKILLS[folder] || [];
  // Some builds show their CUB skills in another order, so each icon is found by its file number
  const icon = i => cub.skills.find(src => src.includes(`${folder}/CUB - Skill ${i + 1}.`));
  return `${backLink("/assets/cubs", "C.U.B.s")}<h1>${esc(cub.name)}</h1><p class="sub"><a href="${characterHref(cub.owner)}">${esc(cub.owner)}</a></p>
    <div class="detail wpn-detail">${thumb(cub.art)}<div class="fx">${skills.map(([name, effect], i) =>
      `<div class="cub-skill">${thumb(icon(i))}<div><h2>${esc(name)}</h2><p>${esc(effect)}</p></div></div>`).join("") || "<p>No skill text yet.</p>"}</div></div>
    ${usedIn(c => c.construct === cub.art)}`;
}
// Character art in a grid, for /constructs
const charCard = (c, href, line) => `<a class="acard wpn" href="${href}">${thumb(c.portrait)}<div><h3>${esc(c.name)}</h3><p>${esc(line)}</p></div></a>`;
// skills-data.js is long, so it only loads when a skill page opens
let skillsState = "";
function loadSkills() {
  if (skillsState) return;
  skillsState = "loading";
  const script = document.createElement("script");
  script.src = "data/skills-data.js";
  script.onload = () => { skillsState = "ready"; route(); };
  script.onerror = () => { skillsState = "failed"; route(); };
  document.head.append(script);
}
// Each skill's icon is named after its type, in the character's skills folder
const skillIcon = (name, type) => `${CHARS}/${charId(name)}/skills/${type}.png`;
function skillPage(ch) {
  const head = `${backLink("/constructs", "Constructs")}<h1>${esc(ch.name)}</h1><p class="sub"><a href="${characterHref(ch.name)}">Construct page</a></p>`;
  if (skillsState !== "ready") {
    loadSkills();
    return head + `<p class="empty">${skillsState === "failed" ? "Could not load the skills. Reload the page to try again." : "Loading skills..."}</p>`;
  }
  const skills = CHARACTER_SKILLS[ch.name];
  if (!skills) return head + `<p class="empty">No skill text for this character yet.</p>`;
  return head + `<div class="skills">${skills.map(([type, name, effect]) =>
    `<section class="fx">${thumb(skillIcon(ch.name, type))}<div><p class="kind">${esc(type)}</p><h2>${esc(name)}</h2><p>${esc(effect)}</p></div></section>`).join("")}</div>`;
}
function assetsPage(key, pick = "all") {
  const notFound = `<p class="empty">Page not found.</p>`;
  if (key === "memory") {
    const set = Object.values(MEMORY_TABS).flat().find(([name]) => linkId(name) === pick);
    return set ? memoryPage(set) : notFound;
  }
  if (key === "weapon") {
    const weapon = WEAPONS.find(w => linkId(w[1]) === pick);
    return weapon ? weaponPage(weapon) : notFound;
  }
  if (key === "resonance") {
    const resonance = Object.entries(RESONANCE_EFFECTS).find(([name]) => linkId(name) === pick);
    return resonance ? resonancePage(resonance) : notFound;
  }
  if (key === "cub") {
    const cub = cubList().find(c => linkId(c.name) === pick);
    return cub ? cubPage(cub) : notFound;
  }
  if (key === "skill") {
    const ch = characters().find(c => charId(c.name) === pick);
    return ch ? skillPage(ch) : notFound;
  }
  if (key === "resonances") return `<h1>Weapon Resonance</h1><p class="sub">Assets</p>${openTable("resonances", Object.entries(RESONANCE_EFFECTS))}`;
  if (key === "cubs") {
    const tabs = ["All", ...ENERGY], tab = tabs.find(t => slug(t) === pick);
    if (!tab) return notFound;
    shownRows.cubs = tab === "All" ? cubList() : cubList().filter(c => CONSTRUCTS[c.owner][1] === tab);
    return `<h1>C.U.B.s</h1><p class="sub">Assets</p>
    <div class="assets">${assetTabs("cubs", tabs, tab, "C.U.B. element")}
      ${openTable("cubs", shownRows.cubs)}</div>`;
  }
  if (key === "weapons") {
    const tabs = ["All", ...ENERGY], tab = tabs.find(t => slug(t) === pick);
    if (!tab) return notFound;
    shownRows.weapons = tab === "All" ? WEAPONS : WEAPONS.filter(([owner]) => CONSTRUCTS[owner]?.[1] === tab);
    return `<h1>Weapons</h1><p class="sub">Assets</p>
    <div class="assets">${assetTabs("weapons", tabs, tab, "Weapon element")}
      ${openTable("weapons", shownRows.weapons)}</div>`;
  }
  if (key !== "memories") return notFound;
  const tabs = ["All", ...Object.keys(MEMORY_TABS)], tab = tabs.find(t => slug(t) === pick);
  if (!tab) return notFound;
  const sets = tab === "All" ? Object.values(MEMORY_TABS).flat() : MEMORY_TABS[tab];
  shownRows.memories = sets;
  return `<h1>Memories</h1><p class="sub">Assets</p>
    <div class="assets">${assetTabs("memories", tabs, tab, "Memory type")}
      ${openTable("memories", shownRows.memories)}</div>`;
}

/* ---------- character pages ---------- */
function charactersPage() {
  readFilters();
  return `<h1>Constructs</h1><p class="sub">Every playable construct</p><div id="constructs">${constructsView()}</div>`;
}
// Contact page. No art = the first letter of the name in a circle; art goes in assets/credits
const CREDITS = [
  { name: "blacknovatech", text: "creator of Huaxu, for the assets", href: "https://huaxu.app/na/wiki", art: "assets/credits/blacknovatech.png", support: "https://ko-fi.com/blacknova" },
  { name: "sidewayz.", text: "for helping with the site's overall design", art: "assets/credits/sidewayz.png" },
  { name: "GRAY RAVENS wiki", text: "for skills and the patch history", href: "https://grayravens.com/wiki", art: "assets/credits/grayravens.png" },
  { name: "Spider 2B", text: "for the guides behind several builds", href: "https://www.youtube.com/@Spider2B", art: "assets/credits/Spider 2B.png" }
];
const KOFI = "https://ko-fi.com/ofcrazy";
const creditRow = ({ name, text, href, art, support }) => `<li><span class="credit-art">${art ? pic(art) : esc(name[0].toUpperCase())}</span>
  <span>${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a>` : `<strong>${esc(name)}</strong>`} ${esc(text)}${support ? ` · <a href="${esc(support)}" target="_blank" rel="noopener noreferrer">Support on Ko-fi</a>` : ""}</span></li>`;
const contactPage = () => `<h1>Contact</h1><p class="sub">Found a wrong build, or have a question or suggestion? Send me a message.</p>
  <div class="contact">
    <section class="contact-card">
      <p class="contact-label">Discord</p>
      <div class="contact-name"><span class="credit-art big">${pic("assets/credits/crazy117.png")}</span><strong>crazy117</strong><button class="tool" data-copy="crazy117">Copy</button></div>
      <a class="tool contact-kofi" href="${KOFI}" target="_blank" rel="noopener noreferrer">Support me on Ko-fi</a>
    </section>
    <section class="contact-card">
      <p class="contact-label">Credits</p>
      <ul>${CREDITS.map(creditRow).join("")}</ul>
    </section>
  </div>
  <p class="legal">Dominik is an unofficial fan project and is not affiliated with Kuro Games. Punishing: Gray Raven and its characters and art belong to their respective owners.</p>`;

/* ---------- BC calculator: the BC Planner tab of the spreadsheet, with patch income from calculator-data.js ---------- */
const CALC_SHEET = "https://docs.google.com/spreadsheets/d/1h1fmMIC0zn_XPgAP8iVCEoNGgFV_DQ2-S44JNqErXFw/edit";
const CALC_ART = "assets/calculator";
const RC_ART = `${CALC_ART}/rainbow-card.png`;
const ODDS_METHOD = "https://wiki.warframe.com/w/User_blog:FINNER/Warframe_Expected_%26_Nearly_Guaranteed_Numbers_-_An_Explanation";
const CURRENCIES = [
  { key: "bc", name: "Black Cards", art: `${CALC_ART}/black-card.png` },
  { key: "limited", name: "Limited Tickets", art: `${CALC_ART}/limited-ticket.png` },
  { key: "weapon", name: "Weapon Tickets", art: `${CALC_ART}/weapon-ticket.png` },
  { key: "cub", name: "C.U.B. Tickets", art: `${CALC_ART}/cub-ticket.png` },
  { key: "construct", name: "Construct Tickets", art: `${CALC_ART}/construct-ticket.png` },
  { key: "voucher", name: "Vouchers", art: `${CALC_ART}/voucher.png` },
  { key: "shard", name: "Shards", art: `${CALC_ART}/shard.png` }
];
// What each pass pays when bought ("upfront") and then once a day for "days" days, in the currencies above.
// Rewards the calculator doesn't track, like Serum, are left out. Monthly bundles from huaxu.app/na/shops/rc/2
const CALC_PASSES = [
  { key: "bcPass", name: "Monthly Pass A", rc: 30, max: 2, art: `${CALC_ART}/bc-pass.png`, upfront: { bc: 300 }, daily: { bc: 100 }, days: 30 },
  { key: "passC", name: "Monthly Pass C", rc: 28, max: 2, art: `${CALC_ART}/monthly-pass-c.png`, upfront: { bc: 300 }, daily: { bc: 90 }, days: 30 },
  { key: "serumPass", name: "Advanced Character Serum Monthly Pass Bundle", rc: 30, max: 1, art: `${CALC_ART}/serum-pass.png`, upfront: { bc: 300 } },
  { key: "weaponPass", name: "Weapon Resonance Monthly Pass Bundle", rc: 98, max: 1, art: `${CALC_ART}/weapon-pass.png`, upfront: { bc: 980, shard: 30 }, daily: { weapon: 50, shard: 4 }, days: 30 },
  { key: "encrypted", name: "Encrypted Pass", rc: 30, max: 1, art: `${CALC_ART}/encrypted-pass.png`, upfront: { cub: 2500, voucher: 10000 } },
  { key: "topSecret", name: "Top-Secret Pass", rc: 68, max: 1, art: `${CALC_ART}/top-secret-pass.png`, upfront: { limited: 2500, voucher: 18500 } }
];
const DAILY_PASSES = CALC_PASSES.filter(pass => pass.daily);
const CALC_SPENDING = [
  { key: "copies", name: "Frame copies" },
  { key: "shards", name: "Frame shards", note: "804 Vouchers each" },
  { key: "weapons", name: "Weapons" },
  { key: "resonance", name: "6★ Resonance", note: "150 Shards each" },
  { key: "cubs", name: "C.U.B.s" },
  { key: "custom", name: "Other BC spend", note: "Skins, special banners...", step: 1000 }
];
// Eneba prices before checkout fees: [RC, BRL, USD]. tools/update-prices.mjs rewrites these two lines
const RC_PRICES_DATE = "8 Nov 2026";
const RC_PACKS = [[5, 4.40, 1.07], [28, 22.57, 4.34], [34, 27.76, 5.29], [59, 45.93, 8.62], [71, 54.59, 10.20], [119, 90.92, 16.86], [299, 229.36, 42.20], [600, 458.64, 84.16]];
const RC_STORE = "https://www.eneba.com/top-up-punishing-gray-raven-android-rainbow-cards-global";
const COST = { S: 15000, A: 2500, weapon: 7500, cub: 5000, frameShard: 804, resonance: 150, shardVouchers: 120 };
// A collab gives free pulls, so its first frame and weapon are cheaper. It pays in BC only, and tickets carry over untouched
const COLLAB_COST = { S: 10500, A: 2500, firstFrame: 6300, firstWeapon: 4000 };
// Base rates from each banner's in-game Drop Details. The first key is the banner the page opens on
const FRAME_ODDS = { rate: 0.005, pity: 60, cost: COST.S };
const PULL_ODDS = { "Themed Construct": FRAME_ODDS, "Arrival Construct": FRAME_ODDS, "Target Weapon": { rate: 0.04, pity: 30, cost: COST.weapon }, "C.U.B. Target": { rate: 0.0582, pity: 20, cost: COST.cub } };
// What's left after one patch. "start" is the balance going in, "plan" what was typed in that patch's card
// "passDays" holds how many days of each daily pass fall in this patch
function patchResult(patch, start, plan, { calibration, useVouchers }, passDays = {}) {
  const count = key => plan[key] || 0;
  const rank = plan.rank || patch.rank;
  const weaponCost = COST.weapon * (calibration ? 2 : 1);
  const left = { ...start };
  let bcSpent = count("custom");
  if (patch.collab) {
    if (count("copies")) bcSpent += COLLAB_COST.firstFrame + (count("copies") - 1) * COLLAB_COST[rank];
    if (count("weapons")) bcSpent += COLLAB_COST.firstWeapon + (count("weapons") - 1) * weaponCost;
    bcSpent += count("cubs") * COST.cub;
  } else {
    for (const { key } of CURRENCIES) left[key] += patch.gains[key];
    for (const { key, upfront, daily = {} } of CALC_PASSES) {
      for (const c in upfront) left[c] += count(key) * upfront[c];
      for (const c in daily) left[c] += (passDays[key] || 0) * daily[c];
    }
    // Tickets pay first, and BC covers what they can't
    const pay = (cost, ticket) => {
      const used = Math.min(cost, left[ticket]);
      left[ticket] -= used;
      bcSpent += cost - used;
    };
    pay(count("copies") * COST[rank], rank === "A" ? "construct" : "limited");
    pay(count("weapons") * weaponCost, "weapon");
    pay(count("cubs") * COST.cub, "cub");
  }
  left.bc -= bcSpent;
  const shardCost = count("resonance") * COST.resonance;
  const bought = useVouchers ? Math.max(shardCost - left.shard, 0) : 0;
  left.shard += bought - shardCost;
  left.voucher -= count("shards") * COST.frameShard + bought * COST.shardVouchers;
  return left;
}
// Warframe's "Expected" and "Nearly Guaranteed" numbers with pity added: the average stops at the pull that is guaranteed,
// and the last pull before pity is the last one that can come from luck
const NEARLY_SURE = 0.99;
function pullStats(kind, pulls) {
  const { rate, pity, cost } = PULL_ODDS[kind], miss = 1 - rate, average = (1 - miss ** pity) / rate;
  return {
    rate, pity, average, averageCost: average * cost / pity,
    early: 1 - miss ** Math.min(pulls, pity - 1),
    noPity: Math.ceil(Math.log(1 - NEARLY_SURE) / Math.log(miss))
  };
}

// What was typed stays in this browser, so a plan is still there on the next visit
const CALC_KEY = "dominik-calculator";
function readCalc() {
  try { return JSON.parse(localStorage.getItem(CALC_KEY)) || {}; }
  catch { return {}; }
}
function saveCalc() {
  try { localStorage.setItem(CALC_KEY, JSON.stringify(calc)); }
  catch { /* Private windows can refuse storage: the page still works, it just won't remember */ }
}
const newCalc = () => ({ balance: {}, plans: {}, pick: "", tab: "plan", calibration: false, useVouchers: true, pullKind: Object.keys(PULL_ODDS)[0], pulls: 0 });
let calc = { ...newCalc(), ...readCalc() };
// Plans saved while patches were folding cards still carry which ones were open
delete calc.open;
// A plan saved before a banner was renamed still holds the old name
if (!PULL_ODDS[calc.pullKind]) calc.pullKind = newCalc().pullKind;
const calcId = patch => patch.patch || patch.frame;
// The game day turns at the daily reset, 05:00 UTC, wherever the player is
const calcToday = () => new Date(Date.now() - 5 * 36e5).toISOString().slice(0, 10);
const dayNumber = iso => Date.parse(`${iso}T00:00Z`) / 864e5;
// Weeklies reset on Mondays: the spreadsheet's weekly income matches the Mondays of each patch. Day 0 was a Thursday
const mondays = (from, to) => Math.floor((to + 3) / 7) - Math.floor((from + 2) / 7);
// Norman Revival Plan and Clash Reflection reset every other Thursday and take turns: these are one reset of each.
// tools/update-calculator.mjs keeps the same dates for the forecast
const FORTNIGHTLY = [
  { key: "nrp", name: "Norman Revival Plan", reset: "2026-11-12" },
  { key: "clash", name: "Clash Reflection", reset: "2026-11-19" }
];
// Resets of a fortnightly mode from day "from" to day "to", both counted
const fortnights = (from, to, reset) => Math.floor((to - dayNumber(reset)) / 14) - Math.floor((from - 1 - dayNumber(reset)) / 14);
// How much of the patch running today is still ahead, counting today. Any other patch has no answer here
function patchTime(patch, today) {
  if (!patch.patch || today < patch.start || today > patch.end) return null;
  const start = dayNumber(patch.start), end = dayNumber(patch.end), now = dayNumber(today);
  return { day: now - start + 1, days: end - start + 1, daysLeft: end - now + 1, weeks: mondays(start, end), weeksLeft: mondays(now, end),
    cycles: FORTNIGHTLY.map(mode => ({ ...mode, total: fortnights(start, end, mode.reset), left: fortnights(now, end, mode.reset) })) };
}
// The part of a patch's income that can still be earned: dailies and weeklies shrink as the patch goes on, and events leave once they end
function incomeLeft(patch, today) {
  const time = patchTime(patch, today);
  if (!time || !patch.daily) return patch.gains;
  // A part with no reset in the patch counts in full
  const missed = (part = {}, key, left, total) => total ? Math.round((part[key] || 0) * (1 - left / total)) : 0;
  const ended = patch.events.filter(event => event.end < today);
  return Object.fromEntries(CURRENCIES.map(({ key }) => [key, Math.max(0, patch.gains[key]
    - missed(patch.daily, key, time.daysLeft, time.days) - missed(patch.weekly, key, time.weeksLeft, time.weeks)
    - time.cycles.reduce((total, cycle) => total + missed(patch.fortnightly?.[cycle.key], key, cycle.left, cycle.total), 0)
    - ended.reduce((total, event) => total + (event.gains[key] || 0), 0))]));
}
// The patch running today and the ones after it. Patches that already ended don't matter for a plan
function calcPlan() {
  const today = calcToday();
  const current = CALC_PATCHES.findIndex(p => p.patch && today <= p.end);
  const first = current >= 0 ? current : CALC_PATCHES.findLastIndex(p => p.patch);
  return CALC_PATCHES.slice(first).map(p => p.collab ? p : { ...p, gains: incomeLeft(p, today) });
}
// Days a plan can use in a patch: from today in the one running now, all of them later on, and none in a collab, which has no dates
function planDays(patch, today) {
  if (patch.collab) return 0;
  return patchTime(patch, today)?.daysLeft ?? dayNumber(patch.end) - dayNumber(patch.start) + 1;
}
// Each patch starts with what the one before it left. Copies of the same daily pass run one after the other, and what doesn't fit moves on
function calcRun() {
  const today = calcToday();
  let balance = Object.fromEntries(CURRENCIES.map(({ key }) => [key, calc.balance[key] || 0]));
  const queued = {};
  return calcPlan().map(patch => {
    const plan = calc.plans[calcId(patch)] || {}, passDays = {}, passLeft = {};
    for (const { key, days } of DAILY_PASSES) {
      const total = (queued[key] || 0) + (patch.collab ? 0 : plan[key] || 0) * days;
      passDays[key] = Math.min(total, planDays(patch, today));
      queued[key] = passLeft[key] = total - passDays[key];
    }
    balance = patchResult(patch, balance, plan, calc, passDays);
    return { plan, left: balance, passDays, passLeft };
  });
}
const whole = value => Math.max(0, Math.floor(Number(value)) || 0);
const amount = n => n.toLocaleString("en-US");
const shortDate = iso => new Date(`${iso}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const passCost = plan => CALC_PASSES.reduce((total, { key, rc }) => total + (plan[key] || 0) * rc, 0);
// The store sells packs, not loose cards, so this is the cheapest mix that reaches the amount
function packCost(rc, column) {
  const best = [0];
  for (let n = 1; n <= rc; n++) best[n] = Math.min(...RC_PACKS.map(pack => pack[column] + best[Math.max(0, n - pack[0])]));
  return best[rc];
}
const rcPrice = rc => rc ? `≈ ${packCost(rc, 2).toLocaleString("en-US", { style: "currency", currency: "USD" })} · ${packCost(rc, 1).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} on Eneba` : "";
const calcIcon = art => `<span class="calc-icon">${pic(art)}</span>`;
const numberBox = (attr, value, label) => `<input type="number" inputmode="numeric" min="0" step="1" placeholder="0" ${attr} value="${whole(value) || ""}" aria-label="${esc(label)}">`;
const currencyGrid = (values, cell) => `<div class="calc-money">${CURRENCIES.map(c => `<div class="calc-coin">${calcIcon(c.art)}<small>${esc(c.name)}</small>${cell(c, values[c.key])}</div>`).join("")}</div>`;
const frameLink = name => CONSTRUCTS[name] ? `<a href="${characterHref(name)}">${esc(name)}</a>` : esc(name || "Frame to be confirmed");
// The belt: one stop per patch, in order, with the BC it leaves and the RC spent in it. Picking a stop shows that patch's card
const dayMonth = iso => new Date(`${iso}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
function patchStop(patch, today, picked) {
  const time = patchTime(patch, today);
  const name = patch.collab ? esc(patch.frame || "Frame to be confirmed") : esc(patch.patch);
  const when = patch.collab ? "Collab" : `${dayMonth(patch.start)} – ${dayMonth(patch.end)}`;
  const tag = time ? `<span class="calc-tag">Now</span>` : patch.predicted ? `<span class="calc-tag guess">Predicted</span>` : "";
  return `<button class="calc-stop${patch.collab ? " collab" : ""}${patch.predicted ? " guess" : ""}" type="button" role="tab" data-pick="${esc(calcId(patch))}" aria-selected="${picked}" tabindex="${picked ? 0 : -1}">
    <span class="calc-stop-top"><b>${name}</b>${tag}</span><small>${when}</small>
    <span class="calc-stop-bc">${calcIcon(CURRENCIES[0].art)}<output data-stop-bc></output></span><small data-stop-rc></small>
  </button>`;
}
function patchCard(patch, today, picked) {
  const plan = calc.plans[calcId(patch)] || {};
  const field = ({ key, name, note, step = 1 }) => `<div class="calc-field"><span>${esc(name)}</span><span class="calc-step"><button type="button" data-step="-${step}" aria-label="Less: ${esc(name)}">−</button>${numberBox(`data-plan="${key}"`, plan[key], name)}<button type="button" data-step="${step}" aria-label="More: ${esc(name)}">+</button></span>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  const passes = CALC_PASSES.map(({ key, name, art, rc, max }) => `<label class="calc-pass">${calcIcon(art)}<span>${esc(name)}<small>${rc} RC${max > 1 ? " each" : ""}</small></span>
    ${max > 1
      ? `<select data-plan="${key}" aria-label="${esc(name)}">${Array.from({ length: max + 1 }, (_, n) => `<option${n === (plan[key] || 0) ? " selected" : ""}>${n}</option>`).join("")}</select>`
      : `<input type="checkbox" data-plan="${key}"${plan[key] ? " checked" : ""} aria-label="${esc(name)}">`}</label>`).join("");
  const rank = plan.rank || patch.rank, time = patchTime(patch, today);
  const head = patch.collab
    ? `<h3>${frameLink(patch.frame)}</h3><p>Collab banner · no income of its own, and tickets don't apply</p>`
    : `<h3>${esc(patch.patch)}${time ? `<span class="calc-tag">Day ${time.day} of ${time.days}</span>` : ""}${patch.predicted ? `<span class="calc-tag guess">Predicted</span>` : ""}</h3>
      <p class="calc-meta"><span>${shortDate(patch.start)} to ${shortDate(patch.end)}</span><span>${time?.days ?? planDays(patch, today)} days</span><span>${patch.patch === patch.frame ? "" : frameLink(patch.frame)}</span></p>`;
  const income = time && patch.daily
    ? `<p class="calc-label">Income left</p><p class="calc-hint">Still to come: ${time.daysLeft} of ${time.days} days of dailies, ${time.weeksLeft} of ${time.weeks} weekly resets, ${time.cycles.map(cycle => `${cycle.left} of ${cycle.total} ${cycle.name} resets`).join(", ")} and ${patch.events.filter(event => event.end >= today).length} of ${patch.events.length} timed events</p>`
    : `<p class="calc-label">Patch income</p>`;
  return `<section class="calc-card calc-patch" role="tabpanel" data-id="${esc(calcId(patch))}"${picked ? "" : " hidden"}>
    <div class="calc-head"><div>${head}</div>${patch.collab ? "" : `<label class="calc-rank">Rank <select data-plan="rank" aria-label="Frame rank">${["S", "A"].map(r => `<option${r === rank ? " selected" : ""}>${r}</option>`).join("")}</select></label>`}</div>
    ${patch.collab ? "" : `${income}${currencyGrid(patch.gains, (c, value) => `<b>${amount(value)}</b>`)}
    <p class="calc-label">Passes</p><div class="calc-passes">${passes}</div>
    <div class="calc-rc-row"><span class="calc-rc">${calcIcon(RC_ART)}<output data-rc></output></span><b data-rc-price></b><small data-monthly></small></div>`}
    <p class="calc-label">Spending</p><div class="calc-fields">${CALC_SPENDING.map(field).join("")}</div>
    ${patch.collab ? "" : `<button class="tool calc-copy" type="button" data-calc-copy>Repeat this plan in later patches</button>`}
    <p class="calc-label">Final balance</p>${currencyGrid({}, c => `<output data-left="${c.key}"></output>`)}
  </section>`;
}
// The stop picked last time, or the first one when that patch has already left the plan
const pickedId = patches => patches.some(p => calcId(p) === calc.pick) ? calc.pick : calcId(patches[0]);
// Keeps the picked stop in the middle of the belt, without moving the page
function centerStop() {
  const belt = $(".calc-belt"), stop = $('.calc-stop[aria-selected="true"]');
  if (belt && stop) belt.scrollTo({ left: stop.offsetLeft - (belt.clientWidth - stop.offsetWidth) / 2, behavior: "smooth" });
}
function pickPatch(id, focus) {
  calc.pick = id;
  saveCalc();
  const stops = [...document.querySelectorAll(".calc-stop")], at = stops.findIndex(s => s.dataset.pick === id);
  stops.forEach((stop, i) => { stop.setAttribute("aria-selected", i === at); stop.tabIndex = i === at ? 0 : -1; });
  document.querySelectorAll(".calc-patch").forEach(card => { card.hidden = card.dataset.id !== id; });
  $("[data-belt=prev]").disabled = at === 0;
  $("[data-belt=next]").disabled = at === stops.length - 1;
  if (focus) stops[at].focus({ preventScroll: true });
  centerStop();
}
const calcStat = (label, value, note) => `<div class="calc-stat"><small>${esc(label)}</small><b>${esc(value)}</b><small>${esc(note)}</small></div>`;
function showCalc() {
  const cards = document.querySelectorAll(".calc-patch"), stops = document.querySelectorAll(".calc-stop"), run = calcRun();
  run.forEach(({ plan, left, passDays, passLeft }, i) => {
    for (const { key } of CURRENCIES) {
      const out = $(`[data-left="${key}"]`, cards[i]);
      out.textContent = amount(left[key]);
      out.classList.toggle("short", left[key] < 0);
    }
    const bc = $("[data-stop-bc]", stops[i]);
    bc.textContent = amount(left.bc);
    bc.classList.toggle("short", left.bc < 0);
    $("[data-stop-rc]", stops[i]).textContent = passCost(plan) ? `${passCost(plan)} RC on passes` : "No passes";
    const cost = $("[data-rc]", cards[i]);
    if (cost) cost.textContent = `${passCost(plan)} RC`;
    const price = $("[data-rc-price]", cards[i]);
    if (price) price.textContent = rcPrice(passCost(plan));
    const monthly = $("[data-monthly]", cards[i]);
    if (monthly) monthly.textContent = DAILY_PASSES.filter(({ key }) => passDays[key]).map(({ key, name }) =>
      `${name}: ${passDays[key]} days in this patch${passLeft[key] ? `, ${passLeft[key]} more after it` : ""}`).join(" · ");
  });
  const bought = CALC_PASSES.map(({ key, name }) => [name, run.reduce((total, { plan }) => total + (plan[key] || 0), 0)]).filter(([, count]) => count);
  const totalRc = run.reduce((total, { plan }) => total + passCost(plan), 0);
  $("#calcRc").textContent = `${amount(totalRc)} RC`;
  $("#calcRcPrice").textContent = rcPrice(totalRc);
  $("#calcBarRc").textContent = `${amount(totalRc)} RC`;
  $("#calcBarPrice").textContent = rcPrice(totalRc) || "No passes picked yet";
  const lastBc = run.at(-1).left.bc;
  $("#calcBarBc").textContent = `${amount(lastBc)} BC`;
  $("#calcBarBc").classList.toggle("short", lastBc < 0);
  $("#calcRcList").textContent = bought.map(([name, count]) => `${count}× ${name}`).join(" · ") || "No passes picked yet";
  const { rate, pity, average, averageCost, early, noPity } = pullStats(calc.pullKind, calc.pulls);
  $("#calcOdds").innerHTML = calcStat("Chance before pity", `${(early * 100).toFixed(2)}%`, calc.pulls >= pity ? `Pity reached: guaranteed by pull ${pity}` : `${(rate * 100).toFixed(2).replace(/\.?0+$/, "")}% per pull`)
    + calcStat("Pity hits", `${Math.floor(calc.pulls / pity)}×`, `Every ${pity} pulls · ${pity - calc.pulls % pity} to the next`)
    + calcStat("Expected", `${Math.round(average)} pulls`, `About ${amount(Math.round(averageCost / 10) * 10)} BC`)
    + calcStat("Nearly Guaranteed", `${noPity} pulls`, `${NEARLY_SURE * 100}% chance without pity`);
}
// Phones keep the explanations closed, and only one patch open, so the page stays short
const calcPhone = matchMedia("(max-width:760px)");
const calcMore = (title, content) => `<details class="calc-more"${calcPhone.matches ? "" : " open"}><summary>${title}</summary>${content}</details>`;
const calcNotes = notes => `<dl class="calc-info">${notes.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join("")}</dl>`;
function calculatorPage() {
  const option = (key, name, note) => `<label class="calc-check"><input type="checkbox" data-option="${key}"${calc[key] ? " checked" : ""}><span>${esc(name)}<small>${esc(note)}</small></span></label>`;
  const tab = (key, name) => `<button class="tool${calc.tab === key ? " on" : ""}" type="button" data-calc-tab="${key}">${name}</button>`;
  const margin = (tone, value, what) => `<div class="calc-margin ${tone}"><b>${value}</b><span>${what}</span></div>`;
  const today = calcToday(), patches = calcPlan(), picked = calc.pick = pickedId(patches);
  return `<h1>Planner</h1><p class="sub">Plan your Black Cards across patches. Same math as the <a href="${CALC_SHEET}" target="_blank" rel="noopener noreferrer">Tickets Income spreadsheet</a> by @Crazy117 &amp; @Sidewayz.</p>
  <div id="calc">
    <div class="calc-tabs">${tab("plan", "Planner")}${tab("pull", "Pull chance")}</div>
    <div data-calc-panel="plan"${calc.tab === "plan" ? "" : " hidden"}>
      <div class="calc-bar">
        <span class="calc-bar-item">${calcIcon(RC_ART)}<span><output id="calcBarRc"></output><small id="calcBarPrice"></small></span></span>
        <span class="calc-bar-item">${calcIcon(CURRENCIES[0].art)}<span><output id="calcBarBc"></output><small>BC left after the last patch</small></span></span>
      </div>
      <div class="calc-layout">
        <div class="calc-main">
          <section class="calc-card">
            <div class="calc-head"><div><h3>Starting balance</h3><p>What you have right now</p></div><button class="tool" type="button" data-calc-clear>Clear all</button></div>
            <div class="calc-start">${currencyGrid(calc.balance, (c, value) => numberBox(`data-balance="${c.key}"`, value, c.name))}</div>
            <div class="calc-checks">${option("calibration", "Calibration mode", "Counts each weapon at double cost")}${option("useVouchers", "Buy missing Shards with Vouchers", "120 Vouchers per Shard, for 6★ Resonance")}</div>
          </section>
          <h2 class="grp">Patches</h2>
          <p class="calc-hint">Each stop shows the BC left after that patch. Pick one to plan it.</p>
          <div class="calc-belt-wrap">
            <button class="calc-nav" type="button" data-belt="prev" aria-label="Previous patch"${picked === calcId(patches[0]) ? " disabled" : ""}>‹</button>
            <div class="calc-belt"><div class="calc-track" role="tablist" aria-label="Patches">${patches.map(p => patchStop(p, today, calcId(p) === picked)).join("")}</div></div>
            <button class="calc-nav" type="button" data-belt="next" aria-label="Next patch"${picked === calcId(patches.at(-1)) ? " disabled" : ""}>›</button>
          </div>
          ${patches.map(p => patchCard(p, today, calcId(p) === picked)).join("")}
        </div>
        <aside class="calc-side">
          <h2 class="grp">Passes total</h2>
          <section class="calc-card calc-total">${calcIcon(RC_ART)}<output id="calcRc"></output><b id="calcRcPrice"></b><small id="calcRcList"></small>
            <small>RC prices come from <a href="${RC_STORE}" target="_blank" rel="noopener noreferrer">Eneba</a> on ${RC_PRICES_DATE}: the cheapest mix of its packs, before checkout fees. They change often, so treat them as an estimate.</small></section>
          ${calcMore("How it's calculated", `<section class="calc-card">${calcNotes([
            ["Worst-case costs", "A frame counts as 60/60 pulls (15,000) and a weapon as 30/30 (7,500)."],
            ["Current patch", "Dailies shrink with the days left, weeklies with the Monday resets left, Norman Revival Plan and Clash Reflection with their own resets left (every other Thursday, taking turns), and timed events leave after their last day. Today's dailies and running events count in full, even if you already collected them. Every reset happens at 05:00 UTC."],
            ["Daily passes", `Monthly Pass A and C and the Weapon Resonance bundle pay part when bought and the rest once a day for 30 days. A second copy of the same pass adds 30 more days, not more per day. Days that don't fit move to the next patch. Serum and other rewards the calculator doesn't track are left out.`],
            ["Patch income", "Only the highest difficulty of each mode counts."]
          ])}</section>`)}
          ${calcMore("Predicted patches", `<section class="calc-card">
            <p class="calc-text">The calculator always looks 9 patches past the last one in the spreadsheet. Each of them repeats the same period of the year before, with no collabs and no one-off compensation. Expect this much variation per patch:</p>
            <div class="calc-margins">
              ${margin("low", "±5%", "Black Cards (±510) and C.U.B. Tickets")}
              ${margin("mid", "±20-30%", "Vouchers, Construct Tickets and Shards")}
              ${margin("high", "±50%+", "Limited and Weapon Tickets, which depend on each year's events")}
            </div>
            <p class="calc-text">Over a full year, Black Cards stay within about ±3.5% (±3,200). Based on how far 8 real patches landed from the same period a year before.</p>
          </section>`)}
        </aside>
      </div>
    </div>
    <div class="calc-pull-page" data-calc-panel="pull"${calc.tab === "pull" ? "" : " hidden"}>
      <section class="calc-card">
        <div class="calc-fields calc-pull">
          <label class="calc-field"><span>Banner</span><select data-pull-kind aria-label="Banner">${Object.keys(PULL_ODDS).map(k => `<option${k === calc.pullKind ? " selected" : ""}>${esc(k)}</option>`).join("")}</select></label>
          <label class="calc-field"><span>Pulls</span>${numberBox("data-pulls", calc.pulls, "Pulls")}</label>
        </div>
        <div class="calc-stats" id="calcOdds"></div>
      </section>
      ${calcMore("What the numbers mean", `<section class="calc-card">${calcNotes([
        ["Chance before pity", "The odds of getting it from luck alone. It stops growing one pull before pity, because the next pull is guaranteed."],
        ["Pity hits", "How many times pity triggers in these pulls if luck never comes first. Getting it early restarts the count."],
        ["Expected", "What one copy takes on average once pity is counted, at 250 BC per pull."],
        ["Nearly Guaranteed", `How many pulls a ${NEARLY_SURE * 100}% chance would take if pity didn't exist.`],
        ["Method", `The rate is treated as flat until pity. Expected and Nearly Guaranteed adapt <a href="${ODDS_METHOD}" target="_blank" rel="noopener noreferrer">FINNER's numbers</a> from Warframe.`]
      ])}</section>`)}
    </div>
  </div>`;
}
$("#main").addEventListener("input", e => {
  const el = e.target;
  if (!el.closest("#calc")) return;
  const { balance, plan, option } = el.dataset;
  if (balance) calc.balance[balance] = whole(el.value);
  else if (plan) {
    const id = el.closest(".calc-patch").dataset.id;
    (calc.plans[id] ||= {})[plan] = plan === "rank" ? el.value : el.type === "checkbox" ? Number(el.checked) : whole(el.value);
  }
  else if (option) calc[option] = el.checked;
  else if ("pullKind" in el.dataset) calc.pullKind = el.value;
  else if ("pulls" in el.dataset) calc.pulls = whole(el.value);
  saveCalc();
  showCalc();
});
// Moves the pick one stop along the belt: -1 back, 1 forward
function stepBelt(by, focus) {
  const stops = [...document.querySelectorAll(".calc-stop")], at = stops.findIndex(s => s.dataset.pick === calc.pick);
  const next = stops[Math.min(Math.max((at < 0 ? 0 : at) + by, 0), stops.length - 1)];
  if (next) pickPatch(next.dataset.pick, focus);
}
$("#main").addEventListener("click", e => {
  const tab = e.target.closest("[data-calc-tab]"), stop = e.target.closest("[data-pick]"), nav = e.target.closest("[data-belt]");
  const step = e.target.closest("[data-step]"), copy = e.target.closest("[data-calc-copy]");
  if (stop) pickPatch(stop.dataset.pick);
  if (nav) stepBelt(nav.dataset.belt === "next" ? 1 : -1);
  if (step) {
    const box = step.parentElement.querySelector("input");
    box.value = Math.max(0, whole(box.value) + Number(step.dataset.step)) || "";
    box.dispatchEvent(new Event("input", { bubbles: true }));
  }
  // Rank stays with each patch: the frame of one patch says nothing about the next
  if (copy) {
    const id = copy.closest(".calc-patch").dataset.id, { rank, ...plan } = calc.plans[id] || {};
    const patches = calcPlan().filter(p => !p.collab), top = scrollY;
    for (const patch of patches.slice(patches.findIndex(p => calcId(p) === id) + 1)) {
      const own = calc.plans[calcId(patch)]?.rank;
      calc.plans[calcId(patch)] = { ...plan, ...(own && { rank: own }) };
    }
    saveCalc();
    route();
    scrollTo(0, top);
  }
  if (tab) {
    calc.tab = tab.dataset.calcTab;
    saveCalc();
    document.querySelectorAll("[data-calc-tab]").forEach(b => b.classList.toggle("on", b === tab));
    document.querySelectorAll("[data-calc-panel]").forEach(panel => { panel.hidden = panel.dataset.calcPanel !== calc.tab; });
  }
  if (!e.target.closest("[data-calc-clear]")) return;
  calc = newCalc();
  saveCalc();
  route();
});
// Arrow keys walk the belt, as in any row of tabs
$("#main").addEventListener("keydown", e => {
  if (!e.target.matches(".calc-stop")) return;
  const by = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity }[e.key];
  if (!by) return;
  e.preventDefault();
  stepBelt(by, true);
});
/* ---------- Team Builder: its code (editor.js) and catalog load only when the page opens ---------- */
let editorState = "", editorLoad = null;
const loadScript = src => new Promise((done, fail) => {
  const script = document.createElement("script");
  script.src = src;
  script.onload = done;
  script.onerror = fail;
  document.head.append(script);
});
// Loads once, whoever asks first: the Team Builder page, or the community teams of the other pages
function loadEditor() {
  if (editorLoad) return editorLoad;
  editorState = "loading";
  return editorLoad = loadScript("data/catalog-data.js").then(() => loadScript("editor.js"))
    .then(() => { editorState = "ready"; }, () => { editorState = "failed"; throw new Error("editor.js failed to load"); });
}
function editorPage() {
  if (editorState === "ready") return teamBuilder();
  const head = `<h1>Team Builder</h1>`;
  if (editorState === "failed") return `${head}<p class="empty">The Team Builder failed to load. Reload the page to try again.</p>`;
  loadEditor().catch(() => {}).then(() => { if (location.pathname === "/editor") route(); });
  return `${head}<p class="empty">Loading...</p>`;
}

/* ---------- community teams: approved teams sent from the Team Builder, read from /api/teams ---------- */
// They join PAGES and COMPS as one more composition on their page, so the lists, the character pages and the search
// show them like any other build. If the API fails or has no teams, the site stays as it is
function addCommunity(list) {
  let added = 0;
  for (const item of list) {
    const team = edClean(item?.team), cards = edCards(team), id = `c-${item?.id}`;
    if (!team.page || cards.length < 3 || !/^c-\d+$/.test(id)) continue;
    const comp = `community-${team.page}`;
    if (!COMPS[comp]) {
      const { c1, c2, cp } = edTheme(team);
      COMPS[comp] = { name: "Community", c1, c2, cp, variants: [] };
      (PAGES[team.page] ||= []).push(comp);
    }
    const author = typeof item.author === "string" ? item.author.slice(0, 32) : "";
    COMPS[comp].variants.push({ id, name: team.name.trim() || "Untitled team", group: author ? `by ${author}` : undefined, cards });
    added++;
  }
  return added;
}
function loadCommunity() {
  fetch("/api/teams").then(r => r.ok ? r.json() : []).then(list => {
    if (!Array.isArray(list) || !list.length) return;
    return loadEditor().then(() => {
      if (!addCommunity(list)) return;
      characterList = null;
      searchItems = null;
      // Only pages that list builds are drawn again: the others have nothing new to show
      const kind = location.pathname.split("/")[1];
      if (!kind || TEAM_LISTS[kind] || kind === "constructs") route();
    });
  }).catch(() => { /* no API here (a local copy) or a bad answer: official builds only */ });
}

/* ---------- Meta timeline: who held each class of an element or Effect, from timeline-data.js ---------- */
const TL_ROLES = ["Attacker", "Tank", "Breaker", "Support", "Amplifier", "Overlinker", "Annihilator", "Observer"];
// Each class here is the next step of the one before it, so a newer frame of any of them replaces the older ones
const TL_LINES = [["Tank", "Breaker"], ["Support", "Amplifier", "Overlinker"]];
const roleLine = role => TL_LINES.find(line => line.includes(role)) || [role];
const TL_VIEWS = {
  element: { field: "element", name: "Class & Element", groups: () => ENERGY, dir: "energy type", rule: "class and element", plural: "elements" },
  effect: { field: "effect", name: "Class & Effect", groups: () => [...EFFECT, ...SPECIAL_EFFECT], dir: "effects", rule: "class and Effect", plural: "Effects" }
};
// Effects with no color of their own on the home page
const tlColor = group => TILE_COLOR[group] || { Disruption: TILE_COLOR.Nihil, Raydiance: "#e6bd52" }[group];
const TL_SKIP = "Lee: Entropy", TL_SKIP_NOTE = "19 days between Lee: Entropy and Lucia: Crimson Abyss";
// Frames Kuro lets anyone get without pulling, and how
const TL_FREE = {
  "Selena: Capriccio": "farmable from the Recitativo di Fantasia mode",
  "Ayla: Kaleido": "farmable from dorm commissions",
  "Alisa: Echo": "Dorm Dispatch shop",
  "Wanshi: Lucid Dreamer": "Dorm Dispatch and Voucher shops",
  "Lilith: Daemonissa": "Insatiable Research",
  "Teddy: Spectre": "Service Shop",
  "Nirvatia: Dirge": "Service Shop and Journal of Promise",
  "Helentine: Lacrimosa": "Service Shop and Journal of Promise",
  "Adelyde: Anabasis": "Service Shop and Journal of Promise"
};
const TL_CN_HISTORY = "https://wiki.biligame.com/zspms/%E6%88%98%E5%8F%8C%E5%A4%A7%E4%BA%8B%E8%AE%B0";
// The first patch both servers got on the same day
const TL_SYNC = "2025-11-13";
let timelineView = "element", timelineGroup = "", timelineNow = false;
const TL_ROW = 46, TL_RANKED = 6;
const monthYear = iso => new Date(`${iso}T00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
const roleArt = role => CLASS_ART[role] || classIcon(role);
// A reign lasts until the next frame of the same class line. With no newer one, it is still running
function timelineLanes(field, group) {
  const today = dayNumber(calcToday()), frames = TIMELINE.filter(c => c[field] === group);
  return TL_ROLES.map(role => ({ role, reigns: frames.filter(c => c.role === role).map(c => {
    const next = frames.find(other => other.date > c.date && roleLine(role).includes(other.role));
    const start = dayNumber(c.date), end = next ? dayNumber(next.date) : today;
    return { ...c, start, end, days: end - start, next };
  }) })).filter(lane => lane.reigns.length);
}
const reignInfo = r => `Released in ${r.patch} · ${monthYear(r.date)} to ${r.next ? monthYear(r.next.date) : "today"} · ${amount(r.days)} days${r.next ? ` · replaced by ${r.next.name}${r.next.role === r.role ? "" : ` (${r.next.role})`}` : " · still in place"}${TL_FREE[r.name] ? ` · free from ${TL_FREE[r.name]}` : ""}`;
const reignHref = name => CONSTRUCTS[name] ? ` href="${characterHref(name)}"` : "";
// What the page shows after the filters. The numbers at the top always use every character
function timelineShown(view) {
  return view.groups().filter(group => !timelineGroup || group === timelineGroup).map(group => ({
    group,
    lanes: timelineLanes(view.field, group).map(lane => ({ ...lane, reigns: lane.reigns.filter(r => !timelineNow || !r.next) })).filter(lane => lane.reigns.length)
  })).filter(({ lanes }) => lanes.length);
}
// The day each class first appeared, and the day the Global server caught up with this one
function timelineMarks() {
  const debuts = TL_ROLES.map(role => ({ date: TIMELINE.find(c => c.role === role).date, text: `${role} debut` })).filter(mark => mark.date > TIMELINE[0].date);
  return [...debuts, { date: TL_SYNC, text: "Global/CN sync" }].sort((x, y) => x.date.localeCompare(y.date));
}
function timelineChart(view) {
  const first = dayNumber(TIMELINE[0].date), last = dayNumber(calcToday()), marks = timelineMarks();
  const at = day => ((day - first) / (last - first) * 100).toFixed(2);
  const years = Array.from({ length: Number(calcToday().slice(0, 4)) - Number(TIMELINE[0].date.slice(0, 4)) }, (_, i) => Number(TIMELINE[0].date.slice(0, 4)) + i + 1);
  const lines = years.map(year => `<i style="left:${at(dayNumber(`${year}-01-01`))}%"></i>`).join("") + marks.map(mark => `<i class="mark" style="left:${at(dayNumber(mark.date))}%"></i>`).join("");
  const reign = r => `<a class="tl-reign${r.next ? "" : " now"}" data-line="${roleLine(r.role)[0]}"${reignHref(r.name)} style="left:${at(r.start)}%;width:${at(first + r.end - r.start)}%"${tipAttr(r.name, reignInfo(r))}>${pic(r.head, `alt="${esc(r.name)}"`)}${TL_FREE[r.name] ? `<em class="tl-free">Free</em>` : ""}<span>${amount(r.days)}<small>${esc(r.patch)}</small></span></a>`;
  // A line from a character down to whoever replaced them from the next class of the line
  const link = (r, row, lanes) => {
    const rows = lanes.findIndex(lane => lane.role === r.next?.role) - row;
    return r.next && r.next.role !== r.role && rows > 0 ? `<b class="tl-link" style="left:${at(dayNumber(r.next.date))}%;height:${rows * TL_ROW - 36}px"></b>` : "";
  };
  const lane = ({ role, reigns }, row, lanes) => `<div class="tl-row"><span class="tl-role">${row && roleLine(role).includes(lanes[row - 1].role) ? "<em>↳</em>" : ""}${pic(roleArt(role))}${esc(role)}</span><div class="tl-track">${lines}${reigns.map(r => link(r, row, lanes)).join("")}${reigns.map(reign).join("")}</div></div>`;
  return `<div class="tl-chart">
    <div class="tl-row tl-years"><span></span><div class="tl-track">${years.map(year => `<b style="left:${at(dayNumber(`${year}-01-01`))}%">${year}</b>`).join("")}</div></div>
    <div class="tl-row tl-marks"><span></span><div class="tl-track">${marks.map((mark, i) => `<b class="${i % 2 ? "low" : ""}" style="left:${at(dayNumber(mark.date))}%"${tipAttr(mark.text, monthYear(mark.date))}>${esc(mark.text)}</b>`).join("")}</div></div>
    ${timelineShown(view).map(({ group, lanes }) => `<section class="tl-group" style="--c:${tlColor(group)}"><h2>${menuIcon(view.dir, group)}${esc(group)}</h2>${lanes.map(lane).join("")}</section>`).join("")}
  </div>`;
}
function timelineList(view) {
  const item = r => `<a class="tl-item${r.next ? "" : " now"}"${reignHref(r.name)}>${pic(r.head, 'alt=""')}<span><b>${esc(r.name)}${TL_FREE[r.name] ? `<em class="tl-free">Free</em>` : ""}</b><small>${esc(r.patch)}</small><small>${monthYear(r.date)} to ${r.next ? monthYear(r.next.date) : "today"}</small>${r.next && r.next.role !== r.role ? `<small class="tl-by">↳ ${esc(r.next.name)} (${esc(r.next.role)})</small>` : ""}</span><em>${amount(r.days)} days</em></a>`;
  return `<div class="tl-list"><p class="tl-chips">${timelineMarks().map(mark => `<span>${monthYear(mark.date)} · ${esc(mark.text)}</span>`).join("")}</p>
    ${timelineShown(view).map(({ group, lanes }, i) => `<details class="tl-fold" style="--c:${tlColor(group)}"${i ? "" : " open"}><summary>${menuIcon(view.dir, group)}${esc(group)}</summary>
      ${lanes.map(({ role, reigns }) => `<p class="tl-lane">${pic(roleArt(role))}${esc(role)}</p>${[...reigns].reverse().map(item).join("")}`).join("")}</details>`).join("")}</div>`;
}
function timelineBody() {
  const view = TL_VIEWS[timelineView];
  const reigns = view.groups().flatMap(group => timelineLanes(view.field, group).flatMap(lane => lane.reigns.map(r => ({ ...r, group }))));
  // Only replaced characters have a final number, and the launch-window gap between Lee and Alpha says nothing about the meta
  const done = reigns.filter(r => r.next && r.name !== TL_SKIP);
  const mean = list => list.reduce((total, r) => total + r.days, 0) / list.length;
  const days = n => `${amount(Math.round(n))} days`;
  const byLength = [...done].sort((x, y) => y.days - x.days);
  const groups = view.groups().map(group => [group, done.filter(r => r.group === group)]).filter(([, list]) => list.length)
    .map(([group, list]) => ({ group, days: mean(list) })).sort((x, y) => y.days - x.days);
  const inPlace = reigns.filter(r => !r.next).sort((x, y) => y.days - x.days);
  // One row per class, oldest class first, to show how the roster of classes changed over time
  const averages = TL_ROLES.map(name => {
    const own = reigns.filter(r => r.role === name), list = done.filter(r => r.role === name);
    return { name, first: own.map(r => r.date).sort()[0], replaced: list.length, days: list.length ? mean(list) : 0 };
  }).filter(row => row.first).sort((x, y) => x.first.localeCompare(y.first));
  const top = Math.max(...averages.map(row => row.days), 1);
  // Who is closest to the usual lifespan of their class line. Classes nobody has been replaced in have nothing to compare with
  const watch = inPlace.map(r => {
    const line = done.filter(other => roleLine(r.role).includes(other.role));
    return { ...r, average: line.length ? mean(line) : 0 };
  }).filter(r => r.average).sort((x, y) => y.days / y.average - x.days / x.average);
  // Phones open only the first one, so the timeline itself is not far down the page
  const ranking = (title, rows, kind = "") => `<details class="tl-rank ${kind}"${calcPhone.matches && kind !== "first" ? "" : " open"}><summary>${esc(title)}</summary><ol>${rows.slice(0, TL_RANKED).map(([art, name, value]) => `<li>${art}<b>${esc(name)}</b><em>${value}</em></li>`).join("")}</ol></details>`;
  const people = list => list.map(r => [pic(r.head), r.name, days(r.days)]);
  const filter = (group, name) => `<button class="tool${timelineGroup === group ? " on" : ""}" type="button" data-tl-group="${esc(group)}">${esc(name)}</button>`;
  return `<div class="tl-summary">
    <div class="tl-records">
      ${ranking(`Longest-lasting ${view.plural}, on average`, groups.map(g => [menuIcon(view.dir, g.group), g.group, days(g.days)]), "first")}
      ${ranking("Lasted the longest", people(byLength))}
      ${ranking("Lasted the shortest", people([...byLength].reverse()))}
      ${ranking("Longest in place, not replaced yet", people(inPlace))}
      ${ranking("Replacement watch: days in place against the class average", watch.map(r => [pic(r.head), r.name, `${amount(r.days)} of ${amount(Math.round(r.average))} · ${Math.round(r.days / r.average * 100)}%`]), "tl-watch")}
    </div>
    <details class="tl-averages"${calcPhone.matches ? "" : " open"}><summary>Average time until replaced, by class</summary>
      ${averages.map(row => `<div class="tl-average">${pic(roleArt(row.name))}<span>${esc(row.name)}<small>Since ${monthYear(row.first)} · ${row.replaced} replaced</small></span><b>${row.days ? days(row.days) : "None yet"}</b><i style="width:${(row.days / top * 100).toFixed(1)}%"></i></div>`).join("")}
    </details>
  </div>
  ${calcMore("How replacement works", `<p class="tl-rule">A character counts as replaced when a new S-Rank frame with the same ${view.rule} comes out. Breakers are the next step of Tanks, and Amplifiers and Overlinkers of Supports, so they replace them too. The numbers above leave out the ${TL_SKIP_NOTE}. The watch is a guide, not a release date.${timelineView === "effect" ? " Frames with no Effect are left out." : ""}</p>`)}
  <div class="tl-tools">${filter("", "All")}${view.groups().map(group => filter(group, group)).join("")}<button class="tool${timelineNow ? " on" : ""}" type="button" data-tl-now>Only in place</button></div>
  ${timelineChart(view)}${timelineList(view)}`;
}
function timelinePage() {
  const tab = key => `<button class="tool${timelineView === key ? " on" : ""}" type="button" data-tl-view="${key}">${TL_VIEWS[key].name}</button>`;
  return `<h1>Meta Timeline</h1><p class="sub">How long each character held their place in the meta on the Chinese server, the first to get each frame. Dates come from the <a href="${CALC_SHEET}" target="_blank" rel="noopener noreferrer">Tickets Income spreadsheet</a> and the <a href="${TL_CN_HISTORY}" target="_blank" rel="noopener noreferrer">Chinese wiki</a>, and Global release dates are not considered. Collabs and uniframes are not counted. "Free" marks frames you can get without pulling.</p>
  <div id="timeline"><div class="calc-tabs">${tab("element")}${tab("effect")}</div><div id="timelineBody">${timelineBody()}</div></div>`;
}
$("#main").addEventListener("click", e => {
  const view = e.target.closest("[data-tl-view]"), group = e.target.closest("[data-tl-group]"), now = e.target.closest("[data-tl-now]");
  if (!view && !group && !now) return;
  if (view) {
    timelineView = view.dataset.tlView;
    timelineGroup = "";
    document.querySelectorAll("[data-tl-view]").forEach(button => button.classList.toggle("on", button === view));
  }
  if (group) timelineGroup = group.dataset.tlGroup;
  if (now) timelineNow = !timelineNow;
  $("#timelineBody").innerHTML = timelineBody();
});
// "4× Keats · 2× Da Vinci", from the six memory slots
function memorySummary(memories = []) {
  const count = new Map();
  for (const piece of memories) {
    const name = piece.startsWith("assets/") ? iconName(piece) : piece;
    count.set(name, (count.get(name) || 0) + 1);
  }
  return [...count].map(([name, pieces]) => `${pieces}× ${name}`).join(" · ");
}
const buildRow = ({ href, page, team, variant, card, mates }) => `<a class="acard build" href="${esc(href)}">
    <div class="b-tx"><p>${esc(page)}</p><h3>${esc(team)}</h3>${variant ? `<p>${esc(variant)}</p>` : ""}
      <p class="b-mem">${esc(memorySummary(card.memories))}</p></div>
    <div class="b-mates">${mates.map(m => `<div class="slot" title="${esc(m.name)}">${pic(m.portrait, `alt="${esc(m.name)}"`)}</div>`).join("")}</div>
  </a>`;
function characterPage(ch) {
  const count = ch.builds.length, card = ch.builds.find(b => b.card.construct)?.card;
  const [, element, type, rank, effect] = CONSTRUCTS[ch.name];
  const details = [rank && `${rank}-Rank`, type, element, effect].filter(Boolean).join(" · ");
  const weapon = WEAPONS.find(w => w[0] === ch.name), cub = cubList().find(c => c.owner === ch.name);
  const links = [
    weapon && `<a class="acard wpn" href="${weaponHref(weapon[1])}">${weaponThumb(weapon[3], weapon[1])}<div><h3>${esc(weapon[1])}</h3><p>Weapon</p></div></a>`,
    cub && `<a class="acard wpn" href="${cubHref(cub.name)}">${thumb(cub.art)}<div><h3>${esc(cub.name)}</h3><p>CUB</p></div></a>`,
    count && `<a class="acard wpn" href="${skillHref(ch.name)}">${thumb(card?.core)}<div><h3>Skills</h3><p>All skills and passives</p></div></a>`
  ].filter(Boolean).join("");
  const buildCount = `${count} build${count === 1 ? "" : "s"}`;
  const summary = count ? `${iconName(ch.symbol)} · ${buildCount}` : details;
  const content = count
    ? links
    : `<div class="fx"><h2>Construct details</h2><p>${esc(details)}</p></div>`;
  const builds = count
    ? `<h2 class="grp">Builds</h2><div class="builds">${ch.builds.map(buildRow).join("")}</div>`
    : `<section class="used"><h2>Builds</h2><p>No builds available yet.</p></section>`;
  return `${backLink("/constructs", "Constructs")}<h1>${esc(ch.name)}</h1><p class="sub">${esc(summary)}</p>
    <div class="detail char-detail"><div class="slot">${pic(ch.portrait, `alt="${esc(ch.name)}"`)}</div><div class="char-links">${content}</div></div>
    ${builds}`;
}

/* ---------- export a build as an image ---------- */
// Drawn on a canvas from the same art as the card, so it needs no library and passes the CSP in _headers.
// The long description stays out: the image is the build itself, to post in a chat
const EXPORT_W = 460, EXPORT_H = 552, EXPORT_PAD = 36, EXPORT_HEAD = 76, EXPORT_FOOT = 34, EXPORT_SCALE = 1.5;
// Fill and edge of each bar, from its ends to its center
const BAR_COLORS = { blue: ["#08367a", "#19c4ff", "#1368ff", "#45e6ff"], red: ["#7d0e0e", "#ff5a5a", "#ff2020", "#ffb0a8"], gold: ["#7a4a08", "#ffc400", "#ff9d00", "#fff06a"] };
const TAG_COLORS = { captain: ["#0d7433", "#24dc64", "#dcffe7"], starter: ["#3a3a3f", "#b4b4b9", "#fff"] };
const exportFont = (size, weight = 700) => `${weight} ${size}px Quantico, sans-serif`;
const loadImage = src => new Promise(done => {
  const img = new Image();
  img.onload = () => done(img);
  img.onerror = () => {
    if (img.src.endsWith(encodeURI(src))) return done(null);
    img.src = src;
  };
  img.src = web(src);
});
const cardArt = c => [c.symbol, c.portrait, rankArt(c), c.weapon, c.resonance, c.core, c.construct, c.wh && memFile(c.wh, "WH", "png"),
  ...(c.memories || []), ...(c.matrix || []), ...(c.skills || [])].filter(src => src?.startsWith("assets/"));
function drawArt(g, img, x, y, w, h, { fit = "cover", zoom = 1, ox = 50, oy = 50 } = {}) {
  if (!img) return;
  const r = (fit === "cover" ? Math.max : Math.min)(w / img.width, h / img.height), dw = img.width * r, dh = img.height * r;
  const px = x + w * ox / 100, py = y + h * oy / 100;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.translate(px, py);
  g.scale(zoom, zoom);
  g.translate(-px, -py);
  g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  g.restore();
}
function drawSlot(g, x, y, w, h) {
  g.fillStyle = "#0000004b";
  g.fillRect(x, y, w, h);
  g.strokeStyle = "#ffffff30";
  g.strokeRect(x + .5, y + .5, w - 1, h - 1);
}
function drawText(g, text, x, y, font, color = "#ececee", align = "center") {
  g.font = font;
  g.fillStyle = color;
  g.textAlign = align;
  g.fillText(text, x, y);
}
// A shape with an inner edge: the stroke is twice as wide and the clip keeps only its inner half
function drawFramed(g, points, fill, edge) {
  g.beginPath();
  points.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py));
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = edge;
  g.lineWidth = 4;
  g.stroke();
  g.restore();
}
function drawCard(g, c, art, cardColor, stars, x, y, flare) {
  const w = EXPORT_W, h = EXPORT_H, inner = w - 32, left = x + 16;
  g.fillStyle = cardColor;
  g.fillRect(x, y, w, h);
  if (!flare || c.bar !== "red") {
    g.strokeStyle = "#ffffff14";
    g.strokeRect(x + .5, y + .5, w - 1, h - 1);
  }
  const [dark, bright, edgeDark, edgeBright] = BAR_COLORS[c.bar];
  const gradient = (ends, center) => {
    const bar = g.createLinearGradient(x, 0, x + w, 0);
    bar.addColorStop(0, ends); bar.addColorStop(.5, center); bar.addColorStop(1, ends);
    return bar;
  };
  // Like the page, only the outer ends of a team's bars flare out
  const outL = flare && c.bar === "blue" ? 10 : 0, outR = flare && c.bar === "gold" ? 10 : 0;
  [[y - 10, y], [y + h + 10, y + h]].forEach(([outer, inner]) =>
    drawFramed(g, [[x - outL, outer], [x + w + outR, outer], [x + w, inner], [x, inner]], gradient(dark, bright), gradient(edgeDark, edgeBright)));
  drawText(g, c.name, x + w / 2, y + 38, exportFont(22));
  // Class, portrait and rank
  const top = y + 54, size = 130, px = x + (w - size) / 2;
  drawArt(g, art.get(c.symbol), x + 40, top + 20, 90, 90, { fit: "contain" });
  drawSlot(g, px, top, size, size);
  drawArt(g, art.get(c.portrait), px, top, size, size);
  const rankX = x + w - 130;
  drawArt(g, art.get(rankArt(c)), rankX, top + 30, 90, 70, { fit: "contain" });
  // Memories, weapon, Weapon Harmony, resonances
  const boxY = top + size + 14, boxH = 212, pad = 8;
  g.fillStyle = "#ffffff0d";
  g.fillRect(left, boxY, inner, boxH);
  const memW = 196, gap = 4, cellW = (memW - gap * 2) / 3, cellH = (boxH - pad * 2 - gap) / 2;
  (c.memories || []).forEach((piece, i) => {
    const mx = left + pad + (i % 3) * (cellW + gap), my = boxY + pad + Math.floor(i / 3) * (cellH + gap), isArt = piece.startsWith("assets/");
    drawSlot(g, mx, my, cellW, cellH);
    if (isArt) drawArt(g, art.get(piece), mx, my, cellW, cellH, { zoom: piece.endsWith(".webp") ? 1.34 : 1.07 });
    else drawText(g, piece, mx + cellW / 2, my + cellH / 2, exportFont(10, 400), "#dcdaf0");
    g.fillStyle = "#000000b3";
    g.fillRect(mx + cellW - 15, my + cellH - 15, 15, 15);
    drawText(g, i + 1, mx + cellW - 7.5, my + cellH - 3.5, exportFont(11));
  });
  const wpX = left + pad + memW + 8, wpW = 92, weaponH = 96;
  drawSlot(g, wpX, boxY + pad, wpW, weaponH);
  drawArt(g, art.get(c.weapon), wpX, boxY + pad, wpW, weaponH, { fit: "contain" });
  const barH = wpW * BAR_RATIO;
  const weaponBar = art.get(STAR_BARS[weaponRank(WEAPONS.find(w => w[0] === c.name)?.[1], c.weapon, c.weaponRank)]);
  if (weaponBar) drawArt(g, weaponBar, wpX, boxY + pad + weaponH - barH, wpW, barH, { fit: "contain" });
  const whY = boxY + pad + weaponH + gap, whH = boxH - pad * 2 - weaponH - gap;
  drawSlot(g, wpX, whY, wpW, whH);
  if (c.wh) {
    const [ox, oy, zoom] = WH_FRAME[c.wh] || [50, 50, 1];
    drawArt(g, art.get(memFile(c.wh, "WH", "png")), wpX, whY, wpW, whH, { fit: "contain", ox, oy, zoom });
    drawArt(g, art.get(WH_BAR), wpX, whY, wpW, barH, { fit: "contain" });
    drawText(g, "WEAPON HARMONY", wpX + wpW * .6, whY + barH - 2.6, exportFont(7));
  }
  const mxX = wpX + wpW + 8, mxW = left + inner - pad - mxX, mxCell = (mxW - gap * 2) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = mxX + i * (mxCell + gap);
    drawSlot(g, cx, boxY + pad, mxCell, mxCell);
    drawArt(g, art.get((c.matrix || [])[i]), cx, boxY + pad, mxCell, mxCell);
    drawText(g, i + 1, cx + mxCell / 2, boxY + pad + mxCell + 13, exportFont(11));
  }
  const resY = boxY + pad + mxCell + 22, resH = boxH - pad * 2 - mxCell - 22, resW = (mxW - gap) / 2, icon = Math.min(resW, resH - 18);
  g.fillStyle = "#0000002b";
  g.fillRect(mxX, resY, mxW, resH);
  [c.resonance, c.core].forEach((src, i) => {
    const cx = mxX + i * (resW + gap);
    const textY = resY + (resH - icon - 18) / 2 + 12;
    drawText(g, "6×", cx + resW / 2, textY, exportFont(12));
    drawArt(g, art.get(src), cx + (resW - icon) / 2, textY + 6, icon, icon, { fit: "contain" });
  });
  // CUB and its skills
  const kitY = boxY + boxH + 10, kitH = 92;
  g.fillStyle = "#ffffff0d";
  g.fillRect(left, kitY, inner, kitH);
  const unit = (inner - pad * 2 - gap * 6) / 7.2, cubW = unit * 1.2;
  drawSlot(g, left + pad, kitY + pad, cubW, kitH - pad * 2);
  drawArt(g, art.get(c.construct), left + pad, kitY + pad, cubW, kitH - pad * 2);
  for (let i = 0; i < 6; i++) {
    const cx = left + pad + cubW + gap + i * (unit + gap);
    drawSlot(g, cx, kitY + pad, unit, unit);
    drawArt(g, art.get((c.skills || [])[i]), cx, kitY + pad, unit, unit);
    drawText(g, i + 1, cx + unit / 2, kitY + pad + unit + 14, exportFont(11));
  }
  // Role tags
  const tags = c.role.split(" ").filter(Boolean), tagW = 110, tagX = x + (w - tags.length * (tagW + 4) + 4) / 2;
  tags.forEach((tag, i) => {
    const [fill, edge, text] = TAG_COLORS[tag], left = tagX + i * (tagW + 4), slope = 11;
    drawFramed(g, [[left + slope, y + h - 24], [left + tagW - slope, y + h - 24], [left + tagW, y + h], [left, y + h]], fill, edge);
    drawText(g, tag.toUpperCase(), left + tagW / 2, y + h - 8, exportFont(12, 800), text);
  });
}
async function renderBuild(cards, { id, title, theme = COMPS[id] }) {
  await Promise.all([document.fonts.load(exportFont(16)), document.fonts.load(exportFont(13, 400))]);
  const sources = [...new Set([...cards.flatMap(cardArt), ...Object.values(STAR_BARS), WH_BAR])];
  const art = new Map(await Promise.all(sources.map(async src => [src, await loadImage(src)])));
  const width = EXPORT_PAD * 2 + cards.length * EXPORT_W;
  const height = EXPORT_HEAD + EXPORT_H + EXPORT_FOOT + 16;
  const canvas = document.createElement("canvas");
  canvas.width = width * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;
  const g = canvas.getContext("2d");
  g.scale(EXPORT_SCALE, EXPORT_SCALE);
  const background = g.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, `${theme.c1}38`);
  background.addColorStop(1, `${theme.c2}`);
  g.fillStyle = "#0b0b0c";
  g.fillRect(0, 0, width, height);
  g.fillStyle = background;
  g.fillRect(0, 0, width, height);
  drawText(g, cards.length > 1 ? title : `${cards[0].name} · ${title}`, EXPORT_PAD, 44, exportFont(cards.length > 1 ? 26 : 16), "#fff", "left");
  cards.forEach((c, i) => drawCard(g, c, art, theme.cp, art.get(STARS_BAR), EXPORT_PAD + i * EXPORT_W, EXPORT_HEAD, cards.length > 1));
  drawText(g, "dominiko.pages.dev", width - EXPORT_PAD, height - 14, exportFont(13, 400), "#c4c4ca", "right");
  return canvas;
}
async function exportBuild(button, cards) {
  const label = button.textContent, team = shownTeam;
  button.disabled = true;
  button.textContent = "Exporting...";
  try {
    const canvas = await renderBuild(cards, team);
    const blob = await new Promise(done => canvas.toBlob(done, "image/png"));
    const link = document.createElement("a"), name = cards.length > 1 ? team.title : `${cards[0].name} ${team.title}`;
    link.href = URL.createObjectURL(blob);
    link.download = `${linkId(name.replace(/ · /g, " ").replace(":", ""))}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    button.textContent = label;
  } catch {
    button.textContent = "Export failed";
    setTimeout(() => { button.textContent = label; }, 3000);
  }
  button.disabled = false;
}

function theme(id) {
  const m = $("#main"), c = id && COMPS[id];
  m.style.background = c ? `linear-gradient(180deg, ${c.c1}38 0%, ${c.c2}1f 100%), var(--bg)` : "";
}
// Page and composition swaps run through the View Transitions API (styled in style.css);
// browsers without it, or with reduced motion on, just swap instantly.
function swap(update) {
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion:reduce)").matches) holdRail(document.startViewTransition(update).finished);
  else update();
}
// Written here because each address has its own title in the HTML, from tools/make-embeds.mjs
const SITE_TITLE = "Dominik - Punishing Gray Raven Builds";
function route() {
  // Older addresses of the Constructs page
  if (/^\/(characters|assets\/skills)\/?$/.test(location.pathname)) {
    history.replaceState(null, "", `/constructs${location.search}`);
    pageUrl = location.href;
  }
  // Keep old character detail links working with their new Constructs address
  const legacyCharacter = location.pathname.match(/^\/character\/([^/]+)\/?$/);
  if (legacyCharacter) {
    const id = decodeURIComponent(legacyCharacter[1]);
    const character = constructRoster().find(c => charId(c.name) === id || constructId(c.name) === id);
    history.replaceState(null, "", `${character ? characterHref(character.name) : `/constructs/${id}`}${location.search}`);
    pageUrl = location.href;
  }
  // A link can name a team as a third part: /energy/dark/kurumi-adelyde-rosetta
  // A community team is named in the query instead: /energy/dark?team=c-12
  const [kind, key, part] = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const pick = part || (key && TEAM_LISTS[kind] && new URLSearchParams(location.search).get("team")) || undefined;
  const path = key ? `${kind}/${key}` : kind;
  const ids = (key && PAGES[path]) || [];
  const owner = ids.find(id => (COMPS[id].variants || []).some(v => v.id === pick));
  shown = owner || (ids.includes(pick) ? pick : "");
  chosen = owner ? pick : COMPS[shown]?.variants?.[0].id || "";
  const main = $("#main");
  const character = kind === "constructs" && key && !part && constructRoster().find(c => constructId(c.name) === key || charId(c.name) === key);
  if (character && key !== constructId(character.name)) {
    history.replaceState(null, "", `${characterHref(character.name)}${location.search}`);
    pageUrl = location.href;
  }
  main.innerHTML = kind === "assets" ? assetsPage(key, pick) : kind === "constructs" ? (key || part ? (character ? characterPage(character) : `<p class="empty">Page not found.</p>`) : charactersPage()) : kind === "contact" ? contactPage() : kind === "calculator" ? calculatorPage() : kind === "timeline" ? timelinePage() : kind === "editor" ? editorPage()
    : path ? team(path, pick) : home();
  theme(shown || null);
  if (kind === "editor" && editorState === "ready") edPaint();
  if (kind === "calculator") { showCalc(); centerStop(); }
  const heading = kind && $("h1", main)?.textContent;
  document.title = heading ? `${heading} - Dominik` : SITE_TITLE;
  const navPath = { "assets/memory": "assets/memories", "assets/weapon": "assets/weapons", "assets/resonance": "assets/resonances", "assets/cub": "assets/cubs", "assets/skill": "constructs" }[path] || path;
  document.querySelectorAll("#side a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "/" + navPath));
  showGroups();
  const picker = $(".picker");
  if (!picker) return;
  // The search only hides rows
  const box = $(".bsearch input", picker), rows = [...picker.querySelectorAll(".brow")];
  box.oninput = () => {
    const words = box.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const row of rows) row.hidden = !words.every(w => row.dataset.search.includes(w));
    $(".empty", picker).hidden = rows.some(row => !row.hidden);
  };
}
// Icon names on hover: one shared box on <body>, because .slot and .comp clip anything inside them
if (matchMedia("(hover:hover)").matches) {
  const tip = document.createElement("div");
  tip.id = "tip";
  tip.hidden = true;
  const title = document.createElement("b"), info = document.createElement("p");
  tip.append(title, info);
  document.body.append(tip);
  addEventListener("mouseover", e => {
    const el = e.target.closest?.("[data-tip]");
    tip.hidden = !el;
    if (!el) return;
    title.textContent = el.dataset.tip;
    info.textContent = el.dataset.info || "";
    info.hidden = !el.dataset.info;
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.max(6, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 6))}px`;
    tip.style.top = `${Math.max(6, Math.min(r.top - h - 6 < 6 ? r.bottom + 6 : r.top - h - 6, innerHeight - h - 6))}px`;
  });
  for (const type of ["pointerdown", "scroll", "pagechange"]) addEventListener(type, () => { tip.hidden = true; }, true);
} else {
  // Touch screens have no hover: tapping an icon opens a sheet with the same text, and a link when it has a page
  const sheet = document.createElement("div");
  sheet.id = "sheet";
  sheet.hidden = true;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", "Details");
  sheet.innerHTML = `<div class="sheet-panel"><button class="sheet-close" aria-label="Close">×</button><h2></h2><p></p><a class="sheet-link">View page</a></div>`;
  document.body.append(sheet);
  const title = $("h2", sheet), info = $("p", sheet), link = $(".sheet-link", sheet), close = $(".sheet-close", sheet);
  let opener = null;
  const closeSheet = () => {
    if (sheet.hidden) return;
    sheet.hidden = true;
    setBackground(!!view);
    opener?.focus({ preventScroll: true });
  };
  addEventListener("click", e => {
    const el = e.target.closest("[data-tip]");
    if (!el || el.matches(".portrait") || el.closest(".fcard.side, #edPicker") || el.matches(".ed-live [data-ed-drop]")) return;
    e.preventDefault();
    e.stopPropagation();
    const href = el.getAttribute("href");
    title.textContent = el.dataset.tip;
    info.textContent = el.dataset.info || "";
    info.hidden = !el.dataset.info;
    link.hidden = !href;
    if (href) link.href = href;
    opener = el;
    sheet.hidden = false;
    setBackground(true);
    close.focus({ preventScroll: true });
  }, true);
  sheet.onclick = e => { if (e.target === sheet || e.target.closest(".sheet-close, .sheet-link")) closeSheet(); };
  addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  addEventListener("pagechange", closeSheet);
}
// A missing thumbnail or light copy falls back to the full art. Handled here because the CSP in _headers blocks inline onerror
addEventListener("error", e => {
  const img = e.target, full = img.dataset?.full;
  if (full && img.getAttribute("src") !== full) img.src = full;
}, true);
// Every page opens at the top, except when coming back from a detail page to where you were.
// A new detail page only needs to be listed here and to use backLink
const DETAIL_PAGE = /\/(assets\/(memory|weapon|skill|resonance|cub)|constructs)\//;
const scrollSaved = new Map();
history.scrollRestoration = "manual";
// The address of the page on screen: when the browser goes back, location already shows the next one
let pageUrl = "";
// Links shared before the addresses lost the # (dominiko.netlify.app/#/energy/dark) still open the right page
function dropOldHash() {
  if (location.hash.startsWith("#/")) history.replaceState(null, "", location.hash.slice(1));
}
function pageChanged() {
  dropOldHash();
  const oldUrl = pageUrl;
  pageUrl = location.href;
  if (oldUrl === pageUrl) return;
  dispatchEvent(new Event("pagechange"));
  closeFocus(true);
  setNav(false);
  scrollSaved.set(oldUrl, scrollY);
  const fromDetail = DETAIL_PAGE.test(oldUrl), fromTeam = /\/(energy|effect|special)\//.test(oldUrl);
  if (fromTeam && DETAIL_PAGE.test(pageUrl)) buildReturn = new URL(oldUrl).pathname;
  else if (!fromDetail || !DETAIL_PAGE.test(pageUrl)) buildReturn = "";
  // Coming back from a detail page, or from a build to its list, returns to the same place on the page
  const fromBuild = /\/(energy|effect|special)\/[^/]+(\/[^/]+|\?team=)/.test(oldUrl);
  swap(() => { route(); scrollTo(0, fromDetail || fromBuild ? scrollSaved.get(pageUrl) || 0 : 0); });
}
// Links inside the site change the page without reloading it. Ctrl+click and the like stay with the browser
addEventListener("click", e => {
  const mark = e.target.closest?.(".hero-mark[data-splash]");
  if (mark) {
    const current = mark.dataset.splash;
    const options = HOME_SPLASHES.filter(phrase => phrase !== current);
    const phrase = options[Math.floor(Math.random() * options.length)];
    mark.dataset.splash = phrase;
    mark.nextElementSibling.innerHTML = splashMarkup(phrase);
    return;
  }
  const link = e.target.closest?.('a[href^="/"]');
  if (!link || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (link.pathname === location.pathname && link.search === location.search) return;
  history.pushState(null, "", link.href);
  pageChanged();
});
addEventListener("popstate", pageChanged);

/* ---------- search: the box at the top of the side menu ---------- */
const plain = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
let searchItems = null;
function searchData() {
  if (searchItems) return searchItems;
  const items = [
    ...constructRoster().map(c => ({ label: c.name, kind: "Construct", href: characterHref(c.name), art: c.portrait })),
    ...Object.values(MEMORY_TABS).flat().map(([name, boost, ext]) => ({ label: name, kind: `Memory · ${boost}`, href: memoryHref(name), art: ext && memFile(name, "1-4") })),
    ...WEAPONS.map(([owner, name, , file, , rank]) => ({ label: name, kind: owner ? `Weapon · ${owner}` : `${rank || weaponRank(name, file)}-star weapon`, href: weaponHref(name), art: file && weaponFile(file) })),
    ...cubList().map(c => ({ label: c.name, kind: `C.U.B. · ${c.owner}`, href: cubHref(c.name), art: c.art })),
    ...Object.keys(RESONANCE_EFFECTS).map(name => ({ label: name, kind: "Weapon Resonance", href: resonanceHref(name), art: WEAPON_RES(name) })),
    ...ENERGY.map(e => ({ label: e, kind: "Energy teams", href: `/energy/${slug(e)}`, art: `assets/energy type/${e}.png` })),
    ...EFFECT.map(e => ({ label: e, kind: "Effect teams", href: `/effect/${slug(e)}`, art: `assets/effects/${e}.png` })),
    ...SPECIAL_EFFECT.map(e => ({ label: e, kind: "Special Effect teams", href: `/special/${slug(e)}`, art: `assets/effects/${e}.png` })),
    ...Object.keys(MEMORY_TABS).map(tab => ({ label: `${tab} memories`, kind: "Memories", href: `/assets/memories/${slug(tab)}`, art: "" })),
    ...[["Constructs", "/constructs"], ["Memories", "/assets/memories"], ["Weapons", "/assets/weapons"], ["Weapon Resonance", "/assets/resonances"], ["C.U.B.s", "/assets/cubs"], ["Contact", "/contact"]]
      .map(([label, href]) => ({ label, kind: "Page", href, art: "" })),
    { label: "Planner", kind: "Tool", href: "/calculator", art: `${CALC_ART}/black-card.png` },
    { label: "Meta Timeline", kind: "Tool", href: "/timeline", art: classIcon("Attacker") },
    { label: "Team Builder", kind: "Tool", href: "/editor", art: "" },
    ...Object.entries(PAGES).flatMap(([path, ids]) => ids.flatMap(id => (COMPS[id].variants || [{ id, name: COMPS[id].name }]).map(v =>
      ({ label: v.name, kind: `Team · ${COMPS[id].name}`, href: buildHref(path, v.id), art: "" }))))
  ];
  return searchItems = items.map(item => ({ ...item, text: plain(item.label), more: plain(item.kind).replace(/\./g, "") }));
}
function searchFor(query) {
  const q = plain(query.trim());
  // The closer the name is to what was typed, the higher it goes: the whole name, its start, the start of a word, any part of it, then the description
  const closeness = item => item.text === q ? 0 : item.text.startsWith(q) ? 1 : item.text.split(/[^a-z0-9]+/).some(word => word.startsWith(q)) ? 2 : item.text.includes(q) ? 3 : item.more.includes(q) ? 4 : 9;
  // Teams come after the rest: most have a character's name, and would push out that character's weapon and C.U.B.
  const score = item => {
    const close = closeness(item);
    return close && close < 9 && item.more.startsWith("team") ? close + 3 : close;
  };
  return searchData().map(item => [score(item), item]).filter(([s]) => s < 9).sort((a, b) => a[0] - b[0] || a[1].text.length - b[1].text.length).slice(0, 8).map(([, item]) => item);
}
const searchBox = $("#searchBox"), searchResults = $("#searchResults");
function showSearch() {
  const query = searchBox.value.trim();
  searchResults.hidden = !query;
  if (!query) return;
  const found = searchFor(query);
  searchResults.innerHTML = found.map(item => `<a class="sr" href="${esc(item.href)}">${item.art ? pic(item.art) : `<i class="sr-art"></i>`}<span><b>${esc(item.label)}</b><small>${esc(item.kind)}</small></span></a>`).join("")
    || `<p class="sr-none">No results.</p>`;
}
function clearSearch() {
  searchBox.value = "";
  showSearch();
}
searchBox.addEventListener("input", showSearch);
searchBox.addEventListener("keydown", e => {
  if (e.key === "Escape") clearSearch();
  if (e.key === "Enter") $("a", searchResults)?.click();
  if (e.key === "ArrowDown") { e.preventDefault(); $("a", searchResults)?.focus(); }
});
searchResults.addEventListener("keydown", e => {
  const link = e.target.closest("a");
  if (e.key === "Escape") { clearSearch(); searchBox.focus(); }
  if (e.key === "ArrowDown") { e.preventDefault(); link.nextElementSibling?.focus(); }
  if (e.key === "ArrowUp") { e.preventDefault(); (link.previousElementSibling || searchBox).focus(); }
});
addEventListener("pagechange", clearSearch);
// Removes the notice from a page left open past the date
if (noticeTimeLeft() > 0) setTimeout(() => document.querySelectorAll(".notice").forEach(el => el.remove()), noticeTimeLeft());
dropOldHash();
pageUrl = location.href;
route();
loadCommunity();
