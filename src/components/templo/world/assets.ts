// Imagens do diorama já processadas, em public/templo/diorama/<nome>.webp, com o tamanho de cada uma
// (a proporção define a largura do plano antes de a imagem carregar). Enquanto um nome não está aqui,
// a cena usa o placeholder desenhado em paint.ts. O script que processa as gravuras geradas vai escrever
// esta lista (node scripts/diorama.js .).
export const DIORAMA: Record<string, { w: number; h: number }> = {
  "muro": { w: 1774, h: 749 },
  "musa-direita": { w: 416, h: 1498 },
  "musa-esquerda": { w: 426, h: 1506 },
  "portal": { w: 1620, h: 2400 },
};

// Recortes de gravura que já existem no projeto (eram do primeiro plano antigo) e servem de provisório
// para peças pequenas: braseiros, acantos, ruínas, pergaminhos.
export const RECORTES = {
  tripode: { w: 374, h: 900 },
  acantos: { w: 1600, h: 545 },
  blocos: { w: 1100, h: 538 },
  fragmentos: { w: 900, h: 275 },
  tambor: { w: 440, h: 550 },
  capitel: { w: 880, h: 490 },
  pergaminho: { w: 800, h: 409 },
  lira: { w: 440, h: 673 },
  "oliveira-arvore": { w: 950, h: 655 },
} as const;
export type Recorte = keyof typeof RECORTES;
