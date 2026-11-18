// Pinacoteca: landing pages e sites publicados.
// Para adicionar um trabalho: salve a captura em public/works/<id>.webp (1600×1000) e acrescente um objeto abaixo.
// A ordem e a numeração (Nº 01…) são calculadas por `sortWorks`; não precisa manter à mão.
export type Work = {
  id: string; // slug; também o nome dos arquivos em public/works/
  name: string;
  summary: string; // uma frase: o que é e o que tem de interessante
  year: number;
  tech: string[];
  url?: string; // página publicada; o card abre aqui, em nova aba
  repo?: string; // código, link secundário
  cover?: string; // ex.: "/works/<id>.webp"
  video?: string; // loop curto e mudo que toca no hover, ex.: "/works/<id>.mp4"
  featured?: boolean; // aparece primeiro e continua na landing quando houver /pinacoteca
  draft?: boolean; // moldura "Em preparação", sem link; nunca vira um trabalho "pronto" por engano
};

export const works: Work[] = [
  // Rascunhos provisórios: troque pelos trabalhos reais (nome, url, ano, stack e captura).
  { id: "landing-01", name: "Landing page", summary: "Trabalho em catalogação.", year: 2026, tech: ["HTML", "CSS"], draft: true },
  { id: "landing-02", name: "Landing page", summary: "Trabalho em catalogação.", year: 2026, tech: ["HTML", "CSS"], draft: true },
  { id: "landing-03", name: "Landing page", summary: "Trabalho em catalogação.", year: 2026, tech: ["HTML", "CSS"], draft: true },
];

// Destacados primeiro; depois do mais recente ao mais antigo. Rascunhos sempre por último.
export function sortWorks(list: Work[]): Work[] {
  return [...list].sort(
    (a, b) => Number(!!a.draft) - Number(!!b.draft) || Number(!!b.featured) - Number(!!a.featured) || b.year - a.year,
  );
}

// Quantos trabalhos cabem na landing antes de existir a rota /pinacoteca.
export const LANDING_LIMIT = 6;
