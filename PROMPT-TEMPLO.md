# Prompt de continuação: landing cinematográfica do Kolosque UI

Cole este texto inteiro no início do novo chat.

---

Oi! Vamos continuar o **Kolosque UI**, meu portfólio de design e front-end. O projeto já está bem andado; abaixo está todo o contexto, as decisões tomadas, o que existe no código e o que quero agora. Leia tudo antes de agir.

## 1. Quem sou e como gosto de trabalhar

- Sou o Leandro, estudante de Ciência da Computação. Escreva comigo em **português**.
- **Converse antes de codar decisões de design:** estrutura primeiro, visual depois. Quando houver uma escolha estética importante, me mostre opções (com prévia, se possível) e recomende uma.
- **Seja sincero e crítico.** Prefiro ouvir "isso não vai funcionar por X" a receber algo genérico.
- **Commits:** eu mesmo faço. Mostre o diff e proponha a mensagem; nunca adicione `Co-Authored-By` nem outra atribuição. Formato: conventional commits em português, uma linha (`feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `chore: ...`).
- **Trabalhe direto na `main`**, sem worktree nem branch, mesmo que alguma ferramenta sugira.
- Antes de dizer que algo está pronto: `npm run build` sem erros e conferência no navegador.

## 2. O projeto

- **Repositório:** https://github.com/Leandro-Kolosque/kolosque-ui (público, `main`).
- **O que é:** um **Mouseion**, o templo das Musas que guardava a Biblioteca de Alexandria. Um portfólio que guarda dois acervos:
  - **Pinacoteca:** landing pages e sites que desenhei e construí (tenho 5 ou 6 prontas; a seção precisa crescer sem trabalho).
  - **Biblioteca:** experimentos e componentes de UI (rota `/library`, com busca e filtros na URL).
- **Leia o `BRIEF.md` na raiz:** é o documento de design vivo, com conceito, princípios, capítulos, sistema de colunas, movimento, dia e noite, imagens, verificação e fases. Atenção: ele descreve a landing **atual** (2.5D, dia como padrão). Onde ele conflitar com este prompt, **este prompt vale**; atualize o brief quando a nova versão for aprovada.

### Stack

Next.js 16.4.6 (App Router, `params` assíncronos), React 19.3, TypeScript 7, Tailwind v4 (CSS-first, sem `tailwind.config`; tokens em `src/app/globals.css`), GSAP 3.15 (com ScrollTrigger e **SplitText**, que agora é gratuito e já vem no pacote) + `@gsap/react`, Lenis, three 0.186 (direto, sem R3F), next-themes, lucide-react, react-icons. Fontes via Fontsource. Não há script de lint. Existe `next.config.ts` só com `experimental.agentUpgrade: "security"`. O `sharp` vem com o Next e serve para processar imagens por script (use `NODE_PATH=<projeto>/node_modules` se o script estiver fora do projeto).

### Identidade visual (MANTER)

- **Cores** (tokens no `globals.css`; `primary` = preenchimento, `accent` = texto/foco de destaque, `gold` = só decoração):

  | Token | Claro | Escuro |
  |---|---|---|
  | bg | `#F9F1E7` (marfim, = papel das gravuras) | `#17100F` |
  | surface | `#FBF8F2` | `#211715` |
  | ink | `#1E1412` | `#EDE4D3` |
  | muted | `#6B5D57` | `#A89A8C` |
  | line | `#E3D9CB` | `#3A2B27` |
  | primary / hover | `#6E1423` / `#8E1B2E` | `#6E1423` / `#8A1C2E` |
  | accent | `#6E1423` | `#E08A96` (rubi claro; bordô não tem contraste no escuro) |
  | gold | `#A8833E` (só decoração; 3,1:1 no marfim) | `#C9A55C` |

- **Tipografia:** Playfair Display (títulos, com itálico para numerais como "01"), DM Sans (corpo), JetBrains Mono (rótulos, fichas, metadados e **grego pequeno**: ela tem caracteres gregos). A Playfair **não tem grego**; para grego grande, testar a **GFS Didot** (didone com grego) na `/specimen`.
- **Letras gregas:** gostei muito e quero manter. Hoje aparecem nos cabeçalhos de capítulo (ΠΙΝΑΚΟΘΗΚΗ, ΒΙΒΛΙΟΘΗΚΗ, ΤΑΞΙΣ, ΕΠΙΛΟΓΟΣ), na constelação (ΛΥΡΑ) e no brief (ΠΡΟΠΥΛΑΙΑ, ΜΟΥΣΕΙΟΝ, ΚΟΛΟΦΩΝ). Sempre `aria-hidden`. Revise a grafia de qualquer palavra grega nova.
- **Botão com dobra de folha** (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm` em `@layer components`): retângulo com borda fina e uma dobra no canto superior direito que cresce no hover. É uma assinatura minha, mantenha.
- **Minhas regras de design:** parágrafos de 600 a 700px, grid de 8pt (seções com `py-26`), line-height 1:1 nos títulos e 1:1,5 no corpo, letter-spacing negativo nos títulos e positivo nos botões, `:hover` e `:active` em tudo, `prefers-reduced-motion` sempre respeitado. Posso aceitar desvios se você avisar e explicar. Evitar estética de template SaaS, glassmorphism genérico, brilho excessivo e clichês gregos ("restaurante grego": meandro em toda borda, louros por toda parte).
- **Idioma do site:** títulos de impacto em inglês; corpo, rótulos e navegação em português.

### O que existe hoje na landing (`src/app/page.tsx`)

Capítulos: **00 Propileus** (Hero) → **01 Pinacoteca** → **02 Biblioteca** (Featured + Categories) → **03 Ordens** (About + Journey) → **04 Epílogo** (Cta) → Colofão (Footer). Gostei de como as seções estão apresentadas; o conteúdo continua.

- **Hero:** sticky; 5 gravuras a nanquim (2000×1116 WebP em `public/hero/scene-1..5.webp`: pedestal com toggle e botão, lajes dobrando, coluna quebrada, esfera armilar, caderno de wireframes) em crossfade com zoom lento (timeline GSAP em `HeroBackground.tsx`, posições em `src/data/hero.ts`). Pórtico de duas colunas jônicas em SVG (`temple/Portico.tsx`) com arquitrave; faixa de stack em mono (`StackStrip.tsx`) como estilobato. **À noite** a gravura é invertida por CSS (`invert(1) hue-rotate(180deg) brightness(.82) saturate(.7) sepia(.15)`) e uma camada `mix-blend-mode: lighten` com a cor do fundo leva o papel invertido exatamente a `#17100F`.
- **`ChapterHead`:** "01 — Pinacoteca", linha dourada que se desenha, nome grego à direita.
- **Pinacoteca** (`Pinacoteca.tsx` + `src/data/works.ts`): tipo `Work`, ordenação automática (destacados, depois ano), numeração automática, rascunhos (`draft`) com moldura "Em preparação", limite de 6 na landing (`LANDING_LIMIT`). Hoje só há 3 rascunhos: **os dados reais das landing pages ainda faltam**.
- **Trilho de capítulos** (`temple/ChapterRail.tsx`, ≥1280px): coluna dórica fixa à esquerda; as caneluras douram com o scroll; juntas clicáveis por capítulo. No mobile, linha dourada sob a navbar. Lógica compartilhada em `temple/useChapterScroll.ts` (lê seções com `data-chapter`/`data-title`).
- **Relíquias** (`temple/Relics.tsx`, ≥1024px): recortes de gravura com transparência (`public/temple/`: oliveira, lira, fragmentos, pergaminho, tambor, capitel) fixos nos cantos inferiores por capítulo, atrás do conteúdo, entrando e saindo com desfoque. À noite, "tochas" (luz dourada trêmula) atrás delas. As versões em `public/temple/` são reduzidas (até 900px; tambor e lira com 420px); se precisar delas maiores, peça os originais em resolução cheia.
- **Lyra** (`temple/Lyra.tsx`): constelação real da lira no Epílogo, só à noite.
- **Revelações** (`Reveals.tsx`, montado no layout): `data-reveal="words|up|fade|draw"`; SplitText com máscara por linha; o CSS esconde `[data-reveal]` com `@media (scripting: enabled)`; passagem da Hero (o texto sobe e some).
- **Outras rotas:** `/library` (acervo com filtros na URL), `/experiments/[slug]` (demos em tela cheia: Scroll Story e Jelly Spiral em Three.js), `/specimen` (laboratório de paleta, fontes e botões; fora do menu).
- **Princípio de produto:** um clique até a obra real, sempre. A informação extra mora junto da obra, nunca antes dela.

## 3. O que quero agora

Apesar de gostar das cores, **a landing não ficou cinematográfica como o Kage** (https://mengto.github.io/kage/). Quero **refazer a landing replicando a experiência do Kage, adaptada à nossa temática** (templo grego, Mouseion), **mantendo cores, tipografias, as letras gregas e o conteúdo** que mostramos hoje. E quero usar o **Canvas UI** para componentes criativos que fujam do padrão.

**Quero testar essa versão sem perder a atual.** Monte a nova landing numa **rota separada** (sugestão: `/templo`) até eu aprovar; só então ela substitui a `/`.

### 3.1 Referências, em ordem de peso

O que torna o Kage cinematográfico é a **composição de cada tomada e o ritmo do scroll**. Isso não está escrito em lugar nenhum: precisa ser visto. Use as referências nesta ordem:

1. **Minha gravação de tela (referência principal de ritmo).** Vou anexar um vídeo de 30 a 60 segundos percorrendo o Kage, com comentários sobre o que gosto em cada momento. Se eu ainda não tiver anexado, **peça antes de propor a estrutura**. Analise momento a momento: o que entra, de onde, em quanto tempo, com que easing, o que fica fixo e o que sai.
2. **O site ao vivo: https://mengto.github.io/kage/ (referência principal de composição).** Abra no navegador e percorra seção por seção em ≈1440×900 e ≈390×844. Meça de verdade, lendo os estilos calculados no DOM (tamanhos de fonte, entrelinha, espaçamentos, larguras, posições, opacidades), não só olhando capturas. Registre, para cada tomada: enquadramento da câmera, onde fica o título, o que está em primeiro plano, o que reage ao scroll.
   - **Atenção ao painel do navegador:** se ele estiver oculto, o navegador congela `requestAnimationFrame`, transições CSS e até eventos de `scroll`, e o Kage não anima. Confira com a ferramenta de abas e, se estiver oculto, **me peça para mostrar o painel** antes de avaliar movimento. As capturas saem em resolução baixa: use zoom e leitura de estilos para os detalhes.
3. **O código-fonte, como estudo: https://github.com/MengTo/kage.** Clone numa pasta temporária fora do projeto e leia para entender a técnica: o caminho da câmera e como o scroll o dirige, os tempos e easings, o pós-processamento, como os recortes são fixados e liberados, o preloader, o cursor. **Pode ler e aprender; não pode copiar** (ver 3.2).
4. **O `PROMPT.md` do Kage (só intenção).** É o briefing que o autor usou para gerar o site. Serve para entender a intenção e o checklist de qualidade; não descreve o visual e não basta para replicar.

### 3.2 Limite importante sobre o Kage

O README do Kage diz que **não há licença de reuso do código nem das artes** ("No license is currently granted for reuse or redistribution"); o próprio autor oferece o `PROMPT.md` para "reconstruir ou reinterpretar". Então:

- **Replique a experiência, a estrutura, o ritmo e a linguagem**, escrevendo **nosso próprio código** e usando **nossas próprias imagens**.
- **Não copie** trechos do `index.html` do Kage, shaders, CSS, SVGs ou imagens dele.
- Mantenha a atribuição de inspiração que já está no `BRIEF.md`.

### 3.3 Anatomia do Kage (resumo do que já levantei)

Use como ponto de partida e confirme tudo nas referências acima. O site é um `index.html` de ~4.800 linhas, sem framework, com Three.js r149:

1. **Mundo 3D de fundo:** canvas Three.js fixo em tela cheia; templo, torii, escadas, lanternas, lua, terreno, árvores, neblina, chuva, folhas e brasas gerados por código. **Uma única câmera percorre um caminho contínuo guiado pelo scroll**: cada seção é um novo enquadramento ("tomada"), não uma troca de cena.
2. **Pós-processamento contido:** bloom leve, grão de filme, vinheta, névoa de profundidade, luz quente de lanterna contra luz fria da lua, e uma lua vermelha grande.
3. **Camada editorial por cima:**
   - navbar com marca (ícone + nome + subtítulo em caixa alta pequena) e links com texto alternativo em japonês;
   - hero com eyebrow "Chapter 00 — The Hidden Gate", título enorme em caixa alta revelado linha por linha (máscara), subtítulo, "Scroll to enter" com trilho animado e quatro "chips" de capítulo numerados (01–04) com título e frase;
   - uma "peek card" com mini-prévia ao vivo do mundo e botão de play centralizado no quadro;
   - palavra gigante ao fundo ("KAGE") e texto vertical em japonês na lateral;
   - cabeçalhos de seção "01 — The Sanmon" + linha fina + palavra em japonês;
   - grade título + texto + link com seta; faixa de números (05 Chapters / 92 Minutes / 1611 / ∞);
   - cards de imagem cinematográfica com rótulo e meta ("01 / 03");
   - lista de "lições" numeradas com título, termo em japonês, frase e duração;
   - fechamento "Afterlight" com CTA; rodapé-colofão em colunas.
4. **Recortes em primeiro plano:** WebP com transparência (grama, galhos, lanternas, muros, ruínas) entram pela base e laterais, ficam fixos enquanto a seção está ativa e saem com fade + desfoque na passagem.
5. **Movimento:** títulos palavra por palavra, elementos de apoio um a um, transições lentas e precisas, parallax sutil, interpolação suave da câmera; navegação, trilho de capítulos, cards e recortes reagem à seção ativa.
6. **Extras:** preloader ("Raising the mountain temple" com %), cursor próprio só em ponteiro fino, movimento reduzido preservando toda a leitura.
7. **Qualidade (do `PROMPT.md`):** assets locais, sem trackers, sem glassmorphism genérico nem brilho excessivo; verificar em desktop e ~390×844, procurar 404s, ler o console e testar uma navegação completa antes de entregar.

### 3.4 Adaptação para o nosso templo (proposta inicial, discuta comigo)

| Kage | Kolosque (Mouseion) |
|---|---|
| Templo japonês noturno, torii, lanternas | Templo grego / Mouseion: colunata, propileus, escadaria, estátuas ou pedestais, braseiros/tochas, oliveiras |
| Lua vermelha | Lua (ou sol poente) no nosso bordô/rubi; dourado das tochas |
| Japonês vertical e nos links | **Grego** vertical e nos links (ΠΙΝΑΚΟΘΗΚΗ, ΒΙΒΛΙΟΘΗΚΗ, ΤΑΞΙΣ, ΕΠΙΛΟΓΟΣ, ΜΟΥΣΕΙΟΝ) |
| Chapter 00–04 (Sanmon, Gardens, Craft, Afterlight) | 00 Propileus · 01 Pinacoteca · 02 Biblioteca · 03 Ordens · 04 Epílogo |
| Cards de imagem dos jardins | Cards da **Pinacoteca** (previews das landing pages; clique abre a página publicada) |
| Lista de lições numeradas | **Biblioteca**: experimentos numerados, ou **Ordens**: jornada/processo |
| Faixa de números | números do acervo (landing pages, experimentos, categorias, anos estudando) |
| Recortes de grama/galhos | nossas **relíquias** (`public/temple/`) e novos recortes que eu gerar |
| Palavra gigante "KAGE" | "KOLOSQUE" (o nome lembra o *Colosso* de Rodes) |

**Decisões que precisamos tomar antes de codar (pergunte):**

1. **Mundo de fundo:**
   - **(a) Three.js procedural**, como o Kage: o mais fiel e o mais ousado. Já discutimos que um templo grego em 3D **de dia** tende a parecer jogo low-poly e brigar com as gravuras; à **noite**, com neblina, luz de tocha e lua, funciona muito melhor.
   - **(b) 2.5D**: câmera simulada por camadas das nossas gravuras e recortes com parallax profundo.
   - **(c) Híbrido**: 3D só no hero/propileus e 2.5D no resto.

   Recomende uma, com prós e contras de peso, performance e mobile.
2. **Tema da versão cinematográfica:** o Kage é noturno. Ela abre **à noite** (tokens escuros) com o dia como variante, ou segue o tema do sistema? A Hero noturna invertida que já temos pode ajudar.
3. **Preloader:** o Kage leva vários segundos carregando, e isso contradiz meu princípio de "um clique até a obra". Se houver preloader, ele não pode bloquear o conteúdo nem a navegação.
4. **Novas imagens:** liste exatamente o que precisa ser gerado (cenas para os cards, recortes, texturas) e escreva os prompts no estilo das gravuras atuais (nanquim com hachura, papel marfim, bordô e dourado; recortes com fundo transparente). Eu gero no Gemini/GPT e coloco em `images/` (ignorada pelo git); você processa com `sharp` para `public/`.

### 3.5 Canvas UI

- **O que é:** https://canvasui.dev/components, do mesmo autor do React Bits. Efeitos criativos em canvas, framework-agnósticos, com builds para React 19 (WebGL padrão, WebGPU opcional).
- **Instalação:** `npx shadcn@latest add @canvas-ui/<componente>-react`, que coloca o arquivo em `components/canvasui/`. **O projeto ainda não tem `components.json`**, então seria preciso rodar `npx shadcn@latest init` antes (confira se combina com Tailwind v4 CSS-first e com o alias `@/` do `tsconfig`). Alternativa: copiar o código da página do componente.
- **Dois grupos:**
  - **Live HTML:** desenha o HTML real dentro do canvas usando a API *html-in-canvas*, que só existe no **Chrome 157+**. Nos outros navegadores há fallback automático (o conteúdo aparece como HTML comum). No **Android** a captura fica desabilitada. Imagens precisam vir da mesma origem (ou CORS).
  - **Universal:** renderiza a própria cena; funciona em qualquer navegador moderno.
- **Candidatos que combinam com o templo** (avalie e proponha no máximo 2 ou 3, cada um com propósito narrativo):
  - **Ink Object** (Universal): um modelo 3D, SVG ou imagem impresso em traços de tinta. Combina diretamente com a linguagem de gravura (ex.: um capitel, uma estátua ou a coluna girando em nanquim).
  - **Topographic Object**, **Particle Object**, **Wireframe Object** (Universal): alternativas para uma peça central.
  - **Clouds** (Live HTML): névoa que se abre com o cursor; pode ser a entrada do templo.
  - **Blaze** (Live HTML): faíscas e calor subindo, como braseiros/tochas.
  - **Glyph Rain** ou **Decrypt Reveal** (Live HTML): se der para usar **letras gregas** como glifos, vira a assinatura do site.
  - **Particle Reveal**, **Peel**, **Canvas** (Live HTML): transições e texturas de papel/pintura.
- **Cuidados:** confira a licença de cada componente antes de usar; teste a performance junto com o mundo de fundo (dois canvas pesados podem derrubar o FPS); sempre fallback limpo e movimento reduzido.

### 3.6 Conteúdo que deve continuar

- **Hero:** "Nº 00 · Arquivo pessoal de UI/UX" (ajustar para portfólio), título "A playground for interfaces.", CTA para a Pinacoteca/Biblioteca, stack (Next.js, React, TypeScript, Tailwind, GSAP, Three.js, Motion).
- **Pinacoteca:** `src/data/works.ts` (fonte única; capturas em `public/works/<id>.webp` 1600×1000; vídeo opcional no hover; nunca iframe).
- **Biblioteca:** experimentos de `src/data/components.ts` (o `featured` decide a landing), categorias de `src/data/categories.ts`, acesso à `/library`.
- **Ordens:** "A personal archive of digital experiences." + "Um diário de aprendizado, escrito em código." e os quatro pontos da jornada.
- **Epílogo:** "Veja o que já saiu do papel." + Abrir a biblioteca / Ver no GitHub.
- **Colofão:** © 2026 Leandro Kolosque · Feito com Next.js, React e Tailwind.

## 4. O que já aprendemos (armadilhas)

- **Lenis + âncoras:** o `scroll-padding-top: 64px` do CSS já é respeitado pelo Lenis; **não** passe `offset` nas `anchors` do Lenis (desconta duas vezes). Use `scrub: true` no ScrollTrigger (não `scrub: 1`); sem `scroll-behavior: smooth`; áreas com scroll próprio precisam de `data-lenis-prevent`.
- **ScrollTrigger:** só mede tudo no evento `load` da janela; chame `ScrollTrigger.refresh()` depois de criar os gatilhos para revelar o que já está na tela.
- **SplitText:** troca os nós de texto dos títulos; se o React tentar atualizar esse texto, quebra (no dev aparece `removeChild` ao editar com a página aberta; reload resolve). Use `autoSplit: true` e devolva a animação no `onSplit`; não espere `document.fonts.ready`. Espaço antes de `<br>` para o `aria-label` não juntar palavras. Folga de `0.14em` nas máscaras por causa das descendentes.
- **Esconder antes da animação:** use `@media (scripting: enabled)`. O `next/script` com `beforeInteractive` roda tarde demais no App Router (faz piscar) e uma `<script>` crua gera aviso do React.
- **Painel do navegador oculto:** congela `requestAnimationFrame` (o relógio do GSAP), transições CSS e até eventos de `scroll`. Prefira pedir para eu mostrar o painel. Se precisar testar assim mesmo, gire o ticker manualmente (`gsap.ticker.tick()`, expondo o gsap temporariamente) e desligue transições com um estilo injetado (inclusive em `::before`/`::after`); remova qualquer código de depuração depois. A primeira captura após recarregar costuma sair sem as imagens pintadas.
- **Tailwind v4:** a variante `dark:` é customizada (`@custom-variant dark (&:where(.dark, .dark *))`) para seguir a classe do next-themes. Classes de componente ficam em `@layer components` para utilitários poderem sobrescrever.
- **Next 16:** `<Image quality>` só aceita valores de `images.qualities`; a Hero usa `unoptimized`. Canvas/WebGL só no cliente (`next/dynamic` com `ssr: false`).
- **`data-reveal`:** só em conteúdo que não muda depois de montado (a `/library` filtra cards, então eles não podem ter `data-reveal`).
- **Navbar:** links completos a partir de 1024px, busca a partir de 1280px, menu hambúrguer abaixo disso.
- **Imagens geradas:** confira transparência, cor do papel (precisa bater com `#F9F1E7`), artefatos (objetos fantasmas, letras falsas) e peso antes de usar.

## 5. Pendências que continuam valendo

- Dados reais da Pinacoteca (nome, link, ano, stack, uma frase, código opcional e captura de cada landing page).
- Textos de portfólio (a Hero e a metadata ainda falam só de "experimentos").
- Acabamento: cards muito arredondados, pílulas em filtros/etiquetas/troca de tema, pontos de status verde e âmbar.
- Créditos dos tutoriais do Scroll Story e do Jelly Spiral (campo `source` + linha de crédito e link "Código" nas demos).
- Movimento reduzido no Scroll Story; migrar o login-blur do repositório antigo; OG images; deploy na Vercel.

## 6. Como começar

1. **Referências primeiro (seção 3.1):** assista à minha gravação (se não estiver anexada, peça), abra o Kage no navegador e percorra cada seção medindo composição e tempos, e leia o código dele como estudo. Me devolva uma **decupagem**: uma linha por tomada, com enquadramento, elementos, entradas e saídas, tempos e o que reage ao scroll.
2. Leia o `BRIEF.md`, rode `git log --oneline -5`, veja a árvore de arquivos e rode `npm run build`. Me conte o que viu, inclusive o que destoar deste prompt.
3. Proponha a estrutura da `/templo` a partir da decupagem: o caminho da câmera (uma tomada por capítulo), o que acontece em cada seção, quais componentes do Canvas UI entram e onde, e a lista de imagens a gerar com os prompts.
4. Me faça as perguntas da seção 3.4 e **espere minhas respostas antes de codar**.
5. Depois, trabalhe em fases pequenas e verificáveis, cada uma terminando em build ok, conferência no navegador (≈1440×900 e ≈390×844, claro, escuro e movimento reduzido) e uma proposta de commit para eu fazer.
