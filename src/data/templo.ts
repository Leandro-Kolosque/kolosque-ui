// Conteúdo da /templo, a versão cinematográfica da landing (em teste até substituir a /).
// Obras, experimentos, categorias e stack continuam vindo dos arquivos de dados de sempre.
// Grego sempre decorativo (aria-hidden); a grafia foi conferida.

export const GITHUB = "https://github.com/Leandro-Kolosque";

// Navbar: no hover, o nome em português sobe e o grego entra.
export const temploNav = [
  { label: "Pinacoteca", greek: "ΠΙΝΑΚΟΘΗΚΗ", href: "#pinacoteca" },
  { label: "Biblioteca", greek: "ΒΙΒΛΙΟΘΗΚΗ", href: "#biblioteca" },
  { label: "Ordens", greek: "ΤΑΞΙΣ", href: "#ordens" },
  { label: "Contato", greek: "ΕΠΙΛΟΓΟΣ", href: "#contato" },
];

// Índice de capítulos no pé da Hero.
export const chapterIndex = [
  { n: "01", title: "Pinacoteca", href: "#pinacoteca" },
  { n: "02", title: "Biblioteca", href: "#biblioteca" },
  { n: "03", title: "Ordens", href: "#ordens" },
  { n: "04", title: "Epílogo", href: "#contato" },
];

// Jornada (capítulo Ordens), na faixa de quatro colunas.
export const journey = [
  { title: "Registro do que aprendo", text: "Cada experimento guarda a técnica, as dependências e uma nota pessoal." },
  { title: "Espaço para testar", text: "Controles ao vivo para mexer em velocidade, cor e intensidade." },
  { title: "Conhecimento reutilizável", text: "O código fica pronto para voltar em outros projetos." },
  { title: "Evolução visível", text: "O status mostra o que está pronto e o que ainda vem." },
];

// Lema do colofão: χαλεπὰ τὰ καλά, "o belo é difícil", provérbio que Platão cita.
export const motto = { greek: "ΧΑΛΕΠΑ ΤΑ ΚΑΛΑ", meaning: "Χαλεπὰ τὰ καλά: o belo é difícil (provérbio citado por Platão)" };
