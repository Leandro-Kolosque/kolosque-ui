"use client";
import { useEffect, useState } from "react";
import { useChapterScroll } from "./useChapterScroll";

// Relíquias: recortes de gravura que ocupam os cantos inferiores enquanto o capítulo deles está ativo
// (BRIEF.md › Movimento). Entram pela lateral ou por baixo saindo de um desfoque e somem com desfoque
// quando o próximo capítulo assume.
// Ficam ATRÁS do conteúdo (z negativo dentro do wrapper da landing), então nunca cobrem texto ou cards.
// Só a partir de 1024px; cada imagem só é carregada quando o capítulo dela é o atual ou o próximo.
// Com movimento reduzido as transições somem (regra global) e elas só aparecem e desaparecem.
// À noite (tema escuro), duas tochas acendem atrás delas: luz quente e trêmula nos cantos.

type From = "left" | "right" | "up";
type Relic = { src: string; w: number; h: number; place: string; from: From; delay?: number };

const RELICS: Record<string, Relic[]> = {
  pinacoteca: [
    { src: "/temple/oliveira.webp", w: 900, h: 616, from: "left", place: "-left-[2vw] bottom-[4vh] w-[clamp(240px,24vw,400px)] -rotate-6" },
    { src: "/temple/lira.webp", w: 420, h: 643, from: "up", delay: 140, place: "right-[4vw] -bottom-[2vh] w-[clamp(110px,10vw,170px)]" },
  ],
  biblioteca: [
    { src: "/temple/fragmentos.webp", w: 900, h: 278, from: "up", place: "left-[2vw] -bottom-[1vh] w-[clamp(260px,26vw,440px)]" },
    { src: "/temple/pergaminho.webp", w: 900, h: 461, from: "right", delay: 140, place: "-right-[3vw] bottom-[3vh] w-[clamp(220px,22vw,360px)] -rotate-3" },
  ],
  ordens: [
    { src: "/temple/tambor.webp", w: 420, h: 525, from: "up", place: "left-[5vw] -bottom-[3vh] w-[clamp(100px,9vw,150px)]" },
    { src: "/temple/capitel.webp", w: 900, h: 502, from: "right", delay: 140, place: "-right-[2vw] bottom-[2vh] w-[clamp(240px,24vw,400px)]" },
  ],
};

const away: Record<From, string> = { left: "-translate-x-16", right: "translate-x-16", up: "translate-y-16" };

export default function Relics() {
  const { chapters, active } = useChapterScroll();
  // Até qual capítulo (índice) as imagens já foram montadas: o atual e o próximo. Nunca desmonta.
  const [mounted, setMounted] = useState(0);
  const index = chapters.findIndex((c) => c.id === active);
  useEffect(() => setMounted((m) => Math.max(m, index + 1)), [index]);
  const lit = Boolean(RELICS[active]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block">
      {/* Tochas (só à noite): luz quente nos cantos, acesa junto com as relíquias do capítulo. */}
      <div className={`absolute inset-0 hidden transition-opacity duration-[1100ms] dark:block ${lit ? "opacity-100" : "opacity-0"}`}>
        <span className="absolute -bottom-[28vw] -left-[18vw] size-[56vw] animate-[torch_6.2s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--gold)_20%,transparent),transparent)]" />
        <span className="absolute -bottom-[28vw] -right-[18vw] size-[56vw] animate-[torch_7.7s_ease-in-out_infinite_reverse] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--gold)_20%,transparent),transparent)]" />
      </div>
      {chapters.slice(0, mounted + 1).flatMap(({ id }) =>
        (RELICS[id] ?? []).map((r) => {
          const on = active === id;
          return (
            <img key={r.src} src={r.src} width={r.w} height={r.h} alt="" decoding="async" draggable={false}
              style={{ transitionDelay: on ? `${r.delay ?? 0}ms` : "0ms" }}
              className={`absolute h-auto select-none transition-[opacity,translate,filter] duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] ${r.place} ${on ? "translate-x-0 translate-y-0 opacity-100 blur-none" : `${away[r.from]} opacity-0 blur-md`}`} />
          );
        }),
      )}
    </div>
  );
}
