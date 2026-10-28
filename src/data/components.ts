export type Status = "done" | "wip" | "planned";
export type Kind = "login" | "card" | "zoom" | "scroll" | "type" | "helix";
export type Experiment = { id: string; name: string; category: string; tech: string[]; interaction: string; status: Status; kind: Kind; href?: string; featured?: boolean };

export const statusLabel: Record<Status, string> = { done: "Concluído", wip: "Em desenvolvimento", planned: "Planejado" };
export const statusDot: Record<Status, string> = { done: "bg-emerald-500", wip: "bg-amber-500", planned: "bg-muted" };

// `featured: true` faz o experimento aparecer em "Experimentos em destaque" na landing (use 5 para fechar o grid).
export const experiments: Experiment[] = [
  { id: "jelly-spiral", name: "Jelly Spiral", category: "3D Experiments", tech: ["React", "Three.js", "GSAP"], interaction: "Hélice 3D de imagens que gira e dobra como gelatina com o scroll.", status: "wip", kind: "helix", href: "/experiments/jelly-spiral", featured: true },
  { id: "scroll-story", name: "Scroll Story", category: "Scroll Animations", tech: ["React", "GSAP", "ScrollTrigger"], interaction: "Painéis com clip-path, parallax e texto que sobe no scroll.", status: "wip", kind: "scroll", href: "/experiments/scroll-story", featured: true },
  { id: "login-blur", name: "Login Blur", category: "UI Components", tech: ["React", "Tailwind"], interaction: "Vidro fosco e foco animado nos campos.", status: "wip", kind: "login", featured: true },
  { id: "card-3d", name: "Card 3D", category: "Hover Effects", tech: ["CSS", "Tailwind"], interaction: "Inclinação em 3D ao passar o mouse.", status: "planned", kind: "card", featured: true },
  { id: "image-zoom", name: "Image Zoom", category: "Hover Effects", tech: ["CSS"], interaction: "Zoom suave dentro de uma moldura.", status: "planned", kind: "zoom", featured: true },
  { id: "type-rhythm", name: "Type Rhythm", category: "Typography", tech: ["CSS"], interaction: "Espaçamento de letras que respira no hover.", status: "planned", kind: "type" },
];