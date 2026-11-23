#!/usr/bin/env node
// Opens the site in a real browser and looks for what check-assets cannot see: errors on the page, requests that fail,
// pages that come up empty, sideways scrolling and the main clicks that stop working. Desktop and phone sizes, every page of sitemap.xml.
// Run it with: npm run smoke                       (once per computer: npm install)
//              node tools/smoke.mjs timeline energy/fire    (only these pages, with screenshots, and no click tests; "home" is the home page)
//              add --pt to any of these to open the site in Portuguese (?lang=pt, as a Brazilian browser). The click tests look for English text, so --pt skips them
// Screenshots go to .smoke/. They are for looking at: nothing here judges how a page looks.
//              node tools/smoke.mjs --a11y [pages]   (adds an axe accessibility scan of each page; a separate report that never changes the exit code)
// Exit code 1 = something is broken. Pages added since the last deploy are not in sitemap.xml: name them as above.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = join(ROOT, ".smoke");
const WORKERS = 6;
const A11Y = process.argv.includes("--a11y");
const SIZES = {
  desktop: { viewport: { width: 1366, height: 800 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
};
// Default run: one page of each kind gets a screenshot, since all of them together would be too many to look at
const SHOT_PAGES = ["/", "/constructs", "/energy/fire", "/constructs/fortunaster", "/calculator", "/timeline", "/assets/memories", "/privacy", "/account"];
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

// Accessibility findings from axe (only with --a11y): rule -> where, how many elements, one example. Kept apart from problems: it is a worklist, not a pass/fail
const a11y = new Map();
const IMPACT = ["critical", "serious", "moderate", "minor"];
async function scanA11y(page, size, path) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  for (const v of violations) {
    const key = `${v.impact} ${v.id}: ${v.help}`;
    const item = a11y.get(key) || { places: new Set(), nodes: 0, sample: v.nodes[0]?.target.join(" ") };
    item.places.add(`[${size}] ${path}`);
    item.nodes += v.nodes.length;
    a11y.set(key, item);
  }
}

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
    // The translation is off (I18N_ENABLED in i18n.js): --pt opens it with ?lang=pt, which only the local site accepts
    await page.goto(base + path + (PT ? "?lang=pt" : ""), { waitUntil: "load" });
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
    if (A11Y) await scanA11y(page, size, path);
    if (shot) {
      const name = path.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
      // Chromium refuses captures taller than about 16000px (the Memories list on a phone), so a long page is cut there
      // fullPage: true drew the side menu over and over on the construct pages, so the window is made as tall as the page instead
      const view = page.viewportSize(), height = Math.min(15000, await page.evaluate(() => document.documentElement.scrollHeight));
      await page.setViewportSize({ width: view.width, height: Math.max(view.height, height) });
      // Two frames after the resize: before them the capture repeats the top of the page below the old window height
      await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
      await page.screenshot({ path: join(SHOTS, size, `${name}.png`) });
      await page.setViewportSize(view);
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
    const icon = page.locator('.hero-track a:not([aria-hidden="true"])').first();
    const href = await icon.getAttribute("href");
    if (!href?.startsWith("/constructs/")) throw new Error("o ícone da esteira não aponta para a página do personagem");
    await icon.evaluate(anchor => anchor.click());
    await page.waitForURL(/\/constructs\/[^/]+$/);
    await page.waitForSelector("#main .cx-page");
    await page.goto(href.replace("/constructs/", "/character/"));
    await page.waitForURL(/\/constructs\/[^/]+$/);
    await page.waitForSelector("#main .cx-page");
    await page.goto("/character/leia-fortunaster");
    await page.waitForURL(/\/constructs\/fortunaster$/);
    await page.waitForSelector("#main .cx-page");
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
  // The smoke has no API, so a team page has no teams: it points to the Team Builder instead. The old build links open their page
  // only on the published site (_redirects), so they are not tried here
  "página sem times": async page => {
    await page.goto("/energy/ice");
    await page.click('#main a.empty-link[href="/editor"]');
    await page.waitForURL(/\/editor$/);
  },
  // Logged out (no API here), the side menu offers "Sign in", which opens /account as the Sign in page; /admin says what it needs
  "conta deslogada": async page => {
    await page.goto("/energy/ice");
    await page.waitForSelector('#accountBox a[data-signin][href="/account?back=%2Fenergy%2Fice"]', { state: "attached" });
    await page.goto("/account?back=/energy/ice");
    await page.waitForSelector('#main .signin-option[href="/api/auth/login?back=%2Fenergy%2Fice"]');
    // The login link has to leave the page for the server: the site's own navigation must not catch it
    const caught = await page.evaluate(() => new Promise(done => {
      addEventListener("click", e => { done(e.defaultPrevented); e.preventDefault(); }, { once: true });
      document.querySelector("#main .signin-option").click();
    }));
    if (caught) throw new Error("a navegação do site interceptou o link de login (ele precisa ir ao servidor)");
    // Another site in back= is ignored: the login comes back to /account
    await page.goto("/account?back=//example.com");
    await page.waitForSelector('#main .signin-option[href="/api/auth/login?back=%2Faccount"]');
    await page.goto("/admin");
    await page.waitForSelector('#main a[href="/account?back=%2Fadmin"]');
    await page.goto("/privacy");
    if ((await page.locator("#main .privacy-page section").count()) < 8) throw new Error("a página de privacidade não mostrou as seções");
  },
  "detalhe de arma": async page => {
    await page.goto("/assets/weapons");
    await page.click('#main a[href^="/assets/weapon/"]');
    await page.waitForURL(/\/assets\/weapon\//);
    await page.waitForSelector("#main h1");
  },
  "detalhe de memória, ressonância e CUB": async page => {
    for (const [list, kind] of [["memories", "memory"], ["resonances", "resonance"], ["cubs", "cub"]]) {
      await page.goto(`/assets/${list}`);
      await page.click(`#main a[href^="/assets/${kind}/"]`);
      await page.waitForURL(new RegExp(`/assets/${kind}/`));
      await page.waitForSelector("#main h1");
    }
  },
  // Skill pages are not in sitemap.xml, and they are the only ones that load skills-data.js
  "página de skills": async page => {
    await page.goto("/assets/skill/leia-fortunaster");
    await page.waitForFunction(() => /Skills|Passive/i.test(document.querySelector("#main")?.textContent) && !/Loading|Could not load/.test(document.querySelector("#main").textContent));
  },
  // The damage tab of a construct page: the Effect switch, a higher rank and a buff change the numbers
  "cálculo de dano": async page => {
    await page.goto("/constructs/pianissimo");
    await page.click('[data-sk-tab="DMG"]');
    await page.waitForSelector("#dmgRows .dmg-row");
    if (await page.locator("#cxSkillBody").isVisible()) throw new Error("a aba DMG Calculator não escondeu as skills");
    const values = () => page.locator("#dmgRows .dmg-val").allInnerTexts().then(list => list.join("|"));
    const first = await values();
    await page.click('[data-dmg-mode="effect"]');
    if (!(await page.locator("#dmgRows .dmg-row.fx-hit").count())) throw new Error("o modo de efeito não mostrou golpes de efeito");
    await page.selectOption('[data-dmg="rank"]', "SSS");
    await page.waitForFunction(() => document.querySelector('[data-dmg="rank"]')?.value === "SSS");
    if (await page.locator('[data-dmg="atk"]').inputValue() === "1957") throw new Error("mudar o rank não recalculou o ATK");
    // Rank bonuses have no switch: the summary under the Rank field lists the ones in effect
    if (await page.locator('[data-dmg-opt="qte"]').count()) throw new Error("um bônus de rank ainda tem interruptor");
    if (await page.locator("#dmgRanks li.on").count() !== 4) throw new Error("o resumo de rank no SSS não mostrou os 4 níveis liberados (S5, SS, SS3, SSS)");
    // Skill conditions sit in their skill's box
    if (!(await page.locator('[data-dmg-sk="basic"] [data-dmg-opt="notes2"]').count())) throw new Error("a condição das Musical Notes não está na caixa do Basic Attack");
    await page.click('[data-dmg-mode="energy"]');
    const higher = await values();
    if (higher === first) throw new Error("mudar o rank não mudou o dano");
    await page.click(".dmg-more > summary");
    await page.click('.dmg-tog:has([data-dmg-opt="burana4"])');
    if (await page.locator('[data-dmg-opt="burana4"]').isChecked()) throw new Error("o interruptor do bônus não desligou");
    const off = await values();
    if (off === higher) throw new Error("desligar um bônus não mudou o dano");
    await page.click('[data-dmg-step="red"][data-d="1"]');
    if (await page.locator('[data-dmg-level="red"]').inputValue() !== "19") throw new Error("o botão + do nível não subiu o nível");
    if (await values() === off) throw new Error("subir o nível do Red Orb não mudou o dano");
    await page.click("[data-dmg-reset]");
    if (await page.locator('[data-dmg-level="red"]').inputValue() !== "18" || !(await page.locator('[data-dmg-opt="burana4"]').isChecked()))
      throw new Error("o Reset não voltou à build de referência");
    if (await page.locator('.dmg-tog.locked [data-dmg-opt]:checked').count()) throw new Error("um bônus de rank bloqueado aparece ligado");
    await page.click("#dmgRows .dmg-row > summary");
    await page.waitForSelector("#dmgRows .dmg-row[open] .dmg-factors li");
    // An elemental construct (Kamui) has no CRIT field, and with the ATK cleared the results ask for it
    await page.goto("/constructs/aeternion");
    await page.click('[data-sk-tab="DMG"]');
    await page.waitForSelector("#dmgRows .dmg-row");
    if (!(await page.locator('[data-dmg-sk="yellow"] [data-dmg-opt="sunfire"]').count())) throw new Error("o Sunfire não está na caixa do Yellow Orb");
    if (await page.locator('#cxDamage [data-dmg="critStat"]').count()) throw new Error("um personagem elemental não deveria ter campo de CRIT");
    await page.fill('#cxDamage [data-dmg="atk"]', "");
    await page.waitForFunction(() => !document.querySelector("#dmgRows .dmg-row"));
    await page.fill('#cxDamage [data-dmg="atk"]', "2000");
    await page.waitForSelector("#dmgRows .dmg-row");
    // The two team options exclude each other
    await page.click(".dmg-more > summary");
    await page.click('.dmg-tog:has([data-dmg-opt="hazeFire"])');
    if (await page.locator('[data-dmg-opt="hazePlasma"]').isChecked()) throw new Error("ligar o time sem Plasma Beam não desligou o time com Plasma Beam");
    // Vera: the six Absolute Pyre options sit in the Signature box and exclude each other
    await page.goto("/constructs/geiravor");
    await page.click('[data-sk-tab="DMG"]');
    await page.waitForSelector("#dmgRows .dmg-row");
    if (await page.locator('[data-dmg-sk="signature"] [data-dmg-opt^="pyre"]').count() !== 6) throw new Error("as 6 opções de Absolute Pyre não estão na caixa da Signature");
    await page.click('.dmg-tog:has([data-dmg-opt="pyre3"])');
    if (await page.locator('[data-dmg-opt="pyre6"]').isChecked()) throw new Error("Absolute Pyre de 3 orbes não desligou o de 6");
  },
  // Done or Skip on an event in the Events List takes its rewards out of the patch, and pressing it again brings them back
  "planner: lista de eventos": async page => {
    await page.goto("/calculator");
    await page.waitForSelector("[data-events-open]");
    await page.evaluate(() => localStorage.removeItem("dominik-calculator"));
    await page.reload();
    const totals = () => page.locator("[data-gain]").allInnerTexts().then(list => list.join("|"));
    const before = await totals();
    await page.click("[data-events-open]");
    await page.waitForSelector("#calcEvents[open]");
    // Events that already ended have Done and Skip locked, so the test takes the first one still running
    if (await page.locator("#calcEvents .calc-ev.ended [data-ev-set]:not([disabled])").count())
      throw new Error("um evento encerrado ainda deixa marcar Done ou Skip");
    const done = page.locator('#calcEvents .calc-ev:not(.ended) [data-ev-set="done"]').first(), skip = page.locator('#calcEvents .calc-ev:not(.ended) [data-ev-set="skip"]').first();
    await done.click();
    await page.click("[data-events-close]");
    if (await totals() === before) throw new Error("marcar um evento não mudou o ganho do patch");
    if (!(await page.locator("#calcEventsCount").innerText()).includes("1")) throw new Error("o botão Events List não mostrou a contagem");
    await page.reload();
    await page.click("[data-events-open]");
    if (await done.getAttribute("aria-pressed") !== "true") throw new Error("o evento marcado não ficou salvo");
    await skip.click();
    if (await done.getAttribute("aria-pressed") !== "false" || await skip.getAttribute("aria-pressed") !== "true") throw new Error("Done e Skip deveriam se excluir");
    await page.click("[data-events-close]");
    if (await totals() === before) throw new Error("pular um evento não tirou o ganho");
    await page.click("[data-events-open]");
    await skip.click();
    await page.click("[data-events-close]");
    if (await totals() !== before) throw new Error("desmarcar o evento não devolveu o ganho");
  },
  // The Tactical Assessment level lives in each patch's card, and the planner can be exported as an image with a preview first
  "planner: nível e imagem": async page => {
    await page.goto("/calculator");
    await page.waitForSelector("[data-events-open]");
    await page.evaluate(() => localStorage.removeItem("dominik-calculator"));
    await page.reload();
    const level = page.locator('.calc-patch:not([hidden]) [data-plan="level"]');
    if (!(await level.count())) throw new Error("o nível do Tactical Assessment não está no cartão do patch");
    const voucher = () => page.locator('.calc-patch:not([hidden]) [data-gain="voucher"]').innerText();
    const before = await voucher();
    await level.fill("80");
    if (await voucher() === before) throw new Error("o nível do patch não mudou os vouchers");
    await page.click("[data-calc-export]");
    await page.waitForSelector("#exportPreview canvas", { timeout: 15000 });
    await page.click('[data-xp="close"]');
  },
  "team builder": async (page, size) => {
    let step = "opening page";
    try {
    if (size === "desktop") await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/editor");
    // A new team starts on step 1, the choice of its page; picking one opens the cards
    step = "choosing the team's page";
    await page.waitForSelector(".ed-choose [data-ed-page]");
    if (await page.locator("#edStage").count()) throw new Error("o Team Builder mostrou os cards antes de escolher a página");
    await page.locator(".ed-choose [data-ed-page]").first().click();
    step = "checking fresh empty editor";
    await page.waitForSelector("#edStage .card .rank[data-ed-drop]",{state:"attached"});
    await page.waitForSelector('.ed-topbar [data-ed="choose"]');
    // "Change" goes back to step 1 and "Back to the team" returns, keeping the page
    await page.click('.ed-topbar [data-ed="choose"]');
    await page.click('.ed-choose [data-ed="back"]');
    await page.waitForSelector("#edStage .card");
    const emptyState = await page.evaluate(() => localStorage.getItem("dominik-editor"));
    const emptyArtifacts = await page.locator("#edStage .rank img, #edStage .wp img, #edStage .mem img, #edStage .mx img, #edStage .kit .cell img")
      .evaluateAll(items => items.map(item => `${item.closest(".card")?.dataset.edCard}:${item.parentElement?.className}:${item.getAttribute("src") || item.textContent}`));
    if ((emptyState && JSON.parse(emptyState).cards.some(card => card.char || card.cub || card.weapon || card.mem.some(Boolean))) || emptyArtifacts.length)
      throw new Error(`o Team Builder não abriu vazio por padrão: ${emptyArtifacts.join(",")}`);
    // Dark, the element of the test characters, so the picker lists them first. CATALOG is a name of the page's scripts, so read as text
    const firstPage = await page.evaluate('CATALOG.pages.find(p => p.name === "Dark").path');
    await page.evaluate(teamPage => localStorage.setItem("dominik-editor", JSON.stringify({
      page: teamPage,
      cards: [
        { char: "Adelyde: Anabasis", cub: "assets/characters/adelyde-anabasis/CUB - Kelpie.webp", mem: ["Cottie", "Cottie"] },
        { char: "Bianca: Crepuscule" }
      ]
    })), firstPage);
    step = "loading test team";
    await page.reload();
    await page.waitForSelector("#edStage .card");
    await page.evaluate(() => document.querySelector("#edStage").scrollIntoView()); // the Team box is tall on a phone, and images below the screen load lazily
    await page.waitForSelector("#edStage .card .rank[data-ed-drop]");
    const cards = page.locator("#edStage .card");
    if (await page.locator("#edPanel").count()) throw new Error("o painel lateral de peças ainda aparece");
    // Monta um rotation pelos botões e confere o texto que o time guarda
    const buildRotation = async () => {
      step = "building a rotation with the move buttons";
      const box = page.locator("#edDetail .ed-detail").nth(0);
      await box.locator('[data-ed-tab="rotation"]').click();
      const click = selector => box.locator(selector).first().click();
      await click('[data-rot-move="Red Orb"]');
      await click('[data-rot-act="more"]');
      await click('[data-rot-move="Red Orb"]');
      await click('[data-rot-move="Signature"]');
      await box.locator('[data-rot-act="hold"]').nth(2).click();
      await click('[data-rot-move="Swap out"]');
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("dominik-editor")).cards[0].rotation);
      if (saved !== ["# Turn 1", "Tap Red Orb 2x", "Tap Red Orb", "Hold Signature", "Swap out"].join("\n"))
        throw new Error(`o rotation montado pelos botões saiu diferente: ${JSON.stringify(saved)}`);
      if (await box.locator('textarea[name="c0.rotation"]').inputValue() !== saved)
        throw new Error("o texto do rotation não acompanhou os botões");
      if (!await box.locator(".ed-rot-preview .rot-line img").count()) throw new Error("a prévia do rotation não mostrou ícones");
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error("o construtor de rotation causou rolagem horizontal");
      await box.locator('[data-ed-tab="notes"]').click(); // os próximos testes escrevem em Notes
    };
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
      // QTE e Red Orb ficam atrás do botão "Others"
      await page.locator(".ed-res-menu-options [data-ed-more]").tap();
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
      await buildRotation();
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
    await buildRotation();
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
    // QTE e Red Orb ficam atrás do botão "Others"
    await page.locator(".ed-res-menu-options [data-ed-more]").click();
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
    await page.locator(".ed-res-menu-options [data-ed-more]").click();
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
    await page.fill("#edPickerSearch", "Darwin");
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
    step = "equipping the signature weapon on a new character";
    await cards.nth(2).locator(".portrait").click();
    // Watanabe is not of the team's element (Dark), so he is behind the "Others" button
    await page.click("#edPickerOptions [data-ed-more]");
    await page.locator('.ed-picker-option[data-ed-picker-value="Watanabe: Epitaph"]').click();
    const added = (await state()).cards[2];
    if (added.weapon !== "Watanabe: Epitaph" || added.weaponRank !== "6")
      throw new Error("o personagem novo não veio com a arma de assinatura 6★");
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
  const context = await browser.newContext({ ...SIZES[size], ...LOCALE, baseURL: base });
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

// --pt: the browser says it speaks Brazilian Portuguese, so this also tests that the site opens in Portuguese by itself.
// Without it the browser says English, whatever the language of this computer
const PT = process.argv.includes("--pt"), LOCALE = { locale: PT ? "pt-BR" : "en-US" };
// Git Bash rewrites /timeline into a Windows path, so addresses are written without the first slash
const chosen = process.argv.slice(2).filter(arg => arg !== "--a11y" && arg !== "--pt").map(arg => {
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
  const contexts = Object.fromEntries(await Promise.all(Object.keys(SIZES).map(async size => [size, await browser.newContext({ ...SIZES[size], ...LOCALE })])));
  const jobs = Object.keys(SIZES).flatMap(size => [
    ...paths.map(path => () => checkPage(contexts[size], size, path, base, chosen.length > 0 || SHOT_PAGES.includes(path))),
    ...(chosen.length || A11Y || PT ? [] : Object.keys(FLOWS).map(name => () => checkFlow(browser, size, name, base)))
  ]);
  const total = jobs.length;
  await pool(jobs);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  for (const [text, places] of problems) {
    const list = [...places].sort();
    console.log(`ERRO   ${text}\n       em ${list.slice(0, 3).join(", ")}${list.length > 3 ? ` e mais ${list.length - 3}` : ""}`);
  }
  const found = [...a11y].sort(([a], [b]) => IMPACT.indexOf(a.split(" ")[0]) - IMPACT.indexOf(b.split(" ")[0]) || a.localeCompare(b));
  for (const [text, { places, nodes, sample }] of found) {
    const list = [...places].sort();
    console.log(`A11Y   ${text}
       ${nodes} elemento(s) em ${list.slice(0, 3).join(", ")}${list.length > 3 ? ` e mais ${list.length - 3}` : ""}; exemplo: ${sample}`);
  }
  if (A11Y) console.log(`Acessibilidade: ${found.length} tipo(s) de problema (não afeta o código de saída).`);
  console.log(`${total} verificações em ${seconds}s: ${problems.size} problema(s). Prints em .smoke/`);
} finally {
  await browser.close();
  server.close();
}
process.exit(problems.size ? 1 : 0);
