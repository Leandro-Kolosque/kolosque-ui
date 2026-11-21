# Prompt de continuação: Kolosque UI, rodada de design da /templo

Cole este texto inteiro no início do novo chat. Antes de colar, coloque as referências na pasta indicada na seção 7.

---

Oi! Vamos continuar o **Kolosque UI**, meu portfólio de design e front-end. Leia tudo antes de agir.

**Neste chat, primeiro eu mostro o que gostei, o que não gostei e para onde quero ir. Você analisa, faz perguntas e propõe. Só depois a gente codifica.**

## 1. Como gosto de trabalhar

- Sou o Leandro, estudante de Ciência da Computação. Fale comigo em **português**.
- **Converse antes de codar decisões de design**: estrutura primeiro, visual depois. Em escolhas estéticas importantes, mostre opções (com prévia, se der) e recomende uma.
- **Seja sincero e crítico.** Prefiro "isso não vai funcionar por X" a algo genérico.
- **Commits:** eu mesmo faço. Mostre o diff e proponha a mensagem. Formato: conventional commits em português, numa linha só (`feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `chore: ...`). **Nunca** adicione `Co-Authored-By` nem outra atribuição.
- **Trabalhe direto na `main`**, sem worktree nem branch, mesmo que alguma ferramenta sugira.
- **Antes de dizer que algo está pronto:** `npm run build` sem erros e conferência no navegador em ≈1440×900 e ≈390×844, nos temas claro e escuro e com movimento reduzido.

## 2. O projeto

- **Repositório:** https://github.com/Leandro-Kolosque/kolosque-ui (público, `main`). Rode `git status` e `git log --oneline -8` para ver o que já foi commitado. A Fase 5 pode estar pendente.
- **O que é:** um **Mouseion**, o templo das Musas que guardava a Biblioteca de Alexandria. É um portfólio com dois acervos:
  - **Pinacoteca:** landing pages e sites (`src/data/works.ts`; hoje só há 3 rascunhos);
  - **Biblioteca:** experimentos de UI (`src/data/components.ts`, rota `/library`).
- **Duas landings convivem:**
  - **`/`:** a landing original (2.5D: Hero sticky com gravuras em crossfade, cortina sobre ela).
  - **`/templo`:** a versão cinematográfica inspirada no Kage, ainda em teste. Ela substitui a `/` quando eu aprovar.
- **`BRIEF.md`** é o documento de design vivo, mas ainda descreve a `/` original. Atualize-o quando a nova direção for aprovada.

### Stack

Next.js 16.4.6 (App Router), React 19.3, TypeScript 7, Tailwind v4 (CSS-first, tokens em `src/app/globals.css`), GSAP 3.15 com ScrollTrigger e SplitText, Lenis, three 0.186 (direto, sem R3F), next-themes, lucide-react, react-icons e Fontsource (Playfair Display, DM Sans, JetBrains Mono, **GFS Didot** para grego grande). Não há script de lint. O `sharp` processa imagens: `node scripts/recortes.js .`.

### Identidade (manter, salvo decisão nova)

- **Cores:**

  | | Fundo | Tinta | Bordô | Destaque | Dourado |
  |---|---|---|---|---|---|
  | Claro | `#F9F1E7` | `#1E1412` | `#6E1423` | `#6E1423` | `#A8833E` |
  | Escuro | `#17100F` | `#EDE4D3` | `#6E1423` | `#E08A96` | `#C9A55C` |

  O dourado é só decoração.
- **Tipos:**
  - Playfair Display nos títulos, com itálico nos numerais;
  - DM Sans no corpo;
  - JetBrains Mono em rótulos e no grego pequeno;
  - GFS Didot no grego grande.
- **Grego:** sempre `aria-hidden`, com a grafia conferida. Já em uso: ΠΙΝΑΚΟΘΗΚΗ, ΒΙΒΛΙΟΘΗΚΗ, ΤΑΞΙΣ, ΕΠΙΛΟΓΟΣ, ΜΟΥΣΕΙΟΝ, ΚΟΛΟΦΩΝ, ΚΙΟΚΡΑΝΟΝ, ΛΥΡΑ e ΧΑΛΕΠΑ ΤΑ ΚΑΛΑ.
- **Botão com dobra de folha** (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`): é assinatura minha.
- **Minhas regras:**
  - parágrafos de 600 a 700px;
  - grid de 8pt;
  - line-height 1:1 nos títulos e 1:1,5 no corpo;
  - tracking negativo nos títulos e positivo nos botões;
  - `:hover` e `:active` em tudo;
  - `prefers-reduced-motion` sempre respeitado.
- **Evitar:** estética de template SaaS, glassmorphism genérico, brilho excessivo, clichê grego ("restaurante grego"), cards muito arredondados e pílulas.
- **Idioma:** títulos de impacto em inglês; corpo, rótulos e navegação em português.
- **Princípio de produto:** um clique até a obra real; a informação extra mora junto da obra.

## 3. O que existe na `/templo` (Fases 1 a 5)

Entrada: `src/app/templo/page.tsx` e `templo.css`. Todo o CSS fica em `@layer components`, exceto o `scroll-padding`. Componentes em `src/components/templo/`.

- **Capítulos:**

  | Capítulo | Arquivo | O que tem |
  |---|---|---|
  | 00 Propileus | `Propileus` | título, chips 01–04, janela da obra em destaque, estela ΜΟΥΣΕΙΟΝ, saída escalonada pelo scroll (`data-exit`) |
  | 01 Pinacoteca | `PinacotecaMosaic` | mosaico: 1 obra grande e 2 empilhadas, até 6 |
  | 02 Biblioteca | `Atlas` | grade 2+3 de experimentos e índice das 10 categorias |
  | 03 Ordens | `Ordens` | título e texto, capitel em nanquim (`OrdensInk`), jornada em faixa de 4 colunas, stack |
  | 04 Epílogo | `Epilogo` | "EPILOGUE" vertical, Lyra à noite, faíscas (`EpilogoBlaze`) |
  | Colofão | `Colofao` | manifesto, 3 colunas de links, lema grego |

- **Mundo 3D** (`world/`): um canvas fixo atrás da página.
  - `sanctuary.ts`: escadarias, Propileus, alas (Pinacoteca acesa), stoa da Biblioteca, templo octástilo, braseiros, ciprestes, oliveiras, lua bordô, estrelas e brasas, tudo procedural.
  - `wordmark.ts`: KOLOSQUE em letras dentro da cena, com o capim na frente.
  - `engine.ts`: a câmera percorre uma curva com 6 tomadas guiadas pelo scroll (`data-cam` em cada seção).
  - `ink.ts`: passe final. **Noite = cena "pura"** (névoa, tochas, lua); **dia = "gravura"** (hachura de nanquim). `?mundo=gravura|comparar|pura` mostra um comparador para testes.
- **Primeiro plano** (`NearPlane.tsx`): recortes de gravura (`public/templo/*.webp`) fixos na base da tela, na frente do texto, um palco por capítulo. Entram escalonados e saem com desfoque. Ficam em negativo à noite.
- **Navbar** (`TemploNav`): o nome sobe e o grego entra no hover; véu em gradiente; some ao descer.
- **Também:** cursor em anel (`Cursor`), grão e vinheta, véus radiais por capítulo e trilho em coluna dórica (`temple/ChapterRail`).
- **Tema:** a `/templo` abre à noite se o visitante não escolheu; a escolha salva é respeitada em todo o site (`components/theme.tsx`).
- **Canvas UI** (`src/components/canvasui/`, licença MIT + Commons Clause no `LICENSE.md`): Ink Object e Blaze. Pela licença, eles não podem aparecer na Biblioteca como componentes meus.

## 4. O que existe na landing original (`/`) e pode ser resgatado

| Elemento | Arquivo | O que faz |
|---|---|---|
| Hero | `Hero.tsx`, `HeroBackground.tsx`, `src/data/hero.ts` | 5 gravuras a nanquim (`public/hero/scene-1..5.webp`) em crossfade com zoom lento; à noite, invertidas por CSS |
| Pórtico | `temple/Portico.tsx` | duas colunas jônicas em SVG com arquitrave |
| Faixa de stack | `StackStrip.tsx` | marquee em mono como estilobato |
| Cabeçalho de capítulo | `ChapterHead.tsx` | linha dourada que se desenha |
| Relíquias | `temple/Relics.tsx` | recortes atrás do conteúdo, com "tochas" à noite |
| Lyra | `temple/Lyra.tsx` | a constelação |
| Cards | `ExperimentCard` | prévias que reagem ao mouse |
| Laboratório | `/specimen` | testes de paleta, fontes e botões |

## 5. Armadilhas já aprendidas

- **Lenis:** o `scroll-padding-top` do CSS vale; não passe `offset` nas âncoras. Use `scrub: true`. Num clique dentro do menu, chame `lenis.start()` antes de fechar.
- **ScrollTrigger:** chame `refresh()` depois de criar os gatilhos.
- **SplitText:** `autoSplit: true` e devolva a animação no `onSplit`. A folga das máscaras agora é **0,22em** (a Playfair desce mais que 0,14em).
- **Saída da Hero:** a revelação e a saída nunca no mesmo elemento. A saída fica no wrapper (`data-exit`); o que está rente à base da Hero entra ao carregar (`data-reveal-now`).
- **Tailwind v4:** CSS fora de `@layer` vence os utilitários. Por isso o CSS da página fica em `@layer components`.
- **next-themes:** não remonte o provider com `key`, porque ele redesenha o `<script>` e o React acusa erro. O padrão por rota é aplicado em `RouteDefault`.
- **three 0.186:** `PCFSoftShadowMap` foi removido; use `PCFShadowMap`. Pré-compile os materiais com `renderer.compile`.
- **Painel do navegador:**
  - oculto, ele congela o rAF;
  - mesmo à vista, pode cair para ~2 fps se a janela do app estiver coberta ou sem foco (até numa página sem WebGL);
  - edições a quente repetidas no `engine.ts` empilham mundos e geram travadas falsas;
  - **meça desempenho só depois de recarregar, com o painel em primeiro plano.**
- **Imagens geradas:**
  - as do GPT vêm com alfa, mas com franjas coloridas nas bordas;
  - as do Gemini vêm com fundo branco, objetos fantasmas e linha de chão;
  - o `scripts/recortes.js` trata esses casos.

## 6. Pendências conhecidas

- **Dia na `/templo`:**
  - a Hero fica agitada atrás do texto;
  - o KOLOSQUE sai hachurado no modo gravura;
  - o disco bordô cai atrás do texto no celular.
- **Movimento reduzido:** conferir de ponta a ponta.
- **Composição das tomadas:**
  - a das Ordens perdeu o "de baixo para cima" para a lua sair de trás do texto;
  - a da Pinacoteca mostra pouco do mundo.
- **Blaze:** ficou sutil; decidir se fica.
- **Acabamento e publicação:**
  - dados reais da Pinacoteca (nome, link, ano, stack, uma frase, captura 1600×1000);
  - textos de portfólio e metadata;
  - créditos dos tutoriais do Scroll Story e do Jelly Spiral;
  - OG images;
  - deploy na Vercel;
  - atualizar o BRIEF;
  - trocar a `/` pela `/templo` e remover o que sobrar da original.

## 7. Minhas referências para esta rodada

As referências estão em **`images/referencias/`**. Essa pasta fica fora do git, porque `images/` está no `.gitignore`. Os nomes começam por:
- `gosto-` (o que gostei);
- `nao-gosto-` (o que não gostei);
- `inspiracao-` (sites ou ideias externas).

As anotações estão em **`images/referencias/notas.md`**: para cada arquivo, o que gostei ou não gostei, com o horário nos vídeos (ex.: `0:12 gosto do jeito que o título entra`).

**Como trabalhar com elas, economizando tokens:**
1. Leia **primeiro o `notas.md`** e só depois abra os arquivos que as notas citam.
2. **Imagens:** abra cada uma uma vez. Se precisar de detalhe, use recortes ampliados, não a imagem inteira de novo.
3. **Vídeos:** não dá para assistir direto. Extraia quadros com o ffmpeg que vem no pacote `imageio-ffmpeg` (instale numa pasta temporária, fora do projeto):
   - folhas de contato de 9 quadros em baixa resolução, com o tempo escrito em cada quadro;
   - quadros em resolução cheia só nos horários citados nas notas.
4. Monte uma lista do que fica, do que muda e do que volta da `/`. Me mostre, tire dúvidas e só então proponha o plano em fases pequenas.

## 8. Como começar

1. Leia este prompt, o `BRIEF.md` e o `images/referencias/notas.md`. Rode `git status` e `npm run build`.
2. Analise as referências como descrito na seção 7.
3. Devolva:
   - um diagnóstico: o que está funcionando, o que não está e por quê;
   - uma proposta de direção, com opções onde houver escolha estética;
   - as perguntas que faltam.
4. **Espere minhas respostas antes de codar.** Depois, fases pequenas e verificáveis, cada uma terminando com build ok, conferência no navegador e uma proposta de commit.
