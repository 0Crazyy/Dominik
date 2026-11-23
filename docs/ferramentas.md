# Ferramentas sugeridas (2026-11-18)

Nada aqui foi instalado. Cada item diz o que faz, por que serve neste projeto e como instalar. Já instalado (`.vscode/extensions.json`): Claude Code, ESLint, Error Lens, HTML CSS Support, Prettier, JavaScript snippets, Live Server, Playwright, REST Client, PowerShell, PDF, Context7 MCP. Skill do projeto: `add-character`.

## Prioridade alta

| Ferramenta | Tipo | Por que aqui | Como instalar |
|---|---|---|---|
| **cloudflare/skills** (oficial da Cloudflare) | Skills do Claude Code | Ensina Pages, Functions, D1 e `wrangler` do jeito atual. O projeto tem API em `functions/api/` com D1 e KV; hoje o conhecimento vem só da memória do modelo. | No Claude Code: `/plugin marketplace add cloudflare/skills` |
| **Cloudflare API MCP** (`https://mcp.cloudflare.com/mcp`, oficial) | Servidor MCP | Ler o D1 de produção (times, contas, denúncias), ver deploys e logs do Pages sem abrir o painel. Login por OAuth, então é o usuário quem conecta. | `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/mcp` |
| **webapp-testing** (anthropics/skills) | Skill do Claude Code | Roteiro pronto para dirigir o site com Playwright e tirar prints; complementa o `tools/smoke.mjs` quando é preciso clicar em algo específico (Team Builder, export de imagem). | `npx skills add https://github.com/anthropics/skills --skill webapp-testing` |
| **Skill do projeto `update-colors`** (nova, a escrever) | Skill local | Passo a passo de `docs/cores-texto.md`: rodar `tools/fetch-colors.mjs` com prévia, conferir os não achados, gravar. Evita esquecer as cores num personagem novo. | Arquivo em `.claude/skills/update-colors/SKILL.md` |

## Prioridade média

| Ferramenta | Tipo | Por que aqui | Como instalar |
|---|---|---|---|
| **Skill do projeto `patch-notes`** (nova) | Skill local | Transforma as notas de patch (export do Discord) em itens para `notas-update.md` e em pendências de dados (frame novo, memória reformulada, mudança de dano para `calculo-de-dano.md`). | `.claude/skills/patch-notes/SKILL.md` |
| **frontend-design** (anthropics/skills) | Skill | Para as melhorias de `docs/revisao-visual.md` (filtros compactos, Team Builder). Respeita HTML/CSS puros. | `npx skills add https://github.com/anthropics/skills --skill frontend-design` |
| **axe Accessibility Linter** (`deque-systems.vscode-axe-linter`) | Extensão VS Code | Aponta no editor os mesmos problemas que o `smoke --a11y` acha, só que no HTML de `index.html`/`review-gui.html`. Não lê os templates do `app.js`, então é complemento. | `code --install-extension deque-systems.vscode-axe-linter` |
| **Code Spell Checker** (`streetsidesoftware.code-spell-checker`) | Extensão VS Code | Pegaria erros como "Sucessor's RGB" e "360o" nos dados. Precisa de dicionário do projeto com os nomes do jogo (gera muito aviso no começo). | `code --install-extension streetsidesoftware.code-spell-checker` |
| **SQLite Viewer** (`qwtel.sqlite-viewer`) | Extensão VS Code | Abre o banco local do `wrangler pages dev` (`.wrangler/state/.../*.sqlite`) para conferir a fila de times sem SQL. | `code --install-extension qwtel.sqlite-viewer` |

## Quando retomar a tradução

| Ferramenta | Por que | Como |
|---|---|---|
| **i18n Ally** (`lokalise.i18n-ally`) | Mostra as chaves de `drafts/traducao-pt/data-pt/ui.js` no lugar do texto e aponta o que falta traduzir. Só serve se o formato de chaves for compatível; conferir antes. | `code --install-extension lokalise.i18n-ally` |

## Não recomendado

- **Prettier no `app.js`/dados**: já está instalado, mas formatar os arquivos de dados (linhas longas de propósito) geraria diffs enormes. Manter desligado nesses arquivos.
- **Live Server**: o smoke já serve o site com as regras do `_headers` (CSP). O Live Server não aplica o CSP, então esconde erros que só aparecem publicados.
- **Bundlers / frameworks**: contra a regra do projeto (sem build).

## Fontes

- Skills oficiais: https://github.com/anthropics/skills (webapp-testing, frontend-design).
- Cloudflare + Claude Code: https://developers.cloudflare.com/agent-setup/claude-code/ e https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
- Lista comunitária: https://github.com/travisvn/awesome-claude-skills
