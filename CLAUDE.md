# Dominik

Site de builds de Punishing: Gray Raven em HTML, CSS e JS puros, sem build e sem dependências em produção. Publicado em https://dominiko.pages.dev (Cloudflare Pages). `package.json` existe só para as ferramentas de desenvolvimento.

Textos do site e comentários do código ficam em inglês. Mensagens das ferramentas em `tools/` ficam em português.

## Computador novo

Na primeira sessão em um computador, confira estes itens antes de qualquer tarefa. Diga ao usuário o que falta e ofereça instalar o que der para instalar pelo terminal (`winget`, `npm`, `pip`, `code --install-extension`). O login do Cloudflare abre o navegador, então quem faz é o usuário.

1. Programas: Git, Node.js (hoje v26), Python 3 e Microsoft Edge (o smoke usa o Edge).
2. `git config core.hooksPath tools/githooks`: liga o pre-commit. Essa configuração não vem no clone.
3. `npm install`: ESLint e Playwright das ferramentas.
4. `pip install pillow numpy scipy`: só para `tools/style-ranks.py`.
5. `npx wrangler@4 login`: só para o deploy, uma vez por computador.
6. Extensões do VS Code: ficam em `.vscode/extensions.json`, e o VS Code oferece instalar ao abrir a pasta. Para instalar de uma vez: `code --install-extension <id>` para cada uma.
7. Pastas fora do git, que só existem se o usuário tiver guardado uma cópia: `drafts/` e `Dominik - arquivos fonte/`.

## Onde está cada coisa

| Arquivo | Conteúdo |
|---|---|
| `app.js` | Dados dos times (`COMPS`, `PAGES`) até a linha `const $ = (s, r = document)`; depois a interface, dividida por comentários `/* ---------- seção ---------- */` |
| `data/assets-data.js` | Textos das páginas Assets: memórias, armas, ressonâncias, CUBs, `CONSTRUCTS` |
| `data/skills-data.js` | Textos das skills. Só carrega quando uma página precisa, via `loadSkills()` |
| `data/calculator-data.js` | Renda por patch. `tools/update-calculator.mjs` atualiza a planilha; `frame` e as linhas de collab são escritos à mão |
| `editor.js` | Team Builder (`/editor`). Só carrega nessa página, junto com o catálogo |
| `data/catalog-data.js` | Gerado por `tools/make-catalog.mjs` (o deploy roda): o que um time do Team Builder pode ter. Não edite à mão |
| `functions/api/` | API no Cloudflare Pages: `submit.js` recebe um time do Team Builder (Turnstile, limites por IP, fila), `teams.js` devolve os aprovados, `admin.js` é por onde o bot do Discord aprova (segredo `ADMIN_KEY`; o bot fica em `../Dominik - bot/`). Só `/api/*` passa por aqui |
| `server/` | O que a API importa: `team.js` (validação, igual ao `edClean` do `editor.js`), `schema.sql` (tabelas do D1) e `catalog.js` (gerado por `make-catalog`) |
| `tools/review-teams.mjs` | Aprova ou rejeita os times enviados, no terminal, e regrava a chave `teams` do KV que o site lê. `--aprovados` lista e remove; `--local` usa o banco do `wrangler pages dev` |
| `wrangler.toml` | Ligações da API (D1 `DB`, KV `CACHE`). Segredos nunca entram aqui: `npx wrangler@4 pages secret put NOME --project-name dominiko` |
| `data/timeline-data.js` | Gerado por `tools/update-timeline.mjs`; não edite à mão |
| `assets/` | Artes originais, e é para onde os caminhos do código apontam |
| `assets-web/` | Cópias leves geradas por `tools/optimize-images.mjs`; `web()` no `app.js` troca o caminho ao renderizar. Nunca edite à mão |
| `tools/style-ranks.py` | Aplica o relevo do SSS+ aos ícones de rank chapados e grava em `assets/rank/`. Instruções no topo do arquivo |
| `.deploy/`, `.smoke/` | Saídas geradas, fora do git |

## Economizar contexto

- Não leia `app.js` nem `data/skills-data.js` inteiros. Busque com `Grep` e leia só o trecho. Para achar a parte da interface, busque `^/\* -{5,}` no `app.js`.
- `data/skills-data.js` e `data/assets-data.js` têm linhas muito longas: limite o resultado (`head_limit`, ou `cut -c1-200` no shell).

## Verificar

Depois de editar, rode o que couber na mudança e diga o resultado:

1. `node tools/check-assets.mjs`: toda imagem usada existe, com maiúsculas exatas. Menos de 1 s, e o pre-commit também roda.
2. `npm run lint`: nomes indefinidos e variáveis sem uso em todo o código, sem abrir o navegador. Pega o que o smoke não alcança, como um nome errado em um caminho raro.
3. `npm run smoke`: abre todas as páginas do `sitemap.xml` no Edge, em desktop e celular, e testa busca, troca de time, detalhe de arma, página de skills e menu do celular. Pega erro de JS, bloqueio de CSP, 404, página vazia e rolagem lateral. Leva cerca de 20 s. Na primeira vez em um computador, rode `npm install`.
4. `node tools/smoke.mjs timeline energy/fire`: só essas páginas, sem a barra inicial (o Git Bash a reescreve). `home` é a página inicial. Use também para páginas ainda fora do `sitemap.xml`, que só é refeito no deploy.

5. API e times da comunidade: o smoke não tem API. Rode `node tools/deploy.mjs --stage-only`, depois `npx wrangler@4 d1 execute dominik --local --file server/schema.sql` e `npx wrangler@4 pages dev .deploy --port 8788`. O `.dev.vars` (fora do git) guarda as chaves de teste do Turnstile, que sempre passam.

O smoke não julga aparência. Para mudanças visuais, abra com `Read` os prints em `.smoke/desktop/` e `.smoke/mobile/`, e diga ao usuário o que você realmente viu.

## Armadilhas

- **Maiúsculas:** o Windows ignora, o servidor não. Um nome errado só quebra depois de publicado.
- **`_redirects`:** o Cloudflare segue essas regras mesmo quando o arquivo existe. Nunca adicione regra geral como `/assets/*`, que pegaria as imagens.
- **Páginas novas:** cada endereço é um arquivo escrito por `tools/make-embeds.mjs`. Um tipo de página fora da lista desse script dá 404 no site publicado, mesmo funcionando no smoke, que serve `index.html` para qualquer endereço.
- **`_headers`:** o CSP não permite scripts inline nem imagens de outros sites. Tudo precisa estar no próprio site.
- **Cache de imagens:** `/assets-web/*` fica 7 dias no navegador. Arte trocada com o mesmo nome parece deploy com falha.
- **Ícone do embed:** o Discord guarda a imagem do preview pelo endereço dela, e `?v=` no link da página não muda isso. Arte nova do embed precisa de nome de arquivo novo (hoje `assets/embed-icon-3.png`).
- **`const $ = (s, r = document)`:** `check-assets`, `make-sitemap` e `make-embeds` usam essa linha para achar o fim dos dados. Se ela mudar, atualize esses scripts.
- **Times da comunidade:** entram em `PAGES` e `COMPS` depois que a página carrega (`loadCommunity()` no `app.js`), com endereço `/energy/fire?team=c-12`, porque só os endereços escritos pelo `make-embeds` existem como arquivo. Mudou `edClean` no `editor.js`? Mude `cleanTeam` em `server/team.js` igual.
- **`SITE_FILES` em `tools/deploy.mjs`:** um arquivo novo do site só é publicado se estiver nessa lista.

## Combinados

- Para adicionar personagem, build, time ou arma, use a skill `add-character`.
- Nunca invente dados do jogo. Quando o nome da wiki diferir do texto do site, vale o da wiki.
- Não faça commit, push ou deploy sem o usuário pedir. O deploy (`node tools/deploy.mjs`) é o usuário quem roda.
