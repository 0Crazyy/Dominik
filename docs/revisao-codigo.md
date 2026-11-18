# Revisão de código (2026-11-18)

**Status (2026-11-18):** bugs confirmados 1–6 e erros de dados D1–D5 **corrigidos** a pedido do usuário. Detalhes: (1) `\b` no `skillBody`; (2) smoke tira o print aumentando a janela e esperando dois quadros, em vez de `fullPage`; (3) depois de `stale` o Team Builder pede para esperar; (4) `limit` responde 429; (5) URL malformada vira "Page not found"; (6) mensagem para `bad`. D1 também corrigido na origem (`tools/fetch-skills.mjs` não dobra mais o prefixo; `LEADER_SKILLS` de Karenina alinhado). As suspeitas 7–12 continuam abertas, só o item 10 (`share.js` no `CLAUDE.md`) foi feito.

## Base

| Verificação | Resultado |
|---|---|
| `node tools/check-assets.mjs` | 2101 imagens, 0 erro, 0 aviso |
| `npm run lint` | sem avisos |
| `npm run smoke` | 238 verificações, 0 problema |
| `node tools/smoke.mjs --a11y` | 1 tipo de problema: `target-size` em `/timeline` (desktop), ex. `a[data-tip="Lee: Entropy"]` menor que 24 px |

## Bugs confirmados

| # | Gravidade | Onde | Problema | Correção proposta |
|---|---|---|---|---|
| 1 | Média | [app.js:3046](../app.js#L3046) | Na regex do título de skill, `(?:Tap\|Press\|…\|Successful)b.*` tem `b` literal no lugar de `\b`. Linhas como "Eradication - Tap QTE" (Hanying: Solacetune) e "Cipher of Synergy - Press and hold Basic Attack" (Alisa: Echo) não se dividem: a condição não fica azul e aparece junto do nome. Medido: 10 linhas em `skills-data.js` caem nesse caso (as que têm " + " escapam pela outra alternativa). | Trocar `b.*` por `\b.*`. |
| 2 | Média (ferramenta) | [tools/smoke.mjs:111](../tools/smoke.mjs#L111) | O print de página inteira de `/constructs/fortunaster` no desktop sai como o menu lateral repetido em blocos, sem o conteúdo. A página está certa (print da área visível confirma). Os prints dessa página não servem para revisar visual. | Para páginas cujo conteúdo rola dentro de `#main`, tirar o print da área visível ou do elemento `#main` (`locator("#main").screenshot()`), ou ajustar a altura da janela à do `#main` antes do print. |
| 3 | Baixa | [functions/api/submit.js](../functions/api/submit.js) (fim da rotina) | Depois de um erro `stale`, o Team Builder pede um carimbo novo (`edConfig = edLoadConfig()` em [editor.js:1060](../editor.js#L1060)); se a pessoa clicar em enviar de novo em menos de 10 s, recebe `early` ("That was fast"). | No cliente, ao receber `stale`, esperar o novo carimbo e avisar "Send again in a few seconds", ou o servidor aceitar carimbo novo sem `MIN_WAIT` quando o anterior expirou. |
| 4 | Baixa | [functions/api/submit.js](../functions/api/submit.js) (bloco "after") | Quando a recontagem depois do INSERT passa do limite por IP, a resposta é `limit` com status **503**; antes do INSERT, o mesmo erro é **429**. | Usar 429 para `limit` e 503 só para `full`. |
| 5 | Baixa | [app.js:3569](../app.js#L3569) | `decodeURIComponent` em endereço malformado (ex.: `/energy/%E0`) lança `URIError`; `route()` para e a página fica vazia. | Envolver em `try/catch` e cair em "Page not found". |
| 6 | Baixa | [editor.js:1061](../editor.js#L1061) | O servidor pode responder `bad` (corpo inválido/grande demais, origem diferente); o cliente não tem mensagem para ele e mostra "Check your connection". | Adicionar `bad` em `ED_ERRORS`. |

## Erros nos dados (achados pela prévia de `tools/fetch-colors.mjs`)

| # | Onde | Problema |
|---|---|---|
| D1 | `data/skills-data.js`, 27 entradas `Leader` | Nome com prefixo dobrado, visível no título da skill: "Leader - Leader - Riot of Color". `Karenina: Effulgence` tem "Eye of the Storm" sem o prefixo que os outros têm. |
| D2 | `Lee: Palefire` / Bipolar Expansion | "increases by 10%%". |
| D3 | `Lee: Palefire` / Infernal Shot | Duas linhas coladas: "every 0.5s.- Attacking enemies…" (falta a quebra antes do "- "). |
| D4 | `Lee: Palefire` / Signature | "360o Shooting" no lugar de "360° Shooting" (o jogo usa "°"). |
| D5 | `Teddy: Decryptor` | "Sucessor's RGB" (provável "Successor's"; conferir na wiki). |

## Suspeitas (decisão do usuário)

| # | Onde | Observação |
|---|---|---|
| 7 | `server/schema.sql` (`teams_hash` único) + `submit.js` | Um time rejeitado ou removido continua com o mesmo `hash`; enviar o mesmo time de novo dá sempre `duplicate` ("This exact team was already sent"), mesmo depois de corrigido só o autor. Se a ideia é permitir reenviar depois de rejeição, o `hash` teria de ser liberado ao rejeitar. |
| 8 | [app.js:2760](../app.js#L2760) `loadCommunity()` | Basta haver 1 time aprovado para **toda visita a qualquer página** baixar `catalog-data.js` (4400 linhas) e `editor.js` só para rodar `edClean`. Custo de rede em todo acesso. Alternativa: o servidor já entrega times limpos (o `admin.js` só publica o que passou por `cleanTeam`), então um conversor leve no `app.js` bastaria, ou carregar só quando a página atual lista builds. |
| 9 | `edClean` × `cleanTeam` | Iguais no essencial. Diferenças: o cliente descarta personagem repetido no card (o servidor recusa o time inteiro via `teamProblem`); o servidor faz `trim()` nos textos e o cliente não. Não quebra nada hoje, mas o `share.js` aceita times com personagem repetido. |
| 10 | `functions/api/share.js` | Não aparece na tabela "Onde está cada coisa" do `CLAUDE.md` (lá só há `submit`, `teams`, `hidden`, `admin`). |
| 11 | [app.js:1252](../app.js#L1252) `nextSplash()` | Com `HOME_SPLASHES` vazio, `phrase` é `undefined` e `splashMarkup` quebra a home. Só acontece se a lista for esvaziada. |
| 12 | `tools/deploy.mjs` | O deploy roda `check-assets`, mas não `lint` nem `smoke`. Um erro de JS só aparece depois de publicado se o usuário esquecer o smoke. |

## Conferido e sem problema

- Escape: `esc()` cobre `& < > "`; todos os atributos com `${…}` usam aspas duplas (nenhum com aspas simples ou sem aspas). Textos dos times da comunidade (nome, autor, notas, rotação) passam por `esc()`.
- CSP de `_headers`: export de imagem usa canvas + `blob:` só no download (não vira `<img>`), então `img-src 'self'` não bloqueia.
- API: origem conferida, tamanho máximo, honeypot, carimbo assinado, Turnstile, limites por IP com recontagem pós-INSERT, IP só em hash e apagado em 2 dias, comparação do `ADMIN_KEY` por hash.
- `SITE_FILES` cobre todos os arquivos de `data/`; `functions/` é lido pelo wrangler a partir da raiz.
