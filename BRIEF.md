# Brief de construção

Documento vivo que orienta o design e o código do Kolosque UI. Segue o formato de um brief de
construção: o que a experiência deve ser, como o layout e o movimento se comportam, e como
verificar a qualidade antes de publicar.

## Conceito

O Kolosque UI é um **Mouseion**: o templo das Musas que abrigava a Biblioteca de Alexandria.
É um portfólio de design e front-end que guarda dois acervos:

- a **Pinacoteca**, com as landing pages e sites que desenhei e construí;
- a **Biblioteca**, com os experimentos e componentes de UI.

O tom é grandioso, clássico e editorial: mármore ao sol, gravura a nanquim, bordô e um pouco de
ouro. Deve ser ousado sem deixar de ser legível, e parecer um livro de arte que se percorre,
não uma landing page de produto.

## Princípios

- **Um clique até a obra.** A grandiosidade mora na entrada e nas transições, nunca como barreira.
  Nada de preloader bloqueando o conteúdo; cada card abre a obra real.
- **Arquitetura como estrutura, ornamento raro.** Colunas dão ritmo e organizam a página.
  Evitar o "restaurante grego": sem meandro em toda borda, sem louros por toda parte, dourado só
  em linhas finas e detalhes.
- **Reinterpretar, não copiar.** A referência (Kage) inspira a gramática: capítulos, tipografia
  editorial, camadas por seção. O código e as imagens são nossos.
- **Regras de design do projeto:** parágrafos de 600 a 700px, grid de 8pt (seções com `py-26`),
  line-height 1:1 nos títulos e 1:1,5 no corpo, letter-spacing negativo nos títulos e positivo
  nos botões, `:hover` e `:active` em tudo, respeito a `prefers-reduced-motion`.
- **Idioma:** títulos de impacto em inglês; corpo, rótulos e navegação em português.

## Capítulos

| Nº | Capítulo   | Grego      | Âncora         | Conteúdo |
|----|------------|------------|----------------|----------|
| 00 | Propileus  | ΠΡΟΠΥΛΑΙΑ  | `#top`         | Entrada monumental: gravuras em crossfade, título, CTA, faixa de stack. |
| 01 | Pinacoteca | ΠΙΝΑΚΟΘΗΚΗ | `#pinacoteca`  | Landing pages e sites, com preview. |
| 02 | Biblioteca | ΒΙΒΛΙΟΘΗΚΗ | `#biblioteca`  | Experimentos em destaque, categorias e acesso à `/library`. |
| 03 | Ordens     | ΤΑΞΙΣ      | `#ordens`      | Quem sou, processo e jornada. As ordens gregas como sistema de design. |
| 04 | Epílogo    | ΕΠΙΛΟΓΟΣ   | `#contato`     | Convite final: contato e GitHub. |
| —  | Colofão    | ΚΟΛΟΦΩΝ    | rodapé         | Créditos, stack e ano. |

Os nomes vêm da arquitetura grega: os Propileus são a entrada da Acrópole, e a Pinacoteca era a
galeria de pinturas que ficava ali. Τάξις é o termo grego que Vitrúvio traduz como *ordinatio*,
a ordenação das partes de um edifício.

Rotas: `/library` (acervo completo de experimentos), `/experiments/[slug]` (demo em tela cheia),
`/specimen` (laboratório de identidade, fora do menu). Uma rota `/pinacoteca` entra quando houver
mais trabalhos do que cabem na landing (ver "Pinacoteca").

## Layout

- Cada capítulo abre com um cabeçalho: número e nome em mono, uma linha dourada fina e o nome
  grego à direita (`ChapterHead`).
- Títulos grandes alinhados à esquerda, rótulos técnicos em mono, números de capítulo e muito
  espaço negativo.
- Grego decorativo na vertical (no hero e em capítulos-chave), sempre `aria-hidden`.
- A vitrine (landing) pode ser assimétrica e editorial. A ferramenta (`/library`, filtros, grid)
  continua funcional e previsível: ali a identidade entra pela tipografia, cor e detalhes.

## Sistema de colunas

As colunas são a assinatura do site e têm uma função, não são moldura fixa.

1. **Pórtico (hero).** Duas colunas emolduram o hero como os Propileus. Só a partir de 1024px.
2. **Trilho de capítulos.** Depois do hero, uma coluna fina fica fixa na lateral esquerda
   (a partir de 1280px). As caneluras do fuste se enchem de dourado conforme o scroll; cada
   capítulo é um tambor marcado no fuste, clicável como navegação. Capitel no topo, sob a navbar.
3. **Grid canelado.** As linhas verticais do grid de 12 colunas aparecem como textura sutil em
   capítulos-chave (por exemplo, Ordens): colunata e grid são o mesmo raciocínio.

No mobile, o trilho vira uma linha canelada fina sob a navbar, indicando o progresso.
As colunas são desenhadas em SVG próprio (nítido, leve e sensível ao tema), com êntase leve.

## Movimento

- Títulos revelados palavra por palavra (GSAP SplitText) e elementos de apoio um a um.
- Recortes de gravura entram por baixo ou pelas laterais, ficam fixos enquanto o capítulo está
  ativo e saem com fade e desfoque na passagem para o próximo.
- Parallax sutil por camada. As gravuras do hero continuam em crossfade com zoom lento.
- Scroll suave com Lenis sincronizado ao ScrollTrigger (`scrub: true`).
- **Movimento reduzido:** a leitura fica completa, sem pin nem parallax; revelações vão direto
  ao estado final.
- Nenhum movimento sem propósito narrativo.

## Dia e noite

- **Tema claro:** o templo ao sol. Papel marfim, nanquim, bordô.
- **Tema escuro:** o mesmo templo à noite. Quase-preto quente, dourado mais presente, bordô como
  superfície. O que só existe à noite:
  - **Hero em negativo:** as gravuras são invertidas por CSS (traço claro sobre escuro, a mancha
    bordô vira rosa antigo) e uma camada em `mix-blend-mode: lighten` leva o papel invertido
    exatamente à cor do fundo. Se um dia houver gravuras noturnas próprias, elas substituem o filtro.
  - **Tochas:** luz quente e trêmula atrás das relíquias de cada capítulo.
  - **Dourado iluminado:** brilho nas caneluras do trilho e linhas de capítulo em dourado pleno.
  - **Lyra:** a constelação da lira das Musas, com as posições reais das estrelas, no Epílogo.
- Os recortes das relíquias já vêm com transparência e preenchimento de mármore, então funcionam
  nos dois temas sem tratamento.

## Imagens

- **Cenas do hero:** cinco gravuras 2000×1116 em WebP, até ~200 KB cada (`public/hero/`).
- **Relíquias:** capitel jônico, tambor de coluna, ramo de oliveira, fragmentos, pergaminho e lira
  (`public/temple/`), WebP com transparência, margens cortadas e até ~150 KB cada. Os originais
  ficam em `images/`, fora do git. Cada capítulo usa duas (ver `temple/Relics.tsx`).
- **Previews da Pinacoteca:** ver abaixo.

## Pinacoteca

Feita para crescer sem trabalho:

- **Fonte única:** `src/data/works.ts`. Para adicionar uma landing page:
  1. salvar a captura em `public/works/<id>.webp` (1600×1000, a primeira dobra, até ~180 KB);
  2. opcional: um loop `public/works/<id>.mp4` de 6 a 8 s, mudo, até ~1,5 MB, que toca no hover;
  3. acrescentar um objeto ao array `works`.
- **Ordem:** destacados primeiro, depois do mais recente ao mais antigo. A numeração (Nº 01…)
  sai da ordem, não precisa ser mantida à mão.
- **Clique:** o card abre a página publicada em nova aba. O código, quando houver, é um link
  secundário.
- **Rascunhos:** `draft: true` mostra uma moldura "Em preparação", sem link. Nunca apresentar
  como pronto um trabalho que não existe.
- **Escala:** a landing mostra até 6 trabalhos. Passando disso, ela mostra os destacados e a
  rota `/pinacoteca` lista todos, reaproveitando a busca e os filtros da `/library`.
- Previews são imagem ou vídeo, nunca iframe (pesado e bloqueado por muitos sites).

## Tipografia e cor

- **Playfair Display** nos títulos, **DM Sans** no corpo, **JetBrains Mono** em rótulos, fichas e
  grego pequeno (ela tem caracteres gregos).
- **Grego grande:** a Playfair não tem grego. Testar a GFS Didot (didone com grego) na `/specimen`.
- Paleta marfim, bordô e dourado nos tokens do `globals.css`. As opções testadas ficam na
  `/specimen`. Um ajuste no tom do vermelho está em aberto.

## Interação e qualidade

- Navegação por âncora funcionando, menu mobile, landmarks semânticos e rótulos acessíveis.
  Grego e ornamentos ficam `aria-hidden`.
- Sem preloader. Imagens fora do hero com `loading="lazy"`. WebGL só nas rotas de experimento
  (e, no futuro, num trecho isolado).
- Evitar: glassmorphism genérico, brilho excessivo, estética de template SaaS, clichês gregos e
  movimento decorativo sem propósito.

## Verificação

Antes de cada commit visual:

- desktop por volta de 1440×900 e celular por volta de 390×844;
- tema claro, tema escuro e `prefers-reduced-motion`;
- `npm run build` sem erros, console limpo, nenhum 404 de imagem ou fonte;
- uma navegação completa: hero → cada capítulo pela navegação → um card → volta.

## Fases

1. ✓ **Estrutura:** este brief, o modelo de dados dos trabalhos, os capítulos na landing e a
   navegação.
2. ✓ **Sistema de colunas:** pórtico, trilho de capítulos e cabeçalhos de capítulo.
3. **Pinacoteca de verdade:** dados reais, previews e o card definitivo. *Aguardando os dados.*
4. ✓ **Movimento:** revelações, relíquias por capítulo e a passagem da Hero. *Parallax por camada
   ainda não feito.*
5. ✓ **Templo à noite:** Hero em negativo, tochas, dourado iluminado e a constelação de Lyra.
6. **Futuro:** um momento em WebGL (o templo em 3D), ousado e isolado num trecho.

## Referência e atribuição

A linguagem de capítulos, camadas por seção e tipografia editorial foi inspirada no
[Kage](https://github.com/MengTo/kage), de Meng To. Nenhum código ou imagem do Kage foi copiado:
o projeto não concede licença de reuso, e esta é uma reinterpretação própria.
