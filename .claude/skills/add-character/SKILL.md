---
name: add-character
description: Adiciona um personagem novo ao site Dominik de builds de Punishing Gray Raven, ou uma build, time ou arma de um personagem, seguindo as convenções de pastas e de dados do projeto. Use quando o usuário pedir para adicionar, cadastrar ou incluir um personagem, frame, build ou time.
---

# Adicionar personagem ao Dominik

O site fica na raiz do repositório. Os dados dos times estão em `app.js`, antes da linha `const $ =`. Os textos longos das páginas Assets estão em `data/assets-data.js`.

## 1. Reunir o que falta

Antes de editar, confirme com o usuário o que não estiver claro. Nunca invente dados de jogo, textos de build ou efeitos de arma.

- Nome completo, no formato `Nome: Frame` (ex.: `Rosetta: Arete`)
- Classe: `Attacker`, `Tanque`, `Amplifier`, `Breaker` etc. (arquivos em `assets/classes/`)
- Time e página onde entra: energia ou efeito, e os outros dois personagens
- Memórias, Weapon Harmony (`wh`), 3 ressonâncias de arma e a descrição da build
- Para a página Weapons: nome da arma, tipo e efeito

## 2. Conferir as imagens

Pasta `assets/characters/<nome-frame>/`, em minúsculas e com hífens. Ela precisa ter o mesmo nome que `slug` gera a partir do nome do personagem sem os dois-pontos, senão a miniatura da home não é encontrada.

| Arquivo | Uso |
|---|---|
| `Awaken - <Nome Frame>.png` | `portrait` |
| `Arma - <Nome Frame>.<ext>` | `weapon` |
| `Skill - Signature*.<ext>` ou `Skill - Core Passiva*.<ext>` | `core` |
| `CUB - <Nome do CUB>.<ext>` | `construct` |
| `CUB - Skill 1.<ext>` a `CUB - Skill 6.<ext>` | `skills` |

Liste a pasta e use os nomes reais dos arquivos, com as maiúsculas e a extensão exatas. Eles variam entre personagens (`png` ou `webp`, `Signature HD`, `Signature 2X`). Se faltar arte, avise o usuário; não aponte para um arquivo que não existe.

## 3. Editar `app.js`

1. **Constante da pasta**, junto às outras: `const ROSETTA = `${CHARS}/rosetta-arete`;`
2. **Memórias:** se o set ainda não tem constante, crie `const NOME = memSet("Nome");`. O set precisa estar em `MEMORY_TABS` com a extensão da arte.
3. **Kit:** se o personagem vai aparecer em mais de um time, crie `NOME_KIT` com o que não muda entre times. Se aparecer em um só, escreva os campos direto no card.

   ```js
   const ROSETTA_KIT = {
     name: "Rosetta: Arete", symbol: classIcon("Breaker"), portrait: `${ROSETTA}/Awaken - Rosetta Arete.png`,
     weapon: `${ROSETTA}/Arma - Mirage Alberd.webp`, wh: "Cottie", memories: memBuild(NIMUE, COTTIE), matrix: matrix(DD, DLT, GA),
     resonance: ALL_ATK, core: `${ROSETTA}/Skill - Signature.webp`, construct: `${ROSETTA}/CUB - Buzzling.webp`, skills: cubSkills(ROSETTA, "webp")
   };
   ```

   - `memBuild(main, sub)` monta 4 peças de `main` e 2 de `sub`. Se a build foge desse padrão, escreva os 6 slots à mão e explique num comentário.
   - `cubSkills(PASTA, "webp")`: passe a extensão quando não for `png`.
   - Siglas de `matrix`: `GA`, `GS`, `ML`, `SAR`, `DD`, `INC`, `DLT`.
4. **Card:** no time em `COMPS`, cada card tem `bar` (`blue`, `red` ou `gold`, nessa ordem), `role` (`""`, `"captain"`, `"starter"` ou `"captain starter"`), o kit e `desc`. O campo `role` é obrigatório, mesmo vazio.
5. **Time novo:** ele recebe o nome do patch Global do personagem mais novo. Times da mesma página e do mesmo patch entram como `variants` de uma só composição. Use o tema da energia (`FIRE_THEME` etc.) e adicione o id em `PAGES`, com o patch mais novo primeiro.
6. **Weapon Harmony:** se a memória de `wh` não está em `WH_FRAME`, ela mostra a arte inteira. Avise o usuário; o enquadramento `[x%, y%, zoom]` é ajustado no olho.

A esteira da home se monta sozinha a partir dos times. Só edite `HERO_FIRST` se o usuário pedir destaque.

## 4. Editar `data/assets-data.js`

- **Arma nova:** adicione em `WEAPONS`, em ordem alfabética: `["Nome: Frame", "Nome da Arma", "Tipo", "pasta/Arma - X.ext", "Efeito"]`, e em `WEAPON_STATS`: `"Nome da Arma": [ATK, CRIT]`. Sem os stats, a página Weapons quebra.
- **Memória nova:** adicione em `MEMORY_TABS` (`app.js`), em `MEMORY_EFFECTS` e em `MEMORY_STATS` (`data/assets-data.js`, como `[ATK, DEF, CRIT, HP]`). Sem esses dados, as páginas de memória quebram.
- **Skills do personagem:** ficam em `data/skills-data.js`, vindas da seção "Skills & Passives" da página dele na wiki. Sem elas, a página de skills dele avisa que ainda não há texto.
- **Ícones das skills:** cada skill em `data/skills-data.js` precisa de `assets/characters/<nome-frame>/skills/<tipo>.png`, com o tipo exato da entrada (`Red Orb.png`, `SSS+ Rank.png`). Sem eles, `check-assets` dá erro. Os ícones estão em `https://huaxu.app/na/wiki/constructs/<frame>/skills`, no campo `icon` de cada skill.
- **Personagem novo:** adicione em `CONSTRUCTS` (`data/assets-data.js`): `"Nome: Frame": [release, elemento, classe, rank, effect]`. Os valores vêm de `/wiki/constructs`; `release` é o campo `priority` da wiki, e o elemento é o campo `element`, não a maior porcentagem de `elements`, que guarda os híbridos antigos. Sem isso, as páginas Constructs, Weapons e C.U.B.s quebram.
- **Capitão novo:** copie a skill de líder de `data/skills-data.js` para `LEADER_SKILLS` (`data/assets-data.js`).
- **Variantes:** nos times, `group` e `label` são opcionais e organizam o seletor (`app.js`).
- **Memória nova (ordem):** adicione também em `MEMORY_RELEASE`, com o `id` da memória em `/wiki/memories`.
- **CUB novo:** o texto das skills fica em `CUB_SKILLS`, pela pasta do personagem.
- **Linha do tempo:** um S-Rank novo entra sozinho em `data/timeline-data.js` quando estiver na aba S-RANK TIMER e na wiki (`node tools/update-timeline.mjs`). Se a classe e o elemento forem novos, adicione a coluna em `COLUMNS`, nesse script.

A página do personagem (`/character/<id>`) e as listas de CUBs e Skills se montam sozinhas a partir dos times.

## 5. Verificar

1. Na raiz do repositório, gere a miniatura da home: `powershell -File tools/make-thumbs.ps1`. O script só cria as que faltam.
2. Gere as cópias leves que o site carrega: `node tools/optimize-images.mjs`. Os caminhos no `app.js` continuam apontando para `assets/`; as cópias em `assets-web/` são geradas, nunca editadas à mão.
3. Rode `node tools/check-assets.mjs` e corrija todos os erros.
4. Rode `node tools/smoke.mjs home character/<id> <página do time>` e corrija os erros. Abra com `Read` os prints em `.smoke/` e confira o card e a home antes de dizer que terminou. Se não conseguir abrir, diga isso ao usuário.

Não faça commit nem deploy sem o usuário pedir.
