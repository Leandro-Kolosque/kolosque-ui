// Troque `src` por "/hero/scene-1.webp" etc. quando as artes estiverem em public/hero/.
// Sem `src`, a cena usa o gradiente provisório de `fallback`.
export type Scene = { src?: string; fallback: string; position: string; mobilePosition?: string };

const glow = (x: number, c: string) => `radial-gradient(60% 80% at ${x}% 45%,${c},transparent 70%),#0B0D17`;

export const scenes: Scene[] = [
  { src: undefined, fallback: glow(75, "#3D52F0aa"), position: "70% 50%", mobilePosition: "65% 50%" },
  { src: undefined, fallback: glow(70, "#8C9BFFaa"), position: "70% 50%", mobilePosition: "65% 50%" },
  { src: undefined, fallback: glow(78, "#5B3DF0aa"), position: "70% 50%", mobilePosition: "65% 50%" },
  { src: undefined, fallback: glow(72, "#2A6DF0aa"), position: "70% 50%", mobilePosition: "65% 50%" },
  { src: undefined, fallback: glow(76, "#A78BFAaa"), position: "70% 50%", mobilePosition: "65% 50%" },
];

// hold: segundos parada; fade: crossfade; drift: zoom lento por cena (0 = desligado, como no vídeo).
export const timing = { hold: 4.3, fade: 0.7, drift: 0 };

export const nav = {
  about: [["Sobre o projeto", "#sobre"], ["Jornada", "#jornada"], ["GitHub", "https://github.com/Leandro-Kolosque"]],
  links: [["Biblioteca", "#biblioteca"], ["Categorias", "#categorias"]],
  cta: ["GitHub", "https://github.com/Leandro-Kolosque"],
};
