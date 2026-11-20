// Gravuras em marfim (2000×1116, assunto no terço direito). Sem `src`, a cena usa o gradiente de `fallback`.
// position: desktop, puxada para a direita para o corte sair do lado vazio.
// mobilePosition: centraliza o objeto no recorte estreito do celular.
export type Scene = { src?: string; fallback: string; position: string; mobilePosition?: string };

const glow = (x: number) => `radial-gradient(30% 45% at ${x}% 50%,#6E142333,transparent 70%),var(--bg)`;

export const scenes: Scene[] = [
  // 1 Componentes (pedestal) | 2 Experimentos 3D (lajes) | 3 Origem (coluna) | 4 Movimento (esfera) | 5 Jornada (caderno)
  { src: "/hero/scene-1.webp", fallback: glow(74), position: "80% 50%", mobilePosition: "82% 50%" },
  { src: "/hero/scene-2.webp", fallback: glow(71), position: "80% 50%", mobilePosition: "78% 50%" },
  { src: "/hero/scene-3.webp", fallback: glow(70), position: "80% 50%", mobilePosition: "77% 50%" },
  { src: "/hero/scene-4.webp", fallback: glow(75), position: "80% 50%", mobilePosition: "84% 50%" },
  { src: "/hero/scene-5.webp", fallback: glow(73), position: "80% 50%", mobilePosition: "80% 50%" },
];

// hold: segundos parada; fade: crossfade; drift: zoom lento por cena (0 = desligado, como no vídeo).
export const timing = { hold: 4.3, fade: 0.7, drift: 0.08 };

export const nav = {
  // Capítulos da landing (ver BRIEF.md). "Biblioteca" leva direto ao acervo completo.
  about: [["Quem sou", "#ordens"], ["Jornada", "#jornada"], ["GitHub", "https://github.com/Leandro-Kolosque"]],
  links: [["Pinacoteca", "#pinacoteca"], ["Biblioteca", "/library"], ["Contato", "#contato"]],
  cta: ["GitHub", "https://github.com/Leandro-Kolosque"],
};
