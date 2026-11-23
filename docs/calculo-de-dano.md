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

**Como ler o texto das skills (regra oficial da wiki, vira o "parser humano" de `damage-data.js`):** "causa/adiciona XX% de dano" = multiplicador de skill ("por hit/por segundo" acumulam); "dano de XX aumenta" = bônus de dano; "reduz a resistência de XX" = redução de resistência; aumento de resistência é do próprio personagem e não entra. **"Its effect increased by X%"** (melhoria de rank sobre um efeito) soma X pontos ao efeito: 20% + "increased by 10%" = 30% (regra dada pelo usuário em 2026-11-20).

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

### Selena: Pianissimo no jogo (prints do usuário, 2026-11-20)

- Piloto confirmado: **Selena: Pianissimo**, nível 80, rank **SS** (fases de SS: 0, pela coluna "Phase Bonus" +0), promote no máximo. ATK total **1953** (HP 9633, DEF 1390, CRIT 936) com Orpheus' Lullaby 6★ (436 ATK) e memórias Burana nos slots 1, 2, 3 e 5 e Cottie nos slots 4 e 6, o mesmo `memBuild` do `app.js`. O usuário escreveu "1235 Burana e 56 Cottie"; tratei o "56" como "46".
- Crescimento e promote estão em `FRAME_STATS` (`data/damage-data.js`). Fases: S1 ATK+10, S2 HP+50, S3 DEF+5, S4 CRIT+5, S5 HP+50, S6–S10 repetem; igual em todo rank (`phaseBonus()` em `damage-formulas.js`). O crescimento sobe ≈ +20% do valor de S a cada rank, mas os valores não batem exatamente com a regra, então fica guardado por frame.
- **A conta não fecha ainda:** 1953 − 436 (arma) − 324 (promote) − 20 (fases do S) − 5,44 × 80 (crescimento SS) ≈ **738**, que é a soma de ATK base do frame + memórias + ressonâncias de ATK. Memórias só nos slots 4–6 dariam 402 (543 com overclock de +35%). Falta medir no jogo: ATK sem nada equipado, ATK só com a arma, e o ATK de cada peça de memória (com overclock e ressonância). Também falta saber se o crescimento multiplica o nível 80 ou o 79.
- **Pesquisa de 2026-11-20 (composição do ATK):**
  - **Slots de memória:** 1–3 dão só HP e CRIT; 4–6 dão só ATK e DEF, com o mesmo valor em qualquer um dos três. Fontes: Gray Ravens "Beginner's Guide" (Misc: "Does memory placement matter?"), TapTap 98575707608715036 (2021: Frederick 04/05 = ATK 136, DEF 223; 01/03 = HP 1446, CRIT 64, os mesmos números de `MEMORY_STATS`). Então `MEMORY_STATS[nome][0]` é o ATK de **uma** peça nos slots 4–6; na build da Selena: Cottie 135 + Burana 132 + Cottie 135 = **402** sem overclock.
  - **Ressonância de memória 6★:** cada memória tem 2 espaços; as opções de stat são HP+75/ATK+15, ATK+15/DEF+23, HP+75/CRIT+15, ATK+15/CRIT+15 (5★: +10). No máximo 12 × 15 = 180 ATK (Fandom "Overclocking & Resonance", TapTap 2021).
  - **Overclock de memória:** nos slots 4–6, aumenta o ATK (+17,5% no TapTap de 2021) e a DEF (+12,5%) da peça; nos slots 1–3, HP e CRIT. A Bilibili de 2021 fala em +35% no máximo. Os números dependem de quantos níveis de overclock: **conferir no jogo**.
  - **Nível:** nenhuma fonte (Huaxu, Gray Ravens, Fandom, Bilibili, TapTap) publica o ATK base de nível 1 por frame. O Huaxu não tem stats de frame na API (`characters/<slug>` só traz lore, arte e skills). O promote da Selena (324) é ≈ 56% de 7,26 × 80, a mesma proporção da Bilibili (promoção ≈ 56,4% do crescimento SSS+), o que confirma que os 324 já são o total das promoções.
  - **Resolvido pela página da Selena na wiki Bilibili** (link do usuário; ver o comentário em `FRAME_STATS`): ATK base 102 no nível 1, e o nível soma o crescimento a partir do nível 2 (nível − 1). `frameStats()` dá **875,8** de ATK do frame em SS0 nível 80; com a arma, 1311,8. **Sobram 641,2 para as memórias**, que precisam ser explicadas pelas peças.
  - Melhor encaixe até agora (hipótese, sem confirmação): overclock que dá +35% de ATK e +25% de DEF/CRIT nas peças, mais 6 ressonâncias "ATK+15 / CRIT+15". Isso explica ATK (sobra 8,5), DEF (sobra 9) e CRIT (sobra 1,6). Falta o usuário confirmar o overclock e as ressonâncias das 6 peças.
  - **Conta fechada (prints da Selena, 2026-11-20):** rank **SS0** (a próxima fase é a Phase 1, ATK +10). Ressonâncias das 6 memórias: superior "ATK +15, CRIT +15", inferior "Core Passive +1"; todas com hypertune (12). A tela de cada peça mostra o stat sem hypertune (Burana 1: HP 1491, CRIT 66; Cottie 4: ATK 135, DEF 223), igual a `MEMORY_STATS`. Com `frameStats` + arma 436/249 + `memoryTotals` e os dois hypertunes **multiplicados** (× 1,175² / × 1,125²): ATK 1956,8 (jogo 1953), DEF 1391,3 (1390), CRIT 937,4 (936), **erro ≤ 0,2%**. Somados (+35%), o erro seria de 8,5 / 9,2 / 1,6: a multiplicação encaixa melhor, mas nenhuma fonte confirma. Os testes cobrem os três stats.
  - **Gravação de rotação (2026-11-20, `C:\Users\fabio\Videos\NVIDIA\PGR`, 30 s, alvo "Gardener (Basic)" do treino, Selena sozinha, líder ligado, Glaciation ativado, medidor de Glaciation em 0 o vídeo todo = nenhum golpe de efeito):**
    - Red Orb 3-ping (Slurring, 360%) = **11701**. O motor, com o alvo "boneco nível 80 (2021)", dá ≈ 11674 (ATK 1957) ou 11650 (ATK 1953 do jogo): erro de 0,2–0,4%. O fator do alvo medido (DEF × Extra DMG Reduction) é 0,875–0,877, contra 0,873 do boneco de 2021.
    - O 3-ping seguinte (Harmonics) veio em 4 golpes de **2923** (4 × 90% = 360%): o texto "deals X%" é o total, dividido entre os golpes.
    - **Crítico = exatamente 2×** confirmado depois da mudança de 2026-08-17: 41604 = 2 × 20802, 18486 = 2 × 9243, 51988 = 2 × 25994, 33150 = 2 × 16575 (sem bônus de CRIT DMG ativo).
    - **Comandos do usuário:** 3-Ping, 3-Ping, segurar ataque (Matrix), orbe azul, Signature (Rainy Prelude), segurar esquiva, 6 Concerto Orbs, segurar esquiva, orbe azul, Signature (Note of Termination). **Sem CUB.**
    - **Echoing Melody com 2 notas** = 2 golpes de 640% (20802; 41604 crítico) = 1280% = 320% × (1 + 100% das notas) × 2 do Burana 4p. **Confirma** que o "dano dobra" do Burana é × 2 à parte (como Base DMG daria 960%).
    - **Rhythmic Piercing logo depois** = golpes de 9243 = 284,44% = 2560% / 9 = 640% × (1 + 100%, passado pela Orpheus' Lullaby) × 2 do Burana. **Confirma** o repasse do bônus de notas da arma.
    - O motor (alvo "boneco 2021", ATK 1953, líder, notas +100%) dá 11651 / 41425 / 82850 contra 11701 / 41604 / 83187 do jogo: os três **0,4% abaixo**, o mesmo erro, então o Gardener deve ter um pouco menos de defesa que o boneco de 2021. Viraram testes em `tools/test-damage.mjs`.
    - **Status Overview (pausa na luta):** depois do Note of Termination só mostra "Noise". Os efeitos de memória (Cottie, Burana) **não aparecem** lá, então essa tela não serve para conferir buffs de memória.
    - **Golpes de ~22 s = repetição do par Echoing Melody + Rhythmic Piercing** (as 2 notas vêm dos 6 Concerto Orbs, "1 nota a cada 3"), multiplicados por 1,1131 (23155/20802 = 1,11311; 10289/9243 = 1,11317). O Cottie 4p (+15% sobre 1,32) daria 1,11364: diferença de 0,05%. Ou seja, um +15% de Extra DMG estava ativo em ~22 s, provavelmente o Cottie reativado por algo além das duas Signatures (o Rainy Prelude foi em ~9 s, e o efeito dura 10 s).
    - **Harmony da Orpheus' Lullaby (print, 7/7):** Harmony Absorption no Cottie (+2 peças: as 2 de Cottie valem 4, o que liga o Cottie 4p), Harmony Awakening = skill Frostbound Finale, Core Harmony 1–3 (Core Passive +3) e Signature Harmony 1–2 (Signature +2). Com as 6 ressonâncias, **Core Passive 27 e Signature 20**. Para esta arma, o Awakening **não** dá +1 em todas as skills (a nota do ali213 citada abaixo vale para outras armas ou estava errada).
    - **Resolvido com esses níveis e o Cottie 4p ativo:** Note of Termination = **21 golpes** de 16575 (3500% × 36/34 × 1,3 × 2 × Cottie); segundo Melodic Outburst = **7 golpes** de 25994 (4000% × 43/34 × Cottie). Os dois com erro de 0,2% depois de corrigir o mesmo 0,4% do alvo. Testes em `tools/test-damage.mjs`.
    - **Resumo da calibração:** os 5 golpes medidos (Red Orb, Echoing Melody, Rhythmic Piercing, Melodic Outburst, Note of Termination) batem com o motor dentro de 0,5%, todos ~0,4% abaixo do jogo. A explicação mais provável é a defesa do Gardener ser um pouco menor que a do boneco de 2021.
  - **Segunda gravação, de Glaciation (2026-11-20, `PGR 2026.11.20 - 02.36.04.06.mp4`):** Wanshi: Lucid Dreamer (SSS, sem CUB nem memórias, arma 5★) liga o Glaciation; depois a Selena faz 3-Ping, segurar ataque, orbe azul, Signature, segurar esquiva, todos os orbes brancos e Majestic Interlude. O Wanshi aplica no alvo: Tank (−20% de Extra DMG Reduction por 5 s), Frost Corrosion (−25% de resistência a Ice por 8 s, ao entrar no Calibration Mode, por projétil e pelo QTE) e a Frozen Zone ("enfraquece", sem número).
    - **Red Orb 3-ping com o Tank ativo = 14210** (contra 11701 sem). As duas medições dão os valores do Gardener: **DEF 5,97% e Extra DMG Reduction 6,73%** (preset "Gardener (Basic)" em `ENEMY_PRESETS`, agora o alvo padrão; testes reproduzem os dois números dentro de 0,1%). Isso explica o "0,4% abaixo" das contas com o boneco de 2021.
    - **Ice Accumulation (100% de Glaciation, não escala) = 4357**, golpe vermelho com floco de neve que se repete. Confirma que golpe de efeito **não sofre DEF**. Dá (1 − resistência a Ice + redução) = 1,038: resistência a Ice do Gardener **≈ 21% se a Frost Corrosion estava ativa** (o mais provável pelo tempo), ou ≈ 0% se não. Não dá para separar com esta gravação.
    - **Golpes grandes de Glaciation (64878, 31236 ×2, 59529, 25723, 55081…)**: os números se sobrepõem na tela e o Wanshi deixa efeitos variados no alvo, então não deu para ligar cada um a uma skill. Para isso, falta uma gravação mais limpa (ver a resposta ao usuário).
  - **Terceira gravação, de Glaciation com gráficos baixos (2026-11-20, `PGR 2026.11.20 - 02.44.11.08.mp4`):** mesma ideia (Wanshi liga o Glaciation, Selena entra com Ice Spikes). Leitura limpa: Red Orb 14210 (Tank ativo), 3-ping seguinte 2923/3550 (o Tank acaba no meio), Echoing Melody de Glaciation **64878** por golpe, Rhythmic Piercing de Glaciation **31236** por golpe, e golpes pequenos de Glaciation 4357, 5252, 723 (a cada ~1 s, provavelmente a Frozen Zone do Wanshi, 50%/s com o ATK dele) e 595.
    - **Confirmado:** 64878 / 31236 = 2,077, e o motor prevê (600% × 2 × 2 / 2 golpes) / (1300% × 2 × 2 / 9 golpes) = 2,0769. Os multiplicadores de Glaciation do Huaxu, as notas, a arma e o × 2 do Burana valem como no físico, e o número de golpes é o mesmo (2 e 9). Teste em `tools/test-damage.mjs`.
    - **Confirmado:** golpe de Glaciation sofre a redução de resistência a **Ice** (Frost Corrosion) e o Extra DMG Reduction (Tank), ou seja, usa o elemento Ice (`effectElement: "Ice"`), e não sofre DEF.
    - **Valor absoluto:** com Tank + Frost Corrosion ativos, os dois golpes da Selena fecham com resistência a Ice do Gardener = **−3,8%** (preset atualizado; o Ice Accumulation de 4357 com Tank dá o mesmo valor). Os testes reproduzem 64878 e 31236 dentro de 0,2%, mas são a mesma medição que definiu a resistência, então não são confirmação independente.
    - **Pendente:** no mesmo instante, o Ice Accumulation deu **5252**, 2,9% abaixo do que o motor prevê (5406) com os mesmos fatores. Ele perde algum bônus que os golpes de skill da Selena recebem (talvez o Glaciation DMG do Burana 2p ou do líder não valha para ele, ou ele não seja exatamente 100%). Também não dá para separar "resistência −3,8%" de "um +3,8% em todo golpe de Glaciation".
    - **Ainda sem explicação (resolvido acima, mantido como histórico):** 23155 (712%) e 10289 (= 9243 × 1,113) por volta de 22 s, o segundo Rhythmic Piercing, com um ganho de +15% de Extra DMG que não deveria estar ativo (o Cottie 4p do Rainy Prelude, em ~9 s, dura 10 s); 25994 (800%) no Flow; e os vários 16575 (510%) do Note of Termination: 3500% × 1,3 × 2 = 9100% não se divide num número inteiro de golpes de 510% (17,8), nem com o Cottie (19,9). Pode ser um bônus do Flow ou do Grand Finale que o texto não mostra.
    - Em unidades do Red Orb (11701 / 3,6 = 3250 por 100%): 20802 = 640%; 9243 = 284%; 23155 = 712% (= 640% × 1,114, o ganho do Cottie 4p +15% sobre 1,32); 10289 = 9243 × 1,113 (o mesmo golpe com o Cottie 4p); 25994 = 800%; 16575 = 510%. Falta saber que golpe é cada um.
  - **Core Passive +1 × 6:** a passiva central da Selena fica 6 níveis acima (18 + 6 = 24, `skillScale`). Entra no dano da Core Passive na fase 2.
  - (Correção: o print com "HP +75, ATK +15" era das memórias de outro personagem.)
  - **Prints de ressonância (2026-11-20), leitura anterior:** as 6 memórias têm ressonância superior "HP +75, ATK +15" com hypertune (= +90 ATK). Hypertune (igual para todo personagem e memória): slots 1–3 HP +17,5% e CRIT +12,5% da peça; slots 4–6 ATK +17,5% e DEF +12,5%. Cada memória tem 2 hypertunes ("Hypertune Progress 2/2"), e cada um aparece com o mesmo texto, então o total por peça parece ser +35% / +25%. **Sequence Pact Bonus:** cada ressonância com hypertune dá +1% de Extra DMG Bonus (2% por memória, até **+12%**): é buff `extraDmg`, não ATK.
  - **Confirmado pelo usuário:** 1 hypertune por ressonância, 2 por memória; o bônus de ATK/DEF do hypertune vale só nos slots 4–6. Implementado em `memoryTotals()` (`HYPERTUNE` em `damage-formulas.js`).
  - Conta com hypertune 2×: ATK 1944,5 (jogo 1953, faltam 8,5), DEF 1380,8 (faltam 9,2), CRIT 844,4 (faltam 91,6). Com 1×, faltam 79 / 93 / 116, então 2× é o que encaixa. Hipóteses para o resto, a confirmar: fases do SS já feitas (SS1 ATK +10, SS3 DEF +5; a coluna "+0" pode só contar o rank completo) e ressonâncias inferiores de CRIT +15 (6 × 15 = 90). O HP não fecha com nenhuma hipótese (daria base negativa); como o HP não entra no dano, fica de fora.
  - O CUB tem ATK próprio (Snow Waltz: 997, Huaxu `cubs/snow-waltz`), que não entra no ATK do personagem.
  - **Plano anterior (substituído):** como o site só usa o nível 80, basta uma constante por frame: `ATK do frame no nível 80 = C + crescimento[rank] × 80 + promote + fases`. O usuário tira as memórias (a arma não sai), lê o ATK, subtrai os 436 da arma e acha `C`. A diferença entre 1953 e esse ATK mostra o quanto as memórias dão com overclock e ressonância. Se a regra for nível − 1 em vez de nível, o erro é de menos de 1 ATK por rank.
- **Decisão de interface:** a calculadora tem um seletor **Energia / Efeito** que troca o tipo de golpe (`kind` do `hitDamage`). O dano de efeito aparece com o aviso de fórmula sem fonte.

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

**Harmony Awakening (ali213, 2026-06-29):** completo, dá **+1 em todas as skills**. **Corrigido em 2026-11-20:** na Orpheus' Lullaby, o +1 vem dos nós Core Harmony e Signature Harmony (`WEAPON_HARMONY`), e o Awakening só dá a skill de Harmony; conferir arma por arma. O motor precisa somar esse +1 ao nível da skill (`mult(X) = mult(18) × (X+16)/34`), além das passivas novas, que só entram com texto numérico.

**Cores do jogo como dado (api.huaxu.app):** a API do Huaxu entrega cada skill como modelo com `{0}`, `{1}` e a tabela de valores por nível (1 a 35). É uma fonte **estruturada** dos multiplicadores, melhor que ler a prosa: `values[i]` do nível 18 dá o `scale` de cada golpe sem parser. Proposta: o `damage-data.js` guarda o id da skill no Huaxu e o índice do valor, e um script (como `tools/fetch-colors.mjs`) preenche os números. Resolve boa parte da incerteza 4 (nível de skill).

**Continua sem fonte:** a fórmula do dano de efeito (Ignition, Plasma Beam etc.). Nenhuma página EN/CN/JP achada; um vídeo da Bilibili ("《高等效应论》", BV1J2KPeSEud) promete "拆解" do mecanismo de efeitos e é o próximo a ver (não dá para ler vídeo daqui).

### Estado das incertezas

| # | Incerteza | Estado |
|---|---|---|
| 0 | Weakness, DEF, Final ATK, crítico | Weakness = redução de resistência (fechado). Crítico 2× é o mais recente publicado; falta teste pós 2026-08-17. DEF: conflito 2020 × 2021, fica a multiplicativa. |
| 1 | Fórmula de 2024 ainda vale | Sim no essencial (TapTap 2025-02 bate). "Vulnerabilidade" = Extra DMG Reduction negativo. |
| 2 | Efeitos derivados | Aberto: sem fórmula pública. |
| 3 | DEF/resistência de chefes atuais | Aberto: só medições de 2021. |
| 4 | Níveis | Fechado para a Selena: Huaxu dá os valores por nível e a escala `(L+16)/34` confere; os níveis extras vêm das ressonâncias e dos nós Core/Signature Harmony da arma (não do Awakening). |
| 6 | Annihilator | Fechado pelo texto da classe. |

## Próximo personagem (plano de 2026-11-20)

O que a Selena **não** cobre, e que o próximo deve ensinar: dano de **energia elemental** (sem DEF e sem crítico: só a teoria está implementada), **outra classe** com efeito no alvo, e o **Ice Accumulation** que ficou 2,9% abaixo. Também conta quantas builds do site o personagem tem (o cálculo vai para os cards depois) e se o usuário tem o personagem bem investido para gravar.

Builds no site (contagem em `COMPS`, 2026-11-20): Teddy: Spectre 10, Leia: Fortunaster 9, Wanshi 6, Lucia: Inverse Crown 5, Rosetta: Arete 5, Adelyde 4, Helentine 4.

| Candidato | Elemento / classe / efeito | O que ensina | Contra |
|---|---|---|---|
| **Leia: Fortunaster (recomendado)** | Ice / Breaker / Glaciation | Energia **Ice** contra o Gardener, cuja resistência a Ice já foi medida (−3,8%): o primeiro teste limpo da fórmula elemental. Mesmo efeito da Selena: reaproveita o modelo de Ice Spikes e ajuda a resolver o Ice Accumulation. Classe Breaker (−20% de Extra DMG Reduction, 30% no Hypermatrix). 9 builds, frame mais novo, textos já no site | Breaker no Hypermatrix e o kit novo podem trazer mecânicas próprias |
| Lucia: Inverse Crown | Ice / Attacker / Ignition | Energia Ice + **Ignition**, primeiro efeito diferente de Glaciation | Ignition sem nenhuma medição ainda |
| Teddy: Spectre | Ice / Amplifier / Raydiance | Buffs de time (Amplifier) e Raydiance, que sofre os fatores de Lightning, Plasma Beam e Raydiance | Suporte: o valor dele está no buff aos outros, então serve para a fase 3 (total do time), não agora |

**Ordem proposta:** Leia → Lucia: Inverse Crown → Teddy. A Leia fecha a fórmula elemental com o alvo já medido; a Lucia abre o segundo efeito (Ignition); o Teddy entra quando houver o total do time.

**O que pedir ao usuário para cada personagem** (o mesmo roteiro que funcionou com a Selena):
1. Telas do jogo: Stats Growth (crescimento por rank), Promote, total de stats, fases, ressonâncias e hypertunes das memórias, Harmony da arma.
2. Uma gravação contra o Gardener (Basic), sozinho, sem CUB, com a lista de comandos; se o efeito precisar de outro personagem, uma segunda gravação com pausas entre os golpes e gráficos baixos.
3. ATK base de nível 1: pela página do frame na wiki Bilibili (atenção aos rótulos trocados), conferido com o total do jogo.

**Kamui: Aeternion (adicionado em 2026-11-20, sem medição):** Fire / Breaker / Plasma Beam. Kit inteiro do Huaxu em `DAMAGE_KITS` (golpes de Fire com versão Plasma Beam para o Electric Storm Flash, Firelit Thunder sempre Plasma Beam com `always`), opções de arma (Solar Flare), Feynman 2p/4p, Sunfire, Thunder Haze (−25% de resistência a Fire e de Plasma Beam), Crown Arc × 5, líder, Breaker (escala com o nível da classe: 10% no 1, 20% no 18) e os bônus de SS a SSS+. **Sem `FRAME_STATS`:** o painel pede o ATK do jogo e não mostra CRIT (Fire não crita). Leituras sem fonte, marcadas: Plasma Beam usa resistência e bônus de Lightning (pela tabela do jogo, como Glaciation ↔ Ice, que foi confirmado); "Base DMG doubles" da Solar Flare = Base DMG +100%; "+10%" do SS3/SSS nos debuffs = +10 pontos; "DMG +5%" do líder para Breakers = Extra DMG Bonus. O Gardener agora guarda a resistência por elemento (Ice −3,8% medido; os outros 0). Para conferir: as mesmas telas e gravações da Selena.

**Gravações do Kamui (2026-11-20, `PGR 2026.11.20 - 03.03.59.09.mp4` e `03.06.49.12.mp4`; os nomes estão trocados em relação ao que o usuário descreveu):** Kamui SS3 capitão, Feynman 4 + Cottie 4 (Harmony Absorption), 12 hypertunes, 6 ressonâncias "Signature +1" (Signature 24), Lucia: Lotus só para trocar.
- **Status Overview em batalha:** o inimigo tem "Coiled Tempest" e "Breaker Class Skill", e **não** tem "Scorching Invasion". No time com Plasma Beam, os golpes de Fire não ganham a redução de resistência a Fire. O kit agora separa as duas opções (`hazePlasma` ligada, `hazeFire` desligada), e os +10% do SS3/SSS ficam dentro delas (`rank` por buff).
- **Breaker confirmado de forma independente:** o campo da Signature deu os pares 2065/1701 = 1,2140 e 1930/1589 = 1,2146; o motor prevê 1,2144 com o Extra DMG Reduction de 6,73% do Gardener, medido com a Selena. Teste em `tools/test-damage.mjs`.
- **Campo sem Breaker (1701)** com Signature 24, líder (Fire +10%, +5% como Extra DMG), Feynman 2p, Sequence Pact e Cottie 4p: **ATK × (1 − resistência a Fire) ≈ 2043**. Falta o ATK do Kamui no jogo para tirar a resistência a Fire do Gardener.
- **Sem explicação:** 2065/1930 = 1,07 (talvez o Glorious Afterglow, Final ATK da arma +30% por 8 s depois de um 3-ping, acabando). Solar Poise (57989 + 234739) e Crown Arc (127722) não fecham sem saber o ATK e o Output no momento.

**Kamui com stats do jogo (2026-11-20):** tela de stats SS3 nível 80: ATK 1874, DEF 1441, CRIT 876; promote 291 de ATK; crescimento SS 4,89 / SSS 5,71 / SSS+ 6,53; arma sem Harmony Awakening, só a Harmony Absorption no Cottie; ressonâncias superiores por slot (todas com ATK +15). Base de nível 1 da wiki Bilibili (`神威·不落日`, rótulos certos desta vez): ATK 92, DEF 64, CRIT 40 (DEF e CRIT iguais aos da Selena). `FRAME_STATS` dá ATK 1880 (0,3% acima, o mesmo desvio da Selena; DEF e CRIT sobram 1,3 e 1,4 nos dois frames).
- **Campo da Signature (58,82%/s na Signature 24) explicado por inteiro:** 1589 (Cottie), 1711 (Breaker), 1830 (Breaker + Afterglow), 1930 (Breaker + Cottie), 2065 (os três). Proporções dentro de 0,1%: Breaker ×1,2144, Cottie 4p ×1,128 (só com o "+5%" do líder dentro do Extra DMG Bonus, o que confirma essa leitura) e Glorious Afterglow ×1,0698.
- **Glorious Afterglow** soma 30% do ATK da **arma** (436 → +130,8) **antes** dos ATK% (fator novo `baseAtk`), e não 30% de um "ATK artificial de 500" como a wiki de 2024.
- **Resistência a Fire do Gardener: 19,5%**, tirada do 1589 com a Corrosion da Domain Deconstruction (−8% em todas as resistências) ativa. Os outros quatro valores do campo conferem dentro de 0,3%. Ela absorve qualquer coisa do Kamui que o motor não modele; um golpe limpo de skill confirmaria.
- **Clipe 03.16.45.13 (sem Plasma Beam):** números legíveis (20929, 2334 ×3, 48763, 33457 ×2, 71699, 9182, 294037, 254720, 94213, 118450, 112531, 151672, 69900, 82374), mas sem a lista de comandos e sem saber em quantos golpes cada skill se divide, não deu para ligar a skills.

**Vera: Geiravor (adicionada em 2026-11-20):** Fire / Amplifier / Darkflow. Kit do Huaxu em `DAMAGE_KITS`; o modo de efeito é o Penal Immersion (segurar a Signature), com golpes de Darkflow que usam resistência e bônus de **Dark** (leitura da tabela do jogo, como Glaciation ↔ Ice). Prints e gravação do usuário em `C:\Users\fabio\Videos\NVIDIA\PGR\Geiravor` (`2026-11-20 17-36-19.mp4`, 27 s, Gardener, Vera sozinha).
- **Stats:** Vera SSS+ nível 80 com ATK 2002, DEF 1557, CRIT 986 (Deathless Flame; Hervor ×3 / Shakespeare / Hervor / Shakespeare, Harmony Absorption no Shakespeare; ressonâncias superiores de ATK, inferiores Signature +1; ressonâncias de arma Superconducting Axial Ray, Glorious Spear e Dead Line Timing). Crescimento e promote (1458/283/216/121) das telas do jogo; base de nível 1 da wiki Bilibili (`薇拉·灼惘`: HP 461, ATK 89, DEF 68, CRIT 38; o crescimento S confere). Com ressonância superior "ATK +15 / CRIT +15" em todas, o motor dá **ATK 2012 (0,5% acima)**, DEF 12 abaixo e CRIT 7 acima. Nenhuma ressonância única fecha os três; uma mistura de "ATK/DEF" e "ATK/CRIT" chega mais perto. O usuário confirmou que o segundo stat não importa: Fire não crita nem sofre DEF, e o ATK +15 está em todas.
- **Níveis:** no jogo, todas as skills mostram "18 (+1)" e a Signature 25 (18 + 6 + 1). A origem do +1 em tudo não está nos dados do site (a Deathless Flame não está em `WEAPON_HARMONY`); o painel começa em 18 e o jogador soma.
- **Números lidos na gravação** (vários golpes iguais em cada skill, então são valores por golpe): 1º ciclo: Blue Orb 3-Ping 17026, 6570, 7867; Tempered in Midnight **43899** (pilha de golpes iguais); Red Orb 15852 e 31367; Basic segurado 60232, 61694, 68188, 204577; Scorched in Void **395258** (4 vezes). 2º ciclo: Blue 21537; Tempered **63237**; Red 14357, 19143, 28409, 23730; Basic segurado 45565, 42444, 43413, 53057, 159176; Scorched **368202**.
- **Regra do jogo (usuário, 2026-11-20):** "its effect increased by 10%" soma 10 pontos: o Fire Tempered vai de 20% para **30%** no SS3 e **40%** no SSS, que repete a linha (a Dark Radiation também, por leitura). O "+50%" do Heat Unsheathed (SSS3) é metade a mais do Absolute Pyre: 60% → 90% com 6 orbes (confirmado pelo usuário). O kit usa isso.
- **Em aberto:** Scorched in Void / Tempered in Midnight do 1º ciclo = 9,004 por golpe. Com Absolute Pyre de 6 orbes (+60%, +50% disso no SSS3 = +90%), "Base DMG doubles" da arma = +100%, Fire Tempered 40% (SSS) e o Absolute Pyre fora do Tempered que o concede, o motor fica **12% acima** com o Glorious Spear ativo e **4,4% acima** sem ele. Alguma peça da conta ainda está errada. Combinações que chegam perto, sem confirmação: sem o bônus do SSS3 no Absolute Pyre (+0,5%), ou Absolute Pyre de 5 orbes sem Glorious Spear (−0,9%). A gravação não separa essas hipóteses. `tools/test-damage.mjs` só imprime a razão.
- **Valor absoluto (não confirmado):** com a resistência a Fire do Gardener de 19,5% (medida com o Kamui) e Burn do Shakespeare ativo, Tempered e Scorched dão cerca de **3,08 golpes** cada; se forem 3 golpes, o motor fica ~2,7% acima (resistência a Fire ≈ 22%). Os Red Orbs dão ~3 golpes com erro de 2–6%. O Basic segurado (Hellfire Crucible → Razor Whirlwind → Rending Ravage) não fechou: falta saber a divisão em golpes.
- **Leituras sem fonte, marcadas no painel:** "Full ATK" das ressonâncias de arma = ATK%; o Amplifier com Darkflow dá Dark DMG +20% em vez de Fire; o "+50%" do Heat Unsheathed Lv. 1 = metade a mais do Absolute Pyre.
- **Condicionais revistas (2026-11-20, pedido do usuário):** entraram Shadowhunt Tremor com carga parcial (400%), 1 ou 2 QTEs antes do Absolute Pyre (+25% / +50% de Base DMG), Darkflow Aura por stacks (1/3/6/10/15: explosão 100–1600%, 20–100% por segundo) e o CUB Wrathfang numa seção "CUB" nova do painel (Frenzied Hunt +60% de Base DMG no Tempered com 6 orbes, Jagged Assault +10% de Fire/Dark, Nightfall Predation +5% de Extra DMG, Blazing Fangs +100 de ATK como Final ATK). Ficam de fora: as Active Skills do Wrathfang e o ataque conjunto do Frenzied Hunt (usam o ATK do CUB ou um ATK que o texto não diz), o Cinder Implosion de 10% (SS3, com Darkflow; o texto não diz o que faz) e o Fire Tempered da Lv. 2 do Nightfall Inferno (SSS), que repete a linha da Lv. 1: conta de novo: 40% em SSS (confirmado pelo usuário).
- **Texto do site × Huaxu:** a wiki Gray Ravens (`skills-data.js`) dá Flash Break 450% e QTE com Darkflow 300%; o Huaxu (dados do jogo, NA) dá 900% e 600%. O kit usa o Huaxu, como os outros; a tela de skills do jogo decide.
- **Para fechar:** uma gravação com um golpe por vez (pausa entre skills).

**Ferramenta (criada):** `tools/kit-from-huaxu.mjs "Nome: Frame" [nível]`, que baixa as skills do Huaxu e imprime cada valor no nível 18 com o nome da skill e do trecho, no formato de `moves` de `DAMAGE_KITS`. Hoje isso foi feito à mão com um script temporário; com a ferramenta, montar um kit vira revisar a saída e marcar os golpes de efeito, os bônus e as condições.

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
| 1 | ~~Motor `damage-formulas.js` + testes em Node (`tools/test-damage.mjs`)~~ **feito em 2026-11-20**: `hitDamage`, `rotationDamage`, `skillScale`, `defAfterReduction`, `FACTOR_MATRIX`; 27 testes (coeficiente 1,2082 da Bilibili, DEF 60%→54,5%, Weakness, Annihilator, janelas de buff). Golpe de efeito sai com aviso `assumed`. `statBlock()` (ATK a partir de arma/memórias) ficou para a fase 2, porque depende do ATK base do piloto. Ainda fora de `SITE_FILES` | Testes passam |
| 2 | **Em andamento (2026-11-20):** kit da Selena em `DAMAGE_KITS` (valores do Huaxu no nível 18; a escala por nível `(L+16)/34` confere com a tabela do Huaxu, inclusive a passiva de classe; golpes do efeito não escalam), `kitDamage()`, `buildStats()`, `ENEMY_PRESETS` (2021) e a seção "Damage" na página do construct: seletor Physical / Glaciation, rank e fase, ATK e CRIT editáveis (começam pela build de referência do usuário), alvo, modo de CRIT, níveis de skill e bônus ligáveis. Teste de clique no smoke ("cálculo de dano"). Leituras sem fonte saem como aviso: "dano dobra" do Burana 4p e do Concerto Orb como × 2 à parte; elemento dos golpes de Glaciation = Ice. Falta: conferir com um número real do jogo; Weapon Harmony; rotação. **Piloto: 1 personagem** (proposta: Selena: Pianissimo — tem kit, rotação e time Glaciation no site) em `damage-data.js` + painel na página do construct | Número bate com o esperado/in-game fornecido pelo usuário |
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
