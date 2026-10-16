import { Box, Braces, LayoutGrid, MousePointerClick, PanelsTopLeft, Pointer, ScrollText, Sparkles, Type, Zap, type LucideIcon } from "lucide-react";

export type Category = { id: string; name: string; blurb: string; icon: LucideIcon };

export const categories: Category[] = [
  { id: "ui", name: "UI Components", blurb: "Botões, formulários e cards reutilizáveis.", icon: LayoutGrid },
  { id: "micro", name: "Microinteractions", blurb: "Pequenos retornos visuais para cada ação.", icon: MousePointerClick },
  { id: "gsap", name: "GSAP Animations", blurb: "Timelines e sequências com controle fino.", icon: Zap },
  { id: "3d", name: "3D Experiments", blurb: "Cenas com Three.js e React Three Fiber.", icon: Box },
  { id: "scroll", name: "Scroll Animations", blurb: "Parallax e revelações guiadas pelo scroll.", icon: ScrollText },
  { id: "type", name: "Typography", blurb: "Texto que reage, escala e ganha ritmo.", icon: Type },
  { id: "layouts", name: "Layouts & Sections", blurb: "Seções e páginas completas, do hero ao rodapé.", icon: PanelsTopLeft },
  { id: "hover", name: "Hover Effects", blurb: "Zoom, brilho e inclinação ao passar o mouse.", icon: Pointer },
  { id: "css", name: "CSS Experiments", blurb: "O que dá para fazer só com CSS.", icon: Braces },
  { id: "creative", name: "Creative Interfaces", blurb: "Ideias fora do padrão para interfaces.", icon: Sparkles },
];
