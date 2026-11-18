# Cores do texto: como o jogo pinta e como o site copia

Análise de 2026-11-18, feita sobre os 86 frames do site com os dados do Huaxu (`api.huaxu.app`, servidor NA), que entrega o texto do próprio jogo com as tags `<color=#...>`.

## Onde o jogo usa cor

| Cor no jogo | Hex | O que marca | Exemplos |
|---|---|---|---|
| Vermelho | `#D91414` | Valores: porcentagens, segundos, contagens, listas "0 / 3 / 7 / 12" | `140%`, `2s`, `0 / 1 / 2 / 3`, `0.5/1/1.5` |
| Vermelho | `#D91414` | Termos de mecânica do kit: formas, modos, recursos, estados, efeitos | `Blasting Mode`, `Time Lag Calculation`, `Ice Spikes`, `Hypermatrix Deduction`, `Ultima Slash`, `Darkflow` |
| Vermelho | `#D91414` | Valor junto da unidade quando é um recurso | `20 Light-Catching Energy`, `200 Glaciation Value` (o número e o nome juntos) |
| Azul | `#0F70BC` / `#0d70bc` | Condição de um golpe (o "como usar") | `Ping Yellow Orb`, `Harmonized State + Tap Red Orb`, `100 Energy + Tap Signature` |
| Azul | `#0F70BC` | Requisito de rank | `Unlocked at SSS Rank` |
| Cinza | `#645F5D` | Texto de nível ainda não alcançado (Lv.9 / Lv.18 das passivas) | frases inteiras |
| Vermelho-tomate | `#FF6347` | Valores das skills de C.U.B. | `2000%` |

**O que o jogo não pinta** (e a regra automática antiga do site pintava ou deixava de pintar):
- Nomes de orbes especiais nem sempre: "Red Gravity Orb", "White Orbs" ficam sem cor no kit de Leia; a regra antiga (`SK_TERM`, "... Orb") pintava.
- Números de intervalo de efeito ("every 0.5s", "once every 0.1s") ficam sem cor; a regra antiga (`SK_VALUE`) pintava todo número com `%` ou `s`.
- **Memórias não têm cor nenhuma.** O site pintava os números dos efeitos de memória.
- Ressonâncias de arma pintam só o nome do status ("Corrosion"), não os números.
- Nomes de skill entre colchetes ("[Infernal Shot]") ficam sem cor.

Contagem na prévia: 10.974 trechos vermelhos, dos quais 5.687 (52%) são só números; o resto são termos ou número + termo. Termos mais frequentes: Time Lag Calculation (75), Ultima Slash (63), Ice Spikes (60), Signature Energy (57).

## Estado (2026-11-18)

Aplicado: 12.003 marcas em 86 frames (`data/skills-data.js`) e 529 nos C.U.B.s (`CUB_SKILLS`). Memórias, efeito de arma e Harmony aparecem sem cor; ressonâncias pintam só o status que o próprio texto define ("Corrosion"). Nas passivas de C.U.B. o jogo usa **azul** nos valores e vermelho nos termos ("the 4th hit of Ribbon Circuit"), e o site segue isso. Dois C.U.B.s (Diamaton, Mirage Blades) ficaram sem marca: o texto aparece repetido em `assets-data.js` e o script não grava em texto ambíguo.

## Como o site guarda e mostra

- `tools/fetch-colors.mjs` lê o Huaxu e grava marcas no texto das skills: `[r]...[/r]` (vermelho) e `[b]...[/b]` (azul). As palavras continuam as da wiki; só entram as marcas.
- O alinhamento é por ordem: cada trecho colorido do Huaxu é procurado no texto do site depois do anterior, aceitando espaços diferentes em volta de "/" ("3 /4 /5" casa com "3/4/5"). Trecho não achado fica sem cor e aparece na prévia.
- Cinza não vira marca (o site mostra o texto de todos os níveis). Frases coloridas com mais de 80 caracteres também não (são passivas por nível inteiras).
- `app.js` (`highlight`, `skillBody`, `describe`): texto com marca usa as marcas; texto sem marca continua com a regra automática. Os números dentro de `[r]` continuam escalando com o nível da skill.

## Para um personagem novo

1. Adicione o personagem normalmente (skill `add-character`).
2. `node tools/fetch-colors.mjs "Nome: Frame" --detalhe` e confira: "trecho(s) não achados" acima de ~5% indica texto da wiki diferente do jogo (vale conferir o texto, a regra do projeto é a wiki).
3. `node tools/fetch-colors.mjs "Nome: Frame" --gravar`.
4. Se o Huaxu ainda não tiver o frame (lançamento recente, CN antes do global), deixe sem marcas: a regra automática cobre até lá.

## Regra automática (quando não há marca)

Para ficar o mais perto do jogo:
- Vermelho em porcentagens e listas de valores ("0 / 3 / 7 / 12", "3 /4 /5s") e em segundos de duração ("for 2s"), mas **não** em "every Xs" / "once every Xs".
- Vermelho em "Form", "Mode", "State", "Stacks", "Points", "Value" precedidos de nome próprio.
- Azul só na condição do título (já é assim).
- Memórias sem cor.

## Problemas nos dados achados pela prévia (corrigidos em 2026-11-18)

- `Lee: Palefire`: "Bipolar Expansion" tem "10%%"; "Infernal Shot" junta duas linhas ("every 0.5s.- Attacking"); "Signature - 360o Shooting" usa "o" no lugar de "°".
- **27 skills de Leader** têm o prefixo dobrado ("Leader - Leader - Riot of Color"), e o site mostra assim no título. O padrão dos outros é "Leader - Nome"; `Karenina: Effulgence` tem só "Eye of the Storm", sem prefixo.
- Skills sem par no Huaxu (nome diferente): Noctis: Indomitus ("Bursting Plunge— Ping Yellow Orb", "Swift Blow"), Teddy: Decryptor ("Sucessor's RGB", provável erro de grafia de "Successor's").
