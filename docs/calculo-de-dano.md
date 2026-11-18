# Plano: cálculo de dano (Team Builder + páginas de builds + páginas de construct)

> `docs/` não entra no deploy, pois `SITE_FILES` em `tools/deploy.mjs` é uma lista explícita.

## Context

O site mostra builds (frame, arma, memórias, ressonâncias, CUB, rotação) só como texto e imagem. Não há número de dano. O usuário quer um cálculo que considere efeitos, memórias, armas, mecânicas das skills e o ambiente (alvo), exibido:
1. no Team Builder (`/editor`);
2. nos cards de cada build das páginas de times (`COMPS`/`PAGES` em `app.js`);
3. na página de cada construct (`characterPage`, `app.js` ~3061).

Decisões do usuário: **faseado, começando por 1 personagem**; **fórmulas pesquisadas na wiki/reddit/web** (a Kuro não publica); **painel por card + total do time**.

Regra do projeto: nunca inventar dados do jogo. Tudo que não tiver fonte fica marcado como "sem dados" e **não entra no número**.

## O que existe hoje (e o que falta)

| Existe | Onde |
|---|---|
| Stats base de memória `[a,b,c,d]` e arma `[ATK, CRIT]` | `MEMORY_STATS`, `WEAPON_STATS` em `data/assets-data.js` (574, 532) |
| Efeitos de memória 2/4 peças, ressonâncias de arma/memória, skills de CUB, leader skills | `MEMORY_EFFECTS`, `RESONANCE_EFFECTS`, `MEMORY_RESONANCE_EFFECTS`, `CUB_SKILLS`, `LEADER_SKILLS` — **todos em texto livre** |
| Skills dos frames | `data/skills-data.js` (629 KB), prosa com "200% / 400% / 600%" |
| Forma do time | card: `{char, rank, weapon, mem[6], memRes, wh, matrix[3], cub, cubSkills, rotation (texto)}` (`edClean`, `editor.js:143`; `cleanTeam` em `server/team.js` deve ficar igual) |
| Rotação | texto livre por turno, interpretado só para ícones (`edRotParse`, `rotationIcon`) |

**Falta:** (a) dados numéricos estruturados; (b) motor de cálculo; (c) modelo de alvo/ambiente; (d) rotação como lista de ações calculável. Parsear a prosa automaticamente é frágil (texto varia: "Pings 0/1/2/3…", "por hit", "com Ultima Slash…"). **Decisão: dados estruturados escritos à mão, por personagem, com fonte.**

## Fórmulas pesquisadas (fonte: GRAY RAVENS wiki, "Damage Details")

Fontes: https://grayravens.com/wiki/Damage_Details/Physical_DMG_Factors e `/Others` (páginas de jan e out/2024: **conferir se continuam válidas em 2026**; a de Elemental foi lida na íntegra em 2026-11-17, última edição 2024-01-14, ver a seção "Fórmula elemental"). Reddit não pôde ser lido pelo Firecrawl; revisitar por outro meio. Vídeos do Doomy citados na wiki (fórmula elemental e debuffs) devem ser vistos.

Fatores **multiplicativos entre si**; buffs do **mesmo fator somam** entre si (rendimentos decrescentes); buffs de mesma origem não acumulam (só renovam duração).

- **Físico:** ATK base × escala da skill × (1+ATK%) [com Final ATK somado ao stat] × (1+Phys DMG%) × (1+Base DMG↑) × (1+Extra DMG Bonus) × (1+CRIT DMG↑ se crítico) × (1−DEF efetiva) × (1−Phys Res) × (1−Extra DMG Reduction).
- **Elemental:** mesmos fatores, trocando DEF por resistência elemental (sem DEF); lista da wiki: ATK base, escala, ATK↑, Final ATK, Elemental DMG↑, Extra DMG Bonus, Basic DMG↑, Resistência, Extra DMG Reduction. **Sem CRIT e sem variação** (wiki Gray Ravens e wiki Bilibili concordam).
- **Final ATK:** valor fixo somado ao ATK (CUB "+60 ATK"; resistências de arma como Incandescence 15% e Glorious Afterglow 30% usam **ATK artificial de 500**, "pode estar desatualizado"). Não é afetado por ATK%.
- **CRIT:** 100 de CRIT Stat = +3% de CRIT Rate. Crítico = exatamente 2× antes de "CRIT DMG↑" (wiki 2024; reconfirmar). ~~Variação 95%–105%~~: **removida pelo jogo em 2026-08-17** (ver seção de patch notes); usar dano fixo.
- **DEF (só físico):** `Protection = DEF/(1−DEF)`; redução de DEF multiplica a Protection; `DEF novo = P/(1+P)`. Valores medidos: Trial Zone Nightmare ≈ 71,3%; Pain Cage Ultimate ≈ 60%.
- **Resistência / Extra DMG Reduction do alvo:** soma dentro do fator, por isso debuffs valem mais que buffs. Barra de armadura: +20% Phys Res. Valores variam por inimigo/dificuldade e só existem por **teste empírico**.

### Regras oficiais do jogo (prints do usuário, tela "DMG Boost Description") — têm prioridade sobre a wiki de 2024

- **Tipos de dano:** *Energy* (Physical, Fire, Ice, Lightning, Dark, Nihil), *Derivative Effect* (Ultima Slash↔Physical, Ignition↔Fire, Glaciation↔Ice, Plasma Beam↔Lightning, Darkflow↔Dark; Nihil: N/A) e *Special Derivative Effect* (**Raydiance**, de Lightning; **Disruption**, de Nihil). A tela mostra Plasma Beam/Darkflow como "Current" para o frame Lightning que está aberto: o efeito pertence à energia correspondente.
- **Matriz de fatores (oficial):**

| Dano | Energy Resistance | Energy DMG Boost | Energy Weakness | Effect Resistance | Effect DMG Boost | Effect Weakness |
|---|---|---|---|---|---|---|
| Energy DMG | sim | sim | sim | não | não | não |
| Derivative Effect DMG | sim | sim | **não** | sim | sim | sim |

- **Raydiance** é especial: sofre Resistance, DMG Boost e Weakness de **Lightning, Plasma Beam e Raydiance**, os três.
- **"Weakness" é um fator próprio**, separado de Resistência (a wiki de 2024 não o tinha). Ex. citado na wiki: "Physical Weakness: Physical Resistance −40%". Definição: a wiki Elemental mostra "Lightning Weakness: Lightning Resistance −40%", ou seja, **subtrai dentro do fator de resistência** (ver "Fórmula elemental"). Falta só confirmar no jogo atual, já que a coluna "Weakness" da tela oficial pode ter regra própria.
- **Classes** (aba "Class Details"): Attacker, Tank, Support, Vanguard, Amplifier, Annihilator (converte dano aliado para todos os elementos), Observer, Breaker, Overlinker. Cada classe tem passiva própria; entram como `CLASS_BUFFS` (já previsto). Annihilator e Observer exigem tratamento especial (conversão de elemento / adaptação).
- Impacto no motor: cada golpe leva `{ kind: "energy" | "effect" | "raydiance", element, effect? }` e a função escolhe quais fatores aplicar com base na matriz acima (tabela `FACTOR_MATRIX` em `damage-formulas.js`). Buffs também têm o escopo (`energy`, `effect:<nome>`), como "+40% Ignition DMG" do Warzone (aba da planilha).

### Fórmula elemental (wiki Gray Ravens, "Elemental DMG Factors", lida em 2026-11-17)

A imagem da fórmula na página (a que o usuário colou) é:

```
SkillScaling × (BaseATK × (1 + ATK↑) + FinalATK)
  × (1 + Elemental/Dark/Fire/Ice/Lightning DMG↑)
  × (1 + Base DMG↑) × (1 + Extra DMG Bonus)
  × (1 − Elemental/Dark/Fire/Ice/Lightning Resistance)
  × (1 − Extra DMG Reduction)
```

O que a página fixa e o plano deve seguir no motor (`hitDamage` para `kind: "energy"` com elemento ≠ Physical):

- **Sem CRIT, sem variação, sem DEF, sem barra de armadura.** Um golpe elemental tem um único valor. O CRIT dos stats de arma/memória (`WEAPON_STATS[1]`, `MEMORY_STATS`) **não entra** no dano de um frame elemental. O motor ignora `crit` e `critDmg` nesse ramo; só o ramo físico os usa.
- **Final ATK fora do (1 + ATK↑):** `BaseATK × (1 + ATK↑) + FinalATK`. É um valor fixo, nunca convertido em fração. Fontes: CUB ("+60 ATK", Noctua), Incandescence e Glorious Afterglow (calculadas sobre **ATK artificial de 500**: 15% → +75; a wiki avisa que pode estar desatualizado), "ATK da equipe +50" do Norman Revival Plan.
- **Fator "Elemental DMG↑" é único para o elemento do golpe.** Entram nele, somados: bônus do elemento específico (Fire, Ice, Lightning, Dark), bônus "Elemental" genérico (Einsteina 2p de curta duração, Samantha 2p "+8% Elemental DMG") e os de 2 peças como "+7% Dark DMG" (Bathlon). Um bônus de Fire **não** vale para um golpe de Ice. Pendência: Annihilator (converte dano aliado para todos os elementos).
- **Base DMG↑ é fator próprio e amarrado a uma skill** ("Dragon Force Combo's Base DMG +50%", "Basic DMG de Lightning Fall +100%", "um Reprise causa 100% a mais"). Isso resolve a incerteza 5: **não** entra na escala; vira `factor: "baseDmg"` com `appliesTo: <skill>` no buff. A redação do jogo é vaga (o 4p de Seraphine só se identifica comparando com a wiki CN), então cada entrada precisa de fonte.
- **Extra DMG Bonus é o balde do resto** ("Extra DMG Bonus +50%" do Laser Shot, "+20% DMG" por 10s do Vanguard ao entrar).
- **Resistência elemental do alvo:** não existe valor no jogo; só se obtém por teste (protocolo da fase 6). Varia por inimigo e dificuldade. Reduções entram **subtraindo dentro do mesmo fator**: Einsteina 2p (−15% da resistência do elemento por 8s, QTE e 3-Ping), Pianissimo etc. **Weakness é isso**: "Lightning Weakness: Lightning Resistance −40%". Resolve a pendência 0 para o dano de energia: Weakness não é fator separado, é um debuff que reduz a resistência (a matriz oficial só mostra que o efeito derivado **não** sofre Weakness).
- **Extra DMG Reduction do alvo:** só cai por poucas fontes (Tank: −20% por 5s; Frederick 4p; Fused Armor −50%). **Cuidado ao ler texto:** várias descrições de "DMG Reduction" são do **próprio personagem** (Liv: Empyrea, 70% ao esquiva) e não do alvo; o `damage-data.js` precisa de `target: "self" | "enemy"` e só o `enemy` entra.
- **Mesma origem não acumula** (só renova a duração); **mesmo fator soma, fatores diferentes multiplicam**. Regra já no plano, confirmada aqui com Guinevere 2p e Einsteina 2p como exemplos.

**Limites desta fonte:** a página é de jan/2024, anterior aos efeitos derivados (Ignition, Plasma Beam etc.) e à tela "Stat Description". Ela cobre só o dano de **energia**. O dano de **efeito** usa Effect Resistance / Effect DMG Boost (matriz oficial) e a conta continua sem fonte pública. Um frame elemental, então, tem dois tipos de golpe no motor: o de energia (fórmula acima, fechada) e o de efeito (aberto).

**Incertezas a resolver antes de codar (lista aberta):**
0. Definição exata de Weakness (acima) e se o resto da fórmula da wiki (DEF, Final ATK, crítico) bate com o jogo atual. Pedir ao usuário as telas "Character Effect" (quarta aba do mesmo menu) e qualquer outra tela de regras.
1. Se a fórmula de 2024 ainda vale (novos tipos de dano, Extra DMG, "Amplifier", "Vulnerability").
2. Interação de efeitos novos (Ignition, Plasma Beam, Glaciation, Ultima Slash, Darkflow): cada um é dano próprio ou modificador? Ver wiki por efeito.
3. Valores de DEF/resistência dos inimigos atuais (Pain Cage, War Zone, Stronghold etc.).
4. Níveis: base ATK por nível/rank do frame (SS, SSS, SSS+), nível da skill (o site usa nível 18).
5. ~~Como o "Base DMG de skill X aumenta em Y%" entra~~: **resolvida**, é fator próprio `(1 + Base DMG↑)` amarrado à skill (wiki Elemental).
6. Annihilator (converte dano aliado para todos os elementos): como entra no fator "Elemental DMG↑" e na resistência.
7. O personagem piloto é elemental ou físico? A linha sobre `FRAME_INFO` cita "Selena Physical + Glaciation", e o exemplo do `DAMAGE_KITS` usa golpes Ice. Se o piloto for físico, o ramo elemental (acima) não é testado na fase 2; confira o kit antes de fixar o piloto.

## Planilha "PGR INFO" (link do usuário) — o que ela traz para o cálculo

Abas: List, Main, Special Challenge, Babylonia, **Warzone area and effects**. A leitura só devolve texto; **os hiperlinks das células não vieram** (Gray Ravens, Bilibili Wiki, "CN PGR Character & Equipment Translations", "Ultimate Phantom Pain Cage (SS)", "Meta Teams"). Peço ao usuário os URLs desses cinco.

- **Aba "Warzone area and effects" = dados de ambiente, ouro para o modelo.** Lista por zona (1/2 e Entropic) o buff "Full-Realm Support" com texto e "Total DMG%" máximo. Exemplos: Alisa Echo "+60% Glaciation DMG", Wanshi "+30% Ice, +10% por ping, 3 stacks = 60%", Selena Pianissimo "+80% CRIT DMG 12s", Entropic Molten Chasm "+30% Fire e +40% Ignition DMG", Shattered Peak "+40% Ultima Slash DMG", Vortex Barrier "+30% Lightning e +40% Plasma Beam DMG". Isso vira `ENV_BUFFS` (por modo/zona), com `factor`, `value`, `duration`, `stacks` e condição. Mostra também que **efeitos (Ignition, Plasma Beam, Ultima Slash, Glaciation, Darkflow) têm fator próprio de DMG%**, separado do elemental — o motor precisa de um fator "efeito" por tipo de dano.
- **Aba "List":** índice de fontes. Úteis para a análise: "Ultimate Phantom Pain Cage (SS)" (runs e builds por boss → dá alvos e números de referência para calibrar), "PGR Meta Teams", "CN Character & Equipment Translations" (dados de CN em beta, inclusive kits novos) e Huaxu (dados do jogo). A wiki Gray Ravens já é a fonte base do site.
- **Abas Main / Special Challenge / Babylonia:** renda de Black Cards por capítulo (parte da planilha de calculadora que o site já usa); **não servem** para dano.
- Efeito no plano: fase 0 ganha "ler as quatro fontes de List"; os presets de alvo vêm do Pain Cage (SS) e o ambiente do Warzone, não de valores inventados.

## Patch notes (canal pgr-update-notes, 155 mensagens, 2023-12 → 2026-11) — o que muda o plano

Arquivo exportado pelo usuário: HTML do DiscordChatExporter (o nome começa com "B★RS - … pgr-update-notes [1183606993404039220].html"). **Pedir ao usuário que salve em uma pasta fora do projeto**, para um script de extração em `tools/` ler; assim os dados de frame/efeito/memória não precisam ser digitados à mão.

**Correções à fórmula da wiki (2024):**
- **2026-08-17 (Steering By Light):** *"Removed damage variance from the Physical DMG calculation. Physical DMG will no longer vary, including both CRIT and non-CRIT DMG."* → **a variação de 95%–105% da wiki não existe mais**; o dano físico é determinístico. Não implementar variância. A regra "crítico = exatamente 2×" também precisa de confirmação (a frase diz que o crítico passou a ser fixo, não diz o valor).
- **2025-02-18:** removida a penalidade de dano de Omniframe + Uniframe no mesmo time (não modelar). A resistência "Domain Deconstruction" (arma de Tank) passou a reduzir **todas** as resistências, não uma só (Corrosion = −8% All Res, ver `RESONANCE_EFFECTS`).
- **2025-03-31 / 2025-11:** os efeitos derivados (Ignition, Plasma Beam, Glaciation, Ultima Slash, Darkflow, Raydiance, Disruption) ganharam interface própria: "Effect DMG" tem cor própria, e a pausa em batalha tem "Status Overview" com buffs/debuffs ativos (fonte para validar números no jogo). **2026-03-13:** o jogo ganhou a tela "Stat Description" (a origem dos prints do usuário).
- **2026-07-15:** *"Trial of Simulacrums: damage is rebalanced"* e o modo Shrouded Requiem tem números próprios → **modos especiais com multiplicadores próprios ficam fora do escopo** (marcar como "não calculado").

**Mecânicas novas que o motor precisa prever (todas com data de entrada):**
- **Classes:** Breaker (2026-01-30: reduz resistência, ícone próprio ao lado da barra de HP) e Overlinker (2026-09-22: buffs extras a quem entra em campo e estado especial ao acionar Matrix). Somam-se às já existentes (Attacker, Tank, Support, Vanguard, Amplifier, Annihilator, Observer).
- **Harmony II / Harmony Awakening System (a partir de 2026-07-15):** armas selecionadas ganham passiva extra e bônus de nível de skill (Orpheus' Lullaby, Ripples of the Aloft Sea, Empyrean Wrath…). Entra como `weaponHarmony2: boolean` na arma; a lista de armas já cobertas vem das notas. Só aplicar quando houver dado numérico.
- **Efeito do frame:** cada frame novo traz "Info: S-Rank <Elemento> <Classe>, <Efeito>" (ex.: Lucia Pyroath = Fire Attacker, Plasma Beam; Karenina Effulgence = Physical Breaker, Darkflow; Teddy Spectre = Ice Amplifier, Raydiance). O export cobre ~45 frames: **gerar `FRAME_INFO` por script** (nome → elemento, classe, efeito, patch). Atenção: o efeito nem sempre é o "natural" do elemento (Selena Physical + Glaciation; Vera Fire + Darkflow; Helentine Lightning + Glaciation).
- **Seleção de efeito em batalha (2025-02-18):** com mais de um efeito no time, o jogador escolhe qual ativa → o motor precisa de `activeEffect` no time. A tela de Team Preset (2025-11-11) já guarda "Effect, Weapon, Weapon Resonance Skill, Weapon Harmony, Memory, CUB skills": é o mesmo conjunto do `edClean`, então o time do site mapeia 1 para 1.

**Memórias: efeitos tipados de patch recente (candidatos diretos a `MEMORY_SET_BUFFS`, com valores já em texto):**
- Conjuntos de 4 peças de elemento (Patton, Shakespeare, Heisen, Bathlon, Chen Jiyuan; 2024-12-02): Extra DMG Bonus +10%; ao atacar aplica debuff do elemento (Burn/Electrocute/Frost/Corruption/Impale) que reduz a resistência do elemento em **15% por 8s** (CD 10s por alvo); atacar alvo com o debuff dispara explosão de **600% de dano** (CD 6s por alvo). Patton 2 peças: ATK +3% e Physical DMG +7%.
- Condelina 4p: ataque básico 50% de chance de Extra DMG de básico +20% por 5s (CD 8s). Da Vinci 4p/6p (reformulado 2026-01-30). Catherine 4p: escudo 1000 e Physical DMG +15% por 5s (CD 8s). Einsteina 4p: +20% Elemental Res por 5s e +15% Elemental DMG enquanto a aura existe (CD 8s). Frederick 4p (2026-01-30): Matrix reduz a velocidade dos inimigos em 20% e o Extra DMG Reduction em 15% por 4s (CD 8s). Burana 2p: ATK +5%, Physical e Glaciation DMG +5%. Cottie 2p: Signature exige 20% menos energia. Liston 2p: QTE ativa "Frozen Zone" por 8s.
- **Aviso do próprio jogo:** a descrição de Veronica, da memória, CUB e arma dela estava "não final" em 2025-09-17. Dados de frames recém-lançados são provisórios: marcar `provisional: true` e revisar no patch seguinte.
- Fonte dos valores atuais continua sendo `MEMORY_EFFECTS` (texto); as notas servem de **verificação de data** (qual versão do texto vale hoje).

**Ambiente (reforça a planilha):** 2026-11-03: *"Harrowing Freeze"* (Warzone, Alisa Echo) mudou para **+60% Glaciation DMG por 12s ao entrar em campo** (antes: 60% por 8s após 3-Ping) → a aba "Warzone area and effects" da planilha pode estar desatualizada nesse item; cruzar com as notas (Purgatorial Fire, Hyper Charge, Rending Edge, Ruinous Trample, Nightbound Engraving, Shadows of Dusk, Twilight Chasm, Thunderstrike etc. também aparecem). Gelid Tower (2025-06-25): Glaciation DMG "muito" aumentado, Ice "levemente" — sem número.

**Limite honesto:** as notas oficiais quase nunca trazem multiplicador de skill nem valor de DEF/resistência do alvo. Elas confirmam *quando* algo mudou, não o *quanto*. Os números continuam vindo da wiki, da planilha e de teste in-game.

## Wiki da Bilibili (links do usuário) — a fonte mais completa para o núcleo da fórmula

Páginas lidas: "【伤害公式与原理】深入了解伤害机制" (autoria 也许刚才小树酱, 2020-12 / atualizada 2021-09; a wiki japonesa `punigray.wikiru.jp` tem a mesma página, com cópia autorizada) e "伤害计算器" (planilha-calculadora, 2021). **São de 2021**: servem para o núcleo (que não mudou) e precisam de reverificação onde a data pesa. Um comentário de 2026-07-14 na calculadora pergunta "como se calcula o dano de efeito?" e ninguém respondeu: **a fórmula de dano dos efeitos (Ignition etc.) não é pública em lugar nenhum que achei**, só a matriz oficial dos prints.

**Fórmula (confirma e completa as outras fontes):** `Dano final = ATK total × multiplicador total de skill × coeficiente total de bônus`.
- **Elemental não crita e não varia; físico varia ±5% e crita (dobra).** Casa com a wiki Gray Ravens (a lista de fatores elementais não tem CRIT). A variação ±5% saiu em 2026-08-17. **Falta confirmar** se o crítico físico ainda dobra.
- **ATK e Extra DMG Bonus valem para todo dano; CRIT DMG só para físico.**
- **Bônus do mesmo tipo somam; de tipos diferentes multiplicam; mesmo nome não acumula (só estende a duração do trecho que não se sobrepõe).** Exemplo oficial da wiki: `(1+15% ATK)(1+20% elemental)(1+20% extra)(1−24% res elem)(1−4% extra red) = 1,2082`.
- **Redução de resistência:** coeficiente `(1 + bônus − resistência do monstro)`; o que importa é o "estoque" somado (diluição) e a regra "redução de resistência > aumento de dano".
- **DEF:** `DEF_res = DEF/(1+DEF)` e `DEF = DEF_res/(1−DEF_res)`; reduções de DEF multiplicam a DEF (não a DEF_res). Mesmo método do plano (Protection).

**Composição do ATK total** (vira `statBlock()`; faixa SSS+ com tudo no máximo: 1800–2100; **padrão de referência: 1800**): base (45–96 conforme o rank inicial) + crescimento (SSS+: 430–540; ataque > suporte > blindado) + evolução (5 pontos = +10 ATK; inicial S até 60, A até 80, B até 100) + promoção (~56,4% do crescimento SSS+, 243–305) + arma 6★ (406–506) + memórias das posições 4-5-6 (conjunto 3×: 387–408; com overclock +35%: 522–550) + ressonância de memória (+15 ATK por ressonância de ATK, 12 no máximo = 180). Os números da página são de 2021 e de frames daquela época: **usar `WEAPON_STATS`/`MEMORY_STATS` do site (que já têm os valores atuais) e deixar a página só como verificação de ordem de grandeza**.

**Escala por nível de skill:** o nível 1 vale metade do nível 18 e a progressão é linear: `mult(X) = mult(18) × (X+16)/34`; com ressonância, até nível 25 (18 + 6 de memória + 1 de Border Pact). Algumas skills não escalam. **Isto vira o `scale` do `damage-data.js`: guardar só o valor do nível 18 e derivar os outros**, como o site já usa o nível 18 em todos os textos.

**Como ler o texto das skills (regra oficial da wiki, vira o "parser humano" de `damage-data.js`):** "causa/adiciona XX% de dano" = multiplicador de skill ("por hit/por segundo" acumulam); "dano de XX aumenta" = bônus de dano; "reduz a resistência de XX" = redução de resistência; aumento de resistência é do próprio personagem e não entra.

**Resistências de monstro medidas (2021; presets só como ponto de partida, marcar `patch: 2021`):**
- Alvo de treino nível 80: DEF ≈ 9,04%, Extra DMG Reduction ≈ 3,99%; resistência elemental do alvo de fogo 24% e Extra Reduction 4% (exemplo da fórmula).
- Boss Nightmare da Trial Zone: DEF ≈ 71,30%, Extra Reduction ≈ 68%.
- Boss Hell da Zona Avançada do Pain Cage: DEF 60%, Extra Reduction 46%.
- Boss Hell da Zona Final: DEF 60%, **Phys Res 27%** (acrescentada sem aviso, como a wiki conta), Extra Reduction 46%. Barra amarela (armadura): +20% Phys Res.
- ~~Tabela truncada~~: **resolvida** com a página salva pelo usuário (tabela limpa na seção "Calculadora da Bilibili").

**Protocolo de calibração in-game (fase 6; fórmulas da wiki, todas com "dois golpes" e razão):** resistência elemental `= 1 − 0,15 × ①/(② − ①)` (com 2 peças Einsteina: −15%); Extra DMG Reduction `= 1 − 0,20 × ①/(② − ①)` (com Tank no time); DEF `= 5 × (② − ①)/(5 × ① − 4 × ②)` e `DEF_res = DEF/(DEF+1)` (com 2 peças Catherine). Isso dá ao usuário uma forma de medir qualquer alvo novo, que é o que falta nos dados oficiais.

**Outras fontes do usuário:** `space.bilibili.com/382651856` (conta oficial): só anúncios de evento (novembro de 2026 em diante; repete o que as notas do Discord já trazem), **nenhuma mecânica nova**. `x.com/PGR_GLOBAL`: o X exige login e não é lido pelas ferramentas daqui; vale colar qualquer post que mencione mudança de dano. `wiki.biligame.com/.../新抽卡模拟器`: simulador de gacha, **fora do escopo**.

## Calculadora da Bilibili (página salva pelo usuário) e crescimento de stats por rank

**Código exato da calculadora (2021)** — confirma a fórmula e mostra duas esquisitices a **não copiar**:
```js
sum = ATK * mult * (1 + ATK%) * (1 + extraDMG) * (1 - extraRed);
// físico: sum*(1+phys)*(1+critDMGbonus)*(1-DEFres)*(1-physRes) ; crítico = 2× ; variação ±5% (removida em 2026-08-17)
// elemental: sum*(1+elemDMG)*(1-elemRes)   // sem crítico, sem variação, sem DEF
// redução de DEF: P = d/(1-d)*(1-redução); novo = P/(1+P)
```
- Esquisitice 1: a calculadora aplica o bônus de CRIT DMG também ao golpe sem crítico (provável bug de planilha). No motor, `critDmg` só entra quando `crit === true`.
- Esquisitice 2: calcula uma "resistência física combinada" `b3(1-b4)/(1-b3·b4)` mas **não usa** no resultado. Ignorar.

**Presets de alvo (tabela limpa, 2021; resolve a pergunta da tabela embaralhada).** Valores: DEF / Phys Res / Elemental Res / Extra DMG Reduction.

| Alvo | DEF | Phys Res | Elem Res | Extra Red |
|---|---|---|---|---|
| Boneco nível 80 | 9,04% | 0% | 24,00% | 3,99% |
| Trial Zone, boss Nightmare | 71,30% | 0% | 88,80% | 68,00% |
| Pain Cage Avançada, boss Hell | 60% | 0% | 65,00% | 46% |
| Pain Cage Final, boss Hell | 60% | 27% | 65,90% | 46% |

Entram em `ENEMY_PRESETS` com `patch: 2021` e aviso "medido pela comunidade em 2021"; o usuário pode editar. A nota de "Trial of Simulacrums rebalanceado" (2026-07-15) indica que valores de modos especiais podem estar defasados.

**Crescimento de stat base por rank (prints "Stats Growth" do usuário).** Cresce linear por rank, por nível, mais bônus de fase:

| Rank | HP/nível | ATK/nível | DEF/nível | CRIT/nível | Bônus de fase (HP/ATK/DEF/CRIT) |
|---|---|---|---|---|---|
| S | 19,78 | 3,96 | 3,11 | 1,69 | +200 / +20 / +10 / +10 |
| SS | 23,77 | 4,76 | 3,74 | 2,03 | +200 / +20 / +10 / +10 |
| SSS | 27,76 | 5,55 | 4,37 | 2,38 | 0 |
| SSS+ | 31,74 | 6,35 | 4,99 | 2,72 | "/" |

- Cada degrau soma ≈ +20% do valor do S (SSS+ ≈ 1,6× S). ATK SSS+ ≈ 6,35 × 79 ≈ 502, dentro da faixa 430–540 da wiki. O usuário avisa que **a evolução varia por personagem**, então não dá para derivar tudo de uma regra única.
- Consequência: `statBlock()` precisa de `growth` **por frame** (`{S:[hp,atk,def,crit], ...}`), não de uma tabela global. Quem é o personagem dos prints ainda não foi dito.
- A página do Gray Ravens do frame (testada com Selena: Pianissimo, 2026-11-06) **não traz** stats base nem crescimento. Fontes a verificar: tela do jogo (usuário), Huaxu, planilha "CN Translations", wiki Bilibili por frame.
- Como o bônus de fase acumula (somado a cada fase ou só o da fase atual) e o ATK total conferido no jogo ainda precisam de confirmação.
- **Decisão para o piloto:** para o personagem piloto, o usuário digita do jogo (tela de stats, rank e nível conhecidos) o ATK base e o ATK total; o motor usa isso como `baseAtk` do kit e a conta de crescimento só entra quando houver dados de vários frames. ATK final do card = `baseAtk` + arma + memórias + ressonâncias, como na seção de composição acima.

## Fontes CN 2020–2026 (pesquisa de 2026-11-18)

Resumo do que mudou no plano. As mecânicas gerais (orbes, Matrix, classes) foram para [mecanicas-pgr.md](mecanicas-pgr.md).

**TapTap, "战双伤害机制讲解" (2025-02-19, `taptap.cn/moment/641553019611123212`)**, a fonte chinesa mais recente com a fórmula inteira:

```
Elemental: ATK × escala × (1+ATK%) × (1+全伤 "todo dano") × (1+dano do elemento) × (1 − resistência + redução de resistência) × (1 − 免伤 + 易伤)
Físico:    ATK × escala × (1+ATK%) × (1+全伤) × (1+dano físico)     × (1 − 物抗 + redução)               × (1 − 免伤 + 易伤)
```

- **Vulnerabilidade (易伤, "DMG Taken ↑") é a mesma coisa que reduzir o Extra DMG Reduction do alvo:** entra no mesmo fator, somando. Não precisa de fator novo no motor; os buffs de "vulnerabilidade" viram `extraRedDown`.
- **Resistência pode ficar negativa** (vira aumento de dano). O motor **não** deve limitar `(1 − res + redução)` a 1; só o físico tem teto ("破甲上限100%", a DEF não passa de 0).
- **Elemental ignora os 20% da barra amarela**; o físico sofre. Confirma a nota de 2021 (barra = +20% Phys Res) e diz que ela **não** afeta o elemental. Preset de alvo ganha `armorBar: boolean` que só pesa no ramo físico.
- "Duas passivas de Tank não acumulam" (mesmo nome = não acumula), mas 4 peças de Voltaire mais Tank sim. Confirma a regra "mesma origem só renova".
- O post ainda cita ±5% de variação física e crítico = 2× ("双倍暴伤"). A variação saiu em 2026-08-17; **o crítico 2× continua sendo o valor publicado mais recente** (fecha a incerteza 0 parcialmente: falta só um teste in-game depois de 2026-08-17).
- O post **não** separa "Base DMG↑" nem "Final ATK": é uma simplificação para iniciantes. A wiki Gray Ravens continua sendo a referência desses dois fatores.

**Bilibili Wiki, "从意识讲解防御、抗性、减免是什么" (2020-11-28):** escreve a DEF como `(1 − (DEF do alvo − DEF reduzida))`, ou seja, **redução subtraindo**. Conflita com a página de 2021 do mesmo wiki (redução multiplica a "Protection"). A de 2021 é mais nova e mais detalhada, e a calculadora de 2021 usa a forma multiplicativa: **manter a multiplicativa** e anotar o conflito; o teste de DEF da fase 6 (2 peças de Catherine) decide.

**Classes (texto do jogo em `skills-data.js`)** — fecha a incerteza 6 e parte da 1:
- **Annihilator:** "Elemental Resistance Reduction and DMG Increase applied by any member will become universally effective for all elements". No motor: com um Annihilator no time, todo buff de `elemDmg` e `resDown` perde o filtro de elemento. Mais +20% Extra DMG Bonus.
- **Breaker:** −20% Extra DMG Reduction do alvo por 5 s (igual ao Tank), 30% durante Hypermatrix Deduction (4 s após Matrix) se for Breaker Omniframe. Não reduz resistência elemental, ao contrário do que a nota de patch de 2026-01-30 sugeria ("reduz resistência"); vale o texto do jogo.
- **Overlinker:** +20% ATK e +20% de dano do tipo dele para quem entra (10 s); com um só entre Support/Amplifier/Overlinker, Matrix dá +25% "DMG Boost (All Sources)" do elemento por 4 s. "All Sources" sugere que vale para energia **e** efeito do elemento: confirmar.
- **Amplifier:** +10% ATK e +10% de dano do elemento (10 s). **Vanguard:** +20% Extra DMG Bonus ao entrar (10 s). **Attacker:** +20% Extra DMG Bonus fixo.

**Harmony Awakening (ali213, 2026-06-29):** completo, dá **+1 em todas as skills**. O motor precisa somar esse +1 ao nível da skill (`mult(X) = mult(18) × (X+16)/34`), além das passivas novas, que só entram com texto numérico.

**Cores do jogo como dado (api.huaxu.app):** a API do Huaxu entrega cada skill como modelo com `{0}`, `{1}` e a tabela de valores por nível (1 a 35). É uma fonte **estruturada** dos multiplicadores, melhor que ler a prosa: `values[i]` do nível 18 dá o `scale` de cada golpe sem parser. Proposta: o `damage-data.js` guarda o id da skill no Huaxu e o índice do valor, e um script (como `tools/fetch-colors.mjs`) preenche os números. Resolve boa parte da incerteza 4 (nível de skill).

**Continua sem fonte:** a fórmula do dano de efeito (Ignition, Plasma Beam etc.). Nenhuma página EN/CN/JP achada; um vídeo da Bilibili ("《高等效应论》", BV1J2KPeSEud) promete "拆解" do mecanismo de efeitos e é o próximo a ver (não dá para ler vídeo daqui).

### Estado das incertezas

| # | Incerteza | Estado |
|---|---|---|
| 0 | Weakness, DEF, Final ATK, crítico | Weakness = redução de resistência (fechado). Crítico 2× é o mais recente publicado; falta teste pós 2026-08-17. DEF: conflito 2020 × 2021, fica a multiplicativa. |
| 1 | Fórmula de 2024 ainda vale | Sim no essencial (TapTap 2025-02 bate). "Vulnerabilidade" = Extra DMG Reduction negativo. |
| 2 | Efeitos derivados | Aberto: sem fórmula pública. |
| 3 | DEF/resistência de chefes atuais | Aberto: só medições de 2021. |
| 4 | Níveis | Melhorou: Huaxu dá os valores por nível; Harmony Awakening soma +1. |
| 6 | Annihilator | Fechado pelo texto da classe. |

## Arquitetura proposta

Sem build e sem dependências (regra do projeto). Tudo em arquivos novos que só carregam quando necessário, como `skills-data.js` e `editor.js`.

1. **`data/damage-formulas.js`** — motor puro, sem DOM, testável em Node:
   - `statBlock(card, env)` → ATK total, CRIT Rate/DMG, buffs agrupados por fator.
   - `hitDamage(hit, stats, target)` → dano de um golpe (média e, opcional, crítico).
   - `rotationDamage(actions, team, env)` → dano total, por personagem e por ação; trata janelas de duração (buffs com `duration`, stacks, `requires`).
2. **`data/damage-data.js`** — dados estruturados, **só dos personagens cobertos**, cada entrada com `source` (URL da wiki) e `patch`:
   ```
   DAMAGE_KITS["Selena: Pianissimo"] = {
     skills: { "Red Orb": { hits: [{ scale: [..por nível..], element: "Ice", tag: "basic" }], gives: [...] } },
     buffs:  { "Signature": [{ factor: "extraDmg", value: 0.2, duration: 10, target: "self" }] },
     coverage: "complete" | "partial"
   }
   ```
   Mais tabelas: `MEMORY_SET_BUFFS` (2/4 peças como buffs tipados, ligados por nome ao `MEMORY_EFFECTS`), `WEAPON_RES_BUFFS`, `CUB_BUFFS`, `LEADER_BUFFS`, `CLASS_BUFFS`, `ENEMY_PRESETS`, `ENV_BUFFS` (zonas do Warzone, da planilha).
   Cada buff tem: `factor` (atk%, finalAtk, elemDmg, baseDmg, extraDmg, critDmg, critRate, defDown, resDown, extraRedDown), `value`, `duration`, `stacks`, `condition`.
3. **Alvos/ambiente** — `ENEMY_PRESETS` (ex.: "Sem defesa (teórico)", "Pain Cage Ultimate", "Trial Zone Nightmare") com DEF, resistência por elemento, Extra DMG Reduction, armadura. Valores **só com fonte**; presets sem fonte ficam de fora. O usuário também pode editar os números manualmente.
4. **Rotação calculável** — a rotação de texto atual continua; ganha uma forma estruturada opcional `[{char, skill, hits/orbs, t}]`. Fase 1: rotação escrita à mão em `damage-data.js` por build; fase posterior: mapear o texto de `edRotParse` para ações quando o nome da skill existir no kit.
5. **UI** (reaproveita padrões existentes: `rotationIcon`, `pic()`, `esc()`, `web()`, seções `/* ---------- */` do `app.js`):
   - **Cards de build (páginas de times):** botão "Damage" por card → painel com total, por skill, por fonte de buff, e seletor de alvo. Total do time no topo da página/variante.
   - **Team Builder:** mesmo painel, calculando a partir do rascunho (`edDraft`); recalcula a cada `edApply`/`edRefresh`. Personagem sem kit estruturado mostra "no damage data yet" e fica fora do total.
   - **Página do construct:** dano por skill nível 18, sem time (stats base + arma/memória escolhidas), alvo selecionável.
   - **Transparência:** cada número expande para a conta (fator por fator). Aviso fixo: "estimativa; valores do alvo medidos pela comunidade".
6. **Cobertura visível** — selo por personagem: `calculated` / `partial` / `no data`. Nada é estimado "no chute".

## Fases

| Fase | Entrega | Critério de pronto |
|---|---|---|
| 0 | Fechar fórmulas (incluindo a matriz oficial acima e a definição de Weakness): ~~ler wiki Elemental~~ (feito), vídeos do Doomy, wiki por efeito (Ignition etc.); escrever `docs/calculo-de-dano.md` com fórmula validada e lista de incertezas resolvidas | Usuário confirma a fórmula |
| 1 | Motor `damage-formulas.js` + testes em Node (`tools/test-damage.mjs`) com casos conferidos à mão contra a wiki | Testes passam; exemplos da wiki (DEF 60%→54,5%; 1,35/1,20) reproduzidos |
| 2 | **Piloto: 1 personagem** (proposta: Selena: Pianissimo — tem kit, rotação e time Glaciation no site) em `damage-data.js` + painel na página do construct | Número bate com o esperado/in-game fornecido pelo usuário |
| 3 | Painel nos cards de build e total do time (páginas de `COMPS`) para as builds do piloto | Smoke + prints |
| 4 | Team Builder: painel + recálculo ao editar; garantir que `edClean`/`cleanTeam` não mudem de forma (nada novo é enviado ao servidor; o cálculo é só no cliente) | `npm run smoke` + teste manual |
| 5 | Expansão: mais personagens (um a um, com a skill `add-character` estendida para pedir dados de dano), efeitos (Ignition, Plasma Beam…) e presets de alvo | Cobertura crescente no selo |
| 6 | Calibração: comparar com números in-game do usuário/comunidade e ajustar | Margem de erro documentada |

## Arquivos a criar / alterar

- Criar: `docs/calculo-de-dano.md`, `data/damage-formulas.js`, `data/damage-data.js`, `tools/test-damage.mjs`.
- Alterar: `app.js` (seção nova `/* ---------- damage ---------- */`, `loadDamage()` no estilo de `loadSkills()` em ~1636, hooks em `characterPage` e nos cards), `editor.js` (painel), `style.css`, `tools/deploy.mjs` (`SITE_FILES`), `CLAUDE.md` (tabela "Onde está cada coisa"), `index.html`/`_headers` só se um script novo exigir (CSP: sem inline).
- Não mexer: `data/catalog-data.js` (gerado), `server/team.js` (a forma do time não muda).
- Reutilizar: `MEMORY_EFFECTS`, `WEAPON_STATS`, `MEMORY_STATS`, `RESONANCE_EFFECTS`, `CUB_SKILLS`, `LEADER_SKILLS`, `edWeaponOptions`, `edChar`, `rotationIcon`, `memoryInfo`.

## Riscos

- **Precisão:** sem dados oficiais, o resultado é estimativa. Mitigar com fonte por dado, cobertura marcada e calibração (fase 6).
- **Manutenção:** cada patch novo muda kits/efeitos → `patch` por entrada e checklist na skill `add-character`.
- **Tamanho:** `damage-data.js` cresce; carrega só nas páginas que usam, como `skills-data.js`.
- **CSP/servidor:** nada inline, tudo no próprio site; sem API nova.

## Verificação

1. `node tools/test-damage.mjs`: casos da wiki e casos fornecidos pelo usuário.
2. `node tools/check-assets.mjs`, `npm run lint`, `npm run smoke`.
3. `node tools/smoke.mjs <página do piloto>` e abrir os prints em `.smoke/desktop` e `.smoke/mobile` para o visual.
4. Comparar o número do piloto com um valor real in-game fornecido pelo usuário.

## Perguntas em aberto (para a próxima rodada)

- Personagem piloto: Selena: Pianissimo é boa escolha, ou prefere outro (ex.: o que você mais usa)?
- Você tem números reais in-game (dano de uma skill com stats conhecidos) para calibrar a fase 2?
- Ambiente: pela planilha, o plano já inclui buffs de zona do Warzone (`ENV_BUFFS`) além do alvo. Quer Pain Cage e Warzone na fase 1 ou só depois do piloto?
- URLs dos links da planilha (Ultimate PPC (SS), Meta Teams, CN Translations, Gray Ravens): pode colar aqui?
- Salvar o HTML do export em uma pasta fora do projeto (qual caminho?) para o script `FRAME_INFO` ler.
- ~~Tabela de resistências~~: resolvida pela página salva.
- Stats Growth: de qual frame são os prints, e de onde tirar o crescimento dos outros frames (tela do jogo, Huaxu, planilha CN)? Para o piloto, basta o ATK base e o ATK total do frame no jogo, com rank e nível.
- Dano de **efeito** (Ignition, Plasma Beam, Glaciation, Ultima Slash, Darkflow, Raydiance, Disruption): ninguém publicou a conta. Topa calibrar por teste in-game (protocolo acima) já na fase 2, ou o piloto fica só com dano de energia e os efeitos entram depois?
- Fase 0 ganha: extrair `FRAME_INFO` (elemento/classe/efeito/patch) do export e cruzar `MEMORY_EFFECTS` com as datas das notas.
