"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createWorld, type World } from "./world/engine";

type Mode = "gravura" | "comparar" | "pura";
const MODES: [Mode, string][] = [["gravura", "Gravura"], ["comparar", "Comparar"], ["pura", "Pura"]];

// Canvas do mundo (só no cliente). Enquanto a escolha entre as duas linguagens está aberta (fase 2),
// um comparador fica no pé da tela: gravura, as duas lado a lado com uma divisória arrastável, ou pura.
// Também dá para abrir direto num modo com ?mundo=gravura|comparar|pura.
export default function WorldCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const [mode, setMode] = useState<Mode>("comparar");
  const [split, setSplit] = useState(0.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(location.search).get("mundo");
    if (q === "gravura" || q === "pura" || q === "comparar") setMode(q);
    const el = canvas.current;
    if (!el) return;
    const html = document.documentElement;
    const w = createWorld(el, {
      night: html.classList.contains("dark"),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      onReady: () => el.closest(".t-world")?.classList.add("is-live"),
    });
    if (!w) return; // sem WebGL: fica o fundo provisório em CSS
    world.current = w;
    const mo = new MutationObserver(() => w.setNight(html.classList.contains("dark")));
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      w.dispose();
      world.current = null;
    };
  }, []);

  useEffect(() => {
    world.current?.setSplit(mode === "gravura" ? 1 : mode === "pura" ? 0 : split);
  }, [mode, split, mounted]);

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
      {mounted && createPortal(
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
          <div role="group" aria-label="Linguagem do mundo (protótipo)" className="t-modes">
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
