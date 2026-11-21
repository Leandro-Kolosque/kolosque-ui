"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createWorld, type World } from "./world/engine";

type Mode = "gravura" | "comparar" | "pura";
const MODES: [Mode, string][] = [["gravura", "Gravura"], ["comparar", "Comparar"], ["pura", "Pura"]];

// Canvas do mundo (só no cliente). A linguagem acompanha o tema: à noite a cena "pura" (névoa, tochas e lua);
// de dia, a gravura (hachura de nanquim sobre marfim, ink.ts), que é como o templo fica bem à luz do sol.
// Para testes, ?mundo=gravura|comparar|pura na URL fixa a linguagem e mostra o comparador no pé da tela
// (com a divisória arrastável no modo "comparar"). Sem o parâmetro, nada aparece.
export default function WorldCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const [mode, setMode] = useState<Mode>("pura");
  const [split, setSplit] = useState(0.5);
  const [mounted, setMounted] = useState(false);
  const [lab, setLab] = useState(false);
  const [night, setNight] = useState(true);

  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(location.search).get("mundo");
    if (q === "gravura" || q === "pura" || q === "comparar") {
      setMode(q);
      setLab(true);
    }
    const el = canvas.current;
    if (!el) return;
    const html = document.documentElement;
    const isNight = () => html.classList.contains("dark");
    setNight(isNight());
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
    world.current = w;
    const mo = new MutationObserver(() => {
      w.setNight(isNight());
      setNight(isNight());
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      w.dispose();
      world.current = null;
      el.closest(".templo")?.classList.remove("has-world");
    };
  }, []);

  useEffect(() => {
    const auto = night ? 0 : 1; // noite pura, dia gravura
    world.current?.setSplit(!lab ? auto : mode === "gravura" ? 1 : mode === "pura" ? 0 : split);
  }, [mode, split, mounted, lab, night]);

  const drag = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setSplit(Math.min(0.95, Math.max(0.05, ev.clientX / innerWidth)));
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
  };

  return (
    <>
      <canvas ref={canvas} aria-hidden className="t-gl" />
      {mounted && lab && createPortal(
        <>
          {mode === "comparar" && (
            <div className="t-split-line" style={{ left: `${split * 100}%` }}>
              <button type="button" className="t-split-grip" onPointerDown={drag}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") setSplit((s) => Math.max(0.05, s - 0.05));
                  if (e.key === "ArrowRight") setSplit((s) => Math.min(0.95, s + 0.05));
                }}
                aria-label="Arrastar a divisória entre gravura e pura (setas do teclado também movem)">
                <span>Gravura</span><span aria-hidden>◂ ▸</span><span>Pura</span>
              </button>
            </div>
          )}
          <div role="group" aria-label="Linguagem do mundo (teste)" className="t-modes">
            <span className="t-label pr-2">Mundo</span>
            {MODES.map(([key, label]) => (
              <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}>{label}</button>
            ))}
          </div>
        </>,
        // Dentro da .templo (e fora do .t-world, que é aria-hidden), para herdar as variáveis da página.
        document.querySelector(".templo") ?? document.body,
      )}
    </>
  );
}
