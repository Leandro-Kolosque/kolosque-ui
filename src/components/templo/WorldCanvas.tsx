"use client";
import { useEffect, useRef } from "react";
import { createWorld } from "./world/engine";

// Canvas do mundo (só no cliente). O diorama acompanha o tema: a gravura em sépia de dia, o mármore à luz das
// tochas à noite. Quando as imagens carregam, ele aparece em fade por cima do fundo provisório em CSS.
export default function WorldCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const html = document.documentElement;
    const isNight = () => html.classList.contains("dark");
    const w = createWorld(el, {
      night: isNight(),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      // Com o mundo pronto, a palavra KOLOSQUE em HTML dá lugar às letras dentro da cena.
      onReady: () => {
        el.closest(".t-world")?.classList.add("is-live");
        el.closest(".templo")?.classList.add("has-world");
      },
    });
    if (!w) return; // sem WebGL: fica o fundo provisório em CSS
    const mo = new MutationObserver(() => w.setNight(isNight()));
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      w.dispose();
      el.closest(".templo")?.classList.remove("has-world");
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="t-gl" />;
}
