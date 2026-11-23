/* ---------- language: English by default, Portuguese (pt-BR) on request ----------
   The English text is the key: t("Search...") returns it as is, and in Portuguese looks it up in I18N_PT (data/pt/*.js).
   A text with no entry stays in English, so the translation can grow a piece at a time.
   Game names (skills, effects, characters, weapons) are never keys: they are not passed through t(). */
// Off until the translation is finished: the site is English only and the EN | PT button is locked.
// tools/deploy.mjs refuses to publish it on, and leaves data/pt/ out. To check the Portuguese meanwhile, open the local
// site (localhost or 127.0.0.1, as npm run smoke -- --pt does) with ?lang=pt: that only works on this computer
const I18N_ENABLED = false;
const LANGS = ["en", "pt"], LANG_KEY = "dominik-lang";
// The choice, from the strongest source: ?lang= in the link, the button of the side menu, then the browser language
const LANG = (() => {
  if (!I18N_ENABLED) return /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).get("lang") === "pt" ? "pt" : "en";
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(fromUrl)) {
    try { localStorage.setItem(LANG_KEY, fromUrl); }
    catch { /* the link still decides this visit */ }
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* no saved choice */ }
  return (navigator.languages?.length ? navigator.languages : [navigator.language]).some(l => /^pt\b/i.test(l || "")) ? "pt" : "en";
})();
document.documentElement.lang = LANG === "pt" ? "pt-BR" : "en";
// The dictionary is one small script that only a Portuguese visit downloads. It must be there before app.js runs
const I18N_PT = {};
if (LANG === "pt") for (const file of ["ui", "splashes", "assets", "cubs"]) document.write(`<script src="data/pt/${file}.js"></script>`);
const fill = (text, vars) => vars ? text.replace(/\{(\w+)\}/g, (all, k) => k in vars ? vars[k] : all) : text;
const t = (text, vars) => fill((LANG === "pt" && I18N_PT[text]) || text, vars);
// Plural: tn(n, "{n} build", "{n} builds"). In Portuguese the entry is [one, many], keyed by the English singular
function tn(n, one, many = `${one}s`) {
  const pair = LANG === "pt" && I18N_PT[one];
  const text = pair ? (n === 1 || n === 0 ? pair[0] : pair[1]) : n === 1 ? one : many;
  return fill(text, { n });
}
// Dates and numbers follow the language; the English pages keep the format they always had
const loc = en => LANG === "pt" ? "pt-BR" : en;

// The text already in index.html (menu, search box) is translated once, in place. It waits for the page to be read, which is after the dictionary
function translateStatic() {
  const walker = document.createTreeWalker(document.getElementById("side"), NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.trim();
    if (text && I18N_PT[text]) node.nodeValue = node.nodeValue.replace(text, I18N_PT[text]);
  }
  document.querySelectorAll("#side [placeholder],#side [aria-label]").forEach(el => {
    for (const attr of ["placeholder", "aria-label"]) if (I18N_PT[el.getAttribute(attr)]) el.setAttribute(attr, I18N_PT[el.getAttribute(attr)]);
  });
}
if (LANG === "pt") document.addEventListener("DOMContentLoaded", translateStatic);

// The button of the side menu: picking the other language saves it and reloads, so every page draws again in it
const langBtn = document.getElementById("langBtn");
if (langBtn) langBtn.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-lang"/></svg><span>${LANGS.map(l => `<b${l === LANG ? ' class="on"' : ""}>${l.toUpperCase()}</b>`).join(" | ")}</span>`;
// Hidden while the translation is off: a button that does nothing looks broken
if (langBtn && !I18N_ENABLED) langBtn.remove();
if (langBtn && I18N_ENABLED) {
  langBtn.onclick = () => {
    const next = LANGS[(LANGS.indexOf(LANG) + 1) % LANGS.length];
    try { localStorage.setItem(LANG_KEY, next); }
    catch { /* without storage the link carries the choice */ }
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    location.replace(url);
  };
}
