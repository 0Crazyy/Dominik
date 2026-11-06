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
   rank (badge beside the portrait), rankLevel (the number after it: SS3 is SS with rankLevel 3).
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

const VERA_DESC = "Standard DPS build for Vera-chan. When below SSS, Hervor is needed to do 2 Signatures without using DLT and also not affecting other members' CUBs by making one of them use Lingya and weakening them. You have many options of secondary memories to use here, if at SS/SS3, and more memory options if at SSS. If your Kamui is using Shakespeare, you can opt on switching it to Cottie here for the Extra DMG, that will work since she enters her passive through her first signature, or even to Guinevere if you want to buff Kamui even more. If SSS, you can even use both or put Shakespeare + Cottie for a even high damage output of hers. Many things are possible with Vera-chan, since she doesn't need her signature memories to shine brightly.";
const KAMUI_DESC = "Things have changed. Something on Kamui wasn't supposed to happen, according to Kuro, which being that his signature energy shouldn't be easily recovered through this yellow orb, and now, after a hotfix... He does need Cottie to run smoothly with 2 Signatures when below SS3. Since he does a bunch of damage outside the Signature before entering on it and uses a bunch of 3-ping, Darwin as 2x is also recommended for the maximum output possible. 4x Cottie also works in WZ, but not much in PPC. Now, he is more similar to Rosetta; needs Cottie on lower ranks, but does everything smoothly with it, and without DLT.";
const LUCIA_IC_DESC = "Standard DPS build for Alpha: Inverse Crown. Well... Cottie on her is useless, and not because she generates too much energy, and yes because her energy ain't the same as almost everyone in the game, and yes kind of \"personal-signature-energy-type\", called \"Malison\", that is generated through her own skills only. If you want more energy, only at SS3, which is very saddening. All the rest, she just works. Since Cottie is useless, you can even consider other memories, even Da Vinci.";
const VERONICA_DESC ="Support-DPS build for Veronica. Will serve as great intermediary between Selena's annoying noise system, or as Karenina and Hanying's sidekick. With everyone below SSS and with Selena, she can do her long damage output and you'll reach the timing to switch to Karenina right on time.";
const KARENINA_DESC = "Build for every Physical necessity for Karenina. She already generates a lot of energy from her skills, so Cottie won't be needed, except for very specific moments, or if you wish to stay a long time with her on the field, or want to spam signatures on SS3 and above.";
const ROSETTA_DESC ="Unfortunally, Cottie is needed for smooth damage loops at lower ranks. Rosetta won't need DLT at SS0 if you do a single Signature on her first damage loop and then switch the next character. After this, she will be able to do 2 Signatures in a row for a bunch of time until the WZ timer runs out. At SS3 and above, DLT is not needed anymore.";
const ADELYDE_DESC = "Basically the same as Alpha Inverse Crown on one aspect: Cottie doesn't work on her, and not because she grants too much energy, and yes because her skills grants \"Anabasis points\" that are used as signature energy instead of the common signature energy, making the buffs of Cottie useless, and you can only increase her speed by evolving her rank to SS3 and SSS0. She's free, but still an annoying aspect, specially for players with low vouchers and the future players who won't get the \"Journey of Promise\" copy. On other aspects, she can work with anything alongside her signature memory, without DLT too.";
const ADELYDE_QTE_DESC = `${ADELYDE_DESC} Her SSS skill increases any QTE damage by 50%, so if you want to abuse the Attacker''s SS3 QTE damage, you can opt for Da Vinci instead of Bathlon on Adelyde.`;

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
const RANK_SS = { rank: "assets/rank/SS.png" }, RANK_SS3 = { ...RANK_SS, rankLevel: 3 };
// A Comet's Afterglow teams follow Spider 2B's Leia guide. Leia's build only changes with her rank
const LEIA_SS = { ...RANK_SS, wh: "Chen Jiyuan", memories: memBuild(MOUSME, CHEN_JIYUAN),
  desc: "Without Weapon Harmony, use 2 Einsteina instead of 2 Chen Jiyuan. Breaker class skill also works on the bottom resonance." };
const LEIA_SS3 = { ...RANK_SS3, wh: "Einsteina", memories: memBuild(MOUSME, COTTIE),
  desc: "Breaker class skill also works on the bottom resonance." };
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
    desc: "Without Weapon Harmony, he still runs 2 Liston.", rotation: rotation.wanshi },
  { bar: "red", role: "captain", ...LEIA_KIT, ...leia, rotation: rotation.leia },
  { bar: "gold", role: "", ...TEDDY_CLASS, wh: "Guinevere", memories: memBuild(JOANNA, GUINEVERE),
    desc: "Sub DPS build. Signature on the bottom resonance also works, or half of each.", rotation: rotation.teddy }
];
const cometGlaciation = (helentine, leia, rotation) => [
  { bar: "blue", role: "captain", ...HELENTINE_KIT, memories: memBuild(CHEN_JIYUAN, COTTIE), ...helentine, rotation: rotation.helentine },
  { bar: "red", role: "", ...LEIA_KIT, ...leia, rotation: rotation.leia },
  { bar: "gold", role: "starter", ...TEDDY_SUPPORT, rotation: rotation.teddy,
    desc: "Alisa: Echo can take this spot with the same build. Wanshi on 4 Liston + 4 Da Vinci also works, but a little worse. Selena on 4 Burana + 4 Da Vinci works too." }
];

// A team is named after the patch (Global) of its newest character. Teams of one page that share
// a patch go together as "variants" of that patch; newest patch first in PAGES.
const COMPS = {
  "glaciation": {
    name: "Of Solitude and Stillness", c1: "#2fb4e0", c2: "#07131a", cp: "#0d2c3a",
    cards: [
      { bar: "blue", role: "captain starter", ...SELENA_KIT, wh: "Klenova", matrix: matrix(DLT, GA, INC),
        desc: "Standard Glaciation build for Selena. If everything is done right, you can land her final Signature during the effect's period with a little time remaining." },
      { bar: "red", name: "Wanshi: Lucid Dreamer", role: "", ...WANSHI_BUILD,
        desc: "Support build. He stacks the effect for everyone; at SSS you can do fast Signatures with him and switch to Helentine with maximum stacks." },
      { bar: "gold", role: "", ...HELENTINE_KIT, wh: "Cottie", memories: memBuild(CHEN_JIYUAN, GUINEVERE),
        desc: "Standard metan (phentamine) build. She needs Wanshi's stacks to start dealing damage, and the effect lasts as long as you have pings and energy." }
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
          desc: "Main DPS for Pain Cage. Without Weapon Harmony, she still runs 2 Cottie." },
        { bar: "gold", role: "starter", ...TEDDY_CLASS, wh: "Guinevere", memories: memBuild(CHEN_JIYUAN, GUINEVERE), desc: "" }
      ] }
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
        desc: "Luna unfortunally needs Cotties to smoothly all the time, but after her leap, DLT isn't required anymore for the basics. \"The\" set for all Nihil occassions, nothing much to change." },
      { bar: "red", role: "starter", ...ROSETTA_KIT, wh: "Bathlon", memories: memBuild(rotated(NIMUE), BATHLON), matrix: matrix(DD, ML, GA),
        resonance: `${ROSETTA}/Skill - Ataque Básico.webp`,
        desc: "Designed specifically for Nihil team, doing a single signature per entrance. If SS3≥, you'll have to play with her as you were with SS0 instead. Awkward? Yeah, but every help is welcome. Rosetta will deal some damage, and in extra of having Bathlon, will debuff the enemies along with Luna's class skill effect, instead of using Cottie that will benefit only herself. A great harmony considering the lack of Israe- I mean, Ishmael." },
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
        desc: "Uhh... Odd character. In certain cases, we would have put the elemental memory in here since another character is using Cottie, but Nihil doesn't have a single elemental memory, like Shakespeare, Bathlon, etc. So... If you want to buff the other teammates, use Guinevere or Da Vinci, based on your team's composition. If you're lacking Luna and/or Israe- I mean, Ishmael, Cottie can be considered on her too. She can only do 2 Signatures normally if she's at SSS. I personally don't know if DLT is also needed for that on SSS, but on SS3, DLT wasn't enough." }
    ] }]
  },
  "homecoming-voyage": {
    name: "Homecoming Voyage", ...ICE_THEME,
    variants: [{ id: "ic-ss3", name: "IC SS3", cards: [
      { bar: "blue", name: "Wanshi: Lucid Dreamer", role: "starter", ...WANSHI_BUILD,
        desc: "Support DPS build for Wanshi. Signature energy boost of 2x Cottie is totally useless on him, and 4x Cottie's Extra DMG Bonus doesn't work on him because it requires a Signature Move to activate, and 50% of his damage is outside the Signature. His damage loops steps won't change no matter what memory you use on him, so you can try various memory sets alongside his signature memory for various combos." },
      { bar: "red", role: "captain", ...LUCIA_IC_KIT, ...RANK_SS3, wh: "Chen Jiyuan", memories: memBuild(PAVLICHENKO, CHEN_JIYUAN), desc: LUCIA_IC_DESC },
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
        construct: `${KURUMI}/CUB - Zafkiel.webp`,
        skills: cubSkills(KURUMI, "webp"),
        desc: "Kurumi already generates a lot of energy only from few skills, even at low rank, so Cottie isn't needed and so is DLT; 2 signatures are doable any rank, but not worthy if Kurumi is below SSS, or if Adelyde is SSS, or if Rosetta is SS3. Anything works on Kurumi. Technically, \"Boone\" memory would be better than Derketo, since it has 2 points of ATK higher than it per memory, but... Derketo will make Kurumi have a round number on BP (7100 BPs, if SS, fully hypertuned and 6-star weapon), and 4 points of ATK isn't much, so... Yeah. Choose your priority." },
      { bar: "red", role: "", ...ADELYDE_KIT,
        desc: ADELYDE_QTE_DESC },
      { bar: "gold", role: "captain", ...ROSETTA_KIT, desc: ROSETTA_DESC }
    ] }]
  },
  "hanying-adelyde-rosetta": {
    name: "Anchored in Faith", ...PHYSICAL_THEME,
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
    name: "The Dying Sun", ...LIGHTNING_THEME,
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
    name: "Steering by Light", ...DARK_THEME,
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
    name: "Homecoming Voyage", ...FIRE_THEME,
    cards: [
      { bar: "blue", role: "captain", ...LUCIA_IC_KIT, wh: "Shakespeare", memories: memBuild(PAVLICHENKO, SHAKESPEARE), desc: LUCIA_IC_DESC },
      { bar: "red", role: "starter", ...VERONICA_KIT, wh: "Shakespeare", memories: memBuild(KEATS, SHAKESPEARE),
        desc: "Standard DPS build of Ignition for Veronica. If you desire, you can change the 4x Shakespeare for a 4x Guinevere set to buff everyone, it also works. A combo of 4x Cottie and 4x Shakespeare by removing Keats, is also a usable set. Almost anything works on her, she doesn't have any energy dependencies that would make her need Cottie." },
      { bar: "gold", role: "", ...NANAMI_KIT, wh: "Da Vinci", memories: memBuild(HERSCHELL, DA_VINCI),
        desc: "Standard DPS build of Ignition for Nanami. If playing solo, DLT and Cottie will be needed for her sustainability. On team, Da Vinci is a greater call. She works with any memory set along with her signature, so you can change according to your team's memories." }
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
const web = src => src.replace("assets/", "assets-web/") + ".webp";
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
// Detail pages: /assets/<memory|weapon|resonance|cub|skill>/<id> and /character/<id>
const linkId = s => slug(s).replace(/[^a-z0-9-]/g, "");
const memoryHref = name => `/assets/memory/${linkId(name)}`;
const weaponHref = name => `/assets/weapon/${linkId(name)}`;
const resonanceHref = name => `/assets/resonance/${linkId(name)}`;
const cubHref = name => `/assets/cub/${linkId(name)}`;
const charId = name => linkId(name.replace(":", ""));
const skillHref = name => `/assets/skill/${charId(name)}`;
const characterHref = name => `/character/${charId(name)}`;
// With href, the slot is a link. With a tip but no image, it shows that name in place of the art
const slot = (src, label = "", overlay = "", tip = iconName(src), href = "", info = iconInfo(src)) => {
  const tag = href ? "a" : "div", named = !src && tip;
  return `<${tag} class="slot${named ? " named" : ""}"${href ? ` href="${esc(href)}"` : ""}${tipAttr(tip, info)}>${src ? pic(src) : esc(label)}${src || named ? overlay : ""}</${tag}>`;
};
// Both bars are 2048x230 and span the whole slot
const STARS_BAR = "assets/overlay/UI-Supply-6Star.png", WH_BAR = "assets/overlay/UI-Weapon-Harmony.png", BAR_RATIO = 230 / 2048;
const STARS = pic(STARS_BAR, 'class="stars" alt="6 stars"');
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
  `<button class="sub" data-grp="${key}" aria-expanded="false">${label} <i>▾</i></button>` +
  `<div class="subList" data-list="${key}" hidden>${arr.map(e => `<a href="/${key}/${slug(e)}">${menuIcon(iconDir, e)}${e}</a>`).join("") || `<p class="subEmpty">Nothing here yet</p>`}</div>`;
menu.innerHTML = group(TEAM_LISTS.energy.label, "energy", ENERGY, "energy type") + group(TEAM_LISTS.effect.label, "effect", EFFECT, "effects") +
  group(TEAM_LISTS.special.label, "special", SPECIAL_EFFECT, "effects");
// A list of the side menu bursts open and squeezes shut. Only clicks animate: a page opening its own group doesn't
const MENU_OPEN = { duration: 260, easing: "cubic-bezier(.34,1.45,.64,1)" }, MENU_CLOSE = { duration: 170, easing: "cubic-bezier(.5,0,.75,.4)" };
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
  el.sliding = el.animate(frames, open ? MENU_OPEN : MENU_CLOSE);
  el.sliding.onfinish = () => {
    el.sliding = null;
    el.style.overflow = "";
    el.hidden = !open;
  };
}
function toggle(open, b = btn, m = menu, animate = true) {
  b.setAttribute("aria-expanded", open);
  slideMenu(m, open, animate);
}
function openGroup(key, open, animate = true) {
  const b = $(`[data-grp="${key}"]`);
  b.setAttribute("aria-expanded", open);
  slideMenu($(`[data-list="${key}"]`), open, animate);
}
// Phones: the side panel is a top bar and its menu opens with the ☰ button
const menuBtn = $("#menuBtn");
function setNav(open) {
  $("#side").classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
}
menuBtn.onclick = () => setNav(!$("#side").classList.contains("open"));
$("#sideNav").addEventListener("click", e => { if (e.target.closest("a")) setNav(false); });
btn.onclick = () => toggle(btn.getAttribute("aria-expanded") !== "true");
assetsBtn.onclick = () => toggle(assetsBtn.getAttribute("aria-expanded") !== "true", assetsBtn, assetsMenu);
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
  return `<p class="rot-order">${esc(c.rotation.order)}</p>${turns}<a class="rot-source" href="${LEIA_GUIDE}" target="_blank" rel="noopener">Source: Spider 2B's Leia guide</a>`;
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
  const [, weapon = "", , , weaponEffect = ""] = WEAPONS.find(w => w[0] === c.name) || [];
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
    <div class="top"><div class="sym slot"${tipAttr(c.symbol && iconName(c.symbol))}>${c.symbol ? pic(c.symbol) : "icon"}</div>
      <div class="portrait slot"${tipAttr(c.portrait && c.name)}>${c.portrait ? pic(c.portrait, `alt="${esc(c.name)}"`) : "portrait"}</div>
      ${c.rank ? `<div class="rank"${tipAttr(iconName(c.rank) + (c.rankLevel || ""))}>${pic(c.rank, 'alt="rank"')}${c.rankLevel ? `<b>${c.rankLevel}</b>` : ""}</div>` : ""}</div>
    <div class="box">
      <div class="mem">${n(6, i => memory((c.memories || [])[i], i)).join("")}</div>
      <div class="wp">${slot(c.weapon, weapon || "weapon", STARS, weapon, weapon && weaponHref(weapon), weaponEffect)}${weaponArt(c)}</div>
      <div class="mxw">
        <div class="mx">${n(3, i => numbered((c.matrix || [])[i], i + 1, resonance((c.matrix || [])[i]))).join("")}</div>
        <div class="res"><span>6×</span>${skillSlot(c.resonance)}<span>6×</span>${skillSlot(c.core)}</div>
      </div>
    </div>
    <div class="box kit">${slot(c.construct, "construct", STARS, undefined, cub)}${n(6, i => numbered((c.skills || [])[i], i + 1, cub)).join("")}</div>
    ${cardNotes(c)}
    </div><i class="bar bar-top"></i><i class="bar bar-bot"></i><div class="tags">${tags}</div>
  </article>`;
}
function comp(id, cards = COMPS[id].cards) {
  const c = COMPS[id];
  return `<section class="comp" style="--c1:${c.c1};--c2:${c.c2};--cp:${c.cp}">${cards.map(card).join("")}</section>`;
}

/* ---------- focus view: enlarged card in the center, the others behind it ---------- */
const FOCUS_MS = 500; // keep in sync with the .fcard transition in style.css
// The enlarged card is laid out at this width, whatever the size of the card it came from, then scaled to fill the screen
const FOCUS_W = 640;
// On a wide screen the text box of the enlarged card opens beside it, at the card's full height
const FOCUS_PANEL = 420, FOCUS_PANEL_MIN_SCREEN = 1100;
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
  const panel = clones[active].classList.contains("extended") ? FOCUS_PANEL : 0;
  // With the panel, the margins stay wide enough for the Export button, so it never covers the tabs
  const big = Math.min(1.6, (h - 110) / ch, (w - (panel ? 290 : 32)) / (cw + panel)), small = big * .68;
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
// Phones stack the cards at full width, so there is nothing to enlarge
const stacked = matchMedia("(max-width:760px),(hover:none) and (max-height:500px)");
function openFocus(src) {
  if (stacked.matches) return;
  const comp = src.closest(".comp"), sources = [...comp.querySelectorAll(".card")];
  setBackground(true);
  const stage = document.createElement("div");
  stage.className = "stage";
  stage.style.cssText = comp.style.cssText;
  stage.style.setProperty("--panel", `${FOCUS_PANEL}px`);
  stage.setAttribute("role", "dialog");
  stage.setAttribute("aria-modal", "true");
  stage.setAttribute("aria-label", "Character card");
  stage.innerHTML = `<button class="ctl close" aria-label="Close">×</button>
    <button class="ctl prev" aria-label="Previous character">‹</button>
    <button class="ctl next" aria-label="Next character">›</button>
    <button class="ctl export" data-export-active>Export image</button>`;
  const clones = sources.map(s => {
    const c = s.cloneNode(true);
    c.classList.add("fcard");
    c.dataset.name = $("h3", c).textContent;
    c.style.width = `${FOCUS_W}px`;
    c.classList.toggle("extended", innerWidth >= FOCUS_PANEL_MIN_SCREEN && !!$(".notes,.desc:not(:empty)", c));
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
  const save = e.target.closest("[data-export]");
  if (save) return exportBuild(save, shownTeam.cards);
  const note = e.target.closest("[data-note]");
  if (note) return showNote(note);
  const c = e.target.closest(".comp .card");
  if (c && !e.target.closest("a")) openFocus(c);
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

/* ---------- pages ---------- */
// Every character with a build and all their builds, read from PAGES and COMPS, so a new team shows up by itself
// on the conveyor and on the character pages. Energy pages come first, then Derivative Effect pages.
let characterList = null;
function characters() {
  if (characterList) return characterList;
  const found = new Map();
  const pages = Object.entries(PAGES).sort(([a], [b]) => b.startsWith("energy") - a.startsWith("energy"));
  for (const [path, ids] of pages) for (const id of ids) {
    const { name: team, cards, variants } = COMPS[id], [kind, key] = path.split("/");
    const page = TEAM_LISTS[kind].items.find(e => slug(e) === key);
    for (const t of variants || [{ id, cards }]) for (const c of t.cards) {
      if (!found.has(c.name)) found.set(c.name, { name: c.name, portrait: c.portrait, symbol: c.symbol, builds: [] });
      found.get(c.name).builds.push({ href: `/${path}/${t.id}`, page, team, variant: t.name, card: c, mates: t.cards.filter(x => x !== c) });
    }
  }
  return characterList = [...found.values()];
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
  return characters().map(c => ({ ...c, href: c.builds[0].href })).sort((a, b) => rank(a) - rank(b));
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
  const link = ([name, href, art, text]) => `<a class="home-link" href="${href}"><span class="hl-art">${pic(art)}</span><span class="hl-tx"><b>${name}</b><small>${text}</small></span></a>`;
  const count = (list, one, many = `${one}s`) => `${list.length} ${list.length === 1 ? one : many}`;
  const chars = heroChars(), cubs = cubList(), memories = Object.values(MEMORY_TABS).flat(), resonances = Object.keys(RESONANCE_EFFECTS);
  const tools = [
    ["BC Calculator", "/calculator", `${CALC_ART}/black-card.png`, "Plan your Black Cards across patches and check your pull odds."],
    ["Meta Timeline", "/timeline", TIMELINE.at(-1).head, "See how long each frame held its place and who may be replaced next."]
  ];
  const data = [
    ["Constructs", "/constructs", chars[0].portrait, count(chars, "construct")],
    ["Memories", "/assets/memories", memFile(memories.find(m => m[2])[0], "1-4"), count(memories, "set")],
    ["Weapons", "/assets/weapons", `${CHARS}/${WEAPONS.find(w => w[3])[3]}`, count(WEAPONS, "weapon")],
    ["Weapon Resonance", "/assets/resonances", WEAPON_RES(resonances[0]), count(resonances, "resonance")],
    ["C.U.B.s", "/assets/cubs", cubs[0].art, count(cubs, "C.U.B.")]
  ];
  return `<h2 class="grp">Tools</h2><div class="home-links tools">${tools.map(link).join("")}</div>
    <h2 class="grp">Game data</h2><div class="home-links data">${data.map(link).join("")}</div>`;
}
function home() {
  const tile = (e, p, iconDir, color = TILE_COLOR[e]) => {
    if (!e) return `<span class="tile-gap">N/A</span>`;
    const count = (PAGES[`${p}/${slug(e)}`] || []).reduce((sum, id) => sum + (COMPS[id].variants || [0]).length, 0);
    return `<a class="tile${count ? "" : " none"}" style="--c:${color}" href="/${p}/${slug(e)}">
      ${pic(`assets/${iconDir}/${e}.png`, 'class="t-bg" alt=""')}
      <span class="t-ic">${menuIcon(iconDir, e)}</span>
      <span class="t-tx"><b>${e}</b><small>${count ? `${count} team${count > 1 ? "s" : ""}` : "No teams yet"}</small></span>
    </a>`;
  };
  // Cells go column by column: the row names, then each energy with its effects
  const labels = Object.values(TEAM_LISTS).map(l => `<h2 class="home-label">${l.label}</h2>`).join("");
  const columns = ENERGY.map(e => tile(e, "energy", "energy type") + tile(ENERGY_EFFECT[e], "effect", "effects", TILE_COLOR[e]) + tile(ENERGY_SPECIAL[e], "special", "effects", TILE_COLOR[e])).join("");
  return `<section class="hero">
      ${heroBelt()}
      <div class="hero-tx"><h1>Punishing: Gray Raven Builds</h1><p class="sub">Pick a team by energy or derivative effect.</p></div>
    </section>
    <div class="home-grid">${labels}${columns}</div>
    ${homeLinks()}`;
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
    const pick = v => btn(`data-variant="${v.id}" title="${esc(v.name)}"`, v.label || v.name, v.id === chosen);
    const sets = variants && [...new Set(variants.map(v => v.group))].map(group => {
      const items = variants.filter(v => v.group === group).map(pick).join("");
      return group ? `<div class="pset"><span>${esc(group)}</span><div>${items}</div></div>` : items;
    }).join("");
    const sub = variants && open ? `<div class="psub">${sets}</div>` : "";
    return `<div class="pgroup">${head}${sub}</div>`;
  }).join("");
}
const noticeTimeLeft = () => Date.parse(NEW_CHARACTER_NOTICE.until) - Date.now();
const notice = cards => noticeTimeLeft() > 0 && cards.some(c => c.name === NEW_CHARACTER_NOTICE.name) ? `<p class="notice" role="note">${esc(NEW_CHARACTER_NOTICE.text)}</p>` : "";
let shownTeam = null; // the build on screen, for the export button
const pickedVariant = sel => COMPS[sel].variants?.find(x => x.id === chosen);
const pickedCards = sel => sel && (COMPS[sel].variants ? pickedVariant(sel)?.cards : COMPS[sel].cards);
// Sits above the page title, so it has its own box and changes along with the build on screen
const teamNotice = sel => { const cards = pickedCards(sel); return cards ? notice(cards) : ""; };
function compBody(sel) {
  const shownCards = pickedCards(sel);
  if (!shownCards) return "";
  shownTeam = { id: sel, title: [COMPS[sel].name, pickedVariant(sel)?.name].filter(Boolean).join(" · "), cards: shownCards };
  return `<div class="comp-tools"><button class="tool" data-export>Export image</button></div>` + comp(sel, shownCards);
}
function team(path) {
  const [kind, key] = path.split("/");
  const list = TEAM_LISTS[kind]?.items.find(e => slug(e) === key);
  if (!list) return `<p class="empty">Page not found.</p>`;
  const ids = PAGES[path] || [];
  const head = `<h1>${list}</h1><p class="sub">${TEAM_LISTS[kind].label}</p>`;
  if (!ids.length) return head + `<p class="empty">No teams yet.</p>`;
  return `<div id="noticeBox">${teamNotice(shown)}</div>${head}<div class="picker" role="group" aria-label="Composition">${pickerHtml(path, shown)}</div><div id="compBox">${compBody(shown)}</div>`;
}

/* ---------- assets pages ---------- */
const thumb = (src, overlay = "") => `<div class="slot">${src ? pic(src) + overlay : ""}</div>`;
// The 6-star bar goes on every memory and weapon of the Assets pages, except these 5-star ones
const FIVE_STAR = new Set(["Gloria", "Purple Peony"]);
const starsOf = name => FIVE_STAR.has(name) ? "" : STARS;
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
const weaponThumb = (file, name) => thumb(file && `${CHARS}/${file}`, starsOf(name));
// A character without a build has no page to link to
const ownerLink = name => characters().some(c => c.name === name) ? `<a href="${characterHref(name)}">${esc(name)}</a>` : esc(name);
const weaponRow = ([owner, name, type, file]) => `<tr>
    <td><div class="mt-name"><div class="mt-art wpn-art">${weaponThumb(file, name)}</div>
      <div><a href="${weaponHref(name)}">${esc(name)}</a><small>${ownerLink(owner)} · ${esc(type)}</small></div></div></td>
    ${WEAPON_STATS[name].map(value => `<td>${value}</td>`).join("")}</tr>`;
const SORT_TABLES = {
  memories: { columns: STAT_NAMES, row: set => memoryRow(set), name: ([name]) => name,
    value: ([name], column) => column === "Release" ? MEMORY_RELEASE[name] : MEMORY_STATS[name][STAT_NAMES.indexOf(column)] },
  // A weapon came out with the frame it belongs to
  weapons: { columns: ["ATK", "CRIT"], row: weapon => weaponRow(weapon), name: ([, name]) => name,
    value: ([owner, name], column) => column === "Release" ? CONSTRUCTS[owner][0] : WEAPON_STATS[name][column === "ATK" ? 0 : 1] },
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
  : group === "Class" ? pic(CLASS_ART[value] || classIcon(value)) : value === "S" ? pic("assets/rank/S.png") : `<b>${esc(value)}</b>`;
function constructFilters() {
  const active = CONSTRUCT_FILTERS.filter(group => constructFilter[group]).length;
  const bar = `<div class="filter-bar"><button class="tool filter-toggle" data-toggle-filters aria-expanded="${filtersOpen}">Filters${active ? ` (${active})` : ""}</button>${active ? `<button class="tool" data-clear-filters>Clear filters</button>` : ""}</div>`;
  return `${bar}<div class="filters${filtersOpen ? " open" : ""}">${CONSTRUCT_FILTERS.map(group => {
    const found = new Set(characters().map(c => constructValue(c, group)).filter(Boolean));
    const values = group === "Element" ? ENERGY.filter(e => found.has(e)) : group === "Rank" ? [...found].sort().reverse() : [...found].sort();
    const chip = (label, value) => `<button class="tool chip${(constructFilter[group] || "") === value ? " on" : ""}" data-filter="${group}" data-value="${esc(value)}" aria-pressed="${(constructFilter[group] || "") === value}">${value ? `<span class="chip-icon">${filterIcon(group, value)}</span>` : ""}${esc(label)}</button>`;
    return `<div class="filter" role="group" aria-label="${group}"><span>${group}</span>${chip("All", "")}${values.map(v => chip(v, v)).join("")}</div>`;
  }).join("")}</div>`;
}
function constructCards() {
  const list = characters().filter(c => CONSTRUCT_FILTERS.every(group => !constructFilter[group] || constructValue(c, group) === constructFilter[group]))
    .sort((a, b) => CONSTRUCTS[b.name][0] - CONSTRUCTS[a.name][0]);
  if (!list.length) return `<p class="sub">No constructs match these filters.</p>`;
  return `<div class="agrid">${list.map(c => {
    const [, element, type, rank, effect] = CONSTRUCTS[c.name];
    const count = c.builds.length;
    return charCard(c, characterHref(c.name), [rank, type, element, effect, `${count} build${count > 1 ? "s" : ""}`].filter(Boolean).join(" · "));
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
function weaponPage([owner, name, type, file, effect]) {
  const [ATK, CRIT] = WEAPON_STATS[name];
  return `${backLink("/assets/weapons", "Weapons")}<h1>${esc(name)}</h1><p class="sub">${esc([type, owner].filter(Boolean).join(" · "))}</p>
    <div class="detail wpn-detail">${weaponThumb(file, name)}<div class="fx">${statRow({ ATK, CRIT })}<h2>Effect</h2><p>${esc(effect)}</p></div></div>
    ${usedIn(c => c.name === owner)}`;
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
  script.src = "skills-data.js";
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
  const grid = (title, cards) => `<h1>${title}</h1><p class="sub">Assets</p><div class="agrid">${cards}</div>`;
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
    shownRows.weapons = tab === "All" ? WEAPONS : WEAPONS.filter(([owner]) => CONSTRUCTS[owner][1] === tab);
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
  return `<h1>Constructs</h1><p class="sub">Every construct with a build</p><div id="constructs">${constructsView()}</div>`;
}
// Contact page. No art = the first letter of the name in a circle; art goes in assets/credits
const CREDITS = [
  { name: "blacknovatech", text: "creator of Huaxu, for the assets", href: "https://huaxu.app/na/wiki", art: "assets/credits/blacknovatech.png", support: "https://ko-fi.com/blacknova" },
  { name: "sidewayz.", text: "for helping with the card design", art: "assets/credits/sidewayz.png" },
  { name: "GRAY RAVENS wiki", text: "for skills and the patch history", href: "https://grayravens.com/wiki" },
  { name: "Spider 2B", text: "for the guides behind several builds", href: "https://www.youtube.com/@Spider2B", art: "assets/credits/Spider 2B.png" }
];
const KOFI = "https://ko-fi.com/ofcrazy";
const creditRow = ({ name, text, href, art, support }) => `<li><span class="credit-art">${art ? pic(art) : esc(name[0].toUpperCase())}</span>
  <span>${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(name)}</a>` : `<strong>${esc(name)}</strong>`} ${esc(text)}${support ? ` · <a href="${esc(support)}" target="_blank" rel="noopener">Support on Ko-fi</a>` : ""}</span></li>`;
const contactPage = () => `<h1>Contact</h1><p class="sub">Found a wrong build, or have a question or suggestion? Send me a message.</p>
  <div class="contact">
    <section class="contact-card">
      <p class="contact-label">Discord</p>
      <div class="contact-name"><span class="credit-art big">${pic("assets/credits/crazy117.png")}</span><strong>crazy117</strong><button class="tool" data-copy="crazy117">Copy</button></div>
      <a class="tool contact-kofi" href="${KOFI}" target="_blank" rel="noopener">Support me on Ko-fi</a>
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
const CALC_PASSES = [
  { key: "bcPass", name: "Monthly Pass A", rc: 30, max: 2, art: `${CALC_ART}/monthly-pass.png` },
  { key: "encrypted", name: "Encrypted Pass", rc: 30, max: 1, art: `${CALC_ART}/encrypted-pass.png` },
  { key: "topSecret", name: "Top-Secret Pass", rc: 68, max: 1, art: `${CALC_ART}/top-secret-pass.png` }
];
const CALC_SPENDING = [
  { key: "copies", name: "Frame copies" },
  { key: "shards", name: "Frame shards", note: "804 Vouchers each" },
  { key: "weapons", name: "Weapons" },
  { key: "resonance", name: "6★ Resonance", note: "150 Shards each" },
  { key: "cubs", name: "C.U.B.s" },
  { key: "custom", name: "Other BC spend", note: "Skins, special banners...", step: 1000 }
];
// Monthly Pass A pays on the day it is bought and then once a day, so it can run into the next patch
const MONTHLY_PASS = { upfront: 300, daily: 100, days: 30 };
// Eneba prices before checkout fees: [RC, BRL, USD]. tools/update-prices.mjs rewrites these two lines
const RC_PRICES_DATE = "6 Nov 2026";
const RC_PACKS = [[5, 4.40, 1.07], [28, 22.57, 4.34], [34, 27.76, 5.29], [59, 45.93, 8.62], [71, 54.59, 10.20], [119, 90.92, 16.86], [299, 229.36, 42.20], [600, 458.64, 84.16]];
const RC_STORE = "https://www.eneba.com/top-up-punishing-gray-raven-android-rainbow-cards-global";
const COST = { S: 15000, A: 2500, weapon: 7500, cub: 5000, frameShard: 804, resonance: 150, shardVouchers: 120 };
// A collab gives free pulls, so its first frame and weapon are cheaper. It pays in BC only, and tickets carry over untouched
const COLLAB_COST = { S: 10500, A: 2500, firstFrame: 6300, firstWeapon: 4000 };
const PULL_ODDS = { Frame: { rate: 0.005, pity: 60, cost: COST.S }, Weapon: { rate: 0.04, pity: 30, cost: COST.weapon }, "C.U.B.": { rate: 0.0582, pity: 20, cost: COST.cub } };
// What's left after one patch. "start" is the balance going in, "plan" what was typed in that patch's card
function patchResult(patch, start, plan, { calibration, useVouchers }, monthlyDays = 0) {
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
    left.bc += count("bcPass") * MONTHLY_PASS.upfront + monthlyDays * MONTHLY_PASS.daily;
    left.cub += count("encrypted") * 2500;
    left.limited += count("topSecret") * 2500;
    left.voucher += count("encrypted") * 10000 + count("topSecret") * 18500;
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
const newCalc = () => ({ balance: {}, plans: {}, open: {}, tab: "plan", calibration: false, useVouchers: true, pullKind: "Frame", pulls: 0 });
let calc = { ...newCalc(), ...readCalc() };
const calcId = patch => patch.patch || patch.frame;
const calcToday = () => new Date().toLocaleDateString("en-CA");
const dayNumber = iso => Date.parse(`${iso}T00:00Z`) / 864e5;
// Weeklies reset on Mondays: the spreadsheet's weekly income matches the Mondays of each patch. Day 0 was a Thursday
const mondays = (from, to) => Math.floor((to + 3) / 7) - Math.floor((from + 2) / 7);
// How much of the patch running today is still ahead, counting today. Any other patch has no answer here
function patchTime(patch, today) {
  if (!patch.patch || today < patch.start || today > patch.end) return null;
  const start = dayNumber(patch.start), end = dayNumber(patch.end), now = dayNumber(today);
  return { day: now - start + 1, days: end - start + 1, daysLeft: end - now + 1, weeks: mondays(start, end), weeksLeft: mondays(now, end) };
}
// The part of a patch's income that can still be earned: dailies and weeklies shrink as the patch goes on, and events leave once they end
function incomeLeft(patch, today) {
  const time = patchTime(patch, today);
  if (!time || !patch.daily) return patch.gains;
  const missed = (part, key, share) => Math.round((part[key] || 0) * (1 - share));
  const ended = patch.events.filter(event => event.end < today);
  return Object.fromEntries(CURRENCIES.map(({ key }) => [key, Math.max(0, patch.gains[key]
    - missed(patch.daily, key, time.daysLeft / time.days) - missed(patch.weekly, key, time.weeksLeft / time.weeks)
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
// Each patch starts with what the one before it left. Monthly Passes run one after the other, and what doesn't fit moves on
function calcRun() {
  const today = calcToday();
  let balance = Object.fromEntries(CURRENCIES.map(({ key }) => [key, calc.balance[key] || 0])), monthlyLeft = 0;
  return calcPlan().map(patch => {
    const plan = calc.plans[calcId(patch)] || {};
    monthlyLeft += (patch.collab ? 0 : plan.bcPass || 0) * MONTHLY_PASS.days;
    const monthlyDays = Math.min(monthlyLeft, planDays(patch, today));
    monthlyLeft -= monthlyDays;
    balance = patchResult(patch, balance, plan, calc, monthlyDays);
    return { plan, left: balance, monthlyDays, monthlyLeft };
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
const numberBox = (attr, value, label) => `<input type="number" inputmode="numeric" min="0" step="1" placeholder="0" ${attr} value="${value || ""}" aria-label="${esc(label)}">`;
const currencyGrid = (values, cell) => `<div class="calc-money">${CURRENCIES.map(c => `<div class="calc-coin">${calcIcon(c.art)}<small>${esc(c.name)}</small>${cell(c, values[c.key])}</div>`).join("")}</div>`;
const frameLink = name => characters().some(c => c.name === name) ? `<a href="${characterHref(name)}">${esc(name)}</a>` : esc(name || "Frame to be confirmed");
// A closed patch still shows what matters: RC spent and the balance it leaves
const patchSummary = () => `<span class="calc-sum">
    <span>${calcIcon(RC_ART)}<output data-sum="rc"></output></span>
    ${CURRENCIES.map(c => `<span title="${esc(c.name)}">${calcIcon(c.art)}<output data-sum="${c.key}"></output></span>`).join("")}
  </span>`;
function patchCard(patch, today, startOpen) {
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
    ? `<p class="calc-label">Income left</p><p class="calc-hint">Still to come: ${time.daysLeft} of ${time.days} days of dailies, ${time.weeksLeft} of ${time.weeks} weekly resets and ${patch.events.filter(event => event.end >= today).length} of ${patch.events.length} timed events</p>`
    : `<p class="calc-label">Patch income</p>`;
  return `<details class="calc-card calc-patch" data-id="${esc(calcId(patch))}"${calc.open[calcId(patch)] ?? startOpen ? " open" : ""}>
    <summary><span class="calc-head"><span>${head}</span></span>${patchSummary()}</summary>
    <div class="calc-body">
    ${patch.collab ? "" : `<label class="calc-rank">Rank <select data-plan="rank" aria-label="Frame rank">${["S", "A"].map(r => `<option${r === rank ? " selected" : ""}>${r}</option>`).join("")}</select></label>
    ${income}${currencyGrid(patch.gains, (c, value) => `<b>${amount(value)}</b>`)}
    <p class="calc-label">Passes</p><div class="calc-passes">${passes}</div>
    <div class="calc-rc-row"><span class="calc-rc">${calcIcon(RC_ART)}<output data-rc></output></span><b data-rc-price></b><small data-monthly></small></div>`}
    <p class="calc-label">Spending</p><div class="calc-fields">${CALC_SPENDING.map(field).join("")}</div>
    ${patch.collab ? "" : `<button class="tool calc-copy" type="button" data-calc-copy>Repeat this plan in later patches</button>`}
    <p class="calc-label">Final balance</p>${currencyGrid({}, c => `<output data-left="${c.key}"></output>`)}
    </div>
  </details>`;
}
const calcStat = (label, value, note) => `<div class="calc-stat"><small>${esc(label)}</small><b>${esc(value)}</b><small>${esc(note)}</small></div>`;
function showCalc() {
  const cards = document.querySelectorAll(".calc-patch"), run = calcRun();
  run.forEach(({ plan, left, monthlyDays, monthlyLeft }, i) => {
    for (const { key } of CURRENCIES) {
      const out = $(`[data-left="${key}"]`, cards[i]);
      out.textContent = amount(left[key]);
      out.classList.toggle("short", left[key] < 0);
      const sum = $(`[data-sum="${key}"]`, cards[i]);
      sum.textContent = amount(left[key]);
      sum.classList.toggle("short", left[key] < 0);
    }
    $('[data-sum="rc"]', cards[i]).textContent = passCost(plan);
    const cost = $("[data-rc]", cards[i]);
    if (cost) cost.textContent = `${passCost(plan)} RC`;
    const price = $("[data-rc-price]", cards[i]);
    if (price) price.textContent = rcPrice(passCost(plan));
    const monthly = $("[data-monthly]", cards[i]);
    if (monthly) monthly.textContent = monthlyDays ? `Monthly Pass A: ${monthlyDays} days in this patch${monthlyLeft ? `, ${monthlyLeft} more after it` : ""}` : "";
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
    + calcStat("Average pulls", `${Math.round(average)}`, `About ${amount(Math.round(averageCost / 10) * 10)} BC`)
    + calcStat(`${NEARLY_SURE * 100}% without pity`, `${noPity} pulls`, "What pity saves you");
}
// Phones keep the explanations closed, and only one patch open, so the page stays short
const calcPhone = matchMedia("(max-width:760px)");
const calcMore = (title, content) => `<details class="calc-more"${calcPhone.matches ? "" : " open"}><summary>${title}</summary>${content}</details>`;
const calcNotes = notes => `<dl class="calc-info">${notes.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join("")}</dl>`;
function calculatorPage() {
  const option = (key, name, note) => `<label class="calc-check"><input type="checkbox" data-option="${key}"${calc[key] ? " checked" : ""}><span>${esc(name)}<small>${esc(note)}</small></span></label>`;
  const tab = (key, name) => `<button class="tool${calc.tab === key ? " on" : ""}" type="button" data-calc-tab="${key}">${name}</button>`;
  const margin = (tone, value, what) => `<div class="calc-margin ${tone}"><b>${value}</b><span>${what}</span></div>`;
  const today = calcToday();
  return `<h1>BC Calculator</h1><p class="sub">Plan your Black Cards across patches. Same math as the <a href="${CALC_SHEET}" target="_blank" rel="noopener">Tickets Income spreadsheet</a> by @Crazy117 &amp; @Sidewayz.</p>
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
          <div class="calc-fold"><p>Each row shows the RC spent and the balance left after that patch. Open one to plan it.</p>
            <span><button class="tool" type="button" data-calc-fold="open">Expand all</button><button class="tool" type="button" data-calc-fold="close">Collapse all</button></span></div>
          ${calcPlan().map((p, i) => patchCard(p, today, i === 0)).join("")}
        </div>
        <aside class="calc-side">
          <h2 class="grp">Passes total</h2>
          <section class="calc-card calc-total">${calcIcon(RC_ART)}<output id="calcRc"></output><b id="calcRcPrice"></b><small id="calcRcList"></small>
            <small>RC prices come from <a href="${RC_STORE}" target="_blank" rel="noopener">Eneba</a> on ${RC_PRICES_DATE}: the cheapest mix of its packs, before checkout fees. They change often, so treat them as an estimate.</small></section>
          ${calcMore("How it's calculated", `<section class="calc-card">${calcNotes([
            ["Worst-case costs", "A frame counts as 60/60 pulls (15,000) and a weapon as 30/30 (7,500)."],
            ["Current patch", "Dailies shrink with the days left, weeklies with the resets left, and timed events leave after their last day. Today's dailies and running events count in full, even if you already collected them."],
            ["Monthly Pass A", `${MONTHLY_PASS.upfront} BC when bought and ${MONTHLY_PASS.daily} BC a day for ${MONTHLY_PASS.days} days. A second one adds ${MONTHLY_PASS.days} more days, not more per day. Days that don't fit move to the next patch.`],
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
        ["Average pulls", "What one copy takes on average once pity is counted, at 250 BC per pull."],
        [`${NEARLY_SURE * 100}% without pity`, "How many pulls a 99% chance would take if pity didn't exist."],
        ["Method", `The rate is treated as flat until pity. Average pulls and the ${NEARLY_SURE * 100}% figure adapt <a href="${ODDS_METHOD}" target="_blank" rel="noopener">FINNER's expected and nearly guaranteed numbers</a> from Warframe.`]
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
let calcClicked = null;
$("#main").addEventListener("click", e => {
  const tab = e.target.closest("[data-calc-tab]"), fold = e.target.closest("[data-calc-fold]");
  const step = e.target.closest("[data-step]"), copy = e.target.closest("[data-calc-copy]");
  calcClicked = e.target.closest(".calc-patch summary")?.parentElement;
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
  if (fold) document.querySelectorAll(".calc-patch").forEach(card => { card.open = fold.dataset.calcFold === "open"; });
  if (!e.target.closest("[data-calc-clear]")) return;
  calc = newCalc();
  saveCalc();
  route();
});
// toggle does not bubble, so it is caught on the way down. Which patches are open stays with the rest of the plan
$("#main").addEventListener("toggle", e => {
  if (!e.target.matches(".calc-patch")) return;
  calc.open[e.target.dataset.id] = e.target.open;
  saveCalc();
  if (!calcPhone.matches || !e.target.open || e.target !== calcClicked) return;
  document.querySelectorAll(".calc-patch[open]").forEach(card => { card.open = card === e.target; });
  e.target.scrollIntoView();
}, true);
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
const reignHref = name => characters().some(c => c.name === name) ? ` href="${characterHref(name)}"` : "";
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
  return `<h1>Meta Timeline</h1><p class="sub">How long each character held their place in the meta on the Chinese server, the first to get each frame. Dates come from the <a href="${CALC_SHEET}" target="_blank" rel="noopener">Tickets Income spreadsheet</a> and the <a href="${TL_CN_HISTORY}" target="_blank" rel="noopener">Chinese wiki</a>, and Global release dates are not considered. Collabs and uniframes are not counted. "Free" marks frames you can get without pulling.</p>
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
  const weapon = WEAPONS.find(w => w[0] === ch.name), cub = cubList().find(c => c.owner === ch.name);
  const links = [
    weapon && `<a class="acard wpn" href="${weaponHref(weapon[1])}">${weaponThumb(weapon[3], weapon[1])}<div><h3>${esc(weapon[1])}</h3><p>Weapon</p></div></a>`,
    cub && `<a class="acard wpn" href="${cubHref(cub.name)}">${thumb(cub.art)}<div><h3>${esc(cub.name)}</h3><p>CUB</p></div></a>`,
    `<a class="acard wpn" href="${skillHref(ch.name)}">${thumb(card?.core)}<div><h3>Skills</h3><p>All skills and passives</p></div></a>`
  ].filter(Boolean).join("");
  return `${backLink("/constructs", "Constructs")}<h1>${esc(ch.name)}</h1><p class="sub">${esc(iconName(ch.symbol))} · ${count} build${count > 1 ? "s" : ""}</p>
    <div class="detail char-detail"><div class="slot">${pic(ch.portrait, `alt="${esc(ch.name)}"`)}</div><div class="char-links">${links}</div></div>
    <h2 class="grp">Builds</h2><div class="builds">${ch.builds.map(buildRow).join("")}</div>`;
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
const cardArt = c => [c.symbol, c.portrait, c.rank, c.weapon, c.resonance, c.core, c.construct, c.wh && memFile(c.wh, "WH", "png"),
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
  if (c.rank) drawArt(g, art.get(c.rank), rankX, top + 30, 90, 70, { fit: "contain" });
  if (c.rankLevel) drawText(g, c.rankLevel, rankX + 88, top + 98, exportFont(24));
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
  if (stars) drawArt(g, stars, wpX, boxY + pad + weaponH - barH, wpW, barH, { fit: "contain" });
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
async function renderBuild(cards, { id, title }) {
  const theme = COMPS[id];
  await Promise.all([document.fonts.load(exportFont(16)), document.fonts.load(exportFont(13, 400))]);
  const sources = [...new Set([...cards.flatMap(cardArt), STARS_BAR, WH_BAR])];
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
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion:reduce)").matches) document.startViewTransition(update);
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
  // A link can name a team as a third part: /energy/dark/kurumi-adelyde-rosetta
  const [kind, key, pick] = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const path = key ? `${kind}/${key}` : kind;
  const ids = (key && PAGES[path]) || [];
  const owner = ids.find(id => (COMPS[id].variants || []).some(v => v.id === pick));
  shown = owner || (ids.includes(pick) ? pick : ids[0]) || "";
  const { variants } = COMPS[shown] || {};
  expanded = variants ? shown : "";
  chosen = owner ? pick : variants ? variants[0].id : "";
  const main = $("#main");
  const character = kind === "character" && characters().find(c => charId(c.name) === key);
  main.innerHTML = kind === "assets" ? assetsPage(key, pick) : kind === "constructs" ? charactersPage() : kind === "contact" ? contactPage() : kind === "calculator" ? calculatorPage() : kind === "timeline" ? timelinePage()
    : kind === "character" ? (character ? characterPage(character) : `<p class="empty">Page not found.</p>`) : path ? team(path) : home();
  theme(null);
  if (kind === "calculator") showCalc();
  const heading = kind && $("h1", main)?.textContent;
  document.title = heading ? `${heading} - Dominik` : SITE_TITLE;
  const navPath = kind === "character" ? "constructs" : { "assets/memory": "assets/memories", "assets/weapon": "assets/weapons", "assets/resonance": "assets/resonances", "assets/cub": "assets/cubs", "assets/skill": "constructs" }[path] || path;
  document.querySelectorAll("#side a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "/" + navPath));
  if (kind === "assets") toggle(true, assetsBtn, assetsMenu, false);
  else if (TEAM_LISTS[kind]) { toggle(true, btn, menu, false); openGroup(kind, true, false); }
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
    history.replaceState(null, "", `/${path}${pick ? `/${pick}` : ""}`);
    pageUrl = location.href;
    swap(() => {
      picker.innerHTML = pickerHtml(path, sel);
      $("#noticeBox").innerHTML = teamNotice(sel);
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
  addEventListener("pagechange", closeSheet);
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
// A missing thumbnail or light copy falls back to the full art. Handled here because the CSP in _headers blocks inline onerror
addEventListener("error", e => {
  const img = e.target, full = img.dataset?.full;
  if (full && img.getAttribute("src") !== full) img.src = full;
}, true);
// Every page opens at the top, except when coming back from a detail page to where you were.
// A new detail page only needs to be listed here and to use backLink
const DETAIL_PAGE = /\/(assets\/(memory|weapon|skill|resonance|cub)|character)\//;
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
  swap(() => { route(); scrollTo(0, fromDetail ? scrollSaved.get(pageUrl) || 0 : 0); });
}
// Links inside the site change the page without reloading it. Ctrl+click and the like stay with the browser
addEventListener("click", e => {
  const link = e.target.closest?.('a[href^="/"]');
  if (!link || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (link.pathname === location.pathname) return;
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
    ...characters().map(c => ({ label: c.name, kind: "Construct", href: characterHref(c.name), art: c.portrait })),
    ...Object.values(MEMORY_TABS).flat().map(([name, boost, ext]) => ({ label: name, kind: `Memory · ${boost}`, href: memoryHref(name), art: ext && memFile(name, "1-4") })),
    ...WEAPONS.map(([owner, name, , file]) => ({ label: name, kind: `Weapon · ${owner}`, href: weaponHref(name), art: file && `${CHARS}/${file}` })),
    ...cubList().map(c => ({ label: c.name, kind: `C.U.B. · ${c.owner}`, href: cubHref(c.name), art: c.art })),
    ...Object.keys(RESONANCE_EFFECTS).map(name => ({ label: name, kind: "Weapon Resonance", href: resonanceHref(name), art: WEAPON_RES(name) })),
    ...ENERGY.map(e => ({ label: e, kind: "Energy teams", href: `/energy/${slug(e)}`, art: `assets/energy type/${e}.png` })),
    ...EFFECT.map(e => ({ label: e, kind: "Effect teams", href: `/effect/${slug(e)}`, art: `assets/effects/${e}.png` })),
    ...SPECIAL_EFFECT.map(e => ({ label: e, kind: "Special Effect teams", href: `/special/${slug(e)}`, art: `assets/effects/${e}.png` })),
    ...Object.keys(MEMORY_TABS).map(tab => ({ label: `${tab} memories`, kind: "Memories", href: `/assets/memories/${slug(tab)}`, art: "" })),
    ...[["Constructs", "/constructs"], ["Memories", "/assets/memories"], ["Weapons", "/assets/weapons"], ["Weapon Resonance", "/assets/resonances"], ["C.U.B.s", "/assets/cubs"], ["Contact", "/contact"]]
      .map(([label, href]) => ({ label, kind: "Page", href, art: "" })),
    { label: "BC Calculator", kind: "Tool", href: "/calculator", art: `${CALC_ART}/black-card.png` },
    { label: "Meta Timeline", kind: "Tool", href: "/timeline", art: classIcon("Attacker") },
    ...Object.entries(PAGES).flatMap(([path, ids]) => ids.flatMap(id => (COMPS[id].variants || [{ id, name: COMPS[id].name }]).map(v =>
      ({ label: v.name, kind: `Team · ${COMPS[id].name}`, href: `/${path}/${v.id}`, art: "" }))))
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
