// Troque `src` por "/hero/scene-1.webp" etc. quando as artes estiverem em public/hero/.
// Sem `src`, a cena usa o gradiente provisório de `fallback`.
export type Scene = { src?: string; fallback: string; position: string; mobilePosition?: string };

const glow = (x: number, c: string) => `radial-gradient(60% 80% at ${x}% 45%,${c},transparent 70%),#0B0D17`;

export const scenes: Scene[] = [
  // 1 Componentes | 2 Experimentos 3D | 3 Origem (código) | 4 Movimento | 5 Jornada
  { src: "/hero/scene-1.webp", fallback: glow(70, "#3D52F0aa"), position: "70% 50%", mobilePosition: "77% 50%" },
  { src: "/hero/scene-2.webp", fallback: glow(72, "#5B3DF0aa"), position: "72% 50%", mobilePosition: "80% 50%" },
  { src: "/hero/scene-3.webp", fallback: glow(73, "#8C9BFFaa"), position: "73% 50%", mobilePosition: "81% 50%" },
  { src: "/hero/scene-4.webp", fallback: glow(74, "#2A6DF0aa"), position: "74% 50%", mobilePosition: "82% 50%" },
  { src: "/hero/scene-5.webp", fallback: glow(72, "#A78BFAaa"), position: "72% 50%", mobilePosition: "80% 50%" },
];

// hold: segundos parada; fade: crossfade; drift: zoom lento por cena (0 = desligado, como no vídeo).
export const timing = { hold: 4.3, fade: 0.7, drift: 0.08 };

export const nav = {
  about: [["Sobre o projeto", "#sobre"], ["Jornada", "#jornada"], ["GitHub", "https://github.com/Leandro-Kolosque"]],
  links: [["Biblioteca", "/library"], ["Categorias", "#categorias"]],
  cta: ["GitHub", "https://github.com/Leandro-Kolosque"],
};
