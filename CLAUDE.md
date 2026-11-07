# Dominik

Site de builds de Punishing: Gray Raven em HTML, CSS e JS puros, sem build e sem dependências em produção. Publicado em https://dominiko.pages.dev (Cloudflare Pages). `package.json` existe só para as ferramentas de desenvolvimento.

Textos do site e comentários do código ficam em inglês. Mensagens das ferramentas em `tools/` ficam em português.

## Onde está cada coisa

| Arquivo | Conteúdo |
|---|---|
| `app.js` | Dados dos times (`COMPS`, `PAGES`) até a linha `const $ = (s, r = document)`; depois a interface, dividida por comentários `/* ---------- seção ---------- */` |
| `assets-data.js` | Textos das páginas Assets: memórias, armas, ressonâncias, CUBs, `CONSTRUCTS` |
| `skills-data.js` | Textos das skills. Só carrega quando uma página precisa, via `loadSkills()` |
| `calculator-data.js` | Renda por patch. `tools/update-calculator.mjs` atualiza a planilha; `frame` e as linhas de collab são escritos à mão |
| `timeline-data.js` | Gerado por `tools/update-timeline.mjs`; não edite à mão |
| `assets/` | Artes originais, e é para onde os caminhos do código apontam |
| `assets-web/` | Cópias leves geradas por `tools/optimize-images.mjs`; `web()` no `app.js` troca o caminho ao renderizar. Nunca edite à mão |
| `.deploy/`, `.smoke/` | Saídas geradas, fora do git |

## Economizar contexto

- Não leia `app.js` nem `skills-data.js` inteiros. Busque com `Grep` e leia só o trecho. Para achar a parte da interface, busque `^/\* -{5,}` no `app.js`.
- `skills-data.js` e `assets-data.js` têm linhas muito longas: limite o resultado (`head_limit`, ou `cut -c1-200` no shell).

## Verificar

Depois de editar, rode o que couber na mudança e diga o resultado:

1. `node tools/check-assets.mjs`: toda imagem usada existe, com maiúsculas exatas. Menos de 1 s, e o pre-commit também roda.
2. `npm run lint`: nomes indefinidos e variáveis sem uso em todo o código, sem abrir o navegador. Pega o que o smoke não alcança, como um nome errado em um caminho raro.
3. `npm run smoke`: abre todas as páginas do `sitemap.xml` no Edge, em desktop e celular, e testa busca, troca de time, detalhe de arma e menu do celular. Pega erro de JS, bloqueio de CSP, 404, página vazia e rolagem lateral. Leva cerca de 20 s. Na primeira vez em um computador, rode `npm install`.
4. `node tools/smoke.mjs timeline energy/fire`: só essas páginas, sem a barra inicial (o Git Bash a reescreve). `home` é a página inicial. Use também para páginas ainda fora do `sitemap.xml`, que só é refeito no deploy.

O smoke não julga aparência. Para mudanças visuais, abra com `Read` os prints em `.smoke/desktop/` e `.smoke/mobile/`, e diga ao usuário o que você realmente viu.

## Armadilhas

- **Maiúsculas:** o Windows ignora, o servidor não. Um nome errado só quebra depois de publicado.
- **`_redirects`:** o Cloudflare segue essas regras mesmo quando o arquivo existe. Nunca adicione regra geral como `/assets/*`, que pegaria as imagens.
- **Páginas novas:** cada endereço é um arquivo escrito por `tools/make-embeds.mjs`. Um tipo de página fora da lista desse script dá 404 no site publicado, mesmo funcionando no smoke, que serve `index.html` para qualquer endereço.
- **`_headers`:** o CSP não permite scripts inline nem imagens de outros sites. Tudo precisa estar no próprio site.
- **Cache de imagens:** `/assets-web/*` fica 7 dias no navegador. Arte trocada com o mesmo nome parece deploy com falha.
- **`const $ = (s, r = document)`:** `check-assets`, `make-sitemap` e `make-embeds` usam essa linha para achar o fim dos dados. Se ela mudar, atualize esses scripts.
- **`SITE_FILES` em `tools/deploy.mjs`:** um arquivo novo do site só é publicado se estiver nessa lista.

## Combinados

- Para adicionar personagem, build, time ou arma, use a skill `add-character`.
- Nunca invente dados do jogo. Quando o nome da wiki diferir do texto do site, vale o da wiki.
- Não faça commit, push ou deploy sem o usuário pedir. O deploy (`node tools/deploy.mjs`) é o usuário quem roda.
