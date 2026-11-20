"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const TARGETS = "a, button, label, input, select, textarea, [data-cursor]";

// Cursor próprio: um anel fino que segue o ponteiro com um pequeno atraso e cresce sobre o que é clicável.
// Só em ponteiro fino (mouse ou trackpad); o cursor do sistema continua visível.
// Com movimento reduzido o anel acompanha o ponteiro sem atraso.
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0, y = 0, tx = 0, ty = 0, seen = false;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        x = tx;
        y = ty;
      }
      el.classList.add("is-on");
    };
    const over = (e: PointerEvent) => el.classList.toggle("is-act", !!(e.target as Element | null)?.closest?.(TARGETS));
    const out = (e: PointerEvent) => { if (!e.relatedTarget) el.classList.remove("is-on"); };
    // Mesmo atraso em qualquer taxa de quadros: 18% do caminho por quadro a 60 fps.
    const tick = () => {
      const k = reduce ? 1 : 1 - Math.pow(0.82, gsap.ticker.deltaRatio(60));
      x += (tx - x) * k;
      y += (ty - y) * k;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    };

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      gsap.ticker.remove(tick);
    };
  }, []);

  return <div ref={ref} aria-hidden className="t-cursor" />;
}
