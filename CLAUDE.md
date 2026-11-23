# Dominik

Site de builds de Punishing: Gray Raven em HTML, CSS e JS puros, sem build e sem dependências em produção. Publicado em https://dominiko.pages.dev (Cloudflare Pages). `package.json` existe só para as ferramentas de desenvolvimento.

Textos do site e comentários do código ficam em inglês. Mensagens das ferramentas em `tools/` ficam em português.

## Computador novo

Na primeira sessão em um computador, confira estes itens antes de qualquer tarefa. Diga ao usuário o que falta e ofereça instalar o que der para instalar pelo terminal (`winget`, `npm`, `pip`, `code --install-extension`). O login do Cloudflare abre o navegador, então quem faz é o usuário.

1. Programas: Git, Node.js (hoje v26), Python 3 e Microsoft Edge (o smoke usa o Edge).
2. `git config core.hooksPath tools/githooks`: liga o pre-commit. Essa configuração não vem no clone.
3. `npm install`: ESLint, Playwright e o wrangler (Cloudflare) das ferramentas. Use sempre `npx wrangler ...`, que roda a versão instalada no projeto, sem baixar de novo.
4. `pip install pillow numpy scipy`: só para `tools/style-ranks.py`.
5. `npx wrangler login`: só para o deploy, uma vez por computador.
6. Extensões do VS Code: ficam em `.vscode/extensions.json`, e o VS Code oferece instalar ao abrir a pasta. Para instalar de uma vez: `code --install-extension <id>` para cada uma.
7. Pastas fora do git, que só existem se o usuário tiver guardado uma cópia: `drafts/` e `Dominik - arquivos fonte/`.

## Onde está cada coisa

| Arquivo | Conteúdo |
|---|---|
| `app.js` | Dados até a linha `const $ = (s, r = document)` (o site não tem builds próprias: `COMPS` e `PAGES` começam vazios e recebem os times da comunidade; `HOME_BELT` é a lista fixa da esteira da home); depois a interface, dividida por comentários `/* ---------- seção ---------- */` |
| `data/assets-data.js` | Textos das páginas Assets: memórias, armas, ressonâncias, CUBs, `CONSTRUCTS` |
| `data/skills-data.js` | Textos das skills. Só carrega quando uma página precisa, via `loadSkills()` |
| `data/calculator-data.js` | Renda por patch. `tools/update-calculator.mjs` atualiza a planilha; `frame` e as linhas de collab são escritos à mão |
| `data/updates-data.js` | Posts da página Updates, em Markdown, do mais novo para o mais antigo. Só carrega em `/updates`. Escrito à mão e só quando o usuário pedir um post (sem rotina nem script); o formato está no topo do arquivo |
| `data/damage-formulas.js` | Motor do cálculo de dano: funções puras, sem DOM. Testes: `node tools/test-damage.mjs`. Plano e fontes em `docs/calculo-de-dano.md`. Os dados do jogo para ele (`FRAME_STATS`, `DAMAGE_KITS`, `ENEMY_PRESETS`) ficam em `data/damage-data.js`, cada um com fonte. Os dois só carregam na página de um construct (`loadDamage()` no `app.js`, seção "damage"), e a calculadora é a aba vermelha "DMG Calculator" ao lado das abas de skills, que só aparece para quem está em `DAMAGE_KITS`. Para montar um kit: `node tools/kit-from-huaxu.mjs "Nome: Frame"` imprime as skills do Huaxu no nível 18. **Fica fora do deploy:** `const DAMAGE_ENABLED = true;` no `app.js` liga a calculadora no site local, e o `tools/deploy.mjs` troca para `false` na cópia publicada e não copia os dois arquivos |
| `editor.js` | Team Builder (`/editor`). Só carrega nessa página, junto com o catálogo |
| `data/catalog-data.js` | Gerado por `tools/make-catalog.mjs` (o deploy roda): o que um time do Team Builder pode ter. Não edite à mão |
| `functions/api/` | API no Cloudflare Pages. Contas: `auth/login.js` e `auth/callback.js` (login pelo Discord, OAuth com `state`), `auth/logout.js`, `auth/dev.js` (contas de teste, só com `DEV_LOGIN` no `.dev.vars` e em `127.0.0.1`), `me.js` (quem está logado; DELETE apaga a conta) e `me/export.js` (baixar os dados). Times: `submit.js` publica um time do Team Builder direto no site (exige login, Turnstile, limites por conta e por IP), `teams.js` devolve os times no ar com autor e curtidas (cache de 30 s; `?fresh=` pula), `like.js`, `report.js`, `team-delete.js` (o autor apaga de vez; um admin tira do ar), `share.js` (links curtos `/editor?s=<código>`). Moderação: `admin/teams.js`, `admin/users.js` e `admin/log.js`, só para admins. Só `/api/*` passa por aqui |
| `server/` | O que a API importa: `session.js` (sessão em cookie `HttpOnly`, hash do token no banco, `sameOrigin`, `needUser`/`needAdmin`, registro das ações de admin), `team.js` (validação, igual ao `edClean` do `editor.js`), `migrations/` (tabelas do D1: `npx wrangler d1 migrations apply dominik --remote`, ou `--local`) e `catalog.js` (gerado por `make-catalog`) |
| `admin-panel.js` | Painel de admin (`/admin`): denúncias, times, contas e registro. Só carrega nessa página e só para admins; o servidor confere o papel em cada rota `admin/*`. As páginas `/account` (conta, baixar ou apagar os dados) e `/privacy` (LGPD, GDPR) ficam no `app.js`, seção "accounts" e "Privacy" |
| `wrangler.toml` | Ligações da API (D1 `DB`, com `migrations_dir`). Segredos nunca entram aqui: `npx wrangler pages secret put NOME --project-name dominiko`. A API lê `TURNSTILE_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `OWNER_DISCORD_ID` (sempre admin, não pode ser banido) e `IP_SALT`. `DEV_LOGIN` só no `.dev.vars` |
| `data/timeline-data.js` | Gerado por `tools/update-timeline.mjs`; não edite à mão |
| `assets/` | Artes originais, e é para onde os caminhos do código apontam |
| `assets-web/` | Cópias leves geradas por `tools/optimize-images.mjs`; `web()` no `app.js` troca o caminho ao renderizar. Nunca edite à mão |
| `tools/fetch-colors.mjs` | Copia as cores do texto do jogo (via `api.huaxu.app`) para as skills e os CUBs como marcas `[r]...[/r]` e `[b]...[/b]`, sem mudar as palavras. O `app.js` (`highlight`, `skillBody`, `describe`) as mostra; texto sem marca usa a coloração automática. Regras em `docs/cores-texto.md` |
| `docs/` | Pesquisas e relatórios fora do deploy: `calculo-de-dano.md`, `mecanicas-pgr.md`, `cores-texto.md`, `revisao-codigo.md`, `revisao-visual.md`, `ferramentas.md` |
| `tools/style-ranks.py` | Aplica o relevo do SSS+ aos ícones de rank chapados e grava em `assets/rank/`. Instruções no topo do arquivo |
| `.deploy/`, `.smoke/` | Saídas geradas, fora do git |

## Economizar contexto

- Não leia `app.js` nem `data/skills-data.js` inteiros. Busque com `Grep` e leia só o trecho. Para achar a parte da interface, busque `^/\* -{5,}` no `app.js`.
- `data/skills-data.js` e `data/assets-data.js` têm linhas muito longas: limite o resultado (`head_limit`, ou `cut -c1-200` no shell).

## Verificar

Depois de editar, rode o que couber na mudança e diga o resultado:

1. `node tools/check-assets.mjs`: toda imagem usada existe, com maiúsculas exatas. Menos de 1 s, e o pre-commit também roda.
2. `npm run lint`: nomes indefinidos e variáveis sem uso em todo o código, sem abrir o navegador. Pega o que o smoke não alcança, como um nome errado em um caminho raro.
3. `npm run smoke`: abre todas as páginas do `sitemap.xml` no Edge, em desktop e celular, e testa busca, página sem times, conta deslogada, detalhe de arma, página de skills e menu do celular. Pega erro de JS, bloqueio de CSP, 404, página vazia e rolagem lateral. Leva cerca de 30 s. Na primeira vez em um computador, rode `npm install`.
4. `node tools/smoke.mjs timeline energy/fire`: só essas páginas, sem a barra inicial (o Git Bash a reescreve). `home` é a página inicial. Use também para páginas ainda fora do `sitemap.xml`, que só é refeito no deploy.

5. API, contas e times da comunidade: o smoke não tem API. Rode `node tools/deploy.mjs --stage-only`, depois `npx wrangler d1 migrations apply dominik --local` e `npx wrangler pages dev .deploy --port 8788 --ip 127.0.0.1`. O `.dev.vars` (fora do git) guarda as chaves de teste do Turnstile, que sempre passam, e `DEV_LOGIN=1`: `http://127.0.0.1:8788/api/auth/dev?as=user` (ou `admin`, `other`) entra sem o Discord. `tools/api.http` (extensão REST Client) tem as requisições; as instruções estão no topo do arquivo. O `pages dev` lê o `_headers` só ao iniciar: mudou o CSP, reinicie o servidor.

O smoke não julga aparência. Para mudanças visuais, abra com `Read` os prints em `.smoke/desktop/` e `.smoke/mobile/`, e diga ao usuário o que você realmente viu.

## Armadilhas

- **Maiúsculas:** o Windows ignora, o servidor não. Um nome errado só quebra depois de publicado.
- **`_redirects`:** o Cloudflare segue essas regras mesmo quando o arquivo existe. Nunca adicione regra geral como `/assets/*`, que pegaria as imagens.
- **Páginas novas:** cada endereço é um arquivo escrito por `tools/make-embeds.mjs`. Um tipo de página fora da lista desse script dá 404 no site publicado, mesmo funcionando no smoke, que serve `index.html` para qualquer endereço.
- **`_headers`:** o CSP não permite scripts inline, nem imagens ou fontes de outros sites (as fontes ficam em `assets/fonts/`, declaradas no topo do `style.css`). Tudo precisa estar no próprio site.
- **Cache de imagens:** `/assets-web/*` fica 7 dias no navegador. Arte trocada com o mesmo nome parece deploy com falha.
- **Ícone do embed:** o Discord guarda a imagem do preview pelo endereço dela, e `?v=` no link da página não muda isso. Arte nova do embed precisa de nome de arquivo novo (hoje `assets/embed-icon-4.png`).
- **`const $ = (s, r = document)`:** `check-assets`, `make-sitemap` e `make-embeds` usam essa linha para achar o fim dos dados. Se ela mudar, atualize esses scripts.
- **Times da comunidade:** são os únicos times do site. Entram em `PAGES` e `COMPS` depois que a página carrega (`loadCommunity()` no `app.js`), com endereço `/energy/fire?team=c-12`, porque só os endereços escritos pelo `make-embeds` existem como arquivo. Os endereços das builds antigas (`/energy/ice/leia-sub-dps` etc.) levam à página delas pelo `_redirects`. Mudou `edClean` no `editor.js`? Mude `cleanTeam` em `server/team.js` igual.
- **Marcas de cor (`[r]`, `[b]`) nos textos de skills e CUBs:** só o `app.js` as transforma em cor. Qualquer outro uso desses textos (dica, prévia do Discord, comparação) precisa tirá-las: `unmark()` no `app.js`, e o mesmo `replace(/\[\/?[rb]\]/g, "")` em `tipAttr`, `make-embeds`, `check-assets` e `fetch-skills --comparar`.
- **`SITE_FILES` em `tools/deploy.mjs`:** um arquivo novo do site só é publicado se estiver nessa lista.
- **Contas:** toda rota da API que muda algo passa por `needUser`/`needAdmin` do `server/session.js`, que confere o `Origin` (contra CSRF) e a sessão. Rota nova de admin? Use `needAdmin` e grave com `logAdmin`. Tabela nova? Uma migração nova em `server/migrations/`, nunca editar as que já foram aplicadas.
- **`EXTRA_CUBS`:** lista todos os C.U.B.s do site (antes, metade vinha das builds). O sexto campo é a ordem das skills (`true`, ou uma lista como `[3, 2, 1, 4, 5, 6]`), e o sétimo é o tipo do arquivo (`"webp"`); os times salvos dependem dessa ordem.

## Combinados

- Para adicionar personagem ou arma, use a skill `add-character`. Times e builds não são mais escritos no código: vêm do Team Builder, publicados pelas contas.
- Nunca invente dados do jogo. Quando o nome da wiki diferir do texto do site, vale o da wiki.
- Não faça commit, push ou deploy sem o usuário pedir. O deploy (`node tools/deploy.mjs`) é o usuário quem roda.

## Pendências

- **Tradução para português (pt-BR): em andamento, desligada.** Nenhuma tradução vai para o deploy. `const I18N_ENABLED = false` no `i18n.js` deixa o site só em inglês e o botão "EN | PT" do menu bloqueado; `tools/deploy.mjs` não copia `data/pt/` e para se o `i18n.js` publicado não estiver com `false`. Para ver o português no site local: `?lang=pt` em `localhost`/`127.0.0.1` (só funciona nessa máquina). O texto em inglês é a chave: `t("...")`, `tn(n, "{n} build")`, `tRot()` para passos de rotação. Regras no topo de `i18n.js` e `data/pt/ui.js`.
  - Feito: toda a interface do `app.js` e do `editor.js` (`data/pt/ui.js`), frases da home (`splashes.js`), memórias, armas, ressonâncias, Weapon Harmony e Leader Skills (`assets.js`), CUBs (`cubs.js`) e os posts de Novidades (`updates.js`, carrega só em `/updates`). O título da aba fica igual nos dois idiomas.
  - Mudou um texto em inglês (nota de build, efeito, post)? A entrada em `data/pt/` deixa de bater e o texto aparece em inglês até ser traduzido de novo.
  - Falta: as skills. Ficam fora do deploy, em `drafts/traducao-pt/` (prontas: Leia: Fortunaster e Adelyde: Anabasis; passo a passo e ferramentas no `README.md` de lá). A escala por nível do `app.js` (`SCALE_DEALS`) já reconhece "causa X%". Opcional: embeds do Discord em pt.
  - `npm run smoke -- --pt` abre cada página com `?lang=pt` (só páginas; os testes de clique procuram texto em inglês). Sem `--pt` o smoke força inglês.
  - Para ligar no site publicado: termine o que falta, troque para `I18N_ENABLED = true` e tire do `deploy.mjs` a exclusão de `data/pt/` e a checagem do `false`.
- **Contas no site publicado: falta a configuração do usuário.** O código está pronto e testado no local. Para ligar: criar (ou reaproveitar) o app no Discord Developer Portal com os Redirects `https://dominiko.pages.dev/api/auth/callback` e `http://127.0.0.1:8788/api/auth/callback`; gravar os segredos `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `OWNER_DISCORD_ID` e `IP_SALT`; apagar `ADMIN_KEY` e `DISCORD_WEBHOOK_URL`; `npx wrangler d1 migrations apply dominik --remote`; deploy. Sem os segredos do Discord, o botão de login responde 503 e o resto do site funciona.
- **Calculadora de dano: fora do deploy** até ficar pronta (`DAMAGE_ENABLED` no `app.js`). Para publicar: tire do `deploy.mjs` a troca para `false` e os dois arquivos de `DRAFT_PATHS`.
- **Comentários nas builds:** combinado para depois das contas.
