/* Text shown on the Assets pages, kept out of app.js because it is long.
   Memory bonuses: https://huaxu.app/na/wiki/memories
   Weapons: https://grayravens.com/wiki/Weapons/5%E2%98%85_Weapons and https://grayravens.com/wiki/Weapons/6%E2%98%85_Weapons and https://huaxu.app/na/wiki/weapons */

// Memory set name: [2-piece bonus, 4-piece bonus, 6-piece bonus if it has one]
const MEMORY_EFFECTS = {
  "Aline": ["Extra DMG Bonus increases by 5% and Ice DMG increases by 5%.", "Base DMG of Pure Color: Theme Emphasis and Color Mix: Clash of Concepts increases by 50%. Base DMG of Vibrant Brushstroke increases by 80%."],
  "Alphonse": ["Fire DMG increases by 10%.", "The Base DMG of Flame Eruption and Thermal Erosion increases by 100%. Firepower Bulwark will inflict Scorching Invasion on the target hit, which will reduce their Fire Resistance for 8s. Duration resets every time it is triggered."],
  "Barcelo": ["ATK increases by 7% and Dark DMG and Plasma Beam DMG increase by 3%.", "Base DMG of Invitation to a Radiant Dream doubles."],
  "Bathlon": ["ATK increases by 3% and Dark DMG increases by 7%", "Extra DMG Bonus increases by 10%. Attacking a target will inflict them with Corruption, reducing their Dark Resistance by 15% for 8s (10s cooldown on the same target). Attacking targets affected by Corruption will trigger an Explosion that deals 600% Dark DMG (6s cooldown on the same target)."],
  "Boone": ["Dark DMG increases by 10%.", "Doubles the Base DMG increase effect of Karenina: Scire's Kinetic Energy for Starshatter Horizon and the Base DMG multiplier of Leap Attack and Radiant Whirlwind."],
  "Bulgakov": ["Nihil DMG increases by 10%", "Upon entering battle, additionally gains 3 Red Orbs after using Fatal Kiss for the first time. Extra DMG of Fatal Kiss and Death's Promise increases by 50%."],
  "Bunsen": ["Physical DMG increases by 5% and Ultima Slash DMG increases by 10%.", "When Truewill is 5 or greater, ATK increases by 5%, and Ultima Slash DMG increases by 10%."],
  "Burana": ["ATK increases by 5%. Physical DMG and Glaciation DMG increase by 5%. SS Rank Up bonus: After casting Rhythmic Piercing, when switched out, automatically casts Signature Move - Majestic Interlude (cannot reduce Noise stacks).", "Gains 2 Signal Orbs upon casting Rhythmic Piercing. Damage of Echoing Melody, Rhythmic Piercing, Signature - Majestic Interlude, and Signature - Note of Termination doubles."],
  "Catherine": ["QTE and 3-Ping skills reduce the target's Physical DEF by 20% for 8s. 10s cooldown.", "When taking damage, gains a shield that absorbs 1000 DMG, as well as increasing the Physical DMG dealt by 15% for 5s. 8s cooldown."],
  "Chang Wuzi": ["Physical DMG increases by 10%", "Harmonic Orbs' Base DMG increases by 100%. The effect of Piercing Blow launched by Hanying: Solacetune increases by 20%. Upon quitting the Lunartone Field, the field will still exist for 12s and deal 50% Physical DMG to enemies within it once every second."],
  "Charlotte": ["Basic Attacks deal 5% more DMG. ATK increases by 7%.", "Glowing Lanternlight deals 50% more Base DMG. Afterglow Shadow deals 100% more Base DMG. Every time upon entering Luminous Realm, rearranges the Signal Orbs when casting Glowing Lanternlight."],
  "Chen Jiyuan": ["ATK increases by 3% and Ice DMG increases by 7%", "Extra DMG Bonus increases by 10%. Attacking a target will inflict them with Frost, reducing their Ice Resistance by 15% for 8s (10s cooldown on the same target). Attacking targets affected by Frost will trigger an Icy Blast that deals 600% Ice DMG (6s cooldown on the same target)."],
  "Cleopatra": ["Nihil DMG increases by 10%", "Gains Eclipse Points 100% faster. Luna: Oblivion gains 30% Extra DMG Bonus when in Main Sequence/Finality."],
  "Clusius": ["Fire DMG increases by 5% and Ignition DMG increases by 10%.", "When casting a Signature Move, ATK increases by 5% and Ignition DMG increases by 10% for 10s. Duration resets every time it is triggered."],
  "Cogito": ["ATK increases by 5% and Lightning DMG and Glaciation DMG increase by 5%.", "Extra DMG of Delve, Manifest, Deflect, Infuse, and Recede increases by 100%."],
  "Condelina": ["Basic Attack's Extra DMG Bonus increases by 15%.", "Basic Attacks have a 50% chance to go berserk, increasing the Extra Damage Bonus of Basic Attack by 20% for 5s. 8s cooldown."],
  "Cottie": ["Gains 20% more Energy when pinging an orb. Signature Move requires 20% less Signature Energy.", "Extra DMG Bonus increases by 15% for 10s when performing a Signature Move. Gains Super Armor that increases Extra DMG Reduction by 20% for 5s after the Signature Move. Triggering these effects again will renew their duration."],
  "Da Vinci": ["When QTE is triggered, the controlling character gains 10% ATK and 20% DEF for 8s. Duration resets every time it is triggered.", "When QTE is triggered, increases another character's QTE charge count by 1 and activates it. CD: 8s. If there are 3 characters on the field, all characters' ATK is increased by 20% for 2s. Duration resets every time it is triggered.", "Da Vinci 4-piece set effect removes cooldown restrictions. Cannot stack with effects of the same type."],
  "Darwin": ["For each orb pinged, Extra DMG Bonus increases by 3% for 4s. Can be stacked up to 5 times. Duration resets every time it is triggered.", "Records the color of Signal Orbs pinged. When all 3 colors are recorded, unleashes a 12m shockwave that deals 600% Physical DMG and resets the record."],
  "Derketo": ["Dark DMG increases by 10%.", "Base DMG of Torrent Orbs, Tidal Orbs, and Signature - Sunken Finale increases by 100%. After casting Signature - Sunken Finale, if Lamia is switched out of battle, she will still cast co-attacks when any teammate actively casts their Signature. Co-attacks deal 3000% Dark DMG each time, and can be triggered up to 3 times after every Signature - Sunken Finale."],
  "Diesel": ["Lightning DMG increases by 10%.", "The efficiency of acquiring Blade Aura increases by 50%. The Base DMG of Unquenchable Flare's Leaping Thrust increases by 50%, and the Base DMG of Signature - Weave: Karmic Inferno increases by 80%."],
  "Einsteina": ["QTE and 3-Ping skills reduce the target's all Elemental Resistance by 15% for 8s. 10s cooldown.", "When taking damage, releases an elemental aura, gaining 20% Elemental Resistance for 5s. All Elemental DMG dealt increases by 15% when the aura is present. 8s cooldown."],
  "Elizabeth": ["ATK increases by 5% and Fire DMG increases by 5%.", "Extra DMG Bonus of Oaths will increase by 50%. When equipped by Liv: Empyrea, upon a 3-Ping by any team member, Liv: Empyrea's drones will appear and cast White Oracle against the target, dealing damage equal to 3% Liv: Empyrea's ATK every second for 20s. This effect can be stacked up to 5 times. Meanwhile, Liv: Empyrea will restore HP equal to 15% of her ATK every second for team members within the range for 4s."],
  "Feynman": ["ATK increases by 5% and Fire DMG and Plasma Beam DMG increase by 5%.", "The effect of Flare Points on Ignited Radiance's Base DMG is doubled."],
  "Flamel": ["Dark DMG increases by 5% and ATK increases by 5%", "After entering annihilation state, the aphotic DMG increases by 30%. DMG of End is Nigh increases by 30%. Gain extra 10 Energy after the annihilation orb is eliminated."],
  "Fran": ["Lightning DMG increases by 5% and Extra DMG Bonus increases by 5%.", "Dusk Fluorescence and Forest Predator's Base DMG increases by 100%. Wolfspirit Release's Base DMG increases by 70%."],
  "Frederick": ["Each dodge increases Movement Speed by 15% and Extra DMG Bonus by 5% for 5s. Can be stacked up to 3 times. Duration resets every time it is triggered.", "Triggering Matrix reduces all enemies' Speed by 20% and Extra DMG Reduction during Matrix/Hypermatrix Deduction/Overlink Ascension by 15% for 4s. 8s cooldown."],
  "Gloria": ["Attacks reduce the target's all Elemental Resistance by 6% for 5s. 12s cooldown.", "When taking damage, reduces all Elemental Resistance of enemies within 5m by 6% for 7s. Duration resets every time it is triggered."],
  "Guinevere": ["Healing effect increases by 10%. Next healing effect increases the target's all Elemental DMG and Resistance by 10% for 5s. 8s cooldown.", "Each healing cast will charge up the drone. When the drone is fully charged, the next healing effect will consume all charged energy to summon an elemental drone. The drone automatically follows the ally with the lowest HP percentage, healing allies in a 5m radius for 2% maximum HP per second and increasing their all Elemental DMG by 15% for 5s. 12s cooldown."],
  "Hanna": ["Extra DMG Bonus of 3-Ping skills increases by 25%.", "For every 30s, enters Matrix upon a 3-Ping and gains a random Signal Orb."],
  "Heisen": ["All ATK increases by 3% and Lightning DMG increases by 7%.", "Extra DMG Bonus increases by 10%. Attacking a target will inflict them with Electrocute, reducing their Lightning Resistance by 15% for 8s (10s cooldown on the same target). Attacking targets affected by Electrocute will trigger a Thunderstorm that deals 600% Lightning DMG (6s cooldown on the same target)."],
  "Heraclitus": ["ATK increases by 5% and Fire DMG and Plasma Beam DMG increase by 5%.", "Increase Aura Value accumulation efficiency by 100% and double the multipliers of Signature - Crowd Slash and Signature - Eclipse Daybreak."],
  "Herschell": ["ATK increases by 5% and Lightning DMG and Ignition DMG increase by 5%.", "Thunderfire Domain and Blazing Astral Domain inflict Resistance Reduction while dealing damage for 8s. QTE continuous damage also applies Resistance Reduction for 2s. Base DMG of Cosmic Starstrike and Starshard Slash is doubled, and casting them grants two Signal Orbs, prioritizing 3-Ping Orb combinations."],
  "Hervor": ["ATK increases by 5%. Fire DMG and Darkflow DMG increase by 5%.", "Gains 3 bonus Blue Orbs after casting Scorched in Void. Doubles the bonus Absolute Pyre duration granted by pinging a set of Red Orbs."],
  "Isabel": ["ATK increases by 5% and Ice DMG increases by 7%.", "Frost-Treated Blade: Quench deals 15% more Base DMG."],
  "Jack": ["ATK increases by 5% and Fire DMG increases by 7%.", "Basic Attack combo has 10% more Extra DMG Bonus and returns 10 bonus Deception Points."],
  "Jeanne": ["ATK increases by 5%. Dark DMG and Raydiance DMG increase by 5%.", "Severed Sea DMG is doubled. When casting Corrosive Chain, gains 10 Prayer stacks per Commandment point consumed. Consuming 9 Commandment points grants an additional 45 Prayer stacks and triggers Matrix if it is not on cooldown."],
  "Ji Bo'an": ["ATK increases by 5% and Ice DMG increases by 5%.", "The Base DMG multiplier of Will Bearer, Snow Drifter, and Mountain Caller increases by 100%. Sovereign's Presence's DMG multiplier is doubled."],
  "Joanna": ["ATK increases by 5%. Ice DMG and Raydiance DMG increase by 5%.", "Digital Space: Flash Retention DMG increases by 125%. Digital Space: Barrier Rift DMG doubles."],
  "Keats": ["Physical DMG and Ignition DMG increase by 5%. Extra DMG Bonus increases by 5%. When Veronica restores HP to allies, allies gain the Deep Penetration effect that increases CRIT DMG by 20%, as well as 75% CRIT Rate, lasting 8s. Duration resets every time it is triggered.", "Clearing Red Orbs with Heavy Edge grants Signature Energy. Each Red Orb cleared grants 5 Purge Value. When 9 or more Red Orbs are cleared in a single instance, each Red Orb beyond the 9th grants an additional 5 Purge Value. Base DMG of Raging Thornfire and Severing Domain increases by 50%. During Execution, each Purge Value consumed increases Ruinous Ember's Base DMG by 0.5%, up to a maximum of 50%. This enhancement resets when exiting the battlefield or casting Ruinous Ember."],
  "Klenova": ["Ice DMG increases by 5% and Glaciation DMG increases by 10%.", "When there are Ice Spikes, ATK increases by 5% and Glaciation DMG increases by 10%."],
  "Koya": ["Extra DMG increases by 10%.", "Gains 20% energy when switched in. Signal Orb Skill DMG increases by 10% while a shield exists."],
  "Leeuwenhoek": ["ATK increases by 3% and Physical DMG increases by 7%", "The effect of Piercing Blow launched by Rosetta: Rigor increases by 20%. Attacks at targets hit by Piercing Blow will deal 5% more damage."],
  "Liliana": ["ATK increases by 5% and Extra DMG increases by 5%.", "Extra DMG increases by 10% in Matrix."],
  "Liston": ["Ice DMG increases by 10%. Casting [QTE - Point Blank] triggers [Frozen Zone] for 8s. Duration resets every time it is triggered.", "When [QTE - Frozen Zone]/[Signature - Frozen Zone] deals DMG, triggers Frost Corrosion and reduces the target's Ice Resistance for 2s/8s. Duration resets every time it is triggered. In Repeater Mode, each shot adds an extra stack of Maim, with a stacking limit of 24. When casting Destructive Wave, the Base DMG increase effect of each Correction Projectile increases to 10%."],
  "Lucrezia": ["Lightning DMG increases by 10%.", "Upon triggering Chord, gain bonus 15 energy and 10% Extra DMG Bonus for 5s."],
  "Marco": ["Deals 7% more Physical DMG and 5% more Basic Attack DMG.", "When Pulao: Dragontoll catches Dragon Axe while being hit, removes her own Hit status and throws it again. Meanwhile, removes the red penalty on the Dodge Gauge and restores 250 Dodge Gauge value."],
  "Mousme": ["Ice DMG increases by 10%.", "Doubles the DMG dealt by Red Dwarf's Gaze, Brown Dwarf's Monologue, Blue Dwarf's Tears, and Ribbon Circuit. Light-Catching Energy gained from Dust Convergence and Astral Oath is doubled."],
  "Natasha": ["ATK increases by 5%. Lightning DMG and Darkflow DMG increase by 5%.", "Enhanced Base DMG effect of Delicate Heart doubles."],
  "Nimue": ["ATK increases by 5%. Dark DMG and Ultima Slash DMG increase by 5%.", "In Nessos Mimic, Signature Energy gained is doubled; the Signature Base DMG boost from consuming Overridden Blessing is doubled (up to 90% increase)."],
  "Patton": ["ATK increases by 3% and Physical DMG increases by 7%.", "Extra DMG Bonus increases by 10%. Attacking a target will inflict them with Impale, reducing their Physical Resistance by 7% for 8s (10s cooldown on the same target). Attacking targets affected by Impale will trigger an Explosion that deals 600% Physical DMG (6s cooldown on the same target)."],
  "Pavlichenko": ["ATK increases by 5%. Ice DMG and Ignition DMG increase by 5%.", "Multiplier of Signature - Silenced Abysslight doubles."],
  "Pesanteur": ["ATK increases by 5%. Dark DMG and Ultima Slash DMG increase by 5%.", "Abyssal Tactics and Abyssal Tactics: Combo deal 50% more Extra DMG. The Base DMG bonus granted by each stack of Abyssal Beacon increases to 35%. Each time Anabasis enters the battlefield, casting Kindler's Light for the first time restores 2 Kindler's Orbs."],
  "Philip II": ["Increase Heal by 10%. Healing allies increases their Physical DMG and DEF by 10% for 5s (CD: 8s).", "A healing drone will be charged when healing is performed. When fully charged, the next time you performing healing will consume all charged energy to summon the healing drone. It will follow an ally with the lowest HP percentage, healing allies in a 5m radius for 2% maximum HP per second and increasing their Physical DMG by 15% for 5s. 12s cooldown."],
  "Poincare": ["Dark DMG increases by 5% and Darkflow DMG increases by 10%.", "When casting a Signature Move, ATK increases by 5% and Darkflow DMG increases by 10% for 10s. Duration resets every time it is triggered."],
  "Santiago": ["ATK increases by 5%. Physical DMG and Darkflow DMG increase by 5%.", "The Piercing Strike effect applied by Karenina: Effulgence is increased by 20%. Base DMG of Boundless Deluge is increased by 100%."],
  "Seraphine": ["ATK increases by 5% and Dark DMG increases by 5%.", "A random Reprise deals 100% more damage. Allies healed by Selena: Capriccio gain a Dark Radiation effect of dealing 10% more Dark DMG for 8s. The duration will be reset every time the effect is triggered."],
  "Shakespeare": ["All ATK increases by 3% and Fire DMG increases by 7%.", "Extra DMG Bonus increases by 10%. Attacking a target will inflict them with Burn, reducing their Fire Resistance by 15% for 8s (10s cooldown on the same target). Attacking targets affected by Burn will trigger an Explosion that deals 600% Fire DMG (6s cooldown on the same target)."],
  "Shelley": ["Lightning DMG increases by 10%.", "Gains Super Armor when casting a 3-Ping and Combo Strike. Whenever taking DMG during a 3-Ping, Gear-Break Combo, or Assault-Rising Combo, loses Dodge Gauge instead of HP until the DMG taken exceeds the available Dodge Gauge."],
  "Signa": ["Physical DMG increases by 5% and Extra DMG Bonus increases by 5%.", "The Base DMG of Imprisoning Co-Strike and Soulbreaking Co-Strike increases by 100%. Allies healed by Echo gain an extra 20% CRIT DMG and 75% CRIT Rate for 8s. Triggering this effect again will renew its duration."],
  "Sothoth": ["Nihil DMG increases by 10%.", "Casting Phantom Annihilation grants 18/36/36/36/54 Collapse Points based on the hit count. Casting Ethereal Mirage grants 150 Phantom Points immediately. Casting Dimensional Collapse increases the Base DMG of the next Signature - Silent Punishment by 100%. When hitting enemies with Hyperspace Realm as a Tank/Breaker, reduces enemy Elemental Resistance based on Observation Notes. When Hyperspace Realm is active, as an Amplifier/Overlinker, heals allies for 8% of ATK per second and increases their Elemental DMG based on Observation Notes."],
  "Tifa": ["ATK increases by 5% and Lightning DMG increases by 5%", "DMG from Spear Lunge increases by 50%. Victorious War Flag causes Turbulence Interference on the target for 2s. Refreshes every time it is triggered. Basic DMG from Lightning Fall increases by 100%."],
  "Turing": ["Fire DMG increases by 10%.", "Hypermatrix Strike and Signature - Collapsing Realm's Base DMG increases by 100%. Casting Hypermatrix Strike in Hypermatrix increases the duration of Hypermatrix by 1s."],
  "Unimate": ["Increases Fire DMG by 10%.", "Oops! Missed it!/\"Perfect!\"/Burning Blow deals 100% more Base DMG. Nanami: Starfarer's QTE Skill will inflict Scorching Invasion that reduces the target's Fire Resistance by 15% upon hitting it for 8s."],
  "Wilde": ["Lightning DMG increases by 5% and Plasma Beam DMG increases by 10%.", "ATK +5% and Plasma Beam DMG +10% during Electric Storm Flash."],
  "Wu'an": ["Basic Attack's Extra DMG Bonus increases by 5%, Physical DMG increases by 7%.", "The Super Armor of Sweeping Tempest lasts 2s longer. Physical DMG increases by 15% while Super Armor is active."]
};

// [owner, weapon name, weapon type, image path, effect, optional rank]
// Standalone 5-star weapons have no frame owner, so they appear only in All.
const FIVE_STAR_WEAPONS = [
  ["", "Abyss Forgefire", "", "assets/weapons/5stars/e2heavycrossmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Animus", "", "assets/weapons/5stars/e2ballrobotmd020011.png", "When No. 21: XXI uses a Shadow Prism attack or interrupts an enemy, the Co-Bot releases a Force Wave for 50% AoE Dark DMG (1s cooldown). Twilight Matrix and Resonance Pulse gain 10% Extra DMG Bonus.", 5],
  ["", "Base Fog", "", "assets/weapons/5stars/e2chainsawmd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Bipolar Star Rift", "", "assets/weapons/5stars/e2wandmd020011.png", "After making a Prayer, gain 15% Extra DMG Bonus for 10s.", 5],
  ["", "Blooming Rose", "", "assets/weapons/5stars/e2luolanmd020011.png", "Using a valid combo twice within 6s grants +10% All DMG for 5s; triggering it again refreshes the duration.", 5],
  ["", "BX-02M Fellfrost", "", "assets/weapons/5stars/e2ssalphamd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Celestial Reflection", "", "assets/weapons/5stars/e2keywandmd020011.png", "Grants +10% Nihil DMG.", 5],
  ["", "Clock Hands", "", "assets/weapons/5stars/e2kurumimd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Comet's Edge", "", "assets/weapons/5stars/e2bangbinatamd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Crowned Laurel", "", "assets/weapons/5stars/e2lyreswordmd020011.png", "Grants +10% Physical DMG.", 5],
  ["", "Cruel Oath", "", "assets/weapons/5stars/e39smd010011.webp", "Overclock Indicator DMG increases by 10%.", 5],
  ["", "Cyan Blossom", "", "assets/weapons/5stars/e2lotusblademd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Dark Moon", "", "assets/weapons/5stars/e2circlemd020011.png", "Grants +10% Nihil DMG.", 5],
  ["", "Death's Plume", "", "assets/weapons/5stars/e2sicklemd020011.png", "Grants +10% Nihil DMG.", 5],
  ["", "Despair Breaker", "", "assets/weapons/5stars/e2hammermd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Devil Hunter Sword", "", "assets/weapons/5stars/e3ddevilsworddantemd010011.png", "Grants +10% Fire DMG.", 5],
  ["", "Dual Rainbows", "", "assets/weapons/5stars/e2beamlancemd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Dynamo Greatsword", "", "assets/weapons/5stars/e2claymoremd050011.png", "Attacks have a 10% chance to send out a shockwave that deals 100% Physical DMG to nearby enemies.", 5],
  ["", "Eternal Peace", "", "assets/weapons/5stars/e2revolvermd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "FA2D-AP", "", "assets/weapons/5stars/e2riflemd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Falcon E-3320", "", "assets/weapons/5stars/e2bowmd050011.png", "When no enemies are within 2m, gain 10% CRIT Rate and 10% CRIT DMG.", 5],
  ["", "Fiery Twilight", "", "assets/weapons/5stars/e2bladespearmd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Firecrackers", "", "assets/weapons/5stars/e2sleevemd110011.png", "While Artillery Tactics or Thermal Armament is active, dealing DMG triggers an explosion at the target for 250% total Physical DMG (10s cooldown).", 5],
  ["", "FPT-II - Mod", "", "assets/weapons/5stars/e2armmd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Glazed Enigma", "", "assets/weapons/5stars/e2brollymd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Glimpse", "", "assets/weapons/5stars/e2kamumd020011.png", "After a 3-Ping, gain 12% Extra DMG Bonus for 4s.", 5],
  ["", "Glorious Knight", "", "assets/weapons/5stars/e2lancemd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Guardian Mount", "", "assets/weapons/5stars/e2floatmd050011.png", "Gain 1 random Signal Orb for every 30 combos (8s cooldown).", 5],
  ["", "Guiyun", "", "assets/weapons/5stars/e2qumd020011.png", "After using a Blue Orb skill, gain 10% Physical DMG for 5s; further triggers refresh the duration.", 5],
  ["", "Kara Type 1 Gunblade", "", "assets/weapons/5stars/e2gunblademd020011.png", "After a 3-Ping, gain 5% All DMG for 5s.", 5],
  ["", "Kuji no Sada", "", "assets/weapons/5stars/e2swordmd050011.png", "Attacks have a 20% chance to call down a lightning strike for 50% Physical DMG (3s cooldown).", 5],
  ["", "Lethal Shadow", "", "assets/weapons/5stars/e2pistolmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Lightning Spark", "", "assets/weapons/5stars/e2sawmd050011.png", "Attacks have a 30% chance to inflict Broken Armor, lowering the target's DEF by 5% for 3s. It stacks up to 5 times, and further triggers refresh the duration.", 5],
  ["", "Magma Pillar", "", "assets/weapons/5stars/e2sleevemd050011.png", "After a 3-Ping, gain 12% ATK for 4s; further triggers refresh the duration.", 5],
  ["", "Marrow's Glimmer", "", "assets/weapons/5stars/e2gymnasticmd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Mirage Halberd", "", "assets/weapons/5stars/e2halberdmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Mist Netherlight", "", "assets/weapons/5stars/e2tachiamd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Moonside Petal", "", "assets/weapons/5stars/e2pipamd020011.png", "Grants +10% Physical DMG.", 5],
  ["", "Neapolitan Solo", "", "assets/weapons/5stars/e2fluntmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Night Sunderer", "", "assets/weapons/5stars/e2chainswordmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "Nuclear Meltdown δ", "", "assets/weapons/5stars/e2superlimd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Odette", "", "assets/weapons/5stars/e2cellomd020011.png", "A 3-Ping grants 3% ATK for 5s, stacking up to 5 times; new triggers refresh the duration.", 5],
  ["", "Pale Plume", "", "assets/weapons/5stars/e2sabremd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Phoenix Edge", "", "assets/weapons/5stars/e2jianmd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Polar Night", "", "assets/weapons/5stars/e2bigswordmd020011.png", "Grants +5% ATK and +10% CRIT DMG.", 5],
  ["", "Progressive Knife", "", "assets/weapons/5stars/e2nuoanmd020011.png", "Signal Orb ping DMG increases by 20%.", 5],
  ["", "Raijin", "", "assets/weapons/5stars/e2packmd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Ray Slasher", "", "assets/weapons/5stars/e2greatswordmd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Red Shift", "", "assets/weapons/5stars/e2cuttingmd020011.png", "Grants +10% Fire DMG.", 5],
  ["", "Red Sprite", "", "assets/weapons/5stars/e2alphamd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Returning Wind", "", "assets/weapons/5stars/e2fanmd020011.png", "Grants +10% Physical DMG.", 5],
  ["", "Reversal Node", "", "assets/weapons/5stars/e2lamiyamd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "RL-03C Black Spike", "", "assets/weapons/5stars/e2spearmd020011.png", "After casting a small-, medium-, or wide-area electromagnetic beam, gain 10% ATK for 3s; further triggers refresh the duration.", 5],
  ["", "Rock Cannon", "", "assets/weapons/5stars/e3rockcannon5md010011.png", "Grants +10% Fire DMG.", 5],
  ["", "Skybound Beats", "", "assets/weapons/5stars/e2shoesmd020011.png", "Grants +10% Ice DMG.", 5],
  ["", "Skyradiance", "", "assets/weapons/5stars/e2dragonlancemd020011.png", "Grants +10% Physical DMG.", 5],
  ["", "Solar Ring", "", "assets/weapons/5stars/e2ringmd020011.png", "Pinging three Signal Orbs of different colors within 6s grants 15% All DMG for 8s.", 5],
  ["", "Sparkle ZL-09 - Mod", "", "assets/weapons/5stars/e2swordaxemd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Spindrift Shimmer", "", "assets/weapons/5stars/e2anchormd020011.png", "Grants +10% Physical DMG.", 5],
  ["", "Star Of Bethlehem", "", "assets/weapons/5stars/e2claymoremd110011.png", "3-Pings create an aura that grants 8% ATK and Movement Speed for 15s (30s cooldown).", 5],
  ["", "Stone Heart", "", "assets/weapons/5stars/e2daggermd050011.png", "Performing consecutive 3-Pings grants 15% Extra DMG Bonus for 5s; further triggers refresh the duration.", 5],
  ["", "Trio-Claws", "", "assets/weapons/5stars/e2clawmd020011.png", "Grants +10% Lightning DMG.", 5],
  ["", "Type-4O Lance", "", "assets/weapons/5stars/e3a2md010011.png", "Deploying POD: Shield grants A2 10% Physical DMG; sliding for 1s raises the bonus by another 5%.", 5],
  ["", "Virtuous Contract", "", "assets/weapons/5stars/e22bmd010011.webp", "Grants +10% Physical DMG while in Battle Stance.", 5],
  ["", "White Night's Noise", "", "assets/weapons/5stars/e2headsetmd020011.png", "Grants +10% Dark DMG.", 5],
  ["", "White Qilin", "", "assets/weapons/5stars/e2glovemd020011.png", "After dodging, gain 8% Extra DMG Bonus for 4s.", 5],
  ["", "Whitefrost Ruler", "", "assets/weapons/5stars/e2boomerangmd020011.png", "Signature - Spirit Blade Dance gains 20% Base DMG.", 5],
  ["", "Yamato - Kageuchi", "", "assets/weapons/5stars/e2vyamatomd020011.png", "Grants +5% ATK and +10% CRIT DMG.", 5],
  ["", "Yuan Night", "", "assets/weapons/5stars/e2daggermd090011.png", "Dealing DMG has a 20% chance to release a Yuanxiao for 15% Physical DMG (1s cooldown).", 5],
];

const WEAPONS = [
  ["Adelyde: Anabasis", "Unforsaken Beacon", "Cross Cannon", "adelyde-anabasis/Arma - Adelyde Anabasis.webp", "ATK increases by 10%. Consuming Echo Points doubles the Base DMG bonus for Burst Mode, Suppression Mode, Lightpierce Form, and Pressure Form."],
  ["Alisa: Echo", "Astraea", "Bow", "alisa-echo/Arma - Alisa Echo.png", "Increases ATK by 10%. Base DMG of Signature - Celestial Edge increases by 15%. Each time Splendor Points are full, one random Signal Orb and one Cipher Orb of the same color will be generated. Ultralimit Torque now increases Physical DMG by 20%."],
  ["Ayla: Brilliance", "Faded Color", "Scythe", "ayla-brilliance/Arma - Ayla Brilliance (5).png", "QTEs and 3-Pings grant 10% Extra DMG Bonus for 4s; further triggers refresh the duration."],
  ["Bianca: Crepuscule", "Aurora", "Lashblade", "bianca-crepuscule/Arma - Bianca Crepuscule.png", "ATK increases by 10%. Gains 1 Signal Orb for every 3 Commandment consumed, up to 12 per entry."],
  ["Bridget: Ardeo", "Everburning Ray", "Tactical Tonfas", "bridget-ardeo/Arma - Bridget (5).png", "Grants +10% Fire DMG."],
  ["Discord: Secator", "Spinebreaker", "Scissors", "discord-secator/Arma - Discord (5).png", "Grants +10% Physical DMG."],
  ["Hanying: Solacetune", "Dream Roamer", "Pipa", "hanying-solacetune/Arma - Hanying Solacetune.png", "ATK increases by 10%. The effect of Piercing Blow launched by Hanying: Solacetune increases by 20%. Casting Jade Bloom continuously will stack damage up to 3 times instead. Triggering Ethereal Symphony grants additional 50 Sharp Reserve."],
  ["Hanying: Zitherwoe", "Perpetuity", "Folding Fan", "hanying-zitherwoe/Arma - Hanying Zitherwoe.png", "ATK increases by 10%. During the action of pinging any orb, Hanying: Zitherwoe is able to immediately cast another ping for once only. The Base DMG Increase effect of each stack of Emerald Flow increases to 40%."],
  ["Helentine: Lacrimosa", "Hear the Bell", "Folding Buzzsaw", "helentine-lacrimosa/Arma - Helentine Lacrimosa.webp", "ATK increases by 10%. The first two casts of Scrutiny and Manifest upon each switch-in grant 3 orbs. Extra DMG of Metaphor Surge increases by 50%, and Extra DMG of Scrutiny, Cathexis, and Regression increases by 100%. Each stack of Metaphor increases the Base DMG boost effect of Illusory Vision to 30%."],
  ["Ishmael: Parhelion", "Alpha-Omega", "Keystaff", "ishmael-parhelion/Arma - Ishmael Parhelion.png", "ATK increases by 10%. Signature - Prime Entity immediately grants 3 Signal Orbs. Entering the field grants up to 6 Signal Orbs each time. Observation notes increases Elemental Resistance Reduction/DMG Bonus by an additional 10%."],
  ["Kamui: Aeternion", "Solar Flare", "Kinetic Greatsword", "kamui-aeternion/Arma - Kamui Aeternion.png", "ATK increases by 10%. Base DMG of Signature - Molten Heart doubles. Casting Signature - Molten Heart grants 3 Signal Orbs. This effect can trigger at most twice each time Aeternion enters the battlefield."],
  ["Karenina: Effulgence", "Star of Niflheim", "Drift Anchor", "karenina-effulgence/Arma - Karenina Effulgence.webp", "ATK increases by 10%, and the Piercing Strike effect applied by Karenina: Effulgence is increased by 20%. After entering the battlefield, the first Surge Breach that consumes 300 or more Tidal Force grants 6 Signal Orbs. The effect of consuming Tidal Force to boost Surge Breach's Base DMG is doubled."],
  ["Kurumi Tokisaki", "Hour & Minute", "Zafkiel - Dual Guns", "kurumi-tokisaki/Arma - Kurumi Tokisaki.webp", "ATK increases by 10%. Phantom and Signature - Angel of Time: Zafkiel deal 50% more DMG. When Bullet Brand is active, Aleph, Dalet, and Het deal 50% more DMG. Gains 1 stack of Imprint upon first deployment. After casting Phantom, gains 2 Signal Orbs, up to 4 per deployment."],
  ["Lee: Hyperreal", "Key of Tempus Gate - Stokes", "Composite Armaments", "lee-hyperreal/Arma - Lee Hyperreal.png", "ATK increases by 10%. Casting Realm Travel will trigger Matrix if it is not on cooldown. The first Hypermatrix Strike launched upon entering battle will generate 1 extra Sight Point."],
  ["Lee: Palefire", "Gloomlight", "Dual Guns", "lee-palefire/Arma - Lee Palefire (5).png", "Pinging all three Signal Orb colors within 5s grants 15% Extra DMG Bonus for 5s; repeat triggers refresh the duration."],
  ["Leia: Fortunaster", "Edges of the Twisted Ribbon", "Rhythmic Ray", "leia-fortunaster/Arma - Leia Fortunaster.png", "ATK increases by 10%, and the damage dealt by Ring Theorem is doubled. While holding a Photonic Mark, the damage dealt by Signature - Stardust of the Luminous Waltz is doubled."],
  ["Lilith: Daemonissa", "Sorrow of Fata Morgana", "Moon Umbrella", "lilith-daemonissa/Arma - Lilith Daemonissa.png", "Gains 10% ATK. When casting Dreamfall Showdown at Card Rank B, gains 12 Signature Energy."],
  ["Liv: Limpidity", "Ripples of the Aloft Sea", "Lotus Wheel", "liv-limpidity/Arma - Liv Limpidity.png", "ATK increases by 10%. Thousand Rays and Dawn Dream deal 50% more damage. When casting Signature - Mirrored Renewal, gains 2 Signal Orbs; if having 12 stacks of Delicate Heart when casting, gains 1 additional Signal Orb."],
  ["Lucia: Inverse Crown", "Lightless Dusk", "Cylinder Katana", "lucia-inverse-crown/Arma - Lucia Inverse Crown.webp", "ATK increases by 10%. Gain 360 Blade Intent upon deployment. Gains Blade Mark upon deployment or after casting Relinquish. Gains a set of Signal Orbs when casting fully charged Sonance or Outro while Blade Mark is active. (Can obtain up to 6 Signal Orbs this way per deployment.) In each battle, the finishing hit of the first Myriad Calamity cast deals 100% more Base DMG."],
  ["Lucia: Pyroath", "Flamewing of Dawn", "Pyro Katana", "lucia-pyroath/Arma - Lucia Pyroath.webp", "ATK +10%. Recover 3 Signal Orbs after casting Signature - Crowd Slash. Entering Fire Thunder Form will trigger Matrix if it is not on cooldown."],
  ["Luna: Oblivion", "Reconstruction of Law", "Chakram", "luna-oblivion/Arma - Luna Oblivion.png", "ATK increases by 10%. After a 3-Ping or casting Shattering Moon with maximum Crescent Points, the next ping is regarded as a 3-Ping. Gains Crescent Points 50% faster."],
  ["Nanami: Startrail", "Starlight Glare", "Shield Axe", "nanami-startrail/Arma - Nanami Startrail.png", "Increases ATK by 10%. Overload doubles Base DMG effect of Meteoric Doom. Base DMG of Blazing Rift doubles."],
  ["Nirvatia: Dirge", "Obituary for Yesterday", "Judgment Scythe", "nirvatia-dirge/Arma - Obituary for Yesterday..webp", "ATK increases by 10%. Flock effect doubled. Hanging Phantom Extra DMG increases by 100%."],
  ["No.21: Feral", "Managarm", "Claw Blades", "no21-feral/Arma No.21 Feral.png", "ATK increases by 10%. Restores 1 set of random 3-Ping Orbs each time No. 21: Feral enters the battle. The Lightning DMG Bonus from Lightning Surge increases to 20%."],
  ["Qu: Shukra", "Akasha Keyblade", "Longsword", "qu-shukra/Arma - Qu Shukra.png", "ATK increases by 10%. Upon activating Into the Fray, triggers Matrix if it is not in cooldown and grants a bonus Inscription. When casting Mountain Caller, each attack grants 3 extra Signature Energy."],
  ["Rosetta: Arete", "Mirage Halberd: Amalga", "Radiant Halberd", "rosetta-arete/Arma - Mirage Alberd.webp", "ATK increases by 10%. Base DMG of Twin Rotation increases by 100%. Sin Engraving's DMG boost increases by 50%."],
  ["Selena: Pianissimo", "Orpheus' Lullaby", "Bowstring Rapier", "selena-pianissimo/Arma - Selena Pianissimo.png", "Increases ATK by 10%. If Echoing Melody's Base DMG has been enhanced at the cost of Musical Notes, the next Rhythmic Piercing cast will enjoy the same amount of Base DMG Bonus. Casting Signature - Rainy Prelude will grant 3 Signal Orbs. Selena: Pianissimo gains up to 6 Signal Orbs every time upon entering the battlefield."],
  ["Teddy: Spectre", "Neon Wayfarer", "Digital Warboots", "teddy-spectre/Arma - Teddy Spectre.png", "ATK increases by 10%. While in Data Domain, Extra DMG Bonus increases by 35%. When Teddy: Spectre casts Signature - Data Domain: Barrier Rift without carrying an Exposure Mark, she gains 1/2/3 background Signature charges based on the number of Neon Orb colors recorded. Each time allies cast their Signature Move, she gains 75 Signature Energy, up to three times. When switched in, if there is sufficient Signature Energy, she automatically casts Data Domain: New Dimension Expansion. If Teddy: Spectre enters battle carrying an Exposure Mark, Extra DMG Bonus of Pulse Noise Penetration increases by 100%."],
  ["Vera: Geiravor", "Deathless Flame", "Dual-Bladed Lance", "vera-geiravor/Arma - Vera Geiravor.png", "ATK increases by 10%. Base DMG of Scorched in Void doubles."],
  ["Vergil", "Yamato", "Yamato", "vergil/Arma - Vergil.png", "Deals 30% more CRIT DMG. Triggers Matrix if it is not on cooldown when casting Sin Devil Trigger. Doubles the JCE Points acquisition efficiency."],
  ["Veronica: Aegis", "Empyrean Wrath", "Lance", "veronica-aegis/Arma - Veronica Aegis.png", "ATK increases by 10%. Heavy Edge and Piercing Judgement grant double Rekindle stacks. The first Heavy Edge cast upon entering the field grants additional 25 Purge Value."],
  ["Wanshi: Lucid Dreamer", "Renewed Dawn", "Revolver", "wanshi-lucid-dreamer/Arma - Wanshi Lucid Dreamer.png", "ATK increases by 10%. Doubles the Base DMG of Flurry Blitz, Frosty Barrage, and Snow Storm."],
  ["Watanabe: Epitaph", "Dark Falcon", "Trailblade", "watanabe-epitaph/Arma - Watanabe Epitaph.png", "ATK increases by 10%. Upon entering the Assault Mode, gains 3 Red Orbs, up to 6 orbs each time when entering the battlefield. Can quickly cast Scorching Torrent after pinging Red Orbs."],
  ...FIVE_STAR_WEAPONS,
];

// Memory stats: [ATK, DEF, CRIT, HP]. Source: https://grayravens.com/wiki/Memories/Omniframe_Memories and .../Uniframe_Memories
const MEMORY_STATS = {
  "Frederick": [136, 223, 64, 1446], "Cottie": [135, 223, 66, 1453], "Hanna": [129, 223, 67, 1453], "Darwin": [129, 218, 67, 1491],
  "Condelina": [132, 223, 67, 1461], "Guinevere": [132, 223, 64, 1528], "Philip II": [132, 223, 66, 1491], "Einsteina": [132, 219, 66, 1521],
  "Catherine": [135, 228, 66, 1491], "Gloria": [107, 177, 53, 1232], "Da Vinci": [135, 218, 66, 1491], "Clusius": [132, 223, 66, 1491], "Bunsen": [132, 223, 66, 1491],
  "Poincare": [132, 223, 66, 1491], "Klenova": [132, 223, 66, 1491], "Wilde": [132, 223, 66, 1491], "Santiago": [132, 223, 66, 1491],
  "Keats": [132, 223, 66, 1491], "Burana": [132, 223, 66, 1491], "Chang Wuzi": [132, 223, 66, 1491], "Signa": [132, 223, 66, 1491],
  "Charlotte": [132, 223, 66, 1491], "Leeuwenhoek": [133, 223, 64, 1506], "Patton": [132, 223, 67, 1453], "Feynman": [132, 223, 66, 1491],
  "Hervor": [132, 223, 66, 1491], "Heraclitus": [132, 223, 66, 1491], "Alphonse": [132, 223, 66, 1491], "Turing": [132, 223, 66, 1491],
  "Unimate": [133, 226, 64, 1506], "Elizabeth": [132, 223, 66, 1491], "Shakespeare": [134, 223, 64, 1491], "Pavlichenko": [132, 223, 66, 1491],
  "Joanna": [132, 223, 66, 1491], "Liston": [132, 223, 66, 1491], "Ji Bo'an": [132, 223, 66, 1491], "Aline": [132, 223, 66, 1491],
  "Chen Jiyuan": [134, 223, 64, 1491], "Mousme": [132, 223, 66, 1491], "Cogito": [132, 223, 66, 1491], "Natasha": [132, 223, 66, 1491],
  "Herschell": [132, 223, 66, 1491], "Fran": [132, 223, 66, 1491], "Diesel": [132, 223, 66, 1491], "Tifa": [137, 221, 65, 1506],
  "Heisen": [134, 219, 66, 1491], "Pesanteur": [132, 223, 66, 1491], "Nimue": [132, 223, 66, 1491], "Jeanne": [132, 223, 66, 1491],
  "Barcelo": [132, 223, 66, 1491], "Derketo": [132, 223, 66, 1491], "Boone": [134, 228, 62, 1506], "Seraphine": [133, 221, 66, 1521],
  "Flamel": [132, 223, 66, 1536], "Bathlon": [134, 223, 64, 1453], "Bulgakov": [132, 223, 66, 1491], "Sothoth": [132, 223, 66, 1491],
  "Cleopatra": [132, 223, 66, 1491], "Liliana": [132, 223, 66, 1491], "Shelley": [132, 223, 66, 1491], "Isabel": [136, 223, 62, 1521],
  "Marco": [132, 223, 66, 1491], "Jack": [132, 223, 66, 1491], "Lucrezia": [134, 217, 66, 1506], "Wu'an": [134, 219, 66, 1476],
  "Koya": [134, 223, 66, 1491]
};

// Weapon stats: [ATK, CRIT]. Source: https://grayravens.com/wiki/Weapons/6%E2%98%85_Weapons
const WEAPON_STATS = {
  "Unforsaken Beacon": [436, 249], "Astraea": [436, 249], "Purple Peony": [425, 249], "Aurora": [436, 249],
  "Cestus": [436, 244], "Osseous Guillotine": [436, 249], "Dream Roamer": [436, 249], "Perpetuity": [415, 249],
  "Hear the Bell": [436, 249], "Alpha-Omega": [436, 249], "Solar Flare": [436, 249], "Star of Niflheim": [436, 249],
  "Hour & Minute": [436, 249], "Key of Tempus Gate - Stokes": [484, 241], "Wolf Fang": [458, 249], "Edges of the Twisted Ribbon": [436, 249],
  "Sorrow of Fata Morgana": [436, 249], "Ripples of the Aloft Sea": [436, 249], "Lightless Dusk": [436, 249], "Flamewing of Dawn": [436, 249],
  "Reconstruction of Law": [436, 249], "Starlight Glare": [436, 249], "Obituary for Yesterday": [436, 249], "Managarm": [458, 249],
  "Akasha Keyblade": [467, 241], "Mirage Halberd: Amalga": [436, 249], "Orpheus' Lullaby": [436, 249], "Neon Wayfarer": [436, 249],
  "Deathless Flame": [436, 249], "Yamato": [436, 249], "Empyrean Wrath": [436, 249], "Renewed Dawn": [436, 249],
  "Dark Falcon": [436, 249],
// 5-star weapon stats: [ATK, CRIT]. Source: https://grayravens.com/wiki/Weapons/5%E2%98%85_Weapons
  "Abyss Forgefire": [354, 201], "Animus": [368, 203], "Base Fog": [354, 201], "Bipolar Star Rift": [386, 201],
  "Blooming Rose": [379, 201], "BX-02M Fellfrost": [354, 201], "Celestial Reflection": [354, 201], "Clock Hands": [365, 203],
  "Comet's Edge": [368, 201], "Crowned Laurel": [354, 201], "Cruel Oath": [361, 205], "Cyan Blossom": [354, 201],
  "Dark Moon": [354, 201], "Death's Plume": [354, 201], "Despair Breaker": [372, 201], "Devil Hunter Sword": [365, 203],
  "Dual Rainbows": [390, 201], "Dynamo Greatsword": [354, 186], "Eternal Peace": [354, 201], "Everburning Ray": [354, 197],
  "FA2D-AP": [368, 201], "Faded Color": [345, 201], "Falcon E-3320": [382, 206], "Fiery Twilight": [354, 201],
  "Firecrackers": [365, 205], "FPT-II - Mod": [354, 201], "Glazed Enigma": [354, 201], "Glimpse": [400, 201],
  "Gloomlight": [372, 201], "Glorious Knight": [365, 205], "Guardian Mount": [336, 201], "Guiyun": [411, 211],
  "Kara Type 1 Gunblade": [361, 206], "Kuji no Sada": [354, 186], "Lethal Shadow": [354, 197], "Lightning Spark": [345, 190],
  "Magma Pillar": [372, 201], "Marrow's Glimmer": [354, 201], "Mirage Halberd": [354, 201], "Mist Netherlight": [354, 201],
  "Moonside Petal": [354, 201], "Neapolitan Solo": [375, 205], "Night Sunderer": [354, 201], "Nuclear Meltdown δ": [393, 195],
  "Odette": [382, 211], "Pale Plume": [354, 201], "Phoenix Edge": [379, 195], "Polar Night": [382, 201],
  "Progressive Knife": [390, 191], "Raijin": [354, 197], "Ray Slasher": [354, 201], "Red Shift": [379, 191],
  "Red Sprite": [393, 195], "Returning Wind": [336, 201], "Reversal Node": [372, 201], "RL-03C Black Spike": [372, 186],
  "Rock Cannon": [365, 203], "Skybound Beats": [354, 201], "Skyradiance": [354, 201], "Solar Ring": [390, 211],
  "Sparkle ZL-09 - Mod": [354, 201], "Spindrift Shimmer": [354, 201], "Spinebreaker": [354, 201], "Star Of Bethlehem": [363, 183],
  "Stone Heart": [372, 209], "Trio-Claws": [372, 201], "Type-4O Lance": [372, 201], "Virtuous Contract": [379, 211],
  "White Night's Noise": [354, 195], "White Qilin": [379, 191], "Whitefrost Ruler": [375, 217], "Yamato - Kageuchi": [365, 203],
  "Yuan Night": [368, 213],
};

// CUB skills by character folder, as [name, effect at level 5], in the order of the files "CUB - Skill 1" to "CUB - Skill 6".
// Source: https://huaxu.app/na/wiki/cubs, matched by icon. Both active skills share one icon, so they share one entry.
const CUB_SKILLS = {
  "leia-fortunaster": [
    ["Ice-Adorned Heart: Ice / Snowbound Pursuit: Ice", "Ice-Adorned Heart: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Vulpecula will appear to the right of the target and fire magic missiles, dealing 2000% Ice DMG once.\n\nSnowbound Pursuit: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Vulpecula will appear to the left of the target, charge forward, leap up, and continuously lash the target with its tail while pulling in enemies, dealing 325% Ice DMG 6 times."],
    ["Astral Duet", "When Fortunaster casts the 4th hit of Ribbon Circuit with Vulpecula equipped, she will summon Vulpecula to launch a joint attack, dealing 3000% Ice DMG once. When casting Ring Theorem, increases ATK by 25% for 8s. Duration resets every time it is triggered."],
    ["Riverfrost", "Increases the carrier's Ice DMG by 10%."],
    ["Frostbound Edge", "Each time Vulpecula casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time the effect is triggered."],
    ["Ceaseless Snowfall", "Increases the carrier's ATK by 100."],
    ["Vulpecula Pact", "Vulpecula's Active Skills deal 70% more damage."]
  ],
  "wanshi-lucid-dreamer": [
    ["Frost Walker: Ice / Scattered Snow: Ice", "Frost Walker: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Snowveil will fly toward the target then crash into the ground, dealing 1800% Ice DMG 1 time.\n\nScattered Snow: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Snowveil will flick its tail to fire crystal shards forward, inflicting nearby enemy units with Rigidity while dealing 200% Ice DMG 7 times. Rigidity: Immobilizes the enemy for 2s."],
    ["Dream Ward", "When Wanshi: Lucid Dreamer enters Calibration Mode with Snowveil equipped, Snowveil will be summoned to assist in attacks, dealing 250% Ice DMG 10 times. Base DMG of Superlink Flight increases by 65%; if Maim has maximum stacks when Superlink Flight is cast, its Base DMG increases by a further 100%. Base DMG of Destructive Wave increases by 75%; if 30 Correction Projectiles are consumed when Destructive Wave is cast, its Base DMG increases by a further 100%."],
    ["Lucent Heart", "Increases the carrier's Ice DMG by 10%."],
    ["Frosty Favor", "Each time Snowveil casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Triggering this effect again will renew its duration."],
    ["Snowdust Blessing", "Increases the carrier's ATK by 100."],
    ["Bright Destiny", "Snowveil's Active Skills deal 70% more DMG."]
  ],
  "selena-pianissimo": [
    ["Valiant March: Physical / Glorious Rondo: Physical", "Valiant March: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Snow Waltz will slash the target, dealing 2050% Physical DMG once.\n\nGlorious Rondo: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Snow Waltz will shoot blades to the surroundings and retrieve them, pulling in nearby enemy units and dealing 1000% Physical DMG twice."],
    ["Resounding Toll", "After Selena: Pianissimo casts Melodic Outburst with Snow Waltz equipped, she will summon Snow Waltz to launch a joint attack, dealing 1000% Physical DMG 3 times. When casting Basic Attack - Echoing Melody, increases ATK by 40% for 8s. Duration resets every time it is triggered."],
    ["Light and Shade", "The carrier deals 10% more Physical DMG. When there are Ice Spikes, the carrier deals 10% more Glaciation DMG."],
    ["Resonant Cheersong", "Each time Snow Waltz casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Victory Anthem", "Increases the carrier's ATK by 100."],
    ["Pre-Battle Bugle", "Snow Waltz's Active Skills deal 70% more DMG."]
  ],
  "helentine-lacrimosa": [
    ["Hermann Grid / Scintillating Grid", "Hermann Grid: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Grand Duke will turn its base toward the target, concentrate energy from the three lamps, and fire a beam at the target, dealing 650% Lightning DMG 3 times.\n\nScintillating Grid: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Grand Duke will fly into the air and extend itself, then spin and fire lasers from each of its three small lamps, strafing targets below and dealing 400% Lightning DMG 5 times."],
    ["Fresnel Lens", "When Lacrimosa casts Deflection, Cathexis, or Regression with Grand Duke equipped, she will summon Grand Duke to launch a joint attack and pull in enemies. Grand Duke flies into the air and launches three sonic attacks in a pendular motion, dealing 1000% Lightning DMG 3 times. Base DMG of Cathexis, Regression, and Metaphor Surge increases by 50%."],
    ["Fluorite Dispersion", "Increases the carrier's Lightning DMG by 10%. If the carrier has the Glaciation effect, Ice DMG increases by 10%."],
    ["Coma Aberration", "Each time Grand Duke casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Iridescence", "Increases the carrier's ATK by 100."],
    ["False Color", "Grand Duke's Active Skills deal 70% more damage."]
  ],
  "lucia-inverse-crown": [
    ["Mistbreak: Ice / Abyssal Dive: Ice", "Mistbreak: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Allos will whip its tail and dash forward to attack enemies while pulling them in, dealing 1000% Ice DMG twice.\n\nAbyssal Dive: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Allos will spin and dive down from the air to attack enemies, dealing 1000% Ice DMG twice."],
    ["Dusky Voyage", "When Inverse Crown casts a fully-charged Sonance or Outro with Allos equipped, she will summon Allos for a joint attack, dealing 1500% Ice DMG 2 times while wielding Odachi, or 1000% Ice DMG 3 times while wielding Kodachi. When performing the final hit of Raze, she summons Allos for a joint attack, dealing 1000% Ice DMG 3 times. While in Abyssborn Form, Base DMG Bonus increases by 20%, or by 30% when carrying Ignition Effect."],
    ["Glacial Embers", "Increases the carrier's Ice DMG by 10%. Ignition DMG increases by 10%."],
    ["Ultimate Will", "Each time Allos casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Hoarfrost", "Increases the carrier's ATK by 100."],
    ["Unified Intent", "Allos's Active Skills deal 70% more damage."]
  ],
  "teddy-spectre": [
    ["Drive Impact Corner Push: Ice / Headbutt Meaty Attack: Ice", "Drive Impact Corner Push: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Beep-Boop will dash a short distance toward the target and unleash continuous claw strikes, pushing and repelling the target while dealing 175% Ice DMG 6 times along the path. Then performs a slight jump and slams down with both palms, dealing AOE DMG and knocking enemies away, dealing 1000% Ice DMG once.\n\nHeadbutt Meaty Attack: Ice: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Beep-Boop will curl up and spin toward the target to perform a headbutt charge, dealing 150% Ice DMG 9 times. After hitting the first target, Beep-Boop will bounce up, sit down, and fall to the ground, creating a wide-area ground slam that knocks down enemies and deals 650% Ice DMG once."],
    ["Visual Horizon No-Fly Zone", "When Teddy: Spectre casts Data Domain: Barrier Rift with Beep-Boop equipped, she will summon Beep-Boop to launch a joint attack. Beep-Boop charges upward and pierces through the ground, dealing 3000% Ice DMG once. Base DMG of Data Domain: Barrier Rift increases by 100%. Base DMG of Pulse Shockwave increases by 75%."],
    ["Photon-Cooling Cycle", "Increases the carrier's Ice DMG by 10%. Raydiance DMG increases by 10%."],
    ["Negative-Frame Overclocking", "Each time Beep-Boop casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Composite Calculation", "Increases the carrier's ATK by 100."],
    ["Differential Correction", "Beep-Boop's Active Skills deal 70% more damage."]
  ],
  "lucia-pyroath": [
    ["Falling Meteorite: Fire / Soaring Flame: Fire", "Falling Meteorite: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Corvus will circle around the target, dive, and pull in nearby enemies, dealing 1800% Fire DMG once.\n\nSoaring Flame: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Corvus will spit fire at the target from above, dealing 500% Fire DMG 4 times."],
    ["Bright Star", "When Lucia: Pyroath casts Basic Attack - Aura Blast with Corvus equipped, she will summon Corvus to launch a joint attack, dealing 2500% Fire DMG once. Aura Marks will further amplify the Base DMG Boost of Signature - Crowd Slash and Signature - Eclipse Daybreak by 20%."],
    ["Burning Torchlight", "Increases the carrier's Fire DMG by 10%; Lightning DMG during Electric Storm Flash status increases by 10%."],
    ["Wing Blaze", "Each time Corvus casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time the effect is triggered."],
    ["Brilliant Light", "Increases the carrier's ATK by 100."],
    ["Platinum Spark", "Corvus's Active Skills deal 70% more damage."]
  ],
  "vera-geiravor": [
    ["Phantom Pursuit: Fire / Eclipse Bite: Fire", "Phantom Pursuit: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Wrathfang will fire a laser beam, dealing 550% Fire DMG 4 times.\n\nEclipse Bite: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Wrathfang will attack the target with a light blade in its mouth and pull in nearby enemies, dealing 1000% Fire DMG twice."],
    ["Frenzied Hunt", "After Vera: Geiravor casts Hellfire Crucible with Wrathfang equipped, she will summon Wrathfang to launch a joint attack, pulling in nearby enemies and dealing 1500% Fire DMG twice. When she casts Tempered in Midnight, increases Base DMG of Tempered in Midnight by 10%/20%/30%/40%/50%/60% based on the 1/2/3/4/5/6 Yellow Orbs cleared."],
    ["Jagged Assault", "The carrier deals 10% more Fire DMG. If there is at least 1 Darkflow stack, the carrier deals 10% more Dark DMG."],
    ["Nightfall Predation", "Each time Wrathfang casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Blazing Fangs", "Increases the carrier's ATK by 100."],
    ["Blink Mark", "Wrathfang's Active Skills deal 70% more damage."]
  ],
  "watanabe-epitaph": [
    ["Wide-Area Sound Waves: Fire / Proximity Interference: Fire", "Wide-Area Sound Waves: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Shadow Wing will release sound waves to deal damage and pull in nearby enemies, dealing 1650% Fire DMG.\n\nProximity Interference: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Shadow Wing will start to circle, granting the equipped character Shield equal to 200% of its ATK. At the end of the flight, Shadow Wing will spread its wings and deal 750% Fire DMG twice to the area around the target."],
    ["Blazing Chain", "When Watanabe: Epitaph casts Flame Eruption, he will use his grappling hook to link with Shadow Wing and launch a joint attack together in mid-air, during which time Shadow Wing will attack and deal 2500% Fire DMG in total. Thermal Erosion's Base DMG increases by 75%."],
    ["Propelled Incineration", "Increases the carrier's Fire DMG by 10%."],
    ["Output Synchronization", "Each time Shadow Wing casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Triggering this effect again will renew its duration."],
    ["Phantom Guard", "Increases the carrier's ATK by 100."],
    ["Overwatcher", "Shadow Wing's Active Skills deal 70% more damage."]
  ],
  "liv-limpidity": [
    ["Lightning Breath: Lightning / Thunder Pounce: Lightning", "Lightning Breath: Lightning: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Levvi will release a lightning orb that opens up into an electric sphere when it hits the target, dealing 425% Lightning DMG 5 times.\n\nThunder Pounce: Lightning: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Levvi will dive toward the target location and explode on impact, dealing 650% Lightning DMG 3 times."],
    ["Radiant Alliance", "When Liv: Limpidity casts Thousand Rays and the 4th hit of Mirror Blade Orb with Levvi equipped, she will summon Levvi to launch a joint attack, dealing 1000% Lightning DMG 3 times. Base DMG of Signature - Cosmic Rebirth increases by 75%; when casting at max Delicate Heart stacks, it increases by a further 75%."],
    ["Azure Blessing", "The carrier deals 10% more Lightning DMG. If with Darkflow stacks, the carrier deals 10% more Dark DMG."],
    ["Feather Harmony", "Each time Levvi casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Dawn Halo", "Increases the carrier's ATK by 100."],
    ["Prismatic Charge", "Levvi's Active Skills deal 70% more damage."]
  ],
  "nanami-startrail": [
    ["Glowbait Hunt: Lightning / Fin Barrage: Lightning", "Glowbait Hunt: Lightning: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Bramble Angler will charge toward the target and pull in nearby enemies, dealing 1800% Lightning DMG once.\n\nFin Barrage: Lightning: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Bramble Angler will leap in the air, unleash laser, deal 500% Lightning DMG once, and fire missiles, dealing 250% Lightning DMG for 6 times."],
    ["Luminous Tornado", "When Startrail casts Meteoric Doom or an enhanced version of Blazing Rift with Bramble Angler equipped, she will summon Bramble Angler to launch a joint attack, dealing 1250% Lightning DMG twice. Base DMG of Flowing Light, Cosmic Starstrike, and Starshard Slash increases by 60%."],
    ["Cosmic Flame Rift", "Increases the carrier's Lightning DMG by 10%. If the carrier has the Blazing Mark or the Ember Mark, their Fire DMG increases by 10%."],
    ["Fangpierce", "Each time Bramble Angler casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time the effect is triggered."],
    ["Luminase Unravel", "Increases the carrier's ATK by 100."],
    ["Shield Bash Ambush", "Bramble Angler's Active Skills deal 70% more damage."]
  ],
  "bianca-crepuscule": [
    ["Piercing Stings: Dark / Bell's Bane: Dark", "Piercing Stings: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Noctiluca will fling needles at the enemy, dealing 190% Dark DMG 11 times.\n\nBell's Bane: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Noctiluca will perform a ramming attack, hitting enemies along the path and dealing 1950% Dark DMG."],
    ["Crystal Aria", "When Bianca: Crepuscule casts Devouring Sky or Shattering Sky with Noctiluca equipped, she will summon Noctiluca to launch a joint attack. When casting Devouring Sky, Noctiluca deals 1500% Dark DMG twice. When casting Shattering Sky, Noctiluca deals 3000% Raydiance DMG. Base DMG of Shadow Strangle/Ember Extinction increases by 50%/50%. If Prayer stacks are full when cast, increases to 130%/150% instead."],
    ["Luminous Stinger", "Increases the carrier's Dark DMG by 10%. Raydiance DMG increases by 10%."],
    ["Permafrost Hymn", "Each time Noctiluca casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time the effect is triggered."],
    ["Edict's Inscription", "Increases the carrier's ATK by 100."],
    ["Tidal Grace", "Noctiluca's Active Skills deal 70% more damage."]
  ],
  "adelyde-anabasis": [
    ["Crimson Barrage: Dark / Scarlet Pursuit: Dark", "Crimson Barrage: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Kelpie will open fire in rapid succession, dealing 500% Dark DMG 4 times.\n\nScarlet Pursuit: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Kelpie will circle around and gather enemies before leaping out of the water to attack, dealing 175% Dark DMG 12 times."],
    ["Abyssal Hunt Summons", "When Anabasis casts Abyssal Tactics or Abyssal Tactics: Combo with Kelpie equipped, she will summon Kelpie to launch a joint attack, dealing 3000% Dark DMG once. Each time Anabasis enters the battlefield, the first time she switches forms using the Guardian Orb or casts Burst Mode, Suppression Mode, Lightpierce Form, or Pressure Form, increases ATK by 25% for 8s."],
    ["Abyssal Corrosion", "Increases the carrier's Dark DMG by 10%. If the carrier has the Ultima Slash effect, Physical DMG increases by 10%."],
    ["Tidal Aftermath", "Each time Kelpie casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Bloodfin Echo", "Increases the carrier's ATK by 100."],
    ["Core of the Hunt", "Kelpie's Active Skills deal 70% more DMG."]
  ],
  "rosetta-arete": [
    ["Phantom Storm: Dark / Spirit Blast: Dark", "Phantom Storm: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Buzzling will leap above the target and unleash electrical currents, dealing 500% Dark DMG 4 times.\n\nSpirit Blast: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Buzzling will fire a laser forward and pull in enemies, dealing 500% Dark DMG 4 times."],
    ["Overcharged Sync", "When Rosetta: Arete, with Buzzling equipped, casts Decisive Rend, Horizontal Slash or Crescent Cut that consume Light Link, or casts Roaming Hunt, Dominion Sight or Core Vibration that consume Overridden Blessing, she will summon Buzzling to launch a joint attack, dealing 750% Dark DMG 4 times. When casting Twin Rotation, ATK increases by 20% for 5s. Duration resets every time it is triggered."],
    ["Wave Drift", "The carrier deals 10% more Dark DMG. If there is at least 1 Truewill, the carrier deals 10% more Physical DMG."],
    ["Echo Aftershock", "Each time Buzzling casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time the effect is triggered."],
    ["Magnetic Resonance", "Increases the carrier's ATK by 100."],
    ["Signal Amplifier", "Buzzling's Active Skills deal 70% more damage."]
  ],
  "lilith-daemonissa": [
    ["Old Dance: Dark / Joker's Wheel: Dark", "Old Dance: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Billie will leap up and fire at the target, dealing 225% Dark DMG 9 times.\n\nJoker's Wheel: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Billie will dive from midair and summon a wheel to pull in nearby enemies, dealing 150% Dark DMG 9 times. The wheel will then get overloaded and explode, dealing 650% Dark DMG once."],
    ["Good Night, Las Prados", "After starting a Crazy Gamble carrying Billie, Lilith: Daemonissa will summon Billie to launch a joint attack upon casting Night Embrace or Shadow's Guile for the first time, dealing 3000% Dark DMG once. Base DMG of Dreamfall Showdown increases by 75%. When the Card Rank is at C/B/A/S/SS, the Base DMG further increases by 10%/20%/30%/40%/50%."],
    ["Jackpot Winner", "The carrier deals 10% more Dark DMG. If with the Tricker's Mark, the carrier deals 10% more Lightning DMG."],
    ["Generous Gift", "Each time Billie casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Intoxicating Blues", "Increases the carrier's ATK by 100."],
    ["Dazzling Spotlight", "Billie's Active Skills deal 70% more damage."]
  ],
  "kurumi-tokisaki": [
    ["Resplendent Chime: Dark / Bullet Barrage: Dark", "Resplendent Chime: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Zafkiel will gather energy and release a shockwave, dealing 325% Dark DMG 6 times.\n\nBullet Barrage: Dark: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Zafkiel will summon a gun array and open fire, dealing 325% Dark DMG 6 times."],
    ["Declaration of Ruin", "When Kurumi Tokisaki casts Aleph, Dalet, or Het with Zafkiel equipped, she will summon Zafkiel to launch a joint attack, dealing 3000% Dark DMG once. When casting Phantom, increases ATK by 25% for 8s. Duration resets every time it is triggered."],
    ["Twin Paradox", "Increases the carrier's Dark DMG by 10%."],
    ["Ember Scorch", "Each time Zafkiel casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Shadow Dance", "Increases the carrier's ATK by 100."],
    ["Reversed Funeral", "Zafkiel's Active Skills deal 70% more DMG."]
  ],
  "hanying-solacetune": [
    ["Moon Stroll: Physical / Solitary Crane: Physical", "Moon Stroll: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Dreamwing will attack with an energy wave, applying Rigidity to nearby enemies, dealing 250% Physical DMG 6 times. Rigidity: Immobilizes the enemy for 2s.\n\nSolitary Crane: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Dreamwing will fly toward the target then crash into the ground, dealing 450% Physical DMG 4 times."],
    ["Moonlight Follows", "When Hanying: Solacetune deploys Lunartone Field or triggers Ethereal Symphony with Dreamwing equipped, summons Dreamwing to launch a joint attack, dealing 1250% Physical DMG 2 times. The CRIT DMG of Jade Bloom and Ringing increases by 75%."],
    ["River Immortal", "The carrier's Physical DMG increases by 10%."],
    ["Tipsy Flowers", "Each time Dreamwing casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Triggering this effect again will renew its duration."],
    ["Grass Crossing", "Increases the carrier's ATK by 100."],
    ["Spring Excursion", "Dreamwing's Active Skill deals 70% more DMG."]
  ],
  "veronica-aegis": [
    ["Searing Ember", "Increases the carrier's Physical DMG by 10%. If the carrier has Searing Sight or Ember Mark, their Fire DMG increases by 10%."],
    ["Synergetic Enhancement", "When Veronica: Aegis, with Scaled Rampart equipped, casts Piercing Judgment with Sin Mark or casts Torrential Blast for the first time after entering Execution, she will summon Scaled Rampart to launch a joint two-hit attack, dealing 1000% and 2000% Physical DMG respectively. Base DMG of Blazing Desolation and Ruinous Ember increases by 20%."],
    ["Bone Resonance: Physical / Scale Shock: Physical", "Bone Resonance: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Scaled Rampart will split into two pieces and perform consecutive slashes, dealing 550% Physical DMG 4 times.\n\nScale Shock: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Scaled Rampart will immediately transform into a shield, dealing 2000% Physical DMG and pulling in enemies. This can block one attack within a short period of time. A successful block triggers a fan-shaped counterattack, dealing equivalent Physical DMG."],
    ["Inferno Overlock", "Each time Scaled Rampart casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Paradox Shackles", "Increases the carrier's ATK by 100."],
    ["Forged Edge", "Scaled Rampart's Active Skills deal 70% more damage."]
  ],
  "kamui-aeternion": [
    ["Lionheart Rally: Fire / Blazing Shroud: Fire", "Lionheart Rally: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Ignis will conjure a fireball and pull in enemies, dealing 650% Fire DMG 3 times.\n\nBlazing Shroud: Fire: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Ignis will slash forward with its claws, dealing 425% Fire DMG 5 times."],
    ["Lumina Predator", "When Aeternion casts Ignited Radiance with Ignis equipped, he will summon Ignis to launch a joint attack, dealing 3 hits of 1000% Fire DMG each. When casting Flare Burst or Solar Poise, increases ATK by 25% for 8s. Duration resets every time it is triggered."],
    ["Solar Rupture", "Increases the carrier's Fire DMG by 10%. If the carrier has the Plasma Beam effect, Plasma Beam DMG increases by 10%."],
    ["Blazing Cyclone", "Each time Ignis casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Silent Rebirth", "Increases the carrier's ATK by 100."],
    ["Ignis' Call", "Ignis' Active Skills deal 70% more DMG."]
  ],
  "karenina-effulgence": [
    ["Stellar Pulse: Physical / Sunder Dash: Physical", "Stellar Pulse: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Patrick will fire a barrage of beams and pull in enemies, dealing 650% Physical DMG 3 times.\n\nSunder Dash: Physical: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Patrick will charge at enemies, dealing 1000% Physical DMG twice."],
    ["Radiant Voyage", "When Karenina: Effulgence casts Surge Breach with Patrick equipped, she will summon Patrick to launch a joint attack, dealing 937.5% Physical DMG 8 times. While Karenina: Effulgence is in Ride the Rapids state, her ATK increases by 20% for 8s. Duration resets every time it is triggered."],
    ["Hunter's Halo", "Increases the carrier's Physical DMG by 10%. Darkflow DMG increases by 10%."],
    ["Chained Charge", "Each time Patrick casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Convergent Field", "Increases the carrier's ATK by 100."],
    ["Polar Calibration", "Patrick's Active Skills deal 70% more damage."]
  ],
  "luna-oblivion": [
    ["Abyssal Breath: Nihil / Furious Annihilation: Nihil", "Abyssal Breath: Nihil: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Guardrake will unleash Dragon Breath from above the target, dealing 750% Nihil DMG and slowing the enemy unit for 3s. During this, the target hit will take 250% Nihil DMG every second.\n\nFurious Annihilation: Nihil: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Guardrake will take off and dive toward the target, dealing 1800% Nihil DMG."],
    ["Retribution of Eclipse", "When Luna: Oblivion casts Incipient Retribution or Final Retribution with Guardrake equipped, she will summon Guardrake to launch a joint attack, dealing 2500% Nihil DMG. The overall amplification effect of Eclipse Points increases by 25%."],
    ["Dark Nihility", "Increases the carrier's Nihil DMG by 10%."],
    ["Crimson Ember", "Each time Guardrake casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Triggering this effect again will renew its duration."],
    ["Dominating Calamity", "Increases the carrier's ATK by 100."],
    ["Menacing Form", "Guardrake's Active Skills deal 70% more damage."]
  ],
  "nirvatia-dirge": [
    ["Raven Mandate: Nihil / Winged Fragrance: Nihil", "Raven Mandate: Nihil: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Morigan will unleash feathers to attack, dealing 250% Nihil DMG 8 times.\n\nWinged Fragrance: Nihil: After pinging a total of 6 basic Signal Orbs, the CUB button will become available. After casting, Morigan will unleash a wind strike that pulls in enemies, dealing 250% Nihil DMG 8 times."],
    ["Untrod Path", "When Nirvatia casts Hanging Phantom with Morigan equipped, she will summon Morigan to launch a joint attack, dealing 5 hits of 625% Nihil DMG each. When casting Fatal Kiss, increases ATK by 40% for 8s. Duration resets every time it is triggered."],
    ["Soultether", "Increases the carrier's Nihil DMG by 10%."],
    ["Bill Echo", "Each time Morigan casts an Active Skill, the carrier's Extra DMG Bonus increases by 5% for 8s. Duration resets every time it is triggered."],
    ["Shadow Roost", "Increases the carrier's ATK by 100."],
    ["Harbinger", "Morigan's Active Skills deal 70% more damage."]
  ]
};

// Weapon resonance effects. Source: https://grayravens.com/wiki/Weapons/Weapon_Resonance
const RESONANCE_EFFECTS = {
  "Dead Line Timing": "Gains 2 extra random Signal Orbs when deployed, and 3 Signal Orbs of the same color every 45s (also gains Signal Orbs on standby).",
  "Domain Deconstruction": "Inflicts Corrosion effect upon dealing damage. Corrosion: reduces the target's All Resistances by 8% for 8s. Triggering this effect again will renew its duration.",
  "Glorious Afterglow": "Final ATK of the weapon increases by 30% for 8s upon a 3-ping. Duration resets upon a repeated trigger.",
  "Glorious Spear": "When using a healing skill or effect, increases Full ATK of the healed target by 10% for 8s, CD for 10s.",
  "Incandescence": "Weapon's final ATK increases by 15% at the start of battle. No duration limit.",
  "Matrix Lightning": "Movement Speed greatly increases and all enemies' Extra DMG Reduction decreases by 10% in Matrix.",
  "Superconducting Axial Ray": "Increases Full ATK of all characters of the team by 8%. This effect does not stack."
};

// Leader skills shown on the CAPTAIN tag. skills-data.js only loads on the Skills pages, so they are copied here;
// tools/check-assets.mjs fails if a copy stops matching it
const LEADER_SKILLS = {
  "Adelyde: Anabasis": ["Leader - Torch Guardian", "Increases all team members' ATK by 10% and Overlinkers' Drk DMG and Ultima Slash DMG by 5%."],
  "Bianca: Crepuscule": ["Leader - Twilight's Decree", "Increases Dark DMG and Raydiance DMG of all members by 10%. Increases ATK of all Attackers in the team by 10%."],
  "Hanying: Solacetune": ["Leader - Awakened Strings", "Increases Physical DMG of all members by 10%. Increases DMG of all Tank Omniframes in the team by 5%."],
  "Helentine: Lacrimosa": ["Leader - Fading Fern", "All members' ATK increases by 10%. All Amplifiers' Lightning DMG and Glaciation DMG increase by 5%."],
  "Kamui: Aeternion": ["Leader - Solar Wind", "Increases Fire DMG and Plasma Beam DMG of all members by 10%. Increases DMG of all Breaker Omniframes in the team by 5%."],
  "Karenina: Effulgence": ["Eye of the Storm", "Increases Physical DMG and Darkflow DMG of all members by 10%. Increases DMG of all Breaker Omniframes in the team by 5%."],
  "Kurumi Tokisaki": ["Leader - Spirit of Time: Zafkiel", "Increases Dark DMG of all members by 10%. Increases ATK of all Attackers in the team by 10%."],
  "Leia: Fortunaster": ["Leader - Supercooled Freezing", "Increases Ice DMG of all members by 10%. Increases DMG of all Breaker Omniframes in the team by 5%."],
  "Lilith: Daemonissa": ["Leader - House of Cards", "All members gain 10% ATK. Amplifiers deal 5% more Dark DMG and Plasma Beam DMG."],
  "Liv: Limpidity": ["Leader - Radiant as I", "Increases Lightning DMG and Darkflow DMG of all members by 10%. Increases ATK of all Attackers in the team by 10%."],
  "Lucia: Inverse Crown": ["Leader - Crowned Grace", "Increases Ice DMG and Ignition DMG of all members by 10%. Increases ATK of all Attackers in the team by 10%."],
  "Lucia: Pyroath": ["Leader - Fire of Oath", "Increases Fire DMG and Plasma Beam DMG of all members by 10%. Increases ATK of all Attacker Omniframes in the team by 10%."],
  "Luna: Oblivion": ["Leader - Blood Moon", "Increases Nihil DMG of all members by 10%. Increases ATK of all Annihilators by 20%."],
  "Nanami: Startrail": ["Leader - Astral Beacon", "Increases Lightning DMG and Ignition DMG of all members by 10%. Increases DMG of all Tank Omniframes in the team by 5%."],
  "Nirvatia: Dirge": ["Leader - Enchanting Strike", "Increases Nihil DMG of all members by 10%. Increases Nihil DMG of all Amplifiers in the team by 5%."],
  "Rosetta: Arete": ["Leader - Amalgamation Burst", "Increases Dark and Ultima Slash damage of all members by 10%. Increases DMG of all Breaker Omniframes in the team by 5%."],
  "Selena: Pianissimo": ["Leader - Freezing Intro", "Increases Physical DMG and Glaciation DMG of all members by 10%. Increases ATK of all Attackers in the team by 10%."],
  "Teddy: Spectre": ["Leader - \"Classified Domain\"", "Increases ATK of all members by 10%.Increases Ice DMG and Raydiance DMG of all Amplifiers in the team by 5%."],
  "Vera: Geiravor": ["Leader - Abyssal Condemnation", "Increases ATK of all members by 10%. Increases Fire DMG and Darkflow DMG of all Amplifiers in the team by 5%."],
  "Veronica: Aegis": ["Leader - Cleansing Eunoe", "Increases ATK of all members by 10%. Increases Physical DMG and Ignition DMG of all Amplifiers in the team by 5%."],
  "Wanshi: Lucid Dreamer": ["Leader - Lucidity of Mind", "Increases Ice DMG of all members by 10%. Increases DMG of all Tank Omniframes in the team by 5%."],
  "Watanabe: Epitaph": ["Leader - Guardian's Aegis", "Increases Fire DMG of all members by 10%. Increases DMG of all Tank Omniframes in the team by 5%."]
};

// From https://huaxu.app/na/wiki/constructs. Name: [release, element, class, rank, effect]. "release" is the wiki's
// priority field: a higher number came out later, and it follows the order of the frames' debuts
const CONSTRUCTS = {
  "Lucia: Lotus": [80, "Fire", "Attacker", "B", ""],
  "Liv: Eclipse": [90, "Physical", "Support", "B", ""],
  "Lee: Palefire": [100, "Fire", "Attacker", "A", ""],
  "Kamui: Bastion": [200, "Physical", "Tank", "A", ""],
  "Nanami: Storm": [300, "Physical", "Tank", "B", ""],
  "Bianca: Zero": [400, "Physical", "Attacker", "A", ""],
  "Karenina: Blast": [500, "Fire", "Attacker", "A", ""],
  "Watanabe: Nightblade": [600, "Physical", "Attacker", "A", ""],
  "Liv: Lux": [700, "Lightning", "Support", "A", ""],
  "Lucia: Dawn": [800, "Lightning", "Attacker", "A", ""],
  "Ayla: Brilliance": [850, "Physical", "Tank", "A", ""],
  "Lee: Entropy": [900, "Physical", "Attacker", "S", ""],
  "Liv: Luminance": [1000, "Physical", "Support", "S", ""],
  "Kamui: Tenebrion": [1100, "Dark", "Tank", "S", ""],
  "Karenina: Ember": [1200, "Fire", "Attacker", "S", ""],
  "Nanami: Pulse": [1300, "Fire", "Tank", "S", ""],
  "Lucia: Crimson Abyss": [1400, "Physical", "Attacker", "S", ""],
  "Watanabe: Astral": [1500, "Dark", "Attacker", "A", ""],
  "Bianca: Veritas": [1600, "Lightning", "Attacker", "S", ""],
  "Sophia: Silverfang": [1700, "Fire", "Support", "A", ""],
  "Chrome: Arclight": [1800, "Lightning", "Tank", "A", ""],
  "Lucia: Plume": [1900, "Ice", "Attacker", "S", ""],
  "Vera: Rozen": [2000, "Dark", "Support", "A", ""],
  "Camu: Crocotta": [2010, "Dark", "Vanguard", "S", ""],
  "Rosetta: Rigor": [2020, "Physical", "Tank", "S", ""],
  "Qu: Pavo": [2030, "Physical", "Vanguard", "S", ""],
  "Changyu: Qilin": [2040, "Ice", "Tank", "A", ""],
  "Luna: Laurel": [2050, "Dark", "Attacker", "S", ""],
  "2B": [2060, "Physical", "Attacker", "S", ""],
  "9S": [2070, "Physical", "Support", "S", ""],
  "A2": [2080, "Physical", "Tank", "S", ""],
  "Wanshi: Hypnos": [2090, "Ice", "Support", "A", ""],
  "Selena: Tempest": [2100, "Lightning", "Vanguard", "S", ""],
  "Chrome: Glory": [2110, "Ice", "Tank", "S", ""],
  "No.21: XXI": [2120, "Dark", "Tank", "A", ""],
  "Vera: Garnet": [2130, "Lightning", "Tank", "S", ""],
  "Roland: Flambeau": [2140, "Fire", "Vanguard", "S", ""],
  "Liv: Empyrea": [2150, "Fire", "Amplifier", "S", ""],
  "Selena: Capriccio": [2160, "Dark", "Amplifier", "S", ""],
  "Pulao: Dragontoll": [2170, "Physical", "Vanguard", "S", ""],
  "Nanami: Starfarer": [2180, "Fire", "Tank", "S", ""],
  "Haicma: Starveil": [2190, "Ice", "Vanguard", "S", ""],
  "Karenina: Scire": [2200, "Dark", "Tank", "S", "Plasma Beam"],
  "Noan: Arca": [2210, "Lightning", "Vanguard", "S", ""],
  "Bianca: Stigmata": [2220, "Physical", "Attacker", "S", "Ultima Slash"],
  "Bambinata: Vitrum": [2230, "Ice", "Attacker", "A", ""],
  "Lee: Hyperreal": [2240, "Fire", "Attacker", "S", ""],
  "Ayla: Kaleido": [2250, "Ice", "Amplifier", "S", ""],
  "Lucia: Crimson Weave": [2260, "Lightning", "Attacker", "S", "Darkflow"],
  "Hanying: Zitherwoe": [2270, "Physical", "Support", "A", ""],
  "No.21: Feral": [2280, "Lightning", "Amplifier", "S", ""],
  "Noctis: Indomitus": [2290, "Lightning", "Attacker", "A", ""],
  "Alisa: Echo": [2300, "Physical", "Amplifier", "S", "Glaciation"],
  "Lamia: Lost Lullaby": [2310, "Dark", "Attacker", "S", ""],
  "BLACK★ROCK SHOOTER": [2320, "Fire", "Attacker", "A", ""],
  "Watanabe: Epitaph": [2330, "Fire", "Tank", "S", "Darkflow"],
  "Qu: Shukra": [2340, "Ice", "Attacker", "S", ""],
  "Teddy: Decryptor": [2350, "Dark", "Support", "A", "Disruption"],
  "Luna: Oblivion": [2360, "Nihil", "Annihilator", "S", "Disruption"],
  "Bridget: Ardeo": [2370, "Fire", "Tank", "A", "Ignition"],
  "Hanying: Solacetune": [2380, "Physical", "Tank", "S", "Ultima Slash"],
  "Wanshi: Lucid Dreamer": [2390, "Ice", "Tank", "S", "Glaciation"],
  "Lucia: Pyroath": [2400, "Fire", "Attacker", "S", "Plasma Beam"],
  "Yata: Fulgor": [2410, "Lightning", "Attacker", "A", "Glaciation"],
  "Nanami: Startrail": [2420, "Lightning", "Tank", "S", "Ignition"],
  "Ishmael: Parhelion": [2430, "Nihil", "Observer", "S", "Disruption"],
  "Lilith: Daemonissa": [2440, "Dark", "Amplifier", "S", "Plasma Beam"],
  "Selena: Pianissimo": [2450, "Physical", "Attacker", "S", "Glaciation"],
  "Jetavie: Daybreak": [2460, "Dark", "Attacker", "A", "Ignition"],
  "Vera: Geiravor": [2470, "Fire", "Amplifier", "S", "Darkflow"],
  "Vergil": [2480, "Physical", "Attacker", "S", "Ultima Slash"],
  "Dante": [2490, "Fire", "Attacker", "S", "Ignition"],
  "Bianca: Crepuscule": [2500, "Dark", "Attacker", "S", "Raydiance"],
  "Discord: Secator": [2510, "Physical", "Attacker", "A", "Ultima Slash"],
  "Veronica: Aegis": [2520, "Physical", "Amplifier", "S", "Ignition"],
  "Liv: Limpidity": [2530, "Lightning", "Attacker", "S", "Darkflow"],
  "Teddy: Spectre": [2540, "Ice", "Amplifier", "S", "Raydiance"],
  "Rosetta: Arete": [2550, "Dark", "Breaker", "S", "Ultima Slash"],
  "Nirvatia: Dirge": [2560, "Nihil", "Amplifier", "S", "Disruption"],
  "Kamui: Aeternion": [2570, "Fire", "Breaker", "S", "Plasma Beam"],
  "Lucia: Inverse Crown": [2580, "Ice", "Attacker", "S", "Ignition"],
  "Helentine: Lacrimosa": [2590, "Lightning", "Amplifier", "S", "Glaciation"],
  "Karenina: Effulgence": [2600, "Physical", "Breaker", "S", "Darkflow"],
  "Kurumi Tokisaki": [2610, "Dark", "Attacker", "S", ""],
  "Adelyde: Anabasis": [2620, "Dark", "Overlinker", "S", "Ultima Slash"],
  "Leia: Fortunaster": [2630, "Ice", "Breaker", "S", "Glaciation"]
};

// Memory ids from https://huaxu.app/na/wiki/memories: a higher id came out later
const MEMORY_RELEASE = {
  "Gloria": 1505, "Condelina": 1601, "Shakespeare": 1602, "Heisen": 1603, "Darwin": 1604, "Hanna": 1605,
  "Cottie": 1606, "Da Vinci": 1607, "Catherine": 1608, "Einsteina": 1609, "Philip II": 1610, "Guinevere": 1611,
  "Frederick": 1612, "Bathlon": 1613, "Patton": 1614, "Chen Jiyuan": 1615, "Koya": 1616, "Leeuwenhoek": 1617,
  "Wu'an": 1618, "Flamel": 1619, "Lucrezia": 1620, "Tifa": 1622, "Jack": 1623, "Elizabeth": 1624,
  "Seraphine": 1625, "Marco": 1626, "Unimate": 1627, "Isabel": 1628, "Boone": 1629, "Shelley": 1630,
  "Charlotte": 1631, "Turing": 1632, "Aline": 1633, "Diesel": 1634, "Fran": 1635, "Signa": 1636,
  "Derketo": 1637, "Alphonse": 1638, "Liliana": 1639, "Ji Bo'an": 1640, "Cleopatra": 1641, "Chang Wuzi": 1642,
  "Liston": 1643, "Heraclitus": 1644, "Wilde": 1645, "Herschell": 1646, "Sothoth": 1647, "Barcelo": 1648,
  "Burana": 1649, "Klenova": 1650, "Hervor": 1651, "Jeanne": 1652, "Keats": 1653, "Natasha": 1654,
  "Poincare": 1655, "Joanna": 1656, "Nimue": 1657, "Bunsen": 1658, "Bulgakov": 1659, "Feynman": 1660,
  "Pavlichenko": 1661, "Clusius": 1662, "Cogito": 1663, "Santiago": 1664, "Pesanteur": 1665, "Mousme": 1666
};

// Rotations of the Leia teams, from the steps on screen in Spider 2B's guide. "Ult" there is "Signature" here, and "Alpha" is Lucia.
// "1st Orb" is the first orb of the bar, whatever its color. A character's turns follow the order the team plays them.
// A step with a list shows each option under the same number, so "Repeat steps 1-5" keeps matching the guide.
const LEIA_GUIDE = "https://www.youtube.com/watch?v=h_L6-d0c5Wk";
const ROTATION_LEIA_SS = ["Swap in", "Tap 1st Orb 6x, or until Signature is up", "Tap Signature", "Hold 1st Orb until Signature is up", "Tap Signature"];
const ROTATION_LEIA_SS3_START = ["Swap in", "Tap 1st Orb 3x", "Tap Signature", "Hold 1st Orb until Signature is up", "Tap Signature", "Tap 1st Orb 3x"];
const ROTATION_LEIA_SS3_ULT = ["Swap in", "Tap 1st Orb", "Tap Signature", "Hold 1st Orb until Signature is up", "Tap Signature", "Tap 1st Orb 3x", "Tap Signature", "Tap 1st Orb 3x and repeat the team rotation"];
const ROTATION_LUCIA = [
  ["SS: Hold 1st Orb until 3/4 of the top Signature gauge is full", "SS3+: Hold 1st Orb until the center gauge is full"],
  "Hold Basic Attack", "3-Ping", "Tap Signature", "Hold Basic Attack to use orbs, or tap Signature again to nuke",
  "SS3+: Repeat steps 1-5 (skip if lower)",
  ["SS: 3-Ping and hold 1st Orb until 3/4 of the top Signature gauge is full", "SS3+: Hold 1st Orb and quickly release"],
  "Hold Basic Attack to prep Signature, then swap out"
];
const ROTATION_LUCIA_NOTE = "With SS Lucia, use Leia first. With SS3 or higher, use Lucia first, for her QTE buff.";
const ROTATION_TEDDY_STALL = ["Tap Yellow Orb ASAP", "Tap Signature", "Tap White Orbs 4x", "Tap Basic Attack, then Yellow Orb", "Tap Signature"];
const ROTATION_START = (who, next) => [`Start on ${who}, then swap to ${next}`];
// One team: its order goes on the rotation of each member
const teamRotation = (order, members) => Object.fromEntries(Object.entries(members).map(([name, turns]) => [name, { order, turns }]));
const alphaRotation = (order, lucia, leia) => teamRotation(order, {
  teddy: [{ turn: "Turn 1: Start", steps: ROTATION_START("Teddy", "Lucia") }, { turn: "Turn 4: Stall", steps: ROTATION_TEDDY_STALL }],
  lucia: [{ turn: "Turn 2", steps: ROTATION_LUCIA, note: ROTATION_LUCIA_NOTE }, { turn: "Turn 5", steps: lucia }],
  leia
});
const LUCIA_AMP_WINDOW = "Swap back to use 2-3 Signatures in the Amplifier window, now that Signature is prepped";
const altIceRotation = leia => teamRotation("Wanshi → Leia → Teddy → Wanshi", {
  wanshi: [{ turn: "Turn 1: Start", steps: ROTATION_START("Wanshi", "Leia") },
    { turn: "Turn 4: Single Signature", steps: ["3-Ping or Matrix Ping", "Hold Red Orb, then release", "Spam Red Orb until Signature is available", "Use Signature and swap to Leia", "Repeat the team rotation"] }],
  leia,
  teddy: [{ turn: "Turn 3: Double Signature", steps: ["Tap Yellow Orb ASAP", "Tap Signature", "Tap White Orbs 4x", "Tap Basic Attack + Yellow Orb", "Hold Basic Attack + Blue Orb", "Auto Signature", "Tap White Orbs 3x + tap Red Orb", "Repeat steps 1-6 again"] }]
});
const glaciationRotation = leia => teamRotation("Teddy or Alisa → Leia → Helentine → Teddy or Alisa", {
  teddy: [{ turn: "Turn 1: Start", steps: ROTATION_START("Teddy or Alisa", "Leia") },
    { turn: "Turn 4: Alisa: Echo", steps: ["Hold Dodge", "Tap Dodge 3x", "Hold Basic Attack", "Signature", "Can repeat if needed to stall, then swap back to Leia"], note: "The guide only shows this turn on Alisa: Echo." }],
  leia,
  helentine: [{ turn: "Turn 3", steps: ["Hold Dodge", "Matrix Blue/Yellow Ping", "Green Orb", "Red Orb", "Green Orb", "Signature 2x", "3-Ping Blue/Yellow", "Green Orb", "Red Orb 2x", "Signature 2x",
    ["Without DLT: Red Orb 2x and swap", "With DLT: Ping all Red Orbs, Signature 2x and swap"]] }]
});
const LEIA_ROTATIONS = {
  alphaSS: alphaRotation("Teddy → Lucia → Leia → Teddy → Lucia", [LUCIA_AMP_WINDOW, "Repeat the steps of Turn 2", "Repeat the team rotation"],
    [{ turn: "Turn 3", steps: ROTATION_LEIA_SS }]),
  alphaSS3: alphaRotation("Teddy → Lucia → Leia → Teddy → Lucia → Leia", [LUCIA_AMP_WINDOW, "Repeat the steps of Turn 2"],
    [{ turn: "Turn 3: Starter, only once", steps: ROTATION_LEIA_SS3_START }, { turn: "Turn 6: Triple Signature", steps: ROTATION_LEIA_SS3_ULT }]),
  altIceSS: altIceRotation([{ turn: "Turn 2", steps: ROTATION_LEIA_SS }]),
  altIceSS3: altIceRotation([{ turn: "Turn 2: Starter, only once", steps: ROTATION_LEIA_SS3_START }, { turn: "Turn 2 after that: Triple Signature", steps: ROTATION_LEIA_SS3_ULT }]),
  glaciationSS: glaciationRotation([{ turn: "Turn 2", steps: ROTATION_LEIA_SS }]),
  glaciationSS3: glaciationRotation([{ turn: "Turn 2: Starter, only once", steps: ROTATION_LEIA_SS3_START }, { turn: "Turn 2 after that: Triple Signature", steps: ROTATION_LEIA_SS3_ULT }])
};

// Player03's SS Leia rotation, written for Leia alone. His "Ult 1" and "Ult 2" are Signature here. Not from Spider 2B's guide, so it has its own source
const PLAYER03_ORBS_END = ["Red Orb 2x", "Gravity Orb", "Swap out"];
const LEIA_PLAYER03 = {
  source: { label: "Player03's Ice Warzone run", href: "https://youtu.be/YXq7LQmhTfw" },
  turns: [
    { turn: "Rotation", steps: ["Swap in", "Red Orb until the Passive Gauge is full", "Gravity Orb 2x", "Hold Gravity Orb", "Signature", "Hold Gravity Orb", "Signature", "Swap out"],
      note: "Assumes the build is 4pc Mousme and 4pc Chen Jiyuan." },
    { turn: "Variant: first rotation", steps: ["Swap in", "Red Orb until the Passive Gauge is full", "Gravity Orb 2x", "Hold Gravity Orb", "Signature", "Hold Gravity Orb", "Signature", ...PLAYER03_ORBS_END] },
    { turn: "Variant: subsequent rotations", steps: ["Gravity Orb", "Gravity Orb 2x", "Signature", "Hold Gravity Orb", "Signature", ...PLAYER03_ORBS_END] }
  ]
};
// A team's rotations with Leia's swapped for Player03's. The team order is the guide's, so it stays
const withPlayer03Leia = rotations => ({ ...rotations, leia: { ...LEIA_PLAYER03, order: rotations.leia.order } });
