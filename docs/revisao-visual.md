# Revisão visual e de navegação (2026-11-18)

Base: prints de `npm run smoke` (`.smoke/desktop`, `.smoke/mobile`) e prints da área visível tirados à parte (1366×800 e 390×844), porque o print de página inteira de `/constructs/<nome>` sai quebrado (ver `revisao-codigo.md`, item 2). Nada foi alterado.

**Status (2026-11-18): todos os itens aplicados** a pedido do usuário. Como ficou: (1) instruções num `<details>`, abertas só na primeira visita; (2) filtros de `/constructs` atrás do botão "Filters" em todas as larguras; (3) celular: elementos e raridade em faixas roláveis, "Sort by" numa linha, busca com largura total; (4) companheiros à direita de cada linha; (5) coluna de 56px no cartão do CUB; (6) botão "N builds ↓" ao lado dos detalhes; (7) busca também no texto de efeito de memórias, armas, ressonâncias e CUBs, depois dos nomes ("in effect"); (8) blocos curtos da timeline por cima dos vizinhos (axe sem avisos); (9) "Characters on this page" abaixo da lista; (10) ícone novo para Special Effects (o menu recolhido já mostra os nomes ao passar o mouse); (11) botão EN | PT escondido.

Prioridade = impacto para quem visita × esforço. **A** = vale fazer logo, **B** = bom, **C** = opcional.

## O que está bom

- Home clara: grade Energy / Derivative Effect / Special com contagem de times e selo "New", ferramentas e dados com contagem.
- Página do construct: retrato, rank, classe, elemento, efeito, arma e CUB à esquerda; skills em abas com nível ajustável e valores em vermelho.
- Sem rolagem lateral em nenhuma página (smoke) e acessibilidade quase limpa (axe).

## Sugestões

| # | Prio | Página | O que se vê | O que mudaria |
|---|---|---|---|---|
| 1 | A | `/editor` | 8 linhas de instrução antes da ferramenta: no desktop o formulário começa na metade da tela; no celular, bem abaixo. | Recolher as instruções em um `<details>` "How to use" fechado (aberto só na primeira visita, lembrado no `localStorage`). |
| 2 | A | `/constructs` | Os filtros (Element, Class, Rank, Effect) ocupam ~600 px; a grade começa no fim da primeira tela no desktop. | Filtros compactos em uma linha de chips por grupo, ou um botão "Filters" que abre o painel; a busca já resolve o caso mais comum. |
| 3 | A | `/assets/weapons` (celular) | Elemento, rank, busca e ordenação ocupam a primeira tela inteira; a caixa de busca não vai até a borda (mais estreita que os outros blocos); o chip "Release" quebra sozinho para a linha de baixo. | Busca com largura total; elemento como faixa rolável de ícones; ordenação em um `<select>`. Vale para as outras tabelas de Assets. |
| 4 | B | Listas de times (`/energy/ice`) | Cada linha mostra só o retrato do personagem principal; os outros dois aparecem só no texto "with Leia and Teddy". | Mostrar os 3 retratos pequenos (o `buildRow` da página do construct já faz isso com `.b-mates`). Ajuda a achar um time pelo olho. |
| 5 | B | Página do construct | O nome do CUB ("Vulpecula") começa mais à direita que o nome da arma ("Rhythmic Ray"): o ícone do CUB tem caixa de outra largura. | Mesma largura de ícone nos dois cartões. |
| 6 | B | Página do construct | Para chegar às builds do personagem é preciso rolar abaixo das skills (no celular, bem abaixo). | Âncora/aba "Builds (N)" ao lado de "Skills", ou um link "N builds" no bloco da esquerda. |
| 7 | B | Busca do menu | Acha nomes (constructs, armas, memórias, CUBs, times), mas não texto de efeito ("Glaciation DMG", "Extra DMG Reduction"). | Segundo nível de resultados "in descriptions" com o texto de memórias/armas/CUBs (as skills carregam tarde; podem entrar só depois de `loadSkills()`). |
| 8 | B | `/timeline` (desktop) | axe: links dos frames no gráfico menores que 24 px (`target-size`). | `min-width/min-height: 24px` ou área de clique maior com `::after`. |
| 9 | C | Páginas de time com poucos builds (`/energy/fire`) | Duas linhas e o resto da tela vazio. | Abaixo da lista, "Characters on this page" (retratos que levam à página do construct) ou link para a timeline do elemento. |
| 10 | C | Menu lateral recolhido (desktop) | Só ícones; Effects e Special Effects usam ícones muito parecidos (dois diagramas de nós). | Tooltip com o nome ao passar o mouse (se ainda não houver) e ícones mais distintos. |
| 11 | C | Rodapé do menu | Botão "EN \| PT" desativado continua visível. | Esconder até a tradução voltar (decisão já registrada no `CLAUDE.md`, só lembrando). |

## Para conferir depois de aplicar

`node tools/smoke.mjs editor constructs assets/weapons energy/ice constructs/fortunaster` e abrir os prints (no caso do construct, o print da área visível, até o item 2 do relatório de código ser corrigido).
