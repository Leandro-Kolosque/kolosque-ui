export type Status = "done" | "wip" | "planned";
export type Kind = "login" | "card" | "zoom" | "scroll" | "type";
export type Experiment = { id: string; name: string; category: string; tech: string[]; interaction: string; status: Status; kind: Kind; href?: string };

export const statusLabel: Record<Status, string> = { done: "Concluído", wip: "Em desenvolvimento", planned: "Planejado" };
export const statusDot: Record<Status, string> = { done: "bg-emerald-500", wip: "bg-amber-500", planned: "bg-muted" };

export const experiments: Experiment[] = [
  { id: "login-blur", name: "Login Blur", category: "UI Components", tech: ["React", "Tailwind"], interaction: "Vidro fosco e foco animado nos campos.", status: "wip", kind: "login" },
  { id: "card-3d", name: "Card 3D", category: "Hover Effects", tech: ["CSS", "Tailwind"], interaction: "Inclinação em 3D ao passar o mouse.", status: "planned", kind: "card" },
  { id: "image-zoom", name: "Image Zoom", category: "Hover Effects", tech: ["CSS"], interaction: "Zoom suave dentro de uma moldura.", status: "planned", kind: "zoom" },
    { id: "scroll-story", name: "Scroll Story", category: "Scroll Animations", tech: ["React", "GSAP", "ScrollTrigger"], interaction: "Painéis com clip-path, parallax e texto que sobe no scroll.", status: "wip", kind: "scroll", href: "/experiments/scroll-story" },
  { id: "type-rhythm", name: "Type Rhythm", category: "Typography", tech: ["CSS"], interaction: "Espaçamento de letras que respira no hover.", status: "planned", kind: "type" },
];
