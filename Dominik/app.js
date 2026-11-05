/* =====================================================
   DATA - to add a new composition:
   1) copy an object in COMPS and change its data
   2) add its id to the page's "comps" list in PAGES
   A composition holds either "cards", or "variants" ([{ id, name, cards }]): with variants,
   clicking the composition reveals them and the build shows once one is picked.
   Images (optional): put them in /assets and use the path,
   e.g. portrait:"assets/rosetta.png". No image = empty slot.
   Extra fields: symbol (class icon), weapon, wh (Weapon Harmony memory name, framed in
   WH_FRAME), memories (6), matrix (3 weapon resonances),
   resonance + core (the two "6x" icons), construct (CUB), skills (6 CUB skills),
   rank (badge on the portrait).
   ===================================================== */
const CHARS = "assets/characters", MEM = "assets/memories", RES = "assets/resonances";
const WEAPON_RES = n => `${RES}/Ressonância de Arma - ${n} HD.png`;
const ALL_ATK = `${RES}/Ressonância - ALL ATK.png`;
// Memory sets, in the tabs and order of the game's Select Memory Set screen, plus Nihil and Uniframe.
// Each tab is a folder in assets/memories, and files are named "Memória - <name> <1-4|2-5|3-6|WH>.<ext>".
// Entry: [name, boost, art extension]. No extension = no art yet: its Assets card shows empty slots
// and a build shows its name instead. When the art arrives, just add the extension here.
const MEMORY_TABS = {
  Common: [["Frederick", "Dodge Boost"], ["Cottie", "Signature Move Boost", "png"], ["Hanna", "3-Ping Boost", "png"],
    ["Darwin", "Orb Skill Boost", "png"], ["Condelina", "Basic Attack Boost"]],
  Support: [["Guinevere", "Support Boost II", "png"], ["Philip II", "Support Boost I", "png"], ["Einsteina", "Survival Boost II", "png"],
    ["Catherine", "Survival Boost I", "png"], ["Da Vinci", "QTE Boost", "png"]],
  Effect: [["Clusius", "Ignition Boost"], ["Bunsen", "Ultima Slash Boost"], ["Poincare", "Darkflow Boost"],
    ["Klenova", "Glaciation Boost", "png"], ["Wilde", "Plasma Beam Boost", "png"]],
  Physical: [["Santiago", "Physical Boost", "webp"], ["Keats", "Physical Boost", "png"], ["Burana", "Physical Boost", "png"],
    ["Chang Wuzi", "Physical Boost", "png"], ["Signa", "Physical Boost"], ["Charlotte", "Physical Boost"],
    ["Leeuwenhoek", "Physical Support Boost"], ["Patton", "Physical Boost", "png"]],
  Fire: [["Feynman", "Fire Boost", "webp"], ["Hervor", "Fire Boost", "png"], ["Heraclitus", "Fire Boost", "png"],
    ["Alphonse", "Fire Boost", "png"], ["Turing", "Fire Boost", "png"], ["Unimate", "Fire Boost"],
    ["Elizabeth", "Fire Boost"], ["Shakespeare", "Fire Boost", "png"]],
  Ice: [["Pavlichenko", "Ice Boost", "webp"], ["Joanna", "Ice Boost", "png"], ["Liston", "Ice Boost", "png"],
    ["Ji Bo'an", "Ice Boost", "png"], ["Aline", "Ice Boost"], ["Chen Jiyuan", "Ice Boost", "png"], ["Mousme", "Ice Boost"]],
  Lightning: [["Cogito", "Lightning Boost", "webp"], ["Natasha", "Lightning Boost", "png"], ["Herschell", "Lightning Boost", "png"],
    ["Fran", "Lightning Boost", "png"], ["Diesel", "Lightning Boost"], ["Tifa", "Lightning Boost"], ["Heisen", "Lightning Boost", "png"]],
  Dark: [["Pesanteur", "Dark Boost", "webp"], ["Nimue", "Dark Boost", "png"], ["Jeanne", "Dark Boost", "png"],
    ["Barcelo", "Dark Boost", "png"], ["Derketo", "Dark Boost", "webp"], ["Boone", "Dark Boost", "png"],
    ["Seraphine", "Dark Boost"], ["Flamel", "ATK Boost"], ["Bathlon", "Dark Boost", "png"]],
  Nihil: [["Bulgakov", "Nihil Boost", "webp"], ["Sothoth", "Nihil Boost", "png"], ["Cleopatra", "Nihil Boost", "png"]],
  Uniframe: [["Liliana", "ATK Boost"], ["Shelley", "Lightning Boost"], ["Isabel", "Ice Boost"], ["Marco", "Physical Boost"],
    ["Jack", "Fire Boost"], ["Lucrezia", "Lightning Boost"], ["Wu'an", "ATK Boost"], ["Koya", "ATK Boost"]]
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
const PAVLICHENKO = memSet("Pavlichenko");
const JOANNA = memSet("Joanna");
const MOUSME = memSet("Mousme");

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
  name: "Teddy: Spectre", symbol: classIcon("Amplifier"), portrait: `${TEDDY}/Awaken - Teddy Spectre.png`,
  weapon: `${TEDDY}/Arma - Teddy Spectre.png`, matrix: matrix(SAR, GS, INC),
  resonance: ALL_ATK, core: `${TEDDY}/Skill - Signature HD.png`, construct: `${TEDDY}/CUB - Beep-Boop.png`,
  // Order as in the reference image: slot 5 is Teddy's Skill 6, slot 6 is Bianca's Skill 6
  skills: [...cubSkills(TEDDY).slice(0, 4), `${TEDDY}/CUB - Skill 6.png`, `${CHARS}/bianca-crepuscule/CUB - Skill 6.png`]
};
// No weapon or Signature art yet; Wanshi's CUB is a placeholder until Leia's is added
const LEIA_KIT = {
  name: "Leia: Fortunaster", symbol: classIcon("Breaker"), portrait: `${LEIA}/Awaken - Leia Fortunaster.png`,
  matrix: matrix(DD, GA, ML), resonance: ALL_ATK, construct: `${WANSHI}/CUB - Snowveil.png`, skills: cubSkills(WANSHI)
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

const VERA_DESC = "Standard DPS build for Vera-chan. When below SSS, Hervor is needed to do 2 Signatures without using DLT and also not affecting other members' CUBs by making one of them use Lingya and weakening them. You have many options of secondary memories to use here, if at SS/SS3, and more memory options if at SSS. If your Kamui is using Shakespeare, you can opt on switching it to Cottie here for the Extra DMG, that will work since she enters her passive through her first signature, or even to Guinevere if you want to buff Kamui even more. If SSS, you can even use both or put Shakespeare + Cottie for a even high damage output of hers. Many things are possible with Vera-chan, since she doesn't need her signature memories to shine brightly.";
const KAMUI_DESC = "Things have changed. Something on Kamui wasn't supposed to happen, according to Kuro, which being that his signature energy shouldn't be easily recovered through this yellow orb, and now, after a hotfix... He does need Cottie to run smoothly with 2 Signatures when below SS3. Since he does a bunch of damage outside the Signature before entering on it and uses a bunch of 3-ping, Darwin as 2x is also recommended for the maximum output possible. 4x Cottie also works in WZ, but not much in PPC. Now, he is more similar to Rosetta; needs Cottie on lower ranks, but does everything smoothly with it, and without DLT.";
const LUCIA_IC_DESC = "Standard DPS build for Alpha: Inverse Crown. Well... Cottie on her is useless, and not because she generates too much energy, and yes because her energy ain't the same as almost everyone in the game, and yes kind of \"personal-signature-energy-type\", called \"Malison\", that is generated through her own skills only. If you want more energy, only at SS3, which is very saddening. All the rest, she just works. Since Cottie is useless, you can even consider other memories, even Da Vinci.";
const VERONICA_DESC ="Support-DPS build for Veronica. Will serve as great intermediary between Selena's annoying noise system, or as Karenina and Hanying's sidekick. With everyone below SSS and with Selena, she can do her long damage output and you'll reach the timing to switch to Karenina right on time.";
const KARENINA_DESC = "Build for every Physical necessity for Karenina. She already generates a lot of energy from her skills, so Cottie won't be needed, except for very specific moments, or if you wish to stay a long time with her on the field, or want to spam signatures on SS3 and above.";
const ROSETTA_DESC ="Unfortunally, Cottie is needed for smooth damage loops at lower ranks. Rosetta won't need DLT at SS0 if you do a single Signature on her first damage loop and then switch the next character. After this, she will be able to do 2 Signatures in a row for a bunch of time until the WZ timer runs out. At SS3 and above, DLT is not needed anymore.";
const ADELYDE_DESC = "Basically the same as Alpha Inverse Crown on one aspect: Cottie doesn't work on her, and not because she grants too much energy, and yes because her skills grants \"Anabasis points\" that are used as signature energy instead of the common signature energy, making the buffs of Cottie useless, and you can only increase her speed by evolving her rank to SS3 and SSS0. She's free, but still an annoying aspect, specially for players with low vouchers and the future players who won't get the \"Journey of Promise\" copy. On other aspects, she can work with anything alongside her signature memory, without DLT too.";
const ADELYDE_QTE_DESC = `${ADELYDE_DESC} Her SSS skill increases any QTE damage by 50%, so if you want to abuse the Attacker''s SS3 QTE damage, you can opt for Da Vinci instead of Bathlon on Adelyde.`;

// Colors sampled from the reference images; "icon" is the emblem shown between the cards
const FIRE_THEME = { c1: "#f57f80", c2: "#170f0f", cp: "#3a2326", ar: "#fff", icon: "assets/energy type/Fire.png" };
const LIGHTNING_THEME = { c1: "#c3a14e", c2: "#13110b", cp: "#332c19", ar: "#fff", icon: "assets/energy type/Lightning.png" };
const DARK_THEME = { c1: "#b38aff", c2: "#120f17", cp: "#2a2347", ar: "#fff", icon: "assets/energy type/Dark.png" };
const ICE_THEME = { c1: "#2fb4e0", c2: "#07131a", cp: "#0d2c3a", ar: "#fff", emblem: "❄︎", iconName: "Ice" };
const PHYSICAL_THEME = { c1: "#7ff0bc", c2: "#0f1515", cp: "#1e332c", ar: "#fff", icon: "assets/energy type/Physical.png" };

// Shown above any build with this character until the date below (Brasília time)
const NEW_CHARACTER_NOTICE = {
  name: "Leia: Fortunaster", until: "2026-11-12T02:00:00-03:00",
  text: "Leia: Fortunaster is a recent character, so there is little feedback on these builds so far. It's recommended to wait at least 1 week for more information. Take it with a grain of salt."
};

// Both A Comet's Afterglow builds differ only in Leia's memories and Weapon Harmony
const cometTeam = leia => [
  { bar: "blue", role: "captain", ...LEIA_KIT, ...leia, desc: "" },
  { bar: "red", role: "", ...LUCIA_IC_KIT, wh: "Chen Jiyuan", memories: memBuild(PAVLICHENKO, CHEN_JIYUAN), desc: LUCIA_IC_DESC },
  // As requested: 4x Da Vinci + 2x Guinevere, with Guinevere in slots 1 and 3
  { bar: "gold", role: "starter", ...TEDDY_KIT, wh: "Guinevere", memories: [GUINEVERE[0], DA_VINCI[1], GUINEVERE[2], DA_VINCI[0], DA_VINCI[1], DA_VINCI[2]], desc: "" }
];

// A team is named after the patch (Global) of its newest character. Teams of one page that share
// a patch go together as "variants" of that patch; newest patch first in PAGES.
const COMPS = {
  "glaciation": {
    name: "Of Solitude and Stillness", c1: "#2fb4e0", c2: "#07131a", cp: "#0d2c3a", ar: "#8fe8ff", emblem: "✦", iconName: "Glaciation",
    cards: [
      { bar: "blue", role: "captain starter", ...SELENA_KIT, wh: "Klenova", matrix: matrix(DLT, GA, INC),
        desc: "Standard Glaciation build for Selena. If everything is done right, you can land her final Signature during the effect's period with a little time remaining." },
      { bar: "red", name: "Wanshi: Lucid Dreamer", role: "", ...WANSHI_BUILD,
        rank: "assets/rank/SSS.png",
        desc: "Support build. He stacks the effect for everyone; at SSS you can do fast Signatures with him and switch to Helentine with maximum stacks." },
      { bar: "gold", role: "", ...HELENTINE_KIT, wh: "Cottie", memories: memBuild(CHEN_JIYUAN, GUINEVERE),
        desc: "Standard metan (phentamine) build. She needs Wanshi's stacks to start dealing damage, and the effect lasts as long as you have pings and energy." }
    ]
  },
  "comets-afterglow": {
    name: "A Comet's Afterglow", ...ICE_THEME,
    variants: [
      { id: "leia-sub-dps", name: "Spider 2B SS Leia Sub-Dps", cards: cometTeam({ wh: "Chen Jiyuan", memories: memBuild(MOUSME, CHEN_JIYUAN) }) },
      { id: "leia-cottie", name: "Spider 2B SS3 Leia Cottie", cards: cometTeam({ wh: "Einsteina", memories: memBuild(MOUSME, COTTIE) }) }
    ]
  },
  "homecoming-voyage": {
    name: "Homecoming Voyage", ...ICE_THEME,
    variants: [{ id: "ic-ss3", name: "IC SS3", cards: [
      { bar: "blue", name: "Wanshi: Lucid Dreamer", role: "starter", ...WANSHI_BUILD,
        desc: "Support DPS build for Wanshi. Signature energy boost of 2x Cottie is totally useless on him, and 4x Cottie's Extra DMG Bonus doesn't work on him because it requires a Signature Move to activate, and 50% of his damage is outside the Signature. His damage loops steps won't change no matter what memory you use on him, so you can try various memory sets alongside his signature memory for various combos." },
      { bar: "red", role: "captain", ...LUCIA_IC_KIT, wh: "Chen Jiyuan", memories: memBuild(PAVLICHENKO, CHEN_JIYUAN), desc: LUCIA_IC_DESC },
      { bar: "gold", role: "", ...TEDDY_KIT, wh: "Chen Jiyuan", memories: memBuild(JOANNA, CHEN_JIYUAN),
        desc: "Standard DPS build for Teddy. She works well with any memory alongside her signature memory, and she can do everything of her damage loop without any signature energy boost of 2x Cottie as well, so you can try various memories along with it and her damage loop steps won't change at all. By considering the other teammates's memories, Guinevere on here is a good choice too." }
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
        desc: "Watanabe-kun doesn't fear death; death fears Watanabe. This is the build recommended for the sinergy with Vera-chan and Kamui-kun. He will be doing a single signature per entrance, since the other two will take all the time for their damage loops, but whenever the one's damage's steps are over and the other is cooldown, Watanabe-kun will perfectly fill that hole within with a nice damage and a very-very fast damage steps, of less than 4 seconds." },
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
        desc: "She... has to do something... Well, she aged badly, and we seen this coming ever since she released, and here we are. Da Vinci here will be to improve the other teammates while Lucia will be doing a single signature per entrance; she will not be using the shortened signature: Not just because she would need Cottie to do 2 signatures, but also you would just be wasting time that could be used on another character instead of dealing lower damage. Lucia will only use her long signature procedure every time she enters the field, and because of so, DLT is no longer required on her. She will only be handy indeed if at SS3 or above, either for damage in the field or bizarre QTEs of thousands of percentage. If at SS0.... Be patient with her." },
      { bar: "red", role: "", ...VERA_KIT, desc: VERA_DESC },
      { bar: "gold", role: "captain", ...KAMUI_KIT, matrix: matrix(DD, GA, ML), desc: KAMUI_DESC }
    ] }]
  },
  "helentine-liv-nanami": {
    name: "Of Solitude and Stillness", ...LIGHTNING_THEME,
    cards: [
      { bar: "blue", role: "", ...HELENTINE_KIT, wh: "Guinevere", memories: memBuild(HEISEN, GUINEVERE),
        desc: "The meta(nphetamine) memory set of whoever this girl is from Alpha's last story and now already has a frame released instead of Trojan or Issarius. Seriously, I really couldn't test her as much as needed to confirm a good build for her; both because I didn't have the resources and also that I don't care a damn about her; so there we go. Only things I could test was this build, that works well when Nanami is with Da Vinci, and her Signature + Da Vinci when Nanami is using Heisen. These both options worked very well altogether." },
      { bar: "red", role: "captain", ...LIV_KIT, wh: "Heisen", memories: memBuild(NATASHA, HEISEN),
        desc: "Standard build for Liv. She works with Heisen, with Cottie, with Signature memory, anything, and it changes according to your team's composition. If none of your members are using Heisen, place it on her, either along with Cottie or Signature, as you like. Personally, with Nanami with Heisen and Helentine with Da Vinci, the difference of the change between Liv's signature memory to Heisen were close to none, so it's your call" },
      { bar: "gold", role: "starter", ...NANAMI_KIT, wh: "Da Vinci", memories: memBuild(HERSCHELL, DA_VINCI),
        desc: "Nanami didn't require any secondary memory to work properly before, and now with her leap, she unofficially received a \"Breaker\" level upgrade. If your Helentine is already using Da Vinci instead of Guinevere, opt to use Heisen as Nanami's secondary memory, as her field Tank debuff will inflict Heisen's effects constantly." }
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
        desc: "Cottie on her does help on her damage loop, but you'll lose a lot of damage during so, because she will take a while the activate her Signature that will activate the buffs, therefore, it's more worthy using the pings to make her recover energy while not losing the damage; Cottie only has a greater use starting from SSS rank. In a trio rotation where everyone does a single signature, she will not use DLT either." },
      { bar: "red", role: "", ...ADELYDE_KIT,
        desc: ADELYDE_QTE_DESC },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }, { id: "adelyde-lilith-rosetta", name: "Adelyde · Lilith · Rosetta", cards: [
      { bar: "blue", role: "", ...ADELYDE_KIT, matrix: matrix(ML, INC, DLT),
        desc: `${ADELYDE_DESC} If your Lilith is with Amplifier weapon resonances, focus on damage resonances on Adelyde, but if your Lilith don't, put them here.` },
      { bar: "red", role: "starter", ...LILITH_KIT, wh: "Da Vinci",
        memories: memBuild(BARCELO, DA_VINCI),
        matrix: matrix(SAR, GS, ML),
        desc: "Support Sub DPS build for Lilith. If you have a better taste on charact- I mean, you prefer using Lilith over Bianca's weak SS0 perfomance, this is doable set for her with Adelyde if Lilith is SSS0 or beyond, since the Overliker's class skill is quite a clickbait. By carring the main Amplifier weapon resonances, you can focus solely on damage resonances for Adelyde, and speed-wise, is more worthy using 4-stack signatures rather than 5-stack ones on Lilith if you want to share a playtime with everyone." },
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
        construct: `${KURUMI}/CUB - Zakfiel.webp`,
        skills: cubSkills(KURUMI, "webp"),
        desc: "Kurumi already generates a lot of energy only from few skills, even at low rank, so Cottie isn't needed and so is DLT; 2 signatures are doable any rank, but not worthy if Kurumi is below SSS, or if Adelyde is SSS, or if Rosetta is SS3. Anything works on Kurumi. Technically, \"Boone\" memory would be better than Derketo, since it has 2 points of ATK higher than it per memory, but... Derketo will make Kurumi have a round number on BP (7100 BPs, if SS, fully hypertuned and 6-star weapon), and 4 points of ATK isn't much, so... Yeah. Choose your priority." },
      { bar: "red", role: "", ...ADELYDE_KIT,
        desc: ADELYDE_QTE_DESC },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }]
  },
  "hanying-adelyde-rosetta": {
    name: "Anchored in Faith", ...PHYSICAL_THEME, ar: "#7ff0bc", icon: "assets/emblems/Ultima Slash.png",
    cards: [
      { bar: "blue", role: "", ...HANYING_KIT, wh: "Da Vinci", memories: memBuild(CHANG_WUZI, DA_VINCI), matrix: matrix(DD, ML, INC),
        desc: "Support Sub-DPS build for Hanying. Alongside Adelyde, will create the Ultima Slash stacks. 2 signatures for stacking is overkill for Rosetta's effect, only one is enough alongside Adelyde's effect. If both your Hanying and your Rosetta have weapon resonances, focus the Domain Deconstruction on Hanying instead." },
      { bar: "red", role: "", ...ADELYDE_KIT, wh: "Patton", memories: memBuild(PESANTEUR, PATTON),
        desc: "With all the \"Alpha IC\" aspect situation being previously said, Adelyde doesn't change anything on her Ultima Slash perfomance, while being a great stacker by increasing the stacks over time the seconds after casting signature, while dealing a decent Ultima Slash damage and not needing to consume many orbs for stacking, unlike Hanying. Since Cottie doesn't work, Patton is best choice for the Ultima Slash occasion." },
      { bar: "gold", role: "captain starter", ...ROSETTA_KIT, matrix: matrix(GA, ML, INC),
        desc: "As the starter, Rosetta will have a bunch of pings saved for rest of the round after you return to her, and with Adelyde's entrance, not making DLT necessary anymore. If your Hanying is with Domain Deconstruction, focus your Rosetta on the damage resonances above, if otherwise, put D.D. back. In my own tests, it was better using the same Grayscale Link colors on her first signature after entrance, and then different Grayscale Link colors for her second signature before leaving the field; the damage was better shared this way, and for 2 signatures, 4x Cottie worked better than 2x Cottie and WH Darwin, for same reason: Better distribution." }
    ]
  },
  "kamui-lilith-nanami": {
    name: "The Dying Sun", ...LIGHTNING_THEME, ar: "#ffe98a", icon: "assets/emblems/Plasma Beam.png",
    cards: [
      { bar: "blue", role: "captain", ...KAMUI_KIT, matrix: matrix(GA, ML, INC),
        desc: "DPS build that speeds up his damage steps, previously mentioned in the observations of the Fire team. In here, will be needed because of the speedrun against the short time given by the Plasma Beam status. With this, will be enough to do 2 full signatures and also using his strong basic attacks. The rotation you'll use will be with 3-pings and tapped yellow orb for the first signature and holding yellow orb for the second one. By doing this, he will be able do all the damage he can do within the time, and still leave around a second or so remaining until the effect runs out. If your Nanami doesn't have a weapon resonance to hold Domain Deconstruction but you do for Kamui-kun, then his first weapon resonance should be DD instead, later Glorious Afterglow and then Matrix Lightning." },
      { bar: "red", role: "", ...LILITH_KIT, wh: "Guinevere",
        // As in the reference image: 4x Da Vinci + 2x Guinevere, with Guinevere in slots 1 and 3
        memories: [GUINEVERE[0], DA_VINCI[1], GUINEVERE[2], DA_VINCI[0], DA_VINCI[1], DA_VINCI[2]],
        matrix: matrix(SAR, GS, INC),
        desc: "Support build for the Plasma Beam effect. She'll do nothing but activate the effect all by herself to then Kamui deal his damage in the time given, and she doesn't need any memories to do so, then, support memories are the good choice here, to buff everyone that will have more active time in the field than her." },
      { bar: "gold", role: "starter", ...NANAMI_KIT, wh: "Heisen", memories: memBuild(HERSCHELL, HEISEN),
        desc: "The DPS build that works for Nanami in all cases you need. The same build for Lightning too, when she released, and will work perfectly in here again another time. She will deal a good Lightning damage; without having the worry with the timer effect; will also buff the other teammates with Heisen, and also will fulfill the time hole between Lilith and Kamui. We won't see Nanami outside this effect for a long time." }
    ]
  },
  "steering-physical": {
    name: "Steering by Light", ...PHYSICAL_THEME,
    variants: [{ id: "selena-veronica-karenina", name: "Selena · Veronica · Karenina", cards: [
      { bar: "blue", role: "", ...SELENA_KIT, wh: "Cottie", matrix: matrix(GA, INC, DLT),
        desc: "After needing a second-hand leap that added her another damn Za Warudo, Selena has some use for the Physical team if your Hanying isn't in a rank higher than your Karenina. Since she needs to enter her passive that is considered as 1st Signature, Cottie's DMG Boost will work better." },
      { bar: "red", role: "starter", ...VERONICA_KIT, desc: VERONICA_DESC },
      { bar: "gold", role: "captain", ...KARENINA_KIT, desc: KARENINA_DESC }
    ] }, { id: "hanying-veronica-karenina", name: "Hanying · Veronica · Karenina", cards: [
      { bar: "blue", role: "", ...HANYING_KIT, wh: "Patton", memories: memBuild(CHANG_WUZI, PATTON), matrix: matrix(DD, DLT, INC),
        desc: "Now, if your Hanying is a rank higher than your Karenina, then you can consider her instead of Selena; tank's debuffs are way too strong, even if it is just 10%. After her leap, anything works for her alongside her Signature memory. If both your Hanying and your Karenina has a weapon resonance, priorize the Domain Deconstruction on Hanying and place a damage-focused resonance on Karenina; will be more worth it." },
      { bar: "red", role: "starter", ...VERONICA_KIT, desc: VERONICA_DESC },
      { bar: "gold", role: "captain", ...KARENINA_KIT, desc: KARENINA_DESC }
    ] }]
  },
  "liv-vera-karenina": {
    name: "Steering by Light", ...DARK_THEME, ar: "#e6e0ff", icon: "assets/emblems/Darkflow.png",
    cards: [
      { bar: "blue", role: "starter", ...LIV_KIT, wh: "Bathlon", memories: memBuild(COTTIE, BATHLON),
        desc: "Darkflow set for Liv. Starter, because she's the only of the trio that consumes stacks, while the other ones only either increase or don't use any stacks. Core Passive as memory skill if below SSS" },
      { bar: "red", role: "", ...VERA_KIT, wh: "Guinevere", memories: memBuild(DA_VINCI, GUINEVERE),
        desc: "Build solely focused on support for Vera-chan. She'll solely stack the Darkflow effect for the others, and as so, a single Signature will do everything and her Signature memory will only add unnecessary orbs for this. Thanks to her core passive, she'll do a decent damage whenever your charge her power through her QTEs." },
      { bar: "gold", role: "captain", ...KARENINA_KIT, wh: "Bathlon", memories: memBuild(SANTIAGO, BATHLON),
        desc: "Almost the same thing of her Physical build, just changing the Physical memory to Dark's, Bathlon. Nothing else changes for her, same functionality." }
    ]
  },
  "homecoming-ignition": {
    name: "Homecoming Voyage", ...FIRE_THEME, ar: "#ffcdcd", icon: "assets/emblems/Ignition.png",
    cards: [
      { bar: "blue", role: "captain", ...LUCIA_IC_KIT, wh: "Shakespeare", memories: memBuild(PAVLICHENKO, SHAKESPEARE), desc: LUCIA_IC_DESC },
      { bar: "red", role: "starter", ...VERONICA_KIT, wh: "Shakespeare", memories: memBuild(KEATS, SHAKESPEARE),
        desc: "Standard DPS build of Ignition for Veronica. If you desire, you can change the 4x Shakespeare for a 4x Guinevere set to buff everyone, it also works. A combo of 4x Cottie and 4x Shakespeare by removing Keats, is also a usable set. Almost anything works on her, she doesn't have any energy dependencies that would make her need Cottie." },
      { bar: "gold", role: "", ...NANAMI_KIT, wh: "Da Vinci", memories: memBuild(HERSCHELL, DA_VINCI),
        desc: "Standard DPS build of Ignition for Nanami. If playing solo, DLT and Cottie will be needed for her sustainability. On team, Da Vinci is a greater call. She works with any memory set along with her signature, so you can change according to your team's memories." }
    ]
  }
};

const ENERGY =["Fire", "Lightning", "Ice", "Physical", "Dark", "Nihil"];
const EFFECT = ["Ignition", "Plasma Beam", "Glaciation", "Ultima Slash", "Darkflow"];
// Home tile colors: each effect shares the color of its energy type
const TILE_COLOR = {
  "Fire": "#ff6a5e", "Lightning": "#e6bd52", "Ice": "#3fc1ff", "Physical": "#5fdca6", "Dark": "#b38aff", "Nihil": "#a9bccf",
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
  "effect/ignition": ["homecoming-ignition"],
  "effect/plasma-beam": ["kamui-lilith-nanami"],
  "effect/glaciation": ["glaciation"],
  "effect/ultima-slash": ["hanying-adelyde-rosetta"],
  "effect/darkflow": ["liv-vera-karenina"]
};

const $ = (s, r = document) => r.querySelector(s);
const slug = s => s.toLowerCase().replace(/\s+/g, "-");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// Name shown when hovering an icon, read from its file name ("Memória - Cottie 1-4.png" is "Cottie")
function iconName(src = "") {
  const file = src.split("/").pop().replace(/\.\w+$/, "");
  if (file === "Tanque") return "Tank";
  if (file === "Skill - Orb Vermelho") return "Red Orb";
  if (file === "Ressonância - ALL ATK") return "Any ATK";
  if (file === "Classe - Adelyde Anabasis") return "Overlinker";
  if (file.startsWith("Skill - Signature")) return "Signature";
  if (file.startsWith("Skill - Core")) return "Core Passive";
  const name = file.replace(/^(Memória|Ressonância de Arma|Ressonância|CUB) - /, "").replace(/ (HD|1-4|2-5|3-6)$/, "");
  const skill = name.match(/^Skill (\d)$/);
  return skill ? cubSkill(src, skill[1])?.[0] || `CUB ${name}` : name;
}
const cubSkill = (src, n) => CUB_SKILLS[src.split("/").at(-2)]?.[n - 1];
const memoryInfo = name => `2 pcs: ${MEMORY_EFFECTS[name][0]}\n\n4 pcs: ${MEMORY_EFFECTS[name][1]}`;
// What an icon does, when known: shown under its name
function iconInfo(src = "") {
  const memory = src.match(/Memória - (.+) (?:1-4|2-5|3-6)\.\w+$/)?.[1], skill = src.match(/CUB - Skill (\d)\.\w+$/)?.[1];
  if (memory) return memoryInfo(memory);
  if (skill) return cubSkill(src, skill)?.[1] || "";
  return RESONANCE_EFFECTS[iconName(src)] || "";
}
const tipAttr = (name, info) => (name ? ` data-tip="${esc(name)}"` : "") + (name && info ? ` data-info="${esc(info)}"` : "");
// Assets detail pages: #/assets/memory/<id> and #/assets/weapon/<id>
const linkId = s => slug(s).replace(/[^a-z0-9-]/g, "");
const memoryHref = name => `#/assets/memory/${linkId(name)}`;
const weaponHref = name => `#/assets/weapon/${linkId(name)}`;
// With href, the slot is a link. With a tip but no image, it shows that name in place of the art
const slot = (src, label = "", overlay = "", tip = iconName(src), href = "", info = iconInfo(src)) => {
  const tag = href ? "a" : "div", named = !src && tip;
  return `<${tag} class="slot${named ? " named" : ""}"${href ? ` href="${esc(href)}"` : ""}${tipAttr(tip, info)}>${src ? `<img src="${esc(src)}" alt="">` : esc(label)}${src || named ? overlay : ""}</${tag}>`;
};
const STARS = `<img class="stars" src="assets/overlay/256px-UI-Supply-6Star.png" alt="6 stars">`;
const numbered = (src, i) => `<div class="cell">${slot(src)}<span>${i}</span></div>`;
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
const menuIcon = (dir, e) => `<img src="assets/${dir}/${e}.png" alt=""${ICON_FIT[e] ? ` style="transform:${ICON_FIT[e]}"` : ""}>`;
const group = (label, key, arr, iconDir) =>
  `<button class="sub" data-grp="${key}" aria-expanded="false">${label} <i>▾</i></button>` +
  `<div class="subList" data-list="${key}" hidden>${arr.map(e => `<a href="#/${key}/${slug(e)}">${menuIcon(iconDir, e)}${e}</a>`).join("")}</div>`;
menu.innerHTML = group("Energy Type", "energy", ENERGY, "energy type") + group("Effect", "effect", EFFECT, "effects");
function toggle(open, b = btn, m = menu) {
  b.setAttribute("aria-expanded", open);
  m.hidden = !open;
}
function openGroup(key, open) {
  const b = $(`[data-grp="${key}"]`);
  b.setAttribute("aria-expanded", open);
  $(`[data-list="${key}"]`).hidden = !open;
}
// Phones: the side panel is a top bar and its menu opens with the ☰ button
const menuBtn = $("#menuBtn");
function setNav(open) {
  $("#side").classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.onclick = () => setNav(!$("#side").classList.contains("open"));
$("#sideNav").addEventListener("click", e => { if (e.target.closest("a")) setNav(false); });
btn.onclick = () => toggle(menu.hidden);
assetsBtn.onclick = () => toggle(assetsMenu.hidden, assetsBtn, assetsMenu);
menu.onclick = e => {
  const b = e.target.closest(".sub");
  if (b) openGroup(b.dataset.grp, b.getAttribute("aria-expanded") !== "true");
};

/* ---------- cards ---------- */
function weaponArt(c) {
  if (!c.wh) return slot("", "");
  const [x, y, zoom] = WH_FRAME[c.wh] || [50, 50, 1];
  return `<a class="slot" href="${esc(memoryHref(c.wh))}"${tipAttr(c.wh)}><img src="${esc(memFile(c.wh, "WH", "png"))}" alt="" style="transform-origin:${x}% ${y}%;transform:scale(${zoom})"></a>`;
}
function card(c) {
  const [, weapon = "", , , weaponEffect = ""] = WEAPONS.find(w => w[0] === c.name) || [];
  const memory = (piece, i) => {
    if (!piece) return slot("", i + 1);
    const art = piece.startsWith("assets/") ? piece : "", name = art ? iconName(art) : piece;
    return slot(art, name, `<span class="n">${i + 1}</span>`, name, memoryHref(name), memoryInfo(name));
  };
  const tags = c.role.split(" ").filter(Boolean).map(t => `<span class="tag ${t}">${t.toUpperCase()}</span>`).join("");
  return `<article class="card c-${c.bar}" tabindex="0" role="button" aria-label="Expand ${esc(c.name)}">
    <h3>${esc(c.name)}</h3>
    <div class="top"><div class="sym slot"${tipAttr(c.symbol && iconName(c.symbol))}>${c.symbol ? `<img src="${esc(c.symbol)}" alt="">` : "icon"}</div>
      <div class="pwrap"><div class="portrait slot"${tipAttr(c.portrait && c.name)}>${c.portrait ? `<img src="${esc(c.portrait)}" alt="${esc(c.name)}">` : "portrait"}</div>${c.rank ? `<img class="rank" src="${esc(c.rank)}" alt="rank"${tipAttr(iconName(c.rank))}>` : ""}</div></div>
    <div class="box">
      <div class="mem">${n(6, i => memory((c.memories || [])[i], i)).join("")}</div>
      <div class="wp">${slot(c.weapon, weapon || "weapon", STARS, weapon, weapon && weaponHref(weapon), weaponEffect)}${weaponArt(c)}</div>
      <div class="mxw">
        <div class="mx">${n(3, i => numbered((c.matrix || [])[i], i + 1)).join("")}</div>
        <div class="res"><span>6×</span>${slot(c.resonance, "")}<span>6×</span>${slot(c.core, "")}</div>
      </div>
    </div>
    <div class="box kit">${slot(c.construct, "construct", STARS)}${n(6, i => numbered((c.skills || [])[i], i + 1)).join("")}</div>
    <p class="desc">${esc(c.desc)}</p>
    <div class="tags">${tags}</div>
  </article>`;
}
function comp(id, cards = COMPS[id].cards) {
  const c = COMPS[id];
  return `<section class="comp" style="--c1:${c.c1};--c2:${c.c2};--cp:${c.cp};--ar:${c.ar}">` +
    cards.map(card).join(`<div class="arrow" aria-hidden="true"${tipAttr(c.iconName || (c.icon && iconName(c.icon)))}>${c.icon ? `<img src="${esc(c.icon)}" alt="">` : c.emblem}</div>`) + `</section>`;
}

/* ---------- focus view: enlarged card in the center, the others behind it ---------- */
const FOCUS_MS = 500; // keep in sync with the .fcard transition in style.css
let view = null;
const place = (el, x, y, s) => { el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) scale(${s})`; };
function toOrigin(v) {
  const { clientWidth: w, clientHeight: h } = v.stage;
  v.clones.forEach((el, i) => {
    const r = v.sources[i].getBoundingClientRect();
    place(el, r.left + r.width / 2 - w / 2, r.top + r.height / 2 - h / 2, 1);
  });
}
function layout() {
  const { stage, clones, active } = view, count = clones.length;
  const w = stage.clientWidth, h = stage.clientHeight, cw = clones[0].offsetWidth, ch = clones[0].offsetHeight;
  const big = Math.min(1.35, (h - 70) / ch, (w - 32) / cw), small = big * .68;
  const spread = Math.min((cw * big + cw * small) / 2 - cw * small * .25, w / 2 - cw * small * .2);
  clones.forEach((el, i) => {
    const d = (i - active + count) % count, pos = d <= count / 2 ? d : d - count, side = pos !== 0;
    place(el, pos * spread, 0, side ? small : big);
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
// Phones stack the cards at full width, so there is nothing to enlarge
const stacked = matchMedia("(max-width:760px),(hover:none) and (max-height:500px)");
function openFocus(src) {
  if (stacked.matches) return;
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
    <button class="ctl next" aria-label="Next character">›</button>`;
  const clones = sources.map(s => {
    const r = s.getBoundingClientRect(), c = s.cloneNode(true);
    c.classList.add("fcard");
    c.dataset.name = $("h3", c).textContent;
    const w = Math.round(r.width / 2) * 2, h = Math.round(r.height / 2) * 2; // even sizes keep the center on a whole pixel
    c.style.cssText = `width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px`;
    return c;
  });
  stage.append(...clones);
  document.body.append(stage);
  view = { stage, clones, sources, comp, src, active: sources.indexOf(src) };
  stage.onclick = e => {
    if (e.target.closest(".close")) return closeFocus();
    if (e.target.closest(".prev")) return go(-1);
    if (e.target.closest(".next")) return go(1);
    const c = e.target.closest(".fcard");
    if (!c) return closeFocus();
    if (c.classList.contains("side")) { e.preventDefault(); view.active = clones.indexOf(c); layout(); }
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
  const finish = () => { v.stage.remove(); v.comp.classList.remove("focused"); };
  if (instant) return finish();
  v.src.focus({ preventScroll: true });
  v.stage.classList.remove("open");
  v.stage.classList.add("closing");
  v.clones.forEach(c => c.classList.remove("side"));
  toOrigin(v);
  setTimeout(finish, matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : FOCUS_MS);
}
$("#main").addEventListener("click", e => {
  setNav(false);
  const c = e.target.closest(".comp .card");
  if (c && !e.target.closest("a")) openFocus(c);
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

/* ---------- pages ---------- */
// Every character with a build, read from PAGES and COMPS, so a new team joins the conveyor by itself.
// Each one links to its first team on an Energy Type page (or an Effect page if it has no other).
function heroChars() {
  const found = new Map();
  const pages = Object.entries(PAGES).sort(([a], [b]) => b.startsWith("energy") - a.startsWith("energy"));
  for (const [path, ids] of pages) for (const id of ids) {
    const { cards, variants } = COMPS[id];
    for (const t of variants || [{ id, cards }]) for (const c of t.cards) {
      if (c.portrait && !found.has(c.name)) found.set(c.name, { name: c.name, portrait: c.portrait, href: `#/${path}/${t.id}` });
    }
  }
  const rank = c => { const i = HERO_FIRST.indexOf(c.name); return i < 0 ? HERO_FIRST.length : i; };
  return [...found.values()].sort((a, b) => rank(a) - rank(b));
}
function heroBelt() {
  const chars = heroChars();
  const link = (c, copy) => `<a href="${c.href}"${copy ? ` tabindex="-1" aria-hidden="true"` : ""}>
    <img src="assets/home/${slug(c.name.replace(":", ""))}.jpg" data-full="${esc(c.portrait)}" alt="" loading="lazy" decoding="async">
    <span class="hero-name">${esc(c.name)}</span></a>`;
  // The list runs twice so the loop has no visible seam; the track moves exactly half its width
  // A random negative delay starts the loop at a different point on each visit (5s per character, as in style.css)
  const start = (Math.random() * chars.length * 5).toFixed(1);
  return `<div class="hero-art" role="navigation" aria-label="Characters"><div class="hero-track" style="--n:${chars.length};animation-delay:-${start}s">${chars.map(c => link(c)).join("")}${chars.map(c => link(c, true)).join("")}</div></div>`;
}
function home() {
  const tile = (e, p, iconDir) => {
    const count = (PAGES[`${p}/${slug(e)}`] || []).reduce((sum, id) => sum + (COMPS[id].variants || [0]).length, 0);
    return `<a class="tile${count ? "" : " none"}" style="--c:${TILE_COLOR[e]}" href="#/${p}/${slug(e)}">
      <img class="t-bg" src="assets/${iconDir}/${e}.png" alt="">
      <span class="t-ic">${menuIcon(iconDir, e)}</span>
      <span class="t-tx"><b>${e}</b><small>${count ? `${count} team${count > 1 ? "s" : ""}` : "No teams yet"}</small></span>
    </a>`;
  };
  const tiles = (arr, p, iconDir) => `<div class="tiles">${arr.map(e => tile(e, p, iconDir)).join("")}</div>`;
  return `<section class="hero">
      ${heroBelt()}
      <div class="hero-tx"><h1>Punishing: Gray Raven Builds</h1><p class="sub">Pick a team by energy type or effect.</p></div>
    </section>
    <h2 class="grp">Energy Type</h2>${tiles(ENERGY, "energy", "energy type")}<h2 class="grp">Effect</h2>${tiles(EFFECT, "effect", "effects")}`;
}
// Every page visit opens the newest team (first composition in PAGES, on its first variant) unless
// the link names another. A composition with variants shows its build only while one of its
// variant buttons is pressed, so closing the group clears the choice.
let shown = "", expanded = "", chosen = "";
function pickerHtml(path, sel) {
  const btn = (attr, label, on) => `<button ${attr} aria-pressed="${on}">${label}</button>`;
  return PAGES[path].map(id => {
    const { name, variants } = COMPS[id], open = id === expanded;
    const head = variants ? btn(`data-id="${id}" aria-expanded="${open}"`, `${name} <i>▾</i>`, id === sel)
      : btn(`data-id="${id}"`, name, id === sel);
    const sub = variants && open ? `<div class="psub">${variants.map(v => btn(`data-variant="${v.id}"`, v.name, v.id === chosen)).join("")}</div>` : "";
    return `<div class="pgroup">${head}${sub}</div>`;
  }).join("");
}
const noticeTimeLeft = () => Date.parse(NEW_CHARACTER_NOTICE.until) - Date.now();
const notice = cards => noticeTimeLeft() > 0 && cards.some(c => c.name === NEW_CHARACTER_NOTICE.name) ? `<p class="notice" role="note">${esc(NEW_CHARACTER_NOTICE.text)}</p>` : "";
function compBody(sel) {
  if (!sel) return "";
  const { variants, cards } = COMPS[sel];
  const shownCards = variants ? variants.find(x => x.id === chosen)?.cards : cards;
  return shownCards ? notice(shownCards) + comp(sel, shownCards) : "";
}
function team(path) {
  const [kind, key] = path.split("/");
  const list = (kind === "energy" ? ENERGY : EFFECT).find(e => slug(e) === key);
  if (!list) return `<p class="empty">Page not found.</p>`;
  const ids = PAGES[path] || [];
  const head = `<h1>${list}</h1><p class="sub">${kind === "energy" ? "Energy Type" : "Effect"}</p>`;
  if (!ids.length) return head + `<p class="empty">No compositions yet. Add one in app.js (PAGES).</p>`;
  return head + `<div class="picker" role="group" aria-label="Composition">${pickerHtml(path, shown)}</div><div id="compBox">${compBody(shown)}</div>`;
}

/* ---------- assets pages ---------- */
const thumb = src => `<div class="slot">${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">` : ""}</div>`;
const memoryArt = (name, ext) => (ext ? memSet(name) : ["", "", ""]).map(thumb).join("");
const memoryCard = ([name, boost, ext]) => `<a class="acard" href="${memoryHref(name)}"><div class="mem">${memoryArt(name, ext)}</div><h3>${esc(name)}</h3><p>${esc(boost)}</p></a>`;
const weaponThumb = file => thumb(file && `${CHARS}/${file}`);
const weaponCard = ([owner, name, type, file]) => `<a class="acard wpn" href="${weaponHref(name)}">${weaponThumb(file)}
  <div><h3>${esc(name)}</h3><p>${esc(owner)}</p><p>${esc(type)}</p></div></a>`;
// Top of a detail page. Coming from a team, it also leads back to that exact build
let buildReturn = "";
const backLink = (href, label) => `<div class="backs">${buildReturn ? `<a class="back-build" href="${esc(buildReturn)}">‹ Back to build</a>` : ""}<a class="back" href="${href}">‹ ${label}</a></div>`;
function memoryPage([name, boost, ext]) {
  const [two, four] = MEMORY_EFFECTS[name], { tab } = MEM_INDEX.get(name);
  return `${backLink(`#/assets/memories/${slug(tab)}`, `${tab} memories`)}<h1>${esc(name)}</h1><p class="sub">${esc(boost)}</p>
    <div class="detail"><div class="mem">${memoryArt(name, ext)}</div>
      <div class="fx"><h2>2 pcs</h2><p>${esc(two)}</p><h2>4 pcs</h2><p>${esc(four)}</p></div></div>`;
}
function weaponPage([owner, name, type, file, effect]) {
  return `${backLink("#/assets/weapons", "Weapons")}<h1>${esc(name)}</h1><p class="sub">${esc([type, owner].filter(Boolean).join(" · "))}</p>
    <div class="detail wpn-detail">${weaponThumb(file)}<div class="fx"><h2>Effect</h2><p>${esc(effect)}</p></div></div>`;
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
  if (key === "weapons") return `<h1>Weapons</h1><p class="sub">Assets</p><div class="agrid">${WEAPONS.map(weaponCard).join("")}</div>`;
  if (key !== "memories") return notFound;
  const tabs = ["All", ...Object.keys(MEMORY_TABS)], tab = tabs.find(t => slug(t) === pick);
  if (!tab) return notFound;
  const sets = tab === "All" ? Object.values(MEMORY_TABS).flat() : MEMORY_TABS[tab];
  const links = tabs.map(t => `<a href="#/assets/memories/${slug(t)}"${t === tab ? ` class="on" aria-current="page"` : ""}>${t}</a>`).join("");
  return `<h1>Memories</h1><p class="sub">Assets</p>
    <div class="assets"><div class="atabs" role="navigation" aria-label="Memory type">${links}</div><div class="agrid">${sets.map(memoryCard).join("")}</div></div>`;
}

function theme(id) {
  const m = $("#main"), c = id && COMPS[id];
  m.style.background = c ? `linear-gradient(180deg, ${c.c1}38 0%, ${c.c2}1f 100%), var(--bg)` : "";
}
// Page and composition swaps run through the View Transitions API (styled in style.css);
// browsers without it, or with reduced motion on, just swap instantly.
function swap(update) {
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion:reduce)").matches) document.startViewTransition(update);
  else update();
}
function route() {
  // A link can name a team as a third part: #/energy/dark/kurumi-adelyde-rosetta
  const [kind, key, pick] = location.hash.replace(/^#\/?/, "").split("/");
  const path = key ? `${kind}/${key}` : kind;
  const ids = (key && PAGES[path]) || [];
  const owner = ids.find(id => (COMPS[id].variants || []).some(v => v.id === pick));
  shown = owner || (ids.includes(pick) ? pick : ids[0]) || "";
  const { variants } = COMPS[shown] || {};
  expanded = variants ? shown : "";
  chosen = owner ? pick : variants ? variants[0].id : "";
  const main = $("#main");
  main.innerHTML = kind === "assets" ? assetsPage(key, pick) : path ? team(path) : home();
  theme(null);
  document.querySelectorAll("#side a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#/" + ({ "assets/memory": "assets/memories", "assets/weapon": "assets/weapons" }[path] || path)));
  if (kind === "assets") toggle(true, assetsBtn, assetsMenu);
  else if (path) { toggle(true); openGroup(kind, true); }
  const sel0 = $(".picker button[data-id][aria-pressed=true]");
  if (sel0) theme(sel0.dataset.id);
  const picker = $(".picker");
  if (picker) picker.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    const { variant, id } = b.dataset;
    if (variant) chosen = variant;
    else {
      const grouped = COMPS[id].variants;
      expanded = grouped && expanded !== id ? id : "";
      chosen = "";
    }
    const sel = expanded || (variant || COMPS[id].variants ? "" : id);
    // The address follows the pick, so going back from another page returns to this same build
    const pick = variant || (COMPS[id].variants ? "" : sel);
    history.replaceState(null, "", `#/${path}${pick ? `/${pick}` : ""}`);
    swap(() => {
      picker.innerHTML = pickerHtml(path, sel);
      $("#compBox").innerHTML = compBody(sel);
      theme(sel);
      $(variant ? `[data-variant="${variant}"]` : `[data-id="${id}"]`, picker).focus();
    });
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
  for (const type of ["pointerdown", "scroll", "hashchange"]) addEventListener(type, () => { tip.hidden = true; }, true);
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
    if (!el || el.matches(".portrait") || el.closest(".fcard.side")) return;
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
  addEventListener("hashchange", closeSheet);
}
// Stacked cards: says there are more characters below, until the second card comes into view
const scrollHint = document.createElement("div");
scrollHint.id = "scrollHint";
scrollHint.hidden = true;
scrollHint.textContent = "↓ Scroll down to see the other team members";
document.body.append(scrollHint);
let hintDone = false;
function updateScrollHint() {
  const second = document.querySelectorAll(".comp .card")[1];
  if (second && second.getBoundingClientRect().top < innerHeight - 60) hintDone = true;
  scrollHint.hidden = hintDone || !second || !stacked.matches;
}
new MutationObserver(() => { hintDone = false; updateScrollHint(); }).observe($("#main"), { childList: true, subtree: true });
addEventListener("scroll", updateScrollHint, { passive: true });
addEventListener("resize", updateScrollHint);
// A missing thumbnail falls back to the full art. Handled here because the CSP in _headers blocks inline onerror
addEventListener("error", e => {
  const img = e.target, full = img.dataset?.full;
  if (full) { delete img.dataset.full; img.src = full; }
}, true);
// Every page opens at the top, except when coming back from a detail page to where you were.
// "skill" is here for the skill pages planned for later: they only need to use backLink
const DETAIL_PAGE = /#\/assets\/(memory|weapon|skill)\//;
const scrollSaved = new Map();
history.scrollRestoration = "manual";
addEventListener("hashchange", e => {
  closeFocus(true);
  setNav(false);
  scrollSaved.set(e.oldURL, scrollY);
  const fromDetail = DETAIL_PAGE.test(e.oldURL), fromTeam = /#\/(energy|effect)\//.test(e.oldURL);
  if (fromTeam && DETAIL_PAGE.test(location.href)) buildReturn = new URL(e.oldURL).hash;
  else if (!fromDetail || !DETAIL_PAGE.test(location.href)) buildReturn = "";
  swap(() => { route(); scrollTo(0, fromDetail ? scrollSaved.get(location.href) || 0 : 0); });
});
// Removes the notice from a page left open past the date
if (noticeTimeLeft() > 0) setTimeout(() => document.querySelectorAll(".notice").forEach(el => el.remove()), noticeTimeLeft());
route();
