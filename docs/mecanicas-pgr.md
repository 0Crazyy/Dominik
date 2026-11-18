# Mecânicas do Punishing: Gray Raven (referência para o site)

Pesquisa de 2026-11-18. Cada item cita a fonte e a data da página. O que não tem fonte fica marcado **sem fonte**. Datas antigas importam: o jogo mudou muito desde 2021 (efeitos derivados, classes novas, remoção da variação de dano em 2026-08-17).

Fórmula de dano e números de alvo ficam em [calculo-de-dano.md](calculo-de-dano.md); aqui fica o funcionamento do combate e dos sistemas.

## Fontes

| Sigla | Fonte | Data |
|---|---|---|
| BW-入门 | wiki.biligame.com/zspms, "战双基础入门" (Introdução) | 2021-09-21 |
| BW-回球 | wiki.biligame.com/zspms, "〔基础知识〕战双回球机制与延伸技巧" (geração de orbes) | 2020-12-07 |
| BW-防御 | wiki.biligame.com/zspms, "【基础必看】从意识讲解防御、抗性、减免是什么？" (DEF, resistência, redução) | 2020-11-28 |
| TT-伤害 | taptap.cn/moment/641553019611123212, "战双伤害机制讲解" | 2025-02-19 |
| ALI-谐振 | m.ali213.net/news/gl2606/1786843.html, "战双帕弥什谐振觉醒系统介绍" (agregador de notícias) | 2026-06-29 |
| HX | api.huaxu.app (dados do jogo servidos pelo Huaxu, servidor NA) | consultado 2026-11-18 |
| SITE | textos de classe e skills em `data/skills-data.js` (vindos da wiki Gray Ravens / Huaxu) | atual |
| NOTAS | notas de patch do Discord, resumidas em `calculo-de-dano.md` | 2023-12 → 2026-11 |

## Glossário CN ↔ EN

| Chinês | Inglês (jogo global) | Nota |
|---|---|---|
| 信号球 / 消球 | Signal Orb / Ping | 单消/双消/三消 = 1/2/3-Ping |
| 必杀技 | Signature Move | |
| 核心被动 | Core Passive | |
| 换人 / 入场技 | Switch / QTE de entrada | |
| 闪避值 | Dodge gauge | |
| 极限闪避 / 超算空间 | Perfect dodge / Matrix | |
| 意识 | Memory | 共鸣 = Resonance; 超频 = Overclock |
| 武器共鸣 | Weapon Resonance | |
| 谐振 / 谐振觉醒 | Weapon Harmony / Harmony Awakening | |
| 跃升 | Leap | |
| 辅助机 | C.U.B. | |
| 属性 / 物理 | Elemental / Physical | |
| 引燃 · 等离子 · 冰晶(覆冰) · 极限斩 · 暗流(黯衍) | Ignition · Plasma Beam · Glaciation · Ultima Slash · Darkflow | Efeitos derivados; termos CN variam por fonte |
| 防御 · 抗性 · 减免 | DEF · Resistance · DMG Reduction | |
| 易伤 | Vulnerability ("DMG Taken ↑") | |
| 黄条 | Barra amarela (armadura) | |
| 装甲型 | Tank | |

## Combate

**Orbes (BW-入门, BW-回球).**
- Ataque básico gera orbes aleatórios: 1 a cada 1,5 s de ataque contínuo; quase todo personagem gera 2 por combo completo de básico (exceção citada: Veritas). Guarda até 16, mostra 8.
- Orbes da mesma cor lado a lado somem juntos: 1/2/3-Ping. 3-Ping costuma dar o maior efeito e alimenta o Core Passive da maioria.
- Com 4 iguais seguidas, tocar a da **esquerda** consome só 1 e guarda 3.
- Outras fontes de orbes: troca de personagem (4 orbes na entrada; 7 com o personagem no máximo), ressonância do slot 2 de arma 6★, 4 peças de Bathlon, 4 peças de Hanna, Ultima Awaken (lista de 2020).

**Signature (BW-入门).** Barra de energia, em geral 120. Cada golpe de básico dá 1; Ping de 1/2/3 orbes dá 3/7/12. Os textos do site confirmam a mesma escala em vários kits ("gains 0 / 3 / 7 / 12 Signature Energy", Leia: Fortunaster).

**Esquiva e Matrix (BW-入门).**
- Barra de esquiva: recupera 80/s, +500 ao entrar em campo, cada esquiva gasta 250. Abaixo de 250, a barra fica vermelha e trava 2,5 s. Teto 1000 (corpo a corpo) ou 800 (à distância). Depois de 2 esquivas seguidas há 0,5 s sem esquiva.
- Esquiva é invencível e interrompe tudo, menos a Signature.
- Esquiva no último instante abre o Matrix (desacelera inimigos). Dentro dele, um Ping de 1 orbe piscando conta como 3-Ping. Recarga de 12 s **por personagem** (trocar permite abrir de novo). 4 peças de Hanna/Aife abrem Matrix com recarga própria.

**Troca (BW-入门).** Quem sai fica 15 s sem poder voltar; quem entra usa o golpe de entrada se houver inimigo ao alcance. Quem sai tem 2 s de super armadura.

**QTE (BW-入门).** Recarga de 8 s; acionado pelo retrato do aliado.

## Energia e efeitos derivados

- Seis energias: Physical, Fire, Ice, Lightning, Dark, Nihil (grayravens.com/wiki/Energy, 2024-12-16).
- Cada energia tem um efeito derivado: Ultima Slash (Physical), Ignition (Fire), Glaciation (Ice), Plasma Beam (Lightning), Darkflow (Dark), Disruption (Nihil). Efeitos especiais: Raydiance (Lightning) e Disruption (Nihil). Fonte: tela "DMG Boost Description" do jogo (prints do usuário, ver `calculo-de-dano.md`).
- O efeito de um frame nem sempre é o "natural" do elemento (Selena: Physical + Glaciation; Vera: Fire + Darkflow; Helentine: Lightning + Glaciation). Fonte: NOTAS.
- Com mais de um efeito no time, o jogador escolhe qual ativa (NOTAS, 2025-02-18).
- Dano de efeito usa Effect Resistance / Effect DMG Boost e **não** sofre Energy Weakness; dano de energia sofre Energy Resistance, Energy DMG Boost e Energy Weakness. Raydiance sofre os três conjuntos (Lightning, Plasma Beam, Raydiance). Fonte: tela oficial (prints do usuário).
- **Sem fonte:** a fórmula numérica do dano de efeito. Nenhuma página (EN, CN ou JP) que achei a publica.

## Classes (texto do jogo, SITE)

| Classe | Passiva |
|---|---|
| Attacker | Extra DMG Bonus +20%. |
| Tank | Ataques reduzem o Extra DMG Reduction do alvo em 20% por 5 s. |
| Breaker | Igual ao Tank (−20% por 5 s); quando qualquer membro aciona Matrix, ganha Hypermatrix Deduction por 4 s e o efeito sobe para 30% se vier de um Breaker Omniframe. |
| Support | Cura +20%. |
| Amplifier | Quem entra em campo ganha +10% ATK e +10% de dano do elemento do Amplifier por 10 s. |
| Overlinker | Quem entra ganha +20% ATK e +20% de dano do tipo do Overlinker por 10 s. Se o time tem só um entre Support/Amplifier/Overlinker, acionar Matrix dá Overlink Ascension por 4 s (+25% de dano do elemento para o time). Texto de Adelyde: Anabasis. |
| Vanguard | Ao entrar: +20% Extra DMG Bonus e escudo de 20% do HP máximo por 10 s. |
| Annihilator | Extra DMG Bonus +20%; reduções de resistência e aumentos de dano de qualquer membro valem para todos os elementos. |
| Observer | Copia a classe conforme as Observation Notes (Tank, Breaker, Amplifier, Overlinker). Texto de Ishmael: Parhelion. |

Datas de entrada (NOTAS): Breaker 2026-01-30, Overlinker 2026-09-22.

## Dano em uma linha

Fatores multiplicam entre si; bônus do mesmo fator somam; o mesmo efeito (mesmo nome) não acumula, só renova a duração (BW-防御, TT-伤害). Detalhes e números em `calculo-de-dano.md`. Pontos que valem lembrar fora do cálculo:
- Dano elemental ignora os 20% de redução da barra amarela; o físico não (TT-伤害).
- Resistência elemental pode ficar negativa com reduções suficientes, o que vira aumento de dano (TT-伤害).
- "Vulnerabilidade" (易伤) entra no mesmo fator da redução de dano do alvo: `(1 − redução + vulnerabilidade)` (TT-伤害).
- Variação física de ±5% foi removida em 2026-08-17 (NOTAS); fontes anteriores ainda a citam.

## Sistemas de equipamento

- **Memórias:** conjunto de 2 e 4 peças (6 slots: 4 de um set + 2 de outro é o padrão do site). Ressonância de memória (Upper e Bottom) e Overclock (超频, sistema de 2020; ver artigo "超频共振" na BW). Os textos de memória **não têm cor** no jogo (HX).
- **Armas:** 6★ com ressonância de arma (3 slots; listas por classe em `editor.js`/`server/team.js`). Ressonâncias pintam só o nome do status (ex.: "Corrosion", Domain Deconstruction) (HX).
- **Weapon Harmony / Harmony Awakening (谐振 / 谐振觉醒):** Harmony é o nível base da arma exclusiva; o Awakening (desde o patch "孑念空行", 2026-06/07) abre 6 nós extras com passiva nova e, completo, **+1 em todas as skills**. Primeira arma: Orpheus' Lullaby (Selena: Pianissimo); custa 50 "Harmony Amplifiers", obtidos de graça em um modo bissemanal. Independente do Leap (ALI-谐振; NOTAS confirma a lista de armas cobertas).
- **Leap (跃升):** reforço do próprio frame (novas skills e reformulação), liberado por frame em ondas por ano de lançamento (ALI-谐振). No site: 60 frames com "Leap Skill" em `skills-data.js`.
- **C.U.B.:** ataque próprio com escala por nível; valores aparecem em vermelho próprio no jogo (`#FF6347`, HX).

## Cores do texto no jogo (HX)

Ver [cores-texto.md](cores-texto.md). Resumo: vermelho `#D91414` para valores e termos de mecânica; azul `#0F70BC` para a condição de um golpe ("Ping Yellow Orb") e passivas por nível; cinza `#645F5D` para texto de nível ainda não alcançado; CUB usa `#FF6347` nos valores.

## Lacunas (sem fonte)

- Fórmula do dano de efeito (Ignition etc.) e como Effect Resistance se compara com a resistência elemental.
- Regras atuais de geração de orbes para frames novos (as fontes são de 2020–21).
- Valores de DEF/resistência dos chefes atuais (só há medições de 2021).
- Custo e efeito de cada nó do Harmony Awakening para armas além da primeira.
