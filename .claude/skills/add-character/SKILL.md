---
name: add-character
description: Adiciona um personagem novo ao site Dominik de builds de Punishing Gray Raven, ou uma arma, memória ou C.U.B., seguindo as convenções de pastas e de dados do projeto. Use quando o usuário pedir para adicionar, cadastrar ou incluir um personagem, frame, arma ou C.U.B. Times e builds não entram por aqui: vêm do Team Builder.
---

# Adicionar personagem ao Dominik

O site fica na raiz do repositório. Os textos longos das páginas Assets estão em `data/assets-data.js`; o resto dos dados fica em `app.js`, antes da linha `const $ =`.

**Times e builds não são escritos no código.** O site não tem builds próprias: todo time é publicado por uma conta, no Team Builder (`/editor`). Se o usuário pedir para adicionar um time, explique isso e ofereça montar o time no Team Builder (ele publica com a conta dele). O que esta skill faz é deixar o personagem disponível: com retrato, arma, C.U.B. e skills na pasta, ele entra no catálogo do Team Builder (`node tools/make-catalog.mjs`).

## 1. Reunir o que falta

Antes de editar, confirme com o usuário o que não estiver claro. Nunca invente dados de jogo, textos de build ou efeitos de arma.

- Nome completo, no formato `Nome: Frame` (ex.: `Rosetta: Arete`)
- Classe: `Attacker`, `Tanque`, `Amplifier`, `Breaker` etc. (arquivos em `assets/classes/`)
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

## 3. Esteira da home e Weapon Harmony (`app.js`)

- **Esteira da home:** é a lista fixa `HOME_BELT`. Só adicione o personagem se o usuário pedir, e só com a miniatura `assets/home/<nome-frame>.jpg` (passo 5.1). `HERO_FIRST` são os primeiros da esteira.
- **Weapon Harmony:** uma memória que não está em `WH_FRAME` mostra a arte inteira no card. Avise o usuário; o enquadramento `[x%, y%, zoom]` é ajustado no olho.

## 4. Editar `data/assets-data.js`

- **Arma nova:** adicione em `WEAPONS`, em ordem alfabética: `["Nome: Frame", "Nome da Arma", "Tipo", "pasta/Arma - X.ext", "Efeito"]`, e em `WEAPON_STATS`: `"Nome da Arma": [ATK, CRIT]`. Sem os stats, a página Weapons quebra.
- **Arma 5★ independente:** adicione em `FIVE_STAR_WEAPONS` como `["", "Nome", "", "assets/weapons/5stars/arquivo.png", "Efeito", 5]`, mais os stats em `WEAPON_STATS`. Esses itens aparecem em All, sem filtro por elemento ou opção no Team Builder.
- **Memória nova:** adicione em `MEMORY_TABS` (`app.js`), em `MEMORY_EFFECTS` e em `MEMORY_STATS` (`data/assets-data.js`, como `[ATK, DEF, CRIT, HP]`). Sem esses dados, as páginas de memória quebram.
- **Skills do personagem:** ficam em `data/skills-data.js`, vindas da seção "Skills & Passives" da página dele na wiki. Sem elas, a página de skills dele avisa que ainda não há texto.
  - **Cores do jogo:** depois de gravar o texto, rode `node tools/fetch-colors.mjs "Nome: Frame" --detalhe` (prévia) e, se os trechos "não achados" forem poucos (~5%), `node tools/fetch-colors.mjs "Nome: Frame" --gravar`. CUB novo: `node tools/fetch-colors.mjs --cubs --gravar`. Regras e detalhes em `docs/cores-texto.md`. Sem isso, o texto usa a coloração automática.
  - Nome da Leader: sempre `Leader - Nome`, com um prefixo só (a wiki às vezes já traz "Leader - ").
- **Ícones das skills:** cada skill em `data/skills-data.js` precisa de `assets/characters/<nome-frame>/skills/<tipo>.png`, com o tipo exato da entrada (`Red Orb.png`, `SSS+ Rank.png`). Sem eles, `check-assets` dá erro. Os ícones estão em `https://huaxu.app/na/wiki/constructs/<frame>/skills`, no campo `icon` de cada skill.
  - Exceções: `Leap Skill` e `Uniframe Skill` têm várias por personagem, então o arquivo leva o nome da skill (`skills/Meteor Reverberation.png`). As três Enhanced dos Uniframe (`Enhanced Speed Attack`, `Enhanced Team`, `Enhanced Finishing Move`) usam os ícones comuns de `assets/icons/uniframe/`.
  - O código do ícone no huaxu (`iconskill/<código>.webp`) é o mesmo nome dos arquivos do jogo: use-o para saber qual ícone é de qual skill.
- **Harmony:** não fica nas skills do personagem, e sim na página da arma. Texto em `WEAPON_HARMONY` (`data/assets-data.js`), pelo nome da arma, com o ícone em `assets/characters/<nome-frame>/Harmony Skill.png`.
- **Personagem novo:** adicione em `CONSTRUCTS` (`data/assets-data.js`): `"Nome: Frame": [release, elemento, classe, rank, effect]`. Os valores vêm de `/wiki/constructs`; `release` é o campo `priority` da wiki, e o elemento é o campo `element`, não a maior porcentagem de `elements`, que guarda os híbridos antigos. Sem isso, as páginas Constructs, Weapons e C.U.B.s quebram.
- **Capitão novo:** copie a skill de líder de `data/skills-data.js` para `LEADER_SKILLS` (`data/assets-data.js`).
- **Memória nova (ordem):** adicione também em `MEMORY_RELEASE`, com o `id` da memória em `/wiki/memories`.
- **CUB novo:** entra em `EXTRA_CUBS` (`data/assets-data.js`) como `[nome, dono, rank, elemento, pasta, skills, tipo]`, e o texto das skills fica em `CUB_SKILLS`, pela pasta. `skills` é `true` (ícones 1 a 6), uma lista com outra ordem ou `false`; `tipo` é a extensão da arte quando não for `png`. Sem a entrada, o C.U.B. não aparece na página C.U.B.s nem no Team Builder.
- **Linha do tempo:** um S-Rank novo entra sozinho em `data/timeline-data.js` quando estiver na aba S-RANK TIMER e na wiki (`node tools/update-timeline.mjs`). Se a classe e o elemento forem novos, adicione a coluna em `COLUMNS`, nesse script.

A página de cada personagem (`/constructs/<frame>`, usando só o nome do frame no endereço) se monta a partir de `CONSTRUCTS`, com o retrato `assets/characters/<nome-sem-":">/Awaken - <nome-sem-":">.webp` (exatamente esse nome). Os times dele aparecem ali quando alguém publicar um.

## 5. Verificar

1. Na raiz do repositório, gere a miniatura da home: `powershell -File tools/make-thumbs.ps1`. O script só cria as que faltam.
2. Gere as cópias leves que o site carrega: `node tools/optimize-images.mjs`. Os caminhos no `app.js` continuam apontando para `assets/`; as cópias em `assets-web/` são geradas, nunca editadas à mão.
3. Rode `node tools/check-assets.mjs` e corrija todos os erros.
4. Rode `node tools/make-catalog.mjs` e confira que o personagem aparece na contagem e sem imagem faltando.
5. Rode `node tools/smoke.mjs home constructs/<frame> editor` e corrija os erros. Abra com `Read` os prints em `.smoke/` e confira antes de dizer que terminou. Se não conseguir abrir, diga isso ao usuário.

Não faça commit nem deploy sem o usuário pedir.
