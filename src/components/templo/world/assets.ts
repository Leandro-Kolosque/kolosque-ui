// Imagens do diorama já processadas, em public/templo/diorama/<nome>.webp, com o tamanho de cada uma
// (a proporção define a largura do plano antes de a imagem carregar). Enquanto um nome não está aqui,
// a cena usa o placeholder desenhado em paint.ts. O script que processa as gravuras geradas vai escrever
// esta lista (node scripts/diorama.js .).
export const DIORAMA: Record<string, { w: number; h: number }> = {
  "abside": { w: 965, h: 1481 },
  "apolo": { w: 559, h: 1485 },
  "ciprestes": { w: 573, h: 1477 },
  "coluna-a": { w: 339, h: 1479 },
  "escadaria": { w: 1400, h: 452 },
  "folhagem-baixa": { w: 1800, h: 411 },
  "lamparinas": { w: 1800, h: 579 },
  "muro": { w: 1774, h: 749 },
  "musa-direita": { w: 416, h: 1498 },
  "musa-esquerda": { w: 426, h: 1506 },
  "nuvens-1": { w: 1800, h: 506 },
  "nuvens-2": { w: 989, h: 1462 },
  "nuvens-3": { w: 1487, h: 614 },
  "pedestal": { w: 853, h: 1425 },
  "portal": { w: 1620, h: 2400 },
  "trepadeira": { w: 1742, h: 826 },
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
