#!/usr/bin/env node
// Opens the site in a real browser and looks for what check-assets cannot see: errors on the page, requests that fail,
// pages that come up empty, sideways scrolling and the main clicks that stop working. Desktop and phone sizes, every page of sitemap.xml.
// Run it with: npm run smoke                       (once per computer: npm install)
//              node tools/smoke.mjs timeline energy/fire    (only these pages, with screenshots, and no click tests; "home" is the home page)
// Screenshots go to .smoke/. They are for looking at: nothing here judges how a page looks.
// Exit code 1 = something is broken. Pages added since the last deploy are not in sitemap.xml: name them as above.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = join(ROOT, ".smoke");
const WORKERS = 6;
const SIZES = {
  desktop: { viewport: { width: 1366, height: 800 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
};
// Default run: one page of each kind gets a screenshot, since all of them together would be too many to look at
const SHOT_PAGES = ["/", "/constructs", "/energy/fire", "/constructs/fortunaster", "/calculator", "/timeline", "/assets/memories"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".xml": "application/xml", ".txt": "text/plain" };

// The rules _headers gives every page. The strict Content-Security-Policy there blocks things only on the published site, so it has to apply here too
const siteHeaders = () => {
  const block = readFileSync(join(ROOT, "_headers"), "utf8").match(/^\/\*\r?\n((?:[ \t]+.*\r?\n?)+)/m)?.[1] || "";
  return Object.fromEntries(block.split(/\r?\n/).filter(Boolean).map(line => line.trim().match(/^([^:]+):\s*(.*)$/).slice(1)));
};

// Answers like Cloudflare does: files as they are, and index.html for page addresses (the real site has a copy of it for each)
function serve() {
  const headers = siteHeaders();
  const server = createServer((req, res) => {
    const answer = (status, body, type = "text/plain") => { res.writeHead(status, { ...headers, "Content-Type": type }); res.end(body); };
    let path;
    try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { return answer(400, "bad address"); }
    const file = normalize(join(ROOT, path));
    if (file !== ROOT && !file.startsWith(ROOT + sep)) return answer(403, "outside the site");
    if (existsSync(file) && statSync(file).isFile()) return answer(200, readFileSync(file), TYPES[extname(file).toLowerCase()] || "application/octet-stream");
    if (extname(path)) return answer(404, "not found");
    answer(200, readFileSync(join(ROOT, "index.html")), TYPES[".html"]);
  });
  return new Promise(done => server.listen(0, "127.0.0.1", () => done(server)));
}

// Problem text -> where it happened, because one broken file shows up on every page
const problems = new Map();
const report = (size, where, text) => {
  if (!problems.has(text)) problems.set(text, new Set());
  problems.get(text).add(`[${size}] ${where}`);
};

// Everything the browser complains about. Other sites (the web font) are left out: being offline is not a bug of the site
function watch(page, size, where, base) {
  const ours = url => url.startsWith(base);
  page.on("pageerror", e => report(size, where, `erro de JavaScript: ${e.message}`));
  page.on("console", m => {
    // "Failed to load resource" repeats what the response listener below says, with less detail
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource") && (ours(m.location().url || base) || /Content Security Policy/i.test(m.text()))) report(size, where, `console: ${m.text()}`);
  });
  page.on("response", r => { if (ours(r.url()) && r.status() >= 400) report(size, where, `${r.status()} em ${decodeURI(r.url().slice(base.length))}`); });
  page.on("requestfailed", r => { if (ours(r.url()) && r.failure()?.errorText !== "net::ERR_ABORTED") report(size, where, `falhou ${decodeURI(r.url().slice(base.length))}`); });
}

// Waits for the images and for skills-data.js, which loads late. A page that never goes quiet is still checked
const settle = page => page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

async function checkPage(context, size, path, base, shot) {
  const page = await context.newPage();
  watch(page, size, path, base);
  try {
    await page.goto(base + path, { waitUntil: "load" });
    await settle(page);
    const width = SIZES[size].viewport.width;
    const state = await page.evaluate(width => {
      const main = document.querySelector("#main");
      const wide = [...document.querySelectorAll("body *")].find(el => el.getBoundingClientRect().right > width + 1);
      return {
        filled: main?.children.length > 0, lost: /Page not found/.test(main?.textContent || ""), extra: document.documentElement.scrollWidth - width,
        wide: wide && `${wide.tagName.toLowerCase()}${wide.id ? `#${wide.id}` : ""}${typeof wide.className === "string" && wide.className ? `.${wide.className.trim().split(/\s+/).join(".")}` : ""}`
      };
    }, width);
    if (!state.filled) report(size, path, "a página abriu vazia");
    if (state.lost) report(size, path, "a página diz que não existe");
    if (state.extra > 1) report(size, path, `rolagem lateral de ${state.extra}px (começa em ${state.wide})`);
    if (shot) {
      const name = path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
      await page.screenshot({ path: join(SHOTS, size, `${name}.png`), fullPage: true });
    }
  } catch (e) {
    report(size, path, `não abriu: ${e.message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

// The clicks people depend on most. Each one starts from a fresh page, so one failure does not hide the others
const FLOWS = {
  "esteira de personagens": async page => {
    await page.goto("/");
    await page.locator(".hero-track").evaluate(track => { track.style.animationPlayState = "paused"; });
    const icon = page.locator('.hero-track a:not([aria-hidden="true"])').first();
    const href = await icon.getAttribute("href");
    if (!href?.startsWith("/constructs/")) throw new Error("o ícone da esteira não aponta para a página do personagem");
    await icon.evaluate(anchor => anchor.click());
    await page.waitForURL(/\/constructs\/[^/]+$/);
    await page.waitForSelector("#main .char-detail");
    await page.goto(href.replace("/constructs/", "/character/"));
    await page.waitForURL(/\/constructs\/[^/]+$/);
    await page.waitForSelector("#main .char-detail");
    await page.goto("/character/leia-fortunaster");
    await page.waitForURL(/\/constructs\/fortunaster$/);
    await page.waitForSelector("#main .char-detail");
  },
  "frase do ícone": async page => {
    await page.goto("/");
    const mark = page.locator(".hero-mark");
    const previous = await mark.getAttribute("data-splash");
    await mark.click();
    const next = await mark.getAttribute("data-splash");
    const text = await page.locator(".hero-splash").textContent();
    if (next === previous || text !== next.replace(/\*\*(.+?)\*\*/g, "$1"))
      throw new Error("o ícone não gerou uma frase nova");
  },
  "busca": async (page, size) => {
    await page.goto("/");
    if (size === "mobile") await page.click("#menuBtn");
    await page.fill("#searchBox", "Leia");
    await page.click("#searchResults a");
    await page.waitForURL(url => url.pathname !== "/");
    await page.waitForSelector("#main h1");
  },
  // The list of a team page: the search hides rows, a row opens the build's page with its cards, and the back link returns
  "lista de builds": async page => {
    await page.goto("/energy/ice");
    await page.fill(".bsearch input", "zzzz");
    await page.waitForSelector(".picker > .empty:not([hidden])");
    await page.fill(".bsearch input", "");
    await page.click(".brow");
    await page.waitForURL(/\/energy\/ice\/[^/]+$/);
    await page.waitForSelector("#compBox .card");
    await page.click("#main a.back");
    await page.waitForSelector(".brow");
  },
  "detalhe de arma": async page => {
    await page.goto("/assets/weapons");
    await page.click('#main a[href^="/assets/weapon/"]');
    await page.waitForURL(/\/assets\/weapon\//);
    await page.waitForSelector("#main h1");
  },
  // Skill pages are not in sitemap.xml, and they are the only ones that load skills-data.js
  "página de skills": async page => {
    await page.goto("/assets/skill/leia-fortunaster");
    await page.waitForFunction(() => /Skills|Passive/i.test(document.querySelector("#main")?.textContent) && !/Loading|Could not load/.test(document.querySelector("#main").textContent));
  },
  "team builder": async (page, size) => {
    let step = "opening page";
    try {
    if (size === "desktop") await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/editor");
    step = "checking fresh empty editor";
    await page.waitForSelector("#edStage .card .rank[data-ed-drop]",{state:"attached"});
    const emptyState = await page.evaluate(() => localStorage.getItem("dominik-editor"));
    const emptyArtifacts = await page.locator("#edStage .rank img, #edStage .wp img, #edStage .mem img, #edStage .mx img, #edStage .kit .cell img, #edStage .tags .tag")
      .evaluateAll(items => items.map(item => `${item.closest(".card")?.dataset.edCard}:${item.parentElement?.className}:${item.getAttribute("src") || item.textContent}`));
    if ((emptyState && JSON.parse(emptyState).cards.some(card => card.char || card.cub || card.weapon || card.mem.some(Boolean))) || emptyArtifacts.length)
      throw new Error(`o Team Builder não abriu vazio por padrão: ${emptyArtifacts.join(",")}`);
    await page.evaluate(() => localStorage.setItem("dominik-editor", JSON.stringify({
      cards: [
        { char: "Adelyde: Anabasis", cub: "assets/characters/adelyde-anabasis/CUB - Kelpie.webp", mem: ["Cottie", "Cottie"] },
        { char: "Bianca: Crepuscule" }
      ]
    })));
    step = "loading test team";
    await page.reload();
    await page.waitForSelector("#edStage .card");
    await page.waitForSelector("#edStage .card .rank[data-ed-drop]");
    const cards = page.locator("#edStage .card");
    if (await page.locator("#edPanel").count()) throw new Error("o painel lateral de peças ainda aparece");
    if (size === "mobile") {
      step = "opening equipment picker on mobile";
      await cards.nth(0).locator(".rank").tap();
      await page.waitForSelector("#edPickerSearch");
      await page.locator('.ed-picker-option[data-ed-picker-value="S5"]').tap();
      if (await page.evaluate(() => JSON.parse(localStorage.getItem("dominik-editor")).cards[0].rank) !== "S5")
        throw new Error("a seleção de rank não funcionou por toque no celular");
      step = "opening a usable resonance menu on mobile";
      await cards.nth(0).locator(".ed-memory-resonance-button").tap();
      if (await page.locator(".ed-res-menu-row").count() !== 6
        || await page.locator(".ed-res-menu-row button").evaluateAll(buttons => buttons.some(button => button.getBoundingClientRect().height < 40)))
        throw new Error("o menu de ressonâncias ficou indisponível ou pequeno demais no celular");
      await page.locator('.ed-res-menu-row [data-ed-mem-side="bottom"]').first().tap();
      if (!(await page.locator(".ed-res-menu-choice-head").innerText()).includes("Bottom")
        || await page.locator(".ed-res-menu-row").count() !== 6)
        throw new Error("o menu de ressonâncias fechou ao escolher Bottom no celular");
      await page.locator('.ed-res-menu-options [data-ed-memres-value="QTE"]').tap();
      if (await page.evaluate(() => JSON.parse(localStorage.getItem("dominik-editor")).cards[0].memRes[0][1]) !== "QTE")
        throw new Error("a ressonância não foi salva por toque no celular");
      if (await page.locator(".ed-res-menu-row").count() !== 6)
        throw new Error("o menu de ressonâncias fechou após escolher um ícone no celular");
      if (await page.locator("#edStage img").evaluateAll(images => images.some(image => image.draggable)))
        throw new Error("as imagens do editor ainda permitem arraste nativo");
      const mobileDetails = (await page.locator("#edDetail").innerText()).toLowerCase();
      if (await page.locator("#edDetail fieldset").count() !== 3
        || !mobileDetails.includes("notes") || !mobileDetails.includes("rotation"))
        throw new Error("Notes e Rotation não ficaram fixas abaixo das posições no celular");
      if (await page.locator('#edDetail textarea[name="c0.desc"]').evaluate(el => getComputedStyle(el).minHeight) !== "225px"
        || await page.locator('#edDetail textarea[name="c0.rotation"]').evaluate(el => getComputedStyle(el).minHeight) !== "225px")
        throw new Error("as caixas fixas de Notes e Rotation não abriram no tamanho padrão maior");
      if (await page.locator("#edDetail").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length) !== 1)
        throw new Error("as posições de Notes e Rotation não se empilharam no celular");
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error("as caixas fixas de Notes e Rotation causaram rolagem horizontal");
      return;
    }
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("dominik-editor")));
    const chooseDifferent = async current => {
      const index = await page.locator(".ed-picker-option").evaluateAll((items, value) =>
        items.findIndex(item => item.dataset.edPickerValue && item.dataset.edPickerValue !== value), current);
      if (index < 0) throw new Error("nenhuma opção diferente no seletor");
      await page.locator(".ed-picker-option").nth(index).click();
    };

    const character = "Adelyde: Anabasis";
    if ((await state()).cards[0].char !== character) throw new Error("o personagem inicial não foi carregado");

    step = "showing empty slots are clickable";
    await cards.nth(0).locator(".mem .slot").nth(2).hover();
    if (await cards.nth(0).locator(".mem .slot").nth(2).evaluate(el => getComputedStyle(el).outlineStyle) !== "solid")
      throw new Error("a memória vazia não indicou que pode ser clicada");

    step = "changing C.U.B.";
    await cards.nth(0).locator(".kit > .slot").click();
    const originalCub = (await state()).cards[0].cub;
    if (await page.locator(`.ed-picker-option[data-ed-picker-value="${originalCub}"].on`).count() !== 1)
      throw new Error("o C.U.B. atual não ficou marcado no seletor");
    await chooseDifferent(originalCub);
    const equipped = (await state()).cards[0];
    if (equipped.char !== character || equipped.cub === originalCub) throw new Error("equipar C.U.B. alterou o personagem ou não alterou o C.U.B.");
    step = "swapping only skills within one C.U.B.";
    const skillSlots = cards.nth(0).locator(".kit > .cell > .slot");
    const originalSkills = await skillSlots.locator("img").evaluateAll(images => images.map(image => image.src));
    await skillSlots.nth(0).click();
    await cards.nth(1).locator(".kit > .cell > .slot").nth(0).click();
    if ((await state()).cards[0].cubSkills.join() !== "0,1,2,3,4,5")
      throw new Error("uma habilidade pôde ser selecionada para troca entre C.U.B.s diferentes");
    await skillSlots.nth(0).click();
    await cards.nth(0).locator(".kit > .cell > .slot").nth(1).click();
    const swappedSkills = await cards.nth(0).locator(".kit > .cell > .slot img").evaluateAll(images => images.map(image => image.src));
    if ((await state()).cards[0].cubSkills.join() !== "1,0,2,3,4,5"
      || swappedSkills[0] !== originalSkills[1] || swappedSkills[1] !== originalSkills[0]
      || swappedSkills.slice(2).join() !== originalSkills.slice(2).join())
      throw new Error("as posições das habilidades do mesmo C.U.B. não foram trocadas");
    step = "disabling card hover movement";
    await cards.nth(0).hover();
    if (await cards.nth(0).evaluate(el => getComputedStyle(el).transform !== "none" || getComputedStyle(el).filter !== "none"))
      throw new Error("o card ainda levita ou brilha ao passar o mouse no editor");
    step = "dragging Captain and Starter positions";
    await cards.nth(1).locator(".tag.captain").dragTo(cards.nth(0));
    if ((await state()).captain !== 0) throw new Error("arrastar Captain não mudou sua posição");
    await cards.nth(0).locator(".tag.starter").dragTo(cards.nth(1));
    if ((await state()).starter !== 1) throw new Error("arrastar Starter não mudou sua posição");
    step = "showing fixed notes and rotation below each position";
    const detail = (await page.locator("#edDetail").innerText()).toLowerCase();
    if (await page.locator("#edDetail fieldset").count() !== 3
      || !detail.includes("blue") || !detail.includes("red") || !detail.includes("yellow")
      || !detail.includes("notes") || !detail.includes("rotation")
      || /Weapon Harmony|Main memory set|Sub memory set/.test(detail))
      throw new Error("Notes e Rotation não ficaram fixas, em colunas para Blue, Red e Yellow");
    if (await page.locator("#edDetail").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length) !== 3)
      throw new Error("os detalhes não se alinharam abaixo das três posições");
    if (await page.locator('#edDetail textarea[name="c0.desc"]').evaluate(el => getComputedStyle(el).minHeight) !== "225px"
      || await page.locator('#edDetail textarea[name="c0.rotation"]').evaluate(el => getComputedStyle(el).minHeight) !== "225px")
      throw new Error("as caixas fixas de Notes e Rotation não abriram no tamanho padrão maior");
    await page.locator('#edDetail textarea[name="c0.desc"]').fill("Team notes remain editable.");
    if ((await state()).cards[0].desc !== "Team notes remain editable.")
      throw new Error("o texto de Notes não foi salvo");

    step = "opening memory resonance menu";
    await cards.nth(0).locator(".ed-memory-resonance-button").click();
    if (await page.locator(".ed-res-menu-row").count() !== 6
      || await cards.nth(0).locator(".mem .slot").count() !== 6
      || await cards.nth(0).locator(".ed-mem-back").count())
      throw new Error("o menu RES não abriu separado dos slots de memória");
    step = "opening bottom resonance choices";
    await page.locator('.ed-res-menu-row [data-ed-mem-side="bottom"]').first().click();
    if (!(await page.locator(".ed-res-menu-choice-head").innerText()).includes("Bottom")
      || await page.locator(".ed-res-menu-row").count() !== 6)
      throw new Error("o menu de ressonâncias fechou ao escolher Bottom");
    if (await page.locator('.ed-res-menu-options [data-ed-memres-value="QTE"] img').count() !== 1)
      throw new Error("as opções de ressonância não exibiram ícones");
    await page.locator('.ed-res-menu-options [data-ed-memres-value="QTE"]').click();
    if ((await state()).cards[0].memRes[0][1] !== "QTE") throw new Error("a ressonância bottom da memória não foi salva");
    if (await page.locator(".ed-res-menu-row").count() !== 6)
      throw new Error("o menu de ressonâncias fechou após selecionar um ícone");
    step = "opening upper resonance choices";
    await page.locator('.ed-res-menu-row [data-ed-mem-side="top"]').first().click();
    if (!(await page.locator(".ed-res-menu-choice-head").innerText()).includes("Upper")
      || await page.locator(".ed-res-menu-row").count() !== 6)
      throw new Error("o menu de ressonâncias fechou ao escolher Upper");
    await page.locator('.ed-res-menu-options [data-ed-memres-value="Red Orb"]').click();
    if ((await state()).cards[0].memRes[0][0] !== "Red Orb") throw new Error("a ressonância upper da memória não foi salva");
    if (await page.locator('.ed-res-menu-options [data-ed-memres-value="Red Orb"].on').count() !== 1)
      throw new Error("a ressonância Upper atual não ficou marcada no seletor");
    await page.locator('#edForm input[name="name"]').click();
    if (await page.locator("#edPicker").isVisible())
      throw new Error("clicar fora não fechou o menu de ressonâncias");
    const resonanceTotals = await cards.nth(0).locator(".res").innerText();
    if (!resonanceTotals.includes("Red Orb") || !resonanceTotals.includes("QTE") || !resonanceTotals.includes("×"))
      throw new Error("o total das ressonâncias não foi exibido no card");

    step = "setting weapon resonance";
    await cards.nth(0).locator(".mx .slot").first().click();
    const supportResonances = await page.locator(".ed-picker-option").evaluateAll(options => options.map(option => option.dataset.edPickerValue));
    if (!supportResonances.includes("Glorious Spear") || !supportResonances.includes("Superconducting Axial Ray")
      || supportResonances.includes("Glorious Afterglow") || supportResonances.includes("Domain Deconstruction"))
      throw new Error("as ressonâncias de arma não respeitaram a classe Overlinker");
    await page.locator("[data-ed-picker-close]").click();
    await cards.nth(1).locator(".mx .slot").first().click();
    const attackerResonances = await page.locator(".ed-picker-option").evaluateAll(options => options.map(option => option.dataset.edPickerValue));
    if (!attackerResonances.includes("Glorious Afterglow") || attackerResonances.includes("Glorious Spear")
      || attackerResonances.includes("Domain Deconstruction"))
      throw new Error("as ressonâncias de arma não respeitaram a classe Attacker");
    await page.locator("[data-ed-picker-close]").click();
    await cards.nth(0).locator(".mx .slot").first().click();
    const originalWeaponResonance = (await state()).cards[0].matrix[0];
    if (await page.locator(`.ed-picker-option[data-ed-picker-value="${originalWeaponResonance}"].on`).count() !== 1)
      throw new Error("a ressonância de arma atual não ficou marcada no seletor");
    const weaponResonance = await page.locator(".ed-picker-option").nth(1).getAttribute("data-ed-picker-value");
    await page.locator(".ed-picker-option").nth(1).click();
    if ((await state()).cards[0].matrix[0] !== weaponResonance) throw new Error("a ressonância de arma não foi equipada");

    step = "changing rank";
    await cards.nth(0).locator(".rank").click();
    const currentRank = (await state()).cards[0].rank;
    if (await page.locator(`.ed-picker-option[data-ed-picker-value="${currentRank}"].on`).count() !== 1)
      throw new Error("o rank atual não ficou marcado no seletor");
    const rank = await page.locator(".ed-picker-option").evaluateAll((items, current) => items.find(item => item.dataset.edPickerValue !== current)?.dataset.edPickerValue || "", (await state()).cards[0].rank);
    if (await page.locator(".ed-picker-option img").count() !== await page.locator(".ed-picker-option").count())
      throw new Error("as opções de rank não exibiram ícones");
    await page.locator(`.ed-picker-option[data-ed-picker-value="${rank}"]`).click();
    if ((await state()).cards[0].rank !== rank) throw new Error("o seletor de ícones não atualizou o rank");

    step = "closing equipment picker when clicking outside";
    await cards.nth(0).locator(".rank").click();
    await page.locator('#edForm input[name="name"]').click();
    if (await page.locator("#edPicker").isVisible())
      throw new Error("clicar fora não fechou o seletor de equipamento");

    step = "changing weapon";
    await cards.nth(0).locator(".wp > .slot").first().click();
    if (!(await page.locator(".ed-picker-head strong").innerText()).includes("Weapon"))
      throw new Error("clicar em outro equipamento não abriu seu seletor após fechar o anterior");
    const weaponState = (await state()).cards[0];
    const selectedWeapon = weaponState.weapon ? `${weaponState.weapon}::${weaponState.weaponRank}` : "";
    if (await page.locator(`.ed-picker-option[data-ed-picker-value="${selectedWeapon}"].on`).count() !== 1)
      throw new Error("a arma atual não ficou marcada no seletor");
    await page.locator(".ed-picker-option").nth(1).click();
    if (!(await state()).cards[0].weapon) throw new Error("o menu suspenso de arma não equipou a arma");

    step = "searching and clearing a memory";
    await cards.nth(0).locator(".mem .slot").nth(1).click();
    if (await page.locator("#edPickerSearch").count() !== 1) throw new Error("o seletor de memória não mostrou a busca");
    await page.fill("#edPickerSearch", "Darwin");
    if (await page.locator('.ed-picker-option:not([hidden])').count() !== 1)
      throw new Error("a busca de memória não filtrou as opções");
    await page.locator('.ed-picker-option[data-ed-picker-value="Darwin"]').click();
    if ((await state()).cards[0].mem[1] !== "Darwin") throw new Error("a memória encontrada pela busca não foi equipada");
    await cards.nth(0).locator(".mem .slot").nth(1).click();
    if (await page.locator('.ed-picker-option[data-ed-picker-value="Darwin"].on').count() !== 1)
      throw new Error("a memória atual não ficou marcada no seletor");
    await page.locator('.ed-picker-option[data-ed-picker-value=""]').click();
    const removedMemory = (await state()).cards[0];
    if (removedMemory.mem[1] !== "" || removedMemory.memRes[1].join() !== "Any ATK,Signature Move")
      throw new Error("limpar a memória não restaurou suas ressonâncias padrão");

    step = "removing equipped items with right-click";
    await cards.nth(0).locator(".mem .slot").nth(1).click();
    await page.locator('.ed-picker-option[data-ed-picker-value="Darwin"]').click();
    await cards.nth(0).locator(".mem .slot").nth(1).click({ button: "right" });
    const rightClickRemovedMemory = (await state()).cards[0];
    if (rightClickRemovedMemory.mem[1] !== "" || rightClickRemovedMemory.memRes[1].join() !== "Any ATK,Signature Move")
      throw new Error("o botão direito não removeu a memória nem restaurou suas ressonâncias padrão");

    step = "swapping characters by selecting";
    await cards.nth(1).locator(".portrait").click();
    if (await page.locator('.ed-picker-option[data-ed-picker-value="Bianca: Crepuscule"].on').count() !== 1)
      throw new Error("o personagem atual não ficou marcado no seletor");
    await page.locator(`.ed-picker-option[data-ed-picker-value="${character}"]`).click();
    const swapped = (await state()).cards.map(card => card.char);
    if (swapped[0] !== "Bianca: Crepuscule" || swapped[1] !== character)
      throw new Error("selecionar um personagem existente não trocou os slots");
    step = "showing weapon type in an empty weapon slot";
    await cards.nth(2).locator(".portrait").click();
    await page.locator('.ed-picker-option[data-ed-picker-value="Watanabe: Epitaph"]').click();
    if ((await cards.nth(2).locator(".wp > .slot").first().innerText()).trim() !== "Trailblade")
      throw new Error("o slot de arma vazio não mostrou o tipo de arma do personagem");
    } catch (error) {
      throw new Error(`${step}: ${error.message}`, { cause: error });
    }
  },
  "menu do celular": async (page, size) => {
    if (size !== "mobile") return;
    await page.goto("/");
    await page.click("#menuBtn");
    await page.click('#sideNav a[href="/constructs"]');
    await page.waitForURL(/\/constructs$/);
    await page.waitForFunction(() => !document.querySelector("#side").classList.contains("open"));
  }
};

async function checkFlow(browser, size, name, base) {
  const context = await browser.newContext({ ...SIZES[size], baseURL: base });
  context.setDefaultTimeout(8000);
  const page = await context.newPage();
  watch(page, size, `clique "${name}"`, base);
  try {
    await FLOWS[name](page, size);
  } catch (e) {
    report(size, `clique "${name}"`, e.message.replace(/\n/g, " | "));
  } finally {
    await context.close();
  }
}

async function pool(jobs) {
  const next = async () => { for (let job; (job = jobs.shift());) await job(); };
  await Promise.all(Array.from({ length: WORKERS }, next));
}

// Git Bash rewrites /timeline into a Windows path, so addresses are written without the first slash
const chosen = process.argv.slice(2).map(arg => {
  if (arg.includes(":")) { console.error(`Endereço inválido: ${arg}. Escreva sem a barra inicial, assim: timeline`); process.exit(2); }
  return arg === "home" ? "/" : `/${arg.replace(/^\/+/, "")}`;
});
const paths = chosen.length ? chosen : [...readFileSync(join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(m => m[1]);
const started = Date.now();

rmSync(SHOTS, { recursive: true, force: true });
Object.keys(SIZES).forEach(size => mkdirSync(join(SHOTS, size), { recursive: true }));
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
// The Edge that comes with Windows, so nothing has to be downloaded. On another system: SMOKE_BROWSER=chrome
const browser = await chromium.launch({ channel: process.env.SMOKE_BROWSER || "msedge" });

try {
  const contexts = Object.fromEntries(await Promise.all(Object.keys(SIZES).map(async size => [size, await browser.newContext(SIZES[size])])));
  const jobs = Object.keys(SIZES).flatMap(size => [
    ...paths.map(path => () => checkPage(contexts[size], size, path, base, chosen.length > 0 || SHOT_PAGES.includes(path))),
    ...(chosen.length ? [] : Object.keys(FLOWS).map(name => () => checkFlow(browser, size, name, base)))
  ]);
  const total = jobs.length;
  await pool(jobs);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  for (const [text, places] of problems) {
    const list = [...places].sort();
    console.log(`ERRO   ${text}\n       em ${list.slice(0, 3).join(", ")}${list.length > 3 ? ` e mais ${list.length - 3}` : ""}`);
  }
  console.log(`${total} verificações em ${seconds}s: ${problems.size} problema(s). Prints em .smoke/`);
} finally {
  await browser.close();
  server.close();
}
process.exit(problems.size ? 1 : 0);
